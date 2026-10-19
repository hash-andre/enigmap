import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ executablePath: process.env.ENIGMAP_BROWSER || '/usr/bin/brave', headless: true, args: ['--no-sandbox','--disable-gpu'] });
const errors=[];
try {
 const context = await browser.newContext({ viewport: {width:1440,height:1000}, reducedMotion:'reduce' });
 const page = await context.newPage();
 page.on('pageerror',e=>errors.push(e.stack));
 await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
 await page.screenshot({path:'/tmp/enigmap-desktop.png'});
 assert.equal(await page.getByRole('button',{name:'Vista elenco'}).count(),0);
 assert.equal(await page.getByText('Prove con Catwoman',{exact:true}).count(),0);
 const cartography = page.locator('.leaflet-image-layer').first();
 const initialWidth = (await cartography.boundingBox()).width;
 await page.locator('.leaflet-map').first().hover(); await page.mouse.wheel(0,-120); await page.waitForTimeout(250);
 const zoomedWidth = (await cartography.boundingBox()).width;
 assert.ok(zoomedWidth / initialWidth <= 1.5 && zoomedWidth > initialWidth, 'Wheel zoom should advance at most half a zoom level per 120px');
 await page.getByRole('button',{name:'Ripristina inquadratura'}).click();
 await page.getByRole('button',{name:'Come funziona'}).click();
 await page.getByRole('dialog').getByRole('button',{name:'Inizia l’indagine'}).click();
 await page.getByRole('searchbox',{name:'Cerca un punto'}).fill('Gru al largo');
 await page.getByRole('button',{name:'Trofeo 1: Gru al largo',exact:true}).click();
 await page.getByRole('dialog').getByRole('checkbox',{name:/Completato/}).check();
 await page.screenshot({path:'/tmp/enigmap-modal.png'});
 await page.getByRole('button',{name:'Torna alla mappa'}).click();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('enigmap.progress.v1')).completed.length),1);
 await page.reload({waitUntil:'networkidle'});
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('enigmap.progress.v1')).completed.length),1);
 await page.getByRole('searchbox',{name:'Cerca un punto'}).fill('Gru al largo');
 await page.getByRole('button',{name:'Trofeo 1: Gru al largo · Completato',exact:true}).click();
 assert.equal(await page.getByRole('dialog').getByRole('checkbox',{name:/Completato/}).isChecked(),true);
 await page.getByRole('dialog').getByRole('checkbox',{name:/Completato/}).uncheck();
 await page.keyboard.press('Escape');
 await page.getByRole('searchbox',{name:'Cerca un punto'}).fill('');
 await page.getByLabel('Seleziona mappa o piano').selectOption('panessa');
 await page.waitForTimeout(200);
 assert.ok(await page.locator('.leaflet-marker-icon').count()>0);
 await page.getByLabel('Seleziona mappa o piano').selectOption('gotham');
 // Progress imports merge; malformed files leave existing IDs untouched.
 await page.locator('input[type=file]').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({app:'enigmap',version:1,completed:['miagani-trophy-01','unknown']}))});
 await page.getByRole('status').filter({hasText:'1 nuovi completamenti'}).waitFor();
 await page.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
 await page.getByRole('status').filter({hasText:'JSON valido'}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('enigmap.progress.v1')).completed.length),1);
 // localStorage can be denied; app stays usable and export remains available.
 const denied = await browser.newContext({viewport:{width:1100,height:800}});
 await denied.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage denied')}})});
 const deniedPage=await denied.newPage(); await deniedPage.goto('http://localhost:5173/');
 await deniedPage.getByRole('alert').waitFor(); await denied.close();
 const mobile = await browser.newContext({ viewport:{width:360,height:780}, isMobile:true, hasTouch:true });
 const phone = await mobile.newPage(); phone.on('pageerror',e=>errors.push(e.stack));
 await phone.goto('http://localhost:5173/',{waitUntil:'networkidle'});
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await phone.screenshot({path:'/tmp/enigmap-mobile.png'});
 await phone.getByRole('button',{name:'Apri filtri'}).click();
 await phone.getByRole('searchbox',{name:'Cerca un punto'}).fill('Gru al largo');
 await phone.getByRole('button',{name:'Chiudi filtri'}).click();
 
 await phone.getByRole('button',{name:'Trofeo 1: Gru al largo',exact:true}).click();
 const dialog = phone.getByRole('dialog');
 await dialog.getByRole('checkbox',{name:/Completato/}).check();
 const box=await phone.locator('.point-completion').boundingBox();
 assert.ok(box.y+box.height<=780 && box.x>=0);
 assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await phone.screenshot({path:'/tmp/enigmap-mobile-modal.png'});
 await mobile.close();
 // Verify actual live CSS updates without requiring a manual page refresh.
 const stylesheet = new URL('../src/style.css', import.meta.url);
 const original = await readFile(stylesheet, 'utf8');
 try {
   await writeFile(stylesheet, original + '\n:root{--enigmap-hmr-probe:ready}\n');
   await page.waitForFunction(() => getComputedStyle(document.documentElement).getPropertyValue('--enigmap-hmr-probe').trim() === 'ready');
 } finally { await writeFile(stylesheet, original); }
 await context.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop, mobile 360 px, modals, completion/reversal, persistence, import, storage denial, live CSS updates, no runtime errors.');
} finally {await browser.close();}
