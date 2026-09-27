/* ================= resume: model ================= */
const CV_SEED=()=>({name:'Алексей Иванов',title:'Стажёр Product Manager',city:'Москва',email:'a.ivanov@edu.hse.ru',phone:'+7 900 000-00-00',tg:'@a_ivanov_pm',
 about:'Ответственный, коммуникабельный, быстро обучаюсь. Интересуюсь продуктами и аналитикой. Ищу стажировку, чтобы получить опыт.',
 exp:[{role:'Организатор кейс-чемпионата',org:'Студенческий продуктовый клуб НИУ ВШЭ',period:'Сен 2025 — н. в.',bullets:['Занимался организацией кейс-чемпионата','Помогал участникам с подготовкой','Участвовал в поиске партнёров']},
  {role:'Ассистент преподавателя',org:'НИУ ВШЭ, курс «Анализ данных»',period:'Фев — Июн 2025',bullets:['Проверял домашние задания студентов','Отвечал на вопросы в чате курса']}],
 projects:[{title:'Онбординг фитнес-приложения',org:ACAD,period:'Март 2026',bullets:['Сделал прототип онбординга в Figma']}],
 edu:[{org:'НИУ ВШЭ',prog:'Бизнес-информатика, бакалавриат',period:'2023 — 2027'}],
 skills:'Excel, SQL, Python, Figma, работа в команде, коммуникабельность',
 extra:'Английский — B2. 2 место в кейс-чемпионате НИУ ВШЭ (2026).'});
const cv=()=>S.cv||(S.cv=CV_SEED());
const cvTargetJob=()=>jobById(S.cvTarget)||jobById(S.goal==='da'?'j5':'j1');
const clone=o=>JSON.parse(JSON.stringify(o));
const getP=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
const setP=(o,p,v)=>{const ks=p.split('.');const last=ks.pop();const t=ks.reduce((a,k)=>a[k],o);t[last]=v};

/* ================= analyzer ================= */
const WEAK=[['Занимался','Вёл'],['Занималась','Вела'],['Участвовал в','Выполнил в команде'],['Участвовала в','Выполнила в команде'],['Помогал','Помог'],['Помогала','Помогла'],['Отвечал','Закрыл'],['Проверял','Проверил'],['Делал','Сделал'],['Работал','Отвечал за']];
const CLICHE=['ответственн','коммуникабельн','стрессоустойчив','быстро обучаюсь','быстро обучаем','целеустремл','исполнительн','пунктуальн','нацелен на результат','умею работать в команде'];
const SOFT=['работа в команде','коммуникабельность','ответственность','лидерство','стрессоустойчивость','тайм-менеджмент'];
const SYN={'Product Analytics':['product analytics','продуктовая аналитика','продуктовой аналитик','аналитик'],'Customer Development':['customer development','custdev','глубинных интервью'],'Product Thinking':['product thinking','продуктовое мышление'],'Работа с гипотезами':['гипотез'],'Визуализация данных':['визуализац','дашборд'],'BI-дашборды (DataLens)':['datalens'],'Когортный анализ':['когорт'],'A/B-тестирование':['a/b','аб-тест'],'Юнит-экономика':['юнит-эконом'],'Статистика':['статистик'],'Python':['python','pandas']};
const kwIn=(text,k)=>{const t=text.toLowerCase();return [k.toLowerCase(),...(SYN[k]||[])].some(x=>t.includes(x))};
const cvText=c=>[c.title,c.about,...c.exp.flatMap(e=>[e.role,e.org,...e.bullets]),...c.projects.flatMap(p=>[p.title,p.org,...p.bullets]),...c.edu.map(e=>e.org+' '+e.prog),c.skills,c.extra].join('\n');
const allBullets=c=>[...c.exp.flatMap((e,i)=>e.bullets.map((b,j)=>({sec:'exp',i,j,b}))),...c.projects.flatMap((e,i)=>e.bullets.map((b,j)=>({sec:'projects',i,j,b})))].filter(x=>x.b&&x.b.trim());
const hasNum=b=>/\d/.test(b)||/\[[^\]]+\]/.test(b);
const isWeak=b=>WEAK.some(([w])=>b.trim().startsWith(w));
const phCount=c=>(cvText(c).match(/\[[^\]]+\]/g)||[]).length;
const IMPROVE={
 'Занимался организацией кейс-чемпионата':'Организовал кейс-чемпионат по продукту: [число] участников, [число] компании-партнёра',
 'Помогал участникам с подготовкой':'Провёл [число] консультаций для команд-участниц по структуре решения',
 'Участвовал в поиске партнёров':'Привлёк [число] компании-партнёра, в том числе жюри от Ozon и Т-Банка',
 'Проверял домашние задания студентов':'Проверил [число] домашних работ по SQL и Python для потока из [число] студентов',
 'Отвечал на вопросы в чате курса':'Сократил время ответа в чате курса до [число] часов, собрав базу типовых вопросов',
 'Сделал прототип онбординга в Figma':'Спроектировал онбординг из 4 экранов в Figma и сократил число шагов на 18%'};
function improveBullet(b){const k=b.trim();if(IMPROVE[k])return IMPROVE[k];let s=k;for(const [w,r] of WEAK){if(s.startsWith(w)){s=r+s.slice(w.length);break}}if(!hasNum(s))s=s.replace(/[.;]$/,'')+' — [результат в цифрах]';return s}
function goodAbout(){const t=T(),conf=confAll(),d=doneProjects().map(P)[0];
 return `Студент 3 курса бизнес-информатики НИУ ВШЭ, цель — ${t.goal}. Подтвердил на платформе ${BRAND} ${conf.length} ${plural(conf.length,'навык','навыка','навыков')}, в том числе ${conf.slice(0,3).map(s=>s.name).join(', ')}.${d?` Выполнил проект для ${d.company}: ${d.metrics[0][0]} ${d.metrics[0][1]}, оценка ${S.scores[d.id]||d.score} из 5.`:''} Провёл 14 глубинных интервью с пользователями, призёр кейс-чемпионата ВШЭ. Ищу стажировку от 30 часов в неделю.`}
const PBUL={p1:['Нашёл 3 проблемных этапа воронки «регистрация → покупка» на данных 12 400 пользователей (SQL)','Предложил 5 гипотез с приоритизацией по RICE; потенциальный рост конверсии +12%','Оценка компании 4,8 из 5, навыки подтверждены ментором'],
 p4:['Собрал когорты 48 000 клиентов на SQL и посчитал retention 1–3 месяцев','Нашёл сегмент без автоплатежа: отток в 2,3 раза выше, 31% всего оттока','Собрал дашборд из 12 графиков в DataLens; оценка компании 4,8 из 5']};
function importableProjects(c){const have=c.projects.map(p=>p.title);
 const list=[...doneProjects().filter(pid=>PBUL[pid]).map(pid=>({title:P(pid).title,org:P(pid).company,period:'Сентябрь 2026',company:true,bullets:[...PBUL[pid]]})),
  {title:'Customer Development для студенческого кофе-сервиса',org:ACAD,period:'Май 2026',bullets:['Провёл 14 глубинных интервью и выделил 3 сегмента аудитории','Сформулировал 2 ключевых инсайта, которые изменили гипотезу продукта']},
  {title:'Анализ конкурентов сервиса аренды самокатов',org:'Флоу',period:'Декабрь 2025',company:true,bullets:['Сравнил 6 конкурентов по функциям, ценам и сегментам в команде из 4 человек','Предложил 2 сценария позиционирования, оценка компании 4,3 из 5']}];
 return list.filter(p=>!have.includes(p.title))}
function analyzeCv(c,job){
 const text=cvText(c),bl=allBullets(c),issues=[];
 let st=0;if(c.email)st+=15;if(c.phone||c.tg)st+=15;if(c.city)st+=10;
 const titleOk=job&&(c.title.toLowerCase()===job.title.toLowerCase()||c.title.toLowerCase().includes(job.prof.split(' ')[0].toLowerCase()));
 if(titleOk)st+=30;else if(job)issues.push({sev:'mid',cat:'Структура',title:'Заголовок не совпадает с вакансией',text:`Рекрутер ищет «${job.title}». Назовите резюме так же: это первое, что он видит.`,fix:{t:'title',text:job.title}});
 if(c.edu.length&&c.edu[0].org)st+=30;else issues.push({sev:'high',cat:'Структура',title:'Нет образования',text:'Для стажёра образование — обязательный блок. Добавьте вуз, программу и год выпуска.'});
 if(!c.email||!(c.phone||c.tg))issues.push({sev:'high',cat:'Структура',title:'Не хватает контактов',text:'Укажите почту и телефон или Telegram, иначе с вами не смогут связаться.'});
 const withNum=bl.filter(x=>hasNum(x.b)).length,weak=bl.filter(x=>isWeak(x.b));
 const res=bl.length?Math.round(withNum/bl.length*60+(1-weak.length/bl.length)*40):0;
 weak.forEach(x=>issues.push({sev:'high',cat:'Результаты в цифрах',title:'Описан процесс, а не результат',text:`«${x.b}» — непонятно, чего вы добились. Начните с глагола результата и добавьте цифру.`,fix:{t:'bullet',sec:x.sec,i:x.i,j:x.j,before:x.b,text:improveBullet(x.b)}}));
 bl.filter(x=>!isWeak(x.b)&&!hasNum(x.b)).forEach(x=>issues.push({sev:'mid',cat:'Результаты в цифрах',title:'Нет цифр',text:`«${x.b}» — добавьте масштаб или результат.`,fix:{t:'bullet',sec:x.sec,i:x.i,j:x.j,before:x.b,text:improveBullet(x.b)}}));
 const kws=job?job.skills:[];const present=kws.filter(k=>kwIn(text,k)),missing=kws.filter(k=>!kwIn(text,k));
 const match=kws.length?Math.round(present.length/kws.length*100):100;
 const haveM=missing.filter(n=>{const s=skByName(n);return s&&has(s)}),noM=missing.filter(n=>!haveM.includes(n));
 if(haveM.length)issues.push({sev:'high',cat:'Соответствие вакансии',title:`Нет ключевых слов: ${haveM.join(', ')}`,text:'Эти навыки у вас есть, но в резюме их не видно — ни фильтр, ни рекрутер их не найдут.',fix:{t:'addKw',kw:haveM}});
 if(noM.length)issues.push({sev:'mid',cat:'Соответствие вакансии',title:`Не хватает навыков: ${noM.join(', ')}`,text:'Этих навыков нет в профиле. Не вписывайте их без опыта: лучше подтвердите тестом или проектом.',link:true});
 const confNames=confAll().map(s=>s.name),confIn=confNames.filter(n=>kwIn(c.skills,n)),compProj=c.projects.some(p=>p.company);
 const ev=Math.min(100,c.projects.length*20+confIn.length*8+(compProj?30:0));
 const imp=importableProjects(c);if(imp.length)issues.push({sev:compProj?'low':'high',cat:'Доказательства навыков',title:`Добавьте проекты с платформы (${imp.length})`,text:'Проекты компаний с оценкой и цифрами — самое сильное доказательство для стажёра.',fix:{t:'import'}});
 const confMiss=confNames.filter(n=>!kwIn(c.skills,n));if(confMiss.length)issues.push({sev:'mid',cat:'Доказательства навыков',title:'Отметьте подтверждённые навыки',text:`${confMiss.join(', ')} подтверждены на ${BRAND}, но не указаны в навыках. В резюме они получат отметку ✓.`,fix:{t:'skills'}});
 const cl=CLICHE.filter(x=>c.about.toLowerCase().includes(x)),soft=SOFT.filter(x=>c.skills.toLowerCase().includes(x)),ph=phCount(c),words=text.split(/\s+/).filter(Boolean).length;
 const sty=Math.max(0,100-cl.length*15-soft.length*10-Math.min(30,ph*5)-(words<120||words>650?20:0));
 if(cl.length)issues.push({sev:'high',cat:'Стиль',title:'Шаблонные фразы в «О себе»',text:`«${cl.map(x=>x+'…').join('», «')}» пишет почти каждый. Замените фактами: цель, подтверждённые навыки, результат.`,fix:{t:'about',text:goodAbout()}});
 else if(c.about.length<140)issues.push({sev:'mid',cat:'Стиль',title:'Короткий блок «О себе»',text:'2–3 предложения: цель, главное доказательство, что ищете.',fix:{t:'about',text:goodAbout()}});
 if(soft.length)issues.push({sev:'low',cat:'Стиль',title:'Софт-скиллы в списке навыков',text:`«${soft.join('», «')}» лучше показать примерами в опыте, а в навыках оставить инструменты и методы.`,fix:{t:'soft'}});
 if(ph)issues.push({sev:'mid',cat:'Стиль',title:`Заполните пропуски: ${ph}`,text:'Места в квадратных скобках замените своими реальными цифрами — выдумывать их нельзя.'});
 if(words>650)issues.push({sev:'low',cat:'Стиль',title:'Резюме длиннее страницы',text:'Для стажёра достаточно одной страницы: уберите старые и нерелевантные пункты.'});
 const cats=[['Структура',st],['Результаты в цифрах',res],['Соответствие вакансии',match],['Доказательства навыков',ev],['Стиль',sty]];
 const score=Math.round(st*.15+res*.3+match*.25+ev*.2+sty*.1);
 const ord={high:0,mid:1,low:2};issues.sort((a,b)=>ord[a.sev]-ord[b.sev]);
 return {score,cats,issues,present,missing,summary:score>=80?'Сильное резюме: результаты в цифрах и подтверждённые навыки. Осталось отшлифовать детали.':score>=60?'Хорошая основа. Добавьте цифры в опыт и ключевые слова вакансии — и резюме заметно усилится.':'Резюме описывает обязанности, а не результаты, и почти не совпадает с вакансией. Начните с советов с высоким приоритетом.'}}
function applyFix(c,f){
 if(!f)return;
 if(f.t==='title')c.title=f.text;
 if(f.t==='about')c.about=f.text;
 if(f.t==='bullet'){const arr=c[f.sec][f.i]&&c[f.sec][f.i].bullets;if(arr){const j=arr.indexOf(f.before);arr[j>=0?j:f.j]=f.text}}
 if(f.t==='addKw'){c.skills=[...f.kw,...c.skills.split(',').map(s=>s.trim()).filter(Boolean)].filter((v,i,a)=>a.findIndex(x=>x.toLowerCase()===v.toLowerCase())===i).join(', ')}
 if(f.t==='soft'){c.skills=c.skills.split(',').map(s=>s.trim()).filter(s=>s&&!SOFT.includes(s.toLowerCase())).join(', ')}
 if(f.t==='skills'){const cur=c.skills.split(',').map(s=>s.trim()).filter(s=>s&&!SOFT.includes(s.toLowerCase()));const add=[...confAll().map(s=>s.name),...skAll().filter(s=>s.st!=='ok'&&has(s)).map(s=>s.name)];c.skills=[...add,...cur].filter((v,i,a)=>a.findIndex(x=>x.toLowerCase()===v.toLowerCase())===i).join(', ')}
 if(f.t==='import'){importableProjects(c).forEach(p=>c.projects.unshift(p))}
 if(f.t==='replace'){const rep=s=>s===f.before?f.text:s;c.title=rep(c.title);c.about=rep(c.about);c.extra=rep(c.extra);['exp','projects'].forEach(k=>c[k].forEach(e=>{e.bullets=e.bullets.map(rep)}))}
}
function cvFindable(c,before){if(!before)return false;return [c.title,c.about,c.extra,...allBullets(c).map(x=>x.b)].includes(before.trim())}
const cvScore=()=>analyzeCv(cv(),cvTargetJob()).score;

/* ================= paper (resume render) ================= */
const EN_LBL={about:'Summary',exp:'Experience',projects:'Projects',edu:'Education',skills:'Skills',extra:'Additional',foot:`✓ — skill verified on ${BRAND}`};
const RU_LBL={about:'О себе',exp:'Опыт',projects:'Проекты',edu:'Образование',skills:'Навыки',extra:'Дополнительно',foot:`✓ — навык подтверждён на ${BRAND}`};
function hl(s,heat){let x=esc(s||'');if(heat)x=x.replace(/(?<![A-Za-zА-Яа-яЁё\d])(\d[\d\s.,%]*\d%?|\d%?)/g,'<span class="hn">$1</span>');return x.replace(/\[([^\]]+)\]/g,'<mark class="ph">[$1]</mark>')}
function cvPaper(c,{tpl='modern',lang='ru',heat=false}={}){
 const L=lang==='en'?EN_LBL:RU_LBL,confN=confAll().map(s=>s.name.toLowerCase()),EN_NAMES=lang==='en'?Object.fromEntries(confAll().map(s=>[(EN_SK[s.name]||s.name).toLowerCase(),1])):{};
 const skills=(c.skills||'').split(',').map(s=>s.trim()).filter(Boolean);
 const isConf=s=>confN.includes(s.toLowerCase())||EN_NAMES[s.toLowerCase()];
 const eye=n=>heat?`<i class="eye">${n}</i>`:'';
 const items=(arr,kind)=>arr.map((e,k)=>`<div class="pp-item"><div class="pp-row"><b>${hl(kind==='exp'?e.role:e.title)}</b><span>${hl(e.period)}</span></div><div class="pp-org">${hl(e.org)}${e.company?` <span class="pp-co">${lang==='en'?'company project':'проект компании'}</span>`:''}</div><ul>${e.bullets.filter(b=>b.trim()).map((b,j)=>`<li class="${j===0?'first':''}">${k===0&&j===0&&kind==='exp'?eye(3):''}${hl(b,heat)}</li>`).join('')}</ul></div>`).join('');
 const side=`<section class="pp-sec pp-skills">${eye(5)}<h4>${L.skills}</h4><div class="pp-chips">${skills.map(s=>`<span class="${isConf(s)?'cf':''}">${isConf(s)?'✓ ':''}${esc(s)}</span>`).join('')}</div></section>
  <section class="pp-sec"><h4>${L.edu}</h4>${c.edu.map(e=>`<div class="pp-item"><b>${hl(e.org)}</b><div class="pp-org">${hl(e.prog)}</div><div class="pp-org">${hl(e.period)}</div></div>`).join('')}</section>
  ${c.extra?`<section class="pp-sec"><h4>${L.extra}</h4><p>${hl(c.extra,heat)}</p></section>`:''}`;
 const main=`${c.about?`<section class="pp-sec pp-about"><h4>${L.about}</h4><p>${hl(c.about,heat)}</p></section>`:''}
  ${c.exp.length?`<section class="pp-sec"><h4>${L.exp}</h4>${items(c.exp,'exp')}</section>`:''}
  ${c.projects.length?`<section class="pp-sec pp-projects">${eye(4)}<h4>${L.projects}</h4>${items(c.projects,'proj')}</section>`:''}`;
 return `<div class="paper tpl-${tpl}${heat?' heat':''}" lang="${lang}">
  <header class="pp-h"><div>${eye(1)}<div class="pp-name">${hl(c.name)}</div><div class="pp-title">${eye(2)}${hl(c.title)}</div></div><div class="pp-contacts">${[c.city,c.email,c.phone,c.tg].filter(Boolean).map(x=>`<span>${hl(x)}</span>`).join('')}</div></header>
  <div class="pp-body"><div class="pp-main">${main}</div><aside class="pp-side">${side}</aside></div>
  ${skills.some(isConf)?`<footer class="pp-foot">${eye(6)}${L.foot} · ${DOMAIN}/@a.ivanov</footer>`:''}</div>`}
const PAPER_CSS=`.paper{--pa:#3B47E0;background:#fff;color:#1B1F33;font:400 12.5px/1.5 Onest,system-ui,Segoe UI,Arial,sans-serif;padding:28px 30px;border-radius:6px;position:relative}
.paper h4{margin:0 0 6px;font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--pa)}
.paper p{margin:0}.paper ul{margin:4px 0 0;padding-left:16px}.paper li{margin:2px 0}
.pp-h{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:14px;border-bottom:2px solid var(--pa);margin-bottom:14px}
.pp-name{font-size:24px;font-weight:800;letter-spacing:-.02em;line-height:1.1}.pp-title{font-size:14px;font-weight:600;color:var(--pa);margin-top:2px}
.pp-contacts{display:flex;flex-direction:column;align-items:flex-end;font-size:11.5px;color:#4A5070}
.pp-body{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:22px}.pp-sec{margin-bottom:14px}
.pp-item{margin-bottom:9px}.pp-row{display:flex;justify-content:space-between;gap:10px}.pp-row span{color:#6A7090;font-size:11px;white-space:nowrap}
.pp-org{color:#4A5070;font-size:11.5px}.pp-co{font-size:9.5px;font-weight:700;color:#11946A;background:#E2F4EC;border-radius:4px;padding:1px 5px;text-transform:uppercase;letter-spacing:.04em}
.pp-chips{display:flex;flex-wrap:wrap;gap:4px}.pp-chips span{font-size:11px;padding:2px 7px;border-radius:5px;background:#F1F3F9}.pp-chips span.cf{background:#E2F4EC;color:#0B7A57;font-weight:600}
.pp-foot{margin-top:6px;padding-top:8px;border-top:1px solid #E2E6F0;font-size:10.5px;color:#11946A}
mark.ph{background:#FDE7C8;color:#9A4A00;border-radius:3px;padding:0 2px}
.tpl-classic{--pa:#1B1F33}.tpl-classic .pp-h{flex-direction:column;align-items:center;text-align:center;border-bottom-width:1px}.tpl-classic .pp-contacts{flex-direction:row;gap:10px;flex-wrap:wrap;justify-content:center}.tpl-classic .pp-body{grid-template-columns:1fr}.tpl-classic h4{border-bottom:1px solid #D8DCE8;padding-bottom:3px}
.tpl-compact{--pa:#0E7490;font-size:11.5px;padding:22px 24px}.tpl-compact .pp-name{font-size:20px}.tpl-compact .pp-body{grid-template-columns:150px minmax(0,1fr)}.tpl-compact .pp-side{order:-1;border-right:1px solid #E2E6F0;padding-right:14px}
@media (max-width:560px){.pp-body{grid-template-columns:1fr!important}.pp-side{order:0!important;border:0!important;padding:0!important}.pp-contacts{align-items:flex-start}}
.paper-wrap{container-type:inline-size}
@container (max-width:600px){.pp-body{grid-template-columns:1fr!important}.pp-side{order:0!important;border:0!important;padding:0!important}.pp-h{flex-direction:column}.pp-contacts{align-items:flex-start!important;flex-direction:row!important;flex-wrap:wrap;gap:4px 12px}.paper{padding:22px 20px}}`;
(()=>{const st=document.createElement('style');st.textContent=PAPER_CSS;document.body.appendChild(st)})();
function cvDocHtml(c,tpl,lang){return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(c.name)} — ${lang==='en'?'CV':'резюме'}</title><style>body{margin:0;background:#EEF0F6;padding:24px}.paper{max-width:800px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08)}@media print{body{background:#fff;padding:0}.paper{box-shadow:none}}${PAPER_CSS}</style></head><body>${cvPaper(c,{tpl,lang})}</body></html>`}
async function saveFile(filename,data){
 if(DLS){try{await DLS.save({filename,data});toast('Файл сохранён','download')}catch(e){if(e&&e.code!=='declined')toast('Не получилось сохранить файл в этом просмотре','x')}return}
 if(NO_RT){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'text/html;charset=utf-8'}));a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast('Файл сохранён','download');return}
 toast('Скачивание недоступно в этом просмотре — используйте «Копировать текст»','x')}
const canSave=()=>!!DLS||NO_RT;
function cvPlain(c){return [c.name,c.title,[c.city,c.email,c.phone,c.tg].filter(Boolean).join(' · '),'',RU_LBL.about.toUpperCase(),c.about,'',RU_LBL.exp.toUpperCase(),...c.exp.flatMap(e=>[`${e.role} — ${e.org} (${e.period})`,...e.bullets.map(b=>'• '+b),'']),RU_LBL.projects.toUpperCase(),...c.projects.flatMap(e=>[`${e.title} — ${e.org} (${e.period})`,...e.bullets.map(b=>'• '+b),'']),RU_LBL.edu.toUpperCase(),...c.edu.map(e=>`${e.org}, ${e.prog}, ${e.period}`),'',RU_LBL.skills.toUpperCase(),c.skills,'',c.extra].join('\n')}
function copyText(t,msg){const ok=()=>toast(msg||'Скопировано','copy');try{navigator.clipboard.writeText(t).then(ok,()=>toast('Выделите текст и скопируйте вручную','x'))}catch(e){toast('Выделите текст и скопируйте вручную','x')}}

/* ================= English ================= */
const EN_SK={'Product Thinking':'Product Thinking','Customer Development':'Customer Development','Презентация выводов':'Presenting insights','Работа с гипотезами':'Hypothesis testing','CJM':'CJM','Excel':'Excel','Приоритизация (RICE)':'Prioritization (RICE)','Очистка данных':'Data cleaning','Figma':'Figma','SQL':'SQL','Python':'Python','Product Analytics':'Product Analytics','Статистика':'Statistics','Визуализация данных':'Data visualization','Юнит-экономика':'Unit economics','A/B-тестирование':'A/B testing','Roadmapping':'Roadmapping','BI-дашборды (DataLens)':'BI dashboards (DataLens)','Когортный анализ':'Cohort analysis','работа в команде':'teamwork','коммуникабельность':'communication'};
const EN={'Алексей Иванов':'Alexey Ivanov','Стажёр Product Manager':'Product Manager Intern','Product Manager Intern':'Product Manager Intern','Junior Product Analyst':'Junior Product Analyst','Стажёр Data Analyst':'Data Analyst Intern','Москва':'Moscow',
 'Организатор кейс-чемпионата':'Case championship organizer','Студенческий продуктовый клуб НИУ ВШЭ':'HSE University Student Product Club','Ассистент преподавателя':'Teaching assistant','НИУ ВШЭ, курс «Анализ данных»':'HSE University, “Data Analysis” course','НИУ ВШЭ':'HSE University','Бизнес-информатика, бакалавриат':'Business Informatics, BSc',
 'Занимался организацией кейс-чемпионата':'Was involved in organizing a case championship','Помогал участникам с подготовкой':'Helped participants prepare','Участвовал в поиске партнёров':'Took part in finding partners','Проверял домашние задания студентов':'Graded student assignments','Отвечал на вопросы в чате курса':'Answered questions in the course chat','Сделал прототип онбординга в Figma':'Built an onboarding prototype in Figma',
 'Организовал кейс-чемпионат по продукту: [число] участников, [число] компании-партнёра':'Organized a product case championship: [number] participants, [number] partner companies','Провёл [число] консультаций для команд-участниц по структуре решения':'Ran [number] coaching sessions for teams on solution structure','Привлёк [число] компании-партнёра, в том числе жюри от Ozon и Т-Банка':'Brought in [number] partner companies, including judges from Ozon and T-Bank','Проверил [число] домашних работ по SQL и Python для потока из [число] студентов':'Graded [number] SQL and Python assignments for a cohort of [number] students','Сократил время ответа в чате курса до [число] часов, собрав базу типовых вопросов':'Cut course chat response time to [number] hours by building an FAQ base','Спроектировал онбординг из 4 экранов в Figma и сократил число шагов на 18%':'Designed a 4-screen onboarding in Figma, cutting the number of steps by 18%',
 'Онбординг фитнес-приложения':'Fitness app onboarding','Customer Development для студенческого кофе-сервиса':'Customer development for a student coffee service','Провёл 14 глубинных интервью и выделил 3 сегмента аудитории':'Ran 14 in-depth interviews and identified 3 audience segments','Сформулировал 2 ключевых инсайта, которые изменили гипотезу продукта':'Formulated 2 key insights that changed the product hypothesis','Анализ конкурентов сервиса аренды самокатов':'Competitor analysis for a scooter rental service','Сравнил 6 конкурентов по функциям, ценам и сегментам в команде из 4 человек':'Compared 6 competitors by features, pricing and segments in a team of 4','Предложил 2 сценария позиционирования, оценка компании 4,3 из 5':'Proposed 2 positioning scenarios; company rating 4.3/5',
 'Исследование пользовательской воронки EdTech-сервиса':'EdTech user funnel research','Нашёл 3 проблемных этапа воронки «регистрация → покупка» на данных 12 400 пользователей (SQL)':'Found 3 problem stages in the sign-up → purchase funnel using data on 12,400 users (SQL)','Предложил 5 гипотез с приоритизацией по RICE; потенциальный рост конверсии +12%':'Proposed 5 RICE-prioritized hypotheses; potential conversion uplift +12%','Оценка компании 4,8 из 5, навыки подтверждены ментором':'Company rating 4.8/5; skills verified by a mentor',
 'Дашборд удержания клиентов':'Customer retention dashboard','Собрал когорты 48 000 клиентов на SQL и посчитал retention 1–3 месяцев':'Built SQL cohorts for 48,000 customers and calculated month 1–3 retention','Нашёл сегмент без автоплатежа: отток в 2,3 раза выше, 31% всего оттока':'Found a no-autopay segment with 2.3× higher churn — 31% of total churn','Собрал дашборд из 12 графиков в DataLens; оценка компании 4,8 из 5':'Built a 12-chart DataLens dashboard; company rating 4.8/5',
 'Ответственный, коммуникабельный, быстро обучаюсь. Интересуюсь продуктами и аналитикой. Ищу стажировку, чтобы получить опыт.':'Responsible, sociable, a fast learner. Interested in products and analytics. Looking for an internship to gain experience.',
 'Английский — B2. 2 место в кейс-чемпионате НИУ ВШЭ (2026).':'English — B2. 2nd place, HSE University case championship (2026).'};
const EN_MON=[['Сентябрь','September'],['Декабрь','December'],['Март','March'],['Май','May'],['Сен','Sep'],['Фев','Feb'],['Июн','Jun'],['н. в.','present']];
function enAbout(){const t=T(),conf=confAll(),d=doneProjects().map(P)[0];return `3rd-year Business Informatics student at HSE University aiming for a ${t.goal} role. ${conf.length} skills verified on ${BRAND}, including ${conf.slice(0,3).map(s=>EN_SK[s.name]||s.name).join(', ')}.${d?` Completed a project for ${d.company==='Т-Банк'?'T-Bank':d.company} rated ${String(S.scores[d.id]||d.score).replace(',','.')}/5.`:''} Ran 14 in-depth user interviews; runner-up in the HSE case championship. Looking for an internship of 30+ hours a week.`}
function enLocal(c){let miss=0;const tr=s=>{if(!s)return s;if(EN[s])return EN[s];let x=s;EN_MON.forEach(([a,b])=>{x=x.split(a).join(b)});if(/^[\x00-\x7F—–«»“”’\s]*$/.test(x))return x;miss++;return s};
 const e=clone(c);e.name=tr(c.name);e.title=tr(c.title);e.city=tr(c.city);e.about=c.about===goodAbout()?enAbout():tr(c.about);
 e.exp=c.exp.map(x=>({...x,role:tr(x.role),org:tr(x.org),period:tr(x.period),bullets:x.bullets.map(tr)}));
 e.projects=c.projects.map(x=>({...x,title:tr(x.title),org:x.org===ACAD?ACAD:tr(x.org)==='Т-Банк'?'T-Bank':tr(x.org),period:tr(x.period),bullets:x.bullets.map(tr)}));
 e.edu=c.edu.map(x=>({...x,org:tr(x.org),prog:tr(x.prog),period:x.period}));e.skills=c.skills.split(',').map(s=>s.trim()).map(s=>EN_SK[s]||s).join(', ');e.extra=tr(c.extra);return {cv:e,miss}}

/* ================= hh.ru ================= */
const HH_SAMPLE=`Желаемая должность: Стажёр-аналитик
Обо мне
Студент ВШЭ, интересуюсь аналитикой данных. Быстро учусь, люблю цифры.
Опыт работы
Июль 2025 — Август 2025
Кофейня «Зерно»
Бариста
— Обслуживал гостей
— Вёл учёт продаж в Excel и собрал отчёт по выручке за 2 месяца
Образование
2027
НИУ ВШЭ, Бизнес-информатика
Ключевые навыки
Excel, SQL, Python, Tableau`;
function parseHH(t){const lines=t.split('\n').map(s=>s.trim());const c={name:'Алексей Иванов',title:'',city:'Москва',email:cv().email,phone:cv().phone,tg:cv().tg,about:'',exp:[],projects:[],edu:[],skills:'',extra:''};
 let sec='';const buf={about:[],exp:[],edu:[],skills:[],extra:[]};
 lines.forEach(l=>{if(/^желаемая должность/i.test(l)){c.title=l.split(':').slice(1).join(':').trim();return}if(/^обо мне/i.test(l)){sec='about';return}if(/^опыт работы/i.test(l)){sec='exp';return}if(/^образование/i.test(l)){sec='edu';return}if(/^ключевые навыки/i.test(l)){sec='skills';return}if(/^(дополнительн|знание языков)/i.test(l)){sec='extra';return}if(sec)buf[sec].push(l)});
 c.about=buf.about.filter(Boolean).join(' ');c.skills=buf.skills.filter(Boolean).join(', ');c.extra=buf.extra.filter(Boolean).join(' ');
 const blocks=[];let cur=null;buf.exp.forEach(l=>{if(!l){return}if(/^\S+\s+\d{4}|^\d{4}/.test(l)&&!/^[—\-•]/.test(l)){cur={period:l,org:'',role:'',bullets:[]};blocks.push(cur)}else if(cur){if(/^[—\-•]/.test(l))cur.bullets.push(l.replace(/^[—\-•]\s*/,''));else if(!cur.org)cur.org=l;else if(!cur.role)cur.role=l;else cur.bullets.push(l)}});
 c.exp=blocks;const ed=buf.edu.filter(Boolean);if(ed.length)c.edu=[{period:ed[0],org:(ed[1]||'').split(',')[0],prog:(ed[1]||'').split(',').slice(1).join(',').trim()}];return c}

/* ================= resume views ================= */
const CV_TABS=[['build','Конструктор и анализ','pen'],['versions','Под вакансию','target'],['recruiter','Взгляд рекрутера','eye'],['english','На английском','globe'],['hh','hh.ru','swap'],['people','Проверка людьми','users']];
VIEWS.resume=(tab)=>{tab=CV_TABS.some(t=>t[0]===tab)?tab:'build';const a=analyzeCv(cv(),cvTargetJob());if(a.score>(S.cvBest||0)){S.cvBest=a.score;save()}
 return `<div class="page-h"><div><span class="label">Трудоустройство</span><h1 style="margin-top:4px">Резюме</h1><p>Соберите резюме из подтверждённых навыков и проектов, проверьте его под вакансию и получите советы, как усилить каждую строчку.</p></div><div class="row g8">${aiBadge()}</div></div>
 <div class="tabs">${CV_TABS.map(([k,l,i])=>`<button class="${tab===k?'on':''}" data-go="resume-${k}">${ic(i,15)} ${l}</button>`).join('')}</div>
 ${({build:cvBuild,versions:cvVersions,recruiter:cvRecruiter,english:cvEnglish,hh:cvHH,people:cvPeople})[tab](a)}`};
function scoreCard(a,{ai}={}){const job=cvTargetJob(),st=task('cvAI'),A=ai||a;
 return `<section class="card cv-score"><div class="row g20" style="align-items:flex-start">
  <div class="col g8" style="align-items:center">${ring(A.score,112,'big')}<span class="xs muted">${ai?'оценка ИИ':'экспресс-оценка'}</span></div>
  <div class="grow col g12" style="min-width:240px"><div class="row between"><h2>${A.score>=80?'Сильное резюме':A.score>=60?'Хорошая основа':'Резюме можно усилить'}</h2><label class="row g8 sm t2">Под вакансию ${`<select class="sel" id="cv-target" style="height:34px">${allJobs().filter(j=>isFit(j)||j.id===S.cvTarget).map(j=>`<option value="${j.id}" ${j.id===job.id?'selected':''}>${esc(j.title)} · ${esc(j.company)}</option>`).join('')}</select>`}</label></div>
   <p class="sm t2">${esc(A.summary||'')}</p>
   <div class="cv-cats">${(A.cats||[]).map(([n,v])=>`<div class="row g8" style="flex-wrap:nowrap"><span class="sm grow">${n}</span><div style="width:120px">${bar(v,v>=70?'gr thin':'o thin')}</div><b class="sm" style="width:34px;text-align:right">${v}</b></div>`).join('')}</div>
   <div class="row g8"><span class="xs muted">Ключевые слова вакансии:</span>${(A.present||[]).map(k=>`<span class="pill ok">${ic('check')}${esc(k)}</span>`).join('')}${(A.missing||[]).map(k=>`<span class="pill red">${esc(k)}</span>`).join('')}</div>
  </div>
  <div class="col g8" style="min-width:210px">
   <button class="btn btn-p" data-act="cvAI" ${st.status==='loading'?'disabled':''}>${ic('spark')}${aiOn()?'Глубокий AI-разбор':'Подробный разбор'}</button>
   <button class="btn btn-s" data-act="cvFixAll">${ic('wand')}Применить все советы</button>
   <button class="btn btn-g btn-sm" data-go="interview-letters">${ic('mail')}Сопроводительное письмо</button>
  </div></div>${taskUI('cvAI',{loadingText:'Claude читает резюме…'})}</section>`}
function aiCvData(){const st=task('cvAI');if(st.status!=='done'||!st.data)return null;const d=st.data;if(st.source==='local')return null;
 const cats=Array.isArray(d.categories)?d.categories.map(x=>[String(x.name||''),Math.max(0,Math.min(100,Number(x.score)||0))]):[];
 return {score:Math.max(0,Math.min(100,Number(d.score)||0)),summary:String(d.summary||''),cats,present:(d.keywords&&d.keywords.present)||[],missing:(d.keywords&&d.keywords.missing)||[],
  issues:(Array.isArray(d.issues)?d.issues:[]).slice(0,8).map(x=>({sev:['high','mid','low'].includes(x.severity)?x.severity:'mid',cat:'ИИ',title:String(x.title||''),text:String(x.detail||''),before:x.before?String(x.before):'',after:x.after?String(x.after):''}))}}
function issueRow(x,i,src){const sevL={high:['Важно','red'],mid:['Средне','pr'],low:['Мелочь','']}[x.sev];
 const can=src==='ai'?(x.after&&cvFindable(cv(),x.before)):!!x.fix;
 return `<div class="iss"><span class="pill ${sevL[1]}" style="height:22px;font-size:11px">${sevL[0]}</span><div class="grow col g6"><div class="b">${esc(x.title)}</div><div class="sm t2">${esc(x.text)}</div>
  ${src==='ai'&&x.after?`<div class="diff"><div><span class="xs muted">Было</span><div>${hl(x.before||'—')}</div></div><div><span class="xs muted">Стало</span><div>${hl(x.after)}</div></div></div>`:x.fix&&x.fix.t==='bullet'?`<div class="diff"><div><span class="xs muted">Было</span><div>${hl(x.fix.before)}</div></div><div><span class="xs muted">Стало</span><div>${hl(x.fix.text)}</div></div></div>`:x.fix&&x.fix.t==='about'?`<div class="diff one"><div><span class="xs muted">Предлагаем</span><div>${hl(x.fix.text)}</div></div></div>`:''}
  ${x.link?`<div class="row g8"><button class="btn btn-s btn-sm" data-go="skills">Подтвердить навык</button><button class="btn btn-g btn-sm" data-go="projects">Найти проект</button></div>`:''}</div>
  ${can?`<button class="btn btn-s btn-sm" data-act="cvApply" data-id="${src}:${i}">${ic('check')}Применить</button>`:src==='ai'&&x.after?`<button class="btn btn-g btn-sm" data-act="cvCopyAfter" data-id="${i}">${ic('copy')}Копировать</button>`:''}</div>`}
function cvBuild(a){const c=cv(),ai=aiCvData(),st=task('cvAI');const tab=UI.cvLeft||'tips';const iss=ai?ai.issues:a.issues;
 return `${scoreCard(a,{ai})}
 <div class="split cv-split" style="margin-top:20px">
  <div class="stack">
   <div class="seg" style="align-self:flex-start"><button class="${tab==='tips'?'on':''}" data-act="cvLeft" data-id="tips">Советы · ${iss.length}</button><button class="${tab==='edit'?'on':''}" data-act="cvLeft" data-id="edit">Редактор</button></div>
   ${tab==='tips'?`<section class="card col g12" style="padding:8px 20px">${ai?`<div class="row between" style="padding-top:10px"><span class="pill ac">${ic('spark')}Разбор Claude</span><button class="btn btn-g btn-sm" data-act="cvLocal">Показать экспресс-советы</button></div>`:''}${srcNote(st)}${iss.length?iss.map((x,i)=>issueRow(x,i,ai?'ai':'local')).join(''):`<div class="empty">Замечаний нет — резюме готово к отправке.</div>`}</section>`:cvEditor(c)}
  </div>
  <div class="sticky col g12">
   <div class="row between"><div class="seg">${[['modern','Современный'],['classic','Классический'],['compact','Компактный']].map(([k,l])=>`<button class="${(S.cvTpl||'modern')===k?'on':''}" data-act="cvTpl" data-id="${k}">${l}</button>`).join('')}</div>
   <div class="row g8">${canSave()?`<button class="btn btn-s btn-sm" data-act="cvDownload">${ic('download')}Скачать</button>`:''}<button class="btn btn-g btn-sm" data-act="cvCopyAll">${ic('copy')}Текст</button></div></div>
   <div class="paper-wrap" id="cvPreview">${cvPaper(c,{tpl:S.cvTpl||'modern'})}</div>
   ${phCount(c)?`<p class="xs muted">${ic('pen',12)} Оранжевым отмечены пропуски — впишите свои реальные цифры.</p>`:''}
  </div></div>`}
function cvEditor(c){const f=(p,l,v,ph='')=>`<label class="field"><span>${l}</span><input class="inp" data-cv="${p}" value="${esc(v)}" placeholder="${ph}"></label>`;
 const ta=(p,l,v,rows=3,hint='')=>`<label class="field"><span>${l}</span><textarea class="inp" data-cv="${p}" rows="${rows}">${esc(v)}</textarea>${hint?`<span class="xs muted">${hint}</span>`:''}</label>`;
 const grp=(sec,arr,kind)=>arr.map((e,i)=>`<div class="cv-ent"><div class="row between"><b class="sm">${kind==='exp'?'Место':'Проект'} ${i+1}</b><button class="x" data-act="cvDel" data-id="${sec}:${i}" aria-label="Удалить">${ic('x',14)}</button></div><div class="form-grid">${kind==='exp'?f(`${sec}.${i}.role`,'Должность',e.role):f(`${sec}.${i}.title`,'Название',e.title)}${f(`${sec}.${i}.org`,kind==='exp'?'Организация':'Компания',e.org)}${f(`${sec}.${i}.period`,'Период',e.period)}</div>${ta(`${sec}.${i}.bullets`,'Достижения',e.bullets.join('\n'),3,'Каждое с новой строки. Начинайте с глагола результата и добавляйте цифры.')}</div>`).join('');
 return `<section class="card col g16">
  <div class="form-grid">${f('name','Имя и фамилия',c.name)}${f('title','Желаемая позиция',c.title)}${f('city','Город',c.city)}${f('email','Почта',c.email)}${f('phone','Телефон',c.phone)}${f('tg','Telegram',c.tg)}</div>
  ${ta('about','О себе',c.about,4,'2–3 предложения: цель, главное доказательство, что ищете.')}
  <div class="row between"><h3>Опыт</h3><button class="btn btn-g btn-sm" data-act="cvAdd" data-id="exp">${ic('plus')}Добавить</button></div>${grp('exp',c.exp,'exp')}
  <div class="row between"><h3>Проекты</h3><div class="row g8">${importableProjects(c).length?`<button class="btn btn-s btn-sm" data-act="cvImport">${ic('download')}Из портфолио (${importableProjects(c).length})</button>`:''}<button class="btn btn-g btn-sm" data-act="cvAdd" data-id="projects">${ic('plus')}Добавить</button></div></div>${grp('projects',c.projects,'proj')}
  <h3>Образование</h3>${c.edu.map((e,i)=>`<div class="form-grid">${f(`edu.${i}.org`,'Вуз',e.org)}${f(`edu.${i}.prog`,'Программа',e.prog)}${f(`edu.${i}.period`,'Годы',e.period)}</div>`).join('')}
  <div class="row between"><h3>Навыки</h3><button class="btn btn-s btn-sm" data-act="cvSkills">${ic('shield')}Из Skill Passport</button></div>${ta('skills','Через запятую',c.skills,2,'Подтверждённые навыки получат отметку ✓ и ссылку на Skill Passport.')}
  ${ta('extra','Дополнительно',c.extra,2)}
  <div class="row between"><span class="xs muted">Изменения сохраняются автоматически</span><button class="btn btn-g btn-sm" data-act="cvReset">${ic('refresh')}Вернуть исходное резюме</button></div></section>`}
function paintCv(){const p=$('#cvPreview');if(p)p.innerHTML=cvPaper(cv(),{tpl:S.cvTpl||'modern'})}

/* versions */
function tailorLocal(c,job){const v=clone(c);v.title=job.title;
 const have=job.skills.filter(n=>{const s=skByName(n);return s&&has(s)});
 const cur=v.skills.split(',').map(s=>s.trim()).filter(Boolean);v.skills=[...have,...cur].filter((x,i,a)=>a.findIndex(y=>y.toLowerCase()===x.toLowerCase())===i).join(', ');
 const rel=p=>p.bullets.concat(p.title).join(' ');v.projects.sort((a,b)=>job.skills.filter(k=>kwIn(rel(b),k)).length-job.skills.filter(k=>kwIn(rel(a),k)).length);
 v.about=(v.about.replace(/Ищу стажировку[^.]*\.?/,'').trim()+` Хочу присоединиться к команде ${job.company}${job.team?' ('+job.team+')':''} на позицию ${job.title}: у меня есть ${have.slice(0,3).join(', ')||'нужная база'}.`).trim();
 return v}
function cvVersions(){const vs=S.cvVersions||[],job=jobById(UI.verJob)||cvTargetJob(),st=task('cvTailor');const sel=vs.find(v=>v.id===UI.verOpen)||vs[0];
 return `<div class="split cv-split">
  <div class="stack">
   <section class="card col g12"><h2>Новая версия под вакансию</h2><p class="sm t2">Одно базовое резюме — много точных версий. Под каждую вакансию меняются заголовок, порядок навыков и проектов и акценты в «О себе». Факты остаются вашими.</p>
    <div class="row g8"><select class="sel grow" id="ver-job">${allJobs().filter(j=>unlocked(j)).sort((a,b)=>isFit(b)-isFit(a)||matchOf(b)-matchOf(a)).slice(0,14).map(j=>`<option value="${j.id}" ${j.id===job.id?'selected':''}>${esc(j.title)} · ${esc(j.company)}</option>`).join('')}</select><button class="btn btn-p" data-act="cvTailor" ${st.status==='loading'?'disabled':''}>${ic('wand')}Создать версию</button></div>
    ${taskUI('cvTailor',{loadingText:'Claude адаптирует резюме…'})}</section>
   <section class="card col g8"><h2>Мои версии</h2>${vs.length?vs.map(v=>{const j=jobById(v.job);const b=analyzeCv(cv(),j).score,after=analyzeCv(v.cv,j).score;return `<button class="th ${sel&&sel.id===v.id?'on':''}" data-act="verOpen" data-id="${v.id}" style="border:1px solid var(--border);border-radius:10px">${logo(j.company,'sm')}<span class="grow"><div class="b sm">${esc(j.title)} · ${esc(j.company)}</div><div class="xs muted">${v.date} · ${v.src==='ai'?'адаптировал ИИ':'встроенная адаптация'}</div></span><span class="pill ${after>b?'ok':''}">${b} → ${after}</span></button>`}).join(''):`<p class="sm muted">Пока нет версий. Выберите вакансию и нажмите «Создать версию».</p>`}</section>
  </div>
  <div class="sticky col g12">${sel?`<div class="row between"><b>${esc(jobById(sel.job).title)} · ${esc(jobById(sel.job).company)}</b><div class="row g8">${canSave()?`<button class="btn btn-s btn-sm" data-act="verDownload" data-id="${sel.id}">${ic('download')}Скачать</button>`:''}<button class="btn btn-s btn-sm" data-act="verApply" data-id="${sel.id}">Сделать основным</button><button class="x" data-act="verDel" data-id="${sel.id}" aria-label="Удалить версию">${ic('x',14)}</button></div></div>
   ${sel.changes&&sel.changes.length?`<div class="card col g6" style="padding:14px"><span class="label">Что изменилось</span>${sel.changes.map(ch=>`<div class="row g8 sm" style="flex-wrap:nowrap;align-items:flex-start">${ic('check',14)}<span>${esc(ch)}</span></div>`).join('')}</div>`:''}
   <div class="paper-wrap">${cvPaper(sel.cv,{tpl:S.cvTpl||'modern'})}</div>`:`<div class="paper-wrap" style="opacity:.55">${cvPaper(cv(),{tpl:S.cvTpl||'modern'})}</div>`}</div></div>`}

/* recruiter */
function cvRecruiter(){const c=cv(),conf=confAll().map(s=>s.name),bl=allBullets(c);const nums=bl.filter(x=>/\d/.test(x.b)).length;
 const first=c.exp[0],checks=[
  ['Имя и позиция в заголовке',!!(c.name&&c.title),'Рекрутер за первую секунду понимает, кто вы и на что претендуете.'],
  ['Позиция совпадает с вакансией',analyzeCv(c,cvTargetJob()).cats[0][1]>=100,`Под «${cvTargetJob().title}» заголовок стоит назвать так же.`],
  ['Первый пункт опыта с результатом',!!(first&&first.bullets[0]&&/\d|\[/.test(first.bullets[0])),'Глаз цепляется за первую строку места работы — там должен быть результат.'],
  [`Цифры в опыте: ${nums} из ${bl.length}`,bl.length&&nums/bl.length>=.5,'Цифры — самое заметное на странице. Нужны хотя бы в половине пунктов.'],
  ['Проекты компаний на виду',c.projects.some(p=>p.company),'Проект реальной компании для стажёра весит больше, чем учебный опыт.'],
  ['Подтверждённые навыки отмечены',conf.some(n=>kwIn(c.skills,n)),'Отметка ✓ и ссылка на Skill Passport снимают вопрос «а правда ли умеет».'],
  ['Без шаблонных фраз',!CLICHE.some(x=>c.about.toLowerCase().includes(x)),'«Ответственный и коммуникабельный» рекрутер пролистывает не читая.']];
 const ok=checks.filter(x=>x[1]).length;
 return `<div class="split cv-split">
  <div class="stack"><section class="card col g12"><div class="row g16">${ring(Math.round(ok/checks.length*100),100,'big')}<div class="grow"><h2>Что рекрутер увидит за 6 секунд</h2><p class="sm t2">На первичный просмотр резюме рекрутер тратит несколько секунд: имя, позиция, последнее место, цифры и навыки. Цифры на карте — порядок, в котором взгляд проходит по странице.</p></div></div>
   ${checks.map(x=>`<div class="iss"><span class="mk ${x[1]?'ok':'bad'}">${ic(x[1]?'check':'x')}</span><div class="grow"><div class="b sm">${x[0]}</div><div class="xs muted">${x[2]}</div></div></div>`).join('')}
   <div class="row g8"><button class="btn btn-p btn-sm" data-go="resume-build">${ic('wand')}Исправить в конструкторе</button></div></section>
   <section class="card col g8"><h2>Легенда карты</h2><div class="legend"><span><i style="background:#FFD54A"></i>Цифры — цепляют взгляд</span><span><i style="background:var(--accent)"></i>Порядок просмотра</span><span><i style="background:#D8DCE8"></i>Бледное — скорее всего пропустят</span></div></section></div>
  <div class="sticky"><div class="paper-wrap">${cvPaper(c,{tpl:S.cvTpl||'modern',heat:true})}</div></div></div>`}

/* english */
function cvEnglish(){const st=task('cvEn');const loc=enLocal(cv());const en=st.status==='done'&&st.source==='ai'&&st.data&&st.data.name?st.data:loc.cv;
 return `<div class="split cv-split">
  <div class="stack"><section class="card col g12"><h2>Резюме на английском</h2><p class="sm t2">Для международных компаний и англоязычных команд. Перевод сохраняет структуру, цифры и отметки подтверждённых навыков.</p>
   <button class="btn btn-p" data-act="cvEnAI" ${st.status==='loading'?'disabled':''} style="align-self:flex-start">${ic('globe')}${aiOn()?'Перевести с Claude':'Обновить перевод'}</button>${taskUI('cvEn',{loadingText:'Claude переводит резюме…'})}
   ${st.status==='done'?srcNote(st):''}${!(st.status==='done'&&st.source==='ai')&&loc.miss?`<div class="banner" style="background:var(--orange-soft);margin:0"><span class="ic" style="background:var(--orange)">${ic('globe',18)}</span><div class="grow"><div class="b">${loc.miss} ${plural(loc.miss,'фраза','фразы','фраз')} без перевода</div><div class="sm t2">Встроенный словарь знает только стандартные формулировки. ${aiOn()?'Нажмите «Перевести с Claude» для полного перевода.':'Полный перевод доступен в опубликованной версии с ИИ.'}</div></div></div>`:''}
   <div class="row g8">${canSave()?`<button class="btn btn-s btn-sm" data-act="cvEnDownload">${ic('download')}Скачать CV</button>`:''}</div></section>
   <section class="card col g8"><h2>Советы для англоязычного CV</h2><ul class="ul sm">${['Без фото, возраста и семейного положения','Даты в формате Sep 2025 — present','Глаголы в прошедшем времени: Built, Led, Reduced','Уровень английского по шкале CEFR (B2) или сертификат'].map(x=>`<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul></section></div>
  <div class="sticky"><div class="paper-wrap">${cvPaper(en,{tpl:S.cvTpl||'modern',lang:'en'})}</div></div></div>`}

/* hh.ru */
function cvHH(){const c=cv(),st=task('hhParse'),parsed=UI.hhParsed;
 const fields=[['Желаемая должность',c.title],['Ключевые навыки',c.skills],['Обо мне',c.about],['Опыт работы',c.exp.map(e=>`${e.period}\n${e.org}\n${e.role}\n${e.bullets.map(b=>'— '+b).join('\n')}`).join('\n\n')],['Проекты (в «Обо мне» или портфолио)',c.projects.map(p=>`${p.title} — ${p.org}\n${p.bullets.map(b=>'— '+b).join('\n')}`).join('\n\n')],['Образование',c.edu.map(e=>`${e.period} · ${e.org}, ${e.prog}`).join('\n')]];
 return `<div class="grid-2" style="align-items:start">
  <section class="card col g12"><h2>Импорт резюме</h2><p class="sm t2">Вставьте текст резюме с hh.ru или из Word — платформа разложит его по разделам.</p>
   <textarea class="inp" id="hh-in" rows="10" placeholder="Скопируйте резюме целиком и вставьте сюда">${esc(UI.hhText||'')}</textarea>
   <div class="row g8"><button class="btn btn-p" data-act="hhParse" ${st.status==='loading'?'disabled':''}>${ic('upload')}Распознать</button><button class="btn btn-g btn-sm" data-act="hhSample">Вставить пример</button></div>
   ${taskUI('hhParse',{loadingText:'Claude разбирает резюме…'})}
   ${parsed?`<div class="card col g8" style="padding:14px;background:var(--surface-2)"><div class="row between"><b>Распознано</b>${srcNote(st)}</div><div class="sm t2">Позиция: <b>${esc(parsed.title||'—')}</b> · опыт: ${parsed.exp.length} · образование: ${parsed.edu.length} · навыков: ${parsed.skills?parsed.skills.split(',').length:0}</div><div class="row g8"><button class="btn btn-p btn-sm" data-act="hhUse" data-id="replace">Заменить моё резюме</button><button class="btn btn-s btn-sm" data-act="hhUse" data-id="merge">Добавить опыт к моему</button></div></div>`:''}
   <p class="xs muted">Прямая синхронизация с hh.ru работает через их API после регистрации приложения. В MVP — копирование текста.</p></section>
  <section class="card col g12"><h2>Экспорт на hh.ru</h2><p class="sm t2">Поля разложены так же, как в форме hh.ru. Скопируйте каждое в соответствующее поле.</p>
   ${fields.map((f,i)=>`<div class="hh-f"><div class="row between"><span class="b sm">${f[0]}</span><button class="btn btn-g btn-sm" data-act="hhCopy" data-id="${i}">${ic('copy')}Копировать</button></div><pre class="code" style="max-height:130px;overflow:auto;margin:0">${esc(f[1]||'—')}</pre></div>`).join('')}</section></div>`}
const hhFields=()=>{const c=cv();return [c.title,c.skills,c.about,c.exp.map(e=>`${e.period}\n${e.org}\n${e.role}\n${e.bullets.map(b=>'— '+b).join('\n')}`).join('\n\n'),c.projects.map(p=>`${p.title} — ${p.org}\n${p.bullets.map(b=>'— '+b).join('\n')}`).join('\n\n'),c.edu.map(e=>`${e.period} · ${e.org}, ${e.prog}`).join('\n')]};

/* people review */
const HR_REV=[{id:'h1',name:'Ксения Лаврова',pos:'HR BP, 8 лет в IT-найме',ini:'КЛ',color:'#BE185D',price:990,eta:'24 часа'},{id:'h2',name:'Павел Гринёв',pos:'Руководитель программы стажировок',ini:'ПГ',color:'#0E7490',price:1490,eta:'12 часов'}];
const PEER={name:'Студент, 4 курс · цель Data Analyst',about:'Люблю данные и ищу первую работу аналитиком.',bullets:['Делал отчёты в Excel для кафедры','Участвовал в хакатоне по анализу данных','Сделал дашборд в Power BI по продажам магазина']};
function cvPeople(){const hr=S.hrReview,a=analyzeCv(cv(),cvTargetJob());
 return `<div class="grid-2" style="align-items:start">
  <section class="card col g12"><h2>Проверка живым HR</h2><p class="sm t2">Практикующий рекрутер прочитает резюме глазами работодателя и оставит комментарии к каждому блоку.</p>
   ${hr?`<div class="card col g12" style="padding:14px;background:var(--surface-2)"><div class="row g12" style="flex-wrap:nowrap">${av(HR_REV.find(h=>h.id===hr.who).ini,HR_REV.find(h=>h.id===hr.who).color,40)}<div class="grow"><div class="b">${HR_REV.find(h=>h.id===hr.who).name}</div><div class="xs muted">${hr.st==='done'?'Проверка готова':'В работе · ответ в течение '+HR_REV.find(h=>h.id===hr.who).eta}</div></div>${hr.st==='done'?'<span class="pill ok">Готово</span>':'<span class="pill pr">В работе</span>'}</div>
    ${hr.st==='done'?`<div class="col g8">${[['Заголовок и контакты',cvTargetJob().title===cv().title?'Позиция точно совпадает с вакансией — отлично.':'Назовите позицию так же, как в вакансии: я ищу резюме по точному названию.'],['Опыт',a.cats[1][1]>=70?'Результаты в цифрах читаются сразу. Оставьте 3–4 самых сильных пункта на место.':'Сейчас описаны обязанности. Я бы задала на интервью вопрос «и что получилось?» — ответьте на него в резюме.'],['Проекты',cv().projects.some(p=>p.company)?'Проект компании с оценкой — главный аргумент. Поднимите его выше опыта.':'Не хватает проектов с реальными компаниями — это сильнее учебных работ.'],['Общее впечатление',a.score>=75?'Я бы пригласила на интервью.':'Потенциал есть, но за 6 секунд я пока не вижу, чем вы сильнее других стажёров.']].map(r=>`<div class="quote sm"><b>${r[0]}.</b> ${r[1]}</div>`).join('')}</div>`:`<button class="btn btn-s btn-sm" data-act="hrDone" style="align-self:flex-start">Показать пример ответа (демо)</button>`}</div>`
    :HR_REV.map(h=>`<div class="conf-opt" style="cursor:default">${av(h.ini,h.color,40)}<span class="grow"><div class="b">${h.name}</div><div class="sm muted">${h.pos} · ответ за ${h.eta}</div></span><button class="btn btn-p btn-sm" data-act="hrOrder" data-id="${h.id}">${rub(h.price)}</button></div>`).join('')+`<p class="xs muted">Оплата картой после подтверждения. В демо заказ оформляется без оплаты.</p>`}</section>
  <section class="card col g12"><div class="row between"><h2>Взаимное ревью</h2><span class="pill">${ic('star')}+50 XP за отзыв</span></div><p class="sm t2">Проверьте резюме другого студента — и ваше получит отзывы в ответ. Резюме анонимны.</p>
   <div class="card col g8" style="padding:14px;background:var(--surface-2)"><div class="b sm">${PEER.name}</div><div class="sm t2">${PEER.about}</div><ul class="ul sm">${PEER.bullets.map(b=>`<li>${ic('chev',12)}<span>${b}</span></li>`).join('')}</ul></div>
   ${['Есть цифры и результаты','Понятна цель','Навыки подтверждены примерами'].map((q,i)=>`<label class="check sm"><input type="checkbox" id="peer-c${i}">${q}</label>`).join('')}
   <textarea class="inp" id="peer-comment" rows="3" placeholder="Что бы вы улучшили? Один конкретный совет"></textarea>
   <button class="btn btn-p btn-sm" data-act="peerSend" style="align-self:flex-start">${ic('send')}Отправить отзыв</button>
   <div class="divider" style="margin:4px 0"></div>
   <div class="b sm">Отзывы на ваше резюме${S.peerDone?'':' <span class="xs muted">· откроются после первого вашего отзыва</span>'}</div>
   ${S.peerDone?['«Сильный проект с компанией — я бы поставил его первым».','«Добавь в “О себе” одну цифру, сейчас там только цель»'].map(t=>`<div class="quote sm">${t}<div class="xs muted" style="margin-top:4px">Студент, ${t.length%2?'НИУ ВШЭ':'МФТИ'}</div></div>`).join(''):''}</section></div>`}
