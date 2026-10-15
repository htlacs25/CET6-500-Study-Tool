import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareStandalone} from './generate-standalone.mjs';
import {loadCurriculum} from '../lib/load-curriculum.mjs';
import {buildRecoveryLesson,chooseDailyLesson,makeWordRound,reconcileDailyWordRound,blankProgress,recordWordReviewEvent,wordLearningSchedule} from '../lib/study-engine.mjs';
const prepared=await prepareStandalone('2026-10-15');
const html=prepared.files.find(([name])=>name.endsWith('.html'))[1];
const DATA=JSON.parse(html.match(/const DATA=([\s\S]*?); const RECOVERY=/)[1]),curriculum=loadCurriculum();
const day=(date,history={})=>buildRecoveryLesson(DATA,curriculum,date,history);
const names=rows=>rows.map(w=>w.word);

test('same-version cached review lists refresh untouched suffix, not only old-version snapshots',()=>{
  const fresh=day('2026-10-16'),old=structuredClone(fresh);
  old.rev=day('2026-10-13').rev;old.all=[...old.nw,...old.rev];old.quizWords=old.all;
  const round=makeWordRound(old.all,[],()=>.3,old.nw);round.input='unfinished new spelling';
  const p={...blankProgress(),lessonSnapshot:old,wordPractice:{daily:round,retry:{input:'retry draft'}},draft:{ls:{input:'listening draft'}},notes:'preserve'};
  const before=JSON.stringify(p),fixed=chooseDailyLesson(old.date,p,fresh);
  assert.deepEqual(names(fixed.rev),names(fresh.rev));
  const adjusted=reconcileDailyWordRound(fixed,round,()=>.4);
  assert.deepEqual(adjusted.order[0],round.order[0]);assert.equal(adjusted.input,round.input);
  assert.equal(adjusted.order.length,40);assert.equal(adjusted.order.filter(w=>w.audio).length,20);
  assert.equal(new Set(names(adjusted.order)).size,40);assert.equal(JSON.stringify(p),before);
  assert.equal(fixed.contentSignature,old.contentSignature);
  assert.equal(reconcileDailyWordRound(fixed,adjusted),adjusted);
  const again=chooseDailyLesson(old.date,{...p,lessonSnapshot:fixed,wordPractice:{daily:adjusted}},fresh);
  assert.deepEqual(again.all,fixed.all);
  round.done=true;p.wordTotal=40;
  assert.deepEqual(chooseDailyLesson(old.date,p,fresh).all,old.all);
});

test('latest actual success removes a word from a preopened next-day queue at the same version',()=>{
  const target=day('2026-10-12').nw[0].word;
  const history={'2026-10-12':recordWordReviewEvent({},target,false,'2026-10-12T03:00:00Z')};
  const old=day('2026-10-14',history),round=makeWordRound(old.all,[],()=>.2,old.nw);
  // It was due in the earlier preview; force the legacy snapshot representation if it rested.
  if(!names(old.rev).includes(target)){const w=day('2026-10-12').nw[0];old.rev=[w,...old.rev.slice(0,17)];old.all=[...old.nw,...old.rev];old.quizWords=old.all;round.order=makeWordRound(old.all,[],()=>.2,old.nw).order;}
  round.input='current new word';
  const p={...blankProgress(),lessonSnapshot:old,wordPractice:{daily:round}};
  history['2026-10-13']=recordWordReviewEvent({},target,true,'2026-10-13T03:00:00Z');
  assert.equal(wordLearningSchedule(history,'2026-10-14').get(target).dueDate,'2026-10-15');
  const fresh=day('2026-10-14',history),fixed=chooseDailyLesson('2026-10-14',p,fresh);
  assert.ok(!names(fixed.rev).includes(target));
});

test('daily actual correct submissions progress spacing and never repeat the identical list',()=>{
  const history={},lists=[];
  for(const date of ['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18']){
    const L=day(date,history);assert.equal(L.all.length,40);assert.equal(new Set(names(L.all)).size,40);
    if(lists.length)assert.notDeepEqual(names(L.rev),lists.at(-1));lists.push(names(L.rev));
    let p={...blankProgress(),lessonSnapshot:L};
    for(const w of L.all)p=recordWordReviewEvent(p,w.word,true,date+'T03:00:00Z');history[date]=p;
  }
  assert.equal(lists.length,7);
});
