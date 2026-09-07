import fs from 'node:fs';
import { prepareStandalone, publishPrepared, chinaDate } from './generate-standalone.mjs';

const date=process.argv.find(x=>/^\d{4}-\d{2}-\d{2}$/.test(x))||chinaDate();
const checkOnly=process.argv.includes('--check'),prepared=await prepareStandalone(date);
const staleFiles=prepared.files.filter(([file,body])=>!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==body).map(([file])=>file);
const issues={missingDates:prepared.release.missingDates,duplicateReading:prepared.release.duplicateReading,duplicateListening:prepared.release.duplicateListening,duplicateCourse:prepared.release.duplicateCourse,dateMismatches:prepared.release.dateMismatches};
const structuralReady=!issues.duplicateReading.length&&!issues.duplicateListening.length&&!issues.duplicateCourse.length&&!issues.dateMismatches.length;
const current=prepared.release.days.find(x=>x.date===date),todayReady=Boolean(current?.prepared)&&structuralReady;
const horizonReady=todayReady&&!issues.missingDates.length;
if(!checkOnly&&todayReady)publishPrepared(prepared);
const synced=horizonReady&&(!checkOnly||staleFiles.length===0);
console.log(JSON.stringify({date,mode:checkOnly?'check':'sync',synced,contentReady:horizonReady,todayReady,horizonReady,buildId:prepared.release.buildId,preparedThrough:prepared.release.preparedThrough,days:prepared.release.days,...issues,staleFiles:checkOnly?staleFiles:todayReady?[]:staleFiles,note:'当天课程完整时允许启动；未来日期缺课会在网页中禁用并预警，不能循环旧题。同步脚本不读取或删除浏览器成绩。'},null,2));
if(!synced)process.exitCode=2;
