import test from 'node:test';
import assert from 'node:assert/strict';
import * as k from '../src/katakana.js';
import {questions as hiragana} from '../src/data.js';
import {checkAnswer, emptyProgress, recordAnswer, pickQuestion, loadProgress} from '../src/engine.js';
const word=text=>k.questions.find(q=>q.text===text);
test('Katakana chart covers base, voiced, yoon, small kana, long mark and extended sounds',()=>{
 for(const [group,count] of [['basic',46],['voiced',25],['combo',33],['extra',14],['foreign',25]])assert.equal(k.kana.filter(x=>x.group===group).length,count);
 assert.equal(new Set(k.kana.map(x=>x.key)).size,k.kana.length);
 for(const item of k.kana){assert.ok(word(item.key));for(const spelling of item.options)assert.ok(checkAnswer(word(item.key),spelling).correct,`${item.key}: ${spelling}`);}
});
test('every Katakana prompt accepts its canonical spelling and uses known chart components',()=>{
 const ids=new Set();for(const q of k.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.ok(checkAnswer(q,q.tokens.map(t=>t.options[0]).join('')).correct,q.text);for(const t of q.tokens)assert.ok(k.kanaMap[t.key]);}
});
test('long vowels accept repeated vowel or keyboard hyphen, but cannot be omitted',()=>{
 for(const [text,answers] of [['コーヒー',['koohii','ko-hi-','koo hi i']],['スーパー',['suupaa','su-pa-']],['ケーキ',['keeki','ke-ki']],['コンピューター',['konpyuutaa','konnpyu-ta-']]]){
  for(const spelling of answers.filter(s=>!s.includes(' ')))assert.ok(checkAnswer(word(text),spelling).correct,`${text}: ${spelling}`);
 }
 assert.equal(checkAnswer(word('コーヒー'),'kohi').correct,false);
 assert.equal(checkAnswer(word('スーパー'),'supa').correct,false);
 assert.deepEqual(checkAnswer(word('ケーキ'),'keki').wrongKeys,['ー']);
 assert.equal(checkAnswer(word('ー'),'-').correct,true);
});
test('Katakana sokuon, nn and extended syllables',()=>{
 for(const [text,answers] of [['コップ',['koppu','koxtsupu']],['ベッド',['beddo']],['パン',['pann','pan']],['パーティー',['paatii','pa-thi-','pa-tii']],['ディスク',['disuku','dhisuku']],['ヴァイオリン',['vaiorinn','vaiorin']],['シェフ',['shefu','syefu']]])for(const a of answers)assert.ok(checkAnswer(word(text),a).correct,`${text}: ${a}`);
 assert.deepEqual(checkAnswer(word('コップ'),'kopu').wrongKeys,['ッ']);
 assert.equal(checkAnswer(word('シ'),'tsu').correct,false);
 assert.equal(checkAnswer(word('ン'),'so').correct,false);
});
test('Katakana bank and review filters never select Hiragana or particles',()=>{
 const state=emptyProgress();assert.equal(pickQuestion(state,{bank:k.questions,weakOnly:true}),null);
 const q=word('コップ');recordAnswer(state,q,checkAnswer(q,'kopu'),100);
 for(let i=0;i<10;i++){
  const picked=pickQuestion(state,{bank:k.questions,weakOnly:true,now:0});assert.ok(picked.tokens.some(t=>t.key==='ッ'));
 }
 assert.equal(pickQuestion(state,{bank:k.questions,now:600101}).id,q.id);
 assert.equal(pickQuestion(state,{bank:k.questions,category:'particles'}),null);
 assert.equal(pickQuestion(state,{bank:k.questions,category:'foreign'}).category,'foreign');
});
test('legacy Hiragana progress stays untouched when Katakana is saved or reset',()=>{
 const h=emptyProgress();const q=hiragana[0];recordAnswer(h,q,checkAnswer(q,'sakura'));
 const database=new Map([['japanese-master-v1',JSON.stringify(h)]]);const storage={getItem:key=>database.get(key)};
 assert.deepEqual(loadProgress(storage),h);
 const state=loadProgress(storage,'japanese-master-katakana-v1');assert.equal(state.score,0);
 recordAnswer(state,word('カメラ'),checkAnswer(word('カメラ'),'kamera'));
 database.set('japanese-master-katakana-v1',JSON.stringify(state));assert.deepEqual(loadProgress(storage),h);
 assert.equal(loadProgress(storage,'japanese-master-katakana-v1').score,10);
 database.set('japanese-master-katakana-v1',JSON.stringify(emptyProgress()));assert.deepEqual(loadProgress(storage),h);
});
