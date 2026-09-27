/* ================= mobile layer: tab bar, compact top bar, sheets ================= */
const MQ_M=matchMedia('(max-width:720px)');
const isM=()=>MQ_M.matches;
const TABS={
 student:[['dashboard','home','Главная'],['projects','folder','Проекты'],['internships','cap','Работа'],['messages','mail','Чаты'],['@more','grid','Ещё']],
 employer:[['empdash','grid','Обзор'],['candidates','users','Кандидаты'],['empjobs','briefcase','Вакансии'],['empmessages','msg','Чаты'],['@more','menu','Ещё']],
 mentor:[['mentor','shield','Решения'],['@review','test','Проверка'],['@more','menu','Ещё']],
 uni:[['uni','grid','Обзор'],['unistudents','users','Студенты'],['@more','menu','Ещё']]};
const M_TITLES={dashboard:'Главная',career:'Мой путь',skills:'Навыки',projects:'Проекты',project:'Проект',workspace:'Мой проект',complete:'Результат',internships:'Стажировки',vacancies:'Вакансии',jobs:'Вакансии',job:'Вакансия',portfolio:'Портфолио',profile:'Профиль',try:'Профессии',messages:'Сообщения',resume:'Резюме',interview:'Интервью',applications:'Отклики',empdash:'Обзор',candidates:'Кандидаты',empjobs:'Вакансии',postproject:'Новый проект',pricing:'Тарифы',empmessages:'Сообщения',mentor:'Решения',review:'Проверка',uni:'Обзор',unistudents:'Студенты',metrics:'Метрики'};
const tabKey=(k,role)=>k==='@review'?'review-'+T().main:k;
function tabActive(k,r){const n=curNavKey(r);if(k==='@more')return !TABS[curRole].some(t=>t[0]!=='@more'&&tabActive(t[0],r));
 if(k==='@review')return r.n==='review';if(k==='internships')return ['internships','vacancies','jobs'].includes(n);return n===k}
function tabBadge(k){if(k==='messages'){const n=unreadS();return n?String(n):''}if(k==='empmessages'){const n=unreadE();return n?String(n):''}if(k==='internships'&&mainDone(S.goal))return '5';if(k==='@more'&&curRole==='student'){const n=appsList().filter(a=>a.st==='sent'&&a.d>=7).length;return n?'•':''}return ''}
function renderTabbar(r){let tb=$('#tabbar');if(!tb){tb=document.createElement('nav');tb.id='tabbar';tb.className='tabbar';tb.setAttribute('aria-label','Навигация');document.body.appendChild(tb)}
 tb.innerHTML=TABS[curRole].map(([k,i,l])=>{const on=tabActive(k,r),b=tabBadge(k);return `<button class="tb-i ${on?'on':''}" ${k==='@more'?'data-act="mMore"':`data-go="${tabKey(k)}"`} aria-label="${l}" ${on?'aria-current="page"':''}><span class="tb-ic">${ic(i,22)}${b?`<span class="tb-b ${b==='•'?'dot':''}">${b==='•'?'':b}</span>`:''}</span><span class="tb-l">${l}</span></button>`}).join('')}
const _renderShell=renderShell;
renderShell=function(r){_renderShell(r);renderTabbar(r);
 const tb=$('#topbar');const title=M_TITLES[r.n]||BRAND;
 tb.insertAdjacentHTML('afterbegin',`<div class="m-lead"><button class="icon-btn m-back" data-act="mBack" aria-label="Назад" hidden>${ic('arL')}</button><span class="m-logo" data-go="${HOME[curRole]}">${LOGO}</span><span class="m-title">${esc(title)}</span></div>`);
 const s=$('.top-right',tb);if(s)s.insertAdjacentHTML('afterbegin',`<button class="icon-btn m-search" data-act="mSearch" aria-label="Поиск">${ic('search')}</button>`);
 const sr=$('.search',tb);if(sr)sr.insertAdjacentHTML('beforeend',`<button class="m-cancel linkish" data-act="mSearchX">Отмена</button>`);
 document.body.classList.toggle('has-tabbar',true)};
function mAfter(){
 const bare=$('.app').classList.contains('bare');document.body.classList.toggle('has-tabbar',!bare);const tb=$('#tabbar');if(tb)tb.hidden=bare;
 // back button mirrors the in-page crumb on detail screens
 const cr=$('#view .crumb'),back=$('.m-back');if(back){back.hidden=!cr;if(cr)back.dataset.target=cr.dataset.go||'';$('.m-logo')&&($('.m-logo').hidden=!!cr)}
 // keep the active tab of any tab strip in view
 $$('#view .tabs, #view .seg').forEach(t=>{const on=$('.on',t);if(on&&t.scrollWidth>t.clientWidth)t.scrollLeft=on.offsetLeft-(t.clientWidth-on.offsetWidth)/2});
 // detail screens: primary action pinned above the tab bar
 const old=$('#mCta');if(old)old.remove();document.body.classList.remove('has-cta');
 const n=parse().n;if(!bare&&['project','job','workspace'].includes(n)){const b=$('#view aside .btn-lg');if(b){const w=document.createElement('div');w.id='mCta';w.className='m-cta';w.appendChild(b.cloneNode(true));w.firstChild.removeAttribute('id');document.body.appendChild(w);document.body.classList.add('has-cta')}}}
const _afterRender=afterRender;
afterRender=function(){_afterRender();mAfter()};
MQ_M.addEventListener&&MQ_M.addEventListener('change',()=>{if(!BARE.includes(parse().n))render()});

/* sheets: reuse the open sheet so step-by-step modals don't re-animate */
const _openModal=openModal;
const GRAB='<span class="grab" aria-hidden="true"></span>';
openModal=function(html,cls=''){const m=$('#modalRoot .modal');if(m){m.className='modal '+cls;m.innerHTML=(isM()?GRAB:'')+html;m.scrollTop=0;return}_openModal(html,cls);const nm=$('#modalRoot .modal');if(nm&&isM())nm.insertAdjacentHTML('afterbegin',GRAB)};
function closeSheetAnimated(){const m=$('#modalRoot .modal'),s=$('#modalRoot .scrim');if(!m||!isM()||RM3()){closeModal();return}m.style.transition='transform .22s ease-in';m.style.transform='translateY(100%)';s.style.transition='background .22s';s.style.background='transparent';setTimeout(closeModal,210)}
/* swipe down to close a sheet */
(()=>{let y0=null,m=null,dy=0;
 document.addEventListener('touchstart',e=>{const mm=e.target.closest&&e.target.closest('#modalRoot .modal');if(!mm||!isM()||!S.onboarded&&mm.classList.contains('onb'))return;if(mm.scrollTop>0&&!e.target.closest('.grab,.modal-h'))return;m=mm;y0=e.touches[0].clientY;dy=0;m.style.transition='none'},{passive:true});
 document.addEventListener('touchmove',e=>{if(y0===null)return;dy=Math.max(0,e.touches[0].clientY-y0);m.style.transform=`translateY(${dy}px)`},{passive:true});
 document.addEventListener('touchend',()=>{if(y0===null)return;y0=null;if(dy>110){closeSheetAnimated()}else{m.style.transition='transform .2s';m.style.transform=''}m=null})})();

Object.assign(A,{
 mBack(e){const t=e.dataset.target;if(t){const i=t.indexOf('-');i<0?go(t):go(t.slice(0,i),t.slice(i+1))}else history.back()},
 mSearch(){const tb=$('#topbar');tb.classList.add('searching');const i=$('#gsearch');if(i)setTimeout(()=>i.focus(),30)},
 mSearchX(){const tb=$('#topbar');tb.classList.remove('searching');const i=$('#gsearch');if(i)i.value='';doSearch('')},
 mMore(){const r=parse(),role=curRole,cur=curNavKey(r);const inTabs=TABS[role].map(t=>t[0]);
  const groups=navFor(role,r).map(g=>({l:g.l,i:g.i.filter(x=>!inTabs.includes(x[0])).map(x=>x[0]==='review'?[`review-${T().main}`,x[1],x[2],x[3]]:x)})).filter(g=>g.i.length);
  const who={student:['Алексей Иванов','НИУ ВШЭ · цель '+T().goal],employer:[emp().person,emp().company],mentor:[mentorMe().name,mentorMe().pos],uni:[UNI.person,'НИУ ВШЭ · '+UNI.unit]}[role];
  openModal(`<div class="modal-h"><div class="row g12" style="flex-wrap:nowrap">${role==='student'?`<span class="lvl" style="width:44px;height:44px;font-size:18px">${level().n}</span>`:''}<div><h2>${esc(who[0])}</h2><p class="sm muted">${esc(who[1])}</p></div></div><button class="x" data-act="closeModal" aria-label="Закрыть">${ic('x',16)}</button></div>
  <div class="modal-b col g16">${role==='student'?`<div class="mini" data-go="career"><div class="row between"><span class="label">Готовность · ${T().goal}</span><b>${readiness()}%</b></div><div style="margin-top:10px">${bar(readiness(),'o thin')}</div></div>`:''}
  ${groups.map(g=>`<div><div class="label" style="margin-bottom:8px">${g.l}</div><div class="m-grid">${g.i.map(([k,i,l,c])=>`<button class="m-tile ${cur===k.split('-')[0]?'on':''}" data-go="${k}"><span class="m-ti">${ic(i,20)}${c?`<span class="tb-b">${c}</span>`:''}</span><span>${l}</span></button>`).join('')}</div></div>`).join('')}
  ${role==='employer'?`<div class="m-grid"><button class="m-tile" data-act="newVac" data-type="Стажировка"><span class="m-ti">${ic('cap',20)}</span><span>Новая стажировка</span></button><button class="m-tile" data-act="newVac" data-type="Вакансия"><span class="m-ti">${ic('briefcase',20)}</span><span>Новая вакансия</span></button></div>`:''}
  <div><div class="label" style="margin-bottom:8px">Режим просмотра</div><div class="m-roles">${Object.entries(ROLES).map(([k,[l,i]])=>`<button class="m-role ${role===k?'on':''}" data-act="role" data-role="${k}">${ic(i,18)}<span>${l}</span></button>`).join('')}</div></div>
  <div class="m-list"><button data-act="mTour">${ic('flag')}<span>Сценарий демо</span>${ic('arR',16)}</button><button data-go="metrics">${ic('trend')}<span>Метрики платформы</span>${ic('arR',16)}</button><button data-go="welcome">${ic('home')}<span>Главная страница сайта</span>${ic('arR',16)}</button><button data-act="reset">${ic('refresh')}<span>Сбросить демо-данные</span></button><button data-act="logout" class="m-danger">${ic('out')}<span>Выйти</span></button></div></div>`,'sheet-more')},
 mTour(){openModal(tourHtml().replace('class="pop tour"','class="tour m-tour"'),'sheet-tour')},
});
/* close sheets with the slide-down animation */
const _closeModalAct=A.closeModal;A.closeModal=function(){closeSheetAnimated()};
const _scrimAct=A.closeModalScrim;A.closeModalScrim=function(e,ev){if(ev.target===e&&S.onboarded)closeSheetAnimated()};

/* landing: sticky CTA on phones once the hero is out of view */
const _landingInit=landingInit;
landingInit=function(){_landingInit();const lp=$('.lp3');if(!lp)return;
 let bar=$('#lpSticky');if(!bar){lp.insertAdjacentHTML('beforeend',`<div class="lp-sticky" id="lpSticky"><button class="btn btn-p btn-lg" data-go="auth-student">Начать бесплатно</button><button class="btn btn-s btn-lg" data-act="demoLogin" aria-label="Открыть демо">Демо</button></div>`);bar=$('#lpSticky')}
 const hero=$('#h3'),fin=$('.fin3');const f=()=>{if(!isM()){bar.classList.remove('on');return}const hb=hero?hero.getBoundingClientRect().bottom:0,ft=fin?fin.getBoundingClientRect().top:1e9;bar.classList.toggle('on',hb<60&&ft>innerHeight*.9)};
 window.addEventListener('scroll',f,{passive:true});L3.fns.push(['scroll',f]);f()};
