import fs from 'node:fs';
import path from 'node:path';
import { RECOVERY } from './recovery-data.mjs';

// Optional dated additions are authored by the daily task, never fetched from the internet by the page.
export function loadCurriculum(){
  const file=path.resolve(import.meta.dirname,'../content/daily-lessons.json');
  const glossaryFile=path.resolve(import.meta.dirname,'../content/article-glossary.json');
  const dictationFile=path.resolve(import.meta.dirname,'../content/full-dictation.json');
  const extensiveFile=path.resolve(import.meta.dirname,'../content/extensive-reading.json');
  const datedLessons=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
  const articleGlossary=fs.existsSync(glossaryFile)?JSON.parse(fs.readFileSync(glossaryFile,'utf8')):{entries:{}};
  const fullDictations=fs.existsSync(dictationFile)?JSON.parse(fs.readFileSync(dictationFile,'utf8')):{};
  const extensiveRows=fs.existsSync(extensiveFile)?JSON.parse(fs.readFileSync(extensiveFile,'utf8')):{};
  const extensiveReadings=Array.isArray(extensiveRows)?Object.fromEntries(extensiveRows.map(x=>[x?.date,x])):extensiveRows;
  if(!articleGlossary.entries||typeof articleGlossary.entries!=='object'||Array.isArray(articleGlossary.entries))throw new Error('Invalid article glossary');
  if(!extensiveReadings||typeof extensiveReadings!=='object'||Array.isArray(extensiveReadings))throw new Error('Invalid extensive reading collection');
  for(const [date,lesson] of Object.entries(datedLessons)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!lesson.reading?.passage||!lesson.listening?.passage||!lesson.sent||lesson.trans?.length!==2||lesson.grammar?.length!==6||!Array.isArray(lesson.words))throw new Error('Invalid dated lesson: '+date);
  }
  const addDay=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*864e5).toISOString().slice(0,10);
  const attachExtensive=(lesson,date)=>{
    const article=extensiveReadings[date],wordCount=(String(article?.text||'').match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g)||[]).length;
    const hasCjk=value=>/[\u3400-\u9fff]/.test(String(value||''));
    const validQuestions=Array.isArray(article?.questions)&&article.questions.length===2&&article.questions.every(q=>String(q?.prompt||'').trim()&&hasCjk(q.promptZh)&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(x=>String(x||'').trim())&&Array.isArray(q.optionsZh)&&q.optionsZh.length===4&&q.optionsZh.every(hasCjk)&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&hasCjk(q.explanation));
    const validPhrases=Array.isArray(article?.keyPhrases)&&article.keyPhrases.length===3&&article.keyPhrases.every(x=>String(x?.en||'').trim()&&hasCjk(x.zh));
    if(!article||article.date!==date||!String(article.title||'').trim()||!hasCjk(article.titleZh)||!String(article.category||'').trim()||!['public-domain adaptation','original news-style'].includes(article.sourceType)||wordCount<180||wordCount>240||!hasCjk(article.textZh)||!String(article.sourceNote||'').trim()||!hasCjk(article.listeningTip)||!String(article.speakingPrompt||'').trim()||!hasCjk(article.speakingPromptZh)||!validQuestions||!validPhrases)throw new Error('Invalid extensive reading: '+date);
    return {...lesson,extensive:{...article,date}};
  };
  const attachFullDictation=(lesson,date)=>{
    const items=fullDictations[date];
    if(!Array.isArray(items)||!items.length||items.some(x=>!String(x?.text||'').trim()||!String(x?.zh||'').trim()))throw new Error('Invalid full dictation: '+date);
    const norm=value=>String(value||'').toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]/g,' ').replace(/\s+/g,' ').trim();
    if(norm(items.map(x=>x.text).join(' '))!==norm(lesson.listening?.passage))throw new Error('Incomplete full dictation: '+date);
    return attachExtensive({...lesson,date,reading:{...lesson.reading},listening:{...lesson.listening,fullDictation:items.map(x=>({text:String(x.text).trim(),zh:String(x.zh).trim()}))}},date);
  };
  const recoveryLessons=RECOVERY.lessons.map((lesson,i)=>attachFullDictation(lesson,addDay(RECOVERY.start,i)));
  const datedWithDictation=Object.fromEntries(Object.entries(datedLessons).map(([date,lesson])=>[date,attachFullDictation(lesson,date)]));
  const lessons=[...recoveryLessons,...Object.values(datedWithDictation)],tokenPattern=/[a-z]+(?:'[a-z]+)?/g;
  const missingGlosses=[];
  for(const lesson of lessons){
    for(const [section,passage] of [['reading',lesson.reading?.passage],['listening',lesson.listening?.passage],['extensive',lesson.extensive?.text]]){
      const tokens=String(passage||'').toLowerCase().match(tokenPattern)||[];
      for(const surface of tokens){
        const possessive=surface.endsWith("'s")?surface.slice(0,-2):surface;
        const hasMeaning=key=>Object.hasOwn(articleGlossary.entries,key)&&String(articleGlossary.entries[key]?.meaning||'').trim();
        if(!hasMeaning(surface)&&!hasMeaning(possessive))missingGlosses.push(`${lesson.date||lesson.title}:${section}:${surface}`);
      }
    }
  }
  if(missingGlosses.length)throw new Error('Missing article glosses: '+[...new Set(missingGlosses)].slice(0,20).join(', '));
  const words=[...RECOVERY.words,...Object.values(datedWithDictation).flatMap(l=>l.words)].filter((w,i,a)=>a.findIndex(x=>x.word===w.word)===i);
  return {...RECOVERY,lessons:recoveryLessons,words,datedLessons:datedWithDictation,articleGlossary,extensiveReadings};
}
