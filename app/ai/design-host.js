(function(global){
  'use strict';
  const DESIGN_KEY='cet4-personal-page-design-v1',WIDGET_KEY='cet4-personal-widget-state-v1';
  // This adapter reads only its own two new keys. No course/grade/draft access.
  function create({root,widgetsRoot,storage,runtime=global.Cet4Designer,onWarning=()=>{}}){
    let current=null,view={tab:'plan',date:''},layoutDispose=null,widgetDispose=null,mountedKey='',widgetState={};
    const read=(key,max)=>{try{const raw=storage?.getItem(key);return raw&&raw.length<=max?JSON.parse(raw):null}catch{return null}};
    const write=(key,value)=>{try{storage?.setItem(key,JSON.stringify(value))}catch{onWarning('个人页面设置暂时无法保存；原学习记录未改动。')}};
    function checked(input){
      if(!input||!Number.isSafeInteger(input.revision)||input.revision<0)throw new TypeError('Invalid design revision');
      return {revision:input.revision,design:runtime.normalizeDesign(input.design)};
    }
    try{const saved=read(DESIGN_KEY,40000);if(saved)current=checked(saved)}catch{onWarning('个人页面设置无法识别，已保留原学习页面。')}
    const savedWidgets=read(WIDGET_KEY,400000);if(savedWidgets&&typeof savedWidgets==='object'&&!Array.isArray(savedWidgets))widgetState=savedWidgets;
    function persistWidgets(){
      // Retain recent private widget drafts only; never remove study records.
      const keys=Object.keys(widgetState);for(const key of keys.slice(0,Math.max(0,keys.length-64)))delete widgetState[key];
      if(JSON.stringify(widgetState).length<=400000)write(WIDGET_KEY,widgetState);
    }
    function baseline(d){return d.theme==='forest'&&d.density==='comfortable'&&d.fontSize===18&&d.wordColumns===3&&d.wordMode==='cards'&&!d.hiddenSections.length&&!d.widgets.length&&d.taskOrder.join(',')==='words,listening,grammar,reading,sentence,extensive,review'}
    function reorder(){
      const route=root.querySelector('[data-design-task-list]');if(!route)return;
      const original=['words','listening','grammar','reading','sentence','extensive','review'],order=current?.design.taskOrder||original;
      const nodes=Array.from(route.querySelectorAll('[data-design-task]'));
      order.forEach((name,i)=>{const node=nodes.find(n=>n.getAttribute('data-design-task')===name);if(!node)return;route.appendChild(node);const label=node.querySelector('b');if(label)label.textContent=label.textContent.replace(/([✓□]\s*)?\d+\./,(_,mark)=>(mark||'')+(i+1)+'.')});
    }
    function stopWidgets(){if(widgetDispose)widgetDispose();widgetDispose=null;mountedKey='';}
    function render(nextView=view){
      view=nextView;
      if(layoutDispose)layoutDispose();layoutDispose=null;
      if(current&&!baseline(current.design))layoutDispose=runtime.applyLayout(root,current.design);
      reorder();
      const widgets=current?.design.widgets||[],show=view.tab==='plan'&&widgets.length>0;
      widgetsRoot.hidden=!show;
      if(!show){stopWidgets();return;}
      const key=current.revision+'|'+view.date;
      if(key!==mountedKey){stopWidgets();runtime.applyLayout(widgetsRoot,current.design);widgetDispose=runtime.renderWidgets(widgetsRoot,widgets,{stateStore:widgetState,stateKey:key,onStateChange:persistWidgets});mountedKey=key;}
    }
    function accept(input){
      let next;try{next=checked(input)}catch{return false}
      if(current?.revision===next.revision&&JSON.stringify(current.design)===JSON.stringify(next.design))return true;
      // The paired local server is authoritative, including a deliberate DB reset.
      current=next;write(DESIGN_KEY,current);render();return true;
    }
    function dispose(){stopWidgets();if(layoutDispose)layoutDispose();layoutDispose=null;persistWidgets();}
    return Object.freeze({render,accept,dispose,getDesign:()=>current?JSON.parse(JSON.stringify(current)):null});
  }
  global.Cet4DesignHost=Object.freeze({create,DESIGN_KEY,WIDGET_KEY});
})(globalThis);
