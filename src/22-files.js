/* ================= file store: real uploads kept in the browser ================= */
const FS={db:null,mem:new Map(),
 open(){if(this.db!==null)return Promise.resolve(this.db);return new Promise(res=>{try{const r=indexedDB.open('delom-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>{this.db=false;res(false)}}catch(e){this.db=false;res(false)}})},
 async put(key,rec){this.mem.set(key,rec);const db=await this.open();if(!db)return;try{await new Promise((ok,no)=>{const t=db.transaction('f','readwrite');t.objectStore('f').put(rec,key);t.oncomplete=ok;t.onerror=no})}catch(e){}},
 async get(key){if(this.mem.has(key))return this.mem.get(key);const db=await this.open();if(!db)return null;try{return await new Promise(ok=>{const q=db.transaction('f').objectStore('f').get(key);q.onsuccess=()=>{if(q.result)this.mem.set(key,q.result);ok(q.result||null)};q.onerror=()=>ok(null)})}catch(e){return null}},
 async del(key){this.mem.delete(key);const db=await this.open();if(!db)return;try{db.transaction('f','readwrite').objectStore('f').delete(key)}catch(e){}}};
const fmtSize=b=>b<1024?b+' Б':b<1048576?Math.round(b/1024)+' КБ':(b/1048576).toFixed(1).replace('.',',')+' МБ';
const extOf=n=>(n.split('.').pop()||'').toLowerCase();
async function storeUpload(key,file){const rec={name:file.name,type:file.type||'',size:file.size,blob:file,at:Date.now()};await FS.put(key,rec);return rec}
async function storeGenerated(key,name,html){const blob=new Blob([html],{type:'text/html'});const rec={name,type:'text/html',size:blob.size,blob,at:Date.now(),generated:1};await FS.put(key,rec);return rec}
/* preview a stored file in a sheet: pdf, images, video, html, text */
async function openStored(key){const rec=await FS.get(key);
 if(!rec){toast('Файл не найден в этом браузере — загрузите его ещё раз','x');return}
 const url=URL.createObjectURL(rec.blob),ext=extOf(rec.name);let body;
 if(/^image\//.test(rec.type)||['png','jpg','jpeg','webp','gif'].includes(ext))body=`<img src="${url}" alt="${esc(rec.name)}" style="max-width:100%;border-radius:10px">`;
 else if(/^video\//.test(rec.type)||['mp4','mov','webm'].includes(ext))body=`<video src="${url}" controls playsinline style="width:100%;border-radius:10px;background:#000"></video>`;
 else if(ext==='pdf'||rec.type==='application/pdf')body=`<iframe src="${url}" title="${esc(rec.name)}" style="width:100%;height:70vh;border:1px solid var(--border);border-radius:10px"></iframe>`;
 else if(ext==='html'||ext==='htm'){const t=await rec.blob.text();body=`<iframe srcdoc="${esc(t)}" sandbox="" title="${esc(rec.name)}" style="width:100%;height:70vh;border:1px solid var(--border);border-radius:10px;background:#fff"></iframe>`}
 else if(['txt','md','csv','json','sql'].includes(ext)){const t=await rec.blob.text();body=`<pre class="code" style="max-height:65vh;overflow:auto;margin:0">${esc(t.slice(0,60000))}</pre>`}
 else body=`<div class="empty col g8" style="align-items:center"><span class="logo lg" style="background:var(--accent-soft);color:var(--accent-ink)">${ic('file',24)}</span><div>Предпросмотр для .${esc(ext)} недоступен в браузере — скачайте файл.</div></div>`;
 openModal(mh(esc(rec.name),`${fmtSize(rec.size)} · загружен ${new Date(rec.at).toLocaleDateString('ru-RU')}`)+`<div class="modal-b col g12">${body}<div class="row g8" style="justify-content:flex-end"><button class="btn btn-s" data-act="dlStored" data-id="${esc(key)}">${ic('download')}Скачать</button><button class="btn btn-p" data-act="closeModal">Закрыть</button></div></div>`,'wide')}
/* sample solution document generated from the student's own summary */
function reportHtml(p,w){const t=esc(p.title);return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>${t}</title><style>body{font:15px/1.6 system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1B1F33}h1{font-size:24px}h2{font-size:17px;margin-top:28px;color:#3B47E0}li{margin:4px 0}.m{color:#6A7090;font-size:13px}</style></head><body>
<p class="m">${esc(p.company)} · решение студента платформы ${BRAND}</p><h1>${t}</h1><h2>Задача</h2><p>${esc(p.task||'')}</p>
<h2>Что сделано</h2><ol>${p.wsTasks.map((x,i)=>`<li><b>${esc(x[0])}</b>${w.tasks[i]?'':' — не завершено'}: ${esc(x[1])}</li>`).join('')}</ol>
<h2>Итог решения</h2><p>${esc(w.summary||'').replace(/\n/g,'<br>')}</p>${p.metrics?`<h2>Ключевые результаты</h2><ul>${p.metrics.map(m=>`<li><b>${esc(m[0])}</b> — ${esc(m[1])}</li>`).join('')}</ul>`:''}</body></html>`}
/* ================= reading a resume: pdf / docx / txt → text → skills ================= */
const LIBS={pdf:'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',pdfWorker:'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',docx:'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js'};
const loadScript=src=>new Promise((ok,no)=>{if(document.querySelector(`script[data-src="${src}"]`)){ok();return}const s=document.createElement('script');s.src=src;s.dataset.src=src;s.onload=()=>ok();s.onerror=()=>no(new Error('load'));document.head.appendChild(s)});
async function extractText(file){const ext=extOf(file.name);
 if(['txt','md','csv'].includes(ext))return await file.text();
 if(ext==='pdf'){await loadScript(LIBS.pdf);const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc=LIBS.pdfWorker;const doc=await lib.getDocument({data:await file.arrayBuffer()}).promise;let out='';for(let i=1;i<=Math.min(doc.numPages,8);i++){const pg=await doc.getPage(i);const c=await pg.getTextContent();out+=c.items.map(x=>x.str).join(' ')+'\n'}return out}
 if(ext==='docx'){await loadScript(LIBS.docx);const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return r.value}
 throw new Error('format')}
/* which platform skills a text mentions (by name and synonyms) */
function detectSkills(text){const t=' '+text.toLowerCase().replace(/ё/g,'е')+' ';const found=[];
 Object.entries(SK).forEach(([id,s])=>{const names=[s.name,...(SYN[s.name]||[])].map(x=>x.toLowerCase().replace(/ё/g,'е').replace(/\s*\(.*\)/,'').trim()).filter(x=>x.length>=2);
  if(names.some(n=>n.length<=4?new RegExp(`[^a-zа-я]${n.replace(/[.*+?^${}()|[\]\\/]/g,'\\$&')}[^a-zа-я]`,'i').test(t):t.includes(n)))found.push(id)});
 return found}
