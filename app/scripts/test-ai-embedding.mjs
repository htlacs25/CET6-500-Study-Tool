import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const template=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
const helpers=template.slice(template.indexOf('    function renderAiNotice(){'),template.indexOf('    function installPersonalDesigner(){'));

function fixture(){
  const ids=new Map(),events={},sent=[];
  class Element{
    constructor(tag='div'){this.tag=tag;this.hidden=false;this.src='';this.children=[];this.textContent='';this.contentWindow={postMessage:(data,origin)=>sent.push({data,origin})}}
    set id(value){this.name=value;ids.set(value,this)}get id(){return this.name}
    set innerHTML(value){this.html=value;for(const match of value.matchAll(/<(\w+)[^>]*id="([^"]+)"/g)){const child=new Element(match[1]);child.id=match[2];this.children.push(child)}}
    setAttribute(key,value){this[key]=value}
    prepend(child){this.children.unshift(child)}
    insertBefore(child){this.children.push(child)}
    querySelector(selector){return selector==='iframe'?this.children.find(x=>x.tag==='iframe'):ids.get(selector.slice(1))}
  }
  const bar=new Element(),pane=new Element(),app=new Element();pane.id='studyMainPane';app.id='app';app.html='unchanged learning draft';
  const document={getElementById:id=>ids.get(id),querySelector:s=>s==='.utility-bar'?bar:null,createElement:tag=>new Element(tag)};
  const window={location:{href:'file:///D:/CET6-500-Study-Tool/test.html'},addEventListener:(type,fn)=>events[type]=fn};
  const context=vm.createContext({document,window,URL,Map,Date,console});
  vm.runInContext("const AI_ORIGIN='http://127.0.0.1:4318',AI_PAIRING='a'.repeat(64),aiPlans=new Map();let aiFrame=null,aiReady=false,selected='2026-10-13',tab='plan';function render(){renderAiNotice()}\n"+helpers+"\ninstallAiAssistant();globalThis.api={openAiFrame,renderAiNotice,state:()=>({aiReady,tab,selected,plans:aiPlans.size}),setTab:x=>tab=x};",context);
  return {api:context.api,ids,events,sent,app};
}

test('AI iframe restores approved plans on page load without replacing the study pane or storage',()=>{
  const f=fixture(),iframe=f.ids.get('aiAssistantFrame');
  assert.equal(iframe.src,'http://127.0.0.1:4318/?date=2026-10-13');assert.equal(f.api.state().tab,'plan');
  const original=iframe;f.api.openAiFrame();assert.equal(f.ids.get('aiAssistantFrame'),original);
  assert.equal(f.app.html,'unchanged learning draft');
  assert.doesNotMatch(helpers,/localStorage|recordFirstAttempt|saveUserVocab|eval\(|fetch\(/);
});

test('only the exact local AI iframe may send a plan; text stays text, not HTML',()=>{
  const f=fixture(),frame=f.ids.get('aiAssistantFrame'),data={type:'cet4-ai-plan',date:'2026-10-13',plan:{minutes:60,focus:'listening',note:'<img src=x onerror=alert(1)>'}};
  f.events.message({origin:'https://example.com',source:frame.contentWindow,data});assert.equal(f.api.state().plans,0);
  f.events.message({origin:'http://127.0.0.1:4318',source:{},data});assert.equal(f.api.state().plans,0);
  f.events.message({origin:'http://127.0.0.1:4318',source:frame.contentWindow,data});
  const notice=f.ids.get('aiPlanNotice');assert.equal(notice.hidden,false);assert.match(notice.textContent,/60分钟/);assert.match(notice.textContent,/<img/);assert.equal(notice.html,undefined);
  f.events.message({origin:'http://127.0.0.1:4318',source:frame.contentWindow,data:{...data,plan:{}}});assert.equal(notice.hidden,true);
  f.events.message({origin:'http://127.0.0.1:4318',source:frame.contentWindow,data:{...data,plan:{minutes:null,focus:null,note:null,practice:[]}}});assert.equal(notice.hidden,true);
});

test('handshake sends selected date and ephemeral pairing, never grades or drafts',()=>{
  const f=fixture(),frame=f.ids.get('aiAssistantFrame');
  f.events.message({origin:'http://127.0.0.1:4318',source:frame.contentWindow,data:{type:'cet4-ai-ready'}});
  assert.equal(f.api.state().aiReady,true);assert.deepEqual(JSON.parse(JSON.stringify(f.sent)),[{data:{type:'cet4-ai-date',date:'2026-10-13',pairing:'a'.repeat(64)},origin:'http://127.0.0.1:4318'}]);
  assert.match(template,/if\(tab==='ai'\)return; \/\/ An embedded chat/);
});
