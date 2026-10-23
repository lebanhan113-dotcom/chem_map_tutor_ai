/**
 * Vercel serverless Gemini endpoint for EduPlan AI 5.6.
 * Required: GEMINI_API_KEY (secret server-side env var, NOT in index.html).
 * Optional: GEMINI_MODEL, e.g. gemini-2.5-flash.
 * In production add durable IP rate limiting, Turnstile/bot protection and
 * school-approved access policy, because an anonymous endpoint can incur costs.
 */
const T={chat:'Giải thích nội dung Hóa học, nêu cơ sở đáng tin cậy',solve:'Giải chính xác bài tập theo các bước và kiểm tra đơn vị',generate:'Biên soạn ngân hàng câu hỏi đáp án và lời giải',worksheet:'Xây dựng phiếu học tập và hoạt động NLS/AI',research:'Tìm kiếm các tài liệu Hóa học học thuật có nguồn'};
const RECENT=new Map();
const send=(res,status,data)=>res.status(status).setHeader('Cache-Control','no-store').json(data);
function parseQuestions(str){
  const cleaned=String(str||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(cleaned)}catch{}
  const a=cleaned.indexOf('{'), b=cleaned.lastIndexOf('}');
  if(a>=0&&b>a){try{return JSON.parse(cleaned.slice(a,b+1))}catch{}}
  return null;
}
export default async function handler(req,res){
  if(req.method==='GET')return send(res,200,{ok:true,service:'EduPlan AI 5.6',aiConfigured:!!process.env.GEMINI_API_KEY});
  if(req.method!=='POST')return send(res,405,{error:'Only GET or POST'});
  const key=process.env.GEMINI_API_KEY;
  if(!key)return send(res,503,{error:'Chưa cấu hình biến môi trường GEMINI_API_KEY ở Vercel.'});
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'anonymous').split(',')[0];
  const now=Date.now(),hist=(RECENT.get(ip)||[]).filter(t=>now-t<60000);
  if(hist.length>=7)return send(res,429,{error:'Quá nhiều yêu cầu. Hãy thử lại sau.'});
  hist.push(now);RECENT.set(ip,hist);
  try{
    const {mode='chat',prompt='',grade=11,chapter=0,lesson='',count=5,level='TH'}=req.body||{};
    if(!T[mode])return send(res,400,{error:'Tác vụ không hợp lệ'});
    if(typeof prompt!=='string'||!prompt.trim()||prompt.length>5500)return send(res,400,{error:'Nội dung yêu cầu phải từ 1 đến 5500 ký tự'});
    const n=Math.min(12,Math.max(1,Number(count)||5));
    const base=`Bạn là giáo viên chuyên Hóa học THPT Việt Nam theo CTGDPT 2018, sách Kết nối tri thức. KHÔNG tiết lộ thông tin riêng tư. Bảo đảm công thức, chỉ số, điện tích, số oxi hóa, hệ số phản ứng, đơn vị và phép tính chính xác. Không trích nguyên văn sách có bản quyền; chỉ tổng hợp, diễn giải và tạo câu hỏi nguyên bản. Nếu không chắc, nêu rõ độ bất định. Nguồn tìm kiếm phải là URL thực sự được tìm thấy, ưu tiên Bộ GDĐT, NXB Giáo dục, ACS, RSC, PhET, tài liệu Olympic IChO. Luôn nhắc giáo viên kiểm tra đáp án trước khi sử dụng. Viết tiếng Việt có cấu trúc sư phạm. NLS/AI theo Thông tư 02/2025/TT-BGDĐT.\nKhối ${grade}; Chương ${Number(chapter)+1}; Bài ${lesson}; tác vụ: ${T[mode]}, ưu tiên mức ${level}.\nYêu cầu người dùng: ${prompt}`;
    const fmt=mode==='generate'?`\nYÊU CẦU ĐỊNH DẠNG: Chỉ trả về MỘT đối tượng JSON hợp lệ, không markdown, với hai khóa: "text" (tóm tắt bằng tiếng Việt) và "questions" (mảng ${n} câu hỏi tạo mới). Mỗi câu có: {"grade":${grade},"chapter":${Number(chapter)},"lesson":${JSON.stringify(String(lesson))},"type":"mcq|tf|short|essay","level":"NB|TH|VD|VDC","text":"...","options":["...","...","...","..."],"answer":0,"explain":"...","source":"Nguồn tham khảo URL hoặc tên tổ chức"}. Với MCQ, answer là CHỈ SỐ đáp án đúng 0,1,2,3; với TF options có 4 mệnh đề và answer là [true,false,...]; với short answer là chuỗi; với essay answer là lời giải mẫu. Phân bổ hợp lý nhiều loại; giải thích đúng Hóa học và toán; chỉ nội dung tự biên soạn và có nguồn tham khảo. Không điền nguồn bịa đặt.`:'';
    const model=/^[\w.-]+$/.test(process.env.GEMINI_MODEL||'')?process.env.GEMINI_MODEL:'gemini-2.5-flash';
    const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
      body:JSON.stringify({contents:[{role:'user',parts:[{text:base+fmt}]}],tools:[{google_search:{}}],generationConfig:{temperature:mode==='generate'?0.35:0.3,maxOutputTokens:6000}}),
      signal:AbortSignal.timeout(52000)
    });
    const raw=await response.json();
    if(!response.ok)return send(res,502,{error:'Gemini API: '+String(raw?.error?.message||response.status).slice(0,350)});
    const cand=raw.candidates?.[0];const answer=(cand?.content?.parts||[]).map(p=>p.text||'').join('\n');
    if(!answer)return send(res,502,{error:'Mô hình không trả về nội dung. Kiểm tra giới hạn API hoặc tính hợp lệ của yêu cầu.'});
    const sources=(cand?.groundingMetadata?.groundingChunks||[]).map(c=>({title:c.web?.title||'Nguồn học thuật',url:c.web?.uri||''})).filter(x=>/^https:\/\//.test(x.url)).slice(0,15);
    let parsed=mode==='generate'?parseQuestions(answer):null;
    return send(res,200,{text:parsed?.text||answer,questions:Array.isArray(parsed?.questions)?parsed.questions.slice(0,12):[],sources,model,notice:'Kết quả AI chỉ là bản nháp; giáo viên chịu trách nhiệm thẩm định kiến thức, đáp án và bản quyền.'});
  }catch(e){return send(res,502,{error:String(e?.message||'Không gọi được dịch vụ AI').slice(0,350)})}
}
