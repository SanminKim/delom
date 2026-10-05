/* ================= employer ================= */
function alexCand(){const e=emp(),d=pst(e.main)==='done';return {id:'c2',name:'Алексей Иванов',prof:T().goal,uni:'НИУ ВШЭ · Бизнес-информатика, 3 курс',match:e.match[d?1:0],skills:confAll().map(s=>s.name),projects:projCount(),city:'Москва',color:'#3B47E0',fresh:d,score:d?(S.scores[e.main]||P(e.main).score):null}}
const cands=()=>[...(VIS().show?[alexCand()]:[]),...CANDS].sort((a,b)=>b.match-a.match);
function candStatus(c){const e=emp();if(c.id==='c2'){const inv=S.inv[e.main];if(inv&&inv.st==='accepted')return `<span class="pill ok">${ic('cal')}Интервью ${inv.slot.split(' · ')[0]}</span>`;if(inv)return `<span class="pill ac">${ic('mail')}Приглашён</span>`}if(S.empInvited[e.id+c.id])return `<span class="pill ac">${ic('mail')}Приглашён</span>`;return ''}
const empVac=()=>vacList().map(v=>{const a=vacApps(emp(),v);return {...v,resp:v.extra?a.length:v.resp,fresh:a.filter(x=>x.st==='new').length}});
VIEWS.empdash=()=>{
 const e=emp(),mp=P(e.main),d=pst(e.main)==='done',rev=pst(e.main)==='review';
 const top=[...e.top.map(([id,s])=>({c:CANDS.find(x=>x.id===id),s})),...(d?[{c:alexCand(),s:Number(String(S.scores[e.main]||mp.score).replace(',','.'))}]:[])].sort((a,b)=>b.s-a.s);
 return `
 <div class="page-h"><div><span class="label">${e.company} · кабинет работодателя</span><h1 style="margin-top:4px">Добрый день, ${e.first}</h1><p>Кандидаты приходят с подтверждёнными навыками и результатами ваших проектов — вы видите, как они работают, до интервью.</p></div>
 <div class="row g8"><button class="btn btn-s" data-act="newVac" data-type="Вакансия">${ic('briefcase')}Создать вакансию</button><button class="btn btn-s" data-act="newVac" data-type="Стажировка">${ic('cap')}Создать стажировку</button><button class="btn btn-p" data-go="postproject">${ic('plus')}Разместить проект</button></div></div>
 <div class="grid-4" style="margin-bottom:20px">
  ${[['Активные вакансии',empVac().length,'briefcase','empjobs'],['Проекты',2+S.published.length,'folder','empjobs'],['Кандидаты',126+(d?1:0),'users','candidates'],['Рекомендованные кандидаты',18+(d?1:0),'star','candidates']].map(k=>`<section class="card kpi hov" data-go="${k[3]}"><div class="row between"><span class="sm muted">${k[0]}</span><span class="muted">${ic(k[2])}</span></div><span class="v">${k[1]}</span></section>`).join('')}
 </div>
 ${d?`<div class="banner"><span class="ic">${ic('star',20)}</span><div class="grow"><div class="b">Новое решение по проекту «${mp.short}»: Алексей Иванов, ${S.scores[e.main]||mp.score} из 5</div><div class="sm t2">Подтверждены ${confirmsOf(e.main).map(id=>SK[id].name).join(', ')}. Кандидату отправлено приглашение на интервью на позицию ${mp.invitePos}.</div></div><div class="row g8"><button class="btn btn-p btn-sm" data-act="candProfile" data-id="c2">Смотреть решение</button><button class="btn btn-s btn-sm" data-go="empmessages-inv-${e.main}">${ic('msg')}Написать</button></div></div>`:rev?`<div class="banner ac"><span class="ic">${ic('clock',20)}</span><div class="grow"><div class="b">Алексей Иванов отправил решение по проекту «${mp.short}»</div><div class="sm t2">Решение у ментора на проверке. Результат с подтверждёнными навыками появится здесь.</div></div></div>`:''}
 <div class="split">
  <div class="stack">
   <section class="card"><div class="card-h"><div><h2>Лучшие решения проекта</h2><div class="sm muted">${mp.short} · ${(mp.id==='p1'?21:34)+(d?1:0)} решений</div></div><button class="btn btn-g btn-sm" data-go="empproject-${e.main}">Все решения${ic('arR')}</button></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Кандидат</th><th>Оценка</th><th>Совпадение</th><th></th></tr></thead><tbody>
    ${top.map(({c,s})=>`<tr><td><div class="row g12" style="flex-wrap:nowrap">${av(initials(c.name),c.color)}<div><div class="b">${c.name} ${c.fresh?'<span class="new-tag">Новое</span>':''}</div><div class="xs muted">${c.prof}</div></div></div></td><td><span class="pill">${ic('star')}${dec(s.toFixed(1))}</span></td><td><b>${c.match}%</b></td><td style="text-align:right"><div class="row g8" style="justify-content:flex-end;flex-wrap:nowrap">${candStatus(c)||`<button class="btn btn-s btn-sm" data-act="invite" data-id="${c.id}">Пригласить</button>`}<button class="btn btn-g btn-sm" data-act="candProfile" data-id="${c.id}">Профиль</button></div></td></tr>`).join('')}
    </tbody></table></div></section>
   <section class="card"><div class="card-h"><h2>Активные вакансии</h2><button class="btn btn-g btn-sm" data-go="empjobs">Управлять${ic('arR')}</button></div>
    ${empVac().map(v=>`<div class="row between" style="padding:10px 0;border-top:1px solid var(--border);cursor:pointer" data-go="empvac-${v.i}"><div><div class="b">${esc(v.title)}</div><div class="xs muted">${v.type} · ${esc(v.format)}</div></div><div class="row g8"><span class="sm"><b>${v.resp}</b> <span class="muted">${plural(v.resp,'отклик','отклика','откликов')}</span></span>${vacState(emp(),v)==='auto'?'<span class="pill red">Закрыта: нет ответа</span>':v.fresh?`<span class="pill pr">${v.fresh} ${plural(v.fresh,'ждёт','ждут','ждут')} ответа</span>`:'<span class="pill">Все отвечены</span>'}</div></div>`).join('')}</section>
  </div>
  <aside class="stack">
   <section class="card"><div class="card-h"><h2>Воронка найма через проекты</h2></div>
    ${hbars([['Просмотры проектов',1240],['Участники',55],['Отправили решения',27+(d?1:0)],['Приглашены',6+(d?1:0)],['Наняты',2]])}
    <p class="xs muted" style="margin-top:10px">Кандидаты из проектов проходят интервью в 2,4 раза чаще, чем из обычных откликов.</p><button class="btn btn-s btn-sm" data-go="hiring" style="margin-top:10px">${ic('layers')}Кандидаты по этапам</button></section>
   <section class="card col g12"><h2>Ваш тариф: ${esc(curTier())}</h2><p class="sm muted">Использовано 2 из 5 проектов и 11 из 30 приглашений в этом месяце.</p>${bar(37,'thin')}<button class="btn btn-s btn-sm" data-go="pricing" style="align-self:flex-start">${ic('calc')}Тарифы и калькулятор экономии</button></section>
  </aside>
 </div>`};
VIEWS.candidates=()=>{
 const f=UI.cand;const skills=['SQL','Python','Product Analytics','Power BI','Customer Development','A/B-тестирование','CJM','Когортный анализ','Figma','BPMN'];
 return `
 <div class="page-h"><div><span class="label">Поиск кандидатов</span><h1 style="margin-top:4px">Студенты с подтверждёнными навыками</h1><p>Совпадение считается с позицией ${emp().hireFor}. Фильтр по навыкам учитывает только подтверждённые компетенции.</p></div></div>
 <section class="card col g12" style="margin-bottom:18px">
  <div class="row g8"><span class="label" style="margin-right:4px">Навыки</span>${skills.map(s=>`<button class="toggle-chip ${f.skills.includes(s)?'on':''}" data-act="candSkill" data-id="${s}">${s}</button>`).join('')}</div>
  <div class="row g12">${select('cf-prof','Все профессии',PROFS,f.prof)}<label class="row g8 sm t2">Совпадение от <b id="cf-minv">${f.min}%</b><input type="range" id="cf-min" min="0" max="90" step="10" value="${f.min}" style="accent-color:var(--accent)"></label><button class="btn btn-g btn-sm" data-act="resetCF">Сбросить</button></div>
 </section>
 <div id="candList"></div>`};
function renderCandList(){
 const el=$('#candList');if(!el)return;const f=UI.cand;
 const l=cands().filter(c=>f.skills.every(s=>c.skills.includes(s))&&(!f.prof||c.prof===f.prof)&&c.match>=f.min);
 el.innerHTML=`<div class="sm muted" style="margin-bottom:12px">${l.length} ${plural(l.length,'кандидат','кандидата','кандидатов')}</div><div class="col g12">`+(l.map(c=>`<article class="card cand">
  ${av(initials(c.name),c.color,48)}
  <div class="col g6" style="min-width:0"><div class="row g8"><h3 style="font-size:16px">${c.name}</h3>${c.fresh?'<span class="new-tag">Решил ваш проект</span>':''}${candStatus(c)}</div><div class="sm muted">${c.prof} · ${c.uni} · ${c.city}</div>
   <div class="chips">${c.skills.map(s=>`<span class="pill ok">${ic('shield')}${s}</span>`).join('')}</div><div class="xs muted">Проекты: ${c.projects}${c.score?' · оценка в вашем проекте '+c.score:''}</div></div>
  <div class="cand-act row g12" style="flex-wrap:nowrap">${ring(c.match,58)}<div class="col g6"><button class="btn btn-s btn-sm" data-act="candProfile" data-id="${c.id}">Посмотреть профиль</button>${candStatus(c)?'':`<button class="btn btn-p btn-sm" data-act="invite" data-id="${c.id}">Пригласить</button>`}</div></div>
 </article>`).join('')||'<div class="card empty">Нет кандидатов с таким набором подтверждённых навыков</div>')+'</div>';
}
VIEWS.postproject=()=>`
 <div class="page-h"><div><span class="label">Для работодателя</span><h1 style="margin-top:4px">Разместить проект</h1><p>Опишите реальную задачу вашей команды. Студенты решат её, а вы увидите, как они работают, до интервью.</p></div></div>
 <div class="split">
  <form class="card col g16" id="projForm" novalidate>
   <div class="form-grid">
    <label class="field full"><span>Название проекта</span><input class="inp" id="pp-title" required placeholder="Например, «Анализ оттока учеников после пробного урока»"></label>
    <label class="field full"><span>Описание</span><textarea class="inp" id="pp-desc" rows="4" required placeholder="Какую задачу решает команда, какие данные вы предоставите, какой результат ждёте"></textarea></label>
    <label class="field"><span>Направление</span><select class="sel" id="pp-dir">${['Product / Analytics','Data Analytics','Business Analysis','Design','Marketing','Development'].map(x=>`<option>${x}</option>`).join('')}</select></label>
    <label class="field"><span>Навыки</span><input class="inp" id="pp-skills" value="Product Analytics, SQL"></label>
    <label class="field"><span>Сложность</span><select class="sel" id="pp-diff"><option>Лёгкая</option><option selected>Средняя</option><option>Сложная</option></select></label>
    <label class="field"><span>Срок выполнения</span><select class="sel" id="pp-dur"><option>1 неделя</option><option selected>1–2 недели</option><option>3 недели</option><option>1 месяц</option></select></label>
    <label class="field"><span>Количество участников</span><input class="inp" id="pp-count" type="number" min="1" value="30"></label>
    <div class="field"><span>Формат</span><div class="seg" style="align-self:flex-start"><button type="button" class="on" data-act="ppFormat" data-id="Индивидуальный">Индивидуальный</button><button type="button" data-act="ppFormat" data-id="Командный">Командный</button></div></div>
    <label class="check full" style="padding:14px;border-radius:12px;background:var(--accent-soft)"><input type="checkbox" id="pp-hire" checked><span><b style="color:var(--text)">Возможность найма лучших участников</b><br><span class="sm">Лучшие участники могут получить приглашение на интервью</span></span></label>
   </div>
   <p class="sm" id="pp-err" style="color:var(--red)" hidden>Заполните название и описание проекта.</p>
   <div class="row g8"><button class="btn btn-p btn-lg" type="submit">${ic('send')}Опубликовать проект</button><button class="btn btn-g" type="button" data-act="ppDemo">Заполнить пример</button></div>
  </form>
  <aside class="stack">
   <section class="card col g12"><h2>Как это работает</h2><ol class="ol sm"><li>Проект появляется в каталоге и в рекомендациях студентов с подходящей целью</li><li>Студенты выполняют задачу, ментор ${BRAND} проверяет решения</li><li>Вы получаете рейтинг решений и подтверждённые навыки участников</li><li>Приглашаете лучших на интервью в один клик</li></ol></section>
   <section class="card col g8"><span class="label">Средние показатели</span><div class="row between sm"><span class="muted">Участников на проект</span><b>42</b></div><div class="row between sm"><span class="muted">Отправляют решение</span><b>55%</b></div><div class="row between sm"><span class="muted">Стоимость найма ниже</span><b>на 30–40%</b></div></section>
  </aside>
 </div>`;
VIEWS.empmessages=(id)=>chatView(id,'employer');

/* ================= pricing ================= */
const curTier=()=>S.tier||'Команда';
const TIERS=[{n:'Старт',p:0,pl:'0 ₽',per:'навсегда',d:'Попробовать найм через проекты',f:['1 проект в квартал','1 активная вакансия','До 20 решений на проект','Приглашения на интервью']},
 {n:'Команда',p:39900,pl:'39 900 ₽',per:'в месяц',d:'Для регулярного найма стажёров',pop:1,f:['До 5 проектов одновременно','10 вакансий и стажировок','Поиск по подтверждённым навыкам','30 приглашений в месяц','Аналитика воронки найма']},
 {n:'Корпоративный',p:150000,pl:'от 150 000 ₽',per:'в месяц',d:'Для крупных стажёрских программ',f:['Без лимитов на проекты и вакансии','Брендированные кейс-чемпионаты','Интеграция с ATS','Выделенный менеджер','Отчёты для HR-бренда']}];
const FEE=25000;
function calcModel(){const c=UI.calc;const trad=c.hires*c.cost*(1+c.fail/100);
 const start=c.hires<=4?FEE*c.hires*1.12:Infinity;const team=TIERS[1].p*12+FEE*c.hires*1.12;const plat=Math.min(start,team);const tier=start<=team?'Старт':'Команда';
 return {trad,plat,tier,save:trad-plat,weeks:Math.max(0,c.weeks-3)}}
function calcOut(){const m=calcModel(),mx=Math.max(m.trad,m.plat);
 return `<div class="col g6"><span class="label">Экономия в год</span><span class="save-big" style="${m.save<0?'color:var(--orange)':''}">${m.save<0?'−':''}${rub(Math.abs(m.save))}</span><span class="sm muted">Рекомендуемый тариф: <b style="color:var(--text)">${m.tier}</b> + ${rub(FEE)} за каждого нанятого стажёра</span></div>
  <div class="col g8"><div class="cbar"><span class="t2">Сейчас</span><div class="bar gray"><i data-w="${m.trad/mx*100}" style="width:${m.trad/mx*100}%">${rub(m.trad)}</i></div></div><div class="cbar"><span class="t2">С ${BRAND}</span><div class="bar"><i data-w="${m.plat/mx*100}" style="width:${m.plat/mx*100}%">${rub(m.plat)}</i></div></div></div>
  <div class="grid-2" style="gap:10px"><div class="stat"><div class="v">−${m.weeks} ${plural(m.weeks,'неделя','недели','недель')}</div><div class="sm muted">на закрытие позиции</div></div><div class="stat"><div class="v">${Math.round(UI.calc.fail)}% → 12%</div><div class="sm muted">стажёров не проходят испытательный срок</div></div></div>
  <p class="xs muted">Расчёт на допущениях демо-версии: с платформой позиция закрывается за 3 недели, а доля ранних уходов снижается до 12%, потому что кандидат уже показал себя на реальной задаче. Стоимость замены ушедшего стажёра равна стоимости найма.</p>`}
VIEWS.pricing=()=>{const c=UI.calc;return `
 <div class="page-h"><div><span class="label">Бизнес-модель</span><h1 style="margin-top:4px">Тарифы и экономия на найме</h1><p>Компании платят за доступ к кандидатам с подтверждёнными навыками и за результат — нанятого стажёра. Для студентов платформа бесплатна.</p></div></div>
 ${S.tierNext?`<div class="banner" style="background:var(--orange-soft);margin-bottom:16px"><span class="ic" style="background:var(--orange)">${ic('cal',20)}</span><div class="grow"><div class="b">С ${esc(S.tierNext.from)} — тариф «${esc(S.tierNext.name)}»</div><div class="sm t2">До этой даты действует «${esc(curTier())}» со всеми лимитами.</div></div><button class="btn btn-s btn-sm" data-act="tierCancel">Отменить смену</button></div>`:''}
 <div class="tiers" style="margin-bottom:24px">${TIERS.map(t=>{const cur=t.n===curTier();return `<section class="card tier ${cur?'tier-pop':''}">${cur?'<span class="pill ac tag" style="background:var(--accent);color:var(--on-accent)">Ваш тариф</span>':t.pop?'<span class="pill tag">Популярный</span>':''}<div><h2>${t.n}</h2><p class="sm muted">${t.d}</p></div><div class="price">${t.pl} <small>${t.per}</small></div><ul class="ul sm">${t.f.map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul><button class="btn ${cur?'btn-s':'btn-p'} btn-block" style="margin-top:auto" data-act="tier" data-id="${t.n}" ${cur||(S.tierNext&&S.tierNext.name===t.n)?'disabled':''}>${cur?'Текущий тариф':S.tierNext&&S.tierNext.name===t.n?'Запланирован':t.n==='Корпоративный'?'Запросить предложение':'Перейти на тариф'}</button></section>`}).join('')}</div>
 ${(S.salesReq||[]).length?`<section class="card col g8" style="margin-bottom:24px"><h2>Ваши запросы</h2>${S.salesReq.map(r=>`<div class="row between" style="padding:8px 0;border-top:1px solid var(--border)"><div><div class="b sm">Корпоративный тариф · ${r.hires} наймов в год</div><div class="xs muted">${esc(r.name)} · ${esc(r.contact)} · ${esc(r.date)}</div></div><span class="pill">Запрос №${r.n} · принят</span></div>`).join('')}</section>`:''}
 <div class="banner ac" style="margin-bottom:24px"><span class="ic">${ic('coin',20)}</span><div class="grow"><div class="b">Плата за результат: ${rub(FEE)} за каждого нанятого стажёра</div><div class="sm t2">Списывается только после выхода стажёра на работу. На корпоративном тарифе включена в подписку.</div></div></div>
 <section class="card"><div class="card-h"><div><h2>Калькулятор экономии</h2><div class="sm muted">Сравните текущий найм стажёров с наймом через проекты</div></div><span class="muted">${ic('calc',22)}</span></div>
  <div class="calc">
   <div class="col g20">
    ${[['calc-hires','Стажёров в год',c.hires,1,50,1,v=>v],['calc-cost','Стоимость найма одного стажёра сейчас',c.cost,20000,250000,5000,v=>rub(v)],['calc-weeks','Недель на закрытие позиции',c.weeks,2,16,1,v=>v],['calc-fail','Не проходят испытательный срок',c.fail,0,60,5,v=>v+'%']].map(([id,l,v,mn,mx,st,f])=>`<div class="rng"><div class="row"><label for="${id}" class="sm b t2">${l}</label><b id="${id}-v">${f(v)}</b></div><input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${v}"></div>`).join('')}
    <p class="xs muted">Стоимость найма включает время рекрутера, размещение на сайтах вакансий и проверку тестовых заданий.</p>
   </div>
   <div class="col g16" id="calcOut">${calcOut()}</div>
  </div></section>`};

/* ================= mentor ================= */
const QUEUE=[{who:'Мария Кузнецова',pid:'p2',score:'4,5',stars:[5,4,5,4],comment:'Сильный анализ онбординга, редизайн экрана цели можно упростить ещё на один шаг.',date:'22 сентября'},
 {who:'Тимур Ахметов',pid:'p4',score:'4,6',stars:[5,4,5,4],comment:'Когорты собраны корректно, вывод про партнёрскую акцию подтверждён данными.',date:'19 сентября'},
 {who:'Екатерина Волкова',pid:'p5',score:'4,9',stars:[5,5,5,5],comment:'Лучшие интервью в потоке и понятная метрика онбординга.',date:'16 сентября'}];
const CONS_OTHER=[{key:'o1',who:'Дарья Федорова',what:'Разбор резюме аналитика',when:'Вт, 30 сентября · 20:00'},{key:'o2',who:'Глеб Андреев',what:'Оценка навыка «Roadmapping»',when:'Ср, 1 октября · 19:30'}];
const myReviewPids=()=>allProjects().filter(p=>['review','done'].includes(pst(p.id))).map(p=>p.id).sort((a,b)=>(pst(a)==='review'?0:1)-(pst(b)==='review'?0:1));
VIEWS.mentor=()=>{
 const mm=mentorMe(),tab=UI.mentorTab,mine=myReviewPids(),waiting=mine.filter(x=>pst(x)==='review').length;
 const cons=[...(S.hrReview?[{key:'cv',cv:1,who:'Алексей Иванов',what:'Разбор резюме',when:'заявка от '+S.hrReview.date,me:1}]:[]),...Object.keys(S.mentorReq).map(k=>({key:'s-'+k,sk:k,who:'Алексей Иванов',what:'Оценка навыка «'+SK[k].name+'»',when:S.mentorReq[k].slot,me:1})),...CONS_OTHER];
 return `
 <div class="page-h"><div><span class="label">Кабинет ментора</span><h1 style="margin-top:4px">Добрый день, ${mm.name.split(' ')[0]}</h1><p>Вы проверяете решения студентов по критериям компаний и подтверждаете навыки. Ваша оценка — основание в Skill Passport, которое видят работодатели.</p></div></div>
 <div class="grid-4" style="margin-bottom:20px">
  ${[['На проверке',waiting,'clock'],['Проверено за месяц',38+mine.filter(x=>pst(x)==='done').length,'check'],['Средняя оценка решений','4,3','star'],['Консультации на неделе',cons.length,'cal']].map(k=>`<section class="card kpi"><div class="row between"><span class="sm muted">${k[0]}</span><span class="muted">${ic(k[2])}</span></div><span class="v">${k[1]}</span></section>`).join('')}
 </div>
 <div class="tabs">${[['queue','Решения'],['cons','Консультации']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-act="mTab" data-id="${k}">${l}</button>`).join('')}</div>
 ${tab==='queue'?`<section class="card" style="padding:0"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Студент</th><th>Проект</th><th>Статус</th><th></th></tr></thead><tbody>
  ${mine.map(pid=>{const p=P(pid),st=pst(pid);return `<tr><td><div class="row g12" style="flex-wrap:nowrap">${av('АИ','#3B47E0')}<div><div class="b">Алексей Иванов</div><div class="xs muted">НИУ ВШЭ · 3 курс${wsOf(pid).attempt>1?' · попытка '+wsOf(pid).attempt:''}</div></div></div></td><td>${esc(p.short)}<div class="xs muted">${esc(p.company)} · ментор ${esc(mentorOf(pid).name)}</div></td><td>${st==='review'?'<span class="pill pr">Ждёт проверки</span>':`<span class="pill ok">Проверено · ${S.scores[pid]||p.score}</span>`}</td><td style="text-align:right"><button class="btn ${st==='review'?'btn-p':'btn-s'} btn-sm" data-go="review-${pid}">${st==='review'?'Проверить':'Открыть'}</button></td></tr>`}).join('')}
  ${QUEUE.map((q,i)=>`<tr><td><div class="row g12" style="flex-wrap:nowrap">${av(initials(q.who),'#8A90B0')}<div><div class="b">${q.who}</div><div class="xs muted">Студент</div></div></div></td><td>${esc(P(q.pid).short)}<div class="xs muted">${esc(P(q.pid).company)}</div></td><td><span class="pill ok">Проверено · ${q.score}</span></td><td style="text-align:right"><button class="btn btn-g btn-sm" data-act="mentorOld" data-id="${i}">Открыть</button></td></tr>`).join('')}
  </tbody></table></div>${!mine.length?`<div class="empty sm" style="border-top:1px solid var(--border)">Новых решений нет. Когда студент отправит решение, оно появится здесь. <button class="linkish" data-act="role" data-role="student" data-then="projects">Открыть проекты глазами студента</button></div>`:''}</section>`
 :`<section class="card" style="padding:0">${cons.map(c=>{const st=S.consOk[c.key];return `<div class="row between" style="padding:14px 20px;border-bottom:1px solid var(--border)"><div class="row g12" style="flex-wrap:nowrap">${av(initials(c.who),c.me?'#3B47E0':'#8A90B0')}<div><div class="b">${c.who} ${c.me&&!st?'<span class="new-tag">Новая</span>':''}</div><div class="sm muted">${esc(c.what)}</div></div></div><div class="row g8"><span class="pill">${ic('cal')}${c.when}</span>${c.cv?(S.hrReview.st==='done'?`<span class="pill ok">${ic('check')}Разбор отправлен</span>`:`<button class="btn btn-p btn-sm" data-act="hrWrite">Написать разбор</button>`):st==='assessed'?`<span class="pill ok">${ic('check')}Оценка проведена</span>`:st==='ok'?(c.sk?`<button class="btn btn-p btn-sm" data-act="consAssess" data-id="${c.sk}">Провести оценку</button>`:`<span class="pill ok">${ic('check')}Подтверждена</span>`):`<button class="btn btn-s btn-sm" data-act="mentorCons" data-id="${c.key}">Подтвердить</button>`}</div></div>`}).join('')}${!cons.length?'<div class="empty">Записей на консультации пока нет</div>':''}</section>`}`};
function slideHtml(p,s,i){const [title,kind,data]=s;let body='';
 if(kind==='text')body=`<p style="font-size:11px;color:var(--text-2);line-height:1.4">${esc(data)}</p>`;
 if(kind==='funnel')body=`<div class="mb">${[100,74,43,18,7].map((w,k)=>`<i class="${k===3||k===4?'o':''}" style="width:${Math.max(5,w)}%"></i>`).join('')}</div>`;
 if(kind==='table')body=`<div class="tb">${data.map(r=>`<span>${esc(r[0])}</span><b>${r[1]}</b>`).join('')}</div>`;
 if(kind==='heat')body=`<div class="hm">${COH.flatMap(([n,v])=>v.map(x=>`<i style="background:${x===null?'var(--track)':`color-mix(in srgb,var(--accent) ${Math.round(x*.55)}%,var(--surface))`}"></i>`)).join('')}</div>`;
 if(kind==='bars')body=`<div style="display:flex;align-items:flex-end;gap:4px;height:48px;margin-top:auto">${[40,62,55,78,70,88,64].map(h=>`<i style="flex:1;height:${h}%;background:var(--accent);border-radius:2px;opacity:.8"></i>`).join('')}</div>`;
 return `<div class="slide"><span class="sn">СЛАЙД ${i+1}</span><h4>${esc(title)}</h4>${body}</div>`}
VIEWS.review=(id)=>{
 const pid=id||T().main,p=P(pid);if(!p)return `<div class="card empty">Решение не найдено. <button class="linkish" data-go="mentor">К списку решений</button></div>`;
 const st=pst(pid),mm=mentorOf(pid),w=wsOf(pid);
 if(st==='none'||st==='active')return `<button class="crumb" data-go="mentor">${ic('arL',16)}Решения</button><section class="card empty col g12" style="align-items:center"><span class="logo lg" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('clock',24)}</span><h2>${w.returned&&st==='active'?'Решение на доработке':'Решение ещё не отправлено'}</h2><p class="sm muted" style="max-width:440px">${w.returned&&st==='active'?`Вы вернули решение ${esc(w.returned.date)}. Когда студент отправит новую версию, она появится здесь.`:`Алексей Иванов пока выполняет проект «${esc(p.short)}». Когда он отправит решение, оно появится здесь на проверку.`}</p><button class="btn btn-p btn-sm" data-act="role" data-role="student" data-then="${st==='none'?'project-'+pid:'workspace-'+pid}">Открыть проект глазами студента</button></section>`;
 const rv=UI.rv[pid]||(UI.rv[pid]={stars:[...p.rubric],sel:[...p.confirms],comment:(S.reviews[pid]||{}).comment||p.review});
 const score=(rv.stars.reduce((a,b)=>a+b,0)/rv.stars.length).toFixed(1);
 const done=st==='done';
 return `
 <button class="crumb" data-go="mentor">${ic('arL',16)}Решения</button>
 <div class="page-h"><div><span class="label">Проверка решения · ${esc(p.company)}</span><h1 style="margin-top:4px">${esc(p.short)}</h1></div>${done?`<span class="pill ok" style="height:32px;padding:0 12px">${ic('check')}Проверено · оценка ${S.scores[pid]||p.score}</span>`:'<span class="pill pr" style="height:32px;padding:0 12px">Ждёт проверки</span>'}</div>
 <div class="split">
  <div class="stack">
   <section class="card col g12"><div class="row g12" style="flex-wrap:nowrap">${av('АИ','#3B47E0',44)}<div class="grow"><div class="b">Алексей Иванов</div><div class="sm muted">НИУ ВШЭ · Бизнес-информатика, 3 курс${S.teams[pid]?` · команда «${esc(S.teams[pid].name)}»`:''}</div><div class="xs muted">Отправлено ${esc(w.sentAt||todayStr())}${w.attempt>1?` · попытка ${w.attempt}`:''}</div></div></div>
    <div class="quote sm"><b>Итог решения.</b> ${esc(w.summary||'—')}</div>
    ${w.file?`<button class="fileln" data-act="openStored" data-id="ws-${pid}"><span class="fi" style="background:var(--orange-soft);color:var(--orange)">${esc(extOf(w.file).toUpperCase().slice(0,4))}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(w.file)}</div><div class="xs muted">${w.fileSize?fmtSize(w.fileSize)+' · ':''}открыть решение</div></span><span class="muted">${ic('eye')}</span></button>`:''}
    ${(w.history||[]).length?`<div class="col g6"><span class="label">История доработок</span>${w.history.map(h=>`<div class="sm t2">${esc(h.date)} — ${esc(h.comment)}</div>`).join('')}</div>`:''}</section>
   ${p.slides&&w.fileDemo?`<section class="card col g12"><h2>Ключевые слайды</h2><div class="slides">${p.slides.map((s,i)=>slideHtml(p,s,i)).join('')}</div></section>`:''}
   <section class="card col g12"><h2>Задача компании</h2><div class="task-q">${esc(p.task)}</div><ol class="ol sm">${p.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
  </div>
  <aside class="card sticky col g12">
   <div class="row g12" style="flex-wrap:nowrap">${av(mm.ini,mm.color,36)}<div><div class="b">${esc(mm.name)}</div><div class="xs muted">Ментор · ${esc(mm.pos)}</div></div></div>
   <div class="divider" style="margin:0"></div>
   <div class="label">Оценка по критериям компании</div>
   <div>${p.criteria.map((c,i)=>`<div class="rub"><span class="sm">${esc(c)}</span><span class="stars">${[1,2,3,4,5].map(n=>`<button class="${n<=rv.stars[i]?'on':''}" ${done?'disabled':''} data-act="star" data-id="${pid}:${i}:${n}" aria-label="${esc(c)}: ${n} из 5">${ic('star')}</button>`).join('')}</span></div>`).join('')}</div>
   <div class="row between"><span class="b">Итоговая оценка</span><span class="price" style="font-size:24px">${dec(score)}</span></div>
   <div class="label" style="margin-top:4px">Подтвердить навыки</div>
   <div class="col g8">${p.confirms.map(id=>`<label class="check"><input type="checkbox" data-sk="${id}" ${rv.sel.includes(id)?'checked':''} ${done?'disabled':''} id="rv-${id}">${esc(SK[id].name)}</label>`).join('')}</div>
   <label class="field"><span>Отзыв для студента и компании</span><textarea class="inp" id="rv-comment" rows="4" ${done?'disabled':''}>${esc(rv.comment)}</textarea></label>
   ${done?`<div class="divider" style="margin:4px 0"></div><div class="label">Рекомендательное письмо</div><textarea class="inp" id="rec-text" rows="8">${esc(S.recs[pid]||REC_T(pid))}</textarea>${taskUI('rec',{loadingText:'Claude пишет черновик…'})}<div class="row g8"><button class="btn btn-s btn-sm" data-act="recAI" data-id="${pid}">${ic('spark')}${aiOn()?'Черновик с ИИ':'Черновик по шаблону'}</button><button class="btn btn-p btn-sm" data-act="recSave" data-id="${pid}">Опубликовать у студента</button></div><button class="btn btn-s btn-block" data-act="role" data-role="student" data-then="complete-${pid}">Посмотреть глазами студента</button>`
   :`<button class="btn btn-ok btn-lg btn-block" data-act="finishReview" data-id="${pid}" ${score<3?'disabled title="При оценке ниже 3 решение стоит вернуть на доработку"':''}>${ic('shield')}Подтвердить навыки и завершить</button>${score<3?'<p class="xs muted">Оценка ниже 3 — навыки подтвердить нельзя, верните решение на доработку.</p>':''}
    <label class="field"><span>Что доработать (для возврата)</span><textarea class="inp" id="rv-return" rows="3" placeholder="Конкретно: что исправить и зачем"></textarea></label><button class="btn btn-s btn-block" data-act="returnReview" data-id="${pid}">${ic('pen')}Вернуть на доработку</button>`}
  </aside>
 </div>`};

/* ================= university ================= */
function uniAlex(){const t=T(),m=t.main,inv=S.inv[m];return ['Алексей Иванов','Бизнес-информатика, 3 курс',t.goal,readiness(),confAll().length,projCount(),inv&&inv.st==='accepted'?'Интервью в '+P(m).company:pst(m)==='done'?'Приглашение от '+P(m).company:pst(m)==='none'?'Выбирает проект':'Проект в работе',1]}
VIEWS.uni=()=>{
 const fresh=skAll().filter(s=>s.fresh).length,vals=[...UNI.confirmed];vals[11]+=fresh;
 const inv=Object.values(S.inv).filter(i=>i.st==='accepted').length;
 return `
 <div class="page-h"><div class="row g16" style="flex-wrap:nowrap">${logo('НИУ ВШЭ','lg')}<div><span class="label">${UNI.unit}</span><h1 style="margin-top:4px">НИУ ВШЭ на платформе</h1><p style="margin-top:4px">Данные студентов, которые разрешили делиться прогрессом с вузом. Обновляются в реальном времени.</p></div></div><button class="btn btn-s" data-act="uniReport">${ic('file')}Отчёт для ректората</button></div>
 <div class="grid-4" style="margin-bottom:20px">
  ${[['Студентов на платформе',fmt(1240),'users','+86 за месяц'],['Подтверждено навыков',fmt(3860+fresh),'shield',fresh?`+${fresh} сегодня`:'+455 за месяц'],['Проектов с компаниями',fmt(612+doneProjects().length),'folder','34 компании'],['Приглашений на интервью',fmt(184+inv),'mail','15% студентов']].map(k=>`<section class="card kpi"><div class="row between"><span class="sm muted">${k[0]}</span><span class="muted">${ic(k[2])}</span></div><span class="v">${k[1]}</span><span class="xs" style="color:var(--green)">${k[3]}</span></section>`).join('')}
 </div>
 ${(S.uniCourses||[]).length?`<section class="card col g8" style="margin-bottom:20px"><h2>Проекты компаний в курсах</h2>${S.uniCourses.map((c,i)=>`<div class="row between" style="padding:8px 0;border-top:1px solid var(--border)"><div class="row g12" style="flex-wrap:nowrap">${logo(P(c.pid).company,'sm')}<div><div class="b sm">${esc(c.course)} ← «${esc(P(c.pid).short)}»</div><div class="xs muted">${c.students} студентов · с ${esc(c.date)}</div></div></div><button class="btn btn-g btn-sm" data-act="uniUnlink" data-id="${i}">Убрать</button></div>`).join('')}</section>`:''}
 <div class="split">
  <div class="stack">
   <section class="card"><div class="card-h"><div><h2>Подтверждённые навыки по месяцам</h2><div class="sm muted">Октябрь 2025 — сентябрь 2026</div></div></div>${barChart(UNI.months,vals,{hl:11})}</section>
   <section class="card"><div class="card-h"><h2>Образовательные программы</h2></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Программа</th><th>Студентов</th><th>Средняя готовность</th><th>Стажировки</th></tr></thead><tbody>${UNI.programs.map((r,i)=>`<tr data-go="uniprogram-${i}" style="cursor:pointer"><td class="b"><span class="linkish">${r[0]}</span></td><td>${r[1]}</td><td><div class="row g8" style="flex-wrap:nowrap"><div style="width:90px">${bar(r[2],'o thin')}</div><b>${r[2]}%</b></div></td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div></section>
  </div>
  <aside class="stack">
   <section class="card"><div class="card-h"><h2>Кто приглашает студентов</h2></div>${hbars(UNI.hiring)}</section>
   <section class="card col g12"><h2>Каких навыков не хватает</h2><p class="sm muted">Доля студентов, у которых навык нужен для цели, но не подтверждён</p>${hbars(UNI.gaps.map(g=>[g[0],g[1],'var(--orange)',g[1]+'%']),100)}
    <div class="quote sm"><b>Рекомендация:</b> встроить проект Т-Банка «Дашборд удержания клиентов» в курс «Анализ данных» — он закрывает SQL, Python и BI для 200+ студентов.</div><button class="btn btn-p btn-sm" data-act="uniIntegrate" style="align-self:flex-start">${ic('plus')}Встроить проект в курс</button></section>
  </aside>
 </div>`};
function uniReportHtml(){const fresh=skAll().filter(s=>s.fresh).length,inv=Object.values(S.inv).filter(i=>i.st==='accepted').length;
 const row=r=>`<tr>${r.map(c=>`<td>${esc(String(c))}</td>`).join('')}</tr>`;
 return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Отчёт центра карьеры НИУ ВШЭ</title><style>body{font:14px/1.55 system-ui,sans-serif;max-width:860px;margin:32px auto;padding:0 24px;color:#1B1F33}h1{font-size:22px}h2{font-size:16px;margin-top:26px;color:#3B47E0}table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #E2E6F0;padding:6px 8px;text-align:left}th{font-size:12px;color:#6A7090}.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px}table{display:block;overflow-x:auto}.k div{border:1px solid #E2E6F0;border-radius:10px;padding:10px}.k b{display:block;font-size:22px}</style></head><body>
 <p style="color:#6A7090">НИУ ВШЭ · ${UNI.unit} · сформировано ${todayStr()} на платформе ${BRAND}</p><h1>Карьерная готовность студентов: осенний семестр 2026</h1>
 <div class="k"><div><b>${fmt(1240)}</b>студентов на платформе</div><div><b>${fmt(3860+fresh)}</b>подтверждённых навыков</div><div><b>${fmt(612+doneProjects().length)}</b>проектов с компаниями</div><div><b>${fmt(184+inv)}</b>приглашений на интервью</div></div>
 <h2>Образовательные программы</h2><table><tr><th>Программа</th><th>Студентов</th><th>Средняя готовность</th><th>Стажировки</th></tr>${UNI.programs.map(r=>row([r[0],r[1],r[2]+'%',r[3]])).join('')}</table>
 <h2>Каких навыков не хватает</h2><table><tr><th>Навык</th><th>Доля студентов без подтверждения</th></tr>${UNI.gaps.map(g=>row([g[0],g[1]+'%'])).join('')}</table>
 <h2>Кто приглашает студентов</h2><table><tr><th>Компания</th><th>Приглашений</th></tr>${UNI.hiring.map(h=>row(h)).join('')}</table>
 ${(S.uniCourses||[]).length?`<h2>Проекты компаний в курсах</h2><table><tr><th>Курс</th><th>Проект</th><th>Студентов</th></tr>${S.uniCourses.map(c=>row([c.course,P(c.pid).company+' · '+P(c.pid).short,c.students])).join('')}</table>`:''}
 <p style="color:#6A7090;font-size:12px;margin-top:28px">Данные студентов, разрешивших делиться прогрессом с вузом. Демо-показатели платформы.</p></body></html>`}
function renderUniList(){}

/* ================= metrics ================= */
VIEWS.metrics=()=>{const bare=!S.authed;const tot=MET.funnel[0][1];
 const body=`
 <div class="page-h"><div><span class="label">Для инвесторов и партнёров</span><h1 style="margin-top:4px">Метрики платформы</h1><p>Ключевые показатели ${BRAND} за 12 месяцев. Демо-данные для презентации модели.</p></div><span class="pill pr" style="height:30px;padding:0 12px">${ic('flag')}Демо-данные · сентябрь 2026</span></div>
 <div class="grid-4" style="margin-bottom:20px">
  ${[['Активные студенты (MAU)','18 400','+16% м/м'],['Компании-партнёры','146','+11 за месяц'],['Вузы-партнёры','12','3 в пилоте'],['Выручка в месяц (MRR)','3,1 млн ₽','+11% м/м']].map(k=>`<section class="card kpi"><span class="sm muted">${k[0]}</span><span class="v">${k[1]}</span><span class="xs" style="color:var(--green)">${k[2]}</span></section>`).join('')}
 </div>
 <div class="grid-2" style="margin-bottom:20px">
  <section class="card"><div class="card-h"><div><h2>Активные студенты</h2><div class="sm muted">MAU, тысяч человек</div></div></div>${lineChart(MET.months,MET.mau,{fmtv:v=>dec(Math.round(v*10)/10),unit:' тыс.'})}</section>
  <section class="card"><div class="card-h"><div><h2>Выручка в месяц</h2><div class="sm muted">MRR, млн ₽</div></div></div>${barChart(MET.months,MET.mrr,{fmtv:v=>dec(Math.round(v*10)/10),hl:11})}</section>
 </div>
 <div class="split">
  <section class="card"><div class="card-h"><div><h2>Главная механика: проект → работа</h2><div class="sm muted">Студенты за 12 месяцев</div></div></div>
   ${MET.funnel.map((r,i)=>`<div class="hbar" style="grid-template-columns:200px minmax(0,1fr) 120px"><span class="t2">${r[0]}</span><div class="bar" style="height:12px"><i data-w="${r[1]/tot*100}" style="width:0;${i>=3?'background:var(--green)':''}"></i></div><b style="text-align:right">${fmt(r[1])}${i?` <span class="xs muted">${Math.round(r[1]/MET.funnel[i-1][1]*100)}%</span>`:''}</b></div>`).join('')}
   <div class="grid-3" style="margin-top:16px;gap:10px"><div class="stat"><div class="v">22%</div><div class="sm muted">отправивших решение получают интервью</div></div><div class="stat"><div class="v">41%</div><div class="sm muted">интервью заканчиваются оффером</div></div><div class="stat"><div class="v">5%</div><div class="sm muted">участников проектов находят работу</div></div></div>
  </section>
  <aside class="stack">
   <section class="card col g12"><h2>Юнит-экономика компании-клиента</h2>
    ${[['CAC (привлечение компании)','68 000 ₽'],['ARPA (выручка на компанию)','31 000 ₽ в мес.'],['Валовая маржа','70%'],['Средний срок жизни','14 мес.'],['LTV','304 000 ₽'],['LTV / CAC','4,5'],['Окупаемость CAC','3,1 мес.']].map(r=>`<div class="row between sm" style="padding:6px 0;border-top:1px solid var(--border)"><span class="muted">${r[0]}</span><b>${r[1]}</b></div>`).join('')}</section>
   <section class="card col g12"><h2>Структура выручки</h2><div class="stack-bar">${MET.rev.map(r=>`<i style="width:${r[1]}%;background:${r[2]}"></i>`).join('')}</div><div class="legend">${MET.rev.map(r=>`<span><i style="background:${r[2]}"></i>${r[0]} · ${r[1]}%</span>`).join('')}</div></section>
  </aside>
 </div>`;
 return bare?`<div class="lp">${lpNav()}<div class="lp-in" style="padding-block:32px 64px">${body}</div></div>`:body};

/* ================= landing ================= */
function lpNav(){return `<header class="lp-nav"><div class="lp-in"><div class="brand" style="padding:0" data-go="welcome">${LOGO}<span>${BRAND}</span></div>
 <nav class="lp-links"><button data-act="scrollTo" data-id="how">Как это работает</button><button data-act="scrollTo" data-id="aud">Студентам и компаниям</button><button data-act="scrollTo" data-id="unis">Вузам</button><button data-go="metrics">Метрики</button></nav>
 <div class="row g8" style="margin-left:auto">${S.authed?`<button class="btn btn-p btn-sm" data-go="${HOME[S.lastRole]||'dashboard'}">Открыть кабинет${ic('arR')}</button>`:`<button class="btn btn-g btn-sm" data-go="auth-student" data-login="1">Войти</button><button class="btn btn-p btn-sm" data-go="auth-student">Начать</button>`}</div></div></header>`}
function loopSvg(){return `<svg class="loop-svg" viewBox="0 0 460 330" role="img" aria-label="Замкнутый круг: нужен опыт, чтобы получить работу, и работа, чтобы получить опыт. Выход — реальный проект компании.">
 <path d="M150 70 A110 110 0 1 1 150 260" fill="none" stroke="var(--border-strong)" stroke-width="3" stroke-dasharray="6 8"/>
 <path d="M150 260 A110 110 0 0 1 150 70" fill="none" stroke="var(--red)" stroke-width="3" opacity=".7"/>
 <circle cx="230" cy="70" r="46" fill="var(--surface)" stroke="var(--border)" stroke-width="1.5"/><text x="230" y="66" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Нужна</text><text x="230" y="83" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">работа</text>
 <circle cx="230" cy="260" r="46" fill="var(--surface)" stroke="var(--border)" stroke-width="1.5"/><text x="230" y="256" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Нужен</text><text x="230" y="273" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">опыт</text>
 <text x="44" y="170" text-anchor="middle" font-size="12" fill="var(--red)">замкнутый</text><text x="44" y="186" text-anchor="middle" font-size="12" fill="var(--red)">круг</text>
 <path d="M340 165 L430 165" stroke="var(--green)" stroke-width="3.5" stroke-linecap="round"/><path d="M420 155 L432 165 L420 175" fill="none" stroke="var(--green)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
 <rect x="286" y="120" width="120" height="30" rx="8" fill="var(--green-soft)"/><text x="346" y="140" text-anchor="middle" font-size="12" font-weight="700" fill="var(--green)">проект компании</text>
 <text x="360" y="198" text-anchor="middle" font-size="12" fill="var(--muted)">выход из круга</text></svg>`}
VIEWS.welcome=()=>`
 <div class="lp">${lpNav()}
 <section class="lp-hero"><div class="lp-in">
  <div>
   <span class="lp-eyebrow">${ic('cap',14)}Карьерная платформа для студентов</span>
   <h1 class="lp-h1">Опыт, подтверждённый <em>делом</em></h1>
   <p class="lp-lead">Чтобы получить работу, нужен опыт. Чтобы получить опыт, нужна работа. <b>${BRAND} разрывает этот круг:</b> студенты решают реальные задачи компаний, подтверждают навыки и получают приглашения на интервью.</p>
   <div class="lp-cta"><button class="btn btn-p btn-lg" data-go="auth-student">${ic('user')}Я студент</button><button class="btn btn-s btn-lg" data-go="auth-employer">${ic('building')}Я работодатель</button><button class="btn btn-s btn-lg" data-go="auth-uni">${ic('cap')}Я из вуза</button></div>
   <p class="lp-note">Для студентов бесплатно · <button class="linkish" data-act="demoLogin">Открыть демо без регистрации →</button></p>
  </div>
  <div class="lp-vis" aria-hidden="true">
   <div class="card fl f1 col g12"><div class="row between"><span class="label">Карьерная готовность</span><span class="xs muted">Product Manager</span></div><div class="row g8" style="align-items:baseline"><span class="big-num" style="font-size:40px">78%</span><span class="delta">↑ с 67%</span></div><div class="bar o fat"><i style="width:78%"></i></div><div class="sm t2">Порог 75% пройден: открылось 5 новых стажировок</div></div>
   <div class="passport fl f2" style="padding:18px"><div class="label" style="color:rgba(255,255,255,.7)">Skill Passport</div><div class="b" style="font-size:17px;margin:4px 0 12px">Алексей Иванов</div><div class="chips">${['Product Analytics','SQL','Работа с гипотезами','Customer Development'].map(s=>`<span class="pill" style="background:rgba(255,255,255,.14);color:#fff;border-color:rgba(255,255,255,.2)">${ic('shield')}${s}</span>`).join('')}</div></div>
   <div class="card fl f3 row g12" style="flex-wrap:nowrap;align-items:flex-start">${logo('SkillUp')}<div class="grow"><div class="label" style="color:var(--accent-ink)">Приглашение на интервью</div><div class="b">SkillUp приглашает вас на позицию Product Intern</div><div class="xs muted">По итогам проекта «Исследование воронки» · оценка 4,8</div></div></div>
  </div>
 </div></section>
 <div class="lp-logos"><div class="lp-in"><span class="sm muted">Проекты и стажировки от</span>${PARTNERS.map(c=>`<span class="lg">${logo(c,'sm')}${c}</span>`).join('')}</div></div>
 <section class="lp-sec"><div class="lp-in loop-grid">
  <div><h2 class="lp-h2">Первая работа без опыта — замкнутый круг</h2><p class="lp-sub">Работодатели не верят строчкам в резюме, а студентам негде получить опыт, который засчитают. В итоге сильные студенты теряются среди сотен одинаковых откликов.</p><p class="lp-sub">${BRAND} даёт третий путь: реальная задача компании, проверка ментором и подтверждённый навык, который видит работодатель.</p></div>
  <div>${loopSvg()}</div>
 </div></section>
 <section class="lp-sec alt" id="how"><div class="lp-in">
  <h2 class="lp-h2">Как это работает</h2><p class="lp-sub">Четыре шага от учёбы до приглашения на интервью</p>
  <div class="steps4">${[['target','Цель и готовность','Выберите профессию — платформа сравнит ваши навыки с требованиями 140+ стажировок и покажет готовность.'],['folder','Проект компании','Решите реальную задачу VK, Ozon, Т-Банка или стартапа на настоящих данных. Можно одному или в команде.'],['shield','Подтверждённые навыки','Ментор проверяет решение по критериям компании. Навыки попадают в Skill Passport с основанием.'],['mail','Интервью и работа','Компании видят результат и приглашают на интервью. Готовность растёт — открываются новые стажировки.']].map((s,i)=>`<div class="stepc"><span class="no">Шаг ${i+1}</span><span class="si">${ic(s[0],22)}</span><h3>${s[1]}</h3><p class="sm t2">${s[2]}</p></div>`).join('')}</div>
  <div class="tbl-wrap"><table class="cmp"><thead><tr><th></th><th>Обычный поиск стажировки</th><th>${BRAND}</th></tr></thead><tbody>${[['Как оценивают','По резюме и учебному заведению','По решённым задачам и подтверждённым навыкам'],['Опыт до работы','Учебные проекты, которые никто не проверял','Проекты компаний с отзывом и оценкой'],['Подбор вакансий','По ключевым словам','По навыкам, проектам, цели и тестам'],['Путь к интервью','Сотни откликов без ответа','Приглашение по итогам проекта']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>
 </div></section>
 <section class="lp-sec" id="aud"><div class="lp-in">
  <h2 class="lp-h2">Одна платформа — три стороны</h2>
  <div class="aud" id="unis">${[['user','var(--accent-soft)','var(--accent-ink)','Студентам','Бесплатно',['Карьерный путь и готовность к профессии','Проекты компаний и подтверждённые навыки','Стажировки, которые подбираются по навыкам'],'auth-student','Создать профиль'],['building','var(--green-soft)','var(--green)','Компаниям','Тарифы от 0 ₽',['Проекты вместо тестовых заданий','Поиск по подтверждённым навыкам','Найм стажёров на 30–40% дешевле'],'auth-employer','Разместить проект'],['cap','var(--orange-soft)','var(--orange)','Вузам','Партнёрство',['Аналитика трудоустройства студентов','Какие навыки нужно усилить в программах','Проекты компаний прямо в учебных курсах'],'auth-uni','Подключить вуз']].map(a=>`<section class="card"><span class="ai2" style="background:${a[1]};color:${a[2]}">${ic(a[0],24)}</span><div class="row between"><h3 style="font-size:19px">${a[3]}</h3><span class="pill">${a[4]}</span></div><ul class="ul sm">${a[5].map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul><button class="btn btn-s" data-go="${a[6]}" style="margin-top:auto">${a[7]}${ic('arR')}</button></section>`).join('')}</div>
 </div></section>
 <section class="lp-sec alt"><div class="lp-in">
  <h2 class="lp-h2">Цифры платформы</h2><p class="lp-sub">Демо-показатели для презентации модели</p>
  <div class="lp-met">${[['18 400','студентов в месяц'],['146','компаний размещают проекты'],['9 870','навыков подтверждено'],['22%','решений приводят к интервью']].map(m=>`<div class="m"><b>${m[0]}</b><span class="sm muted">${m[1]}</span></div>`).join('')}</div>
  <button class="btn btn-g" data-go="metrics" style="margin-top:16px">Все метрики${ic('arR')}</button>
 </div></section>
 <section class="lp-sec"><div class="lp-in"><div class="lp-final"><div><h2 class="lp-h2">Первая работа начинается с первого дела</h2><p style="color:rgba(255,255,255,.8);margin-top:10px;max-width:520px">Создайте профиль за минуту — платформа покажет, каких навыков не хватает до стажировки мечты.</p></div><div class="row g8"><button class="btn btn-w btn-lg" data-go="auth-student">Я студент</button><button class="btn btn-s btn-lg" data-go="auth-employer">Я работодатель</button></div></div></div></section>
 <footer class="lp-foot"><div class="lp-in"><span>© 2026 ${BRAND} · ${DOMAIN}</span><span>Демо-версия. Компании и данные приведены как пример.</span></div></footer>
 </div>`;

/* ================= auth ================= */
const AUTH={student:{t:'Создайте профиль студента',pitch:'Покажите, что вы умеете, делом',pts:[['1','Выберите профессию и узнайте свою готовность'],['2','Решите проект компании и подтвердите навыки'],['3','Получайте приглашения на интервью']]},
 employer:{t:'Кабинет работодателя',pitch:'Нанимайте стажёров, которые уже показали себя',pts:[['1','Разместите реальную задачу команды'],['2','Получите рейтинг решений с проверкой ментора'],['3','Пригласите лучших на интервью в один клик']]},
 uni:{t:'Кабинет вуза',pitch:'Видите, как студенты становятся специалистами',pts:[['1','Статистика навыков и трудоустройства'],['2','Пробелы учебных программ по данным рынка'],['3','Проекты компаний прямо в курсах']]}};
VIEWS.auth=(role)=>{role=AUTH[role]?role:'student';const a=AUTH[role];const login=UI.login;
 const fields={student:[['au-name','Имя и фамилия','Алексей Иванов'],['au-email','Почта','a.ivanov@edu.hse.ru'],['au-uni','Вуз и программа','НИУ ВШЭ · Бизнес-информатика, 3 курс']],
  employer:[['au-name','Имя и фамилия',emp().person],['au-co','Компания',emp().company],['au-email','Рабочая почта',emp().id==='tb'?'d.orlov@tbank.example':'m.kovaleva@skillup.example'],['au-inn','ИНН компании','7710140679']],
  uni:[['au-name','Имя и фамилия',UNI.person],['au-uni','Вуз и подразделение','НИУ ВШЭ · Центр карьеры'],['au-email','Рабочая почта','e.smirnova@hse.example']]}[role];
 return `<div class="auth">
  <div class="auth-l"><div class="row g8" style="font-weight:800;font-size:19px;cursor:pointer" data-go="welcome">${LOGO_W}${BRAND}</div><div class="col g12"><span class="label" style="color:rgba(255,255,255,.7)">${SLOGAN}</span><h2>${a.pitch}</h2></div><div class="col g16 pts">${a.pts.map(p=>`<div class="pt"><i>${p[0]}</i><span>${p[1]}</span></div>`).join('')}</div><div class="sm pts" style="color:rgba(255,255,255,.6);margin-top:auto">Данные хранятся на серверах в России в соответствии с 152-ФЗ</div></div>
  <div class="auth-r"><form class="auth-card" id="authForm" data-role="${role}">
   <button type="button" class="crumb" data-go="welcome" style="margin:0">${ic('arL',16)}На главную</button>
   <div class="seg" style="align-self:flex-start">${[['student','Студент'],['employer','Компания'],['uni','Вуз']].map(([k,l])=>`<button type="button" class="${k===role?'on':''}" data-go="auth-${k}">${l}</button>`).join('')}</div>
   <h1>${login?'Вход':a.t}</h1>
   ${(login?fields.filter(f=>f[0]==='au-email'):fields).map(f=>`<label class="field"><span>${f[1]}</span><input class="inp" id="${f[0]}" value="${esc(f[2])}" required></label>`).join('')}
   <label class="field"><span>Пароль</span><input class="inp" id="au-pass" type="password" value="demo-password" required></label>
   ${login?'':`<label class="check sm"><input type="checkbox" id="au-agree" checked>Согласен на обработку персональных данных и с условиями сервиса</label>`}
   <p class="sm" id="au-err" style="color:var(--red)" hidden>Нужно согласие на обработку персональных данных.</p>
   <button class="btn btn-p btn-lg btn-block" type="submit" id="au-submit">${login?'Войти':'Создать аккаунт'}</button>
   <p class="sm muted" style="text-align:center">${login?'Нет аккаунта?':'Уже есть аккаунт?'} <button type="button" class="linkish" data-act="toggleLogin">${login?'Зарегистрироваться':'Войти'}</button></p>
   <p class="xs muted" style="text-align:center">Демо-версия: аккаунт создаётся в этом браузере, данные никуда не отправляются.</p>
  </form></div></div>`};
