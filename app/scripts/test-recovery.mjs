import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { RECOVERY } from '../lib/recovery-data.mjs';
import { loadCurriculum } from '../lib/load-curriculum.mjs';
import { buildRecoveryLesson, blankProgress, recordFirstAttempt, mergeLegacyStores, assessSentence, assessTranslation, readiness, courseDay, phaseFor, chooseDailyLesson, hasAnswerWork, lessonFingerprint, fullDictationItems, normEnglish, blankUserVocabulary, addUserVocabulary, removeUserVocabulary, dueUserVocabulary, reviewUserVocabulary, normalizeUserVocabulary, USER_VOCAB_STORAGE_KEY, MAX_USER_VOCABULARY, RECOVERY_STORAGE_KEY, OLD_PROGRESS_KEYS } from '../lib/study-engine.mjs';
import { prepareStandalone } from './generate-standalone.mjs';
import { parseWordPartsOfSpeech, wordPartsOfSpeech, wordPartOfSpeechLabel } from '../lib/study-engine.mjs';
import { ARTICLE_CONTEXT_SENSES, articleTokenContext, articleContextSense, conciseWordMeaning } from '../lib/study-engine.mjs';
import {createWordSearch,normalizeSearchWord} from '../lib/word-search.mjs';

test('offline dictionary supports real families, exact senses and irregular verb forms',()=>{
  const data=JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname,'../content/word-search.json'),'utf8'));
  const before=JSON.stringify(data),s=createWordSearch({},data,{brief:conciseWordMeaning});
  assert.ok(s.count>20000);assert.ok(Object.keys(data.related).length>5000);
  const care=s.find('carefully');assert.match(care.entry.posLabel,/adv\. 副词/);
  assert.deepEqual(care.families.map(g=>g.pos),['n','v','adj','adv']);
  assert.ok(care.families.find(g=>g.pos==='v').items.some(w=>w.word==='care'));
  const written=s.find('written'),write=written.verbs.find(v=>v.base==='write');
  assert.deepEqual(write.forms.find(f=>f.kind==='past').words,['wrote']);
  assert.deepEqual(write.forms.find(f=>f.kind==='participle').words,['written']);
  assert.ok(s.find('went').verbs.some(v=>v.base==='go'));
  assert.deepEqual(s.find('saw').verbs.map(v=>v.base),['saw','see']);
  assert.ok(s.find('lie').verbs[0].note.includes('说谎'));
  assert.deepEqual(s.find('be').verbs[0].forms[0].words,['was','were']);
  assert.ok(s.find('quickly').families.some(g=>g.items.some(w=>w.word==='quick')));
  assert.ok(!s.find('quickly').families.some(g=>g.items.some(w=>w.word==='faster')));
  assert.ok(!s.find('accurately').families.some(g=>g.pos==='v'));
  const act=s.find('actively').families.find(g=>g.pos==='v').items.find(w=>w.word==='act');
  assert.ok(!act.brief.includes('法案'),'verb family rows should not lead with noun meaning');
  assert.equal(JSON.stringify(data),before);
  assert.match(data.licenses.wordnet,/Copyright 2006 by Princeton/);
});

test('search handles malformed input, spelling suggestions and missing data without invented answers',()=>{
  const s=createWordSearch({entries:{think:{meaning:'v. 思考'},thing:{meaning:'n. 东西'}}},{});
  assert.equal(normalizeSearchWord(' WRITTEN '),'written');
  assert.equal(s.find('<script>').invalid,true);assert.equal(s.find('two words').invalid,true);
  assert.equal(s.find('constructor').entry,null);assert.equal(s.find('zzzz').entry,null);
  assert.deepEqual(s.find('zzzz').families,[]);assert.deepEqual(s.find('zzzz').verbs,[]);
  assert.ok(s.find('thnik').suggestions.includes('think'));
});

test('global search is reachable on every tab and never changes drafts, enrollment or first grades',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-09-22');rt.api.record('word',0,false,{targetWord:'improve'});
  rt.api.state().ps.trans[0]={input:'My unfinished translation',checked:false};rt.api.persistDraft();
  const grades=rt.saved.get(RECOVERY_STORAGE_KEY),vocab=JSON.stringify(rt.api.userVocabulary());
  for(const tab of ['plan','words','listening','extensive','practice','records']){
    rt.api.setTab(tab);rt.api.render();const markup=rt.element('app').innerHTML,persisted=rt.saved.get(RECOVERY_STORAGE_KEY);
    rt.api.openWordSearch('carefully');assert.equal(rt.element('wordSearchPanel').hidden,false);
    assert.equal(rt.element('studyWorkspace').dataset.searchOpen,'true');
    assert.match(rt.element('wordSearchResults').innerHTML,/相关词族/);
    assert.equal(rt.element('app').innerHTML,markup);
    rt.api.closeWordSearch();assert.equal(rt.element('wordSearchPanel').hidden,true);
    assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),persisted,'search itself must not write learner records');
  }
  rt.api.runWordSearch('written');assert.match(rt.element('wordSearchResults').innerHTML,/wrote/);
  rt.api.runWordSearch('zzzz');assert.match(rt.element('wordSearchStatus').textContent,/暂未收录/);
  const prior=JSON.parse(grades)['2026-09-22'],after=JSON.parse(rt.saved.get(RECOVERY_STORAGE_KEY))['2026-09-22'];
  assert.deepEqual(after.attempts,prior.attempts);assert.equal(after.wordTotal,prior.wordTotal);assert.equal(after.wordCorrect,prior.wordCorrect);
  assert.equal(JSON.stringify(rt.api.userVocabulary()),vocab);
  assert.equal(rt.api.progress().draft.ps.trans[0].input,'My unfinished translation');
  assert.match(html,/#studyWorkspace\[data-search-open="true"\]\{grid-template-columns:minmax\(0,1fr\) minmax\(300px,360px\)/);
  assert.match(html,/id="lookupSearch"/);
});

const root=path.resolve(import.meta.dirname,'..');
const html=fs.readFileSync(path.join(root,'public','六级学习工具.html'),'utf8');
const RELEASE=JSON.parse(html.match(/const RELEASE=([\s\S]*?);\r?\n/)[1]);
const DATA=JSON.parse(html.match(/const DATA=([\s\S]*?); const RECOVERY=/)[1]);
const CURRICULUM=loadCurriculum();
const dateAt=n=>new Date(Date.UTC(2026,7,28+n)).toISOString().slice(0,10);
const clone=x=>JSON.parse(JSON.stringify(x));
const assertFullDictation=(L,label)=>{
  const items=fullDictationItems(L.listening);
  assert.ok(items.length>2,`${label}: expected more than the old two excerpts`);
  assert.equal(normEnglish(items.map(x=>x.text).join(' ')),normEnglish(L.listening.passage),`${label}: dictation must cover the passage`);
  assert.ok(items.every(x=>x.text&&x.zh),`${label}: every segment needs hidden Chinese`);
};

test('concise meanings preserve whole senses and do not present specialist dictionary clutter first',()=>{
  assert.equal(conciseWordMeaning('n. 社区, 公众, 共有, 共同体；[经] 公众, 共有, 社会'),'社区；公众');
  assert.equal(conciseWordMeaning('n. 通路, 入口, 发作','使用机会；使用权'),'使用机会；使用权');
  assert.equal(conciseWordMeaning('[医] 发作, 急性；n. 使用权, 入口'),'使用权；入口');
  assert.equal(conciseWordMeaning('n. （涂料，油漆的）层, 外套, 覆盖物'),'（涂料，油漆的）层；外套');
  assert.equal(conciseWordMeaning('n. （涂料；油漆；颜色的）层, 外套, 覆盖物'),'（涂料；油漆；颜色的）层；外套');
  assert.equal(conciseWordMeaning('v. 跑, 跑, 经营（runs 为 run 的词形或所有格形式）'),'跑；经营');
});

test('context senses distinguish clicked occurrences and never guess an unverified sense',()=>{
  const sentence='The jobs were clear, and they left one clear route.';
  assert.equal(articleContextSense('clear',sentence,sentence.indexOf('clear')).meaning,'明确的');
  assert.equal(articleContextSense('clear',sentence,sentence.lastIndexOf('clear')).meaning,'畅通的');
  assert.equal(articleContextSense('clear',sentence),null);
  assert.equal(articleContextSense('clear','The sky is clear.'),null);
  assert.equal(articleContextSense('clear',sentence,0),null);
  assert.equal(articleContextSense('constructor','constructor'),null);
  const passage='Leaves can block the entrance. She leaves after work.';
  const first=articleTokenContext(passage,0),last=articleTokenContext(passage,passage.lastIndexOf('leaves'));
  assert.equal(articleContextSense('Leaves',first.text,first.offset).base,'leaf');
  assert.equal(articleContextSense('leaves',last.text,last.offset),null);
  assert.equal(articleContextSense('Leaves','Leaves. Can block the entrance',0),null);
  assert.equal(articleContextSense('coats','several coats of paint').meaning,'（涂料的）层');
  assert.equal(articleContextSense('record','his study record').pos,'n');
  assert.equal(articleContextSense('record','record how long standing water remains').pos,'v');
});

test('authored context annotations match real prepared articles and leave course data unchanged',()=>{
  const before=JSON.stringify(CURRICULUM),normal=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z' ]/g,' ').replace(/\s+/g,' ').trim();
  const passages=[...CURRICULUM.lessons,...Object.values(CURRICULUM.datedLessons)].flatMap(l=>[l.reading.passage,l.listening.passage,l.extensive.text]).map(normal);
  for(const [phrase,surface,meaning,pos] of ARTICLE_CONTEXT_SENSES){
    assert.ok(passages.some(p=>(' '+p+' ').includes(' '+normal(phrase)+' ')),'Context absent from articles: '+phrase);
    assert.ok(normal(phrase).split(' ').includes(surface));
    assert.ok(meaning&&meaning.split('；').length<=2);
    assert.notEqual(wordPartOfSpeechLabel({pos:pos+'.'}),'待核实');
  }
  assert.equal(JSON.stringify(CURRICULUM),before);
});

test('article popup leads with a compact contextual sense and folds raw definitions without saving work',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-09-17');const L=rt.api.lesson();
  rt.api.record('reading',0,false,{label:'existing mistake',answer:'A',expected:'B'});
  rt.api.state().ps.trans[0]={input:'Unfinished translation',checked:false};rt.api.persistDraft();rt.api.renderExtensive(L);
  const before=rt.element('app').innerHTML,saved=rt.saved.get(RECOVERY_STORAGE_KEY),signature=L.contentSignature;
  const sentence=articleTokenContext(L.extensive.text,L.extensive.text.indexOf('coats'));
  const anchor=rt.element('contextCoats');anchor.dataset={lookupContext:sentence.text,lookupOffset:String(sentence.offset)};
  rt.api.openArticleWord('coats','extensive',anchor);
  const panel=rt.element('articleLookupPopover').innerHTML,visible=panel.split('<details')[0];
  assert.match(visible,/本文义：<\/b>（涂料的）层/);assert.doesNotMatch(visible,/外套/);
  assert.match(visible,/词性：n\. 名词/);assert.match(panel,/<details class="reveal"><summary>其他词典义/);assert.doesNotMatch(panel,/<details[^>]*\bopen\b/);
  assert.ok(panel.includes(rt.api.articleEntry('coats').meaning));
  assert.equal(rt.element('app').innerHTML,before);assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),saved);
  assert.equal(rt.api.lesson().contentSignature,signature);assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  const markup=rt.api.articleText('The jobs were clear, and they left one clear route.','reading');
  assert.match(markup,/data-lookup-context=/);assert.match(markup,/data-lookup-offset="14"/);
  rt.api.closeArticleWord();rt.api.openArticleWord('university','reading');
  assert.match(rt.api.lookupPanelHtml(L,'reading'),/常用义（本文义待确认）/);
});

test('clicked occurrence is retained for explicit vocabulary enrollment with the correct contextual lemma',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-09-16');const L=rt.api.lesson(),surface='Leaves';
  const point=articleTokenContext(L.extensive.text,L.extensive.text.indexOf(surface));
  const anchor=rt.element('leafAnchor');anchor.dataset={lookupContext:point.text,lookupOffset:String(point.offset)};
  rt.api.openArticleWord(surface,'extensive',anchor);
  assert.match(rt.element('articleLookupPopover').innerHTML,/<b>本文义：<\/b>树叶/);
  assert.match(rt.element('articleLookupPopover').innerHTML,/背诵原形：<\/b>leaf/);
  assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.element('lookupAdd').onclick();const words=rt.api.userVocabulary().items;
  assert.equal(words.leaf.active,true);assert.equal(words.leave,undefined);assert.equal(words.leaf.phrase,point.text.trim());
  rt.element('lookupRemove').onclick();assert.equal(rt.api.userVocabulary().items.leaf.active,false);
});

test('sync report stays ASCII-safe for Windows PowerShell JSON parsing',()=>{
  const result=spawnSync(process.execPath,[path.join(root,'scripts','sync-daily-content.mjs'),RELEASE.verifiedOn,'--check'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr||result.stdout);
  assert.match(result.stdout,/^[\x00-\x7F]*$/);
  const report=JSON.parse(result.stdout);
  assert.equal(report.synced,true);
  assert.match(report.note,/浏览器成绩/);
});

test('word parts of speech cover the word bank without mutating lessons or trusting derived base tags',()=>{
  assert.deepEqual(parseWordPartsOfSpeech('n. 名词；a. 形容词；adj. 形容词；vt. 及物；vi. 不及物；adv. 副词'),['n','adj','vt','vi','adv']);
  assert.deepEqual(parseWordPartsOfSpeech('Arrive at 8 a.m. See page n. 3.'),[]);
  const before=JSON.stringify(CURRICULUM),entries=CURRICULUM.articleGlossary;
  for(const w of [...CURRICULUM.words,...DATA.WORDS])assert.ok(wordPartsOfSpeech(w,entries).length,'Missing POS: '+w.word);
  assert.deepEqual(wordPartsOfSpeech('has',entries),wordPartsOfSpeech('have',entries));
  assert.deepEqual(wordPartsOfSpeech('prepared',entries),['adj']);
  assert.deepEqual(wordPartsOfSpeech({word:'patiently',meaning:'a. 从原形复制的错误词性'},entries),['adv']);
  assert.deepEqual(wordPartsOfSpeech('creator',entries),['n']);
  assert.deepEqual(wordPartsOfSpeech('leaves',entries),['n','v']);
  assert.match(wordPartOfSpeechLabel('healthy',entries),/adj\. 形容词/);
  assert.match(wordPartOfSpeechLabel('usually',entries),/adv\. 副词/);
  assert.equal(wordPartOfSpeechLabel('unverified-unknown-word',entries),'待核实');
  assert.deepEqual(wordPartsOfSpeech('loop',{loop:{base:'loop'}}),[]);
  assert.equal(JSON.stringify(CURRICULUM),before);
});

test('POS appears on study cards, lookups and corrections but stays hidden during dictation',()=>{
  const rt=runtime();rt.api.setDate('2026-09-16');const L=rt.api.lesson(),signature=L.contentSignature;
  rt.api.setTab('plan');rt.api.render();
  assert.equal((rt.element('app').innerHTML.match(/class="word-pos"/g)||[]).length,L.all.length);
  assert.equal(rt.element('app').innerHTML.includes('词性：待核实'),false);
  const score=JSON.stringify(rt.api.progress());
  rt.api.openArticleWord('community','reading');
  assert.match(rt.api.lookupPanelHtml(L,'reading'),/词性：n\. 名词/);
  assert.equal(JSON.stringify(rt.api.progress()),score);
  assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.api.renderWords(L);assert.equal(rt.element('app').innerHTML.includes('class="word-pos"'),false);
  rt.element('wordInput').oninput({target:{value:'wrong'}});
  rt.element('meaningInput').oninput({target:{value:'不会'}});rt.element('checkWord').onclick();
  assert.equal(rt.element('app').innerHTML.includes('class="word-pos"'),false);
  const first=JSON.stringify(rt.api.progress().attempts),target=rt.api.state().ws.order[0];
  rt.element('wordInput').oninput({target:{value:target.word}});
  rt.element('meaningInput').oninput({target:{value:target.meaning}});rt.element('checkWord').onclick();
  assert.match(rt.element('app').innerHTML,/class="word-pos"/);
  assert.equal(JSON.stringify(rt.api.progress().attempts),first);
  assert.equal(rt.api.lesson().contentSignature,signature);
  assert.equal(rt.api.progress().snapshotArchive.length,0);
  rt.element('startWrongRound').onclick();
  const markup=rt.element('app').innerHTML.split('id="todayWrongPractice"')[1]||rt.element('app').innerHTML.split('今日错词重默')[1];
  assert.equal(markup.includes('class="word-pos"'),false,'retry must not show the answer metadata early');
});

test('14 complete lessons have bilingual material, IPA and valid answers',()=>{
  assert.equal(RECOVERY.lessons.length,14);
  assert.equal(RECOVERY.words.length,96);
  assert.equal(new Set(RECOVERY.words.map(x=>x.word)).size,96);
  for(const w of RECOVERY.words){assert.match(w.phonetic,/^\/.+\/$/);assert.ok(w.meaning&&w.example&&w.exampleZh)}
  const titles=new Set();
  for(let i=0;i<14;i++){
    const L=buildRecoveryLesson(DATA,CURRICULUM,dateAt(i));titles.add(L.reading.title);
    assert.equal(L.nw.length,[6,13].includes(i)?0:12);
    assert.equal(L.rev.length,L.weekly?20:18);assert.equal(L.quizWords.length,L.weekly?20:30);
    assert.equal(new Set(L.all.map(w=>w.word)).size,L.all.length);
    assert.equal(new Set(L.quizWords.map(w=>w.word)).size,L.weekly?20:30);
    assert.equal(L.grammar.length,6);assert.equal(L.reading.questions.length,4);
    assert.equal(L.listening.questions.length,2);assertFullDictation(L,`recovery day ${i+1}`);
    assert.equal(L.sent.length,1);assert.equal(L.trans.length,2);assert.equal(L.tasks.length,7);
    assert.ok(L.extensive.text&&L.extensive.textZh);assert.equal(L.extensive.questions.length,2);assert.equal(L.extensive.keyPhrases.length,3);
    const ec=(L.extensive.text.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)||[]).length;assert.ok(ec>=180&&ec<=240);
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
  assert.ok(buildRecoveryLesson(DATA,CURRICULUM,dateAt(0)).quizWords.some(w=>w.word==='improve'));
  assert.ok(buildRecoveryLesson(DATA,CURRICULUM,dateAt(0)).quizWords.some(w=>w.word==='think'));
});

test('weekday/weekend budget, weekly tests, dates and roadmap',()=>{
  assert.equal(courseDay('2026-08-28'),0);assert.equal(courseDay('2026-09-10'),13);
  assert.equal(buildRecoveryLesson(DATA,RECOVERY,'2026-08-27'),null);
  for(let i=0;i<14;i++){
    const k=dateAt(i),L=buildRecoveryLesson(DATA,CURRICULUM,k),wk=[0,6].includes(new Date(k).getUTCDay());
    assert.equal(L.tasks.reduce((s,t)=>s+t.minutes,0),wk?210:150);
    assert.equal(L.tasks.at(-1).minutes,wk?15:10);
    assert.equal(L.weekly,(i+1)%7===0);
    if(L.weekly)assert.equal(L.nw.length,0);
    assert.equal(L.rev.length,L.weekly?20:18);assert.equal(L.quizWords.length,L.weekly?20:30);
  }
  const pending=buildRecoveryLesson(DATA,RECOVERY,'2026-09-11');
  assert.equal(pending.unprepared,true);assert.equal(pending.freshMaterial,false);
  assert.equal(pending.reading.passage,'');assert.equal(pending.listening.passage,'');
  assert.equal(phaseFor('2026-10-01').name,'四级专项');
  assert.equal(phaseFor('2026-12-01').name,'模考与查漏补缺');
});

test('a seven-day window has different reading, listening and extensive passages with matching local copies',async()=>{
  const p=await prepareStandalone('2026-08-30');
  assert.equal(p.release.days.length,7);
  assert.equal(new Set(p.release.days.map(d=>d.readingHash)).size,7);
  assert.equal(new Set(p.release.days.map(d=>d.listeningHash)).size,7);
  assert.equal(new Set(p.release.days.map(d=>d.extensiveHash)).size,7);
  assert.equal(new Set(p.release.days.map(d=>d.courseHash)).size,7);
  assert.deepEqual(p.release.duplicateCourse,[]);
  assert.deepEqual(p.release.dateMismatches,[]);
  assert.deepEqual(p.release.missingDates,[]);
  assert.deepEqual(p.release.duplicateExtensive,[]);assert.deepEqual(p.release.missingExtensive,[]);
  assert.equal(fs.readFileSync(path.join(root,'../六级学习工具.html'),'utf8'),html);
  const dist=path.join(root,'dist','client','六级学习工具.html');
  if(fs.existsSync(dist))assert.equal(fs.readFileSync(dist,'utf8'),html);
  assert.ok(html.includes('七天课程一览'));
  assert.ok(html.includes('window.__CET6ReceiveRelease'));
});

test('every rolling seven-day window through September is complete and fully distinct',async()=>{
  const curriculum=CURRICULUM;
  const dated=Object.values(curriculum.datedLessons),datedWords=dated.flatMap(x=>x.words);
  const extensive=Object.values(curriculum.extensiveReadings);
  assert.equal(extensive.length,34);assert.equal(new Set(extensive.map(x=>x.date)).size,34);assert.equal(new Set(extensive.map(x=>x.text)).size,34);
  assert.ok(extensive.some(x=>x.sourceType==='public-domain adaptation'));assert.ok(extensive.some(x=>x.sourceType==='original news-style'));
  assert.equal(dated.length,20);assert.equal(new Set(datedWords.map(w=>w.word)).size,datedWords.length);
  assert.equal(new Set(dated.map(x=>x.title)).size,dated.length);
  assert.equal(new Set(dated.map(x=>x.reading.passage)).size,dated.length);
  assert.equal(new Set(dated.map(x=>x.listening.passage)).size,dated.length);
  for(let day=11;day<=30;day++){
    const date=`2026-09-${String(day).padStart(2,'0')}`,L=buildRecoveryLesson(DATA,curriculum,date);
    assert.equal(L.unprepared,undefined);assert.equal(L.freshMaterial,true);
    assert.equal(L.nw.length,[17,24].includes(day)?0:12);
    assert.equal(L.rev.length,L.weekly?20:18);assert.equal(L.quizWords.length,L.weekly?20:30);assert.equal(L.grammar.length,6);
    assert.equal(L.reading.questions.length,4);assert.equal(L.listening.questions.length,2);
    assertFullDictation(L,date);assert.equal(L.sent.length,1);assert.equal(L.trans.length,2);assert.equal(L.tasks.length,7);
    assert.ok(L.extensive.text&&L.extensive.textZh);assert.equal(L.extensive.questions.length,2);assert.equal(L.extensive.keyPhrases.length,3);
    const ec=(L.extensive.text.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)||[]).length;assert.ok(ec>=180&&ec<=240,`${date} extensive: ${ec}`);
    assert.ok(L.reading.passage.split(/\s+/).length>=110&&L.reading.passage.split(/\s+/).length<=170);
    assert.ok(L.listening.passage.split(/\s+/).length>=45&&L.listening.passage.split(/\s+/).length<=90);
    for(const w of L.nw){assert.match(w.phonetic,/^\/.+\/$/);assert.ok(w.meaning&&w.phrase)}
    for(const q of [...L.grammar,...L.reading.questions,...L.listening.questions,...L.extensive.questions]){
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
    assert.deepEqual(p.release.duplicateExtensive,[],date);
    assert.deepEqual(p.release.duplicateCourse,[],date);
    assert.deepEqual(p.release.dateMismatches,[],date);
    assert.deepEqual(p.release.incompleteDictation,[],date);
    assert.deepEqual(p.release.missingExtensive,[],date);
    assert.deepEqual(p.release.missingGlosses,[],date);
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
  assert.equal(a.priorityErrors.length,6);assert.equal(b.priorityErrors.length,6);
  assert.notDeepEqual(a.priorityErrors,b.priorityErrors);
  assert.notEqual(a.rev[0].word,b.rev[0].word);
  assert.equal(a.rev.length,18);assert.equal(a.rev.filter(w=>errors.includes(w.word)).length,6);
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
  assert.equal(next.rev.length,18);assert.equal(next.nw.length,12);
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

test('every prepared passage token has a Chinese gloss and reviewable IPA, and every lesson has full dictation',()=>{
  const entries=CURRICULUM.articleGlossary.entries,tokenPattern=/[a-z]+(?:'[a-z]+)?/g,seen=new Set();
  const lessons=[...CURRICULUM.lessons,...Object.values(CURRICULUM.datedLessons)];
  for(const L of lessons){
    assertFullDictation({listening:L.listening},L.date||L.title);
    for(const passage of [L.reading.passage,L.listening.passage,L.extensive.text])for(const token of passage.toLowerCase().match(tokenPattern)||[]){
      const base=token.endsWith("'s")?token.slice(0,-2):token,entry=entries[token]||entries[base];
      assert.ok(entry?.meaning,`${L.date||L.title}: missing ${token}`);assert.match(entry.meaning,/[\u3400-\u9fff]/,`${token}: meaning needs Chinese`);
      const review=entry.base?entries[entry.base]:entry;assert.ok(review?.phonetic||entry.phonetic,`${token}: learner-selected word needs IPA`);seen.add(token);
    }
  }
  assert.ok(seen.size>1000);
  assert.match(html,/全文分段听写/);
  assert.match(html,/data-lookup-word/);
  assert.doesNotMatch(html,/const typed=new Set\(norm\(ls\.input\)/);
});

test('only explicitly added article words enter a fixed-size spaced review queue',()=>{
  const empty=blankUserVocabulary(),before=JSON.stringify(empty);
  let vocab=addUserVocabulary(empty,{surface:'zebras',word:'zebra',phonetic:'/ˈziːbrə/',meaning:'斑马',phrase:'two zebras'},'2026-09-10','reading');
  assert.equal(JSON.stringify(empty),before);
  assert.deepEqual(dueUserVocabulary(vocab,'2026-09-10'),[]);
  assert.deepEqual(dueUserVocabulary(vocab,'2026-09-11').map(x=>x.word),['zebra']);
  vocab=addUserVocabulary(vocab,{surface:'zebra',word:'zebra',meaning:'斑马'},'2026-09-10','listening');
  assert.equal(Object.keys(vocab.items).length,1);
  const L=buildRecoveryLesson(DATA,CURRICULUM,'2026-09-11',{},vocab);
  assert.equal(L.rev.length,18);assert.equal(L.quizWords.length,L.weekly?20:30);assert.ok(L.rev.some(x=>x.word==='zebra'));
  vocab=reviewUserVocabulary(vocab,'zebra','2026-09-11',true);
  assert.equal(vocab.items.zebra.dueDate,'2026-09-13');
  vocab=reviewUserVocabulary(vocab,'zebra','2026-09-13',true);
  assert.equal(vocab.items.zebra.dueDate,'2026-09-17');
  vocab=reviewUserVocabulary(vocab,'zebra','2026-09-17',true);
  assert.equal(vocab.items.zebra.dueDate,'2026-09-24');
  vocab=removeUserVocabulary(vocab,'zebra');assert.equal(vocab.items.zebra.active,false);
  assert.deepEqual(dueUserVocabulary(vocab,'2026-09-30'),[]);
  assert.deepEqual(normalizeUserVocabulary({items:{broken:{word:'',meaning:''}}}),blankUserVocabulary());
});

function runtime(initial={},browserMode=false){
  const saved=new Map(Object.entries(initial)),elements=new Map(),spoken=[],timers=[];
  const session=new Map(),events={},beacons=[],audioEvents=[];let reloadCount=0;
  let now=Date.parse('2026-08-28T15:59:30Z');
  class TestDate extends Date {constructor(...args){super(...(args.length?args:[now]))}static now(){return now}}
  const element=id=>{if(!elements.has(id))elements.set(id,{
    id,innerHTML:'',textContent:'',value:'',disabled:false,dataset:{},style:{},hidden:false,isConnected:true,
    focus(options){this.focusOptions=options},getBoundingClientRect(){return {left:100,top:120,right:460,bottom:440,width:360,height:320}},
    querySelector(selector){const child=selector.slice(1);if(!this.innerHTML.includes('id="'+child+'"'))return null;const found=element(child);found.parentElement=this;return found},
    contains(target){return target===this||target?.parentElement===this}
  });return elements.get(id)};
  const document={getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>({click(){},remove(){}}),head:{appendChild:s=>beacons.push(s)},addEventListener:(name,fn)=>events[name]=fn,hidden:false};
  const location={href:'file:///D:/CET6-500-Study-Tool/六级学习工具.html',protocol:'file:',hostname:'',reload:()=>reloadCount++};
  location.replace=url=>{location.href=url;reloadCount++};
  const window={location,innerWidth:1024,innerHeight:768,addEventListener:(name,fn)=>events[name]=fn};
  const speechSynthesis={speaking:false,paused:false,cancel(){this.speaking=false;this.paused=false;audioEvents.push('cancel')},getVoices(){return[]},speak(u){spoken.push(u);this.speaking=true;this.paused=false;audioEvents.push('speak')},pause(){if(this.speaking){this.paused=true;audioEvents.push('pause')}},resume(){if(this.paused){this.paused=false;audioEvents.push('resume')}}};
  const context=vm.createContext({...(browserMode?{window,sessionStorage:{getItem:k=>session.get(k)||null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)}}:{}),Date:TestDate,document,app:element('app'),checkListen:element('checkListen'),listenRateLabel:element('listenRateLabel'),localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},alert:m=>{throw new Error(m)},setInterval:fn=>timers.push(fn),setTimeout(){},speechSynthesis,SpeechSynthesisUtterance:function(t){this.text=t},Blob,URL,console});
  let code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
  const marker='reset();render();setInterval';assert.ok(code.includes(marker));
  code=code.replace(marker,'globalThis.studyTest={findSearchWord,runWordSearch,openWordSearch,closeWordSearch,lesson,progress,rawProgress,courseKey,record,save,reset,render,renderWords,renderListening,renderPractice,renderExtensive,renderRecords,persistDraft,speak,pauseSpeech,resumeSpeech,stopSpeech,seven,checkLocalRelease,firstWordAttempt,makeWordRound,restoreDailyWordRound,todayMistakeWords,articleEntry,articleText,articlePairs,parallelArticle,toggleArticleTranslation,lookupPosition,lookupPanelHtml,openArticleWord,closeArticleWord,enrolArticleWord,saveUserVocab,userVocabulary:()=>userVocab,state:()=>({ws,ls,ps,er,rate,selected,today,articleLookup,wordPractice}),setDate:k=>{selected=k;reset()},setTab:k=>{tab=k}};reset();render();setInterval');
  vm.runInContext(code,context);
  return {api:context.studyTest,saved,element,spoken,audioEvents,window,events,session,beacons,reloads:()=>reloadCount,advanceTime:iso=>{now=Date.parse(iso);timers.forEach(fn=>fn())}};
}

test('the header stays collapsible across navigation and reload without changing learning records',()=>{
  const rt=runtime(),key='cet4-header-expanded-v1';
  assert.equal(rt.element('headerPanel').hidden,true);
  assert.equal(rt.element('studyHeader').dataset.collapsed,'true');
  assert.equal(rt.element('headerToggle').ariaExpanded,'false');
  assert.equal((rt.element('mobileNav').innerHTML.match(/data-tab=/g)||[]).length,6);
  rt.api.record('word',0,false,{targetWord:'improve'});rt.api.state().ws.input='imporve';rt.api.persistDraft();
  const records=rt.saved.get(RECOVERY_STORAGE_KEY),draft=JSON.stringify(rt.api.state().ws);
  rt.element('headerToggle').onclick();
  assert.equal(rt.element('headerPanel').hidden,false);assert.equal(rt.saved.get(key),'true');
  assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),records);assert.equal(JSON.stringify(rt.api.state().ws),draft);
  rt.api.setDate('2026-09-14');rt.api.render();
  assert.equal(rt.element('headerPanel').hidden,false);assert.match(rt.element('dateBar').innerHTML,/data-date=/);
  const reloaded=runtime(Object.fromEntries(rt.saved));
  assert.equal(reloaded.element('headerPanel').hidden,false);
  reloaded.element('headerToggle').onclick();
  assert.equal(reloaded.element('headerPanel').hidden,true);assert.equal(reloaded.saved.get(key),'false');
  assert.equal(reloaded.saved.get(RECOVERY_STORAGE_KEY),records);
  assert.equal(runtime(Object.fromEntries(reloaded.saved)).element('headerPanel').hidden,true);
});

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
  assert.equal(rt.api.lesson().tasks.reduce((n,t)=>n+t.minutes,0),210);
  rt.api.setDate('2026-08-28');rt.advanceTime('2026-08-29T16:01:00Z');
  assert.equal(rt.api.state().today,'2026-08-30');assert.equal(rt.api.state().selected,'2026-08-28');
});

test('generated offline runtime starts, saves drafts, reloads and does not overwrite old same-day records',()=>{
  const legacy=JSON.stringify({'2026-08-28':{wordCorrect:9,wordTotal:12,notes:'原来记录',wordErrors:['think']}});
  let rt=runtime({[OLD_PROGRESS_KEYS[0]]:legacy});rt.api.setDate('2026-08-28');rt.api.renderWords(rt.api.lesson());
  assert.equal(rt.api.lesson().nw.length,12);assert.equal(rt.api.lesson().rev.length,18);assert.equal(rt.api.lesson().quizWords.length,30);assert.equal(rt.api.seven().length,7);
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
  rt.api.renderWords(rt.api.lesson());const target=rt.api.state().ws.order[rt.api.state().ws.i];
  rt.element('wordInput').oninput({target:{value:target.word}});
  rt.element('meaningInput').oninput({target:{value:target.meaning}});
  rt.element('checkWord').onclick();
  assert.equal(rt.api.state().ws.phase,'correct');assert.equal(rt.api.progress().wordCorrect,0);assert.equal(rt.api.progress().wordTotal,1);
  rt.element('nextWord').onclick();assert.equal(rt.api.state().ws.i,1);
  rt.api.setTab('records');rt.api.render();assert.match(rt.element('app').innerHTML,/原来记录/);
  assert.ok(rt.saved.has(RECOVERY_STORAGE_KEY));
});

test('full-word rounds contain all daily words once, shuffle and persist independently of the course snapshot',()=>{
  let rt=runtime();rt.api.setDate('2026-09-15');const L=rt.api.lesson();rt.api.renderWords(L);
  const round=rt.api.state().ws,names=round.order.map(x=>x.word);
  assert.equal(names.length,30);assert.equal(new Set(names).size,30);
  assert.deepEqual([...names].sort(),clone(L.all.map(x=>x.word)).sort());
  assert.notDeepEqual(names,L.all.map(x=>x.word));assert.equal(round.order.filter(x=>x.audio).length,15);
  rt.element('wordInput').oninput({target:{value:'draft spelling'}});
  const saved=Object.fromEntries(rt.saved),before=JSON.stringify(round);
  rt.api.setTab('listening');rt.api.render();rt.api.setDate('2026-09-16');rt.api.setDate('2026-09-15');rt.api.renderWords(rt.api.lesson());
  assert.equal(JSON.stringify(rt.api.state().ws),before);
  rt=runtime(saved);rt.api.setDate('2026-09-15');rt.api.renderWords(rt.api.lesson());
  assert.equal(JSON.stringify(rt.api.state().ws),before);
  assert.equal(rt.api.lesson().contentSignature,L.contentSignature);
  rt.api.setDate('2026-09-17');rt.api.renderWords(rt.api.lesson());assert.equal(rt.api.state().ws.order.length,20);
});

test('a legacy numeric word attempt and the old Chinese-mode draft keep their exact word, mode and first grade',()=>{
  const date='2026-09-15',L=buildRecoveryLesson(DATA,CURRICULUM,date),old=clone(L);
  old.quizWords=[...old.rev.slice(0,5),...old.nw.slice(0,5),...old.rev.slice(5,10),...old.nw.slice(5,10)];
  const target=old.quizWords[10],key='word:'+old.id+'|'+old.contentSignature+':10';
  const p={...blankProgress(),lessonSnapshot:old,wordTotal:1,wordCorrect:0,wordErrors:[target.word],attempts:{[key]:{group:'word',correct:false}},draft:{lessonId:old.id,ws:{i:10,input:'unfinished spelling',meaningInput:'',phase:'hint',hadError:true}}};
  const rt=runtime({[RECOVERY_STORAGE_KEY]:JSON.stringify({[date]:p})});rt.api.setDate(date);rt.api.renderWords(rt.api.lesson());
  const s=rt.api.state().ws,item=s.order[s.i];
  assert.equal(item.word,target.word);assert.equal(item.audio,false);assert.equal(s.input,'unfinished spelling');assert.equal(s.phase,'hint');
  assert.equal(s.order.length,30);assert.equal(rt.api.progress().wordTotal,1);assert.equal(rt.api.progress().wordCorrect,0);
  rt.element('wordInput').oninput({target:{value:target.word}});rt.element('checkWord').onclick();
  assert.equal(rt.api.state().ws.phase,'correct');assert.equal(rt.api.progress().wordTotal,1);assert.equal(rt.api.progress().wordCorrect,0);
  assert.equal(Object.keys(rt.api.progress().attempts)[0],key);assert.equal(rt.api.progress().snapshotArchive.length,0);
});

test('old completed twenty-word lessons retain grades while the additional ten words are tested exactly once',()=>{
  const date='2026-09-15',L=buildRecoveryLesson(DATA,CURRICULUM,date),old=clone(L);old.quizWords=old.all.slice(0,20);
  const attempts=Object.fromEntries(old.quizWords.map((w,i)=>['word:'+old.id+'|'+old.contentSignature+':'+i,{group:'word',correct:true,targetWord:w.word}]));
  const p={...blankProgress(),lessonSnapshot:old,completed:['words'],wordTotal:20,wordCorrect:20,attempts};
  const rt=runtime({[RECOVERY_STORAGE_KEY]:JSON.stringify({[date]:p})});rt.api.setDate(date);rt.api.renderWords(rt.api.lesson());
  assert.equal(rt.api.state().ws.i,20);assert.equal(rt.api.state().ws.done,false);assert.equal(rt.api.progress().completed.includes('words'),false);
  assert.equal(rt.api.state().wordPractice.legacyCompleted,true);
  for(let i=0;i<10;i++){
    const s=rt.api.state().ws,d=s.order[s.i];rt.element('wordInput').oninput({target:{value:d.word}});
    if(d.audio)rt.element('meaningInput').oninput({target:{value:d.meaning}});
    rt.element('checkWord').onclick();rt.element('nextWord').onclick();
  }
  assert.equal(rt.api.state().ws.done,true);assert.equal(rt.api.progress().wordTotal,30);assert.equal(rt.api.progress().wordCorrect,30);
  assert.equal(rt.api.progress().completed.includes('words'),true);
  for(const [id,a] of Object.entries(attempts))assert.deepEqual(clone(rt.api.progress().attempts[id]),a);
  const firstOrder=rt.api.state().ws.order.map(x=>x.word);rt.element('reshuffleAllWords').onclick();
  assert.notDeepEqual(rt.api.state().ws.order.map(x=>x.word),firstOrder);assert.equal(rt.api.state().ws.order.length,30);
  const d=rt.api.state().ws.order[0];rt.element('wordInput').oninput({target:{value:d.word}});rt.element('meaningInput').oninput({target:{value:d.meaning}});rt.element('checkWord').onclick();
  assert.equal(rt.api.progress().wordTotal,30);assert.equal(rt.api.progress().wordCorrect,30);
});

test('today mistake retry is inline, resumes on reload and never changes first scores or the main round',()=>{
  let rt=runtime();rt.api.setDate('2026-09-15');rt.api.renderWords(rt.api.lesson());
  assert.equal(rt.element('app').innerHTML.includes('id="startWrongRound" class="primary" disabled'),true);
  rt.element('wordInput').oninput({target:{value:'wrong'}});rt.element('meaningInput').oninput({target:{value:'不会'}});rt.element('checkWord').onclick();
  const first=p=>JSON.stringify({wordTotal:p.wordTotal,wordCorrect:p.wordCorrect,attempts:p.attempts,wordErrors:p.wordErrors,errorDetails:p.errorDetails});
  const score=first(rt.api.progress()),daily=JSON.stringify(rt.api.state().ws),target=rt.api.state().ws.order[0];
  rt.element('startWrongRound').onclick();
  assert.equal(rt.api.state().wordPractice.retry.order.length,1);assert.equal(rt.api.state().wordPractice.retry.order[0].word,target.word);
  assert.ok(rt.element('app').innerHTML.indexOf('今日错词重默')>rt.element('app').innerHTML.indexOf('今日全部单词默写'));
  assert.match(rt.element('app').innerHTML,/id="retryWordInput"/);
  rt.element('retryWordInput').oninput({target:{value:'unfinished retry'}});
  const inProgress=JSON.stringify(rt.api.state().wordPractice.retry);rt.element('startWrongRound').onclick();
  assert.equal(JSON.stringify(rt.api.state().wordPractice.retry),inProgress,'starting again cannot discard an unfinished retry');
  rt=runtime(Object.fromEntries(rt.saved));rt.api.setDate('2026-09-15');rt.api.renderWords(rt.api.lesson());
  assert.equal(JSON.stringify(rt.api.state().wordPractice.retry),inProgress);assert.equal(JSON.stringify(rt.api.state().ws),daily);
  rt.element('retryWordInput').oninput({target:{value:target.word}});rt.element('retryMeaningInput').oninput({target:{value:target.meaning}});rt.element('retryCheckWord').onclick();rt.element('retryNextWord').onclick();
  assert.equal(rt.api.state().wordPractice.retry.done,true);assert.equal(first(rt.api.progress()),score);assert.equal(JSON.stringify(rt.api.state().ws),daily);
  rt.element('startWrongRound').onclick();assert.equal(rt.api.state().wordPractice.history.filter(x=>x.kind==='retry').length,1);
  const p=rt.api.progress();rt.api.setDate('2026-09-16');rt.api.renderWords(rt.api.lesson());
  assert.equal(rt.api.todayMistakeWords(rt.api.lesson()).length,0,'yesterday errors are not today errors');
  rt.api.setDate('2026-09-15');assert.equal(first(rt.api.progress()),first(p));
});

test('listening full text is one compact bilingual passage while all dictation segments remain available',()=>{
  const rt=runtime();rt.api.setDate('2026-09-15');const L=rt.api.lesson();rt.api.state().ls.show=true;rt.api.renderListening(L);
  const markup=rt.element('app').innerHTML;
  assert.equal((markup.match(/class="parallel-unit"/g)||[]).length,1);
  assert.match(markup,/全文分段听写 1\/9/);assert.match(markup,/data-audio-pause/);
  assert.equal((markup.match(/data-lookup-word=/g)||[]).length,L.listening.passage.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g).length);
  assert.ok(markup.includes(L.listening.passageZh));assert.match(markup,/lang="zh-CN" hidden/);
});

test('a corrected same-date course gets a clean score bucket while old work remains archived',()=>{
  const date='2026-08-28',current=buildRecoveryLesson(DATA,CURRICULUM,date),old=clone(current);
  old.title='旧版重复课程';old.contentSignature='old-content-signature';
  const retry={order:[{word:'assess',audio:true}],input:'unfinished retry',done:false};
  const oldAttempt='word:'+old.id+':0',stored={...blankProgress(),lessonSnapshot:old,completed:['words'],wordCorrect:1,wordTotal:1,attempts:{[oldAttempt]:{group:'word',correct:true,targetWord:'assess'}},wordPractice:{version:2,courseKey:'old',retry,history:[{kind:'retry',done:true}],mistakes:['assess']},notes:'旧难点'};
  const rt=runtime({[RECOVERY_STORAGE_KEY]:JSON.stringify({[date]:stored})});rt.api.setDate(date);
  assert.equal(rt.api.lesson().cacheContentMismatch,true);
  assert.equal(rt.api.progress().wordTotal,0);assert.equal(rt.api.progress().completed.length,0);
  rt.api.record('word',0,false,{targetWord:current.quizWords[0].word,answer:'x'});
  assert.equal(rt.api.progress().wordTotal,1);assert.equal(rt.api.progress().wordCorrect,0);
  const raw=rt.api.rawProgress(),keys=Object.keys(raw.attempts);
  assert.equal(keys.length,1);assert.match(keys[0],new RegExp(current.contentSignature));
  assert.equal(raw.snapshotArchive.length,1);assert.equal(raw.snapshotArchive[0].progress.wordTotal,1);
  assert.ok(raw.snapshotArchive[0].progress.attempts[oldAttempt]);
  assert.deepEqual(clone(raw.snapshotArchive[0].progress.wordPractice),stored.wordPractice);
  assert.equal('snapshot' in raw.snapshotArchive[0],false);assert.equal(raw.notes,'旧难点');
});

test('synthetic listening and practice submissions save distinct results and preserve retries',()=>{
  const rt=runtime();rt.api.setDate('2026-08-28');const L=rt.api.lesson();
  rt.api.renderListening(L);
  rt.element('listenInput').oninput({target:{value:'wrong sentence'}});rt.element('checkListen').onclick();
  assert.equal(rt.api.progress().listeningTotal,1);assert.equal(rt.api.progress().listeningCorrect,0);
  assert.equal(rt.api.progress().wordErrors.length,0);assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.element('listenInput').oninput({target:{value:fullDictationItems(L.listening)[0].text}});rt.element('checkListen').onclick();
  assert.equal(rt.api.progress().listeningTotal,1);assert.equal(rt.api.progress().listeningCorrect,0);
  rt.element('listenRate').oninput({target:{value:'0.7'}});rt.api.speak('test');assert.equal(rt.spoken.at(-1).rate,.7);
  rt.api.pauseSpeech();rt.api.resumeSpeech();rt.api.stopSpeech();assert.deepEqual(rt.audioEvents.slice(-4),['speak','pause','resume','cancel']);
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

test('daily extensive article can be heard, answered, shadowed, retold and saved',()=>{
  const rt=runtime();rt.api.setDate('2026-09-12');const L=rt.api.lesson();rt.api.renderExtensive(L);
  assert.match(rt.element('app').innerHTML,/四步听说提升法/);assert.match(rt.element('app').innerHTML,/data-audio-pause/);
  assert.match(rt.element('app').innerHTML,/data-lookup-source="extensive"/);
  L.extensive.questions.forEach((q,i)=>rt.api.state().er.answers[i]=q.answer);
  rt.element('submitExtensive').onclick();assert.equal(rt.api.progress().extensiveTotal,2);assert.equal(rt.api.progress().extensiveCorrect,2);
  rt.element('shadowDone').onclick();rt.element('retellDone').onclick();
  assert.ok(rt.api.progress().completed.includes('extensive'));assert.equal(rt.api.state().er.shadowDone,true);assert.equal(rt.api.state().er.retellDone,true);
  const again=runtime(Object.fromEntries(rt.saved));again.api.setDate('2026-09-12');assert.equal(again.api.state().er.submitted,true);assert.equal(again.api.state().er.retellDone,true);
});

test('opening an article word shows Chinese but does not enrol it until explicit confirmation',()=>{
  let rt=runtime();rt.api.setDate('2026-09-11');const L=rt.api.lesson(),surface=L.reading.passage.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/)[0],entry=rt.api.articleEntry(surface);
  assert.ok(entry?.meaning);assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  const wrapped=rt.api.articleText(L.reading.passage,'reading');assert.match(wrapped,/data-lookup-word/);assert.equal(wrapped.includes(entry.meaning),false);
  assert.equal((wrapped.match(/data-lookup-word=/g)||[]).length,(L.reading.passage.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[]).length);
  assert.equal(rt.api.articleEntry('constructor'),null);
  rt.api.openArticleWord(surface,'reading');const panel=rt.api.lookupPanelHtml(L,'reading');assert.ok(panel.includes(entry.meaning));
  assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.api.closeArticleWord();assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.api.openArticleWord(surface,'reading');assert.equal(rt.api.enrolArticleWord(L),true);
  const stored=JSON.parse(rt.saved.get(USER_VOCAB_STORAGE_KEY));assert.equal(Object.keys(stored.items).length,1);assert.equal(stored.items[entry.word].active,true);
  assert.equal(stored.items[entry.word].dueDate,'2026-08-29');
  assert.equal(rt.api.progress().wordErrors.length,0);
  rt=runtime(Object.fromEntries(rt.saved));assert.equal(rt.api.userVocabulary().items[entry.word].active,true);
});

test('lookup cards stay beside the clicked word without rebuilding the article or changing first scores and drafts',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-09-15');const L=rt.api.lesson();
  rt.api.record('reading',0,false,{label:'test reading',answer:'A',expected:'B'});
  rt.api.state().ps.trans[0]={input:'My unfinished translation',checked:false};rt.api.persistDraft();
  rt.api.renderPractice(L);
  const before=rt.element('app').innerHTML,saved=rt.saved.get(RECOVERY_STORAGE_KEY),draft=JSON.stringify(rt.api.state().ps);
  const anchor=rt.element('articleWord'),surface=L.reading.passage.match(/[A-Za-z]+/)[0],entry=rt.api.articleEntry(surface);
  anchor.getBoundingClientRect=()=>({left:950,right:998,top:660,bottom:690,width:48,height:30});
  rt.api.openArticleWord(surface,'reading',anchor);
  const popup=rt.element('articleLookupPopover');
  assert.equal(popup.hidden,false);assert.ok(popup.innerHTML.includes(entry.meaning));
  assert.ok(parseFloat(popup.style.left)+360<=1024-8);assert.ok(parseFloat(popup.style.top)<660);
  assert.equal(anchor.dataset.lookupActive,'true');assert.equal(popup.focusOptions.preventScroll,true);
  assert.equal(rt.element('app').innerHTML,before);assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),saved);
  assert.equal(JSON.stringify(rt.api.state().ps),draft);assert.equal(Object.keys(rt.api.userVocabulary().items).length,0);
  rt.element('lookupSkip').onclick();assert.equal(popup.hidden,true);assert.equal(anchor.focusOptions.preventScroll,true);
  rt.api.openArticleWord(surface,'reading',anchor);rt.element('lookupAdd').onclick();
  assert.equal(rt.api.userVocabulary().items[entry.word].active,true);assert.equal(rt.element('app').innerHTML,before);
  rt.element('lookupRemove').onclick();assert.equal(rt.api.userVocabulary().items[entry.word].active,false);
  let prevented=false;rt.events.keydown({key:'Escape',preventDefault(){prevented=true}});
  assert.equal(prevented,true);assert.equal(popup.hidden,true);assert.equal(anchor.ariaExpanded,'false');
  rt.api.openArticleWord(surface,'reading',anchor);rt.events.scroll();assert.equal(popup.hidden,true);
  rt.api.openArticleWord(surface,'reading',anchor);rt.api.renderPractice(L);assert.equal(popup.hidden,true);
  assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),saved);assert.equal(JSON.stringify(rt.api.state().ps),draft);
});

test('lookup positioning handles screen edges, narrow screens and a shifted visual viewport',()=>{
  const {api}=runtime();
  for(const viewport of [{width:1280,height:800},{width:375,height:667},{width:320,height:240},{left:20,top:30,width:300,height:300}]){
    const left=viewport.left||0,top=viewport.top||0;
    for(const anchor of [
      {left:left+8,top:top+10,bottom:top+32},
      {left:left+viewport.width-40,top:top+viewport.height-42,bottom:top+viewport.height-12},
      {left:left+70,top:top+viewport.height/2,bottom:top+viewport.height/2+22}
    ]){
      const box=api.lookupPosition(anchor,{width:360,height:450},viewport),height=Math.min(450,box.maxHeight);
      assert.ok(box.left>=left+8);assert.ok(box.left+box.width<=left+viewport.width-8);
      assert.ok(box.top>=top+8);assert.ok(box.top+height<=top+viewport.height-8);
      assert.ok(box.top+height<=anchor.top-8||box.top>=anchor.bottom+8,'card must not cover its word');
    }
  }
});

test('bilingual articles use complete authored segments or matching paragraphs without guessing sentence alignment',()=>{
  const {api}=runtime();const clean=s=>s.replace(/\s+/g,' ').trim();
  for(const L of [...CURRICULUM.lessons,...Object.values(CURRICULUM.datedLessons)]){
    for(const [en,zh,source,authored,count] of [
      [L.reading.passage,L.reading.passageZh,'reading',[],1],
      [L.extensive.text,L.extensive.textZh,'extensive',[],3],
      [L.listening.passage,L.listening.passageZh,'listening',fullDictationItems(L.listening),fullDictationItems(L.listening).length]
    ]){
      const pairs=api.articlePairs(en,zh,authored),markup=api.parallelArticle(en,zh,source,authored);
      assert.equal(pairs.length,count,L.date+': '+source);
      assert.equal(clean(pairs.map(x=>x.text).join(' ')),clean(en));
      assert.equal(clean(pairs.map(x=>x.zh).join(' ')),clean(authored.length?authored.map(x=>x.zh).join(' '):zh));
      assert.equal((markup.match(/data-translation-key=/g)||[]).length,count);
      assert.equal((markup.match(/lang="zh-CN" hidden/g)||[]).length,count);
      assert.equal((markup.match(/data-lookup-word=/g)||[]).length,(en.match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)||[]).length);
    }
  }
  const unmatched=api.articlePairs('First.\n\nSecond.','第一，第二。');
  assert.equal(unmatched.length,1);assert.equal(unmatched[0].zh,'第一，第二。');
  const incomplete=api.articlePairs('First. Second.','完整中文',[{text:'First.',zh:'第一句'}]);
  assert.equal(incomplete.length,1);assert.equal(incomplete[0].text,'First. Second.');
});

test('revealing Chinese stays local to its paragraph and survives lookup and answer redraws without saving grades',()=>{
  const rt=runtime({},true);rt.api.setDate('2026-09-15');const L=rt.api.lesson();rt.api.renderExtensive(L);
  const before=rt.element('app').innerHTML,saved=rt.saved.get(RECOVERY_STORAGE_KEY);
  const match=before.match(/data-translation-key="([^"]+)" data-translation-id="([^"]+)"/);
  const button=rt.element('translationButton');button.dataset={translationKey:match[1],translationId:match[2]};
  rt.api.toggleArticleTranslation(button);assert.equal(button.ariaExpanded,'true');
  assert.equal(rt.element(match[2]+'-zh').hidden,false);assert.equal(rt.element('app').innerHTML,before);
  rt.api.openArticleWord(L.extensive.text.match(/[A-Za-z]+/)[0],'extensive',rt.element('wordAnchor'));
  assert.equal(rt.element(match[2]+'-zh').hidden,false);assert.equal(rt.element('app').innerHTML,before);
  rt.api.renderExtensive(L);
  const restored=rt.element('app').innerHTML;
  assert.equal((restored.match(/class="parallel-unit" data-translated="true"/g)||[]).length,1);
  assert.equal((restored.match(/lang="zh-CN" hidden/g)||[]).length,2);
  rt.api.toggleArticleTranslation(button);rt.api.renderExtensive(L);
  assert.equal((rt.element('app').innerHTML.match(/lang="zh-CN" hidden/g)||[]).length,3);
  assert.equal(rt.saved.get(RECOVERY_STORAGE_KEY),saved);
});

test('user vocabulary capacity keeps a newly added active word and evicts the oldest inactive item',()=>{
  const items={};
  const name=i=>'w'+String.fromCharCode(97+Math.floor(i/676)%26,97+Math.floor(i/26)%26,97+i%26);
  for(let i=0;i<MAX_USER_VOCABULARY;i++){const word=name(i);items[word]={word,meaning:'测试词',phonetic:'/wɜːd/',active:i!==0,dueDate:'2026-09-01',addedAt:new Date(Date.UTC(2025,0,1,0,0,i)).toISOString()}}
  const next=addUserVocabulary({version:1,items},{word:'newest',meaning:'最新加入的词',phonetic:'/ˈnjuːɪst/'},'2026-09-12','extensive');
  assert.equal(Object.keys(next.items).length,MAX_USER_VOCABULARY);assert.equal(next.items.newest.active,true);assert.equal(Object.hasOwn(next.items,name(0)),false);
});
