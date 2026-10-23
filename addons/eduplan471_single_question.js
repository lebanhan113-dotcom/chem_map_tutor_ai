/* EduPlan AI 4.7.1 - one-question guided testing, chemistry typography & diagrams. Offline and rule-based. */
(()=>{'use strict';
const VER='4.7.1', AUTH='Lê Bá Nhẫn – Trường THPT Hòn Đất';
const FORM={mcq:18,tf:4,short:6,essay:4}, LABEL={mcq:'PHẦN I. TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN',tf:'PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI',short:'PHẦN III. CÂU HỎI TRẢ LỜI NGẮN',essay:'PHẦN IV. CÂU HỎI TỰ LUẬN'};
const LEVELS=['Nhận biết','Thông hiểu','Vận dụng','Vận dụng cao'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const data=()=>window.EDP38?.bank?.()||[];
const lessonList=()=>window.EDP38?.lessons?.()||[];
const one=(id)=>document.getElementById(id);
const safeURL=s=>/^https:\/\/[a-z0-9][a-z0-9.-]+(?:\/[\w%?&=+#@.,:;~()\/-]*)?$/i.test(String(s||''))?String(s):'';
const norm=x=>String(x??'').trim().replace(/\s+/g,' ');
const fresh=(g,lesson,format)=>data().filter(q=>String(q.g)===String(g)&&q.lessonId===lesson&&(format==='all'||q.type===format));
let S={grade:'10',lesson:'',role:'student',format:'2025',mode:'start',items:[],at:0,answers:{},locked:{},feedback:false,showMaps:false,sourceFilter:false,name:'',klass:'',code:'HS-01',status:'',fileName:'',time:0};
try{S.name=window.EPSTUDENT?.getName?.()||'';S.klass=window.EPSTUDENT?.getClass?.()||''}catch(e){}
function gradeLessons(){return lessonList().filter(l=>String(l.g)===S.grade)}
function lesson(){return gradeLessons().find(l=>l.id===S.lesson)||gradeLessons()[0]||null}
function current(){return S.items[S.at]||null}
function shape(q){if(!q||typeof q.stem!=='string'||!q.stem.trim()||!FORM.hasOwnProperty(q.type))return false;
 if(q.type==='mcq')return Array.isArray(q.ops)&&q.ops.length===4&&q.ops.every(x=>typeof x==='string'&&x.trim())&&Number.isInteger(q.ans)&&q.ans>=0&&q.ans<4;
 if(q.type==='tf')return Array.isArray(q.ops)&&q.ops.length===4&&q.ops.every(x=>typeof x==='string'&&x.trim())&&Array.isArray(q.ans)&&q.ans.length===4&&q.ans.every(x=>typeof x==='boolean');
 if(q.type==='short')return (typeof q.ans==='string'||typeof q.ans==='number')&&String(q.ans).trim()!=='';
 return Array.isArray(q.rubric)||typeof q.ans==='string';}
function eligible(){return data().filter(q=>String(q.g)===S.grade&&q.lessonId===lesson()?.id&&shape(q))}
function escChem(s){
 // The source bank contains Unicode subscripts. Convert only explicit, unambiguous ASCII formulas.
 // Do not reconstruct missing MathType/OLE formulas or change raw database values.
 let t=esc(s);
 const formulas=/\b(?:H2SO4|H2O2|H2O|HNO3|HCl|NaOH|Ca\(OH\)2|Al\(OH\)3|Fe2\(SO4\)3|Al2\(SO4\)3|CuSO4|Fe2O3|CO2|SO2|SO3|NH3|CH4|C2H5OH|CH3COOH|CH3COONa|CuSO4|Na2CO3|K2SO4|O2|H2|N2|Cl2|MgCl2)\b/g;
 t=t.replace(formulas,m=>m.replace(/\d+/g,n=>`<sub>${n}</sub>`));
 // Prefer source Unicode ionic charges; detect ambiguous ASCII notation instead of blindly reinterpreting it.
 return t.replace(/\n/g,'<span class="e47nl"></span>');}
function answerText(q){if(q.type==='mcq')return 'ABCD'[q.ans];if(q.type==='tf')return q.ans.map(x=>x?'Đ':'S').join(' / ');return String(q.ans??'');}

function quality(){let q=data();const by={};for(let g of ['10','11','12'])by[g]=q.filter(x=>String(x.g)===g).length;
 let invalid=q.filter(x=>!shape(x)),missing=q.filter(x=>!safeURL(x.src||x.reference_url)),flagged=q.filter(x=>!/^(đã duyệt|đã được giáo viên thẩm định)/i.test(String(x.review||'')));
 let suspect=q.filter(x=>/\[CẦN ĐỐI CHIẾU|\b(?:H2So4|NaCL|Fe2o3|SO4\^2-)\b/.test(JSON.stringify(x)));
 return {total:q.length,by,invalid,missing,flagged,suspect};}
function badgeLv(l){return {"Nhận biết":"e47nb","Thông hiểu":"e47th","Vận dụng":"e47vd","Vận dụng cao":"e47vdc"}[l]||'e47nb'}
function note(t){S.status=t;let e=one('e47notice');if(e){e.textContent=t;e.hidden=false}}
function saveDraft(){
 try{localStorage.setItem('eduplan47_draft',JSON.stringify({v:2,grade:S.grade,lesson:S.lesson,format:S.format,role:S.role,mode:S.mode,at:S.at,items:S.items.map(x=>x.id),answers:S.answers,locked:S.locked,code:S.code,name:S.name,klass:S.klass,started:S.time,completed:S.completed||null,time:Date.now()}))}
 catch(e){note('Trình duyệt không cho lưu. Hãy tải tệp JSON để sao lưu.')}}

function restoreDraft(){
 try{const d=JSON.parse(localStorage.getItem('eduplan47_draft')||'null');
 if(!d||![1,2].includes(d.v)||!Array.isArray(d.items)||!d.items.length||d.items.length>32||!['quiz','result'].includes(d.mode)||!['10','11','12'].includes(String(d.grade)))return false;
 const pool=new Map(data().map(q=>[q.id,q]));const ids=d.items.filter(id=>typeof id==='string');
 if(ids.length!==d.items.length||new Set(ids).size!==ids.length)return false;
 let items=ids.map(id=>pool.get(id));if(items.some(q=>!q||!shape(q)||String(q.g)!==String(d.grade)||q.lessonId!==d.lesson))return false;
 S.grade=String(d.grade);S.lesson=d.lesson;S.format=['2025','extended','practice'].includes(d.format)?d.format:'practice';S.role=d.role==='teacher'?'teacher':'student';
 S.items=items;S.mode=d.mode;S.at=Math.min(items.length-1,Math.max(0,Number.isInteger(d.at)?d.at:0));
 const answers=d.answers&&typeof d.answers==='object'&&!Array.isArray(d.answers)?d.answers:{};
 S.answers={};S.locked={};for(const q of items){let a=answers[q.id];if(q.type==='mcq'&&Number.isInteger(a)&&a>=0&&a<4)S.answers[q.id]=a;
 else if(q.type==='tf'&&Array.isArray(a)&&a.length===4&&a.every(x=>x===null||typeof x==='boolean'))S.answers[q.id]=a;
 else if(['short','essay'].includes(q.type)&&typeof a==='string')S.answers[q.id]=a.slice(0,4000);
 const completed=q.type==='mcq'?Number.isInteger(S.answers[q.id]):q.type==='tf'?Array.isArray(S.answers[q.id])&&S.answers[q.id].every(x=>typeof x==='boolean'):typeof S.answers[q.id]==='string'&&S.answers[q.id].trim()!=='';
 if(completed&&d.locked?.[q.id]===true)S.locked[q.id]=true;}
 S.name=typeof d.name==='string'?d.name.slice(0,80):S.name;S.klass=typeof d.klass==='string'?d.klass.slice(0,24):S.klass;
 S.code=typeof d.code==='string'?d.code.toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,20):'HS-01';
 S.time=Number.isFinite(d.started)?d.started:0;S.completed=Number.isFinite(d.completed)?d.completed:null;
 if(S.mode==='result'&&items.some(q=>!S.locked[q.id]))S.mode='quiz';return true;
 }catch(e){return false}}

function close(){one('edp47-root')?.remove();one('edp47-open')?.removeAttribute('hidden');document.body.classList.remove('edp47-on');try{window.EDP45?.open?.()}catch(e){}}
function open(role='student'){S.role=role==='teacher'?'teacher':'student';S.mode='start';S.items=[];S.answers={};S.locked={};S.at=0;S.feedback=false;S.showMaps=false;S.lesson='';document.body.classList.add('edp47-on');render()}
function clearStudent(){
 if(!window.confirm('Xóa họ tên, lớp và bản nháp làm bài trên thiết bị này?'))return;
 S.name='';S.klass='';S.code='HS-01';S.items=[];S.answers={};S.locked={};S.mode='start';S.at=0;S.completed=null;
 try{window.EPSTUDENT?.setName?.('');window.EPSTUDENT?.setClass?.('');localStorage.removeItem('eduplan47_draft')}catch(e){}
 render();}
function reset(){S.mode='start';S.items=[];S.answers={};S.locked={};S.at=0;try{localStorage.removeItem('eduplan47_draft')}catch(e){}render()}
function set(k,v){if(k==='grade'){S.grade=['10','11','12'].includes(v)?v:'10';S.lesson='';}else if(k==='format'){S.format=['2025','extended','practice'].includes(v)?v:'2025'}else if(k==='role'){S.role=v==='teacher'?'teacher':'student'}else if(k==='lesson'){S.lesson=v}else if(k==='name'){S.name=String(v).slice(0,80);window.EPSTUDENT?.setName?.(S.name)}else if(k==='klass'){S.klass=String(v).slice(0,24);window.EPSTUDENT?.setClass?.(S.klass)}else if(k==='code'){S.code=String(v).toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,20)}
 if(['grade','lesson','format','role'].includes(k))render();}
function selectList(){let items=eligible(), req=S.format==='2025'?{mcq:18,tf:4,short:6,essay:0}:S.format==='extended'?FORM:{mcq:3,tf:1,short:1,essay:1};
 let selected=[];for(let t of Object.keys(FORM)){let pool=items.filter(q=>q.type===t);let want=req[t];if(!want)continue;
 // Spread by existing level tags, no replacement or duplicate questions.
 let grouped=LEVELS.map(l=>pool.filter(q=>q.lv===l));let used=new Set();while(selected.filter(q=>q.type===t).length<want){let changed=false;for(let group of grouped){let q=group.find(x=>!used.has(x.id));if(q){selected.push(q);used.add(q.id);changed=true}if(selected.filter(x=>x.type===t).length===want)break}if(!changed)break}
 }
 return {items:selected,req,ok:Object.keys(req).every(t=>selected.filter(q=>q.type===t).length===req[t]),counts:Object.fromEntries(Object.keys(FORM).map(t=>[t,items.filter(q=>q.type===t).length]))};}
function start(){S.lesson=lesson()?.id||'';
 if(S.role==='student'){const name=norm(S.name);if(!window.EPSTUDENT?.valid?.(name)){note('Vui lòng nhập họ và tên học sinh hợp lệ.');one('e47name')?.focus();return}}
 const a=selectList();if(!a.ok){note('Bài học chưa đủ số câu theo cấu trúc này. Hãy chọn bài khác hoặc luyện nhanh.');return}
 S.items=a.items;S.answers={};S.locked={};S.at=0;S.mode='quiz';S.feedback=false;S.time=Date.now();S.completed=null;S.returnMode=null;S.navSerial=(S.navSerial||0)+1;saveDraft();render();}

function answerMCQ(idx){let q=current();if(!q||q.type!=='mcq'||!Number.isInteger(idx)||idx<0||idx>3||S.mode!=='quiz')return;S.answers[q.id]=idx;S.locked[q.id]=true;saveDraft();render();auto(q.id)}

function answerTF(idx,v){let q=current();if(!q||q.type!=='tf'||!Number.isInteger(idx)||idx<0||idx>3||S.mode!=='quiz')return;
 let a=Array.isArray(S.answers[q.id])?S.answers[q.id].slice():[null,null,null,null];a[idx]=v===true;S.answers[q.id]=a;
 S.locked[q.id]=a.every(x=>typeof x==='boolean');saveDraft();render();if(S.locked[q.id])auto(q.id)}

function setWrittenAnswer(v){let q=current();if(!q)return;S.answers[q.id]=String(v).slice(0,4000);saveDraft()}
function confirmAnswer(){let q=current();if(!q)return;let a=String(S.answers[q.id]||'').trim();if(!a)return note('Hãy nhập câu trả lời trước khi tiếp tục.');S.locked[q.id]=true;saveDraft();move(1)}
function auto(id){const n=S.at;const serial=S.navSerial||0;setTimeout(()=>{
 if(S.mode==='quiz'&&S.at===n&&(S.navSerial||0)===serial&&current()?.id===id&&S.locked[id])move(1)
 },650)}

function move(step){if(S.mode!=='quiz')return;let next=S.at+step;
 if(next<0)return;
 if(step>0&&!S.locked[current()?.id]){note('Hãy hoàn thành câu này trước khi tiếp tục.');return}
 S.navSerial=(S.navSerial||0)+1;
 if(next>=S.items.length){finish();return}S.at=next;saveDraft();render();}

function safeNum(x){let s=String(x).trim().replace(/,/g,'.').replace(/\s/g,'');if(!/^[-+]?\d+(\.\d+)?$/.test(s))return null;let n=Number(s);return Number.isFinite(n)?n:null;}
function compare(q,a){if(q.type==='essay')return null;if(q.type==='mcq')return a===q.ans;if(q.type==='tf')return Array.isArray(a)&&a.length===4&&a.every((x,i)=>x===q.ans[i]);let n=safeNum(a),m=safeNum(q.ans);if(n!==null&&m!==null)return Math.abs(n-m)<=Math.max(1e-7,1e-6*Math.abs(m));return norm(a).toLowerCase()===norm(q.ans).toLowerCase()}
function finish(){if(S.items.some(q=>!S.locked[q.id])){
 const idx=S.items.findIndex(q=>!S.locked[q.id]);S.mode='quiz';S.at=idx;note('Bạn còn câu chưa hoàn thành.');saveDraft();render();return;
 }S.navSerial=(S.navSerial||0)+1;S.completed=Date.now();S.mode='result';saveDraft();render()}

function answerForm(q){let a=S.answers[q.id];if(q.type==='mcq')return `<div class="e47options" role="radiogroup" aria-label="Chọn một phương án">${q.ops.map((o,i)=>`<button class="e47choice ${a===i?'chosen':''}" onclick="EDP47.mcq(${i})"><b>${'ABCD'[i]}.</b><span>${escChem(o)}</span></button>`).join('')}</div><p class="e47tip">Chọn một đáp án → tự chuyển sau nửa giây. Có thể quay lại để thay đổi.</p>`;
 if(q.type==='tf'){let vals=Array.isArray(a)?a:[null,null,null,null];return `<div class="e47truefalse">${q.ops.map((o,i)=>`<div class="e47statement"><div><b>${'abcd'[i]})</b> ${escChem(o)}</div><div class="e47tfactions"><button aria-pressed="${vals[i]===true}" class="${vals[i]===true?'chosen':''}" onclick="EDP47.tf(${i},true)">Đúng</button><button aria-pressed="${vals[i]===false}" class="${vals[i]===false?'chosen':''}" onclick="EDP47.tf(${i},false)">Sai</button></div></div>`).join('')}</div><p class="e47tip">Chọn Đúng/Sai cho đủ bốn ý → tự chuyển sang câu tiếp theo.</p>`}
 if(q.type==='short')return `<label class="e47answerLabel">Nhập kết quả (có thể dùng dấu phẩy thập phân)<input id="e47short" type="text" inputmode="decimal" autocomplete="off" value="${esc(a??'')}" oninput="EDP47.text(this.value)" onkeydown="if(event.key==='Enter'){event.preventDefault();EDP47.confirm()}"></label><p class="e47tip">Nhấn Enter hoặc “Xác nhận & tiếp” để chuyển câu.</p><button class="e47primary" onclick="EDP47.confirm()">Xác nhận & tiếp →</button>`;
 return `<label class="e47answerLabel">Bài giải tự luận<textarea id="e47essay" rows="7" oninput="EDP47.text(this.value)" placeholder="Trình bày lập luận, phương trình, các bước tính và kết luận...">${esc(a??'')}</textarea></label><p class="e47tip">Tự luận được lưu và chuyển khi bấm nút; giáo viên chấm theo rubric, không chấm máy.</p><button class="e47primary" onclick="EDP47.confirm()">Lưu bài giải & tiếp →</button>`;}
function question(){let q=current();if(!q)return '<p>Không có câu hợp lệ.</p>';let answered=Object.keys(S.locked).filter(id=>S.locked[id]).length;return `<div class="e47status"><span class="e47chip">${esc(LABEL[q.type])}</span><span class="e47level ${badgeLv(q.lv)}">${esc(q.lv||'Chưa gắn mức')}</span><span class="e47muted">Câu ${S.at+1} / ${S.items.length}</span></div><div class="e47progress"><span style="width:${100*answered/S.items.length}%"></span></div><div class="e47card e47qcard"><div class="e47qhead"><span>🧪 ${esc(q.lesson||lesson()?.title)}</span><span>Mã: ${esc(q.id)}</span></div><h2>${escChem(q.stem)}</h2>${answerForm(q)}<div class="e47navrow"><button class="e47btn" onclick="EDP47.move(-1)" ${S.at===0?'disabled':''}>← Câu trước</button><small>Đã hoàn thành ${answered}/${S.items.length}</small>${S.locked[q.id]?`<button class="e47btn" onclick="EDP47.move(1)">${S.at===S.items.length-1?'Xem kết quả':'Câu tiếp'} →</button>`:''}</div></div><div class="e47under"><button onclick="EDP47.maps()">🧠 Sơ đồ tư duy & minh họa</button><button onclick="EDP47.export()">⇩ Lưu bài tạm (JSON)</button></div>`;}
function sectionSummary(){return '<div class="e471sections">'+Object.keys(FORM).filter(type=>S.items.some(q=>q.type===type)).map(type=>{
 const group=S.items.filter(q=>q.type===type);const good=group.filter(q=>compare(q,S.answers[q.id])===true).length;
 return '<div><strong>'+esc(LABEL[type])+'</strong><span>'+(type==='essay'?'Giáo viên chấm ('+group.length+' câu)':good+'/'+group.length+' đúng hoàn toàn')+'</span></div>'}).join('')+'</div>'}
function result(){let checked=S.items.filter(q=>q.type!=='essay'),correct=checked.filter(q=>compare(q,S.answers[q.id])===true).length;
 return `<div class="e47hero"><div class="e47eyebrow">KẾT QUẢ LUYỆN TẬP CỤC BỘ</div><h1>Hoàn thành ${S.items.length} câu hỏi</h1><p>${esc(S.name||S.code)} · Hóa ${S.grade} · ${esc(lesson()?.title)}</p></div><div class="e47card"><div class="e47resultnum">${correct}<span>/${checked.length} câu khách quan đúng hoàn toàn</span></div><p>${S.items.filter(q=>q.type==='essay').length} câu tự luận cần giáo viên chấm. Đúng/Sai chỉ tính một câu đúng hoàn toàn khi cả bốn ý đúng; cách tính này dùng để luyện tập, không khẳng định theo thang điểm tốt nghiệp chính thức.</p>${sectionSummary()}<div class="e47actions"><button class="e47primary" onclick="EDP47.export()">⇩ Tải bài làm JSON</button><button class="e47btn" onclick="EDP47.reset()">Làm bài khác</button></div></div>${S.items.map((q,i)=>{let c=compare(q,S.answers[q.id]);return `<details class="e47review"><summary>Câu ${i+1} – ${esc(q.lv)} ${c===true?'✓ Đúng':c===false?'✕ Cần sửa':'• Giáo viên chấm'}</summary><div class="e47reviewbody"><p>${escChem(q.stem)}</p><p><b>Em trả lời:</b> ${esc(Array.isArray(S.answers[q.id])?S.answers[q.id].map(v=>v===true?'Đúng':v===false?'Sai':'—').join(', '):q.type==='mcq'?('ABCD'[S.answers[q.id]]||'Chưa trả lời'):(S.answers[q.id]||'Chưa trả lời'))}</p><p><b>Đáp án tham khảo:</b> ${escChem(answerText(q))}</p><p><b>Giải thích nguồn:</b> ${escChem(q.exp||'Chưa có giải thích; cần giáo viên bổ sung.')}</p><p><b>Thẩm định:</b> ${esc(q.review||'Chưa xác định')}</p>${safeURL(q.src)?`<a href="${esc(q.src)}" rel="noopener noreferrer" target="_blank">Nguồn đối chiếu kiến thức ↗</a>`:'<span class="e47warn">Thiếu nguồn đối chiếu</span>'}</div></details>`}).join('')}`;}
function balance(counts,type){let have=counts[type]||0,need=FORM[type];return `<div class="e47coverageRow"><span>${esc(LABEL[type])}</span><b class="${have>=need?'e47good':'e47warn'}">${have}/${need}</b></div>`}
function startPage(){let l=lesson(),check=selectList(),qualityData=quality();return `<div class="e47hero"><div class="e47eyebrow">EDUPLAN AI 4.7.1 • HỆ SINH THÁI HÓA HỌC THPT</div><h1>${S.role==='teacher'?'Thiết kế bài luyện tập theo form 2025':'Làm bài từng câu – Tự chuyển tiếp'}</h1><p>Thao tác tập trung, chỉ hiển thị một câu hỏi tại một thời điểm; công thức giữ nguyên dữ liệu nguồn và hiển thị chỉ số theo quy tắc an toàn.</p></div><div class="e47grid"><div class="e47card"><h2>Thiết lập bài làm</h2><div class="e47formGrid"><label>Vai trò<select onchange="EDP47.set('role',this.value)"><option value="student" ${S.role==='student'?'selected':''}>Học sinh</option><option value="teacher" ${S.role==='teacher'?'selected':''}>Giáo viên</option></select></label><label>Khối lớp<select onchange="EDP47.set('grade',this.value)">${['10','11','12'].map(g=>`<option value="${g}" ${S.grade===g?'selected':''}>Hóa ${g}</option>`).join('')}</select></label><label>Chọn bài<select onchange="EDP47.set('lesson',this.value)">${gradeLessons().map(x=>`<option value="${esc(x.id)}" ${l?.id===x.id?'selected':''}>${esc(x.title)}</option>`).join('')}</select></label><label>Định dạng đề<select onchange="EDP47.set('format',this.value)"><option value="2025" ${S.format==='2025'?'selected':''}>Form 2025: 18–4–6 (28 câu)</option><option value="extended" ${S.format==='extended'?'selected':''}>Mở rộng: 18–4–6–4 (32 câu)</option><option value="practice" ${S.format==='practice'?'selected':''}>Luyện nhanh: 3–1–1–1 (6 câu)</option></select></label></div><div class="e47formGrid"><label>Họ và tên học sinh<input id="e47name" placeholder="Ví dụ: Nguyễn Văn An" maxlength="80" value="${esc(S.name)}" oninput="EDP47.set('name',this.value)"></label><label>Lớp<input placeholder="Ví dụ: 10A1" maxlength="24" value="${esc(S.klass)}" oninput="EDP47.set('klass',this.value)"></label></div><div class="e47actions"><button class="e47primary" onclick="EDP47.start()">▶ Bắt đầu làm bài từng câu</button><button class="e47btn" onclick="EDP47.maps()">🧠 Sơ đồ tư duy & minh họa</button><button class="e47btn" onclick="EDP47.resume()">↩ Tiếp tục bài đang làm</button><button class="e47btn" onclick="EDP47.clearStudent()">X&#243;a t&#234;n &amp; b&#7843;n nh&#225;p</button></div><p class="e47muted">Chỉ bắt đầu nếu đủ câu hợp lệ theo cấu trúc. Không lặp câu để lấp phần thiếu. Họ tên chỉ lưu cục bộ và đi cùng tệp bạn chủ động xuất.</p></div><div class="e47card"><h2>Ngân hàng bài đang chọn</h2>${Object.keys(FORM).map(t=>balance(check.counts,t)).join('')}<div class="e47panel ${check.ok?'e47pass':'e47alert'}">${check.ok?'Đủ câu cấu trúc được chọn.':'Chưa đủ câu cho định dạng này: chọn “Luyện nhanh” hoặc chuyển bài khác.'}</div><p class="e47muted">${qualityData.total} câu trong toàn ngân hàng; ${qualityData.invalid.length} câu chưa hợp lệ về cấu trúc; ${qualityData.flagged.length} câu chưa có xác nhận thẩm định trong dữ liệu.</p><button class="e47btn" onclick="EDP47.audit()">🔍 Xem báo cáo rà soát</button></div></div><div class="e47footnote"><b>Cấu trúc chính thức từ năm 2025:</b> 18 câu nhiều lựa chọn, 4 câu Đúng/Sai (mỗi câu 4 ý), 6 câu trả lời ngắn, 50 phút. Phần tự luận là lựa chọn mở rộng cho dạy học, không thuộc ba phần của đề tốt nghiệp.</div>`}
function mapType(){return `<div class="e47mapsGrid">${Object.keys(FORM).map(t=>{let seq=t==='mcq'?['Nhận diện yêu cầu','Đối chiếu dữ kiện','Loại phương án nhiễu','Chọn một đáp án']:t==='tf'?['Đọc từng ý độc lập','Xác định bản chất','Kiểm chứng bốn nhận định','Chọn Đúng/Sai từng ý']:t==='short'?['Tóm tắt dữ kiện','Đặt quan hệ/mol','Tính và kiểm tra đơn vị','Ghi đáp số đúng quy tắc']:['Chia giai đoạn','Viết PTHH / bảo toàn','Biện luận, ngoại lệ','Kết luận có kiểm tra'];return `<article class="e47map"><h3>${esc(LABEL[t])}</h3><div class="e47mapcenter">${t==='mcq'?'A – B – C – D':t==='tf'?'a · b · c · d':t==='short'?'Kết quả chính xác':'Lập luận chặt chẽ'}</div>${seq.map((s,i)=>`<div class="e47mapstep s${i}"><span>${i+1}</span> ${esc(s)}</div>`).join('')}</article>`}).join('')}</div>`}
function diagram(name){let t=(name||'').toLowerCase();let kind=/nguyên tử|electron|đồng vị/.test(t)?'atom':/oxi hóa|khử|kim loại/.test(t)?'redox':/điện phân|pin điện|điện cực/.test(t)?'cell':/acid|axit|pH|cân bằng trong dung dịch/.test(t)?'ph':/bảng tuần hoàn/.test(t)?'periodic':/polym/.test(t)?'poly':/ester|lipid/.test(t)?'ester':/liên kết ion/.test(t)?'ion':/liên kết/.test(t)?'bond':'equation';
 let inner='';const rect=(x,y,w,h,c='#e8f1fb')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${c}"/>`;
 const tx=(x,y,s,size=19)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="${size}" font-weight="700" fill="#16426b">${esc(s)}</text>`;
 if(kind==='atom'){inner=`<circle cx="240" cy="137" r="95" fill="none" stroke="#4e9fc9" stroke-width="3"/><circle cx="240" cy="137" r="59" fill="none" stroke="#94cadd" stroke-width="2"/><circle cx="240" cy="137" r="27" fill="#e4a76a"/>${tx(240,143,'p⁺ n⁰',13)}<circle cx="146" cy="137" r="10" fill="#0d85b7"/><circle cx="328" cy="99" r="10" fill="#0d85b7"/><circle cx="240" cy="78" r="9" fill="#0d85b7"/>${tx(240,262,'MÔ HÌNH NGUYÊN TỬ (MINH HỌA)',16)}`}
 else if(kind==='redox'){inner=`${rect(22,42,196,88)}${tx(120,92,'Fe → Fe²⁺ + 2e⁻',17)}${rect(266,42,196,88)}${tx(364,92,'Cu²⁺ + 2e⁻ → Cu',17)}<path d="M220 90 L260 90" stroke="#20a38b" stroke-width="6"/><path d="M255 80 L267 90 L255 100" fill="none" stroke="#20a38b" stroke-width="6"/>${tx(242,187,'Fe + Cu²⁺ → Fe²⁺ + Cu',21)}${tx(242,245,'BẢO TOÀN ELECTRON',16)}`}
 else if(kind==='cell'){inner=`${rect(30,60,195,122,'#e3f6f2')}${rect(270,60,195,122,'#e7efff')}${tx(127,113,'Zn → Zn²⁺ + 2e⁻',16)}${tx(368,113,'Cu²⁺ + 2e⁻ → Cu',16)}<path d="M220 55 H300" stroke="#195c8a" stroke-width="5" stroke-dasharray="7 6"/>${tx(254,38,'e⁻ →',18)}${tx(245,250,'PIN DANIELL: e⁻ đi từ Zn sang Cu',17)}`}
 else if(kind==='ph'){inner=`<defs><linearGradient id="e47phgrad"><stop offset="0" stop-color="#cc4545"/><stop offset="50%" stop-color="#eacb70"/><stop offset="100%" stop-color="#207cc1"/></linearGradient></defs><rect x="25" y="120" width="430" height="34" rx="14" fill="url(#e47phgrad)"/>${tx(44,100,'0',20)}${tx(240,100,'7',20)}${tx(438,100,'14',20)}<path d="M240 110 V166" stroke="white" stroke-width="5"/>${tx(94,198,'Acid',18)}${tx(240,198,'Trung tính',18)}${tx(388,198,'Base',18)}${tx(240,255,'THANG pH (tham khảo 25°C)',16)}`}
 else if(kind==='periodic'){inner=Array.from({length:14},(_,i)=>`${rect(48+(i%7)*53,60+Math.floor(i/7)*61,47,51, i%7>3?'#ccebe3':'#dceaf9')}${tx(70+(i%7)*53,91,`${i+1}`,15)}`).join('')+`${tx(238,236,'BIẾN THIÊN TÍNH CHẤT THEO CHU KỲ',15)}`}
 else if(kind==='poly'){inner=`${rect(32,73,192,90)}${rect(266,73,192,90,'#dbf4ea')}${tx(126,126,'CH₂=CH₂',26)}${tx(360,126,'[–CH₂–CH₂–]ₙ',21)}<path d="M218 117 H268" stroke="#157a84" stroke-width="4"/>${tx(238,225,'POLYMER HÓA ETHYLENE',17)}`}
 else if(kind==='ester'){inner=`${tx(245,76,'CH₃COOH + C₂H₅OH',21)}${tx(245,137,'⇌',32)}${tx(245,198,'CH₃COOC₂H₅ + H₂O',21)}${tx(245,256,'ESTER HÓA THUẬN NGHỊCH',17)}`}
 else if(kind==='ion'){inner=`${rect(35,67,180,120)}${rect(270,67,180,120,'#dcf4e7')}${tx(122,119,'Na → Na⁺ + e⁻',17)}${tx(360,119,'Cl + e⁻ → Cl⁻',17)}${tx(240,238,'LỰC HÚT TĨNH ĐIỆN GIỮA CÁC ION',16)}`}
 else if(kind==='bond'){inner=`${rect(20,65,195,130)}${rect(265,65,195,130,'#deecf9')}${tx(116,119,'ION',24)}${tx(365,119,'CỘNG HÓA TRỊ',21)}${tx(116,156,'Cho – nhận e⁻',16)}${tx(365,156,'Dùng chung e⁻',16)}${tx(240,245,'BẢN CHẤT LIÊN KẾT',17)}`}
 else{inner=`${tx(240,70,'2H₂ + O₂ → 2H₂O',25)}${rect(30,105,420,75)}${tx(240,149,'Bảo toàn số nguyên tử từng nguyên tố',18)}${tx(240,244,'HỆ SỐ ≠ CHỈ SỐ',20)}`}
 return `<svg class="e47diagram" role="img" aria-label="Hình minh họa Hóa học chủ đề ${esc(name)}" viewBox="0 0 480 290" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`}
function maps(){let l=lesson();return `<div class="e47hero"><h1>🧠 Sơ đồ tư duy & hình minh họa</h1><p>Phương pháp giải theo bốn phần và hình trực quan theo chủ đề. Đây là minh họa khái niệm, không thay thế thí nghiệm hoặc sách giáo khoa.</p></div><div class="e47card e47diagramcard"><h2>${esc(l?.title||'Hóa học THPT')}</h2>${diagram(l?.title||'') }<p class="e47muted">Ví dụ minh họa được thiết kế riêng để dễ nhận biết bản chất; hãy đối chiếu điều kiện của từng phản ứng.</p></div>${mapType()}`}
function audit(){let k=quality();return `<div class="e47hero"><h1>🔍 Kiểm tra chất lượng và công thức</h1><p>Kiểm tra cấu trúc dữ liệu, trạng thái thẩm định và cảnh báo công thức; không tự sửa phản ứng hoặc suy đoán MathType mất dữ liệu.</p></div><div class="e47grid e47metrics">${[[k.total,'Câu trong ngân hàng'],[k.invalid.length,'Lỗi cấu trúc'],[k.missing.length,'Thiếu đường dẫn đối chiếu'],[k.flagged.length,'Cần giáo viên thẩm định']].map(x=>`<div class="e47card"><b class="e47metric">${x[0]}</b><p>${x[1]}</p></div>`).join('')}</div><div class="e47card"><h2>Chuẩn hóa công thức an toàn</h2><p>Mẫu hiển thị: H<sub>2</sub>SO<sub>4</sub> · Fe<sup>2+</sup> · SO<sub>4</sub><sup>2−</sup> · Al(OH)<sub>3</sub>. Các chỉ số nguồn dạng Unicode được giữ nguyên; chỉ chuyển kiểu chữ cho một số công thức ASCII rõ ràng.</p><p><b>Không tự thay nội dung gốc của 576 câu.</b> Cần giáo viên đối chiếu nếu gặp công thức mờ, thiếu số mũ, MathType/OLE lỗi, thiếu dữ kiện, trùng đáp án hoặc nghi vấn khoa học.</p><div class="e47actions"><button class="e47btn" onclick="EDP47.auditCSV()">⇩ Tải danh sách kiểm tra CSV</button><button class="e47btn" onclick="EDP47.page('start')">Quay lại luyện tập</button></div></div><div class="e47card"><h2>Nhóm nội dung cần rà soát trước phát hành</h2><p>Kiểm tra từng bài: dữ kiện – đáp án – lời giải – phương án nhiễu – nguồn, theo bốn mức nhận thức. Các cờ kiểm tra tự động chỉ phát hiện định dạng, không xác nhận kiến thức khoa học.</p>${k.invalid.slice(0,10).map(x=>`<div class="e47coverageRow"><span>${esc(x.id)}</span><b>Cấu trúc cần sửa</b></div>`).join('')}</div>`}
function makeCSV(rows){return '\ufeff'+rows.map(r=>r.map(x=>'"'+(/^[=+\-@\t\r]/.test(String(x??''))?"'":'')+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n')}
function download(name,text,type){let u=URL.createObjectURL(new Blob([text],{type}));let a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(u)},800)}
function exportData(){if(!S.items.length)return note('Chưa có đề được chọn.');let payload={schema:'EduPlan47_OneQuestionResult',version:VER,studentName:S.name,studentClass:S.klass,studentCode:S.code,grade:S.grade,lessonId:S.lesson,format:S.format,date:new Date().toISOString(),answers:S.answers,questionIds:S.items.map(q=>q.id),selfReview:S.mode==='result',finishedAt:S.completed?new Date(S.completed).toISOString():null,elapsedSeconds:S.time?Math.max(0,Math.round(((S.completed||Date.now())-S.time)/1000)):null};
 download(`EduPlan47_Bai_lam_${S.code||'hoc_sinh'}.json`,JSON.stringify(payload,null,2),'application/json')}
function auditCSV(){let rows=[['Mã câu','Khối','Bài','Phần','Mức độ','Hợp lệ cấu trúc','Nguồn đối chiếu','Trạng thái kiểm định']];data().forEach(q=>rows.push([q.id,q.g,q.lesson,q.type,q.lv,shape(q)?'Có':'CẦN SỬA',q.src||'',q.review||'Chưa xác định']));download('EduPlan47_Bao_cao_kiem_dinh.csv',makeCSV(rows),'text/csv;charset=utf-8')}
function render(){let root=one('edp47-root');if(!root){root=document.createElement('section');root.id='edp47-root';root.setAttribute('aria-label','EduPlan AI 4.7.1 – Chế độ làm bài từng câu');document.body.append(root)}
 let body=S.mode==='quiz'?question():S.mode==='result'?result():S.mode==='maps'?maps():S.mode==='audit'?audit():startPage();
 root.innerHTML=`<div class="e47top"><div class="e47brand"><span class="e47logo">⚗️</span><div><strong>EduPlan AI <i>4.7.1</i></strong><small>${AUTH}</small></div></div><div class="e47topActions"><button onclick="EDP47.page('start')">☰ Thiết lập</button><button onclick="EDP47.resume()">↩ Bài làm</button><button onclick="EDP47.page('maps')">🧠 Sơ đồ</button><button onclick="EDP47.page('audit')">🔎 Kiểm định</button><button class="e47close" onclick="EDP47.close()" title="Trở về EduPlan">× Đóng</button></div></div><main class="e47main">${body}<div class="e47footer">EduPlan AI 4.7.1 • ${AUTH} • Dữ liệu cục bộ, ngân hàng câu hỏi cần thẩm định trước khi thi chính thức. <a href="https://phet.colorado.edu/en/simulations/browse?subjects=chemistry" target="_blank" rel="noopener noreferrer">Mô phỏng PhET ↗</a></div></main><div id="e47notice" role="status" hidden>${esc(S.status)}</div>`;
 root.scrollTo({top:0}); if(S.mode==='quiz'){const h=root.querySelector('.e47qcard h2');h?.setAttribute('tabindex','-1');if(S.focusedAt!==S.at){S.focusedAt=S.at;h?.focus({preventScroll:true})}}else{S.focusedAt=-1}}
function page(p){if(!['start','maps','audit'].includes(p))return;if(['quiz','result'].includes(S.mode))S.returnMode=S.mode;S.mode=p;render()}
function resume(){if(S.items.length){S.mode=S.returnMode==='result'?'result':(S.mode==='result'?'result':'quiz');render();return}
 if(restoreDraft()){document.body.classList.add('edp47-on');render();return}note('Không có bản nháp hợp lệ.')}

function patchLegacy(){// Make the main student practice entry use the one-question flow by default.
 if(!window.EDP45||window.EDP45.__patched47)return;
 const old=window.EDP45.tab;
 window.EDP45.tab=function(x){if(x==='practice'){open('student');return}return old.call(this,x)};
 window.EDP45.__patched47=true;}
function attachLauncher(){if(one('edp47-open'))return;let button=document.createElement('button');button.id='edp47-open';button.textContent='🎯 Làm bài từng câu';button.title='Mở chế độ trả lời một câu rồi tự chuyển tiếp';button.onclick=()=>open('student');document.body.append(button)}
window.EDP47={open,close,reset,clearStudent,start,set,summary:()=>({mode:S.mode,count:S.items.length,at:S.at,types:Object.fromEntries(Object.keys(FORM).map(t=>[t,S.items.filter(q=>q.type===t).length]))}),mcq:answerMCQ,tf:answerTF,text:setWrittenAnswer,confirm:confirmAnswer,move,page,resume,maps(){page('maps')},audit(){page('audit')},auditCSV,export:exportData,stats:quality,restoreDraft(){let ok=restoreDraft();if(ok){document.body.classList.add('edp47-on');render()}return ok},valid:shape};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{attachLauncher();patchLegacy();open('student')});else{attachLauncher();patchLegacy();open('student')}
window.addEventListener('load',()=>setTimeout(()=>{document.title='EduPlan AI 4.7.1 – Hóa học THPT | Lê Bá Nhẫn'},1100));
})();
