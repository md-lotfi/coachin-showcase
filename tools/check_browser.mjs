// Optional browser regression checks. Requires Node 22+ and an already-running local Chrome CDP endpoint.
// No package installation; see README for loopback-only preview instructions.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const PREVIEW_ORIGIN=(process.env.COACHIN_PREVIEW_ORIGIN||'http://127.0.0.1:8083/').replace(/\/?$/, '/');
const CDP_ORIGIN=process.env.COACHIN_CDP_ORIGIN||'http://127.0.0.1:9225';
const targets = await (await fetch(CDP_ORIGIN+'/json')).json();
const target = targets.find(x=>x.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();const events=[];
ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result)}else events.push(m)});
const call=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}))});
const evaluate=async(expression)=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result?.value};
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function navigate(path='/'){await call('Page.navigate',{url:new URL(path.replace(/^\//,''),PREVIEW_ORIGIN).href});for(let i=0;i<100;i++){await delay(50);if(await evaluate('document.readyState==="complete"'))break;}await evaluate('document.fonts.ready.then(()=>true)');await delay(80);}
const viewport=(width,height=900)=>call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<600});
const screenshot=async path=>{const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path,Buffer.from(r.data,'base64'))};
const close=()=>ws.close();
await call('Page.enable');await call('Runtime.enable');await call('Network.enable');

const results=[],failures=[];
function assert(ok,label){if(!ok)failures.push(label);}
const pages=['/','/fr/','/ar/','/privacy-policy/','/terms-of-use/','/fr/privacy-policy/','/fr/terms-of-use/','/ar/privacy-policy/','/ar/terms-of-use/'];
for(const path of pages){
 for(const [width,height] of [[360,800],[768,1024],[1440,1000]]){
  await viewport(width,height);await navigate(path);
  await evaluate(`Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>{i.loading='eager';return i.decode().catch(()=>null)}))`);
  for(const theme of ['dark','light']){
   await evaluate(`document.documentElement.classList.toggle('dark',${theme==='dark'})`);
   const data=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth+1,broken:[...document.images].filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.getAttribute('src')),lang:document.documentElement.lang,dir:document.documentElement.dir,h1:document.querySelectorAll('h1').length,body:!!document.querySelector('main'),theme:getComputedStyle(document.body).backgroundColor})`);
   const label=path+' '+theme+' '+width;assert(!data.overflow,label+' overflow');assert(!data.broken.length,label+' broken images '+data.broken);assert(data.h1===1,label+' heading');assert(data.lang===(path.startsWith('/ar/')?'ar':path.startsWith('/fr/')?'fr':'en'),label+' lang');
   results.push({path,width,theme,...data});
  }
 }
}
// Exercise actual theme controls, storage persistence and locale navigation.
await viewport(390,844);await navigate('/');
await evaluate(`localStorage.setItem('coachin-theme','dark');document.documentElement.classList.add('dark')`);await navigate('/');
await evaluate(`document.querySelector('[data-theme-toggle]').click()`);
assert(await evaluate(`localStorage.getItem('coachin-theme')==='light'&&!document.documentElement.classList.contains('dark')`),'theme switch');
await navigate('/fr/');assert(await evaluate(`!document.documentElement.classList.contains('dark')`),'theme persists across locale');
await evaluate(`document.querySelector('.mobile-menu summary').click()`);assert(await evaluate(`document.querySelector('.mobile-menu').open`),'mobile menu opens');
await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});
assert(await evaluate(`!document.querySelector('.mobile-menu').open`),'menu escape');
await evaluate(`location.hash='screens'`);await delay(100);
assert(await evaluate(`[...document.querySelectorAll('[data-language]')].every(a=>new URL(a.href).hash==='#screens')`),'language keeps section');
await evaluate(`document.querySelector('.faq-item:not([open]) summary').click()`);await delay(50);
assert(await evaluate(`document.querySelectorAll('.faq-item[open]').length===1`),'FAQ opens one');
await navigate('/ar/');await evaluate(`document.querySelector('.gallery-trigger').click()`);await delay(100);
assert(await evaluate(`document.querySelector('#gallery-dialog').open&&document.activeElement.hasAttribute('data-gallery-close')`),'gallery opens focused');
await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,nativeVirtualKeyCode:9});
assert(await evaluate(`document.querySelector('#gallery-dialog').contains(document.activeElement)`),'gallery traps focus');
await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37,nativeVirtualKeyCode:37});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37,nativeVirtualKeyCode:37});
assert(await evaluate(`document.querySelector('#gallery-image').src.endsWith('pin_ar.webp')`),'gallery RTL arrow');
await evaluate(`document.querySelector('[data-gallery-step="1"]').click()`);assert(await evaluate(`document.querySelector('#gallery-image').src.endsWith('subscribe_ar.webp')`),'gallery next');
const rect=await evaluate(`(()=>{const r=document.querySelector('#gallery-image').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.5}})()`);
await call('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
await call('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x,y:rect.y}]});
await call('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:rect.x-90,y:rect.y}]});
await call('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(50);
assert(await evaluate(`document.querySelector('#gallery-image').src.endsWith('pin_ar.webp')`),'gallery RTL swipe');
await call('Emulation.setTouchEmulationEnabled',{enabled:false});
await call('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27,nativeVirtualKeyCode:27});await delay(50);
assert(await evaluate(`!document.querySelector('#gallery-dialog').open&&document.activeElement.classList.contains('gallery-trigger')&&document.body.style.overflow===''`),'gallery closes/restores focus/scroll');
// Optional independent QR decoding: a decoder is a test-only input, never a site dependency.
let decoded=null;
if(process.env.COACHIN_QR_DECODER){
 await navigate('/');
 const qr=await evaluate(`(async()=>{const i=new Image();i.src='assets/download-qr.svg';await i.decode();const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,512,512);x.drawImage(i,0,0,512,512);return [...x.getImageData(0,0,512,512).data]})()`);
 const {default:jsQR}=await import(pathToFileURL(process.env.COACHIN_QR_DECODER).href);
 decoded=jsQR(new Uint8ClampedArray(qr),512,512);
 assert(decoded?.data==='https://play.google.com/store/apps/details?id=com.raystate.coachin','QR decode');
}
// No JavaScript: full legal body, links, native details and original image fallback.
await call('Emulation.setScriptExecutionDisabled',{value:true});await navigate('/ar/privacy-policy/');
assert(await evaluate(`document.querySelectorAll('.legal-content h2').length===12&&document.querySelectorAll('.legal-content p').length>20`),'no-JS legal content');
await navigate('/fr/');assert(await evaluate(`document.querySelectorAll('.gallery-trigger[href$=".webp"]').length===3&&document.querySelectorAll('.faq-item').length===11`),'no-JS gallery/FAQ');await call('Emulation.setScriptExecutionDisabled',{value:false});
// Storage denial must not break navigation or toggling.
const blocked=await call('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})`});
await navigate('/ar/');await evaluate(`document.querySelector('[data-theme-toggle]').click()`);assert(await evaluate(`!document.documentElement.classList.contains('dark')`),'blocked storage theme');await call('Page.removeScriptToEvaluateOnNewDocument',{identifier:blocked.identifier});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate('/');assert(await evaluate(`getComputedStyle(document.querySelector('.hero-copy')).animationName==='none'`),'reduced motion');await call('Emulation.setEmulatedMedia',{features:[]});
await viewport(320,740);await navigate('/fr/');assert(await evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'320px French overflow');
await navigate('/404.html');assert(await evaluate(`document.querySelector('meta[name=robots]').content==='noindex'&&document.querySelectorAll('main .button').length===3&&document.querySelectorAll('[src],link[rel=stylesheet]').length===0`),'self-contained 404');
await viewport(1440,1000);await navigate('/');await evaluate(`localStorage.setItem('coachin-theme','dark');document.documentElement.classList.add('dark')`);await delay(850);await screenshot('/tmp/coachin-desktop-final.png');
await viewport(390,844);await navigate('/ar/');await delay(850);await screenshot('/tmp/coachin-ar-mobile-final.png');
await navigate('/fr/privacy-policy/');await evaluate(`document.querySelector('[data-theme-toggle]').click()`);await screenshot('/tmp/coachin-fr-privacy-final.png');
const exceptions=events.filter(e=>e.method==='Runtime.exceptionThrown');assert(!exceptions.length,'browser runtime exceptions '+JSON.stringify(exceptions));
const badResponses=events.filter(e=>e.method==='Network.responseReceived'&&e.params.response.status>=400);assert(!badResponses.length,'HTTP errors '+JSON.stringify(badResponses));
fs.writeFileSync('/tmp/coachin-browser-results.json',JSON.stringify({cases:results.length,results,failures,qr:decoded?.data||'not run: set COACHIN_QR_DECODER to an independent decoder',exceptions,badResponses},null,2));
console.log(JSON.stringify({cases:results.length,failures,qr:decoded?.data||'not run: set COACHIN_QR_DECODER to an independent decoder',exceptions:exceptions.length,badResponses:badResponses.length}));close();if(failures.length)process.exitCode=1;
