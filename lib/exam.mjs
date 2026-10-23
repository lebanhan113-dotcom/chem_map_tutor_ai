import { randomInt } from 'node:crypto';

export const ABCD = ['A','B','C','D'];
export function shuffled(items, random = n => randomInt(n)) {
  const a = [...items];
  for (let i=a.length-1; i>0; i--) {
    const j=random(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
export function validOrder(order) {
  return Array.isArray(order) && order.length===4 &&
    new Set(order).size===4 && ABCD.every(k=>order.includes(k));
}
export function createOptionOrders(rows, random) {
  return Object.fromEntries(rows.filter(q=>q.kind==='mcq').map(q=>[q.id,shuffled(ABCD,random)]));
}
export function getOptionOrder(test,questionId) {
  const value=test?.option_orders?.[questionId];
  return validOrder(value)?value:ABCD;
}
export function displayAnswer(test,q) {
  if(q.kind!=='mcq')return String(q.answer);
  const idx=getOptionOrder(test,q.id).indexOf(q.answer);
  return ABCD[idx]??q.answer;
}
export function displayQuestion(test,q,showAnswer=false) {
  const order=getOptionOrder(test,q.id);
  const options=q.kind==='mcq'
    ?Object.fromEntries(ABCD.map((label,i)=>[label,q.options[order[i]]]))
    :q.options;
  const result={id:q.id,grade:q.grade,kind:q.kind,difficulty:q.difficulty,
    chapter:q.chapter,lesson:q.lesson,stem:q.stem,options,nls_tags:q.nls_tags};
  if(showAnswer)return {...result,answer:displayAnswer(test,q),explanation:q.explanation,
    source_title:q.source_title,source_url:q.source_url};
  return result;
}
export function answerMatches(given, expected, kind) {
  const normalize = v => String(v??'').trim().normalize('NFKC').toLocaleLowerCase('vi').replace(/\s+/g,' ');
  const a=normalize(given),b=normalize(expected);
  if(kind==='short'&&/^[+-]?\d+(?:[.,]\d+)?$/.test(a)&&/^[+-]?\d+(?:[.,]\d+)?$/.test(b)) {
    return Math.abs(Number(a.replace(',','.'))-Number(b.replace(',','.')))<0.0001;
  }
  return a===b;
}
export function partsTF4(value) {
  const items=String(value??'').split(/[,;|]/).map(x=>String(x).trim().toLocaleLowerCase('vi'));
  if(items.length!==4)return null;
  const norm=x=>['d','dg','dung','đ','đúng','true','1'].includes(x)?'D':(['s','sai','false','0'].includes(x)?'S':null);
  const mapped=items.map(norm);
  return mapped.some(x=>x===null)?null:mapped;
}
export function tf4Partial(given,expected) {
  const a=partsTF4(given),b=partsTF4(expected);
  if(!b)return {earned:0,correct_parts:0};
  const count=(a||[]).reduce((acc,v,i)=>acc+(v===b[i]?1:0),0);
  return {earned:[0,0.1,0.25,0.5,1][count],correct_parts:count};
}
export function gradeSubmission(test,questions,answers={}) {
  const map=new Map(questions.map(q=>[q.id,q]));
  const details=(test.question_ids||[]).map(id=>{
    const q=map.get(id);
    if(!q)throw Error('Missing exam question; do not grade an incomplete test.');
    const shown=displayQuestion(test,q,true);
    const given=String(answers[id]??'').slice(0,700);
    const partial=q.kind==='tf4'?tf4Partial(given,shown.answer):null;
    const correct=partial?partial.correct_parts===4:answerMatches(given,shown.answer,q.kind);
    return {...shown,given,correct,earned:partial?partial.earned:(correct?1:0),correct_parts:partial?.correct_parts??(correct?1:0)};
  });
  if(!details.length)throw Error('Cannot grade an empty test.');
  const correct=details.filter(q=>q.correct).length;
  const score=Math.round(1000*details.reduce((sum,d)=>sum+d.earned,0)/details.length)/100;
  return {correct,score,total:details.length,details};
}
