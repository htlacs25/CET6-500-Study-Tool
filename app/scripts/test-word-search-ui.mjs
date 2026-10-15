import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createWordSearch,normalizeSearchQuery} from '../lib/word-search.mjs';

const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
const searchHelpers=template.slice(template.indexOf('    function findSearchWord('),template.indexOf('    function enrolArticleWord('));
const dictionary=JSON.parse(fs.readFileSync(new URL('../content/word-search.json',import.meta.url),'utf8'));
function fixture(){
  const elements=new Map(),events={},spoken=[];let selected='';
  const element=id=>{
    if(!elements.has(id))elements.set(id,{
      value:'',hidden:true,dataset:{},textContent:'',innerHTML:'',scrollTop:12,
      focus(){this.focused=true},
      querySelectorAll(selector){
        const key=selector==='[data-search-word]'?'search-word':'search-speak';
        this.buttons??={};
        return this.buttons[key]=[...this.innerHTML.matchAll(new RegExp('data-'+key+'="([^"]+)"','g'))].map(m=>({dataset:{[key==='search-word'?'searchWord':'searchSpeak']:m[1]}}));
      }
    });
    return elements.get(id);
  };
  const document={getElementById:element,addEventListener:(name,handler)=>events[name]=handler};
  const context=vm.createContext({document,window:{getSelection:()=>({toString:()=>selected}),addEventListener(){}},createWordSearch,normalizeSearchQuery,RECOVERY:{articleGlossary:{}},WORD_SEARCH_DATA:dictionary,
    wordPartOfSpeechLabel:x=>x.pos||'词性待核实',conciseWordMeaning:x=>x,
    esc:x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'),
    hiddenZh:x=>'<details>'+String(x).replaceAll('<','&lt;')+'</details>',speak:x=>spoken.push(x),closeArticleWord(){},articleLookup:null
  });
  vm.runInContext('let searchDictionary=null;'+searchHelpers+';globalThis.api={runWordSearch,openWordSearch,closeWordSearch,installWordSearch,installArticleLookup};',context);
  return {api:context.api,element,events,spoken,select:x=>selected=x};
}

test('Chinese results keep query and can open full English entry or speak only English',()=>{
  const f=fixture(),result=f.api.runWordSearch('学习');
  assert.equal(result.direction,'zh-en');assert.ok(result.matches.some(x=>x.word==='learn'));
  assert.equal(f.element('wordSearchInput').value,'学习');
  assert.match(f.element('wordSearchResults').innerHTML,/中文查英文/);
  const out=f.element('wordSearchResults'),audio=out.buttons['search-speak'].find(x=>x.dataset.searchSpeak==='learn');
  audio.onclick();assert.deepEqual(f.spoken,['learn']);
  out.buttons['search-word'].find(x=>x.dataset.searchWord==='learn').onclick();
  assert.equal(f.element('wordSearchInput').value,'learn');
  assert.match(f.element('wordSearchResults').innerHTML,/动词变化/);
  f.element('returnChineseSearch').onclick();
  assert.equal(f.element('wordSearchInput').value,'学习');
  assert.match(f.element('wordSearchResults').innerHTML,/中文查英文/);
});

test('selected Chinese works from toolbar and shortcut without replacing the study pane',()=>{
  const f=fixture();f.element('app').innerHTML='unchanged draft';
  f.api.installWordSearch();f.api.installArticleLookup();f.select('提高');
  f.element('wordSearchToggle').onclick();
  assert.equal(f.element('wordSearchInput').value,'提高');assert.equal(f.element('wordSearchPanel').hidden,false);
  f.api.closeWordSearch();let prevented=false;
  f.events.keydown({altKey:true,key:'k',preventDefault(){prevented=true}});
  assert.equal(prevented,true);assert.equal(f.element('wordSearchInput').value,'提高');
  assert.equal(f.element('app').innerHTML,'unchanged draft');
  assert.doesNotMatch(searchHelpers,/localStorage|saveUserVocab|recordFirstAttempt|fetch\(/);
});

test('empty, unknown, and broad Chinese searches show honest guidance and bounded results',()=>{
  const f=fixture();f.api.runWordSearch('');assert.match(f.element('wordSearchStatus').textContent,/中文词语/);
  const missing=f.api.runWordSearch('不存在的测试含义甲乙丙丁');assert.equal(missing.total,0);
  assert.match(f.element('wordSearchStatus').textContent,/暂未找到/);
  const broad=f.api.runWordSearch('人');assert.ok(broad.truncated);assert.ok(broad.matches.length<=30);
  assert.match(f.element('wordSearchStatus').textContent,/先显示前/);
  f.api.runWordSearch('<img src=x>');assert.equal(f.element('wordSearchResults').innerHTML,'');
  f.api.runWordSearch('written');assert.match(f.element('wordSearchResults').innerHTML,/wrote/);
  assert.match(template,/英文单词 \/ 中文词义/);
});
