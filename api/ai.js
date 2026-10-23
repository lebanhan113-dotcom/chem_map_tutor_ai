'use strict';
// Limited per-instance throttling. In production, protect the endpoint with platform-level auth / rate limits.
const calls = new Map();
// Vercel serverless proxy to Google Gemini API.
// Set GEMINI_API_KEY in Vercel Environment Variables; never put it in HTML.
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  if(req.method!=='POST')return res.status(405).json({error:'Chỉ hỗ trợ POST.'});
  const origin=req.headers.origin||'', host=req.headers['x-forwarded-host']||req.headers.host||'';
  if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({error:'Chỉ tiếp nhận yêu cầu từ cùng website.'});}catch{return res.status(400).json({error:'Origin không hợp lệ.'});}}
  if(Number(req.headers['content-length']||0)>60000)return res.status(413).json({error:'Nội dung yêu cầu quá dài.'});
  const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'anonymous').split(',')[0].trim().slice(0,80);
  const time=Date.now(),bucket=calls.get(ip)||[];const fresh=bucket.filter(t=>time-t<60000);
  if(fresh.length>=8)return res.status(429).json({error:'Đã vượt giới hạn 8 yêu cầu/phút trong phiên máy chủ. Thử lại sau.'});
  fresh.push(time);calls.set(ip,fresh);
  if(calls.size>500){for(const [k,v] of calls)if(!v.length||time-v[v.length-1]>60000)calls.delete(k);}

  if(!process.env.GEMINI_API_KEY)return res.status(503).json({error:'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Dùng chức năng Sao chép prompt để làm việc thủ công.'});
  try {
    const body = typeof req.body==='string' ? JSON.parse(req.body) : (req.body||{});
    const grade=String(body.grade||'');
    const task=String(body.task||'');
    const prompt=String(body.prompt||'').trim();
    if(!['10','11','12'].includes(grade))return res.status(400).json({error:'Khối lớp không hợp lệ.'});
    if(!['lesson','worksheet','questions','review'].includes(task))return res.status(400).json({error:'Tác vụ AI không hợp lệ.'});
    if(prompt.length<30 || prompt.length>16000)return res.status(400).json({error:'Độ dài prompt không hợp lệ (30-16.000 ký tự).'});
    if(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(prompt) || /(?:\+84|0)[\s.\-]?(?:\d[\s.\-]?){9,10}/.test(prompt))return res.status(400).json({error:'Phát hiện email hoặc số điện thoại trong dữ liệu gửi AI. Hãy xóa thông tin cá nhân.'});
    const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
    if(!/^[a-zA-Z0-9._-]{2,90}$/.test(model))return res.status(500).json({error:'Cấu hình GEMINI_MODEL không hợp lệ.'});
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),42000);
    let remote;
    try {
      remote=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
        method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},signal:controller.signal,
        body:JSON.stringify({systemInstruction:{parts:[{text:'Bạn là trợ lý chuyên môn Hóa học THPT. Ưu tiên đúng khoa học, an toàn; không tự bịa số liệu, nguồn hoặc khẳng định nội dung đã được phê duyệt. Không yêu cầu dữ liệu cá nhân học sinh. Luôn nêu điểm giáo viên cần kiểm chứng.'}]},contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.35,maxOutputTokens:4500}})
      });
    }finally{clearTimeout(timeout)}
    if(!remote.ok)return res.status(502).json({error:'Dịch vụ AI tạm không khả dụng ('+remote.status+'). Kiểm tra cấu hình hoặc thử lại sau.'});
    const result=await remote.json();
    const text=(result.candidates||[]).flatMap(c=>(c.content?.parts||[]).map(p=>p.text||'')).join('\n').trim();
    if(!text)return res.status(502).json({error:'Dịch vụ AI chưa tạo được nội dung; hãy thử prompt cụ thể hơn.'});
    return res.status(200).json({text:text.slice(0,42000),model});
  }catch(e){return res.status(502).json({error:e?.name==='AbortError'?'Dịch vụ AI phản hồi quá chậm.':'Không xử lý được yêu cầu AI. Kiểm tra đường truyền và định dạng dữ liệu.'});}
};
