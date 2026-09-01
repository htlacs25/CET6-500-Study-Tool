// Local, original foundation practice. Not past CET exam questions.
export const RECOVERY_START = '2026-08-28';
export const DIAGNOSTIC = {
  date: '2026-08-28', source: '本次对话人工批改，不计入网页首次作答',
  objective: { correct: 7, total: 8 },
  reinforcement: { correct: 3, total: 3, spellingErrors: ['imporve → improve'] },
  strengths: ['4个常用词义正确', '两道基础时态选择正确', '讲解后能在相似句子中找到主句谓语'],
  focus: ['主句与定语从句的谓语区分', '形容词前缺少be动词', 'think/thing与improve的拼写', 'every day与everyday的用法'],
  listening: '尚未进行听力测评，不推断听力等级',
  examples: [
    { input: 'I learn English everyday,but I thing the hear so difficult', answer: 'I learn English every day, but I think listening is very difficult.', zh: '我每天学习英语，但是我觉得听力很难。', explanation: 'learn可以保留；every day分开；thing改think；这里用listening；形容词前加is。so difficult本身可以使用。' }
  ]
};

const pack = s => s.trim().split('\n').map(line => {
  const [word, phonetic, meaning, example, exampleZh] = line.split('|');
  return { word, phonetic: '/' + phonetic + '/', meaning, phrase: example, example, exampleZh };
});
export const WORD_PACKS = [
pack(`
study|ˈstʌdi|学习；研究|I study English every day.|我每天学习英语。
learn|lɝn|学习；学会|We learn from our mistakes.|我们从错误中学习。
listen|ˈlɪsən|听|Please listen to the teacher.|请听老师讲。
think|θɪŋk|认为；思考|I think English is useful.|我认为英语很有用。
useful|ˈjusfəl|有用的|This book is useful.|这本书很有用。
difficult|ˈdɪfɪkəlt|困难的|The question is difficult.|这道题很难。
sentence|ˈsɛntəns|句子|Write a short sentence.|写一个短句。
improve|ɪmˈpruv|提高；改善|Practice helps me improve.|练习帮助我提高。`),
pack(`
read|rid|阅读|I read a short story.|我读一个短故事。
write|raɪt|写|Please write your name.|请写下你的名字。
speak|spik|说话；讲|Can you speak slowly?|你能说慢一点吗？
understand|ˌʌndɚˈstænd|理解|I understand the question.|我理解这个问题。
remember|rɪˈmɛmbɚ|记得|I remember this word.|我记得这个词。
forget|fɚˈɡɛt|忘记|Do not forget your book.|别忘记你的书。
begin|bɪˈɡɪn|开始|We begin at nine.|我们九点开始。
finish|ˈfɪnɪʃ|完成；结束|I finish my work at five.|我五点完成工作。`),
pack(`
time|taɪm|时间；次数|I need more time.|我需要更多时间。
early|ˈɝli|早的；早地|I arrive early.|我早早到达。
late|leɪt|迟的；迟地|The bus is late.|公交车晚点了。
today|təˈdeɪ|今天|I am busy today.|我今天很忙。
yesterday|ˈjɛstɚdeɪ|昨天|I studied yesterday.|我昨天学习了。
tomorrow|təˈmɑroʊ|明天|I will call you tomorrow.|我明天给你打电话。
usually|ˈjuʒuəli|通常|I usually walk to class.|我通常步行去上课。
often|ˈɔfən|经常|We often read together.|我们经常一起阅读。`),
pack(`
class|klæs|课；班级|Our class starts at eight.|我们八点上课。
course|kɔrs|课程|This course is interesting.|这门课程很有趣。
teacher|ˈtitʃɚ|教师|The teacher helps me.|老师帮助我。
student|ˈstudənt|学生|She is a university student.|她是一名大学生。
library|ˈlaɪbrɛri|图书馆|I study in the library.|我在图书馆学习。
quiet|ˈkwaɪət|安静的|This room is quiet.|这个房间很安静。
place|pleɪs|地方|This is a good place to read.|这是个阅读的好地方。
between|bɪˈtwin|在两者之间|The shop is between two buildings.|商店在两栋楼之间。`),
pack(`
need|nid|需要|I need some help.|我需要一些帮助。
want|wɑnt|想要|I want to improve my English.|我想提高英语。
help|hɛlp|帮助|Can you help me?|你能帮助我吗？
ask|æsk|问；请求|Ask your teacher a question.|问老师一个问题。
answer|ˈænsɚ|回答；答案|I know the answer.|我知道答案。
question|ˈkwɛstʃən|问题|This is a good question.|这是一个好问题。
problem|ˈprɑbləm|问题；难题|We can solve the problem.|我们能解决这个问题。
try|traɪ|尝试|Please try again.|请再试一次。`),
pack(`
work|wɝk|工作；起作用|I work in the morning.|我上午工作。
rest|rɛst|休息|You need a short rest.|你需要短暂休息。
sleep|slip|睡觉；睡眠|I sleep for eight hours.|我睡八个小时。
tired|ˈtaɪɚd|疲劳的|I am tired after work.|工作后我很累。
healthy|ˈhɛlθi|健康的|Walking is a healthy habit.|步行是一种健康的习惯。
exercise|ˈɛksɚsaɪz|锻炼；练习|I exercise every morning.|我每天早晨锻炼。
enough|ɪˈnʌf|足够的；足够地|We have enough time.|我们有足够的时间。
energy|ˈɛnɚdʒi|精力；能量|I have more energy today.|我今天更有精力。`),
[],
pack(`
plan|plæn|计划|I make a simple plan.|我制定一个简单的计划。
choose|tʃuz|选择|Choose a book you like.|选一本你喜欢的书。
decide|dɪˈsaɪd|决定|I decide to study now.|我决定现在学习。
change|tʃeɪndʒ|改变；变化|I can change my plan.|我可以改变我的计划。
follow|ˈfɑloʊ|跟随；遵循|Please follow the instructions.|请遵循说明。
check|tʃɛk|检查|Check your answer again.|再检查一下你的答案。
ready|ˈrɛdi|准备好的|I am ready to begin.|我准备好开始了。
important|ɪmˈpɔrtənt|重要的|Sleep is important.|睡眠很重要。`),
pack(`
buy|baɪ|买|I want to buy a book.|我想买一本书。
pay|peɪ|支付|I pay for my lunch.|我付午饭钱。
cost|kɔst|花费；费用|The book costs ten yuan.|这本书十元。
cheap|tʃip|便宜的|This bag is cheap.|这个包很便宜。
expensive|ɪkˈspɛnsɪv|昂贵的|The ticket is expensive.|这张票很贵。
money|ˈmʌni|钱|I need to save money.|我需要省钱。
price|praɪs|价格|What is the price?|价格是多少？
save|seɪv|节省；保存|I save my work often.|我经常保存工作内容。`),
pack(`
busy|ˈbɪzi|忙碌的|I am busy this morning.|我今天上午很忙。
free|fri|空闲的；免费的|Are you free this afternoon?|你今天下午有空吗？
meet|mit|见面；遇见|We meet after class.|我们课后见面。
friend|frɛnd|朋友|My friend likes reading.|我的朋友喜欢阅读。
group|ɡrup|组；群体|We work in a small group.|我们以小组形式学习。
share|ʃɛr|分享|We share our ideas.|我们分享想法。
together|təˈɡɛðɚ|一起|We study together.|我们一起学习。
alone|əˈloʊn|独自地|I sometimes study alone.|我有时独自学习。`),
pack(`
phone|foʊn|电话；手机|My phone is in my bag.|我的手机在包里。
message|ˈmɛsɪdʒ|消息|I read your message.|我读了你的消息。
turn|tɝn|转动；转向|Please turn off your phone.|请关闭手机。
open|ˈoʊpən|打开；开着的|Open your book.|打开你的书。
close|kloʊz|关闭|Close the door, please.|请关门。
stop|stɑp|停止|I stop to have a rest.|我停下来休息。
continue|kənˈtɪnju|继续|We continue our lesson.|我们继续上课。
attention|əˈtɛnʃən|注意力|Please pay attention.|请集中注意力。`),
pack(`
city|ˈsɪti|城市|My sister lives in this city.|我姐姐住在这座城市。
village|ˈvɪlɪdʒ|村庄|He comes from a small village.|他来自一个小村庄。
travel|ˈtrævəl|旅行|I like to travel by train.|我喜欢乘火车旅行。
arrive|əˈraɪv|到达|We arrive at the station early.|我们早早到达车站。
leave|liv|离开|I leave home at seven.|我七点离开家。
near|nɪr|在附近；近的|The station is near my home.|车站在我家附近。
far|fɑr|远的；远地|The village is far from here.|村庄离这里很远。
station|ˈsteɪʃən|车站|We meet at the station.|我们在车站见面。`),
pack(`
habit|ˈhæbɪt|习惯|Reading is a useful habit.|阅读是个有用的习惯。
practice|ˈpræktɪs|练习；实践|I need more practice.|我需要更多练习。
review|rɪˈvju|复习；检查|I review old words.|我复习旧词。
progress|ˈprɑɡrɛs|进步；进展|I am making progress.|我正在进步。
goal|ɡoʊl|目标|My goal is clear.|我的目标很明确。
reason|ˈrizən|原因|What is the reason?|原因是什么？
result|rɪˈzʌlt|结果|Check the result tomorrow.|明天检查结果。
example|ɪɡˈzæmpəl|例子|Can you give an example?|你能举个例子吗？`),
[]
];
export const RECOVERY_WORDS = WORD_PACKS.flat();
const q = (prompt, promptZh, choices, answer, explanation, tag='grammar') => ({
  prompt, promptZh, options: choices.map(x=>x[0]), optionsZh: choices.map(x=>x[1]), answer, explanation, tag
});
const forms = s => s.split('|').map(x=>x.split('~'));
export const GRAMMAR = [
q('Students who sleep well often learn better. Which is the main verb?','睡得好的学生通常学得更好。哪个是主句谓语？',forms('sleep~睡觉（从句谓语）|learn~学习|well~好地|students~学生'),1,'先括起who sleep well。主干Students learn better，learn是主句谓语。','main-verb'),
q('I think English ___ useful.','我认为英语很有用。',forms('is~是（单数）|are~是（复数）|be~原形|being~动名词或分词'),0,'English是单数；useful是形容词，前面需要is。','be-verb'),
q('I ___ to English every day.','我每天听英语。',forms('hear~听到|listen~听|look~看|watch~观看'),1,'listen to表示有意识地听；hear不能这样接to。','word-form'),
q('I study English ___.','我每天学习英语。',forms('everyday~日常的（形容词）|every day~每天|every days~错误形式|day every~错误语序'),1,'every day作时间状语；everyday是形容词。','word-form'),
q('I ___ this book is useful.','我认为这本书很有用。',forms('thing~事情|think~认为|thinking~思考中|things~事情（复数）'),1,'主语I后需要谓语think；thing是名词。','spelling'),
q('Practice helps me ___ my English.','练习帮助我提高英语。',forms('imporve~字母顺序错误|improve~提高|improved~过去式|improving~动名词或分词'),1,'help somebody do something；注意improve中的prove顺序。','spelling'),
q('She ___ English every morning.','她每天早上学英语。',forms('study~原形|studies~第三人称单数|studying~现在分词|studied~过去式'),1,'一般现在时，主语she为第三人称单数，用studies。','present'),
q('My friends ___ in the library.','我的朋友们在图书馆学习。',forms('studies~第三人称单数|study~原形|studying~现在分词|is study~错误结构'),1,'主语friends是复数，一般现在时用study。','present'),
q('He ___ not understand the question.','他不理解这个问题。',forms('do~一般现在时助动词|does~第三人称单数助动词|is~是|are~是（复数）'),1,'一般现在时否定句：he does not＋动词原形。','present'),
q('___ you read every day?','你每天阅读吗？',forms('Do~助动词|Does~第三人称单数助动词|Is~是（单数）|Am~是（配I）'),0,'一般现在时疑问句，主语you用Do。','present'),
q('Yesterday I ___ to the library.','昨天我去了图书馆。',forms('go~原形|went~过去式|going~现在分词|goes~第三人称单数'),1,'yesterday指过去；go的过去式是went。','past'),
q('She ___ a new word yesterday.','她昨天学了一个新词。',forms('learn~原形|learns~第三人称单数|learned~过去式|learning~现在分词'),2,'有yesterday，用一般过去时learned。','past'),
q('I did not ___ my book.','我没有忘记我的书。',forms('forgot~过去式|forget~原形|forgets~第三人称单数|forgetting~现在分词'),1,'did not后面用动词原形forget。','past'),
q('___ you finish your work yesterday?','你昨天完成工作了吗？',forms('Did~过去时助动词|Do~现在时助动词|Are~是（复数）|Were~是（过去时）'),0,'一般过去时疑问句：Did＋主语＋动词原形。','past'),
q('Look! She ___ a book.','看！她正在读书。',forms('reads~一般现在时|is reading~正在读|read~原形或过去式|reading~只有分词'),1,'正在进行的动作：is＋reading，不能漏is。','continuous'),
q('We ___ ready to begin.','我们准备好开始了。',forms('is~是（单数）|am~是（配I）|are~是（复数）|be~原形'),2,'主语we配are。ready是形容词。','be-verb'),
q('There ___ a library near my school.','我的学校附近有一家图书馆。',forms('is~有（单数）|are~有（复数）|have~拥有|has~拥有（第三人称单数）'),0,'there be表示某处有；a library为单数。','be-verb'),
q('You can ___ a short rest.','你可以短暂休息。',forms('takes~第三人称单数|take~原形|taking~现在分词|took~过去式'),1,'情态动词can后用动词原形take。','modal'),
q('I study here ___ the room is quiet.','我在这里学习，因为房间很安静。',forms('because~因为|but~但是|or~或者|before~在……之前'),0,'后面解释原因，用because。','connector'),
q('The book is useful, ___ it is expensive.','这本书很有用，但是很贵。',forms('because~因为|but~但是|so~所以|if~如果'),1,'前后形成转折，用but。','connector'),
q('People who exercise regularly often feel better. Which is the main verb?','经常锻炼的人往往感觉更好。主句谓语是什么？',forms('exercise~锻炼（从句）|feel~感觉|regularly~经常地|people~人们'),1,'who exercise regularly是修饰部分；主干People feel better。','main-verb'),
q('Students who read every day improve quickly. What is the subject?','每天阅读的学生进步很快。主句主语是什么？',forms('read~阅读|Students~学生|improve~提高|every day~每天'),1,'主语Students，主句谓语improve。','main-verb'),
q('I enjoy ___ with my friends.','我喜欢和朋友一起学习。',forms('study~原形|studying~动名词|studied~过去式|to study~不定式'),1,'enjoy后接动名词studying。','word-form'),
q('I want ___ my English.','我想提高英语。',forms('improve~原形|improving~动名词|to improve~不定式|improves~第三人称单数'),2,'want to do表示想要做某事。','word-form')
];
const reading = (title,titleZh,passage,passageZh,questions) => ({title,titleZh,passage,passageZh,questions,level:'基础恢复 · 原创模拟',topic:'校园与日常生活'});
const listening = (title,titleZh,passage,passageZh,dictation,dictationZh,questions) => ({title,titleZh,passage,passageZh,dictation,dictationZh,questions,level:'基础短听力 · 合成朗读',tip:'先听大意，再核对原文；关掉文字复听，并用简单英语回答问题。听写只做两句。'});
const fact = (en,zh,a,az,b,bz,c,cz,answer,why) => q(en,zh,[[a,az],[b,bz],[c,cz]],answer,why,'reading');
const sentence = (text,main,translation,core,keywords,structure) => ({text,main,translation,core,keywords,structure,mainZh:translation,level:'基础句法',topic:'主句谓语与完整句子',grammar:['先找主语与主句谓语，再处理修饰部分。','形容词作表语时，检查前面是否有be动词。'],examTip:'先理解主干；规则匹配仅供练习，不是正式考试评分。'});
const translation = (source,answer,keywords,grammar,alternatives=[]) => ({source,answer,keywords,grammar,acceptedAnswers:[answer,...alternatives],level:'基础表达',topic:'完整句子与常用搭配',chunks:keywords.map(x=>'关键表达：'+x),alternative:alternatives.join(' / ')||'可采用意思一致且语法正确的表达；规则未识别时留待共同复核。'});
const coreQuestions = [
[0,1,2,3,4,5],[6,7,8,9,1,22],[10,11,12,13,3,4],
[0,15,16,21,7,2],[1,8,17,23,4,5],[20,15,18,19,6,17],
[0,1,10,2,3,5],[14,15,16,17,23,21],[10,12,19,6,1,22],
[14,8,9,17,20,22],[0,2,3,4,5,19],[10,11,13,16,18,23],
[20,21,1,6,22,23],[0,1,11,14,19,5]
];
export const LESSONS = [
{
 title:'重新开始：主句与be动词', grammarTip:'主句先找“谁＋做什么”。I think后面的English is useful也必须是完整结构。',
 reading:reading('A Small Start','一个小小的开始',
'Lin is a university student. She wants to improve her English, but she thinks it is difficult. She makes a small plan today. After breakfast, she studies eight words and reads a short story. She does not try to remember every new word in the story. She chooses two useful words and writes a sentence with each one. In the evening, she listens to a short recording. Then she closes the text and listens again. Her friend asks why she uses easy material. Lin says that she wants to understand it well before choosing something harder.',
'林是一名大学生。她想提高英语，但觉得英语很难。今天她制定了一个小计划。早饭后，她学习八个词，读一个短故事。她不试图记住故事里的每一个生词，而是选两个有用的词，各写一句话。晚上她听一段短录音，然后关掉文字再听。朋友问她为什么用简单材料。林说，她想先真正理解，再选更难的内容。',
[fact('What does Lin want to improve?','林想提高什么？','Her English','她的英语','Her cooking','她的厨艺','Her drawing','她的绘画',0,'首句之后说明她想提高英语。'),fact('When does she study words?','她什么时候学词？','Before lunch','午饭前','After breakfast','早饭后','At midnight','午夜',1,'定位After breakfast。'),fact('How many useful words does she choose from the story?','她从故事中选几个有用的词？','Eight','八个','All of them','全部','Two','两个',2,'她从故事中选两个词；不要与开头的八词任务混淆。'),fact('Why does she use easy material?','她为什么使用简单材料？','To understand it well','为了充分理解','To avoid all practice','为了逃避所有练习','To finish an exam','为了完成考试',0,'结尾说明先理解，再增加难度。')]),
 listening:listening('An Evening Plan','晚间计划','Hi, Ben. I study English after dinner. First, I listen to a short story. Then I read the text and check difficult words. I listen again without the text. I think this practice is useful. I do not need a long recording. I need to understand a short one well.','嗨，本。我晚饭后学英语。先听短故事，再读原文、检查难词，然后不看文字再听。我认为这种练习很有用。我不需要很长的录音，而要充分理解一段短录音。',['I study English after dinner.','I think this practice is useful.'],['我晚饭后学习英语。','我认为这种练习很有用。'],[fact('When does the speaker study?','说话者何时学习？','After dinner','晚饭后','Before breakfast','早饭前','At work','工作时',0,'定位after dinner。'),fact('What does the speaker do after checking words?','检查单词后做什么？','Stops learning','停止学习','Listens without the text','不看文字再听','Buys a book','买书',1,'注意步骤顺序。')]),
 sent:sentence('Students who sleep well often learn better.','Students learn better.','睡得好的学生通常学得更好。',['students','learn'],['学生','睡','学'],'Students是主语，learn是主句谓语；who sleep well修饰Students。sleep是从句谓语。'),
 trans:[translation('我认为英语很有用。','I think English is useful.',['think','English','is','useful'],'think后面的从句要有主语English和谓语is。'),translation('我每天学习英语，但是我觉得听力很难。','I study English every day, but I think listening is difficult.',['every day','but','listening','is','difficult'],'every day分开写；thing不是think；listening是主语，后面要有is。',['I learn English every day, but I think listening is very difficult.','I study English every day, but I find listening difficult.','I learn English every day, but I think listening is so difficult.'])]
},
{
 title:'简单句与一般现在时',grammarTip:'描述习惯用一般现在时。she/he/it作主语时检查谓语变化；否定和疑问可用does＋动词原形。',
 reading:reading('Reading with a Friend','和朋友一起阅读','Mia and Tom read in the library every Tuesday. They begin at four and finish at five. Mia reads a short page first. Tom listens and asks a question about it. Then they change roles. They speak slowly because they want to understand each other. When Tom cannot remember a word, Mia gives him a simple example. She does not answer every question for him. At the end, they write two sentences about the story. Before they leave, Tom checks his bag. He does not want to forget his book again.','米娅和汤姆每周二在图书馆阅读，四点开始，五点结束。米娅先读一小页，汤姆听并提问，然后交换角色。他们说得慢，以便互相理解。汤姆记不起词时，米娅给他一个简单例子，而不是替他回答所有问题。最后他们写两句有关故事的话。离开前汤姆检查包，不想再次忘带书。',
[fact('When do they meet?','他们何时见面？','Every Tuesday','每周二','Every Friday','每周五','Every morning','每天早晨',0,'开头给出Tuesday。'),fact('How long do they read?','他们读多久？','Two hours','两小时','One hour','一小时','Ten minutes','十分钟',1,'四点到五点是一小时。'),fact('Why do they speak slowly?','为什么说得慢？','They are tired','他们很累','They have no books','他们没书','To understand each other','为了相互理解',2,'because后说明原因。'),fact('What does Tom check before leaving?','汤姆离开前检查什么？','His bag','他的包','The clock','时钟','The window','窗户',0,'结尾定位checks his bag。')]),
 listening:listening('Before the Reading Group','读书小组开始前','Our reading group begins at four today. Please bring your book and a pen. We read one short story together. You can ask questions when you do not understand. We finish at five. Before you leave, please write one sentence about the story. Do not forget your book on the table.','读书小组今天四点开始。请带书和笔。我们一起读一个短故事，不理解时可以提问。五点结束，离开前写一句有关故事的话。别把书忘在桌上。',['We read one short story together.','Do not forget your book.'],['我们一起读一个短故事。','不要忘记你的书。'],[fact('When does the group begin?','小组何时开始？','At five','五点','At four','四点','At six','六点',1,'begin at four。'),fact('What should learners do before leaving?','离开前要做什么？','Write one sentence','写一句话','Buy a pen','买笔','Read a second book','读第二本书',0,'before you leave之后给出要求。')]),
 sent:sentence('Students who read every day improve quickly.','Students improve quickly.','每天阅读的学生进步很快。',['students','improve'],['学生','阅读','进步'],'who read every day修饰Students；主句谓语improve，注意不是imporve。'),
 trans:[translation('她每天早上读英语。','She reads English every morning.',['she','reads','every morning'],'主语she，一般现在时用reads。'),translation('我不理解这个问题。','I do not understand this question.',['do not','understand','question'],'普通动词否定用do not＋原形。',["I don't understand this question."])]
},
{
 title:'过去与现在：动词原形',grammarTip:'yesterday提示过去；did not后仍用动词原形，不能再用过去式。',
 reading:reading('An Early Bus','一班早车','Leo usually takes the bus to class at eight. Yesterday he left home late and missed the bus. He arrived at school after the lesson began. Today he has a different plan. He puts his books in his bag before breakfast and leaves home ten minutes earlier. The bus arrives on time, and Leo is not late. He has enough time to read a page before class. He often feels rushed in the morning, so he wants to keep this small change. Tomorrow he will prepare his bag in the evening.','利奥通常八点乘公交上课。昨天他出门晚，错过了车，到学校时课已开始。今天他改变计划，早饭前把书放进包里，提前十分钟出门。公交准时到了，他没有迟到，还有时间课前读一页书。他早晨常感到匆忙，想保留这一改变。明天他会在晚上准备书包。',
[fact('Why was Leo late yesterday?','利奥昨天为何迟到？','He missed the bus','他错过了公交','He read too much','他读得太多','His class changed','课程变动了',0,'出门晚导致错过公交。'),fact('What does he change today?','今天改变了什么？','He skips class','他逃课','He leaves earlier','他更早出门','He buys a bike','他买自行车',1,'提前十分钟出门。'),fact('What can he do before class today?','今天课前能做什么？','Cook breakfast','做早饭','Meet a doctor','看医生','Read a page','读一页书',2,'定位read a page before class。'),fact('What will he prepare in the evening?','他准备晚上整理什么？','His bag','书包','The bus','公交车','The classroom','教室',0,'结尾prepare his bag。')]),
 listening:listening('A Changed Time','时间变动','Hello, Anna. Our lesson begins at nine today, not at eight. I arrived early yesterday because I did not check the message. Please read the new time before you leave home. We can meet at the door at ten to nine. Tomorrow the lesson will begin at eight again.','安娜，你好。今天九点上课，不是八点。昨天我没看消息，来早了。出门前请看新时间。我们可以八点五十分在门口见。明天恢复八点上课。',['Our lesson begins at nine today.','I arrived early yesterday.'],['我们今天九点上课。','我昨天来早了。'],[fact('When does the lesson begin today?','今天几点上课？','At eight','八点','At nine','九点','At ten','十点',1,'注意not at eight的排除。'),fact('Why did the speaker arrive early yesterday?','昨天为何来早？','The bus was fast','公交很快','The clock stopped','钟停了','The speaker did not check the message','说话者没有看消息',2,'because给出原因。')]),
 sent:sentence('Yesterday I went to the library because my room was noisy.','I went to the library.','昨天我去了图书馆，因为我的房间很吵。',['i','went','library'],['昨天','图书馆','因为'],'主句I went to the library；because后是原因。went是go的过去式。'),
 trans:[translation('昨天我去了图书馆。','I went to the library yesterday.',['went','library','yesterday'],'过去时间用went。',['Yesterday I went to the library.']),translation('我昨天没有忘记我的书。','I did not forget my book yesterday.',['did not','forget','book','yesterday'],'did not后用forget，不用forgot。',["I didn't forget my book yesterday."])]
},
{
 title:'主语与修饰部分',grammarTip:'先括起who/that引出的修饰部分，再找主语后真正属于主句的谓语。',
 reading:reading('A Quiet Place','一个安静的地方','Sara is a new student at the university. Her room is near a busy road, so it is not a quiet place to study. A teacher tells her about a small library between the science building and the dining hall. Sara visits it after her first class. There are large tables and comfortable chairs. Students who study there speak quietly. Sara chooses a seat near the window and reads her course notes. She stays for forty minutes. Before leaving, she writes down the opening times. She plans to return after class tomorrow.','萨拉是大学新生。她的房间靠近繁忙道路，不适合安静学习。老师告诉她，科学楼和食堂之间有个小图书馆。第一节课后她去看了，里面有大桌子和舒适的椅子，在那里学习的学生说话很轻。她选靠窗座位看课程笔记，待了四十分钟。离开前她记下开放时间，计划明天下课后再来。',
[fact('Why does Sara look for another place?','萨拉为什么找别处？','Her room is noisy','房间很吵','Her room is cold','房间很冷','She has no notes','她没有笔记',0,'near a busy road说明环境吵。'),fact('Where is the library?','图书馆在哪里？','Inside her room','在她房间里','Between two buildings','在两栋建筑之间','Far from the university','远离大学',1,'科学楼和食堂之间。'),fact('How long does she stay?','她待多久？','Four hours','四小时','Four minutes','四分钟','Forty minutes','四十分钟',2,'定位forty minutes。'),fact('What does she record before leaving?','离开前记录什么？','Opening times','开放时间','Book prices','书价','A phone number','电话号码',0,'结尾opening times。')]),
 listening:listening('Finding the Library','寻找图书馆','The small library is between the science building and the dining hall. It opens at eight in the morning and closes at six in the evening. There are quiet rooms on the second floor. You can read your course notes there after class. Please speak quietly and keep your phone in your bag.','小图书馆在科学楼和食堂之间，早八点开、晚六点关。二楼有安静的房间，课后可以在那里看课程笔记。请轻声说话，把手机放在包里。',['There are quiet rooms on the second floor.','Please keep your phone in your bag.'],['二楼有安静的房间。','请把手机放在包里。'],[fact('When does the library close?','图书馆几点关？','At eight','八点','At six','六点','At four','四点',1,'不要将开门时间当关门时间。'),fact('Where are the quiet rooms?','安静的房间在哪里？','On the second floor','二楼','Outside the building','楼外','In the dining hall','食堂里',0,'定位second floor。')]),
 sent:sentence('Students who study in the library speak quietly.','Students speak quietly.','在图书馆学习的学生说话很轻。',['students','speak'],['学生','图书馆','说话'],'study属于who从句；主句谓语是speak。'),
 trans:[translation('图书馆很安静。','The library is quiet.',['library','is','quiet'],'quiet是形容词，前面要有is。'),translation('学校附近有一家图书馆。','There is a library near the school.',['there is','library','near'],'there is表示某处有一个。',['There is a library near my school.'])]
},
{
 title:'提问与完整回答',grammarTip:'一般现在时否定、疑问需要do/does；want后常用to do。',
 reading:reading('Asking for Help','寻求帮助','Ben wants to answer a question in his English book, but he does not understand one sentence. He reads it twice and finds the main verb. He still needs help with a phrase. Instead of asking his friend for the whole answer, he points to the phrase and asks what it means in this sentence. His friend gives him an example. Ben tries the question again and explains his answer. Later he writes the phrase in his notebook. When he has another problem, he follows the same steps before asking for help.','本想回答英语书中的一个问题，却不理解其中一句。他读了两遍，找到了主句谓语，但一个短语仍需要帮助。他不直接问朋友整题答案，而是指出短语，问它在本句中的意思。朋友给了一个例子。本再次做题并解释答案，然后把短语记入笔记本。下次遇到问题时，他先按同样步骤尝试，再求助。',
[fact('What does Ben find after reading twice?','读两遍后找到了什么？','The main verb','主句谓语','A new book','一本新书','His teacher','他的老师',0,'先找到main verb。'),fact('What does he ask his friend about?','他向朋友问什么？','The whole book','整本书','A phrase','一个短语','The time','时间',1,'他具体问phrase，而非整题答案。'),fact('How does his friend help?','朋友怎么帮助？','By leaving','离开','By buying a book','买书','By giving an example','举例',2,'朋友提供example。'),fact('What does Ben do after getting help?','得到帮助后做什么？','Tries the question again','再次做题','Stops studying','停止学习','Throws away the book','扔掉书',0,'得到解释后再次尝试。')]),
 listening:listening('One Question','一个问题','Could you help me with this sentence? I know most of the words, but I cannot find the main verb. I do not need the full answer yet. Please show me the subject first. Then I want to try again. If I still have a problem, I will ask another question.','你能帮我看这个句子吗？大多数词我认识，但找不到主句谓语。暂时不用给完整答案，请先指出主语，我想再试一次。若仍有问题，我再提问。',['Please show me the subject first.','I want to try again.'],['请先给我指出主语。','我想再试一次。'],[fact('What is difficult for the speaker?','说话者哪里有困难？','Finding the main verb','找主句谓语','Buying the book','买书','Hearing the teacher','听见老师',0,'cannot find the main verb。'),fact('What help does the speaker want first?','首先想得到什么帮助？','The full answer','完整答案','The subject','主语','A different book','另一本书',1,'show me the subject first。')]),
 sent:sentence('I want to try again because the example is useful.','I want to try again.','我想再试一次，因为这个例子很有用。',['i','want','try'],['再','因为','有用'],'want是主句谓语；to try作其补足部分；because从句中is也不可省略。'),
 trans:[translation('我需要一些帮助。','I need some help.',['i','need','help'],'need在这里是普通动词。'),translation('我想再试一次。','I want to try again.',['want','to try','again'],'want to do结构。')]
},
{
 title:'形容词前的be动词',grammarTip:'tired、healthy、useful描述状态；句子中需要am/is/are等谓语连接。',
 reading:reading('Rest and Study','休息与学习','Nina worked on a difficult task late last night. This morning she feels tired and reads the same sentence several times. She thinks that more study time will solve the problem. Her friend suggests a short rest first. Nina puts down her book, drinks some water, and walks outside for ten minutes. When she returns, she can pay attention again. She decides to stop working earlier tonight and get enough sleep. She also plans to exercise after class. Her goal is not to work every minute, but to use her study time well.','妮娜昨晚忙一道难题到很晚，今早很累，同一句反复看。她以为增加时间能解决问题，朋友建议先短暂休息。她放下书，喝水，到外面走十分钟。回来后，她又能集中注意了。她决定今晚早些结束，睡够觉，并计划课后锻炼。目标不是每分钟都工作，而是有效利用学习时间。',
[fact('Why is Nina tired?','妮娜为何疲劳？','She worked late','她工作到很晚','She walked all day','她走了一天','She missed lunch','她没吃午饭',0,'开头late last night。'),fact('What does her friend suggest?','朋友建议什么？','More coffee','更多咖啡','A short rest','短暂休息','A longer task','更长的任务',1,'short rest first。'),fact('How long does she walk?','她走多久？','One hour','一小时','Thirty minutes','三十分钟','Ten minutes','十分钟',2,'ten minutes。'),fact('What is her goal?','她的目标是什么？','Use study time well','有效利用学习时间','Never rest','从不休息','Study all night','通宵学习',0,'not...but...后面是实际目标。')]),
 listening:listening('A Short Break','短暂休息','You look tired. Let us stop for ten minutes. We can drink some water and walk outside. After the break, we will check the last two questions. We do not need to finish every exercise tonight. Enough sleep is important too. We can continue the work tomorrow morning when we have more energy.','你看起来很累。我们停十分钟，喝水、走走。休息后检查最后两题，不需要今晚做完全部练习，充足睡眠也重要。明早更有精力时可以继续。',['Enough sleep is important too.','We can continue the work tomorrow morning.'],['充足睡眠也很重要。','我们可以明天早上继续工作。'],[fact('How long is the break?','休息多久？','Ten minutes','十分钟','Two hours','两小时','One day','一天',0,'stop for ten minutes。'),fact('When can they continue the work?','什么时候可以继续？','At midnight','午夜','Tomorrow morning','明天早上','Next month','下个月',1,'结尾tomorrow morning。')]),
 sent:sentence('People who exercise regularly often feel better.','People feel better.','经常锻炼的人往往感觉更好。',['people','feel'],['锻炼','感觉','更好'],'exercise在定语从句中；主句谓语feel。better描述状态。'),
 trans:[translation('我今天很累。','I am tired today.',['i','am','tired','today'],'tired前需要am。'),translation('充足的睡眠很重要。','Enough sleep is important.',['enough sleep','is','important'],'sleep为不可数名词，be动词用is。')]
},
{
 title:'第一周小测：回忆与迁移',grammarTip:'今天不加新词。先独立完成，再看答案；分项记录，不将练习正确率换算为六级成绩。',
 reading:reading('A Week of Practice','一周练习','After a week of English practice, Chen checks his notebook. He can remember several words that were difficult on the first day. He also notices a problem: he sometimes finds a verb inside a long phrase and calls it the main verb. He chooses three short sentences and marks the subjects first. Then he checks which verb belongs to each main sentence. For listening, he uses a new short story instead of repeating only the one he knows. He answers two questions before reading the text. These small checks help him decide what to review next week.','练习一周后，陈检查笔记，能记住几个第一天觉得难的词，也发现自己有时把修饰部分里的动词当主句谓语。他选三句短句，先标主语，再检查属于主句的动词。听力用一段新短故事，而不只重复熟悉的那段，先答两题再看原文。这些检查帮助他决定下周复习什么。',
[fact('What does Chen check?','陈检查什么？','His notebook','笔记本','A train ticket','火车票','A menu','菜单',0,'开头checks his notebook。'),fact('What mistake does he notice?','他发现什么错误？','He writes too slowly','写得太慢','He confuses main verbs with other verbs','混淆主句和其他动词','He never reads','从不阅读',1,'文章重点是误认主句谓语。'),fact('What does he mark first?','先标出什么？','All new words','所有生词','Every adjective','所有形容词','The subjects','主语',2,'marks the subjects first。'),fact('Why does he use a new listening story?','为什么用新听力故事？','To check understanding beyond memorization','检查是否理解而不只是背熟','To avoid all questions','避免所有问题','To learn many hard words','学习大量难词',0,'新材料检验能否迁移。')]),
 listening:listening('A New Meeting Place','新的见面地点','Hi, Chris. We will meet in the small library today. The classroom is busy. Please arrive at four and bring your notebook. We will read a short story and discuss two questions. You do not need to learn new words before the meeting. Today we are checking what we remember from this week.','克里斯，今天我们在小图书馆见，教室有人用。请四点到，带笔记本。我们读短故事、讨论两题。会前不用学新词，今天检查本周记住了什么。',['Please arrive at four and bring your notebook.','Today we are checking what we remember.'],['请四点到并带上笔记本。','今天我们检查记住了什么。'],[fact('Where will they meet?','在哪里见面？','In the classroom','教室','In the small library','小图书馆','At the station','车站',1,'注意地点变动。'),fact('What is the purpose today?','今天的目的是什么？','Review this week','复习本周','Buy notebooks','买笔记本','Learn many new words','学习大量新词',0,'checking what we remember。')]),
 sent:sentence('Teachers who explain clearly help students learn.','Teachers help students learn.','讲解清楚的老师帮助学生学习。',['teachers','help','students'],['老师','帮助','学习'],'explain属于who从句；help才是主句谓语。这是换句迁移，不是背原题。'),
 trans:[translation('我认为这本书很有用。','I think this book is useful.',['think','book','is','useful'],'think后从句保留is。'),translation('昨天我读了一个短故事。','I read a short story yesterday.',['read','short story','yesterday'],'read过去式拼写不变，发音为/red/。',['Yesterday I read a short story.'])]
},
{
 title:'计划与正在进行的动作',grammarTip:'现在进行时用am/is/are＋动词-ing；情态动词后用原形。',
 reading:reading('Making a Useful Plan','制定有用的计划','Eva is making a study plan for next week. At first, she chooses five difficult books and wants to finish them all. Then she checks how much free time she has. She decides to change the plan. She chooses one short book and follows a small daily routine. Each evening, she reads a page and reviews a few words. She also leaves time for listening and rest. Her plan is ready, but she knows it may need changes. For her, the important thing is to practise regularly and check what she actually understands.','伊娃正在制定下周计划。起初选了五本难书，想全部读完；检查空闲时间后，她决定调整为一本短书和小的日常安排。每天晚上读一页、复习几个词，也给听力和休息留时间。计划准备好了，但仍可能需要改。重要的是经常练习，并检查真正理解了什么。',
[fact('What is Eva doing?','伊娃正在做什么？','Making a study plan','制定学习计划','Taking a train','坐火车','Cooking dinner','做晚饭',0,'开头is making。'),fact('Why does she change her plan?','为什么调整计划？','She has no books','她没有书','She checks her available time','她检查了可用时间','She dislikes all reading','她讨厌阅读',1,'核对空闲时间后调整。'),fact('How many books does she finally choose?','最后选几本？','Five','五本','Ten','十本','One','一本',2,'one short book。'),fact('What matters to her?','她认为重要的是什么？','Regular practice and understanding','经常练习并理解','Buying many books','买很多书','Never changing a plan','从不改计划',0,'最后一句给出观点。')]),
 listening:listening('Checking a Plan','检查计划','I am making a plan for tomorrow. I have two classes in the morning, so I will study English after lunch. First, I will review old words. Then I will listen to a short dialogue. I want to choose tasks that I can finish. I can change the plan if a task takes more time.','我正在制定明天的计划。上午两节课，所以午饭后学英语。先复习旧词，再听短对话。我想选择能完成的任务，某项耗时更多时可以调整计划。',['I am making a plan for tomorrow.','I will study English after lunch.'],['我正在制定明天的计划。','我午饭后学习英语。'],[fact('When will the speaker study English?','何时学英语？','Before breakfast','早饭前','After lunch','午饭后','During class','上课时',1,'so后说明安排。'),fact('What comes first?','先做什么？','Reviewing old words','复习旧词','A long test','长测试','Buying a book','买书',0,'First后给出顺序。')]),
 sent:sentence('I am making a plan because regular practice is important.','I am making a plan.','我正在制定计划，因为经常练习很重要。',['i','am','making','plan'],['计划','因为','重要'],'主句谓语am making要完整保留；because从句也有is。'),
 trans:[translation('我正在制定计划。','I am making a plan.',['am','making','plan'],'现在进行时不能漏am。'),translation('你可以先检查答案。','You can check the answer first.',['can','check','answer','first'],'can后用原形check。')]
},
{
 title:'购物语境与时态',grammarTip:'先看时间线索，再选择动词形式。but前后是转折，不等于because。',
 reading:reading('Choosing a Dictionary','选择词典','Owen wants to buy a small dictionary. He sees two books in a shop. The first one is cheap, but its print is very small. The second one is more expensive and has clear examples. Owen has enough money for either book. He does not decide only by the price. He reads the same word in both books and checks whether he understands the examples. Then he buys the second dictionary. At home, he writes its cost in his notebook. Next month, he plans to save money by borrowing other books from the library.','欧文想买一本小词典。店里有两本：第一本便宜但字很小，第二本更贵但例句清楚。他的钱两本都够，但不只按价格决定。他在两本书里查同一个词，检查是否理解例句，最后买第二本。回家后记下花费，计划下个月从图书馆借其他书来省钱。',
[fact('What does Owen want to buy?','欧文想买什么？','A dictionary','词典','A phone','手机','A ticket','票',0,'首句说明。'),fact('What is a problem with the first book?','第一本的问题是什么？','No examples','没有例子','Very small print','字很小','Too many pictures','图太多',1,'第一本print很小。'),fact('How does he compare the books?','他怎样比较？','By colour only','只看颜色','By weight only','只看重量','By checking the same word','查同一个词',2,'检查相同词的例句。'),fact('How will he save money next month?','下个月怎样省钱？','Borrow books','借书','Stop eating lunch','不吃午饭','Sell his notebook','卖笔记本',0,'结尾借其他书。')]),
 listening:listening('At the Bookshop','在书店','This small dictionary costs twenty yuan. That one costs thirty yuan, but the examples are easier to read. You can open both books and compare one word. If you want to save money, there are used books on the other table. Please check the pages before you pay.','这本小词典二十元，另一本三十元，但例句更易读。你可以打开两本比较同一个词。想省钱的话，另一张桌上有二手书。付款前请检查书页。',['Please check the pages before you pay.','There are used books on the other table.'],['付款前请检查书页。','另一张桌上有二手书。'],[fact('How much is the second dictionary?','第二本词典多少钱？','Twenty yuan','二十元','Thirty yuan','三十元','Ten yuan','十元',1,'区分两本的价格。'),fact('What should the buyer do before paying?','付款前做什么？','Check the pages','检查书页','Close the shop','关店','Call a teacher','给老师打电话',0,'before you pay给出要求。')]),
 sent:sentence('The dictionary that has clear examples costs more.','The dictionary costs more.','有清楚例句的那本词典更贵。',['dictionary','costs'],['词典','例句','贵'],'that has clear examples修饰dictionary；主句谓语costs。'),
 trans:[translation('这本书很有用，但是很贵。','This book is useful, but it is expensive.',['book','is useful','but','expensive'],'两个分句都要有谓语。',['The book is useful, but it is expensive.']),translation('我昨天买了一本词典。','I bought a dictionary yesterday.',['bought','dictionary','yesterday'],'buy过去式bought。',['Yesterday I bought a dictionary.'])]
},
{
 title:'合作与独立学习',grammarTip:'描述习惯和眼前动作不同；who从句不改变主句的主谓关系。',
 reading:reading('A Small Study Group','一个小学习小组','Amy is busy in the morning, but she is free after four. She meets two friends in a quiet room twice a week. They work in a small group and share their questions. Each person tries the task alone before the meeting. During the meeting, they explain their answers instead of simply copying one another. When they disagree, they return to the text together. Amy likes this routine because she can hear different ideas. She also keeps some time for studying alone. She thinks group work and individual practice can help in different ways.','艾米上午忙，四点后有空。每周两次和两个朋友在安静房间见面，组成小组分享问题。每人会前先独立做题；会上解释答案，而不只是抄别人。有分歧就一起回原文。艾米喜欢能听见不同想法，也保留独立学习时间。她认为小组和独立练习各有帮助。',
[fact('When is Amy free?','艾米何时有空？','After four','四点后','Every morning','每天早晨','Only at midnight','只在午夜',0,'开头时间安排。'),fact('What happens before a meeting?','开会前做什么？','Copy all answers','抄全部答案','Try the task alone','独立尝试任务','Buy a new book','买新书',1,'each person...alone。'),fact('What do they do when they disagree?','有分歧时做什么？','Stop meeting','不再见面','Ask nobody','不问任何人','Return to the text','回到原文',2,'定位when they disagree。'),fact('What is Amy’s opinion?','艾米怎么看？','Both forms of practice can help','两种练习都可有帮助','Only groups are useful','只有小组有用','Only studying alone works','只有独学有效',0,'最后一句两者各有帮助。')]),
 listening:listening('Meeting after Class','课后见面','Are you free after four today? Our study group will meet in room six. Please try the first two questions alone before you come. We will share our answers and explain our reasons. If you are busy, you can send us your questions later. We will meet again on Friday.','今天四点后有空吗？小组在六号房见。来前先独立做前两题，我们分享答案并解释理由。如果忙，可以稍后发问题，周五还会再见。',['Please try the first two questions alone.','We will share our answers.'],['请独立尝试前两题。','我们将分享答案。'],[fact('Where will the group meet?','小组在哪里见？','Room four','四号房','Room six','六号房','The station','车站',1,'不要混淆时间four和房号six。'),fact('What should members do before coming?','来前要做什么？','Try two questions alone','独立做两题','Copy a friend','抄朋友答案','Finish a whole book','完成整本书',0,'before you come。')]),
 sent:sentence('Friends who explain their answers help each other.','Friends help each other.','解释自己答案的朋友相互帮助。',['friends','help'],['朋友','答案','帮助'],'explain是从句谓语；help是主句谓语。'),
 trans:[translation('我们正在一起学习。','We are studying together.',['we','are','studying','together'],'we用are，进行时保留are studying。',['We are learning together.']),translation('我喜欢和朋友一起阅读。','I enjoy reading with my friends.',['enjoy','reading','friends'],'enjoy后用reading。')]
},
{
 title:'注意力与词形纠错',grammarTip:'检查think而不是thing；every day分开；listen后有对象时常接to。',
 reading:reading('Putting the Phone Away','把手机放远','Jay opens his book, but his phone lights up with a new message. He stops reading and checks the screen. A few minutes later, another message arrives. Jay notices that he has read the same page three times without understanding it. He decides to turn off the sound and put the phone in his bag. Then he closes other windows on his computer and continues reading. After twenty minutes, he checks whether he can explain the page. He still needs practice, but it is easier to give the text his attention.','杰打开书，手机新消息亮起，他停下阅读看屏幕。几分钟后又来消息。他发现同一页看了三遍还没懂，决定关声音，把手机放进包里，再关闭电脑其他窗口继续读。二十分钟后，他检查自己能否解释那一页。仍需要练习，但现在更容易关注原文。',
[fact('What interrupts Jay?','什么打断杰？','Phone messages','手机消息','A teacher','老师','Heavy rain','大雨',0,'新消息使他停止阅读。'),fact('What does he notice?','他注意到什么？','The book is missing','书丢了','He has not understood the page','没理解那一页','His bag is open','包开了',1,'看了三遍还没理解。'),fact('Where does he put the phone?','手机放哪里？','On the book','书上','At the window','窗边','In his bag','包里',2,'定位in his bag。'),fact('How does he check understanding?','怎样检查理解？','He tries to explain the page','尝试解释内容','He counts messages','数消息','He copies every word','抄每个词',0,'不是只计时，还检查是否能解释。')]),
 listening:listening('Twenty Quiet Minutes','安静的二十分钟','Please turn off the sound on your phone for this task. Put it in your bag and open the short text. Read for twenty minutes, but do not rush. At the end, close the text and tell your partner the main idea. Then you can check your messages during the break.','这项任务请关手机声音，放进包里，打开短文。读二十分钟，不要赶。最后关文字，向同伴说大意。休息时再查看消息。',['Put your phone in your bag.','Tell your partner the main idea.'],['把手机放在包里。','告诉同伴文章大意。'],[fact('When can learners check messages?','何时可以看消息？','During the break','休息时','After every sentence','每句之后','Only tomorrow','只能明天',0,'末句during the break。'),fact('What should learners do after reading?','读完做什么？','Buy a phone','买手机','Explain the main idea','解释大意','Read messages immediately','立即读消息',1,'close text之后说主旨。')]),
 sent:sentence('I put my phone away because I want to pay attention.','I put my phone away.','我把手机放到一边，因为我想集中注意力。',['i','put','phone','away'],['手机','因为','注意'],'主句put；because从句want。区分原因与主要行为。'),
 trans:[translation('我认为练习很重要。','I think practice is important.',['think','practice','is','important'],'think不是thing；important前有is。'),translation('我每天听英语。','I listen to English every day.',['listen to','English','every day'],'listen to搭配；every day作时间状语。')]
},
{
 title:'旅行信息与时间顺序',grammarTip:'先判断过去、现在还是将来，再定位到达与离开的时间；不把修饰部分当主句。',
 reading:reading('A Trip to the Village','去村庄旅行','Lily lives in a city, but her grandparents live in a village far away. Last Saturday, she decided to travel there by train. She left home at seven and arrived at the station at half past seven. The train did not leave until eight, so she had time to buy some water. On the train, she read a short English story. When she reached the village, her grandfather met her near the station. They walked home together. Lily wrote a few sentences about the trip that evening so she could practise talking about the past.','莉莉住城里，祖父母住很远的村庄。上周六她决定坐火车去，七点离家，七点半到站，八点才发车，所以有时间买水。车上读了英语短故事。到村庄后，祖父在车站附近接她，一起步行回家。当晚她写几句旅行记录，练习描述过去。',
[fact('Where do her grandparents live?','祖父母住哪里？','In a village','村庄','In her city','她的城市','At the station','车站',0,'开头对比。'),fact('When did Lily arrive at the station?','莉莉几点到站？','At seven','七点','At half past seven','七点半','At eight','八点',1,'区分离家、到站、发车。'),fact('What did she do on the train?','车上做什么？','Called a teacher','给老师打电话','Slept all the way','全程睡觉','Read a story','读故事',2,'车上read a short story。'),fact('Why did she write about the trip?','为什么写旅行记录？','To practise talking about the past','练习描述过去','To sell a ticket','卖票','To change the train time','改发车时间',0,'结尾so she could说明目的。')]),
 listening:listening('At the Station','在车站','The train to Green Village leaves at eight thirty today. Please arrive at the station before eight fifteen. The small shop near the door sells water, but you cannot pay there with a card. Keep your ticket ready. If you need help, ask the person at the information desk.','去绿村的火车今天八点半开，请八点十五分前到站。门边的小店卖水，但不能刷卡付款。准备好车票，需要帮助请问信息台工作人员。',['Please arrive before eight fifteen.','Keep your ticket ready.'],['请八点十五分前到达。','准备好你的车票。'],[fact('When does the train leave?','火车几点开？','At eight fifteen','八点十五','At eight thirty','八点半','At seven thirty','七点半',1,'不要把到站要求当发车时间。'),fact('Where can passengers ask for help?','乘客在哪里求助？','At the information desk','信息台','In the village shop','村庄商店','At home','家中',0,'最后一句ask...information desk。')]),
 sent:sentence('When I arrived at the station, my friend was ready.','My friend was ready.','我到车站时，我的朋友已经准备好了。',['friend','was','ready'],['车站','朋友','准备'],'When引导时间从句；主句My friend was ready，ready前的was不可省。'),
 trans:[translation('我昨天七点离开家。','I left home at seven yesterday.',['left','home','seven','yesterday'],'leave过去式left。',['Yesterday I left home at seven.']),translation('车站在学校附近。','The station is near the school.',['station','is','near','school'],'地点描述也要有谓语is。')]
},
{
 title:'习惯、原因与结果',grammarTip:'because引出原因；检查名词和谓语，不把progress误当可数名词随意加a。',
 reading:reading('Checking Progress','检查进步','Sam wants to build a useful study habit. His goal is to understand short English texts without translating every sentence. Each day he reviews old words and reads a new short passage. He does not judge progress only by the number of pages. Instead, he checks whether he can answer questions and explain the main idea. When he makes a mistake, he writes a reason beside it. For example, he may know a word but fail to recognize its sound. This record helps him choose the next practice task. He also returns to old mistakes after a few days.','萨姆想建立有用的学习习惯，目标是不逐句翻译也能理解短文。他每天复习旧词、读新短文，不只按页数判断进步，而看能否答题、说大意。犯错时记原因，例如认得词却没辨出声音。记录帮助选择下次练习，过几天还会回顾旧错。',
[fact('What is Sam’s goal?','萨姆的目标是什么？','Understand short texts directly','直接理解短文','Finish every book','读完所有书','Avoid all writing','避免写作',0,'开头目标。'),fact('How does he check progress?','怎样检查进步？','Only counts pages','只数页数','Answers questions and explains ideas','答题并解释大意','Only buys books','只买书',1,'instead后是实际做法。'),fact('What does he write beside mistakes?','错题旁记录什么？','The book price','书价','The weather','天气','A reason','原因',2,'write a reason。'),fact('When does he revisit old mistakes?','何时回顾旧错？','After a few days','几天后','Never','从不','Only after a year','只在一年后',0,'最后一句after a few days。')]),
 listening:listening('Reviewing Old Words','复习旧词','Today I am reviewing words from last week. I cover the meanings and try to remember them first. Then I use each difficult word in a short sentence. I do not copy the same word twenty times. I check it again after a break. This helps me see which words need more practice.','今天复习上周的词。先遮住意思回忆，再把难词放进短句。不把同一个词抄二十遍，而在休息后再检查，这能看出哪些词需要更多练习。',['I cover the meanings first.','Some words need more practice.'],['我先遮住意思。','有些词需要更多练习。'],[fact('What does the speaker do first?','先做什么？','Covers the meanings','遮住词义','Copies twenty times','抄二十遍','Buys new cards','买新卡',0,'cover...first。'),fact('What happens after a break?','休息后做什么？','Stops forever','永远停止','Checks the words again','再检查单词','Changes every answer','改所有答案',1,'check it again after a break。')]),
 sent:sentence('Learners who review old mistakes often make progress.','Learners make progress.','复习旧错误的学习者往往会进步。',['learners','make','progress'],['复习','错误','进步'],'review是定语从句谓语；主句是make progress。'),
 trans:[translation('我每天复习旧词。','I review old words every day.',['review','old words','every day'],'every day分开。'),translation('我认为自己正在进步。','I think I am making progress.',['think','am','making progress'],'think从句中保留am making；progress不可数。')]
},
{
 title:'第二周小测：准备衔接',grammarTip:'不加新词；用换过的材料检查迁移。看词汇、听力理解和阅读分项表现，不用小题正确率预测六级分数。',
 reading:reading('Choosing the Next Step','选择下一步','After two weeks, Rosa checks three kinds of records. First, she tests whether she remembers words after a day, not just after a minute. Second, she listens to a new short conversation and answers questions without reading the text. Third, she reads a short passage and explains where she found each answer. Some tasks are now easier, but she still makes mistakes with verbs. She decides to keep a few grammar exercises in her plan. If the next week goes well, she will try slightly longer material. Her long-term goal stays the same, while the daily steps can change.','两周后罗莎检查三类记录：词汇隔天是否记得，而不是只看一分钟后的记忆；听一段新短对话，不看文字答题；读短文并指出每题依据。有些任务变容易了，但动词仍会错，所以保留少量语法练习。下周表现稳定就试稍长材料。长期目标不变，日常步骤可以调整。',
[fact('When does Rosa check word memory?','什么时候检查词汇记忆？','After a day','隔天','Only immediately','只立即检查','After a year only','只一年后',0,'强调不是只看即时记忆。'),fact('How does she test listening?','怎样测听力？','Reads all answers first','先看全部答案','Uses a new conversation without text','用新对话且不看文字','Only repeats a memorized line','只重复背熟的句子',1,'用新材料检查理解。'),fact('What still needs practice?','什么仍需练习？','Book shopping','买书','Drawing','绘画','Verbs','动词',2,'still makes mistakes with verbs。'),fact('What stays the same?','什么保持不变？','Her long-term goal','长期目标','Every daily task','每天所有任务','The length of every text','每篇篇幅',0,'长期目标不变，日常步骤可变。')]),
 listening:listening('A Review Meeting','复盘会','Our review meeting starts at five, but please come ten minutes early. Bring your record of old mistakes. We will listen to a new conversation and answer two questions before looking at the text. Then we will choose next week’s tasks. We are checking what to practise next, not trying to learn many new words today.','复盘会五点开始，请提前十分钟，带旧错记录。先听新对话、答两题，再看文字，然后选择下周任务。今天检查下一步练什么，不学大量新词。',['Bring your record of old mistakes.','We will choose next week’s tasks.'],['带上你的旧错记录。','我们将选择下周任务。'],[fact('When should learners arrive?','应该几点到？','At five ten','五点十分','At four fifty','四点五十','At four','四点',1,'五点提前十分钟=四点五十。'),fact('What is the purpose of the meeting?','复盘会目的是什么？','Choose future practice','选择后续练习','Memorize many new words','背大量新词','Buy recordings','买录音',0,'检查下一步练什么。')]),
 sent:sentence('Students who practise regularly become more confident.','Students become more confident.','经常练习的学生变得更有信心。',['students','become','confident'],['学生','练习','信心'],'practise是从句谓语；主句谓语become连接状态more confident。'),
 trans:[translation('我认为听力练习很重要。','I think listening practice is important.',['think','listening practice','is','important'],'完整保留从句的be动词is。'),translation('我昨天学习了英语，今天正在复习。','I studied English yesterday, and I am reviewing today.',['studied','yesterday','am','reviewing','today'],'先过去式studied，再现在进行时am reviewing。',['I learned English yesterday, and I am reviewing today.'])]
}
].map((item,i)=>({...item,id:'recovery-'+(i+1),index:i,weekly:(i+1)%7===0,words:WORD_PACKS[i],grammar:coreQuestions[i].map(n=>GRAMMAR[n])}));

export const RECOVERY = {start:RECOVERY_START,words:RECOVERY_WORDS,lessons:LESSONS,diagnostic:DIAGNOSTIC};

