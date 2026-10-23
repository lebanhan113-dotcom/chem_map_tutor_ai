// EDUPlan AI - test blueprint engine. Never reads answers or grants approval.
import { shuffled } from './exam.mjs';
export {LEVELS,quotaFromPercent} from './quota.mjs';
import {LEVELS} from './quota.mjs';
export function blueprintSupply(questions,quota){
  return LEVELS.map(level=>({level,need:quota[level]??0,available:questions.filter(q=>q.difficulty===level).length,missing:Math.max(0,(quota[level]??0)-questions.filter(q=>q.difficulty===level).length)}));
}
export function selectByBlueprint(questions,quota,nlsMin=0,random){
  const need=LEVELS.reduce((sum,k)=>sum+Number(quota[k]??0),0);
  if(need<1||need>100||!Number.isInteger(need))throw Error('Invalid blueprint size.');
  if(!Number.isInteger(nlsMin)||nlsMin<0||nlsMin>need)throw Error('Invalid NLS quota.');
  const buckets={};const missing=[];
  for(const level of LEVELS){
    const available=shuffled(questions.filter(q=>q.difficulty===level),random);
    buckets[level]=available;
    if(available.length<quota[level])missing.push({level,need:quota[level],available:available.length});
  }
  if(missing.length)return {ids:[],missing,nlsFound:0};
  // First try to reserve tagged questions up to target while respecting level capacities.
  const selection=[],chosen=new Set();let tagged=0;
  for(const level of LEVELS){
    const possible=buckets[level].filter(q=>Array.isArray(q.nls_tags)&&q.nls_tags.length>0);
    for(const q of possible){
      const used=selection.filter(x=>x.difficulty===level).length;
      if(tagged>=nlsMin||used>=quota[level])break;
      if(!chosen.has(q.id)){selection.push(q);chosen.add(q.id);tagged++;}
    }
  }
  for(const level of LEVELS){
    for(const q of buckets[level]){
      if(selection.filter(x=>x.difficulty===level).length>=quota[level])break;
      if(!chosen.has(q.id)){selection.push(q);chosen.add(q.id);}
    }
  }
  const nlsFound=selection.filter(q=>Array.isArray(q.nls_tags)&&q.nls_tags.length>0).length;
  if(nlsFound<nlsMin)return {ids:[],missing:[{level:'NLS/AI',need:nlsMin,available:nlsFound}],nlsFound};
  if(selection.length!==need||chosen.size!==need)throw Error('Blueprint assembly did not produce unique requested questions.');
  return {ids:shuffled(selection.map(q=>q.id),random),missing:[],nlsFound};
}
