// Pure curriculum and scoring logic, shared with offline HTML and node tests.
export const RECOVERY_STORAGE_KEY = 'cet6-500-recovery-v1';
export const USER_VOCAB_STORAGE_KEY = 'cet6-500-user-vocab-v1';
export const MAX_USER_VOCABULARY = 1200;
export const OLD_PROGRESS_KEYS = ['cet6-500-offline-v2','cet6-500-study-progress-v2','cet6-500-study-progress-v1'];
export const RECOVERY_DATE = '2026-08-28';
export const ROADMAP = [
  {from:'2026-08-28',to:'2026-09-10',name:'两周基础恢复',goal:'常用词、主句谓语、be动词、短听力'},
  {from:'2026-09-11',to:'2026-09-30',name:'四级550衔接',goal:'扩大四级核心词汇，增加泛读、影子跟读和复述'},
  {from:'2026-10-01',to:'2026-10-31',name:'四级专项',goal:'按四级听读译写题型训练并逐步限时'},
  {from:'2026-11-01',to:'2026-11-30',name:'四级真题与限时训练',goal:'核验真题来源，分套练习并复盘'},
  {from:'2026-12-01',to:'2026-12-31',name:'模考与查漏补缺',goal:'根据实际考试日期安排整套练习与考前节奏'}
];
export function courseDay(k){return Math.floor((Date.parse(k+'T00:00:00Z')-Date.parse(RECOVERY_DATE+'T00:00:00Z'))/86400000)}
export function dateGap(a,b){return Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000)}
export function phaseFor(k){return ROADMAP.find(x=>k>=x.from&&k<=x.to)||ROADMAP[k<RECOVERY_DATE?0:ROADMAP.length-1]}
const validDate=k=>/^\d{4}-\d{2}-\d{2}$/.test(String(k))&&!Number.isNaN(Date.parse(k+'T00:00:00Z'));
const addDate=(k,n)=>new Date(Date.parse(k+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const cleanWord=value=>(String(value||'').toLowerCase().replace(/[’‘]/g,"'").match(/[a-z]+(?:[-'][a-z]+)*/)||[''])[0];
const WORD_POS_NAMES={n:'名词',v:'动词',vt:'及物动词',vi:'不及物动词',adj:'形容词',adv:'副词',pron:'代词',prep:'介词',conj:'连词',num:'数词',art:'冠词',det:'限定词',aux:'助动词',modal:'情态动词',interj:'感叹词'};
const WORD_POS_SUPPLEMENTS={balanced:['adj'],distraction:['n'],accurately:['adv'],actively:['adv'],adequately:['adv'],consistency:['n'],educational:['adj'],online:['adj','adv'],upload:['v','n'],download:['v','n'],data:['n'],flexibility:['n'],kindly:['adv','adj'],patiently:['adv'],equally:['adv'],honestly:['adv'],technically:['adv'],differently:['adv'],secretly:['adv'],unfairly:['adv'],responsibly:['adv'],intentionally:['adv'],reasonably:['adv'],nervously:['adv'],socially:['adv'],creator:['n'],buyer:['n'],supporter:['n'],baker:['n'],educated:['adj','v'],loving:['adj','v'],refined:['adj','v'],leaves:['n','v'],lives:['n','v']};
export function parseWordPartsOfSpeech(text=''){
  const found=[];
  for(const match of String(text).matchAll(/(?:^|[；;\n])\s*(?:(?:\[[^\]]*\]|pl\.)\s*)*(n|v|vt|vi|a|adj|ad|adv|pron|prep|conj|num|art|det|aux|modal|int|interj)\./gi)){
    const raw=match[1].toLowerCase(),code=({a:'adj',ad:'adv',int:'interj'})[raw]||raw;
    if(!found.includes(code))found.push(code);
  }
  return found;
}
export function wordPartsOfSpeech(entry={},glossary={}){
  // Display metadata only: do not add fields to lesson snapshots, fingerprints or grades.
  const item=typeof entry==='string'?{word:entry}:entry||{},entries=glossary?.entries||glossary||{};
  let key=String(item.word||item.surface||'').trim().toLowerCase().replace(/[’‘]/g,"'");
  if(Object.hasOwn(WORD_POS_SUPPLEMENTS,key))return [...WORD_POS_SUPPLEMENTS[key]];
  const explicit=parseWordPartsOfSpeech(item.pos||item.partOfSpeech||item.meaning);
  if(explicit.length)return explicit;
  const seen=new Set();
  while(key&&!seen.has(key)&&seen.size<8){
    seen.add(key);
    if(Object.hasOwn(WORD_POS_SUPPLEMENTS,key))return [...WORD_POS_SUPPLEMENTS[key]];
    const row=Object.hasOwn(entries,key)?entries[key]:null;
    const codes=parseWordPartsOfSpeech(row?.pos||row?.partOfSpeech||row?.meaning);
    if(codes.length)return codes;
    key=row?.base?String(row.base).toLowerCase():key.endsWith("'s")?key.slice(0,-2):'';
  }
  return [];
}
export function wordPartOfSpeechLabel(entry,glossary){
  return wordPartsOfSpeech(entry,glossary).map(code=>code+'. '+WORD_POS_NAMES[code]).join(' / ')||'待核实';
}
// Editorial, phrase-bound senses, not dictionary-order guesses. Keep these display
// annotations outside lesson objects so adding a gloss cannot invalidate scores.
// [exact phrase, clicked surface, meaning in that phrase, POS, optional lemma]
export const ARTICLE_CONTEXT_SENSES=[
  ['reading club','reading','阅读','n'],
  ['Saturday event','event','活动','n'],
  ['nearby community','community','社区','n'],
  ['club leader','leader','负责人','n'],
  ['preparing the same game','preparing','准备','v'],
  ['responsibility chart','chart','分工表','n'],
  ['Jia called the center','called','打电话联系','v'],
  ['prepared pictures and name cards','prepared','准备','v'],
  ['one volunteer was ill','volunteer','志愿者','n'],
  ['leading a story group','leading','带领','v'],
  ['the jobs were clear','clear','明确的','adj'],
  ['could adjust without confusion','adjust','作出调整','v'],
  ['could adjust without confusion','confusion','混乱','n'],
  ['sharing ideas','sharing','交流；分享','v'],
  ['accepting a clear responsibility','accepting','承担','v'],
  ['a plan changes','changes','发生变化','v'],
  ['check your responsibility','responsibility','负责的任务','n'],
  ['prepare the tables','prepare','布置好','v'],
  ['welcome families','welcome','迎接','v'],
  ['lead the first reading group','lead','带领','v'],
  ['your plan changes','changes','发生变化','v'],
  ['frequently flooded footpath','flooded','被水淹的','adj'],
  ['concrete drain','concrete','混凝土的','adj'],
  ['concrete drain','drain','排水沟','n'],
  ['garden sits lower','sits','位于','v'],
  ['heavy rain','heavy','（雨）大的','adj'],
  ['Stones slow the movement','slow','减缓','v'],
  ['hold part of the water','hold','蓄住','v'],
  ['release it gradually','release','释放（水）','v'],
  ['where puddles formed','formed','形成','v'],
  ['maintenance workers','maintenance','维护；养护','n'],
  ['landscape student','landscape','景观设计','n'],
  ['native plants','native','本地的','adj'],
  ['left one clear route','left','留出','v','leave'],
  ['one clear route','clear','畅通的','adj'],
  ['Leaves can block the entrance','leaves','树叶','n','leaf'],
  ['Leaves can block the entrance','block','堵塞','v'],
  ['plants need watering','watering','浇水','v','water'],
  ['their roots grow deep','roots','根','n'],
  ['take turns inspecting','turns','轮流（take turns）','n'],
  ['standing water remains','standing','积聚不流动的','adj'],
  ['standing water remains','remains','仍然存在','v'],
  ['success is more modest','modest','有限的；不算大的','adj'],
  ['rain not only as a problem','rain','雨水','n'],
  ['record how long','record','记录','v'],
  ['study record','record','学习记录','n'],
  ['paint a long fence','paint','刷油漆','v'],
  ['coats of paint','coats','（涂料的）层','n'],
  ['coats of paint','paint','油漆','n'],
  ['for a turn','turn','一次机会','n'],
  ['work looked desirable','work','劳动；干活','n'],
  ['access became limited','access','参与的机会','n'],
  ['used their pride','pride','自尊心','n'],
  ['points to a specific next action','points','指明','v'],
  ['missed times and room numbers','missed','没听清','v'],
  ['four review places','places','名额','n'],
  ['remain perfectly still','still','静止的；一动不动的','adj'],
  ['Employees could still contact someone','still','仍然','adv'],
  ['During the first week of term','term','学期','n'],
  ['check that it works','works','正常运行','v','work'],
  ['nobody recorded who would do each job','recorded','记录；记下','v','record'],
  ['After seven days of practice','practice','练习；训练','n'],
  ['He disliked the work','work','工作；劳动','n'],
  ['how long it might last','last','耐用；持续','v'],
  ['Let us order fifty washable cups','order','订购','v'],
  ['Their accounts did not always agree','accounts','叙述；讲述','n','account'],
  ['Speakers sign a form','form','表格','n'],
  ['its original form','form','形式；原有安排','n'],
  ['Sofia received the position','position','职位','n'],
  ['workers transfer light luggage separately','light','轻的','adj'],
  ['about a later connection','connection','接续交通；换乘班次','n'],
  ['missed times and room numbers','times','时间','n','time'],
  ['missed three listening questions','missed','答错','v','miss'],
  ['was ordered to paint','ordered','被要求；被命令','v','order'],
  ['Tom held the brush','held','拿着','v','hold'],
  ['acted as if painting','acted','装作','v','act'],
  ['boys valued the task','valued','看待；评价','v','value'],
  ['desire depends on presentation','presentation','呈现方式；包装方式','n'],
  ['three times as much','times','倍','n','time'],
  ['used many times','times','次','n','time'],
  ['Speakers sign a form','sign','签署','v'],
  ['history lives in repeated use','lives','存在；延续','v','live'],
  ['The position includes','position','职位','n'],
  ['human lives','lives','生命','n','life'],
  ['structure gave way','gave','坍塌（give way）','v','give'],
  ['choice costs time','costs','耗费','v','cost']
];
const articleTokens=text=>[...String(text||'').matchAll(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)].map(m=>({word:m[0].toLowerCase().replace(/[’‘]/g,"'"),index:m.index}));
const contextSenseIndex=new Map();
for(const row of ARTICLE_CONTEXT_SENSES){
  if(!contextSenseIndex.has(row[1]))contextSenseIndex.set(row[1],[]);
  contextSenseIndex.get(row[1]).push({row,tokens:articleTokens(row[0]).map(x=>x.word)});
}
for(const rules of contextSenseIndex.values())rules.sort((a,b)=>b.tokens.length-a.tokens.length);
export function articleTokenContext(text,offset){
  const source=String(text||'');
  for(const m of source.matchAll(/[^.!?\n]+(?:[.!?]+|$)/g)){
    if(offset>=m.index&&offset<m.index+m[0].length)return {text:m[0],offset:offset-m.index};
  }
  return {text:source,offset};
}
export function articleContextSense(surface,context,offset=-1){
  const word=String(surface||'').toLowerCase().replace(/[’‘]/g,"'"),matches=articleTokens(context).filter(x=>x.word===word);
  // Missing occurrence data must never select an arbitrary occurrence.
  if(offset<0){if(matches.length!==1)return null;offset=matches[0].index}
  const sentence=articleTokenContext(context,offset),tokens=articleTokens(sentence.text);offset=sentence.offset;
  const clicked=tokens.findIndex(x=>x.index===offset&&x.word===word);
  if(clicked<0)return null;
  for(const {row,tokens:phrase} of contextSenseIndex.get(word)||[]){
    for(let start=Math.max(0,clicked-phrase.length+1);start<=clicked;start++){
      if(start+phrase.length>tokens.length||!phrase.every((w,i)=>tokens[start+i].word===w))continue;
      return {meaning:row[2],pos:row[3],base:row[4]||'',phrase:row[0]};
    }
  }
  return null;
}
export function conciseWordMeaning(meaning,preferred=''){
  const split=(value,separators=/[；;，,、\n]/)=>{
    // Keep parenthetical explanations intact; commas inside them aren't senses.
    const result=[];let part='',depth=0;
    for(const ch of String(value||'')){
      if('（(['.includes(ch))depth++;
      if('）)]'.includes(ch))depth=Math.max(0,depth-1);
      if(!depth&&separators.test(ch)){result.push(part);part=''}else part+=ch;
    }
    result.push(part);return result;
  };
  const clean=value=>String(value).replace(/（[^（）]*为[^（）]*的词形或所有格形式）/g,'').replace(/^(?:(?:\[[^\]]*\]|pl\.|(?:n|v|vt|vi|a|adj|ad|adv|pron|prep|conj|num|art|det|aux|modal|int|interj)\.)\s*)+/gi,'').trim();
  const main=[],special=[];
  for(const block of split(preferred||meaning||'',/[；;\n]/)){
    const target=/\[[^\]]+\]/.test(block)?special:main;
    target.push(...split(block).map(clean).filter(Boolean));
  }
  return [...new Set(main.length?main:special)].slice(0,2).join('；')||'暂无可靠的简明释义';
}
export function splitListeningPassage(text){
  return (String(text||'').match(/[^.!?]+(?:[.!?]+|$)/g)||[]).map(x=>x.trim()).filter(Boolean);
}
export function fullDictationItems(listening={}){
  const authored=Array.isArray(listening.fullDictation)?listening.fullDictation.filter(x=>x&&String(x.text||'').trim()):[];
  if(authored.length)return authored.map(x=>({text:String(x.text).trim(),zh:String(x.zh||'').trim()}));
  const old=Array.isArray(listening.dictation)?listening.dictation:[],oldZh=Array.isArray(listening.dictationZh)?listening.dictationZh:[];
  return splitListeningPassage(listening.passage).map(text=>{
    const i=old.findIndex(x=>normEnglish(x)===normEnglish(text));
    return {text,zh:i>=0?String(oldZh[i]||''):''};
  });
}
export function blankUserVocabulary(){return {version:1,items:{}}}
export function normalizeUserVocabulary(value={}){
  const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{},normalized=new Map();
  for(const raw of Object.values(source.items&&typeof source.items==='object'&&!Array.isArray(source.items)?source.items:{})){
    const word=cleanWord(raw?.word),meaning=String(raw?.meaning||'').trim().slice(0,240);
    if(!word||!meaning)continue;
    normalized.set(word,{word,surface:String(raw.surface||word).slice(0,80),phonetic:String(raw.phonetic||'').slice(0,80),meaning,phrase:String(raw.phrase||'').slice(0,240),active:raw.active!==false,stage:Math.max(0,Math.min(4,Number.isInteger(raw.stage)?raw.stage:0)),dueDate:validDate(raw.dueDate)?raw.dueDate:'',addedAt:String(raw.addedAt||'').slice(0,40),lastReviewed:String(raw.lastReviewed||'').slice(0,10),lastResult:typeof raw.lastResult==='boolean'?raw.lastResult:null,sourceRefs:[...new Set((Array.isArray(raw.sourceRefs)?raw.sourceRefs:[]).map(x=>String(x).slice(0,160)))].slice(-20)});
  }
  const keep=[...normalized.values()].sort((a,b)=>Number(b.active)-Number(a.active)||(b.addedAt||'').localeCompare(a.addedAt||'')||a.word.localeCompare(b.word)).slice(0,MAX_USER_VOCABULARY),items=Object.fromEntries(keep.map(x=>[x.word,x]));
  return {version:1,items};
}
export function addUserVocabulary(previous,entry,date,source='article'){
  const vocab=normalizeUserVocabulary(previous),word=cleanWord(entry?.word||entry?.base||entry?.surface),meaning=String(entry?.meaning||'').trim().slice(0,240);
  if(!word||!meaning||!validDate(date))return vocab;
  const old=Object.hasOwn(vocab.items,word)?vocab.items[word]:null,ref=`${date}|${String(source).slice(0,40)}|${String(entry.surface||word).slice(0,80)}`;
  vocab.items[word]={word,surface:String(entry.surface||old?.surface||word).slice(0,80),phonetic:String(entry.phonetic||old?.phonetic||'').slice(0,80),meaning,phrase:String(entry.phrase||old?.phrase||'').slice(0,240),active:true,stage:old?.active?old.stage:0,dueDate:old?.active&&validDate(old.dueDate)?old.dueDate:addDate(date,1),addedAt:old?.active&&old.addedAt?old.addedAt:new Date().toISOString(),lastReviewed:old?.lastReviewed||'',lastResult:typeof old?.lastResult==='boolean'?old.lastResult:null,sourceRefs:[...new Set([...(old?.sourceRefs||[]),ref])].slice(-20)};
  return normalizeUserVocabulary(vocab);
}
export function removeUserVocabulary(previous,word){
  const vocab=normalizeUserVocabulary(previous),key=cleanWord(word);if(!Object.hasOwn(vocab.items,key))return vocab;
  vocab.items[key]={...vocab.items[key],active:false};return vocab;
}
export function dueUserVocabulary(previous,date,limit=4){
  if(!validDate(date))return[];
  return Object.values(normalizeUserVocabulary(previous).items).filter(x=>x.active&&validDate(x.dueDate)&&x.dueDate<=date).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||a.addedAt.localeCompare(b.addedAt)||a.word.localeCompare(b.word)).slice(0,Math.max(0,limit));
}
export function reviewUserVocabulary(previous,word,date,correct){
  const vocab=normalizeUserVocabulary(previous),key=cleanWord(word),old=Object.hasOwn(vocab.items,key)?vocab.items[key]:null;
  if(!old||!old.active||!validDate(date)||!validDate(old.dueDate)||old.dueDate>date||old.lastReviewed===date)return vocab;
  const increments=[2,4,7,14,14],stage=correct?Math.min(4,old.stage+1):old.stage;
  vocab.items[key]={...old,stage,dueDate:addDate(date,correct?increments[old.stage]||14:1),lastReviewed:date,lastResult:Boolean(correct)};
  return vocab;
}
function hashText(value){
  let hash=2166136261;
  for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
}
export function lessonDate(lesson={}){
  return lesson.date||String(lesson.id||'').match(/\d{4}-\d{2}-\d{2}$/)?.[0]||'';
}
export function lessonFingerprint(lesson={}){
  const sourceWords=lesson.sourceWords||lesson.nw||[];
  const core={
    date:lessonDate(lesson),title:lesson.title||'',grammarTip:lesson.grammarTip||'',
    sourceWords:sourceWords.map(w=>typeof w==='string'?{word:w}:w),grammar:lesson.grammar||[],
    reading:lesson.reading||null,listening:lesson.listening||null,extensive:lesson.extensive||null,sent:lesson.sent||[],trans:lesson.trans||[]
  };
  return hashText(JSON.stringify(core));
}
export function blankProgress(){return {completed:[],wordCorrect:0,wordTotal:0,listeningCorrect:0,listeningTotal:0,listeningChoiceCorrect:0,listeningChoiceTotal:0,quizCorrect:0,quizTotal:0,grammarCorrect:0,grammarTotal:0,readingCorrect:0,readingTotal:0,extensiveCorrect:0,extensiveTotal:0,sentenceCorrect:0,sentenceTotal:0,translationCorrect:0,translationTotal:0,wordErrors:[],listeningErrors:[],quizErrors:[],notes:'',attempts:{},errorDetails:[],draft:null,lessonSnapshot:null,snapshotArchive:[]}}
export function normEnglish(s){return String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim()}
export function allDictationWords(lesson={}){
  const rows=lesson.all||[...(lesson.rev||[]),...(lesson.nw||[])];
  return rows.filter((w,i,a)=>w?.word&&a.findIndex(x=>normEnglish(x.word)===normEnglish(w.word))===i);
}
export function shuffledWords(words,previous=[],random=Math.random){
  const rows=[...words];
  for(let i=rows.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]]}
  const same=order=>rows.length===order.length&&rows.every((w,i)=>w.word===order[i]?.word);
  if(rows.length>1&&same(words))rows.push(rows.shift());
  if(rows.length>1&&same(previous))rows.push(rows.shift());
  return rows;
}
export function firstWordAttempt(progress={},lesson={},target){
  const key=normEnglish(target),oldOrder=progress.lessonSnapshot?.quizWords||lesson.quizWords||[];
  for(const [id,attempt] of Object.entries(progress.attempts||{})){
    if(attempt.group!=='word')continue;
    const index=id.match(/:(\d+)$/)?.[1],word=attempt.targetWord||(index!==undefined?oldOrder[Number(index)]?.word:'');
    if(normEnglish(word)===key)return attempt;
  }
  return null;
}
export function makeWordRound(words,previous=[],random=Math.random){
  const order=shuffledWords(words,previous,random).map((w,i)=>({...w,audio:i<Math.ceil(words.length/2)}));
  return {version:2,order,i:0,input:'',meaningInput:'',phase:'try',score:0,hadError:false,results:{},done:!order.length,startedAt:new Date().toISOString()};
}
export function restoreDailyWordRound(lesson,progress={},draft={},random=Math.random){
  const all=allDictationWords(lesson),oldOrder=progress.lessonSnapshot?.quizWords||lesson.quizWords||[];
  const cursor=oldOrder[draft.i||0],hasDraft=!progress.completed?.includes('words')&&cursor&&(draft.input||draft.meaningInput||draft.i||draft.phase&&draft.phase!=='try');
  const taken=all.filter(w=>firstWordAttempt(progress,lesson,w.word)&&(!hasDraft||normEnglish(w.word)!==normEnglish(cursor.word)));
  const current=hasDraft?all.find(w=>normEnglish(w.word)===normEnglish(cursor.word)):null;
  const rest=all.filter(w=>!taken.includes(w)&&w!==current),round=makeWordRound(rest,[],random);
  const oldEntry=w=>{const index=oldOrder.findIndex(x=>normEnglish(x.word)===normEnglish(w.word));return {...w,audio:index>=0?index<Math.ceil(oldOrder.length/2):true}};
  round.order=[...taken.map(oldEntry),...(current?[oldEntry(current)]:[]),...round.order];round.i=taken.length;round.done=round.i>=round.order.length;
  if(current){
    for(const key of ['input','meaningInput','phase','hadError'])if(draft[key]!==undefined)round[key]=draft[key];
    const first=firstWordAttempt(progress,lesson,current.word);
    if(first&&draft.phase&&draft.phase!=='try')round.results[normEnglish(current.word)]={correct:first.correct,answer:draft.input||'',meaningInput:draft.meaningInput||''};
  }
  return round;
}
export function mergeLegacyStores(read){
  const out={};
  for(const key of [...OLD_PROGRESS_KEYS].reverse()){
    const raw=read(key);if(!raw)continue;
    const item=JSON.parse(raw);
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('学习记录格式异常');
    for(const [date,p] of Object.entries(item)){if(/^\d{4}-\d{2}-\d{2}$/.test(date))out[date]={...(out[date]||{}),...p}}
  }
  return out;
}
const scoreFields={word:['wordCorrect','wordTotal'],dictation:['listeningCorrect','listeningTotal'],listeningChoice:['listeningChoiceCorrect','listeningChoiceTotal'],grammar:['grammarCorrect','grammarTotal'],reading:['readingCorrect','readingTotal'],extensive:['extensiveCorrect','extensiveTotal'],vocab:['vocabCorrect','vocabTotal'],sentence:['sentenceCorrect','sentenceTotal'],translation:['translationCorrect','translationTotal']};
export function recordFirstAttempt(previous,group,id,correct,detail={}){
  if(!scoreFields[group])throw new Error('Unknown group: '+group);
  const p={...blankProgress(),...previous},key=group+':'+id;
  if(p.attempts[key])return p;
  p.attempts={...p.attempts,[key]:{...detail,group,correct:Boolean(correct)}};
  const rows=Object.values(p.attempts).filter(a=>a.group===group);
  const [c,t]=scoreFields[group];p[c]=rows.filter(a=>a.correct).length;p[t]=rows.length;
  if(['grammar','reading','vocab'].includes(group)){
    const q=Object.values(p.attempts).filter(a=>['grammar','reading','vocab'].includes(a.group));
    p.quizCorrect=q.filter(a=>a.correct).length;p.quizTotal=q.length;
  }
  if(!correct){
    const e={group,id,label:detail.label||'',tag:detail.tag||group,answer:detail.answer||'',expected:detail.expected||''};
    p.errorDetails=[...p.errorDetails,e];
    if(detail.targetWord)p.wordErrors=[...new Set([...p.wordErrors,detail.targetWord])];
    if(group==='dictation'&&detail.expected)p.listeningErrors=[...new Set([...p.listeningErrors,detail.expected])];
    if(!['word','dictation'].includes(group)&&detail.label)p.quizErrors=[...new Set([...p.quizErrors,detail.label])];
  }
  return p;
}
export function assessSentence(x,main,translated){
  const tokens=new Set(normEnglish(main).split(' '));
  const expected=(x.core||normEnglish(x.main).split(' ').filter(t=>t.length>2)).map(t=>normEnglish(t));
  const score=expected.length?expected.filter(t=>tokens.has(t)).length/expected.length:0;
  const missing=x.keywords.filter(k=>!String(translated).includes(k));
  return {score,missing,ok:(x.core?score===1:score>=.55)&&missing.length<=1};
}
export function assessTranslation(x,input){
  const n=normEnglish(input),accepted=(x.acceptedAnswers||[x.answer]).some(a=>normEnglish(a)===n);
  const missing=x.keywords.filter(k=>!n.includes(normEnglish(k)));
  const score=(x.keywords.length-missing.length)/Math.max(1,x.keywords.length);
  return {missing,score,ok:accepted||(x.acceptedAnswers?missing.length===0:score>=.65),accepted};
}
export function readiness(history,date){
  const days=Object.entries(history).filter(([k,p])=>k<date&&dateGap(date,k)<=7&&p.lessonSnapshot?.recovery);
  const complete=days.filter(([,p])=>p.wordTotal>=Math.max(1,p.wordPractice?.daily?.order?.length||p.lessonSnapshot?.quizWords?.length||12)&&p.listeningChoiceTotal>=2&&p.grammarTotal>=6&&p.readingTotal>=3);
  const rates={};
  for(const group of ['word','listeningChoice','grammar','reading']){
    const [c,t]=scoreFields[group];const total=days.reduce((n,[,p])=>n+(p[t]||0),0),correct=days.reduce((n,[,p])=>n+(p[c]||0),0);
    rates[group]={correct,total,rate:total?correct/total:null};
  }
  const enough=complete.length>=3;
  const advance=enough&&rates.word.rate>=.8&&rates.grammar.rate>=.8&&rates.reading.rate>=.75&&rates.listeningChoice.rate>=.7;
  return {advance,enough,completeDays:complete.length,rates,message:!enough?'近7天完整练习少于3天，证据不足，保持基础量。':advance?'基础练习达到衔接参考线，可逐步尝试稍长材料。':'先巩固未达参考线的模块，保持总量，不自动堆新题。'};
}
function mixOptions(questions,seed){
  return questions.map((q,qi)=>{
    const order=q.options.map((_,i)=>i);let state=(seed*97+qi*65537+19)>>>0;
    for(let i=order.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[order[i],order[j]]=[order[j],order[i]]}
    return {...q,options:order.map(i=>q.options[i]),optionsZh:q.optionsZh?order.map(i=>q.optionsZh[i]):undefined,answer:order.indexOf(q.answer)};
  });
}
export function buildRecoveryLesson(data,recovery,date,history={},userVocabulary={}){
  const di=courseDay(date);if(di<0)return null;
  const index=di%recovery.lessons.length,dated=recovery.datedLessons?.[date],gate=readiness(history,date);
  if(di>=recovery.lessons.length&&!dated){
    const phase=phaseFor(date),pending={id:'pending:'+date,date,unprepared:true,freshMaterial:false,recovery:true,foundation:true,weekly:(di+1)%7===0,index,di:Math.floor((Date.parse(date)-Date.parse('2026-08-22'))/864e5),recoveryDay:di+1,title:'课程尚未生成或同步',phase,gate,trainingName:'等待课程更新',grammarTip:'为防止把旧题冒充新题，本日练习暂不开放。',nw:[],rev:[],quizWords:[],all:[],priorityErrors:[],reading:{title:'Pending lesson',titleZh:'阅读材料待生成',passage:'',passageZh:'',questions:[],level:'待更新',topic:'课程完整性保护'},listening:{title:'Pending lesson',titleZh:'听力材料待生成',passage:'',passageZh:'',dictation:[],dictationZh:[],questions:[],level:'待更新',tip:'同步完成后再开始。'},extensive:{title:'Pending article',titleZh:'每日泛读待生成',text:'',textZh:'',questions:[],keyPhrases:[]},sent:[],trans:[],grammar:[],taskCount:0,tasks:[],wordReviewRule:'课程同步后再安排固定复习量。',sourceNote:'系统已阻止循环旧题；已有成绩、错题和草稿不会删除。'};
    const contentSignature=lessonFingerprint(pending);
    return {...pending,contentSignature,contentRevision:'pending-'+contentSignature};
  }
  const seed=dated||recovery.lessons[index];
  const foundation=di<14||!gate.advance,weekly=(di+1)%7===0;
  const dueManual=dueUserVocabulary(userVocabulary,date,6);
  const pool=[...dueManual,...recovery.words,...data.WORDS].filter((w,i,a)=>a.findIndex(x=>x.word===w.word)===i);
  const find=n=>pool.find(w=>w.word.toLowerCase()===String(n).toLowerCase());
  const past=Object.entries(history).filter(([k])=>k<date).sort(([a],[b])=>b.localeCompare(a));
  const latestWordResult=new Map(),latestWordDate=new Map();
  for(const [k,p] of past){
    const packDate=k;
    const runs=[p,...(Array.isArray(p.snapshotArchive)?[...p.snapshotArchive].reverse().map(x=>x.progress).filter(Boolean):[])];
    for(const run of runs){
      for(const n of run.wordPractice?.mistakes||[])if(!latestWordResult.has(n)){
        latestWordResult.set(n,false);latestWordDate.set(n,packDate);
      }
      for(const a of Object.values(run.attempts||{}))if(a.group==='word'&&a.targetWord&&!latestWordResult.has(a.targetWord)){
        latestWordResult.set(a.targetWord,a.correct);latestWordDate.set(a.targetWord,packDate);
      }
      for(const n of run.wordErrors||[])if(!latestWordResult.has(n)){
        latestWordResult.set(n,false);latestWordDate.set(n,packDate);
      }
    }
  }
  const reviewGaps=[1,3,7,14],dueWords=[];
  for(const [k,p] of past){
    const age=dateGap(date,k);
    if(reviewGaps.includes(age)){
      dueWords.push(...(p.lessonSnapshot?.nw||[]).map(w=>w.word));
    }
  }
  // Reviews not yet attempted still follow the prepared D1/D3/D7/D14 packs.
  for(const gap of reviewGaps)if(di>=gap)dueWords.push(...recovery.lessons[(di-gap)%14].words.map(w=>w.word));
  const authoredWords=Array.isArray(seed.words)?seed.words:[],authoredSet=new Set(recovery.words.map(w=>w.word.toLowerCase()));
  const extraBank=data.WORDS.filter(w=>!authoredSet.has(w.word.toLowerCase()));
  const extraStart=(di*4)%Math.max(1,extraBank.length),extraWords=Array.from({length:12},(_,i)=>extraBank[(extraStart+i)%extraBank.length]);
  const nw=weekly?[]:[...authoredWords,...extraWords].filter((w,i,a)=>w&&a.findIndex(x=>x.word.toLowerCase()===w.word.toLowerCase())===i).slice(0,12);
  const priorPacks=recovery.lessons.slice(0,Math.min(index,14)).flatMap(x=>x.words).map(w=>w.word).reverse();
  const baseline=['improve','think','decide','enough','remember','read','write','understand','forget','begin','finish','time','help','question','answer','friend','practice','review'];
  const pendingErrors=[...latestWordResult.entries()].filter(([,correct])=>correct!==true).map(([n])=>n).filter(n=>find(n)&&!nw.some(w=>w.word===n));
  const scheduledErrors=pendingErrors.filter(n=>{
    const age=dateGap(date,latestWordDate.get(n));
    return reviewGaps.includes(age)||(age>14&&age%14===0);
  });
  // A word is prioritised only when its spaced-review date arrives. Rotate the
  // due group by calendar day so one persistent error cannot stay first daily.
  const errorOffset=scheduledErrors.length?di%scheduledErrors.length:0;
  const rotatingErrors=[...scheduledErrors.slice(errorOffset),...scheduledErrors.slice(0,errorOffset)];
  const priorityErrors=rotatingErrors.slice(0,6),priorityUserWords=dueManual.map(x=>x.word).filter(n=>!nw.some(w=>w.word===n)),errorSet=new Set(pendingErrors);
  const ordinaryNames=[...dueWords,...priorPacks,...baseline,...recovery.words.map(w=>w.word)].filter(n=>!errorSet.has(n));
  const priorityNames=[];
  for(let i=0;i<Math.max(priorityErrors.length,priorityUserWords.length);i++){if(priorityErrors[i])priorityNames.push(priorityErrors[i]);if(priorityUserWords[i])priorityNames.push(priorityUserWords[i])}
  const candidateNames=[...priorityNames,...ordinaryNames];
  const reviewTarget=weekly?20:18;
  const rev=candidateNames.map(find).filter(Boolean).filter((w,i,a)=>!nw.some(n=>n.word===w.word)&&a.findIndex(n=>n.word===w.word)===i).slice(0,reviewTarget);
  // The curriculum exposes every daily word; the browser persists its shuffled round separately.
  const quizWords=[...rev,...nw];
  const phase=phaseFor(date),advanced=!foundation&&date>='2026-10-01';
  let reading=seed.reading,listening=seed.listening,extensive=seed.extensive,sent=[seed.sent],trans=seed.trans;
  if(!foundation&&!dated){
    reading=data.CET_READINGS[di%data.CET_READINGS.length];
    const li=di%data.LISTENINGS.length,x=data.LISTENINGS[li],support=data.LISTENING_SUPPORT[li];
    listening={...x,...support,dictation:x.dictation.slice(0,advanced?5:3),dictationZh:support.dictationZh.slice(0,advanced?5:3),questions:x.questions.map((q,i)=>({...q,...data.LISTENING_QUESTION_ZH[li][i]}))};
    sent=Array.from({length:advanced?2:1},(_,i)=>data.CET_LONG_SENTENCES[(di*2+i)%data.CET_LONG_SENTENCES.length]);
    trans=Array.from({length:2},(_,i)=>data.CET_TRANSLATIONS[(di*2+i)%data.CET_TRANSLATIONS.length]);
  }
  reading={...reading,questions:mixOptions(reading.questions,di+1)};
  listening={...listening,fullDictation:fullDictationItems(listening),questions:mixOptions(listening.questions,di+101)};
  const grammar=mixOptions(seed.grammar,di+201);
  const weekend=[0,6].includes(new Date(date+'T00:00:00Z').getUTCDay());
  const minutes=weekend?[45,35,20,30,25,40,15]:[35,25,15,20,15,30,10];
  const labels=[weekly?'20词周测与错词复习':nw.length+'个新/激活词＋'+rev.length+'个复习词','短听力理解＋'+listening.fullDictation.length+'段全文听写','1个语法点＋6题','阅读1篇＋'+reading.questions.length+'题','句子主干'+sent.length+'句＋表达2句','每日泛读＋影子跟读＋60秒复述','错题复盘＋共同记录难点'];
  const targets=['words','listening','grammar','reading','sentences','extensive','review'],tabs=['words','listening','practice','practice','practice','extensive','records'];
  const lesson={id:'recovery-v2:'+date,date,freshMaterial:di<recovery.lessons.length||Boolean(dated),recovery:true,foundation,weekly,index,di:Math.floor((Date.parse(date)-Date.parse('2026-08-22'))/864e5),recoveryDay:di+1,title:seed.title,phase,gate,trainingName:di<14?'基础恢复':advanced?'四级专项模拟':'四级550衔接',grammarTip:seed.grammarTip,sourceWords:nw,nw,rev,quizWords,all:[...rev,...nw],priorityErrors,priorityUserWords,reading,listening,extensive,sent,trans,grammar,taskCount:7,tasks:labels.map((label,i)=>({id:targets[i],tab:tabs[i],label,minutes:minutes[i]})),wordReviewRule:'固定18个复习位（周测20个）：到期错词、自主加入的文章词和间隔旧词共同安排。只有你点“加入后续背诵”的文章词才进入队列；到期词按固定容量顺延，不额外加量。',sourceNote:'目标为2026年12月四级550分。课程文章与题目为原创分级模拟或注明来源的公版名著改写；浏览器合成朗读不冒充真题录音。文章点词释义来自离线词典，查看词义不会自动加入复习。'};
  const contentSignature=lessonFingerprint(lesson);
  return {...lesson,contentSignature,contentRevision:'course-'+contentSignature};
}
export function hasAnswerWork(p={}){
  if(p.wordPractice?.daily?.order?.length)return true;
  if((p.completed||[]).length||Object.keys(p.attempts||{}).length||['wordTotal','listeningTotal','listeningChoiceTotal','quizTotal','extensiveTotal','sentenceTotal','translationTotal'].some(k=>p[k]>0))return true;
  const d=p.draft||{};
  return Boolean(d.ws?.input||d.ws?.meaningInput||d.ws?.i||d.ls?.input||d.ls?.i||Object.keys(d.ls?.answers||{}).length||Object.keys(d.ps?.answers||{}).length||Object.values(d.ps?.sent||{}).some(x=>x.main||x.trans)||Object.values(d.ps?.trans||{}).some(x=>x.input)||Object.keys(d.er?.answers||{}).length||d.er?.submitted||d.er?.shadowDone||d.er?.retellDone);
}
export function chooseDailyLesson(date,p,fresh){
  const old=p?.lessonSnapshot;
  if(!old||!hasAnswerWork(p))return fresh;
  const oldDate=lessonDate(old);
  if(oldDate!==date)return {...fresh,cacheDateMismatch:true,staleSnapshotDate:oldDate||'未知日期'};
  const oldSignature=old.contentSignature||lessonFingerprint(old),freshSignature=fresh.contentSignature||lessonFingerprint(fresh);
  if(oldSignature!==freshSignature)return {...fresh,cacheContentMismatch:true,staleContentSignature:oldSignature};
  return old; // Only reuse answers when the snapshot belongs to this date and this exact question set.
}
export function difficultiesFor(p,diagnostic){
  const a=[],tags=new Set((p.errorDetails||[]).map(x=>x.tag));
  if(tags.has('main-verb'))a.push('主干识别：将修饰从句中的动词与主句谓语分开。');
  if(tags.has('be-verb'))a.push('句子完整性：检查形容词前是否缺少am/is/are。');
  if(tags.has('spelling')||p.wordErrors?.length)a.push('词形与拼写：'+(p.wordErrors||[]).slice(0,6).join('、'));
  if(tags.has('word-form'))a.push('搭配与词性：复习listen to、every day及动词形式。');
  if(p.listeningErrors?.length)a.push('句子听写：'+p.listeningErrors.length+'句需重听，区分不认识与没有辨出声音。');
  if(p.listeningChoiceTotal&&p.listeningChoiceCorrect/p.listeningChoiceTotal<.7)a.push('听力理解：本次细节或顺序题需要复盘。');
  if(p.readingTotal&&p.readingCorrect/p.readingTotal<.75)a.push('阅读定位：每题回到原文指出依据。');
  if(p.extensiveTotal&&p.extensiveCorrect/p.extensiveTotal<.7)a.push('泛读理解：先用每段首尾句概括主旨，再定位题目依据。');
  if(p.sentenceTotal&&p.sentenceCorrect/p.sentenceTotal<.7)a.push('句子分析规则初判未达标；可能有合理同义表达，请共同复核。');
  if(p.translationTotal&&p.translationCorrect/p.translationTotal<.7)a.push('表达规则初判未达标；检查谓语、词形，保留合理同义表达。');
  return a.length?a:['当天暂无足够错题证据。对话起点关注：'+diagnostic.focus.slice(0,3).join('；')+'。'];
}
