import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateExtensiveSource,validOriginalSourceUrl} from '../lib/extensive-source.mjs';
const original={sourceType:'public-domain excerpt',sourceUrl:'https://www.gutenberg.org/ebooks/11',author:'Lewis Carroll',work:'Alice’s Adventures in Wonderland',chapter:'Chapter I',sourceVerifiedOn:'2026-10-23',rightsNote:'Project Gutenberg public-domain edition.'};
test('new extensive reading rejects fictional news and adaptations; history is retained',()=>{
  for(const sourceType of ['original news-style','public-domain adaptation']){
    assert.equal(validateExtensiveSource({sourceType},'2026-10-22'),true);
    assert.equal(validateExtensiveSource({sourceType},'2026-10-23'),false);
  }
});
test('original excerpts require full provenance and safe HTTPS source links',()=>{
  assert.equal(validateExtensiveSource(original,'2026-10-23'),true);
  for(const key of ['author','work','chapter','sourceVerifiedOn','sourceUrl','rightsNote'])assert.equal(validateExtensiveSource({...original,[key]:''},'2026-10-23'),false,key);
  for(const sourceUrl of ['javascript:alert(1)','http://example.com','https://user:pass@example.com','not a url'])assert.equal(validOriginalSourceUrl(sourceUrl),false);
  assert.equal(validateExtensiveSource({...original,sourceVerifiedOn:'2026-02-31'},'2026-10-23'),false);
});
test('actual press articles require their publication date as well as rights information',()=>{
  const article={...original,sourceType:'verified article',publicationDate:'2026-10-21'};
  assert.equal(validateExtensiveSource(article,'2026-10-23'),true);
  assert.equal(validateExtensiveSource({...article,publicationDate:''},'2026-10-23'),false);
});
test('UI labels originals truthfully and suppresses unsafe source links',()=>{
  const html=fs.readFileSync(new URL('../standalone-template.html',import.meta.url),'utf8');
  const fn=html.slice(html.indexOf('function extensiveSourceInfo('),html.indexOf('function renderExtensive('));
  const info=vm.runInNewContext(fn+';extensiveSourceInfo',{URL});
  assert.equal(info(original).label,'公版名著原文节选');
  assert.ok(info(original).url.startsWith('https://www.gutenberg.org/'));
  assert.match(info(original).description,/未作教学改写/);
  assert.match(info({sourceType:'original news-style'}).description,/历史课程/);
  assert.equal(info({...original,sourceUrl:'javascript:alert(1)'}).url,'');
  assert.match(html,/查看原文出处/);
});
