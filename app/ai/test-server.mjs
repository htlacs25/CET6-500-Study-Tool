import test from 'node:test';
import http from 'node:http';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAiServer, validateAiOutput, publicCourse } from './server.mjs';

const DATE = '2026-10-14';
const KEY = 'sk-mock-only-never-a-real-api-key-123456789';
const plain = () => ({ reply: '这是学习解释。', proposal: null });
const proposal = (minutes = 60) => ({ reply: '请先确认预览。', proposal: { title: '调整学习附加安排', summary: '仅影响当前日期的AI附加安排。', changes: { minutes, focus: 'listening', note: '听后复述', practice: [{ prompt: 'She ___ ready.', answer: 'is', explanation: '形容词前用be。' }] } } });
const aiResponse = (value) => new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] }), { headers: { 'Content-Type': 'application/json' } });
const chatBody = (overrides = {}) => ({ date: DATE, message: '请解释句子。', includeCourse: false, sharedText: '', ...overrides });
test('public context follows the published default vocabulary, including Windows line endings', () => {
  const html = readFileSync(new URL('../public/六级学习工具.html', import.meta.url), 'utf8');
  const course = publicCourse(DATE, html);
  assert.equal(course.available, true);
  assert.equal(course.words.length, 40);
  assert.equal(course.words.filter(word => word.group === 'new').length, 22);
  assert.deepEqual(course.words.slice(0, 3).map(word => word.word), ['software', 'hardware', 'database']);
  assert.deepEqual(publicCourse(DATE, html.replace(/\r?\n/g, '\r\n')), course);
  assert.equal(publicCourse(DATE, '').available, false);
});
async function fixture(t, opts = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'cet4-ai-test-'));
  const clientPath = join(dir, 'client.html');
  writeFileSync(clientPath, '<!doctype html><script>const token="__AI_TOKEN__";</script>');
  const appOptions = { dataDir: join(dir, 'state'), clientPath, apiKey: '', providerFetch: async () => aiResponse(plain()), ...opts };
  let app;
  let url;
  let token;
  async function start() {
    app = createAiServer(appOptions); url = await app.listen(0);
    const page = await fetch(url).then((response) => response.text());
    token = page.match(/[a-f0-9]{64}/)[0];
  }
  await start();
  const ctx = {
    dir, appOptions,
    get url() { return url; },
    get token() { return token; },
    async call(path, body, overrides = {}) {
      const isPost = body !== undefined;
      const { headers, ...other } = overrides;
      const response = await fetch(url + path, { method: isPost ? 'POST' : 'GET', headers: { Authorization: `Bearer ${token}`, ...(isPost ? { Origin: url, 'Content-Type': 'application/json' } : {}), ...headers }, ...(isPost ? { body: JSON.stringify(body) } : {}), ...other });
      return { status: response.status, body: await response.json(), headers: response.headers };
    },
    async configure() { return ctx.call('/api/config', { apiKey: KEY, model: 'gpt-4.1-mini' }); },
    async state(date = DATE) { return (await ctx.call(`/api/state?date=${date}`)).body; },
    async restart() { await app.close(); await start(); },
  };
  t.after(async () => { await app.close(); rmSync(dir, { recursive: true, force: true }); });
  return ctx;
}

test('loopback host, bearer authentication, same-origin POST, route/date/body guards', async (t) => {
  const f = await fixture(t);
  assert.deepEqual((await f.call('/health')).body, { service: 'cet4-ai', version: 1 });
  assert.equal((await f.call(`/api/state?date=${DATE}`, undefined, { headers: { Authorization: '' } })).status, 401);
  const wrongHostStatus = await new Promise((resolve, reject) => {
    const req = http.get(f.url + '/health', { headers: { Host: 'attacker.example' } }, (res) => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject);
  });
  assert.equal(wrongHostStatus, 403);
  assert.equal((await f.call('/api/config', { apiKey: KEY, model: 'gpt-4.1-mini' }, { headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await f.call('/api/config', { apiKey: KEY, model: 'gpt-4.1-mini' }, { headers: { Origin: 'null' } })).status, 403);
  assert.equal((await f.call('/api/config', { apiKey: KEY, model: 'gpt-4.1-mini' }, { headers: { Origin: '' } })).status, 403);
  assert.equal((await f.call('/api/state?date=2026-02-31')).status, 400);
  assert.equal((await f.call('/.local-ai/assistant.sqlite')).status, 404);
  assert.equal((await f.call('/api/config', { apiKey: KEY, model: 'x' }, { headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await f.call('/api/chat', { padding: 'x'.repeat(40000) })).status, 413);
  const headers = (await fetch(f.url)).headers;
  assert.match(headers.get('content-security-policy'), /frame-ancestors 'self' file:/);
  assert.equal(headers.get('access-control-allow-origin'), null);
  assert.equal(headers.get('cache-control'), 'no-store');
});

test('key is memory-only, blank configuration retains it, disconnect and restart clear it', async (t) => {
  let calls = 0;
  const f = await fixture(t, { providerFetch: async () => { calls++; return aiResponse(plain()); } });
  assert.equal((await f.call('/api/chat', chatBody())).body.error.code, 'NOT_CONFIGURED');
  assert.equal(calls, 0);
  assert.equal((await f.configure()).body.configured, true);
  assert.equal((await f.call('/api/config', { apiKey: '', model: 'gpt-4.1-mini' })).body.configured, true);
  assert.equal((await f.call('/api/disconnect', {})).body.configured, false);
  await f.configure(); await f.restart();
  assert.equal((await f.state()).configured, false);
  for (const name of readdirSync(join(f.dir, 'state'))) assert.equal(readFileSync(join(f.dir, 'state', name)).includes(Buffer.from(KEY)), false);
});

test('public course context is opt-in, provider shape is fixed and previous messages date-scoped', async (t) => {
  const requests = [];
  let courseCalls = 0;
  const f = await fixture(t, { courseProvider: async (date) => { courseCalls++; return { title: 'public-fixture', date }; }, providerFetch: async (url, init) => { requests.push({ url, init, json: JSON.parse(init.body) }); return aiResponse(plain()); } });
  await f.configure();
  await f.call('/api/chat', chatBody({ message: 'ONLY_DATE_A' }));
  assert.equal(courseCalls, 0); assert.equal(JSON.stringify(requests[0].json).includes('public-fixture'), false);
  await f.call('/api/chat', chatBody({ includeCourse: true, sharedText: '用户主动共享' }));
  assert.equal(courseCalls, 1); assert.match(JSON.stringify(requests[1].json), /public-fixture/);
  assert.match(JSON.stringify(requests[1].json), /用户主动共享/);
  assert.equal(requests[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(requests[0].json.store, false); assert.equal(requests[0].json.max_output_tokens, 2000);
  assert.equal(requests[0].json.text.format.strict, true);
  assert.equal(requests[0].init.headers.Authorization, `Bearer ${KEY}`);
  await f.call('/api/chat', chatBody({ date: '2026-10-15' }));
  assert.equal(JSON.stringify(requests[2].json).includes('ONLY_DATE_A'), false);
  assert.equal((await f.state()).messages.length, 4);
  assert.equal((await f.state('2026-10-15')).messages.length, 2);
});

test('proposal is preview-only, confirmation persists overlay and audit, undo restores previous plan', async (t) => {
  let result = proposal();
  const f = await fixture(t, { providerFetch: async () => aiResponse(result) });
  await f.configure();
  let response = await f.call('/api/chat', chatBody());
  assert.equal(response.status, 200);
  let state = response.body;
  assert.equal(state.revision, 0); assert.equal(state.plan.minutes, null);
  const id = state.proposals[0].id;
  response = await f.call('/api/apply', { id, revision: 0 });
  assert.equal(response.status, 200); assert.equal(response.body.plan.minutes, 60);
  assert.equal(response.body.revision, 1);
  assert.equal((await f.call('/api/apply', { id, revision: 1 })).status, 409);
  result = proposal(90); state = (await f.call('/api/chat', chatBody())).body;
  const id2 = state.proposals[0].id;
  await f.call('/api/apply', { id: id2, revision: 1 });
  assert.equal((await f.call('/api/undo', { id, revision: 2 })).body.error.code, 'UNDO_ORDER');
  state = (await f.call('/api/undo', { id: id2, revision: 2 })).body;
  assert.equal(state.plan.minutes, 60); assert.equal(state.revision, 3);
  state = (await f.call('/api/undo', { id, revision: 3 })).body;
  assert.equal(state.plan.minutes, null); assert.equal(state.revision, 4);
  await f.restart(); state = await f.state();
  assert.equal(state.revision, 4); assert.equal(state.messages.length, 4);
  assert.equal(state.proposals.filter((item) => item.status === 'undone').length, 2);
  assert.equal((await f.state('2026-10-15')).revision, 0);
});

test('concurrent approval makes in-flight proposal stale, never silently rebases it', async (t) => {
  let finish;
  let started;
  const startedPromise = new Promise((resolve) => { started = resolve; });
  let count = 0;
  const f = await fixture(t, { providerFetch: async () => { count++; if (count === 1) return aiResponse(proposal()); started(); return new Promise((resolve) => { finish = resolve; }); } });
  await f.configure();
  let state = (await f.call('/api/chat', chatBody())).body;
  const oldId = state.proposals[0].id;
  const pending = f.call('/api/chat', chatBody({ message: '再调整一下' }));
  await startedPromise;
  assert.equal((await f.call('/api/chat', chatBody())).body.error.code, 'BUSY');
  await f.call('/api/apply', { id: oldId, revision: 0 });
  finish(aiResponse(proposal(90))); state = (await pending).body;
  const newId = state.proposals.find((item) => item.id !== oldId).id;
  assert.equal((await f.call('/api/apply', { id: newId, revision: 1 })).status, 409);
  assert.equal((await f.state()).plan.minutes, 60);
});

test('AI fields, limits, nulls, no-op and unapproved operations are validated independently', () => {
  assert.deepEqual(validateAiOutput(plain()), plain());
  for (const minutes of [0, 29, 241, 1.5, '60']) assert.throws(() => validateAiOutput(proposal(minutes)));
  for (const invalid of [undefined, [], {}, { reply: 'x', proposal: null, command: 'exec' }]) assert.throws(() => validateAiOutput(invalid));
  const invalid = proposal(); invalid.proposal.changes.deleteScores = true;
  assert.throws(() => validateAiOutput(invalid));
  const noOp = proposal(); noOp.proposal.changes = { minutes: null, focus: null, note: null, practice: null };
  assert.throws(() => validateAiOutput(noOp));
  const long = proposal(); long.proposal.changes.practice = Array(7).fill({ prompt: 'p', answer: 'a', explanation: 'e' });
  assert.throws(() => validateAiOutput(long));
  const wrongFocus = proposal(); wrongFocus.proposal.changes.focus = 'shell'; assert.throws(() => validateAiOutput(wrongFocus));
});

test('malformed AI reply does not create proposals or messages; upstream errors never expose key', async (t) => {
  let response = new Response(KEY, { status: 401 });
  const f = await fixture(t, { providerFetch: async () => response });
  await f.configure();
  let result = await f.call('/api/chat', chatBody());
  assert.equal(result.body.error.code, 'PROVIDER_AUTH'); assert.equal(JSON.stringify(result.body).includes(KEY), false);
  response = aiResponse({ ...proposal(), command: 'overwrite' });
  result = await f.call('/api/chat', chatBody()); assert.equal(result.body.error.code, 'INVALID_AI_OUTPUT');
  assert.equal((await f.state()).messages.length, 0);
  response = aiResponse({ reply: `secret ${KEY}`, proposal: null });
  result = await f.call('/api/chat', chatBody({ message: `do not save ${KEY}` }));
  assert.equal(JSON.stringify(result.body).includes(KEY), false);
  assert.match(JSON.stringify(result.body), /已隐藏密钥/);
  for (const name of readdirSync(join(f.dir, 'state'))) assert.equal(readFileSync(join(f.dir, 'state', name)).includes(Buffer.from(KEY)), false);
});

test('streaming overlarge provider response is cancelled before buffering without bound', async (t) => {
  let cancelled = false;
  const f = await fixture(t, { providerFetch: async () => new Response(new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(65536)); }, cancel() { cancelled = true; } })) });
  await f.configure();
  const result = await f.call('/api/chat', chatBody());
  assert.equal(result.status, 502); assert.equal(cancelled, true);
  assert.equal((await f.state()).messages.length, 0);
});

test('disconnect aborts in-flight provider request and does not save returned text', async (t) => {
  let started;
  const startedPromise = new Promise((resolve) => { started = resolve; });
  let aborted = false;
  const f = await fixture(t, { providerFetch: async (_url, init) => new Promise((_resolve, reject) => { init.signal.addEventListener('abort', () => { aborted = true; reject(new Error(KEY)); }); started(); }) });
  await f.configure();
  const pending = f.call('/api/chat', chatBody());
  await startedPromise;
  assert.equal((await f.call('/api/disconnect', {})).body.configured, false);
  const response = await pending;
  assert.equal(aborted, true); assert.equal(JSON.stringify(response.body).includes(KEY), false);
  assert.equal((await f.state()).messages.length, 0);
});

test('provider timeout is bounded and rate limits survive service restart', async (t) => {
  let calls = 0;
  const f = await fixture(t, { dayLimit: 2, minuteLimit: 2, timeoutMs: 20, providerFetch: async (_url, init) => { calls++; if (calls === 1) return new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new Error('timeout')))); return aiResponse(plain()); } });
  await f.configure();
  assert.equal((await f.call('/api/chat', chatBody())).body.error.code, 'PROVIDER_UNAVAILABLE');
  assert.equal((await f.call('/api/chat', chatBody())).status, 200);
  await f.restart(); await f.configure();
  assert.equal((await f.call('/api/chat', chatBody())).status, 429); assert.equal(calls, 2);
});

test('reject is durable and cannot reject already applied proposals', async (t) => {
  const f = await fixture(t, { providerFetch: async () => aiResponse(proposal()) });
  await f.configure();
  const state = (await f.call('/api/chat', chatBody())).body;
  const id = state.proposals[0].id;
  assert.equal((await f.call('/api/reject', { id })).body.proposals[0].status, 'rejected');
  assert.equal((await f.call('/api/apply', { id, revision: 0 })).status, 409);
  await f.restart(); assert.equal((await f.state()).proposals[0].status, 'rejected');
});
