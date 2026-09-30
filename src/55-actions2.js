/* ================= prompts ================= */
const PJ='Верни только JSON, без пояснений. Пиши по-русски.';
function normalizeCv(o){o=o&&typeof o==='object'?o:{};const s=v=>v==null?'':String(v),arr=v=>Array.isArray(v)?v:[];
 return {name:s(o.name),title:s(o.title),city:s(o.city),email:s(o.email),phone:s(o.phone),tg:s(o.tg),about:s(o.about),
  exp:arr(o.exp).map(e=>({role:s(e&&e.role),org:s(e&&e.org),period:s(e&&e.period),bullets:arr(e&&e.bullets).map(s)})),
  projects:arr(o.projects).map(e=>({title:s(e&&e.title),org:s(e&&e.org),period:s(e&&e.period),company:!!(e&&e.company),bullets:arr(e&&e.bullets).map(s)})),
  edu:arr(o.edu).map(e=>({org:s(e&&e.org),prog:s(e&&e.prog),period:s(e&&e.period)})),skills:Array.isArray(o.skills)?o.skills.join(', '):s(o.skills),extra:s(o.extra)}}
const cvPrompt=(c,job)=>`Ты — опытный IT-рекрутер и карьерный консультант. Проанализируй резюме студента под вакансию и дай конкретные советы.
${NOFAKE}
Вакансия: ${job.title}, ${job.company}. Требуемые навыки: ${job.skills.join(', ')}.
Навыки студента, подтверждённые на платформе ${BRAND} проектами, тестами и менторами: ${confAll().map(s=>s.name).join(', ')}.
Резюме:
"""
${cvPlain(c)}
"""
${PJ} Формат: {"score": 0-100, "summary": "2 предложения", "categories": [{"name":"Структура","score":0-100},{"name":"Результаты в цифрах","score":0-100},{"name":"Соответствие вакансии","score":0-100},{"name":"Доказательства навыков","score":0-100},{"name":"Стиль","score":0-100}], "issues": [{"severity":"high|mid|low","title":"коротко","detail":"почему и что сделать","before":"ТОЧНАЯ цитата одной строки из резюме или пустая строка","after":"улучшенная версия этой строки или пустая строка"}], "keywords": {"present":["навыки вакансии, которые есть в резюме"],"missing":["которых нет"]}}. Не больше 7 issues, важные первыми. В "after" не добавляй навыки, которых у студента нет.`;
const tailorPrompt=(c,job)=>`Адаптируй резюме студента под вакансию «${job.title}» в ${job.company} (команда: ${job.team||'—'}; навыки: ${job.skills.join(', ')}). ${NOFAKE}
Меняй только формулировки и акценты: заголовок, «О себе», порядок навыков, формулировки пунктов. Не добавляй навыки и опыт, которых нет.
Резюме:
"""
${cvPlain(c)}
"""
${PJ} Формат: {"title":"...","about":"новый текст «О себе» до 60 слов","skills":["навыки в новом порядке — только из резюме"],"rewrites":[{"before":"ТОЧНАЯ строка из резюме","after":"новая формулировка"}],"changes":["что изменено, 3–5 пунктов"]}`;
const enPrompt=c=>`Переведи резюме на английский язык для международной IT-компании. Сохрани все цифры и факты, плейсхолдеры [число] переводи как [number]. Даты — в формате Sep 2025 — present. Используй глаголы в прошедшем времени (Built, Led, Reduced). Верни только JSON с теми же ключами и структурой, что у входного объекта (skills — строка через запятую).
${JSON.stringify(c)}`;
const hhPrompt=t=>`Разбери текст резюме на поля. ${NOFAKE} Пустые поля оставляй пустыми.
"""
${t.slice(0,6000)}
"""
${PJ} Формат: {"name":"","title":"желаемая должность","city":"","email":"","phone":"","tg":"","about":"","exp":[{"role":"","org":"","period":"","bullets":[""]}],"projects":[],"edu":[{"org":"","prog":"","period":""}],"skills":"через запятую","extra":""}`;
const ivGenPrompt=(job,type)=>`Ты — интервьюер в ${job.company}. Составь 5 вопросов для собеседования на позицию «${job.title}» (команда ${job.team||'—'}), тип интервью: ${IV_TYPES.find(t=>t[0]===type)[1].toLowerCase()}. Навыки вакансии: ${job.skills.join(', ')}. Уровень — стажёр без опыта работы.
Профиль кандидата:
${profileCtx()}
${PJ} Формат: [{"q":"вопрос","what":"что проверяет вопрос, 3–6 слов","kw":["3–5 ключевых слов в нижнем регистре, которые ожидаешь в хорошем ответе"],"model":"план сильного ответа, 1–2 предложения"}]`;
const ivEvalPrompt=(job,q,a)=>`Ты — интервьюер в ${job.company} на позицию «${job.title}». Оцени ответ стажёра строго, но доброжелательно.
Вопрос: ${q.q}
${q.what?'Что проверяем: '+q.what:''}
Ответ кандидата: """${a.slice(0,3000)}"""
Факты о кандидате (можно использовать в улучшенном ответе, другие факты не выдумывай):
${profileCtx()}
${PJ} Формат: {"score":1-10,"good":["что получилось, до 3 пунктов"],"improve":["что усилить, до 3 конкретных пунктов"],"better":"как ответить сильнее: 3–5 предложений от первого лица, только на фактах кандидата"}`;
const decPrompt=(job,text)=>`Расшифруй вакансию для студента: что компания на самом деле хочет и как подготовиться. Не выдумывай фактов о компании.
${job?`Вакансия: ${job.title}, ${job.company}, команда ${job.team||'—'}, ${job.city}, ${job.format}, оплата ${job.salary}. Навыки: ${job.skills.join(', ')}.`:`Текст вакансии:\n"""\n${text.slice(0,6000)}\n"""`}
Профиль студента:
${profileCtx()}
${PJ} Формат: {"summary":"суть в 2 предложениях","must":["обязательное"],"nice":["будет плюсом"],"hidden":["скрытые ожидания"],"redflags":["на что обратить внимание, может быть пустым"],"questions":["5 вероятных вопросов на интервью"],"prep":["3–5 шагов подготовки для ЭТОГО студента с учётом его пробелов"]}`;
const starPrompt=src=>{const f=STAR_LOCAL[src],p=P(src);return `Составь историю для собеседования по схеме STAR от первого лица на основе фактов ниже. ${NOFAKE}
Факты: ${p?`${p.title} для ${p.company}. Задача: ${p.task} Результаты: ${p.metrics.map(m=>m[0]+' '+m[1]).join(', ')}. Отзыв: ${p.review}`:''} ${f.s} ${f.t} ${f.a} ${f.r}
${PJ} Формат: {"title":"название истории, до 8 слов","s":"ситуация","t":"задача","a":"действия","r":"результат с цифрами","questions":["3 вопроса интервью, на которые подходит история"]}`};
const pitchPrompt=t=>`Оцени сценарий 60-секундной видеовизитки студента для работодателей. Хорошая визитка: кто я и кем хочу работать, одно доказательство с цифрой, подтверждённые навыки, призыв к действию; 110–150 слов.
Сценарий: """${t.slice(0,2000)}"""
Факты о студенте (другие не выдумывай):
${profileCtx()}
${PJ} Формат: {"score":1-10,"strengths":["до 3"],"improve":["до 3 конкретных совета"],"improved":"улучшенный сценарий 110–150 слов от первого лица"}`;
const LET_NAMES={cover:'сопроводительное письмо к отклику',after:'благодарственное письмо после интервью',followup:'вежливое письмо-напоминание, если на отклик нет ответа 7+ дней',offer:'ответ на оффер с уточняющими вопросами до согласия'};
const letPrompt=(type,job,notes)=>`Напиши ${LET_NAMES[type]} от имени студента на позицию «${job.title}» в ${job.company} (команда ${job.team||'—'}). До 150 слов, по-русски, без канцелярита и клише. Одно доказательство с цифрой. Ссылка на Skill Passport: ${DOMAIN}/@a.ivanov. ${NOFAKE} Всё, чего нет в данных (детали интервью, даты), оставь плейсхолдером в квадратных скобках.
${notes?'Студент просит добавить: '+notes:''}
Данные студента:
${profileCtx()}
Верни только текст письма.`;
const offPrompt=()=>`Помоги студенту выбрать предложение о стажировке. Приоритеты студента (вес 1–5): ${CRIT.map(([k,n])=>n+' — '+weights()[k]).join(', ')}.
Предложения (оценки 1–10 поставил сам студент): ${offers().map(o=>`${o.co}, ${o.title}, ${rub(o.sal)}, ${o.fmt}: ${CRIT.map(([k,n])=>n+' '+o.sc[k]).join(', ')}; итог ${offTotal(o)}`).join(' | ')}.
Цель студента: ${T().goal}. Дай рекомендацию до 150 слов: что выбрать и почему, какой риск у выбора и 2 вопроса, которые стоит задать компании до ответа. Без выдуманных фактов о компаниях.`;
function offLocal(){const os=[...offers()].sort((a,b)=>offTotal(b)-offTotal(a)),w=weights(),top=[...CRIT].sort((a,b)=>w[b[0]]-w[a[0]]).slice(0,2);
 return `**Рекомендация: ${os[0].co} — ${os[0].title}** (итог ${offTotal(os[0])} против ${offTotal(os[1])} у ${os[1].co}).\nДля вас важнее всего «${top[0][1].toLowerCase()}» и «${top[1][1].toLowerCase()}», и по ним ${os[0].co} сильнее.\n\n**Риск:** ${os[0].sal<os[1].sal?`оплата ниже на ${rub(os[1].sal-os[0].sal)} в месяц.`:'проверьте нагрузку и совместимость с учёбой.'}\n\n**Спросите до ответа:**\n- Кто будет наставником и как часто встречи один на один?\n- Какие задачи будут в первые 3 месяца и как оценят результат стажировки?`}
const recPrompt=pid=>{const p=P(pid),mm=mentorOf(pid),rv=UI.rv[pid];return `Напиши рекомендательное письмо от имени ментора ${mm.name} (${mm.pos}) для студента Алексея Иванова. Ментор проверял решение проекта «${p.short}» для ${p.company}. Оценки по критериям: ${p.criteria.map((c,i)=>c+' — '+((rv&&rv.stars[i])||p.rubric[i])+'/5').join(', ')}. Отзыв: ${(rv&&rv.comment)||p.review} Результаты: ${p.metrics.map(m=>m[0]+' '+m[1]).join(', ')}. До 120 слов, конкретно, без клише, по-русски, подпись в конце. Верни только текст письма.`};

/* ================= dashboard card ================= */
function readyCard(){const a=analyzeCv(cv(),cvTargetJob()),L=appsList(),late=L.filter(x=>x.st==='sent'&&x.d>=7);
 return `<section class="card col g12"><h2>Готовность к отклику</h2>
  <div class="row g12" style="flex-wrap:nowrap">${ring(a.score,56)}<div class="grow"><div class="b sm">Резюме · ${a.score} из 100</div><div class="xs muted">${a.issues.filter(i=>i.sev==='high').length} важных советов</div></div><button class="btn btn-s btn-sm" data-go="resume">Улучшить</button></div>
  <div class="row between sm"><span class="muted">Тренировок интервью</span><b>${(S.interviews||[]).length}</b></div>
  <div class="row between sm"><span class="muted">Активных откликов</span><b>${L.filter(x=>x.st!=='rejected').length}</b></div>
  ${late.length?`<button class="kb-note" data-act="appFollow" data-id="${late[0].job}">${ic('clock',12)}${late.length} ${plural(late.length,'отклик','отклика','откликов')} без ответа неделю — написать фоллоу-ап</button>`:''}
  <button class="btn btn-g btn-sm" data-go="interview" style="align-self:flex-start">${ic('msg')}Потренировать интервью</button></section>`}

/* ================= actions ================= */
Object.assign(A,{
 stopTask(e){const st=UI.tasks[e.dataset.id];if(st&&st.ctl)st.ctl.abort()},
 cvLeft(e){UI.cvLeft=e.dataset.id;render()},
 cvTpl(e){S.cvTpl=e.dataset.id;save();render()},
 cvApply(e){const [src,i]=e.dataset.id.split(':'),c=cv();
  if(src==='ai'){const d=task('cvAI').data,x=d&&d.issues&&d.issues[+i];if(!x)return;applyFix(c,{t:'replace',before:String(x.before||'').trim(),text:String(x.after||'')});d.issues.splice(+i,1)}
  else{const f=analyzeCv(c,cvTargetJob()).issues[+i];if(!f||!f.fix)return;applyFix(c,f.fix)}
  save();render();toast('Совет применён')},
 cvCopyAfter(e){const x=aiCvData().issues[+e.dataset.id];copyText(x.after,'Формулировка скопирована')},
 cvFixAll(){const c=cv();let n=0;for(let k=0;k<30;k++){const f=analyzeCv(c,cvTargetJob()).issues.find(x=>x.fix);if(!f)break;applyFix(c,f.fix);n++}save();UI.cvLeft='tips';UI.tasks.cvAI={status:'idle'};render();toast(n?`Применено советов: ${n}. Заполните пропуски в квадратных скобках`:'Все автоматические советы уже применены','wand')},
 cvAI(){if(!aiOn()){UI.cvLeft='tips';render();toast('Подробные советы — во вкладке «Советы». Глубокий AI-разбор работает в опубликованной версии','bolt');return}
  UI.cvLeft='tips';runTask('cvAI',{json:true,prompt:cvPrompt(cv(),cvTargetJob()),fallback:()=>null,onDone:st=>{if(st.source==='local'){UI.tasks.cvAI={status:'idle'};toast('ИИ недоступен в этом просмотре — показаны советы встроенного анализа','bolt')}}})},
 cvLocal(){UI.tasks.cvAI={status:'idle'};render()},
 cvDownload(){saveFile(`${cv().name.replace(/\s+/g,'_')}_резюме.html`,cvDocHtml(cv(),S.cvTpl||'modern','ru'))},
 cvCopyAll(){copyText(cvPlain(cv()),'Текст резюме скопирован')},
 cvAdd(e){const k=e.dataset.id;cv()[k].push(k==='exp'?{role:'',org:'',period:'',bullets:['']}:{title:'',org:'',period:'',bullets:['']});UI.cvLeft='edit';save();render()},
 cvDel(e){const [k,i]=e.dataset.id.split(':');cv()[k].splice(+i,1);save();render()},
 cvImport(){applyFix(cv(),{t:'import'});save();render();toast('Проекты добавлены из портфолио','download')},
 cvSkills(){applyFix(cv(),{t:'skills'});save();render();toast('Навыки взяты из Skill Passport','shield')},
 cvReset(){S.cv=CV_SEED();save();UI.tasks.cvAI={status:'idle'};render();toast('Исходное резюме восстановлено','refresh')},
 cvTailor(){const job=jobById($('#ver-job').value),base=cv();UI.verJob=job.id;
  runTask('cvTailor',{json:true,prompt:tailorPrompt(base,job),fallback:()=>({local:1}),onDone:st=>{let v,changes,src=st.source;const d=st.data;
   if(src==='ai'&&d&&!d.local){v=clone(base);if(d.title)v.title=String(d.title);if(d.about)v.about=String(d.about);if(d.skills)v.skills=Array.isArray(d.skills)?d.skills.join(', '):String(d.skills);(Array.isArray(d.rewrites)?d.rewrites:[]).forEach(r=>applyFix(v,{t:'replace',before:String(r.before||'').trim(),text:String(r.after||'')}));changes=(Array.isArray(d.changes)?d.changes:[]).map(String).slice(0,6)}
   else{v=tailorLocal(base,job);src='local';changes=[`Заголовок: «${job.title}»`,'Навыки из вакансии перенесены в начало списка','Проекты отсортированы по релевантности вакансии',`В «О себе» добавлена мотивация к ${job.company}`]}
   const id='v'+Date.now();S.cvVersions=[{id,job:job.id,cv:v,changes,src,date:todayStr()},...(S.cvVersions||[])];UI.verOpen=id;save()}})},
 verOpen(e){UI.verOpen=e.dataset.id;render()},
 verDel(e){S.cvVersions=S.cvVersions.filter(v=>v.id!==e.dataset.id);UI.verOpen=null;save();render()},
 verApply(e){const v=S.cvVersions.find(x=>x.id===e.dataset.id);S.cv=clone(v.cv);S.cvTarget=v.job;UI.tasks.cvAI={status:'idle'};save();go('resume','build');toast('Версия стала основным резюме')},
 verDownload(e){const v=S.cvVersions.find(x=>x.id===e.dataset.id);saveFile(`Иванов_резюме_${jobById(v.job).company.replace(/\s+/g,'_')}.html`,cvDocHtml(v.cv,S.cvTpl||'modern','ru'))},
 cvEnAI(){if(!aiOn()){UI.tasks.cvEn={status:'idle'};render();toast('Перевод обновлён встроенным словарём','globe');return}runTask('cvEn',{json:true,prompt:enPrompt(cv()),fallback:()=>enLocal(cv()).cv,onDone:st=>{st.data=normalizeCv(st.data);if(!st.data.name)st.data.name='Alexey Ivanov'}})},
 cvEnDownload(){const st=task('cvEn');const en=st.status==='done'&&st.source==='ai'&&st.data&&st.data.name?st.data:enLocal(cv()).cv;saveFile('Ivanov_CV.html',cvDocHtml(en,S.cvTpl||'modern','en'))},
 hhSample(){UI.hhText=HH_SAMPLE;render()},
 hhParse(){const t=($('#hh-in').value||'').trim();UI.hhText=t;if(t.length<30){toast('Вставьте текст резюме целиком','x');return}UI.hhParsed=null;runTask('hhParse',{json:true,prompt:hhPrompt(t),fallback:()=>parseHH(t),onDone:st=>{UI.hhParsed=normalizeCv(st.data)}})},
 hhUse(e){const p=clone(UI.hhParsed),base=cv();['name','email','phone','tg','city'].forEach(k=>{if(!p[k])p[k]=base[k]});
  if(e.dataset.id==='replace'){if(!p.edu.length)p.edu=base.edu;S.cv=p}else{base.exp=[...base.exp,...p.exp];base.skills=[base.skills,p.skills].filter(Boolean).join(', ')}
  UI.hhParsed=null;UI.tasks.hhParse={status:'idle'};UI.tasks.cvAI={status:'idle'};save();go('resume','build');toast('Резюме обновлено — посмотрите советы','upload')},
 hhCopy(e){copyText(hhFields()[+e.dataset.id]||'','Поле скопировано — вставьте его на hh.ru')},
 hrOrder(e){S.hrReview={who:e.dataset.id,st:'pending'};S.acted=true;save();render();toast('Заявка на проверку отправлена','send')},
 hrDone(){S.hrReview.st='done';save();render()},
 peerSend(){const c=$('#peer-comment').value.trim();if(c.length<10){toast('Напишите хотя бы один конкретный совет','x');return}S.peerDone=(S.peerDone||0)+1;S.acted=true;save();render();toast('Отзыв отправлен · +50 XP','star')},
 /* interview */
 ivType(e){UI.iv.type=e.dataset.id;render()},
 ivStart(){const iv=UI.iv;iv.job=$('#iv-job').value;const job=jobById(iv.job),bank=bankFor(iv.type,job.track||S.goal);
  runTask('ivGen',{json:true,prompt:ivGenPrompt(job,iv.type),fallback:()=>bank,onDone:st=>{let qs=Array.isArray(st.data)?st.data:(st.data&&st.data.questions)||bank;qs=qs.filter(x=>x&&x.q).slice(0,5).map(x=>({q:String(x.q),what:String(x.what||''),kw:Array.isArray(x.kw)?x.kw.map(k=>String(k).toLowerCase()):[],model:String(x.model||'')}));if(qs.length<3)qs=bank;Object.assign(iv,{qs,i:0,answers:[],evals:[],phase:'q'});UI.tasks.ivEval={status:'idle'}}})},
 ivEval(){const iv=UI.iv,a=$('#iv-ans').value.trim();if(a.split(/\s+/).filter(Boolean).length<5){toast('Напишите ответ хотя бы в пару предложений','x');return}iv.answers[iv.i]=a;const q=iv.qs[iv.i],job=jobById(iv.job);
  runTask('ivEval',{json:true,prompt:ivEvalPrompt(job,q,a),fallback:()=>evalLocal(q,a),onDone:st=>{const d=st.data||{};iv.evals[iv.i]={score:Math.max(1,Math.min(10,Math.round(Number(d.score)||1))),good:(d.good||d.strengths||[]).map(String),improve:(d.improve||[]).map(String),better:String(d.better||q.model||'')};S.acted=true}})},
 ivRetry(){UI.iv.evals[UI.iv.i]=null;UI.tasks.ivEval={status:'idle'};render()},
 ivNext(){const iv=UI.iv;UI.tasks.ivEval={status:'idle'};if(iv.i<iv.qs.length-1){iv.i++;render();return}A.ivFinish()},
 ivFinish(){const iv=UI.iv;const ev=iv.evals.filter(Boolean);if(!ev.length){UI.iv={phase:'setup',job:iv.job,type:iv.type};render();return}iv.qs=iv.qs.slice(0,iv.evals.length).filter((_,i)=>iv.evals[i]);iv.evals=ev;iv.phase='done';const avg=Math.round(ev.reduce((s,e)=>s+e.score,0)/ev.length*10)/10,job=jobById(iv.job);S.interviews=[...(S.interviews||[]),{title:`${job.title} · ${job.company}`,type:IV_TYPES.find(t=>t[0]===iv.type)[1],avg,date:todayStr()}];save();render()},
 ivQuit(){A.ivFinish()},
 ivAgain(){UI.iv={phase:'setup',job:UI.iv.job,type:UI.iv.type};UI.tasks.ivGen={status:'idle'};render()},
 ivHint(){const q=UI.iv.qs[UI.iv.i];openModal(mh('Подсказка к ответу',esc(q.q))+`<div class="modal-b col g12">${q.what?`<p class="t2"><b>Что проверяют:</b> ${esc(q.what)}</p>`:''}<div class="star">${[['S','Ситуация','Где и когда это было — одно предложение'],['T','Задача','Что нужно было сделать и почему это важно'],['A','Действия','Что сделали лично вы — глаголы в первом лице'],['R','Результат','Цифра или конкретный итог и вывод']].map(x=>`<div class="st-r"><span class="st-l">${x[0]}</span><div><div class="b sm">${x[1]}</div><div class="xs muted">${x[2]}</div></div></div>`).join('')}</div>${q.kw&&q.kw.length?`<p class="sm t2">Хорошо бы упомянуть: ${q.kw.map(esc).join(', ')}</p>`:''}${(S.stories||[]).length?`<p class="sm">Подойдёт история из банка: <b>${esc(S.stories[0].title)}</b></p>`:''}<button class="btn btn-p" data-act="closeModal" style="align-self:flex-end">Понятно</button></div>`)},
 decSrc(e){UI.dec.src=e.dataset.id;UI.tasks.decode={status:'idle'};render()},
 decRun(){const d=UI.dec;let job=null,text='';if(d.src==='job'){d.job=$('#dec-job').value;job=jobById(d.job)}else{text=$('#dec-text').value.trim();d.text=text;if(text.length<40){toast('Вставьте текст вакансии целиком','x');return}}
  runTask('decode',{json:true,prompt:decPrompt(job,text),fallback:()=>decodeLocal(job,text),onDone:st=>{const r=st.data||{};['must','nice','hidden','redflags','questions','prep'].forEach(k=>{r[k]=(Array.isArray(r[k])?r[k]:[]).map(String)});r.summary=String(r.summary||'')}})},
 decTrain(){const r=task('decode').data;const qs=((r&&r.questions)||[]).slice(0,5).map(q=>({q:String(q),what:'',kw:[],model:''}));if(!qs.length)return;const job=UI.dec.src==='job'?UI.dec.job:(ivJobs()[0]||JOBS[0]).id;UI.iv={phase:'q',job,type:'case',qs,i:0,answers:[],evals:[]};UI.tasks.ivEval={status:'idle'};go('interview','trainer')},
 starGen(){const src=$('#star-src').value;runTask('star',{json:true,prompt:starPrompt(src),fallback:()=>STAR_LOCAL[src],onDone:st=>{const d=st.data||STAR_LOCAL[src];S.stories=[{title:String(d.title||''),s:String(d.s||''),t:String(d.t||''),a:String(d.a||''),r:String(d.r||''),questions:(Array.isArray(d.questions)?d.questions:[]).map(String).slice(0,4),src:st.source},...(S.stories||[])];S.acted=true;save()}})},
 starDel(e){S.stories.splice(+e.dataset.id,1);save();render()},
 starTrain(e){const s=S.stories[+e.dataset.id];const qs=(s.questions.length?s.questions:['Расскажите о своём самом сильном проекте']).slice(0,3).map(q=>({q,what:'Поведенческий вопрос по вашей истории',kw:['ситуац','результат'],model:`Используйте историю «${s.title}»: ${s.s} ${s.a} ${s.r}`}));UI.iv={phase:'q',job:(ivJobs()[0]||JOBS[0]).id,type:'beh',qs,i:0,answers:[],evals:[]};UI.tasks.ivEval={status:'idle'};go('interview','trainer')},
 pitchRun(){const t=$('#pitch-in').value.trim();if(t.split(/\s+/).length<10){toast('Напишите сценарий хотя бы в несколько предложений','x');return}S.pitch=t;save();runTask('pitch',{json:true,prompt:pitchPrompt(t),fallback:()=>pitchLocal(t),onDone:st=>{const d=st.data||{};st.data={score:Math.max(1,Math.min(10,Math.round(Number(d.score)||5))),strengths:(d.strengths||[]).map(String),improve:(d.improve||[]).map(String),improved:String(d.improved||'')}}})},
 pitchUse(){S.pitch=task('pitch').data.improved;save();UI.tasks.pitch={status:'idle'};render();toast('Сценарий обновлён')},
 letType(e){UI.let.type=e.dataset.id;UI.tasks.letter={status:'idle'};render()},
 letRun(){const l=UI.let;l.job=$('#let-job').value;l.notes=$('#let-notes').value;const job=jobById(l.job);runTask('letter',{prompt:letPrompt(l.type,job,l.notes),fallback:()=>letterLocal(l.type,job,l.notes)})},
 letCopy(){copyText(task('letter').data||'','Письмо скопировано')},
 /* applications */
 appMove(e){const [id,dir]=e.dataset.id.split(':');const a=appsList().find(x=>x.id===id);if(!a)return;const i=APP_COLS.findIndex(c=>c[0]===a.st)+Number(dir);if(i<0||i>=APP_COLS.length)return;S.apps={...(S.apps||{}),[id]:APP_COLS[i][0]};save();render()},
 appFollow(e){UI.let={type:'followup',job:e.dataset.id,notes:''};UI.tasks.letter={status:'idle'};go('interview','letters')},
 appPrep(e){UI.iv={phase:'setup',job:e.dataset.id,type:'case'};UI.tasks.ivGen={status:'idle'};go('interview','trainer')},
 offAdd(){openModal(mh('Новое предложение','Добавьте оффер или стажировку, которую рассматриваете')+`<form class="modal-b col g12" id="offForm"><div class="form-grid"><label class="field"><span>Компания</span><input class="inp" id="of-co" required placeholder="Например, Avito"></label><label class="field"><span>Позиция</span><input class="inp" id="of-title" required placeholder="Стажёр-продакт"></label><label class="field"><span>Оплата, ₽ в месяц</span><input class="inp" id="of-sal" type="number" min="0" step="5000" value="65000"></label><label class="field"><span>Формат</span><select class="sel" id="of-fmt"><option>Гибрид</option><option>Удалённо</option><option>Офис</option></select></label></div><div class="row g8" style="justify-content:flex-end"><button type="button" class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" type="submit">Добавить</button></div></form>`)},
 offAdv(){runTask('offAdv',{prompt:offPrompt(),fallback:offLocal})},
 recSave(e){S.recs[e.dataset.id]=$('#rec-text').value.trim();save();render();toast('Рекомендация опубликована в профиле студента','send')},
 recAI(e){const pid=e.dataset.id;runTask('rec',{prompt:recPrompt(pid),fallback:()=>REC_T(pid),onDone:st=>{S.recs[pid]=String(st.data||REC_T(pid));save()}})},
 recToCv(e){const pid=e.dataset.id,mm=mentorOf(pid),c=cv();const line=`Рекомендация ментора: ${mm.name}, ${mm.pos} (проект для ${P(pid).company}).`;if(!c.extra.includes(line))c.extra=(c.extra?c.extra+' ':'')+line;save();toast('Рекомендация добавлена в резюме','plus')},
});

/* ================= events ================= */
let cvT=null;
document.addEventListener('input',e=>{const t=e.target;
 if(t.dataset&&t.dataset.cv){const p=t.dataset.cv;setP(cv(),p,p.endsWith('.bullets')?t.value.split('\n'):t.value);clearTimeout(cvT);cvT=setTimeout(()=>{save();paintCv();const box=$('.cv-score');if(box&&!task('cvAI').data){const tmp=document.createElement('div');tmp.innerHTML=scoreCard(analyzeCv(cv(),cvTargetJob()));box.replaceWith(tmp.firstElementChild);animateBars()}},300);return}
 if(t.id==='pitch-in'){const w=t.value.split(/\s+/).filter(Boolean).length;const m=$('#pitch-meta');if(m)m.textContent=`${w} слов · ≈ ${Math.round(w/130*60)} сек`}
 if(/^w-/.test(t.id)){const v=$('#'+t.id+'-v');if(v)v.textContent=t.value}
});
document.addEventListener('change',e=>{const t=e.target,id=t.id;
 if(id==='cv-target'){S.cvTarget=t.value;UI.tasks.cvAI={status:'idle'};save();render()}
 if(id==='iv-job'&&UI.iv)UI.iv.job=t.value;
 if(id==='let-job'&&UI.let){UI.let.job=t.value;UI.tasks.letter={status:'idle'};render()}
 if(id==='dec-job'&&UI.dec)UI.dec.job=t.value;
 if(id==='ver-job')UI.verJob=t.value;
 if(id==='pitch-video'&&t.files[0]){S.pitchVideo=t.files[0].name;save();render();toast('Видео прикреплено','video')}
 if(/^sal-/.test(id)){UI.sal[id.slice(4)]=t.value;render()}
 if(t.dataset&&t.dataset.off){const [oid,k]=t.dataset.off.split(':');const o=offers().find(x=>x.id===oid);o.sc[k]=+t.value;save();render()}
 if(/^w-/.test(id)){weights()[id.slice(2)]=+t.value;save();render()}
});
document.addEventListener('submit',e=>{if(e.target.id==='offForm'){e.preventDefault();const co=$('#of-co').value.trim(),ti=$('#of-title').value.trim();if(!co||!ti)return;offers().push({id:'o'+Date.now(),co,title:ti,sal:+$('#of-sal').value||0,fmt:$('#of-fmt').value,sc:{money:5,growth:5,skills:5,format:5,team:5}});save();closeModal();render();toast('Предложение добавлено — оцените его по критериям','scale')}});
document.addEventListener('dragstart',e=>{const c=e.target.closest&&e.target.closest('[data-app]');if(c){e.dataTransfer.setData('text/plain',c.dataset.app);e.dataTransfer.effectAllowed='move';c.classList.add('drag')}});
document.addEventListener('dragend',e=>{$$('.kb-card.drag').forEach(x=>x.classList.remove('drag'));$$('.kb-col.over').forEach(x=>x.classList.remove('over'))});
document.addEventListener('dragover',e=>{const col=e.target.closest&&e.target.closest('.kb-col');if(col){e.preventDefault();$$('.kb-col.over').forEach(x=>x!==col&&x.classList.remove('over'));col.classList.add('over')}});
document.addEventListener('drop',e=>{const col=e.target.closest&&e.target.closest('.kb-col');if(!col)return;e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(!id)return;S.apps={...(S.apps||{}),[id]:col.dataset.col};save();render()});

/* ================= AI assistant: real Claude when available ================= */
const AI_RULES=()=>`Ты — карьерный AI-помощник платформы ${BRAND} для студентов. Отвечай по-русски, по делу, до 120 слов, списком, если уместно. Опирайся на данные профиля ниже. ${NOFAKE} Советуя действие на платформе, называй раздел: Мой путь, Навыки, Проекты, Резюме, Интервью, Отклики, Стажировки.
Данные профиля:
${profileCtx()}`;
const SECTION_LINKS=[['Резюме','go:resume'],['Интервью','go:interview'],['Отклики','go:applications'],['Проекты','go:projects'],['Навыки','go:skills'],['Мой путь','go:career'],['Стажировки','go:internships']];
function aiSend(q){
 UI.aiLog.push({me:1,html:esc(q),raw:q});
 if(!aiOn()){UI.aiLog.push({typing:1});renderAI();setTimeout(()=>{UI.aiLog=UI.aiLog.filter(m=>!m.typing);UI.aiLog.push(aiReply(q));renderAI()},750);return}
 const turns=UI.aiLog.filter(m=>typeof m.raw==='string').slice(-10).map(m=>({role:m.me?'user':'assistant',content:m.raw}));
 while(turns.length&&turns[0].role!=='user')turns.shift();
 const bot={me:0,html:'<span class="muted">Думаю…</span>'};UI.aiLog.push(bot);renderAI();
 SAMPLE([{role:'user',content:AI_RULES()},...turns],{cache:false,onText:({text})=>{bot.html=md(text);const el=$$('#aiBody .msg.bot');const last=el[el.length-1];if(last){last.innerHTML=bot.html;const b=$('#aiBody');b.scrollTop=b.scrollHeight}}})
  .then(r=>{bot.raw=r.text;bot.html=md(r.text);bot.acts=SECTION_LINKS.filter(([n])=>r.text.includes(n)).slice(0,3).map(([n,g])=>['Открыть «'+n+'»',g]);renderAI()})
  .catch(e=>{const c=e&&e.code;if(AI_PERM.includes(c)){SAMPLE=null;const rep=aiReply(q);bot.html=rep.html;bot.acts=rep.acts}else if(c==='cancelled'){bot.html='<span class="muted">Остановлено</span>'}else{bot.html=(e&&e.text?md(e.text)+'<br>':'')+`<span class="muted">${AI_MSG[c]||AI_MSG.upstream_error}</span>`}renderAI()})}

