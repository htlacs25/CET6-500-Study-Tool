import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./client.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const settle = async () => { for (let i = 0; i < 5; i++) await new Promise(resolve => setImmediate(resolve)); };

function fixture() {
  const ids = new Map(), requests = [];
  class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.value = ''; this.checked = false; this.listeners = {}; }
    append(...items) { this.children.push(...items); }
    replaceChildren(...items) { this.children = items; }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    setAttribute(key, value) { this[key] = value; }
    focus() { document.activeElement = this; }
    get childNodes() { return this.children; }
  }
  for (const match of html.matchAll(/<(\w+)[^>]*id="([^"]+)"[^>]*>/g)) {
    const item = new Element(match[1]);
    item.hidden = /\shidden(?:\s|>)/.test(match[0]);
    ids.set(match[2], item);
  }
  const document = {
    getElementById: id => ids.get(id), createElement: tag => new Element(tag), activeElement: null,
    querySelectorAll: selector => selector === 'button,input,textarea,select' ? [...ids.values()].filter(item => ['button', 'input', 'textarea', 'select'].includes(item.tag)) : [],
  };
  const window = { addEventListener() {} }; window.parent = window;
  const design = { version: 1, theme: 'forest', density: 'comfortable', fontSize: 18, wordColumns: 3, wordMode: 'cards', taskOrder: ['words', 'listening', 'grammar', 'reading', 'sentence', 'extensive', 'review'], hiddenSections: [], widgets: [] };
  const fetch = async (path, options) => {
    requests.push({ path, method: options.method });
    assert.equal(options.method, 'GET', 'help navigation must not send or save anything');
    return { ok: true, json: async () => path === '/api/workbench' ? { revision: 0, design, proposals: [] } : { configured: false, model: 'gpt-4.1-mini', revision: 0, messages: [], proposals: [], plan: {} } };
  };
  vm.runInContext(source, vm.createContext({ document, window, fetch, location: { href: 'http://127.0.0.1:4318/?date=2026-10-15', origin: 'http://127.0.0.1:4318' }, Map, Set, URL, Date }));
  const click = id => { assert.equal(ids.get(id).disabled, false); ids.get(id).listeners.click(); };
  return { ids, requests, document, click };
}

test('beginner help is folded by default and its controls work without a configured key', async () => {
  assert.match(html, /<details class="card" id="quickStart">/);
  assert.match(html, /第一次使用？点这里 · 手动改页面无需 API Key/);
  for (const id of ['guideManual', 'guideConnection', 'guideLearn', 'guideDesign']) {
    assert.match(html, new RegExp('<button type="button" id="' + id + '">'));
  }
  const f = fixture(); await settle();
  const initialRequests = f.requests.length;
  assert.equal(f.ids.get('send').disabled, true);
  assert.equal(f.ids.get('designSend').disabled, true);
  f.ids.get('message').value = '学习问题草稿';
  f.ids.get('designMessage').value = '页面修改草稿';
  f.ids.get('apiKey').value = 'mock-key-not-a-real-secret';
  f.ids.get('settings').open = false;
  f.click('guideConnection');
  assert.equal(f.ids.get('settings').open, true);
  assert.equal(f.document.activeElement, f.ids.get('apiKey'));
  f.click('guideManual');
  assert.equal(f.ids.get('designWorkspace').hidden, false);
  assert.equal(f.document.activeElement, f.ids.get('editTheme'));
  f.click('guideLearn');
  assert.equal(f.ids.get('learningWorkspace').hidden, false);
  assert.equal(f.document.activeElement, f.ids.get('message'));
  f.click('guideDesign');
  assert.equal(f.ids.get('designWorkspace').hidden, false);
  assert.equal(f.document.activeElement, f.ids.get('designMessage'));
  await settle();
  assert.equal(f.requests.length, initialRequests);
  assert.equal(f.ids.get('message').value, '学习问题草稿');
  assert.equal(f.ids.get('designMessage').value, '页面修改草稿');
  assert.equal(f.ids.get('apiKey').value, 'mock-key-not-a-real-secret');
});
