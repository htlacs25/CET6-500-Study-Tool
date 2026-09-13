import fs from 'node:fs';
import path from 'node:path';

const appRoot=path.resolve(import.meta.dirname,'..');
const articleFile=path.join(appRoot,'content','extensive-reading.json');
const glossaryFile=path.join(appRoot,'content','article-glossary.json');
const articlesSource=JSON.parse(fs.readFileSync(articleFile,'utf8'));
const articles=Array.isArray(articlesSource)?articlesSource:Object.values(articlesSource);
const glossary=JSON.parse(fs.readFileSync(glossaryFile,'utf8'));
const entries=glossary.entries;
const exists=word=>Object.hasOwn(entries,word)&&String(entries[word]?.meaning||'').trim();

// Irregular forms and forms whose spelling can map to more than one lemma.
const baseOverrides={
  stood:'stand',borrowers:'borrow',supporters:'support',dropped:'drop',known:'know',knew:'know',held:'hold',taken:'take',led:'lead',lost:'lose',shown:'show',hung:'hang',been:'be',begun:'begin',fallen:'fall',built:'build',redesigned:'redesign',spoke:'speak',designers:'design',unused:'use',outgrown:'grow',forgotten:'forget',stepped:'step',dotted:'dot',creators:'create',men:'man',shook:'shake',seen:'see',reconnect:'connect',sent:'send',happier:'happy',hid:'hide',responsibly:'responsible',tying:'tie',heaviest:'heavy',begged:'beg',cancellations:'cancel',islanders:'island',grew:'grow',creator:'create',heard:'hear',rankings:'rank',reasonably:'reasonable',bought:'buy'
};

// Entries that are absent from the bundled ECDICT subset. Pronunciations are
// supplied so a learner-selected article word never enters review without IPA.
const custom={
  alice:['/ˈælɪs/','爱丽丝（人名）'],hallway:['/ˈhɔːlweɪ/','走廊；过道'],mole:['/məʊl/','鼹鼠'],rooftop:['/ˈruːftɒp/','屋顶；屋顶平台'],
  jo:['/dʒəʊ/','乔（人名）'],meg:['/meɡ/','梅格（人名）'],beth:['/beθ/','贝思（人名）'],neighbor:['/ˈneɪbər/','邻居；邻近的人'],fictional:['/ˈfɪkʃənəl/','虚构的；小说中的'],daytime:['/ˈdeɪtaɪm/','白天；日间'],watson:['/ˈwɒtsən/','华生（人名）'],holmes:['/həʊmz/','福尔摩斯（人名）'],crusoe:['/ˈkruːsəʊ/','克鲁索；鲁滨孙（人名）'],
  uncertainty:['/ʌnˈsɜːtənti/','不确定；不确定性'],allergen:['/ˈælədʒən/','过敏原'],donor:['/ˈdəʊnər/','捐赠者；献血者'],unfriendly:['/ʌnˈfrendli/','不友好的；不亲切的'],doorway:['/ˈdɔːrweɪ/','门口；门道'],calmness:['/ˈkɑːmnəs/','平静；镇定'],riverside:['/ˈrɪvəsaɪd/','河畔；河边的'],weatherproof:['/ˈweðəpruːf/','防风雨的；耐候的'],
  anne:['/æn/','安妮（人名）'],gables:['/ˈɡeɪbəlz/','山墙（复数）；《绿山墙的安妮》书名用词'],mrs:['/ˈmɪsɪz/','夫人；太太'],lynde:['/lɪnd/','林德（人名）'],marilla:['/məˈrɪlə/','玛丽拉（人名）'],matthew:['/ˈmæθjuː/','马修（人名）'],embarrassment:['/ɪmˈbærəsmənt/','尴尬；难堪'],participation:['/pɑːˌtɪsɪˈpeɪʃən/','参加；参与'],usefulness:['/ˈjuːsfəlnəs/','有用；实用性'],
  mary:['/ˈmeəri/','玛丽（人名）'],misselthwaite:['/ˈmɪsəlθweɪt/','米塞尔思韦特（地名）'],manor:['/ˈmænər/','庄园；领地'],robin:['/ˈrɒbɪn/','知更鸟；罗宾（人名）'],ivy:['/ˈaɪvi/','常春藤'],dickon:['/ˈdɪkən/','迪肯（人名）'],landmark:['/ˈlændmɑːrk/','地标；里程碑'],jim:['/dʒɪm/','吉姆（人名）'],john:['/dʒɒn/','约翰（人名）'],
  non:['/nɒn/','非；不（前缀）'],stressful:['/ˈstresfəl/','压力大的；紧张的'],predictable:['/prɪˈdɪktəbəl/','可预测的；意料之中的'],attic:['/ˈætɪk/','阁楼；顶楼'],becky:['/ˈbeki/','贝琪（人名）'],powerless:['/ˈpaʊələs/','无力的；无权的'],puddle:['/ˈpʌdəl/','水坑；泥潭'],wheelchair:['/ˈwiːltʃeər/','轮椅'],
  phileas:['/ˈfɪliəs/','菲利亚斯（人名）'],fogg:['/fɒɡ/','福格（人名）'],flexibility:['/ˌfleksəˈbɪləti/','灵活性；适应性'],dorothy:['/ˈdɒrəθi/','多萝西（人名）'],emerald:['/ˈemərəld/','绿宝石；翠绿色'],wizard:['/ˈwɪzəd/','男巫；魔法师'],scarecrow:['/ˈskeəkrəʊ/','稻草人'],woodman:['/ˈwʊdmən/','樵夫；铁皮人（故事角色）'],fully:['/ˈfʊli/','完全地；充分地'],supposedly:['/səˈpəʊzɪdli/','据说；按说'],brainless:['/ˈbreɪnləs/','没头脑的；愚笨的'],heartless:['/ˈhɑːtləs/','无情的；狠心的'],
  vendor:['/ˈvendər/','摊贩；供应商'],jane:['/dʒeɪn/','简（人名）'],rochester:['/ˈrɒtʃɪstər/','罗切斯特（人名）'],thornfield:['/ˈθɔːnfiːld/','桑菲尔德（地名）'],england:['/ˈɪŋɡlənd/','英格兰；英国'],loneliness:['/ˈləʊnlinəs/','孤独；寂寞'],judgment:['/ˈdʒʌdʒmənt/','判断；看法'],acoustic:['/əˈkuːstɪk/','声音的；声学的'],
  gulliver:['/ˈɡʌlɪvər/','格列佛（人名）'],lilliput:['/ˈlɪlɪpʌt/','小人国；利立浦特'],body:['/ˈbɒdi/','身体；主体'],discomfort:['/dɪsˈkʌmfət/','不适；不舒服'],frankenstein:['/ˈfræŋkənstaɪn/','弗兰肯斯坦（人名）'],injustice:['/ɪnˈdʒʌstɪs/','不公正；不公平'],consultation:['/ˌkɒnsəlˈteɪʃən/','咨询；商议'],pip:['/pɪp/','匹普（人名）'],joe:['/dʒəʊ/','乔（人名）'],closure:['/ˈkləʊʒər/','关闭；结束'],redesign:['/ˌriːdɪˈzaɪn/','重新设计；改造'],transparency:['/trænsˈpærənsi/','透明；透明度']
};

for(const [word,[phonetic,meaning]] of Object.entries(custom))if(!exists(word))entries[word]={phonetic,meaning};

const pronunciationFixes={
  lin:'/lɪn/',does:'/dʌz/',harder:'/ˈhɑːdə/',mia:'/ˈmiːə/',online:'/ˈɒnlaɪn/',unexpected:'/ˌʌnɪkˈspektɪd/',earlier:'/ˈɜːliə/',importantly:'/ɪmˈpɔːtəntli/',chen:'/tʃen/',grandparents:'/ˈɡrænpeərənts/',mei:'/meɪ/',stairs:'/steəz/',faster:'/ˈfɑːstə/',kai:'/kaɪ/',shorter:'/ˈʃɔːtə/',nearest:'/ˈnɪərɪst/',thousands:'/ˈθaʊzəndz/',website:'/ˈwebsaɪt/',hana:'/ˈhɑːnə/',downloaded:'/ˌdaʊnˈləʊdɪd/',worksheet:'/ˈwɜːkʃiːt/',laptop:'/ˈlæptɒp/',replaying:'/ˌriːˈpleɪɪŋ/',pdf:'/ˌpiːdiːˈef/',jia:'/dʒjɑː/',arun:'/əˈruːn/',rui:'/rweɪ/',strongest:'/ˈstrɒŋɡɪst/',incorrectly:'/ˌɪnkəˈrektli/',nadia:'/ˈnɑːdiə/',"nadia's":'/ˈnɑːdiəz/',shoppers:'/ˈʃɒpəz/',caf:'/ˈkæfeɪ/',cheaper:'/ˈtʃiːpə/',hundreds:'/ˈhʌndrədz/',aiko:'/ˈaɪkoʊ/',crossroads:'/ˈkrɒsrəʊdz/',newer:'/ˈnjuːə/',downloading:'/ˌdaʊnˈləʊdɪŋ/',kim:'/kɪm/',daria:'/ˈdeəriə/',"daria's":'/ˈdeəriəz/',apps:'/æps/',smartphones:'/ˈsmɑːtfəʊnz/',busier:'/ˈbɪziə/',bins:'/bɪnz/',recycling:'/ˌriːˈsaɪklɪŋ/',anya:'/ˈɑːnjə/',laptops:'/ˈlæptɒps/',safer:'/ˈseɪfə/'
};
for(const [word,phonetic] of Object.entries(pronunciationFixes))if(exists(word))entries[word]={...entries[word],phonetic};

function inferBase(word){
  const override=baseOverrides[word];
  if(override&&exists(override))return override;
  if(word.endsWith("'s")&&exists(word.slice(0,-2)))return word.slice(0,-2);
  const candidates=[];
  if(word.endsWith('ies'))candidates.push(word.slice(0,-3)+'y');
  if(word.endsWith('ves'))candidates.push(word.slice(0,-3)+'f',word.slice(0,-3)+'fe');
  if(word.endsWith('ied'))candidates.push(word.slice(0,-3)+'y');
  if(word.endsWith('ing'))candidates.push(word.slice(0,-3)+'e',word.slice(0,-3),word.slice(0,-4));
  if(word.endsWith('ed'))candidates.push(word.slice(0,-1),word.slice(0,-2),word.slice(0,-3));
  if(word.endsWith('es'))candidates.push(word.slice(0,-1),word.slice(0,-2));
  if(word.endsWith('s'))candidates.push(word.slice(0,-1));
  if(word.endsWith('ily'))candidates.push(word.slice(0,-3)+'y');
  if(word.endsWith('ly'))candidates.push(word.slice(0,-2));
  if(word.endsWith('iest'))candidates.push(word.slice(0,-4)+'y');
  if(word.endsWith('est'))candidates.push(word.slice(0,-3),word.slice(0,-2));
  if(word.endsWith('ier'))candidates.push(word.slice(0,-3)+'y');
  if(word.endsWith('er'))candidates.push(word.slice(0,-2),word.slice(0,-1));
  return [...new Set(candidates)].find(exists)||'';
}

const tokens=new Set(articles.flatMap(article=>(article.text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g)||[])));
for(const surface of tokens){
  if(exists(surface))continue;
  const base=inferBase(surface);
  if(!base)continue;
  entries[surface]={phonetic:'',meaning:`${entries[base].meaning}（${surface} 为 ${base} 的词形或所有格形式）`,base};
}
for(const [word,phonetic] of Object.entries(pronunciationFixes))if(exists(word))entries[word]={...entries[word],phonetic};

const missing=[...tokens].filter(word=>!exists(word));
if(missing.length)throw new Error('Unresolved extensive-reading glossary words: '+missing.join(', '));
glossary.generatedFor='reading, listening, and extensive-reading passages through 2026-09-30';
fs.writeFileSync(glossaryFile,JSON.stringify(glossary),'utf8');
console.log(JSON.stringify({articles:articles.length,tokens:tokens.size,entries:Object.keys(entries).length,missing:missing.length},null,2));
