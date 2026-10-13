import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {prepareStandalone} from './generate-standalone.mjs';
import {loadCurriculum} from '../lib/load-curriculum.mjs';
import {addStudyReviewVocabulary,addUserVocabulary,normalizeUserVocabulary,removeUserVocabulary,reviewUserVocabulary,buildRecoveryLesson,makeWordRound,chooseDailyLesson,blankProgress} from '../lib/study-engine.mjs';
import {wordLearningSchedule,recordWordReviewEvent,reconcileDailyWordRound} from '../lib/study-engine.mjs';

const prepared=await prepareStandalone('2026-10-07');
const html=prepared.files.find(([name])=>name.endsWith('.html'))[1];
const DATA=JSON.parse(html.match(/const DATA=([\s\S]*?); const RECOVERY=/)[1]);
const curriculum=loadCurriculum();
const day=(date,history={},vocab={})=>buildRecoveryLesson(DATA,curriculum,date,history,vocab);
const word=day('2026-10-07').nw[0];
const names=rows=>rows.map(w=>w.word);

test('an overdue cohort no longer occupies the identical review list on consecutive dates',()=>{
  const words=day('2026-10-02').nw;
  const history={'2026-10-02':{wordPractice:{daily:{results:Object.fromEntries(words.map(w=>[w.word,{correct:true,at:'2026-10-02T03:00:00Z'}]))}}}};
  const before=JSON.stringify(history),a=day('2026-10-13',history),b=day('2026-10-14',history),c=day('2026-10-15',history);
  assert.equal(a.rev.length,18);assert.equal(b.rev.length,18);assert.equal(c.rev.length,40);
  assert.notDeepEqual(names(a.rev),names(b.rev));
  assert.equal(b.rev.filter(w=>a.rev.some(x=>x.word===w.word)).length,0,'unanswered offers rest while other due words take their places');
  assert.ok(words.every(w=>[...a.rev,...b.rev,...c.rev].some(x=>x.word===w.word)),'the tail is not starved');
  assert.deepEqual(day('2026-10-13',history).rev,a.rev,'reverse preview does not consume or mutate the schedule');
  assert.equal(JSON.stringify(history),before);
  assert.equal(wordLearningSchedule(history,'2026-10-15').get(words[0].word).lastDate,'2026-10-02','offers never count as successful reviews');
});

test('all yesterday errors take priority within capacity; old successes and future due words do not return',()=>{
  const words=day('2026-10-11').nw,errors=words.map(w=>w.word),history={};
  history['2026-10-15']={wordPractice:{daily:{results:Object.fromEntries(errors.map(word=>[word,{correct:false,at:'2026-10-12T03:00:00Z'}]))}}};
  const next=day('2026-10-13',history);
  assert.equal(next.rev.length,18);assert.ok(next.rev.every(w=>errors.includes(w.word)));
  assert.equal(next.priorityErrors.length,18);
  const rest=day('2026-10-14',history);assert.ok(errors.filter(w=>!names(next.rev).includes(w)).every(w=>names(rest.rev).includes(w)));
  const target=next.rev[0].word;
  history['2026-10-13']=recordWordReviewEvent({},target,true,'2026-10-13T03:00:00Z');
  assert.equal(wordLearningSchedule(history,'2026-10-14').get(target).dueDate,'2026-10-15');
  assert.ok(!names(day('2026-10-14',history).rev).includes(target),'newer actual success outranks the error in a future-dated pack');
});

test('later-day retry events drive spacing without changing any first score or same-day recall time',()=>{
  const target=day('2026-10-02').nw[0].word;
  let p={...blankProgress(),wordTotal:1,wordCorrect:0,attempts:{'word:first':{group:'word',targetWord:target,correct:false,at:'2026-10-12T03:00:00Z'}}};
  const original=JSON.stringify(p);
  let next=recordWordReviewEvent(p,target,false,'2026-10-12T03:00:00Z');
  next=recordWordReviewEvent(next,target,true,'2026-10-12T04:00:00Z');
  assert.equal(next.wordReviewEvents['2026-10-12|'+target].correct,false);
  for(const [date,due] of [['2026-10-13','2026-10-15'],['2026-10-15','2026-10-18'],['2026-10-18','2026-10-26']]){
    next=recordWordReviewEvent(next,target,true,date+'T03:00:00Z');
    const tomorrow=new Date(Date.parse(date)+864e5).toISOString().slice(0,10);
    assert.equal(wordLearningSchedule({'2026-10-02':next},tomorrow).get(target).dueDate,due);
  }
  assert.equal(JSON.stringify(p),original);assert.deepEqual(next.attempts,p.attempts);assert.equal(next.wordCorrect,0);assert.equal(next.wordTotal,1);
});

test('manual overdue requests rotate, but correct submissions respect their own future date',()=>{
  const words=day('2026-10-02').nw;let vocab={};
  for(const w of words)vocab=addStudyReviewVocabulary(vocab,w,'2026-10-12');
  const a=day('2026-10-13',{},vocab),b=day('2026-10-14',{},vocab);
  assert.equal(a.rev.filter(w=>vocab.items[w.word]).length,18);
  assert.equal(b.rev.filter(w=>vocab.items[w.word]).length,4);
  vocab=reviewUserVocabulary(vocab,a.rev[0].word,'2026-10-13',true);
  assert.ok(!names(day('2026-10-14',{},vocab).rev).includes(a.rev[0].word));
  const preview=day('2026-10-14').nw[0],fromPreview=addStudyReviewVocabulary({},preview,'2026-10-12');
  assert.ok(names(day('2026-10-13',{},fromPreview).rev).includes(preview.word),'an explicit review request from a future preview is still due tomorrow');
});

test('archived later-day reviews retain the schedule and never overwrite original grades',()=>{
  const target=day('2026-10-02').nw[0].word;
  const history={'2026-10-02':{snapshotArchive:[{progress:{attempts:{'word:first':{group:'word',targetWord:target,correct:false,at:'2026-10-12T03:00:00Z'}},wordReviewEvents:{later:{word:target,correct:true,at:'2026-10-13T03:00:00Z'}}}}]}};
  assert.equal(wordLearningSchedule(history,'2026-10-14').get(target).dueDate,'2026-10-15');
  assert.equal(history['2026-10-02'].snapshotArchive[0].progress.attempts['word:first'].correct,false);
});

test('review-list migration replaces only unsubmitted reviews and keeps a completed round intact',()=>{
  const fresh=day('2026-10-13'),old=structuredClone(fresh);delete old.reviewPlanVersion;
  old.rev=day('2026-10-12').rev;old.all=[...old.nw,...old.rev];old.quizWords=old.all;
  const round=makeWordRound(old.all,[],()=>.3,old.nw);round.i=24;round.input='current spelling';round.meaningInput='current meaning';
  const attempts=Object.fromEntries(round.order.slice(0,24).map(w=>['word:'+w.word,{group:'word',targetWord:w.word,correct:true,at:'2026-10-13T02:00:00Z'}]));
  const p={...blankProgress(),lessonSnapshot:old,attempts,wordTotal:24,wordCorrect:24,wordPractice:{daily:round,retry:{input:'retry draft'}},draft:{ls:{input:'listening draft'}},notes:'preserve'};
  const before=JSON.stringify(p),fixed=chooseDailyLesson('2026-10-13',p,fresh),reconciled=reconcileDailyWordRound(fixed,round,()=>.4);
  assert.equal(JSON.stringify(p),before);assert.equal(fixed.contentSignature,old.contentSignature);assert.equal(fixed.all.length,40);assert.equal(fixed.rev.length,18);
  assert.deepEqual(fixed.nw,old.nw);assert.equal(fixed.reviewPlanVersion,1);
  assert.deepEqual(reconciled.order.slice(0,25),round.order.slice(0,25));assert.equal(reconciled.input,round.input);assert.equal(reconciled.order.length,40);
  assert.equal(reconciled.order.filter(w=>w.audio).length,20);
  assert.equal(reconcileDailyWordRound(fixed,reconciled),reconciled);
  round.done=true;p.wordTotal=40;
  assert.deepEqual(chooseDailyLesson('2026-10-13',p,fresh).all,old.all);
});

test('new scheduling events are written once per round, independently of first-score recording',()=>{
  const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
  const code=template.slice(template.indexOf('    function submitWordRound'),template.indexOf('    function bindWordRound'));
  const word={word:'bank',meaning:'银行',audio:false},L={};let p={wordTotal:1,wordCorrect:0,attempts:{'word:first':{group:'word',targetWord:'bank',correct:false,at:'2026-10-12T03:00:00Z'}}};
  const context=vm.createContext({norm:s=>s,meaningOk:()=>true,wordPractice:{mistakes:[]},uniq:a=>[...new Set(a)],progress:()=>p,recordWordReviewEvent,save:patch=>{p={...p,...patch}},firstWordAttempt:()=>p.attempts['word:first'],roundScore:()=>({correct:1}),persistDraft(){},renderWords(){}});
  vm.runInContext(code,context);
  const round={order:[word],i:0,input:'bank',meaningInput:'',phase:'try',results:{}};
  context.submitWordRound(L,round,'retry');
  assert.equal(Object.keys(p.wordReviewEvents).length,1);assert.equal(p.wordTotal,1);assert.equal(p.wordCorrect,0);
  assert.equal(p.attempts['word:first'].correct,false);
});

test('card enrollment is idempotent, persists through normalization, and creates no grade',()=>{
  const v=addStudyReviewVocabulary({},word,'2026-10-07'),item=v.items[word.word];
  assert.equal(item.dueDate,'2026-10-08');assert.equal(item.reviewOnly,true);
  assert.equal(item.lastReviewed,'');assert.equal(item.lastResult,null);
  assert.deepEqual(normalizeUserVocabulary(JSON.parse(JSON.stringify(v))),v);
  assert.deepEqual(addStudyReviewVocabulary(v,word,'2026-10-09'),v);
  assert.deepEqual(addUserVocabulary(v,word,'2026-10-09'),v);
  assert.equal(removeUserVocabulary(v,word.word).items[word.word].active,false);
});

test('card selection does not reallocate new words, but enters next-day review within forty slots',()=>{
  const v=addStudyReviewVocabulary({},word,'2026-10-07');
  for(const date of ['2026-10-07','2026-10-08','2026-10-09','2026-10-10']){
    const before=day(date),after=day(date,{},v);
    assert.deepEqual(names(after.nw),names(before.nw));
    assert.equal(after.all.length,40);assert.equal(new Set(names(after.all)).size,40);
    assert.equal(after.contentSignature,before.contentSignature);
  }
  assert.ok(day('2026-10-08',{},v).rev.some(w=>w.word===word.word));
  assert.ok(!day('2026-10-07',{},v).rev.some(w=>w.word===word.word));
});

test('correct reviews widen intervals; wrong reviews return next day; same-day repeats do not advance',()=>{
  let v=addStudyReviewVocabulary({},word,'2026-10-07');
  for(const [date,due] of [['2026-10-08','2026-10-10'],['2026-10-10','2026-10-13'],['2026-10-13','2026-10-21']]){
    v=reviewUserVocabulary(v,word.word,date,true);
    assert.equal(v.items[word.word].dueDate,due);
    assert.deepEqual(reviewUserVocabulary(v,word.word,date,true),v);
  }
  v=reviewUserVocabulary(v,word.word,'2026-10-21',false);
  assert.equal(v.items[word.word].dueDate,'2026-10-22');
});

test('after a successful manual review, history cannot put it back into every day',()=>{
  let v=addStudyReviewVocabulary({},word,'2026-10-07');
  v=reviewUserVocabulary(v,word.word,'2026-10-08',true);
  const history={'2026-10-08':{wordPractice:{daily:{results:{[word.word]:{correct:true,at:'2026-10-08T03:00:00Z'}}}}}};
  assert.ok(!day('2026-10-09',history,v).rev.some(w=>w.word===word.word));
  assert.ok(day('2026-10-10',history,v).rev.some(w=>w.word===word.word));
  // No earlier completion is required for this manual-review schedule.
  assert.ok(!day('2026-10-09',{},v).rev.some(w=>w.word===word.word));
});

test('yesterday mistakes stay ahead of manual requests and excess requests do not expand quota',()=>{
  const words=day('2026-10-06').nw;
  let v={};for(const w of words)v=addStudyReviewVocabulary(v,w,'2026-10-08');
  const error=day('2026-10-07').nw[1];
  const history={'2026-10-08':{wordPractice:{daily:{results:{[error.word]:{correct:false,at:'2026-10-08T03:00:00Z'}}}}}};
  const L=day('2026-10-09',history,v);
  assert.equal(L.rev.length,18);assert.equal(L.all.length,40);assert.equal(L.rev[0].word,error.word);
  assert.equal(L.rev.filter(w=>v.items[w.word]).length,17);
  assert.equal(Object.keys(v.items).length,22);
});

test('old actual history does not erase a newly requested review; newer wrong history wins',()=>{
  const v=addStudyReviewVocabulary({},word,'2026-10-08');
  const event=(date,correct)=>({wordPractice:{daily:{results:{[word.word]:{correct,at:date+'T03:00:00Z'}}}}});
  assert.ok(day('2026-10-09',{'2026-10-06':event('2026-10-06',true)},v).rev.some(w=>w.word===word.word));
  const reviewed=reviewUserVocabulary(v,word.word,'2026-10-09',true);
  assert.ok(!day('2026-10-10',{},reviewed).rev.some(w=>w.word===word.word));
  const laterWrong={'2026-10-09':event('2026-10-09',false)};
  assert.ok(day('2026-10-10',laterWrong,reviewed).rev.some(w=>w.word===word.word));
});

test('adding review leaves completed and in-progress rounds, drafts and first scores unchanged',()=>{
  const L=day('2026-10-07'),round=makeWordRound(L.all,[],()=>.4,L.nw);
  round.i=3;round.input='unfinished';round.results[round.order[0].word]={correct:false};
  const p={...blankProgress(),lessonSnapshot:L,wordTotal:3,wordCorrect:2,notes:'保留',wordPractice:{daily:round},draft:{ws:round,ls:{input:'listening draft'}},attempts:{read:{group:'reading',correct:false}}};
  const before=JSON.stringify(p),v=addStudyReviewVocabulary({},word,'2026-10-07');
  const chosen=chooseDailyLesson('2026-10-07',p,day('2026-10-07',{'2026-10-07':p},v));
  assert.equal(JSON.stringify(p),before);assert.deepEqual(names(chosen.all),names(L.all));
});

test('rendered card has an inline button; enrollment stops speech and does not rerender or touch drafts',()=>{
  const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
  const code=template.slice(template.indexOf('    function studyWordCard'),template.indexOf('    function bindSpeechButton'));
  const buttons=[],statuses=[],draft={input:'unfinished'},saved=[];let stopped=0,spoken=0;
  const context=vm.createContext({userVocab:{items:{}},esc:s=>String(s??'').replaceAll('"','&quot;'),wordPosHtml:()=>'',hiddenZh:()=>'',dateKey:()=> '2026-10-07',addStudyReviewVocabulary,saveUserVocab:v=>{context.userVocab=v;saved.push(v);return true},speakStudyWord:()=>spoken++,document:{querySelectorAll:s=>s==='[data-study-review]'?buttons:statuses}});
  vm.runInContext(code,context);
  assert.match(context.studyWordCard(word,false),/data-study-review=/);
  assert.doesNotMatch(context.studyWordCard(word,false),/data-review-status|次日起按间隔复习/);
  const b={dataset:{studyReview:word.word,reviewEntry:JSON.stringify(word)}},s={dataset:{reviewStatus:word.word}};
  buttons.push(b);statuses.push(s);context.bindStudyReviewButton(b);
  b.onclick({stopPropagation:()=>stopped++});
  assert.equal(stopped,1);assert.equal(spoken,0);assert.equal(saved.length,1);
  assert.equal(b.disabled,true);assert.equal(b.textContent,'已加入复习');
  assert.doesNotMatch(context.studyWordCard(word,false),/data-review-status|已按间隔排队/);
  const card={dataset:{studyWord:word.word}};context.bindStudyWordCard(card);
  card.onclick({target:{closest:()=>b}});assert.equal(spoken,0);
  card.onclick({target:{closest:()=>null}});assert.equal(spoken,1);
  assert.equal(draft.input,'unfinished');
});
