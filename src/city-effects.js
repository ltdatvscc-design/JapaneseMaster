// A single scene survives application renders. Each bind aborts previous listeners.
export function createCityEffects(storage, notice) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 801px) and (pointer: fine)');
  let preferred = true;
  try { preferred = storage.getItem('japanese-master-effects') !== 'off'; } catch {}
  let listeners, frame = 0, scene, x = 0, y = 0;
  let revealObserver;
  const revealed = new Set();
  const timers = new Set();
  const active = () => preferred && !reduced.matches && !document.hidden;
  function later(callback, ms) {
    const id = setTimeout(() => { timers.delete(id); callback(); }, ms);
    timers.add(id);
  }
  function stop() {
    cancelAnimationFrame(frame); frame = 0;
    scene?.style.setProperty('--scene-x', '0px');
    scene?.style.setProperty('--scene-y', '0px');
  }
  function reveal(element) {
    element.classList.remove('is-awaiting-reveal');
    revealed.add(element.dataset.revealKey);
    revealObserver?.unobserve(element);
  }
  function configureReveals() {
    revealObserver?.disconnect();
    const selectors = ['.page-heading', '.alphabet-panel', '.stat-card', '.quiz-card', '.chart-card', '.goal-card', '.weak-card', '.srs-card', '.katakana-guide', '.page-footer'];
    const elements = selectors.flatMap(selector => [...document.querySelectorAll(selector)].map((element, index) => {
      element.dataset.revealKey = `${selector}:${index}`;
      element.classList.add('city-reveal');
      element.style.setProperty('--reveal-delay', selector === '.stat-card' ? `${index * 65}ms` : '0ms');
      return element;
    }));
    if (!preferred || reduced.matches || !('IntersectionObserver' in window)) {
      elements.forEach(reveal); return;
    }
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
    }, {rootMargin:'0px 0px -36px 0px', threshold:0});
    for (const element of elements) {
      const bounds = element.getBoundingClientRect();
      if (revealed.has(element.dataset.revealKey) || (bounds.top < innerHeight - 36 && bounds.bottom > 0) || element.contains(document.activeElement)) reveal(element);
      else { element.classList.add('is-awaiting-reveal'); revealObserver.observe(element); }
    }
  }
  function sync() {
    document.documentElement.dataset.effects = active() ? 'on' : 'off';
    document.documentElement.dataset.sceneMotion = active() && desktop.matches ? 'on' : 'off';
    document.documentElement.dataset.tabHidden = String(document.hidden);
    const button = document.querySelector('#effects-toggle');
    if (button) {
      button.textContent = reduced.matches ? 'Hiệu ứng: Giảm' : `Hiệu ứng: ${preferred ? 'Bật' : 'Tắt'}`;
      button.setAttribute('aria-pressed', String(preferred && !reduced.matches));
      button.setAttribute('aria-label', reduced.matches ? 'Hiệu ứng đã tắt theo cài đặt giảm chuyển động của hệ thống' : `Hiệu ứng: ${preferred ? 'Bật' : 'Tắt'}`);
      button.setAttribute('aria-disabled', String(reduced.matches));
    }
    if (!active() || !desktop.matches) stop();
    if (!active()) document.querySelectorAll('.city-ripple,.answer-spark').forEach(el => el.remove());
    configureReveals();
  }
  function move(event) {
    if (!active() || !desktop.matches) return;
    x = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1)) * 5;
    y = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1)) * 5;
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      scene.style.setProperty('--scene-x', `${x}px`);
      scene.style.setProperty('--scene-y', `${y}px`);
    });
  }
  function ripple(event) {
    const button = event.target.closest('button');
    if (!active() || !button || button.disabled || button.classList.contains('kana-cell')) return;
    const rect = button.getBoundingClientRect();
    const dot = document.createElement('span'); dot.className = 'city-ripple'; dot.setAttribute('aria-hidden','true');
    const size = Math.max(rect.width, rect.height) * 2;
    Object.assign(dot.style,{width:`${size}px`,height:`${size}px`,left:`${(event.detail ? event.clientX-rect.left : rect.width/2)-size/2}px`,top:`${(event.detail ? event.clientY-rect.top : rect.height/2)-size/2}px`});
    button.append(dot); later(() => dot.remove(), 380);
  }
  function bind() {
    listeners?.abort(); revealObserver?.disconnect(); stop();
    for (const timer of timers) clearTimeout(timer); timers.clear();
    document.querySelectorAll('.city-ripple,.answer-spark').forEach(el=>el.remove());
    listeners = new AbortController();
    const options = {signal:listeners.signal};
    if (!scene) {
      scene = document.createElement('div'); scene.className='city-scene'; scene.setAttribute('aria-hidden','true');
      scene.innerHTML=`<div class="city-distance"></div><div class="city-shade"></div><div class="city-mist"></div><div class="city-foreground"></div><div class="city-embers">${Array.from({length:12},(_,i)=>`<i style="--edge:${i%2?97-i%3:1+i%3}%;--start:${8+i*7}%;--delay:-${i*1.7}s;--duration:${13+i%5}s"></i>`).join('')}</div>`;
      document.body.prepend(scene);
    }
    document.addEventListener('pointermove', move, {...options,passive:true});
    document.addEventListener('pointerleave', stop, options);
    document.addEventListener('click', ripple, {...options,capture:true});
    document.addEventListener('visibilitychange',sync,options);
    document.addEventListener('focusin',event=>{
      const section=event.target.closest('.city-reveal');
      if(section)reveal(section);
    },options);
    reduced.addEventListener('change',sync,options);
    desktop.addEventListener('change',sync,options);
    document.querySelector('#effects-toggle').addEventListener('click',()=>{
      if(reduced.matches){notice('Chuyển động đã được giảm theo cài đặt của thiết bị.');return;}
      preferred=!preferred;
      try{storage.setItem('japanese-master-effects',preferred?'on':'off');}catch{}
      sync();
    },options);
    sync();
  }
  function answer(correct) {
    const area=document.querySelector('#question-area');
    area.classList.toggle('answer-is-correct',correct);
    area.classList.toggle('answer-is-wrong',!correct);
    if (!correct || !active() || !desktop.matches) return;
    const card=document.querySelector('.quiz-card');
    for(let i=0;i<8;i++){
      const spark=document.createElement('i');spark.className='answer-spark';spark.setAttribute('aria-hidden','true');
      spark.style.cssText=`--spark-x:${i%2?'98%':'2%'};--spark-y:${30+i*7}%;--spark-dx:${i%2?-12:12}px;--spark-delay:${i*16}ms`;
      card.append(spark);later(()=>spark.remove(),650);
    }
  }
  function goal(alphabet, day) {
    const key=`japanese-master-celebrated-${alphabet}-${day}`;
    if(celebrated.has(key))return;
    try{if(storage.getItem(key))return;storage.setItem(key,'yes');}catch{}
    celebrated.add(key);
    notice('Mục tiêu hoàn thành! Bạn vừa thắp sáng thêm một ngày học.');
    if(active()){
      const ring=document.querySelector('#goal-ring');ring.classList.add('goal-celebrate');
      later(()=>ring.classList.remove('goal-celebrate'),700);
    }
  }
  const celebrated = new Set();
  return {bind,answer,goal};
}
