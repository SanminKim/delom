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

function courseModal(id){const s=sk(id);const C=[[ACAD,`${s.name} на практике`,'2 недели','Бесплатно','Итоговое задание с автопроверкой'],['Stepik',`${s.name}: интенсив для начинающих`,'3 недели','Бесплатно','Сертификат после финального теста'],['Яндекс Практикум',`${s.name} для аналитиков`,'4 недели','Вводная часть бесплатно','Ревью от наставника']];
 openModal(mh(`Курсы по навыку «${s.name}»`,'После итогового задания навык отмечается как подтверждённый курсом')+`<div class="modal-b col g8">${C.map((c,i)=>`<div class="conf-opt" style="cursor:default">${logo(c[0],'sm')}<span class="grow"><div class="b">${esc(c[1])}</div><div class="sm muted">${c[0]} · ${c[2]} · ${c[3]}</div><div class="xs muted">${c[4]}</div></span><button class="btn ${S.courses[id]&&S.courses[id].i===i?'btn-ok':'btn-s'} btn-sm" data-act="enroll" data-id="${id}:${i}" ${S.courses[id]&&S.courses[id].i===i?'disabled':''}>${S.courses[id]&&S.courses[id].i===i?'В плане':'Записаться'}</button></div>`).join('')}<p class="xs muted">Курсы партнёров показаны как пример интеграции.</p></div>`)}
function mentorModal(){const u=UI.mb,s=sk(u.id);const list=[...MENTORS].sort((a,b)=>b.skills.includes(u.id)-a.skills.includes(u.id));
 openModal(mh(`Оценка ментора: ${s.name}`,'Ментор разберёт вашу работу на созвоне и подтвердит навык, если уровень достаточный')+`<div class="modal-b col g12"><span class="label">Ментор</span>
  <div class="col g8">${list.map(m=>`<button class="team-opt ${u.m===m.id?'on':''}" data-act="mbPick" data-id="${m.id}" style="flex-direction:row;align-items:center">${av(m.ini,m.color,40)}<span class="grow"><div class="b">${m.name}</div><div class="sm muted">${m.pos}</div></span><span class="pill">${ic('star')}${m.rating} · ${m.reviews}</span></button>`).join('')}</div>
  <span class="label">Время</span><div class="grid-3" style="gap:8px">${MSLOTS.map(t=>`<button class="slot ${u.slot===t?'on':''}" data-act="mbSlot" data-id="${t}" style="font-size:13px">${t}</button>`).join('')}</div>
  <label class="field"><span>Что показать ментору</span><select class="sel" id="mb-what"><option>Решение учебного кейса</option><option>Проект из портфолио</option><option>Выполнить задание на созвоне</option></select></label>
  <div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="mbConfirm" ${u.m&&u.slot?'':'disabled'}>Записаться · бесплатно</button></div></div>`)}
function teamsFor(p){const roles=p.prof==='Product Manager'?['Product Manager','Аналитик','UX-исследователь']:p.prof==='Marketing Manager'?['Маркетолог','Аналитик','Дизайнер']:['Аналитик','Product Manager','Дизайнер'];
 return [{name:p.id==='p5'?'Второе объявление':'Growth Team',members:[[...TEAMMATES[0],'Product Manager'],[...TEAMMATES[1],'Frontend / прототипы']],need:roles.filter(r=>r!=='Product Manager').slice(0,2)},
  {name:p.id==='p5'?'Seller Growth':'Data Ninjas',members:[[...TEAMMATES[2],'System Analyst']],need:roles.slice(0,2)},
  {name:'Кейс-клуб ВШЭ',members:[[...TEAMMATES[3],'Аналитик'],[...TEAMMATES[4],'Дизайнер'],[...TEAMMATES[5],'Бизнес-аналитик']],need:[roles[0]]}]}
function teamModal(pid){const p=P(pid),u=UI.team,ts=teamsFor(p);
 openModal(mh(`Команда для проекта «${p.short}»`,'Выберите команду, где нужна ваша роль, или создайте свою')+`<div class="modal-b col g12">
  ${ts.map((t,i)=>`<button class="team-opt ${u.t===i?'on':''}" data-act="teamPick" data-id="${i}"><div class="row between" style="flex-wrap:nowrap"><b>«${t.name}»</b><span class="members">${t.members.map(m=>av(m[1],m[2])).join('')}${t.need.map(()=>`<span class="open">${ic('plus',12)}</span>`).join('')}</span></div><div class="sm muted">${t.members.map(m=>m[0].split(' ')[0]+' — '+m[3]).join(' · ')}</div><div class="chips"><span class="xs muted" style="align-self:center">Ищут:</span>${t.need.map(r=>`<span class="pill ac">${r}</span>`).join('')}</div></button>`).join('')}
  ${u.t!==undefined?`<label class="field"><span>Ваша роль в команде</span><select class="sel" id="team-role">${ts[u.t].need.map(r=>`<option>${r}</option>`).join('')}</select></label>`:''}
  <div class="row between"><button class="btn btn-g btn-sm" data-act="teamOwn">${ic('plus')}Создать свою команду</button><div class="row g8"><button class="btn btn-s" data-act="closeModal">Отмена</button><button class="btn btn-p" data-act="teamJoin" data-id="${pid}" ${u.t===undefined?'disabled':''}>Вступить в команду</button></div></div></div>`)}
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
  ${isA&&d?`<div class="pf-proj fresh"><div class="row between"><b>${p.short}</b><span class="pill">${ic('star')}${S.scores[e.main]||p.score}</span></div><div class="grid-3" style="gap:8px">${p.metrics.map(m=>`<div class="metric"><b>${m[0]}</b><span class="xs muted">${m[1]}</span></div>`).join('')}</div><div class="quote sm">${esc(p.slides[0][2])}</div><div class="xs muted">Проверено ментором ${e.main==='p4'?MENTORS[1].name:MENTORS[0].name} · навыки подтверждены</div></div>`:isA?`<div class="quote sm">Кандидат участвует в вашем проекте «${p.short}». ${pst(e.main)==='review'?'Решение на проверке у ментора.':'Решение ещё не отправлено.'}</div>`:`<div class="quote sm">Последний проект: оценка 4,5 из 5. Отзыв компании: «Самостоятельный, аккуратно работает с данными».</div>`}
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
function fileModal(name){
 if(name.startsWith('funnel')){openModal(mh(name,'Выгрузка событий за сентябрь 2026 · 12 400 пользователей')+`<div class="modal-b col g16">${funnelHtml()}<div class="tbl-wrap"><table class="tbl"><thead><tr><th>user_id</th><th>event</th><th>platform</th><th>ts</th></tr></thead><tbody>${[['u_18342','signup','ios','2026-09-03 10:14'],['u_18342','profile_filled','ios','2026-09-03 10:17'],['u_18342','course_selected','ios','2026-09-03 10:25'],['u_20917','signup','web','2026-09-09 19:02'],['u_20917','cart_add','web','2026-09-09 19:40']].map(r=>`<tr>${r.map(x=>`<td style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`,'wide');return}
 if(name.startsWith('cohorts')){openModal(mh(name,'Обезличенные данные 48 000 клиентов · март–август 2026')+`<div class="modal-b col g16">${cohortHtml()}<div class="tbl-wrap"><table class="tbl"><thead><tr><th>client_id</th><th>open_month</th><th>product</th><th>autopay</th><th>active_m3</th></tr></thead><tbody>${[['c_40211','2026-03','debit','1','1'],['c_40877','2026-06','debit','0','0'],['c_41203','2026-06','credit','0','0'],['c_42019','2026-07','debit','1','—'],['c_42551','2026-08','debit','1','—']].map(r=>`<tr>${r.map(x=>`<td style="font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`,'wide');return}
 if(name.endsWith('.sql')){openModal(mh(name,'Схема таблиц')+`<div class="modal-b"><div class="code">CREATE TABLE clients (
  client_id    TEXT PRIMARY KEY,
  open_date    DATE,
  product      TEXT,   -- debit | credit
  channel      TEXT,   -- app | partner | office
  autopay      BOOLEAN
);
CREATE TABLE activity (
  client_id    TEXT REFERENCES clients,
  month        DATE,
  tx_count     INT
);</div></div>`);return}
 toast('Файл «'+name+'» открыт в режиме предпросмотра','eye')}

/* ================= AI ================= */
function aiOpen(q){UI.ai=true;$('#fab').hidden=true;if(!UI.aiLog.length)UI.aiLog.push({me:0,html:`Привет, Алексей! Я карьерный AI-помощник ${BRAND}. Знаю ваш Skill Passport, проекты и цель — ${T().goal}. Чем помочь?`});renderAI();if(q)aiSend(q)}
function renderAI(){if(!UI.ai){$('#aiRoot').innerHTML='';return}
 $('#aiRoot').innerHTML=`<section class="ai" aria-label="AI-помощник"><div class="ai-h"><span class="ai-ic">${ic('spark',18)}</span><div class="grow"><div class="b">AI Career Assistant</div><div class="xs muted">Отвечает на основе вашего профиля</div></div><button class="x" data-act="aiClose" aria-label="Закрыть">${ic('x',16)}</button></div>
 <div class="ai-body" id="aiBody">${UI.aiLog.map(m=>m.typing?`<div class="msg bot typing"><i></i><i></i><i></i></div>`:`<div class="msg ${m.me?'me':'bot'}">${m.html}${m.acts?`<div class="acts">${m.acts.map(a=>`<button class="btn btn-s btn-sm" ${btnAttr(a[1])}>${a[0]}</button>`).join('')}</div>`:''}</div>`).join('')}</div>
 ${UI.aiLog.length<3?`<div class="sugg">${[`Что мне нужно сделать, чтобы получить стажировку ${T().goal}?`,'Как подтвердить SQL?','Помоги подготовиться к интервью'].map(s=>`<button data-act="aiAsk" data-q="${s}">${s}</button>`).join('')}</div>`:''}
 <form class="ai-f" id="aiForm"><input id="aiInput" placeholder="Спросите о карьере, навыках, вакансиях" autocomplete="off" aria-label="Сообщение"><button class="btn btn-p" type="submit" aria-label="Отправить" style="width:42px;height:42px;padding:0">${ic('send')}</button></form></section>`;
 const b=$('#aiBody');b.scrollTop=b.scrollHeight}
function aiReply(q){
 const t=q.toLowerCase(),tr=T(),r=readiness(),d=mainDone(tr.id),mp=P(tr.main),inv=S.inv[tr.main];
 if(/стажир|что .*нужно|получить|шанс/.test(t))return d?{html:`Сейчас ваш профиль соответствует стажировкам ${tr.goal} примерно на <b>${r}%</b> — после проекта ${mp.company} вы прошли порог 75%.<br><br>Чтобы дойти до уровня Junior:<ol><li>Подтвердить A/B-тестирование — проект Ozon.</li><li>${tr.id==='pm'?'Разобраться с юнит-экономикой.':'Подтвердить статистику тестом.'}</li><li>${inv&&inv.st==='accepted'?`Хорошо пройти интервью в ${mp.company}.`:`Ответить на приглашение ${mp.company}.`}</li></ol>Уже сейчас вам доступно ${fitCount()} подходящих стажировок.`,acts:[['Проект Ozon','go:project-p6'],['Стажировки','go:internships']]}
  :{html:`Сейчас ваш профиль соответствует стажировкам ${tr.goal} примерно на <b>${r}%</b>.<br><br>Рекомендую:<ol><li>Подтвердить навык SQL.</li><li>Выполнить ещё один реальный ${tr.id==='pm'?'продуктовый':'аналитический'} проект.</li><li>Добавить ${tr.id==='pm'?'продуктовые метрики':'дашборд с метриками'} в портфолио.</li></ol>После этого вам будут доступны ещё около 12 подходящих стажировок.`,acts:[['Найти проект','go:projects-sql'],['Посмотреть карьерный путь','go:career']]};
 if(/sql/.test(t))return sk('sql').st==='ok'?{html:`SQL у вас уже подтверждён: ${esc(sk('sql').basis)}. Следующий уровень — оконные функции и когортный анализ: пригодятся в проекте Т-Банка по удержанию.`,acts:[['Проект Т-Банка','go:project-p4']]}:{html:`Сейчас SQL у вас на 70%. Есть два пути:<ol><li><b>Быстро:</b> тест из 5 вопросов, около 7 минут.</li><li><b>Сильнее всего:</b> проект ${mp.company} — вместе с SQL подтвердятся ещё ${confirmsOf(tr.main).length-1} навыка.</li></ol>`,acts:[['Пройти тест','act:test:sql'],['Проект '+mp.company,'go:project-'+tr.main]]};
 if(/интервью|собесед/.test(t))return {html:`${inv?`Интервью в ${mp.company} проведёт ${empOfProj(tr.main).person}. `:''}Как подготовиться:<ol><li>Расскажите кейс по схеме: проблема → данные → вывод → гипотеза → метрика.</li><li>Подготовьте ответ на вопрос «Как бы вы приоритизировали гипотезы?» — используйте RICE.</li><li>Изучите продукт компании: пройдите путь пользователя до оплаты.</li></ol>Могу провести тренировочное интервью — напишите «давай потренируемся».`};
 if(/потрен/.test(t))return {html:`Первый вопрос: <b>«${tr.id==='pm'?'Конверсия в оплату упала на 10%. Ваши первые три действия?':'Retention упал на 5 п.п. Как будете искать причину?'}»</b> Напишите ответ — я дам обратную связь.`};
 if(/проект|подход/.test(t))return {html:`Под цель ${tr.goal} лучше всего подходят: «${mp.title}» от ${mp.company} (подтвердит ${confirmsOf(tr.main).length} навыков), «A/B-тест карточки товара» от Ozon и командный «Онбординг продавцов» от Avito.`,acts:[['Каталог проектов','go:projects'],['Проект '+mp.company,'go:project-'+tr.main]]};
 if(/презентац|структур/.test(t))return {html:'Структура на 10 слайдов: 1) главный вывод, 2) контекст и данные, 3–5) анализ и проблемные места, 6–8) гипотезы с RICE, 9) что проверить первым, 10) ожидаемый эффект. Выводы пишите в заголовках слайдов.'};
 if(/вакан|ozon|vk|яндекс|банк|avito|kaspersky|skillup/.test(t))return {html:'Совпадение считается по подтверждённым навыкам. Для этой позиции проверьте блок «Нужно улучшить»: один подтверждённый навык обычно даёт +3–8% совпадения. Перед откликом добавьте в портфолио проект с метриками.',acts:[['Мои навыки','go:skills']]};
 if(/конверси|retention|причин|действи/.test(t))return {html:'Хороший ход мысли. Сильный ответ на интервью: 1) проверить, не сломался ли сбор данных, 2) разложить метрику по шагам и сегментам, 3) сопоставить с релизами и внешними событиями. Главное — сначала диагноз, потом решение.'};
 return {html:`Понял вопрос. Пока я лучше всего помогаю с планом развития, подбором проектов и стажировок и подготовкой к интервью. Ваша текущая готовность — ${r}%.`,acts:[['Мой путь','go:career']]};
}
function aiSend(q){UI.aiLog.push({me:1,html:esc(q)},{typing:1});renderAI();setTimeout(()=>{UI.aiLog=UI.aiLog.filter(m=>!m.typing);UI.aiLog.push(aiReply(q));renderAI()},750)}

/* ================= project flow ================= */
function finishProject(pid,score){S.pstat[pid]='done';S.recs=S.recs||{};if(!S.recs[pid])S.recs[pid]=REC_T(pid);S.scores[pid]=score;S.flags['d_'+pid]=todayStr();if(!S.inv[pid])S.inv[pid]={st:'new'};ensureInviteChat(pid);S.acted=true;save()}
function runAutoReview(pid){const p=P(pid),mm=pid==='p4'?MENTORS[1]:MENTORS[0];
 openModal(mh('Проверка решения',`${p.company} и ментор ${mm.name} проверяют работу`)+`<div class="modal-b"><div id="rv">${['Автопроверка расчётов','Оценка ментора по критериям компании','Отзыв компании '+p.company,'Обновление Skill Passport'].map((s,i)=>`<div class="review-step" data-i="${i}"><span class="mk"></span><span>${s}</span></div>`).join('')}</div><p class="xs muted" style="margin-top:10px">В демо-режиме проверка занимает несколько секунд. В реальности — около трёх дней.</p></div>`);
 let i=0;const tick=()=>{const el=$(`#rv .review-step[data-i="${i}"]`);if(!el){finishProject(pid,p.score);closeModal();go('complete',pid);return}el.classList.add('on');el.querySelector('.mk').innerHTML=ic('check');i++;setTimeout(tick,600)};setTimeout(tick,450)}
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
 mentorBook(e){UI.mb={id:e.dataset.id,m:null,slot:null};mentorModal()},
 mbPick(e){UI.mb.m=e.dataset.id;mentorModal()},mbSlot(e){UI.mb.slot=e.dataset.id;mentorModal()},
 mbConfirm(){const u=UI.mb,m=MENTORS.find(x=>x.id===u.m);S.mentorReq[u.id]={m:u.m,slot:u.slot};S.acted=true;save();closeModal();render();toast(`Встреча с ментором ${m.name}: ${u.slot}`,'cal')},
 skTab(e){UI.skTab=e.dataset.id;render()},
 skillProof(e){const s=sk(e.dataset.id);openModal(mh(s.name,'Подтверждено · '+s.date)+`<div class="modal-b col g12"><div class="row g8"><span class="pill ok">${ic('shield')}Подтверждено</span>${s.via?`<span class="pill">${s.via==='test'?'Тест':'Проект компании'}</span>`:''}</div><div><span class="label">Основание</span><div class="b" style="margin-top:4px">${esc(s.basis)}</div><div class="sm muted">${esc(s.src)}</div></div><div class="quote sm">Проверка: результат оценён по критериям ${BRAND} и виден работодателям в Skill Passport вместе с основанием.</div>${s.pid?`<button class="btn btn-s btn-sm" data-go="complete-${s.pid}" style="align-self:flex-start">Открыть проект</button>`:''}</div>`)},
 /* projects */
 resetPF(){UI.proj={q:'',prof:'',skill:'',diff:'',dur:'',format:'',company:''};if(parse().id)go('projects');else render()},
 resetJF(){UI.jobs={prof:'',company:'',format:'',level:'',skill:'',paid:false,fit:false};render()},
 join(e){const id=e.dataset.id,p=P(id);
  if(p.format==='Командный'){UI.team={};teamModal(id);return}
  if(!p.wsTasks){S.projApplied[id]=1;S.acted=true;save();render();toast('Заявка отправлена. Компания подтвердит участие в течение 2 дней','send');return}
  openModal(mh(`Участие в проекте ${p.company}`,p.title)+`<div class="modal-b col g12"><ul class="ul"><li>${ic('check')}<span>Приём решений до ${p.deadline}</span></li><li>${ic('check')}<span>Доступ к обезличенным данным компании</span></li><li>${ic('check')}<span>Ментор на связи в чате проекта</span></li></ul><label class="check"><input type="checkbox" id="nda" checked>Согласен с условиями использования данных компании</label><button class="btn btn-p btn-lg btn-block" data-act="confirmJoin" data-id="${id}">Подтвердить участие</button></div>`)},
 confirmJoin(e){if(!$('#nda').checked){toast('Нужно согласиться с условиями использования данных','x');return}const id=e.dataset.id;S.pstat[id]='active';wsOf(id);S.acted=true;save();closeModal();go('workspace',id);toast(`Вы участник проекта ${P(id).company}`)},
 teamPick(e){UI.team.t=+e.dataset.id;teamModal(parse().id)},
 teamOwn(){toast('Команда создана — пригласите участников по ссылке. В демо выберите готовую команду','users')},
 teamJoin(e){const pid=e.dataset.id,p=P(pid),t=teamsFor(p)[UI.team.t];S.teams[pid]={name:t.name,role:$('#team-role').value,members:t.members};S.projApplied[pid]=1;S.acted=true;ensureTeamChat(pid);save();closeModal();render();toast(`Вы в команде «${t.name}»`,'users')},
 tick(e){const [pid,i]=e.dataset.id.split(':');const w=wsOf(pid);w.tasks[+i]=w.tasks[+i]?0:1;save();render()},
 demoFill(e){const p=P(e.dataset.id);S.ws[p.id]={tasks:[1,1,1,1],file:p.wsFile};save();render();toast('Демо-решение заполнено')},
 demoFile(e){const p=P(e.dataset.id);wsOf(p.id).file=p.wsFile;save();render()},
 rmFile(e){wsOf(e.dataset.id).file=null;save();render()},
 submit(e){const pid=e.dataset.id,p=P(pid),mm=pid==='p4'?MENTORS[1]:MENTORS[0];S.pstat[pid]='review';S.acted=true;save();render();
  openModal(mh('Решение отправлено',`${p.short} · ${p.company}`)+`<div class="modal-b col g16"><div class="row g12" style="flex-wrap:nowrap">${av(mm.ini,mm.color,44)}<div><div class="b">Проверяет ${mm.name}</div><div class="sm muted">${mm.pos} · обычно до 3 дней</div></div></div><p class="t2">Ментор оценит решение по критериям компании, подтвердит навыки и передаст результат в ${p.company}. В демо можно пройти проверку за ментора или пропустить её.</p><div class="col g8"><button class="btn btn-p btn-lg btn-block" data-act="role" data-role="mentor" data-then="review-${pid}">${ic('shield')}Проверить глазами ментора</button><button class="btn btn-s btn-block" data-act="skipReview" data-id="${pid}">Пропустить проверку</button></div></div>`)},
 skipReview(e){runAutoReview(e.dataset.id)},
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
 mentorOld(){toast('Это решение уже проверено. В демо полностью доступна проверка решения Алексея Иванова','eye')},
 mentorCons(){toast('Консультация подтверждена, студент получит уведомление','cal')},
 star(e){const [pid,i,n]=e.dataset.id.split(':');UI.rv[pid].stars[+i]=+n;render()},
 returnReview(){toast('В реальном сервисе студент получит замечания и сможет доработать решение','pen')},
 finishReview(e){const pid=e.dataset.id,rv=UI.rv[pid];rv.sel=$$('[data-sk]').filter(x=>x.checked).map(x=>x.dataset.sk);if(!rv.sel.length){toast('Отметьте хотя бы один навык для подтверждения','x');return}
  rv.comment=$('#rv-comment').value;S.sel[pid]=rv.sel;const score=dec((rv.stars.reduce((a,b)=>a+b,0)/rv.stars.length).toFixed(1));finishProject(pid,score);render();
  openModal(mh('Проверка завершена',`Оценка ${score} · подтверждено ${rv.sel.length} ${plural(rv.sel.length,'навык','навыка','навыков')}`)+`<div class="modal-b col g12"><p class="t2">Студент получил подтверждение навыков, а ${P(pid).company} — результат с вашим отзывом. Компания сразу отправила приглашение на интервью.</p><div class="chips">${rv.sel.map(id=>`<span class="pill ok">${ic('shield')}${SK[id].name}</span>`).join('')}</div><div class="col g8"><button class="btn btn-p btn-lg btn-block" data-act="role" data-role="student" data-then="complete-${pid}">Посмотреть глазами студента</button><button class="btn btn-s btn-block" data-act="role" data-role="employer" data-then="empdash">Посмотреть глазами компании</button></div></div>`)},
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
 if(id==='gsearch')return doSearch(e.target.value);
 if(id==='pf-q'){UI.proj.q=e.target.value;renderProjList()}
 if(id==='uf-q'){UI.uni.q=e.target.value;renderUniList()}
 if(id==='cf-min'){UI.cand.min=+e.target.value;$('#cf-minv').textContent=UI.cand.min+'%';renderCandList()}
 if(id.startsWith('calc-')){const k=id.slice(5);UI.calc[k]=+e.target.value;const v=$('#'+id+'-v');if(v)v.textContent=k==='cost'?rub(UI.calc[k]):k==='fail'?UI.calc[k]+'%':UI.calc[k];$('#calcOut').innerHTML=calcOut()}
 if(id==='rv-comment'){const pid=parse().id;if(UI.rv[pid])UI.rv[pid].comment=e.target.value}
});
document.addEventListener('change',e=>{
 const id=e.target.id,v=e.target.type==='checkbox'?e.target.checked:e.target.value;
 if(id.startsWith('pf-')){UI.proj[id.slice(3)]=v;renderProjList()}
 if(id.startsWith('jf-')){UI.jobs[id.slice(3)]=v;renderJobList()}
 if(id==='cf-prof'){UI.cand.prof=v;renderCandList()}
 if(id==='uf-prog'){UI.uni.prog=v;renderUniList()}
 if(e.target.dataset.sk){const pid=parse().id;const rv=UI.rv[pid];if(rv)rv.sel=$$('[data-sk]').filter(x=>x.checked).map(x=>x.dataset.sk)}
 if(id==='upl'&&e.target.files[0]){wsOf(e.target.dataset.id).file=e.target.files[0].name;save();render()}
 if(id==='resumeFile'&&e.target.files[0]){UI.onb.file=e.target.files[0].name;UI.onb.step='parsing';renderOnb()}
});
document.addEventListener('submit',e=>{
 e.preventDefault();const id=e.target.id;
 if(id==='aiForm'){const i=$('#aiInput');if(i.value.trim())aiSend(i.value.trim());return}
 if(id==='chatForm'){const inp=$('#chat-in'),txt=inp.value.trim();if(!txt)return;const th=S.chats[$('#chat-id').value],side=$('#chat-side').value;
  th.msgs.push({f:side==='student'?'me':'them',t:txt,tm:tnow()});if(side==='employer')th.unreadS=(th.unreadS||0)+1;else th.unreadE=(th.unreadE||0)+1;save();render();
  if(side==='student'){UI.typing[th.id]=1;render();setTimeout(()=>{UI.typing[th.id]=0;const who=th.kind==='team'?S.teams[th.pid].members[0][0]:null;th.msgs.push({f:'them',who,t:chatReply(th,txt),tm:tnow()});save();if(parse().n==='messages'&&parse().id===th.id)render();else{th.unreadS=(th.unreadS||0)+1;save();renderShell(parse())}},1100)}
  else{setTimeout(()=>{th.msgs.push({f:'me',t:'Спасибо! Всё понял, буду готов.',tm:tnow()});th.unreadE=0;save();if(parse().n==='empmessages')render()},1400)}
  return}
 if(id==='authForm'){const role=e.target.dataset.role;const ag=$('#au-agree');if(ag&&!ag.checked){$('#au-err').hidden=false;return}
  const b=$('#au-submit');b.disabled=true;b.innerHTML='<span class="spin" style="border-top-color:#fff"></span>'+(UI.login?'Входим…':'Создаём аккаунт…');
  setTimeout(()=>{S.authed=true;S.lastRole=role;save();toast(UI.login?'С возвращением!':'Аккаунт создан','check');go(HOME[role])},800);return}
 if(id==='profileForm'){const g=$('#pr-goal').value;const ch=g!==S.goal;S.goal=g;save();render();toast(ch?`Цель изменена: ${T().goal}`:'Профиль сохранён');return}
 if(id==='inviteForm'){const c=$('#inv-id').value;S.empInvited[emp().id+c]=1;save();closeModal();render();toast('Приглашение отправлено','send');return}
 if(id==='vacForm'){const v={type:$('#v-type').value,title:$('#v-title').value.trim()||'Новая позиция',prof:$('#v-prof').value,format:$('#v-format').value,city:$('#v-city').value,salary:$('#v-sal').value?$('#v-sal').value+(/₽/.test($('#v-sal').value)?'':' ₽'):'',paid:$('#v-paid').checked,skills:$('#v-skills').value.split(',').map(s=>s.trim()).filter(Boolean)};S.extraVac.push(v);save();closeModal();render();toast(`${v.type} «${v.title}» опубликована · подобрано 14 кандидатов`,'briefcase');return}
 if(id==='projForm'){const t=$('#pp-title').value.trim(),d=$('#pp-desc').value.trim();if(!t||!d){$('#pp-err').hidden=false;return}
  const fmtv=$('[data-act="ppFormat"].on')?.dataset.id||'Индивидуальный';
  S.published.unshift({title:t,task:d,about:`${emp().company}: ${emp().ind}.`,dir:$('#pp-dir').value,prof:'Product Manager',skills:$('#pp-skills').value.split(',').map(s=>s.trim()).filter(Boolean),diff:$('#pp-diff').value,dur:$('#pp-dur').value,format:fmtv,hiring:$('#pp-hire').checked?1:0,deadline:'25 октября'});
  save();go('empjobs');toast('Проект опубликован и появился в каталоге студентов','send')}
});

function afterRender(){if(parse().n==='welcome'&&$('.lp3'))landingInit();else if(typeof lpCleanup==='function')lpCleanup();renderProjList();renderJobList();renderCandList();renderUniList();const tb=$('#threadB');if(tb)tb.scrollTop=tb.scrollHeight}
