const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:900}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  const Native=IntersectionObserver;window.liveRevealObservers=new Set();
  window.IntersectionObserver=class extends Native{
   constructor(...args){super(...args);this.targets=new Set();}
   observe(el){this.targets.add(el);window.liveRevealObservers.add(this);super.observe(el);}
   unobserve(el){this.targets.delete(el);if(!this.targets.size)window.liveRevealObservers.delete(this);super.unobserve(el);}
   disconnect(){this.targets.clear();window.liveRevealObservers.delete(this);super.disconnect();}
  };
 });
 await page.goto(process.env.APP_TEST_URL||'http://127.0.0.1:4173');
 const chart=page.locator('#chart-section');
 assert.ok(await chart.evaluate(el=>el.classList.contains('is-awaiting-reveal')),'below-fold chart starts waiting');
 assert.equal(await chart.evaluate(el=>getComputedStyle(el).opacity),'0');
 assert.equal(await page.locator('.page-heading').evaluate(el=>getComputedStyle(el).opacity),'1');
 const stat=page.locator('.stat-card').first();
 const before=await stat.evaluate(el=>getComputedStyle(el).backgroundColor);
 await stat.hover();await page.waitForTimeout(260);
 assert.notEqual(await stat.evaluate(el=>getComputedStyle(el).backgroundColor),before);
 assert.ok((await stat.evaluate(el=>getComputedStyle(el).transform)).startsWith('matrix(1.012'));
 await chart.scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>!document.querySelector('#chart-section').classList.contains('is-awaiting-reveal'));
 await page.waitForTimeout(600);assert.equal(await chart.evaluate(el=>getComputedStyle(el).opacity),'1');
 await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(60);
 assert.ok(await chart.evaluate(el=>!el.classList.contains('is-awaiting-reveal')),'seen chart stays revealed');
 await page.locator('[data-alphabet="katakana"]').click();
 assert.ok(await chart.evaluate(el=>!el.classList.contains('is-awaiting-reveal')),'changing alphabet does not replay seen sections');
 for(let i=0;i<6;i++)await page.locator(`[data-alphabet="${i%2?'katakana':'hiragana'}"]`).click();
 assert.ok(await page.evaluate(()=>window.liveRevealObservers.size<=1),'no leaked observers');
 await page.locator('#effects-toggle').click();
 assert.equal(await page.locator('.is-awaiting-reveal').count(),0);
 assert.equal(await page.evaluate(()=>window.liveRevealObservers.size),0);
 await page.reload();assert.equal(await page.locator('.is-awaiting-reveal').count(),0);
 await page.locator('#effects-toggle').click();
 // Fresh session: keyboard focus must expose offscreen content immediately.
 await page.reload();await page.locator('#manage-progress').focus();
 assert.ok(await page.locator('.page-footer').evaluate(el=>!el.classList.contains('is-awaiting-reveal')));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.documentElement.dataset.effects==='off');
 assert.equal(await page.locator('.is-awaiting-reveal').count(),0);
 assert.equal(await page.evaluate(()=>window.liveRevealObservers.size),0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const width of [320,390,768]){
  await page.setViewportSize({width,height:844});await page.reload();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await chart.scrollIntoViewIfNeeded();await page.waitForTimeout(450);
  assert.equal(await chart.evaluate(el=>getComputedStyle(el).opacity),'1');
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: hover brightness/scale, initial visibility, scroll reveal, one-time reveal across renders, focus access, effects off, reduced motion, observer cleanup, and mobile widths.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
