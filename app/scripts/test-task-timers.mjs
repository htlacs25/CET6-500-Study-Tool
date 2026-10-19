import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Synthetic storage/clock/DOM only: never reads a real browser profile.
const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
const source=template.slice(template.indexOf('    // TASK_TIMER_BEGIN'),template.indexOf('    // TASK_TIMER_END'));
assert.ok(source.includes('function createTaskCountdowns'));
const KEY='cet4-task-countdowns-v1',date='2026-10-19';
const task={id:'words',minutes:30,label:'词汇'},second={id:'reading',minutes:20,label:'阅读'};
function fixture(initial={}){
  let time=1000000;
  const values=new Map(Object.entries(initial)),writes=[],reads=[];
  const protectedData={grade:37,draft:'unfinished answer',firstAt:'original',completed:[]};
  const storage={getItem(key){reads.push(key);return values.get(key)??null},setItem(key,value){writes.push(key);values.set(key,value)}};
  const hosts=[],listeners={},intervals=[];
  const app={inserted:[],insertAdjacentHTML(where,html){this.inserted.push([where,html])}};
  const context=vm.createContext({localStorage:storage,document:{querySelectorAll:()=>hosts,addEventListener:(name,fn)=>{listeners[name]=fn}},window:{addEventListener:(name,fn)=>{listeners[name]=fn}},setInterval:(fn,ms)=>intervals.push([fn,ms]),Date:{now:()=>time},app,selected:date,tab:'plan',esc:value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;'),store:protectedData});
  vm.runInContext(source+';globalThis.api={createTaskCountdowns,taskTimerHtml,updateTaskTimerDisplays,bindTaskTimers,installTaskTimers};',context);
  const manager=()=>context.api.createTaskCountdowns(storage,()=>time);
  function host(t=task,d=date){const clock={textContent:''},status={textContent:''},button={textContent:'',disabled:false};const h={dataset:{taskTimer:t.id,timerDate:d,timerMinutes:String(t.minutes)},querySelector:s=>({'[data-timer-clock]':clock,'[data-timer-status]':status,'[data-timer-action]':button})[s],clock,status,button};hosts.push(h);return h;}
  return {manager,storage,values,writes,reads,context,app,host,intervals,listeners,advance:ms=>{time+=ms},protectedData};
}

test('timers start only on request and never read/write learning records',()=>{
  const f=fixture(),m=f.manager();assert.equal(m.view(date,task).state,'ready');assert.equal(m.view(date,task).remainingMs,1800000);
  f.advance(90000);m.refresh();assert.equal(m.view(date,task).remainingMs,1800000);assert.deepEqual(f.writes,[]);
  m.act(date,task);assert.equal(m.view(date,task).state,'running');f.advance(12500);assert.equal(m.view(date,task).remainingMs,1787500);
  assert.ok(f.reads.every(k=>k===KEY));assert.ok(f.writes.every(k=>k===KEY));assert.deepEqual(f.protectedData,{grade:37,draft:'unfinished answer',firstAt:'original',completed:[]});
});
test('pause/resume preserves elapsed time instead of restoring the planned duration',()=>{
  const f=fixture(),m=f.manager();m.act(date,task);f.advance(125000);m.act(date,task);
  assert.equal(m.view(date,task).state,'paused');assert.equal(m.view(date,task).remainingMs,1675000);
  f.advance(3600000);assert.equal(m.view(date,task).remainingMs,1675000);m.act(date,task);f.advance(25000);assert.equal(m.view(date,task).remainingMs,1650000);
});
test('reload and date/page changes restore elapsed time without creating fresh timers',()=>{
  const f=fixture(),m=f.manager();m.act(date,task);f.advance(20000);
  const reloaded=f.manager();assert.equal(reloaded.view(date,task).remainingMs,1780000);assert.equal(reloaded.view(date,task).state,'running');
  assert.equal(reloaded.view('2026-10-20',task).state,'ready');assert.equal(reloaded.view(date,{...task,minutes:99}).remainingMs,1780000);
  reloaded.act('2026-10-20',task);f.advance(10000);assert.equal(reloaded.view(date,task).state,'paused');assert.equal(reloaded.view(date,task).remainingMs,1780000);assert.equal(reloaded.view('2026-10-20',task).remainingMs,1790000);
});
test('starting another task pauses the original, including after another tab writes',()=>{
  const f=fixture(),a=f.manager(),b=f.manager();a.act(date,task);f.advance(30000);b.act(date,second);a.refresh();
  assert.equal(a.view(date,task).state,'paused');assert.equal(a.view(date,task).remainingMs,1770000);assert.equal(a.view(date,second).state,'running');
  f.advance(10000);a.act(date,task);b.refresh();assert.equal(b.view(date,second).state,'paused');assert.equal(b.view(date,second).remainingMs,1190000);
});
test('expiry survives reload and is irreversible through all public actions',()=>{
  const f=fixture(),m=f.manager();m.act(date,task);f.advance(1800100);m.refresh();
  for(let i=0;i<3;i++){m.act(date,task);assert.equal(m.view(date,task).state,'done');assert.equal(m.view(date,task).remainingMs,0)}
  const reloaded=f.manager();reloaded.act(date,{...task,minutes:45});assert.equal(reloaded.view(date,task).remainingMs,0);assert.equal(reloaded.view(date,task).state,'done');
  assert.deepEqual(Object.keys(m).sort(),['act','refresh','view']);assert.doesNotMatch(source,/removeItem|clear\(|reset\s*\(|restart\s*\(/);
});
test('a suspended/background page counts elapsed wall time and clamps at zero',()=>{
  const f=fixture(),m=f.manager();m.act(date,task);f.advance(7200000);assert.equal(m.view(date,task).remainingMs,0);m.refresh();
  assert.equal(JSON.parse(f.values.get(KEY)).entries[date+'|words'].startedAt,null);assert.deepEqual(f.protectedData.completed,[]);
});
test('corrupt timer data is preserved and disables only timers',()=>{
  for(const raw of ['not json',JSON.stringify({version:1,entries:{[date+'|words']:{durationMs:60000,remainingMs:-2,startedAt:null}}})]){
    const f=fixture({[KEY]:raw}),m=f.manager();assert.ok(m.view(date,task).warning);m.act(date,task);m.refresh();assert.equal(f.values.get(KEY),raw);assert.deepEqual(f.writes,[]);
  }
});
test('read/write storage failure is visible and does not silently reset state',()=>{
  const f=fixture(),unavailable=f.context.api.createTaskCountdowns({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});
  unavailable.act(date,task);assert.ok(unavailable.view(date,task).warning);
  const full=f.context.api.createTaskCountdowns({getItem(){return null},setItem(){throw Error('quota')}},()=>1000);full.act(date,task);assert.match(full.view(date,task).warning,/无法保存/);
});
test('externally corrupted records are not overwritten when an in-memory timer expires',()=>{
  const f=fixture(),m=f.manager();m.act(date,task);const saved=f.writes.length;
  f.values.set(KEY,'corrupt original record');f.advance(1800001);m.refresh();m.act(date,task);m.refresh();
  assert.ok(m.view(date,task).warning);assert.equal(f.values.get(KEY),'corrupt original record');assert.equal(f.writes.length,saved);
});
test('invalid tasks cannot create persistent entries',()=>{
  const f=fixture(),m=f.manager();for(const t of [{...task,minutes:0},{...task,minutes:NaN},{...task,id:'../words'}]){m.act(date,t);assert.equal(m.view(date,t),null)}
  m.act('bad',task);assert.equal(m.view('bad',task),null);assert.deepEqual(f.writes,[]);
});
test('actual control handlers show start/pause/resume/end and never reset',()=>{
  const f=fixture(),h=f.host(),api=f.context.api;api.updateTaskTimerDisplays();assert.equal(h.clock.textContent,'30:00');assert.equal(h.button.textContent,'开始');
  h.button.onclick({stopPropagation(){}});assert.equal(h.button.textContent,'暂停');f.advance(65000);api.updateTaskTimerDisplays();assert.equal(h.clock.textContent,'28:55');
  h.button.onclick({stopPropagation(){}});assert.equal(h.button.textContent,'继续');f.advance(60000);api.updateTaskTimerDisplays();assert.equal(h.clock.textContent,'28:55');
  h.button.onclick({stopPropagation(){}});f.advance(1800000);api.updateTaskTimerDisplays();assert.equal(h.clock.textContent,'00:00');assert.equal(h.button.disabled,true);assert.equal(h.button.textContent,'已结束');assert.match(h.status.textContent,/不自动标记完成/);
  h.button.onclick({stopPropagation(){}});assert.equal(h.clock.textContent,'00:00');
});
test('timer markup has no nested button or reset and module task filters are independent',()=>{
  const f=fixture(),api=f.context.api,html=api.taskTimerHtml(task,true);assert.equal((html.match(/<button/g)||[]).length,1);assert.match(html,/词汇/);assert.doesNotMatch(html,/data-(?:reset|restart)/);
  const L={tasks:[task,{...second,tab:'practice'},{id:'grammar',minutes:15,label:'语法',tab:'practice'},{id:'sentences',minutes:20,label:'长难句',tab:'practice'}]};
  f.context.tab='practice';api.bindTaskTimers(L);assert.equal((f.app.inserted[0][1].match(/data-task-timer=/g)||[]).length,3);
  f.context.tab='plan';api.bindTaskTimers(L);assert.equal(f.app.inserted.length,1);
  for(const name of ['renderPlan','renderWords','renderListening','renderExtensive','renderPractice','renderRecords']){const start=template.indexOf('function '+name+'('),end=template.indexOf('\n    function ',start+10);assert.ok(template.slice(start,end<0?undefined:end).includes('bindTaskTimers(L)'),name+' timer binding');}
  assert.match(template,/data-design-task-list/);assert.match(template,/class="task-route-item" data-design-task/);
});
test('wake, tab visibility and shared timer storage events refresh only countdowns',()=>{
  const f=fixture();f.context.api.installTaskTimers();assert.equal(f.intervals.length,1);assert.equal(f.intervals[0][1],1000);
  const h=f.host();f.context.api.updateTaskTimerDisplays();h.button.onclick({});f.advance(60000);f.listeners.visibilitychange();assert.equal(h.clock.textContent,'29:00');
  f.advance(60000);f.listeners.pageshow();assert.equal(h.clock.textContent,'28:00');f.listeners.storage({key:KEY});assert.equal(h.clock.textContent,'28:00');assert.equal(f.protectedData.grade,37);
});
