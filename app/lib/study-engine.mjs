// Pure curriculum and scoring logic, shared with offline HTML and node tests.
export const RECOVERY_STORAGE_KEY = 'cet6-500-recovery-v1';
export const OLD_PROGRESS_KEYS = ['cet6-500-offline-v2','cet6-500-study-progress-v2','cet6-500-study-progress-v1'];
export const RECOVERY_DATE = '2026-08-28';
export const ROADMAP = [
  {from:'2026-08-28',to:'2026-09-10',name:'两周基础恢复',goal:'常用词、主句谓语、be动词、短听力'},
  {from:'2026-09-11',to:'2026-09-30',name:'基础衔接',goal:'逐步加入四级常见语境和稍长材料'},
  {from:'2026-10-01',to:'2026-10-31',name:'六级专项',goal:'听读译写专项，逐步限时'},
  {from:'2026-11-01',to:'2026-11-30',name:'真题与限时训练',goal:'核验真题来源，分套练习并复盘'},
  {from:'2026-12-01',to:'2026-12-31',name:'模考与查漏补缺',goal:'根据实际考试日期安排整套练习与考前节奏'}
];
export function courseDay(k){return Math.floor((Date.parse(k+'T00:00:00Z')-Date.parse(RECOVERY_DATE+'T00:00:00Z'))/86400000)}
export function dateGap(a,b){return Math.round((Date.parse(a+'T00:00:00Z')-Date.parse(b+'T00:00:00Z'))/86400000)}
export function phaseFor(k){return ROADMAP.find(x=>k>=x.from&&k<=x.to)||ROADMAP[k<RECOVERY_DATE?0:ROADMAP.length-1]}
function hashText(value){
  let hash=2166136261;
  for(const char of String(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}
  return (hash>>>0).toString(16).padStart(8,'0');
}
export function lessonDate(lesson={}){
  return lesson.date||String(lesson.id||'').match(/\d{4}-\d{2}-\d{2}$/)?.[0]||'';
}
export function lessonFingerprint(lesson={}){
  const sourceWords=lesson.sourceWords||lesson.nw||[];
  const core={
    date:lessonDate(lesson),title:lesson.title||'',grammarTip:lesson.grammarTip||'',
    sourceWords:sourceWords.map(w=>typeof w==='string'?{word:w}:w),grammar:lesson.grammar||[],
    reading:lesson.reading||null,listening:lesson.listening||null,sent:lesson.sent||[],trans:lesson.trans||[]
  };
  return hashText(JSON.stringify(core));
}
export function blankProgress(){return {completed:[],wordCorrect:0,wordTotal:0,listeningCorrect:0,listeningTotal:0,listeningChoiceCorrect:0,listeningChoiceTotal:0,quizCorrect:0,quizTotal:0,grammarCorrect:0,grammarTotal:0,readingCorrect:0,readingTotal:0,sentenceCorrect:0,sentenceTotal:0,translationCorrect:0,translationTotal:0,wordErrors:[],listeningErrors:[],quizErrors:[],notes:'',attempts:{},errorDetails:[],draft:null,lessonSnapshot:null,snapshotArchive:[]}}
export function normEnglish(s){return String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim()}
export function mergeLegacyStores(read){
  const out={};
  for(const key of [...OLD_PROGRESS_KEYS].reverse()){
    const raw=read(key);if(!raw)continue;
    const item=JSON.parse(raw);
    if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('学习记录格式异常');
    for(const [date,p] of Object.entries(item)){if(/^\d{4}-\d{2}-\d{2}$/.test(date))out[date]={...(out[date]||{}),...p}}
  }
  return out;
}
const scoreFields={word:['wordCorrect','wordTotal'],dictation:['listeningCorrect','listeningTotal'],listeningChoice:['listeningChoiceCorrect','listeningChoiceTotal'],grammar:['grammarCorrect','grammarTotal'],reading:['readingCorrect','readingTotal'],vocab:['vocabCorrect','vocabTotal'],sentence:['sentenceCorrect','sentenceTotal'],translation:['translationCorrect','translationTotal']};
export function recordFirstAttempt(previous,group,id,correct,detail={}){
  if(!scoreFields[group])throw new Error('Unknown group: '+group);
  const p={...blankProgress(),...previous},key=group+':'+id;
  if(p.attempts[key])return p;
  p.attempts={...p.attempts,[key]:{...detail,group,correct:Boolean(correct)}};
  const rows=Object.values(p.attempts).filter(a=>a.group===group);
  const [c,t]=scoreFields[group];p[c]=rows.filter(a=>a.correct).length;p[t]=rows.length;
  if(['grammar','reading','vocab'].includes(group)){
    const q=Object.values(p.attempts).filter(a=>['grammar','reading','vocab'].includes(a.group));
    p.quizCorrect=q.filter(a=>a.correct).length;p.quizTotal=q.length;
  }
  if(!correct){
    const e={group,id,label:detail.label||'',tag:detail.tag||group,answer:detail.answer||'',expected:detail.expected||''};
    p.errorDetails=[...p.errorDetails,e];
    if(detail.targetWord)p.wordErrors=[...new Set([...p.wordErrors,detail.targetWord])];
    if(group==='dictation'&&detail.expected)p.listeningErrors=[...new Set([...p.listeningErrors,detail.expected])];
    if(!['word','dictation'].includes(group)&&detail.label)p.quizErrors=[...new Set([...p.quizErrors,detail.label])];
  }
  return p;
}
export function assessSentence(x,main,translated){
  const tokens=new Set(normEnglish(main).split(' '));
  const expected=(x.core||normEnglish(x.main).split(' ').filter(t=>t.length>2)).map(t=>normEnglish(t));
  const score=expected.length?expected.filter(t=>tokens.has(t)).length/expected.length:0;
  const missing=x.keywords.filter(k=>!String(translated).includes(k));
  return {score,missing,ok:(x.core?score===1:score>=.55)&&missing.length<=1};
}
export function assessTranslation(x,input){
  const n=normEnglish(input),accepted=(x.acceptedAnswers||[x.answer]).some(a=>normEnglish(a)===n);
  const missing=x.keywords.filter(k=>!n.includes(normEnglish(k)));
  const score=(x.keywords.length-missing.length)/Math.max(1,x.keywords.length);
  return {missing,score,ok:accepted||(x.acceptedAnswers?missing.length===0:score>=.65),accepted};
}
export function readiness(history,date){
  const days=Object.entries(history).filter(([k,p])=>k<date&&dateGap(date,k)<=7&&p.lessonSnapshot?.recovery);
  const complete=days.filter(([,p])=>p.wordTotal>=12&&p.listeningChoiceTotal>=2&&p.grammarTotal>=6&&p.readingTotal>=3);
  const rates={};
  for(const group of ['word','listeningChoice','grammar','reading']){
    const [c,t]=scoreFields[group];const total=days.reduce((n,[,p])=>n+(p[t]||0),0),correct=days.reduce((n,[,p])=>n+(p[c]||0),0);
    rates[group]={correct,total,rate:total?correct/total:null};
  }
  const enough=complete.length>=3;
  const advance=enough&&rates.word.rate>=.8&&rates.grammar.rate>=.8&&rates.reading.rate>=.75&&rates.listeningChoice.rate>=.7;
  return {advance,enough,completeDays:complete.length,rates,message:!enough?'近7天完整练习少于3天，证据不足，保持基础量。':advance?'基础练习达到衔接参考线，可逐步尝试稍长材料。':'先巩固未达参考线的模块，保持总量，不自动堆新题。'};
}
function mixOptions(questions,seed){
  return questions.map((q,qi)=>{
    const order=q.options.map((_,i)=>i);let state=(seed*97+qi*65537+19)>>>0;
    for(let i=order.length-1;i>0;i--){state=(Math.imul(state,1664525)+1013904223)>>>0;const j=state%(i+1);[order[i],order[j]]=[order[j],order[i]]}
    return {...q,options:order.map(i=>q.options[i]),optionsZh:q.optionsZh?order.map(i=>q.optionsZh[i]):undefined,answer:order.indexOf(q.answer)};
  });
}
export function buildRecoveryLesson(data,recovery,date,history={}){
  const di=courseDay(date);if(di<0)return null;
  const index=di%recovery.lessons.length,dated=recovery.datedLessons?.[date],gate=readiness(history,date);
  if(di>=recovery.lessons.length&&!dated){
    const phase=phaseFor(date),pending={id:'pending:'+date,date,unprepared:true,freshMaterial:false,recovery:true,foundation:true,weekly:(di+1)%7===0,index,di:Math.floor((Date.parse(date)-Date.parse('2026-08-22'))/864e5),recoveryDay:di+1,title:'课程尚未生成或同步',phase,gate,trainingName:'等待课程更新',grammarTip:'为防止把旧题冒充新题，本日练习暂不开放。',nw:[],rev:[],quizWords:[],all:[],priorityErrors:[],reading:{title:'Pending lesson',titleZh:'阅读材料待生成',passage:'',passageZh:'',questions:[],level:'待更新',topic:'课程完整性保护'},listening:{title:'Pending lesson',titleZh:'听力材料待生成',passage:'',passageZh:'',dictation:[],dictationZh:[],questions:[],level:'待更新',tip:'同步完成后再开始。'},sent:[],trans:[],grammar:[],taskCount:0,tasks:[],wordReviewRule:'课程同步后再安排固定复习量。',sourceNote:'系统已阻止循环旧题；已有成绩、错题和草稿不会删除。'};
    const contentSignature=lessonFingerprint(pending);
    return {...pending,contentSignature,contentRevision:'pending-'+contentSignature};
  }
  const seed=dated||recovery.lessons[index];
  const foundation=di<14||!gate.advance,weekly=(di+1)%7===0;
  const pool=[...recovery.words,...data.WORDS].filter((w,i,a)=>a.findIndex(x=>x.word===w.word)===i);
  const find=n=>pool.find(w=>w.word.toLowerCase()===String(n).toLowerCase());
  const past=Object.entries(history).filter(([k])=>k<date).sort(([a],[b])=>b.localeCompare(a));
  const latestWordResult=new Map(),latestWordDate=new Map();
  for(const [k,p] of past){
    const packDate=k;
    const runs=[p,...(Array.isArray(p.snapshotArchive)?[...p.snapshotArchive].reverse().map(x=>x.progress).filter(Boolean):[])];
    for(const run of runs){
      for(const a of Object.values(run.attempts||{}))if(a.group==='word'&&a.targetWord&&!latestWordResult.has(a.targetWord)){
        latestWordResult.set(a.targetWord,a.correct);latestWordDate.set(a.targetWord,packDate);
      }
      for(const n of run.wordErrors||[])if(!latestWordResult.has(n)){
        latestWordResult.set(n,false);latestWordDate.set(n,packDate);
      }
    }
  }
  const reviewGaps=[1,3,7,14],dueWords=[];
  for(const [k,p] of past){
    const age=dateGap(date,k);
    if(reviewGaps.includes(age)){
      dueWords.push(...(p.lessonSnapshot?.nw||[]).map(w=>w.word));
    }
  }
  // Reviews not yet attempted still follow the prepared D1/D3/D7/D14 packs.
  for(const gap of reviewGaps)if(di>=gap)dueWords.push(...recovery.lessons[(di-gap)%14].words.map(w=>w.word));
  const nw=weekly?[]:dated?seed.words.slice(0,foundation?8:12):foundation?seed.words.slice(0,8):Array.from({length:12},(_,i)=>data.WORDS[((di-14)*12+i+data.WORDS.length*3)%data.WORDS.length]);
  const priorPacks=recovery.lessons.slice(0,Math.min(index,14)).flatMap(x=>x.words).map(w=>w.word).reverse();
  const baseline=['improve','think','decide','enough','remember','read','write','understand','forget','begin','finish','time','help','question','answer','friend','practice','review'];
  const pendingErrors=[...latestWordResult.entries()].filter(([,correct])=>correct!==true).map(([n])=>n).filter(n=>find(n)&&!nw.some(w=>w.word===n));
  const scheduledErrors=pendingErrors.filter(n=>{
    const age=dateGap(date,latestWordDate.get(n));
    return reviewGaps.includes(age)||(age>14&&age%14===0);
  });
  // A word is prioritised only when its spaced-review date arrives. Rotate the
  // due group by calendar day so one persistent error cannot stay first daily.
  const errorOffset=scheduledErrors.length?di%scheduledErrors.length:0;
  const rotatingErrors=[...scheduledErrors.slice(errorOffset),...scheduledErrors.slice(0,errorOffset)];
  const priorityErrors=rotatingErrors.slice(0,4),errorSet=new Set(pendingErrors);
  const ordinaryNames=[...dueWords,...priorPacks,...baseline,...recovery.words.map(w=>w.word)].filter(n=>!errorSet.has(n));
  const candidateNames=[...priorityErrors,...ordinaryNames];
  const rev=candidateNames.map(find).filter(Boolean).filter((w,i,a)=>!nw.some(n=>n.word===w.word)&&a.findIndex(n=>n.word===w.word)===i).slice(0,12);
  const quizNew=[...nw.filter(w=>['improve','think'].includes(w.word)),...nw.filter(w=>!['improve','think'].includes(w.word))];
  const quizWords=nw.length?[...rev.slice(0,3),...quizNew.slice(0,3),...rev.slice(3,6),...quizNew.slice(3,6)]:rev.slice(0,12);
  const phase=phaseFor(date),advanced=!foundation&&date>='2026-10-01';
  let reading=seed.reading,listening=seed.listening,sent=[seed.sent],trans=seed.trans;
  if(!foundation&&!dated){
    reading=data.CET_READINGS[di%data.CET_READINGS.length];
    const li=di%data.LISTENINGS.length,x=data.LISTENINGS[li],support=data.LISTENING_SUPPORT[li];
    listening={...x,...support,dictation:x.dictation.slice(0,advanced?5:3),dictationZh:support.dictationZh.slice(0,advanced?5:3),questions:x.questions.map((q,i)=>({...q,...data.LISTENING_QUESTION_ZH[li][i]}))};
    sent=Array.from({length:advanced?2:1},(_,i)=>data.CET_LONG_SENTENCES[(di*2+i)%data.CET_LONG_SENTENCES.length]);
    trans=Array.from({length:2},(_,i)=>data.CET_TRANSLATIONS[(di*2+i)%data.CET_TRANSLATIONS.length]);
  }
  reading={...reading,questions:mixOptions(reading.questions,di+1)};
  listening={...listening,questions:mixOptions(listening.questions,di+101)};
  const grammar=mixOptions(seed.grammar,di+201);
  const weekend=[0,6].includes(new Date(date+'T00:00:00Z').getUTCDay());
  const minutes=weekend?[40,35,25,40,30,10]:[30,25,20,25,10,10];
  const labels=[weekly?'12词周测与错词复习':nw.length+'个新/激活词＋12个复习词','短听力理解＋'+listening.dictation.length+'句听写','1个语法点＋6题','阅读1篇＋'+reading.questions.length+'题','句子主干'+sent.length+'句＋表达2句','错题复盘＋共同记录难点'];
  const targets=['words','listening','grammar','reading','sentences','review'],tabs=['words','listening','practice','practice','practice','records'];
  const lesson={id:'recovery-v1:'+date,date,freshMaterial:di<recovery.lessons.length||Boolean(dated),recovery:true,foundation,weekly,index,di:Math.floor((Date.parse(date)-Date.parse('2026-08-22'))/864e5),recoveryDay:di+1,title:seed.title,phase,gate,trainingName:foundation?'基础恢复':advanced?'六级专项模拟':'基础衔接',grammarTip:seed.grammarTip,sourceWords:seed.words||[],nw,rev,quizWords,all:[...rev,...nw],priorityErrors,reading,listening,sent,trans,grammar,taskCount:6,tasks:labels.map((label,i)=>({id:targets[i],tab:tabs[i],label,minutes:minutes[i]})),wordReviewRule:'12个复习位：最多4个到期错词＋其余间隔旧词。错词按D1/D3/D7/D14到期复习；同日多个错词按日期轮换顺序，不额外加量。',sourceNote:'本地题库为原创模拟；听力为浏览器合成朗读，不冒充历年真题录音。'};
  const contentSignature=lessonFingerprint(lesson);
  return {...lesson,contentSignature,contentRevision:'course-'+contentSignature};
}
export function hasAnswerWork(p={}){
  if((p.completed||[]).length||Object.keys(p.attempts||{}).length||['wordTotal','listeningTotal','listeningChoiceTotal','quizTotal','sentenceTotal','translationTotal'].some(k=>p[k]>0))return true;
  const d=p.draft||{};
  return Boolean(d.ws?.input||d.ws?.meaningInput||d.ws?.i||d.ls?.input||d.ls?.i||Object.keys(d.ls?.answers||{}).length||Object.keys(d.ps?.answers||{}).length||Object.values(d.ps?.sent||{}).some(x=>x.main||x.trans)||Object.values(d.ps?.trans||{}).some(x=>x.input));
}
export function chooseDailyLesson(date,p,fresh){
  const old=p?.lessonSnapshot;
  if(!old||!hasAnswerWork(p))return fresh;
  const oldDate=lessonDate(old);
  if(oldDate!==date)return {...fresh,cacheDateMismatch:true,staleSnapshotDate:oldDate||'未知日期'};
  const oldSignature=old.contentSignature||lessonFingerprint(old),freshSignature=fresh.contentSignature||lessonFingerprint(fresh);
  if(oldSignature!==freshSignature)return {...fresh,cacheContentMismatch:true,staleContentSignature:oldSignature};
  return old; // Only reuse answers when the snapshot belongs to this date and this exact question set.
}
export function difficultiesFor(p,diagnostic){
  const a=[],tags=new Set((p.errorDetails||[]).map(x=>x.tag));
  if(tags.has('main-verb'))a.push('主干识别：将修饰从句中的动词与主句谓语分开。');
  if(tags.has('be-verb'))a.push('句子完整性：检查形容词前是否缺少am/is/are。');
  if(tags.has('spelling')||p.wordErrors?.length)a.push('词形与拼写：'+(p.wordErrors||[]).slice(0,6).join('、'));
  if(tags.has('word-form'))a.push('搭配与词性：复习listen to、every day及动词形式。');
  if(p.listeningErrors?.length)a.push('句子听写：'+p.listeningErrors.length+'句需重听，区分不认识与没有辨出声音。');
  if(p.listeningChoiceTotal&&p.listeningChoiceCorrect/p.listeningChoiceTotal<.7)a.push('听力理解：本次细节或顺序题需要复盘。');
  if(p.readingTotal&&p.readingCorrect/p.readingTotal<.75)a.push('阅读定位：每题回到原文指出依据。');
  if(p.sentenceTotal&&p.sentenceCorrect/p.sentenceTotal<.7)a.push('句子分析规则初判未达标；可能有合理同义表达，请共同复核。');
  if(p.translationTotal&&p.translationCorrect/p.translationTotal<.7)a.push('表达规则初判未达标；检查谓语、词形，保留合理同义表达。');
  return a.length?a:['当天暂无足够错题证据。对话起点关注：'+diagnostic.focus.slice(0,3).join('；')+'。'];
}
