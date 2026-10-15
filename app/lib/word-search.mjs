// Search-only metadata. No course objects or learner records are modified here.
export function normalizeSearchWord(value){
  const word=String(value||'').trim().toLowerCase().replace(/[’‘]/g,"'");
  return word.length<=60&&/^[a-z]+(?:[-'][a-z]+)*$/.test(word)?word:'';
}

export function normalizeSearchQuery(value){
  const english=normalizeSearchWord(value);if(english)return english;
  const chinese=String(value||'').normalize('NFKC').replace(/[\s\u200b-\u200d\ufeff]/g,'')
    .replace(/^[，。！？、；：,.!?;:“”‘’「」『』《》〈〉【】\[\]()"'…]+|[，。！？、；：,.!?;:“”‘’「」『』《》〈〉【】\[\]()"'…]+$/g,'');
  return [...chinese].length<=60&&/^\p{Script=Han}+$/u.test(chinese)?chinese:'';
}

// Match dictionary senses, excluding grammatical cross-references and status text.
// Parenthetical explanations stay intact so their commas never create false senses.
function chineseSearchSenses(meaning){
  const split=(value,separators)=>{
    const parts=[];let part='',depth=0;
    for(const ch of value){
      if('(['.includes(ch))depth++;
      if(')]'.includes(ch))depth=Math.max(0,depth-1);
      if(!depth&&separators.test(ch)){parts.push(part);part=''}else part+=ch;
    }
    parts.push(part);return parts;
  };
  const grammar=/(?:过去式|过去分词|现在分词|第三人称|复数|最高级|比较级|词形|所有格|ing形式)/i;
  const text=String(meaning||'').normalize('NFKC').replace(/\([^()]*\)/g,note=>/[a-z]/i.test(note)&&grammar.test(note)?'':note);
  const senses=[];
  for(const block of split(text,/[;\n\r]/)){
    const special=/^\s*(?:(?:[a-z]+\.)\s*)*\[[^\]]+\]/i.test(block);
    for(const part of split(block,/[,、]/)){
      const label=part.replace(/^(?:(?:\[[^\]]*\]|(?:n|v|vt|vi|a|adj|ad|adv|pron|prep|conj|num|art|det|aux|modal|int|interj|pl)\.|[&\s])+)/gi,'').trim();
      if(!/\p{Script=Han}/u.test(label)||/^(?:暂无|尚无|释义待|待核实|待补充)/.test(label))continue;
      if(/^[a-z][a-z' -]*(?:的|为|是)?/i.test(label)&&grammar.test(label))continue;
      const key=label.replace(/[\s\u200b-\u200d\ufeff]/g,'').replace(/[。.!?]+$/g,'');
      if(key)senses.push({key,label,special:Number(special),position:senses.length});
    }
  }
  return senses;
}

export function createWordSearch(glossary={},data={},helpers={}){
  const entries={...(glossary.entries||{}),...(data.entries||{})};
  const forms=new Map(),families=new Map();
  const formLabels={past:'过去式',participle:'过去分词',present:'现在分词',third:'第三人称单数'};
  const posLabels={n:'名词',v:'动词',adj:'形容词',adv:'副词'};
  const has=word=>Object.hasOwn(entries,word)&&Boolean(entries[word]?.meaning);
  for(const [base,parts] of Object.entries(data.verbs||{})){
    for(const [kind,values] of Object.entries(parts)){
      if(!Object.hasOwn(formLabels,kind)||!Array.isArray(values))continue;
      for(const value of values){
        const form=normalizeSearchWord(value);if(!form)continue;
        if(!forms.has(form))forms.set(form,[]);
        forms.get(form).push({base,kind,label:formLabels[kind]});
      }
    }
  }
  for(const family of data.families||[]){
    for(const word of Object.values(family).flat()){
      if(!families.has(word))families.set(word,[]);
      families.get(word).push(family);
    }
  }
  const entry=word=>{
    if(!has(word))return null;
    const raw=entries[word];
    return {word,phonetic:raw.phonetic||'',meaning:raw.meaning,pos:raw.pos||'',
      posLabel:raw.pos||helpers.posLabel?.({...raw,word},glossary)||'词性待核实',
      brief:helpers.brief?.(raw.meaning)||raw.meaning};
  };
  const related=words=>{
    const groups={n:[],v:[],adj:[],adv:[]};
    for(const word of words)for(const family of families.get(word)||(data.related?.[word]?[data.related[word]]:[])){
      for(const pos of Object.keys(groups))for(const w of family[pos]||[]){
        if(!groups[pos].some(x=>x.word===w)&&has(w)){
          const item=entry(w),markers={n:/^n\./,v:/^v[ti]?\./,adj:/^(?:adj|a)\./,adv:/^adv\./};
          const matched=item.meaning.split('\n').filter(line=>markers[pos].test(line.trim())).join('\n');
          groups[pos].push({...item,brief:matched?(helpers.brief?.(matched)||matched):item.brief,familyPos:pos+'. '+posLabels[pos]});
        }
      }
    }
    return Object.entries(groups).filter(([,items])=>items.length).map(([pos,items])=>({pos,label:posLabels[pos],items}));
  };
  const suggestions=word=>{
    // One edit away, including an adjacent transposition; never silently autocorrect.
    const near=candidate=>{
      if(Math.abs(candidate.length-word.length)>1)return false;
      let a=0,b=0,errors=0;
      while(a<word.length&&b<candidate.length){
        if(word[a]===candidate[b]){a++;b++;continue}
        if(++errors>1)return false;
        if(word.length===candidate.length&&word[a]===candidate[b+1]&&word[a+1]===candidate[b]){a+=2;b+=2}
        else if(word.length>candidate.length)a++;
        else if(word.length<candidate.length)b++;
        else {a++;b++}
      }
      return errors+(word.length-a)+(candidate.length-b)<=1;
    };
    return Object.keys(entries).filter(w=>w!==word&&normalizeSearchWord(w)&&near(w)).sort((a,b)=>Number(b.startsWith(word.slice(0,2)))-Number(a.startsWith(word.slice(0,2)))||a.length-b.length||a.localeCompare(b)).slice(0,6);
  };
  let chineseIndex;
  const findChinese=query=>{
    // Built only when needed. Search never reads browser storage or mutates sources.
    chineseIndex??=Object.entries(entries).filter(([word])=>normalizeSearchWord(word)&&has(word)).map(([word,raw])=>({
      word,senses:chineseSearchSenses(raw.meaning),
      inflected:Number(Boolean((raw.base&&raw.base!==word)||(glossary.entries?.[word]?.base&&glossary.entries[word].base!==word)||(forms.get(word)||[]).some(form=>form.base!==word)))
    }));
    const compare=(a,b)=>a.exact-b.exact||a.special-b.special||a.inflected-b.inflected||a.length-b.length||a.position-b.position||a.word.length-b.word.length||(a.word<b.word?-1:a.word>b.word?1:0);
    const matches=[];
    for(const item of chineseIndex){
      let best;
      for(const sense of item.senses){
        if(!sense.key.includes(query))continue;
        const candidate={word:item.word,exact:Number(sense.key!==query),special:sense.special,inflected:item.inflected,length:[...sense.key].length,position:sense.position,matchMeaning:sense.label};
        if(!best||compare(candidate,best)<0)best=candidate;
      }
      if(best)matches.push(best);
    }
    matches.sort(compare);
    const limit=30;
    return {direction:'zh-en',word:query,query,total:matches.length,truncated:matches.length>limit,
      matches:matches.slice(0,limit).map(match=>({...entry(match.word),matchMeaning:match.matchMeaning,matchType:match.exact?'contains':'exact'}))};
  };
  return {
    count:Object.keys(entries).length,
    find(value){
      const word=normalizeSearchQuery(value);
      if(!word)return {word:'',invalid:true,entry:null,origins:[],families:[],verbs:[],suggestions:[]};
      if(/\p{Script=Han}/u.test(word))return findChinese(word);
      const origins=forms.get(word)||[],bases=[...new Set([word,...origins.map(x=>x.base)])];
      const verbs=bases.filter(w=>Object.hasOwn(data.verbs||{},w)).map(base=>({base,entry:entry(base),note:data.verbNotes?.[base]||'',forms:Object.entries(formLabels).map(([kind,label])=>({kind,label,words:data.verbs[base][kind]||[]})).filter(x=>x.words.length)}));
      const direct=entry(word),derived=!direct&&origins.length?entry(origins[0].base):null;
      return {word,entry:direct,derived,origins:origins.map(x=>({...x,entry:entry(x.base)})),families:related(bases),verbs,suggestions:!direct&&!derived?suggestions(word):[]};
    }
  };
}
