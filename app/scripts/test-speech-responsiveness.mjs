import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Pure synthetic browser fixtures: no real profile, grades, storage or audio device.
const templatePath=process.env.SPEECH_TEMPLATE||new URL('../standalone-template.html',import.meta.url);
const template=fs.readFileSync(templatePath,'utf8');
const begin=template.indexOf('// SPEECH_CONTROLLER_BEGIN'),end=template.indexOf('// SPEECH_CONTROLLER_END');
assert.ok(begin>=0&&end>begin,'speech controller markers must exist');
const source=template.slice(begin,end);
const US={name:'Local US',voiceURI:'local-us',lang:'en-US',localService:true};
const GB={name:'Local British',voiceURI:'local-gb',lang:'en-GB',localService:true};
const remoteUS={name:'Remote US',voiceURI:'remote-us',lang:'en-US',localService:false};

function fixture(options={}){
  let now=10000,serial=0,voices=options.voices??[US],current=null,cancelInFlight=0;
  const jobs=new Map(),events=[],spoken=[],started=[],voiceEvents={},nodes=new Map(),statusHistory=[];
  const after=(fn,delay=0)=>{const id=++serial;jobs.set(id,{at:now+Math.max(0,Number(delay)||0),fn});return id};
  const advance=ms=>{const until=now+ms;let guard=0;while(true){const next=[...jobs].filter(([,job])=>job.at<=until).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!next)break;assert.ok(++guard<1000,'timer runaway');now=next[1].at;jobs.delete(next[0]);next[1].fn()}now=until};
  const node=()=>{let text='';return {id:'',hidden:false,className:'',setAttribute(){},get textContent(){return text},set textContent(value){text=String(value);statusHistory.push(text)}}};
  const status=node();status.id='speechStatus';nodes.set(status.id,status);
  const document={getElementById:id=>nodes.get(id)||null,createElement:node,querySelector:()=>({prepend(el){nodes.set(el.id,el)}})};
  const engine={speaking:false,pending:false,paused:false,getVoices(){events.push({type:'voices',at:now});return voices},addEventListener(name,fn){voiceEvents[name]=fn},
    cancel(){const old=current;events.push({type:'cancel',at:now});cancelInFlight++;after(()=>{cancelInFlight--;current=null;engine.speaking=false;engine.pending=false;old?.onerror?.({error:'canceled'});},40)},
    speak(u){events.push({type:'speak',text:u.text,at:now});spoken.push(u);current=u;engine.pending=true;engine.speaking=false;
      const shouldStart=typeof options.autoStart==='function'?options.autoStart(u):options.autoStart!==false;
      if(!cancelInFlight&&!engine.paused&&shouldStart)start(u);
    },
    pause(){engine.paused=true;events.push({type:'pause',at:now})},
    resume(){engine.paused=false;events.push({type:'resume',at:now})}
  };
  function start(u=current){if(!u||current!==u||engine.paused||cancelInFlight)return;engine.pending=false;engine.speaking=true;started.push(u);u.onstart?.()}
  function finish(){const u=current;current=null;engine.pending=false;engine.speaking=false;u?.onend?.()}
  const context={document,Date:{now:()=>now},rate:.8,setTimeout:after,clearTimeout:id=>jobs.delete(id),SpeechSynthesisUtterance:function(text){this.text=text}};
  if(!options.unsupported)context.speechSynthesis=engine;
  for(const name of ['localStorage','sessionStorage','store','progress'])Object.defineProperty(context,name,{get(){throw new Error('Speech must not access learner data: '+name)}});
  vm.createContext(context);vm.runInContext(source+';globalThis.api={speakStudyWord,speak,pauseSpeech,resumeSpeech,cacheStudyVoice,stopSpeech};',context);
  return {api:context.api,engine,spoken,started,events,status,statusHistory,advance,start,finish,setVoices(list){voices=list;voiceEvents.voiceschanged?.()},count:type=>events.filter(e=>e.type===type).length,late:(u,type,error='audio-busy')=>u['on'+type]?.(type==='error'?{error}:{}),context};
}

test('idle first click starts synchronously with cached English voice and no cancellation',()=>{
  const f=fixture({voices:[remoteUS,GB,US]});assert.equal(f.spoken.length,0);assert.equal(f.count('voices'),1);
  f.api.speakStudyWord('improve');assert.equal(f.spoken.length,1);assert.equal(f.started.length,1);assert.equal(f.count('cancel'),0);
  assert.equal(f.spoken[0].voice,US);assert.equal(f.spoken[0].rate,.8);assert.equal(f.spoken[0].lang,'en-US');
});

test('fake native engine reproduces immediate cancel/speak swallowing a replacement',()=>{
  const f=fixture();f.engine.speak({text:'old'});f.engine.cancel();f.engine.speak({text:'replacement'});f.advance(80);
  assert.deepEqual(f.started.map(u=>u.text),['old'],'the fixture must expose asynchronous native cancellation');
});

test('rapid A to B to C cancels once and starts only the latest replacement after the drain',()=>{
  const f=fixture();f.api.speakStudyWord('alpha');const old=f.spoken[0];f.api.speakStudyWord('bravo');f.advance(20);f.api.speakStudyWord('charlie');
  assert.equal(f.count('cancel'),1);assert.deepEqual(f.spoken.map(u=>u.text),['alpha']);
  f.advance(59);assert.equal(f.spoken.length,1);f.advance(1);
  assert.deepEqual(f.spoken.map(u=>u.text),['alpha','charlie']);assert.deepEqual(f.started.map(u=>u.text),['alpha','charlie']);
  f.late(old,'end');f.late(old,'error');assert.equal(f.spoken.length,2);assert.doesNotMatch(f.status.textContent,/失败|未能/);
  f.finish();f.api.speakStudyWord('delta');assert.equal(f.started.at(-1).text,'delta');assert.equal(f.count('cancel'),1);
});

test('a burst of distinct clicks shares one cancellation window, not an accumulating queue',()=>{
  const f=fixture();f.api.speakStudyWord('initial');
  for(const word of ['first','second','third','last']){f.api.speakStudyWord(word);f.advance(10)}
  assert.equal(f.count('cancel'),1);f.advance(40);
  assert.deepEqual(f.spoken.map(u=>u.text),['initial','last']);assert.equal(f.started.at(-1).text,'last');
});

test('same pending word clicks do not keep resetting startup beyond the old 1.5-second guard',()=>{
  const f=fixture({autoStart:false});f.api.speakStudyWord('cooperation');
  for(let i=0;i<8;i++){f.advance(200);f.api.speakStudyWord('cooperation')}
  assert.equal(f.spoken.length,1);assert.equal(f.count('cancel'),0);
  f.advance(200);assert.equal(f.count('cancel'),1);f.advance(80);assert.equal(f.spoken.length,2);
});

test('clicking the same word after it starts still permits a deliberate replay',()=>{
  const f=fixture();f.api.speakStudyWord('repeat');f.api.speakStudyWord('repeat');assert.equal(f.spoken.length,1);f.advance(80);
  assert.deepEqual(f.started.map(u=>u.text),['repeat','repeat']);
});

test('voice loading retains the latest click and speaks it once when English voices arrive',()=>{
  const f=fixture({voices:[]});f.api.speakStudyWord('first');f.advance(100);f.api.speakStudyWord('latest');f.advance(400);
  assert.equal(f.spoken.length,0);f.setVoices([US]);assert.deepEqual(f.started.map(u=>u.text),['latest']);
  f.setVoices([US]);f.advance(4000);assert.equal(f.spoken.length,1);
});

test('a voice loading deadline shows a useful failure and never resurrects an expired click',()=>{
  const f=fixture({voices:[]});f.api.speakStudyWord('missing');f.advance(3000);assert.match(f.status.textContent,/未找到.*英语语音/);
  f.setVoices([US]);f.advance(5000);assert.equal(f.spoken.length,0);f.api.speakStudyWord('new click');assert.equal(f.started.length,1);
});

test('stop during cancellation cooldown removes the queued replacement and late callbacks',()=>{
  const f=fixture();f.api.speakStudyWord('old');const old=f.spoken[0];f.api.speakStudyWord('queued');f.advance(10);f.api.stopSpeech();f.advance(5000);
  f.late(old,'start');f.late(old,'end');f.late(old,'error');f.setVoices([US]);
  assert.deepEqual(f.spoken.map(u=>u.text),['old']);assert.equal(f.status.hidden,true);
});

test('stop while waiting for voices prevents later voiceschanged from speaking',()=>{
  const f=fixture({voices:[]});f.api.speakStudyWord('obsolete');f.api.stopSpeech();f.setVoices([US]);f.advance(8000);assert.equal(f.spoken.length,0);
});

test('pause during cooldown does not auto-play or retry; resume starts the pending replacement',()=>{
  const f=fixture();f.api.speakStudyWord('old');f.api.speakStudyWord('pending');f.api.pauseSpeech();f.advance(6000);
  assert.deepEqual(f.spoken.map(u=>u.text),['old']);assert.match(f.status.textContent,/暂停/);
  f.api.resumeSpeech();assert.equal(f.started.at(-1).text,'pending');
});

test('pause during voice loading survives voice availability until explicit resume',()=>{
  const f=fixture({voices:[]});f.api.speakStudyWord('patient');f.api.pauseSpeech();f.setVoices([US]);f.advance(6000);
  assert.equal(f.spoken.length,0);f.api.resumeSpeech();assert.equal(f.started.at(-1).text,'patient');
});

test('pause of a submitted but unstarted utterance suspends the watchdog',()=>{
  const f=fixture({autoStart:false});f.api.speak('A complete listening passage.');f.api.pauseSpeech();f.advance(6000);
  assert.equal(f.count('cancel'),0);assert.equal(f.spoken.length,1);f.api.resumeSpeech();f.start();f.advance(6000);assert.equal(f.spoken.length,1);
});

test('a silent startup retries once using a different local English voice when available',()=>{
  const f=fixture({voices:[remoteUS,GB],autoStart:u=>u.voice===GB});f.api.speakStudyWord('recover');assert.equal(f.spoken[0].voice,remoteUS);
  f.advance(1800);assert.match(f.status.textContent,/重试/);f.advance(80);
  assert.equal(f.spoken.length,2);assert.equal(f.spoken[1].voice,GB);assert.equal(f.started.length,1);assert.match(f.status.textContent,/英式/);
  f.advance(6000);assert.equal(f.spoken.length,2);
});

test('a successful fallback remains preferred for later words and voiceschanged in this session',()=>{
  const f=fixture({voices:[remoteUS,GB],autoStart:u=>u.voice.voiceURI===GB.voiceURI});
  f.api.speakStudyWord('first');f.advance(1880);assert.equal(f.started.at(-1).voice,GB);
  f.finish();f.api.speakStudyWord('second');assert.equal(f.spoken.at(-1).voice,GB);assert.equal(f.started.at(-1).text,'second');
  f.finish();f.setVoices([{...remoteUS},{...GB}]);f.api.speakStudyWord('third');
  assert.equal(f.spoken.at(-1).voice.voiceURI,GB.voiceURI,'refreshed voice objects must not resurrect the failed service');
  assert.equal(f.started.at(-1).text,'third');
  assert.equal(f.spoken.length,4,'only the first word incurs one fallback retry');
});

test('fallback skips a known-failed local voice when a healthy remote alternative is available',()=>{
  let britishHealthy=true;
  const f=fixture({voices:[US,GB,remoteUS],autoStart:u=>u.voice===remoteUS||(u.voice===GB&&britishHealthy)});
  f.api.speakStudyWord('first');f.advance(1880);assert.equal(f.started.at(-1).voice,GB,'first failed local US request falls back to local GB');
  f.finish();britishHealthy=false;f.api.speakStudyWord('second');f.advance(1880);
  assert.equal(f.spoken.at(-1).voice,remoteUS,'known-failed local US must not beat the healthy remote US alternative');
  assert.equal(f.started.at(-1).text,'second');assert.equal(f.spoken.length,4);
});

test('persistent silence produces two attempts then stops, with a usable new-click retry',()=>{
  const f=fixture({autoStart:false});f.api.speakStudyWord('silent');f.advance(1800+80+1800);assert.equal(f.spoken.length,2);
  assert.match(f.status.textContent,/未能.*播放/);f.advance(20000);assert.equal(f.spoken.length,2);
  f.api.speakStudyWord('silent');assert.equal(f.spoken.length,3);
});

test('an error before first sound gets one bounded retry; old retry callbacks cannot corrupt it',()=>{
  const f=fixture({autoStart:false});f.api.speakStudyWord('network');const old=f.spoken[0];f.late(old,'error','network');f.advance(80);
  assert.equal(f.spoken.length,2);f.late(old,'error');f.late(old,'end');f.start();f.advance(5000);
  assert.equal(f.spoken.length,2);assert.equal(f.started.length,1);assert.doesNotMatch(f.status.textContent,/失败|未能/);
});

test('browser permission denial is shown without automatic retry or unexpected playback',()=>{
  const f=fixture({autoStart:false});f.api.speakStudyWord('permission');f.late(f.spoken[0],'error','not-allowed');f.advance(10000);
  assert.equal(f.spoken.length,1);assert.match(f.status.textContent,/浏览器未允许/);
});

test('errors after audible start do not restart a listening passage from its beginning',()=>{
  const f=fixture();f.api.speak('A long passage already started.');f.late(f.spoken[0],'error','synthesis-failed');f.advance(10000);
  assert.equal(f.spoken.length,1);assert.match(f.status.textContent,/未能.*播放/);
});

test('cards, search pronunciation, dictation and passages share the same latest-request protection',()=>{
  const f=fixture();f.api.speak('A paragraph.');f.api.speakStudyWord('card');f.advance(20);f.api.speak('search');f.advance(60);
  assert.deepEqual(f.started.map(u=>u.text),['A paragraph.','search']);assert.equal(f.count('cancel'),1);
});

test('unsupported accents and non-English voices never become an accidental fallback',()=>{
  const chinese={name:'Chinese',voiceURI:'zh',lang:'zh-CN',localService:true},other={name:'Other English',voiceURI:'en-in',lang:'en-IN',localService:true};
  const f=fixture({voices:[chinese,other]});f.api.speakStudyWord('english');f.advance(3000);assert.equal(f.spoken.length,0);
  f.setVoices([chinese,other,GB]);f.api.speakStudyWord('english');assert.equal(f.spoken[0].voice,GB);
});

test('status never reveals concealed spelling or listening answers, and no learner data is accessed',()=>{
  const f=fixture({autoStart:false});const secret='unrevealed-answer-XYZ';f.api.speakStudyWord(secret);f.advance(1880);f.api.pauseSpeech();f.api.resumeSpeech();f.advance(1800);
  assert.ok(f.statusHistory.length>0);assert.ok(f.statusHistory.every(s=>!s.includes(secret)));assert.doesNotMatch(source,/localStorage|sessionStorage|\bstore\b|\bprogress\s*\(/);
});

test('missing browser speech support reports a clear message without throwing',()=>{
  const f=fixture({unsupported:true});f.api.speakStudyWord('test');assert.match(f.status.textContent,/不支持语音朗读/);assert.equal(f.spoken.length,0);
});
