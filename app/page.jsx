'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {quotaFromPercent} from '../lib/quota.mjs';
import {Atom,BookOpen,BrainCircuit,ChartNoAxesCombined,Check,CheckCircle2,ClipboardList,Database,Download,ExternalLink,FileQuestion,FlaskConical,GraduationCap,House,LogIn,LogOut,Menu,Plus,RefreshCcw,Search,Send,Settings,ShieldCheck,Shuffle,Users,Video, X} from 'lucide-react';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'';
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'';
const sb=url&&key?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true}}):null;
const MODES=[['theo_bai','Theo từng bài'],['theo_chuong','Theo từng chương'],['thuong_xuyen','Kiểm tra thường xuyên'],['giua_ki_1','Giữa học kì I'],['giua_ki_2','Giữa học kì II']];
const DLEVEL=[['NB','Nhận biết'],['TH','Thông hiểu'],['VD','Vận dụng'],['VDC','Vận dụng cao']];
const NLS={'6.1':'Hiểu biết về AI','6.2':'Ứng dụng AI','6.3':'Đánh giá AI'};
function fmt(x){try{return new Date(x).toLocaleString('vi-VN')}catch{return x||''}}
function Button({children,onClick,variant='primary',disabled=false,type='button'}){return <button className={`btn ${variant}`} type={type} onClick={onClick} disabled={disabled}>{children}</button>}
function Pill({children,tone='blue'}){return <span className={'pill '+tone}>{children}</span>}
const initialQuestion={grade:10,chapter:'',lesson:'',kind:'mcq',difficulty:'TH',stem:'',options:{A:'',B:'',C:'',D:''},answer:'A',explanation:'',nls_tags:[]};
function Select({value,onChange,options}){return <select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select>}
export default function Page(){
 const [session,setSession]=useState(null),[me,setMe]=useState(null),[authEmail,setAuthEmail]=useState(''),[authPass,setAuthPass]=useState(''),[authName,setAuthName]=useState(''),[register,setRegister]=useState(false);
 const [tab,setTab]=useState('home'),[grade,setGrade]=useState('10'),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[drawer,setDrawer]=useState(false);
 const [questions,setQuestions]=useState([]),[tests,setTests]=useState([]),[attempts,setAttempts]=useState([]),[stats,setStats]=useState(null);
 const [editQuestionId,setEditQuestionId]=useState(null),[qform,setQform]=useState(initialQuestion),[selected,setSelected]=useState([]),[examTitle,setExamTitle]=useState('Kiểm tra Hóa học'),[examKind,setExamKind]=useState('thuong_xuyen'),[examDuration,setExamDuration]=useState(30),[examCount,setExamCount]=useState(10),[examTopic,setExamTopic]=useState(''),[examLesson,setExamLesson]=useState('');
 const [variantCount,setVariantCount]=useState(1),[newCodes,setNewCodes]=useState([]),[remaining,setRemaining]=useState(null);
 const [autoBlueprint,setAutoBlueprint]=useState(true),[percentage,setPercentage]=useState({NB:30,TH:40,VD:20,VDC:10}),[nlsMin,setNlsMin]=useState(0);
 const [insights,setInsights]=useState(null),[studyPlan,setStudyPlan]=useState(null),[saveStatus,setSaveStatus]=useState('');
 const autoSubmitted=useRef(false);
 const [examCode,setExamCode]=useState(''),[activeExam,setActiveExam]=useState(null),[answers,setAnswers]=useState({}),[result,setResult]=useState(null),[startedAt,setStartedAt]=useState(null);
 const [practiceQuestions,setPracticeQuestions]=useState([]),[practiceAnswers,setPracticeAnswers]=useState({}),[practiceFeedback,setPracticeFeedback]=useState({});
 const [focusNls,setFocusNls]=useState(false),[askText,setAskText]=useState(''),[aiAnswer,setAiAnswer]=useState(''),[aiTopic,setAiTopic]=useState(''),[aiCount,setAiCount]=useState(4);
 const [refs,setRefs]=useState([]),[searchQ,setSearchQ]=useState(''),[sources,setSources]=useState([]);
 const teacher=me?.role==='teacher';
 const alert=(text)=>setMessage(text);
 const call=useCallback(async (action,method='GET',payload)=>{
  const token=(await sb?.auth.getSession())?.data?.session?.access_token;
  const resp=await fetch('/api/'+action,{method,headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
  const data=await resp.json().catch(()=>({error:'Máy chủ trả về phản hồi không hợp lệ.'}));
  if(!resp.ok)throw Error(data.error||('HTTP '+resp.status));return data;
 },[]);
 const run=async fn=>{setBusy(true);setMessage('');try{await fn()}catch(e){alert(e.message)}finally{setBusy(false)}};
 useEffect(()=>{
  if(!sb)return;
  sb.auth.getSession().then(({data})=>setSession(data.session));
  const {data:{subscription}}=sb.auth.onAuthStateChange((_evt,s)=>{setSession(s);if(!s){setMe(null);setActiveExam(null);setResult(null)}});
  return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{if(!session){setMe(null);return}call('me').then(x=>setMe(x.user)).catch(e=>alert(e.message))},[session?.access_token,call]);
 useEffect(()=>{let timer;try{
   if(navigator.doNotTrack==='1')return;
   let v=localStorage.getItem('eduplan_visitor_id');if(!v){v=crypto.randomUUID();localStorage.setItem('eduplan_visitor_id',v)}
   timer=setTimeout(async()=>{
    const token=(await sb?.auth.getSession())?.data?.session?.access_token;
    fetch('/api/visit',{method:'POST',headers:{'content-type':'application/json',...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify({visitor_id:v,page:'/app/'+tab})}).catch(()=>{});
   },250);
  }catch{}return ()=>clearTimeout(timer)},[tab,session?.user?.id]);
 useEffect(()=>{
   if(!activeExam?.expires_at){setRemaining(null);return;}
   const tick=()=>setRemaining(Math.max(0,Math.ceil((new Date(activeExam.expires_at).getTime()-Date.now())/1000)));
   tick();const handle=setInterval(tick,1000);return ()=>clearInterval(handle);
 },[activeExam?.expires_at]);
 useEffect(()=>{
   if(!activeExam?.id||!me?.id||result)return;
   try {sessionStorage.setItem('eduplan_progress_'+me.id+'_'+activeExam.id,JSON.stringify(answers));setSaveStatus('Đã lưu câu trả lời tạm trên thiết bị này.');}
   catch {setSaveStatus('Không thể lưu câu trả lời tạm trên trình duyệt.');}
 },[answers,activeExam?.id,me?.id,result]);
 useEffect(()=>{
   if(remaining!==0||!activeExam||result||autoSubmitted.current)return;
   autoSubmitted.current=true;
   (async()=>{
     setBusy(true);
     try{
       const res=await call('submit','POST',{code:activeExam.share_code,answers});
       try {sessionStorage.removeItem('eduplan_progress_'+me.id+'_'+activeExam.id)}catch{}
       setResult(res.result);setActiveExam(null);alert('Đã hết giờ: bài làm được tự động nộp.');
     }catch(e){alert('Hết giờ, không thể tự nộp: '+e.message+' Hãy kiểm tra kết nối mạng và liên hệ giáo viên.');}
     finally{setBusy(false)}
   })();
 },[remaining,activeExam?.id,result,call]);
 useEffect(()=>{
   if(tab==='results'&&teacher){call('insights').then(x=>setInsights(x.insights)).catch(e=>alert(e.message));}
   if(tab==='history'&&me?.role==='student'){call('study-plan').then(x=>setStudyPlan(x.plan)).catch(e=>alert(e.message));}
 },[tab,teacher,me?.id,attempts.length,call]);
 const load=useCallback(async()=>{
   if(!me)return;
   const [t,a,r]=await Promise.all([call('tests'),call('attempts'),call('references')]);setTests(t.tests||[]);setAttempts(a.attempts||[]);setRefs(r.references||[]);
   if(me.role==='teacher'){
     const [q,s]=await Promise.all([call('questions'),call('stats')]);setQuestions(q.questions||[]);setStats(s);
   }
 },[call,me?.id,me?.role]);
 useEffect(()=>{if(me)load().catch(e=>alert(e.message))},[load]);
 const filtered=useMemo(()=>questions.filter(q=>q.grade===Number(grade)).filter(q=>(!examTopic||q.chapter.toLocaleLowerCase().includes(examTopic.toLocaleLowerCase()))&&(!examLesson||q.lesson.toLocaleLowerCase().includes(examLesson.toLocaleLowerCase()))),[questions,grade,examTopic,examLesson]);
 const selectedQuestions=filtered.filter(q=>selected.includes(q.id));
 const pctTotal=Object.values(percentage).reduce((a,b)=>a+Number(b||0),0);
 const countValue=Math.max(1,Math.min(100,Number(examCount)||1));
 const quota=useMemo(()=>{try{return quotaFromPercent(countValue,percentage)}catch{return null}},[countValue,percentage]);
 const supply=(quota?['NB','TH','VD','VDC'].map(level=>({level,need:quota[level],available:filtered.filter(q=>q.verified&&q.difficulty===level).length})):[]);
 const nlsAvailable=filtered.filter(q=>q.verified&&(q.nls_tags||[]).length>0).length;
 const missingSupply=supply.filter(x=>x.available<x.need);
 const navigation=[
  {id:'home',label:'Tổng quan',ico:House},
  ...(teacher?[{id:'bank',label:'Ngân hàng câu hỏi',ico:Database},{id:'make',label:'Tạo & trộn đề',ico:Shuffle},{id:'results',label:'Kết quả kiểm tra học sinh',ico:ChartNoAxesCombined}]:[{id:'take',label:'Làm bài kiểm tra online',ico:ClipboardList},{id:'history',label:'Kết quả kiểm tra của em',ico:ChartNoAxesCombined}]),
  {id:'ai',label:'Hỏi trợ lý AI Hóa học online',ico:BrainCircuit},{id:'practice',label:'Làm bài tập tương tác online',ico:ClipboardList},{id:'solve',label:'Giải bài tập online',ico:FlaskConical},{id:'references',label:'Tài liệu tham khảo online',ico:BookOpen}
 ];
 const go=id=>{setTab(id);setDrawer(false);setMessage('');if(id==='results')run(load)};
 const logout=()=>run(async()=>{await sb.auth.signOut();setTab('home')});
 const login=async e=>{e.preventDefault();await run(async()=>{
    const res=register?await sb.auth.signUp({email:authEmail,password:authPass,options:{data:{display_name:authName}}}):await sb.auth.signInWithPassword({email:authEmail,password:authPass});
    if(res.error)throw res.error;
    alert(register?'Đã đăng ký. Nếu bật xác nhận email, hãy xác nhận rồi đăng nhập.':'Đã đăng nhập.');
  })};
 const createQuestion=async e=>{e.preventDefault();await run(async()=>{await call(editQuestionId?'edit-question':'question','POST',{...qform,id:editQuestionId,grade:Number(grade)});alert('Đã lưu bản nháp. Kiểm tra rồi bấm Duyệt trước khi đưa vào đề.');setEditQuestionId(null);setQform({...initialQuestion,grade:Number(grade)});await load()})};
 const approve=async(q,verified)=>run(async()=>{await call('approve','POST',{id:q.id,verified});await load();alert(verified?'Đã xác nhận câu hỏi.':'Đã chuyển câu hỏi về bản nháp.')});
 const setPractice=async(q,enabled)=>run(async()=>{await call('practice-toggle','POST',{id:q.id,practice_enabled:enabled});await load();alert(enabled?'\u0110\u00e3 cho ph\u00e9p h\u1ecdc sinh t\u1ef1 luy\u1ec7n c\u00e2u n\u00e0y.':'\u0110\u00e3 \u1ea9n c\u00e2u n\u00e0y kh\u1ecfi kho t\u1ef1 luy\u1ec7n.');});
 const editQuestion=q=>{setEditQuestionId(q.id);setGrade(String(q.grade));setQform({...q,options:q.options||{A:'',B:'',C:'',D:''}});window.scrollTo({top:0,behavior:'smooth'});};
 const importBank=async e=>{const f=e.target.files?.[0];e.target.value='';if(!f)return;await run(async()=>{if(f.size>4000000)throw Error('Tệp nhập vượt 4 MB.');const j=JSON.parse(await f.text());const rows=Array.isArray(j)?j:Array.isArray(j.questions)?j.questions:[];if(!rows.length)throw Error('Tệp JSON cần là mảng câu hỏi hoặc có trường questions.');let inserted=0,rejected=0;for(let i=0;i<rows.length;i+=80){const r=await call('import-questions','POST',{questions:rows.slice(i,i+80)});inserted+=r.inserted;rejected+=r.rejected;}await load();alert(`Nhập ${inserted} câu nháp, ${rejected} câu cần sửa cấu trúc. Giáo viên duyệt trước khi dùng.`)})};
 const seed=()=>run(async()=>{const x=await call('seed','POST',{});await load();alert(`Đã bổ sung ${x.inserted} câu hỏi mẫu có sẵn. Vui lòng kiểm tra trước khi dùng chính thức.`)});
 const supplement=async()=>run(async()=>{
  const topic=aiTopic||examTopic||examLesson||`Hóa học ${grade}`;
  const res=await call('ai','POST',{mode:'generate',grade:Number(grade),topic,question:'Tạo theo CTGDPT 2018 và phân hóa 4 mức độ',focus_nls:focusNls,count:aiCount});
  setSources(res.sources||[]);await load();alert(`AI đã bổ sung ${res.questions.length} câu hỏi NHÁP từ nguồn trực tuyến. Giáo viên bắt buộc duyệt rồi mới đưa vào đề.`);setTab('bank');
 });
 const makeTest=()=>run(async()=>{
  const requested=Math.max(1,Math.min(100,Number(examCount)||10));
  let ids=[];
  if(autoBlueprint){
    if(!quota)throw Error('Tổng tỉ lệ ma trận phải bằng 100%.');
    if(missingSupply.length){
      const lack=missingSupply[0];
      const topic=examLesson||examTopic||`Hóa học ${grade}`;
      if(confirm(`Thiếu ${lack.need-lack.available} câu đã duyệt ở mức ${lack.level}. Tạo tối đa 8 câu nháp bằng AI để giáo viên duyệt?`)){
         const out=await call('ai','POST',{mode:'generate',grade:Number(grade),topic,count:Math.min(8,lack.need-lack.available),target_difficulty:lack.level,question:`Soạn câu mức ${lack.level} theo chủ đề ${topic}.`,focus_nls:focusNls});
         await load();setTab('bank');alert(`Đã thêm ${out.questions.length} câu nháp mức ${lack.level}. Cần kiểm chứng, duyệt rồi mới tạo đề.`);
      }
      return;
    }
    if(Number(nlsMin)>nlsAvailable)throw Error(`Thiếu câu NLS/AI: cần ${nlsMin}, hiện có ${nlsAvailable} câu được duyệt.`);
  }else{
    const available=filtered.filter(q=>q.verified);
    const chosen=selectedQuestions.filter(q=>q.verified);
    ids=(chosen.length?chosen:available).map(q=>q.id).slice(0,requested);
    if(ids.length<requested)throw Error(`Chỉ có ${ids.length}/${requested} câu đã duyệt. Hãy dùng AI bổ sung từ ngân hàng và duyệt trước khi tạo đề.`);
  }
  const r=await call('create-test','POST',{
     title:examTitle,exam_kind:examKind,grade:Number(grade),chapter:examTopic,lesson:examLesson,
     question_ids:ids,duration_minutes:examDuration,variants_count:variantCount,published:true,
     auto_blueprint:autoBlueprint,count:requested,percentages:percentage,nls_min:Number(nlsMin)||0
  });
  const codes=(r.tests||[r.test]).map(t=>t.share_code);setNewCodes(codes);await load();setSelected([]);
  alert(`Đã tạo ${codes.length} mã đề, ${requested} câu/mã. ${r.matrix?'Đúng ma trận '+JSON.stringify(r.matrix.quotas)+'. ':''}Đã trộn cả câu và đáp án.`);
 });
 const exportBank=()=>{
   const blob=new Blob([JSON.stringify({format:'eduplan-bank-5.5',exported_at:new Date().toISOString(),questions:questions.filter(q=>q.grade===Number(grade))},null,2)],{type:'application/json;charset=utf-8'});
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`EduPlan_NganHang_Hoa${grade}_SaoLuu.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 };
 const exportExam=(t)=>run(async()=>{
   const data=(await call('test?code='+encodeURIComponent(t.share_code))).test;
   const lines=[`EDUPLAN AI 5.5 | ${data.title}`,`Lớp ${data.grade} | Mã đề ${data.share_code} | ${data.duration_minutes} phút`,''];
   data.questions.forEach((q,i)=>{lines.push(`Câu ${i+1}. ${q.stem}`);if(q.kind==='mcq'||q.kind==='tf4')Object.entries(q.options).forEach(([k,v])=>lines.push(`  ${k}. ${v}`));lines.push('')});
   lines.push('\nĐÁP ÁN VÀ GỢI Ý GIẢI - CHỈ DÀNH CHO GIÁO VIÊN\n');
   data.questions.forEach((q,i)=>lines.push(`Câu ${i+1}: ${q.answer}. ${q.explanation||'Chưa có lời giải'}`));
   const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/plain;charset=utf-8'});
   const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`EduPlan_De_${t.share_code}.txt`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);
 });
 const openExam=(code)=>run(async()=>{
   const res=await call('test?code='+encodeURIComponent(code.toUpperCase()));
   const t=res.test;let restored={};
   try{const saved=JSON.parse(sessionStorage.getItem('eduplan_progress_'+me.id+'_'+t.id)||'{}');
      const ids=new Set(t.questions.map(q=>q.id));
      restored=Object.fromEntries(Object.entries(saved).filter(([id,value])=>ids.has(id)&&typeof value==='string'));
   }catch{}
   autoSubmitted.current=false;setActiveExam(t);setExamCode(code.toUpperCase());setAnswers(restored);setResult(null);setStartedAt(Date.now());setTab('take');
   if(Object.keys(restored).length)alert('Đã khôi phục câu trả lời trước đó trên thiết bị này.');
 });
 const submit=()=>run(async()=>{if(!activeExam)return;
  if(!confirm('Nộp bài? Sau khi nộp sẽ hiện đầy đủ đề, đáp án và điểm /10.'))return;
  const res=await call('submit','POST',{code:activeExam.share_code,answers});
  try{sessionStorage.removeItem('eduplan_progress_'+me.id+'_'+activeExam.id)}catch{}
  setResult(res.result);setActiveExam(null);await load();
 });
 const loadPractice=()=>run(async()=>{const x=await call('practice-questions?grade='+grade);setPracticeQuestions(x.questions||[]);setPracticeAnswers({});setPracticeFeedback({});alert(x.questions?.length?`Đã tải ${x.questions.length} câu luyện tập.`:'Chưa có câu nào được giáo viên duyệt và cho phép tự luyện ở khối này.');});
 const checkPractice=id=>run(async()=>{const x=await call('check-practice','POST',{question_id:id,answer:practiceAnswers[id]||''});setPracticeFeedback(f=>({...f,[id]:x}))});
 const solve=()=>run(async()=>{const res=await call('ai','POST',{mode:'tutor',grade:Number(grade),question:askText});setAiAnswer(res.answer)});
 const search=()=>run(async()=>{const x=await call('search?q='+encodeURIComponent(searchQ));setSources(x.sources||[]);alert(x.sources?.length?'Đã tìm được nguồn trực tuyến. Đối chiếu với sách giáo khoa và nguồn học thuật.':'Không tìm thấy thông tin phù hợp.')});
 const downloadCSV=()=>{
  const rows=[['Test ID','Student name','Student ID','Score / 10','Submitted at'],...attempts.map(a=>[a.test_id,a.student_name||'',a.student_id,a.score,a.submitted_at])];
  const protect=x=>{let v=String(x??'');if(/^[=+@-]/.test(v.trim()))v=String.fromCharCode(39)+v;return v;};
  const csv='\ufeff'+rows.map(row=>row.map(s=>'"'+protect(s).replaceAll('"','""')+'"').join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='EduPlan_ket_qua_kiem_tra.csv';a.click();URL.revokeObjectURL(a.href);
 };
 return <div className="app">
  <aside className={'sidebar '+(drawer?'open':'')}>
   <div className="brand"><div className="brand-mark"><Atom size={26}/></div><div><strong>EduPlan AI</strong><small>HÓA HỌC THPT • 5.5 ONLINE</small></div><button className="sideclose" onClick={()=>setDrawer(false)}><X/></button></div>
   <div className="side-label">KHÔNG GIAN LÀM VIỆC</div>
   <nav>{navigation.map(n=><button className={'nav-item '+(tab===n.id?'active':'')} onClick={()=>go(n.id)} key={n.id}><n.ico size={19}/><span>{n.label}</span></button>)}</nav>
   <div className="sidebar-end"><div className="small-card"><ShieldCheck size={20}/><div><b>AI có trách nhiệm</b><span>Giáo viên duyệt học liệu AI trước khi công bố.</span></div></div><p>© 2026 Lê Bá Nhẫn<br/>Trường THPT Hòn Đất</p></div>
  </aside>
  {drawer&&<div className="backdrop" onClick={()=>setDrawer(false)}/>}
  <main className="main">
   <header className="topbar"><div className="top-start"><button className="mobile-menu" onClick={()=>setDrawer(true)}><Menu/></button><span className="crumb">NỀN TẢNG HÓA HỌC <b> / {navigation.find(n=>n.id===tab)?.label}</b></span></div><div className="top-actions">{me&&<Pill tone={teacher?'violet':'teal'}>{teacher?'Tài khoản giáo viên':'Tài khoản học sinh'}</Pill>}{session&&<button className="logout" onClick={logout}><LogOut size={17}/> Đăng xuất</button>}</div></header>
   <div className="content">
    {message&&<div className="notice"><span>{message}</span><button onClick={()=>setMessage('')} aria-label="Dong thong bao"><X size={18}/></button></div>}
    {!sb?<section className="hero"><h1>EduPlan AI 5.5 Online</h1><p>Chưa cấu hình Supabase. Điền các biến môi trường trong .env.example và triển khai lên Vercel để kích hoạt đăng nhập, dữ liệu online và báo cáo lượt truy cập.</p><a className="btn primary" href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">Mở Supabase <ExternalLink size={16}/></a></section>:
    !session?<><section className="hero auth-hero"><div><Pill>EDUPLAN AI • 5.5</Pill><h1>Một nền tảng cho cả hành trình học Hóa.</h1><p>Ngân hàng câu hỏi • Đề kiểm tra trực tuyến • Kết quả /10 • Giải bài tập • Trợ lý AI • Học liệu số</p><div className="hero-points"><span><CheckCircle2 size={16}/> Hóa học 10–11–12</span><span><CheckCircle2 size={16}/> Kiểm tra có lưu kết quả</span><span><CheckCircle2 size={16}/> Giáo viên duyệt nội dung</span></div></div><form onSubmit={login} className="authbox"><h2>{register?'Tạo tài khoản học sinh':'Đăng nhập để bắt đầu'}</h2>{register&&<label>Họ tên<input required value={authName} onChange={e=>setAuthName(e.target.value)}/></label>}<label>Email<input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/></label><label>Mật khẩu<input type="password" required minLength={6} value={authPass} onChange={e=>setAuthPass(e.target.value)}/></label><Button disabled={busy} type="submit"><LogIn size={17}/>{register?'Đăng ký':'Đăng nhập'}</Button><button className="simplelink" type="button" onClick={()=>setRegister(!register)}>{register?'Đã có tài khoản? Đăng nhập':'Chưa có tài khoản? Đăng ký học sinh'}</button><p>Giáo viên đăng ký trước và được quản trị viên cấp quyền trong Supabase.</p></form></section></>:
    <>
    {tab==='home'&&<>
      <section className="hero compact"><div><Pill>HỌC LIỆU SỐ & ĐÁNH GIÁ</Pill><h1>Xin chào, {me?.name||me?.email||'bạn'}!</h1><p>{teacher?'Tạo ngân hàng đề, kiểm chứng nội dung AI và theo dõi tiến bộ học sinh trên một hệ thống online.':'Học chủ động, luyện tập tương tác và nhận phản hồi minh bạch sau mỗi bài kiểm tra.'}</p></div><div className="hero-icon"><Atom size={98}/></div></section>
      <div className="quick-stats"><div><span>Khối lớp hỗ trợ</span><strong>03</strong><small>10 • 11 • 12</small></div><div><span>{teacher?'Câu hỏi trong ngân hàng':'Bài kiểm tra có thể làm'}</span><strong>{teacher?questions.length:tests.length}</strong><small>{teacher?'Bao gồm câu nháp và câu đã duyệt':'Đề đã công bố'}</small></div><div><span>{teacher?'Đề đã tạo':'Bài đã nộp'}</span><strong>{teacher?tests.length:attempts.length}</strong><small>Dữ liệu thực trên máy chủ</small></div><div><span>{teacher?'Lượt truy cập ghi nhận':'Trợ lý AI'}</span><strong>{teacher?(stats?.total_visits??'–'):'24/7'}</strong><small>{teacher?'Không đồng nghĩa số người duy nhất':'Cần cấu hình API trên server'}</small></div></div>
      <h2 className="section-title">Bắt đầu nhanh</h2><div className="cards cols3">
      {(teacher?[[Database,'Ngân hàng câu hỏi','Biên soạn, AI bổ sung, duyệt và phân loại.','bank'],[Shuffle,'Tạo & trộn đề','Bài, chương, thường xuyên, giữa học kì.','make'],[ChartNoAxesCombined,'Phân tích kết quả','Điểm /10 và thống kê người truy cập.','results']]:[[ClipboardList,'Làm bài kiểm tra','Nhập mã đề và hoàn thành bài online.','take'],[BrainCircuit,'Hỏi trợ lý AI','Hỏi lý thuyết, phương pháp và lỗi sai.','ai'],[FlaskConical,'Giải bài tập','Lời giải từng bước, phân tích bản chất.','solve']]).map(([Icon,title,desc,id])=><button className="action-card" key={id} onClick={()=>go(id)}><Icon size={26}/><b>{title}</b><p>{desc}</p><span>Mở chức năng →</span></button>)}</div>
      <div className="tip"><ShieldCheck/><div><b>Chất lượng học liệu</b><p>Những câu hỏi do AI đề xuất luôn ở trạng thái chờ giáo viên thẩm định; nội dung trực tuyến được dẫn nguồn, không tự coi là chân lý khoa học.</p></div></div>
    </>}
    {teacher&&tab==='bank'&&<>
      <PageTitle title="Ngân hàng câu hỏi Hóa học" desc="Tổ chức theo khối, chương, bài, mức độ và năng lực số. Mọi câu AI tạo phải được duyệt."/>
      <div className="toolrow"><label>Khối lớp <Select value={grade} onChange={setGrade} options={[["10","Hóa 10"],["11","Hóa 11"],["12","Hóa 12"]]}/></label><Button variant="outline" onClick={seed} disabled={busy}><Plus size={17}/> Nạp 12 câu mẫu</Button><Button variant="outline" onClick={exportBank} disabled={!questions.length}><Download size={17}/> Sao lưu ngân hàng JSON</Button><label className="upload-label">Nhập ngân hàng JSON<input type="file" accept=".json,application/json" onChange={importBank} disabled={busy}/></label><Button variant="outline" onClick={load}><RefreshCcw size={16}/> Làm mới</Button></div>
      <div className="two-col"><div className="panel"><h3><Plus size={19}/> Thêm câu hỏi chuyên môn</h3><form onSubmit={createQuestion} className="form-grid"><label>Chương<input value={qform.chapter} onChange={e=>setQform({...qform,chapter:e.target.value})} placeholder="Ví dụ: Cấu tạo nguyên tử"/></label><label>Bài<input value={qform.lesson} onChange={e=>setQform({...qform,lesson:e.target.value})} placeholder="Tên bài"/></label><label>Hình thức<Select value={qform.kind} onChange={v=>setQform({...qform,kind:v,answer:v==='true_false'?'Đúng':v==='tf4'?'D,S,D,S':v==='mcq'?'A':''})} options={[["mcq","Nhiều lựa chọn"],["true_false","Đúng/Sai 1 ý"],["tf4","Đúng/Sai 4 ý"],["short","Trả lời ngắn"]]}/></label><label>Mức độ<Select value={qform.difficulty} onChange={v=>setQform({...qform,difficulty:v})} options={DLEVEL}/></label><label className="wide">Nội dung câu hỏi<textarea required rows={3} value={qform.stem} onChange={e=>setQform({...qform,stem:e.target.value})}/></label>{(qform.kind==='mcq'||qform.kind==='tf4')&&Object.keys(qform.options).map(k=><label key={k}>Lựa chọn {k}<input required value={qform.options[k]} onChange={e=>setQform({...qform,options:{...qform.options,[k]:e.target.value}})}/></label>)}<label>Đáp án {qform.kind==='mcq'?<Select value={qform.answer} onChange={v=>setQform({...qform,answer:v})} options={['A','B','C','D'].map(x=>[x,x])}/>:qform.kind==='tf4'?<input required value={qform.answer} placeholder="D,S,D,S" onChange={e=>setQform({...qform,answer:e.target.value})}/>:qform.kind==='true_false'?<Select value={qform.answer} onChange={v=>setQform({...qform,answer:v})} options={['Đúng','Sai'].map(x=>[x,x])}/>:<input required value={qform.answer} onChange={e=>setQform({...qform,answer:e.target.value})}/>}</label><label className="wide">NLS/AI: {Object.entries(NLS).map(([code,desc])=><span className="tag-option" key={code}><input type="checkbox" checked={qform.nls_tags.includes(code)} onChange={e=>setQform({...qform,nls_tags:e.target.checked?[...qform.nls_tags,code]:qform.nls_tags.filter(x=>x!==code)})}/> {code} – {desc}</span>)}</label><label className="wide">Lời giải / nhận diện lỗi sai<textarea value={qform.explanation} onChange={e=>setQform({...qform,explanation:e.target.value})} rows={2}/></label><Button disabled={busy} type="submit"><Plus size={17}/> {editQuestionId?'Luu chinh sua - cho duyet':'Luu ban nhap'}</Button>{editQuestionId&&<Button variant="outline" onClick={()=>{setEditQuestionId(null);setQform(initialQuestion)}}>Huy sua</Button>}</form></div>
      <div className="panel"><h3><BrainCircuit size={20}/> AI bổ sung ngân hàng từ nguồn online</h3><p className="muted">Khi ngân hàng thiếu câu hỏi, công cụ tìm thông tin tham khảo online và tạo bản nháp; giáo viên kiểm chứng rồi mới sử dụng.</p><label>Chủ đề cần thêm<input value={aiTopic} onChange={e=>setAiTopic(e.target.value)} placeholder="Ví dụ: Hằng số cân bằng Hóa 11"/></label><label>Số câu dự kiến (tối đa 8)<input type="number" min="1" max="8" value={aiCount} onChange={e=>setAiCount(e.target.value)}/></label><label className="tag-option"><input type="checkbox" checked={focusNls} onChange={e=>setFocusNls(e.target.checked)}/>{'Uu tien bai tap NLS/AI (6.1 - 6.3)'}</label><Button onClick={supplement} disabled={busy}><BrainCircuit size={17}/> Tìm nguồn & AI tạo câu hỏi nháp</Button><div className="tip light"><ShieldCheck size={18}/><span>Không tự động sao chép đề từ web, không tự công bố câu chưa thẩm định. Cần GEMINI_API_KEY.</span></div></div></div>
      <h3 className="subheading">Danh sách câu hỏi • Hóa {grade} ({filtered.length})</h3><div className="question-list">{filtered.length?filtered.map((q,i)=><article className="q-card" key={q.id}><div className="q-top"><span>Câu {i+1}</span><Pill tone={q.verified?'teal':'orange'}>{q.verified?'Đã duyệt':'Chờ duyệt'}</Pill><Pill>{q.difficulty}</Pill><span className="q-meta">{q.chapter} • {q.lesson}</span></div><strong>{q.stem}</strong>{q.kind==='mcq'&&<div className="options-small">{Object.entries(q.options).map(([k,v])=><span key={k}>{k}. {v}</span>)}</div>}<p className="answer"><b>Đáp án:</b> {q.answer} · <b>Lời giải:</b> {q.explanation||'Chưa bổ sung.'}</p>{q.source_url&&<a className="link" href={q.source_url} target="_blank" rel="noreferrer">Nguồn tham khảo: {q.source_title} <ExternalLink size={13}/></a>}<div className="q-bottom"><span>NLS/AI: {(q.nls_tags||[]).join(', ')||'Chưa gắn'}</span><Button variant="outline" onClick={()=>approve(q,!q.verified)} disabled={busy}>{q.verified?'Bỏ duyệt':'Duyệt nội dung'}</Button>{q.verified&&<Button variant="outline" onClick={()=>setPractice(q,!q.practice_enabled)} disabled={busy}>{q.practice_enabled?'\u1ea8n kh\u1ecfi kho t\u1ef1 luy\u1ec7n':'Cho ph\u00e9p t\u1ef1 luy\u1ec7n'}</Button>}<Button variant="outline" onClick={()=>editQuestion(q)} disabled={busy}>{'S\u1eeda c\u00e2u h\u1ecfi'}</Button></div></article>):<Empty text="Chưa có câu hỏi phù hợp. Nhấn 'Nạp 12 câu mẫu', nhập câu hỏi hoặc dùng AI tạo bản nháp."/>}</div>
    </>}
    {teacher&&tab==='make'&&<>
      <PageTitle title="Tạo & trộn đề kiểm tra" desc="Chọn bài/chương, hình thức kiểm tra; trộn thứ tự câu hỏi trên máy chủ, phát hành mã đề online."/>
      <div className="panel"><div className="form-grid cols3"><label>Khối<Select value={grade} onChange={v=>{setGrade(v);setSelected([])}} options={[["10","Hóa 10"],["11","Hóa 11"],["12","Hóa 12"]]}/></label><label>Hình thức<Select value={examKind} onChange={setExamKind} options={MODES}/></label><label>Thời gian (phút)<input type="number" min={5} max={180} value={examDuration} onChange={e=>setExamDuration(e.target.value)}/></label><label>Số câu cần trộn<input type="number" min={1} max={100} value={examCount} onChange={e=>setExamCount(e.target.value)}/></label><label>{'S\u1ed1 m\u00e3 \u0111\u1ec1 (1-6)'}<input type="number" min={1} max={6} value={variantCount} onChange={e=>setVariantCount(e.target.value)}/></label><label className="wide">Tên đề<input value={examTitle} onChange={e=>setExamTitle(e.target.value)}/></label><label>Chương (lọc)<input value={examTopic} onChange={e=>{setExamTopic(e.target.value);setSelected([])}} placeholder="Bỏ trống để lấy tất cả"/></label><label>Bài (lọc)<input value={examLesson} onChange={e=>{setExamLesson(e.target.value);setSelected([])}} placeholder="Bỏ trống để lấy tất cả"/></label></div>
      <div className="matrix-card">
       <div className="matrix-title"><ShieldCheck size={19}/><b>Ma trận đề thông minh – phân hóa 4 mức độ</b><span className="small muted">(Các giá trị có thể điều chỉnh theo kế hoạch tổ chuyên môn)</span></div>
       <label className="horizontal-check"><input type="checkbox" checked={autoBlueprint} onChange={e=>setAutoBlueprint(e.target.checked)}/> Tự chọn câu đã duyệt theo ma trận, không lấy câu sai mức độ</label>
       {autoBlueprint&&<>
         <div className="matrix-grid">{DLEVEL.map(([level,label])=><div className="matrix-cell" key={level}><span>{label}</span><label>Tỉ lệ (%)<input type="number" min="0" max="100" value={percentage[level]} onChange={e=>setPercentage(p=>({...p,[level]:Number(e.target.value)}))}/></label><strong>{quota?.[level]??'—'} câu</strong><small>Đã duyệt: {supply.find(x=>x.level===level)?.available??0}</small></div>)}</div>
         <div className="toolrow"><Pill tone={pctTotal===100?'teal':'orange'}>Tổng tỉ lệ: {pctTotal}% / 100%</Pill><label className="small-field">Số câu NLS/AI tối thiểu<input type="number" min="0" max={countValue} value={nlsMin} onChange={e=>setNlsMin(e.target.value)}/></label><Pill tone={nlsAvailable>=Number(nlsMin)?'teal':'orange'}>Câu NLS/AI đã duyệt: {nlsAvailable}</Pill></div>
         {missingSupply.length>0&&<p className="warning-text">Thiếu câu đã duyệt: {missingSupply.map(x=>`${x.level}: thiếu ${x.need-x.available}`).join(' · ')}. AI chỉ bổ sung nháp; giáo viên duyệt rồi mới phát hành.</p>}
       </>}
      </div><div className="toolrow">{!autoBlueprint&&<><Pill tone="teal">Đã chọn {selectedQuestions.filter(q=>q.verified).length} câu được duyệt</Pill><Button variant="outline" onClick={()=>setSelected(filtered.filter(q=>q.verified).map(q=>q.id))}>Chọn tất cả câu đã duyệt</Button></>}<Button onClick={makeTest} disabled={busy||!!(autoBlueprint&&!quota)}><Shuffle size={17}/> {autoBlueprint?"Trộn đề đúng ma trận":"Trộn đề thủ công"}</Button></div></div>
      {!autoBlueprint&&<div className="question-list">{filtered.filter(q=>q.verified).map(q=><label key={q.id} className="pick-question"><input type="checkbox" checked={selected.includes(q.id)} onChange={e=>setSelected(p=>e.target.checked?[...p,q.id]:p.filter(id=>id!==q.id))}/><span><b>{q.stem}</b><small>{q.chapter} • {q.lesson} • {q.difficulty}</small></span></label>)}{!filtered.some(q=>q.verified)&&<Empty text="Không có câu đã duyệt đúng bộ lọc. Hãy bổ sung và duyệt câu hỏi ở Ngân hàng câu hỏi."/>}</div>}
      {newCodes.length>0&&<div className="tip"><CheckCircle2/><span>{'M\u00e3 \u0111\u1ec1 v\u1eeba t\u1ea1o: '}<b>{newCodes.join(' | ')}</b></span></div>}<h3 className="subheading">Đề đã tạo</h3><div className="panel"><div className="table-scroll"><table><thead><tr><th>Tên đề</th><th>Khối</th><th>Loại</th><th>Mã đề</th><th>Trạng thái</th><th></th></tr></thead><tbody>{tests.map(t=><tr key={t.id}><td>{t.title}</td><td>{t.grade}</td><td>{MODES.find(m=>m[0]===t.exam_kind)?.[1]}</td><td><code>{t.share_code}</code></td><td><Pill tone={t.published?'teal':'orange'}>{t.published?'Công bố':'Nháp'}</Pill></td><td><div className="toolrow compact-row"><Button variant="outline" onClick={()=>exportExam(t)}><Download size={14}/> Tải đề + đáp án</Button><Button variant="outline" onClick={()=>run(async()=>{await call('publish','POST',{id:t.id,published:!t.published});await load()})}>{t.published?'Ẩn đề':'Công bố'}</Button></div></td></tr>)}</tbody></table>{!tests.length&&<Empty text="Chưa tạo đề kiểm tra nào."/>}</div></div>
    </>}
    {teacher&&tab==='results'&&<><PageTitle title="Kết quả kiểm tra & người dùng" desc="Số liệu lưu trữ trên Supabase. Tổng lượt truy cập khác số trình duyệt duy nhất và khác số người thực tế."/><div className="toolrow"><Button variant="outline" onClick={()=>run(load)}><RefreshCcw size={17}/> Cập nhật</Button><Button variant="outline" onClick={downloadCSV}><Download size={17}/> Xuất CSV kết quả</Button></div><div className="quick-stats"><div><span>Lượt truy cập ghi nhận</span><strong>{stats?.total_visits??0}</strong><small>Bản ghi visits</small></div><div><span>Trình duyệt duy nhất</span><strong>{stats?.unique_browser_ids??0}</strong><small>Ước tính theo mã trình duyệt</small></div><div><span>Lượt truy cập hôm nay (GMT+7)</span><strong>{stats?.today_visits??0}</strong><small>Theo giờ Việt Nam</small></div><div><span>Điểm trung bình /10</span><strong>{stats?.mean_score??'–'}</strong><small>{stats?.attempts??0} bài làm</small></div></div><div className="panel"><h3>Thống kê theo ngày (14 ngày gần nhất)</h3><p>{'S\u1ed1 t\u00e0i kho\u1ea3n \u0111\u0103ng k\u00fd: '}<b>{stats?.registered_accounts??0}</b>{' | L\u01b0\u1ee3t truy c\u1eadp khi \u0111\u0103ng nh\u1eadp: '}<b>{stats?.signed_in_visits??0}</b></p><div className="bars">{(stats?.daily||[]).map(([d,n])=><div className="barrow" key={d}><span>{d}</span><div><i style={{width:((n/Math.max(1,...(stats?.daily||[]).map(a=>a[1])))*100)+'%'}}/></div><b>{n}</b></div>)}</div>{stats?.note&&<p className="muted">{stats.note}</p>}</div>{insights&&<div className="panel"><h3><BrainCircuit size={19}/> Phân tích câu hỏi – phát hiện kiến thức cần củng cố</h3><p className="muted">Dựa trên tối đa {insights.attempts_sample} bài nộp gần đây{insights.capped?' (đã chạm giới hạn mẫu 1.000 bài)':''}. Điểm từng ý Đúng/Sai 4 ý được tính theo điểm phần.</p><div className="insights-grid">{(insights.groups||[]).filter(x=>x.kind==='difficulty').map(x=><div className="insight-item" key={x.name}><small>{DLEVEL.find(i=>i[0]===x.name)?.[1]||x.name}</small><strong>{x.percent}%</strong><span>{x.questions} lượt trả lời</span><div className="bar-track"><i style={{width:x.percent+'%'}}/></div></div>)}</div><h4>Chương/bài cần tăng cường</h4><div className="cards cols2">{(insights.groups||[]).filter(x=>x.kind==='lesson').sort((a,b)=>a.percent-b.percent).slice(0,6).map(x=><div className="learning-row" key={x.name}><b>{x.name}</b><span>Đạt {x.percent}% · {x.questions} lượt trả lời</span></div>)}</div><h4>Câu hỏi có tỷ lệ đúng thấp (ít nhất 2 lượt làm)</h4>{(insights.difficult_items||[]).map(x=><div className="learning-row" key={x.id}><b>{x.stem}</b><span>{x.correct_rate}% trả lời đúng · {x.times} lượt · {x.lesson}</span></div>)}</div>}
    <div className="panel"><h3>Kết quả học sinh (đã lưu)</h3><div className="table-scroll"><table><thead><tr><th>Đề</th><th>Mã học sinh (ẩn danh khi chia sẻ)</th><th>Điểm /10</th><th>Thời điểm nộp</th></tr></thead><tbody>{attempts.map(a=><tr key={a.id}><td>{tests.find(t=>t.id===a.test_id)?.title||a.test_id}</td><td><code>{a.student_name||a.student_id.slice(0,8)+'...'}</code></td><td><b>{a.score}</b></td><td>{fmt(a.submitted_at)}</td></tr>)}</tbody></table>{!attempts.length&&<Empty text="Chưa ghi nhận lượt nộp bài."/>}</div></div></>}
    {!teacher&&tab==='take'&&<><PageTitle title="Làm bài kiểm tra online" desc="Đề được lưu trực tuyến. Sau khi nộp hiện lại đầy đủ câu hỏi, đáp án, lời giải và điểm tối đa 10."/><div className="panel"><div className="toolrow"><label>Mã đề<input value={examCode} onChange={e=>setExamCode(e.target.value)} placeholder="Nhập mã do giáo viên cung cấp"/></label><Button onClick={()=>openExam(examCode)} disabled={busy}><Search size={17}/> Mở đề</Button></div></div>{result&&<div className="panel result-panel"><Pill tone="teal">ĐÃ NỘP BÀI</Pill><h2>{result.title}</h2><div className="bigscore">{result.score}<small>/10</small></div><p>Đúng {result.correct}/{result.total} câu • Nộp lúc {fmt(result.submitted_at)}</p><h3>Đối chiếu toàn bộ câu hỏi và đáp án</h3>{result.details.map((d,i)=><div className="q-card" key={i}><div className="q-top">Câu {i+1} <Pill tone={d.correct?'teal':'orange'}>{d.correct?'Đúng':'Sai'}</Pill></div><b>{d.stem}</b>{(d.kind==='mcq'||d.kind==='tf4')&&<div className="options-small">{Object.entries(d.options).map(([k,v])=><span key={k}>{k}. {v}</span>)}</div>}<p><b>Em trả lời:</b> {d.given||'(Chưa trả lời)'}</p>{d.kind==='tf4'&&<p>Số ý đúng: {d.correct_parts}/4 · Điểm phần: {d.earned}/1</p>}<p><b>Đáp án đúng:</b> {d.answer}</p><p><b>Giải thích:</b> {d.explanation||'Chưa có lời giải.'}</p></div>)}</div>}{activeExam&&!result&&<div className="panel"><Pill>{activeExam.exam_kind}</Pill><h2>{activeExam.title}</h2><p>{activeExam.questions.length} câu • {'Th\u1eddi gian '} {activeExam.duration_minutes} {' ph\u00fat '} • {'H\u1ea1n n\u1ed9p: '}<b>{fmt(activeExam.expires_at)}</b> • {'C\u00f2n: '}<b>{remaining===null?'--:--':`${Math.floor(remaining/60).toString().padStart(2,'0')}:${(remaining%60).toString().padStart(2,'0')}`}</b></p><div className="answer-progress"><div className="toolrow"><Pill tone="teal">{Object.keys(answers).filter(id=>answers[id]).length}/{activeExam.questions.length} câu đã điền</Pill><span className="muted">{saveStatus}</span></div><div className="question-jumps">{activeExam.questions.map((q,i)=><button key={q.id} type="button" className={answers[q.id]?'answered':''} onClick={()=>document.getElementById('question-'+q.id)?.scrollIntoView({behavior:'smooth',block:'start'})}>{i+1}</button>)}</div></div>{activeExam.questions.map((q,i)=><article id={'question-'+q.id} className="test-question" key={q.id}><h3>Câu {i+1}. {q.stem}</h3>{q.kind==='mcq'?Object.entries(q.options).map(([k,v])=><label className="option" key={k}><input type="radio" name={q.id} checked={answers[q.id]===k} onChange={()=>setAnswers({...answers,[q.id]:k})}/><span><b>{k}.</b> {v}</span></label>):q.kind==='true_false'?['Đúng','Sai'].map(v=><label className="option" key={v}><input type="radio" name={q.id} checked={answers[q.id]===v} onChange={()=>setAnswers({...answers,[q.id]:v})}/>{v}</label>):q.kind==='tf4'?<div className="tf4-list">{Object.entries(q.options).map(([k,v],j)=><div key={k} className="tf4-item"><span><b>{k})</b> {v}</span><label><input type="radio" name={q.id+'-'+k} checked={(answers[q.id]||'').split(',')[j]==='D'} onChange={()=>{const parts=(answers[q.id]||'').split(',');while(parts.length<4)parts.push('');parts[j]='D';setAnswers({...answers,[q.id]:parts.join(',')})}}/> {'Đúng'}</label><label><input type="radio" name={q.id+'-'+k} checked={(answers[q.id]||'').split(',')[j]==='S'} onChange={()=>{const parts=(answers[q.id]||'').split(',');while(parts.length<4)parts.push('');parts[j]='S';setAnswers({...answers,[q.id]:parts.join(',')})}}/> Sai</label></div>)}</div>:<input value={answers[q.id]||''} onChange={e=>setAnswers({...answers,[q.id]:e.target.value})} placeholder="Nhập câu trả lời ngắn"/>}</article>)}<div className="submitbar"><span>Đã trả lời {Object.values(answers).filter(Boolean).length}/{activeExam.questions.length}</span><Button onClick={submit} disabled={busy||remaining===0}><Send size={17}/> Nộp bài & xem kết quả /10</Button></div></div>}{!activeExam&&!result&&<div className="panel"><h3>Danh sach de da duoc giao</h3>{tests.map(t=><button key={t.id} className="item-link" onClick={()=>openExam(t.share_code)}><FileQuestion size={18}/><span>{t.title} · Hóa {t.grade}</span><code>{t.share_code}</code></button>)}{!tests.length&&<Empty text="Chưa có đề công bố. Nhập mã đề do giáo viên cung cấp."/>}</div>}</>}
    {!teacher&&tab==='history'&&<><PageTitle title="Kết quả học tập của em" desc="Điểm /10, đề đã nộp, và gợi ý học lại theo bài/chương dựa trên lỗi sai của em."/>
     {studyPlan?.recommendations?.length>0&&<div className="panel"><h3><GraduationCap size={19}/> Lộ trình tự học cá nhân hóa (theo bài đã nộp)</h3><p className="muted">Gợi ý dựa trên {studyPlan.reviewed} lượt trả lời; đây là thống kê, không phải kết luận về năng lực toàn diện.</p><div className="cards cols2">{studyPlan.recommendations.map((x,i)=><div className="learning-card" key={i}><div className="toolrow"><Pill tone={x.mastery<50?'orange':x.mastery<80?'blue':'teal'}>{x.priority}</Pill><b>{x.mastery}%</b></div><strong>{x.lesson}</strong><small>{x.chapter} · {x.questions} lượt trả lời</small>{x.samples?.[0]&&<p>Gợi ý xem lại: {x.samples[0]}</p>}<Button variant="outline" onClick={()=>{setGrade(String(x.grade||10));setTab('practice')}}>Ôn tập phần này <BookOpen size={15}/></Button></div>)}</div></div>}<div className="panel"><div className="table-scroll"><table><thead><tr><th>Đề</th><th>Điểm /10</th><th>Ngày nộp</th><th>Chi tiết</th></tr></thead><tbody>{attempts.map(a=><tr key={a.id}><td>{a.test_title||'Bài kiểm tra'}</td><td><b>{a.score}</b></td><td>{fmt(a.submitted_at)}</td><td><Button variant="outline" onClick={()=>{setResult({title:a.test_title||'Bài kiểm tra',score:a.score,total:a.details?.length||0,correct:(a.details||[]).filter(x=>x.correct).length,details:a.details||[],submitted_at:a.submitted_at});setTab('take')}}>Xem lời giải</Button></td></tr>)}</tbody></table>{!attempts.length&&<Empty text="Chưa có kết quả nào được lưu."/>}</div></div></>}
    {(tab==='ai'||tab==='solve')&&<><PageTitle title={tab==='ai'?'Hỏi trợ lý AI Hóa học online':'Giải bài tập Hóa học online'} desc="AI hướng dẫn theo từng bước, giải thích bản chất và cảnh báo lỗi sai. Không thay thế kiểm chứng chuyên môn."/><div className="toolrow"><label>Khối lớp <Select value={grade} onChange={setGrade} options={[["10","Hóa 10"],["11","Hóa 11"],["12","Hóa 12"]]}/></label></div><div className="panel"><label>{tab==='ai'?'Câu hỏi của bạn':'Nhập nguyên văn bài tập cần giải'}<textarea rows={7} value={askText} onChange={e=>setAskText(e.target.value)} placeholder="Ví dụ: Tính pH dung dịch HCl 0,01 M. Giải thích vì sao pH = 2."/></label><div className="toolrow"><Button disabled={busy||!askText.trim()} onClick={solve}><BrainCircuit size={17}/> {tab==='ai'?'Hỏi AI':'Giải bài tập từng bước'}</Button></div>{aiAnswer&&<div className="ai-output"><h3>Phản hồi của trợ lý</h3><pre>{aiAnswer}</pre><p>Hãy đối chiếu phương trình, điều kiện phản ứng và số liệu với tài liệu đáng tin cậy.</p></div>}</div><div className="tip"><ShieldCheck/><p>Ứng dụng không tự nhận phản hồi AI là kết luận khoa học; tránh nhập thông tin cá nhân nhạy cảm, đề thi bí mật hoặc tài liệu không có quyền sử dụng.</p></div></>}
    {tab==='practice'&&<><PageTitle title="Làm bài tập tương tác online" desc="Luyện câu hỏi đã được giáo viên duyệt và cho phép tự luyện; nhận phản hồi tức thời, không ảnh hưởng điểm kiểm tra chính thức."/><div className="toolrow"><label>Khối lớp<Select value={grade} onChange={v=>{setGrade(v);setPracticeQuestions([]);setPracticeFeedback({})}} options={[["10","Hóa 10"],["11","Hóa 11"],["12","Hóa 12"]]}/></label><Button onClick={loadPractice} disabled={busy}><RefreshCcw size={17}/> Tải 8 câu luyện tập</Button></div>{practiceQuestions.length>0&&<div className="panel"><div className="practice-score"><Pill tone="teal">Đã kiểm tra {Object.keys(practiceFeedback).length}/{practiceQuestions.length} câu</Pill><strong>Đúng {Object.values(practiceFeedback).filter(x=>x.correct).length} câu</strong></div>{practiceQuestions.map((q,i)=><section className="test-question" key={q.id}><h3>Câu {i+1}. {q.stem}</h3>{q.kind==='mcq'?Object.entries(q.options).map(([k,v])=><label className="option" key={k}><input type="radio" name={'practice-'+q.id} checked={practiceAnswers[q.id]===k} disabled={!!practiceFeedback[q.id]} onChange={()=>setPracticeAnswers({...practiceAnswers,[q.id]:k})}/><span><b>{k}.</b> {v}</span></label>):q.kind==='true_false'?['Đúng','Sai'].map(x=><label className="option" key={x}><input type="radio" name={'practice-'+q.id} checked={practiceAnswers[q.id]===x} disabled={!!practiceFeedback[q.id]} onChange={()=>setPracticeAnswers({...practiceAnswers,[q.id]:x})}/>{x}</label>):q.kind==='tf4'?<div className="tf4-list">{Object.entries(q.options).map(([k,v],j)=><div key={k} className="tf4-item"><span><b>{k})</b> {v}</span>{['D','S'].map(x=><label key={x}><input type="radio" name={'pr-'+q.id+'-'+k} disabled={!!practiceFeedback[q.id]} checked={(practiceAnswers[q.id]||'').split(',')[j]===x} onChange={()=>{const parts=(practiceAnswers[q.id]||'').split(',');while(parts.length<4)parts.push('');parts[j]=x;setPracticeAnswers({...practiceAnswers,[q.id]:parts.join(',')})}}/>{x==='D'?'Đúng':'Sai'}</label>)}</div>)}</div>:<input value={practiceAnswers[q.id]||''} disabled={!!practiceFeedback[q.id]} onChange={e=>setPracticeAnswers({...practiceAnswers,[q.id]:e.target.value})} placeholder="Nhập câu trả lời"/>}{practiceFeedback[q.id]?<div className="feedback"><Pill tone={practiceFeedback[q.id].correct?'teal':'orange'}>{practiceFeedback[q.id].correct?'Chính xác':'Cần xem lại'}</Pill><p><b>Đáp án:</b> {practiceFeedback[q.id].answer}</p><p><b>Lời giải:</b> {practiceFeedback[q.id].explanation||'Chưa có lời giải.'}</p></div>:<Button variant="outline" disabled={busy||!practiceAnswers[q.id]} onClick={()=>checkPractice(q.id)}><Check size={16}/> Kiểm tra đáp án</Button>}</section>)}</div>}{!practiceQuestions.length&&<Empty text="Bấm Tải 8 câu luyện tập. Bài luyện chỉ dùng câu được giáo viên cho phép tự luyện."/>}</>}
    {tab==='references'&&<><PageTitle title="Tài liệu tham khảo online" desc="Tra cứu có nguồn và mở tài liệu bên ngoài. Không tự sao chép toàn bộ học liệu có bản quyền."/><div className="panel"><div className="toolrow"><label className="grow">Tìm thông tin Hóa học<input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Ví dụ: cân bằng hóa học, magnesium, sulfuric acid"/></label><Button disabled={busy||!searchQ.trim()} onClick={search}><Search size={17}/> Tìm tài liệu online</Button></div>{sources.length>0&&<><h3>Kết quả tìm kiếm</h3>{sources.map((s,i)=><div className="source" key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title} <ExternalLink size={15}/></a><p>{s.excerpt||''}</p><small>{s.publisher}</small></div>)}</>}</div><div className="cards cols2">{refs.map((s,i)=><a className="ref-card" href={s.url} target="_blank" rel="noreferrer" key={i}><BookOpen size={21}/><div><b>{s.title}</b><small>{s.publisher}</small></div><ExternalLink size={16}/></a>)}</div></>}
    </>}
   </div>
  </main>
 </div>;
}
function PageTitle({title,desc}){return <div className="page-title"><h1>{title}</h1><p>{desc}</p></div>}
function Empty({text}){return <div className="empty"><FileQuestion size={24}/><p>{text}</p></div>}
