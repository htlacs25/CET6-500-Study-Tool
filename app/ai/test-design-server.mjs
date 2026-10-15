import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createAiServer } from './server.mjs';
import { DEFAULT_DESIGN, DESIGN_SCHEMA, validateDesign, validateDesignReply } from './design-schema.mjs';

const DATE = '2026-10-15';
const KEY = 'sk-mock-design-only-never-real-1234567890';
const design = (overrides = {}) => ({ ...structuredClone(DEFAULT_DESIGN), ...overrides });
const widget = (overrides = {}) => ({ id: 'study-note', title: '今日提醒', type: 'note', text: '先听后看。', items: [], minutes: 1, ...overrides });
const proposal = (overrides = {}) => ({ title: '紧凑页面', summary: '改变呈现，不改变课程和成绩。', design: design({ density: 'compact', ...overrides }) });
const output = (overrides) => ({ reply: '修改方案已生成，请先预览确认。', proposal: proposal(overrides) });
const aiResponse = (value) => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { headers: { 'Content-Type': 'application/json' } });
const generationBody = (overrides = {}) => ({ date: DATE, message: '让页面更紧凑，加一个练习组件。', includeCourse: false, ...overrides });
async function fixture(t, overrides = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cet4-design-test-'));
  const clientPath = join(dir, 'client.html');
  const designRuntimePath = join(dir, 'design-runtime.js');
  writeFileSync(clientPath, '<script>const token="__AI_TOKEN__"</script>');
  writeFileSync(designRuntimePath, '/* fixed runtime fixture */');
  const options = { dataDir: join(dir, 'state'), clientPath, designRuntimePath, apiKey: '', providerFetch: async () => aiResponse(output()), ...overrides };
  let app;
  let url;
  let token;
  async function start() {
    app = createAiServer(options); url = await app.listen(0);
    token = (await fetch(url).then(r => r.text())).match(/[a-f0-9]{64}/)[0];
  }
  await start();
  const f = {
    dir, get url() { return url; },
    async call(path, body, headers = {}) {
      const post = body !== undefined;
      const response = await fetch(url + path, { method: post ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, ...(post ? { Origin: url, 'Content-Type': 'application/json' } : {}), ...headers }, ...(post ? { body: JSON.stringify(body) } : {}) });
      return { status: response.status, value: await response.json() };
    },
    async configure() { return f.call('/api/config', { apiKey: KEY, model: 'gpt-4.1-mini' }); },
    async state() { return (await f.call('/api/workbench')).value; },
    async restart() { await app.close(); await start(); },
    audit() { const db = new DatabaseSync(join(dir, 'state', 'assistant.sqlite'), { readOnly: true }); try { return db.prepare('SELECT action,revision FROM design_audit ORDER BY id').all(); } finally { db.close(); } },
  };
  t.after(async () => { await app.close(); rmSync(dir, { recursive: true, force: true }); });
  return f;
}

test('design validator is exact, bounded, nonmutating and rejects executable configuration fields', () => {
  const original = design(); const copy = structuredClone(original);
  assert.deepEqual(validateDesign(original), original); assert.deepEqual(original, copy);
  assert.equal(DESIGN_SCHEMA.additionalProperties, false);
  for (const invalid of [null, [], {}, { ...design(), html: '<script>run()</script>' }, { ...design(), css: '*{display:none}' }, { ...design(), command: 'write source' }, { ...design(), deleteScores: true }, { ...design(), theme: 'url(https://example.com)' }, { ...design(), fontSize: 100 }, { ...design(), fontSize: 17.5 }, { ...design(), wordColumns: 4 }]) assert.throws(() => validateDesign(invalid));
  const missing = design(); delete missing.widgets; assert.throws(() => validateDesign(missing));
  const inherited = Object.create({ dangerous: true }); Object.assign(inherited, design()); assert.throws(() => validateDesign(inherited));
  assert.throws(() => validateDesign(JSON.parse(JSON.stringify(design()).replace('"version":1', '"__proto__":{"polluted":true},"version":1'))));
  assert.equal({}.polluted, undefined);
  assert.throws(() => validateDesign(design({ taskOrder: Array(7).fill('words') })));
  assert.throws(() => validateDesign(design({ hiddenSections: ['words'] })));
  assert.throws(() => validateDesign(design({ hiddenSections: ['roadmap', 'roadmap'] })));
  assert.throws(() => validateDesignReply({ ...output(), action: 'auto-apply' }));
});

test('widgets cannot inject script behavior, duplicate IDs or oversized payloads', () => {
  const textOnly = widget({ text: '<img src=x onerror=alert(1)>', items: [] });
  assert.equal(validateDesign(design({ widgets: [textOnly] })).widgets[0].text, textOnly.text); // Rendered as text, not interpreted.
  for (const bad of [widget({ id: '../file' }), widget({ id: 'x'.repeat(49) }), widget({ script: 'alert(1)' }), widget({ minutes: 0 }), widget({ type: 'iframe' }), widget({ text: '\u0000' }), widget({ title: 'x'.repeat(81) }), widget({ text: 'x'.repeat(4001) }), widget({ items: Array(21).fill({ front: 'x', back: 'y' }) }), widget({ type: 'quiz' }), widget({ type: 'flashcards', items: [{ front: 'q', back: '' }] }), widget({ items: [{ front: 'x'.repeat(301), back: '' }] }), widget({ items: [{ front: 'q', back: 'a', onclick: 'bad' }] })]) assert.throws(() => validateDesign(design({ widgets: [bad] })));
  assert.throws(() => validateDesign(design({ widgets: [widget(), widget()] })));
  assert.throws(() => validateDesign(design({ widgets: Array.from({ length: 9 }, (_, i) => widget({ id: `n-${i}` })) })));
  assert.throws(() => validateDesign(design({ widgets: Array.from({ length: 8 }, (_, i) => widget({ id: `n-${i}`, text: 'x'.repeat(4000) })) })));
});

test('workbench and all mutations retain authentication, origin and exact-body guards', async t => {
  const f = await fixture(t);
  assert.equal((await f.call('/api/workbench', undefined, { Authorization: '' })).status, 401);
  assert.deepEqual((await f.state()).design, DEFAULT_DESIGN);
  assert.equal((await f.call('/api/design/manual', proposal(), { Origin: 'https://attacker.example' })).status, 403);
  assert.equal((await f.call('/api/design/manual', proposal(), { Origin: 'null' })).status, 403);
  assert.equal((await f.call('/api/design/manual', { ...proposal(), command: 'exec' })).status, 400);
  assert.equal((await f.call('/api/design', generationBody({ sharedText: 'extra data' }))).status, 400);
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'NOT_CONFIGURED');
  assert.equal((await f.call('/api/design/apply', { id: 'missing', revision: '0' })).status, 400);
  assert.equal((await f.call('/api/design/apply', { id: 'missing', revision: 0 })).status, 404);
  assert.equal((await f.call('/api/design/reject', { id: 'missing' })).status, 404);
  const runtime = await fetch(f.url + '/design-runtime.js');
  assert.match(runtime.headers.get('content-type'), /javascript/); assert.equal(await runtime.text(), '/* fixed runtime fixture */');
  assert.equal((await fetch(f.url + '/design-schema.mjs')).status, 404);
  assert.equal((await fetch(f.url + '/.local-ai/assistant.sqlite')).status, 404);
});

test('manual editing needs no key, is preview-only and is globally applied only by confirmation', async t => {
  let providerCalls = 0;
  const f = await fixture(t, { providerFetch: async () => { providerCalls++; throw new Error('Unexpected paid call'); } });
  let result = await f.call('/api/design/manual', proposal({ theme: 'ocean', widgets: [widget()] }));
  assert.equal(result.status, 200); assert.equal(result.value.revision, 0);
  assert.deepEqual(result.value.design, DEFAULT_DESIGN); assert.equal(result.value.proposals[0].status, 'pending');
  const id = result.value.proposals[0].id;
  result = await f.call('/api/design/apply', { id, revision: 0 });
  assert.equal(result.value.revision, 1); assert.equal(result.value.design.theme, 'ocean');
  assert.equal(result.value.design.widgets[0].text, '先听后看。');
  for (const date of [DATE, '2026-10-16']) {
    const state = (await f.call(`/api/state?date=${date}`)).value;
    assert.equal(state.revision, 0); assert.equal(state.messages.length, 0); assert.equal(state.plan.minutes, null);
  }
  assert.equal(providerCalls, 0);
  await f.restart(); assert.equal((await f.state()).design.theme, 'ocean');
  assert.deepEqual(f.audit().map(a => a.action), ['preview-manual', 'apply']);
});

test('global design revisions reject stale previews and undo only latest approved page mutation', async t => {
  const f = await fixture(t);
  const first = (await f.call('/api/design/manual', proposal({ theme: 'ocean' }))).value.proposals[0].id;
  const stale = (await f.call('/api/design/manual', proposal({ theme: 'warm' }))).value.proposals[0].id;
  await f.call('/api/design/apply', { id: first, revision: 0 });
  assert.equal((await f.call('/api/design/apply', { id: stale, revision: 0 })).value.error.code, 'STALE_PROPOSAL');
  assert.equal((await f.call('/api/design/apply', { id: stale, revision: 1 })).value.error.code, 'STALE_PROPOSAL');
  const second = (await f.call('/api/design/manual', proposal({ theme: 'warm', fontSize: 20 }))).value.proposals[0].id;
  await f.call('/api/design/apply', { id: second, revision: 1 });
  assert.equal((await f.call('/api/design/undo', { id: first, revision: 2 })).value.error.code, 'UNDO_ORDER');
  assert.equal((await f.call('/api/design/reject', { id: second })).status, 409);
  assert.equal((await f.call('/api/design/undo', { id: second, revision: 2 })).value.design.theme, 'ocean');
  assert.equal((await f.call('/api/design/undo', { id: first, revision: 3 })).value.design.theme, 'forest');
  assert.equal((await f.call('/api/design/undo', { id: first, revision: 4 })).status, 409);
  await f.call('/api/design/reject', { id: stale });
  await f.restart(); const state = await f.state();
  assert.equal(state.revision, 4); assert.equal(state.proposals.filter(p => p.status === 'undone').length, 2);
  assert.equal(state.proposals.find(p => p.id === stale).status, 'rejected');
  assert.deepEqual(f.audit().map(a => a.action), ['preview-manual', 'preview-manual', 'apply', 'preview-manual', 'apply', 'undo', 'undo', 'reject']);
});

test('AI design sends only opt-in public course, current design and capabilities, not study chats', async t => {
  const requests = []; let courses = 0;
  const f = await fixture(t, { courseProvider: async () => { courses++; return { title: 'PUBLIC_COURSE' }; }, providerFetch: async (url, init) => {
    const request = JSON.parse(init.body); requests.push({ url, request });
    if (request.text.format.name === 'cet4_tutor_reply') return aiResponse({ reply: 'OLD_PRIVATE_STUDY_REPLY', proposal: null });
    return aiResponse(output());
  } });
  await f.configure();
  await f.call('/api/chat', { date: DATE, message: 'OLD_PRIVATE_STUDY_MESSAGE', includeCourse: false, sharedText: 'OLD_SHARED_GRADES' });
  const response = await f.call('/api/design', generationBody());
  assert.equal(response.status, 200); assert.equal(response.value.revision, 0); assert.equal(response.value.proposals[0].status, 'pending');
  assert.equal(courses, 0); const req = requests[1];
  assert.equal(req.url, 'https://api.openai.com/v1/responses'); assert.equal(req.request.max_output_tokens, 4000); assert.equal(req.request.store, false);
  assert.equal(req.request.text.format.strict, true); assert.equal(req.request.text.format.schema.additionalProperties, false);
  const sent = JSON.stringify(req.request); assert.match(sent, /currentDesign/); assert.match(sent, /capabilities/);
  for (const secret of ['OLD_PRIVATE_STUDY_MESSAGE', 'OLD_PRIVATE_STUDY_REPLY', 'OLD_SHARED_GRADES', 'PUBLIC_COURSE']) assert.equal(sent.includes(secret), false);
  await f.call('/api/design', generationBody({ includeCourse: true, date: '2026-10-16' }));
  assert.equal(courses, 1); assert.match(JSON.stringify(requests[2].request), /PUBLIC_COURSE/);
  assert.equal((await f.state()).proposals.length, 2);
});

test('design and date-scoped learning plans cannot mutate or undo each other', async t => {
  const f = await fixture(t, { providerFetch: async () => aiResponse({ reply: '学习建议待确认。', proposal: { title: '听力时间', summary: '仅今日。', changes: { minutes: 70, focus: 'listening', note: '', practice: [] } } }) });
  await f.configure();
  const plan = (await f.call('/api/chat', { date: DATE, message: '调整时间', includeCourse: false, sharedText: '' })).value;
  const planId = plan.proposals[0].id;
  await f.call('/api/apply', { id: planId, revision: 0 });
  const designId = (await f.call('/api/design/manual', proposal())).value.proposals[0].id;
  await f.call('/api/design/apply', { id: designId, revision: 0 });
  assert.equal((await f.call('/api/design/undo', { id: planId, revision: 1 })).status, 404);
  assert.equal((await f.call('/api/undo', { id: designId, revision: 1 })).status, 404);
  await f.call('/api/design/undo', { id: designId, revision: 1 });
  const unchanged = (await f.call(`/api/state?date=${DATE}`)).value;
  assert.equal(unchanged.revision, 1); assert.equal(unchanged.plan.minutes, 70); assert.equal(unchanged.messages.length, 2);
  assert.equal((await f.call(`/api/state?date=2026-10-16`)).value.revision, 0);
});

test('invalid or incomplete model designs save nothing and never partially apply configuration', async t => {
  let response = aiResponse({ ...output(), command: 'overwrite HTML' });
  const f = await fixture(t, { providerFetch: async () => response }); await f.configure();
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'INVALID_AI_OUTPUT');
  response = aiResponse(output({ widgets: [widget({ type: 'script' })] }));
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'INVALID_AI_OUTPUT');
  response = new Response(JSON.stringify({ status: 'incomplete', output: [] }));
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'PROVIDER_INCOMPLETE');
  response = new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No' }] }] }));
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'PROVIDER_REFUSAL');
  response = aiResponse({ reply: '可先手动调整。', proposal: null });
  assert.equal((await f.call('/api/design', generationBody())).status, 200);
  assert.equal((await f.state()).proposals.length, 0); assert.deepEqual((await f.state()).design, DEFAULT_DESIGN);
  assert.equal(f.audit().length, 0);
});

test('in-flight designs use shared busy guard and retain original revision when another tab applies', async t => {
  let finish; let started;
  const startedPromise = new Promise(resolve => { started = resolve; });
  const f = await fixture(t, { providerFetch: async () => { started(); return new Promise(resolve => { finish = resolve; }); } });
  await f.configure();
  const priorId = (await f.call('/api/design/manual', proposal())).value.proposals[0].id;
  const pending = f.call('/api/design', generationBody()); await startedPromise;
  assert.equal((await f.call('/api/design', generationBody())).value.error.code, 'BUSY');
  assert.equal((await f.call('/api/chat', { date: DATE, message: 'x', includeCourse: false, sharedText: '' })).value.error.code, 'BUSY');
  assert.equal((await f.call('/api/config', { apiKey: '', model: 'gpt-4.1-mini' })).value.error.code, 'BUSY');
  await f.call('/api/design/apply', { id: priorId, revision: 0 });
  finish(aiResponse(output({ theme: 'warm' })));
  const state = (await pending).value; const next = state.proposals.find(p => p.id !== priorId);
  assert.equal(next.baseRevision, 0); assert.equal(state.revision, 1);
  assert.equal((await f.call('/api/design/apply', { id: next.id, revision: 1 })).value.error.code, 'STALE_PROPOSAL');
  assert.equal((await f.state()).design.theme, 'forest');
});

test('design uses same persistent rate budget and disconnect cancels without saving', async t => {
  let started; const startedPromise = new Promise(resolve => { started = resolve; });
  const f = await fixture(t, { dayLimit: 1, providerFetch: async (_url, init) => new Promise((_resolve, reject) => { started(); init.signal.addEventListener('abort', () => reject(new Error(KEY))); }) });
  await f.configure(); const pending = f.call('/api/design', generationBody()); await startedPromise;
  await f.call('/api/disconnect', {}); const cancelled = await pending;
  assert.equal(cancelled.status, 502); assert.equal(JSON.stringify(cancelled).includes(KEY), false);
  assert.equal((await f.state()).proposals.length, 0);
  await f.restart(); await f.configure();
  assert.equal((await f.call('/api/design', generationBody())).status, 429);
  assert.equal((await f.call('/api/chat', { date: DATE, message: 'x', includeCourse: false, sharedText: '' })).status, 429);
  assert.equal((await f.call('/api/design/manual', proposal())).status, 200);
});

test('manual and model design text redact keys before storage or return', async t => {
  const f = await fixture(t, { providerFetch: async () => aiResponse(output({ widgets: [widget({ text: `Never keep ${KEY}` })] })) });
  await f.configure();
  const manual = await f.call('/api/design/manual', { ...proposal(), summary: `Do not save ${KEY}` });
  assert.equal(JSON.stringify(manual).includes(KEY), false);
  const generated = await f.call('/api/design', generationBody({ message: `Do not send ${KEY}` }));
  assert.equal(JSON.stringify(generated).includes(KEY), false);
  assert.match(JSON.stringify(generated), /已隐藏密钥/);
  for (const file of readdirSync(join(f.dir, 'state'))) assert.equal(readFileSync(join(f.dir, 'state', file)).includes(Buffer.from(KEY)), false);
});
