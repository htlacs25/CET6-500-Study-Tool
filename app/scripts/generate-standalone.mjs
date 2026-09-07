import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { loadCurriculum } from '../lib/load-curriculum.mjs';
import { buildRecoveryLesson } from '../lib/study-engine.mjs';

const appRoot=path.resolve(import.meta.dirname,'..'),toolRoot=path.resolve(appRoot,'..');
export const chinaDate=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const addDay=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
const json=value=>JSON.stringify(value).replaceAll('</script>','<\\/script>');
const digest=text=>createHash('sha256').update(text.trim().toLowerCase().replace(/\s+/g,' ')).digest('hex').slice(0,16);
const courseDigest=lesson=>digest(JSON.stringify({
  title:lesson.title,grammarTip:lesson.grammarTip,
  sourceWords:lesson.sourceWords||lesson.nw,
  grammar:lesson.grammar,reading:lesson.reading,listening:lesson.listening,sent:lesson.sent,trans:lesson.trans
}));

export async function prepareStandalone(date=chinaDate()){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||addDay(date,0)!==date)throw new Error('Invalid date');
  const source=fs.readFileSync(path.join(appRoot,'lib','study-data.ts'),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  const data=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
  const names=['WORDS','LONG_SENTENCES','GRAMMAR_QUESTIONS','READINGS','TRANSLATIONS','LISTENINGS','CET_READINGS','GRAMMAR_ZH','LONG_SENTENCE_SUPPORT','TRANSLATION_SUPPORT','LISTENING_SUPPORT','LISTENING_QUESTION_ZH','CET_LONG_SENTENCES','CET_TRANSLATIONS','DAY_PRESETS'];
  const payload=json(Object.fromEntries(names.map(n=>[n,data[n]]))),recovery=loadCurriculum();
  const template=fs.readFileSync(path.join(appRoot,'standalone-template.html'),'utf8');
  const engine=fs.readFileSync(path.join(appRoot,'lib','study-engine.mjs'),'utf8').replace(/^export /gm,'');
  const days=Array.from({length:7},(_,i)=>{
    const k=addDay(date,i-3),L=buildRecoveryLesson(data,recovery,k);
    if(!L){const di=Math.max(0,Math.floor((Date.parse(k)-Date.parse('2026-08-22'))/864e5)),p=data.DAY_PRESETS[k],r=data.CET_READINGS[(p?.readingIndex??di)%data.CET_READINGS.length],l=data.LISTENINGS[(p?.listeningIndex??di)%data.LISTENINGS.length],legacy={date:k,title:'历史课程',reading:r,listening:l};return {date:k,lessonDate:k,lessonId:'legacy:'+k,title:legacy.title,reading:r.title,listening:l.title,readingHash:digest(r.passage),listeningHash:digest(l.passage),courseHash:courseDigest(legacy),prepared:true}}
    return {date:k,lessonDate:L.date,lessonId:L.id,title:L.title,reading:L.reading.title,listening:L.listening.title,readingHash:digest(L.reading.passage),listeningHash:digest(L.listening.passage),courseHash:courseDigest(L),newWords:L.nw.map(w=>w.word),prepared:L.freshMaterial};
  });
  const missingDates=days.filter(d=>d.date>=date&&!d.prepared).map(d=>d.date);
  const duplicateReading=days.filter((d,i,a)=>a.findIndex(x=>x.readingHash===d.readingHash)!==i).map(d=>d.date);
  const duplicateListening=days.filter((d,i,a)=>a.findIndex(x=>x.listeningHash===d.listeningHash)!==i).map(d=>d.date);
  const duplicateCourse=days.filter((d,i,a)=>a.findIndex(x=>x.courseHash===d.courseHash)!==i).map(d=>d.date);
  const dateMismatches=days.filter(d=>d.lessonDate&&d.lessonDate!==d.date||d.lessonId&&!String(d.lessonId).endsWith(d.date)).map(d=>d.date);
  const version='2026-09-07.2';
  const buildId=createHash('sha256').update(template+engine+payload+json(recovery)+date+version).digest('hex').slice(0,12);
  const release={version,buildId,verifiedOn:date,preparedThrough:[addDay(recovery.start,recovery.lessons.length-1),...Object.keys(recovery.datedLessons)].sort().at(-1),days,missingDates,duplicateReading,duplicateListening,duplicateCourse,dateMismatches};
  const html=template.replace('__STUDY_DATA__',()=>payload).replace('__RECOVERY_DATA__',()=>json(recovery)).replace('__STUDY_ENGINE__',()=>engine).replace('__RELEASE__',()=>json(release));
  if(/__(STUDY_DATA|RECOVERY_DATA|STUDY_ENGINE|RELEASE)__/.test(html))throw new Error('Unexpanded template');
  for(const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g))new Function(match[1]);
  const releaseJs='window.__CET6ReceiveRelease && window.__CET6ReceiveRelease('+json(release)+');\n';
  const files=[
    [path.join(toolRoot,'六级学习工具.html'),html],
    [path.join(appRoot,'public','六级学习工具.html'),html],
    [path.join(toolRoot,'study-release.js'),releaseJs],
    [path.join(appRoot,'public','study-release.js'),releaseJs],
    [path.join(toolRoot,'同步状态.json'),JSON.stringify(release,null,2)+'\n']
  ];
  const distClient=path.join(appRoot,'dist','client');
  if(fs.existsSync(distClient))files.push(
    [path.join(distClient,'六级学习工具.html'),html],
    [path.join(distClient,'study-release.js'),releaseJs]
  );
  return {html,release,files};
}

export function publishPrepared(prepared){
  // Validate before touching either entry. Release beacons are written after the HTML copies.
  for(const [file,body] of prepared.files){
    if(fs.existsSync(file)&&fs.readFileSync(file,'utf8')===body)continue;
    fs.mkdirSync(path.dirname(file),{recursive:true});
    const temp=file+'.sync-tmp';
    fs.writeFileSync(temp,body,'utf8');
    fs.renameSync(temp,file);
  }
  for(const [file,body] of prepared.files)if(fs.readFileSync(file,'utf8')!==body)throw new Error('Sync verification failed: '+file);
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  const prepared=await prepareStandalone(process.argv[2]||chinaDate());
  publishPrepared(prepared);
  console.log(JSON.stringify({file:prepared.files[0][0],...prepared.release},null,2));
}
