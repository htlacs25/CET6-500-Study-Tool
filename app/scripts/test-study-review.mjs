import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {prepareStandalone} from './generate-standalone.mjs';
import {loadCurriculum} from '../lib/load-curriculum.mjs';
import {addStudyReviewVocabulary,addUserVocabulary,normalizeUserVocabulary,removeUserVocabulary,reviewUserVocabulary,buildRecoveryLesson,makeWordRound,chooseDailyLesson,blankProgress} from '../lib/study-engine.mjs';

const prepared=await prepareStandalone('2026-10-07');
const html=prepared.files.find(([name])=>name.endsWith('.html'))[1];
const DATA=JSON.parse(html.match(/const DATA=([\s\S]*?); const RECOVERY=/)[1]);
const curriculum=loadCurriculum();
const day=(date,history={},vocab={})=>buildRecoveryLesson(DATA,curriculum,date,history,vocab);
const word=day('2026-10-07').nw[0];
const names=rows=>rows.map(w=>w.word);

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
  const b={dataset:{studyReview:word.word,reviewEntry:JSON.stringify(word)}},s={dataset:{reviewStatus:word.word}};
  buttons.push(b);statuses.push(s);context.bindStudyReviewButton(b);
  b.onclick({stopPropagation:()=>stopped++});
  assert.equal(stopped,1);assert.equal(spoken,0);assert.equal(saved.length,1);
  assert.equal(b.disabled,true);assert.equal(b.textContent,'已加入复习');assert.match(s.textContent,/次日/);
  const card={dataset:{studyWord:word.word}};context.bindStudyWordCard(card);
  card.onclick({target:{closest:()=>b}});assert.equal(spoken,0);
  card.onclick({target:{closest:()=>null}});assert.equal(spoken,1);
  assert.equal(draft.input,'unfinished');
});
