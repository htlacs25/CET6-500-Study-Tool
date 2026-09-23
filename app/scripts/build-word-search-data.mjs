// Reproducible offline dictionary subset. No user data or browser access.
// Input: official ECDICT CSV and extracted WordNet 3.0 directory (both ignored caches).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'../..');
const csv=process.argv[2]||path.join(root,'runtime-temp/ecdict-word-search.csv');
const wn=process.argv[3]||path.join(root,'runtime-temp/WordNet-3.0');
const valid=w=>/^[a-z]+(?:[-'][a-z]+)*$/.test(w)&&w.length<=60;
const parseCSV=line=>{const out=[];let s='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){s+='"';i++}else q=!q}else if(c===','&&!q){out.push(s);s=''}else s+=c}out.push(s);return out};
const raw=fs.readFileSync(csv,'utf8'),lines=raw.split(/\r?\n/),header=parseCSV(lines.shift()),dict=new Map();
const labels={n:'n. 名词',v:'v. 动词',adj:'adj. 形容词',adv:'adv. 副词',prep:'prep. 介词',pron:'pron. 代词',conj:'conj. 连词',interj:'interj. 感叹词',art:'art. 冠词',num:'num. 数词'};
for(const line of lines){if(!line)continue;const cells=parseCSV(line),r=Object.fromEntries(header.map((h,i)=>[h,cells[i]||'']));const w=r.word;if(!valid(w)||!/[\u3400-\u9fff]/.test(r.translation))continue;
  const parts=new Set();for(const m of (r.translation+'\n'+r.definition).replace(/\\n/g,'\n').matchAll(/(?:^|[\s;,])(?:\d+\.\s*)?(vt|vi|adj|adv|n|v|a|s|r|prep|pron|conj|interj|art|num)\./g)){const p=m[1];parts.add(['vt','vi'].includes(p)?'v':['a','s'].includes(p)?'adj':p==='r'?'adv':p)}
  const exchange={};for(const part of r.exchange.split('/')){const [key,value]=part.split(':');if(key)exchange[key]=(value||'').split(',').filter(valid)}
  dict.set(w,{phonetic:r.phonetic,meaning:r.translation.replace(/\\n/g,'\n'),pos:[...parts].map(p=>labels[p]).join('；'),parts:[...parts],exchange,rank:Number(r.bnc)>0?Number(r.bnc):Number(r.frq)>0?Number(r.frq):100000,common:/\b(cet4|cet6|gk)\b/.test(r.tag)||r.oxford==='1'});
}
const families=[
  {n:['care','carefulness'],v:['care'],adj:['careful'],adv:['carefully']},
  {n:['accuracy'],adj:['accurate'],adv:['accurately']},
  {n:['activity','action'],v:['act'],adj:['active'],adv:['actively']},
  {n:['success'],v:['succeed'],adj:['successful'],adv:['successfully']},
  {n:['decision'],v:['decide'],adj:['decisive'],adv:['decisively']},
  {n:['strength'],v:['strengthen'],adj:['strong'],adv:['strongly']},
  {n:['creation','creativity'],v:['create'],adj:['creative'],adv:['creatively']},
  {n:['difference'],v:['differ'],adj:['different'],adv:['differently']},
  {n:['beauty'],v:['beautify'],adj:['beautiful'],adv:['beautifully']},
  {n:['belief'],v:['believe'],adj:['believable'],adv:['believably']},
  {n:['knowledge'],v:['know'],adj:['knowledgeable'],adv:['knowledgeably']},
  {n:['analysis'],v:['analyse','analyze'],adj:['analytical'],adv:['analytically']},
  {n:['description'],v:['describe'],adj:['descriptive'],adv:['descriptively']},
  {n:['protection'],v:['protect'],adj:['protective'],adv:['protectively']},
  {n:['production','productivity'],v:['produce'],adj:['productive'],adv:['productively']},
  {n:['education'],v:['educate'],adj:['educational'],adv:['educationally']},
  {n:['satisfaction'],v:['satisfy'],adj:['satisfactory'],adv:['satisfactorily']},
  {n:['importance'],adj:['important'],adv:['importantly']},
  {n:['possibility'],adj:['possible'],adv:['possibly']},
  {n:['happiness'],adj:['happy'],adv:['happily']},
  {n:['danger'],v:['endanger'],adj:['dangerous'],adv:['dangerously']}
];
// Parse only lexical pointers, keeping exact sense-word identity during traversal.
// Never use synset synonyms, semantic pointers, adjective pertainyms or verb frames.
const nodes=new Map(),byWord=new Map(),edges=new Map(),pending=[],posMap={n:'n',v:'v',a:'adj',s:'adj',r:'adv'};
const key=(pos,offset,i)=>(pos==='s'?'a':pos)+':'+offset+':'+i;
for(const [file,filePos] of [['noun','n'],['verb','v'],['adj','a'],['adv','r']]){
  for(const line of fs.readFileSync(path.join(wn,'dict','data.'+file),'utf8').split(/\r?\n/)){
    if(!/^\d{8} /.test(line))continue;
    const t=line.split(' | ')[0].trim().split(/\s+/),offset=t[0],count=parseInt(t[3],16);let at=4;
    for(let i=1;i<=count;i++){const w=t[at].replace(/\((?:a|p|ip)\)$/,'');at+=2;if(!valid(w))continue;const id=key(filePos,offset,i);nodes.set(id,{word:w,pos:posMap[filePos]});if(!byWord.has(w))byWord.set(w,[]);byWord.get(w).push(id)}
    const pc=Number(t[at++]);for(let i=0;i<pc;i++){const [symbol,to,pos,st]=t.slice(at,at+4);at+=4;if(symbol!=='+'&&!(symbol==='\\'&&filePos==='r'))continue;const s=parseInt(st.slice(0,2),16),d=parseInt(st.slice(2),16);if(s&&d)pending.push([key(filePos,offset,s),key(pos,to,d),symbol])}
  }
}
for(const [a,b,symbol] of pending){if(!nodes.has(a)||!nodes.has(b))continue;
  // Some adverb pointers use a meaning-equivalent adjective (faster -> quick).
  // Use spelling only to reject such edges, never to invent any relationship.
  if(symbol==='\\'){const adv=nodes.get(a).word,adj=nodes.get(b).word,stem=adj.replace(/[ye]$/,'');if(!adv.startsWith(adj)&&!(stem.length>=3&&adv.startsWith(stem)))continue}
  for(const [x,y] of [[a,b],[b,a]]){if(!edges.has(x))edges.set(x,new Set());edges.get(x).add(y)}}
const glossary=JSON.parse(fs.readFileSync(path.join(root,'app/content/article-glossary.json'),'utf8'));
const selected=new Set(Object.keys(glossary.entries).filter(w=>dict.has(w)));
for(const [w,r] of dict)if(r.common||r.rank<=12000)selected.add(w);
for(const f of families)for(const w of Object.values(f).flat()){if(!dict.has(w))throw Error('Family word missing: '+w);selected.add(w)}
const related={};
for(const word of [...selected]){
  const starts=byWord.get(word)||[],seen=new Set(starts),queue=starts.map(id=>[id,0]),groups={};
  for(let i=0;i<queue.length;i++){const [id,depth]=queue[i];if(depth>=2)continue;for(const next of edges.get(id)||[]){if(seen.has(next))continue;seen.add(next);queue.push([next,depth+1]);const n=nodes.get(next);if(n.word!==word&&dict.has(n.word)){(groups[n.pos]??=new Set()).add(n.word)}}}
  const result={};for(const [pos,words] of Object.entries(groups)){result[pos]=[...words].sort((a,b)=>dict.get(a).rank-dict.get(b).rank||a.localeCompare(b)).slice(0,4);for(const w of result[pos])selected.add(w)}
  if(Object.keys(result).length)related[word]=result;
}
// Exact own verb senses are retained even if exchange.0 also points to another verb.
const verbs={};
for(const w of [...selected]){const r=dict.get(w);if(!r.parts.includes('v')||!r.exchange.p?.length)continue;const v={};for(const [a,b] of [['p','past'],['d','participle'],['i','present'],['3','third']])if(r.exchange[a]?.length){v[b]=r.exchange[a];for(const f of v[b])if(dict.has(f))selected.add(f)}verbs[w]=v}
const override=(w,value,note)=>{verbs[w]={...verbs[w],...value};if(note)verbNotes[w]=note};
const verbNotes={};
override('be',{past:['was','were'],participle:['been'],present:['being'],third:['is']},'现在时还包括 am / are；过去时随主语使用 was / were。');
override('get',{participle:['got','gotten']},'gotten 常见于美式英语；具体选用取决于语境。');
override('learn',{past:['learned','learnt'],participle:['learned','learnt']});
override('bear',{participle:['borne','born']},'born 常用于出生；其他含义通常用 borne。');
override('lie',{past:['lay','lied'],participle:['lain','lied']},'躺：lie–lay–lain；说谎：lie–lied–lied。注意区别 lay（放置）–laid–laid。');
override('hang',{past:['hung','hanged'],participle:['hung','hanged']},'悬挂通常用 hung；绞死通常用 hanged。');
// Modal can and lexical can (把…装罐) must not be blended into one paradigm.
verbs.can={past:['could']};verbNotes.can='情态动词 can 的过去式是 could，无过去分词。另一个实义动词 can（装罐）为 canned / canned。';
dict.get('believably').meaning='adv. 可信地；令人信服地';
const entries={};for(const w of [...selected].sort()){const r=dict.get(w);entries[w]={phonetic:r.phonetic,meaning:r.meaning,pos:r.pos}}
const licenses={ecdict:fs.readFileSync(path.join(root,'THIRD_PARTY_NOTICES.md'),'utf8').split('## WordNet')[0].trim(),wordnet:fs.readFileSync(path.join(wn,'LICENSE'),'utf8')};
const data={version:1,sources:[{name:'ECDICT',url:'https://github.com/skywind3000/ECDICT',sha256:createHash('sha256').update(raw).digest('hex')},{name:'WordNet 3.0',url:'https://wordnet.princeton.edu/'}],licenses,entries,verbs,verbNotes,families,related};
fs.writeFileSync(path.join(root,'app/content/word-search.json'),JSON.stringify(data)+'\n');
console.log(JSON.stringify({entries:Object.keys(entries).length,verbs:Object.keys(verbs).length,families:families.length,related:Object.keys(related).length,bytes:Buffer.byteLength(JSON.stringify(data))}));
