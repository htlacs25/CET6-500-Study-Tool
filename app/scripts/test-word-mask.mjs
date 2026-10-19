import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// All storage, DOM nodes and learning records below are synthetic fixtures.
// This suite never starts a browser or reads any real localStorage/profile.
const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
const start=template.indexOf('    const STUDY_WORD_VIEW_KEY=');
const end=template.indexOf('    function articleEntry(',start);
assert.ok(start>=0&&end>start,'the independent word-card display helpers must exist');
const helpers=template.slice(start,end);
const cardHelpers=template.slice(template.indexOf('    function wordPosHtml('),start);
const clone=value=>JSON.parse(JSON.stringify(value));
const decode=value=>String(value).replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const escape=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

// Small DOM implementation for the generated cards and their real event handlers.
// HTML is parsed afresh when the application replaces the word-list region.
class Element {
  constructor(tag='div',attrs={},parent=null){this.tagName=tag.toUpperCase();this.attrs={...attrs};this.parent=parent;this.children=[];this.dataset={};this.hidden=Object.hasOwn(attrs,'hidden');this.disabled=Object.hasOwn(attrs,'disabled');for(const [key,value]of Object.entries(attrs))if(key.startsWith('data-'))this.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;}
  set innerHTML(html){this.children=[];const stack=[this];for(const token of String(html).match(/<[^>]*>|[^<]+/g)||[]){if(token.startsWith('</')){stack.pop();continue;}if(token.startsWith('<')){const match=token.match(/^<([\w-]+)([\s\S]*?)\/?\s*>$/);if(!match)continue;const attrs={};for(const attr of match[2].matchAll(/([\w-]+)(?:="([^"]*)")?/g))attrs[attr[1]]=decode(attr[2]??'');const node=new Element(match[1],attrs,stack.at(-1));stack.at(-1).children.push(node);if(!/^(?:input|br|hr|img|meta|link)$/i.test(match[1])&&!token.endsWith('/>'))stack.push(node);}else stack.at(-1).children.push(decode(token));}}
  set textContent(value){this.children=[String(value)];}
  get textContent(){return this.children.map(x=>typeof x==='string'?x:x.textContent).join('');}
  setAttribute(name,value){this.attrs[name]=String(value);}
  getAttribute(name){return this.attrs[name]??null;}
  matches(selector){return selector.split(',').some(part=>{const s=part.trim();if(s.startsWith('.'))return(this.attrs.class||'').split(/\s+/).includes(s.slice(1));const attr=s.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);if(attr)return Object.hasOwn(this.attrs,attr[1])&&(attr[2]===undefined||this.attrs[attr[1]]===attr[2]);return this.tagName.toLowerCase()===s.toLowerCase();});}
  querySelectorAll(selector){const found=[];for(const child of this.children)if(child instanceof Element){if(child.matches(selector))found.push(child);found.push(...child.querySelectorAll(selector));}return found;}
  querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
  closest(selector){for(let node=this;node;node=node.parent)if(node.matches(selector))return node;return null;}
  focus(options){this.focused=true;this.focusOptions=options;}
  click(){if(this.disabled)return;const event={target:this,stopped:false,stopPropagation(){this.stopped=true;}};for(let node=this;node&&!event.stopped;node=node.parent)node.onclick?.(event);}
}
function visibleText(node){if(node.hidden)return'';return node.children.filter(child=>node.tagName!=='DETAILS'||Object.hasOwn(node.attrs,'open')||child?.tagName==='SUMMARY').map(child=>typeof child==='string'?child:visibleText(child)).join(' ');}

const wordA={word:'improve',phonetic:'/ɪmˈpruːv/',pos:'v. 动词',meaning:'改善；提高',phrase:'improve skills',example:'Daily practice can improve your skills.',exampleZh:'每日练习可以提高你的技能。'};
const wordB={word:'useful',phonetic:'/ˈjuːsfəl/',pos:'adj. 形容词',meaning:'有用的',phrase:'a useful idea',example:'This is a useful idea.',exampleZh:'这是个有用的想法。'};
function fixture({preference,storageThrows=false}={}){
  const host=new Element(),storage=new Map(preference===undefined?[]:[['cet4-word-card-view-v1',preference]]),reads=[],writes=[],spoken=[],saves=[];
  let selection='';
  const L=clone({all:[wordA,wordB],nw:[wordA],rev:[wordB],sourceWords:[wordA]});
  const protectedRecords={store:{'2026-10-18':{firstScore:31,answered:['prior-word'],draft:'unsubmitted answer',reviewRound:{score:2}}},ws:{i:7,input:'unfinished spelling',meaningInput:'未提交',score:4},lesson:L};
  const before=JSON.stringify(protectedRecords);
  const userVocab={items:{}};
  const document={getElementById:id=>id==='studyWordView'?host:null,querySelectorAll:selector=>host.querySelectorAll(selector)};
  const context=vm.createContext({document,window:{getSelection:()=>selection},localStorage:{getItem(key){reads.push(key);if(storageThrows)throw Error('unavailable storage');return storage.get(key)??null;},setItem(key,value){if(storageThrows)throw Error('unavailable storage');writes.push([key,value]);storage.set(key,value);}},selected:'2026-10-18',userVocab,RECOVERY:{articleGlossary:{}},esc:escape,wordPartOfSpeechLabel:entry=>entry.pos,hiddenZh:(value,label)=>'<details><summary>'+escape(label)+'</summary><p>'+escape(value)+'</p></details>',speakStudyWord:value=>spoken.push(value),speak:()=>{throw Error('word cards must use the word pronunciation path');},saveUserVocab:value=>{saves.push(value);return true;},addStudyReviewVocabulary:(state,entry,date)=>({state,entry,date}),dateKey:()=> '2026-10-18',store:protectedRecords.store,ws:protectedRecords.ws});
  vm.runInContext(cardHelpers+helpers+';globalThis.api={studyWordListHtml,bindStudyWordView,studyWordMaskState,readStudyWordView};',context);
  const render=()=>{host.innerHTML=context.api.studyWordListHtml(L);context.api.bindStudyWordView(L);};
  render();
  return{host,storage,reads,writes,spoken,saves,L,render,context,select:value=>selection=value,button:selector=>{const node=host.querySelector(selector);assert.ok(node,'missing button '+selector);return node;},card:word=>{const node=host.querySelector('[data-study-word="'+word+'"]');assert.ok(node,'missing card '+word);return node;},assertProtected:()=>assert.equal(JSON.stringify(protectedRecords),before,'display controls must not change grades, drafts, word order or lessons')};
}
const content=(card,language)=>card.querySelector('[data-mask-content="'+language+'"]');
const toggle=(card,language)=>card.querySelector('[data-mask-toggle="'+language+'"]');
const view=(f,name)=>f.button('[data-study-view="'+name+'"]').click();

test('ordinary word cards remain the default, with original meanings and review controls',()=>{
  const f=fixture();assert.match(visibleText(f.host),/普通版.*遮挡自测版/);assert.equal(f.host.querySelectorAll('.word-mask').length,0);
  const card=f.card('improve');assert.match(visibleText(card),/improve/);assert.match(visibleText(card),/ɪmˈpruːv/);assert.match(visibleText(card),/v\. 动词/);assert.doesNotMatch(visibleText(card),/改善/);assert.match(card.textContent,/改善/);assert.ok(card.querySelector('[data-study-review]'));
  assert.deepEqual(f.writes,[]);f.assertProtected();
});

test('masked version initially conceals spelling, IPA, parts of speech, examples and Chinese',()=>{
  const f=fixture();view(f,'masked');const card=f.card('improve');
  assert.equal(content(card,'en').hidden,true);assert.equal(content(card,'zh').hidden,true);
  const visible=visibleText(card);for(const secret of [wordA.word,wordA.phonetic,wordA.pos,wordA.example,wordA.meaning,wordA.exampleZh])assert.ok(!visible.includes(secret),'hidden content leaked: '+secret);
  assert.equal(toggle(card,'en').getAttribute('aria-expanded'),'false');assert.equal(toggle(card,'zh').getAttribute('aria-expanded'),'false');
  assert.equal(card.querySelector('[data-speak]').getAttribute('aria-label'),'听第 1 词的读音');assert.ok(!card.getAttribute('title').includes(wordA.word));
  assert.equal(toggle(card,'en').getAttribute('aria-controls'),content(card,'en').getAttribute('id'));
  assert.match(template,/\[data-mask-content\]\[hidden\]\{display:none!important\}/);
  f.assertProtected();
});

test('each card reveals English and Chinese independently without revealing its neighbor',()=>{
  const f=fixture({preference:'masked'}),a=f.card('improve'),b=f.card('useful');
  toggle(a,'zh').click();assert.equal(content(a,'zh').hidden,false);assert.equal(content(a,'en').hidden,true);assert.equal(content(b,'zh').hidden,true);assert.match(visibleText(a),/改善/);assert.doesNotMatch(visibleText(a),/improve|ɪmˈpruːv|动词/);
  toggle(a,'en').click();assert.equal(content(a,'en').hidden,false);assert.match(visibleText(a),/improve/);assert.match(visibleText(a),/v\. 动词/);assert.equal(content(b,'en').hidden,true);
  toggle(a,'zh').click();assert.equal(content(a,'zh').hidden,true);assert.equal(content(a,'en').hidden,false);
  toggle(a,'en').click();assert.equal(a.querySelector('.study-mask-placeholder').hidden,false);assert.deepEqual(f.spoken,[]);assert.deepEqual(f.writes,[]);f.assertProtected();
});

test('whole-list language controls override only that language and preserve per-card other-language state',()=>{
  const f=fixture({preference:'masked'}),a=f.card('improve'),b=f.card('useful');toggle(a,'zh').click();
  f.button('[data-mask-all="en"]').click();assert.equal(content(a,'en').hidden,false);assert.equal(content(b,'en').hidden,false);assert.equal(content(a,'zh').hidden,false);assert.equal(content(b,'zh').hidden,true);
  toggle(a,'en').click();assert.equal(content(a,'en').hidden,true);assert.equal(content(b,'en').hidden,false);
  f.button('[data-mask-all="en"]').click();assert.equal(content(a,'en').hidden,true);assert.equal(content(b,'en').hidden,true);assert.equal(content(a,'zh').hidden,false);
  f.button('[data-mask-all="zh"]').click();assert.equal(content(a,'zh').hidden,false);assert.equal(content(b,'zh').hidden,false);assert.equal(content(a,'en').hidden,true);
  f.button('[data-mask-all="zh"]').click();assert.equal(content(a,'zh').hidden,true);assert.equal(content(b,'zh').hidden,true);assert.deepEqual(f.spoken,[]);f.assertProtected();
});

test('same-day rerenders preserve choices but changing course dates resets all concealed answers',()=>{
  const f=fixture({preference:'masked'});toggle(f.card('improve'),'en').click();f.button('[data-mask-all="zh"]').click();f.render();
  assert.equal(content(f.card('improve'),'en').hidden,false);assert.equal(content(f.card('useful'),'en').hidden,true);assert.equal(content(f.card('useful'),'zh').hidden,false);
  f.context.selected='2026-10-19';f.render();for(const card of f.host.querySelectorAll('[data-mask-index]')){assert.equal(content(card,'en').hidden,true);assert.equal(content(card,'zh').hidden,true);}
  f.context.selected='2026-10-18';f.render();assert.equal(content(f.card('improve'),'en').hidden,true);assert.deepEqual(f.writes,[]);f.assertProtected();
});

test('refresh persists only version choice; switching back to masked mode starts concealed',()=>{
  const f=fixture();view(f,'masked');toggle(f.card('improve'),'en').click();f.button('[data-mask-all="zh"]').click();
  assert.deepEqual(f.writes,[['cet4-word-card-view-v1','masked']]);assert.deepEqual(f.reads,['cet4-word-card-view-v1']);
  const refreshed=fixture({preference:f.storage.get('cet4-word-card-view-v1')});assert.equal(content(refreshed.card('improve'),'en').hidden,true);assert.equal(content(refreshed.card('improve'),'zh').hidden,true);
  view(f,'normal');assert.equal(f.host.querySelectorAll('.word-mask').length,0);view(f,'masked');assert.equal(content(f.card('improve'),'en').hidden,true);assert.equal(content(f.card('improve'),'zh').hidden,true);assert.equal(f.button('[data-study-view="masked"]').focused,true);
  assert.ok(f.writes.every(([key])=>key==='cet4-word-card-view-v1'));assert.doesNotMatch(helpers,/recordFirstAttempt|buildRecoveryLesson|saveUserVocab\(|fetch\(|JSON\.parse\(localStorage/);f.assertProtected();refreshed.assertProtected();
});

test('card and audio-button clicks pronounce a concealed word once; display/review controls and selections do not',()=>{
  const f=fixture({preference:'masked'}),card=f.card('improve');card.click();assert.deepEqual(f.spoken,['improve']);
  card.querySelector('[data-speak]').click();assert.deepEqual(f.spoken,['improve','improve']);
  toggle(card,'en').click();toggle(card,'zh').click();f.button('[data-mask-all="en"]').click();f.button('[data-mask-all="zh"]').click();assert.deepEqual(f.spoken,['improve','improve']);
  f.select('chosen text');card.click();f.select('');assert.deepEqual(f.spoken,['improve','improve']);
  card.querySelector('[data-study-review]').click();assert.equal(f.saves.length,1);assert.deepEqual(f.spoken,['improve','improve']);assert.equal(card.querySelector('[data-study-review]').disabled,true);
  view(f,'normal');view(f,'masked');assert.deepEqual(f.spoken,['improve','improve']);f.assertProtected();
});

test('unavailable storage and unknown preferences do not block either display version',()=>{
  const unknown=fixture({preference:'unexpected'});assert.equal(unknown.host.querySelectorAll('.word-mask').length,0);
  const unavailable=fixture({storageThrows:true});view(unavailable,'masked');assert.equal(content(unavailable.card('improve'),'en').hidden,true);toggle(unavailable.card('improve'),'zh').click();assert.equal(content(unavailable.card('improve'),'zh').hidden,false);view(unavailable,'normal');assert.equal(unavailable.host.querySelectorAll('.word-mask').length,0);unavailable.assertProtected();
});
