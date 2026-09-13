import fs from 'node:fs';
import { prepareStandalone, publishPrepared, chinaDate } from './generate-standalone.mjs';

// Windows PowerShell 5.1 may decode native stdout with the active console code
// page instead of UTF-8. Keep the machine-readable report ASCII-only so the
// root sync script can always pass it to ConvertFrom-Json without corrupting
// Chinese text. JSON.parse/ConvertFrom-Json restore the original characters.
function asciiSafeJson(value){
  return JSON.stringify(value,null,2).replace(/[^\x20-\x7E\r\n\t]/g,char=>`\\u${char.charCodeAt(0).toString(16).padStart(4,'0')}`);
}

const date=process.argv.find(x=>/^\d{4}-\d{2}-\d{2}$/.test(x))||chinaDate();
const checkOnly=process.argv.includes('--check'),prepared=await prepareStandalone(date);
const staleFiles=prepared.files.filter(([file,body])=>!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==body).map(([file])=>file);
const issues={missingDates:prepared.release.missingDates,duplicateReading:prepared.release.duplicateReading,duplicateListening:prepared.release.duplicateListening,duplicateExtensive:prepared.release.duplicateExtensive,duplicateCourse:prepared.release.duplicateCourse,dateMismatches:prepared.release.dateMismatches,incompleteDictation:prepared.release.incompleteDictation,missingExtensive:prepared.release.missingExtensive,missingGlosses:prepared.release.missingGlosses};
const structuralReady=!issues.duplicateReading.length&&!issues.duplicateListening.length&&!issues.duplicateExtensive.length&&!issues.duplicateCourse.length&&!issues.dateMismatches.length&&!issues.incompleteDictation.length&&!issues.missingExtensive.length&&!issues.missingGlosses.length;
const current=prepared.release.days.find(x=>x.date===date),todayReady=Boolean(current?.prepared)&&structuralReady;
const horizonReady=todayReady&&!issues.missingDates.length;
if(!checkOnly&&todayReady)publishPrepared(prepared);
const synced=horizonReady&&(!checkOnly||staleFiles.length===0);
console.log(asciiSafeJson({date,mode:checkOnly?'check':'sync',synced,contentReady:horizonReady,todayReady,horizonReady,buildId:prepared.release.buildId,preparedThrough:prepared.release.preparedThrough,days:prepared.release.days,...issues,staleFiles:checkOnly?staleFiles:todayReady?[]:staleFiles,note:'当天课程完整时允许启动；未来日期缺课会在网页中禁用并预警，不能循环旧题。同步脚本不读取或删除浏览器成绩。'}));
if(!synced)process.exitCode=2;
