export const LEVELS = ['NB','TH','VD','VDC'];
export function quotaFromPercent(total, percent = {}) {
  if (!Number.isInteger(total) || total<1 || total>100) throw Error('Số câu phải nằm trong 1–100.');
  const vals = LEVELS.map(k=>Number(percent[k]??0));
  if (vals.some(v=>!Number.isFinite(v)||v<0||v>100) || Math.abs(vals.reduce((a,b)=>a+b,0)-100)>.001)
    throw Error('Tổng tỉ lệ ma trận phải bằng 100%.');
  const raw=vals.map(v=>v*total/100), quota=raw.map(Math.floor);
  const left=total-quota.reduce((a,b)=>a+b,0);
  const order=LEVELS.map((_,i)=>i).sort((a,b)=>(raw[b]-Math.floor(raw[b]))-(raw[a]-Math.floor(raw[a]))||a-b);
  for(let i=0;i<left;i++)quota[order[i]]++;
  return Object.fromEntries(LEVELS.map((k,i)=>[k,quota[i]]));
}
