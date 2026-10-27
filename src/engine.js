import { questions } from './data.js';
export const normalize = value => value.normalize('NFKC').toLowerCase().trim().replace(/’/g, "'");
export function distance(a, b) {
  const row = Array.from({length:b.length+1}, (_,i)=>i);
  for(let i=1;i<=a.length;i++) { let prev=row[0]; row[0]=i; for(let j=1;j<=b.length;j++){ const old=row[j]; row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1)); prev=old; } }
  return row[b.length];
}
// Align accepted readings to the input globally; one typo does not mark every kana in the word wrong.
export function checkAnswer(question, raw) {
  const input = normalize(raw).slice(0,120); const memo = new Map();
  function solve(index, pos) {
    if(index === question.tokens.length) return {cost:input.length-pos, normalCost:input.length-pos, parts:[]};
    const cacheKey=`${index}:${pos}`; if(memo.has(cacheKey)) return memo.get(cacheKey);
    let best = null;
    for(const reading of question.tokens[index].options) {
      for(let end=pos;end<=Math.min(input.length,pos+reading.length+4);end++) {
        const typed=input.slice(pos,end); const cost=distance(reading,typed); const rest=solve(index+1,end);
        // For equally close spellings, attribute a missing doubled/long sound to its marker first.
        const candidate={cost:cost+rest.cost, localCost:cost, normalCost:rest.normalCost+(['っ','ッ','ー'].includes(question.tokens[index].key)?0:cost), parts:[{key:question.tokens[index].key,reading,typed,wrong:cost>0},...rest.parts]};
        if(!best || candidate.cost<best.cost || (candidate.cost===best.cost && (candidate.normalCost<best.normalCost || (candidate.normalCost===best.normalCost && candidate.localCost<best.localCost)))) best=candidate;
      }
    }
    memo.set(cacheKey,best);return best;
  }
  const result=solve(0,0);
  // A surplus suffix belongs to the final sound, even if previous sounds aligned exactly.
  if(result.cost>0 && !result.parts.some(p=>p.wrong)) result.parts.at(-1).wrong=true;
  return {correct:result.cost===0, parts:result.parts, wrongKeys:[...new Set(result.parts.filter(p=>p.wrong).map(p=>p.key))], answer:question.tokens.map(t=>t.options[0]).join('')};
}
export function emptyProgress(){return {version:1, attempts:0,correct:0,streak:0,bestStreak:0,score:0,kana:{},reviews:{},days:{},goal:20};}
export function recordAnswer(state, question, result, now=Date.now()) {
  state.attempts++; state.correct+=Number(result.correct); state.streak=result.correct?state.streak+1:0;
  state.bestStreak=Math.max(state.streak,state.bestStreak); state.score+=result.correct?10:0;
  const day=new Date(now).toLocaleDateString('sv-SE'); state.days[day]=(state.days[day]||0)+1;
  for(const key of new Set(question.tokens.map(t=>t.key))){
    const item=state.kana[key]||{seen:0,errors:0,run:0}; item.seen++;
    if(result.wrongKeys.includes(key)){item.errors++;item.run=0;}else{item.run++;}
    state.kana[key]=item;
  }
  const previous=state.reviews[question.id]||{level:0};
  const level=result.correct?Math.min(previous.level+1,5):0;
  const delays=[10*60*1000,86400000,3*86400000,7*86400000,14*86400000,30*86400000];
  state.reviews[question.id]={level,due:now+delays[level]}; return state;
}
export function isWeak(item){return !!item && item.errors>0 && item.run<3;}
export function pickQuestion(state,{category='all',weakOnly=false,previous=null,now=Date.now(),random=Math.random,bank=questions}={}){
  let pool=bank.filter(q=>(category==='all'||q.category===category)&&(!weakOnly||q.tokens.some(t=>isWeak(state.kana[t.key]))));
  if(!pool.length) return null;
  if(pool.length>1) pool=pool.filter(q=>q.id!==previous);
  const due=pool.filter(q=>state.reviews[q.id]?.due<=now);
  if(due.length) pool=due;
  else {
    const fresh=pool.filter(q=>!state.reviews[q.id]);
    if(fresh.length)pool=fresh;
  }
  return pool[Math.floor(random()*pool.length)];
}
export function loadProgress(storage, key='japanese-master-v1'){
  try{
    const parsed=JSON.parse(storage.getItem(key));
    if(!parsed||parsed.version!==1)return emptyProgress();
    const base=emptyProgress();
    for(const key of ['attempts','correct','streak','bestStreak','score','goal']) if(Number.isFinite(parsed[key])&&parsed[key]>=0)base[key]=parsed[key];
    for(const key of ['kana','reviews','days'])if(parsed[key]&&typeof parsed[key]==='object'&&!Array.isArray(parsed[key]))base[key]=parsed[key];
    return base;
  }catch{return emptyProgress();}
}
