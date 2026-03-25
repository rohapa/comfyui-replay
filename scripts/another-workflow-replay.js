// ComfyUI Animated Replay: another-workflow
// Paste into ComfyUI DevTools console (Cmd+Option+I). Stop: window.__replayStop = true

(async function(){
const DELAY=1000,NODES=[{"id":1,"type":"CheckpointLoaderSimple","title":"Load Checkpoint","pos":[50,200],"size":[300,100],"wv":["v1-5-pruned-emaonly.safetensors"],"props":{}},{"id":2,"type":"CLIPTextEncode","title":"Positive Prompt","pos":[400,100],"size":[300,150],"wv":["a beautiful sunset over mountains, cinematic lighting, 8k"],"props":{}},{"id":3,"type":"CLIPTextEncode","title":"Negative Prompt","pos":[400,300],"size":[300,150],"wv":["ugly, blurry, low quality, distorted"],"props":{}},{"id":4,"type":"EmptyLatentImage","title":"Empty Latent Image","pos":[400,500],"size":[300,100],"wv":[512,512,1],"props":{}},{"id":5,"type":"KSampler","title":"KSampler","pos":[800,200],"size":[300,250],"wv":[42,"fixed",20,7,"euler","normal",1],"props":{}},{"id":6,"type":"VAEDecode","title":"VAE Decode","pos":[1200,200],"size":[200,100],"wv":[],"props":{}},{"id":7,"type":"SaveImage","title":"Save Image","pos":[1500,200],"size":[300,300],"wv":["ComfyUI"],"props":{}}],LINKS=[{"si":1,"ss":1,"ti":2,"ts":0},{"si":1,"ss":1,"ti":3,"ts":0},{"si":1,"ss":0,"ti":5,"ts":0},{"si":2,"ss":0,"ti":5,"ts":1},{"si":3,"ss":0,"ti":5,"ts":2},{"si":4,"ss":0,"ti":5,"ts":3},{"si":5,"ss":0,"ti":6,"ts":0},{"si":1,"ss":2,"ti":6,"ts":1},{"si":6,"ss":0,"ti":7,"ts":0}];
window.__replayStop=false;

// Cursor
document.getElementById('__rc')?.remove();
document.getElementById('__rf')?.remove();
document.getElementById('__rs')?.remove();
const cur=document.createElement('div');cur.id='__rc';
cur.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 3L19 12L12 13L9 20L5 3Z" fill="white" stroke="black" stroke-width="1.5" stroke-linejoin="round"/></svg>';
Object.assign(cur.style,{position:'fixed',top:'0',left:'0',width:'24px',height:'24px',zIndex:'999999',pointerEvents:'none',filter:'drop-shadow(1px 2px 3px rgba(0,0,0,.4))',transform:'translate(-2px,-2px)'});
document.body.appendChild(cur);
const fxc=document.createElement('div');fxc.id='__rf';
Object.assign(fxc.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'999998',pointerEvents:'none'});
document.body.appendChild(fxc);
const sty=document.createElement('style');sty.id='__rs';
sty.textContent='@keyframes _rr{0%{transform:translate(-50%,-50%) scale(0);opacity:.5}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}@keyframes _rc{0%{transform:translate(-2px,-2px) scale(1)}50%{transform:translate(-2px,-2px) scale(.8)}100%{transform:translate(-2px,-2px) scale(1)}}#__rc.ck{animation:_rc .15s ease-in-out}@keyframes _rl{0%{opacity:0;transform:translateY(5px)}10%{opacity:1;transform:translateY(0)}80%{opacity:1}100%{opacity:0;transform:translateY(-5px)}}';
document.head.appendChild(sty);
let cx=innerWidth/2,cy=innerHeight/2;cur.style.left=cx+'px';cur.style.top=cy+'px';

const sl=ms=>new Promise(r=>setTimeout(r,ms));
const lg=(s,t,m)=>console.log('%c['+s+'/'+t+'] '+m,'color:#00d4ff;font-weight:bold');

function c2s(x,y){
  const el=document.querySelector('canvas.graph-canvas-container')||document.querySelector('canvas');
  if(!el)return{x,y};const r=el.getBoundingClientRect(),d=app.canvas.ds;
  return{x:(x+d.offset[0])*d.scale+r.left,y:(y+d.offset[1])*d.scale+r.top};
}

async function mt(tx,ty,dur){
  dur=dur||500;const fx=cx,fy=cy,st=Math.max(30,dur/16|0);
  for(let i=0;i<=st;i++){if(window.__replayStop)return;const t=i/st,e=t<.5?4*t*t*t:1-(-2*t+2)**3/2;
  cx=fx+(tx-fx)*e;cy=fy+(ty-fy)*e;cur.style.left=cx+'px';cur.style.top=cy+'px';
  await new Promise(r=>requestAnimationFrame(r));}cx=tx;cy=ty;
}

function ck(){cur.classList.remove('ck');void cur.offsetWidth;cur.classList.add('ck');
  const r=document.createElement('div');
  Object.assign(r.style,{position:'fixed',left:cx+'px',top:cy+'px',width:'40px',height:'40px',borderRadius:'50%',border:'2px solid rgba(0,212,255,.6)',animation:'_rr .4s ease-out forwards',pointerEvents:'none'});
  fxc.appendChild(r);setTimeout(()=>r.remove(),500);
}

function lb(text,dur){dur=dur||2000;const l=document.createElement('div');l.textContent=text;
  Object.assign(l.style,{position:'fixed',left:(cx+30)+'px',top:(cy-10)+'px',background:'rgba(0,0,0,.75)',color:'#00d4ff',padding:'4px 10px',borderRadius:'6px',fontSize:'13px',fontFamily:'system-ui',fontWeight:'500',pointerEvents:'none',zIndex:'999999',animation:'_rl '+dur+'ms ease-in-out forwards',whiteSpace:'nowrap'});
  fxc.appendChild(l);setTimeout(()=>l.remove(),dur);
}

async function drag(x1,y1,x2,y2,dur){dur=dur||700;
  await mt(x1,y1,400);await sl(100);ck();await sl(100);
  const tr=document.createElement('canvas');tr.width=innerWidth;tr.height=innerHeight;
  Object.assign(tr.style,{position:'fixed',top:'0',left:'0',width:'100%',height:'100%',zIndex:'999997',pointerEvents:'none'});
  fxc.appendChild(tr);const ctx=tr.getContext('2d');
  const st=Math.max(30,dur/16|0);let px=x1,py=y1;
  for(let i=0;i<=st;i++){if(window.__replayStop){tr.remove();return;}
    const t=i/st,e=t<.5?4*t*t*t:1-(-2*t+2)**3/2;
    cx=x1+(x2-x1)*e;cy=y1+(y2-y1)*e;cur.style.left=cx+'px';cur.style.top=cy+'px';
    ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(cx,cy);ctx.strokeStyle='rgba(0,212,255,.3)';ctx.lineWidth=2;ctx.stroke();
    px=cx;py=cy;await new Promise(r=>requestAnimationFrame(r));}
  ck();let op=1;const fi=setInterval(()=>{op-=.05;tr.style.opacity=op;if(op<=0){clearInterval(fi);tr.remove();}},30);
}

// Right-click menu helpers
function dm(){document.querySelectorAll('.litecontextmenu').forEach(m=>m.remove());}

function fe(text){
  for(const e of document.querySelectorAll('.litecontextmenu .litemenu-entry')){
    const l=e.textContent.trim();if(l===text||l.startsWith(text))return e;}return null;
}

async function he(entry){const r=entry.getBoundingClientRect(),tx=r.left+r.width/2,ty=r.top+r.height/2;
  await mt(tx,ty,250);
  entry.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true,clientX:tx,clientY:ty}));
  entry.dispatchEvent(new MouseEvent('mouseover',{bubbles:true,clientX:tx,clientY:ty}));
  entry.dispatchEvent(new PointerEvent('pointerenter',{bubbles:true,clientX:tx,clientY:ty}));
  entry.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:tx,clientY:ty}));
}

async function ce(entry){const r=entry.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;ck();
  entry.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:x,clientY:y}));await sl(50);
  entry.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:x,clientY:y}));
  entry.dispatchEvent(new MouseEvent('click',{bubbles:true,clientX:x,clientY:y}));
}

async function addViaMenu(nd,sx,sy){
  const el=document.querySelector('canvas.graph-canvas-container')||document.querySelector('canvas');
  if(!el)return false;
  ck();el.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:sx,clientY:sy,button:2}));
  await sl(400);
  let an=fe('Add Node')||fe('Add node');
  if(an){await he(an);await sl(400);}
  else{if(!document.querySelectorAll('.litecontextmenu').length){dm();return false;}}
  const info=LiteGraph.registered_node_types[nd.type];
  if(info&&info.category){for(const p of info.category.split('/')){await sl(250);const c=fe(p);if(c){await he(c);await sl(400);}}}
  await sl(200);let ne=fe(nd.type)||fe(nd.title);
  if(ne){await he(ne);await sl(200);await ce(ne);await sl(300);dm();return true;}
  dm();return false;
}

// Main
const total=NODES.length+LINKS.length;let step=0;const refs={};
lg(0,total,'Clearing canvas...');app.graph.clear();app.canvas.setDirty(true,true);await sl(DELAY);

for(const nd of NODES){
  if(window.__replayStop)break;step++;
  lg(step,total,'Adding: '+nd.title+' ('+nd.type+')');
  const sp=c2s(nd.pos[0]+nd.size[0]/2,nd.pos[1]+nd.size[1]/2);
  await mt(sp.x,sp.y,500);await sl(200);
  const before=app.graph._nodes.length;
  await addViaMenu(nd,sp.x,sp.y);await sl(200);
  const after=app.graph._nodes.length;
  let node=null;
  if(after>before){node=app.graph._nodes[app.graph._nodes.length-1];}
  else{node=LiteGraph.createNode(nd.type);if(node){app.graph.add(node);ck();}}
  if(node){
    node.pos=[nd.pos[0],nd.pos[1]];node.size=[nd.size[0],nd.size[1]];
    if(nd.title!==nd.type)node.title=nd.title;
    if(nd.wv&&node.widgets){for(let i=0;i<Math.min(node.widgets.length,nd.wv.length);i++){const v=nd.wv[i];if(v!=null){node.widgets[i].value=v;try{node.widgets[i].callback?.(v)}catch(e){}}}}
    if(nd.props)Object.assign(node.properties,nd.props);
    refs[nd.id]=node.id;app.canvas.setDirty(true,true);
  }
  lb(nd.title,DELAY+500);await sl(DELAY);
}

if(LINKS.length){
  lg(step+1,total,'Connecting...');await sl(DELAY/2);
  for(const lk of LINKS){
    if(window.__replayStop)break;step++;
    const sn=app.graph.getNodeById(refs[lk.si]),tn=app.graph.getNodeById(refs[lk.ti]);
    if(!sn||!tn)continue;
    lg(step,total,(sn.title||sn.type)+'['+lk.ss+'] -> '+(tn.title||tn.type)+'['+lk.ts+']');
    const sp=new Float32Array(2),tp=new Float32Array(2);
    sn.getConnectionPos(false,lk.ss,sp);tn.getConnectionPos(true,lk.ts,tp);
    const ss=c2s(sp[0],sp[1]),ts=c2s(tp[0],tp[1]);
    await drag(ss.x,ss.y,ts.x,ts.y,600);await sl(50);
    sn.connect(lk.ss,tn,lk.ts);app.canvas.setDirty(true,true);await sl(DELAY*.5);
  }
}

await mt(innerWidth/2,innerHeight/2,600);
console.log('%cDone! '+NODES.length+' nodes, '+LINKS.length+' connections.','color:#00ff88;font-size:14px;font-weight:bold');
await sl(2000);cur.style.transition='opacity .5s';cur.style.opacity='0';await sl(600);
cur.remove();fxc.remove();sty.remove();
console.log('%cStop recording now.','color:#888;font-style:italic');
})();