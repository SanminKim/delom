/* ================= AI layer (real Claude via `sample`, with local fallback) ================= */
let SAMPLE=null,DLS=null;
const NO_RT=!(window.claude&&window.claude.use);
const AI_PERM=['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'];
const AI_MSG={rate_limited:'Слишком много запросов к ИИ. Подождите минуту и попробуйте снова.',session_expired:'Сессия Claude истекла — войдите заново.',refused:'ИИ не стал отвечать на этот запрос. Измените текст и попробуйте снова.',empty_completion:'ИИ вернул пустой ответ. Попробуйте ещё раз.',invalid_json:'ИИ ответил в неожиданном формате. Нажмите ещё раз.',prompt_too_large:'Слишком длинный текст — сократите его.',upstream_error:'Сбой связи с ИИ. Попробуйте ещё раз.'};
const AI_LIVE_ROUTES=['resume','interview','applications'];
(async()=>{if(NO_RT)return;
 try{SAMPLE=await window.claude.use('sample')}catch(e){SAMPLE=null}
 try{DLS=await window.claude.use('downloads')}catch(e){DLS=null}
 const a=document.activeElement;const typing=a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName);
 if(!typing&&AI_LIVE_ROUTES.includes(parse().n))render()})();
const aiOn=()=>!!SAMPLE;
const aiBadge=()=>aiOn()?`<span class="pill ac">${ic('spark')}ИИ: Claude</span>`:`<span class="pill" title="В этом просмотре ИИ недоступен — работает встроенный анализ">${ic('bolt')}Встроенный анализ</span>`;
function md(s){return esc(s||'').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/^#{1,4}\s*(.+)$/gm,'<b>$1</b>').replace(/^\s*[-•]\s+/gm,'• ').replace(/\n/g,'<br>')}
UI.tasks={};
const task=k=>UI.tasks[k]||{status:'idle'};
async function runTask(k,{prompt,json,fallback,tier='default',onDone}){
 const st={status:'loading',text:'',source:aiOn()?'ai':'local'};UI.tasks[k]=st;
 if(!aiOn()){render();await new Promise(r=>setTimeout(r,500));st.data=fallback();st.status='done';st.source='local';if(onDone)onDone(st);if(UI.tasks[k]===st)render();return}
 st.ctl=new AbortController();render();
 try{
  if(json)st.data=await SAMPLE.json(prompt,{signal:st.ctl.signal,modelTier:tier,onText:({text})=>{st.text=text;paintTask(k,true)}});
  else{const r=await SAMPLE(prompt,{signal:st.ctl.signal,modelTier:tier,cache:false,onText:({text})=>{st.text=text;paintTask(k)}});st.data=r.text;st.truncated=r.truncated}
  st.status='done';if(onDone)onDone(st);
 }catch(e){const c=e&&e.code;
  if(c==='cancelled')st.status='idle';
  else if(AI_PERM.includes(c)){SAMPLE=null;st.data=fallback();st.status='done';st.source='local';st.note='ИИ недоступен в этом просмотре — показан результат встроенного анализа.';if(onDone)onDone(st)}
  else{st.status='error';st.err=AI_MSG[c]||AI_MSG.upstream_error;st.text=(e&&e.text)||''}}
 if(UI.tasks[k]===st)render()}
function paintTask(k,isJson){const el=document.querySelector(`[data-stream="${k}"]`);if(!el)return;const st=UI.tasks[k];el.innerHTML=isJson?`<span class="muted">ИИ пишет разбор… ${fmt(st.text.length)} знаков</span>`:md(st.text)}
function taskUI(k,{idle='',loadingText='ИИ думает…'}={}){const st=task(k);
 if(st.status==='loading')return `<div class="ai-run"><span class="spin"></span><div class="grow"><div class="b">${st.source==='ai'?loadingText:'Анализируем…'}</div><div class="sm" data-stream="${k}">${st.text?md(st.text):'<span class="muted">Обычно это занимает 10–40 секунд. Первый запрос попросит разрешение.</span>'}</div></div>${st.source==='ai'?`<button class="btn btn-s btn-sm" data-act="stopTask" data-id="${k}">Стоп</button>`:''}</div>`;
 if(st.status==='error')return `<div class="banner" style="background:var(--red-soft);margin:0"><span class="ic" style="background:var(--red)">${ic('x',18)}</span><div class="grow"><div class="b">${st.err}</div>${st.text?`<div class="sm t2">${md(st.text)}</div>`:''}</div></div>`;
 return idle}
const srcNote=st=>st&&st.status==='done'?`<span class="xs muted">${st.source==='ai'?'Сгенерировано ИИ · проверьте факты перед отправкой':'Встроенный анализ по правилам'}${st.note?' · '+st.note:''}</span>`:'';

/* profile context for prompts */
function profileCtx(){const t=T();
 const projs=[...doneProjects().map(pid=>{const p=P(pid);return `${p.title} (${p.company}, оценка ${S.scores[pid]||p.score}; результаты: ${p.metrics.map(m=>m[0]+' '+m[1]).join(', ')})`}),'Customer Development для студенческого кофе-сервиса (14 интервью, 3 сегмента)','Онбординг фитнес-приложения (прототип 4 экрана, −18% шагов)','Анализ конкурентов сервиса аренды самокатов (командный, 6 конкурентов)'];
 const jobs=allJobs().filter(j=>isFit(j)&&unlocked(j)).sort((a,b)=>matchOf(b)-matchOf(a)).slice(0,5).map(j=>`${j.title} — ${j.company}, совпадение ${matchOf(j)}%`);
 return [`Студент: Алексей Иванов, НИУ ВШЭ, бизнес-информатика, 3 курс, Москва.`,`Цель: ${t.goal}. Карьерная готовность: ${readiness()}%.`,`Подтверждённые навыки: ${confAll().map(s=>`${s.name} (${s.basis})`).join('; ')}.`,`Навыки без подтверждения: ${skAll().filter(s=>s.st!=='ok'&&has(s)).map(s=>s.name).join(', ')}.`,`Не хватает для цели: ${reqSk().filter(s=>!has(s)).map(s=>s.name).join(', ')||'нет'}.`,`Проекты: ${projs.join('; ')}.`,`Подходящие стажировки: ${jobs.join('; ')}.`].join('\n')}
const NOFAKE='Не выдумывай факты, цифры, компании и опыт, которых нет в данных. Если для улучшения нужна цифра, которой нет, ставь плейсхолдер в квадратных скобках, например [число].';
