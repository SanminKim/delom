/* ================= helpers ================= */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const plural=(n,a,b,c)=>{const m10=n%10,m100=n%100;return m10===1&&m100!==11?a:(m10>=2&&m10<=4&&(m100<10||m100>=20)?b:c)};
const fmt=n=>Math.round(n).toLocaleString('ru-RU');
const rub=n=>fmt(n)+' ₽';
const dec=n=>String(n).replace('.',',');
const todayStr=()=>{try{return new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}).replace(/\s*г\.?$/,'')}catch(e){return 'сегодня'}};
const tnow=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const logo=(c,cls='')=>{const x=COMP[c]||{bg:'#8A90B0',t:(c||'?')[0]};return `<span class="logo ${cls}" style="background:${x.bg};color:${x.fg||'#fff'}">${x.t}</span>`};
const av=(ini,color,size)=>`<span class="avatar" style="background:${color};${size?`width:${size}px;height:${size}px;font-size:${Math.round(size*.34)}px`:''}">${ini}</span>`;
const initials=n=>n.split(' ').map(x=>x[0]).join('');
const mcol=p=>p>=85?'var(--green)':p>=70?'var(--accent)':'var(--orange)';
const ring=(p,size=52,cls='')=>`<div class="ring ${cls}" style="--p:${p};--c:${mcol(p)};width:${size}px;height:${size}px"><span ${cls.includes('big')?`style="font-size:${Math.round(size*.24)}px"`:''}>${p}%</span></div>`;
const bar=(p,cls='')=>`<div class="bar ${cls}"><i data-w="${p}" style="width:0"></i></div>`;
const select=(id,label,opts,val)=>`<select class="sel" id="${id}" aria-label="${label}"><option value="">${label}</option>${opts.map(o=>`<option ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
const btnAttr=spec=>{const [k,a,b]=spec.split(':');return k==='go'?`data-go="${a}"`:`data-act="${a}"${b?` data-id="${b}"`:''}`};

/* ================= state ================= */
const KEY='delom-demo-v2';
const fresh=()=>({authed:false,onboarded:false,resume:false,goal:'pm',pstat:{},ws:{},scores:{},sel:{},portfolio:{},inv:{},tests:{},courses:{},mentorReq:{},teams:{},chats:{},applied:{},projApplied:{},visited:{},flags:{},notifSeen:0,empInvited:{},published:[],extraVac:[],badgesSeen:null,acted:false,empCo:null,lastRole:'student',cv:null,cvTpl:'modern',cvTarget:null,cvBest:0,cvVersions:[],stories:[],interviews:[],apps:{},appsExtra:[],offers:null,offW:null,hrReview:null,peerDone:0,pitch:null,pitchVideo:null,recs:{},reviews:{},mentorConf:{},courseDone:{},waitlist:{},tier:null,salesReq:[],consOk:{},uniCourses:[],hrAt:0,profile:null,vis:null});
let S=fresh();
try{const raw=localStorage.getItem(KEY);if(raw)S=Object.assign(fresh(),JSON.parse(raw))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const UI={cvLeft:'tips',jobs:{prof:'',company:'',format:'',level:'',skill:'',paid:false,fit:false},proj:{q:'',prof:'',skill:'',diff:'',dur:'',format:'',company:''},skTab:'all',cand:{skills:[],prof:'',min:0},uni:{q:'',prog:''},mentorTab:'queue',ai:false,aiLog:[],pop:null,drawer:false,test:null,onb:null,mb:null,team:null,rv:{},calc:{hires:10,cost:85000,weeks:7,fail:30},typing:{}};

/* ================= computed ================= */
const T=()=>TRACKS[S.goal]||TRACKS.pm;
const PUB_CACHE={};
const allProjects=()=>[...S.published.map((p,i)=>{const k=p.pid||'n'+i;return PUB_CACHE[k]&&PUB_CACHE[k].title===p.title?PUB_CACHE[k]:(PUB_CACHE[k]=enrichProject({...p,id:k,company:p.company||emp().company,ind:p.ind||emp().ind,emp:p.emp||emp().id,isNew:1,people:0,durK:'2',reward:p.skills.length,short:p.title}))}),...PROJECTS];
const P=id=>allProjects().find(p=>p.id===id);
const pst=id=>S.pstat[id]||'none';
const mainDone=t=>!!TRACKS[t]&&pst(TRACKS[t].main)==='done';
const trackOfProj=pid=>Object.values(TRACKS).find(t=>t.main===pid);
const confirmsOf=pid=>S.sel[pid]||(P(pid)&&P(pid).confirms)||[];
function empOfProj(pid){const p=P(pid)||{};if(EMPLOYERS[p.emp])return EMPLOYERS[p.emp];const c=CONTACTS[p.company]||p.contact||['Команда найма','рекрутер'];return {id:'co-'+p.company,company:p.company,person:c[0],first:c[0].split(' ')[0],pos:c[1],ini:initials(c[0]),color:(COMP[p.company]||{}).bg||'#475569'}}
const emp=()=>EMPLOYERS[S.empCo||(S.goal==='da'?'tb':'su')];
const mentorMe=()=>S.goal==='da'?MENTORS[1]:MENTORS[0];
function sk(id){
 const b=SK[id];if(!b)return null;
 const o={id,name:b.name,st:b.st,pct:b.pct||0,basis:b.basis,src:b.src,date:b.date,baseOk:b.st==='ok'};
 const pid=Object.keys(S.pstat).find(k=>S.pstat[k]==='done'&&confirmsOf(k).includes(id));
 if(pid){const p=P(pid);Object.assign(o,{st:'ok',basis:`Проект «${p.short}»`,src:`${p.company} · оценка ${S.scores[pid]||p.score} из 5`,date:S.flags['d_'+pid]||todayStr(),fresh:!o.baseOk,via:'project',pid})}
 else if(S.mentorConf&&S.mentorConf[id]&&S.mentorConf[id].passed&&o.st!=='ok'){const m=S.mentorConf[id];Object.assign(o,{st:'ok',basis:`Оценка ментора · ${m.stars} из 5`,src:m.by,date:m.date,fresh:1,via:'mentor'})}
 else if(S.courseDone[id]&&o.st!=='ok'){const c=S.courseDone[id];Object.assign(o,{st:'ok',basis:`Курс «${c.title}» · итоговое задание ${c.score}`,src:c.provider,date:c.date,fresh:1,via:'course'})}
 else if(S.tests[id]&&S.tests[id].passed&&o.st!=='ok')Object.assign(o,{st:'ok',basis:`Тест ${BRAND} · ${S.tests[id].score} из 5`,src:'Проверка знаний с таймером',date:S.tests[id].date,fresh:1,via:'test'});
 if(o.st!=='ok'){if(S.courses&&S.courses[id])o.plan='course';if(S.mentorReq[id]&&!(S.mentorConf[id]))o.plan='mentor'}
 return o}
const skIds=Object.keys(SK);
const skAll=()=>skIds.map(sk);
const skByName=n=>{const id=skIds.find(k=>SK[k].name===n);return id?sk(id):null};
const has=s=>s.st==='ok'||s.st==='self'||(s.st==='progress'&&s.pct>=50);
function readinessOf(t){const tr=TRACKS[t]||TRACKS.pm;const n=tr.req.filter(id=>{const s=sk(id);return s.st==='ok'&&!s.baseOk}).length;return Math.min(98,tr.base+Math.round(n*2.75)+(S.portfolio[tr.main]?3:0))}
const readiness=()=>readinessOf(S.goal);
const reqSk=()=>T().req.map(sk);
const haveCount=()=>reqSk().filter(has).length;
const confReq=()=>reqSk().filter(s=>s.st==='ok').length;
const confAll=()=>skAll().filter(s=>s.st==='ok');
const doneProjects=()=>Object.keys(S.pstat).filter(k=>S.pstat[k]==='done');
const projCount=()=>3+doneProjects().length;
const trackOfProf=p=>p==='Product Manager'?'pm':p==='Data Analyst'?'da':null;
const allJobs=()=>[...JOBS,...S.extraVac.map((v,i)=>({id:'x'+i,company:emp().company,title:v.title,type:v.type==='Вакансия'?'job':'intern',prof:v.prof,track:trackOfProf(v.prof),city:v.city||'Москва',format:v.format,paid:v.paid?1:0,salary:v.salary||'',level:v.type==='Вакансия'?'Junior':'Стажёр',skills:v.skills,m:[72,80],min:0,team:'Новая позиция',isNew:1}))];
const jobById=id=>allJobs().find(j=>j.id===id);
const unlocked=j=>!j.min||readinessOf(j.track||S.goal)>=j.min;
function matchOf(j){if(j.track&&mainDone(j.track))return j.m[1];const n=j.skills.filter(x=>{const s=skByName(x);return s&&s.fresh}).length;return Math.min(j.m[1],j.m[0]+3*n)}
const isFit=j=>j.track===S.goal;
const fitCount=()=>allJobs().filter(j=>isFit(j)&&unlocked(j)).length;
const newlyUnlocked=()=>allJobs().filter(j=>isFit(j)&&j.min>0&&unlocked(j));
const stLabel=s=>s.st==='ok'?'Подтверждено':s.st==='progress'?'В процессе':'Не подтверждено';
const stPill=s=>s.st==='ok'?`<span class="pill ok">${ic('shield')}Подтверждено</span>`:s.st==='progress'?`<span class="pill pr">В процессе · ${s.pct}%</span>`:`<span class="pill no">Не подтверждено</span>`;
const planPill=s=>s.plan==='course'?`<span class="pill ac">${ic('book')}Курс в плане</span>`:s.plan==='mentor'?`<span class="pill ac">${ic('users')}Встреча с ментором</span>`:'';
const wsOf=pid=>{const w=S.ws[pid]||(S.ws[pid]={tasks:[0,0,0,0],file:null});if(!w.attempt)w.attempt=1;if(w.summary==null)w.summary='';return w};

/* gamification */
const LEVELS=[[0,'Новичок'],[500,'Исследователь'],[1000,'Практик'],[2000,'Профи'],[3500,'Эксперт'],[6000,'Мастер']];
function xp(){const fr=skAll().filter(s=>s.fresh).length;const tests=Object.values(S.tests).filter(t=>t.passed).length;return 1240+150*fr+400*doneProjects().length+100*tests+50*Object.keys(S.portfolio).length+200*Object.values(S.inv).filter(i=>i.st==='accepted').length+50*Object.keys(S.teams).length+(S.resume?60:0)+50*(S.peerDone||0)+80*(S.interviews||[]).length+30*(S.stories||[]).length+((S.cvBest||0)>=80?100:0)}
function level(){const x=xp();let i=0;LEVELS.forEach((l,k)=>{if(x>=l[0])i=k});const nx=LEVELS[i+1];return {n:i+1,name:LEVELS[i][1],xp:x,next:nx?nx[0]:x,nextName:nx?nx[1]:'',pct:nx?Math.round((x-LEVELS[i][0])/(nx[0]-LEVELS[i][0])*100):100}}
const streak=()=>6+(S.acted?1:0);
const BADGES=[
 {id:'case',n:'Кейс-чемпион',d:'Призёр кейс-чемпионата',ic:'trophy',ok:()=>true},
 {id:'goal',n:'Первый шаг',d:'Выбрать карьерную цель',ic:'target',ok:()=>S.onboarded},
 {id:'resume',n:'Всё про меня',d:'Загрузить резюме',ic:'file',ok:()=>S.resume},
 {id:'test',n:'Доказано',d:'Подтвердить навык тестом',ic:'test',ok:()=>Object.values(S.tests).some(t=>t.passed)},
 {id:'project',n:'Практик',d:'Завершить проект компании',ic:'folder',ok:()=>doneProjects().length>0},
 {id:'analyst',n:'Аналитик',d:'Подтвердить SQL и Product Analytics',ic:'chart',ok:()=>sk('sql').st==='ok'&&sk('pa').st==='ok'},
 {id:'team',n:'Командный игрок',d:'Вступить в команду проекта',ic:'users',ok:()=>Object.keys(S.teams).length>0},
 {id:'mentor',n:'С наставником',d:'Записаться к ментору',ic:'msg',ok:()=>Object.keys(S.mentorReq).length>0},
 {id:'invite',n:'Приглашён',d:'Принять приглашение на интервью',ic:'mail',ok:()=>Object.values(S.inv).some(i=>i.st==='accepted')},
 {id:'cv',n:'Резюме на 80+',d:'Довести резюме до 80 баллов',ic:'pen',ok:()=>(S.cvBest||0)>=80},
 {id:'iv',n:'Разминка',d:'Пройти тренировку интервью',ic:'msg',ok:()=>(S.interviews||[]).length>0},
 {id:'peer',n:'Взаимопомощь',d:'Сделать ревью чужого резюме',ic:'users',ok:()=>(S.peerDone||0)>0},
 {id:'streak',n:'Серия 7 дней',d:'Заниматься 7 дней подряд',ic:'flame',ok:()=>streak()>=7},
];
function checkBadges(){const earned=BADGES.filter(b=>b.ok()).map(b=>b.id);if(S.badgesSeen===null){S.badgesSeen=earned;save();return}
 earned.filter(id=>!S.badgesSeen.includes(id)).forEach((id,i)=>{const b=BADGES.find(x=>x.id===id);setTimeout(()=>toast(`Новое достижение: «${b.n}»`,'trophy'),400+i*500)});S.badgesSeen=earned;save()}

/* ================= chats ================= */
function ensureInviteChat(pid){const id='inv-'+pid;if(S.chats[id])return;const p=P(pid),e=empOfProj(pid);
 S.chats[id]={id,kind:'inv',co:p.company,title:p.company,sub:`${e.person} · ${e.pos}`,pid,unreadS:3,unreadE:0,msgs:[
  {f:'them',t:`Здравствуйте, Алексей! Я ${e.person}, ${e.pos} в ${p.company}. Мы изучили ваше решение по проекту «${p.short}». ${p.inviteHook}`,tm:tnow()},
  {f:'card',pid},
  {f:'them',t:'Выберите, пожалуйста, удобное время. Интервью займёт 45 минут, онлайн.',tm:tnow()}]}}
const TEAMMATES=[['Екатерина Волкова','ЕВ','#C2410C'],['Никита Орлов','НО','#1D4ED8'],['Полина Смирнова','ПС','#BE185D'],['Тимур Ахметов','ТА','#0E7490'],['Мария Кузнецова','МК','#DB2777'],['Илья Морозов','ИМ','#7C3AED']];
function ensureTeamChat(pid){const id='team-'+pid;if(S.chats[id])return;const p=P(pid),t=S.teams[pid];
 S.chats[id]={id,kind:'team',co:p.company,title:`Команда «${t.name}»`,sub:`${p.short} · ${t.members.length+1} ${plural(t.members.length+1,'участник','участника','участников')}`,pid,unreadS:2,unreadE:0,msgs:[
  {f:'sys',t:`Алексей присоединился к команде как ${t.role}`},
  ...(t.members.length?[{f:'them',who:t.members[0][0],t:`Привет, Алексей! Рады, что ты с нами. Предлагаю созвониться в понедельник в 19:00 и распределить задачи по брифу ${p.company}.`,tm:tnow()},
  {f:'them',who:(t.members[1]||t.members[0])[0],t:'Я уже разобрала бриф и выписала вопросы к компании. Скину в документ команды до вечера.',tm:tnow()}]:[{f:'sys',t:'Команда создана. Пригласите участников по ссылке из карточки команды — их сообщения появятся здесь.'}])]};if(!t.members.length)S.chats[id].unreadS=0}
function chatReply(th,text){const t=text.toLowerCase();
 if(th.kind==='team'){const t=S.teams[th.pid];if(!t||!t.members.length)return null}
 if(th.kind==='team')return /созвон|понедельник|время|ок|давай/.test(t)?'Отлично, тогда в понедельник в 19:00. Ссылку на звонок кину сюда.':'Принято! Добавила это в наш план в документе команды.';
 if(/зарплат|оплат|деньг|сколько/.test(t)){const j=jobById((P(th.pid)||{}).inviteJob);return j&&j.salary?`По позиции «${j.title}» оплата ${j.salary}${j.type==='intern'?' в месяц, график обсудим — можно совмещать с учёбой':''}.`:'Условия обсудим на интервью.'}
 if(/формат|как пройд|как проход|этап/.test(t))return 'Интервью в два этапа: 15 минут о вас и 30 минут — разбор вашего решения по проекту. Тестовых заданий больше не будет.';
 if(/подготов|что взять|нужно ли/.test(t))return 'Подготовьте 5-минутный рассказ о решении и пару вопросов к команде. Остальное мы уже видели в проекте.';
 if(/спасибо|благодар/.test(t))return 'Вам спасибо! До встречи.';
 if(/перенес|другое время|не могу/.test(t))return 'Без проблем, выберите другое время в карточке приглашения выше.';
 return 'Спасибо, передам команде. Если будут вопросы — пишите сюда.'}
const unreadS=()=>Object.values(S.chats).reduce((a,c)=>a+(c.unreadS||0),0);
const unreadE=()=>Object.values(S.chats).filter(c=>c.co===emp().company&&c.kind==='inv').reduce((a,c)=>a+(c.unreadE||0),0);

/* ================= charts ================= */
function tickN(mx){for(const k of [4,5]){const st=mx/k,p=10**Math.floor(Math.log10(st)),m=Math.round(st/p*1000)/1000;if([1,2,2.5,5].includes(m))return k}return 4}
function niceMax(v){const p=10**Math.floor(Math.log10(v));const m=v/p;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p}
function barChart(labels,values,{h=220,fmtv=v=>fmt(v),hl=-1}={}){
 const W=640,L=44,R=8,Tp=18,B=26,iw=W-L-R,ih=h-Tp-B,mx=niceMax(Math.max(...values)),n=values.length,bw=iw/n*.62;
 const K=tickN(mx);let g='';for(let i=0;i<=K;i++){const v=mx*i/K,y=Tp+ih-ih*i/K;g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-8}" y="${y+4}" text-anchor="end">${fmtv(v)}</text>`}
 const bars=values.map((v,i)=>{const x=L+iw/n*i+(iw/n-bw)/2,bh=ih*v/mx,y=Tp+ih-bh;return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" fill="${i===hl?'var(--green)':'var(--accent)'}" opacity="${i===hl?1:.85}"><title>${labels[i]}: ${fmtv(v)}</title></rect>${i===hl?`<text class="vl" x="${(x+bw/2).toFixed(1)}" y="${(y-6).toFixed(1)}" text-anchor="middle">${fmtv(v)}</text>`:''}<text x="${(x+bw/2).toFixed(1)}" y="${h-8}" text-anchor="middle">${labels[i]}</text>`}).join('');
 return `<div class="chart"><svg viewBox="0 0 ${W} ${h}" role="img">${g}${bars}</svg></div>`}
function lineChart(labels,values,{h=230,fmtv=v=>v,unit=''}={}){
 const W=640,L=44,R=14,Tp=22,B=26,iw=W-L-R,ih=h-Tp-B,mx=niceMax(Math.max(...values)),n=values.length;
 const X=i=>L+iw*i/(n-1),Y=v=>Tp+ih-ih*v/mx;
 const K=tickN(mx);let g='';for(let i=0;i<=K;i++){const v=mx*i/K,y=Y(v);g+=`<line class="gl" x1="${L}" x2="${W-R}" y1="${y}" y2="${y}"/><text x="${L-8}" y="${y+4}" text-anchor="end">${fmtv(v)}</text>`}
 const pts=values.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
 const area=`M${X(0)},${Tp+ih} L${pts.split(' ').join(' L')} L${X(n-1)},${Tp+ih} Z`;
 const lab=labels.map((l,i)=>`<text x="${X(i).toFixed(1)}" y="${h-8}" text-anchor="middle">${l}</text>`).join('');
 const lx=X(n-1),ly=Y(values[n-1]);
 return `<div class="chart"><svg viewBox="0 0 ${W} ${h}" role="img">${g}<path d="${area}" fill="var(--accent)" opacity=".1"/><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${values.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${i===n-1?5:2.5}" fill="${i===n-1?'var(--accent)':'var(--surface)'}" stroke="var(--accent)" stroke-width="2"><title>${labels[i]}: ${fmtv(v)}${unit}</title></circle>`).join('')}<text class="vl" x="${lx-8}" y="${ly-10}" text-anchor="end">${fmtv(values[n-1])}${unit}</text>${lab}</svg></div>`}
const hbars=(rows,maxv)=>{const mx=maxv||Math.max(...rows.map(r=>r[1]));return rows.map(r=>`<div class="hbar"><span class="t2">${esc(r[0])}</span><div class="bar" style="height:10px"><i data-w="${Math.max(1.5,r[1]/mx*100)}" style="width:0;${r[2]?`background:${r[2]}`:''}"></i></div><b style="text-align:right">${r[3]||fmt(r[1])}</b></div>`).join('')};

/* ================= router ================= */
const BARE=['welcome','auth'];
const ROLE_OF={dashboard:'student',career:'student',projects:'student',project:'student',workspace:'student',complete:'student',internships:'student',vacancies:'student',jobs:'student',job:'student',skills:'student',portfolio:'student',profile:'student',try:'student',messages:'student',resume:'student',interview:'student',applications:'student',
 empdash:'employer',candidates:'employer',empjobs:'employer',postproject:'employer',pricing:'employer',empmessages:'employer',mentor:'mentor',review:'mentor',uni:'uni',unistudents:'uni'};
const HOME={student:'dashboard',employer:'empdash',mentor:'mentor',uni:'uni'};
function parse(){const h=decodeURIComponent(location.hash.slice(1));const i=h.indexOf('-');return i<0?{n:h||'welcome',id:''}:{n:h.slice(0,i),id:h.slice(i+1)}}
function go(n,id){const h=n+(id?'-'+id:'');closePop();UI.drawer=false;if(location.hash.slice(1)===h)render(true);else location.hash=h}
window.addEventListener('hashchange',()=>{const m=$('#modalRoot');if(m)m.innerHTML='';const run=()=>render(true);if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches){try{document.startViewTransition(run)}catch(e){run()}}else run()});
let curRole='student';
function render(scroll){
 let r=parse();
 if(!VIEWS[r.n])r={n:S.authed?'dashboard':'welcome',id:''};
 if(!S.authed&&!BARE.includes(r.n)&&r.n!=='metrics'){history.replaceState(null,'','#welcome');r={n:'welcome',id:''}}
 curRole=ROLE_OF[r.n]||S.lastRole||'student';S.lastRole=curRole;
 S.visited[r.n]=1;
 if(mainDone(S.goal)&&['internships','vacancies','jobs'].includes(r.n))S.flags.jobsAfter=1;
 if(mainDone(S.goal)&&['empdash','candidates'].includes(r.n))S.flags.empSaw=1;
 save();
 const bare=BARE.includes(r.n)||(r.n==='metrics'&&!S.authed);
 $('.app').classList.toggle('bare',bare);
 if(!bare)renderShell(r);
 $('#view').innerHTML=VIEWS[r.n](r.id);
 animateBars();afterRender();
 if(scroll)window.scrollTo(0,0);
 if(S.authed&&curRole==='student'&&!bare&&!S.onboarded&&!$('#modalRoot').innerHTML)openOnboarding();
 if(S.authed)checkBadges();
}
function animateBars(){requestAnimationFrame(()=>requestAnimationFrame(()=>$$('[data-w]').forEach(el=>{el.style.width=el.dataset.w+'%'})))}

/* ================= shell ================= */
function navFor(role,r){
 const nMsg=unreadS(),nE=unreadE();
 if(role==='employer')return [{l:'Кабинет компании',i:[['empdash','grid','Обзор'],['candidates','users','Кандидаты'],['empjobs','briefcase','Вакансии и проекты'],['postproject','plus','Разместить проект'],['empmessages','msg','Сообщения',nE?String(nE):''],['pricing','coin','Тарифы и экономия']]}];
 if(role==='mentor')return [{l:'Кабинет ментора',i:[['mentor','shield','Проверка решений',pst(T().main)==='review'?'1':''],['review','test','Текущая проверка']]}];
 if(role==='uni')return [{l:'Кабинет вуза',i:[['uni','grid','Обзор'],['unistudents','users','Студенты']]}];
 const nApp=appsList().filter(a=>a.st==='sent'&&a.d>=7).length;
 return [{l:'Карьера',i:[['dashboard','home','Главная'],['career','route','Мой путь'],['skills','award','Навыки'],['projects','folder','Проекты'],['portfolio','file','Портфолио']]},
  {l:'Трудоустройство',i:[['internships','cap','Стажировки',mainDone(S.goal)?'+5':''],['vacancies','briefcase','Вакансии'],['applications','layers','Отклики',nApp?String(nApp):''],['resume','pen','Резюме'],['interview','msg','Интервью'],['messages','mail','Сообщения',nMsg?String(nMsg):'']]},
  {l:'Ещё',i:[['try','compass','Попробовать профессию'],['profile','user','Профиль']]}];
}
const ROLES={student:['Студент','user'],employer:['Работодатель','building'],mentor:['Ментор','shield'],uni:['Вуз','cap']};
function curNavKey(r){if(r.n==='job')return (jobById(r.id)||{}).type==='job'?'vacancies':'internships';if(['project','workspace','complete'].includes(r.n))return 'projects';if(r.n==='jobs')return 'internships';if(r.n==='review'&&!r.id)return 'review';return r.n}
function renderShell(r){
 const role=curRole,cur=curNavKey(r),e=emp(),mm=mentorMe();
 const groups=navFor(role,r).map(g=>({l:g.l,i:g.i.map(x=>x[0]==='review'?[`review-${T().main}`,x[1],x[2],x[3]]:x)}));
 $('#sidebar').className='sidebar'+(UI.drawer?' open':'');
 $('#scrim').className='drawer-scrim'+(UI.drawer?' open':'');
 const foot={student:`<div class="mini" data-go="career"><div class="row between"><span class="label">Готовность</span><span class="b">${readiness()}%</span></div><div style="margin:10px 0 8px">${bar(readiness(),'o thin')}</div><div class="xs muted">Цель: ${T().goal}</div></div>`,
  employer:`<div class="mini" data-act="switchCo"><div class="row g12" style="flex-wrap:nowrap">${logo(e.company,'sm')}<div class="grow"><div class="b">${e.company}</div><div class="xs muted">${ic('swap',11)} Сменить компанию</div></div></div></div>`,
  mentor:`<div class="mini"><div class="row g12" style="flex-wrap:nowrap">${av(mm.ini,mm.color,32)}<div><div class="b">${mm.name}</div><div class="xs muted">${mm.pos}</div></div></div></div>`,
  uni:`<div class="mini"><div class="row g12" style="flex-wrap:nowrap">${logo('НИУ ВШЭ','sm')}<div><div class="b">НИУ ВШЭ</div><div class="xs muted">Центр карьеры · партнёр</div></div></div></div>`}[role];
 $('#sidebar').innerHTML=`
  <div class="brand" data-go="${HOME[role]}">${LOGO}<span>${BRAND}</span></div>
  ${groups.map(g=>`<div class="nav-label">${g.l}</div><nav class="nav">${g.i.map(([k,i,l,c])=>`<button class="${cur===k.split('-')[0]||cur===k?'on':''}" data-go="${k}">${ic(i)}<span>${l}</span>${c?`<span class="cnt" ${/^\d+$/.test(c)?'style="background:var(--accent);color:var(--on-accent)"':''}>${c}</span>`:''}</button>`).join('')}</nav>`).join('')}
  ${role==='employer'?`<div class="nav-label">Быстро создать</div><nav class="nav"><button data-act="newVac" data-type="Стажировка">${ic('cap')}<span>Стажировку</span></button><button data-act="newVac" data-type="Вакансия">${ic('briefcase')}<span>Вакансию</span></button></nav>`:''}
  <div class="nav-label">Для инвесторов</div><nav class="nav"><button class="${cur==='metrics'?'on':''}" data-go="metrics">${ic('trend')}<span>Метрики платформы</span></button></nav>
  <div class="side-foot">${foot}</div>`;
 const un=Math.max(0,notifs().length-S.notifSeen);
 const who={student:['АИ','linear-gradient(135deg,#3B47E0,#7B5CF0)'],employer:[e.ini,e.color],mentor:[mm.ini,mm.color],uni:[UNI.ini,'#1F3C88']}[role];
 $('#topbar').innerHTML=`
  <button class="icon-btn burger" data-act="drawer" aria-label="Меню">${ic('menu')}</button>
  <div class="search">${ic('search')}<input id="gsearch" placeholder="Поиск проектов, стажировок, навыков, людей" autocomplete="off" aria-label="Поиск"><div id="searchPop"></div></div>
  <div class="top-right">
   <div style="position:relative"><button class="role-btn" data-act="roles" aria-label="Сменить роль">${ic(ROLES[role][1],16)}<span class="rl">Режим:</span><span class="rt">${ROLES[role][0]}</span>${ic('chev',14)}</button><div id="rolesPop"></div></div>
   <div style="position:relative" class="hide-m"><button class="btn btn-s btn-sm" data-act="tour" style="height:40px">${ic('flag')}Сценарий демо</button><div id="tourPop"></div></div>
   <div style="position:relative"><button class="icon-btn" data-act="notif" aria-label="Уведомления">${ic('bell')}${un&&role==='student'?`<span class="badge">${un}</span>`:''}</button><div id="notifPop"></div></div>
   <div style="position:relative"><button class="av-btn" data-act="me" aria-label="Аккаунт"><span class="avatar" style="background:${who[1]}">${who[0]}</span></button><div id="mePop"></div></div>
  </div>`;
 $('#fab').innerHTML=`${ic('spark',20)}<span>AI-помощник</span>`;
 $('#fab').hidden=UI.ai||role!=='student'||r.n==='messages';
}

/* ================= popovers ================= */
const POPS=['notif','me','tour','search','roles'];
function closePop(){POPS.forEach(s=>{const e=$('#'+s+'Pop');if(e)e.innerHTML=''});UI.pop=null}
function togglePop(name,html){const el=$('#'+name+'Pop');const was=UI.pop===name;closePop();if(was||!el)return;UI.pop=name;el.innerHTML=html}
function notifs(){
 const a=[],t=T(),m=t.main,p=P(m),inv=S.inv[m];
 Object.values(S.chats).filter(c=>c.unreadS).forEach(c=>a.push({t:`Новое сообщение: ${c.title}`,s:c.sub,time:'только что',go:'messages-'+c.id,ic:'msg',hot:1}));
 if(inv&&inv.st==='accepted')a.push({t:'Интервью назначено',s:`${p.company} · ${inv.slot}`,time:'только что',go:'messages-inv-'+m,ic:'cal'});
 if(pst(m)==='done'){
  a.push({t:`${p.company} приглашает вас на интервью`,s:'Позиция '+p.invitePos,time:'5 мин назад',go:'complete-'+m,ic:'mail',hot:!inv||inv.st!=='accepted'});
  a.push({t:`Подтверждено ${confirmsOf(m).length} ${plural(confirmsOf(m).length,'навык','навыка','навыков')}`,s:confirmsOf(m).map(id=>SK[id].name).join(', '),time:'5 мин назад',go:'skills',ic:'shield'});
  a.push({t:'Открыто 5 новых стажировок',s:'Готовность выросла до '+readiness()+'%',time:'5 мин назад',go:'internships',ic:'cap'});
 }
 if(pst(m)==='review')a.push({t:'Решение отправлено на проверку',s:p.short,time:'только что',go:'workspace-'+m,ic:'send'});
 a.push({t:'Новый проект от Ozon',s:'A/B-тест новой карточки товара',time:'2 ч назад',go:'project-p6',ic:'folder'});
 a.push({t:'Ментор оставил отзыв',s:'Customer Development подтверждён',time:'вчера',go:'skills',ic:'star'});
 const j=jobById(t.recJobs[0]);a.push({t:`${j.company}: ${j.title}`,s:'Совпадение с профилем '+matchOf(j)+'%',time:'2 дня назад',go:'job-'+j.id,ic:'briefcase'});
 return a}
function notifHtml(){const a=notifs();S.notifSeen=a.length;save();return `<div class="pop" style="width:360px;max-width:88vw"><div class="pop-h"><b>Уведомления</b><span class="xs muted">${a.length}</span></div>${a.map(n=>`<button class="pop-item" data-go="${n.go}"><span class="${n.hot?'':'muted'}" style="${n.hot?'color:var(--accent-ink)':''}">${ic(n.ic)}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(n.t)}</div><div class="sm muted">${esc(n.s)} · ${n.time}</div></span>${n.hot?'<span class="dot"></span>':''}</button>`).join('')}</div>`}
function meHtml(){const role=curRole;const head={student:['Алексей Иванов','НИУ ВШЭ · 3 курс'],employer:[emp().person,emp().company],mentor:[mentorMe().name,mentorMe().pos],uni:[UNI.person,'НИУ ВШЭ · '+UNI.unit]}[role];
 return `<div class="pop" style="min-width:260px"><div class="pop-h"><div><div class="b">${head[0]}</div><div class="xs muted">${head[1]}</div></div></div>
 ${role==='student'?`<button class="pop-item" data-go="profile">${ic('user')}<span>Профиль и достижения</span></button><button class="pop-item" data-go="portfolio">${ic('file')}<span>Портфолио</span></button>`:''}
 <button class="pop-item" data-go="welcome">${ic('home')}<span>Главная страница сайта</span></button>
 <button class="pop-item" data-act="reset">${ic('refresh')}<span>Сбросить демо-данные</span></button>
 <button class="pop-item" data-act="logout">${ic('out')}<span>Выйти</span></button></div>`}
function rolesHtml(){const e=emp(),mm=mentorMe();const it=[['student','Студент','Алексей Иванов · цель '+T().goal],['employer','Работодатель',e.company+' · '+e.person],['mentor','Ментор',mm.name+' · '+mm.pos],['uni','Вуз','НИУ ВШЭ · '+UNI.unit]];
 return `<div class="pop" style="width:330px;max-width:90vw"><div class="pop-h"><b>Посмотреть платформу глазами</b></div>${it.map(([k,l,s])=>`<button class="role-item ${curRole===k?'on':''}" data-act="role" data-role="${k}"><span class="ri-ic">${ic(ROLES[k][1])}</span><span class="grow"><div class="b">${l}</div><div class="xs muted">${esc(s)}</div></span>${curRole===k?ic('check',16):''}</button>`).join('')}<div class="pop-sep"></div><button class="role-item" data-go="metrics"><span class="ri-ic">${ic('trend')}</span><span class="grow"><div class="b">Метрики платформы</div><div class="xs muted">Для инвесторов и партнёров</div></span></button></div>`}
function tourSteps(){const v=S.visited,t=T(),m=t.main,s=pst(m),d=s==='done',inv=S.inv[m];return [
 [`Студент открывает ${BRAND}`,1,'welcome'],
 [`Выбирает цель — ${t.goal}`,S.onboarded,'onb'],
 [`Видит карьерную готовность — ${t.base}%`,S.onboarded&&v.dashboard,'dashboard'],
 ['Видит, каких навыков не хватает',v.career||v.skills,'career'],
 ['Выбирает реальный проект компании',v.project,'project-'+m],
 ['Выполняет проект',s!=='none',s==='none'?'project-'+m:'workspace-'+m],
 ['Получает подтверждение навыков',d,d?'skills':s==='review'?'review-'+m:'workspace-'+m],
 ['Проект появляется в портфолио',!!S.portfolio[m],d?'portfolio':'workspace-'+m],
 ['Карьерная готовность растёт',d,'dashboard'],
 ['Открываются новые стажировки',d&&S.flags.jobsAfter,'internships'],
 ['Работодатель видит результаты',d&&S.flags.empSaw,'empdash'],
 ['Приглашение на интервью',inv&&inv.st==='accepted',d?'messages-inv-'+m:'workspace-'+m]]}
function tourHtml(){const st=tourSteps();const n=st.filter(s=>s[1]).length;const other=S.goal==='da'?'Product Manager':'Data Analyst';
 const extra=[['Резюме: анализ и советы','go:resume'],['Тренажёр интервью с ИИ','go:interview'],['Доска откликов','go:applications'],['Мини-тест по SQL','act:test:sql'],['Проверка решения ментором',`go:review-${T().main}`],['Кабинет вуза','go:uni'],['Командный проект','go:project-p5'],['Чат с работодателем','go:messages'],['Тарифы и калькулятор','go:pricing'],['Метрики платформы','go:metrics'],[`Второй трек: ${other}`,'act:switchTrack']];
 return `<div class="pop tour" style="width:400px"><div class="pop-h"><div><b>Главный сценарий · ${T().goal}</b><div class="xs muted">Пройдено ${n} из 12 шагов</div></div><button class="btn btn-g btn-sm" data-act="reset">${ic('refresh')}Сначала</button></div><div style="padding:0 16px 8px">${bar(Math.round(n/12*100),'gr thin')}</div>
 <div class="tour-list">${st.map((s,i)=>`<div class="tstep ${s[1]?'done':''}"><span class="mk">${s[1]?ic('check'):i+1}</span><span class="grow">${s[0]}</span><button class="linkish" data-go="${s[2]}">Перейти</button></div>`).join('')}
 <div class="label" style="padding:12px 16px 4px">Ещё показать</div>${extra.map(x=>`<div class="tstep"><span class="mk" style="border-style:dashed">${ic('play',10)}</span><span class="grow">${x[0]}</span><button class="linkish" ${btnAttr(x[1])}>Открыть</button></div>`).join('')}</div></div>`}

function searchIndex(){const out=[];
 allProjects().forEach(p=>out.push({t:p.title,s:'Проект · '+p.company,go:'project-'+p.id,ic:'folder'}));
 allJobs().forEach(j=>out.push({t:j.title,s:(j.type==='job'?'Вакансия':'Стажировка')+' · '+j.company,go:'job-'+j.id,ic:'briefcase'}));
 skAll().forEach(s=>out.push({t:s.name,s:'Навык · '+stLabel(s),go:'skills',ic:'award'}));
 CANDS.forEach(c=>out.push({t:c.name,s:'Кандидат · '+c.prof,go:'candidates',ic:'user'}));
 [['Резюме: конструктор и анализ','resume'],['Тренажёр интервью','interview'],['Расшифровка вакансии','interview-decode'],['Банк историй STAR','interview-star'],['Письма компаниям','interview-letters'],['Отклики: доска','applications'],['Сравнение офферов','applications-offers'],['Зарплаты стажёров','applications-salary'],['Резюме на английском','resume-english'],['Мой карьерный путь','career'],['Портфолио','portfolio'],['Сообщения','messages'],['Попробовать профессию','try'],['Кабинет работодателя','empdash'],['Тарифы и экономия','pricing'],['Кабинет ментора','mentor'],['Кабинет вуза','uni'],['Метрики платформы','metrics'],['Главная страница сайта','welcome']].forEach(([t,g])=>out.push({t,s:'Раздел',go:g,ic:'arR'}));
 return out}
function doSearch(q){const el=$('#searchPop');q=q.trim().toLowerCase();if(!q){el.innerHTML='';UI.pop=null;return}
 const res=searchIndex().filter(x=>(x.t+' '+x.s).toLowerCase().includes(q)).slice(0,8);UI.pop='search';
 el.innerHTML=`<div class="pop" style="left:0;right:auto;width:100%;min-width:0">${res.length?res.map(x=>`<button class="pop-item" data-go="${x.go}"><span class="muted">${ic(x.ic)}</span><span class="grow"><div class="b" style="font-size:13.5px">${esc(x.t)}</div><div class="xs muted">${esc(x.s)}</div></span></button>`).join(''):`<div class="empty sm">Ничего не нашлось по запросу «${esc(q)}»</div>`}</div>`}

function toast(t,icn='check'){const w=$('#toasts');while(w.children.length>=3)w.firstChild.remove();const el=document.createElement('div');el.className='toast';el.innerHTML=ic(icn)+`<span>${t}</span>`;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),3400)}
