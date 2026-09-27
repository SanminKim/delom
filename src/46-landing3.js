/* ================= landing v3 — best-practice product landing ================= */
const L3_CMP={resume:{m:48,rows:[['Ответственный, коммуникабельный, быстро обучаюсь','n'],['Знаю SQL, Python, Excel','n'],['Участвовал в кейс-чемпионате','n'],['Интересуюсь продуктами и аналитикой','n']]},
 delo:{m:91,rows:[['SQL — подтверждён проектом SkillUp, оценка 4,8','y'],['Product Analytics — проверено ментором из Avito','y'],['Нашёл 3 проблемных этапа воронки на данных 12 400 пользователей','y'],['2 место в кейс-чемпионате ВШЭ, жюри Ozon и Т-Банка','y']]}};
const L3_AUD={student:{t:'Опыт, который засчитают',d:'Бесплатно. Цель, проекты компаний, подтверждённые навыки, резюме с AI-разбором и тренажёр интервью.',b:['Карьерный путь и готовность к профессии','Проекты VK, Ozon, Т-Банка и стартапов','Стажировки, которые подбираются по навыкам'],c:['auth-student','Создать профиль']},
 company:{t:'Нанимайте тех, кто уже показал себя',d:'Разместите реальную задачу команды и посмотрите, как кандидаты работают, до интервью.',b:['Проект вместо тестового задания','Поиск по подтверждённым навыкам','Найм стажёров на 30–40% дешевле'],c:['auth-employer','Разместить проект']},
 uni:{t:'Видно, как студенты становятся специалистами',d:'Аналитика навыков и трудоустройства и данные рынка для учебных программ.',b:['Статистика подтверждённых навыков','Пробелы программ по требованиям компаний','Проекты компаний прямо в курсах'],c:['auth-uni','Подключить вуз']}};
const L3_STEPS=[['Выберите цель','Платформа сравнит ваши навыки с требованиями 140+ стажировок и покажет готовность и пробелы.'],['Решите задачу компании','Реальный бриф и данные от VK, Ozon, Т-Банка или стартапа. Одному или в команде.'],['Получите подтверждение','Ментор проверяет решение по критериям компании. Навык попадает в Skill Passport с основанием.'],['Идите на интервью','Компании видят лучшие решения и приглашают сами. Готовность растёт, открываются новые стажировки.']];
const L3_FAQ=[['Это бесплатно для студентов?','Да. Студенты пользуются платформой бесплатно: цель, проекты, подтверждение навыков, резюме и тренажёр интервью. Платят компании — за доступ к кандидатам и за нанятых стажёров.'],
 ['Чем это отличается от hh.ru?','На сайтах вакансий вас оценивают по резюме. Здесь — по решённым задачам: у каждого навыка есть основание (проект компании, тест или оценка ментора), и стажировки подбираются по ним.'],
 ['Как подтверждается навык?','Три способа: выполнить проект компании (сильнее всего), пройти тест с зачётом от 4 из 5 или получить оценку ментора-практика. Основание видно работодателю в Skill Passport.'],
 ['Нужен ли опыт, чтобы начать?','Нет. Платформа сделана для студентов без опыта работы: начните с симулятора профессии или проекта лёгкого уровня.'],
 ['Что получает компания?','Рейтинг решений по своей задаче, подтверждённые навыки кандидатов и приглашение лучших на интервью в один клик. Тариф «Старт» бесплатный.'],
 ['Как подключить вуз?','Центр карьеры получает кабинет со статистикой студентов, пробелами программ и возможностью встроить проекты компаний в курсы. Оставьте заявку — подключим за неделю.']];
function lpNav3(){return `<header class="n3" id="n3"><div class="lp-in n3-in"><div class="brand" style="padding:0" data-go="welcome">${LOGO}<span>${BRAND}</span></div>
 <nav class="n3-links">${[['how','Как это работает'],['features','Возможности'],['aud','Компаниям и вузам'],['faq','Вопросы']].map(([k,l])=>`<button data-act="scrollTo" data-id="${k}">${l}</button>`).join('')}</nav>
 <div class="row g8" style="margin-left:auto">${S.authed?`<button class="btn btn-p btn-sm" data-go="${HOME[S.lastRole]||'dashboard'}">Открыть кабинет</button>`:`<button class="btn btn-g btn-sm" data-go="auth-student" data-login="1">Войти</button><button class="btn btn-p btn-sm" data-go="auth-student">Начать бесплатно</button>`}</div></div><div class="n3-prog" id="n3prog"></div></header>`}
function heroCards(){return `<div class="h3-vis" id="h3vis" aria-hidden="true">
 <div class="hc" style="--dp:.5;--r:-3deg;--x:0;--y:0;--z:1"><div class="hc-f" style="--fd:6s;--fo:0s"><div class="hc-c card c-ready" style="--in:.55s">
  <div class="row between"><span class="label">Карьерная готовность</span><span class="xs muted">Product Manager</span></div>
  <div class="row g8" style="align-items:baseline;margin-top:8px"><span class="big-num" id="h3R">67%</span><span class="delta" id="h3D">↑ с 67%</span></div>
  <div class="bar o fat" style="margin:12px 0 10px"><i id="h3B" style="width:67%"></i></div><div class="sm t2">Порог 75% пройден: открылось 5 новых стажировок</div></div></div></div>
 <div class="hc" style="--dp:1;--r:2deg;--z:3"><div class="hc-f" style="--fd:7s;--fo:-2s"><div class="hc-c c-pass" style="--in:.75s"><div class="label" style="color:rgba(255,255,255,.72)">Skill Passport</div><div class="b" style="font-size:19px;margin:4px 0 14px">Алексей Иванов</div>
  <div class="chips">${['Product Analytics','SQL','Работа с гипотезами','Customer Development'].map((s,i)=>`<span class="pp-chip" style="--cd:${1.25+i*.18}s">${ic('shield')}${s}</span>`).join('')}</div></div></div></div>
 <div class="hc" style="--dp:.75;--r:-1deg;--z:4"><div class="hc-f" style="--fd:6.5s;--fo:-4s"><div class="hc-c card c-inv" style="--in:1.05s"><div class="row g12" style="flex-wrap:nowrap;align-items:flex-start"><span class="inv-ico">${logo('SkillUp')}<i class="ping"></i></span><div class="grow"><div class="label" style="color:var(--accent-ink)">Приглашение на интервью</div><div class="b">SkillUp приглашает вас на позицию Product Intern</div><div class="xs muted" style="margin-top:2px">По итогам проекта «Исследование воронки» · оценка 4,8</div></div></div></div></div></div>
 <span class="flt f1" style="--dp:1.3"><span class="flt-i">${ic('shield',14)}+4 навыка подтверждено</span></span>
 <span class="flt f2" style="--dp:1.6"><span class="flt-i">${ic('star',14)}Оценка компании 4,8</span></span>
 <span class="flt f3" style="--dp:1.1"><span class="flt-i">${ic('target',14)}Совпадение 91%</span></span></div>`}
function howScreens(){return [
 `<div class="scr"><div class="scr-h">Кем вы хотите работать?</div><div class="col g8">${[['Product Manager',67,1],['Data Analyst',63,0],['Business Analyst',61,0]].map(g=>`<div class="scr-goal ${g[2]?'on':''}"><span class="b sm">${g[0]}</span><div class="bar thin" style="width:90px"><i style="width:${g[1]}%"></i></div><b class="sm">${g[1]}%</b></div>`).join('')}</div><div class="row g12" style="margin-top:14px;flex-wrap:nowrap">${ring(67,68,'big')}<div><div class="b sm">Не хватает для цели</div><div class="chips" style="margin-top:6px"><span class="pill pr">SQL · 70%</span><span class="pill pr">Product Analytics</span></div></div></div></div>`,
 `<div class="scr"><div class="row g12" style="flex-wrap:nowrap">${logo('SkillUp')}<div><div class="b sm">Исследование пользовательской воронки</div><div class="xs muted">SkillUp · данные 12 400 пользователей</div></div></div><div class="col g6" style="margin-top:14px">${['Проанализировать воронку','Найти проблемные этапы','Предложить 3+ гипотезы','Собрать презентацию'].map((t,i)=>`<div class="scr-task ${i<3?'ok':''}" style="--td:${i*.15}s"><span class="mk ${i<3?'ok':''}">${i<3?ic('check'):''}</span><span class="sm">${t}</span></div>`).join('')}</div><button class="btn btn-p btn-sm" style="margin-top:14px" tabindex="-1">${ic('send')}Отправить решение</button></div>`,
 `<div class="scr"><div class="row g12" style="flex-wrap:nowrap">${av('ОС','#C2410C',36)}<div><div class="b sm">Ольга Сафина · ментор</div><div class="xs muted">Senior PM в Avito</div></div></div><div class="col" style="margin-top:10px">${['Корректность расчётов','Обоснованность гипотез','Ясность презентации'].map((c,i)=>`<div class="rub"><span class="sm">${c}</span><span class="stars">${[1,2,3,4,5].map(n=>`<button class="${n<=(i===1?4:5)?'on':''}" tabindex="-1">${ic('star')}</button>`).join('')}</span></div>`).join('')}</div><div class="scr-toast">${ic('shield',16)}SQL, Product Analytics и ещё 2 навыка подтверждены</div></div>`,
 `<div class="scr"><div class="row g12" style="flex-wrap:nowrap">${logo('SkillUp','sm')}<div><div class="b sm">SkillUp</div><div class="xs muted">Марина Ковалёва · Head of Product</div></div></div><div class="bub them" style="margin-top:12px;max-width:100%">Алексей, нам понравилась ваша гипотеза про страницу выбора курса. Приглашаем на интервью.</div><div class="inv-card" style="margin-top:10px;max-width:none"><div class="b sm">Product Intern · 45 минут</div><div class="row g6">${SLOTS.map((s,i)=>`<span class="slot ${i===1?'on':''}" style="padding:6px 10px;font-size:12px">${s.split(' · ')[0]}</span>`).join('')}</div></div></div>`]}
function bento(){return `<div class="bento">
 <article class="bt bt-a spot"><div class="bt-txt"><h3>Skill Passport</h3><p>Каждый навык — с основанием: проект компании, тест или оценка ментора. Работодатель видит, чем он доказан.</p></div><div class="bt-src"><span class="xs muted">Кто подтверждает навыки</span><div class="row g8">${[["SkillUp","Компания"],["Avito","Ментор"],[ACAD,"Тест"]].map(x=>`<span class="bt-srcp">${logo(x[0],"sm")}<span><b class="sm">${x[0]}</b><span class="xs muted">${x[1]}</span></span></span>`).join("")}</div></div>
  <div class="bt-pass">${[['SQL','Проект SkillUp · 4,8'],['Product Analytics','Ментор из Avito'],['Customer Development','Кейс + отзыв ментора'],['Презентация выводов','Кейс-чемпионат · 2 место'],['A/B-тестирование','Тест · 5 из 5']].map((s,i)=>`<div class="bp-row" style="--i:${i}"><span class="mk ok">${ic('check')}</span><b>${s[0]}</b><span class="xs">${s[1]}</span></div>`).join('')}</div></article>
 <article class="bt bt-b spot"><div class="bt-txt"><h3>AI-разбор резюме</h3><p>Оценка из 100 и советы «было → стало» под конкретную вакансию.</p></div><div class="bt-score"><div class="ring big" style="--p:86;--c:var(--green);width:104px;height:104px" id="btRing"><span style="font-size:25px" id="btScore">86%</span></div><div class="col g6"><span class="pill red" style="text-decoration:line-through">Занимался организацией</span><span class="pill ok">Организовал чемпионат: 120 участников</span></div></div></article>
 <article class="bt bt-c spot"><div class="bt-txt"><h3>Тренажёр интервью</h3><p>Вопросы под вакансию и разбор каждого ответа.</p></div><div class="bt-chat"><div class="bub them">Конверсия упала на 10%. Ваши действия?</div><div class="bub me">Сначала проверю данные, затем разложу воронку по шагам…</div><div class="bub them bt-typing"><i></i><i></i><i></i></div></div></article>
 <article class="bt bt-d spot"><div class="bt-txt"><h3>Стажировки по навыкам</h3><p>Совпадение считается по подтверждённым навыкам, а не по ключевым словам.</p></div><div class="col g8">${[['VK Tech','Product Manager Intern',95],['Ozon','Стажёр Product Manager',88],['Т-Банк','Junior Product Analyst',86]].map(j=>`<div class="bt-job">${logo(j[0],'sm')}<div class="grow"><div class="b sm">${j[1]}</div><div class="bar thin gr"><i style="width:${j[2]}%"></i></div></div><b class="sm">${j[2]}%</b></div>`).join('')}</div></article>
 <article class="bt bt-e spot"><div class="bt-txt"><h3>Трекер откликов</h3><p>Отклики, интервью и офферы на одной доске — с напоминаниями о фоллоу-апе.</p></div><div class="bt-kb">${['Отправлен','Интервью','Оффер'].map((c,i)=>`<div class="bt-col"><span class="xs muted">${c}</span>${i===0?'<i class="bt-card"></i><i class="bt-card move"></i>':i===1?'<i class="bt-card"></i>':''}</div>`).join('')}</div></article>
</div>
<div class="bt-more">${['Командные проекты','Менторы-практики','Чат с работодателем','Резюме на английском','Импорт с hh.ru','Банк историй STAR','Сравнение офферов','Геймификация и XP'].map(t=>`<span>${ic('check',14)}${t}</span>`).join('')}</div>`}
function stmtWords(){const t='Чтобы получить работу, нужен опыт. Чтобы получить опыт, нужна работа. ';const b=`${BRAND} разрывает этот круг: реальные задачи компаний превращаются в подтверждённые навыки, а навыки — в приглашения на интервью.`;
 return t.split(' ').filter(Boolean).map(w=>`<span class="sw">${esc(w)}</span>`).join(' ')+' '+b.split(' ').map(w=>`<span class="sw acc">${esc(w)}</span>`).join(' ')}
VIEWS.welcome=()=>{const cm=UI.lpCmp||'delo',au=UI.lpAud||'student',A=L3_AUD[au],C=L3_CMP[cm];
 return `<div class="lp lp3">${lpNav3()}
 <section class="h3" id="h3">
  <div class="h3-bg" aria-hidden="true"><i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i><div class="h3-grid"></div></div>
  <div class="lp-in h3-in">
   <div class="h3-copy">
    <button class="annc" data-go="auth-student"><span class="annc-tag">Новое</span><span>AI-разбор резюме и тренажёр интервью</span>${ic('arR',14)}</button>
    <h1 class="h3-title"><span class="w" style="--d:.1s">Опыт,</span> <span class="w" style="--d:.22s">подтверждённый</span> <span class="w hl" style="--d:.34s">делом<i class="ulb" aria-hidden="true"></i></span></h1>
    <p class="h3-lead">Чтобы получить работу, нужен опыт. Чтобы получить опыт, нужна работа. <b>${BRAND} разрывает этот круг:</b> студенты решают реальные задачи компаний, подтверждают навыки и получают приглашения на интервью.</p>
    <div class="h3-cta"><button class="btn btn-p btn-lg glow" data-go="auth-student">${ic('user')}Я студент</button><button class="btn btn-s btn-lg" data-go="auth-employer">${ic('building')}Я работодатель</button><button class="btn btn-s btn-lg" data-go="auth-uni">${ic('cap')}Я из вуза</button></div>
    <p class="h3-note"><span>${ic('check',14)}Для студентов бесплатно</span><span>${ic('check',14)}Без резюме на старте</span><button class="linkish" data-act="demoLogin">Открыть демо без регистрации →</button></p>
   </div>
   ${heroCards()}
  </div>
 </section>
 <section class="mq" aria-label="Компании-партнёры"><p class="sm muted">Проекты и стажировки от компаний</p><div class="mq-mask"><div class="mq-track">${[...PARTNERS,...PARTNERS,...PARTNERS,...PARTNERS].map((c,i)=>`<span class="lg" ${i>=PARTNERS.length?'aria-hidden="true"':''}>${logo(c,'sm')}${c}</span>`).join('')}</div></div></section>
 <section class="stmt" id="stmt"><div class="lp-in"><p class="stmt-t">${stmtWords()}</p></div></section>
 <section class="how3" id="how"><div class="lp-in">
  <div class="sh rv"><span class="kicker">Как это работает</span><h2 class="h2x">От цели до приглашения — четыре шага</h2><p class="lp-sub">Весь путь проходит внутри платформы: от выбора профессии до чата с компанией.</p></div>
  <div class="how3-grid">
   <ol class="how3-steps">${L3_STEPS.map((s,i)=>`<li class="h3s ${i===0?'on':''}" data-i="${i}"><button data-act="howGo" data-id="${i}"><span class="h3s-n">${i+1}</span><span class="h3s-t"><b>${s[0]}</b><span>${s[1]}</span></span></button></li>`).join('')}</ol>
   <div class="how3-stage"><div class="device"><div class="dev-bar"><i></i><i></i><i></i><span>${DOMAIN}</span></div><div class="dev-body">${howScreens().map((h,i)=>`<div class="dev-scr ${i===0?'on':''}" data-i="${i}">${h}</div>`).join('')}</div></div><div class="how3-dots">${L3_STEPS.map((_,i)=>`<i class="${i===0?'on':''}"></i>`).join('')}</div></div>
  </div></div></section>
 <section class="feat3" id="features"><div class="lp-in"><div class="sh rv"><span class="kicker">Возможности</span><h2 class="h2x">Всё для первой работы — в одном месте</h2><p class="lp-sub">Не нужно собирать путь из десяти сервисов: навыки, проекты, резюме, интервью и отклики связаны между собой.</p></div>${bento()}</div></section>
 <section class="cmp3"><div class="lp-in cmp3-in">
  <div class="rv"><span class="kicker">Разница</span><h2 class="h2x">Как вас видит работодатель</h2><p class="lp-sub">Один и тот же студент. Разница в том, чем подкреплены слова.</p>
   <div class="seg seg-lg" role="tablist" aria-label="Режим сравнения">${[['resume','По резюме'],['delo','По делу']].map(([k,l])=>`<button role="tab" aria-selected="${cm===k}" class="${cm===k?'on':''}" data-act="lpCmp3" data-id="${k}">${l}</button>`).join('')}</div></div>
  <div class="cand3 ${cm}" id="cand3"><div class="row g12" style="flex-wrap:nowrap">${av('АИ','#3B47E0',48)}<div class="grow"><div class="b">Алексей Иванов</div><div class="sm muted">НИУ ВШЭ · цель Product Manager</div></div><div class="c3-m"><span id="c3m">${C.m}</span>%<div class="xs muted">совпадение</div></div></div>
   <ul class="c3-rows">${C.rows.map((r,i)=>`<li class="${r[1]}" style="--i:${i}">${r[1]==='y'?ic('shield',16):ic('minus',16)}<span>${r[0]}</span></li>`).join('')}</ul>
   <div class="c3-foot">${cm==='delo'?`${ic('check',14)}Каждый навык можно проверить в Skill Passport`:'На такое резюме рекрутер тратит около 6 секунд'}</div></div>
 </div></section>
 <section class="aud3" id="aud"><div class="lp-in">
  <div class="sh rv"><span class="kicker">Для кого</span><h2 class="h2x">Студентам, компаниям и вузам</h2></div>
  <div class="aud-tabs" role="tablist">${[['student','Студентам'],['company','Компаниям'],['uni','Вузам']].map(([k,l])=>`<button role="tab" aria-selected="${au===k}" class="${au===k?'on':''}" data-act="lpAud3" data-id="${k}">${l}</button>`).join('')}<span class="aud-ind" id="audInd"></span></div>
  <div class="aud3-panel" id="aud3p">${aud3Panel(au)}</div>
 </div></section>
 <section class="met3"><div class="lp-in"><div class="met3-grid">${[[18400,'студентов в месяц',''],[146,'компаний размещают проекты',''],[9870,'навыков подтверждено',''],[22,'решений приводят к интервью','%']].map(m=>`<div class="m3 rv"><b data-count="${m[0]}" data-suf="${m[2]}">${fmt(m[0])}${m[2]}</b><span>${m[1]}</span></div>`).join('')}</div><p class="xs muted" style="margin-top:14px">Демо-показатели для презентации модели · <button class="linkish" data-go="metrics">Все метрики</button></p></div></section>
 <section class="faq3" id="faq"><div class="lp-in faq3-in"><div class="sh rv"><span class="kicker">Вопросы</span><h2 class="h2x">Частые вопросы</h2><p class="lp-sub">Не нашли ответ? Спросите AI-помощника после входа — он знает про платформу всё.</p></div>
  <div class="faq3-list">${L3_FAQ.map((f,i)=>`<div class="fq ${i===0?'open':''}"><button class="fq-q" data-act="faq" data-id="${i}" aria-expanded="${i===0}"><span>${f[0]}</span><i class="fq-ic"></i></button><div class="fq-a"><div><p>${f[1]}</p></div></div></div>`).join('')}</div></div></section>
 <section class="fin3"><div class="lp-in"><div class="fin3-card"><div class="fin3-glow" aria-hidden="true"></div><h2>Первая работа начинается с первого дела</h2><p>Создайте профиль за минуту — платформа покажет, каких навыков не хватает до стажировки.</p><div class="h3-cta" style="justify-content:center"><button class="btn btn-w btn-lg" data-go="auth-student">Начать бесплатно</button><button class="btn btn-o btn-lg" data-act="demoLogin">Открыть демо</button></div></div></div></section>
 <footer class="ft3"><div class="lp-in"><div class="ft3-grid"><div class="col g12"><div class="brand" style="padding:0">${LOGO}<span>${BRAND}</span></div><p class="sm muted" style="max-width:280px">${SLOGAN}. Карьерная платформа для студентов и начинающих специалистов.</p></div>
  ${[['Студентам',[['Создать профиль','go:auth-student'],['Попробовать профессию','act:demoLogin'],['Демо-кабинет','act:demoLogin']]],['Компаниям',[['Разместить проект','go:auth-employer'],['Тарифы','go:auth-employer'],['Метрики платформы','go:metrics']]],['Вузам',[['Подключить вуз','go:auth-uni'],['Кабинет центра карьеры','go:auth-uni']]]].map(([h,ls])=>`<div class="col g8"><b class="sm">${h}</b>${ls.map(l=>`<button class="ft3-l" ${btnAttr(l[1])}>${l[0]}</button>`).join('')}</div>`).join('')}</div>
  <div class="ft3-bot"><span>© 2026 ${BRAND} · ${DOMAIN}</span><span>Демо-версия. Компании и данные приведены как пример.</span></div></div></footer>
 </div>`};
function aud3Panel(k){const A=L3_AUD[k];return `<div class="aud3-txt"><h3>${A.t}</h3><p class="lp-sub">${A.d}</p><ul class="ul">${A.b.map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul><button class="btn btn-p" data-go="${A.c[0]}" style="margin-top:18px">${A.c[1]}</button></div><div class="aud3-vis">${aud3Vis(k)}</div>`}
function aud3Vis(k){if(k==='company')return `<div class="card col g12"><div class="row between"><b>Лучшие решения проекта</b><span class="xs muted">22 решения</span></div>${[['ЕВ','#C2410C','Екатерина Волкова','4,9',88],['АИ','#3B47E0','Алексей Иванов','4,8',91],['ТА','#0E7490','Тимур Ахметов','4,6',85]].map(r=>`<div class="row g12" style="flex-wrap:nowrap;padding:8px 0;border-top:1px solid var(--border)">${av(r[0],r[1],34)}<span class="grow b sm">${r[2]}</span><span class="pill">${ic('star')}${r[3]}</span><b class="sm">${r[4]}%</b></div>`).join('')}</div>`;
 if(k==='uni')return `<div class="card">${barChart(['Май','Июн','Июл','Авг','Сен'],[350,330,380,420,455],{h:180,hl:4})}<div class="xs muted">Подтверждённые навыки студентов НИУ ВШЭ по месяцам</div></div>`;
 return `<div class="card col g12"><div class="row between"><b class="sm">Готовность · Product Manager</b><b>78%</b></div><div class="bar o"><i style="width:78%"></i></div><div class="chips">${['SQL','Product Analytics','Гипотезы','CJM'].map((s,i)=>`<span class="pill ${i<3?'ok':''}">${i<3?ic('check'):''}${s}</span>`).join('')}</div><div class="row g12" style="flex-wrap:nowrap;padding-top:6px;border-top:1px solid var(--border)">${logo('VK Tech','sm')}<span class="grow sm"><b>Product Manager Intern</b> · совпадение 95%</span></div></div>`}

/* ----- behaviour ----- */
const RM3=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let L3={t:[],fns:[],obs:null};
function lpCleanup(){L3.t.forEach(clearTimeout);L3.fns.forEach(([ev,f,el])=>(el||window).removeEventListener(ev,f));if(L3.obs)L3.obs.disconnect();L3={t:[],fns:[],obs:null}}
const on3=(ev,f,el,opt)=>{(el||window).addEventListener(ev,f,opt||{passive:true});L3.fns.push([ev,f,el])};
function countTo(el,from,to,ms,fmtf){if(RM3()){el.textContent=fmtf(to);return}const t0=performance.now();const tick=now=>{const k=Math.min(1,(now-t0)/ms);el.textContent=fmtf(Math.round(from+(to-from)*(1-Math.pow(1-k,3))));if(k<1&&document.body.contains(el))requestAnimationFrame(tick)};requestAnimationFrame(tick)}
function audInd3(){const on=$('.aud-tabs button.on'),ind=$('#audInd');if(on&&ind){ind.style.width=on.offsetWidth+'px';ind.style.transform=`translateX(${on.offsetLeft-5}px)`}}
function landingInit(){lpCleanup();const rm=RM3();audInd3();
 // hero counter
 const R=$('#h3R'),B=$('#h3B'),D=$('#h3D');
 if(R){if(rm){R.textContent='78%';B.style.width='78%';D&&D.classList.add('on')}else{L3.t.push(setTimeout(()=>{countTo(R,67,78,1100,v=>v+'%');B.style.width='78%';D&&D.classList.add('on')},1500))}}
 // mouse parallax
 const vis=$('#h3vis'),hero=$('#h3');
 if(vis&&hero&&!rm&&matchMedia('(pointer:fine)').matches){let raf=0,mx=0,my=0;on3('pointermove',e=>{const r=hero.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5;if(!raf)raf=requestAnimationFrame(()=>{vis.style.setProperty('--mx',mx.toFixed(3));vis.style.setProperty('--my',my.toFixed(3));raf=0})},hero);on3('pointerleave',()=>{vis.style.setProperty('--mx',0);vis.style.setProperty('--my',0)},hero)}
 // scroll-driven bits
 const nav=$('#n3'),prog=$('#n3prog'),words=$$('.sw'),stmt=$('#stmt'),steps=$$('.h3s'),scrs=$$('.dev-scr'),dots=$$('.how3-dots i');
 let cur=0;const setStep=i=>{if(i===cur)return;cur=i;steps.forEach((s,k)=>s.classList.toggle('on',k===i));scrs.forEach((s,k)=>s.classList.toggle('on',k===i));dots.forEach((s,k)=>s.classList.toggle('on',k===i))};
 const onScroll=()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;if(prog)prog.style.transform=`scaleX(${h>0?y/h:0})`;if(nav)nav.classList.toggle('scrolled',y>8);
  if(stmt&&words.length){const r=stmt.getBoundingClientRect();const p=Math.max(0,Math.min(1,(innerHeight*.85-r.top)/(r.height+innerHeight*.35)));const n=Math.round(p*words.length*1.15);words.forEach((w,i)=>w.classList.toggle('on',i<n))}
  if(steps.length&&innerWidth>960){let a=0;steps.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.5)a=i});setStep(a)}};
 on3('scroll',onScroll);on3('resize',()=>{onScroll();audInd3()});onScroll();
 L3.setStep=setStep;
 // spotlight
 on3('pointermove',e=>{const c=e.target.closest&&e.target.closest('.spot');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--sx',(e.clientX-r.left)+'px');c.style.setProperty('--sy',(e.clientY-r.top)+'px')},document);
 // in-view enhancements
 if('IntersectionObserver' in window){L3.obs=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;
   if(el.dataset.count){countTo(el,0,+el.dataset.count,1400,v=>fmt(v)+(el.dataset.suf||''))}
   if(el.classList.contains('bt'))el.classList.add('in');
   if(el.id==='btRing'&&!rm){el.style.setProperty('--p',38);el.style.setProperty('--c','var(--orange)');const s=$('#btScore');setTimeout(()=>{el.style.transition='--p 1.2s';countTo(s,38,86,1300,v=>v+'%');let p=38;const t0=performance.now();const tk=now=>{const k=Math.min(1,(now-t0)/1300);p=Math.round(38+48*(1-Math.pow(1-k,3)));el.style.setProperty('--p',p);el.style.setProperty('--c',p>=70?'var(--green)':'var(--orange)');if(k<1)requestAnimationFrame(tk)};requestAnimationFrame(tk)},250)}
   L3.obs.unobserve(el)}),{threshold:.45});$$('[data-count],.bt,#btRing').forEach(el=>L3.obs.observe(el))}
}
Object.assign(A,{
 howGo(e){const i=+e.dataset.id;if(innerWidth<=960){L3.setStep&&L3.setStep(i);return}const s=$(`.h3s[data-i="${i}"]`);if(s)window.scrollTo({top:s.getBoundingClientRect().top+scrollY-innerHeight*.35,behavior:RM3()?'auto':'smooth'})},
 faq(e){const it=e.closest('.fq');const open=!it.classList.contains('open');it.classList.toggle('open',open);e.setAttribute('aria-expanded',open)},
 lpCmp3(e){UI.lpCmp=e.dataset.id;const C=L3_CMP[UI.lpCmp],box=$('#cand3');if(!box)return render();
  $$('.cmp3 .seg-lg button').forEach(b=>{const o=b.dataset.id===UI.lpCmp;b.classList.toggle('on',o);b.setAttribute('aria-selected',o)});
  const m=$('#c3m'),from=+m.textContent;box.className='cand3 '+UI.lpCmp;
  $('.c3-rows',box).innerHTML=C.rows.map((r,i)=>`<li class="${r[1]}" style="--i:${i}">${r[1]==='y'?ic('shield',16):ic('minus',16)}<span>${r[0]}</span></li>`).join('');
  $('.c3-foot',box).innerHTML=UI.lpCmp==='delo'?`${ic('check',14)}Каждый навык можно проверить в Skill Passport`:'На такое резюме рекрутер тратит около 6 секунд';countTo(m,from,C.m,700,v=>v)},
 lpAud3(e){UI.lpAud=e.dataset.id;$$('.aud-tabs button').forEach(b=>{const o=b.dataset.id===UI.lpAud;b.classList.toggle('on',o);b.setAttribute('aria-selected',o)});audInd3();
  const p=$('#aud3p');if(!p)return render();p.classList.add('swap');setTimeout(()=>{p.innerHTML=aud3Panel(UI.lpAud);animateBars();p.classList.remove('swap')},RM3()?0:180)},
});
