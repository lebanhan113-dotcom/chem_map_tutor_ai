// Analytics on submitted snapshots only, so changing the bank doesn't rewrite history.
export function calcInsights(attempts=[],maxRows=1000) {
 const groups=new Map(), items=new Map();let total=0;
 for(const a of attempts){
  for(const d of (Array.isArray(a.details)?a.details:[])){
   const earned=Math.max(0,Math.min(1,Number(d.earned)||0));total++;
   for(const [kind,key] of [['difficulty',d.difficulty||'Khác'],['chapter',d.chapter||'Chưa xác định'],['lesson',d.lesson||'Chưa xác định']]){
    const name=kind+'|'+key,g=groups.get(name)||{kind,name:key,questions:0,earned:0};g.questions++;g.earned+=earned;groups.set(name,g);
   }
   const id=d.id||('stem-'+String(d.stem).slice(0,60));
   const entry=items.get(id)||{id,stem:String(d.stem||'').slice(0,170),lesson:d.lesson||'',times:0,correct:0,earned:0};
   entry.times++;entry.correct+=d.correct?1:0;entry.earned+=earned;items.set(id,entry);
  }
 }
 const summary=[...groups.values()].map(g=>({...g,percent:g.questions?Math.round(100*g.earned/g.questions):0}));
 const difficultItems=[...items.values()].filter(x=>x.times>=2).map(x=>({...x,correct_rate:Math.round(100*x.correct/x.times)})).sort((a,b)=>a.correct_rate-b.correct_rate||b.times-a.times).slice(0,12);
 return {attempts_sample:attempts.length,question_responses:total,capped:attempts.length>=maxRows,groups:summary,difficult_items:difficultItems};
}
export function learningPlan(attempts=[],limit=5){
 const grouped=new Map();let total=0;
 for(const a of attempts){
  for(const d of (Array.isArray(a.details)?a.details:[])){
   const name=d.lesson||d.chapter||'Kiến thức tổng hợp';
   const id=[d.grade||'',d.chapter||'',name].join('|');
   const row=grouped.get(id)||{grade:d.grade,chapter:d.chapter,lesson:name,correct:0,questions:0,samples:[]};
   const earned=Math.max(0,Math.min(1,Number(d.earned)||0));row.questions++;row.correct+=earned;
   if(earned<1&&row.samples.length<2)row.samples.push(String(d.stem||'').slice(0,160));
   grouped.set(id,row);total++;
  }
 }
 return {reviewed:total,recommendations:[...grouped.values()].map(x=>({...x,mastery:Math.round(100*x.correct/x.questions),priority:x.correct/x.questions<.5?'Ưu tiên ôn ngay':x.correct/x.questions<.8?'Cần củng cố':'Duy trì'})).sort((a,b)=>a.mastery-b.mastery||b.questions-a.questions).slice(0,limit)};
}
