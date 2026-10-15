(function (global) {
  'use strict';
  // Data-only renderer. Never interpret generated HTML, CSS, scripts, or URLs.
  const TASKS = ['words', 'listening', 'grammar', 'reading', 'sentence', 'extensive', 'review'];
  const EXTRAS = ['roadmap', 'studyTip', 'wordList', 'fallback'];
  const TYPES = ['note', 'checklist', 'flashcards', 'quiz', 'timer'];
  const DESIGN_KEYS = ['version', 'theme', 'density', 'fontSize', 'wordColumns', 'wordMode', 'taskOrder', 'hiddenSections', 'widgets'];
  const WIDGET_KEYS = ['id', 'title', 'type', 'text', 'items', 'minutes'];
  const mounted = new WeakMap(), layouts = new WeakMap(), documentStyles = new WeakMap();
  const STYLE = `
    [data-cet4-design] { --cd-bg:#f7f5ee; --cd-paper:#fffefa; --cd-ink:#203b32; --cd-muted:#63756d; --cd-accent:#185341; --cd-line:#d7e0d8; --cd-gap:16px; --cd-pad:20px; --cd-font:18px; --cd-cols:3; color:var(--cd-ink); font-size:var(--cd-font); }
    [data-cet4-design][data-cd-theme="ocean"] { --cd-bg:#f0f7fa; --cd-paper:#fff; --cd-ink:#18384d; --cd-muted:#5e7485; --cd-accent:#195d80; --cd-line:#cddfe8; }
    [data-cet4-design][data-cd-theme="warm"] { --cd-bg:#fff5e9; --cd-paper:#fffdf7; --cd-ink:#533b2d; --cd-muted:#806d5b; --cd-accent:#934e25; --cd-line:#e7d7c6; }
    [data-cet4-design][data-cd-density="compact"] { --cd-gap:9px; --cd-pad:12px; }
    #app[data-cet4-design] { --paper:var(--cd-bg); --card:var(--cd-paper); --ink:var(--cd-ink); --green:var(--cd-accent); --line:var(--cd-line); --muted:var(--cd-muted); }
    #app[data-cet4-design] .card { padding:var(--cd-pad); }
    #app[data-cet4-design] .parallel-en, #app[data-cet4-design] .parallel-zh, #app[data-cet4-design] .reading { font-size:var(--cd-font); }
    [data-cet4-design] [data-design-word-grid] { display:grid!important; grid-template-columns:repeat(var(--cd-cols),minmax(0,1fr))!important; gap:var(--cd-gap)!important; }
    [data-cet4-design][data-cd-word-mode="list"] [data-design-word-grid] { grid-template-columns:minmax(0,1fr)!important; }
    [data-cet4-design] [data-design-word-grid] > * { padding:var(--cd-pad); border-color:var(--cd-line); background:var(--cd-paper); color:var(--cd-ink); font-size:var(--cd-font); }
    [data-cet4-design] [data-design-task] { border-color:var(--cd-line); color:var(--cd-ink); }
    [data-cet4-design][data-cd-density="compact"] [data-design-task] { padding:10px 14px; }
    [data-cet4-design][data-cd-hide-roadmap] [data-design-section="roadmap"], [data-cet4-design][data-cd-hide-studyTip] [data-design-section="studyTip"], [data-cet4-design][data-cd-hide-wordList] [data-design-section="wordList"], [data-cet4-design][data-cd-hide-fallback] [data-design-section="fallback"] { display:none!important; }
    .cd-preview, .cd-widgets { box-sizing:border-box; line-height:1.55; overflow-wrap:anywhere; }
    .cd-preview *, .cd-widgets * { box-sizing:border-box; }
    .cd-preview { padding:var(--cd-pad); background:var(--cd-bg); border:1px solid var(--cd-line); border-radius:16px; }
    .cd-preview h2, .cd-preview h3, .cd-widgets h3 { margin:0 0 8px; line-height:1.35; color:var(--cd-ink); }
    .cd-preview h2 { font-size:1.3em; }
    .cd-preview h3, .cd-widgets h3 { font-size:1.08em; }
    .cd-caption { color:var(--cd-muted); margin:5px 0 12px; font-size:.85em; }
    .cd-preview section, .cd-widget { margin:var(--cd-gap) 0 0; padding:var(--cd-pad); border:1px solid var(--cd-line); border-radius:12px; background:var(--cd-paper); }
    .cd-preview [data-design-word-grid] > article { border:1px solid var(--cd-line); border-radius:10px; }
    .cd-preview .cd-word { display:block; font-size:1.1em; font-weight:700; }
    .cd-preview .cd-word-detail { margin:5px 0 0; color:var(--cd-muted); font-size:.88em; }
    .cd-task-list { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:var(--cd-gap); margin:10px 0; }
    .cd-task-list [data-design-task] { padding:10px; border:1px solid var(--cd-line); border-radius:9px; background:var(--cd-paper); }
    .cd-task-list small { display:block; color:var(--cd-muted); }
    .cd-widget p { margin:8px 0; white-space:pre-wrap; }
    .cd-controls { display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:12px; }
    .cd-preview button, .cd-widgets button { appearance:none; cursor:pointer; font:inherit; font-size:.9em; border:1px solid var(--cd-line); border-radius:8px; padding:7px 11px; color:var(--cd-ink); background:var(--cd-paper); }
    .cd-preview button.cd-primary, .cd-widgets button.cd-primary { background:var(--cd-accent); color:#fff; border-color:var(--cd-accent); }
    .cd-preview button:disabled, .cd-widgets button:disabled { cursor:default; opacity:.55; }
    .cd-preview button:focus-visible, .cd-widgets button:focus-visible, .cd-widgets input:focus-visible, .cd-preview input:focus-visible { outline:3px solid var(--cd-accent); outline-offset:3px; }
    .cd-check { display:flex; align-items:flex-start; gap:9px; padding:8px 0; cursor:pointer; }
    .cd-check input { flex:none; width:18px; height:18px; margin-top:4px; accent-color:var(--cd-accent); }
    .cd-check small { display:block; color:var(--cd-muted); }
    .cd-flashcard { width:100%; min-height:125px; text-align:left; padding:18px!important; }
    .cd-flashcard b, .cd-flashcard span { display:block; white-space:pre-wrap; }
    .cd-flashcard span { margin-top:8px; }
    .cd-quiz-label { display:block; margin-top:10px; }
    .cd-quiz-input { display:block; width:100%; margin-top:7px; padding:9px; border:1px solid var(--cd-line); border-radius:8px; font:inherit; color:var(--cd-ink); background:var(--cd-paper); }
    .cd-status { min-height:1.55em; color:var(--cd-muted); white-space:pre-wrap; }
    .cd-timer { font-size:2.2em; font-variant-numeric:tabular-nums; font-weight:700; letter-spacing:.03em; }
    .cd-empty { padding:12px; color:var(--cd-muted); }
    @media(max-width:560px) { [data-cet4-design] [data-design-word-grid] { grid-template-columns:minmax(0,1fr)!important; } .cd-preview { padding:12px; } }
  `;
  function fail(message) { throw new TypeError('页面方案无效：' + message); }
  function exact(value, keys, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(label + '必须是对象');
    const own = Object.keys(value);
    if (own.length !== keys.length || own.some(key => !keys.includes(key))) fail(label + '包含不支持的字段');
    for (const key of keys) if (!Object.prototype.hasOwnProperty.call(value, key)) fail(label + '缺少字段');
  }
  function str(value, min, max, label) {
    if (typeof value !== 'string' || value.length > max || value.trim().length < min || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(label + '长度或格式不正确');
    return value.trim();
  }
  function integer(value, min, max, label) { if (!Number.isInteger(value) || value < min || value > max) fail(label + '范围不正确'); return value; }
  function choice(value, values, label) { if (!values.includes(value)) fail(label + '不受支持'); return value; }
  function uniqueList(value, allowed, complete, label) {
    if (!Array.isArray(value) || value.length > allowed.length || new Set(value).size !== value.length || value.some(item => !allowed.includes(item)) || (complete && value.length !== allowed.length)) fail(label + '不正确');
    return value.slice();
  }
  function normalizeWidgets(value) {
    if (!Array.isArray(value) || value.length > 8) fail('最多添加 8 个小工具');
    const ids = new Set();
    const result = value.map(widget => {
      exact(widget, WIDGET_KEYS, '小工具');
      const id = str(widget.id, 1, 48, '小工具标识');
      if (!/^[a-z][a-z0-9-]{0,47}$/.test(id) || ids.has(id)) fail('小工具标识格式不正确或重复');
      ids.add(id);
      const type = choice(widget.type, TYPES, '小工具类型');
      if (!Array.isArray(widget.items) || widget.items.length > 20) fail('小工具条目过多');
      const items = widget.items.map(item => { exact(item, ['front', 'back'], '条目'); return { front: str(item.front, 1, 300, '条目内容'), back: str(item.back, 0, 1000, '条目解释') }; });
      if (['checklist', 'flashcards', 'quiz'].includes(type) && !items.length) fail('该小工具需要至少一个条目');
      if (['flashcards', 'quiz'].includes(type) && items.some(item => !item.back)) fail('卡片或练习需要参考答案');
      return { id, title: str(widget.title, 1, 80, '标题'), type, text: str(widget.text, 0, 4000, '说明'), items, minutes: integer(widget.minutes, 1, 120, '计时分钟数') };
    });
    if (JSON.stringify(result).length > 24000) fail('小工具总内容过长');
    return result;
  }
  function normalizeDesign(value) {
    exact(value, DESIGN_KEYS, '方案'); if (value.version !== 1) fail('版本不受支持');
    const result = { version: 1, theme: choice(value.theme, ['forest', 'ocean', 'warm'], '主题'), density: choice(value.density, ['comfortable', 'compact'], '间距'), fontSize: integer(value.fontSize, 16, 22, '字号'), wordColumns: integer(value.wordColumns, 1, 3, '单词列数'), wordMode: choice(value.wordMode, ['cards', 'list'], '单词布局'), taskOrder: uniqueList(value.taskOrder, TASKS, true, '任务顺序'), hiddenSections: uniqueList(value.hiddenSections, EXTRAS, false, '折叠区域'), widgets: normalizeWidgets(value.widgets) };
    if (JSON.stringify(result).length > 24000) fail('方案总内容过长');
    return result;
  }
  function isValidDesign(value) { try { normalizeDesign(value); return true; } catch { return false; } }
  function element(doc, tag, className, text) { const el = doc.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = String(text); return el; }
  function clear(container) { while (container.firstChild) container.removeChild(container.firstChild); }
  function styles(doc) {
    const existing = documentStyles.get(doc); if (existing && existing.parentNode) return;
    const style = element(doc, 'style'); style.setAttribute('data-cet4-design-styles', '1'); style.textContent = STYLE;
    (doc.head || doc.documentElement).appendChild(style); documentStyles.set(doc, style);
  }
  function button(doc, text, action, primary) { const el = element(doc, 'button', primary ? 'cd-primary' : '', text); el.type = 'button'; el.addEventListener('click', action); return el; }
  function optionsFor(options) { return Object.assign({}, options || {}, { stateStore: options && options.stateStore || new Map() }); }
  function changed(options) { if (typeof options.onStateChange === 'function') { try { options.onStateChange(options.stateStore); } catch { /* Private storage failure must not break practice. */ } } }
  function stateAccess(store, key) {
    const mapLike = typeof store.get === 'function' && typeof store.set === 'function';
    let value = mapLike ? store.get(key) : Object.prototype.hasOwnProperty.call(store, key) ? store[key] : undefined;
    if (!value || typeof value !== 'object' || Array.isArray(value) || value.version !== 1) value = { version: 1 };
    if (mapLike) store.set(key, value); else Object.defineProperty(store, key, { value, configurable: true, writable: true, enumerable: true });
    return value;
  }
  function stopMounted(container) { const dispose = mounted.get(container); if (dispose) dispose(); }
  function register(container, cleanup) {
    let active = true;
    const dispose = function () { if (!active) return; active = false; for (const fn of cleanup) fn(); if (mounted.get(container) === dispose) mounted.delete(container); };
    mounted.set(container, dispose); return dispose;
  }
  function applyLayout(root, input) {
    const design = normalizeDesign(input), old = layouts.get(root); if (old) old(); styles(root.ownerDocument);
    const attributes = { 'data-cet4-design': '1', 'data-cd-theme': design.theme, 'data-cd-density': design.density, 'data-cd-word-mode': design.wordMode };
    for (const extra of EXTRAS) attributes['data-cd-hide-' + extra] = design.hiddenSections.includes(extra) ? '1' : null;
    const oldAttributes = Object.keys(attributes).map(key => [key, root.getAttribute(key)]);
    const variables = { '--cd-font': design.fontSize + 'px', '--cd-cols': String(design.wordColumns) };
    const oldVariables = Object.keys(variables).map(key => [key, root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]);
    for (const [key, value] of Object.entries(attributes)) { if (value === null) root.removeAttribute(key); else root.setAttribute(key, value); }
    for (const [key, value] of Object.entries(variables)) root.style.setProperty(key, value);
    let active = true;
    const dispose = function () {
      if (!active) return; active = false;
      for (const [key, value] of oldAttributes) { if (value === null) root.removeAttribute(key); else root.setAttribute(key, value); }
      for (const [key, value, priority] of oldVariables) { if (!value) root.style.removeProperty(key); else root.style.setProperty(key, value, priority); }
      if (layouts.get(root) === dispose) layouts.delete(root);
    };
    layouts.set(root, dispose); return dispose;
  }
  function normalizeAnswer(value) { return String(value).normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().replace(/[.!?。！？]+$/, ''); }
  function renderWidget(container, widget, options, cleanup, statePrefix) {
    const doc = container.ownerDocument, section = element(doc, 'section', 'cd-widget');
    section.setAttribute('data-widget-id', widget.id); section.setAttribute('data-widget-type', widget.type);
    section.appendChild(element(doc, 'h3', '', widget.title)); if (widget.text) section.appendChild(element(doc, 'p', '', widget.text)); container.appendChild(section);
    const state = stateAccess(options.stateStore, 'cet4-widget:' + statePrefix + ':' + widget.id + ':' + JSON.stringify(widget));
    const notify = () => changed(options);
    if (widget.type === 'note') { for (const item of widget.items) { section.appendChild(element(doc, 'p', '', item.front)); if (item.back) section.appendChild(element(doc, 'p', 'cd-caption', item.back)); } return; }
    if (widget.type === 'checklist') {
      if (!Array.isArray(state.checked) || state.checked.length !== widget.items.length) state.checked = widget.items.map(() => false);
      const status = element(doc, 'p', 'cd-status'), inputs = []; status.setAttribute('aria-live', 'polite');
      const update = () => { status.textContent = '已完成 ' + state.checked.filter(Boolean).length + ' / ' + widget.items.length + '（独立清单，不计入课程成绩）'; };
      widget.items.forEach((item, index) => {
        const label = element(doc, 'label', 'cd-check'), input = element(doc, 'input'), text = element(doc, 'span', '', item.front);
        input.type = 'checkbox'; input.checked = state.checked[index] === true;
        if (item.back) text.appendChild(element(doc, 'small', '', item.back));
        input.addEventListener('change', () => { state.checked[index] = input.checked; update(); notify(); }); inputs.push(input);
        label.appendChild(input); label.appendChild(text); section.appendChild(label);
      });
      const controls = element(doc, 'div', 'cd-controls');
      controls.appendChild(button(doc, '清空勾选', () => { state.checked = widget.items.map(() => false); inputs.forEach(input => { input.checked = false; }); update(); notify(); }));
      section.appendChild(controls); section.appendChild(status); update(); return;
    }
    if (widget.type === 'flashcards') {
      if (!Number.isInteger(state.index) || state.index < 0 || state.index >= widget.items.length) state.index = 0; state.flipped = state.flipped === true;
      const card = button(doc, '', () => { state.flipped = !state.flipped; update(); notify(); }); card.className = 'cd-flashcard';
      const controls = element(doc, 'div', 'cd-controls'), status = element(doc, 'p', 'cd-status'); status.setAttribute('aria-live', 'polite');
      function update() { clear(card); const item = widget.items[state.index]; card.appendChild(element(doc, 'b', '', state.flipped ? '参考内容' : '先回想，再点击翻面')); card.appendChild(element(doc, 'span', '', state.flipped ? item.back : item.front)); card.setAttribute('aria-label', (state.flipped ? '参考内容：' + item.back : '问题：' + item.front) + '；点击翻面'); status.textContent = (state.index + 1) + ' / ' + widget.items.length + ' · 自主回想，不计分'; }
      function move(delta) { state.index = (state.index + delta + widget.items.length) % widget.items.length; state.flipped = false; update(); notify(); }
      controls.appendChild(button(doc, '上一张', () => move(-1))); controls.appendChild(button(doc, '下一张', () => move(1), true)); controls.appendChild(button(doc, '重新开始', () => { state.index = 0; state.flipped = false; update(); notify(); }));
      section.appendChild(card); section.appendChild(controls); section.appendChild(status); update(); return;
    }
    if (widget.type === 'quiz') {
      if (!Array.isArray(state.answers) || state.answers.length !== widget.items.length) state.answers = widget.items.map(() => '');
      if (!Array.isArray(state.feedback) || state.feedback.length !== widget.items.length) state.feedback = widget.items.map(() => '');
      section.appendChild(element(doc, 'p', 'cd-caption', '独立短答练习，不写入首次成绩。文字匹配仅供参考，合理同义答案请自行核对。'));
      widget.items.forEach((item, index) => {
        const label = element(doc, 'label', 'cd-quiz-label', (index + 1) + '. ' + item.front), input = element(doc, 'input', 'cd-quiz-input');
        input.type = 'text'; input.autocomplete = 'off'; input.maxLength = 1000; input.value = typeof state.answers[index] === 'string' ? state.answers[index].slice(0, 1000) : ''; input.setAttribute('aria-label', '第 ' + (index + 1) + ' 题：' + item.front);
        const status = element(doc, 'p', 'cd-status', typeof state.feedback[index] === 'string' ? state.feedback[index].slice(0, 1200) : ''); status.setAttribute('aria-live', 'polite');
        input.addEventListener('input', () => { state.answers[index] = input.value.slice(0, 1000); state.feedback[index] = ''; status.textContent = ''; notify(); }); label.appendChild(input); section.appendChild(label);
        const controls = element(doc, 'div', 'cd-controls'), feedback = message => { state.feedback[index] = message; status.textContent = message; notify(); };
        controls.appendChild(button(doc, '检查答案', () => { if (!input.value.trim()) { feedback('请先填写自己的答案。'); return; } feedback(normalizeAnswer(input.value) === normalizeAnswer(item.back) ? '与参考答案文字匹配。此练习不计分。' : '与参考答案文字不完全一致；不代表一定错误，可查看参考内容自行核对。'); }, true));
        controls.appendChild(button(doc, '查看参考', () => feedback('参考内容：' + item.back))); controls.appendChild(button(doc, '重做本题', () => { input.value = ''; state.answers[index] = ''; feedback(''); })); section.appendChild(controls); section.appendChild(status);
      }); return;
    }
    const fullDuration = widget.minutes * 60000;
    if (!Number.isFinite(state.remaining) || state.remaining < 0 || state.remaining > fullDuration) state.remaining = fullDuration;
    let interval = null, deadline = 0, alive = true;
    const display = element(doc, 'div', 'cd-timer'), status = element(doc, 'p', 'cd-status'), controls = element(doc, 'div', 'cd-controls');
    display.setAttribute('role', 'timer'); display.setAttribute('aria-label', widget.title + '剩余时间'); status.setAttribute('aria-live', 'polite');
    const start = button(doc, '开始', () => { if (!alive || interval !== null) return; if (state.remaining <= 0) { status.textContent = '已结束，请重置后再开始。'; return; } deadline = Date.now() + state.remaining; interval = global.setInterval(tick, 200); start.disabled = true; pause.disabled = false; status.textContent = '计时中'; tick(); notify(); }, true);
    const pause = button(doc, '暂停', () => { if (!alive) return; stop(); status.textContent = state.remaining <= 0 ? '计时结束。' : '已暂停'; paint(); notify(); }); pause.disabled = true;
    function paint() { const seconds = Math.ceil(state.remaining / 1000); display.textContent = String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0'); }
    function stop() { if (interval !== null) { state.remaining = Math.max(0, deadline - Date.now()); global.clearInterval(interval); interval = null; } start.disabled = false; pause.disabled = true; }
    function tick() { if (!alive || interval === null) return; state.remaining = Math.max(0, deadline - Date.now()); if (state.remaining <= 0) { stop(); status.textContent = '计时结束。可以休息一下。'; notify(); } paint(); }
    const reset = button(doc, '重置', () => { if (!alive) return; stop(); state.remaining = fullDuration; status.textContent = '已重置，点击开始后计时。'; paint(); notify(); });
    controls.appendChild(start); controls.appendChild(pause); controls.appendChild(reset); section.appendChild(display); section.appendChild(controls); section.appendChild(status); status.textContent = '点击开始后计时；离开或重新预览时自动暂停。'; paint();
    cleanup.push(() => { stop(); alive = false; notify(); });
  }
  function appendWidgets(container, widgets, options, cleanup, prefix) { for (const widget of widgets) renderWidget(container, widget, options, cleanup, prefix); }
  function renderWidgets(container, input, rawOptions) {
    const widgets = normalizeWidgets(input), options = optionsFor(rawOptions); stopMounted(container); clear(container); styles(container.ownerDocument);
    const cleanup = [], wrapper = element(container.ownerDocument, 'div', 'cd-widgets'); container.appendChild(wrapper);
    if (widgets.length) appendWidgets(wrapper, widgets, options, cleanup, String(options.stateKey || JSON.stringify(widgets))); else wrapper.appendChild(element(container.ownerDocument, 'p', 'cd-empty', '尚未添加自定义小工具。'));
    return register(container, cleanup);
  }
  function renderPreview(container, input, rawOptions) {
    const design = normalizeDesign(input), options = optionsFor(rawOptions); stopMounted(container); clear(container); styles(container.ownerDocument);
    const doc = container.ownerDocument, cleanup = [], page = element(doc, 'div', 'cd-preview'); container.appendChild(page); cleanup.push(applyLayout(page, design));
    page.appendChild(element(doc, 'h2', '', '学习页面 · 交互预览')); page.appendChild(element(doc, 'p', 'cd-caption', '示例词和任务仅用于试用布局；下方清单、翻卡、练习和计时器可以直接操作，不影响课程、成绩或原草稿。'));
    const roadmap = element(doc, 'section'); roadmap.setAttribute('data-design-section', 'roadmap'); roadmap.appendChild(element(doc, 'h3', '', '备考路线')); roadmap.appendChild(element(doc, 'p', '', '按当前进度继续听、读、译、写，保留原有课程与固定题量。')); page.appendChild(roadmap);
    const names = { words: ['单词学习', '新词在前，复习在后'], listening: ['听力听写', '先盲听，再精听'], grammar: ['语法练习', '辨认句子结构'], reading: ['核心阅读', '定位原文证据'], sentence: ['句子与翻译', '找主干，连成句'], extensive: ['泛读与口语', '跟读，再复述'], review: ['今日复盘', '回看错题与难点'] };
    const tasks = element(doc, 'div', 'cd-task-list'); tasks.setAttribute('aria-label', '任务顺序预览');
    design.taskOrder.forEach((task, index) => { const tile = element(doc, 'div', '', (index + 1) + '. ' + names[task][0]); tile.setAttribute('data-design-task', task); tile.appendChild(element(doc, 'small', '', names[task][1])); tasks.appendChild(tile); }); page.appendChild(tasks);
    const tip = element(doc, 'section'); tip.setAttribute('data-design-section', 'studyTip'); tip.appendChild(element(doc, 'p', '', '学习提示：先回想意思，再展开中文，合理安排间隔复习。')); page.appendChild(tip);
    const wordSection = element(doc, 'section'); wordSection.setAttribute('data-design-section', 'wordList'); wordSection.appendChild(element(doc, 'h3', '', '示例单词卡')); const grid = element(doc, 'div'); grid.setAttribute('data-design-word-grid', '');
    const examples = [['improve', '/ɪmˈpruːv/', 'v. 动词', '提高；改善', 'Small changes can improve a study plan.'], ['evidence', '/ˈevɪdəns/', 'n. 名词', '证据', 'Find evidence in the passage.'], ['carefully', '/ˈkerfəli/', 'adv. 副词', '仔细地', 'Read the instructions carefully.']];
    for (const sample of examples) { const card = element(doc, 'article'); card.setAttribute('data-design-word', ''); card.appendChild(element(doc, 'strong', 'cd-word', sample[0])); card.appendChild(element(doc, 'p', 'cd-word-detail', sample[1] + ' · ' + sample[2])); card.appendChild(element(doc, 'p', 'cd-word-detail', sample[4])); const details = element(doc, 'details'); details.appendChild(element(doc, 'summary', '', '查看中文')); details.appendChild(element(doc, 'p', '', sample[3])); card.appendChild(details); grid.appendChild(card); }
    wordSection.appendChild(grid); page.appendChild(wordSection);
    const fallback = element(doc, 'section'); fallback.setAttribute('data-design-section', 'fallback'); fallback.appendChild(element(doc, 'h3', '', '60 分钟保底版')); fallback.appendChild(element(doc, 'p', '', '时间有限时替代完整计划，不叠加任务。')); page.appendChild(fallback);
    if (design.widgets.length) { const widgets = element(doc, 'div', 'cd-widgets'); widgets.appendChild(element(doc, 'h3', '', '自定义小工具（可直接试用）')); page.appendChild(widgets); appendWidgets(widgets, design.widgets, options, cleanup, String(options.stateKey || JSON.stringify(design))); }
    return register(container, cleanup);
  }
  global.Cet4Designer = Object.freeze({ normalizeDesign, isValidDesign, renderPreview, renderWidgets, applyLayout });
})(globalThis);
