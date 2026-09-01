import fs from 'node:fs';
import path from 'node:path';
import { RECOVERY } from './recovery-data.mjs';

// Optional dated additions are authored by the daily task, never fetched from the internet by the page.
export function loadCurriculum(){
  const file=path.resolve(import.meta.dirname,'../content/daily-lessons.json');
  const datedLessons=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
  for(const [date,lesson] of Object.entries(datedLessons)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!lesson.reading?.passage||!lesson.listening?.passage||!lesson.sent||lesson.trans?.length!==2||lesson.grammar?.length!==6||!Array.isArray(lesson.words))throw new Error('Invalid dated lesson: '+date);
  }
  const words=[...RECOVERY.words,...Object.values(datedLessons).flatMap(l=>l.words)].filter((w,i,a)=>a.findIndex(x=>x.word===w.word)===i);
  return {...RECOVERY,words,datedLessons};
}
