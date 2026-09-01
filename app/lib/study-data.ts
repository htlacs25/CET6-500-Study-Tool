export type WordEntry = { word: string; phonetic: string; meaning: string; phrase: string };
export type ChoiceQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const WORD_DATA = `
abandon|放弃；抛弃|abandon a plan
ability|能力；才能|develop an ability
absorb|吸收；理解|absorb information
academic|学术的|academic performance
access|使用权；获取|have access to
accomplish|完成；实现|accomplish a goal
account|解释；账户|account for
accurate|准确的|accurate information
achieve|实现；取得|achieve success
acquire|获得；习得|acquire knowledge
adapt|适应；改编|adapt to change
adequate|足够的；合格的|adequate preparation
adjust|调整；适应|adjust a schedule
advocate|提倡；主张|advocate doing
affect|影响|affect performance
alternative|替代方案|an alternative to
analyse|分析|analyse a sentence
annual|每年的|annual report
anticipate|预期；期待|anticipate a problem
apparent|明显的；表面上的|become apparent
approach|方法；接近|an approach to
appropriate|合适的|appropriate material
arise|出现；产生|problems arise
assess|评估|assess progress
assume|假设；认为|assume that
attempt|尝试|attempt to do
attitude|态度|attitude toward
available|可获得的；有空的|be available to
aware|意识到的|be aware of
balance|平衡|maintain a balance
barrier|障碍|a barrier to
benefit|好处；受益|benefit from
capacity|能力；容量|capacity to learn
challenge|挑战|face a challenge
circumstance|情况；条件|under certain circumstances
clarify|澄清；阐明|clarify a point
collapse|倒塌；崩溃|economic collapse
combine|结合；合并|combine A with B
comment|评论|make a comment
complex|复杂的|a complex problem
concentrate|集中注意力|concentrate on
conduct|实施；进行|conduct a study
confirm|确认；证实|confirm a result
consequence|结果；后果|as a consequence
considerable|相当大的|considerable effort
consist|由……组成|consist of
constant|持续的；不变的|constant practice
consume|消耗；消费|consume time
context|语境；背景|infer from context
contribute|促成；贡献|contribute to
convenient|方便的|a convenient tool
crucial|至关重要的|be crucial to
decline|下降；拒绝|a decline in
define|定义；明确|define a goal
demand|需要；要求|demand attention
demonstrate|证明；展示|demonstrate an ability
determine|决定；确定|determine whether
develop|发展；培养|develop a habit
device|设备|digital device
differ|不同|differ from
difficulty|困难|overcome a difficulty
discipline|自律；学科|self-discipline
distract|使分心|distract from
diverse|多样的|diverse opinions
domestic|国内的；家庭的|domestic market
efficient|高效的|an efficient method
emerge|出现；显现|a pattern emerges
enable|使能够|enable somebody to
encounter|遇到|encounter a problem
enhance|提高；增强|enhance an ability
ensure|确保|ensure that
environment|环境|learning environment
essential|必不可少的|be essential for
establish|建立；确立|establish a habit
evaluate|评价；评估|evaluate results
evidence|证据|strong evidence
exceed|超过|exceed expectations
expand|扩大；扩展|expand vocabulary
expose|使接触；暴露|expose somebody to
factor|因素|a key factor
feature|特点；以……为特色|a main feature
flexible|灵活的|a flexible plan
focus|集中；重点|focus on
frequent|频繁的|frequent practice
function|功能；运转|function as
generate|产生；生成|generate ideas
gradual|逐渐的|gradual improvement
identify|识别；确认|identify a problem
ignore|忽视|ignore a warning
impact|影响|have an impact on
imply|暗示；意味着|imply that
improve|提高；改善|improve efficiency
indicate|表明；指出|indicate that
individual|个人；个体的|individual needs
infer|推断|infer meaning
influence|影响|influence behaviour
initial|最初的|initial stage
interpret|解释；理解|interpret results
involve|涉及；包含|involve doing
issue|问题；议题|deal with an issue
maintain|保持；维持|maintain concentration
major|主要的；专业|a major problem
measure|测量；措施|take measures
method|方法|an effective method
minor|较小的；次要的|a minor mistake
motivate|激励|motivate learners
obtain|获得|obtain information
occur|发生；出现|occur frequently
participate|参加|participate in
particular|特定的；特别的|in particular
perform|执行；表现|perform a task
potential|潜力；潜在的|have the potential to
practical|实际的；实用的|a practical solution
predict|预测|predict an outcome
prevent|阻止|prevent somebody from
primary|主要的；初级的|a primary goal
principle|原则|a basic principle
process|过程；处理|learning process
produce|产生；生产|produce a result
promote|促进；推广|promote learning
provide|提供|provide access to
purpose|目的|serve a purpose
range|范围；一系列|a wide range of
recognize|认出；承认|recognize a word
recommend|推荐；建议|recommend doing
reduce|减少|reduce stress
refer|提到；参考|refer to
reflect|反映；思考|reflect on
regular|定期的；规律的|regular practice
reliable|可靠的|a reliable source
require|需要；要求|require effort
respond|回应；反应|respond to
retain|保留；记住|retain information
review|复习；审查|review mistakes
select|选择|select a method
significant|显著的；重要的|significant progress
similar|相似的|be similar to
source|来源|a reliable source
specific|明确的；具体的|a specific goal
strategy|策略|learning strategy
strengthen|加强|strengthen memory
sufficient|足够的|be sufficient for
support|支持；支撑|support an argument
tend|往往；倾向于|tend to do
theory|理论|in theory
transfer|转移；迁移|transfer knowledge
various|各种各样的|for various reasons
vary|变化；不同|vary from person to person
visible|可见的；明显的|visible progress
accurately|准确地|describe accurately
actively|积极地；主动地|participate actively
additional|额外的|additional practice
advantage|优势|have an advantage
analyse|分析|analyse evidence
application|应用；申请|practical application
argument|论点；争论|support an argument
arrange|安排|arrange a meeting
aspect|方面|an important aspect
average|平均的|on average
avoid|避免|avoid doing
brief|简短的|a brief introduction
category|类别|fall into a category
cause|导致；原因|cause a problem
compare|比较|compare A with B
complete|完成；完整的|complete a task
concept|概念|understand a concept
concern|担忧；涉及|be concerned about
conclusion|结论|draw a conclusion
condition|条件；状况|under certain conditions
confidence|信心|build confidence
conflict|冲突|come into conflict
connection|联系|make a connection
conscious|有意识的|a conscious decision
contrast|对比|in contrast
correct|正确的；纠正|correct a mistake
create|创造|create an opportunity
critical|关键的；批判性的|critical thinking
data|数据|collect data
decision|决定|make a decision
decrease|减少|decrease gradually
detail|细节|in detail
discover|发现|discover a pattern
effect|影响；效果|have an effect on
effective|有效的|prove effective
effort|努力|make an effort
element|元素；要素|a key element
emphasize|强调|emphasize the importance
encourage|鼓励|encourage somebody to
energy|精力；能源|save energy
error|错误|identify an error
estimate|估计|estimate the time
examine|检查；研究|examine evidence
example|例子|for example
expect|预期|expect to do
experience|经历；经验|gain experience
explain|解释|explain clearly
familiar|熟悉的|be familiar with
feedback|反馈|receive feedback
form|形式；形成|form a habit
foundation|基础|build a foundation
goal|目标|set a goal
habit|习惯|develop a habit
increase|增加|increase gradually
information|信息|obtain information
instruction|指示；教学|follow instructions
knowledge|知识|acquire knowledge
limit|限制|set a limit
material|材料|learning material
memory|记忆|long-term memory
notice|注意到；通知|notice a change
objective|目标；客观的|learning objective
opportunity|机会|create an opportunity
organize|组织；整理|organize notes
pattern|模式|identify a pattern
period|时期；一段时间|a study period
practice|练习|regular practice
progress|进步|make progress
question|问题；质疑|answer a question
recall|回忆|recall information
record|记录|keep a record
relationship|关系|a close relationship
result|结果|produce a result
routine|日常安排|daily routine
sentence|句子|analyse a sentence
skill|技能|develop a skill
solution|解决方案|find a solution
task|任务|complete a task
technique|技巧；技术|reading technique
term|术语；学期|technical term
topic|主题|main topic
understand|理解|understand deeply
value|价值|practical value
accurate|准确的|accurate answer
adaptation|适应；改编|cultural adaptation
adequately|充分地|prepare adequately
assessment|评估|weekly assessment
attention|注意力|pay attention to
automatic|自动的|automatic process
background|背景|cultural background
behaviour|行为|change behaviour
beneficial|有益的|be beneficial to
communication|交流|communication skill
community|社区；群体|local community
comprehension|理解力|reading comprehension
concentration|专注|maintain concentration
consistency|持续性|value consistency
construction|结构；建设|sentence construction
creative|有创造力的|creative thinking
definition|定义|dictionary definition
deliberate|有意的；深思熟虑的|deliberate practice
depend|取决于|depend on
describe|描述|describe a process
digital|数字的|digital resource
educational|教育的|educational value
engage|使参与；吸引|engage in
excessive|过度的|excessive use
expression|表达；短语|common expression
failure|失败|learn from failure
fluency|流利度|reading fluency
frequently|频繁地|occur frequently
independent|独立的|independent learning
interaction|互动|social interaction
meaningful|有意义的|meaningful learning
mental|心理的；脑力的|mental effort
necessary|必要的|be necessary for
negative|消极的；负面的|negative effect
positive|积极的；正面的|positive attitude
precise|精确的|precise meaning
pronunciation|发音|natural pronunciation
reaction|反应|initial reaction
repetition|重复|spaced repetition
responsible|负责的|be responsible for
schedule|日程；安排|follow a schedule
severe|严重的|severe problem
temporary|暂时的|temporary solution
traditional|传统的|traditional method
unfamiliar|不熟悉的|unfamiliar word
weakness|弱点|identify a weakness
achievement|成就|academic achievement
complexity|复杂性|sentence complexity
convenience|便利|provide convenience
correction|纠正|error correction
distraction|干扰|avoid distraction
efficiency|效率|improve efficiency
evaluation|评价|self-evaluation
exposure|接触|repeated exposure
flexibility|灵活性|offer flexibility
improvement|提高|steady improvement
motivation|动力|maintain motivation
performance|表现；成绩|academic performance
possibility|可能性|explore a possibility
preparation|准备|exam preparation
productivity|效率；生产力|improve productivity
recognition|识别|word recognition
requirement|要求|meet a requirement
responsibility|责任|take responsibility
selection|选择|careful selection
significance|重要性|understand the significance
similarity|相似性|notice a similarity
success|成功|achieve success
variety|多样性|a variety of
achievement|成绩；成就|sense of achievement
collaboration|合作|team collaboration
commitment|投入；承诺|make a commitment
competition|竞争|academic competition
confidence|信心|gain confidence
curiosity|好奇心|encourage curiosity
discipline|自律|develop discipline
independence|独立|learning independence
patience|耐心|require patience
persistence|坚持|value persistence
pressure|压力|deal with pressure
priority|优先事项|set priorities
reflection|反思|daily reflection
resource|资源|online resource
response|回应；答案|give a response
standard|标准|meet a standard
structure|结构|sentence structure
summary|总结|write a summary
target|目标|reach a target
trend|趋势|a growing trend
`.trim();

const PHONETIC_DATA = `
abandon|/əˈbændən/\nability|/əˈbɪləˌti/\nabsorb|/əbˈzɔrb/\nacademic|/ˌækəˈdɛmɪk/\naccess|/ˈækˌsɛs/\naccomplish|/əˈkɑmplɪʃ/\naccount|/əˈkaʊnt/\naccurate|/ˈækjɚət/\nachieve|/əˈtʃiv/\nacquire|/əˈkwaɪɚ/\nadapt|/əˈdæpt/\nadequate|/ˈædəkwət/\nadjust|/əˈdʒʌst/\nadvocate|/ˈædvəkət/\naffect|/əˈfɛkt/\nalternative|/ɔlˈtɝnətɪv/\nanalyse|/ˈænəˌlaɪz/\nannual|/ˈænjuəl/\nanticipate|/ænˈtɪsəˌpeɪt/\napparent|/əˈpɛrənt/\napproach|/əˈproʊtʃ/\nappropriate|/əˈproʊpriət/\narise|/ɚˈaɪz/\nassess|/əˈsɛs/\nassume|/əˈsum/\nattempt|/əˈtɛmpt/\nattitude|/ˈætəˌtud/\navailable|/əˈveɪləbəl/\naware|/əˈwɛr/\nbalance|/ˈbæləns/\nbarrier|/ˈbæriɚ/\nbenefit|/ˈbɛnəfɪt/\ncapacity|/kəˈpæsəti/\nchallenge|/ˈtʃæləndʒ/\ncircumstance|/ˈsɝkəmˌstæns/\nclarify|/ˈklɛrəˌfaɪ/\ncollapse|/kəˈlæps/\ncombine|/ˈkɑmbaɪn/\ncomment|/ˈkɑmɛnt/\ncomplex|/ˈkɑmplɛks/\nconcentrate|/ˈkɑnsənˌtreɪt/\nconduct|/ˈkɑndəkt/\nconfirm|/kənˈfɝm/\nconsequence|/ˈkɑnsəkwəns/\nconsiderable|/kənˈsɪdɚəbəl/\nconsist|/kənˈsɪst/\nconstant|/ˈkɑnstənt/\nconsume|/kənˈsum/\ncontext|/ˈkɑntɛkst/\ncontribute|/kənˈtrɪbjut/\nconvenient|/kənˈvinjənt/\ncrucial|/ˈkruʃəl/\ndecline|/dɪˈklaɪn/\ndefine|/dɪˈfaɪn/\ndemand|/dɪˈmænd/\ndemonstrate|/ˈdɛmənˌstreɪt/\ndetermine|/dəˈtɝmən/\ndevelop|/dɪˈvɛləp/\ndevice|/dɪˈvaɪs/\ndiffer|/ˈdɪfɚ/\ndifficulty|/ˈdɪfəkəlti/\ndiscipline|/ˈdɪsəplən/\ndistract|/dɪˈstrækt/\ndiverse|/daɪˈvɝs/\ndomestic|/dəˈmɛstɪk/\nefficient|/ɪˈfɪʃənt/\nemerge|/ɪˈmɝdʒ/\nenable|/ɛˈneɪbəl/\nencounter|/ɪnˈkaʊntɚ/\nenhance|/ɛnˈhæns/\nensure|/ɛnˈʃʊr/\nenvironment|/ɪnˈvaɪrənmənt/\nessential|/ɛˈsɛnʃəl/\nestablish|/ɪˈstæblɪʃ/\nevaluate|/ɪˈvæljuˌeɪt/\nevidence|/ˈɛvədəns/\nexceed|/ɪkˈsid/\nexpand|/ɪkˈspænd/\nexpose|/ɪkˈspoʊz/\nfactor|/ˈfæktɚ/\nfeature|/ˈfitʃɚ/\nflexible|/ˈflɛksəbəl/\nfocus|/ˈfoʊkəs/\nfrequent|/ˈfrikwənt/\nfunction|/ˈfʌŋkʃən/\ngenerate|/ˈdʒɛnɚˌeɪt/\ngradual|/ˈɡrædʒuəl/\nidentify|/aɪˈdɛntəˌfaɪ/\nignore|/ˌɪɡˈnɔr/\nimpact|/ˌɪmˈpækt/\nimply|/ˌɪmˈplaɪ/\nimprove|/ˌɪmˈpruv/\nindicate|/ˈɪndəˌkeɪt/\nindividual|/ˌɪndəˈvɪdʒəwəl/\ninfer|/ˌɪnˈfɝ/\ninfluence|/ˈɪnfluəns/\ninitial|/ˌɪˈnɪʃəl/\ninterpret|/ˌɪnˈtɝprət/\ninvolve|/ˌɪnˈvɑlv/\nissue|/ˈɪʃu/\nmaintain|/meɪnˈteɪn/\nmajor|/ˈmeɪdʒɚ/\nmeasure|/ˈmɛʒɚ/\nmethod|/ˈmɛθəd/\nminor|/ˈmaɪnɚ/\nmotivate|/ˈmoʊtəˌveɪt/\nobtain|/əbˈteɪn/\noccur|/əˈkɝ/\nparticipate|/pɑrˈtɪsəˌpeɪt/\nparticular|/pɚˈtɪkjəlɚ/\nperform|/pɚˈfɔrm/\npotential|/pəˈtɛnʃəl/\npractical|/ˈpræktəkəl/\npredict|/prɪˈdɪkt/\nprevent|/prɪˈvɛnt/\nprimary|/ˈpraɪˌmɛri/\nprinciple|/ˈprɪnsəpəl/\nprocess|/ˈprɑˌsɛs/\nproduce|/prəˈdus/\npromote|/prəˈmoʊt/\nprovide|/prəˈvaɪd/\npurpose|/ˈpɝpəs/\nrange|/ˈreɪndʒ/\nrecognize|/ˈrɛkəɡˌnaɪz/\nrecommend|/ˌrɛkəˈmɛnd/\nreduce|/rəˈdus/\nrefer|/rəˈfɝ/\nreflect|/rɪˈflɛkt/\nregular|/ˈrɛɡjəlɚ/\nreliable|/rɪˈlaɪəbəl/\nrequire|/ˌriˈkwaɪɚ/\nrespond|/rɪˈspɑnd/\nretain|/rɪˈteɪn/\nreview|/ˌriˈvju/\nselect|/səˈlɛkt/\nsignificant|/səɡˈnɪfɪkənt/\nsimilar|/ˈsɪməlɚ/\nsource|/ˈsɔrs/\nspecific|/spəˈsɪfɪk/\nstrategy|/ˈstrætədʒi/\nstrengthen|/ˈstrɛŋθən/\nsufficient|/səˈfɪʃənt/\nsupport|/səˈpɔrt/\ntend|/ˈtɛnd/\ntheory|/ˈθɪri/\ntransfer|/trænsˈfɝ/\nvarious|/ˈvɛriəs/\nvary|/ˈvɛri/\nvisible|/ˈvɪzəbəl/\naccurately|/ˈækjɚətli/\nactively|/ˈæktɪvli/\nadditional|/əˈdɪʃənəl/\nadvantage|/ædˈvæntɪdʒ/\napplication|/ˌæpləˈkeɪʃən/\nargument|/ˈɑrɡjəmənt/\narrange|/ɚˈeɪndʒ/\naspect|/ˈæˌspɛkt/\naverage|/ˈævɚɪdʒ/\navoid|/əˈvɔɪd/\nbrief|/ˈbrif/\ncategory|/ˈkætəˌɡɔri/\ncause|/ˈkɑz/\ncompare|/kəmˈpɛr/\ncomplete|/kəmˈplit/\nconcept|/ˈkɑnsɛpt/\nconcern|/kənˈsɝn/\nconclusion|/kənˈkluʒən/\ncondition|/kənˈdɪʃən/\nconfidence|/ˈkɑnfədəns/\nconflict|/ˈkɑnflɪkt/\nconnection|/kəˈnɛkʃən/\nconscious|/ˈkɑnʃəs/\ncontrast|/ˈkɑntræst/\ncorrect|/kɚˈɛkt/\ncreate|/kriˈeɪt/\ncritical|/ˈkrɪtɪkəl/\ndata|/ˈdeɪtə/\ndecision|/dɪˈsɪʒən/\ndecrease|/dɪˈkris/\ndetail|/dɪˈteɪl/\ndiscover|/dɪˈskʌvɚ/\neffect|/ɪˈfɛkt/\neffective|/ɪˈfɛktɪv/\neffort|/ˈɛfɚt/\nelement|/ˈɛləmənt/\nemphasize|/ˈɛmfəˌsaɪz/\nencourage|/ɛnˈkɝɪdʒ/\nenergy|/ˈɛnɚdʒi/\nerror|/ˈɛrɚ/\nestimate|/ˈɛstəmət/\nexamine|/ɪɡˈzæmɪn/\nexample|/ɪɡˈzæmpəl/\nexpect|/ɪkˈspɛkt/\nexperience|/ɪkˈspɪriəns/\nexplain|/ɪkˈspleɪn/\nfamiliar|/fəˈmɪljɚ/\nfeedback|/ˈfidˌbæk/\nform|/ˈfɔrm/\nfoundation|/faʊnˈdeɪʃən/\ngoal|/ˈɡoʊl/\nhabit|/ˈhæbət/\nincrease|/ˌɪnˈkris/\ninformation|/ˌɪnfɚˈmeɪʃən/\ninstruction|/ˌɪnˈstrʌkʃən/\nknowledge|/ˈnɑlədʒ/\nlimit|/ˈlɪmət/\nmaterial|/məˈtɪriəl/\nmemory|/ˈmɛmɚi/\nnotice|/ˈnoʊtəs/\nobjective|/əbˈdʒɛktɪv/\nopportunity|/ˌɑpɚˈtunəti/\norganize|/ˈɔrɡəˌnaɪz/\npattern|/ˈpætɚn/\nperiod|/ˈpɪriəd/\npractice|/ˈpræktəs/\nprogress|/ˈprɑˌɡrɛs/\nquestion|/ˈkwɛstʃən/\nrecall|/ˈriˌkɔl/\nrecord|/rəˈkɔrd/\nrelationship|/riˈleɪʃənˌʃɪp/\nresult|/rɪˈzʌlt/\nroutine|/ruˈtin/\nsentence|/ˈsɛntəns/\nskill|/ˈskɪl/\nsolution|/səˈluʃən/\ntask|/ˈtæsk/\ntechnique|/tɛkˈnik/\nterm|/ˈtɝm/\ntopic|/ˈtɑpɪk/\nunderstand|/ˌʌndɚˈstænd/\nvalue|/ˈvælju/\nadaptation|/ˌædəpˈteɪʃən/\nadequately|/ˈædəkwətli/\nassessment|/əˈsɛsmənt/\nattention|/əˈtɛnʃən/\nautomatic|/ˌɔtəˈmætɪk/\nbackground|/ˈbækˌɡraʊnd/\nbehaviour|/bɪˈheɪvjɚ/\nbeneficial|/ˌbɛnəˈfɪʃəl/\ncommunication|/kəˌmjunəˈkeɪʃən/\ncommunity|/kəˈmjunəti/\ncomprehension|/ˌkɑmpriˈhɛnʃən/\nconcentration|/ˌkɑnsənˈtreɪʃən/\nconsistency|/kənˈsɪstənsi/\nconstruction|/kənˈstrʌkʃən/\ncreative|/kriˈeɪtɪv/\ndefinition|/ˌdɛfəˈnɪʃən/\ndeliberate|/dɪˈlɪbɚət/\ndepend|/dɪˈpɛnd/\ndescribe|/dɪˈskraɪb/\ndigital|/ˈdɪdʒətəl/\neducational|/ˌɛdʒəˈkeɪʃənəl/\nengage|/ɛnˈɡeɪdʒ/\nexcessive|/ɪkˈsɛsɪv/\nexpression|/ɪkˈsprɛʃən/\nfailure|/ˈfeɪljɚ/\nfluency|/ˈfluənsi/\nfrequently|/ˈfrikwəntli/\nindependent|/ˌɪndɪˈpɛndənt/\ninteraction|/ˌɪntɚˈækʃən/\nmeaningful|/ˈminɪŋfəl/\nmental|/ˈmɛntəl/\nnecessary|/ˈnɛsəˌsɛri/\nnegative|/ˈnɛɡətɪv/\npositive|/ˈpɑzətɪv/\nprecise|/prɪˈsaɪs/\npronunciation|/proʊˌnʌnsiˈeɪʃən/\nreaction|/riˈækʃən/\nrepetition|/ˌrɛpəˈtɪʃən/\nresponsible|/riˈspɑnsəbəl/\nschedule|/ˈskɛdʒʊl/\nsevere|/səˈvɪr/\ntemporary|/ˈtɛmpɚˌɛri/\ntraditional|/trəˈdɪʃənəl/\nunfamiliar|/ˌʌnfəˈmɪljɚ/\nweakness|/ˈwiknəs/\nachievement|/əˈtʃivmənt/\ncomplexity|/kəmˈplɛksəti/\nconvenience|/kənˈvinjəns/\ncorrection|/kɚˈɛkʃən/\ndistraction|/dɪˈstrækʃən/\nefficiency|/ɪˈfɪʃənsi/\nevaluation|/ɪˌvæljuˈeɪʃən/\nexposure|/ɪkˈspoʊʒɚ/\nflexibility|/ˌflɛksəˈbɪləti/\nimprovement|/ˌɪmˈpruvmənt/\nmotivation|/ˌmoʊtəˈveɪʃən/\nperformance|/pɚˈfɔrməns/\npossibility|/ˌpɑsəˈbɪləˌti/\npreparation|/ˌprɛpɚˈeɪʃən/\nproductivity|/ˌproʊdəkˈtɪvəti/\nrecognition|/ˌrɛkəɡˈnɪʃən/\nrequirement|/rɪˈkwaɪrmənt/\nresponsibility|/riˌspɑnsəˈbɪləti/\nselection|/səˈlɛkʃən/\nsignificance|/səɡˈnɪfɪkəns/\nsimilarity|/ˌsɪməˈlɛrəti/\nsuccess|/səkˈsɛs/\nvariety|/vɚˈaɪəti/\ncollaboration|/kəˌlæbɚˈeɪʃən/\ncommitment|/kəˈmɪtmənt/\ncompetition|/ˌkɑmpəˈtɪʃən/\ncuriosity|/ˌkjʊriˈɑsəti/\nindependence|/ˌɪndɪˈpɛndəns/\npatience|/ˈpeɪʃəns/\npersistence|/pɚˈsɪstəns/\npressure|/ˈprɛʃɚ/\npriority|/praɪˈɔrəti/\nreflection|/rɪˈflɛkʃən/\nresource|/ˈrisɔrs/\nresponse|/rɪˈspɑns/\nstandard|/ˈstændɚd/\nstructure|/ˈstrʌktʃɚ/\nsummary|/ˈsʌmɚi/\ntarget|/ˈtɑrɡət/\ntrend|/ˈtrɛnd/
`.trim();

const PHONETICS = Object.fromEntries(
  PHONETIC_DATA.split('\n').map((line) => line.split('|')),
);

export const WORDS: WordEntry[] = WORD_DATA.split('\n').map((line) => {
  const [word, meaning, phrase] = line.split('|');
  return { word, phonetic: PHONETICS[word] || '', meaning, phrase };
});

export const LONG_SENTENCES = [
  {
    text: 'Although online courses provide students with easy access to information, learners who lack a clear schedule often find that convenience alone does not lead to significant progress.',
    answer: '主干：learners often find that…；who引导定语从句修饰learners。译：尽管网络课程让学生容易获取信息，但缺乏明确计划的学习者常常发现，仅有便利并不能带来显著进步。',
  },
  {
    text: 'The evidence collected by researchers suggests that short breaks, when used deliberately, can help people maintain concentration without reducing the total amount of time they spend studying.',
    answer: '主干：The evidence suggests that…；collected by researchers是过去分词短语。译：研究人员收集的证据表明，有意识地短暂休息能帮助人们保持注意力，而不会减少总学习时间。',
  },
  {
    text: 'What makes this approach effective is not the timer itself but the habit of deciding exactly what must be accomplished before each study period begins.',
    answer: 'What makes…是主语从句；not A but B表示“不是A而是B”。译：让这种方法有效的不是计时器本身，而是在每段学习开始前明确任务的习惯。',
  },
  {
    text: 'Students exposed to English only through textbooks often find it difficult to understand speakers using reduced forms in everyday conversation.',
    answer: '主干：Students find it difficult；exposed修饰students，using修饰speakers。译：只通过课本接触英语的学生，常觉得很难听懂日常对话中使用弱读形式的人。',
  },
  {
    text: 'Instead of trying to remember every detail, successful listeners focus on identifying key information and following the speaker’s main idea.',
    answer: '主干：listeners focus on…；identifying和following并列。译：成功的听者不会试图记住每个细节，而是专注于识别关键信息并跟上说话者的主要思路。',
  },
  {
    text: 'Information that is actively retrieved from memory is usually retained longer than information that is merely reread.',
    answer: '主干：Information is retained longer than information；两个that从句分别修饰information。译：主动从记忆中提取的信息，通常比仅仅重读的信息保持得更久。',
  },
  {
    text: 'By the time learners realize that they have been reviewing words passively, they may have forgotten so much of the material that returning to it becomes almost as demanding as learning it for the first time.',
    answer: '主干：they may have forgotten so much…that…；returning to it是动名词作主语。译：当学习者意识到自己一直在被动复习时，可能已忘掉大量内容，重新学习几乎和第一次一样费力。',
  },
  {
    text: 'The quality of note-taking depends less on the tool being used than on the mental activity involved in selecting and organizing information.',
    answer: '主干：The quality depends less on A than on B。译：笔记质量与其说取决于所用工具，不如说取决于筛选和组织信息时进行的思考。',
  },
  {
    text: 'Learners who test themselves regularly are more likely to discover weaknesses that would remain hidden during passive rereading.',
    answer: 'who修饰learners，that修饰weaknesses。译：经常自测的学习者更可能发现那些在被动重读中仍会被隐藏的弱点。',
  },
  {
    text: 'If students can no longer explain what they have just read, a brief change of activity may be more beneficial than forcing themselves to continue.',
    answer: 'If引导条件状语从句；what they have just read作explain的宾语。译：如果学生已无法解释刚读过的内容，短暂换一种活动可能比强迫自己继续更有益。',
  },
  {
    text: 'One reason why short daily sessions are effective is that they expose learners to English frequently without causing excessive tiredness.',
    answer: 'why修饰reason；that从句作表语。译：短时日常学习有效的一个原因是，它让学习者频繁接触英语而不会造成过度疲劳。',
  },
  {
    text: 'A strategy that produces rapid improvement for one learner may fail to benefit another whose background and daily routine are different.',
    answer: 'that修饰strategy；whose修饰another。译：对一名学习者快速见效的策略，可能无法帮助背景和日常安排不同的另一名学习者。',
  },
];

export const GRAMMAR_QUESTIONS: ChoiceQuestion[] = [
  { prompt: 'Regular review is crucial ___ long-term memory.', options: ['to', 'at', 'on', 'with'], answer: 0, explanation: 'be crucial to意为“对……至关重要”。' },
  { prompt: 'The course consists ___ six learning units.', options: ['in', 'of', 'for', 'by'], answer: 1, explanation: 'consist of意为“由……组成”。' },
  { prompt: 'Students should avoid ___ every unfamiliar word immediately.', options: ['check', 'checked', 'checking', 'to checking'], answer: 2, explanation: 'avoid后接动名词doing。' },
  { prompt: 'The evidence ___ by the researchers supports the conclusion.', options: ['collecting', 'collected', 'collect', 'to collect'], answer: 1, explanation: 'evidence与collect是被动关系，用过去分词collected。' },
  { prompt: 'The more actively you recall information, ___ you retain it.', options: ['the longer', 'longer', 'the longest', 'long'], answer: 0, explanation: 'the more…, the more…表示“越……越……”。' },
  { prompt: 'This method enables learners ___ words in context.', options: ['understand', 'understanding', 'to understand', 'understood'], answer: 2, explanation: 'enable somebody to do something。' },
  { prompt: 'Students ___ turn off notifications often concentrate better.', options: ['which', 'whose', 'who', 'where'], answer: 2, explanation: '先行词是人，关系词在从句中作主语，用who。' },
  { prompt: 'Short breaks can prevent mental tiredness from ___ severe.', options: ['become', 'became', 'becoming', 'to become'], answer: 2, explanation: 'prevent…from doing是固定结构。' },
  { prompt: 'Neither the timer nor the phone ___ the real problem.', options: ['are', 'were', 'be', 'is'], answer: 3, explanation: 'neither…nor遵循就近原则，phone为单数。' },
  { prompt: 'By the time she took the test, she ___ the words several times.', options: ['reviews', 'had reviewed', 'will review', 'is reviewing'], answer: 1, explanation: '过去某时间之前已完成，用过去完成时。' },
  { prompt: 'It is important that every task ___ a clear purpose.', options: ['has', 'have', 'having', 'to have'], answer: 0, explanation: '从句主语every task为单数，谓语用has。' },
  { prompt: 'Not only reading but also listening ___ vocabulary growth.', options: ['contribute to', 'contributes to', 'contributing', 'to contribute'], answer: 1, explanation: 'not only…but also遵循就近原则，listening为单数。' },
  { prompt: 'What learners need most ___ consistent practice.', options: ['are', 'were', 'is', 'be'], answer: 2, explanation: 'What从句作整体主语，谓语通常用单数。' },
  { prompt: 'The word appeared repeatedly, ___ indicated that it was important.', options: ['who', 'which', 'where', 'what'], answer: 1, explanation: 'which引导非限制性定语从句，指代前面的整件事。' },
  { prompt: 'Having ___ the passage twice, she began to answer the questions.', options: ['read', 'reading', 'reads', 'to read'], answer: 0, explanation: 'Having done表示先于主句动作发生；read过去分词仍写作read。' },
  { prompt: 'There is strong evidence ___ sleep supports memory.', options: ['which', 'that', 'where', 'whose'], answer: 1, explanation: 'that引导同位语从句，说明evidence的内容。' },
];

export const READINGS = [
  {
    title: 'Why Familiarity Can Be Misleading',
    passage: 'Rereading a chapter often feels productive because the sentences become familiar. Yet familiarity is not the same as mastery. During an examination, students must produce information without seeing the original page. A more reliable method is retrieval practice: after reading, close the book and explain the main ideas from memory. This feels harder and often reveals gaps, but that difficulty is useful. Feedback remains essential, because an unchecked mistake may be repeated. The most effective routine combines an attempt to recall, comparison with a reliable answer, and correction of misunderstandings.',
    questions: [
      { prompt: 'Why can rereading feel productive?', options: ['It makes sentences familiar.', 'It removes every mistake.', 'It guarantees a high score.', 'It requires no material.'], answer: 0, explanation: '首句指出，重读让句子变得熟悉，因此感觉有效。' },
      { prompt: 'What does retrieval practice require?', options: ['Copying every sentence', 'Producing ideas from memory', 'Reading faster', 'Avoiding feedback'], answer: 1, explanation: '原文要求合上书，从记忆中解释主要观点。' },
      { prompt: 'Why is feedback essential?', options: ['It makes books shorter.', 'It prevents unchecked errors from being repeated.', 'It removes difficulty.', 'It replaces recall.'], answer: 1, explanation: '未经核对的错误可能被重复。' },
    ],
  },
  {
    title: 'The Cost of Checking Every Word',
    passage: 'When learners meet an unfamiliar word, they often open a dictionary immediately. Dictionaries are valuable, but checking every word interrupts the connection between sentences and increases the demands on working memory. Strategic readers first decide whether the word is essential. If the general meaning remains clear, they mark it and continue. After finishing the passage, they choose several useful words to check and record. This approach protects both comprehension and reading flow. Precise material, such as instructions or scientific definitions, may still require immediate checking.',
    questions: [
      { prompt: 'What may happen when every word is checked?', options: ['Reading flow is interrupted.', 'Memory becomes unlimited.', 'The passage becomes shorter.', 'All words are mastered.'], answer: 0, explanation: '原文直接指出频繁查词会打断句子之间的联系。' },
      { prompt: 'What should readers do if the main meaning remains clear?', options: ['Stop reading', 'Mark the word and continue', 'Memorize the dictionary', 'Delete the sentence'], answer: 1, explanation: '原文建议先标记，继续阅读。' },
      { prompt: 'When might immediate checking be necessary?', options: ['During casual browsing', 'When precise understanding is required', 'Whenever a word is long', 'Only after an exam'], answer: 1, explanation: '说明和科学定义等精确材料可能需要立即查词。' },
    ],
  },
  {
    title: 'The Real Purpose of Notes',
    passage: 'Digital devices make it possible to record almost everything a teacher says. However, a complete record does not guarantee meaningful learning. Effective note-taking requires selection: learners decide which ideas are central and how points are connected. Handwriting sometimes encourages this process because it is slower, but typing is not automatically worse. A student who types brief summaries may think more deeply than one who copies sentences by hand. The quality of notes depends less on the tool than on the mental activity involved. Review is also necessary; notes become useful when learners turn them into questions and answer from memory.',
    questions: [
      { prompt: 'What does effective note-taking require?', options: ['Recording everything', 'Selecting and connecting ideas', 'Buying a device', 'Writing very quickly'], answer: 1, explanation: '第二、三句强调筛选中心思想并建立联系。' },
      { prompt: 'What is the author’s view of typing?', options: ['It is always worse.', 'It can support deep thinking when used well.', 'It should replace handwriting.', 'It prevents summaries.'], answer: 1, explanation: '作者反对工具决定论，关键是如何使用。' },
      { prompt: 'How can notes become tools for active recall?', options: ['By storing them', 'By turning them into questions', 'By decorating them', 'By sharing them immediately'], answer: 1, explanation: '结尾建议把笔记变成问题并从记忆中回答。' },
    ],
  },
  {
    title: 'A Quiet Phone Hour',
    passage: 'A university library invited students to place their phones in lockers for one focused hour. At first, several participants felt anxious even though they were not expecting important messages. As the hour continued, the feeling weakened and many became more involved in their work. Afterwards, students reported finishing more than expected. Organizers did not conclude that phones should be prohibited. Smartphones provide dictionaries and course materials. The real issue is the habit of responding to every notification immediately. The library now encourages short periods during which unnecessary notifications are turned off.',
    questions: [
      { prompt: 'How did some students initially feel?', options: ['Anxious', 'Angry', 'Excited', 'Sleepy'], answer: 0, explanation: '原文明确说several participants felt anxious。' },
      { prompt: 'What did many students report afterwards?', options: ['They lost their phones.', 'They finished more work than expected.', 'They needed more notifications.', 'They disliked the library.'], answer: 1, explanation: '学生报告完成的任务比预期更多。' },
      { prompt: 'What is the real issue according to organizers?', options: ['Owning a phone', 'Using dictionaries', 'Responding immediately to every notification', 'Studying for one hour'], answer: 2, explanation: '问题在使用习惯，而不是设备本身。' },
    ],
  },
  {
    title: 'Short Breaks and Attention',
    passage: 'When people work without a break, their attention gradually becomes less stable. They may continue looking at the page without processing it deeply. Short breaks can help, especially when they involve a change of activity such as standing up or drinking water. Checking social media is less refreshing because it continues to demand attention and can turn a five-minute pause into half an hour. Timed study periods should remain flexible. An essay may require uninterrupted thought, while routine vocabulary review may benefit from shorter sessions. Learners should observe their own performance rather than obey a timer blindly.',
    questions: [
      { prompt: 'What may happen during a long session without breaks?', options: ['Attention becomes less stable.', 'Every detail is remembered.', 'Tasks become easier.', 'Reading speed doubles.'], answer: 0, explanation: '开头直接说明注意力会逐渐不稳定。' },
      { prompt: 'Which break is recommended?', options: ['Watching videos', 'Checking messages', 'Standing up and drinking water', 'Starting another hard task'], answer: 2, explanation: '换活动更能恢复注意力。' },
      { prompt: 'How should timed periods be used?', options: ['As strict rules', 'Flexibly according to the task', 'Only for essays', 'Without breaks'], answer: 1, explanation: '作者主张根据任务和个人表现灵活使用。' },
    ],
  },
  {
    title: 'Learning Through Explanation',
    passage: 'Students sometimes believe they understand a concept because they can follow a teacher’s explanation. A simple test is to explain the idea in their own words to someone unfamiliar with the topic. Gaps become visible when the explanation relies on vague phrases or jumps between steps. The learner can then return to the material, clarify the missing connection and try again. This method does not require an actual audience; speaking to an empty chair or writing a short explanation can work. The purpose is not to sound impressive but to make thinking precise enough that another person could follow it.',
    questions: [
      { prompt: 'What can reveal gaps in understanding?', options: ['Following a teacher', 'Explaining the idea in one’s own words', 'Reading the title', 'Highlighting every line'], answer: 1, explanation: '用自己的话解释会暴露模糊处和跳步。' },
      { prompt: 'Is a real audience necessary?', options: ['Always', 'Only for teachers', 'No', 'Only during exams'], answer: 2, explanation: '原文说不需要真实听众。' },
      { prompt: 'What is the purpose of the method?', options: ['To sound impressive', 'To make thinking precise', 'To avoid reviewing', 'To memorize vague phrases'], answer: 1, explanation: '结尾明确指出目标是让思考足够精确。' },
    ],
  },
];

export const TRANSLATIONS = [
  ['定期自测不仅能帮助我们评估进步，还能加强长期记忆。', 'Regular self-testing can not only help us assess our progress but also strengthen long-term memory.'],
  ['如果每遇到一个生词就查词典，我们可能很难集中注意力理解文章主旨。', 'If we consult a dictionary whenever we encounter a new word, we may find it difficult to focus on the main idea.'],
  ['接触自然语速的英语，是提高听力能力的有效方法。', 'Being exposed to English spoken at a natural speed is an effective way to improve listening ability.'],
  ['手机通知可能使我们从重要任务中分心。', 'Phone notifications may distract us from important tasks.'],
  ['这门课程由六个单元组成，每个单元关注一项具体技能。', 'The course consists of six units, each of which focuses on a specific skill.'],
  ['养成每天复习的习惯，对提高英语水平至关重要。', 'Establishing a habit of daily review is crucial to improving our English.'],
  ['语境能帮助读者推断生词含义，但并非在所有情况下都适用。', 'Context can help readers infer the meanings of unfamiliar words, but this method is not appropriate under all circumstances.'],
  ['取得显著进步需要时间、耐心和持续练习。', 'Making significant progress requires time, patience and consistent practice.'],
  ['有效的笔记不是被动记录，而是选择和组织信息的过程。', 'Effective note-taking is not a passive record but a process of selecting and organizing information.'],
  ['学习者不应该因为第一次没有听懂就放弃练习。', 'Learners should not abandon their practice simply because they fail to understand the first time.'],
  ['短暂休息可以帮助我们在长时间学习中保持注意力。', 'Short breaks can help us maintain concentration during a long study session.'],
  ['哪种工具最合适，取决于任务和个人情况。', 'Which tool is most suitable depends on the task and individual circumstances.'],
] as const;

export const LISTENINGS: Array<{
  title: string;
  passage: string;
  dictation: string[];
  questions: ChoiceQuestion[];
}> = [
  {
    title: 'Focused Study and Short Breaks',
    passage: 'Many students believe that studying longer automatically leads to better results. Yet the quality of a study session often matters more than its length. When people work without a break, their attention gradually becomes less stable. One practical solution is to divide study time into focused periods. During each period, the learner works on a clearly defined task. After about twenty-five or thirty minutes, the learner takes a short break. Standing up, drinking water, or looking outside is usually more refreshing than checking social media. Timed study periods should be treated as a flexible tool rather than a strict rule.',
    dictation: [
      'The quality of a study session often matters more than its length.',
      'Their attention gradually becomes less stable.',
      'The learner works on a clearly defined task.',
      'Standing up and drinking water can be refreshing.',
      'Students should treat the timer as a flexible tool.',
    ],
    questions: [
      { prompt: 'What may happen when people study without a break?', options: ['Attention becomes less stable.', 'Memory becomes perfect.', 'Tasks disappear.', 'Reading speed doubles.'], answer: 0, explanation: '原文指出，不休息时注意力会逐渐变得不稳定。' },
      { prompt: 'What should a learner do during each focused period?', options: ['Check messages', 'Work on a clearly defined task', 'Study several subjects', 'Avoid all timers'], answer: 1, explanation: '每个专注时段应完成一个明确任务。' },
      { prompt: 'Which break is recommended?', options: ['Watching videos', 'Checking social media', 'Standing up and drinking water', 'Starting another hard task'], answer: 2, explanation: '站起来或喝水能真正改变活动并恢复注意力。' },
    ],
  },
  {
    title: 'The Quiet Phone Hour',
    passage: 'A university library introduced an activity called the Quiet Phone Hour. Students who participated turned off their phones and placed them in small lockers. During the first ten minutes, several students felt slightly anxious. As time passed, however, this feeling became weaker. At the end of the hour, many participants reported that they had finished more work than expected. The organizers did not plan to prohibit phones because smartphones provide useful dictionaries and course materials. Instead, they encouraged students to create short periods during which unnecessary notifications were turned off.',
    dictation: [
      'Students turned off their phones and placed them in small lockers.',
      'Several students felt slightly anxious at first.',
      'Many participants finished more work than expected.',
      'Smartphones provide useful dictionaries and course materials.',
      'Unnecessary notifications should be turned off.',
    ],
    questions: [
      { prompt: 'What did participating students do with their phones?', options: ['Sold them', 'Placed them in lockers', 'Used them for games', 'Gave them to teachers'], answer: 1, explanation: '参与者关闭手机并放入小储物柜。' },
      { prompt: 'How did some students feel at first?', options: ['Anxious', 'Angry', 'Confident', 'Excited'], answer: 0, explanation: '最初十分钟，一些学生感到有些焦虑。' },
      { prompt: 'What did organizers finally recommend?', options: ['Banning phones', 'Turning off unnecessary notifications for short periods', 'Buying new phones', 'Studying only online'], answer: 1, explanation: '结论不是禁用手机，而是设置关闭无关通知的专注时段。' },
    ],
  },
  {
    title: 'Why Familiar Words Disappear in Speech',
    passage: 'Many English learners recognize a word when they see it but fail to notice the same word in a recording. In natural speech, words are not always pronounced as separate units. The final sound of one word may connect with the first sound of the next. Function words such as to, of and and are often pronounced more weakly than important content words. During the first listening, learners should focus on the general topic and stressed words. After one or two attempts, they can compare the recording with a transcript and imitate several useful sentences.',
    dictation: [
      'Words are not always pronounced as separate units.',
      'The final sound may connect with the next word.',
      'Function words are often pronounced more weakly.',
      'Learners should focus on stressed content words.',
      'They can compare the recording with a transcript.',
    ],
    questions: [
      { prompt: 'Why may familiar words be difficult to recognize?', options: ['They are always new.', 'Words connect and weak forms occur.', 'Speakers use no grammar.', 'Recordings contain no context.'], answer: 1, explanation: '自然语流中会出现连读和弱读。' },
      { prompt: 'What should learners focus on first?', options: ['Every single sound', 'The topic and stressed words', 'The transcript', 'Dictionary definitions'], answer: 1, explanation: '第一遍先抓主题和重读实词。' },
      { prompt: 'When should the transcript be used?', options: ['Before listening', 'After one or two attempts', 'Only next week', 'Never'], answer: 1, explanation: '先独立听一两遍，再对照文本。' },
    ],
  },
  {
    title: 'Sleep and Memory',
    passage: 'Sleep is not simply a period during which learning stops. While people sleep, the brain continues to organize recently acquired information. Students who reduce sleep to gain extra study time may therefore remember less, even though they spend more hours at a desk. A regular sleep schedule is especially useful before an examination. Last-minute study can sometimes increase familiarity, but adequate sleep supports concentration, accurate recall and better decisions the following day.',
    dictation: [
      'The brain continues to organize recently acquired information.',
      'Students may remember less when they reduce sleep.',
      'A regular sleep schedule is useful before an examination.',
      'Last-minute study can increase familiarity.',
      'Adequate sleep supports accurate recall.',
    ],
    questions: [
      { prompt: 'What does the brain do during sleep?', options: ['Stops completely', 'Organizes recent information', 'Forgets every detail', 'Avoids decisions'], answer: 1, explanation: '睡眠期间，大脑仍会整理新近获得的信息。' },
      { prompt: 'What may happen when students reduce sleep?', options: ['They always remember more.', 'They may remember less.', 'They need no review.', 'They read twice as fast.'], answer: 1, explanation: '牺牲睡眠换学习时间可能降低记忆效果。' },
      { prompt: 'What does adequate sleep support?', options: ['Only familiarity', 'Concentration and accurate recall', 'More notifications', 'Passive rereading'], answer: 1, explanation: '充足睡眠支持专注、准确回忆和决策。' },
    ],
  },
  {
    title: 'Taking Useful Notes',
    passage: 'Effective note-taking requires selection. Learners must decide which ideas are central and how different points are connected. Typing can be useful, but it sometimes encourages students to record every word without processing the meaning. Handwriting is slower and may encourage summarizing. The tool itself is not the most important factor. A student who writes brief summaries and asks questions may learn more than someone who creates a complete transcript without understanding it. Notes become more valuable when they are reviewed within twenty-four hours.',
    dictation: [
      'Effective note-taking requires careful selection.',
      'Learners decide which ideas are central.',
      'Typing sometimes encourages students to record every word.',
      'The tool itself is not the most important factor.',
      'Notes should be reviewed within twenty-four hours.',
    ],
    questions: [
      { prompt: 'What does effective note-taking require?', options: ['Recording everything', 'Selection and connection', 'A costly device', 'No review'], answer: 1, explanation: '有效笔记要求筛选中心观点并建立联系。' },
      { prompt: 'What may typing encourage?', options: ['Summarizing every idea', 'Recording without processing meaning', 'Speaking aloud', 'Avoiding details'], answer: 1, explanation: '打字太快可能使人逐字记录而不理解。' },
      { prompt: 'When should notes be reviewed?', options: ['Within twenty-four hours', 'After one year', 'Only before graduation', 'Never'], answer: 0, explanation: '文中建议24小时内复习。' },
    ],
  },
  {
    title: 'Using a Dictionary Strategically',
    passage: 'Dictionaries are valuable tools, but checking every unfamiliar word can damage reading fluency. Each search interrupts the connection between sentences and places additional demands on working memory. Strategic readers first decide whether a word is essential. If the main idea remains clear, they mark the word and continue. After finishing the passage, they select several useful words to check and record. Immediate checking is still necessary when precise understanding is required, such as in instructions or scientific definitions.',
    dictation: [
      'Checking every unfamiliar word can damage reading fluency.',
      'Each search interrupts the connection between sentences.',
      'Strategic readers decide whether a word is essential.',
      'They mark the word and continue reading.',
      'Precise material may require immediate checking.',
    ],
    questions: [
      { prompt: 'What can frequent dictionary use damage?', options: ['Reading fluency', 'Book quality', 'Phone batteries only', 'The alphabet'], answer: 0, explanation: '逐词查词会破坏阅读流畅度。' },
      { prompt: 'What should readers do if the main idea is clear?', options: ['Stop immediately', 'Mark the word and continue', 'Translate every sentence', 'Delete the paragraph'], answer: 1, explanation: '先标记，完成阅读后再筛选重要词。' },
      { prompt: 'When may immediate checking be necessary?', options: ['When precision matters', 'Whenever a word is long', 'Only at night', 'Never'], answer: 0, explanation: '说明和科学定义等材料需要精确理解。' },
    ],
  },
];

// The standalone learning tool uses the following bilingual practice packs.
// All passages and questions are original CET-style simulations rather than
// copied past papers, so they can be used offline every day without a link.
export const CET_READINGS = [
  {
    level: '四级模拟',
    topic: '校园生活 · 可持续出行',
    title: 'Why One Campus Made Bicycles Easier to Borrow',
    titleZh: '为什么一所大学让自行车更容易借用',
    passage: `When Greenfield University first introduced a bicycle-sharing program, administrators expected students to use the bikes mainly for trips between distant classrooms. The early results were disappointing. Although hundreds of students registered, many bicycles remained unused during most of the day. A survey revealed that the problem was not a lack of interest. Students worried that no bicycle would be available for the return journey, and some did not know where they were allowed to leave one.

Instead of simply buying more bicycles, the university redesigned the service. It added real-time information to a campus app, marked parking areas more clearly, and moved bicycles between crowded and empty stations twice a day. It also offered a short safety lesson that students could complete online. Within one semester, the number of daily rides almost doubled.

The program produced an unexpected benefit. Students who lived near the campus began using shared bicycles instead of asking friends for short car rides. This reduced traffic around the main gate at busy times. However, the university has not declared the project a complete success. Repair costs are higher than predicted, and rainy weather still causes a sharp fall in use. The administrators say the lesson is that a convenient service depends not only on the number of bicycles but also on reliable information and careful daily management.`,
    passageZh: `格林菲尔德大学刚推出共享自行车项目时，管理人员以为学生主要会用自行车往返于距离较远的教学楼。最初的结果却令人失望。尽管数百名学生进行了注册，许多自行车在一天的大部分时间里仍无人使用。调查发现，问题并非学生缺乏兴趣。学生担心返程时没有车可用，有些人也不知道可以把车停在哪里。

学校没有简单地购买更多自行车，而是重新设计了服务：在校园应用中加入实时信息，更清楚地标出停车区，每天两次在拥挤和空闲站点之间调配车辆，并提供可在线完成的简短安全课程。一个学期内，日均骑行次数几乎翻倍。

该项目还带来了意外好处。住在校园附近的学生开始骑共享自行车，而不再请朋友开车短途接送，从而缓解了繁忙时段校门附近的交通。不过，学校并未宣布项目已经完全成功：维修费用高于预期，雨天使用量仍会大幅下降。管理人员认为，便利服务不仅取决于自行车数量，也取决于可靠的信息和细致的日常管理。`,
    questions: [
      { prompt: 'Why were many bicycles unused at first?', promptZh: '为什么许多自行车起初无人使用？', options: ['Students had no interest in cycling.', 'Students were uncertain about availability and parking.', 'The bicycles were only for teachers.', 'The campus was too small for bicycles.'], optionsZh: ['学生对骑车毫无兴趣。', '学生不确定返程是否有车以及应在哪里停车。', '这些自行车只供教师使用。', '校园太小，不适合骑自行车。'], answer: 1, explanation: '调查发现，学生担心返程无车，也不清楚停车位置；这属于原因细节题。' },
      { prompt: 'What did the university do instead of buying more bicycles?', promptZh: '学校没有购买更多自行车，而是做了什么？', options: ['It improved information and daily management.', 'It closed several distant classrooms.', 'It made every student take a road test.', 'It charged students for every short ride.'], optionsZh: ['改进信息服务和日常管理。', '关闭几座较远的教学楼。', '要求每位学生参加道路考试。', '每次短途骑行都向学生收费。'], answer: 0, explanation: '第二段列举了应用实时信息、标记停车区和调配车辆等改进。' },
      { prompt: 'What unexpected benefit did the program produce?', promptZh: '该项目带来了什么意外好处？', options: ['It lowered the price of cars.', 'It reduced traffic near the main gate.', 'It encouraged students to live farther away.', 'It ended the need for bicycle repairs.'], optionsZh: ['降低了汽车价格。', '缓解了校门附近的交通。', '鼓励学生住得更远。', '不再需要维修自行车。'], answer: 1, explanation: '第三段说明短途汽车接送减少，因此校门附近交通得到缓解。' },
      { prompt: 'What problem still affects the program?', promptZh: '什么问题仍然影响该项目？', options: ['Too few students have phones.', 'Safety lessons take a full semester.', 'Repair costs are higher than expected.', 'Parking areas cannot be marked.'], optionsZh: ['有手机的学生太少。', '安全课程要用一整个学期。', '维修费用高于预期。', '停车区无法标记。'], answer: 2, explanation: '原文明确指出维修成本高于预测。' },
      { prompt: 'What is the main lesson of the passage?', promptZh: '文章的主要启示是什么？', options: ['A useful service needs both equipment and good operation.', 'Universities should prohibit cars completely.', 'Weather is the only cause of transport problems.', 'More bicycles always guarantee more riders.'], optionsZh: ['有用的服务既需要设备，也需要良好运转。', '大学应该彻底禁止汽车。', '天气是交通问题的唯一原因。', '自行车越多，骑行者一定越多。'], answer: 0, explanation: '末句概括全文：数量之外，信息和日常管理同样关键。' },
    ],
  },
  {
    level: '六级模拟',
    topic: '教育科技 · 人工智能反馈',
    title: 'When Instant Feedback Is Not Enough',
    titleZh: '当即时反馈还不够时',
    passage: `Digital writing tools can now identify grammatical errors within seconds and suggest more formal expressions. Such feedback is attractive to students because it arrives before a teacher could possibly read the work. Yet researchers who study writing instruction warn that speed should not be confused with learning.

In one university experiment, two groups revised essays with the help of the same automated system. The first group could accept each suggested correction with a single click. Members of the second group saw the location of a possible problem but had to explain the problem before changing the sentence. Both groups produced cleaner final drafts. When asked to edit a new passage a week later, however, the second group identified substantially more errors on its own.

The difference, the researchers argue, came from the mental effort required to interpret feedback. A correction may improve a document without changing the writer's knowledge. By contrast, deciding why a sentence is unclear can create a principle that the writer later applies elsewhere. This does not mean automated tools should withhold answers forever. Students can become frustrated if they receive only vague warnings. A productive system might first ask the learner to diagnose the issue, then provide a hint, and finally reveal a full explanation.

Teachers also remain important. Software is good at detecting repeated patterns, but it may misunderstand a deliberate stylistic choice or fail to notice that an argument lacks evidence. The most useful role of technology, therefore, may be to handle routine feedback while preserving classroom time for questions of reasoning, purpose, and audience.`,
    passageZh: `数字写作工具如今能在几秒内找出语法错误，并建议更正式的表达。学生喜欢这种反馈，因为它比教师批改来得快得多。然而，研究写作教学的学者提醒人们，不应把速度等同于学习。

在一项大学实验中，两组学生使用同一套自动系统修改作文。第一组可以一键接受每条修改建议；第二组只能看到可能存在问题的位置，必须先解释问题再修改句子。两组最终稿都更干净，但一周后编辑一篇新文章时，第二组独立找出的错误明显更多。

研究人员认为，差异来自理解反馈所需的思考。一项修改可能改善文稿，却不一定改变写作者的知识；相反，弄清句子为何不清楚，可能形成以后可迁移的原则。这并不意味着自动工具应永远隐藏答案。更有效的系统可以先让学习者诊断问题，再给提示，最后展示完整解释。

教师仍然重要。软件擅长发现重复模式，却可能误解有意的文体选择，也可能看不出论证缺少证据。因此，技术最有价值的作用，或许是处理常规反馈，把课堂时间留给推理、目的和读者意识等问题。`,
    questions: [
      { prompt: 'What warning do writing researchers give?', promptZh: '写作研究人员提出了什么警告？', options: ['Fast feedback does not necessarily produce learning.', 'Teachers should never use digital tools.', 'Formal expressions are usually incorrect.', 'Students prefer feedback that arrives slowly.'], optionsZh: ['快速反馈不一定会带来学习。', '教师绝不应使用数字工具。', '正式表达通常是错误的。', '学生更喜欢缓慢到来的反馈。'], answer: 0, explanation: '第一段的核心对比是反馈速度与真正学习并不等同。' },
      { prompt: 'Why did the second group perform better a week later?', promptZh: '为什么第二组一周后的表现更好？', options: ['They received more corrections.', 'They wrote a much shorter essay.', 'They had to interpret problems before revising.', 'They were taught by a different teacher.'], optionsZh: ['他们收到的修改更多。', '他们写的文章短得多。', '他们必须先理解问题再修改。', '他们由不同的教师授课。'], answer: 2, explanation: '第二组需要解释问题，这种额外认知投入促进了迁移。' },
      { prompt: 'What can happen when a correction is accepted immediately?', promptZh: '立即接受修改可能会发生什么？', options: ['The document improves but the writer learns little.', 'The writer always develops a new principle.', 'The software stops finding repeated patterns.', 'The argument automatically gains evidence.'], optionsZh: ['文稿改善了，但写作者学到很少。', '写作者一定会形成新原则。', '软件不再发现重复模式。', '论证会自动获得证据。'], answer: 0, explanation: '第三段指出，修改可以改善文件，却未必改变写作者的知识。' },
      { prompt: 'What sequence does the author recommend for automated help?', promptZh: '作者建议自动帮助采用什么顺序？', options: ['Full answer, warning, diagnosis', 'Diagnosis, hint, full explanation', 'Hint, new essay, teacher review', 'Teacher review, diagnosis, no answer'], optionsZh: ['完整答案、警告、诊断。', '诊断、提示、完整解释。', '提示、新作文、教师批改。', '教师批改、诊断、不提供答案。'], answer: 1, explanation: '原文给出的顺序是先诊断，再提示，最后完整解释。' },
      { prompt: 'What is software best used for according to the passage?', promptZh: '根据文章，软件最适合用来做什么？', options: ['Replacing every classroom discussion', 'Judging all stylistic choices', 'Handling routine feedback', 'Deciding the writer’s purpose'], optionsZh: ['取代所有课堂讨论。', '判断所有文体选择。', '处理常规反馈。', '决定写作者的目的。'], answer: 2, explanation: '结尾主张软件处理常规反馈，教师关注推理、目的和读者。' },
    ],
  },
  {
    level: '四级模拟',
    topic: '健康教育 · 睡眠与记忆',
    title: 'Why Students Should Stop Trading Sleep for Study',
    titleZh: '为什么学生不该用睡眠换学习时间',
    passage: `Before an important examination, many students extend their study time by going to bed later. The decision appears reasonable: an extra hour at a desk seems to mean an extra hour of learning. Sleep researchers, however, point out that the calculation ignores what the brain does after study ends.

During sleep, recently learned information is reorganized and connected with existing knowledge. This process does not guarantee that everything will be remembered, but it makes later recall more reliable. In a study of university students, those who followed a regular sleep schedule for a week performed better on a memory test than those who slept the same total number of hours at irregular times. The finding suggests that consistency matters as well as quantity.

Lack of sleep also influences attention. A tired student may read the same paragraph several times without noticing that little has been understood. Under such conditions, the additional study hour can be much less productive than expected. Researchers do not advise students to stop reviewing in the evening. Instead, they recommend setting a finishing time, testing oneself briefly, and leaving enough time for sleep. The goal is not to choose between study and rest, but to arrange them so that each supports the other.`,
    passageZh: `重要考试前，许多学生通过晚睡来延长学习时间。这个决定看似合理：在书桌前多坐一小时，似乎就多学一小时。然而，睡眠研究人员指出，这种计算忽略了学习结束后大脑仍在做的工作。

睡眠期间，新学信息会被重新组织，并与已有知识建立联系。这个过程不能保证记住一切，却能让之后的回忆更可靠。一项大学生研究发现，一周内保持规律作息的学生，在记忆测试中的表现优于睡眠总时长相同但时间不规律的学生。这说明除了睡眠量，一致性也很重要。

缺乏睡眠还会影响注意力。疲劳的学生可能把同一段读很多遍，却没发现自己几乎没有理解。此时额外的一小时学习效率可能远低于预期。研究人员并非建议停止晚间复习，而是建议设定结束时间、进行简短自测，并留出足够睡眠。目标不是在学习和休息之间二选一，而是让两者相互支持。`,
    questions: [
      { prompt: 'What does the simple “extra hour” calculation ignore?', promptZh: '“多学一小时”的简单计算忽略了什么？', options: ['The price of books', 'What the brain does during sleep', 'The length of the examination', 'How teachers write questions'], optionsZh: ['书的价格。', '大脑在睡眠期间所做的工作。', '考试的时长。', '教师如何命题。'], answer: 1, explanation: '首段末句指出，这种计算忽略了学习后大脑在睡眠中的加工。' },
      { prompt: 'What happens to recently learned information during sleep?', promptZh: '新学的信息在睡眠期间会怎样？', options: ['It is completely erased.', 'It is reorganized and connected.', 'It becomes unrelated to old knowledge.', 'It is tested by teachers.'], optionsZh: ['被完全清除。', '被重新组织并建立联系。', '与旧知识失去联系。', '由教师进行测试。'], answer: 1, explanation: '第二段首句直接给出信息整理和连接的过程。' },
      { prompt: 'What did the university study suggest?', promptZh: '这项大学生研究说明了什么？', options: ['Only total sleep time matters.', 'Regular timing can improve memory performance.', 'All students need exactly eight hours.', 'Morning study should be avoided.'], optionsZh: ['只有睡眠总时长重要。', '规律的时间安排能改善记忆表现。', '所有学生都必须恰好睡八小时。', '应避免早晨学习。'], answer: 1, explanation: '睡眠总量相同的情况下，规律组表现更好。' },
      { prompt: 'How may tiredness affect reading?', promptZh: '疲劳可能如何影响阅读？', options: ['It guarantees deeper understanding.', 'It makes every paragraph shorter.', 'It causes repeated reading with little understanding.', 'It improves attention immediately.'], optionsZh: ['保证理解更深入。', '让每段文字变短。', '导致反复阅读却理解很少。', '立即提升注意力。'], answer: 2, explanation: '原文描述疲劳学生反复读同一段却几乎没理解。' },
      { prompt: 'What is the author’s final recommendation?', promptZh: '作者最后的建议是什么？', options: ['Replace study with sleep.', 'Study through the entire night.', 'Arrange study and rest to support each other.', 'Review only on examination day.'], optionsZh: ['用睡眠完全代替学习。', '整夜学习。', '安排好学习与休息，使其相互支持。', '只在考试当天复习。'], answer: 2, explanation: '末句是全文主旨：合理安排，而非在学习与休息之间二选一。' },
    ],
  },
  {
    level: '六级模拟',
    topic: '公共服务 · 图书馆的社会价值',
    title: 'Libraries as Social Infrastructure',
    titleZh: '作为社会基础设施的图书馆',
    passage: `Public libraries are often evaluated by counting books, visitors, or computer sessions. These measures are useful, but they may overlook a less visible function: libraries create low-cost spaces in which people who would otherwise remain apart can share a public environment.

Sociologists sometimes describe such places as social infrastructure. The term refers not to relationships themselves but to the physical conditions that make repeated contact possible. A parent attending a reading group may exchange practical advice with another parent. An older resident using a computer may gradually learn the names of staff members and regular visitors. None of these encounters is dramatic, yet over time they can produce familiarity and a modest sense of trust.

This perspective changes how library success might be judged. A quiet room that is rarely full may still be valuable if it serves job seekers who cannot work at home. A children's activity may matter not only because it improves literacy but also because it connects families to local services. Such benefits are difficult to capture in a single attendance figure.

Critics correctly note that libraries cannot solve poverty, loneliness, or unequal access to technology on their own. Describing them as social infrastructure should not become an excuse for reducing other public services. The argument is instead that physical spaces influence the opportunities people have to meet, seek help, and participate in community life. If policy makers consider only the number of items borrowed, they may underestimate what disappears when a local branch closes.`,
    passageZh: `公共图书馆常通过藏书量、访客数或电脑使用次数来评估。这些指标有用，却可能忽视一个不太显眼的功能：图书馆创造了低成本的公共空间，让原本彼此分离的人共享同一环境。

社会学家有时把这类场所称为“社会基础设施”。这个词不是指关系本身，而是指让人们能够反复接触的物理条件。参加阅读小组的家长可能与另一位家长交流实用建议；使用电脑的老年居民可能逐渐记住工作人员和常客的名字。这些相遇并不惊人，却能随时间形成熟悉感和一定程度的信任。

这一视角改变了判断图书馆成功的方式。一个很少坐满的安静房间，如果为无法在家工作的求职者服务，仍然很有价值。儿童活动的意义不仅在于提高读写能力，也在于把家庭与本地服务连接起来。这些益处很难用单一到访数字表示。

批评者正确地指出，图书馆无法独自解决贫困、孤独或技术获取不平等等问题。把它称为社会基础设施，不应成为削减其他公共服务的借口。真正的观点是：物理空间会影响人们见面、求助和参与社区生活的机会。如果政策制定者只看借阅数量，就可能低估地方分馆关闭时失去的东西。`,
    questions: [
      { prompt: 'What function of libraries may traditional measures overlook?', promptZh: '传统指标可能忽视图书馆的什么功能？', options: ['Selling books cheaply', 'Providing shared public space', 'Replacing all social services', 'Teaching every visitor to code'], optionsZh: ['低价售书。', '提供共享公共空间。', '取代所有社会服务。', '教每位访客编程。'], answer: 1, explanation: '第一段指出，常规数字可能忽视图书馆提供共享公共环境的作用。' },
      { prompt: 'What does “social infrastructure” refer to here?', promptZh: '文中的“社会基础设施”指什么？', options: ['Close friendships', 'Online social networks', 'Physical conditions enabling repeated contact', 'Government employment programs'], optionsZh: ['亲密友谊。', '线上社交网络。', '使反复接触成为可能的物理条件。', '政府就业项目。'], answer: 2, explanation: '第二段直接定义了该术语。' },
      { prompt: 'Why may a quiet room be valuable even when it is not full?', promptZh: '安静房间即使没有坐满，为什么仍有价值？', options: ['It can serve people unable to work at home.', 'It makes attendance figures larger.', 'It removes the need for staff.', 'It guarantees employment.'], optionsZh: ['它能服务无法在家工作的人。', '它能让到访数字更大。', '它让工作人员不再必要。', '它保证人们获得就业。'], answer: 0, explanation: '第三段以求职者为例说明使用率不能完全代表价值。' },
      { prompt: 'What concern do critics raise?', promptZh: '批评者提出了什么担忧？', options: ['Libraries contain too many books.', 'The concept could justify cuts to other services.', 'Children dislike library activities.', 'Visitors meet too frequently.'], optionsZh: ['图书馆藏书太多。', '这一概念可能被用来为削减其他服务辩护。', '儿童不喜欢图书馆活动。', '访客见面太频繁。'], answer: 1, explanation: '第四段提醒，不能以图书馆的社会作用为借口削减其他服务。' },
      { prompt: 'What does the author mainly argue?', promptZh: '作者主要论证什么？', options: ['Borrowing numbers capture every benefit.', 'Local branches should become private businesses.', 'Physical public spaces create opportunities that statistics may miss.', 'Libraries can solve inequality by themselves.'], optionsZh: ['借阅数量能反映所有益处。', '地方分馆应变成私营企业。', '公共实体空间创造的机会可能被统计数字遗漏。', '图书馆能独自解决不平等。'], answer: 2, explanation: '全文强调仅凭传统数字会低估公共空间创造的社会机会。' },
    ],
  },
  {
    level: '四级模拟',
    topic: '校园管理 · 减少食物浪费',
    title: 'A Smaller Plate, Less Food Waste',
    titleZh: '小一点的餐盘，少一点的浪费',
    passage: `A college dining hall noticed that large amounts of food were being thrown away at the end of every lunch period. Managers first assumed that students disliked the meals, but interviews suggested a different explanation. Many students took more food than they could finish because the serving spoons and plates were unusually large.

The dining hall tested several small changes. It replaced some plates with slightly smaller ones and placed signs reminding students that they could return for a second serving without paying extra. Staff members also moved popular dishes closer to the end of the line, after students had already chosen vegetables and rice. During the six-week trial, food waste fell by nearly twenty percent, while the number of complaints did not increase.

The managers were careful not to claim that plate size was the only cause. Some dishes still produced more waste than others, and students sometimes hurried away to attend class. The dining hall therefore began publishing a weekly menu survey and adjusted the amount cooked according to expected demand. The experiment showed that reducing waste does not always require asking people to make a major sacrifice. Small changes in how choices are presented can make responsible behavior easier.`,
    passageZh: `一所大学食堂发现，每次午餐结束后都有大量食物被丢弃。管理人员起初以为学生不喜欢饭菜，但访谈给出了不同解释：由于餐盘和公勺特别大，许多学生拿的食物超过了自己能吃完的量。

食堂测试了几项小改动：把部分餐盘换成稍小的，并张贴提示，告诉学生可以免费再取一份；工作人员还把受欢迎的菜放到取餐队伍后端，让学生先选择蔬菜和米饭。六周试验中，食物浪费下降近20%，投诉数量没有增加。

管理人员没有声称餐盘大小是唯一原因。有些菜仍比其他菜更容易被浪费，学生有时也会赶着去上课。于是，食堂开始发布每周菜单调查，并根据预期需求调整烹饪量。实验表明，减少浪费不一定要人们作出巨大牺牲；改变选择呈现方式的小措施，也能让负责任的行为更容易。`,
    questions: [
      { prompt: 'What did interviews reveal about food waste?', promptZh: '访谈揭示了食物浪费的什么原因？', options: ['All meals tasted bad.', 'Large plates encouraged students to take too much.', 'Students were required to take every dish.', 'Lunch periods were too long.'], optionsZh: ['所有饭菜都不好吃。', '大餐盘促使学生拿得过多。', '学生被要求拿每一道菜。', '午餐时间太长。'], answer: 1, explanation: '访谈发现，餐盘和公勺过大导致学生取餐过量。' },
      { prompt: 'Why did signs mention free second servings?', promptZh: '提示牌为什么提到可以免费再取一份？', options: ['To encourage smaller first servings', 'To increase the price of lunch', 'To advertise a new restaurant', 'To make students leave earlier'], optionsZh: ['鼓励第一次少取一些。', '提高午餐价格。', '为新餐厅做广告。', '让学生更早离开。'], answer: 0, explanation: '可以免费再取，能减少学生第一次拿过量的担忧。' },
      { prompt: 'What happened during the trial?', promptZh: '试验期间发生了什么？', options: ['Complaints doubled.', 'Waste fell without more complaints.', 'Students stopped eating vegetables.', 'The dining hall served no popular dishes.'], optionsZh: ['投诉翻倍。', '浪费下降且投诉没有增加。', '学生不再吃蔬菜。', '食堂不再供应受欢迎的菜。'], answer: 1, explanation: '原文给出近20%的下降，投诉并未增加。' },
      { prompt: 'Why did the dining hall add a weekly survey?', promptZh: '食堂为什么增加每周调查？', options: ['To estimate demand more accurately', 'To identify students by name', 'To remove all serving spoons', 'To shorten every class'], optionsZh: ['更准确地估计需求。', '按姓名识别学生。', '移除所有公勺。', '缩短每一节课。'], answer: 0, explanation: '调查用于根据预期需求调整烹饪量。' },
      { prompt: 'What broader point does the experiment illustrate?', promptZh: '该实验说明了什么更普遍的观点？', options: ['Responsible behavior always requires sacrifice.', 'Small design changes can make better choices easier.', 'Students should avoid dining halls.', 'Food waste has only one cause.'], optionsZh: ['负责任的行为总要作出牺牲。', '小的设计改变能让更好的选择变得容易。', '学生应避免去食堂。', '食物浪费只有一个原因。'], answer: 1, explanation: '最后两句将具体试验上升为“选择设计”带来的行为变化。' },
    ],
  },
  {
    level: '六级模拟',
    topic: '职场研究 · 远程工作的弱联系',
    title: 'What Remote Work Does to Weak Ties',
    titleZh: '远程工作如何影响弱联系',
    passage: `Debates about remote work often focus on productivity: whether employees complete more tasks at home or in an office. A growing body of research suggests that another question deserves attention—what happens to the weak ties that connect people beyond their immediate teams.

Weak ties are relationships with colleagues whom one does not know well but encounters occasionally. A short conversation in a corridor may reveal that another department is solving a similar problem. Such exchanges rarely appear on a schedule, yet they can spread information across an organization. Close teammates usually continue to communicate online because their work requires it. Contact with more distant colleagues, however, tends to decline when encounters must be deliberately arranged.

Some companies have responded by scheduling virtual social events. These can help newcomers learn names, but mandatory informal meetings sometimes feel artificial and add to screen fatigue. Researchers therefore recommend creating opportunities around a genuine shared task: an optional problem-solving session, a cross-team demonstration, or a brief in-person day devoted to exchanging work in progress. The purpose is not to reproduce every office conversation but to maintain enough unexpected contact for information to travel.

The evidence does not imply that everyone should return to the office full-time. Remote work may expand employment opportunities for people who live far away or need flexible schedules. The challenge is to recognize that efficiency within a team and connection across teams are different outcomes. An arrangement that protects one may quietly weaken the other unless both are measured and deliberately supported.`,
    passageZh: `关于远程工作的争论常集中在生产率上：员工在家还是在办公室完成更多任务。越来越多的研究认为，另一个问题也值得关注——把人们与直接团队之外同事联系起来的“弱联系”发生了什么。

弱联系指与不太熟悉、但偶尔会遇到的同事之间的关系。走廊中的简短交谈可能让人发现另一个部门正在解决类似问题。这类交流很少出现在日程表上，却能让信息跨部门传播。亲密团队成员通常会因为工作需要继续在线沟通，但当见面必须刻意安排时，与较远同事的接触往往减少。

一些公司安排线上社交活动来应对。它们能帮助新人认识同事，但强制性的非正式会议有时显得做作，也增加屏幕疲劳。因此，研究人员建议围绕真实的共同任务创造机会，例如自愿参加的问题解决会、跨团队演示，或用来交流工作进展的短期线下日。目标不是复制每一次办公室交谈，而是保留足够的意外接触，让信息能够流动。

这些证据并不意味着所有人都应全职回办公室。远程工作可以扩大偏远地区居民或需要弹性安排者的就业机会。真正的挑战是认识到，团队内部效率和团队之间的连接是不同结果。如果不同时衡量并主动支持，一种安排在保护前者时可能悄然削弱后者。`,
    questions: [
      { prompt: 'What issue does the passage add to the remote-work debate?', promptZh: '文章为远程工作争论补充了什么问题？', options: ['Office rent only', 'The fate of weak ties', 'The price of computers', 'Employees’ clothing choices'], optionsZh: ['仅仅是办公室租金。', '弱联系的变化。', '电脑的价格。', '员工的着装选择。'], answer: 1, explanation: '第一段明确提出应关注远程工作对弱联系的影响。' },
      { prompt: 'Why are weak ties useful?', promptZh: '弱联系为什么有用？', options: ['They eliminate scheduled work.', 'They spread information across groups.', 'They replace close teammates.', 'They prevent every disagreement.'], optionsZh: ['它们消除计划内工作。', '它们让信息跨群体传播。', '它们取代亲密队友。', '它们避免所有分歧。'], answer: 1, explanation: '走廊交流的例子说明弱联系能让信息跨组织传播。' },
      { prompt: 'Why may mandatory virtual social events be ineffective?', promptZh: '为什么强制线上社交活动可能效果不好？', options: ['They are always too short.', 'They can feel artificial and tiring.', 'Newcomers already know everyone.', 'They contain too many real tasks.'], optionsZh: ['它们总是太短。', '它们可能显得做作且令人疲劳。', '新人已经认识所有人。', '它们包含太多真实任务。'], answer: 1, explanation: '第三段提到做作感与屏幕疲劳。' },
      { prompt: 'What kind of contact do researchers recommend?', promptZh: '研究人员建议什么样的接触？', options: ['Contact built around shared work', 'Daily compulsory entertainment', 'No contact outside a team', 'Only written annual reports'], optionsZh: ['围绕共同工作建立的接触。', '每天强制娱乐。', '团队之外完全不接触。', '只使用年度书面报告。'], answer: 0, explanation: '建议围绕真实共同任务创造跨团队机会。' },
      { prompt: 'What is the author’s main conclusion?', promptZh: '作者的主要结论是什么？', options: ['Remote work is always more efficient.', 'Everyone must return full-time.', 'Team efficiency and cross-team connection both need support.', 'Weak ties matter more than all close relationships.'], optionsZh: ['远程工作总是效率更高。', '所有人都必须全职返岗。', '团队效率和跨团队联系都需要支持。', '弱联系比所有亲密关系都重要。'], answer: 2, explanation: '结尾强调两类结果不同，必须同时衡量并有意识地支持。' },
    ],
  },
];

export const GRAMMAR_ZH = [
  '定期复习对长期记忆至关重要。', '这门课程由六个学习单元组成。', '学生应避免立即查询每一个生词。', '研究人员收集的证据支持该结论。',
  '你越主动回忆信息，记得就越久。', '这种方法使学习者能够在语境中理解单词。', '关闭通知的学生通常能更好地集中注意力。', '短暂休息能防止精神疲劳变得严重。',
  '计时器和手机都不是真正的问题。', '到她参加考试时，她已经复习这些单词好几遍了。', '每项任务都有明确目的很重要。', '阅读和听力都能促进词汇增长。',
  '学习者最需要的是持续练习。', '这个词反复出现，这表明它很重要。', '把文章读了两遍后，她开始回答问题。', '有充分证据表明睡眠有助于记忆。',
];

export const LONG_SENTENCE_SUPPORT = [
  { main: 'learners often find that convenience alone does not lead to significant progress', translation: '尽管网络课程让学生容易获取信息，但缺乏明确计划的学习者常常发现，仅有便利并不能带来显著进步。', keywords: ['尽管', '缺乏明确计划', '便利', '显著进步'], tip: '先让步状语从句，后主句；who从句紧跟“学习者”。' },
  { main: 'The evidence suggests that short breaks can help people maintain concentration', translation: '研究人员收集的证据表明，有意识地短暂休息能帮助人们保持注意力，而不会减少总学习时间。', keywords: ['证据表明', '短暂休息', '保持注意力', '不会减少'], tip: 'collected by researchers是后置定语，when used deliberately是插入成分。' },
  { main: 'What makes this approach effective is not the timer itself but the habit', translation: '让这种方法有效的不是计时器本身，而是在每段学习开始前明确任务的习惯。', keywords: ['有效', '不是', '计时器', '而是', '习惯'], tip: '保留not A but B结构；What从句整体作主语。' },
  { main: 'Students often find it difficult to understand speakers', translation: '只通过课本接触英语的学生，常觉得很难听懂日常对话中使用弱读形式的人。', keywords: ['只通过课本', '很难听懂', '日常对话', '弱读形式'], tip: 'exposed...修饰students；using...修饰speakers。' },
  { main: 'successful listeners focus on identifying key information and following the speaker’s main idea', translation: '成功的听者不会试图记住每个细节，而是专注于识别关键信息并跟上说话者的主要思路。', keywords: ['不会试图', '每个细节', '专注于', '关键信息', '主要思路'], tip: 'Instead of后接动名词；identifying与following并列。' },
  { main: 'Information is usually retained longer than information', translation: '主动从记忆中提取的信息，通常比仅仅重读的信息保持得更久。', keywords: ['主动', '从记忆中提取', '比', '重读', '更久'], tip: '两个that定语从句形成清晰对比，主干是比较结构。' },
  { main: 'they may have forgotten so much of the material that returning to it becomes almost as demanding as learning it for the first time', translation: '当学习者意识到自己一直在被动复习时，可能已忘掉大量内容，重新学习几乎和第一次一样费力。', keywords: ['意识到', '被动复习', '忘掉大量内容', '几乎', '一样费力'], tip: '注意so much...that结果结构与as...as比较结构。' },
  { main: 'The quality of note-taking depends less on the tool than on the mental activity', translation: '笔记质量与其说取决于所用工具，不如说取决于筛选和组织信息时进行的思考。', keywords: ['笔记质量', '与其说', '工具', '不如说', '思考'], tip: 'less on A than on B可译为“与其说取决于A，不如说取决于B”。' },
  { main: 'Learners are more likely to discover weaknesses', translation: '经常自测的学习者更可能发现那些在被动重读中仍会被隐藏的弱点。', keywords: ['经常自测', '更可能', '发现', '被动重读', '弱点'], tip: 'who与that引导两个不同的定语从句。' },
  { main: 'a brief change of activity may be more beneficial than forcing themselves to continue', translation: '如果学生已无法解释刚读过的内容，短暂换一种活动可能比强迫自己继续更有益。', keywords: ['如果', '无法解释', '短暂换一种活动', '比', '更有益'], tip: 'what从句作explain的宾语；than后用动名词短语。' },
  { main: 'One reason is that they expose learners to English frequently', translation: '短时日常学习有效的一个原因是，它让学习者频繁接触英语而不会造成过度疲劳。', keywords: ['一个原因', '频繁接触英语', '不会造成', '过度疲劳'], tip: 'why修饰reason，that引导表语从句说明具体原因。' },
  { main: 'A strategy may fail to benefit another', translation: '对一名学习者快速见效的策略，可能无法帮助背景和日常安排不同的另一名学习者。', keywords: ['策略', '快速见效', '可能无法', '背景', '日常安排'], tip: 'that修饰strategy；whose说明another的背景和日常安排。' },
];

export const TRANSLATION_SUPPORT = [
  { keywords: ['regular self-testing', 'not only', 'assess', 'but also', 'long-term memory'], tip: '用not only...but also...连接两个并列谓语。' },
  { keywords: ['consult a dictionary', 'whenever', 'find it difficult', 'focus on', 'main idea'], tip: 'find it difficult to do中的it是形式宾语。' },
  { keywords: ['be exposed to', 'natural speed', 'effective way', 'improve listening'], tip: '“接触”可用be exposed to；way后常接to do。' },
  { keywords: ['phone notifications', 'distract', 'from', 'important tasks'], tip: 'distract somebody from something表示“使某人从……分心”。' },
  { keywords: ['consists of', 'six units', 'each of which', 'focuses on'], tip: 'each of which引导非限制性定语从句，谓语用单数。' },
  { keywords: ['establishing a habit', 'daily review', 'crucial to', 'improving'], tip: 'crucial to中的to是介词，后接动名词。' },
  { keywords: ['context', 'infer', 'meanings', 'unfamiliar words', 'not appropriate', 'all circumstances'], tip: '注意but连接转折；under all circumstances表示“在所有情况下”。' },
  { keywords: ['making significant progress', 'requires', 'time', 'patience', 'consistent practice'], tip: '动名词短语作主语时，谓语通常用单数。' },
  { keywords: ['effective note-taking', 'not', 'passive record', 'but', 'process', 'selecting and organizing'], tip: '使用not A but B，并保持A、B语法结构平行。' },
  { keywords: ['learners', 'should not abandon', 'simply because', 'fail to understand', 'the first time'], tip: 'fail to do表示“未能做”；不要漏译“仅仅因为”。' },
  { keywords: ['short breaks', 'help us maintain concentration', 'during', 'long study session'], tip: 'help somebody do与help somebody to do均可。' },
  { keywords: ['which tool', 'most suitable', 'depends on', 'task', 'individual circumstances'], tip: 'Which tool is most suitable是主语从句，整体视作单数。' },
];

export const LISTENING_SUPPORT = [
  { level: '四级模拟', titleZh: '专注学习与短暂休息', tip: '常考提醒：开头提出误区，yet之后给出作者观点；数字25或30分钟可能成为细节考点。', passageZh: '许多学生认为学习时间越长，结果自然越好。然而，一次学习的质量往往比时长更重要。长时间不休息时，注意力会逐渐不稳定。一个实际方法是把学习时间分成专注时段，每个时段只完成明确任务。约二十五或三十分钟后短暂休息。站起来、喝水或看看窗外，通常比刷社交媒体更能恢复精力。计时学习应被当作灵活工具，而不是严格规则。', dictationZh: ['一次学习的质量往往比它的时长更重要。', '他们的注意力逐渐变得不稳定。', '学习者完成一项明确界定的任务。', '站起来和喝水可以让人恢复精神。', '学生应把计时器当作灵活的工具。'] },
  { level: '四级模拟', titleZh: '安静手机一小时', tip: '常考提醒：注意转折however；组织者“没有做什么”和“建议做什么”容易构成干扰项。', passageZh: '一所大学图书馆推出了“安静手机一小时”活动。参与学生关闭手机，并把手机放进小储物柜。最初十分钟，一些学生略感焦虑；但随着时间推移，这种感觉减弱。活动结束时，许多人表示完成的工作比预想更多。组织者并不打算禁用手机，因为智能手机能提供词典和课程材料；他们只是鼓励学生设置一些关闭无关通知的短时段。', dictationZh: ['学生关闭手机，并把手机放进小储物柜。', '一些学生起初略感焦虑。', '许多参与者完成的工作比预期更多。', '智能手机提供有用的词典和课程材料。', '应关闭不必要的通知。'] },
  { level: '六级模拟', titleZh: '为什么熟悉的单词在语流中消失', tip: '常考提醒：重点听原因链——连读、弱读；first与after提示答题步骤顺序。', passageZh: '许多英语学习者看到一个词时认识它，却在录音中听不出同一个词。自然语流中，单词并不总是被读成独立单位。前一个词的末音可能与下一个词的首音相连。to、of、and等功能词通常比重要实词读得更弱。第一遍听时，应关注大意和重读词；尝试听一两遍后，再对照文本并模仿几个有用句子。', dictationZh: ['单词并不总是被读成独立单位。', '末尾的音可能与下一个词相连。', '功能词通常读得更弱。', '学习者应关注重读的实词。', '他们可以把录音与文本进行对照。'] },
  { level: '四级模拟', titleZh: '睡眠与记忆', tip: '常考提醒：even though引出让步信息；区分“熟悉感”与“准确回忆”。', passageZh: '睡眠并不只是学习停止的一段时间。睡眠时，大脑仍会整理新获得的信息。学生若减少睡眠以换取额外学习时间，虽然在书桌前坐得更久，却可能记得更少。规律作息在考试前尤其有用。临时突击有时会增加熟悉感，但充足睡眠有助于第二天保持注意力、准确回忆并作出更好决定。', dictationZh: ['大脑继续整理新近获得的信息。', '学生减少睡眠时可能记得更少。', '规律的作息在考试前很有用。', '临时突击可以增加熟悉感。', '充足睡眠有助于准确回忆。'] },
  { level: '六级模拟', titleZh: '如何做有用的笔记', tip: '常考提醒：作者反对“工具决定论”；but之后往往是观点重点。', passageZh: '有效记笔记需要筛选。学习者必须判断哪些观点是核心，以及不同观点如何连接。打字可能有用，但有时会促使学生不处理含义就逐字记录。手写较慢，可能促进概括。工具本身不是最重要的因素。写简短摘要并提出问题的学生，可能比制作完整文本却不理解的人学得更多。笔记在二十四小时内复习会更有价值。', dictationZh: ['有效记笔记需要仔细筛选。', '学习者判断哪些观点是核心。', '打字有时会促使学生逐字记录。', '工具本身不是最重要的因素。', '笔记应在二十四小时内复习。'] },
  { level: '六级模拟', titleZh: '有策略地使用词典', tip: '常考提醒：先听一般规则，再听such as后的例外；essential与precise是关键词。', passageZh: '词典是有价值的工具，但查询每个生词会损害阅读流畅度。每次查词都会打断句间联系，并增加工作记忆负担。有策略的读者先判断一个词是否关键。如果主旨仍然清楚，就标记它并继续。读完后，再选择几个有用的词查询并记录。说明或科学定义等需要精确理解的材料，仍有必要立即查词。', dictationZh: ['查询每个生词会损害阅读流畅度。', '每次查词都会打断句子之间的联系。', '有策略的读者判断一个词是否关键。', '他们标记这个词并继续阅读。', '精确材料可能需要立即查询。'] },
];

export const LISTENING_QUESTION_ZH = [
  [
    { promptZh: '人们不休息地学习时可能发生什么？', optionsZh: ['注意力变得不稳定。', '记忆变得完美。', '任务消失。', '阅读速度翻倍。'] },
    { promptZh: '在每个专注时段，学习者应该做什么？', optionsZh: ['查看消息。', '完成一项明确任务。', '同时学习几门科目。', '避免使用任何计时器。'] },
    { promptZh: '建议采用哪种休息方式？', optionsZh: ['看视频。', '刷社交媒体。', '站起来并喝水。', '开始另一项困难任务。'] },
  ],
  [
    { promptZh: '参与的学生如何处理手机？', optionsZh: ['卖掉手机。', '把手机放进储物柜。', '用手机玩游戏。', '把手机交给教师。'] },
    { promptZh: '一些学生起初感觉如何？', optionsZh: ['焦虑。', '生气。', '自信。', '兴奋。'] },
    { promptZh: '组织者最后提出了什么建议？', optionsZh: ['禁止手机。', '在短时段内关闭无关通知。', '购买新手机。', '只进行线上学习。'] },
  ],
  [
    { promptZh: '为什么熟悉的单词可能难以辨认？', optionsZh: ['它们总是新词。', '语流中存在连读和弱读。', '说话者不使用语法。', '录音没有语境。'] },
    { promptZh: '学习者第一遍应该关注什么？', optionsZh: ['每一个音。', '主题和重读词。', '文本。', '词典释义。'] },
    { promptZh: '应该在什么时候使用文本？', optionsZh: ['听之前。', '尝试听一两遍之后。', '只能下周。', '永远不用。'] },
  ],
  [
    { promptZh: '大脑在睡眠期间做什么？', optionsZh: ['完全停止活动。', '整理近期信息。', '忘掉所有细节。', '避免作决定。'] },
    { promptZh: '学生减少睡眠时可能发生什么？', optionsZh: ['一定记得更多。', '可能记得更少。', '不再需要复习。', '阅读速度翻倍。'] },
    { promptZh: '充足睡眠有助于什么？', optionsZh: ['只有熟悉感。', '专注和准确回忆。', '更多通知。', '被动重读。'] },
  ],
  [
    { promptZh: '有效记笔记需要什么？', optionsZh: ['记录一切。', '筛选并建立联系。', '昂贵设备。', '不复习。'] },
    { promptZh: '打字可能促使学生做什么？', optionsZh: ['概括每个观点。', '不处理含义就记录。', '大声说话。', '回避细节。'] },
    { promptZh: '应该什么时候复习笔记？', optionsZh: ['二十四小时内。', '一年后。', '只在毕业前。', '永远不复习。'] },
  ],
  [
    { promptZh: '频繁使用词典会损害什么？', optionsZh: ['阅读流畅度。', '书本质量。', '只会损耗手机电量。', '字母表。'] },
    { promptZh: '如果主旨清楚，读者应该怎么做？', optionsZh: ['立即停止。', '标记该词并继续。', '翻译每个句子。', '删除该段。'] },
    { promptZh: '什么时候可能需要立即查词？', optionsZh: ['需要精确理解时。', '单词很长时。', '只能在夜间。', '永远不需要。'] },
  ],
];

// 四六级常考主题原创模拟材料：保留真题常见结构与话题，但不冒充历年原题。
export const CET_LONG_SENTENCES = [
  { level: '四级常考', topic: '教育 · 在线学习', text: 'Although online courses make high-quality resources available to more students, those who lack self-discipline may find it difficult to turn easy access into steady progress.', main: 'those may find it difficult to turn easy access into steady progress', translation: '尽管网络课程让更多学生能够获得优质资源，但缺乏自律的学生可能会发现，很难把便利的获取途径转化为稳定的进步。', keywords: ['尽管', '优质资源', '缺乏自律', '转化为', '稳定的进步'], structure: 'Although引导让步状语从句；主句主语是those；who从句修饰those。', grammar: ['make + 宾语 + 形容词：使……处于某种状态', 'find it difficult to do：发现做某事很困难', 'turn A into B：把A转化为B'], examTip: '先找主句those may find，再处理although和who两个从句。' },
  { level: '六级常考', topic: '环境 · 行为激励', text: 'Policies that encourage consumers to reduce waste are most effective when environmentally responsible choices are not only affordable but also easy to identify.', main: 'Policies are most effective', translation: '鼓励消费者减少浪费的政策，在环保选择不仅价格可承受而且容易识别时最为有效。', keywords: ['政策', '鼓励消费者', '减少浪费', '不仅', '而且', '最为有效'], structure: '主干是Policies are most effective；that修饰policies；when引导条件/时间状语从句。', grammar: ['encourage somebody to do', 'not only A but also B', 'environmentally responsible是副词修饰形容词'], examTip: '六级常把主干夹在定语从句与状语从句之间，先划出Policies...are。' },
  { level: '四级常考', topic: '健康 · 睡眠', text: 'Students who regularly sacrifice sleep for extra study time may remember less than they expect because tiredness reduces both attention and the brain’s ability to organize new information.', main: 'Students may remember less than they expect', translation: '经常牺牲睡眠来增加学习时间的学生，可能记住的内容比预期更少，因为疲劳既会降低注意力，也会削弱大脑组织新信息的能力。', keywords: ['牺牲睡眠', '学习时间', '比预期更少', '疲劳', '注意力', '组织新信息'], structure: 'who定语从句修饰students；because引导原因状语从句；than后接比较从句。', grammar: ['sacrifice A for B：为B牺牲A', 'less than：少于', 'both A and B：A和B两者都'], examTip: '听读时重点识别because后的原因链，这是四六级常见细节题位置。' },
  { level: '六级常考', topic: '科技 · 人工智能', text: 'What concerns many educators is not that artificial intelligence can produce an answer quickly, but that students may accept the answer without examining the reasoning on which it is based.', main: 'What concerns many educators is not A but B', translation: '许多教育工作者担心的，不是人工智能能迅速给出答案，而是学生可能在不审视答案所依据的推理过程时就接受它。', keywords: ['教育工作者', '担心', '不是', '而是', '审视', '推理过程'], structure: 'What从句整体作主语；not that A, but that B构成两个并列表语从句；on which修饰reasoning。', grammar: ['what引导主语从句', 'not A but B：不是A而是B', '介词+which引导定语从句'], examTip: '不要把第一个that误判为全文重点，真正观点通常在but后的第二个that从句。' },
  { level: '四级常考', topic: '城市 · 公共交通', text: 'By making buses more reliable and providing passengers with accurate arrival information, cities can persuade more residents to leave their cars at home.', main: 'cities can persuade more residents to leave their cars at home', translation: '通过提高公交车的可靠性并为乘客提供准确的到站信息，城市可以说服更多居民把汽车留在家中。', keywords: ['通过', '公交车', '可靠性', '乘客', '到站信息', '说服'], structure: 'By doing作方式状语；making与providing并列；主句为cities can persuade...。', grammar: ['by doing：通过做某事', 'provide somebody with something', 'persuade somebody to do'], examTip: '句首By不是主语，真正主语在逗号后的cities。' },
  { level: '六级常考', topic: '文化 · 遗产保护', text: 'The survival of a cultural tradition depends less on whether it is displayed in a museum than on whether younger generations are willing to use it in their daily lives.', main: 'The survival depends less on A than on B', translation: '一种文化传统能否延续，与其说取决于它是否在博物馆展出，不如说取决于年轻一代是否愿意在日常生活中使用它。', keywords: ['文化传统', '延续', '与其说', '博物馆', '不如说', '年轻一代'], structure: '主干是The survival depends；两个whether从句分别作介词on的宾语。', grammar: ['depend on：取决于', 'less on A than on B：与其说取决于A，不如说取决于B', 'be willing to do'], examTip: '翻译时不要机械译less，把完整比较结构处理成“与其说……不如说……”。' },
  { level: '四级常考', topic: '社会 · 志愿服务', text: 'Young people who take part in community service often discover that helping others also enables them to develop practical skills that cannot be learned from textbooks alone.', main: 'Young people often discover that helping others enables them to develop practical skills', translation: '参加社区服务的年轻人常常发现，帮助他人也能使自己培养仅靠课本无法学到的实践技能。', keywords: ['社区服务', '年轻人', '帮助他人', '培养', '实践技能', '课本'], structure: 'who修饰young people；第一个that引导宾语从句；第二个that修饰skills。', grammar: ['take part in', 'enable somebody to do', 'learn from'], examTip: '同一句出现两个that时，根据前面的动词或名词判断其作用。' },
  { level: '六级常考', topic: '社会 · 数字鸿沟', text: 'As public services move online, people without reliable internet access risk being excluded from opportunities that others have begun to regard as basic rights.', main: 'people risk being excluded from opportunities', translation: '随着公共服务转移到线上，无法稳定上网的人可能被排除在一些机会之外，而其他人已经开始把这些机会视为基本权利。', keywords: ['随着', '公共服务', '稳定上网', '被排除', '机会', '基本权利'], structure: 'As引导伴随/时间状语；without短语修饰people；that定语从句修饰opportunities。', grammar: ['risk doing：冒……风险', 'be excluded from', 'regard A as B'], examTip: 'As在此译“随着”，不是“因为”；注意being excluded是被动动名词。' },
  { level: '四级常考', topic: '校园 · 食物浪费', text: 'A dining hall can reduce food waste not simply by asking students to take less, but by changing the way in which portions and choices are presented.', main: 'A dining hall can reduce food waste', translation: '食堂减少食物浪费，不能只靠要求学生少拿一些，而应改变食物分量和选项的呈现方式。', keywords: ['食堂', '减少食物浪费', '不能只靠', '学生', '分量', '呈现方式'], structure: '主句为A dining hall can reduce；not simply by A, but by B说明两种方式；in which修饰the way。', grammar: ['not simply A but B', 'ask somebody to do', 'the way in which...'], examTip: 'not...but...结构要保持前后平行，本句两边都是by doing。' },
  { level: '六级常考', topic: '科学 · 公众信任', text: 'Trust in science is strengthened not when uncertainty is hidden from the public, but when researchers explain what is known, what remains unclear, and why conclusions may change.', main: 'Trust in science is strengthened not when A but when B', translation: '科学公信力并不是在不确定性被隐瞒时得到增强，而是在研究人员解释哪些已经明确、哪些仍不清楚以及结论为何可能改变时得到增强。', keywords: ['科学公信力', '不确定性', '隐瞒', '研究人员', '仍不清楚', '结论'], structure: '主句是被动结构Trust...is strengthened；两个when从句形成对比；三个宾语从句并列。', grammar: ['被动语态be strengthened', 'not when A but when B', 'what/why引导宾语从句'], examTip: '并列的what、what、why都作explain的宾语，翻译时保持并列层次。' },
  { level: '四级常考', topic: '就业 · 实习', text: 'An internship is valuable only if students are given meaningful tasks and receive feedback that helps them connect classroom knowledge with workplace problems.', main: 'An internship is valuable', translation: '只有当学生获得有意义的任务，并收到能帮助他们把课堂知识与职场问题联系起来的反馈时，实习才有价值。', keywords: ['只有当', '学生', '有意义的任务', '反馈', '课堂知识', '职场问题'], structure: '主句是An internship is valuable；if引导条件状语；that修饰feedback。', grammar: ['only if：只有在……条件下', 'be given被动语态', 'connect A with B'], examTip: 'only if宜译成“只有……才……”，把“才”放进主句。' },
  { level: '六级常考', topic: '职场 · 远程工作', text: 'Although remote work may improve efficiency within a team, it can weaken the informal connections through which useful information travels across departments.', main: 'it can weaken the informal connections', translation: '尽管远程办公可能提高团队内部的效率，但它也可能削弱有用信息在部门之间传播所依赖的非正式联系。', keywords: ['尽管', '远程办公', '团队内部', '效率', '削弱', '部门之间'], structure: 'Although引导让步从句；主句为it can weaken；through which修饰connections。', grammar: ['although不与but同时使用', 'through which=通过这些联系', 'travel在此表示“传播”'], examTip: '介词through提前时，which仍指代connections，翻译时可转成“所依赖的联系”。' },
  { level: '四级常考', topic: '公共服务 · 图书馆', text: 'Libraries remain important because they provide not only books and computers but also a safe public space where people can study, seek help, and meet others.', main: 'Libraries remain important because they provide A and B', translation: '图书馆仍然重要，因为它们不仅提供书籍和电脑，还提供一个安全的公共空间，人们可以在那里学习、寻求帮助并与他人交流。', keywords: ['图书馆', '仍然重要', '不仅', '还', '公共空间', '寻求帮助'], structure: 'because引导原因状语从句；not only...but also连接两个宾语；where修饰space。', grammar: ['remain + 形容词', 'not only A but also B', 'where引导定语从句'], examTip: 'where可译成“在那里”，避免把后面三个动词误接到libraries上。' },
  { level: '六级常考', topic: '环境 · 气候适应', text: 'Cities that invest in trees and shaded public spaces are not merely improving their appearance; they are also protecting residents whose health is threatened by increasingly frequent heat waves.', main: 'Cities are not merely improving their appearance; they are also protecting residents', translation: '投资建设树木和遮阴公共空间的城市，不只是在改善市容，也是在保护那些健康受到日益频繁热浪威胁的居民。', keywords: ['城市', '树木', '遮阴公共空间', '不只', '保护居民', '热浪'], structure: 'that修饰cities；分号连接两个完整分句；whose修饰residents。', grammar: ['not merely A; also B', 'invest in', 'whose表示所属关系'], examTip: '分号前后都是主句，not merely与also形成跨分句呼应。' },
  { level: '四级常考', topic: '旅游 · 文化遗产', text: 'Tourism can support historic towns when visitors are encouraged to respect local customs and when part of the income is used to preserve old buildings.', main: 'Tourism can support historic towns', translation: '如果游客受到鼓励去尊重当地习俗，并且部分收入被用于保护古建筑，旅游业就能支持历史城镇的发展。', keywords: ['旅游业', '历史城镇', '游客', '当地习俗', '部分收入', '保护古建筑'], structure: '主句是Tourism can support；两个when从句并列，说明成立条件。', grammar: ['encourage somebody to do的被动形式', 'be used to do：被用来做', 'part of + 名词作主语'], examTip: '两个when并列，翻译时可统一处理成“如果……并且……”。' },
];

export const CET_TRANSLATIONS = [
  { level: '四级常考', topic: '传统文化 · 造纸术', source: '造纸术是中国古代的重要发明之一，它促进了知识的保存和传播。', answer: 'Papermaking is one of the important inventions of ancient China, and it promoted the preservation and spread of knowledge.', keywords: ['papermaking', 'one of', 'inventions', 'ancient China', 'preservation', 'spread of knowledge'], chunks: ['造纸术：papermaking', '中国古代的重要发明之一：one of the important inventions of ancient China', '知识的保存和传播：the preservation and spread of knowledge'], grammar: 'one of后接可数名词复数；and连接两个完整分句。', alternative: '...helped preserve and spread knowledge.' },
  { level: '六级常考', topic: '传统文化 · 茶', source: '茶在中国不仅是一种饮品，也承载着丰富的文化内涵，并成为人们交流感情的一种方式。', answer: 'In China, tea is not only a drink but also carries rich cultural meaning and has become a way for people to strengthen social bonds.', keywords: ['not only', 'drink', 'but also', 'cultural meaning', 'a way', 'social bonds'], chunks: ['不仅……也……：not only...but also...', '承载文化内涵：carry cultural meaning', '交流感情：strengthen social bonds'], grammar: 'not only与but also连接并列成分；a way for somebody to do表示“某人做某事的方式”。', alternative: 'Tea is more than a beverage in China; it is also culturally significant.' },
  { level: '四级常考', topic: '现代中国 · 高铁', source: '高速铁路缩短了城市之间的旅行时间，使人们出行更加方便。', answer: 'High-speed rail has shortened travel time between cities, making it more convenient for people to travel.', keywords: ['high-speed rail', 'shortened', 'travel time', 'between cities', 'making', 'convenient'], chunks: ['高速铁路：high-speed rail', '缩短旅行时间：shorten travel time', '使……更加方便：make it more convenient for...'], grammar: '现在完成时强调已产生的影响；making是结果状语。', alternative: '...and has made travel more convenient.' },
  { level: '六级常考', topic: '科技生活 · 移动支付', source: '随着移动支付的普及，人们无需携带现金就能完成许多日常交易，但也应重视个人信息安全。', answer: 'With the growing popularity of mobile payment, people can complete many daily transactions without carrying cash, but they should also attach importance to the security of personal information.', keywords: ['popularity', 'mobile payment', 'daily transactions', 'without carrying cash', 'attach importance to', 'personal information'], chunks: ['随着……普及：with the growing popularity of', '日常交易：daily transactions', '重视：attach importance to'], grammar: 'without是介词，后接动名词；but连接便利与风险两方面。', alternative: 'As mobile payment becomes widespread, ...' },
  { level: '四级常考', topic: '城市发展 · 公共交通', source: '完善公共交通不仅能缓解交通拥堵，还有助于减少空气污染。', answer: 'Improving public transportation can not only ease traffic congestion but also help reduce air pollution.', keywords: ['improving', 'public transportation', 'not only', 'traffic congestion', 'but also', 'air pollution'], chunks: ['完善公共交通：improve public transportation', '缓解拥堵：ease traffic congestion', '减少空气污染：reduce air pollution'], grammar: '动名词短语作主语；not only...but also连接两个谓语部分。', alternative: 'Better public transport can ease congestion and reduce air pollution.' },
  { level: '六级常考', topic: '教育 · 终身学习', source: '在知识快速更新的时代，终身学习使人们能够适应职业变化，并不断提高解决问题的能力。', answer: 'In an age when knowledge is rapidly updated, lifelong learning enables people to adapt to career changes and continuously improve their problem-solving ability.', keywords: ['in an age', 'knowledge', 'lifelong learning', 'enables', 'adapt to', 'problem-solving ability'], chunks: ['知识快速更新的时代：an age when knowledge is rapidly updated', '适应职业变化：adapt to career changes', '解决问题的能力：problem-solving ability'], grammar: 'when引导定语从句修饰age；enable somebody to do。', alternative: '...allows people to adjust to changes in their careers...' },
  { level: '四级常考', topic: '环境 · 可再生能源', source: '越来越多的城市正在使用可再生能源，以减少对化石燃料的依赖。', answer: 'More and more cities are using renewable energy in order to reduce their dependence on fossil fuels.', keywords: ['more and more cities', 'renewable energy', 'in order to', 'reduce', 'dependence on', 'fossil fuels'], chunks: ['越来越多：more and more', '可再生能源：renewable energy', '对……的依赖：dependence on'], grammar: 'in order to引出目的；dependence on是名词搭配。', alternative: '...so as to rely less on fossil fuels.' },
  { level: '六级常考', topic: '传统节日 · 春节', source: '春节期间，无论人们身在何处，许多家庭都会设法团聚，共同庆祝新年的到来。', answer: 'During the Spring Festival, many families make every effort to reunite and celebrate the arrival of the new year together, no matter where they are.', keywords: ['during the Spring Festival', 'make every effort', 'reunite', 'celebrate', 'arrival', 'no matter where'], chunks: ['春节期间：during the Spring Festival', '设法/尽力：make every effort to', '无论身在何处：no matter where they are'], grammar: 'no matter where引导让步状语从句；effort后接to do。', alternative: 'Wherever they are, many families try to get together...' },
  { level: '四级常考', topic: '社会 · 志愿服务', source: '大学生参加志愿服务可以了解社会需求，同时培养沟通能力和责任感。', answer: 'By participating in volunteer service, college students can learn about social needs while developing communication skills and a sense of responsibility.', keywords: ['participating in', 'volunteer service', 'social needs', 'while', 'communication skills', 'responsibility'], chunks: ['参加志愿服务：participate in volunteer service', '社会需求：social needs', '责任感：a sense of responsibility'], grammar: 'By doing表示方式；while doing表示同时发生。', alternative: 'College students can understand social needs and develop...' },
  { level: '六级常考', topic: '社会发展 · 乡村振兴', source: '改善农村地区的教育和医疗服务，对于吸引人才、促进当地长期发展至关重要。', answer: 'Improving education and medical services in rural areas is crucial to attracting talent and promoting long-term local development.', keywords: ['improving', 'medical services', 'rural areas', 'crucial to', 'attracting talent', 'long-term'], chunks: ['农村地区：rural areas', '对于……至关重要：be crucial to', '吸引人才：attract talent'], grammar: '动名词短语作主语，谓语用is；crucial to中的to是介词。', alternative: 'It is essential to improve rural education and healthcare...' },
  { level: '四级常考', topic: '文化传播 · 数字博物馆', source: '数字技术使人们足不出户就能参观博物馆，并了解珍贵文物背后的故事。', answer: 'Digital technology enables people to visit museums without leaving home and learn about the stories behind valuable cultural relics.', keywords: ['digital technology', 'enables', 'visit museums', 'without leaving home', 'stories behind', 'cultural relics'], chunks: ['足不出户：without leaving home', '文物：cultural relics', '背后的故事：the stories behind'], grammar: 'enable somebody to do；visit与learn并列，共用to。', alternative: '...makes it possible for people to visit museums from home...' },
  { level: '六级常考', topic: '健康 · 生活方式', source: '规律锻炼并不意味着每天进行高强度训练，关键是选择合适的活动并长期坚持。', answer: 'Regular exercise does not mean doing high-intensity training every day; the key is to choose suitable activities and stick to them over time.', keywords: ['regular exercise', 'does not mean', 'high-intensity', 'the key', 'suitable activities', 'stick to'], chunks: ['高强度训练：high-intensity training', '关键是：the key is to', '长期坚持：stick to it over time'], grammar: 'mean doing表示“意味着做”；分号连接语义紧密的两个完整句。', alternative: '...what matters is choosing appropriate activities and continuing them.' },
  { level: '四级常考', topic: '环保 · 食物浪费', source: '减少食物浪费需要消费者、餐馆和政府共同努力，而不是依靠任何一方单独行动。', answer: 'Reducing food waste requires joint efforts from consumers, restaurants and the government rather than action by any one group alone.', keywords: ['reducing food waste', 'requires', 'joint efforts', 'consumers', 'government', 'rather than'], chunks: ['共同努力：joint efforts', '而不是：rather than', '任何一方单独行动：action by any one group alone'], grammar: '动名词作主语；rather than连接对比成分。', alternative: 'Consumers, restaurants and the government must work together...' },
  { level: '六级常考', topic: '文化 · 汉字', source: '汉字不仅记录语言，也反映了中国人观察世界和表达思想的独特方式。', answer: 'Chinese characters not only record the language but also reflect the distinctive ways in which Chinese people observe the world and express ideas.', keywords: ['Chinese characters', 'not only', 'record', 'but also', 'distinctive ways', 'observe the world'], chunks: ['汉字：Chinese characters', '独特方式：distinctive ways', '观察世界：observe the world'], grammar: 'not only...but also连接两个谓语；in which修饰ways。', alternative: '...reflect how Chinese people view the world and express their thoughts.' },
];

export const DAY_PRESETS: Record<string, {
  newWords: string[];
  reviewWords: string[];
  readingIndex: number;
  listeningIndex: number;
}> = {
  '2026-08-22': {
    newWords: ['accomplish', 'adapt', 'adequate', 'advocate', 'alternative', 'approach', 'assess', 'assume', 'benefit', 'challenge', 'concentrate', 'consequence', 'contribute', 'crucial', 'decline', 'demonstrate', 'efficient', 'establish', 'evidence', 'factor', 'indicate', 'maintain', 'obtain', 'participate', 'potential', 'require', 'significant', 'strategy', 'tend', 'various'],
    reviewWords: [],
    readingIndex: 0,
    listeningIndex: 0,
  },
  '2026-08-23': {
    newWords: ['achieve', 'acquire', 'affect', 'available', 'capacity', 'circumstance', 'complex', 'consist', 'consume', 'context', 'determine', 'distract', 'enhance', 'essential', 'evaluate', 'expose', 'function', 'involve', 'issue', 'method', 'occur', 'respond', 'retain', 'source', 'specific'],
    reviewWords: ['accomplish', 'adapt', 'assess', 'assume', 'contribute', 'crucial', 'efficient', 'establish', 'maintain', 'significant'],
    readingIndex: 2,
    listeningIndex: 1,
  },
  '2026-08-24': {
    newWords: ['abandon', 'access', 'account', 'appropriate', 'arise', 'attempt', 'attitude', 'aware', 'barrier', 'conduct', 'demand', 'effective', 'emerge', 'enable', 'encounter', 'environment', 'exceed', 'expand', 'focus', 'impact'],
    reviewWords: ['assess', 'contribute', 'crucial', 'establish', 'maintain', 'acquire', 'context', 'distract', 'essential', 'retain'],
    readingIndex: 1,
    listeningIndex: 2,
  },
};
