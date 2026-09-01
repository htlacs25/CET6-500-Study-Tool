import fs from 'node:fs';
import path from 'node:path';
import { buildRecoveryLesson, chooseDailyLesson } from '../lib/study-engine.mjs';

const appRoot = path.resolve(import.meta.dirname, '..');
const date = process.argv[2] || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) throw new Error('Use a date in YYYY-MM-DD format');
const html = fs.readFileSync(path.join(appRoot, 'public', '六级学习工具.html'), 'utf8');
const match = html.match(/const DATA=([\s\S]*?); const RECOVERY=/);
if (!match) throw new Error('Run npm run standalone to generate the current local curriculum');
const data = JSON.parse(match[1]);
const RECOVERY = JSON.parse(html.match(/const RECOVERY=([^\n]*);\n/)[1]);
const exported = process.argv[3] ? JSON.parse(fs.readFileSync(path.resolve(process.argv[3]), 'utf8')) : {};
const history = { ...(exported.legacy || {}), ...(exported.recovery || {}) };
const lesson = chooseDailyLesson(date, exported.recovery?.[date], buildRecoveryLesson(data, RECOVERY, date, history));
console.log(JSON.stringify({
  date, goal:'2026年12月六级500分（冲刺目标，不保证）',
  recordsAvailable:Boolean(process.argv[3]),
  diagnostic:RECOVERY.diagnostic,
  lesson,
  note:process.argv[3]?'依据明确提供的导出记录生成。':'未读取浏览器成绩，采用无历史成绩时的保守安排；不把未知当成零分。'
}, null, 2));
