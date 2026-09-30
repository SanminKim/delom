/* ================= modals ================= */
function openModal(html,cls=''){$('#modalRoot').innerHTML=`<div class="scrim" data-act="closeModalScrim"><div class="modal ${cls}" role="dialog" aria-modal="true">${html}</div></div>`}
function closeModal(){$('#modalRoot').innerHTML=''}
const mh=(t,sub)=>`<div class="modal-h"><div><h2>${t}</h2>${sub?`<p class="sm muted" style="margin-top:4px">${sub}</p>`:''}</div><button class="x" data-act="closeModal" aria-label="Закрыть">${ic('x',16)}</button></div>`;

/* onboarding: resume -> parsing -> skills -> goal */
function openOnboarding(step){UI.onb=UI.onb||{step:step||'resume',goal:S.goal,file:null};if(step)UI.onb.step=step;renderOnb()}
function renderOnb(){const o=UI.onb;const idx={resume:0,parsing:0,skills:1,goal:2}[o.step];
 const left=`<div class="onb-l"><div class="row g8" style="font-weight:800;font-size:19px">${LOGO_W}${BRAND}</div>
  <h2 style="font-size:24px;line-height:1.25;color:#fff">Превращаем навыки в подтверждённый опыт, а опыт — в первую работу</h2>
  <p style="color:rgba(255,255,255,.8);font-size:14px">Чтобы получить работу, нужен опыт. Чтобы получить опыт, нужна работа. Мы разрываем этот круг реальными проектами компаний.</p>
  <div class="col g8 steps">${['Резюме и навыки','Цель и карьерная готовность','Проекты от VK, Ozon, Т-Банка и стартапов','Стажировки по подтверждённым навыкам'].map((s,i)=>`<div class="step"><i>${i+1}</i>${s}</div>`).join('')}</div></div>`;
 let right='';
 if(o.step==='resume')right=`<div class="onb-step"><div class="stepper"><i class="on"></i><i></i><i></i></div><div><span class="label">Шаг 1 из 3</span><h2 style="margin-top:4px">Загрузите резюме</h2><p class="sm muted" style="margin-top:4px">Платформа найдёт в нём навыки и опыт и сразу построит карьерный путь. Это займёт несколько секунд.</p></div>
  <label class="drop" for="resumeFile" style="cursor:pointer;padding:28px">${ic('upload',26)}<span class="b">Перетащите файл или выберите на компьютере</span><span class="xs muted">PDF, DOCX до 10 МБ</span><input type="file" id="resumeFile" hidden accept=".pdf,.doc,.docx,.txt"></label>
  <button class="btn btn-p btn-lg btn-block" data-act="resumeDemo">${ic('file')}Использовать демо-резюме</button>
  <button class="btn btn-g btn-block" data-act="onbGoal">Пропустить и выбрать цель</button></div>`;
 if(o.step==='parsing')right=`<div class="onb-step"><div class="stepper"><i class="on"></i><i></i><i></i></div><div><span class="label">Шаг 1 из 3</span><h2 style="margin-top:4px">Анализируем резюме</h2><p class="sm muted" style="margin-top:4px">${esc(o.file||'Иванов_резюме.pdf')}</p></div><div id="parse">${['Читаем документ','Находим навыки и опыт','Сопоставляем с требованиями 140+ стажировок'].map((s,i)=>`<div class="review-step" data-i="${i}"><span class="mk"></span><span>${s}</span></div>`).join('')}</div></div>`;
 if(o.step==='skills')right=`<div class="onb-step"><div class="stepper"><i class="on"></i><i class="on"></i><i></i></div><div><span class="label">Шаг 2 из 3</span><h2 style="margin-top:4px">Нашли ${RESUME.length} навыков</h2><p class="sm muted" style="margin-top:4px">Проверьте, всё ли верно. Навыки из резюме отмечены как «указаны» — подтвердить их можно проектами и тестами.${o.file&&o.file!=='Иванов_резюме.pdf'?' В демо-версии распознавание имитируется.':''}</p></div>
  <div class="recog">${RESUME.map((r,i)=>`<span class="pill ${['Product Thinking','Customer Development','Презентация выводов'].includes(r[0])?'ok':''}" style="animation-delay:${i*40}ms">${ic('check')}${r[0]} <span class="muted" style="font-weight:400">· ${r[1]}</span></span>`).join('')}</div>
  <div class="grid-2" style="gap:10px"><div class="stat"><div class="v">3</div><div class="sm muted">проекта найдено</div></div><div class="stat"><div class="v">3 курс</div><div class="sm muted">НИУ ВШЭ, бизнес-информатика</div></div></div>
  <button class="btn btn-p btn-lg btn-block" data-act="onbGoal">Дальше: выбрать цель${ic('arR')}</button></div>`;
 if(o.step==='goal'){const sel=TRACKS[o.goal]||TRACKS.pm;right=`<div class="onb-step"><div class="stepper"><i class="on"></i><i class="on"></i><i class="on"></i></div><div><span class="label">Шаг 3 из 3</span><h2 style="margin-top:4px">Кем вы хотите работать?</h2><p class="sm muted" style="margin-top:4px">Готовность рассчитана по вашему профилю: навыки, проекты и курсы.</p></div>
  <div class="grid-2" style="gap:10px">${Object.values(TRACKS).map(t=>`<button class="goal ${t.id===o.goal?'on':''}" data-act="pickGoal" data-id="${t.id}"><div class="row between" style="flex-wrap:nowrap"><span class="row g8 b" style="flex-wrap:nowrap">${ic(t.icon)}${t.goal}</span>${t.id==='pm'?'<span class="pill ac" style="height:20px;font-size:11px">рекомендуем</span>':''}</div><div class="row g8" style="flex-wrap:nowrap"><div class="grow"><div class="bar thin"><i style="width:${readinessOf(t.id)}%"></i></div></div><span class="xs b">${readinessOf(t.id)}%</span></div></button>`).join('')}
  ${GOALS_SOON.map(([g,p,i])=>`<button class="goal soon" data-act="soonGoal" data-id="${g}"><div class="row between" style="flex-wrap:nowrap"><span class="row g8 b" style="flex-wrap:nowrap">${ic(i)}${g}</span><span class="pill" style="height:20px;font-size:11px">скоро</span></div><div class="row g8" style="flex-wrap:nowrap"><div class="grow"><div class="bar thin"><i style="width:${p}%;background:var(--muted)"></i></div></div><span class="xs b">${p}%</span></div></button>`).join('')}</div>
  <button class="btn btn-p btn-lg btn-block" data-act="startGoal">Выбрать ${sel.goal} и продолжить${ic('arR')}</button></div>`}
 openModal(`${left}<div class="onb-r">${right}</div>`,'onb');
 if(o.step==='parsing'){let i=0;const tick=()=>{const el=$(`#parse .review-step[data-i="${i}"]`);if(!el){S.resume=true;save();o.step='skills';renderOnb();return}el.classList.add('on');el.querySelector('.mk').innerHTML=ic('check');i++;setTimeout(tick,650)};setTimeout(tick,400)}
}

function howConfirm(id){
 const s=sk(id);const t=TESTS[id],tr=S.tests[id];
 const pr=[P(T().main),...allProjects()].find(p=>p.confirms&&p.confirms.includes(id))||allProjects().find(p=>p.skills.includes(s.name))||P(T().main);
 openModal(mh(`Как подтвердить навык «${s.name}»`,`${stLabel(s)}${s.pct?' · '+s.pct+'%':''}. Выберите способ — результат попадёт в Skill Passport.`)+`<div class="modal-b col g8">
  <button class="conf-opt" ${t?`data-act="test" data-id="${id}"`:'disabled style="opacity:.6;cursor:default"'}><span class="ci">${ic('test')}</span><span class="grow"><div class="b">Пройти тест ${tr&&!tr.passed?`<span class="pill pr" style="height:20px;font-size:11px">прошлый результат ${tr.score} из 5</span>`:''}</div><div class="sm muted">${t?'5 вопросов · около 7 минут · зачёт от 4 правильных':'Тест по этому навыку готовится — выберите другой способ'}</div></span></button>
  <button class="conf-opt" data-go="project-${pr.id}"><span class="ci" style="background:var(--green-soft);color:var(--green)">${ic('folder')}</span><span class="grow"><div class="b">Выполнить проект <span class="pill ok" style="height:20px;font-size:11px">сильнее всего</span></div><div class="sm muted">${esc(pr.title)} · ${pr.company}</div></span></button>
  <button class="conf-opt" data-act="course" data-id="${id}"><span class="ci">${ic('book')}</span><span class="grow"><div class="b">Пройти курс ${s.plan==='course'?'<span class="pill ac" style="height:20px;font-size:11px">в плане</span>':''}</div><div class="sm muted">Курс с итоговым заданием · 2–4 недели</div></span></button>
  <button class="conf-opt" data-act="mentorBook" data-id="${id}"><span class="ci">${ic('users')}</span><span class="grow"><div class="b">Получить оценку ментора ${S.mentorReq[id]?'<span class="pill ac" style="height:20px;font-size:11px">записаны</span>':''}</div><div class="sm muted">Разбор вашей работы с практикующим специалистом · 30 минут</div></span></button>
 </div>`)}

/* tests */
function testModal(){const u=UI.test,T0=TESTS[u.id],q=T0.q[u.i];
 if(u.i>=T0.q.length){const score=u.a.filter((a,i)=>a===T0.q[i][2]).length,pass=score>=4;
  const before=readiness();
  if(!u.saved){u.saved=1;const prev=S.tests[u.id];if(!(prev&&prev.passed))S.tests[u.id]={passed:pass,score,date:todayStr()};if(pass)S.acted=true;save()}
  const after=readiness();
  openModal(mh(`Тест: ${T0.t}`,pass?'Навык подтверждён':'Не хватило совсем немного')+`<div class="modal-b col g16"><div class="row g16">${ring(score*20,108,'big')}<div class="grow col g6"><h2>${score} из 5 правильных</h2>${pass?`<p class="t2">Навык «${T0.t}» подтверждён и добавлен в Skill Passport.</p><div class="row g8"><span class="pill ok">${ic('shield')}Подтверждено</span>${after>before?`<span class="pill pr">${ic('trend')}Готовность ${before}% → ${after}%</span>`:''}<span class="pill">${ic('star')}+250 XP</span></div>`:`<p class="t2">Для зачёта нужно 4 из 5. Посмотрите разбор и попробуйте снова через минуту — или подтвердите навык проектом.</p>`}</div></div>
   <div>${T0.q.map((qq,i)=>`<div class="qres"><span class="mk ${u.a[i]===qq[2]?'ok':'bad'}">${ic(u.a[i]===qq[2]?'check':'x')}</span><div><div class="b">${esc(qq[0])}</div><div class="xs muted">Верный ответ: ${esc(qq[1][qq[2]])}</div></div></div>`).join('')}</div>
   <div class="row g8" style="justify-content:flex-end">${pass?`<button class="btn btn-s" data-go="skills">Skill Passport</button><button class="btn btn-p" data-act="closeModal">Готово</button>`:`<button class="btn btn-s" data-act="test" data-id="${u.id}">Пройти ещё раз</button><button class="btn btn-p" data-act="howConfirm" data-id="${u.id}">Другие способы</button>`}</div></div>`);
  if(pass){toast(`Навык «${T0.t}» подтверждён · +250 XP`,'shield');render()}
  return}
 openModal(mh(`Тест: ${T0.t}`,`Вопрос ${u.i+1} из ${T0.q.length} · зачёт от 4 правильных ответов`)+`<div class="modal-b col g12"><div class="qprog">${T0.q.map((_,i)=>`<i class="${i<=u.i?'on':''}"></i>`).join('')}</div><div class="task-q" style="font-weight:600">${esc(q[0])}</div>
  ${q[1].map((o,i)=>`<button class="opt ${u.pick===i?'sel':''}" data-act="testPick" data-id="${i}"><span class="ol-l">${'АБВГ'[i]}</span><span style="${/SELECT|JOIN|pd\.|df\.|len\(|\[x/.test(o)?'font-family:ui-monospace,Menlo,monospace;font-size:13px':''}">${esc(o)}</span></button>`).join('')}
  <div class="row between"><span class="xs muted">${ic('clock',12)} Без ограничения по времени в демо</span><button class="btn btn-p" data-act="testNext" ${u.pick===undefined?'disabled':''}>${u.i===T0.q.length-1?'Завершить':'Дальше'}${ic('arR')}</button></div></div>`)}

const COURSES=s=>[[ACAD,`${s.name} на практике`,'2 недели','Бесплатно','Итоговое задание с автопроверкой'],['Stepik',`${s.name}: интенсив для начинающих`,'3 недели','Бесплатно','Сертификат после итогового задания'],['Яндекс Практикум',`${s.name} для аналитиков`,'4 недели','Вводная часть бесплатно','Итоговое задание с ревью']];
function courseModal(id){const s=sk(id),C=COURSES(s),cur=S.courses[id];
 openModal(mh(`Курсы по навыку «${s.name}»`,'После итогового задания навык отмечается как подтверждённый курсом')+`<div class="modal-b col g8">${C.map((c,i)=>{const on=cur&&cur.i===i;return `<div class="conf-opt" style="cursor:default;${on?'border-color:var(--accent)':''}">${logo(c[0],'sm')}<span class="grow"><div class="b">${esc(c[1])}</div><div class="sm muted">${c[0]} · ${c[2]} · ${c[3]}</div><div class="xs muted">${c[4]}</div></span>${S.courseDone[id]&&on?`<span class="pill ok">${ic('check')}Пройден</span>`:on?`<button class="btn btn-p btn-sm" data-act="courseFinal" data-id="${id}">Итоговое задание</button>`:`<button class="btn btn-s btn-sm" data-act="enroll" data-id="${id}:${i}">${cur?'Выбрать этот':'Записаться'}</button>`}</div>`}).join('')}<p class="xs muted">Материалы курсов — у партнёров; итоговое задание сдаётся здесь и проверяется по критериям навыка.</p></div>`)}
function courseTask(id){const s=SK[id];return {q:`Итоговое задание курса «${s.name}»: опишите реальную или учебную задачу, которую вы решили бы с помощью навыка «${s.name}». Напишите по шагам: ситуация, что конкретно делаете, какими инструментами, какой результат и как его измерите.`,kw:[...s.name.toLowerCase().split(/[\s()/,-]+/).filter(x=>x.length>3).map(x=>x.slice(0,Math.max(4,x.length-2))),...(SYN[s.name]||[])].slice(0,6),model:`Сильный ответ опирается на конкретную ситуацию, показывает шаги применения навыка «${s.name}» и заканчивается измеримым результатом.`}}
function courseFinalModal(id,res){const s=SK[id],t=courseTask(id),c=S.courses[id]||{i:0},course=COURSES(sk(id))[c.i];
 openModal(mh(`Итоговое задание: ${s.name}`,`${course[0]} · ${course[1]}`)+`<div class="modal-b col g12"><div class="task-q" style="font-weight:500;font-size:14px">${esc(t.q)}</div>
  <textarea class="inp" id="cf-ans" rows="8" placeholder="Минимум 60 слов" ${res&&res.pass?'disabled':''}>${esc(UI.cfAns||'')}</textarea><span class="xs muted" id="cf-count">${(UI.cfAns||'').split(/\s+/).filter(Boolean).length} слов</span>
  ${res?`<div class="card col g8" style="padding:14px;background:${res.pass?'var(--green-soft)':'var(--orange-soft)'}"><b>${res.pass?`Зачёт · ${res.score} из 10 — навык подтверждён курсом`:`Пока не зачёт · ${res.score} из 10 (нужно от 7)`}</b>${res.good.map(x=>`<div class="sm">✓ ${esc(x)}</div>`).join('')}${res.improve.map(x=>`<div class="sm">→ ${esc(x)}</div>`).join('')}</div>`:''}
  <div class="row g8" style="justify-content:flex-end">${res&&res.pass?`<button class="btn btn-s" data-go="skills">Skill Passport</button><button class="btn btn-p" data-act="closeModal">Готово</button>`:`<button class="btn btn-s" data-act="closeModal">Позже</button><button class="btn btn-p" data-act="courseSubmit" data-id="${id}">Сдать задание</button>`}</div></div>`)}
function mentorModal(){const u=UI.mb,s=sk(u.id);const list=[...MENTORS].sort((a,b)=>b.skills.includes(u.id)-a.skills.includes(u.id));
 openModal(mh(`Оценка ментора: ${s.name}`,'Ментор разберёт вашу работу на созвоне и подтвердит навык, если уровень достаточный')+`<div class="modal-b col g12"><span class="label">Ментор</span>
  <div class="col g8">${list.map(m=>`<button class="team-opt ${u.m===m.id?'on':''}" data-act="mbPick" data-id="${m.id}" style="flex-direction:row;align-items:center">${av(m.ini,m.color,40)}<span class="grow"><div class="b">${m.name}</div><div class="sm muted">${m.pos}</div></span><span class="pill">${ic('star')}${m.rating} · ${m.reviews}</span></button>`).join('')}</div>
  <span class="label">Время</span><div class="grid-3" style="gap:8px">${MSLOTS.map(t=>`<button class="slot ${u.slot===t?'on':''}" data-act="mbSlot" data-id="${t}" style="font-size:13px">${t}</button>`).join('')}</div>
  <label class="field"><span>Что показать ментору</span><select class="sel" id="mb-what"><option>Решение учебного кейса</option><option>Проект из портфолио</option><option>Выполнить задание на созвоне</option></select></label>
  <div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="mbConfirm" ${u.m&&u.slot?'':'disabled'}>Записаться · бесплатно</button></div></div>`)}
function consModal(){const {id,stars}=UI.ca;openModal(mh(`Оценка навыка «${SK[id].name}»`,'Алексей Иванов · консультация '+S.mentorReq[id].slot)+`<div class="modal-b col g12"><p class="sm t2">Оцените уровень по итогам разбора. От 4 баллов навык подтверждается и попадает в Skill Passport с вашей оценкой как основанием.</p><div class="row between"><span class="b">Уровень</span><span class="stars">${[1,2,3,4,5].map(n=>`<button class="${n<=stars?'on':''}" data-act="caStar" data-id="${n}" aria-label="${n} из 5">${ic('star')}</button>`).join('')}</span></div><label class="field"><span>Отзыв студенту</span><textarea class="inp" id="ca-comment" rows="3" placeholder="Что получилось и что подтянуть">${esc(UI.ca.comment||'')}</textarea></label><div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="caSave">${stars>=4?'Подтвердить навык':'Сохранить оценку'}</button></div></div>`)}
function teamsFor(p){const roles=p.prof==='Product Manager'?['Product Manager','Аналитик','UX-исследователь']:p.prof==='Marketing Manager'?['Маркетолог','Аналитик','Дизайнер']:['Аналитик','Product Manager','Дизайнер'];
 return [{name:p.id==='p5'?'Второе объявление':'Growth Team',members:[[...TEAMMATES[0],'Product Manager'],[...TEAMMATES[1],'Frontend / прототипы']],need:roles.filter(r=>r!=='Product Manager').slice(0,2)},
  {name:p.id==='p5'?'Seller Growth':'Data Ninjas',members:[[...TEAMMATES[2],'System Analyst']],need:roles.slice(0,2)},
  {name:'Кейс-клуб ВШЭ',members:[[...TEAMMATES[3],'Аналитик'],[...TEAMMATES[4],'Дизайнер'],[...TEAMMATES[5],'Бизнес-аналитик']],need:[roles[0]]}]}
function teamModal(pid){const p=P(pid),u=UI.team,ts=teamsFor(p);
 openModal(mh(`Команда для проекта «${p.short}»`,'Выберите команду, где нужна ваша роль, или создайте свою')+`<div class="modal-b col g12">
  ${ts.map((t,i)=>`<button class="team-opt ${u.t===i&&!u.own?'on':''}" data-act="teamPick" data-id="${i}"><div class="row between" style="flex-wrap:nowrap"><b>«${t.name}»</b><span class="members">${t.members.map(m=>av(m[1],m[2])).join('')}${t.need.map(()=>`<span class="open">${ic('plus',12)}</span>`).join('')}</span></div><div class="sm muted">${t.members.map(m=>m[0].split(' ')[0]+' — '+m[3]).join(' · ')}</div><div class="chips"><span class="xs muted" style="align-self:center">Ищут:</span>${t.need.map(r=>`<span class="pill ac">${r}</span>`).join('')}</div></button>`).join('')}
  ${u.own?`<div class="card col g12" style="padding:14px;border-color:var(--accent)"><b>Своя команда</b><div class="form-grid"><label class="field"><span>Название</span><input class="inp" id="team-name" placeholder="Например, Growth Squad" maxlength="40"></label><label class="field"><span>Размер команды</span><select class="sel" id="team-size"><option>2</option><option selected>3</option><option>4</option></select></label><label class="field full"><span>Ваша роль</span><select class="sel" id="team-role">${[...new Set([...teamsFor(p)[0].need,...teamsFor(p)[1].need,'Капитан команды'])].map(r=>`<option>${r}</option>`).join('')}</select></label></div><p class="xs muted">После создания вы получите ссылку-приглашение. Работать над проектом можно сразу, не дожидаясь участников.</p></div>`
   :u.t!==undefined?`<label class="field"><span>Ваша роль в команде</span><select class="sel" id="team-role">${ts[u.t].need.map(r=>`<option>${r}</option>`).join('')}</select></label>`:''}
  <div class="row between"><button class="btn btn-g btn-sm" data-act="teamOwn" ${u.own?'disabled':''}>${ic('plus')}Создать свою команду</button><div class="row g8"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="teamJoin" data-id="${pid}" ${u.t===undefined&&!u.own?'disabled':''}>${u.own?'Создать команду':'Вступить в команду'}</button></div></div></div>`)}
function simModal(key,qi=0,score=0,picked=null){
 const s=SIMS[key];const q=s.qs[qi];const last=qi===s.qs.length-1;
 if(qi>=s.qs.length){const good=score>=Math.ceil(s.qs.length*.66);const tr=Object.values(TRACKS).find(t=>t.goal===key);openModal(mh(key,'Симуляция завершена')+`<div class="modal-b col g16" style="text-align:center"><div style="margin:0 auto">${ring(Math.round(score/s.qs.length*100),100,'big')}</div><h2>${good?'Вы мыслите как '+key:'Хорошее начало'}</h2><p class="t2">${score} из ${s.qs.length} решений совпали с тем, как поступил бы опытный специалист.${tr?' Следующий шаг — реальный проект компании.':''}</p><div class="row g8" style="justify-content:center">${tr?`<button class="btn btn-p" data-act="goalFromSim" data-id="${tr.id}">Выбрать цель ${key}</button>`:''}<button class="btn btn-s" data-act="closeModal">Закрыть</button></div></div>`);return}
 openModal(mh(key,`${s.intro} Ситуация ${qi+1} из ${s.qs.length}`)+`<div class="modal-b col g12"><div class="task-q" style="font-weight:600">${q.q}</div>
  ${q.o.map((o,i)=>`<button class="opt ${picked!==null?(o[1]?'right':i===picked?'wrong':''):''}" ${picked!==null?'disabled':''} data-act="simPick" data-id="${key}|${qi}|${score}|${i}"><span class="ol-l">${'АБВГ'[i]}</span><span>${o[0]}</span></button>`).join('')}
  ${picked!==null?`<div class="fb ${q.o[picked][1]?'ok':'bad'}"><b>${q.o[picked][1]?'Отличное решение.':'Есть решение лучше.'}</b> ${q.o[picked][2]}</div><button class="btn btn-p" data-act="simNext" data-id="${key}|${qi+1}|${score+(q.o[picked][1]?1:0)}" style="align-self:flex-end">${last?'Итоги':'Дальше'}${ic('arR')}</button>`:''}
 </div>`)}
function candModal(id){
 const c=id==='c2'?alexCand():CANDS.find(x=>x.id===id);const isA=id==='c2',e=emp(),p=P(e.main),d=pst(e.main)==='done';
 openModal(mh(c.name,`${c.prof} · ${c.uni}`)+`<div class="modal-b col g16">
  <div class="row g16">${ring(c.match,80,'big')}<div class="grow col g6"><span class="label">Совпадение с ${e.hireFor}</span><div class="sm t2">${c.projects} ${plural(c.projects,'проект','проекта','проектов')} · ${c.city}</div>${candStatus(c)}</div></div>
  <div><div class="label" style="margin-bottom:8px">Подтверждённые навыки</div><div class="chips">${c.skills.map(s=>`<span class="pill ok">${ic('shield')}${s}</span>`).join('')}</div></div>
  ${isA&&d?`<div class="pf-proj fresh"><div class="row between"><b>${p.short}</b><span class="pill">${ic('star')}${S.scores[e.main]||p.score}</span></div><div class="grid-3" style="gap:8px">${p.metrics.map(m=>`<div class="metric"><b>${m[0]}</b><span class="xs muted">${m[1]}</span></div>`).join('')}</div><div class="quote sm">${esc(p.slides[0][2])}</div><div class="xs muted">Проверено ментором ${mentorOf(e.main).name} · навыки подтверждены</div></div>`:isA?`<div class="quote sm">Кандидат участвует в вашем проекте «${p.short}». ${pst(e.main)==='review'?'Решение на проверке у ментора.':'Решение ещё не отправлено.'}</div>`:`<div class="quote sm">Последний проект: оценка 4,5 из 5. Отзыв компании: «Самостоятельный, аккуратно работает с данными».</div>`}
  <div class="row g8" style="justify-content:flex-end">${isA&&S.inv[e.main]?`<button class="btn btn-s" data-go="empmessages-inv-${e.main}">${ic('msg')}Открыть чат</button>`:''}${candStatus(c)?'':`<button class="btn btn-p" data-act="invite" data-id="${c.id}">${ic('mail')}Пригласить на интервью</button>`}<button class="btn btn-s" data-act="closeModal">Закрыть</button></div>
 </div>`)}
function inviteModal(id){const c=id==='c2'?alexCand():CANDS.find(x=>x.id===id);
 openModal(mh('Приглашение на интервью',c.name+' · '+c.prof)+`<form class="modal-b col g12" id="inviteForm"><label class="field"><span>Позиция</span><select class="sel" id="inv-pos">${emp().vac.map(v=>`<option>${v.title}</option>`).join('')}</select></label><label class="field"><span>Сообщение</span><textarea class="inp" id="inv-msg" rows="3">Здравствуйте! Нам понравились ваши проекты и подтверждённые навыки. Приглашаем на интервью с командой.</textarea></label><input type="hidden" id="inv-id" value="${c.id}"><div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" type="button" data-act="closeModal">Отмена</button><button class="btn btn-p" type="submit">${ic('send')}Отправить приглашение</button></div></form>`)}
function vacModal(type){openModal(mh(type==='Стажировка'?'Новая стажировка':'Новая вакансия','Кандидаты подберутся автоматически по подтверждённым навыкам')+`<form class="modal-b col g12" id="vacForm"><input type="hidden" id="v-type" value="${type}">
 <label class="field"><span>Название</span><input class="inp" id="v-title" required value="${type==='Стажировка'?'Стажёр продуктовой аналитики':'Junior Product Manager'}"></label>
 <div class="form-grid"><label class="field"><span>Профессия</span><select class="sel" id="v-prof">${PROFS.map(p=>`<option>${p}</option>`).join('')}</select></label><label class="field"><span>Формат</span><select class="sel" id="v-format"><option>Удалённо</option><option>Гибрид</option><option>Офис</option></select></label>
 <label class="field"><span>Город</span><input class="inp" id="v-city" value="Москва"></label><label class="field"><span>Оплата, ₽ в месяц</span><input class="inp" id="v-sal" value="${type==='Стажировка'?'60 000':'от 120 000'}"></label>
 <label class="field full"><span>Ключевые навыки</span><input class="inp" id="v-skills" value="Product Analytics, SQL, Работа с гипотезами"></label></div>
 <label class="check"><input type="checkbox" id="v-paid" checked>Оплачиваемая</label>
 <div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" type="button" data-act="closeModal">Отмена</button><button class="btn btn-p" type="submit">Опубликовать</button></div></form>`)}
function slotModal(pid){const inv=S.inv[pid]||{};UI.slotSel=inv.slot||SLOTS[1];const p=P(pid),e=empOfProj(pid);
 openModal(mh(`Интервью в ${p.company}`,`${p.invitePos} · 45 минут · онлайн с ${e.person}`)+`<div class="modal-b col g12"><span class="label">Выберите удобное время</span><div class="col g8">${SLOTS.map(s=>`<button class="slot ${s===UI.slotSel?'on':''}" data-act="pickSlot" data-id="${s}">${ic('cal')} ${s}</button>`).join('')}</div><div class="row g8" style="justify-content:flex-end;margin-top:6px"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="confirmSlot" data-id="${pid}">Подтвердить интервью</button></div></div>`)}
function fileModal(arg){
 const [pid,name]=arg.includes('|')?arg.split('|'):['',arg];const p=P(pid);
 if(name.startsWith('funnel')){openModal(mh(name,'Выгрузка событий за сентябрь 2026 · 12 400 пользователей')+`<div class="modal-b col g16">${funnelHtml()}<div class="tbl-wrap"><table class="tbl"><thead><tr><th>user_id</th><th>event</th><th>platform</th><th>ts</th></tr></thead><tbody>${[['u_18342','signup','ios','2026-09-03 10:14'],['u_18342','profile_filled','ios','2026-09-03 10:17'],['u_18342','course_selected','ios','2026-09-03 10:25'],['u_20917','signup','web','2026-09-09 19:02'],['u_20917','cart_add','web','2026-09-09 19:40']].map(r=>`<tr>${r.map(x=>`<td style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`,'wide');return}
 if(name.startsWith('cohorts')){openModal(mh(name,'Обезличенные данные 48 000 клиентов · март–август 2026')+`<div class="modal-b col g16">${cohortHtml()}<div class="tbl-wrap"><table class="tbl"><thead><tr><th>client_id</th><th>open_month</th><th>product</th><th>autopay</th><th>active_m3</th></tr></thead><tbody>${[['c_40211','2026-03','debit','1','1'],['c_40877','2026-06','debit','0','0'],['c_41203','2026-06','credit','0','0'],['c_42019','2026-07','debit','1','—'],['c_42551','2026-08','debit','1','—']].map(r=>`<tr>${r.map(x=>`<td style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`,'wide');return}
 if(name.endsWith('.sql')){openModal(mh(name,'Схема таблиц')+`<div class="modal-b"><div class="code">${name.includes('ozon')?'CREATE TABLE events (\n  user_id   TEXT,\n  grp       TEXT,    -- A | B\n  event     TEXT,    -- view | add_to_cart | purchase\n  revenue   NUMERIC,\n  ts        TIMESTAMP\n);':name.includes('payments')?'CREATE TABLE payments (\n  payment_id  TEXT PRIMARY KEY,\n  client_id   TEXT,\n  type        TEXT,   -- debit | credit | decline\n  amount      NUMERIC,\n  created_at  TIMESTAMP\n);':'CREATE TABLE clients (\n  client_id    TEXT PRIMARY KEY,\n  open_date    DATE,\n  product      TEXT,   -- debit | credit\n  channel      TEXT,   -- app | partner | office\n  autopay      BOOLEAN\n);\nCREATE TABLE activity (\n  client_id    TEXT REFERENCES clients,\n  month        DATE,\n  tx_count     INT\n);'}</div></div>`);return}
 if(!p){toast('Материал недоступен','x');return}
 const f=p.provide.find(x=>x[1]===name)||p.provide[0],isBrief=/^brief/.test(name)||f===p.provide[0];
 if(isBrief){openModal(mh(name,`${p.company} · ${f[2]}`)+`<div class="modal-b col g12"><div class="paper-wrap" style="max-height:none"><div class="paper"><h4>Бриф проекта</h4><div class="pp-name" style="font-size:20px">${esc(p.title)}</div><p style="margin:10px 0">${esc(p.about)}</p><h4 style="margin-top:14px">Задача</h4><p>${esc(p.task)}</p><h4 style="margin-top:14px">Что сделать</h4><ol style="padding-left:18px;margin:4px 0">${p.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><h4 style="margin-top:14px">Критерии оценки</h4><ul style="padding-left:18px;margin:4px 0">${p.criteria.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><h4 style="margin-top:14px">Сроки</h4><p>Приём решений до ${esc(p.deadline)}. ${p.hiring?'Лучших участников пригласят на интервью.':''}</p></div></div></div>`,'wide');return}
 if(['XLS','CSV'].includes(f[0])&&p.data){openModal(mh(name,f[2])+`<div class="modal-b col g12">${dataTable(p.data)}</div>`,'wide');return}
 openModal(mh(name,f[2])+`<div class="modal-b col g12"><div class="quote sm">${esc(f[2])}. ${f[0]==='FIG'?'Макеты доступны участникам проекта по ссылке компании после старта.':'Документ приложен компанией к проекту.'}</div><ul class="ul sm">${p.steps.slice(0,3).map(x=>`<li>${ic('check')}<span>Пригодится для шага: ${esc(x)}</span></li>`).join('')}</ul></div>`)}

function finishProject(pid,score,comment){const p=P(pid);
 S.flags['rb_'+pid]=readinessOf((trackOfProj(pid)||T()).id);S.flags['ub_'+pid]=newlyUnlocked().length;
 S.pstat[pid]='done';S.recs=S.recs||{};if(!S.recs[pid])S.recs[pid]=REC_T(pid);S.scores[pid]=score;S.flags['d_'+pid]=todayStr();
 S.reviews=S.reviews||{};S.reviews[pid]={comment:comment||p.review,date:todayStr()};const w=wsOf(pid);w.returned=null;
 if(p.hiring&&!S.inv[pid]){S.inv[pid]={st:'new'};ensureInviteChat(pid)}S.acted=true;save()}
function switchRole(r,then){S.lastRole=r;if(then){const i=then.indexOf('-');i<0?go(then):go(then.slice(0,i),then.slice(i+1))}else go(HOME[r])}

const A={
 drawer(){UI.drawer=!UI.drawer;renderShell(parse())},closeDrawer(){UI.drawer=false;renderShell(parse())},
 roles(){togglePop('roles',rolesHtml())},
 role(e){closeModal();switchRole(e.dataset.role,e.dataset.then)},
 switchCo(){S.empCo=emp().id==='su'?'tb':'su';save();render();toast('Кабинет компании: '+emp().company,'building')},
 notif(){togglePop('notif',notifHtml());const b=$('.icon-btn .badge');if(b)b.remove()},
 me(){togglePop('me',meHtml())},tour(){togglePop('tour',tourHtml())},
 reset(){try{localStorage.removeItem(KEY)}catch(e){}S=fresh();UI.aiLog=[];UI.ai=false;UI.onb=null;UI.rv={};renderAI();closePop();closeModal();location.hash='welcome';render(true);toast('Демо-данные сброшены')},
 logout(){S.authed=false;save();closePop();UI.ai=false;renderAI();go('welcome')},
 demoLogin(){S.authed=true;S.lastRole='student';save();go('dashboard')},
 toggleLogin(){UI.login=!UI.login;render()},
 sso(){const f=$('#authForm');if(f)f.requestSubmit()},
 scrollTo(e){const el=document.getElementById(e.dataset.id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},
 ai(){aiOpen()},aiClose(){UI.ai=false;renderAI();$('#fab').hidden=curRole!=='student'},
 aiAsk(e){closeModal();aiOpen();aiSend(e.dataset.q)},
 aiInterview(){aiOpen();aiSend('Помоги подготовиться к интервью')},
 closeModal(){closeModal()},
 closeModalScrim(e,ev){if(ev.target===e&&S.onboarded)closeModal()},
 /* onboarding */
 resumeDemo(){UI.onb.file='Иванов_резюме.pdf';UI.onb.step='parsing';renderOnb()},
 onbGoal(){UI.onb.step='goal';renderOnb()},
 pickGoal(e){UI.onb.goal=e.dataset.id;renderOnb()},
 soonGoal(e){toast(`Трек «${e.dataset.id}» появится в ближайшем обновлении. Сейчас доступны Product Manager и Data Analyst`,'clock')},
 startGoal(){const changed=S.onboarded&&S.goal!==UI.onb.goal;S.goal=UI.onb.goal;S.onboarded=true;UI.onb=null;save();closeModal();render();toast(`Цель выбрана: ${T().goal} · готовность ${readiness()}%`,'target');if(changed&&curRole==='student')go('dashboard')},
 changeGoal(){UI.onb={step:'goal',goal:S.goal};renderOnb()},
 resumeAgain(){UI.onb={step:'resume',goal:S.goal};renderOnb()},
 switchTrack(){closePop();S.goal=S.goal==='pm'?'da':'pm';S.onboarded=true;save();go('dashboard');toast(`Цель: ${T().goal} · готовность ${readiness()}%`,'target')},
 goalFromSim(e){closeModal();S.goal=e.dataset.id;S.onboarded=true;save();go('project',T().main);toast(`Цель: ${T().goal}`,'target')},
 /* skills */
 howConfirm(e){howConfirm(e.dataset.id)},
 test(e){closePop();const id=e.dataset.id;const tr=S.tests[id];if(tr&&tr.passed){toast(`Тест по навыку «${SK[id].name}» уже пройден: ${tr.score} из 5`,'shield');return}UI.test={id,i:0,a:[]};testModal()},
 testPick(e){UI.test.pick=+e.dataset.id;testModal()},
 testNext(){const u=UI.test;u.a[u.i]=u.pick;u.pick=undefined;u.i++;testModal()},
 course(e){courseModal(e.dataset.id)},
 enroll(e){const [id,i]=e.dataset.id.split(':');S.courses[id]={i:+i};save();courseModal(id);render();toast('Курс добавлен в план развития','book')},
 courseFinal(e){UI.cfAns='';courseFinalModal(e.dataset.id)},
 courseSubmit(e){const id=e.dataset.id,a=($('#cf-ans').value||'').trim();UI.cfAns=a;if(a.split(/\s+/).filter(Boolean).length<30){toast('Ответ слишком короткий — нужно хотя бы 30–60 слов','x');return}
  const r=evalLocal(courseTask(id),a),pass=r.score>=7;const res={pass,score:r.score,good:r.good,improve:r.improve};
  if(pass){const c=COURSES(sk(id))[(S.courses[id]||{i:0}).i];S.courseDone[id]={title:c[1],provider:c[0],score:r.score+' из 10',date:todayStr()};S.acted=true;save();render();toast(`Навык «${SK[id].name}» подтверждён курсом`,'shield')}
  courseFinalModal(id,res)},
 mentorBook(e){UI.mb={id:e.dataset.id,m:null,slot:null};mentorModal()},
 mbPick(e){UI.mb.m=e.dataset.id;mentorModal()},mbSlot(e){UI.mb.slot=e.dataset.id;mentorModal()},
 mbConfirm(){const u=UI.mb,m=MENTORS.find(x=>x.id===u.m);S.mentorReq[u.id]={m:u.m,slot:u.slot};S.acted=true;save();closeModal();render();toast(`Встреча с ментором ${m.name}: ${u.slot}`,'cal')},
 skTab(e){UI.skTab=e.dataset.id;render()},
 skillProof(e){const s=sk(e.dataset.id);openModal(mh(s.name,'Подтверждено · '+s.date)+`<div class="modal-b col g12"><div class="row g8"><span class="pill ok">${ic('shield')}Подтверждено</span>${s.via?`<span class="pill">${({test:'Тест',project:'Проект компании',mentor:'Оценка ментора',course:'Курс'})[s.via]}</span>`:''}</div><div><span class="label">Основание</span><div class="b" style="margin-top:4px">${esc(s.basis)}</div><div class="sm muted">${esc(s.src)}</div></div><div class="quote sm">Проверка: результат оценён по критериям ${BRAND} и виден работодателям в Skill Passport вместе с основанием.</div>${s.pid?`<button class="btn btn-s btn-sm" data-go="complete-${s.pid}" style="align-self:flex-start">Открыть проект</button>`:''}</div>`)},
 /* projects */
 resetPF(){UI.proj={q:'',prof:'',skill:'',diff:'',dur:'',format:'',company:''};if(parse().id)go('projects');else render()},
 resetJF(){UI.jobs={prof:'',company:'',format:'',level:'',skill:'',paid:false,fit:false};render()},
 join(e){const id=e.dataset.id,p=P(id);
  if(p.format==='Командный'){UI.team={};teamModal(id);return}
  openModal(mh(`Участие в проекте ${p.company}`,p.title)+`<div class="modal-b col g12"><ul class="ul"><li>${ic('check')}<span>Приём решений до ${esc(p.deadline)}</span></li><li>${ic('check')}<span>Материалы и обезличенные данные компании</span></li><li>${ic('check')}<span>Ментор ${esc(mentorOf(id).name)} проверит решение</span></li></ul><label class="check"><input type="checkbox" id="nda" checked>Согласен с условиями использования данных компании</label><button class="btn btn-p btn-lg btn-block" data-act="confirmJoin" data-id="${id}">Подтвердить участие</button></div>`)},
 confirmJoin(e){if(!$('#nda').checked){toast('Нужно согласиться с условиями использования данных','x');return}const id=e.dataset.id;S.pstat[id]='active';wsOf(id);S.acted=true;save();closeModal();go('workspace',id);toast(`Вы участник проекта ${P(id).company}`)},
 teamPick(e){UI.team.t=+e.dataset.id;UI.team.own=false;teamModal(parse().id)},
 teamOwn(){UI.team={own:true};teamModal(parse().id)},
 teamJoin(e){const pid=e.dataset.id,p=P(pid);
  if(UI.team.own){const name=($('#team-name').value||'').trim();if(name.length<2){toast('Придумайте название команды','x');return}S.teams[pid]={name,role:$('#team-role').value,members:[],own:true,size:+$('#team-size').value}}
  else{const t=teamsFor(p)[UI.team.t];S.teams[pid]={name:t.name,role:$('#team-role').value,members:t.members}}
  S.pstat[pid]='active';wsOf(pid);S.acted=true;ensureTeamChat(pid);save();closeModal();go('workspace',pid);toast(`Вы в команде «${S.teams[pid].name}»`,'users')},
 teamLink(e){const u=location.href.split('#')[0]+'#project-'+e.dataset.id;copyText(u,'Ссылка на проект скопирована — отправьте её однокурсникам')},
 tick(e){const [pid,i]=e.dataset.id.split(':');const w=wsOf(pid);w.tasks[+i]=w.tasks[+i]?0:1;save();render()},
 async demoFill(e){const p=P(e.dataset.id),w=wsOf(p.id);w.tasks=[1,1,1,1];if((w.summary||'').trim().length<SUM_MIN)w.summary=`${p.review} Что сделано: ${p.wsTasks.map(t=>t[0].toLowerCase()).join('; ')}. Ключевые результаты: ${p.metrics.map(m=>m[0]+' — '+m[1]).join(', ')}.`;await A.demoFile(e,null,true);toast('Пример решения заполнен — проверьте и отправьте')},
 async demoFile(e,ev,quiet){const p=P(e.dataset.id),w=wsOf(p.id);if(!quiet&&(w.summary||'').trim().length<SUM_MIN){toast(`Сначала опишите итог решения — минимум ${SUM_MIN} знаков`,'x');const t=$('#ws-sum');if(t)t.focus();return}
  const name=`Иванов_${p.short.replace(/[^\wА-Яа-яЁё]+/g,'_').slice(0,32)}.html`;const rec=await storeGenerated('ws-'+p.id,name,reportHtml(p,w));Object.assign(w,{file:name,fileSize:rec.size,fileDemo:true});save();render()},
 rmFile(e){const w=wsOf(e.dataset.id);FS.del('ws-'+e.dataset.id);Object.assign(w,{file:null,fileSize:0,fileDemo:false});save();render()},
 submit(e){const pid=e.dataset.id,p=P(pid),mm=mentorOf(pid),w=wsOf(pid);if(!wsReady(w)){toast(wsHint(w),'x');return}
  w.sentAt=todayStr();S.pstat[pid]='review';S.acted=true;save();render();
  openModal(mh('Решение отправлено',`${p.short} · ${p.company}`)+`<div class="modal-b col g16"><div class="row g12" style="flex-wrap:nowrap">${av(mm.ini,mm.color,44)}<div><div class="b">Проверяет ${esc(mm.name)}</div><div class="sm muted">${esc(mm.pos)} · обычно до 3 дней</div></div></div><p class="t2">Ментор оценит решение по критериям компании, подтвердит навыки${p.hiring?` и передаст результат в ${esc(p.company)}`:''}. Пока решение на проверке, его можно отозвать и доработать.</p><div class="col g8"><button class="btn btn-p btn-lg btn-block" data-act="role" data-role="mentor" data-then="review-${pid}">${ic('shield')}Проверить глазами ментора</button><button class="btn btn-s btn-block" data-act="closeModal">Понятно</button></div></div>`)},
 openStored(e){openStored(e.dataset.id)},
 async dlStored(e){const rec=await FS.get(e.dataset.id);if(!rec){toast('Файл не найден','x');return}saveFile(rec.name,rec.blob)},
 withdraw(e){const pid=e.dataset.id;if(pst(pid)!=='review')return;S.pstat[pid]='active';save();render();toast('Решение отозвано — можно доработать и отправить снова','refresh')},
 openFile(e){fileModal(e.dataset.id)},
 addPortfolio(e){const pid=e.dataset.id||T().main;S.portfolio[pid]=true;save();render();toast('Проект добавлен в портфолио · готовность '+readiness()+'%','file')},
 acceptInvite(e){slotModal(e.dataset.id)},
 laterInvite(e){const pid=e.dataset.id;if(S.inv[pid]&&S.inv[pid].st!=='accepted'){S.inv[pid].st='later';save();render()}toast('Напомним о приглашении завтра в 10:00','clock')},
 pickSlot(e){UI.slotSel=e.dataset.id;$$('.slot').forEach(b=>b.classList.toggle('on',b===e))},
 confirmSlot(e){const pid=e.dataset.id;S.inv[pid]={st:'accepted',slot:UI.slotSel};ensureInviteChat(pid);const c=S.chats['inv-'+pid];c.msgs.push({f:'sys',t:`Интервью назначено: ${UI.slotSel}`},{f:'them',t:'Отлично, до встречи! Ссылку на встречу пришлю за час. Подготовьте, пожалуйста, 5-минутный рассказ о решении.',tm:tnow()});c.unreadE=(c.unreadE||0)+1;S.acted=true;save();closeModal();render();toast('Интервью подтверждено: '+UI.slotSel,'cal')},
 apply(e){const j=jobById(e.dataset.id);S.applied[j.id]=1;save();render();toast(`Отклик отправлен в ${j.company}. Компания видит ваш Skill Passport`,'send')},
 boost(){const b=$('#boost');b.hidden=!b.hidden},
 copyLink(){const u=DOMAIN+'/@a.ivanov';const ok=()=>toast('Ссылка скопирована: '+u,'copy');try{navigator.clipboard.writeText('https://'+u).then(ok,ok)}catch(err){ok()}},
 sim(e){simModal(e.dataset.id)},
 simPick(e){const [k,qi,sc,i]=e.dataset.id.split('|');simModal(k,+qi,+sc,+i)},
 simNext(e){const [k,qi,sc]=e.dataset.id.split('|');simModal(k,+qi,+sc)},
 /* employer */
 candSkill(e){const s=e.dataset.id,a=UI.cand.skills;UI.cand.skills=a.includes(s)?a.filter(x=>x!==s):[...a,s];e.classList.toggle('on');renderCandList()},
 resetCF(){UI.cand={skills:[],prof:'',min:0};render()},
 candProfile(e){candModal(e.dataset.id)},
 invite(e){const id=e.dataset.id;if(id==='c2'&&S.inv[emp().main]){toast('Алексей уже приглашён по итогам проекта','mail');return}inviteModal(id)},
 newVac(e){vacModal(e.dataset.type)},
 ppFormat(e){$$('[data-act="ppFormat"]').forEach(b=>b.classList.toggle('on',b===e))},
 ppDemo(){$('#pp-title').value='Анализ оттока учеников после пробного урока';$('#pp-desc').value='После бесплатного пробного урока только 18% учеников покупают курс. Предоставим выгрузку посещений и оплат за 3 месяца. Ждём анализ причин оттока, 3–5 гипотез и план эксперимента.'},
 tier(e){toast(e.dataset.id==='Старт'?'Тариф можно сменить в конце расчётного периода':'Заявка отправлена — менеджер свяжется в течение дня','coin')},
 /* mentor */
 mTab(e){UI.mentorTab=e.dataset.id;render()},
 mentorOld(e){const q=QUEUE[+e.dataset.id],p=P(q.pid);openModal(mh(`${q.who} · ${p.short}`,`${p.company} · проверено ${q.date}`)+`<div class="modal-b col g12"><div class="row between"><span class="label">Итоговая оценка</span><span class="price" style="font-size:24px">${q.score}</span></div><div>${p.criteria.map((c,i)=>`<div class="rub"><span class="sm">${esc(c)}</span><span class="stars">${[1,2,3,4,5].map(n=>`<span style="color:${n<=q.stars[i]?'var(--star)':'var(--track)'};line-height:0">${ic('star')}</span>`).join('')}</span></div>`).join('')}</div><div class="quote sm">«${esc(q.comment)}»</div><div class="chips">${p.confirms.map(id=>`<span class="pill ok">${ic('shield')}${esc(SK[id].name)}</span>`).join('')}</div><button class="btn btn-p" data-act="closeModal" style="align-self:flex-end">Закрыть</button></div>`)},
 mentorCons(e){S.consOk[e.dataset.id]='ok';save();render();toast('Консультация подтверждена — студент увидит это в своём плане','cal')},
 consAssess(e){const id=e.dataset.id;UI.ca={id,stars:4};consModal()},
 caStar(e){UI.ca.comment=($('#ca-comment')||{}).value||'';UI.ca.stars=+e.dataset.id;consModal()},
 caSave(){const {id,stars}=UI.ca,c=($('#ca-comment').value||'').trim();if(c.length<20){toast('Напишите короткий отзыв — хотя бы одно предложение','x');return}
  const mm=MENTORS.find(m=>m.id===S.mentorReq[id].m)||mentorMe();S.consOk['s-'+id]='assessed';S.mentorConf=S.mentorConf||{};S.mentorConf[id]={passed:stars>=4,stars,comment:c,by:mm.name+', '+mm.pos,date:todayStr()};save();closeModal();render();
  toast(stars>=4?`Навык «${SK[id].name}» подтверждён оценкой ментора`:`Оценка сохранена: навык пока не подтверждён`,stars>=4?'shield':'pen')},
 star(e){const [pid,i,n]=e.dataset.id.split(':');UI.rv[pid].stars[+i]=+n;UI.rv[pid].comment=($('#rv-comment')||{}).value||UI.rv[pid].comment;render()},
 returnReview(e){const pid=e.dataset.id,c=($('#rv-return').value||'').trim();if(c.length<20){toast('Опишите, что доработать, — минимум одно предложение','x');$('#rv-return').focus();return}
  const w=wsOf(pid);w.returned={comment:c,date:todayStr()};w.history=[...(w.history||[]),{comment:c,date:todayStr()}];w.attempt=(w.attempt||1)+1;S.pstat[pid]='active';save();render();
  openModal(mh('Решение возвращено',P(pid).short)+`<div class="modal-b col g12"><p class="t2">Студент увидит ваш комментарий в рабочем пространстве проекта и сможет отправить новую версию.</p><div class="quote sm">«${esc(c)}»</div><div class="col g8"><button class="btn btn-p btn-block" data-act="role" data-role="student" data-then="workspace-${pid}">Посмотреть глазами студента</button><button class="btn btn-s btn-block" data-act="closeModal">Готово</button></div></div>`)},
 finishReview(e){const pid=e.dataset.id,rv=UI.rv[pid];rv.sel=$$('[data-sk]').filter(x=>x.checked).map(x=>x.dataset.sk);if(!rv.sel.length){toast('Отметьте хотя бы один навык для подтверждения','x');return}
  rv.comment=$('#rv-comment').value.trim();if(rv.comment.length<20){toast('Напишите отзыв для студента и компании','x');return}S.sel[pid]=rv.sel;const score=dec((rv.stars.reduce((a,b)=>a+b,0)/rv.stars.length).toFixed(1));finishProject(pid,score,rv.comment);render();
  openModal(mh('Проверка завершена',`Оценка ${score} · подтверждено ${rv.sel.length} ${plural(rv.sel.length,'навык','навыка','навыков')}`)+`<div class="modal-b col g12"><p class="t2">Студент получил подтверждение навыков, а ${esc(P(pid).company)} — результат с вашим отзывом.${P(pid).hiring?' Компания сразу отправила приглашение на интервью.':''}</p><div class="chips">${rv.sel.map(id=>`<span class="pill ok">${ic('shield')}${SK[id].name}</span>`).join('')}</div><div class="col g8"><button class="btn btn-p btn-lg btn-block" data-act="role" data-role="student" data-then="complete-${pid}">Посмотреть глазами студента</button>${EMPLOYERS[P(pid).emp]?`<button class="btn btn-s btn-block" data-act="role" data-role="employer" data-then="empdash">Посмотреть глазами компании</button>`:''}</div></div>`)},
 /* uni */
 uniReport(){toast('Отчёт за семестр сформирован и отправлен на почту центра карьеры','file')},
 uniIntegrate(){toast('Заявка на интеграцию проекта отправлена Т-Банку и руководителю курса','send')},
};

/* ================= events ================= */
document.addEventListener('click',ev=>{
 const t=ev.target.closest('[data-act],[data-go]');
 if(!ev.target.closest('.pop')&&!ev.target.closest('[data-act="notif"],[data-act="me"],[data-act="tour"],[data-act="roles"]')&&!ev.target.closest('.search'))closePop();
 if(!t)return;
 if(t.dataset.go){ev.preventDefault();closeModal();const g=t.dataset.go;
  if(g==='onb'){closePop();UI.onb={step:'goal',goal:S.goal};renderOnb();return}
  if(g.startsWith('auth')&&parse().n!=='auth')UI.login=!!t.dataset.login;
  const i=g.indexOf('-');i<0?go(g):go(g.slice(0,i),g.slice(i+1));return}
 const f=A[t.dataset.act];if(f){if(t.dataset.act!=='closeModalScrim')ev.stopPropagation();f(t,ev)}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('#modalRoot').innerHTML&&S.onboarded)closeModal();else if(UI.ai)A.aiClose();closePop()}
 if(e.key==='Enter'&&e.target.id==='gsearch'){const b=$('#searchPop .pop-item');if(b)b.click()}});
document.addEventListener('input',e=>{
 const id=e.target.id;
 if(id==='ws-sum'){const pid=e.target.dataset.id,w=wsOf(pid);w.summary=e.target.value;save();const c=$('#sumCount');if(c)c.textContent=`${w.summary.trim().length} / ${SUM_MIN}+ знаков`;const b=$('#wsSubmit');if(b)b.disabled=!wsReady(w);const h=$('#wsHint');if(h)h.textContent=wsHint(w);return}
 if(id==='gsearch')return doSearch(e.target.value);
 if(id==='pf-q'){UI.proj.q=e.target.value;renderProjList()}
 if(id==='uf-q'){UI.uni.q=e.target.value;renderUniList()}
 if(id==='cf-min'){UI.cand.min=+e.target.value;$('#cf-minv').textContent=UI.cand.min+'%';renderCandList()}
 if(id.startsWith('calc-')){const k=id.slice(5);UI.calc[k]=+e.target.value;const v=$('#'+id+'-v');if(v)v.textContent=k==='cost'?rub(UI.calc[k]):k==='fail'?UI.calc[k]+'%':UI.calc[k];$('#calcOut').innerHTML=calcOut()}
 if(id==='cf-ans'){UI.cfAns=e.target.value;const c=$('#cf-count');if(c)c.textContent=e.target.value.split(/\s+/).filter(Boolean).length+' слов'}
 if(id==='rv-comment'){const pid=parse().id;if(UI.rv[pid])UI.rv[pid].comment=e.target.value}
});
document.addEventListener('change',e=>{
 const id=e.target.id,v=e.target.type==='checkbox'?e.target.checked:e.target.value;
 if(id.startsWith('pf-')){UI.proj[id.slice(3)]=v;renderProjList()}
 if(id.startsWith('jf-')){UI.jobs[id.slice(3)]=v;renderJobList()}
 if(id==='cf-prof'){UI.cand.prof=v;renderCandList()}
 if(id==='uf-prog'){UI.uni.prog=v;renderUniList()}
 if(e.target.dataset.sk){const pid=parse().id;const rv=UI.rv[pid];if(rv)rv.sel=$$('[data-sk]').filter(x=>x.checked).map(x=>x.dataset.sk)}
 if(id==='upl'&&e.target.files[0]){const f=e.target.files[0],pid=e.target.dataset.id;if(f.size>50*1048576){toast('Файл больше 50 МБ — сожмите его или загрузите ссылкой в итоге решения','x');return}storeUpload('ws-'+pid,f).then(rec=>{Object.assign(wsOf(pid),{file:f.name,fileSize:f.size,fileDemo:false});save();render();toast('Файл загружен: '+f.name,'upload')})}
 if(id==='resumeFile'&&e.target.files[0]){UI.onb.file=e.target.files[0].name;UI.onb.step='parsing';renderOnb()}
});
document.addEventListener('submit',e=>{
 e.preventDefault();const id=e.target.id;
 if(id==='aiForm'){const i=$('#aiInput');if(i.value.trim())aiSend(i.value.trim());return}
 if(id==='chatForm'){const inp=$('#chat-in'),txt=inp.value.trim();if(!txt)return;const th=S.chats[$('#chat-id').value],side=$('#chat-side').value;
  th.msgs.push({f:side==='student'?'me':'them',t:txt,tm:tnow()});if(side==='employer')th.unreadS=(th.unreadS||0)+1;else th.unreadE=(th.unreadE||0)+1;save();render();
  if(side==='student'&&chatReply(th,txt)!==null){UI.typing[th.id]=1;render();setTimeout(()=>{UI.typing[th.id]=0;const who=th.kind==='team'?S.teams[th.pid].members[0][0]:null;th.msgs.push({f:'them',who,t:chatReply(th,txt),tm:tnow()});save();if(parse().n==='messages'&&parse().id===th.id)render();else{th.unreadS=(th.unreadS||0)+1;save();renderShell(parse())}},1100)}
  else if(side==='employer'){setTimeout(()=>{th.msgs.push({f:'me',t:'Спасибо! Всё понял, буду готов.',tm:tnow()});th.unreadE=0;save();if(parse().n==='empmessages')render()},1400)}
  return}
 if(id==='authForm'){const role=e.target.dataset.role;const ag=$('#au-agree');if(ag&&!ag.checked){$('#au-err').hidden=false;return}
  const b=$('#au-submit');b.disabled=true;b.innerHTML='<span class="spin" style="border-top-color:#fff"></span>'+(UI.login?'Входим…':'Создаём аккаунт…');
  setTimeout(()=>{S.authed=true;S.lastRole=role;save();toast(UI.login?'С возвращением!':'Аккаунт создан','check');go(HOME[role])},800);return}
 if(id==='profileForm'){const g=$('#pr-goal').value;const ch=g!==S.goal;S.goal=g;save();render();toast(ch?`Цель изменена: ${T().goal}`:'Профиль сохранён');return}
 if(id==='inviteForm'){const c=$('#inv-id').value;S.empInvited[emp().id+c]=1;save();closeModal();render();toast('Приглашение отправлено','send');return}
 if(id==='vacForm'){const v={type:$('#v-type').value,title:$('#v-title').value.trim()||'Новая позиция',prof:$('#v-prof').value,format:$('#v-format').value,city:$('#v-city').value,salary:$('#v-sal').value?$('#v-sal').value+(/₽/.test($('#v-sal').value)?'':' ₽'):'',paid:$('#v-paid').checked,skills:$('#v-skills').value.split(',').map(s=>s.trim()).filter(Boolean)};S.extraVac.push(v);save();closeModal();render();toast(`${v.type} «${v.title}» опубликована · подобрано 14 кандидатов`,'briefcase');return}
 if(id==='projForm'){const t=$('#pp-title').value.trim(),d=$('#pp-desc').value.trim();if(!t||!d){$('#pp-err').hidden=false;return}
  const fmtv=$('[data-act="ppFormat"].on')?.dataset.id||'Индивидуальный';
  const dir=$('#pp-dir').value;S.published.unshift({pid:'n'+Date.now().toString(36),company:emp().company,ind:emp().ind,emp:emp().id,title:t,task:d,about:`${emp().company}: ${emp().ind}.`,dir,prof:({'Product / Analytics':'Product Manager','Data Analytics':'Data Analyst','Business Analysis':'Business Analyst','Design':'UX/UI Designer','Marketing':'Marketing Manager','Development':'Frontend Developer'})[dir]||'Product Manager',skills:$('#pp-skills').value.split(',').map(s=>s.trim()).filter(Boolean),diff:$('#pp-diff').value,dur:$('#pp-dur').value,format:fmtv,hiring:$('#pp-hire').checked?1:0,deadline:'25 октября'});
  save();go('empjobs');toast('Проект опубликован и появился в каталоге студентов','send')}
});

function afterRender(){if(parse().n==='welcome'&&$('.lp3'))landingInit();else if(typeof lpCleanup==='function')lpCleanup();renderProjList();renderJobList();renderCandList();renderUniList();const tb=$('#threadB');if(tb)tb.scrollTop=tb.scrollHeight}
