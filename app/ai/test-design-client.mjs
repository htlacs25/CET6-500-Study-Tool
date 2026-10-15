import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('./client.html',import.meta.url),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const PAIR='d'.repeat(64),DATE='2026-10-15';
const base=()=>({version:1,theme:'forest',density:'comfortable',fontSize:18,wordColumns:3,wordMode:'cards',taskOrder:['words','listening','grammar','reading','sentence','extensive','review'],hiddenSections:[],widgets:[]});
const clone=value=>JSON.parse(JSON.stringify(value));
const settle=async()=>{for(let i=0;i<6;i++)await new Promise(resolve=>setImmediate(resolve));};

function fixture({configured=false,failDesign=false,pending=false,revision=0,stale=false}={}){
  const ids=new Map(),events={},sent=[],requests=[],previews=[];
  let disposed=0;
  class Element{
    constructor(tag='div'){this.tag=tag;this.children=[];this.dataset={};this.value='';this.checked=false;this.textContent='';this.disabled=false;this.hidden=false;this.listeners={};}
    append(...items){this.children.push(...items)}
    replaceChildren(...items){this.children=items}
    addEventListener(type,fn){this.listeners[type]=fn}
    setAttribute(key,value){this[key]=value}
    focus(){}
    get childNodes(){return this.children}
  }
  for(const match of html.matchAll(/<(\w+)[^>]*id="([^"]+)"[^>]*>/g)){const item=new Element(match[1]);item.hidden=/\shidden(?:\s|>)/.test(match[0]);ids.set(match[2],item);}
  const walk=node=>[node,...node.children.flatMap(walk)];
  const all=()=>[...ids.values()].flatMap(walk);
  const document={getElementById:id=>ids.get(id),createElement:tag=>new Element(tag),querySelectorAll:selector=>selector==='button,input,textarea,select'?all().filter(item=>['button','input','textarea','select'].includes(item.tag)):selector==='[data-unavailable="true"]'?all().filter(item=>item.dataset.unavailable==='true'):[],activeElement:null};
  const parent={postMessage:(data,origin)=>sent.push({data:clone(data),origin})};
  const window={parent,addEventListener:(type,fn)=>events[type]=fn,Cet4Designer:{normalizeDesign:design=>clone(design),renderPreview:(container,design,options)=>{previews.push({design:clone(design),key:options.stateKey});container.append(new Element('interactive-preview'));return ()=>{disposed++;};}}};
  let design=base(),proposals=[];
  const makeProposal=(next,title='模拟页面方案')=>({id:'design-'+(proposals.length+1),title,summary:'修改只影响个人页面',design:clone(next),status:'pending',baseRevision:revision,appliedRevision:null,before:clone(design)});
  if(pending){const next=base();next.theme='ocean';proposals.push(makeProposal(next));if(stale)proposals[0].baseRevision=revision-1;}
  const workbench=()=>clone({revision,design,proposals});
  const state=()=>({date:DATE,configured,model:'gpt-4.1-mini',revision:0,plan:{minutes:null,focus:null,note:'',practice:[]},messages:[],proposals:[]});
  const fetch=async(path,options)=>{
    const body=options.body?JSON.parse(options.body):null;requests.push({path,body});
    if(path==='/api/design'&&failDesign)return {ok:false,json:async()=>({error:{code:'PROVIDER_ERROR',message:'模拟 AI 服务暂不可用'}})};
    if(path==='/api/design'){const next=base();next.density='compact';proposals.push(makeProposal(next));return {ok:true,json:async()=>({reply:'可调整为紧凑版，请先预览。',...workbench()})};}
    if(path==='/api/design/manual')proposals.push(makeProposal(body.design,body.title));
    if(path==='/api/design/apply'){const proposal=proposals.find(item=>item.id===body.id);design=clone(proposal.design);revision++;proposal.status='applied';proposal.appliedRevision=revision;}
    if(path==='/api/design/undo'){const proposal=proposals.find(item=>item.id===body.id);design=clone(proposal.before);revision++;proposal.status='undone';}
    if(path==='/api/design/reject')proposals.find(item=>item.id===body.id).status='rejected';
    return {ok:true,json:async()=>path==='/api/workbench'||path.startsWith('/api/design/')?workbench():state()};
  };
  vm.runInContext(source.replaceAll('__AI_TOKEN__','mock-token').replaceAll('__AI_PAIRING__',PAIR),vm.createContext({document,window,location:{href:'http://127.0.0.1:4318/?date='+DATE,origin:'http://127.0.0.1:4318'},fetch,Map,Set,URL,Date,console}));
  const send=(date=DATE,pairing=PAIR,origin='null',from=parent)=>events.message({source:from,origin,data:{type:'cet4-ai-date',date,pairing}});
  const button=(id,label)=>walk(ids.get(id)).find(item=>item.tag==='button'&&item.textContent===label);
  const click=(id,label)=>{const target=label?button(id,label):ids.get(id);assert.ok(target,'button exists: '+(label||id));if(!target.disabled)target.listeners.click();};
  const submit=id=>ids.get(id).listeners.submit({preventDefault(){}});
  const input=(id,value)=>{ids.get(id).value=value;ids.get(id).listeners.input?.();};
  return {ids,sent,requests,previews,events,send,button,click,submit,input,walk,disposed:()=>disposed,workbench};
}

test('paired startup restores only the approved personal design without opening the editor',async()=>{
  const f=fixture({pending:true});await settle();assert.equal(f.requests.length,0);
  f.send(DATE,'bad');await settle();assert.equal(f.requests.length,0);
  f.send();await settle();assert.equal(f.ids.get('designWorkspace').hidden,true);
  assert.deepEqual(f.requests.map(item=>item.path),['/api/state?date='+DATE,'/api/workbench']);
  const design=f.sent.find(item=>item.data.type==='cet4-ai-design');assert.equal(design.data.design.theme,'forest');
  assert.equal(f.requests.some(item=>item.path==='/api/design/apply'),false);
  assert.equal(f.previews.length,0);
});

test('AI design requests require an explicit send and default to no public course sharing',async()=>{
  const f=fixture({configured:true});f.send();await settle();f.click('designMode');
  assert.equal(f.requests.some(item=>item.path==='/api/design'),false);
  f.ids.get('designMessage').value='请紧凑一点';f.submit('designForm');await settle();
  assert.deepEqual(f.requests.find(item=>item.path==='/api/design').body,{date:DATE,message:'请紧凑一点',includeCourse:false});
  assert.equal(f.requests.some(item=>item.path==='/api/design/apply'),false);
  assert.match(f.ids.get('designReply').textContent,/紧凑/);
  assert.equal(f.sent.filter(item=>item.data.type==='cet4-ai-design').at(-1).data.design.density,'comfortable');
});

test('manual layout, ordering, hiding and all five widgets create a preview without API calls',async()=>{
  const f=fixture();f.send();await settle();f.click('designMode');
  f.input('editTheme','warm');f.input('editDensity','compact');f.input('editFontSize','20');f.input('editWordColumns','2');f.input('editWordMode','list');
  f.click('editTaskOrder','下移');
  const hidden=f.walk(f.ids.get('editHiddenSections')).find(item=>item.tag==='input');hidden.checked=true;hidden.listeners.change();
  for(const type of ['note','checklist','flashcards','quiz','timer']){
    f.ids.get('widgetTitle').value='我的'+type;f.ids.get('widgetType').value=type;f.ids.get('widgetText').value='仅个人补充';f.ids.get('widgetMinutes').value='12';
    f.ids.get('widgetItems').value=['flashcards','quiz'].includes(type)?'improve | 改善':type==='checklist'?'盲听\n复述':'';f.click('saveWidget');
  }
  f.submit('manualDesignForm');await settle();
  const request=f.requests.find(item=>item.path==='/api/design/manual');assert.ok(request);
  assert.equal(request.body.design.theme,'warm');assert.equal(request.body.design.density,'compact');assert.equal(request.body.design.fontSize,20);assert.equal(request.body.design.wordColumns,2);assert.equal(request.body.design.wordMode,'list');
  assert.equal(request.body.design.taskOrder[0],'listening');assert.deepEqual(request.body.design.hiddenSections,['roadmap']);assert.deepEqual(request.body.design.widgets.map(item=>item.type),['note','checklist','flashcards','quiz','timer']);
  assert.equal(f.requests.some(item=>item.path==='/api/design'),false);assert.equal(f.requests.some(item=>item.path==='/api/design/apply'),false);
  assert.equal(f.button('designProposals','确认应用到我的页面').disabled,true);
  assert.equal(f.sent.filter(item=>item.data.type==='cet4-ai-design').at(-1).data.design.theme,'forest');
});

test('preview is interactive and approval, rejection and undo remain explicit',async()=>{
  const f=fixture({pending:true});f.send();await settle();f.click('designMode');
  const approve=f.button('designProposals','确认应用到我的页面');assert.equal(approve.disabled,true);
  f.click('designProposals','试用修改后的页面');assert.equal(approve.disabled,false);assert.equal(f.previews.at(-1).design.theme,'ocean');
  assert.equal(f.requests.some(item=>item.path==='/api/design/apply'),false);
  f.click('designProposals','确认应用到我的页面');await settle();
  assert.deepEqual(f.requests.find(item=>item.path==='/api/design/apply').body,{id:'design-1',revision:0});
  assert.equal(f.sent.filter(item=>item.data.type==='cet4-ai-design').at(-1).data.design.theme,'ocean');
  f.click('designHistory','撤回这次页面修改');await settle();
  assert.deepEqual(f.requests.find(item=>item.path==='/api/design/undo').body,{id:'design-1',revision:1});
  assert.equal(f.sent.filter(item=>item.data.type==='cet4-ai-design').at(-1).data.design.theme,'forest');
  assert.ok(f.disposed()>=1);
  const rejected=fixture({pending:true});rejected.send();await settle();rejected.click('designProposals','这次不改');await settle();assert.equal(rejected.workbench().proposals[0].status,'rejected');assert.equal(rejected.workbench().revision,0);
});

test('stale proposals stay unapplicable even after preview',async()=>{
  const f=fixture({pending:true,revision:2,stale:true});f.send();await settle();f.click('designMode');f.click('designProposals','试用修改后的页面');
  assert.equal(f.button('designProposals','确认应用到我的页面').disabled,true);assert.equal(f.requests.some(item=>item.path==='/api/design/apply'),false);
});

test('manual and AI description drafts survive mode switches, date changes and failed AI calls',async()=>{
  const f=fixture({configured:true,failDesign:true});f.send();await settle();f.click('designMode');f.input('editTheme','warm');f.ids.get('designMessage').value='未完成的页面描述';
  f.click('learnMode');f.send('2026-10-16');await settle();f.click('designMode');assert.equal(f.ids.get('editTheme').value,'warm');assert.equal(f.ids.get('designMessage').value,'未完成的页面描述');
  f.submit('designForm');await settle();assert.equal(f.ids.get('designMessage').value,'未完成的页面描述');assert.match(f.ids.get('status').textContent,/模拟 AI 服务/);
  assert.equal(f.requests.filter(item=>item.path==='/api/workbench').length,1);
  const before=f.disposed();f.events.pagehide();assert.ok(f.disposed()>before);
});

test('invalid manual widgets are not submitted and generated text cannot execute HTML',async()=>{
  const f=fixture();f.send();await settle();f.click('designMode');f.ids.get('widgetTitle').value='测试';f.ids.get('widgetType').value='quiz';f.ids.get('widgetMinutes').value='15';f.ids.get('widgetItems').value='没有答案';f.click('saveWidget');assert.match(f.ids.get('status').textContent,/答案/);
  f.input('editFontSize','25');f.submit('manualDesignForm');await settle();assert.equal(f.requests.some(item=>item.path==='/api/design/manual'),false);
  assert.doesNotMatch(source,/localStorage|sessionStorage|innerHTML|eval\(|new Function/);
  assert.match(html,/<script src="\/design-runtime\.js"><\/script>/);
});
