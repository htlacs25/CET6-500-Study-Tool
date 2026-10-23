const legacyTypes=new Set(['public-domain adaptation','original news-style']);
const originalTypes=new Set(['public-domain excerpt','verified article']);
const nonempty=value=>typeof value==='string'&&Boolean(value.trim());
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validOriginalSourceUrl(value){
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password}catch{return false}
}
// Historical courses keep their old source identity and scores. New courses must
// identify an actual publication; provenance metadata does not replace source review.
export function validateExtensiveSource(article,date){
  if(date<'2026-10-23'&&legacyTypes.has(article?.sourceType))return true;
  if(!originalTypes.has(article?.sourceType)||!validOriginalSourceUrl(article.sourceUrl))return false;
  if(!['author','work','rightsNote'].every(key=>nonempty(article[key]))||!validDate(article.sourceVerifiedOn))return false;
  return article.sourceType==='public-domain excerpt'?nonempty(article.chapter):validDate(article.publicationDate);
}
