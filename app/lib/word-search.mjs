// Search-only metadata. No course objects or learner records are modified here.
export function normalizeSearchWord(value){
  const word=String(value||'').trim().toLowerCase().replace(/[’‘]/g,"'");
  return word.length<=60&&/^[a-z]+(?:[-'][a-z]+)*$/.test(word)?word:'';
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
  return {
    count:Object.keys(entries).length,
    find(value){
      const word=normalizeSearchWord(value);
      if(!word)return {word:'',invalid:true,entry:null,origins:[],families:[],verbs:[],suggestions:[]};
      const origins=forms.get(word)||[],bases=[...new Set([word,...origins.map(x=>x.base)])];
      const verbs=bases.filter(w=>Object.hasOwn(data.verbs||{},w)).map(base=>({base,entry:entry(base),note:data.verbNotes?.[base]||'',forms:Object.entries(formLabels).map(([kind,label])=>({kind,label,words:data.verbs[base][kind]||[]})).filter(x=>x.words.length)}));
      const direct=entry(word),derived=!direct&&origins.length?entry(origins[0].base):null;
      return {word,entry:direct,derived,origins:origins.map(x=>({...x,entry:entry(x.base)})),families:related(bases),verbs,suggestions:!direct&&!derived?suggestions(word):[]};
    }
  };
}
