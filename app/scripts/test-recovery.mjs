import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { RECOVERY } from '../lib/recovery-data.mjs';
import { loadCurriculum } from '../lib/load-curriculum.mjs';
import { buildRecoveryLesson, blankProgress, recordFirstAttempt, mergeLegacyStores, assessSentence, assessTranslation, readiness, courseDay, phaseFor, chooseDailyLesson, hasAnswerWork, lessonFingerprint, RECOVERY_STORAGE_KEY, OLD_PROGRESS_KEYS } from '../lib/study-engine.mjs';
import { prepareStandalone } from './generate-standalone.mjs';

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'public','六级学习工具.html'),'utf8');
const DATA=JSON.parse(html.match(/const DATA=([\s\S]*?); const RECOVERY=/)[1]);
const dateAt=n=>new Date(Date.UTC(2026,7,28+n)).toISOString().slice(0,10);
const clone=x=>JSON.parse(JSON.stringify(x));

test('14 complete lessons have bilingual material, IPA and valid answers',()=>{
  assert.equal(RECOVERY.lessons.length,14);
  assert.equal(RECOVERY.words.length,96);
  assert.equal(new Set(RECOVERY.words.map(x=>x.word)).size,96);
  for(const w of RECOVERY.words){assert.match(w.phonetic,/^\/.+\/$/);assert.ok(w.meaning&&w.example&&w.exampleZh)}
  const titles=new Set();
  for(let i=0;i<14;i++){
    const L=buildRecoveryLesson(DATA,RECOVERY,dateAt(i));titles.add(L.reading.title);
    assert.equal(L.nw.length,[6,13].includes(i)?0:8);
    assert.equal(L.rev.length,12);assert.equal(L.quizWords.length,12);
    assert.equal(new Set(L.all.map(w=>w.word)).size,L.all.length);
    assert.equal(new Set(L.quizWords.map(w=>w.word)).size,12);
    assert.equal(L.grammar.length,6);assert.equal(L.reading.questions.length,4);
    assert.equal(L.listening.questions.length,2);assert.equal(L.listening.dictation.length,2);
    assert.equal(L.sent.length,1);assert.equal(L.trans.length,2);
    const wc=L.reading.passage.split(/\s+/).length;assert.ok(wc>=80&&wc<=150,`reading day ${i+1}: ${wc}`);
    const lc=L.listening.passage.split(/\s+/).length;assert.ok(lc>=35&&lc<=90,`listening day ${i+1}: ${lc}`);
    for(const q of [...L.grammar,...L.reading.questions,...L.listening.questions]){
      assert.ok(q.prompt&&q.promptZh&&q.explanation);
      assert.equal(q.options.length,q.optionsZh.length);
      assert.ok(q.answer>=0&&q.answer<q.options.length);
    }
    for(const x of L.sent)assert.equal(assessSentence(x,x.main,x.translation).ok,true);
    for(const x of L.trans)for(const a of x.acceptedAnswers)assert.equal(assessTranslation(x,a).ok,true);
  }
  assert.equal(titles.size,14);
  assert.ok(buildRecoveryLesson(DATA,RECOVERY,dateAt(0)).quizWords.some(w=>w.word==='improve'));
  assert.ok(buildRecoveryLesson(DATA,RECOVERY,dateAt(0)).quizWords.some(w=>w.word==='think'));
});

test('weekday/weekend budget, weekly tests, dates and roadmap',()=>{
  assert.equal(courseDay('2026-08-28'),0);assert.equal(courseDay('2026-09-10'),13);
  assert.equal(buildRecoveryLesson(DATA,RECOVERY,'2026-08-27'),null);
  for(let i=0;i<14;i++){
    const k=dateAt(i),L=buildRecoveryLesson(DATA,RECOVERY,k),wk=[0,6].includes(new Date(k).getUTCDay());
    assert.equal(L.tasks.reduce((s,t)=>s+t.minutes,0),wk?180:120);
    assert.equal(L.tasks.at(-1).minutes,10);
    assert.equal(L.weekly,(i+1)%7===0);
    if(L.weekly)assert.equal(L.nw.length,0);
    assert.equal(L.rev.length,12);
  }
  const pending=buildRecoveryLesson(DATA,RECOVERY,'2026-09-11');
  assert.equal(pending.unprepared,true);assert.equal(pending.freshMaterial,false);
  assert.equal(pending.reading.passage,'');assert.equal(pending.listening.passage,'');
  assert.equal(phaseFor('2026-10-01').name,'六级专项');
  assert.equal(phaseFor('2026-12-01').name,'模考与查漏补缺');
});

test('a seven-day window has different actual reading/listening passages and matching local copies',async()=>{
  const p=await prepareStandalone('2026-08-30');
  assert.equal(p.release.days.length,7);
  assert.equal(new Set(p.release.days.map(d=>d.readingHash)).size,7);
  assert.equal(new Set(p.release.days.map(d=>d.listeningHash)).size,7);
  assert.equal(new Set(p.release.days.map(d=>d.courseHash)).size,7);
  assert.deepEqual(p.release.duplicateCourse,[]);
  assert.deepEqual(p.release.dateMismatches,[]);
  assert.deepEqual(p.release.missingDates,[]);
  assert.equal(fs.readFileSync(path.join(root,'../六级学习工具.html'),'utf8'),html);
  const dist=path.join(root,'dist','client','六级学习工具.html');
  if(fs.existsSync(dist))assert.equal(fs.readFileSync(dist,'utf8'),html);
  assert.ok(html.includes('七天课程一览'));
  assert.ok(html.includes('window.__CET6ReceiveRelease'));
});

test('every rolling seven-day window through September is complete and fully distinct',async()=>{
  const curriculum=loadCurriculum();
  const dated=Object.values(curriculum.datedLessons),datedWords=dated.flatMap(x=>x.words);
  assert.equal(dated.length,20);assert.equal(new Set(datedWords.map(w=>w.word)).size,datedWords.length);
  assert.equal(new Set(dated.map(x=>x.title)).size,dated.length);
  assert.equal(new Set(dated.map(x=>x.reading.passage)).size,dated.length);
  assert.equal(new Set(dated.map(x=>x.listening.passage)).size,dated.length);
  for(let day=11;day<=30;day++){
    const date=`2026-09-${String(day).padStart(2,'0')}`,L=buildRecoveryLesson(DATA,curriculum,date);
    assert.equal(L.unprepared,undefined);assert.equal(L.freshMaterial,true);
    assert.equal(L.nw.length,[17,24].includes(day)?0:8);
    assert.equal(L.rev.length,12);assert.equal(L.grammar.length,6);
    assert.equal(L.reading.questions.length,4);assert.equal(L.listening.questions.length,2);
    assert.equal(L.listening.dictation.length,2);assert.equal(L.sent.length,1);assert.equal(L.trans.length,2);
    assert.ok(L.reading.passage.split(/\s+/).length>=110&&L.reading.passage.split(/\s+/).length<=170);
    assert.ok(L.listening.passage.split(/\s+/).length>=45&&L.listening.passage.split(/\s+/).length<=90);
    for(const w of L.nw){assert.match(w.phonetic,/^\/.+\/$/);assert.ok(w.meaning&&w.example&&w.exampleZh)}
    for(const q of [...L.grammar,...L.reading.questions,...L.listening.questions]){
      assert.ok(q.prompt&&q.promptZh&&q.explanation);assert.equal(q.options.length,q.optionsZh.length);
      assert.ok(q.answer>=0&&q.answer<q.options.length);
    }
    for(const x of L.sent)assert.equal(assessSentence(x,x.main,x.translation).ok,true);
    for(const x of L.trans)for(const answer of x.acceptedAnswers)assert.equal(assessTranslation(x,answer).ok,true);
  }
  for(let day=11;day<=27;day++){
    const date=`2026-09-${String(day).padStart(2,'0')}`,p=await prepareStandalone(date);
    assert.deepEqual(p.release.missingDates,[],date);
    assert.deepEqual(p.release.duplicateReading,[],date);
    assert.deepEqual(p.release.duplicateListening,[],date);
    assert.deepEqual(p.release.duplicateCourse,[],date);
    assert.deepEqual(p.release.dateMismatches,[],date);
  }
});

test('answered snapshots are reused only for the same date and exact course content',()=>{
  const fresh=buildRecoveryLesson(DATA,RECOVERY,'2026-08-30'),old=clone(fresh);
  const p={...blankProgress(),notes:'必须保留的难点',lessonSnapshot:old,draft:{ls:{show:true}}};
  assert.equal(hasAnswerWork(p),false);assert.equal(chooseDailyLesson('2026-08-30',p,fresh).title,fresh.title);
  p.draft.ws={input:'time'};assert.equal(chooseDailyLesson('2026-08-30',p,fresh),old);
  const next=buildRecoveryLesson(DATA,RECOVERY,'2026-08-31'),dateMismatch=chooseDailyLesson('2026-08-31',p,next);
  assert.equal(dateMismatch.cacheDateMismatch,true);assert.equal(dateMismatch.title,next.title);
  const changed={...old,title:'旧预览'};delete changed.contentSignature;
  p.lessonSnapshot=changed;
  const contentMismatch=chooseDailyLesson('2026-08-30',p,fresh);
  assert.equal(contentMismatch.cacheContentMismatch,true);assert.equal(contentMismatch.title,fresh.title);
  assert.equal(p.notes,'必须保留的难点');
});

test('fixed course signature does not drift when adaptive review history changes',()=>{
  const date='2026-09-07',plain=buildRecoveryLesson(DATA,RECOVERY,date);
  const adaptive=buildRecoveryLesson(DATA,RECOVERY,date,{'2026-09-06':{...blankProgress(),wordErrors:['assess']}});
  assert.notDeepEqual(plain.rev.map(x=>x.word),adaptive.rev.map(x=>x.word));
  assert.equal(plain.contentSignature,adaptive.contentSignature);
  const edited=clone(plain);edited.reading.passage+=' Material revision.';delete edited.contentSignature;
  assert.notEqual(lessonFingerprint(edited),plain.contentSignature);
  const editedWord=clone(plain);editedWord.sourceWords[0].meaning+='（已修订）';delete editedWord.contentSignature;
  assert.notEqual(lessonFingerprint(editedWord),plain.contentSignature);
});

test('one polluted snapshot cannot make a seven-day window render as one repeated course',()=>{
  const old=buildRecoveryLesson(DATA,RECOVERY,'2026-09-04'),shown=[];
  for(let i=0;i<7;i++){
    const date=dateAt(7+i),fresh=buildRecoveryLesson(DATA,RECOVERY,date);
    const progress={...blankProgress(),wordCorrect:0,wordTotal:1,lessonSnapshot:clone(old),attempts:{'word:old:0':{group:'word',correct:false}}};
    const current=chooseDailyLesson(date,progress,fresh);shown.push(current);
    assert.equal(progress.wordTotal,1);assert.equal(lessonFingerprint(current),lessonFingerprint(fresh));
  }
  assert.equal(new Set(shown.map(x=>x.title)).size,7);
  assert.equal(new Set(shown.map(x=>x.reading.passage)).size,7);
});

test('unresolved errors use spaced dates and rotate the first priority word',()=>{
  const errors=['organize','information','difficulty','discipline','diverse','domestic','assess'];
  const a=buildRecoveryLesson(DATA,RECOVERY,'2026-08-30',{'2026-08-29':{...blankProgress(),wordErrors:errors}});
  const b=buildRecoveryLesson(DATA,RECOVERY,'2026-08-31',{'2026-08-30':{...blankProgress(),wordErrors:errors}});
  assert.equal(a.priorityErrors.length,4);assert.equal(b.priorityErrors.length,4);
  assert.notDeepEqual(a.priorityErrors,b.priorityErrors);
  assert.notEqual(a.rev[0].word,b.rev[0].word);
  assert.equal(a.rev.length,12);assert.equal(a.rev.filter(w=>errors.includes(w.word)).length,4);
  const notDue=buildRecoveryLesson(DATA,RECOVERY,'2026-09-01',{'2026-08-30':{...blankProgress(),wordErrors:errors}});
  assert.deepEqual(notDue.priorityErrors,[]);
  assert.notDeepEqual(a.nw.map(w=>w.word),b.nw.map(w=>w.word));
});

test('one old assess error is not forced into the first word every day',()=>{
  const history={'2026-08-31':{...blankProgress(),wordErrors:['assess']}};
  const dates=['2026-09-01','2026-09-02','2026-09-03','2026-09-04','2026-09-05','2026-09-06','2026-09-07'];
  const lessons=dates.map(date=>buildRecoveryLesson(DATA,RECOVERY,date,history));
  assert.deepEqual(lessons.map(x=>x.priorityErrors.includes('assess')),[true,false,true,false,false,false,true]);
  assert.ok(lessons.some(x=>x.rev[0].word!=='assess'));
});

test('legacy migration keeps old dates, notes and first scores without mutation',()=>{
  const stores={
    [OLD_PROGRESS_KEYS[2]]:JSON.stringify({'2026-08-25':{wordTotal:4,wordCorrect:2,notes:'旧难点'}}),
    [OLD_PROGRESS_KEYS[1]]:JSON.stringify({'2026-08-26':{quizTotal:8,quizCorrect:6}}),
    [OLD_PROGRESS_KEYS[0]]:JSON.stringify({'2026-08-28':{wordTotal:12,wordCorrect:9,wordErrors:['improve']}})
  };
  const before=JSON.stringify(stores),out=mergeLegacyStores(k=>stores[k]);
  assert.equal(out['2026-08-25'].notes,'旧难点');assert.equal(out['2026-08-28'].wordCorrect,9);
  assert.equal(JSON.stringify(stores),before);
  assert.throws(()=>mergeLegacyStores(()=>'{broken'));
});

test('first attempt is immutable across corrections and metrics remain separate',()=>{
  const p=blankProgress(),wrong=recordFirstAttempt(p,'word','day:1',false,{targetWord:'improve',answer:'imporve',tag:'spelling'});
  assert.equal(p.wordTotal,0);assert.equal(wrong.wordTotal,1);assert.equal(wrong.wordCorrect,0);
  const retry=recordFirstAttempt(wrong,'word','day:1',true,{targetWord:'improve'});
  assert.equal(retry.wordTotal,1);assert.equal(retry.wordCorrect,0);assert.equal(retry.errorDetails.length,1);
  let r=recordFirstAttempt(retry,'grammar','day:g0',true);
  r=recordFirstAttempt(r,'reading','day:r0',false);
  r=recordFirstAttempt(r,'listeningChoice','day:l0',true);
  r=recordFirstAttempt(r,'dictation','day:d0',false,{expected:'I think listening is difficult.'});
  assert.equal(r.grammarCorrect,1);assert.equal(r.readingCorrect,0);
  assert.equal(r.quizTotal,2);assert.equal(r.quizCorrect,1);
  assert.equal(r.listeningChoiceCorrect,1);assert.equal(r.listeningCorrect,0);
  assert.equal(r.listeningErrors.length,1);
});

test('wrong words return on D1/D3/D7/D14; later first-try success resolves priority',()=>{
  const history={'2026-08-28':{...blankProgress(),wordErrors:['improve','enough'],lessonSnapshot:buildRecoveryLesson(DATA,RECOVERY,'2026-08-28')}};
  const before=JSON.stringify(history);
  const next=buildRecoveryLesson(DATA,RECOVERY,'2026-08-29',history);
  assert.deepEqual(new Set(next.rev.slice(0,2).map(x=>x.word)),new Set(['improve','enough']));
  assert.equal(next.rev.length,12);assert.equal(next.nw.length,8);
  const between=buildRecoveryLesson(DATA,RECOVERY,'2026-08-30',history);
  assert.deepEqual(between.priorityErrors,[]);
  const later=buildRecoveryLesson(DATA,RECOVERY,'2026-08-31',history);
  assert.ok(later.priorityErrors.includes('improve'));
  assert.ok(later.all.some(x=>x.word==='enough')); // Today it is already in the activation pack, so do not count it twice.
  assert.equal(JSON.stringify(history),before);
  history['2026-08-29']=recordFirstAttempt(blankProgress(),'word','day:0',true,{targetWord:'improve'});
  const corrected=buildRecoveryLesson(DATA,RECOVERY,'2026-08-31',history);
  assert.deepEqual(corrected.priorityErrors,['enough']);
});

test('readiness uses sufficient completed data, not diagnostic guesses or future work',()=>{
  const empty=readiness({},'2026-09-11');assert.equal(empty.advance,false);assert.equal(empty.rates.word.rate,null);
  const h={};
  for(const k of ['2026-09-08','2026-09-09','2026-09-10'])h[k]={...blankProgress(),lessonSnapshot:{recovery:true},wordTotal:12,wordCorrect:10,grammarTotal:6,grammarCorrect:5,readingTotal:4,readingCorrect:3,listeningChoiceTotal:2,listeningChoiceCorrect:2};
  assert.equal(readiness(h,'2026-09-11').advance,true);
  const withDated={...RECOVERY,datedLessons:{'2026-09-11':clone(RECOVERY.lessons[0])}};
  assert.equal(buildRecoveryLesson(DATA,withDated,'2026-09-11',h).foundation,false);
  const future={'2026-09-12':h['2026-09-10']};assert.equal(readiness(future,'2026-09-11').enough,false);
  h['2026-09-10'].grammarCorrect=0;assert.equal(readiness(h,'2026-09-11').advance,false);
});

test('sentence and translation rules catch current gaps and accept supplied alternatives',()=>{
  const s=RECOVERY.lessons[0].sent,t=RECOVERY.lessons[0].trans;
  assert.equal(assessSentence(s,'Students sleep',s.translation).ok,false);
  assert.equal(assessSentence(s,s.main,s.translation).ok,true);
  for(const x of t){assert.equal(assessTranslation(x,x.answer).ok,true);assert.equal(assessTranslation(x,'').ok,false)}
  const x=RECOVERY.lessons[10].trans[0];
  assert.equal(assessTranslation(x,'I think practice important.').ok,false);
  assert.equal(assessTranslation(x,'I think practice is important.').ok,true);
});

function runtime(initial={},browserMode=false){
  const saved=new Map(Object.entries(initial)),elements=new Map(),spoken=[],timers=[];
  const session=new Map(),events={},beacons=[];let reloadCount=0;
  let now=Date.parse('2026-08-28T15:59:30Z');
  class TestDate extends Date {constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
  const element=id=>{if(!elements.has(id))elements.set(id,{id,innerHTML:'',textContent:'',value:'',disabled:false,dataset:{}});return elements.get(id)};
  const document={getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>({click(){},remove(){}}),head:{appendChild:s=>beacons.push(s)},addEventListener:(name,fn)=>events[name]=fn,hidden:false};
  const location={href:'file:///D:/CET6-500-Study-Tool/六级学习工具.html',protocol:'file:',hostname:'',reload:()=>reloadCount++};
  location.replace=url=>{location.href=url;reloadCount++};
  const window={location,addEventListener:(name,fn)=>events[name]=fn};
  const context=vm.createContext({...(browserMode?{window,sessionStorage:{getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)}}:{}),Date:TestDate,document,app:element('app'),checkListen:element('checkListen'),listenRateLabel:element('listenRateLabel'),localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},alert:m=>{throw new Error(m)},setInterval:fn=>timers.push(fn),setTimeout(){},speechSynthesis:{cancel(){},getVoices(){return[]},speak:u=>spoken.push(u)},SpeechSynthesisUtterance:function(t){this.text=t},Blob,URL,console});
  let code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
  const marker='reset();render();setInterval';assert.ok(code.includes(marker));
  code=code.replace(marker,'globalThis.studyTest={lesson,progress,rawProgress,courseKey,record,save,reset,render,renderWords,renderListening,renderPractice,renderRecords,persistDraft,speak,seven,checkLocalRelease,state:()=>({ws,ls,ps,rate,selected,today}),setDate:k=>{selected=k;reset()},setTab:k=>{tab=k}};reset();render();setInterval');
  vm.runInContext(code,context);
  return {api:context.studyTest,saved,element,spoken,window,events,session,beacons,reloads:()=>reloadCount,advanceTime:iso=>{now=Date.parse(iso);timers.forEach(fn=>fn())}};
}

test('a local release update waits for typing, uses a versioned URL, preserves work and caps retries',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-08-28');
  rt.api.record('word',0,false,{targetWord:'improve'});
  rt.api.state().ws.input='imporve';rt.api.persistDraft();
  rt.events.input();rt.window.__CET6ReceiveRelease({buildId:'next-local-version'});
  assert.equal(rt.reloads(),0);
  rt.advanceTime('2026-08-28T15:59:46Z');
  rt.window.__CET6ReceiveRelease({buildId:'next-local-version'});
  assert.equal(rt.reloads(),1);assert.equal(rt.api.progress().wordCorrect,0);assert.equal(rt.api.progress().wordTotal,1);
  assert.equal(rt.api.progress().draft.ws.input,'imporve');
  assert.equal(JSON.parse(rt.session.get('cet6-view-after-update')).date,'2026-08-28');
  assert.ok(rt.beacons[0].src.startsWith('file:///D:/CET6-500-Study-Tool/study-release.js?'));
  assert.match(rt.window.location.href,/course-build=next-local-version/);
  rt.window.__CET6ReceiveRelease({buildId:'next-local-version'});assert.equal(rt.reloads(),2);
  rt.window.__CET6ReceiveRelease({buildId:'next-local-version'});assert.equal(rt.reloads(),3);
  rt.window.__CET6ReceiveRelease({buildId:'next-local-version'});assert.equal(rt.reloads(),3);
});

test('a manual release check waits for the version script before continuing',()=>{
  const rt=runtime({},true);let result=null;
  rt.api.checkLocalRelease(ok=>{result=ok});const script=rt.beacons.at(-1);
  assert.ok(script);assert.equal(result,null);assert.equal(rt.reloads(),0);
  rt.window.__CET6ReceiveRelease({buildId:'manual-next-version'});
  assert.equal(rt.reloads(),0);script.onload();assert.equal(result,true);
});

test('China midnight refresh changes the day without deleting saved work or interrupting a chosen history date',()=>{
  const rt=runtime();assert.equal(rt.api.state().today,'2026-08-28');
  rt.api.save({notes:'午夜前的记录'});
  rt.advanceTime('2026-08-28T16:01:00Z');
  assert.equal(rt.api.state().today,'2026-08-29');assert.equal(rt.api.state().selected,'2026-08-29');
  assert.equal(rt.api.progress('2026-08-28').notes,'午夜前的记录');
  assert.equal(rt.api.lesson().tasks.reduce((n,t)=>n+t.minutes,0),180);
  rt.api.setDate('2026-08-28');rt.advanceTime('2026-08-29T16:01:00Z');
  assert.equal(rt.api.state().today,'2026-08-30');assert.equal(rt.api.state().selected,'2026-08-28');
});

test('generated offline runtime starts, saves drafts, reloads and does not overwrite old same-day records',()=>{
  const legacy=JSON.stringify({'2026-08-28':{wordCorrect:9,wordTotal:12,notes:'原来记录',wordErrors:['think']}});
  let rt=runtime({[OLD_PROGRESS_KEYS[0]]:legacy});rt.api.setDate('2026-08-28');rt.api.renderWords(rt.api.lesson());
  assert.equal(rt.api.lesson().nw.length,8);assert.equal(rt.api.seven().length,7);
  rt.element('wordInput').oninput({target:{value:'wrong'}});
  rt.element('meaningInput').oninput({target:{value:'不会'}});
  rt.element('checkWord').onclick();
  assert.equal(rt.api.progress().wordTotal,1);assert.equal(rt.api.progress().wordCorrect,0);
  assert.equal(rt.saved.get(OLD_PROGRESS_KEYS[0]),legacy);
  assert.equal(rt.api.progress().draft.ws.phase,'hint');
  const initial=Object.fromEntries(rt.saved);rt=runtime(initial);rt.api.setDate('2026-08-28');
  assert.equal(rt.api.state().ws.input,'wrong');assert.equal(rt.api.state().ws.phase,'hint');
  const frozen=JSON.stringify(rt.api.lesson());
  rt.api.save({notes:'恢复版共同难点'});
  assert.equal(JSON.stringify(rt.api.lesson()),frozen);
  rt.api.renderWords(rt.api.lesson());const target=rt.api.lesson().quizWords[0];
  rt.element('wordInput').oninput({target:{value:target.word}});
  rt.element('meaningInput').oninput({target:{value:target.meaning}});
  rt.element('checkWord').onclick();
  assert.equal(rt.api.state().ws.phase,'correct');assert.equal(rt.api.progress().wordCorrect,0);assert.equal(rt.api.progress().wordTotal,1);
  rt.element('nextWord').onclick();assert.equal(rt.api.state().ws.i,1);
  rt.api.setTab('records');rt.api.render();assert.match(rt.element('app').innerHTML,/原来记录/);
  assert.ok(rt.saved.has(RECOVERY_STORAGE_KEY));
});

test('a corrected same-date course gets a clean score bucket while old work remains archived',()=>{
  const date='2026-08-28',current=buildRecoveryLesson(DATA,RECOVERY,date),old=clone(current);
  old.title='旧版重复课程';old.contentSignature='old-content-signature';
  const oldAttempt='word:'+old.id+':0',stored={...blankProgress(),lessonSnapshot:old,completed:['words'],wordCorrect:1,wordTotal:1,attempts:{[oldAttempt]:{group:'word',correct:true,targetWord:'assess'}},notes:'旧难点'};
  const rt=runtime({[RECOVERY_STORAGE_KEY]:JSON.stringify({[date]:stored})});rt.api.setDate(date);
  assert.equal(rt.api.lesson().cacheContentMismatch,true);
  assert.equal(rt.api.progress().wordTotal,0);assert.equal(rt.api.progress().completed.length,0);
  rt.api.record('word',0,false,{targetWord:current.quizWords[0].word,answer:'x'});
  assert.equal(rt.api.progress().wordTotal,1);assert.equal(rt.api.progress().wordCorrect,0);
  const raw=rt.api.rawProgress(),keys=Object.keys(raw.attempts);
  assert.equal(keys.length,1);assert.match(keys[0],new RegExp(current.contentSignature));
  assert.equal(raw.snapshotArchive.length,1);assert.equal(raw.snapshotArchive[0].progress.wordTotal,1);
  assert.ok(raw.snapshotArchive[0].progress.attempts[oldAttempt]);
  assert.equal('snapshot' in raw.snapshotArchive[0],false);assert.equal(raw.notes,'旧难点');
});

test('synthetic listening and practice submissions save distinct results and preserve retries',()=>{
  const rt=runtime();rt.api.setDate('2026-08-28');const L=rt.api.lesson();
  rt.api.renderListening(L);
  rt.element('listenInput').oninput({target:{value:'wrong sentence'}});rt.element('checkListen').onclick();
  assert.equal(rt.api.progress().listeningTotal,1);assert.equal(rt.api.progress().listeningCorrect,0);
  rt.element('listenInput').oninput({target:{value:L.listening.dictation[0]}});rt.element('checkListen').onclick();
  assert.equal(rt.api.progress().listeningTotal,1);assert.equal(rt.api.progress().listeningCorrect,0);
  rt.element('listenRate').oninput({target:{value:'0.7'}});rt.api.speak('test');assert.equal(rt.spoken.at(-1).rate,.7);
  const state=rt.api.state();L.listening.questions.forEach((q,i)=>state.ls.answers[i]=q.answer);
  rt.element('submitListen').onclick();assert.equal(rt.api.progress().listeningChoiceTotal,2);
  rt.api.renderPractice(L);
  [...L.grammar,...L.reading.questions].forEach((q,i)=>rt.api.state().ps.answers[i]=q.answer);
  rt.element('submitPractice').onclick();
  assert.equal(rt.api.progress().grammarTotal,6);assert.equal(rt.api.progress().readingTotal,4);
  assert.equal(rt.api.progress().quizCorrect,10);
  rt.element('submitPractice').onclick();assert.equal(rt.api.progress().quizTotal,10);
  const next=runtime(Object.fromEntries(rt.saved));next.api.setDate('2026-08-28');
  assert.equal(next.api.state().ps.submitted,true);assert.equal(next.api.progress().readingCorrect,4);
});
