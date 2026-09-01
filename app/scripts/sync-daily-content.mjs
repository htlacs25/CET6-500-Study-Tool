import fs from 'node:fs';
import { prepareStandalone, publishPrepared, chinaDate } from './generate-standalone.mjs';

const date=process.argv.find(x=>/^\d{4}-\d{2}-\d{2}$/.test(x))||chinaDate();
const checkOnly=process.argv.includes('--check'),prepared=await prepareStandalone(date);
const staleFiles=prepared.files.filter(([file,body])=>!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==body).map(([file])=>file);
const issues={missingDates:prepared.release.missingDates,duplicateReading:prepared.release.duplicateReading,duplicateListening:prepared.release.duplicateListening};
const contentReady=Object.values(issues).every(x=>x.length===0);
if(!checkOnly&&contentReady)publishPrepared(prepared);
const synced=contentReady&&(!checkOnly||staleFiles.length===0);
console.log(JSON.stringify({date,mode:checkOnly?'check':'sync',synced,contentReady,buildId:prepared.release.buildId,preparedThrough:prepared.release.preparedThrough,days:prepared.release.days,...issues,staleFiles:checkOnly?staleFiles:contentReady?[]:staleFiles,note:'只处理D盘课程文件，不读取或删除浏览器成绩。缺课时先编写datedLessons，不能把循环旧题当全新内容。'},null,2));
if(!synced)process.exitCode=2;
