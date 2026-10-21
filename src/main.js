import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/latin-700.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-700.css';
import './fonts.css';
import './style.css';
import { groups, kana, kanaMap, categories, ruleTips, questions } from './data.js';
import { loadProgress, checkAnswer, recordAnswer, pickQuestion, isWeak, emptyProgress } from './engine.js';
const icons={grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',keyboard:'<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M8 16h8"/>',book:'<path d="M12 5v16M12 5C8 2 4 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Z"/>',arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',chevron:'<path d="m9 5 7 7-7 7"/>',check:'<path d="m5 12 4 4L19 6"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',flame:'<path d="M13 3c2 5-3 5-2 9 2 0 3-2 4-4 5 4 5 12-3 13C2 21 3 12 7 8c0 3 2 4 3 4-2-5 3-6 3-9Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 3M4 16l2 3a8 8 0 0 0 13-3"/>',volume:'<path d="m11 5-6 4H2v6h3l6 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',leaf:'<path d="M20 3C6 1 1 9 6 16s17 0 14-13ZM4 21 15 10"/>',chart:'<path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/>'};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg>`;
let storage; try {storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}};}
let state=loadProgress(storage), category='all', weakOnly=false, chartTab='basic', chartWeak=false, current=pickQuestion(state), answered=false, page='practice';
let sound=false, lastResult=null;
function save(){try{storage.setItem('japanese-master-v1',JSON.stringify(state));}catch{toast('Trình duyệt chưa cho phép lưu. Tiến độ chỉ được giữ trong phiên này.');}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),4200);}
const today=()=>new Date().toLocaleDateString('sv-SE');
const weakCount=()=>kana.filter(k=>isWeak(state.kana[k.key])).length;
const learnedCount=()=>kana.filter(k=>state.kana[k.key]?.run>=3).length;
function shell(){
 document.querySelector('#app').innerHTML=`
 <aside class="sidebar"><a class="brand" href="#practice" aria-label="Japanese Master - Trang chủ"><span class="brand-symbol">あ</span><span>Japanese<span class="brand-sub">MASTER</span></span></a>
 <div class="workspace-label">GÓC HỌC TẬP</div><nav aria-label="Điều hướng chính">
 <button class="nav-item active" data-page="practice">${icon('keyboard')}<span>Luyện tập</span><span class="nav-dot"></span></button>
 <button class="nav-item" data-page="chart">${icon('grid')}<span>Bảng Hiragana</span></button>
 <button class="nav-item" data-page="guide">${icon('book')}<span>Phương pháp học</span></button>
 </nav><div class="sidebar-card"><span class="sprout">${icon('leaf')}</span><strong>Mỗi ngày một chút.</strong><p>Một hành trình dài bắt đầu<br>từ những nét chữ nhỏ.</p><span class="japanese-note">いっぽ、いっぽ。</span></div>
 <div class="sidebar-bottom"><span class="avatar">B</span><div><strong>Bạn học tiếng Nhật</strong><small>Hành trình N5 của bạn</small></div><span class="online-dot"></span></div></aside>
 <div class="main-shell"><header class="topbar"><div class="breadcrumb">Góc học tập <span>/</span> <strong id="breadcrumb-current">Luyện tập</strong></div><div class="topbar-right"><span class="level-pill">JLPT N5</span><span class="daily-streak">${icon('flame')} <b id="header-streak">0</b><span> đúng liên tiếp</span></span></div></header>
 <main id="content"><section class="page-heading"><div><div class="eyebrow">CHẬM MÀ CHẮC · 少しずつ</div><h1>Hôm nay, cùng học Hiragana<span class="heading-dot">.</span></h1><p>Luyện đôi tay, nhớ mặt chữ. Tiến bộ hơn một chút mỗi ngày.</p></div><button class="secondary-button how-button" id="how-button">${icon('info')} Cách luyện tập</button></section>
 <section class="stats-row" aria-label="Thống kê luyện tập">
 <div class="stat-card"><span class="stat-icon purple">${icon('spark')}</span><div><span>Tổng điểm</span><strong id="score">0 <small>điểm</small></strong></div><span class="stat-note">Mỗi câu đúng +10</span></div>
 <div class="stat-card"><span class="stat-icon green">${icon('target')}</span><div><span>Độ chính xác</span><strong id="accuracy">—</strong></div><span class="stat-note" id="attempts-note">Chưa có lượt trả lời</span></div>
 <div class="stat-card"><span class="stat-icon orange">${icon('flame')}</span><div><span>Chuỗi trả lời đúng</span><strong id="streak">0 <small>câu</small></strong></div><span class="stat-note" id="best-note">Kỷ lục: 0 câu</span></div>
 </section>
 <div class="content-grid"><div class="primary-column">
 <section class="card quiz-card" id="practice-section"><div class="card-header"><div class="section-title">${icon('keyboard')}<h2>Luyện gõ Romaji</h2></div><span class="live-label"><i></i> Từng bước ghi nhớ</span></div>
 <div class="quiz-controls"><label class="select-wrap"><span class="sr-only">Chọn nhóm quy tắc</span><select id="category">${categories.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label class="switch-label"><input type="checkbox" id="weak-only"><span class="switch"></span>Chỉ ôn âm yếu</label></div>
 <div id="question-area"></div><div class="quiz-footer"><span>${icon('info')} Gõ theo chữ viết, không bỏ nguyên âm dài.</span><button id="sound-toggle" class="icon-button" aria-label="Bật âm báo" aria-pressed="false">${icon('volume')}</button></div></section>
 <section class="card chart-card" id="chart-section"><div class="card-header"><div><div class="section-title">${icon('grid')}<h2>Bảng chữ của bạn</h2></div><p class="card-subtitle">Nhìn lại những âm đã gặp, nhận ra những âm cần ôn.</p></div><span class="count-badge">${kana.length} âm & cách ghép</span></div>
 <div class="chart-toolbar"><div class="tabs" role="tablist" aria-label="Nhóm chữ Hiragana">${Object.entries(groups).map(([id,g])=>`<button role="tab" aria-selected="${id==='basic'}" class="tab ${id==='basic'?'active':''}" data-chart="${id}">${g.short}</button>`).join('')}</div><label class="weak-filter"><input id="chart-weak" type="checkbox"> Chỉ âm yếu</label></div>
 <div class="chart-legend"><span><i class="legend-dot neutral"></i>Chưa luyện</span><span><i class="legend-dot learned"></i>Đã nhớ</span><span><i class="legend-dot weak"></i>Cần ôn lại</span></div>
 <div id="chart-grid"></div><div class="chart-bottom">${icon('info')} Chọn một chữ để xem cách gõ và luyện riêng âm đó.</div></section>
 </div><aside class="right-column">
 <section class="card goal-card"><div class="section-title">${icon('target')}<h2>Mục tiêu hôm nay</h2></div><div class="goal-ring" id="goal-ring"><div><strong id="daily-count">0<span>/ 20</span></strong><small>câu đã luyện</small></div></div><h3 id="goal-title">Bắt đầu từ một câu nhỏ</h3><p id="goal-description">Dành 5 phút để tiếng Nhật<br>trở thành thói quen mỗi ngày.</p><div class="week-days" id="week-days"></div></section>
 <section class="weak-card"><div class="weak-heading"><span class="weak-heading-icon">${icon('refresh')}</span><h2>Thêm một lần nhớ</h2></div><p>Bạn có <strong id="weak-number">0 âm</strong> cần ôn lại.<br>Một chút luyện tập sẽ tạo khác biệt.</p><div class="weak-preview" id="weak-preview"></div><button id="review-weak">Ôn những âm này ${icon('arrow')}</button></section>
 <section class="srs-card" id="guide-section"><span class="mini-label">HỌC THÔNG MINH HƠN</span><div class="srs-illustration" aria-hidden="true"><span class="flashcard back">あ</span><span class="flashcard front">あ<small>a</small></span><span class="illustration-spark">✧</span></div><h2>Nhớ lâu, không học dồn.</h2><p>Ôn đúng lúc bạn sắp quên.<br>Khám phá phương pháp SRS<br>và học cùng Anki.</p><button id="open-guide">Tìm hiểu phương pháp ${icon('arrow')}</button></section>
 </aside></div><footer class="page-footer"><span>つづけよう。 <span>Cứ tiếp tục nhé, bạn đang làm rất tốt.</span></span><button id="manage-progress">Quản lý tiến độ</button></footer></main></div>
 <div id="toast" role="status"></div><dialog id="modal" aria-labelledby="modal-title"><button id="close-modal" class="modal-close icon-button" aria-label="Đóng">${icon('close')}</button><div id="modal-content"></div></dialog>`;
 bind();renderQuestion();renderStats();renderChart();
}
function renderQuestion(){
 answered=false;lastResult=null;
 const area=document.querySelector('#question-area');
 if(!current){area.innerHTML=`<div class="empty-quiz">${icon('check')}<h3>Chưa có âm yếu trong nhóm này</h3><p>Thử nhóm khác hoặc tắt “Chỉ ôn âm yếu” để tiếp tục.</p><button class="primary-button" id="back-all">Luyện tất cả quy tắc ${icon('arrow')}</button></div>`;document.querySelector('#back-all').onclick=()=>{category='all';weakOnly=false;document.querySelector('#category').value='all';document.querySelector('#weak-only').checked=false;next();};return;}
 const categoryLabel=categories.find(([id])=>id===current.category)?.[1]||'Luyện ký tự';
 area.innerHTML=`<div class="question-display"><span class="question-tag">${categoryLabel}</span><p class="question-instruction">Gõ Romaji tương ứng với từ bên dưới</p><div class="kana-question ${current.text.length>6?'long-question':''}" lang="ja">${current.text}</div><div class="meaning">${current.meaning}</div></div>
 <form id="answer-form" novalidate><label class="sr-only" for="answer-input">Nhập phiên âm Romaji</label><div class="answer-field"><span class="input-prefix">Aa</span><input id="answer-input" name="romaji" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="80" placeholder="Nhập Romaji của bạn…" aria-describedby="answer-feedback"><kbd>Enter ↵</kbd></div><div id="answer-feedback" aria-live="polite" class="answer-feedback"></div><div class="answer-actions"><button type="button" class="text-button" id="show-hint">${icon('spark')} Gợi ý quy tắc</button><button type="submit" class="primary-button" id="submit-answer">Kiểm tra ${icon('arrow')}</button></div><div id="hint-panel" class="hint-panel" hidden>${ruleTips[current.category]}</div></form>`;
 document.querySelector('#answer-form').onsubmit=submit;
 document.querySelector('#show-hint').onclick=()=>{const hint=document.querySelector('#hint-panel');hint.hidden=!hint.hidden;};
}
function next(){current=pickQuestion(state,{category,weakOnly,previous:current?.id});renderQuestion();document.querySelector('#answer-input')?.focus({preventScroll:true});}
function beep(correct){if(!sound)return;try{const AudioCtx=window.AudioContext||window.webkitAudioContext;const ctx=new AudioCtx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=correct?660:220;gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);osc.start();osc.stop(ctx.currentTime+.2);osc.onended=()=>ctx.close();}catch{}}
let advanceTimer;
function submit(event){
 event.preventDefault();if(answered){clearTimeout(advanceTimer);next();return;}
 const input=document.querySelector('#answer-input');if(!input.value.trim()){document.querySelector('#answer-feedback').textContent='Hãy nhập Romaji trước khi kiểm tra nhé.';input.focus();return;}
 const result=checkAnswer(current,input.value);lastResult=result;answered=true;recordAnswer(state,current,result);save();renderStats();renderChart();beep(result.correct);
 input.readOnly=true;input.setAttribute('aria-invalid',String(!result.correct));document.querySelector('.answer-field').classList.add(result.correct?'correct':'incorrect');
 const feedback=document.querySelector('#answer-feedback');feedback.className=`answer-feedback ${result.correct?'success':'error'}`;
 feedback.innerHTML=result.correct?`${icon('check')} Chính xác! <strong>+10 điểm</strong> <span>Đang chuyển câu…</span>`:`<div><strong>Chưa đúng — cùng nhớ lại nhé.</strong><div class="correction">${result.parts.map(p=>`<span class="correction-part ${p.wrong?'wrong':''}"><b lang="ja">${p.key}</b><small>${p.reading}</small></span>`).join('')}</div><span>Đáp án: <b>${result.answer}</b>. Các âm tô đỏ đã được thêm vào bảng ôn tập.</span></div>`;
 document.querySelector('#submit-answer').innerHTML=`Câu tiếp theo ${icon('arrow')}`;
 if(result.correct)advanceTimer=setTimeout(next,1100);
}
function renderStats(){
 document.querySelector('#score').innerHTML=`${state.score.toLocaleString('vi-VN')} <small>điểm</small>`;
 document.querySelector('#accuracy').innerHTML=state.attempts?`${Math.round(state.correct/state.attempts*100)}<small>%</small>`:'—';
 document.querySelector('#attempts-note').textContent=state.attempts?`${state.correct}/${state.attempts} câu trả lời đúng`:'Chưa có lượt trả lời';
 document.querySelector('#streak').innerHTML=`${state.streak} <small>câu</small>`;document.querySelector('#header-streak').textContent=state.streak;
 document.querySelector('#best-note').textContent=`Kỷ lục: ${state.bestStreak} câu`;
 const count=state.days[today()]||0;
 document.querySelector('#daily-count').innerHTML=`${count}<span>/ ${state.goal}</span>`;
 document.querySelector('#goal-ring').style.setProperty('--progress',`${Math.min(100,count/state.goal*100)}%`);
 document.querySelector('#goal-title').textContent=count>=state.goal?'Bạn đã hoàn thành mục tiêu!':count?'Bạn đang tiến bộ từng chút':'Bắt đầu từ một câu nhỏ';
 document.querySelector('#goal-description').innerHTML=count>=state.goal?'Thật tuyệt! Hẹn bạn ngày mai.<br>Bạn vẫn có thể tiếp tục luyện.':'Dành 5 phút để tiếng Nhật<br>trở thành thói quen mỗi ngày.';
 const weekdays=['CN','T2','T3','T4','T5','T6','T7'];
 document.querySelector('#week-days').innerHTML=Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-6+i);const done=state.days[date.toLocaleDateString('sv-SE')]>0;return `<div class="day ${i===6?'today':''}"><span>${weekdays[date.getDay()]}</span><b class="${done?'done':''}" title="${date.toLocaleDateString('vi-VN')}">${done?icon('check'):i===6?'•':'·'}</b></div>`;}).join('');
 const weak=kana.filter(k=>isWeak(state.kana[k.key]));document.querySelector('#weak-number').textContent=`${weak.length} âm`;
 document.querySelector('#weak-preview').innerHTML=weak.length?weak.slice(0,5).map(k=>`<span lang="ja">${k.key}</span>`).join('')+(weak.length>5?`<small>+${weak.length-5}</small>`:''):'<span class="no-weak">Chưa có âm nào cần ôn ✧</span>';
 document.querySelector('#review-weak').disabled=!weak.length;
}
function renderChart(){
 const group=groups[chartTab];const grid=document.querySelector('#chart-grid');
 grid.className=`kana-grid ${chartTab==='combo'?'three-columns':''}`;
 let entries=group.rows.flatMap(row=>chartTab==='combo'?row:[...row,...Array(Math.max(0,5-row.length)).fill(null)]);
 if(chartWeak)entries=entries.filter(spec=>spec&&isWeak(state.kana[spec.split(':')[0]]));
 grid.innerHTML=entries.map(spec=>{if(!spec)return '<span class="kana-placeholder" aria-hidden="true">—</span>';const [key]=spec.split(':');const item=kanaMap[key];const progress=state.kana[key];const weak=isWeak(progress);const learned=progress?.run>=3;return `<button class="kana-cell ${weak?'is-weak':learned?'is-learned':progress?'is-practised':''}" data-kana="${key}" aria-label="${key}, ${item.options[0]}${weak?', cần ôn lại':learned?', đã nhớ':''}"><span lang="ja">${key}</span><small>${item.options[0]}</small>${weak?'<i aria-hidden="true"></i>':''}</button>`;}).join('')||'<p class="chart-empty">Không có âm cần ôn trong nhóm này. Thật tốt!</p>';
 grid.querySelectorAll('[data-kana]').forEach(button=>button.onclick=()=>showKana(button.dataset.kana));
}
function showModal(html){clearTimeout(advanceTimer);document.querySelector('#modal-content').innerHTML=html;document.querySelector('#modal').showModal();}
function showKana(key){const item=kanaMap[key], progress=state.kana[key];showModal(`<span class="mini-label">GHI NHỚ MỘT ÂM</span><h2 id="modal-title" class="modal-kana" lang="ja">${key}</h2><div class="reading-chips">${item.options.map(o=>`<span>${o}</span>`).join('')}</div><p>${groups[item.group].label}. ${key==='ん'?'Dùng nn để gõ rõ chữ ん. Trong từ, n cũng được nhận trước phụ âm phù hợp hoặc ở cuối từ.':key==='っ'?'Trong từ, nhân đôi phụ âm kế tiếp. Khi đứng riêng, gõ xtsu hoặc ltsu.':key==='を'?'Trong vai trò trợ từ, đọc là o; bàn phím tiếng Nhật dùng wo.':key==='ぢ'||key==='づ'?'Đây là cách gõ để phân biệt ký tự; cách đọc thường giống じ hoặc ず.':'Hãy nhìn mặt chữ, đọc nhẩm rồi tự gõ lại.'}</p><p class="modal-muted">${progress?`Đã luyện ${progress.seen} lần · Sai ${progress.errors} lần · Đúng liên tiếp ${progress.run} lần`:'Bạn chưa luyện âm này.'}</p><button id="practice-kana" class="primary-button">Luyện âm này ${icon('arrow')}</button>`);document.querySelector('#practice-kana').onclick=()=>{document.querySelector('#modal').close();current=questions.find(q=>q.id===`kana-${key}`);renderQuestion();navigate('practice');document.querySelector('#answer-input').focus({preventScroll:true});};}
function guide(){showModal(`<span class="mini-label">ANKI & SPACED REPETITION</span><h2 id="modal-title">Nhớ lâu, từng chút một.</h2><p>Não bộ nhớ tốt hơn khi bạn tự nhớ lại kiến thức và ôn vào những thời điểm cách xa dần nhau.</p><div class="srs-timeline"><span>Hôm nay</span><b>→</b><span>1 ngày</span><b>→</b><span>3 ngày</span><b>→</b><span>7 ngày</span></div><ol class="guide-steps"><li><strong>Tự nhớ trước khi xem đáp án</strong><p>Nhìn Hiragana, đọc nhẩm rồi gõ. Đừng mở gợi ý ngay khi gặp khó.</p></li><li><strong>Ôn những âm bạn hay nhầm</strong><p>Âm sai được đánh dấu đỏ. Đúng 3 lần liên tiếp với âm đó sẽ chuyển sang “Đã nhớ”. Đây là dấu hiệu luyện tập, chưa phải bảo đảm ghi nhớ lâu dài.</p></li><li><strong>Giữ nhịp 5–10 phút mỗi ngày</strong><p>Ứng dụng lên lịch câu đúng sau 1, 3, 7, 14, 30 ngày; câu sai sau 10 phút. Câu đến hạn được ưu tiên trong nhóm đang chọn. Bạn vẫn có thể luyện thêm bất cứ lúc nào.</p></li><li><strong>Kết hợp Anki</strong><p>Tạo thẻ: mặt trước là Hiragana; mặt sau là Romaji và nghĩa. Trong Anki, chọn Again nếu quên, Good nếu nhớ. Ôn thẻ đến hạn hằng ngày trước khi thêm thẻ mới.</p></li></ol><div class="guide-note">Đây là lịch SRS đơn giản, không phải thuật toán FSRS của Anki. Tiến độ lưu trên trình duyệt này, chưa đồng bộ tài khoản.</div>`);}
function navigate(target){page=target;document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===target));document.querySelector('#breadcrumb-current').textContent={practice:'Luyện tập',chart:'Bảng Hiragana',guide:'Phương pháp học'}[target];if(target==='guide'){guide();return;}document.querySelector(`#${target==='chart'?'chart':'practice'}-section`).scrollIntoView({behavior:'smooth',block:'start'});}
function bind(){
 document.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>navigate(el.dataset.page));document.querySelector('.brand').onclick=e=>{e.preventDefault();navigate('practice');};
 document.querySelector('#category').onchange=e=>{clearTimeout(advanceTimer);category=e.target.value;next();};
 document.querySelector('#weak-only').onchange=e=>{clearTimeout(advanceTimer);weakOnly=e.target.checked;next();};
 document.querySelectorAll('[data-chart]').forEach(el=>el.onclick=()=>{chartTab=el.dataset.chart;document.querySelectorAll('[data-chart]').forEach(tab=>{tab.classList.toggle('active',tab===el);tab.setAttribute('aria-selected',String(tab===el));});renderChart();});
 document.querySelector('#chart-weak').onchange=e=>{chartWeak=e.target.checked;renderChart();};
 document.querySelector('#review-weak').onclick=()=>{clearTimeout(advanceTimer);category='all';weakOnly=true;document.querySelector('#category').value='all';document.querySelector('#weak-only').checked=true;next();navigate('practice');};
 document.querySelector('#open-guide').onclick=guide;
 document.querySelector('#how-button').onclick=()=>showModal(`<span class="mini-label">CHÀO MỪNG ĐẾN GÓC HỌC TẬP</span><h2 id="modal-title">Nhìn chữ. Gõ. Ghi nhớ.</h2><ol class="guide-steps"><li><strong>Chọn nhóm muốn luyện</strong><p>Luyện tất cả hoặc tập trung vào âm ghép, trường âm, trợ từ và các âm đặc biệt.</p></li><li><strong>Gõ Romaji và nhấn Enter</strong><p>Đúng: nhận 10 điểm và tự chuyển câu. Sai: xem đáp án, nhấn Enter lần nữa để tiếp tục. Bỏ trống không bị tính sai.</p></li><li><strong>Nhìn lại bảng Hiragana</strong><p>Phần âm gõ sai được tô đỏ. Với câu trả lời có nhiều lỗi, phép đối chiếu gần nhất có thể chỉ là ước lượng. Chọn một chữ để luyện riêng.</p></li></ol><div class="guide-note">Gõ nn cho ん, di cho ぢ, du cho づ. Trường âm giữ nguyên chữ: tousan, ookii. Chỉ nhận wa/o/e cho は/を/へ ở câu được xác định là trợ từ. Không cần dấu cách.</div>`);
 document.querySelector('#sound-toggle').onclick=e=>{sound=!sound;const button=e.currentTarget;button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',sound?'Tắt âm báo':'Bật âm báo');toast(sound?'Đã bật âm báo kết quả.':'Đã tắt âm báo.');};
 document.querySelector('#close-modal').onclick=()=>document.querySelector('#modal').close();
 document.querySelector('#modal').addEventListener('click',e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close();}});
 document.querySelector('#manage-progress').onclick=()=>{showModal(`<span class="mini-label">DỮ LIỆU TRÊN THIẾT BỊ NÀY</span><h2 id="modal-title">Tiến độ học của bạn</h2><p>${state.attempts} lượt trả lời · ${learnedCount()} âm đã nhớ · ${weakCount()} âm cần ôn.</p><p>Dữ liệu được lưu trong trình duyệt hiện tại. Xóa dữ liệu trình duyệt sẽ xóa tiến độ học.</p><button id="export-progress" class="secondary-button">Tải bản sao tiến độ</button><hr><p>Đặt lại sẽ xóa toàn bộ điểm và lịch ôn trên trình duyệt này.</p><button id="reset-progress" class="danger-button">Đặt lại tiến độ…</button><div id="reset-confirmation"></div>`);
 document.querySelector('#export-progress').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`japanese-master-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 document.querySelector('#reset-progress').onclick=()=>{document.querySelector('#reset-confirmation').innerHTML='<p><strong>Bạn chắc chắn muốn xóa tiến độ?</strong></p><button class="danger-button" id="confirm-reset">Xác nhận xóa</button>';document.querySelector('#confirm-reset').onclick=()=>{state=emptyProgress();save();category='all';weakOnly=false;current=pickQuestion(state);document.querySelector('#modal').close();shell();toast('Đã đặt lại tiến độ. Bắt đầu hành trình mới nhé.');};};};
}
shell();
