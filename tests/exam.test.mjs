import test from 'node:test';
import assert from 'node:assert/strict';
import {ABCD,shuffled,createOptionOrders,displayQuestion,displayAnswer,gradeSubmission} from '../lib/exam.mjs';
const qa={id:'q1',grade:11,kind:'mcq',options:{A:'hydrogen',B:'oxygen',C:'nitrogen',D:'chlorine'},answer:'B',stem:'Which gas?',explanation:'Check chemical formula.'};
const qb={id:'q2',grade:10,kind:'short',options:{},answer:'1.50',stem:'n = ?'};
test('shuffle preserves all options',()=>assert.deepEqual(shuffled(ABCD,()=>0).sort(),ABCD));
test('server remaps option letters consistently',()=>{
 const t={question_ids:['q1'],option_orders:{q1:['C','A','D','B']}};
 assert.equal(displayQuestion(t,qa).options.D,'oxygen');
 assert.equal(displayAnswer(t,qa),'D');
 const output=gradeSubmission(t,[qa],{q1:'D'});
 assert.equal(output.score,10);
 assert.equal(output.details[0].answer,'D');
 assert.equal(output.details[0].correct,true);
 assert.equal(displayQuestion(t,qa).answer,undefined);
});
test('short numbers accept decimal commas but not wrong values',()=>{
 const t={question_ids:['q2']};
 assert.equal(gradeSubmission(t,[qb],{q2:'1,50'}).score,10);
 assert.equal(gradeSubmission(t,[qb],{q2:'1.6'}).score,0);
});
test('missing question cannot silently alter denominator',()=>assert.throws(()=>gradeSubmission({question_ids:['nope']},[qb],{})));
test('orders contain each original letter once',()=>{
 const orders=createOptionOrders([qa],()=>0);assert.deepEqual(orders.q1.slice().sort(),ABCD);
});

test('four-part true/false receives partial credit',()=>{
 const q={id:'q3',kind:'tf4',answer:'D,S,D,S',stem:'Evaluate statements',options:{A:'a',B:'b',C:'c',D:'d'}};
 const t={question_ids:['q3']};
 assert.equal(gradeSubmission(t,[q],{q3:'D,S,D,D'}).score,5);
 assert.equal(gradeSubmission(t,[q],{q3:'D,S,D,S'}).score,10);
 assert.equal(gradeSubmission(t,[q],{q3:'S,D,S,D'}).score,0);
});
