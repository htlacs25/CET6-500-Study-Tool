import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('./client.html',import.meta.url),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const PAIR='a'.repeat(64), DATE='2026-10-14';
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));};
function fixture({embedded=true,configured=false,failChat=false}={}){
  const ids=new Map(),events={},sent=[],requests=[];
  class Element{
    constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.value='';this.checked=false;this.textContent='';this.disabled=false;this.listeners={};}
    append(...items){this.children.push(...items)}
    replaceChildren(...items){this.children=items}
    addEventListener(type,fn){this.listeners[type]=fn}
    setAttribute(key,value){this[key]=value}
    get childNodes(){return this.children}
  }
  for(const match of html.matchAll(/<(\w+)[^>]*id="([^"]+)"/g))ids.set(match[2],new Element(match[1]));
  const controls=()=>[...ids.values()].filter(x=>['button','input','textarea'].includes(x.tag));
  const document={getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),querySelectorAll:s=>s==='button,input,textarea'?controls():[],activeElement:null};
  const parent={postMessage:(data,origin)=>sent.push({data:JSON.parse(JSON.stringify(data)),origin})};
  const window={parent,addEventListener:(type,fn)=>events[type]=fn};if(!embedded)window.parent=window;
  let revision=0,applied=false;
  const proposal={id:'proposal-1',date:DATE,title:'模拟调整',summary:'仅用于测试',changes:{minutes:60,focus:'listening',note:'私密测试安排',practice:[]},status:'pending',baseRevision:0,appliedRevision:null};
  const state=date=>({date,configured,model:'gpt-4.1-mini',revision,plan:applied?{...proposal.changes}:{minutes:null,focus:null,note:'',practice:[]},messages:[],proposals:configured?[{...proposal}]:[]});
  const fetch=async(path,options)=>{
    const body=options.body?JSON.parse(options.body):null;requests.push({path,body});
    if(path==='/api/chat'&&failChat)return {ok:false,json:async()=>({error:{message:'模拟接口失败',code:'PROVIDER_ERROR'}})};
    if(path==='/api/config')configured=true;
    if(path==='/api/apply'){revision++;applied=true;proposal.status='applied';proposal.appliedRevision=revision;}
    if(path==='/api/undo'){revision++;applied=false;proposal.status='undone';}
    return {ok:true,json:async()=>state(new URL(path,'http://127.0.0.1:4318').searchParams.get('date')||DATE)};
  };
  const context=vm.createContext({document,window,location:{href:'http://127.0.0.1:4318/?date='+DATE,origin:'http://127.0.0.1:4318'},fetch,Map,URL,Date,console});
  vm.runInContext(source.replaceAll('__AI_TOKEN__','mock-token').replaceAll('__AI_PAIRING__',PAIR),context);
  const send=(date=DATE,pairing=PAIR,origin='null',from=parent)=>events.message({source:from,origin,data:{type:'cet4-ai-date',date,pairing}});
  const submit=id=>ids.get(id).listeners.submit({preventDefault(){}});
  const walk=node=>[node,...node.children.flatMap(walk)];
  const button=(id,label)=>walk(ids.get(id)).find(x=>x.tag==='button'&&x.textContent===label);
  return {ids,sent,requests,send,submit,button};
}

test('opaque file parents cannot load or receive private data without the ephemeral pairing',async()=>{
  const f=fixture();await settle();assert.equal(f.requests.length,0);
  f.send(DATE,'');f.send(DATE,'b'.repeat(64));f.send(DATE,PAIR,'https://example.com');f.send(DATE,PAIR,'null',{});
  await settle();assert.equal(f.requests.length,0);assert.equal(f.sent.some(x=>x.data.type==='cet4-ai-plan'),false);
  f.send();await settle();assert.equal(f.requests.length,1);assert.equal(f.requests[0].path,'/api/state?date='+DATE);
  assert.equal(f.sent.filter(x=>x.data.type==='cet4-ai-plan').length,1);
  assert.doesNotMatch(source,/localStorage|sessionStorage|innerHTML|eval\(/);
});

test('paired date navigation keeps drafts and opt-in fields, including on API failure',async()=>{
  const f=fixture({configured:true,failChat:true});f.send();await settle();
  f.ids.get('message').value='我的未发问题';f.ids.get('sharedText').value='我选择分享的难点';f.ids.get('includeCourse').checked=true;
  f.send('2026-10-15');await settle();assert.equal(f.ids.get('message').value,'');assert.equal(f.ids.get('includeCourse').checked,false);
  f.send(DATE);await settle();assert.equal(f.ids.get('message').value,'我的未发问题');assert.equal(f.ids.get('sharedText').value,'我选择分享的难点');assert.equal(f.ids.get('includeCourse').checked,true);
  f.submit('chatForm');await settle();assert.equal(f.ids.get('message').value,'我的未发问题');assert.match(f.ids.get('status').textContent,/模拟接口失败/);
});

test('preview does not apply; explicit approval and undo update the same dated plan',async()=>{
  const f=fixture({configured:true});f.send();await settle();
  assert.equal(f.requests.some(x=>x.path==='/api/apply'),false);
  f.button('proposals','确认应用').listeners.click();await settle();
  assert.deepEqual(f.requests.find(x=>x.path==='/api/apply').body,{id:'proposal-1',revision:0});
  assert.equal(f.sent.filter(x=>x.data.type==='cet4-ai-plan').at(-1).data.plan.minutes,60);
  f.button('historyItems','撤回这次修改').listeners.click();await settle();
  assert.equal(f.sent.filter(x=>x.data.type==='cet4-ai-plan').at(-1).data.plan.minutes,null);
});

test('standalone client works without a parent and clears a typed mock key before sending',async()=>{
  const f=fixture({embedded:false});await settle();assert.equal(f.requests.length,1);
  f.ids.get('apiKey').value='mock-secret-never-a-real-key';f.ids.get('model').value='gpt-4.1-mini';f.submit('configForm');
  assert.equal(f.ids.get('apiKey').value,'');await settle();assert.equal(f.sent.length,0);
  assert.equal(f.ids.get('connection').textContent,'已配置，发送消息后验证');
});
