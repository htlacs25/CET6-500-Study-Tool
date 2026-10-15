import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createWordSearch,normalizeSearchQuery,normalizeSearchWord} from '../lib/word-search.mjs';
import {conciseWordMeaning} from '../lib/study-engine.mjs';

test('Chinese query normalization tolerates pasted spaces and punctuation while English stays strict',()=>{
  for(const query of ['学习',' 学　习 ','“学习”','（学习）。','学\u200b习'])assert.equal(normalizeSearchQuery(query),'学习');
  assert.equal(normalizeSearchQuery(' WRITTEN '),'written');
  assert.equal(normalizeSearchQuery('don’t'),"don't");
  assert.equal(normalizeSearchWord('学习'),'');
  for(const query of ['',null,'。','学习<script>','学习work','two words','学习，工作','学'.repeat(61)])assert.equal(normalizeSearchQuery(query),'');
  assert.equal(normalizeSearchQuery('学'.repeat(60)),'学'.repeat(60));
  assert.equal(normalizeSearchQuery('𠀀'),'𠀀');
});

test('reverse search ranks exact meanings, base words and ordinary senses and exposes original entries',()=>{
  const glossary={entries:{studies:{meaning:'n. 学习；研究（study的复数）',base:'study'}}};
  const data={entries:{learner:{meaning:'n. 学习者'},learning:{meaning:'n. 学习'},study:{phonetic:'stʌdi',pos:'n. 名词；v. 动词',meaning:'n. 学习, 研究\nvt. 学习'},technical:{meaning:'[计] 学习'},learn:{meaning:'vt. 学习；认识到；得知'}},verbs:{learn:{present:['learning']}}};
  const before=JSON.stringify({glossary,data}),search=createWordSearch(glossary,data,{brief:conciseWordMeaning});
  const result=search.find(' “学 习” ');
  assert.equal(result.direction,'zh-en');assert.equal(result.query,'学习');assert.equal(result.word,'学习');
  assert.equal(result.total,6);assert.equal(result.truncated,false);
  assert.deepEqual(result.matches.slice(0,2).map(x=>x.word),['learn','study']);
  assert.equal(result.matches.at(-1).word,'learner');
  assert.equal(result.matches.at(-1).matchType,'contains');
  const study=result.matches.find(x=>x.word==='study');
  assert.equal(study.matchMeaning,'学习');assert.equal(study.matchType,'exact');
  assert.equal(study.meaning,data.entries.study.meaning);assert.equal(study.phonetic,'stʌdi');
  assert.equal(study.posLabel,data.entries.study.pos);assert.equal(study.brief,'学习；研究');
  assert.deepEqual(study,{...search.find('study').entry,matchMeaning:'学习',matchType:'exact'});
  assert.equal(JSON.stringify({glossary,data}),before);
});

test('metadata and grammatical notes do not become translations; parenthetical meanings remain intact',()=>{
  const search=createWordSearch({}, {entries:{
    was:{meaning:'be的过去式'},learning:{meaning:'v. 学习(learn的现在分词)'},
    participle:{meaning:'n. 过去分词'},coat:{meaning:'n. （涂料，油漆的）层, 外套'},
    unavailable:{meaning:'暂无可靠的简明释义'},marked:{meaning:'n. 标记',phonetic:'学习',pos:'学习'},
    nothing:{meaning:''},english:{meaning:'an English-only definition'},
    learn:{meaning:'vt.& vi. 学习'}
  }}, {brief:()=> '待核实'});
  assert.equal(search.find('过去式').total,0);
  assert.deepEqual(search.find('现在分词').matches,[]);
  assert.deepEqual(search.find('过去分词').matches.map(x=>x.word),['participle']);
  assert.deepEqual(search.find('学习').matches.map(x=>x.word),['learn','learning']);
  assert.equal(search.find('暂无').total,0);assert.equal(search.find('待核实').total,0);
  const coat=search.find('涂料').matches[0];
  assert.equal(coat.word,'coat');assert.equal(coat.matchType,'contains');
  assert.equal(coat.matchMeaning,'(涂料,油漆的)层');
});

test('Chinese results are unique, deterministic and capped while total counts all matches',()=>{
  const entries=Object.fromEntries(Array.from({length:45},(_,i)=>['word'+String.fromCharCode(97+Math.floor(i/26),97+i%26),{meaning:'n. 工作；工作\nv. 工作'}]));
  const first=createWordSearch({}, {entries}).find('工作');
  const second=createWordSearch({}, {entries:Object.fromEntries(Object.entries(entries).reverse())}).find('工作');
  assert.equal(first.total,45);assert.equal(first.matches.length,30);assert.equal(first.truncated,true);
  assert.equal(new Set(first.matches.map(x=>x.word)).size,30);assert.deepEqual(first,second);
  const empty=createWordSearch().find('学习');
  assert.deepEqual(empty,{direction:'zh-en',word:'学习',query:'学习',total:0,truncated:false,matches:[]});
});

test('real offline dictionary finds useful Chinese equivalents and preserves English lookup',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../content/word-search.json',import.meta.url),'utf8'));
  const glossary=JSON.parse(fs.readFileSync(new URL('../content/article-glossary.json',import.meta.url),'utf8'));
  const before=JSON.stringify({data,glossary}),search=createWordSearch(glossary,data,{brief:conciseWordMeaning});
  for(const [query,expected] of [['提高','improve'],['学习','study'],['学习','learn'],['改善','improve'],['阅读','read'],['认真','earnest'],['银行','bank']]){
    const result=search.find(query);
    assert.ok(result.matches.some(x=>x.word===expected),`${query} should include ${expected}: ${result.matches.map(x=>x.word)}`);
    assert.ok(result.total>=result.matches.length);assert.ok(result.matches.length<=30);
    assert.ok(result.matches.every(x=>x.meaning&&x.matchMeaning.includes(query)));
  }
  assert.equal(search.find('完全不可能存在的词义查询').total,0);
  assert.ok(search.find('written').verbs.some(x=>x.base==='write'));
  assert.deepEqual(search.find('saw').verbs.map(x=>x.base),['saw','see']);
  assert.ok(search.find('carefully').families.some(x=>x.items.some(y=>y.word==='care')));
  assert.ok(search.find('thnik').suggestions.includes('think'));
  assert.equal(search.find('<script>').invalid,true);assert.equal(createWordSearch().find('constructor').entry,null);
  assert.equal(JSON.stringify({data,glossary}),before);
});
