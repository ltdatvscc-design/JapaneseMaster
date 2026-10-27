// Browser regression: PLAYWRIGHT_MODULE=/path/to/playwright node tests/city-browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.APP_TEST_URL || 'http://127.0.0.1:5173';
(async () => {
 const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 try {
 const context = await browser.newContext({viewport:{width:1440,height:1000}});
 const page = await context.newPage(); const errors=[];
 page.on('pageerror', e=>errors.push(e.message));
 await page.addInitScript(()=>{
  Math.random=()=>0;
  const raf=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);
  window.pendingFrames=new Set();
  window.requestAnimationFrame=callback=>{let id=raf(time=>{window.pendingFrames.delete(id);callback(time)});window.pendingFrames.add(id);return id;};
  window.cancelAnimationFrame=id=>{window.pendingFrames.delete(id);cancel(id)};
 });
 await page.goto(url); await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.locator('.city-scene').count(),1);
 assert.equal(await page.locator('.city-embers i').count(),12);
 assert.equal(await page.locator('.city-scene').getAttribute('aria-hidden'),'true');
 assert.equal(await page.locator('.city-scene').evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 await page.locator('#answer-input').fill('sak');
 await page.locator('#effects-toggle').click();
 assert.equal(await page.locator('#answer-input').inputValue(),'sak');
 assert.equal(await page.locator('html').getAttribute('data-effects'),'off');
 await page.reload();assert.equal(await page.locator('html').getAttribute('data-effects'),'off');
 await page.locator('#effects-toggle').click();
 await page.mouse.move(1400,900);await page.waitForTimeout(40);
 assert.ok(Math.abs(await page.locator('.city-scene').evaluate(el=>parseFloat(el.style.getPropertyValue('--scene-x'))))<=5);
 await page.locator('#answer-input').fill('sakira');await page.locator('#answer-input').press('Enter');
 assert.equal(await page.locator('.kana-cell.is-weak').getAttribute('data-kana'),'く');
 await page.waitForTimeout(1200);assert.equal(await page.locator('.kana-question').textContent(),'さくら');
 await page.locator('#answer-input').press('Enter');
 await page.locator('[data-kana="く"]').click();await page.locator('#practice-kana').click();
 await page.locator('#answer-input').fill('ku');await page.locator('#answer-input').press('Enter');
 assert.match(await page.locator('#score').textContent(),/^10/);
 await page.waitForFunction(()=>!document.querySelector('#answer-input').readOnly);
 await page.locator('[data-alphabet="katakana"]').click();
 assert.match(await page.locator('#score').textContent(),/^0/);
 await page.locator('#answer-input').fill('kamera');await page.locator('#answer-input').press('Enter');
 await page.locator('[data-alphabet="hiragana"]').click();
 await page.waitForTimeout(1200);assert.match(await page.locator('#score').textContent(),/^10/);
 await page.locator('#review-weak').click();assert.equal(await page.locator('#weak-only').isChecked(),true);
 await page.reload();assert.match(await page.locator('#score').textContent(),/^10/);
 const cdp=await context.newCDPSession(page);
 async function listenerCounts(){return (await cdp.send('Runtime.evaluate',{expression:'JSON.stringify(Object.fromEntries(Object.entries(getEventListeners(document)).map(([key,list])=>[key,list.length])))',includeCommandLineAPI:true,returnByValue:true})).result.value;}
 const baseline=await listenerCounts();
 for(let i=0;i<8;i++)await page.locator(`[data-alphabet="${i%2?'hiragana':'katakana'}"]`).click();
 assert.equal(await listenerCounts(),baseline,'document listener counts must remain stable');
 assert.equal(await page.locator('.city-scene').count(),1);
 await page.evaluate(()=>{for(let i=0;i<20;i++)document.dispatchEvent(new PointerEvent('pointermove',{clientX:i*40,clientY:200}));if(window.pendingFrames.size!==1)throw Error(`Unexpected RAF count: ${window.pendingFrames.size}`);});
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert.equal(await page.locator('html').getAttribute('data-effects'),'off');
 assert.equal(await page.evaluate(()=>window.pendingFrames.size),0);
 await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.dataset.effects==='off');
 assert.equal(await page.locator('html').getAttribute('data-effects'),'off');
 await page.locator('#effects-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('html').getAttribute('data-effects'),'off');
 assert.equal(await page.locator('.city-distance').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>document.documentElement.dataset.effects==='on');
 await page.locator('#open-guide').click();await page.locator('#modal').waitFor();await page.keyboard.press('Escape');assert.equal(await page.locator('#modal').isVisible(),false);
 await page.locator('[data-alphabet="katakana"]').click();
 await page.locator('#manage-progress').click();
 const download=page.waitForEvent('download');await page.locator('#export-progress').click();assert.match((await download).suggestedFilename(),/katakana/);
 await page.locator('#reset-progress').click();await page.locator('#confirm-reset').click();assert.match(await page.locator('#score').textContent(),/^0/);
 await page.locator('[data-alphabet="hiragana"]').click();assert.match(await page.locator('#score').textContent(),/^10/);
 fs.mkdirSync('review',{recursive:true});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
  const background=await page.locator('.city-distance').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.ok(background.includes(width<=800?'city-mobile':'city-desktop'));
  if(width<=800){assert.equal(await page.locator('.city-foreground').evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await page.locator('.city-embers').evaluate(el=>getComputedStyle(el).display),'none');}
  if(width===390||width===1440){for(const section of await page.locator('.city-reveal').all()){await section.scrollIntoViewIfNeeded();}await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(650);await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`review/city-${width===390?'mobile':'desktop'}.png`,fullPage:true});}
 }
 // Seed a nearly completed day, then verify one celebration survives switches and reloads.
 await page.evaluate(()=>{const key='japanese-master-v1',data=JSON.parse(localStorage.getItem(key)),day=new Date().toLocaleDateString('sv-SE');data.days[day]=19;data.goal=20;data.reviews={};localStorage.setItem(key,JSON.stringify(data));});
 await page.reload();await page.locator('#answer-input').fill('sakura');await page.locator('#answer-input').press('Enter');
 assert.match(await page.locator('#toast').textContent(),/Mục tiêu hoàn thành/);
 await page.reload();assert.equal(await page.locator('#toast').textContent(),'');assert.equal(await page.locator('.goal-celebrate').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: app flows, persistence, export/reset, all viewports, motion preferences, stable listeners, bounded RAF, tab visibility, and one-time goal celebration.');
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
