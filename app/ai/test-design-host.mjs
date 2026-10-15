import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {DEFAULT_DESIGN,validateDesign} from './design-schema.mjs';
const code=fs.readFileSync(new URL('./design-host.js',import.meta.url),'utf8');
function fixture(saved={}){
  const access=[],calls=[],db=new Map(Object.entries(saved)),nodes=DEFAULT_DESIGN.taskOrder.map((name,i)=>({name,label:{textContent:'□ '+(i+1)+'. task '+name},getAttribute(){return this.name},querySelector(){return this.label}}));
  const route={querySelectorAll:()=>nodes.slice(),appendChild(node){nodes.splice(nodes.indexOf(node),1);nodes.push(node)}};
  const root={value:'untouched spelling',querySelector:()=>route},widgetsRoot={hidden:true};
  const storage={getItem:k=>{access.push(['get',k]);return db.get(k)},setItem:(k,v)=>{access.push(['set',k]);db.set(k,v)}};
  const runtime={normalizeDesign:d=>validateDesign(JSON.parse(JSON.stringify(d))),applyLayout:(r,d)=>{calls.push(['layout',d.theme]);return()=>calls.push(['restore'])},renderWidgets:(r,w,o)=>{calls.push(['widgets',w.length,o]);return()=>calls.push(['pause'])}};
  const ctx=vm.createContext({console});vm.runInContext(code,ctx);
  const api=ctx.Cet4DesignHost,host=api.create({root,widgetsRoot,storage,runtime});
  return {host,api,db,access,calls,root,widgetsRoot,nodes};
}
const custom=()=>({...structuredClone(DEFAULT_DESIGN),theme:'ocean',taskOrder:[...DEFAULT_DESIGN.taskOrder].reverse(),widgets:[{id:'focus',type:'timer',title:'专注',text:'',items:[],minutes:10}]});
test('approved design applies without replacing study input or touching original storage',()=>{
  const f=fixture();assert.equal(f.host.accept({revision:1,design:custom()}),true);
  assert.equal(f.root.value,'untouched spelling');assert.equal(f.widgetsRoot.hidden,false);
  assert.deepEqual(f.nodes.map(x=>x.name),custom().taskOrder);assert.equal(f.nodes[0].label.textContent,'□ 1. task review');
  assert.ok(f.access.every(([,key])=>[f.api.DESIGN_KEY,f.api.WIDGET_KEY].includes(key)));
  assert.equal(f.host.accept({revision:2,design:{...custom(),script:'bad'}}),false);
  assert.equal(f.host.getDesign().revision,1);
});
test('reload uses validated private cache and never reads grades; corrupt cache is ignored',()=>{
  const f=fixture({'cet4-personal-page-design-v1':JSON.stringify({revision:3,design:custom()}),'cet6-500-offline-v2':'never read'});
  f.host.render({tab:'plan',date:'2026-10-15'});assert.equal(f.host.getDesign().revision,3);
  assert.ok(!f.access.some(([,key])=>key==='cet6-500-offline-v2'));
  const bad=fixture({'cet4-personal-page-design-v1':'invalid'});bad.host.render();assert.equal(bad.host.getDesign(),null);
});
test('rerender is stable, tab switch pauses widgets, and undo restores original order',()=>{
  const f=fixture();f.host.accept({revision:1,design:custom()});const count=f.calls.filter(c=>c[0]==='widgets').length;
  f.host.render();assert.equal(f.calls.filter(c=>c[0]==='widgets').length,count);
  f.host.render({tab:'words',date:'2026-10-15'});assert.equal(f.widgetsRoot.hidden,true);assert.ok(f.calls.some(c=>c[0]==='pause'));
  f.host.accept({revision:2,design:DEFAULT_DESIGN});assert.deepEqual(f.nodes.map(x=>x.name),DEFAULT_DESIGN.taskOrder);
  assert.equal(f.root.value,'untouched spelling');
});
test('private widget draft callback persists only new widget state key',()=>{
  const f=fixture();f.host.accept({revision:1,design:custom()});const options=f.calls.find(c=>c[0]==='widgets')[2];
  options.stateStore.example={version:1,remaining:5000};options.onStateChange();
  assert.equal(JSON.parse(f.db.get(f.api.WIDGET_KEY)).example.remaining,5000);
  f.host.dispose();assert.ok(f.calls.some(c=>c[0]==='pause'));
});
