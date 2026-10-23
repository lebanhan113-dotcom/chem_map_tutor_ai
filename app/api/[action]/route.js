import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { shuffled, createOptionOrders, displayQuestion, gradeSubmission, answerMatches, partsTF4, tf4Partial } from '../../../lib/exam.mjs';
import { quotaFromPercent, selectByBlueprint } from '../../../lib/blueprint.mjs';
import { calcInsights, learningPlan } from '../../../lib/insights.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const fail = (error,status=400) => Response.json({error},{status});
const ok = data => Response.json(data);
const safe = s => String(s ?? '').trim();
const normalize = s => safe(s).normalize('NFKC').toLocaleLowerCase('vi').replace(/\s+/g,' ');
const idList = xs => Array.isArray(xs) ? [...new Set(xs.filter(x => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(String(x))))].slice(0,100) : [];
const LIMIT = 9000;
function supa(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw Error('Chưa cấu hình Supabase URL và service role key ở máy chủ.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
async function actor(req,db){
 const bearer=req.headers.get('authorization')||'';
 if(!bearer.startsWith('Bearer '))return null;
 const {data:{user},error}=await db.auth.getUser(bearer.slice(7));
 if(error||!user)return null;
 const {data:profile}=await db.from('profiles').select('id,role,display_name').eq('id',user.id).maybeSingle();
 return {id:user.id,email:user.email,role:profile?.role||'student',name:profile?.display_name||user.user_metadata?.display_name||''};
}
async function getBody(req){if(Number(req.headers.get('content-length')||0)>2200000)throw Error('Payload exceeds 2.2 MB. Split imports into batches.');try{return await req.json()}catch{return {}}}
function checkDb(result){if(result.error)throw Error(result.error.message);return result.data;}
function validateQuestion(q){
 const grade=Number(q.grade);const kind=['mcq','true_false','tf4','short'].includes(q.kind)?q.kind:'mcq';
 const difficulty=['NB','TH','VD','VDC'].includes(q.difficulty)?q.difficulty:'TH';
 const stem=safe(q.stem).slice(0,2500),answer=safe(q.answer).slice(0,700);
 let options=['mcq','tf4'].includes(kind) ? (q.options||{}):{};
 if(['mcq','tf4'].includes(kind)){
   options=Object.fromEntries(['A','B','C','D'].map(k=>[k,safe(options[k]).slice(0,600)]));
   if(Object.values(options).some(x=>!x))throw Error('Please fill all four options or statements A-D.');
   if(kind==='mcq'&&!['A','B','C','D'].includes(answer))throw Error('MCQ answer must be A/B/C/D.');
   if(kind==='tf4'&&!partsTF4(answer))throw Error('TF4 answer must use four D/S or Dung/Sai values, e.g. D,S,D,S.');
 }
 if(kind==='true_false' && !['Đúng','Sai'].includes(answer))throw Error('Đúng/Sai cần đáp án Đúng hoặc Sai.');
 if(!Number.isInteger(grade)||grade<10||grade>12||!stem||!answer)throw Error('Thiếu khối lớp, nội dung hoặc đáp án hợp lệ.');
 return {grade,kind,difficulty,stem,answer,options,chapter:safe(q.chapter).slice(0,140),lesson:safe(q.lesson).slice(0,140),explanation:safe(q.explanation).slice(0,2000),source_title:safe(q.source_title).slice(0,200),source_url:safe(q.source_url).slice(0,500),nls_tags:Array.isArray(q.nls_tags)?q.nls_tags.filter(x=>['6.1','6.2','6.3'].includes(x)):[],practice_enabled:false};
}
async function searchWiki(keyword,lang){
 const u=new URL(`https://${lang}.wikipedia.org/w/api.php`);
 Object.entries({action:'query',generator:'search',gsrsearch:keyword,gsrlimit:'5',prop:'extracts',exintro:'1',explaintext:'1',exsentences:'3',format:'json'}).forEach(([k,v])=>u.searchParams.set(k,v));
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),6000);
 try{
  const r=await fetch(u,{headers:{'user-agent':'EduPlanAI/5.5 (educational source attribution; contact via website)'},signal:ctrl.signal,cache:'no-store'});
  if(!r.ok)return [];
  const j=await r.json();return Object.values(j.query?.pages||{}).slice(0,5).filter(x=>x.pageid).map(x=>({
   title:safe(x.title).slice(0,180),url:`https://${lang}.wikipedia.org/?curid=${x.pageid}`,
   excerpt:safe(x.extract).slice(0,650),publisher:lang==='vi'?'Wikipedia vi (secondary reference)':'Wikipedia en (secondary reference)',
   retrieved_at:new Date().toISOString()
  }));
 }catch{return []}finally{clearTimeout(timer)}
}
async function searchPubChem(keyword){
 // Exact compound lookup, not a full-text crawler; PubChem may reject broad lesson names.
 if(!keyword||keyword.length>65)return [];
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),5000);
 try{
  const endpoint=`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(keyword)}/description/JSON`;
  const r=await fetch(endpoint,{signal:ctrl.signal,cache:'no-store'});
  if(!r.ok)return [];
  const j=await r.json();
  return (j.InformationList?.Information||[]).filter(x=>x.CID&&x.Description).slice(0,2).map(x=>({
   title:`PubChem: ${safe(x.Title||keyword).slice(0,120)}`,
   url:`https://pubchem.ncbi.nlm.nih.gov/compound/${x.CID}`,
   excerpt:safe(x.Description).slice(0,650),publisher:'PubChem (NIH/NLM)',retrieved_at:new Date().toISOString()
  }));
 }catch{return []}finally{clearTimeout(timer)}
}
async function searchOnline(term){
 const keyword=safe(term).slice(0,100);
 if(!keyword)return [];
 const [vi,en,pubchem]=await Promise.all([searchWiki(keyword,'vi'),searchWiki(keyword,'en'),searchPubChem(keyword)]);
 const seen=new Set();
 return [...pubchem,...vi,...en].filter(x=>{if(seen.has(x.url))return false;seen.add(x.url);return true}).slice(0,8);
}
async function gemini(prompt,json=false){
 if(!process.env.GEMINI_API_KEY)throw Error('Chưa cấu hình GEMINI_API_KEY, vui lòng thiết lập ở máy chủ để kích hoạt AI.');
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.25,maxOutputTokens:4500,...(json?{responseMimeType:'application/json'}:{})}}),cache:'no-store'});
 const raw=await resp.json();if(!resp.ok)throw Error('Gemini: '+safe(raw.error?.message||resp.status).slice(0,220));
 const text=raw.candidates?.[0]?.content?.parts?.map(v=>v.text||'').join('')||'';
 if(!text)throw Error('AI không trả về nội dung.');return json?JSON.parse(text):text;
}
async function testForStudent(db,test,teacher=false){
 const questionIds=idList(test.question_ids);
 if(!questionIds.length)throw Error('No questions available.');
 const rows=checkDb(await db.from('question_bank').select('*').in('id',questionIds));
 const map=new Map(rows.map(q=>[q.id,q]));
 if(map.size!==questionIds.length)throw Error('Question bank is incomplete for this test.');
 const { option_orders, owner_id, ...publicTest }=test;
 return {
  ...(teacher?test:publicTest),
  questions:questionIds.map(id=>displayQuestion(test,map.get(id),teacher))
 };
}
async function startStudentExam(db,test,user){
 const existing=checkDb(await db.from('test_sessions').select('started_at,expires_at').eq('test_id',test.id).eq('student_id',user.id).maybeSingle());
 if(existing){if(Date.now()>new Date(existing.expires_at).getTime())throw Error('TIME_EXPIRED');return existing;}
 const now=new Date(),expires=new Date(now.getTime()+test.duration_minutes*60*1000);
 const {error}=await db.from('test_sessions').insert({test_id:test.id,student_id:user.id,started_at:now.toISOString(),expires_at:expires.toISOString()});
 if(error && error.code!=='23505')throw Error(error.message);
 return checkDb(await db.from('test_sessions').select('started_at,expires_at').eq('test_id',test.id).eq('student_id',user.id).single());
}
async function teacherTests(db,user){return checkDb(await db.from('tests').select('*').eq('owner_id',user.id).order('created_at',{ascending:false}));}
export async function GET(req,{params}){
 try{
  const {action}=await params;const db=supa();const user=await actor(req,db);
  if(!user)return fail('Vui lòng đăng nhập.',401);
  const url=new URL(req.url),p=url.searchParams;
  if(action==='me')return ok({user});
  if(action==='questions'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được xem ngân hàng đáp án.',403);
   const all=[];
   for(let start=0;start<5000;start+=1000){
     let q=db.from('question_bank').select('*').eq('owner_id',user.id).order('created_at',{ascending:false}).range(start,start+999);
     if(['10','11','12'].includes(p.get('grade')))q=q.eq('grade',Number(p.get('grade')));
     const batch=checkDb(await q);all.push(...batch);
     if(batch.length<1000)break;
   }
   return ok({questions:all,capped:all.length===5000});
  }
  if(action==='tests'){
   if(user.role==='teacher')return ok({tests:await teacherTests(db,user)});
   // Do not publish active exam share codes to every logged-in student.
   return ok({tests:[]});
  }
  if(action==='test'){
   const code=safe(p.get('code')).toUpperCase();
   if(!code)return fail('Thiếu mã đề.');
   const t=checkDb(await db.from('tests').select('*').eq('share_code',code).maybeSingle());
   if(!t)return fail('Không tìm thấy mã đề.',404);
   const teacher=t.owner_id===user.id&&user.role==='teacher';
   if(!t.published&&!teacher)return fail('Đề chưa được công bố.',403);
   if(!teacher){
     const prior=checkDb(await db.from('attempts').select('id').eq('test_id',t.id).eq('student_id',user.id).maybeSingle());
     if(prior)return fail('Bai nay da duoc nop. Xem chi tiet trong muc Ket qua.',409);
     const started=await startStudentExam(db,t,user);
     const output=await testForStudent(db,t,false);return ok({test:{...output,started_at:started.started_at,expires_at:started.expires_at}});
   }
   return ok({test:await testForStudent(db,t,teacher)});
  }
  if(action==='practice-questions'){
   const grade=[10,11,12].includes(Number(p.get('grade')))?Number(p.get('grade')):10;
   const rows=checkDb(await db.from('question_bank').select('id,stem,options,kind,difficulty,chapter,lesson,grade,nls_tags').eq('verified',true).eq('practice_enabled',true).eq('grade',grade).limit(500));
   return ok({questions:shuffled(rows).slice(0,8)});
  }
  if(action==='attempts'){
   if(user.role==='teacher'){
    const tests=await teacherTests(db,user);const ids=tests.map(t=>t.id);
    if(!ids.length)return ok({attempts:[],tests});
    const arr=checkDb(await db.from('attempts').select('id,test_id,student_id,score,submitted_at').in('test_id',ids).order('submitted_at',{ascending:false}).limit(1000));
    const stuIds=[...new Set(arr.map(a=>a.student_id))];
    const people=stuIds.length?checkDb(await db.from('profiles').select('id,display_name').in('id',stuIds)):[];
    const names=new Map(people.map(x=>[x.id,x.display_name]));
    return ok({attempts:arr.map(a=>({...a,student_name:names.get(a.student_id)||'Chưa khai báo'})),tests});
   }
   const arr=checkDb(await db.from('attempts').select('id,test_id,score,submitted_at,details').eq('student_id',user.id).order('submitted_at',{ascending:false}).limit(100));
   const ids=[...new Set(arr.map(a=>a.test_id))];
   const tests=ids.length?checkDb(await db.from('tests').select('id,title').in('id',ids)):[];
   const names=new Map(tests.map(t=>[t.id,t.title]));
   return ok({attempts:arr.map(a=>({...a,test_title:names.get(a.test_id)||'Bai kiem tra'}))});
  }
  if(action==='insights'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được xem thống kê câu hỏi.',403);
   const ids=(await teacherTests(db,user)).map(x=>x.id);
   if(!ids.length)return ok({insights:calcInsights([])});
   // 1,000 most recent submissions; do not claim these are whole-population results.
   const rows=checkDb(await db.from('attempts').select('id,details').in('test_id',ids).order('submitted_at',{ascending:false}).limit(1000));
   return ok({insights:calcInsights(rows)});
  }
  if(action==='study-plan'){
   if(user.role!=='student')return fail('Chỉ học sinh có lộ trình tự học.',403);
   const rows=checkDb(await db.from('attempts').select('id,details').eq('student_id',user.id).order('submitted_at',{ascending:false}).limit(40));
   return ok({plan:learningPlan(rows)});
  }
  if(action==='stats'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được xem thống kê.',403);
   const v=checkDb(await db.rpc('eduplan_visit_stats'));
   const attempts=checkDb(await db.rpc('eduplan_teacher_attempt_stats',{p_teacher:user.id}));
   const tests=await teacherTests(db,user);
   return ok({...v,...attempts,total_tests:tests.length});
  }
  if(action==='references')return ok({references:[
   {title:'Bộ GDĐT – Khung năng lực số (Thông tư 02/2025)',url:'https://vanban.chinhphu.vn/?classid=1&docid=212648&orggroupid=4&pageid=27160',publisher:'Bộ GDĐT'},
   {title:'PhET – Mô phỏng khoa học tương tác',url:'https://phet.colorado.edu/vi/',publisher:'University of Colorado Boulder'},
   {title:'PubChem – Dữ liệu hợp chất hóa học',url:'https://pubchem.ncbi.nlm.nih.gov/',publisher:'NIH/NLM'},
   {title:'OpenStax Chemistry 2e – Open textbook',url:'https://openstax.org/details/books/chemistry-2e',publisher:'OpenStax / Rice University'},
   {title:'Chemistry LibreTexts – Học liệu mở',url:'https://chem.libretexts.org/',publisher:'LibreTexts'},
   {title:'IUPAC Gold Book – Thuật ngữ Hóa học',url:'https://goldbook.iupac.org/',publisher:'IUPAC'},
   {title:'Wikipedia tiếng Việt – Tra cứu và đối chiếu',url:'https://vi.wikipedia.org/',publisher:'Wikimedia (thứ cấp)'}]});
  if(action==='search'){const q=safe(p.get('q'));return ok({sources:await searchOnline(q)});}
  return fail('Không tìm thấy API.',404);
 }catch(e){return fail(e.message==='TIME_EXPIRED'?'Test duration has expired.':e.message,e.message==='TIME_EXPIRED'?410:500)}
}
export async function POST(req,{params}){
 try{
  const {action}=await params,db=supa(),body=await getBody(req);
  if(action==='visit'){
   // Unauthenticated counters are indicative only; reject cross-origin browser writes.
   const origin=req.headers.get('origin');
   if(origin && new URL(origin).host!==new URL(req.url).host)return fail('Origin not allowed.',403);
   const vid=safe(body.visitor_id).slice(0,80);
   if(!/^[0-9a-f-]{20,80}$/i.test(vid))return fail('ID trình duyệt không hợp lệ.');
   const page=safe(body.page||'/').slice(0,100);
   const recent=checkDb(await db.from('visits').select('visited_at').eq('visitor_id',vid).eq('page',page).order('visited_at',{ascending:false}).limit(1));
   if(recent.length&&Date.now()-new Date(recent[0].visited_at).getTime()<15000)return ok({saved:false,reason:'duplicate_within_15s'});
   const authenticated=await actor(req,db);
   const {error}=await db.from('visits').insert({visitor_id:vid,page,account_id:authenticated?.id||null});
   if(error)throw Error(error.message);
   return ok({saved:true});
  }
  const user=await actor(req,db);if(!user)return fail('Vui lòng đăng nhập.',401);
  if(action==='question'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được biên soạn câu hỏi.',403);
   const q=validateQuestion(body);
   const created=checkDb(await db.from('question_bank').insert({...q,owner_id:user.id,verified:false}).select().single());
   return ok({question:created});
  }
  if(action==='import-questions'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được nhập ngân hàng.',403);
   const inputs=Array.isArray(body.questions)?body.questions.slice(0,100):[];
   if(!inputs.length)return fail('Không có câu hỏi trong lô nhập.');
   const rows=[],errors=[];
   const existing=[];
   for(let offset=0;offset<5000;offset+=1000){
      const chunk=checkDb(await db.from('question_bank').select('grade,stem').eq('owner_id',user.id).range(offset,offset+999));
      existing.push(...chunk);if(chunk.length<1000)break;
   }
   const dedup=new Set(existing.map(x=>x.grade+'|'+normalize(x.stem)));
   for(let i=0;i<inputs.length;i++){
    try{
     const q=inputs[i];
     const grade=q.grade??q.g;
     let opts=q.options??q.choices??{};
     if(Array.isArray(opts))opts=Object.fromEntries(opts.slice(0,4).map((v,j)=>['ABCD'[j],v]));
     const obj=validateQuestion({...q,grade,stem:q.stem??q.question??q.content,kind:q.kind??'mcq',options:opts,answer:q.answer??q.correct,difficulty:q.difficulty??q.level,chapter:q.chapter??q.chuong??'',lesson:q.lesson??q.bai??''});
     const fingerprint=obj.grade+'|'+normalize(obj.stem);
     if(dedup.has(fingerprint)){errors.push({row:i+1,error:'Câu hỏi trùng nội dung trong kho hoặc lô nhập.'});continue;}
     dedup.add(fingerprint);
     rows.push({...obj,owner_id:user.id,verified:false,source_title:'Học liệu nhập tệp – yêu cầu giáo viên kiểm tra'});
    }catch(e){errors.push({row:i+1,error:e.message})}
   }
   if(rows.length)checkDb(await db.from('question_bank').insert(rows));
   return ok({inserted:rows.length,rejected:errors.length,errors:errors.slice(0,5),notice:'Tất cả câu nhập tệp được đặt ở trạng thái chờ duyệt.'});
  }
  if(action==='approve'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được duyệt câu hỏi.',403);
   const id=safe(body.id);
   if(!body.verified){const linked=checkDb(await db.from('tests').select('id').eq('owner_id',user.id).contains('question_ids',[id]).limit(1));
    if(linked.length)return fail('Question is linked to an exam, so approval cannot be revoked.',409);}
   const q=checkDb(await db.from('question_bank').update({verified:!!body.verified}).eq('owner_id',user.id).eq('id',id).select().maybeSingle());
   return q?ok({question:q}):fail('Không tìm thấy câu hỏi.',404);
  }
  if(action==='practice-toggle'){
   if(user.role!=='teacher')return fail('Teacher access required.',403);
   const id=safe(body.id);
   if(body.practice_enabled){
    const used=checkDb(await db.from('tests').select('id').eq('owner_id',user.id).eq('published',true).contains('question_ids',[id]).limit(1));
    if(used.length)return fail('This question is in an active published test. Unpublish the test first.',409);
   }
   const result=checkDb(await db.from('question_bank').update({practice_enabled:!!body.practice_enabled}).eq('id',id).eq('owner_id',user.id).eq('verified',true).select('id,practice_enabled').maybeSingle());
   if(!result)return fail('Only verified questions can be assigned to practice.',400);
   return ok({question:result});
  }
  if(action==='edit-question'){
   if(user.role!=='teacher')return fail('Teacher access required.',403);
   const id=safe(body.id);
   const linked=checkDb(await db.from('tests').select('id').eq('owner_id',user.id).contains('question_ids',[id]).limit(1));
   if(linked.length)return fail('Question belongs to a saved exam. Duplicate it as a new question instead of changing its answer.',409);
   const q=validateQuestion(body);
   const result=checkDb(await db.from('question_bank').update({...q,verified:false}).eq('owner_id',user.id).eq('id',id).select().maybeSingle());
   return result?ok({question:result,notice:'Editing a question requires reapproval.'}):fail('Question not found.',404);
  }
  if(action==='seed'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được nạp học liệu.',403);
   const seed=(await import('../../../data/seed.json')).default;
   const current=checkDb(await db.from('question_bank').select('stem').eq('owner_id',user.id).limit(1000));
   const known=new Set(current.map(q=>q.stem));
   const rows=seed.filter(q=>!known.has(q.stem)).map(q=>({...validateQuestion(q),owner_id:user.id,verified:false,source_title:'Câu hỏi mẫu do giáo viên biên soạn; cần đối chiếu trước sử dụng chính thức.'}));
   if(rows.length)checkDb(await db.from('question_bank').insert(rows));
   return ok({inserted:rows.length});
  }
  if(action==='create-test'){
   if(user.role!=='teacher')return fail('Teacher access required.',403);
   const grade=Number(body.grade);
   if(![10,11,12].includes(grade))return fail('Invalid grade.');
   let ids=idList(body.question_ids);
   let questions=[];
   const auto=!!body.auto_blueprint;
   let matrix=null;
   if(auto){
     const total=Number(body.count),quotas=quotaFromPercent(total,body.percentages||{});
     const nlsMin=Number(body.nls_min||0);
     const all=[];
     for(let offset=0;offset<5000;offset+=1000){
       const r=checkDb(await db.from('question_bank')
         .select('id,grade,kind,verified,owner_id,chapter,lesson,practice_enabled,difficulty,nls_tags')
         .eq('owner_id',user.id).eq('grade',grade).eq('verified',true).range(offset,offset+999));
       all.push(...r);if(r.length<1000)break;
     }
     const matching=all.filter(q=>(!safe(body.chapter)||normalize(q.chapter).includes(normalize(body.chapter))) &&
       (!safe(body.lesson)||normalize(q.lesson).includes(normalize(body.lesson))));
     const choice=selectByBlueprint(matching,quotas,nlsMin);
     if(choice.missing.length)return fail('Ma trận thiếu câu đã duyệt: '+choice.missing.map(x=>`${x.level} cần ${x.need}, có ${x.available}`).join('; ')+'. Hãy bổ sung/duyệt câu trước khi phát hành.',409);
     ids=choice.ids;
     matrix={quotas,nlsMin,nlsFound:choice.nlsFound};
     questions=matching.filter(q=>ids.includes(q.id));
   }else{
     if(!ids.length)return fail('Select at least one verified question.');
     questions=checkDb(await db.from('question_bank').select('id,grade,kind,verified,owner_id,chapter,lesson,practice_enabled,difficulty,nls_tags').eq('owner_id',user.id).in('id',ids));
   }
   if(questions.length!==ids.length||questions.some(q=>!q.verified||q.grade!==grade))return fail('Only approved questions from this teacher and grade are allowed.');
   const kind=['theo_bai','theo_chuong','thuong_xuyen','giua_ki_1','giua_ki_2'].includes(body.exam_kind)?body.exam_kind:'thuong_xuyen';
   const chapter=safe(body.chapter).slice(0,140),lesson=safe(body.lesson).slice(0,140);
   if(kind==='theo_bai'&&!lesson)return fail('Enter a lesson for a lesson-level test.');
   if(kind==='theo_chuong'&&!chapter)return fail('Enter a chapter for a chapter-level test.');
   if(kind==='theo_bai'&&questions.some(q=>!q.lesson.toLocaleLowerCase('vi').includes(lesson.toLocaleLowerCase('vi'))))return fail('Selected questions do not all match the lesson.');
   if(kind==='theo_chuong'&&questions.some(q=>!q.chapter.toLocaleLowerCase('vi').includes(chapter.toLocaleLowerCase('vi'))))return fail('Selected questions do not all match the chapter.');
   const title=safe(body.title).slice(0,180);
   if(!title)return fail('Enter a test name.');
   const variants_count=Math.max(1,Math.min(6,Math.trunc(Number(body.variants_count)||1)));
   const group=randomBytes(16).toString('hex');
   const rows=Array.from({length:variants_count},(_,v)=>({
    owner_id:user.id,title,grade,chapter,lesson,exam_kind:kind,
    question_ids:shuffled(ids),option_orders:createOptionOrders(questions),
    variant_group:group,variant_number:v+1,
    share_code:randomBytes(6).toString('hex').toUpperCase(),
    duration_minutes:Math.max(5,Math.min(180,Number(body.duration_minutes)||30)),
    published:!!body.published
   }));
   if(rows[0].published){
    const inPractice=questions.filter(q=>q.practice_enabled).map(q=>q.id);
    if(inPractice.length)checkDb(await db.from('question_bank').update({practice_enabled:false}).eq('owner_id',user.id).in('id',inPractice));
   }
   const created=checkDb(await db.from('tests').insert(rows).select());
   return ok({test:created[0],tests:created,matrix,notice:'Question and answer options are shuffled independently for each version.'});
  }
  if(action==='publish'){
   if(user.role!=='teacher')return fail('Chỉ giáo viên được công bố đề.',403);
   const target=checkDb(await db.from('tests').select('question_ids').eq('owner_id',user.id).eq('id',safe(body.id)).maybeSingle());
   if(!target)return fail('Test not found.',404);
   if(body.published){const ids=idList(target.question_ids);if(ids.length)checkDb(await db.from('question_bank').update({practice_enabled:false}).eq('owner_id',user.id).in('id',ids));}
   const t=checkDb(await db.from('tests').update({published:!!body.published}).eq('owner_id',user.id).eq('id',safe(body.id)).select().maybeSingle());
   return t?ok({test:t}):fail('Không tìm thấy đề.',404);
  }
  if(action==='check-practice'){
   const id=safe(body.question_id);const q=checkDb(await db.from('question_bank').select('*').eq('id',id).eq('verified',true).eq('practice_enabled',true).maybeSingle());
   if(!q)return fail('Question is not available for public practice.',404);
   const partial=q.kind==='tf4'?tf4Partial(safe(body.answer),q.answer):null;
   return ok({correct:partial?partial.correct_parts===4:answerMatches(safe(body.answer),q.answer,q.kind),correct_parts:partial?.correct_parts,earned:partial?.earned,answer:q.answer,explanation:q.explanation,stem:q.stem});
  }
  if(action==='submit'){
   if(user.role==='teacher')return fail('Dùng tài khoản học sinh để nộp bài.',403);
   const t=checkDb(await db.from('tests').select('*').eq('share_code',safe(body.code).toUpperCase()).eq('published',true).maybeSingle());
   if(!t)return fail('Mã đề không hợp lệ hoặc chưa công bố.',404);
   const earlier=checkDb(await db.from('attempts').select('id').eq('test_id',t.id).eq('student_id',user.id).maybeSingle());
   if(earlier)return fail('Bạn đã nộp bài kiểm tra này. Mỗi học sinh chỉ nộp một lần.',409);
   const session=checkDb(await db.from('test_sessions').select('expires_at').eq('test_id',t.id).eq('student_id',user.id).maybeSingle());
   if(!session)return fail('Open the exam before submitting.',403);
   if(Date.now()>new Date(session.expires_at).getTime()+30000)return fail('Đã quá hạn nộp bài (cho phép 30 giây truyền dữ liệu).',410);
   const qids=idList(t.question_ids);
   const questions=checkDb(await db.from('question_bank').select('*').in('id',qids));
   const answers=body.answers&&typeof body.answers==='object'&&!Array.isArray(body.answers)?body.answers:{};
   const {correct,score,total,details}=gradeSubmission(t,questions,answers);
   const response=await db.from('attempts').insert({test_id:t.id,student_id:user.id,answers,details,score}).select('id,score,submitted_at').single();
   if(response.error?.code==='23505')return fail('Bài đã được nộp từ một thiết bị khác.',409);
   const rec=checkDb(response);
   return ok({result:{...rec,correct,total,details,title:t.title}});
  }
  if(action==='ai'){
   const dayAgo=new Date(Date.now()-24*60*60*1000).toISOString();
   const quota=user.role==='teacher'?80:40;
   const {count:used,error:usageError}=await db.from('ai_usage').select('id',{count:'exact',head:true}).eq('account_id',user.id).gte('requested_at',dayAgo);
   if(usageError)throw Error(usageError.message);
   if(used>=quota)return fail(`Đã đạt giới hạn ${quota} lượt gọi AI/24 giờ, vui lòng thử lại sau.`,429);
   checkDb(await db.from('ai_usage').insert({account_id:user.id}).select('id'));
   const mode=safe(body.mode);const focusNls=!!body.focus_nls;const grade=[10,11,12].includes(Number(body.grade))?Number(body.grade):11;
   const topic=safe(body.topic).slice(0,160),question=safe(body.question).slice(0,LIMIT);
   if(!question && mode!=='generate')return fail('Nhập nội dung bài tập/câu hỏi.');
   if(mode==='tutor'){
    const prompt=`Bạn là giáo viên chuyên Hóa học THPT Việt Nam; dạy khối ${grade}. Hãy GIẢI CHI TIẾT VỪA ĐỦ, viết công thức hóa học chính xác, nêu phương pháp, bước làm, đáp án, kiểm tra điều kiện/đơn vị; nhận diện lỗi sai và gắn thẻ 6.1/6.2/6.3 NLS/AI nếu có. Nếu dữ liệu thiếu hãy hỏi thêm, tuyệt đối không bịa. Không hướng dẫn tiến hành thí nghiệm nguy hiểm. Bài tập: ${question}`;
    return ok({answer:await gemini(prompt)});
   }
   if(mode==='generate'){
    if(user.role!=='teacher')return fail('Chỉ giáo viên được tạo bản nháp câu hỏi bằng AI.',403);
    const n=Math.max(1,Math.min(8,Number(body.count)||4));
    const targetDifficulty=['NB','TH','VD','VDC'].includes(body.target_difficulty)?body.target_difficulty:null;
    const sources=await searchOnline(topic||`Hóa học ${grade} ${question.slice(0,50)}`).catch(()=>[]);
    const ctx=sources.map(x=>`${x.title}: ${x.excerpt} (${x.url})`).join('\n').slice(0,2500);
    const nlsGuidance=focusNls?'Trong so cau nay, uu tien tinh huong yeu cau hoc sinh xac minh loi giai AI ve hoa hoc, danh gia du lieu truc tuyen hoac su dung cong cu AI dung dan. Gan the NLS/AI CHI khi cau hoi thuc su danh gia 6.1 hieu biet AI, 6.2 ung dung AI, hay 6.3 danh gia AI.':'Khong ep gan nhan nang luc so neu bai toan khong lien quan.';
    const prompt=`Vai trò: giáo viên Hóa học THPT dày dạn, soạn ${n} câu trắc nghiệm 4 đáp án theo CTGDPT 2018, khối ${grade}, ${targetDifficulty?'MỨC ĐỘ BẮT BUỘC: '+targetDifficulty+'. Đúng định nghĩa mức độ theo yêu cầu năng lực, không đổi mức nếu câu chưa phù hợp.':'đủ độ phân hóa bốn mức'}, chủ đề '${topic}', yêu cầu bổ sung '${question.slice(0,600)}'. ${nlsGuidance} Tham khảo các trích dẫn trực tuyến này như gợi ý cần đối chiếu: ${ctx}. Chỉ viết kiến thức đúng, không sao chép nguyên câu hỏi từ nguồn. Trả về đối tượng JSON {"questions":[{"grade":${grade},"chapter":"${topic.replaceAll('"','')}","lesson":"${topic.replaceAll('"','')}","kind":"mcq","difficulty":"NB|TH|VD|VDC","stem":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A|B|C|D","explanation":"...","nls_tags":[]}]}. Chỉ gắn thẻ 6.1/6.2/6.3 khi nội dung câu yêu cầu vận dụng hoặc đánh giá AI một cách thực chất; câu Hóa học thông thường phải để []. Không đưa dạng khác, không markdown. Câu phải kiểm chứng, không tạo nếu không chắc. Mỗi câu chỉ có 1 đáp án đúng.`;
    const obj=await gemini(prompt,true),input=Array.isArray(obj.questions)?obj.questions.slice(0,8):[];
    const accepted=[];for(const draft of input){try{const question=validateQuestion(draft);if(targetDifficulty&&question.difficulty!==targetDifficulty)continue;accepted.push({...question,owner_id:user.id,verified:false,source_title:'Bản nháp do AI đề xuất – đối chiếu nguồn trước khi duyệt',source_url:''})}catch{}}
    if(!accepted.length)throw Error('AI không tạo được câu hỏi đúng cấu trúc; chưa lưu dữ liệu.');
    const saved=checkDb(await db.from('question_bank').insert(accepted).select());
    return ok({questions:saved,sources,notice:'Các câu hỏi ở trạng thái CHỜ DUYỆT. Giáo viên phải kiểm chứng đáp án trước khi sử dụng.'});
   }
   return fail('Chế độ AI không hợp lệ.');
  }
  return fail('Không tìm thấy API.',404);
 }catch(e){return fail(e.message,/quota|429/i.test(e.message)?429:500)}
}
