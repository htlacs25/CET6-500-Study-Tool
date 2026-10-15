import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./design-runtime.js', import.meta.url), 'utf8');
const TASKS = ['words', 'listening', 'grammar', 'reading', 'sentence', 'extensive', 'review'];
const design = (overrides = {}) => ({ version: 1, theme: 'forest', density: 'comfortable', fontSize: 18, wordColumns: 3, wordMode: 'cards', taskOrder: [...TASKS], hiddenSections: [], widgets: [], ...overrides });
const widget = (type, overrides = {}) => ({ id: type, title: type + ' 工具', type, text: '', items: ['note', 'timer'].includes(type) ? [] : [{ front: 'First question', back: 'First answer' }, { front: 'Second question', back: 'Second answer' }], minutes: 1, ...overrides });

class Style {
  values = new Map();
  setProperty(key, value, priority = '') { this.values.set(key, [String(value), priority]); }
  getPropertyValue(key) { return this.values.get(key)?.[0] || ''; }
  getPropertyPriority(key) { return this.values.get(key)?.[1] || ''; }
  removeProperty(key) { this.values.delete(key); }
}
class Element {
  constructor(doc, tag) { this.ownerDocument = doc; this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null; this.attributes = new Map(); this.style = new Style(); this.events = new Map(); this.ownText = ''; this.className = ''; }
  set textContent(value) { this.ownText = String(value); for (const child of this.children) child.parentNode = null; this.children = []; }
  get textContent() { return this.ownText + this.children.map(child => child.textContent).join(''); }
  set innerHTML(value) { throw new Error('Unsafe HTML sink used: ' + value); }
  get firstChild() { return this.children[0] || null; }
  appendChild(node) { if (node.parentNode) node.parentNode.removeChild(node); this.children.push(node); node.parentNode = this; return node; }
  removeChild(node) { const index = this.children.indexOf(node); assert.notEqual(index, -1); this.children.splice(index, 1); node.parentNode = null; return node; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, handler) { if (!this.events.has(name)) this.events.set(name, []); this.events.get(name).push(handler); }
  fire(name) { if (name === 'click' && this.disabled) return; for (const callback of this.events.get(name) || []) callback({ target: this }); }
}
function descendants(root, predicate) { return root.children.flatMap(child => [ ...(predicate(child) ? [child] : []), ...descendants(child, predicate)]); }
function find(root, predicate) { const result = descendants(root, predicate)[0]; assert.ok(result, 'Expected DOM node missing'); return result; }
function button(root, text) { return find(root, node => node.tagName === 'BUTTON' && node.textContent === text); }
function byClass(root, className) { return find(root, node => node.className.split(' ').includes(className)); }
function environment() {
  const doc = { createElement(tag) { return new Element(doc, tag); } };
  doc.head = new Element(doc, 'head'); doc.documentElement = new Element(doc, 'html'); doc.documentElement.appendChild(doc.head);
  const container = new Element(doc, 'main'); doc.documentElement.appendChild(container);
  let now = 1_000_000, nextId = 0; const timers = new Map();
  class FakeDate extends Date { static now() { return now; } }
  const sandbox = { Date: FakeDate, setInterval(callback) { const id = ++nextId; timers.set(id, callback); return id; }, clearInterval(id) { timers.delete(id); } };
  Object.defineProperty(sandbox, 'localStorage', { get() { throw new Error('Original browser storage must never be read'); } });
  Object.defineProperty(sandbox, 'fetch', { get() { throw new Error('Network must never be accessed'); } });
  vm.createContext(sandbox); vm.runInContext(source, sandbox);
  return { api: sandbox.Cet4Designer, doc, container, timers, advance(ms) { now += ms; for (const callback of [...timers.values()]) callback(); } };
}

test('strict data contract returns an independent normalized copy', () => {
  const { api } = environment(); const input = design({ widgets: [widget('note', { title: ' note ', text: ' hello ' })] });
  const result = api.normalizeDesign(input); assert.equal(result.widgets[0].title, 'note'); assert.equal(result.widgets[0].text, 'hello');
  result.taskOrder.reverse(); assert.equal(input.taskOrder[0], 'words'); assert.equal(api.isValidDesign(input), true);
  for (const invalid of [ { ...input, css: 'body{display:none}' }, { ...input, fontSize: 30 }, { ...input, wordColumns: 0 }, { ...input, theme: 'url(https://example.test)' }, { ...input, hiddenSections: ['scores'] }, { ...input, taskOrder: TASKS.map(() => 'words') }, { ...input, widgets: [widget('script')] }, { ...input, widgets: [widget('note'), widget('note')] }, { ...input, widgets: [widget('quiz', { items: [{ front: 'x', back: '' }] })] } ]) assert.equal(api.isValidDesign(invalid), false);
});
test('rejects oversized, control-character, unknown-field, and invalid widget data', () => {
  const { api } = environment();
  for (const bad of [widget('note', { title: 'a'.repeat(81) }), widget('note', { text: 'a'.repeat(4001) }), widget('note', { id: '../escape' }), widget('note', { id: 'a'.repeat(49) }), widget('note', { text: '\u0000' }), widget('note', { items: [{ front: 'a'.repeat(301), back: '' }] }), widget('note', { minutes: 121 }), widget('note', { onclick: 'dangerous()' }), widget('checklist', { items: [] })]) assert.throws(() => api.normalizeDesign(design({ widgets: [bad] })));
  assert.equal(api.isValidDesign(design({ widgets: Array.from({ length: 8 }, (_, i) => widget('note', { id: 'note-' + i, text: 'a'.repeat(4000) })) })), false);
});
test('preview uses literal text and never reads original storage or fetches resources', () => {
  const { api, container, doc } = environment();
  const payload = '<img src=x onerror="alert(1)"><script>steal()</script>';
  api.renderPreview(container, design({ widgets: [widget('note', { title: payload, text: payload, items: [{ front: payload, back: payload }] })] }));
  assert.ok(container.textContent.includes(payload)); assert.equal(descendants(container, node => ['IMG', 'SCRIPT', 'IFRAME', 'LINK'].includes(node.tagName)).length, 0);
  assert.equal(descendants(doc.head, node => node.tagName === 'STYLE').length, 1);
  api.renderPreview(container, design()); assert.equal(descendants(doc.head, node => node.tagName === 'STYLE').length, 1);
});
test('preview demonstrates selected task order, theme, spacing, font, columns, and hidden extras', () => {
  const { api, container } = environment(); const order = [...TASKS].reverse();
  api.renderPreview(container, design({ taskOrder: order, theme: 'ocean', density: 'compact', fontSize: 22, wordColumns: 2, wordMode: 'list', hiddenSections: ['roadmap'] }));
  const page = byClass(container, 'cd-preview'); assert.equal(page.getAttribute('data-cd-theme'), 'ocean'); assert.equal(page.getAttribute('data-cd-density'), 'compact'); assert.equal(page.getAttribute('data-cd-word-mode'), 'list'); assert.equal(page.getAttribute('data-cd-hide-roadmap'), '1'); assert.equal(page.style.getPropertyValue('--cd-font'), '22px'); assert.equal(page.style.getPropertyValue('--cd-cols'), '2');
  assert.deepEqual(descendants(container, node => node.getAttribute('data-design-task') !== null).map(node => node.getAttribute('data-design-task')), order);
  assert.equal(descendants(container, node => node.getAttribute('data-design-word') !== null).length, 3);
});
test('applyLayout scopes to host root, leaves nodes and handlers intact, and restores previous values', () => {
  const { api, container } = environment(); let called = 0; const protectedButton = container.ownerDocument.createElement('button'); protectedButton.addEventListener('click', () => called++); container.appendChild(protectedButton);
  container.style.setProperty('--cd-font', '17px', 'important'); container.setAttribute('data-cd-theme', 'custom');
  const dispose = api.applyLayout(container, design({ theme: 'warm' })); protectedButton.fire('click'); assert.equal(called, 1); assert.equal(container.children[0], protectedButton);
  dispose(); assert.equal(container.getAttribute('data-cet4-design'), null); assert.equal(container.getAttribute('data-cd-theme'), 'custom'); assert.equal(container.style.getPropertyValue('--cd-font'), '17px'); assert.equal(container.style.getPropertyPriority('--cd-font'), 'important'); dispose();
  api.applyLayout(container, design({ theme: 'ocean' })); const second = api.applyLayout(container, design({ theme: 'forest' })); second(); assert.equal(container.getAttribute('data-cd-theme'), 'custom');
});
test('checklist remembers state on same revision, resets on new revision, notifies host without touching scores', () => {
  const { api, container } = environment(), stateStore = {}; let notifications = 0;
  const options = { stateStore, stateKey: 'revision-1', onStateChange(store) { assert.equal(store, stateStore); notifications++; } };
  const widgets = [widget('checklist')]; api.renderWidgets(container, widgets, options);
  const check = find(container, node => node.type === 'checkbox'); check.checked = true; check.fire('change'); assert.match(container.textContent, /已完成 1 \/ 2/); assert.equal(notifications, 1);
  api.renderWidgets(container, widgets, options); assert.equal(find(container, node => node.type === 'checkbox').checked, true);
  api.renderWidgets(container, widgets, { ...options, stateKey: 'revision-2' }); assert.equal(find(container, node => node.type === 'checkbox').checked, false);
  assert.ok(Object.keys(stateStore).every(key => key.startsWith('cet4-widget:'))); assert.ok(!JSON.stringify(stateStore).includes('score'));
});
test('flashcards flip, advance, restart, and retain local progress', () => {
  const { api, container } = environment(), stateStore = new Map(), widgets = [widget('flashcards')];
  api.renderWidgets(container, widgets, { stateStore }); const card = byClass(container, 'cd-flashcard'); assert.match(card.textContent, /First question/); card.fire('click'); assert.match(card.textContent, /First answer/);
  button(container, '下一张').fire('click'); assert.match(card.textContent, /Second question/);
  api.renderWidgets(container, widgets, { stateStore }); assert.match(byClass(container, 'cd-flashcard').textContent, /Second question/); button(container, '重新开始').fire('click'); assert.match(byClass(container, 'cd-flashcard').textContent, /First question/);
});
test('quiz handles empty answers, approximate comparison, references, and local draft preservation', () => {
  const { api, container } = environment(), stateStore = {}, widgets = [widget('quiz', { items: [{ front: 'Translate 提高', back: 'Improve' }] })];
  api.renderWidgets(container, widgets, { stateStore }); button(container, '检查答案').fire('click'); assert.match(container.textContent, /请先填写/);
  let input = byClass(container, 'cd-quiz-input'); input.value = ' improve. '; input.fire('input'); button(container, '检查答案').fire('click'); assert.match(container.textContent, /与参考答案文字匹配/);
  input.value = 'make better'; input.fire('input'); button(container, '检查答案').fire('click'); assert.match(container.textContent, /不代表一定错误/);
  api.renderWidgets(container, widgets, { stateStore }); input = byClass(container, 'cd-quiz-input'); assert.equal(input.value, 'make better'); button(container, '查看参考').fire('click'); assert.match(container.textContent, /参考内容：Improve/);
  button(container, '重做本题').fire('click'); assert.equal(input.value, '');
});
test('changed widget definition cannot inherit an old answer even with same supplied revision', () => {
  const { api, container } = environment(), stateStore = {}, options = { stateStore, stateKey: 'unchanged-client-key' };
  api.renderWidgets(container, [widget('quiz')], options); const input = byClass(container, 'cd-quiz-input'); input.value = 'old draft'; input.fire('input');
  api.renderWidgets(container, [widget('quiz', { items: [{ front: 'New question', back: 'New answer' }] })], options); assert.equal(byClass(container, 'cd-quiz-input').value, '');
});
test('timer is manual, pauses, resets, stops at zero, and is disposed before rerender', () => {
  const env = environment(), { api, container, timers } = env, widgets = [widget('timer')], stateStore = {};
  let notifications = 0; const options = { stateStore, onStateChange() { notifications++; } };
  const dispose = api.renderWidgets(container, widgets, options); assert.equal(timers.size, 0); assert.equal(byClass(container, 'cd-timer').textContent, '01:00');
  button(container, '开始').fire('click'); assert.equal(timers.size, 1); env.advance(10_000); assert.equal(byClass(container, 'cd-timer').textContent, '00:50');
  button(container, '暂停').fire('click'); assert.equal(timers.size, 0); env.advance(10_000); assert.equal(byClass(container, 'cd-timer').textContent, '00:50');
  button(container, '开始').fire('click'); env.advance(50_000); assert.equal(timers.size, 0); assert.match(container.textContent, /计时结束/); button(container, '重置').fire('click'); assert.equal(byClass(container, 'cd-timer').textContent, '01:00');
  button(container, '开始').fire('click'); env.advance(5_000); api.renderWidgets(container, widgets, options); assert.equal(timers.size, 0); assert.equal(byClass(container, 'cd-timer').textContent, '00:55'); assert.ok(notifications >= 5); dispose();
});
test('preview disposal stops timers and stale timer buttons cannot restart them', () => {
  const { api, container, timers } = environment(); const dispose = api.renderPreview(container, design({ widgets: [widget('timer')] })); const start = button(container, '开始'); start.fire('click'); assert.equal(timers.size, 1); dispose(); assert.equal(timers.size, 0); start.fire('click'); assert.equal(timers.size, 0);
});
test('invalid replacement is atomic and retains the existing preview and timer', () => {
  const { api, container, timers } = environment(); const dispose = api.renderPreview(container, design({ widgets: [widget('timer')] })); const original = container.firstChild; button(container, '开始').fire('click');
  assert.throws(() => api.renderPreview(container, design({ widgets: [widget('quiz', { items: [] })] }))); assert.equal(container.firstChild, original); assert.equal(timers.size, 1); dispose();
});
