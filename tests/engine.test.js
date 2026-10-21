import test from 'node:test';
import assert from 'node:assert/strict';
import {kana, groups, questions, tokenize} from '../src/data.js';
import {checkAnswer, emptyProgress, recordAnswer, isWeak, pickQuestion, loadProgress} from '../src/engine.js';
const q=text=>questions.find(q=>q.text===text);
test('chart contains all 46 base kana, 25 voiced sounds and 33 standard yoon',()=>{
 assert.equal(kana.filter(k=>k.group==='basic').length,46);
 assert.equal(kana.filter(k=>k.group==='voiced').length,25);
 assert.equal(kana.filter(k=>k.group==='combo').length,33);
 assert.equal(new Set(kana.map(k=>k.key)).size,kana.length);
 for(const k of kana)assert.ok(questions.some(q=>q.id===`kana-${k.key}`));
});
test('every question accepts its canonical reading and every chart reading',()=>{
 for(const item of questions){assert.equal(checkAnswer(item,item.tokens.map(t=>t.options[0]).join('')).correct,true,item.text);}
 for(const item of kana)for(const reading of item.options)assert.ok(checkAnswer(questions.find(q=>q.id===`kana-${item.key}`),reading).correct);
});
test('basic variants, compound sounds and doubled consonants',()=>{
 for(const [text, answers] of [['すし',['sushi','susi']],['おちゃ',['ocha','otya','ocya']],['きっぷ',['kippu','kixtsupu']],['ざっし',['zasshi','zassi']],['がっこう',['gakkou']]])for(const a of answers)assert.ok(checkAnswer(q(text),a).correct,`${text}: ${a}`);
 assert.ok(checkAnswer({tokens:tokenize('まっちゃ')},'matcha').correct);
});
test('long vowels must preserve kana spelling',()=>{
 assert.ok(checkAnswer(q('とうさん'),'tousan').correct);assert.ok(checkAnswer(q('とうさん'),'tousann').correct);
 assert.ok(checkAnswer(q('おおきい'),'ookii').correct);
 assert.equal(checkAnswer(q('とうさん'),'tosan').correct,false);
 assert.equal(checkAnswer(q('おおきい'),'oki').correct,false);
});
test('particle pronunciation alternatives apply only in particle context',()=>{
 for(const [text,answers] of [['わたしは',['watashiha','watashiwa']],['ほんを',['honwo','hono','honnwo','honno']],['にほんへ',['nihonhe','nihone']],['こんにちは',['konnichiha','konnichiwa']],['がっこうへ',['gakkouhe','gakkoue']]])for(const a of answers)assert.ok(checkAnswer(q(text),a).correct,`${text}: ${a}`);
 assert.equal(checkAnswer(q('はな'),'wana').correct,false);
});
test('nn is accepted safely; di and du distinguish kana',()=>{
 assert.ok(checkAnswer(q('みんな'),'minnna').correct);assert.equal(checkAnswer(q('みんな'),'mina').correct,false);
 assert.ok(checkAnswer(q('おんな'),'onnna').correct);
 assert.ok(checkAnswer(q('つづく'),'tsuduku').correct);assert.equal(checkAnswer(q('つづく'),'tsuzuku').correct,false);
 assert.ok(checkAnswer(q('はなぢ'),'hanadi').correct);assert.equal(checkAnswer(q('はなぢ'),'hanaji').correct,false);
});
test('only mistaken sound components are marked',()=>{
 assert.deepEqual(checkAnswer(q('さくら'),'sakura').wrongKeys,[]);
 assert.deepEqual(checkAnswer(q('さくら'),'sakira').wrongKeys,['く']);
 assert.deepEqual(checkAnswer(q('きっぷ'),'kipu').wrongKeys,['っ']);
 assert.deepEqual(checkAnswer(q('おちゃ'),'ochi').wrongKeys,['ちゃ']);
 assert.ok(checkAnswer(q('ねこ'),'nekoxxxxxxx').wrongKeys.length>0);
});
test('progress persists mistakes and needs three correct repetitions to clear red',()=>{
 const state=emptyProgress();const question=q('さくら');
 recordAnswer(state,question,checkAnswer(question,'sakira'),100000);
 assert.equal(state.score,0);assert.ok(isWeak(state.kana['く']));assert.equal(isWeak(state.kana['さ']),false);
 for(let i=0;i<3;i++)recordAnswer(state,question,checkAnswer(question,'sakura'),200000);
 assert.equal(state.score,30);assert.equal(state.streak,3);assert.equal(state.correct,3);assert.equal(state.attempts,4);assert.equal(isWeak(state.kana['く']),false);
 const restored=loadProgress({getItem:()=>JSON.stringify(state)});assert.deepEqual(restored,state);
});
test('SRS schedules failures after 10 minutes and prioritizes due reviews',()=>{
 const state=emptyProgress();const question=q('きっぷ');recordAnswer(state,question,checkAnswer(question,'kipu'),1000);
 assert.equal(state.reviews[question.id].due,601000);
 assert.equal(pickQuestion(state,{now:601001,random:()=>.7}).id,question.id);
 recordAnswer(state,question,checkAnswer(question,'kippu'),602000);
 assert.equal(state.reviews[question.id].due,602000+86400000);
});
test('filters, normalization and invalid storage',()=>{
 assert.equal(pickQuestion(emptyProgress(),{weakOnly:true}),null);
 assert.equal(pickQuestion(emptyProgress(),{category:'long'}).category,'long');
 assert.ok(checkAnswer(q('さくら'),' ＳＡＫＵＲＡ ').correct);
 assert.deepEqual(loadProgress({getItem:()=>'{bad'}),emptyProgress());
 assert.deepEqual(loadProgress({getItem:()=>{throw Error();}}),emptyProgress());
});
