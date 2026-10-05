/* ================= shared student bits ================= */
const VIEWS={};
function reqMarks(skills){return `<div class="req">${skills.map(n=>{const s=skByName(n);if(s&&(s.st==='ok'||s.st==='self'))return `<span class="y">${ic('check',14)}${esc(n)}</span>`;if(s&&s.st==='progress')return `<span class="t">△ ${esc(n)}</span>`;return `<span class="n">○ ${esc(n)}</span>`}).join('')}</div>`}
function jobCard(j,compact){
 const m=matchOf(j),lk=!unlocked(j),isNew=mainDone(j.track||'x')&&j.min>0,applied=S.applied[j.id],tr=TRACKS[j.track]||T();
 return `<article class="card jcard ${lk?'locked':''} ${lk?'':'hov'}" ${lk?'':`data-go="job-${j.id}"`}>
  <div class="row g12" style="align-items:flex-start;flex-wrap:nowrap">${logo(j.company)}<div class="grow"><div class="row g8"><span class="sm t2 b">${esc(j.company)}</span>${isNew||j.isNew?'<span class="new-tag">Новое</span>':''}</div><h3 style="margin-top:2px">${esc(j.title)}</h3><div class="meta" style="margin-top:6px"><span>${ic('pin')}${j.city} / ${j.format.toLowerCase()}</span>${j.salary?`<span>${ic('briefcase')}${j.salary}</span>`:''}</div></div>${ring(m,54)}</div>
  ${compact?`<div class="chips">${j.skills.map(s=>`<span class="pill">${esc(s)}</span>`).join('')}</div>`:`<div><div class="xs muted" style="margin-bottom:6px">Из необходимых навыков</div>${reqMarks(j.skills)}</div>`}
  <div class="row between" style="margin-top:auto"><div class="chips"><span class="pill ${j.type==='intern'?'ac':''}">${j.type==='intern'?'Стажировка':'Вакансия'}</span>${j.paid?'<span class="pill">Оплачиваемая</span>':''}</div>
  <div class="row g8">${compact?`<button class="btn btn-s btn-sm" data-go="job-${j.id}">Подробнее</button>`:applied?`<span class="pill ok">${ic('check')}Отклик отправлен</span>`:lk?'':`<button class="btn btn-p btn-sm" data-act="apply" data-id="${j.id}">Откликнуться</button>`}</div></div>
  ${lk?`<div class="lock-veil"><span class="lk">${ic('lock')}</span><div class="b">Откроется при готовности ${j.min}% к ${tr.goal}</div><div class="sm muted">Сейчас ${readinessOf(tr.id)}%. Подтвердите ${tr.focus} в проекте</div><button class="btn btn-s btn-sm" data-go="project-${tr.main}">Как открыть</button></div>`:''}
 </article>`}
function projCard(p){
 const st=pst(p.id),team=S.teams[p.id];
 return `<article class="card pcard hov" data-go="project-${p.id}">
  <div class="row g12" style="flex-wrap:nowrap;align-items:flex-start">${logo(p.company)}<div class="grow"><div class="row g8"><span class="sm t2 b">${esc(p.company)}</span>${p.isNew?'<span class="new-tag">Новый</span>':''}${st==='active'?'<span class="pill pr">В работе</span>':st==='review'?'<span class="pill ac">На проверке</span>':st==='done'?`<span class="pill ok">${ic('check')}Завершён</span>`:team?`<span class="pill ac">${ic('users')}В команде</span>`:S.projApplied[p.id]?'<span class="pill">Заявка отправлена</span>':''}</div><h3 style="margin-top:2px">${esc(p.title)}</h3><div class="xs muted" style="margin-top:2px">${esc(p.ind)}</div></div></div>
  <div class="meta"><span>${ic('target')}${esc(p.dir)}</span><span>${ic('clock')}${esc(p.dur)}</span><span>${ic('layers')}${esc(p.diff)}</span><span>${ic(p.format==='Командный'?'users':'user')}${esc(p.format)}</span></div>
  <div class="chips">${p.skills.map(s=>`<span class="pill">${esc(s)}</span>`).join('')}</div>
  <div class="row between" style="margin-top:auto"><div class="col g4"><span class="reward">${ic('shield',16)}+${p.reward} ${plural(p.reward,'подтверждённый навык','подтверждённых навыка','подтверждённых навыков')}</span>${p.hiring?`<span class="xs muted">${ic('mail',12)} Лучшим — приглашение на интервью</span>`:''}</div><button class="btn btn-s btn-sm">Посмотреть проект</button></div>
 </article>`}
function levelCard(){const l=level(),earned=BADGES.filter(b=>b.ok());
 return `<section class="card col g12"><div class="row between"><h2>Уровень и достижения</h2><button class="btn btn-g btn-sm" data-go="profile">Все</button></div>
  <div class="row g12" style="flex-wrap:nowrap"><span class="lvl">${l.n}</span><div class="grow col g6"><div class="row between"><b>${l.name}</b><span class="xs muted">${fmt(l.xp)} XP</span></div>${bar(l.pct,'thin')}<span class="xs muted">${l.nextName?`До уровня «${l.nextName}» — ${fmt(l.next-l.xp)} XP`:'Максимальный уровень'}</span></div></div>
  <div class="row between"><span class="streak">${ic('flame',14)}Серия ${streak()} ${plural(streak(),'день','дня','дней')}</span><span class="xs muted">${earned.length} из ${BADGES.length} значков</span></div>
  <div class="bdg-mini">${BADGES.map(b=>`<span class="${b.ok()?'':'off'}" title="${b.n}: ${b.d}">${ic(b.ic,16)}</span>`).join('')}</div></section>`}

/* ================= dashboard ================= */
VIEWS.dashboard=()=>{
 const t=T(),r=readiness(),m=t.main,mp=P(m),st=pst(m),inv=S.inv[m],d=st==='done';
 let nx;
 if(st==='none')nx=['Следующий шаг',t.caseTitle,t.caseText,'Начать кейс','go:project-'+m];
 else if(st==='active'){const n=wsOf(m).tasks.filter(Boolean).length;nx=['Проект в работе',`Заверши проект ${mp.company}: выполнено ${n} из 4 задач`,`Приём решений до ${mp.deadline}. Лучшие участники получат приглашение на интервью.`,'Продолжить','go:workspace-'+m]}
 else if(st==='review')nx=['Решение на проверке',`Ментор проверяет проект «${mp.short}»`,'Обычно проверка занимает до трёх дней. В демо её можно пройти за ментора прямо сейчас.','Проверить как ментор','go:review-'+m];
 else if(!S.portfolio[m])nx=['Следующий шаг',`Добавь проект ${mp.company} в портфолио`,'Работодатели видят проекты с отзывами компаний в первую очередь. Это +3% к готовности.','Добавить','act:addPortfolio:'+m];
 else if(inv&&inv.st!=='accepted')nx=['Приглашение на интервью',`${mp.company} приглашает тебя на позицию ${mp.invitePos}`,'Компания изучила твоё решение и хочет познакомиться. Выбери время в чате.','Открыть чат','go:messages-inv-'+m];
 else nx=['Интервью назначено',`${mp.company} · ${inv.slot}`,'Потренируйся с AI-помощником: разберём типовые вопросы и твой кейс.','Подготовиться','act:aiInterview'];
 const gaps=reqSk().filter(s=>s.st!=='ok').sort((a,b)=>(b.st==='progress')-(a.st==='progress')).slice(0,5);
 const recJobs=d?newlyUnlocked().slice(0,2):t.recJobs.map(jobById);
 const recP=d?P(t.after):mp;
 const chips=recP.id===m?t.chips:recP.skills;
 return `
 <section class="hero">
  <div class="col g16">
   <div class="row g8"><span class="pill ac">${ic(t.icon)}Цель: ${t.goal}</span>${r>t.base?`<span class="pill ok">${ic('trend')}+${r-t.base}% за неделю</span>`:''}</div>
   <h1>Привет, Алексей!<br><span style="color:var(--text-2);font-weight:600">${d?`Проект ${mp.company} завершён — до позиции ${t.junior} стало ближе.`:`До позиции ${t.junior} осталось несколько шагов.`}</span></h1>
   <p class="t2" style="max-width:560px">${BRAND} подбирает стажировки по подтверждённым навыкам и проектам, а не только по резюме. Чем больше навыков подтверждено реальной работой, тем больше компаний видят ваш профиль.</p>
   <div class="row g8"><button class="btn btn-p" data-go="career">${ic('route')}Мой карьерный путь</button><button class="btn btn-s" data-go="skills">${ic('shield')}Skill Passport</button></div>
  </div>
  <div class="readiness col g12">
   <div class="row between"><span class="label">Карьерная готовность</span><span class="xs muted">${t.goal}</span></div>
   <div class="row g8" style="align-items:baseline"><span class="big-num">${r}%</span>${r>t.base?`<span class="delta">↑ с ${t.base}%</span>`:''}</div>
   ${bar(r,'o fat')}
   <div class="row between xs muted"><span>Стажёр</span><span style="color:var(--text-2)">75% — ещё 5 стажировок</span><span>Junior</span></div>
   <div class="divider" style="margin:4px 0"></div>
   <div class="sm t2">${r>=75?`Порог 75% пройден: вам открылись ${newlyUnlocked().length} новых стажировок.`:`Подтвердите ${t.focus}, чтобы преодолеть порог 75%.`}</div>
  </div>
 </section>
 <div class="split" style="margin-top:20px">
  <div class="stack">
   <section class="next">
    <div class="grow col g6" style="min-width:240px"><span class="label">${nx[0]}</span><h2 style="font-size:20px">${nx[1]}</h2><p class="muted">${nx[2]}</p></div>
    <button class="btn btn-lg" ${btnAttr(nx[4])}>${nx[3]}${ic('arR')}</button>
   </section>
   <section class="card">
    <div class="card-h"><h2>${d?'Новые возможности для вас':'Рекомендуемые возможности'}</h2><button class="btn btn-g btn-sm" data-go="internships">Все стажировки${ic('arR')}</button></div>
    <div class="grid-2">${recJobs.map(j=>jobCard(j,true)).join('')}</div>
   </section>
   <section class="card">
    <div class="card-h"><h2>Рекомендуемый проект</h2><button class="btn btn-g btn-sm" data-go="projects">Каталог проектов${ic('arR')}</button></div>
    <div class="row g16" style="align-items:flex-start;flex-wrap:nowrap">${logo(recP.company,'lg')}
     <div class="grow col g8"><h3 style="font-size:17px">${esc(recP.title)}</h3>
      <div class="meta"><span>${ic('building')}Компания: ${esc(recP.company)}</span><span>${ic('layers')}Сложность: ${recP.diff}</span><span>${ic('clock')}${recP.dur}</span></div>
      <div class="chips">${chips.map(s=>`<span class="pill">${s}</span>`).join('')}</div>
      <div class="row g8" style="margin-top:6px"><button class="btn btn-p btn-sm" data-go="project-${recP.id}">Участвовать</button><span class="reward">${ic('shield',16)}+${recP.reward} ${plural(recP.reward,'навык','навыка','навыков')} в Skill Passport</span></div>
     </div></div>
   </section>
  </div>
  <div class="stack">
   <section class="card">
    <div class="card-h"><h2>Карьерный прогресс</h2></div>
    <div class="grid-2" style="gap:10px">
     <div class="stat" data-go="career" style="cursor:pointer"><div class="v">${haveCount()}<small> из 12</small></div><div class="sm muted">необходимых навыков</div></div>
     <div class="stat" data-go="portfolio" style="cursor:pointer"><div class="v">${projCount()}</div><div class="sm muted">${plural(projCount(),'выполненный проект','выполненных проекта','выполненных проектов')}</div></div>
     <div class="stat" data-go="skills" style="cursor:pointer"><div class="v" style="color:var(--green)">${confReq()}</div><div class="sm muted">${plural(confReq(),'подтверждённый навык','подтверждённых навыка','подтверждённых навыков')}</div></div>
     <div class="stat" data-go="internships" style="cursor:pointer"><div class="v">${fitCount()}</div><div class="sm muted">${plural(fitCount(),'подходящая стажировка','подходящие стажировки','подходящих стажировок')}</div></div>
    </div>
   </section>
   ${levelCard()}
   ${readyCard()}
   <section class="card">
    <div class="card-h"><h2>Чего не хватает</h2><button class="btn btn-g btn-sm" data-go="skills">Все</button></div>
    ${gaps.map(s=>`<div class="row between" style="padding:8px 0;border-top:1px solid var(--border);flex-wrap:nowrap"><div class="grow"><div class="b" style="font-size:13.5px">${s.name}</div><div class="xs muted">${stLabel(s)}${s.st==='progress'?' · '+s.pct+'%':''}${s.plan?' · '+(s.plan==='course'?'курс в плане':'встреча с ментором'):''}</div></div><button class="linkish" data-act="howConfirm" data-id="${s.id}">Как подтвердить</button></div>`).join('')||'<p class="sm muted">Все навыки для цели подтверждены.</p>'}
   </section>
   <section class="card hov" data-go="try" style="background:var(--surface-2)">
    <div class="row g12" style="flex-wrap:nowrap"><span class="logo" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('compass',20)}</span><div><h3>Попробуй профессию за 1 час</h3><p class="sm muted">6 симуляторов реальных рабочих ситуаций</p></div></div>
   </section>
  </div>
 </div>`};

/* ================= career ================= */
VIEWS.career=()=>{
 const t=T(),r=readiness(),m=t.main,st=pst(m),d=st==='done',inv=S.inv[m],mp=P(m);
 const item=id=>{
  if(id==='@case')return `<div class="ri"><div class="ri-top"><span class="mk ok">${ic('check')}</span><span class="b grow">${t.trainCase}</span></div><span class="xs muted">${ACAD} · завершён в марте</span></div>`;
  if(id==='@real')return `<div class="ri"><div class="ri-top"><span class="mk ${d?'ok':st==='none'?'':'pr'}" style="--p:${st==='active'?wsOf(m).tasks.filter(Boolean).length*25:st==='review'?90:0}">${d?ic('check'):''}</span><span class="b grow">Реальный проект компании</span></div><span class="xs ${d?'':'muted'}" style="${d?'color:var(--green)':''}">${d?`${mp.company} · оценка ${S.scores[m]||mp.score}`:st==='active'?mp.company+' · в процессе':st==='review'?mp.company+' · на проверке':'Не начат'}</span><button class="linkish" data-go="${d?'complete-'+m:st==='none'?'project-'+m:'workspace-'+m}">${d?'Смотреть результат':st==='none'?'Выбрать проект':'Открыть'}</button></div>`;
  if(id==='@intern'){const a=inv&&inv.st==='accepted';return `<div class="ri"><div class="ri-top"><span class="mk ${a?'pr':''}" style="--p:${a?50:0}">${d?'':ic('lock')}</span><span class="b grow">Стажировка</span></div><span class="xs muted">${a?`Интервью в ${mp.company} · ${inv.slot}`:d?`Приглашение от ${mp.company} ждёт ответа`:'Откроется после реального проекта'}</span>${d&&!a?`<button class="linkish" data-go="messages-inv-${m}">Ответить на приглашение</button>`:''}</div>`}
  if(id==='@junior')return `<div class="ri"><div class="ri-top"><span class="mk">${ic('lock')}</span><span class="b grow">${t.junior}</span></div><span class="xs muted">Цель · готовность 90%+</span></div>`;
  const s=sk(id);const cls=s.st==='ok'?'ok':s.st==='self'?'self':s.st==='progress'?'pr':'';
  return `<div class="ri"><div class="ri-top"><span class="mk ${cls}" style="--p:${s.pct||0}">${s.st==='ok'||s.st==='self'?ic('check'):''}</span><span class="b grow">${s.name}</span>${s.st==='ok'?`<span style="color:var(--green)" title="Подтверждено">${ic('shield',16)}</span>`:s.st==='progress'?`<span class="sm b" style="color:var(--orange)">${s.pct}%</span>`:''}</div>${s.st==='progress'?bar(s.pct,'o thin'):''}${s.st!=='ok'?`<button class="linkish" data-act="howConfirm" data-id="${s.id}">${s.plan?'✓ '+(s.plan==='course'?'Курс в плане':'Записан к ментору'):'Как подтвердить навык'}</button>`:`<span class="xs" style="color:var(--green)">Подтверждено${s.fresh?' · '+(s.via==='test'?'тест':'проект'):''}</span>`}</div>`};
 const stState=i=>i===0?'done':i===1?'cur':i===2?(d?'done':'cur'):(d?'cur':'lock');
 const gaps=reqSk().filter(s=>!has(s)||s.st==='progress');
 return `
 <div class="page-h"><div><span class="label">Карьерный путь</span><h1 style="margin-top:4px">Моя цель: ${t.goal}</h1><p>Дорожная карта собрана из требований 140 стажировок ${t.goal} на платформе. Галочка — навык есть, щит — подтверждён проектом, тестом или ментором.</p></div>
 <button class="btn btn-s" data-act="changeGoal">${ic('target')}Сменить цель</button></div>
 <section class="card" style="margin-bottom:20px"><div class="row g20" style="align-items:center">
  ${ring(r,96,'big')}
  <div class="grow col g6" style="min-width:220px"><span class="label">Карьерная готовность</span><h2>${r}% до стажировки ${t.goal}</h2><div class="sm muted">${haveCount()} из 12 навыков · ${confReq()} подтверждено · ${projCount()} ${plural(projCount(),'проект','проекта','проектов')}</div></div>
  <div class="col g6" style="min-width:240px;flex:1"><span class="label">Не хватает</span><div class="chips">${gaps.map(s=>`<button class="toggle-chip" data-act="howConfirm" data-id="${s.id}">${s.name}${s.st==='progress'?' · '+s.pct+'%':''}</button>`).join('')||'<span class="sm muted">Всё закрыто</span>'}</div></div>
 </div></section>
 <div class="road">${t.stages.map((s,i)=>{const stt=stState(i);return `<section class="stage ${stt}"><div class="row g12"><span class="st-num">${stt==='done'?ic('check',14):i+1}</span><div><div class="label">Этап ${i+1}</div><h3>${s.n}</h3></div></div>${s.items.map(item).join('')}</section>`}).join('')}</div>`};

/* ================= skills ================= */
VIEWS.skills=()=>{
 const t=T();const all=skAll().filter(s=>t.req.includes(s.id)||s.st!=='gap');
 const cnt={ok:all.filter(s=>s.st==='ok').length,progress:all.filter(s=>s.st==='progress').length,no:all.filter(s=>s.st==='self'||s.st==='gap').length};
 const tb=UI.skTab;const list=all.filter(s=>tb==='all'||(tb==='ok'&&s.st==='ok')||(tb==='progress'&&s.st==='progress')||(tb==='no'&&(s.st==='self'||s.st==='gap')));
 const conf=confAll();
 return `
 <div class="page-h"><div><span class="label">Proof of Skill</span><h1 style="margin-top:4px">Мои навыки</h1><p>Навык считается подтверждённым, когда за ним стоит проверяемое основание: проект компании, тест или оценка ментора. Работодатели видят основание рядом с каждым навыком.</p></div><button class="btn btn-p" data-act="test" data-id="sql">${ic('test')}Пройти тест по SQL</button></div>
 <section class="passport" style="margin-bottom:20px">
  <div class="row between" style="margin-bottom:18px"><div><div class="label" style="color:rgba(255,255,255,.7)">Skill Passport · DL-2026-04812</div><h2 style="font-size:22px;margin-top:4px;color:#fff">Алексей Иванов</h2><div class="sm" style="color:rgba(255,255,255,.78)">${conf.length} ${plural(conf.length,'подтверждённая компетенция','подтверждённые компетенции','подтверждённых компетенций')} · обновлён ${conf.some(s=>s.fresh)?todayStr():'4 мая 2026'}</div></div>
   <button class="btn btn-sm" style="background:rgba(255,255,255,.16);color:#fff;border-color:rgba(255,255,255,.25)" data-act="copyLink">${ic('copy')}Поделиться паспортом</button></div>
  <div class="pp-grid">${conf.map(s=>`<div class="pp-card"><div class="row between"><span class="b" style="font-size:15px">${s.name}</span>${s.fresh?'<span class="new-tag" style="background:rgba(255,255,255,.92)">Новое</span>':ic('shield',18)}</div><span class="xs">${esc(s.basis)}</span><span class="xs">${esc(s.src)} · ${s.date}</span></div>`).join('')}</div>
 </section>
 <div class="tabs" role="tablist">${[['all','Все',all.length],['ok','Подтверждено',cnt.ok],['progress','В процессе',cnt.progress],['no','Не подтверждено',cnt.no]].map(([k,l,n])=>`<button class="${tb===k?'on':''}" data-act="skTab" data-id="${k}">${l}<span class="n">${n}</span></button>`).join('')}</div>
 <section class="card sk-list" style="padding:0">${list.map(s=>`<div class="sk">
  <div><div class="b">${s.name}</div><div class="xs muted">${t.req.includes(s.id)?'Нужен для '+t.goal:'Дополнительный навык'}</div></div>
  <div class="basis sm">${s.st==='ok'?`<span class="muted">Основание:</span> <b>${esc(s.basis)}</b>`:s.st==='progress'?`<span class="muted">Прогресс:</span> <b>${s.pct}%</b> · курс и практика в процессе`:s.st==='self'?'<span class="muted">Указан в профиле, подтверждения пока нет</span>':'<span class="muted">Ещё не изучен</span>'}${s.plan?' '+planPill(s):''}</div>
  <div class="prog">${s.st==='progress'?bar(s.pct,'o thin'):stPill(s)}</div>
  <div>${s.st==='ok'?`<button class="btn btn-g btn-sm" data-act="skillProof" data-id="${s.id}">${ic('eye')}Основание</button>`:s.plan==='course'?`<button class="btn btn-p btn-sm" data-act="courseFinal" data-id="${s.id}">Итоговое задание</button>`:`<button class="btn btn-s btn-sm" data-act="howConfirm" data-id="${s.id}">Как подтвердить</button>`}</div>
 </div>`).join('')||'<div class="empty">Здесь пока пусто</div>'}</section>`};

/* ================= projects ================= */
VIEWS.projects=(preset)=>{
 if(preset)UI.proj.skill=preset==='sql'?'SQL':preset;
 const f=UI.proj,ps=allProjects();
 const skills=[...new Set(ps.flatMap(p=>p.skills))].sort();
 return `
 <div class="page-h"><div><span class="label">Реальные задачи компаний</span><h1 style="margin-top:4px">Каталог проектов</h1><p>Выполняйте проекты компаний, получайте подтверждение навыков и отзывы. Лучшие участники получают приглашения на интервью. Командные проекты можно проходить вместе с другими студентами.</p></div></div>
 <div class="filters">
  <div class="search" style="max-width:260px;flex:1 1 220px">${ic('search')}<input class="inp" id="pf-q" placeholder="Название или компания" value="${esc(f.q)}" style="width:100%;padding-left:38px"></div>
  ${select('pf-prof','Профессия',PROFS,f.prof)}${select('pf-skill','Навык',skills,f.skill)}${select('pf-diff','Сложность',['Лёгкая','Средняя','Сложная'],f.diff)}${select('pf-dur','Длительность',['до 1 недели','1–2 недели','3+ недели'],f.dur)}${select('pf-format','Формат',['Индивидуальный','Командный'],f.format)}${select('pf-company','Компания',[...new Set(ps.map(p=>p.company))],f.company)}
  <button class="btn btn-g btn-sm" data-act="resetPF">Сбросить</button>
 </div>
 <div id="projList"></div>`};
function renderProjList(){
 const f=UI.proj,el=$('#projList');if(!el)return;
 const durMap={'до 1 недели':'1','1–2 недели':'2','3+ недели':'3'};
 const l=allProjects().filter(p=>(!f.q||(p.title+p.company).toLowerCase().includes(f.q.toLowerCase()))&&(!f.prof||p.prof===f.prof)&&(!f.skill||p.skills.includes(f.skill))&&(!f.diff||p.diff===f.diff)&&(!f.dur||p.durK===durMap[f.dur])&&(!f.format||p.format===f.format)&&(!f.company||p.company===f.company));
 l.sort((a,b)=>((b.id===T().main)-(a.id===T().main))||((b.prof===T().goal)-(a.prof===T().goal)));
 el.innerHTML=`<div class="sm muted" style="margin-bottom:12px">${l.length} ${plural(l.length,'проект','проекта','проектов')} · сначала подходящие под цель ${T().goal}</div>`+(l.length?`<div class="grid-2">${l.map(projCard).join('')}</div>`:`<div class="card empty">По этим фильтрам проектов нет. <button class="linkish" data-act="resetPF">Сбросить фильтры</button></div>`);
}
function fileRow(f,pid){const c={CSV:['#E2F4EC','#11946A'],PDF:['#FBE9E9','#D14343'],PPT:['#FDF0E1','#E0730F'],XLS:['#E2F4EC','#11946A'],SQL:['#ECEEFE','#3B47E0'],FIG:['#F3E8FF','#7C3AED']}[f[0]]||['#ECEEFE','#3B47E0'];return `<button class="fileln" data-act="openFile" data-id="${esc((pid||'')+'|'+f[1])}"><span class="fi" style="background:${c[0]};color:${c[1]}">${f[0]}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(f[1])}</div><div class="xs muted">${esc(f[2])}</div></span><span class="muted">${ic('eye')}</span></button>`}
function teamBlock(pid){const t=S.teams[pid];if(!t)return '';const open=t.own?Math.max(0,(t.size||3)-1-t.members.length):0;
 return `<section class="card col g12"><div class="row between"><h2>Ваша команда «${esc(t.name)}»</h2>${open?`<span class="pill pr">Ищем ещё ${open}</span>`:`<span class="pill ok">${ic('check')}Команда собрана</span>`}</div>
  <div class="col g8">${t.members.map(m=>`<div class="row g12" style="flex-wrap:nowrap">${av(m[1],m[2],32)}<div class="grow"><div class="b sm">${esc(m[0])}</div><div class="xs muted">${esc(m[3])}</div></div></div>`).join('')}<div class="row g12" style="flex-wrap:nowrap">${av('АИ','#3B47E0',32)}<div class="grow"><div class="b sm">Алексей Иванов (вы)</div><div class="xs muted">${esc(t.role)}${t.own?' · капитан':''}</div></div></div>
  ${Array.from({length:open},()=>`<div class="row g12" style="flex-wrap:nowrap"><span class="avatar" style="background:var(--surface-2);color:var(--muted);border:1.5px dashed var(--border-strong)">${ic('plus',14)}</span><div class="grow xs muted">Свободное место</div></div>`).join('')}</div>
  <p class="sm muted">Решение команда сдаёт одно, а навыки подтверждаются каждому участнику по его роли.</p>
  <div class="row g8"><button class="btn btn-s btn-sm" data-go="messages-team-${pid}">${ic('msg')}Чат команды</button>${open?`<button class="btn btn-g btn-sm" data-act="teamLink" data-id="${pid}">${ic('copy')}Ссылка-приглашение</button>`:''}</div></section>`}
function projCta(p,st){const team=p.format==='Командный';
 return st==='done'?`<button class="btn btn-ok btn-lg btn-block" data-go="complete-${p.id}">${ic('check')}Проект завершён · результат</button>`
  :st==='active'?`<button class="btn btn-p btn-lg btn-block" data-go="workspace-${p.id}">Продолжить выполнение${ic('arR')}</button>`
  :st==='review'?`<button class="btn btn-s btn-lg btn-block" data-go="workspace-${p.id}">${ic('clock')}Решение на проверке</button>`
  :S.closedProj[p.id]?`<button class="btn btn-s btn-lg btn-block" disabled>${ic('lock')}Приём решений закрыт</button>`
  :`<button class="btn btn-p btn-lg btn-block" data-act="join" data-id="${p.id}">${team?ic('users')+'Найти команду':'Принять участие'}</button>`}
VIEWS.project=(id)=>{
 const p=P(id);if(!p)return `<div class="card empty">Проект не найден — возможно, компания его сняла. <button class="linkish" data-go="projects">В каталог</button></div>`;
 const st=pst(p.id),team=p.format==='Командный';
 return `
 <button class="crumb" data-go="projects">${ic('arL',16)}Каталог проектов</button>
 <div class="split">
  <div class="stack">
   <section class="card">
    <div class="row g16" style="flex-wrap:nowrap;align-items:flex-start">${logo(p.company,'lg')}<div class="grow col g6"><div class="row g8"><span class="b t2">${esc(p.company)}</span><span class="xs muted">${esc(p.ind)}</span></div><h1>${esc(p.title)}</h1>
    <div class="meta"><span>${ic('target')}${esc(p.dir)}</span><span>${ic('clock')}${esc(p.dur)}</span><span>${ic('layers')}${esc(p.diff)}</span><span>${ic(team?'users':'user')}${esc(p.format)}</span></div>${(S.uniCourses||[]).filter(c=>c.pid===p.id).map(c=>`<span class="pill ac" style="align-self:flex-start">${ic('cap')}Входит в курс «${esc(c.course)}» · НИУ ВШЭ</span>`).join('')}</div></div>
   </section>
   ${teamBlock(p.id)}
   <section class="card col g12"><div class="card-h"><h2>О компании</h2>${EMPLOYERS[p.emp]?`<button class="btn btn-g btn-sm" data-go="company-${p.emp}">${ic('star')}Рейтинг и отзывы${ic('arR')}</button>`:''}</div><p class="t2">${esc(p.about)}</p></section>
   <section class="card col g16"><h2>Задача</h2><div class="task-q">${esc(p.task)}</div>
    <p class="t2">${esc(p.intro)}</p>
    <ol class="ol">${p.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
   <section class="card col g12"><h2>Материалы от компании</h2><div class="col g8">${p.provide.map(f=>fileRow(f,p.id)).join('')}</div></section>
   <section class="card col g12"><h2>Как оценивается</h2><ul class="ul">${p.criteria.map(c=>`<li>${ic('check')}<span>${esc(c)}</span></li>`).join('')}</ul><p class="sm muted">Решение проверяет ментор ${BRAND} — ${esc(mentorOf(p.id).name)}, ${esc(mentorOf(p.id).pos)} — по критериям компании.</p></section>
  </div>
  <aside class="card sticky col g16">
   <h2>Что получит студент</h2>
   <ul class="ul">${['Проект в портфолио','Подтверждение навыков в Skill Passport','Отзыв компании',p.hiring?'Возможность получить приглашение на интервью':'Рекомендацию ментора'].map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul>
   <div class="divider" style="margin:0"></div>
   <div><div class="label" style="margin-bottom:8px">Подтвердит навыки</div><div class="chips">${p.confirms.map(id=>`<span class="pill ok">${ic('shield')}${esc(SK[id].name)}</span>`).join('')}</div></div>
   <div class="col g8 sm">
    <div class="row between"><span class="muted">Приём решений</span><b>до ${esc(p.deadline)}</b></div>
    <div class="row between"><span class="muted">Участников</span><b>${p.people||'—'}</b></div>
    ${team?`<div class="row between"><span class="muted">Команда</span><b>3–4 человека</b></div>`:''}
    <div class="row between"><span class="muted">Найм по итогам</span><b>${p.hiring?'Да'+(p.invitePos?', '+esc(p.invitePos):''):'Нет'}</b></div>
   </div>
   ${projCta(p,st)}
   ${p.hiring?`<p class="xs muted" style="text-align:center">Лучшие участники получают приглашение на интервью</p>`:''}
  </aside>
 </div>`};

/* ================= workspace ================= */
function funnelHtml(){const F=[['Регистрация',12400,null],['Заполнен профиль',9180,74],['Выбран курс',5330,58],['Корзина',2190,41],['Первая покупка',870,40]];
 return `<div class="funnel">${F.map(f=>`<div class="fn-row ${f[2]!==null&&f[2]<45?'hot':''}"><span class="t2">${f[0]}</span><div class="fn-bar"><i style="width:${Math.max(4,f[1]/124)}%"></i></div><span><b>${fmt(f[1])}</b> <span class="cv muted">${f[2]===null?'':f[2]+'%'}</span></span></div>`).join('')}</div><div class="row g8 xs muted" style="margin-top:10px"><span style="width:10px;height:10px;border-radius:3px;background:var(--orange)"></span>Конверсия шага ниже 45% · сквозная конверсия 7,0%</div>`}
const COH=[['Март',[100,71,62,58]],['Апрель',[100,69,60,55]],['Май',[100,72,63,57]],['Июнь',[100,58,44,39]],['Июль',[100,70,61,null]],['Август',[100,68,null,null]]];
function cohortHtml(){return `<div class="tbl-wrap"><table class="heat"><thead><tr><th>Когорта</th><th>Месяц 0</th><th>Месяц 1</th><th>Месяц 2</th><th>Месяц 3</th></tr></thead><tbody>${COH.map(([n,v])=>`<tr><td>${n}</td>${v.map((x,i)=>x===null?'<td style="background:var(--surface-2);color:var(--muted)">—</td>':`<td class="${n==='Июнь'&&i>0?'hot':''}" style="background:color-mix(in srgb,var(--accent) ${Math.round(x*.7)}%,var(--surface));color:${x>=90?'#fff':'var(--text)'}">${x}%</td>`).join('')}</tr>`).join('')}</tbody></table></div><div class="row g8 xs muted" style="margin-top:10px"><span style="width:10px;height:10px;border-radius:3px;border:2px solid var(--orange)"></span>Июньская когорта теряет клиентов заметно быстрее остальных</div>`}
function dataTable(d){return `<div class="tbl-wrap"><table class="tbl tbl-x"><thead><tr>${d.head.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${d.rows.map(r=>`<tr>${r.map((c,i)=>`<td ${i?'':'class="b"'}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${d.note?`<p class="sm t2">${esc(d.note)}</p>`:''}`}
const SUM_MIN=150;
const wsReady=w=>w.tasks.every(Boolean)&&!!w.file&&(w.summary||'').trim().length>=SUM_MIN;
function wsHint(w){const miss=[];const n=w.tasks.filter(Boolean).length;if(n<w.tasks.length)miss.push(`отметьте задачи (${n} из ${w.tasks.length})`);if(!w.file)miss.push('загрузите файл решения');const l=(w.summary||'').trim().length;if(l<SUM_MIN)miss.push(`опишите итог (ещё ${SUM_MIN-l} знаков)`);return miss.length?'Осталось: '+miss.join(', ')+'.':'Всё готово к отправке.'}
VIEWS.workspace=(id)=>{
 const p=P(id||T().main);if(!p)return `<div class="card empty">Проект не найден. <button class="linkish" data-go="projects">В каталог</button></div>`;
 const st=pst(p.id);
 if(st==='none')return `<div class="card empty">Вы ещё не участвуете в проекте. <button class="linkish" data-go="project-${p.id}">Открыть проект ${esc(p.company)}</button></div>`;
 if(st==='done')return VIEWS.complete(p.id);
 const w=wsOf(p.id),n=w.tasks.filter(Boolean).length,ready=wsReady(w),rev=st==='review',mm=mentorOf(p.id),L=w.tasks.length;
 const data=p.wsData==='funnel'?funnelHtml():p.wsData==='cohort'?cohortHtml():p.data?dataTable(p.data):'';
 return `
 <button class="crumb" data-go="project-${p.id}">${ic('arL',16)}Описание проекта</button>
 <div class="page-h"><div class="row g16" style="flex-wrap:nowrap">${logo(p.company,'lg')}<div><div class="row g8">${rev?'<span class="pill ac">На проверке</span>':'<span class="pill pr">В работе</span>'}${w.attempt>1?`<span class="pill">Попытка ${w.attempt}</span>`:''}<span class="sm muted">Приём решений до ${esc(p.deadline)}</span></div><h1 style="margin-top:6px">${esc(p.short)}</h1></div></div>
 ${rev?'':`<button class="btn btn-g btn-sm" data-act="demoFill" data-id="${p.id}">${ic('bolt')}Заполнить пример решения</button>`}</div>
 ${rev?`<div class="banner ac"><span class="ic">${ic('clock',20)}</span><div class="grow"><div class="b">Решение отправлено ${esc(w.sentAt||'')} и ждёт проверки</div><div class="sm t2">Ментор ${esc(mm.name)} проверит его по критериям компании и подтвердит навыки. Проверку можно пройти за ментора в режиме «Ментор».</div></div><div class="row g8"><button class="btn btn-p btn-sm" data-act="role" data-role="mentor" data-then="review-${p.id}">Проверить как ментор</button><button class="btn btn-s btn-sm" data-act="withdraw" data-id="${p.id}">Отозвать решение</button></div></div>`:''}
 ${!rev&&w.returned?`<div class="banner" style="background:var(--orange-soft)"><span class="ic" style="background:var(--orange)">${ic('pen',20)}</span><div class="grow"><div class="b">Ментор вернул решение на доработку · ${esc(w.returned.date)}</div><div class="sm t2">«${esc(w.returned.comment)}» — ${esc(mm.name)}</div></div></div>`:''}
 <div class="split">
  <div class="stack">
   <section class="card col g12"><div class="row between"><h2>Задачи</h2><span class="sm b">${n} из ${L}</span></div>${bar(Math.round(n/L*100),'gr thin')}
    <div class="col g8" style="margin-top:6px">${p.wsTasks.map((t,i)=>`<div class="task ${w.tasks[i]?'done':''}"><button class="tick" ${rev?'disabled':''} data-act="tick" data-id="${p.id}:${i}" aria-label="${w.tasks[i]?'Снять отметку':'Отметить задачу'}: ${esc(t[0])}" aria-pressed="${!!w.tasks[i]}">${ic('check')}</button><div class="grow"><div class="b">${i+1}. ${esc(t[0])}</div><div class="sm muted">${esc(t[1])}</div></div></div>`).join('')}</div></section>
   ${data?`<section class="card col g12"><div class="row between"><h2>Данные компании</h2><span class="xs muted">${esc(p.provide[1]?p.provide[1][1]:p.provide[0][1])}</span></div>${data}</section>`:''}
   <section class="card col g12"><h2>Материалы</h2><div class="col g8">${p.provide.map(f=>fileRow(f,p.id)).join('')}</div></section>
   ${teamBlock(p.id)}
  </div>
  <aside class="stack sticky">
   <section class="card col g12"><h2>Решение</h2>
    <label class="field"><span>Итог решения <span class="xs muted" id="sumCount">${(w.summary||'').trim().length} / ${SUM_MIN}+ знаков</span></span><textarea class="inp" id="ws-sum" data-id="${p.id}" rows="6" ${rev?'disabled':''} placeholder="Главный вывод, что сделали и какой результат. Это прочитают ментор и компания.">${esc(w.summary||'')}</textarea></label>
    ${w.file?`<div class="fileln"><span class="fi" style="background:var(--orange-soft);color:var(--orange)">${esc(extOf(w.file).toUpperCase().slice(0,4))}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(w.file)}</div><div class="xs muted">${w.fileSize?fmtSize(w.fileSize)+' · ':''}${w.fileDemo?'пример, собран из вашего итога':'загружено'}</div></span><button class="x" data-act="openStored" data-id="ws-${p.id}" aria-label="Открыть файл">${ic('eye',14)}</button>${rev?'':`<button class="x" data-act="rmFile" data-id="${p.id}" aria-label="Удалить файл">${ic('x',14)}</button>`}</div>`
     :`<label class="drop" for="upl" style="cursor:pointer">${ic('upload',22)}<span class="b">Загрузите презентацию или отчёт</span><span class="xs muted">PDF, PPTX, DOCX, изображение или архив до 50 МБ</span><input type="file" id="upl" data-id="${p.id}" hidden accept=".pdf,.pptx,.ppt,.key,.docx,.doc,.png,.jpg,.jpeg,.zip,.html,.txt,.md"></label><button class="linkish" data-act="demoFile" data-id="${p.id}">Собрать отчёт из итога решения</button>`}
    ${rev?'':`<button class="btn btn-p btn-lg btn-block" id="wsSubmit" data-act="submit" data-id="${p.id}" ${ready?'':'disabled'}>${ic('send')}${w.attempt>1||w.returned?'Отправить повторно':'Отправить решение'}</button><p class="xs muted" id="wsHint">${wsHint(w)}</p>`}
   </section>
   <section class="card col g12"><div class="row g12" style="flex-wrap:nowrap">${av(mm.ini,mm.color,36)}<div><div class="b">${esc(mm.name)}</div><div class="xs muted">Ментор · ${esc(mm.pos)}</div></div></div><div class="quote sm">${esc(p.mentorTip)}</div><button class="btn btn-s btn-sm" data-act="aiAsk" data-q="Я делаю проект «${esc(p.short)}» для ${esc(p.company)}. Как лучше структурировать итоговое решение?">${ic('msg')}Задать вопрос</button></section>
  </aside>
 </div>`};

/* ================= complete ================= */
VIEWS.complete=(id)=>{
 const pid=id||T().main,p=P(pid);if(!p)return VIEWS.project(pid);if(pst(pid)!=='done')return VIEWS.workspace(pid);
 const tr=trackOfProj(pid)||T(),r=readinessOf(tr.id),rb=S.flags['rb_'+pid]!=null?S.flags['rb_'+pid]:r,newSk=confirmsOf(pid).map(sk),inv=S.inv[pid],e=empOfProj(pid);
 const unl=newlyUnlocked().length-(S.flags['ub_'+pid]||0),fresh=newSk.filter(s=>s.fresh).length;
 const conf=Array.from({length:22},(_,i)=>`<span class="conf" style="left:${(i*4.6+3)%100}%;background:${['#3B47E0','#11946A','#E0730F','#7B5CF0'][i%4]};animation-delay:${(i%7)*.12}s"></span>`).join('');
 return `
 <section class="celebrate">${conf}<div class="burst">${ic('check')}</div><h1>Проект успешно завершён!</h1><p class="t2" style="margin-top:8px">${esc(p.company)} и ментор оценили решение на <b>${S.scores[pid]||p.score} из 5</b>${S.scores[pid]?'':` — ${esc(p.rank)}`}.</p>
  <div class="row g8" style="justify-content:center;margin-top:16px"><span class="pill ok">${ic('shield')}${newSk.length} ${plural(newSk.length,'навык подтверждён','навыка подтверждено','навыков подтверждено')}</span>${r>rb?`<span class="pill pr">${ic('trend')}Готовность ${rb}% → ${r}%</span>`:''}${unl>0?`<span class="pill ac">${ic('cap')}+${unl} ${plural(unl,'стажировка','стажировки','стажировок')}</span>`:''}<span class="pill">${ic('star')}+${400+150*fresh} XP</span></div>
 </section>
 ${p.hiring&&inv?`<section class="invite" style="margin-top:20px">
  ${logo(p.company,'lg')}
  <div class="grow col g8" style="min-width:240px"><span class="label" style="color:var(--accent-ink)">Компания заинтересовалась вашим результатом</span><h2 style="font-size:20px">${esc(p.company)} приглашает вас на интервью на позицию ${esc(p.invitePos)}.</h2><p class="t2">«${esc((S.reviews&&S.reviews[pid]||{}).comment||p.review)} ${esc(p.inviteHook||'Хотим обсудить решение с командой.')}»<br><span class="sm muted">— ${esc(e.person)}, ${esc(e.pos)}</span></p></div>
  <div class="col g8" style="min-width:200px">${inv.st==='accepted'?`<span class="pill ok" style="height:auto;padding:8px 12px">${ic('cal')}Интервью: ${esc(inv.slot)}</span><button class="btn btn-s" data-go="messages-inv-${pid}">${ic('msg')}Открыть чат</button><button class="btn btn-g" data-act="appPrep" data-id="${p.inviteJob||''}">Подготовиться к интервью</button>`:`<button class="btn btn-p btn-lg" data-act="acceptInvite" data-id="${pid}">Принять приглашение</button><button class="btn btn-s" data-go="messages-inv-${pid}">${ic('msg')}Написать компании</button>`}</div>
 </section>`:`<section class="card col g8" style="margin-top:20px"><span class="label">Отзыв компании</span><p class="t2">«${esc((S.reviews&&S.reviews[pid]||{}).comment||p.review)}»</p><span class="sm muted">— ${esc(e.person)}, ${esc(e.pos)}, ${esc(p.company)}</span>${p.hiring?'':`<span class="xs muted">В этом проекте компания не нанимает — зато результат уже в вашем Skill Passport, а ментор оставит рекомендацию.</span>`}</section>`}
 <div class="grid-2" style="margin-top:20px">
  <section class="card col g12"><h2>Подтверждённые навыки</h2>${newSk.map(s=>`<div class="newskill"><span class="mk ok">${ic('check')}</span><div class="grow"><div class="b">${esc(s.name)}</div><div class="xs muted">${esc(s.basis||'')}</div></div><span class="pill ok">Подтверждено</span></div>`).join('')}<button class="btn btn-g btn-sm" data-go="skills" style="align-self:flex-start">Открыть Skill Passport${ic('arR')}</button></section>
  <div class="stack">
   <section class="card col g12"><h2>Карьерная готовность · ${esc(tr.goal)}</h2><div class="row g8" style="align-items:baseline"><span class="big-num" style="font-size:38px">${r}%</span>${r>rb?`<span class="delta">+${r-rb}%</span>`:''}</div>${bar(r,'o fat')}<p class="sm muted">${r>rb?`Проект поднял готовность к цели «${esc(tr.goal)}».`:`Навыки этого проекта не входят в требования цели «${esc(tr.goal)}», но видны работодателям в Skill Passport.`}${unl>0?' Открылись новые стажировки: '+newlyUnlocked().slice(0,4).map(j=>esc(j.company)).join(', ')+'.':''}</p><button class="btn btn-s btn-sm" data-go="internships" style="align-self:flex-start">Смотреть стажировки</button></section>
   <section class="card col g12"><h2>Портфолио</h2>${S.portfolio[pid]?`<div class="row g8"><span class="pill ok">${ic('check')}Проект добавлен в портфолио</span></div><button class="btn btn-s btn-sm" data-go="portfolio" style="align-self:flex-start">Открыть портфолио</button>`:`<p class="sm t2">Добавьте проект с результатами и отзывом — работодатели увидят его первым.</p><button class="btn btn-p" data-act="addPortfolio" data-id="${pid}" style="align-self:flex-start">${ic('plus')}Добавить проект в портфолио</button>`}</section>
  </div>
 </div>`};

/* ================= jobs ================= */
function jobsView(tab){
 const f=UI.jobs,JJ=allJobs(),t=T(),d=mainDone(t.id);
 const cnt={all:JJ.length,intern:JJ.filter(j=>j.type==='intern').length,job:JJ.filter(j=>j.type==='job').length};
 const skills=[...new Set(JJ.flatMap(j=>j.skills))].sort();
 return `
 <div class="page-h"><div><span class="label">Умный подбор</span><h1 style="margin-top:4px">Стажировки и вакансии</h1><p>Совпадение считается по подтверждённым навыкам, проектам и карьерной цели, а не только по резюме. Часть предложений открывается при достижении порога готовности.</p></div></div>
 ${d?`<div class="banner"><span class="ic">${ic('cap',20)}</span><div class="grow"><div class="b">Открыто 5 новых стажировок</div><div class="sm t2">Проект ${P(t.main).company} подтвердил ${confirmsOf(t.main).length} навыков — готовность выросла до ${readiness()}%, совпадение с вакансиями ${t.goal} выросло в среднем на 11–17%.</div></div></div>`:`<div class="banner ac"><span class="ic">${ic('lock',20)}</span><div class="grow"><div class="b">Ещё 5 стажировок ${t.goal} откроются при готовности 75%</div><div class="sm t2">Сейчас ${readiness()}%. Быстрее всего — проект ${P(t.main).company}: он подтвердит ${t.focus}.</div></div><button class="btn btn-p btn-sm" data-go="project-${t.main}">Смотреть проект</button></div>`}
 <div class="tabs">${[['internships','Стажировки',cnt.intern,'intern'],['vacancies','Вакансии',cnt.job,'job'],['jobs','Все',cnt.all,'all']].map(([r,l,n,k])=>`<button class="${tab===k?'on':''}" data-go="${r}">${l}<span class="n">${n}</span></button>`).join('')}</div>
 <div class="filters">
  ${select('jf-prof','Профессия',PROFS,f.prof)}${select('jf-company','Компания',[...new Set(JJ.map(j=>j.company))],f.company)}${select('jf-format','Формат',['Удалённо','Офис','Гибрид'],f.format)}${select('jf-level','Уровень',['Стажёр','Junior'],f.level)}${select('jf-skill','Навык',skills,f.skill)}
  <label class="check"><input type="checkbox" id="jf-paid" ${f.paid?'checked':''}>Оплачиваемые</label>
  <label class="check"><input type="checkbox" id="jf-fit" ${f.fit?'checked':''}>Только под мою цель</label>
 </div>
 <div id="jobList" data-tab="${tab}"></div>`}
function renderJobList(){
 const el=$('#jobList');if(!el)return;const tab=el.dataset.tab,f=UI.jobs;
 let l=allJobs().filter(j=>(tab==='all'||j.type===tab)&&(!f.prof||j.prof===f.prof)&&(!f.company||j.company===f.company)&&(!f.format||j.format===f.format)&&(!f.level||j.level===f.level)&&(!f.skill||j.skills.includes(f.skill))&&(!f.paid||j.paid)&&(!f.fit||isFit(j)));
 l.sort((a,b)=>(unlocked(b)-unlocked(a))||(isFit(b)-isFit(a))||(matchOf(b)-matchOf(a)));
 el.innerHTML=`<div class="sm muted" style="margin-bottom:12px">${l.length} ${plural(l.length,'предложение','предложения','предложений')} · сортировка по совпадению с профилем</div>`+(l.length?`<div class="grid-2">${l.map(j=>jobCard(j)).join('')}</div>`:`<div class="card empty">Ничего не нашлось. <button class="linkish" data-act="resetJF">Сбросить фильтры</button></div>`);
}
VIEWS.internships=()=>jobsView('intern');
VIEWS.vacancies=()=>jobsView('job');
VIEWS.jobs=()=>jobsView('all');
VIEWS.job=(id)=>{
 const j=jobById(id)||JOBS[0];const m=matchOf(j);const tr=TRACKS[j.track];
 const ok=[],imp=[],no=[];j.skills.forEach(n=>{const s=skByName(n);if(s&&(s.st==='ok'||s.st==='self'))ok.push(s);else if(s&&s.st==='progress')imp.push(s);else no.push(n)});
 const gapNames=[...imp.map(s=>s.name),...no];
 const mainP=tr&&!mainDone(tr.id)?P(tr.main):null;
 const coverByMain=mainP&&gapNames.some(n=>mainP.skills.includes(n));
 const testGap=[...imp,...no.map(skByName).filter(Boolean)].find(s=>TESTS[s.id]&&!(S.tests[s.id]&&S.tests[s.id].passed));
 let tip,rec='';
 if(!gapNames.length)tip='Все ключевые навыки уже есть в профиле. Подтвердите их проектами — компании чаще приглашают кандидатов с подтверждёнными навыками.';
 else if(coverByMain){tip=j.id==='j1'?'Выполните проект по SQL и продуктовой аналитике — соответствие вырастет примерно до 95%.':`Выполните проект «${mainP.short}» — он закроет ${gapNames.filter(n=>mainP.skills.includes(n)).join(', ')}, и соответствие вырастет примерно до ${j.m[1]}%.`;rec=`<div class="row g12" style="flex-wrap:nowrap;padding:10px;border-radius:10px;background:var(--surface);border:1px solid var(--border)">${logo(mainP.company,'sm')}<div class="grow"><div class="b sm">${esc(mainP.title)}</div><div class="xs muted">${mainP.company} · ${mainP.dur} · +${mainP.reward} навыков</div></div><button class="btn btn-p btn-sm" data-go="project-${mainP.id}">Открыть</button></div>`}
 else tip=`Подтвердите ${gapNames.join(', ')} через проект или тест — соответствие вырастет примерно до ${Math.max(j.m[1],m+6)}%.`;
 if(testGap)rec+=`<div class="row g12" style="flex-wrap:nowrap;padding:10px;border-radius:10px;background:var(--surface);border:1px solid var(--border)"><span class="logo sm" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('test',16)}</span><div class="grow"><div class="b sm">Быстрый способ: тест по навыку «${testGap.name}»</div><div class="xs muted">5 вопросов · около 7 минут · +3% к совпадению</div></div><button class="btn btn-s btn-sm" data-act="test" data-id="${testGap.id}">Пройти</button></div>`;
 return `
 <button class="crumb" data-go="${j.type==='job'?'vacancies':'internships'}">${ic('arL',16)}${j.type==='job'?'Вакансии':'Стажировки'}</button>
 <div class="split">
  <div class="stack">
   <section class="card"><div class="row g16" style="flex-wrap:nowrap;align-items:flex-start">${logo(j.company,'lg')}<div class="grow col g6"><span class="b t2">${esc(j.company)}${j.team?' · '+esc(j.team):''}</span><h1>${esc(j.title)}</h1><div class="meta"><span>${ic('pin')}${j.city} / ${j.format.toLowerCase()}</span>${j.salary?`<span>${ic('briefcase')}${j.salary}</span>`:''}<span>${ic('user')}${j.level}</span></div></div></div></section>
   <section class="card col g16">
    <div class="row g20">${ring(m,112,'big')}<div class="grow col g6" style="min-width:220px"><span class="label">Умный matching</span><h2>Ваше соответствие вакансии — ${m}%</h2><p class="sm muted">Учитываются подтверждённые навыки (вес 50%), проекты по профилю (30%) и карьерная цель (20%).</p></div></div>
    <div class="grid-2">
     <div class="col g8"><div class="label" style="color:var(--green)">Подходит</div>${ok.map(s=>`<div class="row g8">${ic('check')}<span>${s.name}</span>${s.st==='ok'?`<span class="pill ok" style="height:20px;font-size:11px">подтверждён</span>`:''}</div>`).join('')||'<span class="sm muted">—</span>'}</div>
     <div class="col g8"><div class="label" style="color:var(--orange)">Нужно улучшить</div>${imp.map(s=>`<div class="row g8"><span style="color:var(--orange)">△</span><span>${s.name}</span><span class="xs muted">${s.pct}%</span></div>`).join('')}${no.map(n=>`<div class="row g8"><span class="muted">○</span><span>${esc(n)}</span><span class="xs muted">нет в профиле</span></div>`).join('')}${!gapNames.length?'<span class="sm muted">Всё закрыто</span>':''}</div>
    </div>
    <button class="btn btn-s" data-act="boost" style="align-self:flex-start">${ic('trend')}Как повысить соответствие</button>
    <div id="boost" hidden><div class="banner ac" style="margin:0;align-items:flex-start"><span class="ic">${ic('spark',18)}</span><div class="grow col g8"><div class="b">${tip}</div>${rec}</div></div></div>
   </section>
   <section class="card col g12"><h2>Задачи на стажировке</h2><ul class="ul">${(j.prof==='Data Analyst'?['Собирать и проверять данные из хранилища на SQL','Строить дашборды и отчёты для продуктовых команд','Анализировать эксперименты и искать причины изменений метрик','Презентовать выводы команде']:['Исследовать поведение пользователей и находить точки роста','Формулировать гипотезы и запускать A/B-тесты вместе с аналитиками','Готовить требования и вести задачи с командой разработки','Презентовать результаты экспериментов команде']).map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul></section>
  </div>
  <aside class="card sticky col g16">
   <div class="row between"><span class="label">Отклик</span><span class="pill ${j.type==='intern'?'ac':''}">${j.type==='intern'?'Стажировка':'Вакансия'}</span></div>
   <p class="sm t2">Компания увидит ваш Skill Passport, ${projCount()} ${plural(projCount(),'проект','проекта','проектов')} и совпадение ${m}%.</p>
   ${!unlocked(j)?`<button class="btn btn-s btn-lg btn-block" disabled>${ic('lock')}Откроется при ${j.min}%</button>`:S.applied[j.id]?`<button class="btn btn-ok btn-lg btn-block" disabled>${ic('check')}Отклик отправлен</button>`:`<button class="btn btn-p btn-lg btn-block" data-act="apply" data-id="${j.id}">Откликнуться</button>`}
   <button class="btn btn-s btn-block" data-act="aiAsk" data-q="Как подготовиться к отбору на ${esc(j.title)} в ${esc(j.company)}?">${ic('spark')}Спросить AI о вакансии</button>
   <div class="divider" style="margin:0"></div>
   <div class="col g8 sm"><div class="row between"><span class="muted">Откликов</span><b>${40+(j.id.charCodeAt(1)*7+j.id.length*13)%60}</b></div><div class="row between"><span class="muted">Среднее совпадение</span><b>71%</b></div><div class="row between"><span class="muted">Ответ компании</span><b>в течение 5 дней</b></div></div>
  </aside>
 </div>`};

/* ================= portfolio ================= */
const PROF=()=>Object.assign({city:'Москва',prog:'Бизнес-информатика, 3 курс',about:'Студент 3 курса бизнес-информатики. Интересуюсь продуктовой аналитикой и EdTech. Провёл 14 интервью с пользователями и довёл учебный продукт до прототипа.',tg:'@a_ivanov_pm',format:'Гибрид',start:'С октября 2026'},S.profile||{});
const VIS=()=>Object.assign({show:true,inv:true,uni:true},S.vis||{});
const publicUrl=()=>location.href.split('#')[0]+'#u';
function portfolioItems(){const PF=[];
 Object.keys(S.portfolio).forEach(pid=>{const p=P(pid);if(!p)return;const e=empOfProj(pid);PF.push({pid,title:p.title,company:p.company,date:S.flags['d_'+pid]||'Сентябрь 2026',fresh:1,team:!!S.teams[pid],metrics:p.metrics,skills:confirmsOf(pid).map(id=>SK[id].name),review:(S.reviews[pid]||{}).comment||p.review,who:`${e.person}, ${e.pos}, ${p.company}`,score:S.scores[pid]||p.score})});
 PF.push({title:'Customer Development для студенческого кофе-сервиса',company:ACAD,date:'Май 2026',metrics:[['14','глубинных интервью'],['3','сегмента аудитории'],['2','ключевых инсайта']],skills:['Customer Development','CJM'],review:'Хорошая дисциплина в интервью и честные выводы, даже когда они противоречили исходной идее.',who:'Ольга Сафина, ментор, Senior PM в Avito',score:'4,7'});
 PF.push({title:'Онбординг фитнес-приложения',company:ACAD,date:'Март 2026',metrics:[['−18%','шагов в онбординге'],['4','экрана в прототипе']],skills:['Product Thinking','Figma'],score:'4,6'});
 PF.push({title:'Анализ конкурентов сервиса аренды самокатов',company:'Флоу',date:'Декабрь 2025',team:1,metrics:[['6','конкурентов'],['2','сценария позиционирования']],skills:['Конкурентный анализ'],score:'4,3'});
 return PF}
function pfProjects(PF){return PF.map(p=>`<article class="pf-proj ${p.fresh?'fresh':''}">
  <div class="row g12" style="flex-wrap:nowrap;align-items:flex-start">${logo(p.company,'sm')}<div class="grow"><div class="row g8"><span class="sm b t2">${esc(p.company)}</span><span class="xs muted">${esc(p.date)}${p.team?' · командный':''}</span></div><h3 style="font-size:16px;margin-top:2px">${esc(p.title)}</h3></div><span class="pill">${ic('star')}${p.score}</span></div>
  <div><div class="label" style="margin-bottom:8px">Результат</div><div class="grid-3" style="gap:8px">${p.metrics.map(m=>`<div class="metric"><b>${esc(m[0])}</b><span class="xs muted">${esc(m[1])}</span></div>`).join('')}</div></div>
  <div><div class="label" style="margin-bottom:8px">Подтверждённые навыки</div><div class="chips">${p.skills.map(s=>`<span class="pill ok">${ic('shield')}${esc(s)}</span>`).join('')}</div></div>
  ${p.review?`<div class="quote">«${esc(p.review)}»<div class="xs muted" style="margin-top:6px">${esc(p.who)}</div></div>`:''}
 </article>`).join('')}
function pfSide(pub){const t=T(),conf=confAll();const acc=Object.keys(S.inv).find(k=>S.inv[k].st==='accepted');
 return `<section class="card col g12"><h2>Подтверждённые навыки</h2>${conf.map(s=>`<div class="row g8" style="flex-wrap:nowrap;align-items:flex-start;padding:6px 0;border-top:1px solid var(--border)"><span style="color:var(--green)">${ic('shield',16)}</span><div class="grow"><div class="b sm">${esc(s.name)}</div><div class="xs muted">${esc(s.basis||'')}${s.src?' · '+esc(s.src):''}${s.date?' · '+esc(s.date):''}</div></div></div>`).join('')}${skAll().filter(s=>s.st!=='ok'&&has(s)).length?`<div class="xs muted">Указаны, но пока не подтверждены: ${skAll().filter(s=>s.st!=='ok'&&has(s)).map(s=>esc(s.name)).join(', ')}</div>`:''}</section>
  <section class="card col g12"><h2>Образование</h2><div><div class="b">НИУ ВШЭ</div><div class="sm muted">${esc(PROF().prog)} · бакалавриат · 2023–2027</div></div><div><div class="b">${ACAD}</div><div class="sm muted">Трек ${esc(t.goal)} · 2026</div></div></section>
  <section class="card col g12"><h2>Сертификаты и курсы</h2>${[['Яндекс Практикум','SQL для анализа данных','Август 2026'],[ACAD,'Основы продуктовой аналитики','Июнь 2026'],['Stepik','Customer Development на практике','Апрель 2026'],...Object.keys(S.tests).filter(k=>S.tests[k].passed).map(k=>[ACAD,'Тест: '+SK[k].name+' · '+S.tests[k].score+' из 5',S.tests[k].date]),...Object.entries(S.courseDone||{}).map(([k,c])=>[c.provider,c.title+' · итоговое задание '+c.score,c.date])].map(c=>`<div class="row g12" style="flex-wrap:nowrap">${logo(c[0],'sm')}<div><div class="b sm">${esc(c[1])}</div><div class="xs muted">${esc(c[0])} · ${esc(c[2])}</div></div></div>`).join('')}</section>
  ${!pub&&acc?`<section class="card col g12"><h2>Интервью</h2><div class="row g12" style="flex-wrap:nowrap">${logo(P(acc).company,'sm')}<div><div class="b sm">${esc(P(acc).invitePos)} · ${esc(P(acc).company)}</div><div class="xs muted">${esc(S.inv[acc].slot)}</div></div></div></section>`:''}
  ${Object.keys(S.recs||{}).length?`<section class="card col g12"><h2>Рекомендации менторов</h2>${Object.entries(S.recs).map(([pid,r])=>`<div class="quote sm">${md(r)}</div>${pub?'':`<button class="btn btn-s btn-sm" data-act="recToCv" data-id="${pid}" style="align-self:flex-start">${ic('plus')}Добавить в резюме</button>`}`).join('')}</section>`:''}`}
VIEWS.portfolio=()=>{
 const t=T(),PF=portfolioItems(),pr=PROF(),vis=VIS();
 const done=doneProjects().filter(pid=>!S.portfolio[pid]);
 return `
 <section class="card" style="padding:28px;margin-bottom:20px"><div class="pf-head">
  <div class="pf-av">АИ</div>
  <div class="grow col g6" style="min-width:220px"><h1>Алексей Иванов</h1><div class="b t2" style="font-size:16px">${t.junior}</div><div class="meta"><span>${ic('cap')}НИУ ВШЭ · ${esc(pr.prog)}</span><span>${ic('pin')}${esc(pr.city)}</span><span>${ic('target')}Цель: ${t.goal}</span></div><p class="sm t2" style="max-width:620px">${esc(pr.about)}</p></div>
  <div class="col g8"><div class="row g8"><button class="btn btn-p" data-act="copyLink" ${vis.show?'':'disabled'}>${ic('copy')}Поделиться портфолио</button><button class="btn btn-s" data-go="u">${ic('eye')}Как видят другие</button><button class="btn btn-s" data-go="profile">${ic('pen')}Редактировать</button></div><div class="xs muted">${vis.show?'Публичная страница открыта по ссылке':'Профиль скрыт — ссылка не работает. Включите видимость в профиле'}</div></div>
 </div></section>
 ${done.map(pid=>`<div class="banner ac"><span class="ic">${ic('plus',20)}</span><div class="grow"><div class="b">Проект ${esc(P(pid).company)} завершён — добавьте его в портфолио</div><div class="sm t2">Оценка ${S.scores[pid]||P(pid).score}, отзыв и ${confirmsOf(pid).length} ${plural(confirmsOf(pid).length,'подтверждённый навык','подтверждённых навыка','подтверждённых навыков')}.</div></div><button class="btn btn-p btn-sm" data-act="addPortfolio" data-id="${pid}">Добавить</button></div>`).join('')}
 <div class="split">
  <div class="stack"><section class="card col g16"><div class="row between"><h2>Проекты</h2><span class="sm muted">${PF.length}</span></div>${pfProjects(PF)}</section></div>
  <div class="stack">${pfSide(false)}</div>
 </div>`};
/* public page: what employers see by the link, without signing in */
VIEWS.u=()=>{const t=T(),pr=PROF();
 const head=`<header class="lp-nav"><div class="lp-in"><div class="brand" style="padding:0" data-go="welcome">${LOGO}<span>${BRAND}</span></div><div class="row g8" style="margin-left:auto">${S.authed?`<button class="btn btn-s btn-sm" data-go="portfolio">${ic('arL')}Вернуться в кабинет</button>`:`<button class="btn btn-p btn-sm" data-go="auth-student">Создать свой профиль</button>`}</div></div></header>`;
 if(!VIS().show)return `<div class="lp">${head}<div class="lp-in" style="padding-block:64px"><section class="card empty col g12" style="align-items:center"><span class="logo lg" style="background:var(--surface-2);color:var(--muted)">${ic('lock',24)}</span><h2>Профиль скрыт</h2><p class="sm muted">Владелец закрыл публичный доступ к портфолио.</p></section></div></div>`;
 return `<div class="lp">${head}<div class="lp-in" style="padding-block:28px 64px">
  <section class="card" style="padding:28px;margin-bottom:20px"><div class="pf-head"><div class="pf-av">АИ</div><div class="grow col g6" style="min-width:220px"><span class="label">Портфолио · ${BRAND}</span><h1>Алексей Иванов</h1><div class="b t2" style="font-size:16px">${t.junior}</div><div class="meta"><span>${ic('cap')}НИУ ВШЭ · ${esc(pr.prog)}</span><span>${ic('pin')}${esc(pr.city)}</span><span>${ic('briefcase')}${esc(pr.format)} · ${esc(pr.start.toLowerCase())}</span></div><p class="sm t2" style="max-width:620px">${esc(pr.about)}</p></div>
   <div class="col g8">${VIS().inv?`<div class="pill ok" style="height:auto;padding:8px 12px">${ic('mail')}Открыт к приглашениям</div>`:''}<div class="xs muted">Навыки подтверждены проектами компаний, тестами, курсами и менторами ${BRAND}</div></div></div></section>
  <div class="split"><div class="stack"><section class="card col g16"><h2>Проекты</h2>${pfProjects(portfolioItems())}</section></div><div class="stack">${pfSide(true)}</div></div></div></div>`};

/* ================= profile ================= */
VIEWS.profile=()=>{const l=level(),pr=PROF(),vis=VIS();const opt=(arr,v)=>arr.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');return `
 <div class="page-h"><div><span class="label">Настройки</span><h1 style="margin-top:4px">Профиль</h1><p>Эти данные видят работодатели в поиске кандидатов и на вашей публичной странице вместе со Skill Passport.</p></div><button class="btn btn-s" data-go="u">${ic('eye')}Как видят другие</button></div>
 <section class="card col g16" style="margin-bottom:20px">
  <div class="row g16"><span class="lvl" style="width:64px;height:64px;font-size:26px">${l.n}</span><div class="grow col g6" style="min-width:220px"><div class="row g8"><h2>Уровень ${l.n} · ${l.name}</h2><span class="streak">${ic('flame',14)}Серия ${streak()} ${plural(streak(),'день','дня','дней')}</span></div>${bar(l.pct)}<span class="sm muted">${fmt(l.xp)} XP${l.nextName?` · до уровня «${l.nextName}» ${fmt(l.next-l.xp)} XP`:''}</span></div></div>
  <div class="bdg-grid">${BADGES.map(b=>`<div class="bdg ${b.ok()?'':'off'}"><span class="bi">${ic(b.ic,20)}</span><span class="b sm">${b.n}</span><span class="xs muted">${b.d}</span></div>`).join('')}</div>
  <p class="xs muted">XP начисляются за подтверждённые навыки (+150), завершённые проекты (+400), тесты (+100) и приглашения на интервью (+200). Уровень виден работодателям.</p>
 </section>
 <div class="split">
  <form class="card col g16" id="profileForm">
   <div class="form-grid">
    <label class="field"><span>Имя и фамилия ${ic('lock',12)}</span><input class="inp" id="pr-name" value="Алексей Иванов" readonly aria-describedby="pr-lock"></label>
    <label class="field"><span>Город</span><input class="inp" id="pr-city" value="${esc(pr.city)}" required maxlength="60"></label>
    <label class="field"><span>Университет ${ic('lock',12)}</span><input class="inp" id="pr-uni" value="НИУ ВШЭ" readonly></label>
    <label class="field"><span>Программа и курс</span><input class="inp" id="pr-prog" value="${esc(pr.prog)}" required maxlength="80"></label>
    <label class="field"><span>Карьерная цель</span><select class="sel" id="pr-goal">${Object.values(TRACKS).map(t=>`<option value="${t.id}" ${t.id===S.goal?'selected':''}>${t.goal}</option>`).join('')}</select></label>
    <label class="field"><span>Формат работы</span><select class="sel" id="pr-format">${opt(['Гибрид','Удалённо','Офис'],pr.format)}</select></label>
    <label class="field full"><span>О себе</span><textarea class="inp" id="pr-about" rows="3" maxlength="600">${esc(pr.about)}</textarea></label>
    <label class="field"><span>Telegram</span><input class="inp" id="pr-tg" value="${esc(pr.tg)}" pattern="@[A-Za-z0-9_]{4,32}" title="Например, @a_ivanov_pm"></label>
    <label class="field"><span>Готов выйти на стажировку</span><select class="sel" id="pr-start">${opt(['С октября 2026','С января 2027','Летом 2027'],pr.start)}</select></label>
   </div>
   <p class="xs muted" id="pr-lock">${ic('lock',11)} Имя и вуз подтверждены при регистрации: навыки привязаны к личности, поэтому их меняют через поддержку.</p>
   <div class="row g8"><button class="btn btn-p" type="submit">Сохранить изменения</button></div>
  </form>
  <aside class="stack">
   <section class="card col g12"><h2>Видимость</h2>
    <label class="check"><input type="checkbox" id="pr-vis" ${vis.show?'checked':''}>Показывать профиль работодателям</label>
    <label class="check"><input type="checkbox" id="pr-inv" ${vis.inv?'checked':''} ${vis.show?'':'disabled'}>Разрешить приглашения на интервью</label>
    <label class="check"><input type="checkbox" id="pr-uni-share" ${vis.uni?'checked':''}>Делиться прогрессом с центром карьеры вуза</label>
    <p class="xs muted">Изменения применяются сразу: скрытый профиль пропадает из поиска кандидатов и публичной страницы.</p>
   </section>
   <section class="card col g12"><h2>Резюме</h2>${S.resumeFile?`<button class="fileln" ${S.resumeFile.demo?'':'data-act="openStored" data-id="resume"'} style="${S.resumeFile.demo?'cursor:default':''}"><span class="fi" style="background:#FBE9E9;color:#D14343">${esc(extOf(S.resumeFile.name).toUpperCase())}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(S.resumeFile.name)}</div><div class="xs muted">${(S.resumeSkills||[]).length} ${plural((S.resumeSkills||[]).length,'навык','навыка','навыков')} в профиле${S.resumeFile.demo?' · демо-резюме':''}</div></span>${S.resumeFile.demo?'':`<span class="muted">${ic('eye')}</span>`}</button>`:`<p class="sm muted">Загрузите резюме — платформа найдёт навыки и обновит карьерный путь.</p>`}<button class="btn btn-s btn-sm" data-act="resumeAgain" style="align-self:flex-start">${ic('upload')}${S.resumeFile?'Обновить резюме':'Загрузить резюме'}</button><button class="btn btn-g btn-sm" data-go="resume" style="align-self:flex-start">${ic('pen')}Конструктор резюме</button></section>
  </aside>
 </div>`};

/* ================= try ================= */
VIEWS.try=()=>`
 <div class="page-h"><div><span class="label">Профориентация</span><h1 style="margin-top:4px">Попробуй профессию за 1 час</h1><p>Короткие симуляторы реальных рабочих ситуаций. Вы принимаете решения, а платформа объясняет, как бы поступил опытный специалист.</p></div></div>
 <div class="grid-3">${Object.entries(SIMS).map(([k,s])=>`<article class="card prof hov" data-act="sim" data-id="${k}"><span class="pi" style="background:${s.col}1f;color:${s.col}">${ic(s.ic,22)}</span><div><h3>${k}</h3><p class="sm muted" style="margin-top:4px">${s.intro}</p></div><div class="row between"><span class="xs muted">${s.qs.length} ${plural(s.qs.length,'ситуация','ситуации','ситуаций')} · ${s.qs.length*8} мин</span><span class="btn btn-g btn-sm">Попробовать${ic('arR')}</span></div></article>`).join('')}</div>`;

/* ================= messages ================= */
function chatView(id,side){
 const mine=side==='student'?Object.values(S.chats).filter(c=>c.kind!=='cand'):Object.values(S.chats).filter(c=>(c.kind==='inv'||c.kind==='cand')&&c.co===emp().company);
 const who=c=>{if(c.kind==='cand'){const k=CANDS.find(x=>x.id===c.cand)||{};return {name:k.name||'Кандидат',ini:initials(k.name||'К К'),color:k.color||'#8A90B0',sub:`${k.prof||''} · ${k.uni||''}`,id:c.cand}}return {name:'Алексей Иванов',ini:'АИ',color:'#3B47E0',sub:'НИУ ВШЭ · '+P(c.pid).short+' · '+(S.scores[c.pid]||P(c.pid).score),id:'c2'}};
 const route=side==='student'?'messages':'empmessages';
 const th=id&&S.chats[id]&&mine.includes(S.chats[id])?S.chats[id]:(window.innerWidth>720?mine[0]:null);
 if(th){if(side==='student')th.unreadS=0;else th.unreadE=0;save()}
 const e=emp();
 const bub=(m)=>{
  if(m.f==='sys')return `<div class="sysm">${esc(m.t)}</div>`;
  if(m.f==='card'){const p=P(m.pid),inv=S.inv[m.pid]||{st:'new'};return `<div class="inv-card"><div class="row g12" style="flex-wrap:nowrap">${logo(p.company,'sm')}<div class="grow"><div class="label" style="color:var(--accent-ink)">Приглашение на интервью</div><div class="b">${p.invitePos}</div><div class="xs muted">45 минут · онлайн · по итогам проекта «${p.short}»</div></div></div>${inv.st==='accepted'?`<span class="pill ok" style="align-self:flex-start">${ic('cal')}${inv.slot}</span>`:side==='student'?`<div class="row g8"><button class="btn btn-p btn-sm" data-act="acceptInvite" data-id="${m.pid}">Выбрать время</button><button class="btn btn-s btn-sm" data-act="laterInvite" data-id="${m.pid}">Ответить позже</button></div>`:`<span class="pill">${inv.st==='later'?'Кандидат ответит позже':'Ожидает ответа кандидата'}</span>`}</div>`}
  const me=(m.f==='me')===(side==='student');
  return `<div class="bub ${me?'me':'them'}">${!me&&m.who?`<span class="who">${esc(m.who)}</span>`:''}${esc(m.t)}<span class="tm">${m.tm||''}</span></div>`};
 const typing=th&&UI.typing[th.id]?`<div class="bub them typing" style="padding:12px 14px"><i></i><i></i><i></i></div>`:'';
 const head=th?(side==='student'?(th.kind==='team'?`<span class="members">${S.teams[th.pid].members.slice(0,3).map(m=>av(m[1],m[2])).join('')||av('АИ','#3B47E0')}</span>`:logo(th.co,'sm')):av(who(th).ini,who(th).color,32)):'';
 return `
 <div class="page-h"><div><span class="label">${side==='student'?'Студент':e.company}</span><h1 style="margin-top:4px">Сообщения</h1></div></div>
 ${mine.length?`<div class="chat ${id&&th?'open':''}">
  <div class="threads">${mine.map(c=>{const un=side==='student'?c.unreadS:c.unreadE;const last=[...c.msgs].reverse().find(m=>m.t);return `<button class="th ${th&&th.id===c.id?'on':''}" data-go="${route}-${c.id}">${side==='student'?(c.kind==='team'?`<span class="logo sm" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('users',16)}</span>`:logo(c.co,'sm')):av(who(c).ini,who(c).color,32)}<span class="grow" style="min-width:0"><div class="row between" style="flex-wrap:nowrap"><b style="font-size:13.5px">${esc(side==='student'?c.title:who(c).name)}</b>${un?`<span class="un">${un}</span>`:''}</div><div class="xs muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(last?last.t:'')}</div></span></button>`}).join('')}</div>
  <div class="thread">${th?`<div class="thread-h"><button class="icon-btn back-m" data-go="${route}" aria-label="Назад">${ic('arL',16)}</button>${head}<div class="grow"><div class="b">${esc(side==='student'?th.title:who(th).name)}</div><div class="xs muted">${esc(side==='student'?th.sub:who(th).sub)}</div></div>${side==='employer'?`<button class="btn btn-s btn-sm" data-act="candProfile" data-id="${who(th).id}">Профиль</button>`:th.kind==='inv'?`<button class="btn btn-s btn-sm hide-m" data-go="complete-${th.pid}">Проект</button>`:''}</div>
   <div class="thread-b" id="threadB">${th.msgs.map(bub).join('')}${typing}</div>
   <form class="thread-f" id="chatForm"><input type="hidden" id="chat-id" value="${th.id}"><input type="hidden" id="chat-side" value="${side}"><input id="chat-in" placeholder="Напишите сообщение" autocomplete="off" aria-label="Сообщение"><button class="btn btn-p" type="submit" aria-label="Отправить" style="width:42px;height:42px;padding:0">${ic('send')}</button></form>`:`<div class="empty" style="margin:auto">Выберите диалог</div>`}</div>
 </div>`:`<section class="card empty col g12" style="align-items:center"><span class="logo lg" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('msg',24)}</span><h2>Пока нет сообщений</h2><p class="sm muted" style="max-width:420px">${side==='student'?'Здесь появятся диалоги с компаниями после приглашения на интервью и чаты команд в командных проектах.':'Здесь появятся диалоги с кандидатами, которых вы пригласили на интервью.'}</p>${side==='student'?`<div class="row g8"><button class="btn btn-p btn-sm" data-go="project-${T().main}">Выполнить проект</button><button class="btn btn-s btn-sm" data-go="project-p5">Командный проект</button></div>`:''}</section>`}`}
VIEWS.messages=(id)=>chatView(id,'student');
