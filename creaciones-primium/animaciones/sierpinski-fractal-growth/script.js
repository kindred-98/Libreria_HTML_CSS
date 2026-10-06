const TAU=Math.PI*2;
const MAXGEN=5;
const STEP=1.42;
const GROW=1.12;
const FADE=0.55;
const HOLD=2.3;
const T_END=MAXGEN*STEP+GROW;
const CYCLE=2*T_END+HOLD;
const SPAN=0.8660254;
const TOTAL=(Math.pow(3,MAXGEN+1)-1)/2;

const canvas=document.getElementById("plot");
const ctx=canvas.getContext("2d");
const tagB=document.getElementById("sGen");
const outGenN=document.getElementById("sGenN");
const outCells=document.getElementById("sCells");
const outLive=document.getElementById("sLive");
const outInt=document.getElementById("sInt");
const outPhase=document.getElementById("sPhase");
const calm=window.matchMedia("(prefers-reduced-motion: reduce)");

const LT0=[],LT1=[],CT1=[],CT2=[];
for(let L=0;L<=MAXGEN;L++){
  LT0[L]=L*STEP;
  LT1[L]=L*STEP+GROW;
  CT1[L]=CYCLE-LT1[L];
  CT2[L]=CYCLE-LT0[L];
}
const DEPTH=[
  {r:94,g:240,b:216,a:1.0},
  {r:88,g:210,b:242,a:0.96},
  {r:118,g:164,b:250,a:0.91},
  {r:150,g:136,b:250,a:0.86},
  {r:154,g:122,b:230,a:0.81},
  {r:130,g:114,b:206,a:0.75}
];

const recX=[],recY=[],recL=[],recPX=[],recPY=[];
let recCount=0;
(function plan(){
  function walk(level,px,py,gx,gy,s){
    recX[recCount]=gx;
    recY[recCount]=gy;
    recL[recCount]=level;
    recPX[recCount]=px;
    recPY[recCount]=py;
    recCount++;
    if(level<MAXGEN){
      const h=s*0.5;
      walk(level+1,gx,gy,gx,gy-0.2886751*s,h);
      walk(level+1,gx,gy,gx-0.25*s,gy+0.1443376*s,h);
      walk(level+1,gx,gy,gx+0.25*s,gy+0.1443376*s,h);
    }
  }
  walk(0,0,0,0,0,1);
})();

let dpr=1,cssW=0,cssH=0,base=0,rcx=0,rcy=0;
const SX=new Float32Array(recCount);
const SY=new Float32Array(recCount);
const SS=new Float32Array(recCount);
const SA=new Float32Array(recCount);
const SH=new Float32Array(recCount);
const SV=new Uint8Array(recCount);

function resize(){
  const rect=canvas.getBoundingClientRect();
  dpr=Math.min(2,window.devicePixelRatio||1);
  const w=Math.max(1,Math.round(rect.width*dpr));
  const h=Math.max(1,Math.round(rect.height*dpr));
  if(canvas.width!==w||canvas.height!==h){
    canvas.width=w;
    canvas.height=h;
  }
  cssW=rect.width||1;
  cssH=rect.height||1;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  base=Math.min(cssW*0.9,cssH*0.96/SPAN);
  rcx=cssW*0.5;
  rcy=cssH*0.5+0.1443376*base;
}

function outBack(p){
  const c1=1.26,c3=c1+1,u=p-1;
  return 1+c3*u*u*u+c1*u*u;
}
function outCubic(p){return 1-Math.pow(1-p,3);}

function triPath(gx,gy,s){
  ctx.moveTo(gx,gy-0.5773503*s);
  ctx.lineTo(gx-0.5*s,gy+0.2886751*s);
  ctx.lineTo(gx+0.5*s,gy+0.2886751*s);
  ctx.closePath();
}

function evaluate(now){
  let cells=0,live=0;
  for(let i=0;i<recCount;i++){
    const L=recL[i];
    const b0=LT0[L],b1=LT1[L],c1=CT1[L],c2=CT2[L];
    if(now<b0||now>c2){
      SV[i]=0;
      continue;
    }
    let p;
    if(now<b1) p=(now-b0)/GROW;
    else if(now<c1) p=1;
    else p=(c1-now)/GROW;
    if(p<0) p=0;
    else if(p>1) p=1;
    let a=1;
    if(now-b0<0.16) a=(now-b0)/0.16;
    if(now>c2-FADE) a=Math.min(a,(c2-now)/FADE);
    if(a<=0.005){
      SV[i]=0;
      continue;
    }
    const q=outCubic(p);
    SX[i]=rcx+recPX[i]*base+(recX[i]-recPX[i])*base*q;
    SY[i]=rcy+recPY[i]*base+(recY[i]-recPY[i])*base*q;
    SS[i]=base*Math.pow(0.5,L)*outBack(p);
    SA[i]=a;
    SH[i]=now<b1?Math.max(0,1-p*1.7):Math.max(0,1-p)*0.4;
    SV[i]=1;
    cells++;
    if(SH[i]>0.02||a<0.99) live++;
  }
  return {cells:cells,live:live};
}

function paint(now,breath){
  ctx.clearRect(0,0,cssW,cssH);
  ctx.lineJoin="round";
  ctx.lineCap="round";
  for(let L=1;L<=MAXGEN;L++){
    const age=now-LT0[L];
    if(age<0||age>2.3) continue;
    const q=age/2.3;
    ctx.beginPath();
    ctx.arc(rcx,rcy,base*(0.1+1.16*outCubic(q)),0,TAU);
    ctx.strokeStyle="rgba(94,240,216,"+(0.15*(1-q)*(1-q)).toFixed(3)+")";
    ctx.lineWidth=1.5;
    ctx.stroke();
  }
  for(let L=0;L<=MAXGEN;L++){
    const d=DEPTH[L];
    for(let b=0;b<4;b++){
      const lo=b*0.25;
      const al=lo+0.25;
      ctx.beginPath();
      let any=false;
      for(let i=0;i<recCount;i++){
        if(SV[i]===0||recL[i]!==L||SH[i]>0.02) continue;
        const a=SA[i];
        if(b===3?a<lo:(a<lo||a>=lo+0.25)) continue;
        triPath(SX[i],SY[i],SS[i]*breath);
        any=true;
      }
      if(!any) continue;
      ctx.strokeStyle="rgba("+d.r+","+d.g+","+d.b+","+(0.12*d.a*al).toFixed(3)+")";
      ctx.lineWidth=3.8;
      ctx.stroke();
      ctx.strokeStyle="rgba("+d.r+","+d.g+","+d.b+","+(0.7*d.a*al).toFixed(3)+")";
      ctx.lineWidth=1.15;
      ctx.stroke();
    }
  }
  for(let b=0;b<4;b++){
    const lo=b*0.25;
    const al=lo+0.25;
    ctx.beginPath();
    let any=false;
    for(let i=0;i<recCount;i++){
      if(SV[i]===0||SH[i]<=0.02) continue;
      const a=SA[i];
      if(b===3?a<lo:(a<lo||a>=lo+0.25)) continue;
      triPath(SX[i],SY[i],SS[i]*breath);
      any=true;
    }
    if(!any) continue;
    ctx.strokeStyle="rgba(94,240,216,"+(0.08*al).toFixed(3)+")";
    ctx.lineWidth=7;
    ctx.stroke();
    ctx.strokeStyle="rgba(206,255,248,"+(0.92*al).toFixed(3)+")";
    ctx.lineWidth=1.6;
    ctx.stroke();
  }
}

function report(now,gen,cells,live){
  tagB.textContent="Generation "+gen+" / "+MAXGEN;
  outGenN.textContent=String(gen);
  outCells.textContent=String(cells);
  outLive.textContent=String(live);
  outInt.textContent=Math.round((cells/TOTAL)*100)+"%";
  let fase="Collapse";
  if(now<T_END)fase="Divergence";
  else if(now<T_END+HOLD*0.5)fase="Full gasket";
  outPhase.textContent=fase;
}

let t0=0,frame=0,raf=0;

function still(){
  const now=T_END+HOLD*0.45;
  const info=evaluate(now);
  paint(now,1);
  report(now,MAXGEN,info.cells,info.live);
}

function loop(now){
  if(!t0) t0=now;
  const sec=(now-t0)/1000;
  const u=sec%CYCLE;
  const info=evaluate(u);
  paint(u,1+0.012*Math.sin(TAU*u/CYCLE));
  if(frame%5===0){
    report(u,Math.max(0,Math.min(MAXGEN,Math.floor(u/STEP))),info.cells,info.live);
  }
  frame++;
  raf=requestAnimationFrame(loop);
}

function start(){
  resize();
  if(calm.matches){
    still();
    return;
  }
  t0=0;
  frame=0;
  raf=requestAnimationFrame(loop);
}
let rt=0;
window.addEventListener("resize",function(){
  clearTimeout(rt);
  rt=setTimeout(function(){
    resize();
    if(calm.matches) still();
  },140);
});
start();
