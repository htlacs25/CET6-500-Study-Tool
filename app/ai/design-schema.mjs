// This contract is data, never code. Keep validation usable by future per-user stores.
const objectSchema = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const TASK_SECTIONS = Object.freeze(['words', 'listening', 'grammar', 'reading', 'sentence', 'extensive', 'review']);
export const HIDEABLE_SECTIONS = Object.freeze(['roadmap', 'studyTip', 'wordList', 'fallback']);
export const WIDGET_TYPES = Object.freeze(['note', 'checklist', 'flashcards', 'quiz', 'timer']);
export const DEFAULT_DESIGN = Object.freeze({ version: 1, theme: 'forest', density: 'comfortable', fontSize: 18, wordColumns: 3, wordMode: 'cards', taskOrder: TASK_SECTIONS, hiddenSections: Object.freeze([]), widgets: Object.freeze([]) });
export const DESIGN_SCHEMA = objectSchema({
  version: { type: 'integer', enum: [1] },
  theme: { type: 'string', enum: ['forest', 'ocean', 'warm'] },
  density: { type: 'string', enum: ['comfortable', 'compact'] },
  fontSize: { type: 'integer', minimum: 16, maximum: 22 },
  wordColumns: { type: 'integer', minimum: 1, maximum: 3 },
  wordMode: { type: 'string', enum: ['cards', 'list'] },
  taskOrder: { type: 'array', minItems: 7, maxItems: 7, items: { type: 'string', enum: TASK_SECTIONS } },
  hiddenSections: { type: 'array', maxItems: 4, items: { type: 'string', enum: HIDEABLE_SECTIONS } },
  widgets: { type: 'array', maxItems: 8, items: objectSchema({
    id: { type: 'string' }, title: { type: 'string' }, type: { type: 'string', enum: WIDGET_TYPES },
    text: { type: 'string' }, items: { type: 'array', maxItems: 20, items: objectSchema({ front: { type: 'string' }, back: { type: 'string' } }) },
    minutes: { type: 'integer', minimum: 1, maximum: 120 },
  }) },
});
export const DESIGN_RESPONSE_SCHEMA = objectSchema({
  reply: { type: 'string' },
  proposal: { anyOf: [{ type: 'null' }, objectSchema({ title: { type: 'string' }, summary: { type: 'string' }, design: DESIGN_SCHEMA })] },
});
function invalid() { throw new TypeError('页面配置不符合允许范围。'); }
function exact(value, names) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value)) || Object.keys(value).length !== names.length || names.some(name => !Object.hasOwn(value, name))) invalid();
}
function bounded(value, max, empty = true) {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) invalid();
  return value.trim();
}
function subset(value, allowed, exactCount) {
  if (!Array.isArray(value) || value.length > allowed.length || new Set(value).size !== value.length || value.some(item => !allowed.includes(item)) || (exactCount !== undefined && value.length !== exactCount)) invalid();
  return [...value];
}
export function validateDesign(value) {
  exact(value, Object.keys(DEFAULT_DESIGN));
  if (value.version !== 1 || !['forest', 'ocean', 'warm'].includes(value.theme) || !['comfortable', 'compact'].includes(value.density) || !['cards', 'list'].includes(value.wordMode) || !Number.isInteger(value.fontSize) || value.fontSize < 16 || value.fontSize > 22 || !Number.isInteger(value.wordColumns) || value.wordColumns < 1 || value.wordColumns > 3) invalid();
  const taskOrder = subset(value.taskOrder, TASK_SECTIONS, 7);
  const hiddenSections = subset(value.hiddenSections, HIDEABLE_SECTIONS);
  if (!Array.isArray(value.widgets) || value.widgets.length > 8) invalid();
  const ids = new Set();
  const widgets = value.widgets.map(widget => {
    exact(widget, ['id', 'title', 'type', 'text', 'items', 'minutes']);
    if (typeof widget.id !== 'string' || !/^[a-z][a-z0-9-]{0,47}$/.test(widget.id) || ids.has(widget.id) || !WIDGET_TYPES.includes(widget.type) || !Number.isInteger(widget.minutes) || widget.minutes < 1 || widget.minutes > 120 || !Array.isArray(widget.items) || widget.items.length > 20) invalid();
    ids.add(widget.id);
    const items = widget.items.map(item => { exact(item, ['front', 'back']); return { front: bounded(item.front, 300, false), back: bounded(item.back, 1000) }; });
    if (['checklist', 'flashcards', 'quiz'].includes(widget.type) && !items.length) invalid();
    if (['flashcards', 'quiz'].includes(widget.type) && items.some(item => !item.back)) invalid();
    return { id: widget.id, title: bounded(widget.title, 80, false), type: widget.type, text: bounded(widget.text, 4000), items, minutes: widget.minutes };
  });
  const result = { version: 1, theme: value.theme, density: value.density, fontSize: value.fontSize, wordColumns: value.wordColumns, wordMode: value.wordMode, taskOrder, hiddenSections, widgets };
  // Bound aggregate data too, independent of the transport and provider limits.
  if (JSON.stringify(result).length > 24000) invalid();
  return result;
}
export function validateDesignReply(value) {
  exact(value, ['reply', 'proposal']);
  const reply = bounded(value.reply, 8000, false);
  if (value.proposal === null) return { reply, proposal: null };
  exact(value.proposal, ['title', 'summary', 'design']);
  return { reply, proposal: { title: bounded(value.proposal.title, 120, false), summary: bounded(value.proposal.summary, 1500, false), design: validateDesign(value.proposal.design) } };
}
