import test from 'node:test';import assert from 'node:assert/strict';
import {quotaFromPercent,selectByBlueprint,blueprintSupply} from '../lib/blueprint.mjs';
import {calcInsights,learningPlan} from '../lib/insights.mjs';
test('percent apportionment always adds to total',()=>{
 for(const n of [1,2,7,10,17,28,32,50,100])assert.equal(Object.values(quotaFromPercent(n,{NB:30,TH:40,VD:20,VDC:10})).reduce((a,b)=>a+b,0),n);
});
test('invalid blueprint percentage rejected',()=>assert.throws(()=>quotaFromPercent(10,{NB:50,TH:40,VD:5,VDC:0})));
test('balanced bank selection preserves quotas and distinct IDs',()=>{
 const rows=['NB','TH','VD','VDC'].flatMap(level=>Array.from({length:10},(_,j)=>({id:level+j,difficulty:level,nls_tags:j%2===0?['6.2']:[]})));
 const quota={NB:3,TH:4,VD:2,VDC:1};const out=selectByBlueprint(rows,quota,3,()=>0);
 assert.equal(out.ids.length,10);assert.equal(new Set(out.ids).size,10);assert.ok(out.nlsFound>=3);
 for(const level of Object.keys(quota))assert.equal(out.ids.filter(id=>rows.find(q=>q.id===id)?.difficulty===level).length,quota[level]);
});
test('shortage reports missing level without compromising blueprint',()=>{
 const rows=[{id:'A',difficulty:'NB',nls_tags:[]}];const out=selectByBlueprint(rows,{NB:1,TH:1,VD:0,VDC:0});
 assert.equal(out.ids.length,0);assert.equal(out.missing[0].level,'TH');assert.equal(blueprintSupply(rows,{NB:1,TH:1,VD:0,VDC:0})[1].missing,1);
});
test('NLS cannot be invented when missing',()=>{
 const rows=[{id:'A',difficulty:'NB',nls_tags:[]}];const out=selectByBlueprint(rows,{NB:1,TH:0,VD:0,VDC:0},1);assert.equal(out.missing[0].level,'NLS/AI');
});
test('analytics uses partial marks, not Boolean correctness only',()=>{
 const a=[{details:[{id:'1',grade:10,chapter:'Nguyên tử',lesson:'Cấu tạo nguyên tử',difficulty:'TH',earned:.5,correct:false,stem:'A'},{id:'2',grade:10,chapter:'Nguyên tử',lesson:'Cấu tạo nguyên tử',difficulty:'NB',earned:1,correct:true,stem:'B'}]}];
 const z=calcInsights(a);assert.equal(z.groups.find(x=>x.kind==='chapter').percent,75);
 assert.equal(learningPlan(a).recommendations[0].mastery,75);
});
