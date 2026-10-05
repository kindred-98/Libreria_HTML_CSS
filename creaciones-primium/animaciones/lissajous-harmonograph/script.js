const TAU=Math.PI*2;
const DRAW_T=15.4,HOLD_T=2.3,FADE_T=2.7;
const CYCLE_T=DRAW_T+HOLD_T+FADE_T;
const SAMPLE_HZ=220;
const CAP=Math.ceil(SAMPLE_HZ*DRAW_T)+8;
const BOB_CAP=240;
const DRIFT=0.021;
const HUGE=1e5;

const PRESETS=[
  {f1:1,f2:2,phi:0.42,d1:0.030,d2:0.056},
  {f1:2,f2:3,phi:1.18,d1:0.026,d2:0.049},
  {f1:3,f2:5,phi:0.64,d1:0.023,d2:0.044},
  {f1:1,f2:3,phi:1.92,d1:0.028,d2:0.052}
];

const canvas=document.getElementById("plot");
const ctx=canvas.getContext("2d");
const carriage=document.querySelector(".carriage");
const tagA=document.querySelector(".tag-a");
const tagB=document.querySelector(".tag-b");
const outRatio=document.getElementById("sRatio");
const outPhase=document.getElementById("sPhase");
const outDamp=document.getElementById("sDamp");
const outInk=document.getElementById("sInk");
const outFig=document.getElementById("sFig");
const calm=window.matchMedia("(prefers-reduced-motion: reduce)");

let curEp=0;
let dpr=1,cssW=0,cssH=0,cx=0,cy=0,hh=0,armLen=0;
const pivot=[{x:0,y:0},{x:0,y:0}];

function penPoint(p,t,out){
  const w1=TAU*p.f1,w2=TAU*p.f2;
  const e1=Math.exp(-p.d1*t),e2=Math.exp(-p.d2*t);
  const ph=p.phi+DRIFT*t;
  out[0]=0.86*e1*Math.sin(w1*t)+0.34*e2*Math.sin(w2*t+ph);
  out[1]=0.74*e1*Math.sin(2*w1*t+0.55)+0.46*e2*Math.sin(2*w2*t+ph+1.5708);
  return out;
}
const EXT=PRESETS.map(function(p){
  let m=0;
  const q=[0,0];
  for(let i=0;i<=1800;i++){
    penPoint(p,i/1800*DRAW_T,q);
    const d=Math.sqrt(q[0]*q[0]+q[1]*q[1]);
    if(d>m) m=d;
  }
  return m;
});

const bufA=new Float32Array(CAP*2);
const bufB=new Float32Array(CAP*2);
let live=bufA,rest=bufB,liveN=0,restN=0;
let sampleT=0;
const tmp=[0,0];

const bobX=[new Float32Array(BOB_CAP),new Float32Array(BOB_CAP)];
const bobY=[new Float32Array(BOB_CAP),new Float32Array(BOB_CAP)];
const bobHead=[0,0],bobCount=[0,0];
function pushBob(k,x,y){
  bobX[k][bobHead[k]]=x;
  bobY[k][bobHead[k]]=y;
  bobHead[k]=(bobHead[k]+1)%BOB_CAP;
  if(bobCount[k]<BOB_CAP) bobCount[k]++;
}
function clearBobs(){bobHead[0]=0;bobHead[1]=0;bobCount[0]=0;bobCount[1]=0;}

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
  cx=cssW*0.5;
  cy=cssH*0.5;
  hh=cssH*0.5;
  armLen=Math.max(26,cssH*0.2);
  pivot[0].x=cssW*0.042;
  pivot[0].y=cy-cssH*0.06;
  pivot[1].x=cssW*0.958;
  pivot[1].y=cy+cssH*0.06;
}

function figurePath(buf,n,s){
  ctx.beginPath();
  for(let i=0;i<n;i++){
    const x=cx+buf[i*2]*s;
    const y=cy+buf[i*2+1]*s;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
}
function pathLength(buf,n,s){
  let L=0;
  for(let i=1;i<n;i++){
    const dx=(buf[i*2]-buf[(i-1)*2])*s;
    const dy=(buf[i*2+1]-buf[(i-1)*2+1])*s;
    L+=Math.hypot(dx, dy);
  }
  return L;
}
function drawDial(clock){
  ctx.lineWidth=1;
  ctx.strokeStyle="rgba(150,186,238,.11)";
  ctx.beginPath();
  ctx.arc(cx,cy,hh*0.92,0,TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx,cy,hh*0.6,0,TAU);
  ctx.stroke();
  ctx.strokeStyle="rgba(150,186,238,.06)";
  ctx.beginPath();
  ctx.moveTo(cx-cssW*0.46,cy);
  ctx.lineTo(cx+cssW*0.46,cy);
  ctx.moveTo(cx,cy-hh*0.92);
  ctx.lineTo(cx,cy+hh*0.92);
  ctx.stroke();
  const spin=clock*0.1;
  ctx.strokeStyle="rgba(255,217,138,.16)";
  ctx.beginPath();
  for(let i=0;i<72;i++){
    const a=spin+TAU*i/72;
    const ca=Math.cos(a),sa=Math.sin(a);
    const r0=hh*(i%6===0?0.86:0.9),r1=hh*0.94;
    ctx.moveTo(cx+ca*r0,cy+sa*r0);
    ctx.lineTo(cx+ca*r1,cy+sa*r1);
  }
  ctx.stroke();
}
function drawArms(st,penX,penY){
  const cols=["rgba(56,232,208,","rgba(255,111,145,"];
  for(let k=0;k<2;k++){
    const dir=k===0?1:-1;
    const px=pivot[k].x+dir*armLen*Math.sin(st.ang[k]);
    const py=pivot[k].y+armLen*Math.cos(st.ang[k]);
    st.bob[k*2]=px;
    st.bob[k*2+1]=py;
    const n=bobCount[k];
    if(n>2){
      const first=(bobHead[k]-n+BOB_CAP)%BOB_CAP;
      ctx.beginPath();
      for(let i=0;i<n;i++){
        const idx=(first+i)%BOB_CAP;
        if(i===0) ctx.moveTo(bobX[k][idx],bobY[k][idx]);
        else ctx.lineTo(bobX[k][idx],bobY[k][idx]);
      }
      ctx.strokeStyle=cols[k]+(0.08+0.26*(n/BOB_CAP)).toFixed(3)+")";
      ctx.lineWidth=1;
      ctx.stroke();
    }
    ctx.strokeStyle=cols[k]+"0.9)";
    ctx.lineWidth=2.1;
    ctx.beginPath();
    ctx.moveTo(pivot[k].x,pivot[k].y);
    ctx.lineTo(px,py);
    ctx.stroke();
    ctx.strokeStyle=cols[k]+"0.22)";
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.arc(pivot[k].x,pivot[k].y,5.5,0,TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pivot[k].x-8,pivot[k].y);
    ctx.lineTo(pivot[k].x+8,pivot[k].y);
    ctx.moveTo(pivot[k].x,pivot[k].y-8);
    ctx.lineTo(pivot[k].x,pivot[k].y+8);
    ctx.stroke();
    const g=ctx.createRadialGradient(px,py,0,px,py,12);
    g.addColorStop(0,cols[k]+"0.95)");
    g.addColorStop(0.4,cols[k]+"0.38)");
    g.addColorStop(1,cols[k]+"0)");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(px,py,12,0,TAU);
    ctx.fill();
    ctx.fillStyle=cols[k]+"1)";
    ctx.beginPath();
    ctx.arc(px,py,2.8,0,TAU);
    ctx.fill();
    if(penX){
      const sag=Math.abs(penX-px)*0.05+4;
      ctx.beginPath();
      ctx.moveTo(px,py);
      ctx.quadraticCurveTo((px+penX)/2,(py+penY)/2+sag,penX,penY);
      ctx.strokeStyle=cols[k]+"0.3)";
      ctx.lineWidth=1;
      ctx.stroke();
    }
  }
}

const state={ang:[0,0],bob:[0,0,0,0],phiA:0,phiB:0,f:[1,1.5]};

function render(clock,frac,curA,prevA,bloom){
  ctx.clearRect(0,0,cssW,cssH);
  drawDial(clock);
  const fs=0.86*hh/EXT[curEp];
  if(restN>2&&prevA>0.004){
    figurePath(rest,restN,fs);
    ctx.setLineDash([]);
    ctx.lineJoin="round";
    ctx.strokeStyle="rgba(255,217,138,"+(0.07*prevA).toFixed(3)+")";
    ctx.lineWidth=4.5;
    ctx.stroke();
    ctx.strokeStyle="rgba(255,208,140,"+(0.36*prevA).toFixed(3)+")";
    ctx.lineWidth=1.1;
    ctx.stroke();
  }
  let penX=0,penY=0;
  if(liveN>2){
    const L=pathLength(live,liveN,fs);
    const rev=L*frac;
    penX=cx+live[(liveN-1)*2]*fs;
    penY=cy+live[(liveN-1)*2+1]*fs;
    if(rev>0.6){
      figurePath(live,liveN,fs);
      ctx.lineJoin="round";
      ctx.lineCap="round";
      ctx.setLineDash([rev,HUGE]);
      ctx.lineDashOffset=0;
      ctx.strokeStyle="rgba(255,146,52,"+(0.1*curA).toFixed(3)+")";
      ctx.lineWidth=6.4;
      ctx.stroke();
      ctx.strokeStyle="rgba(255,216,142,"+(0.82*curA).toFixed(3)+")";
      ctx.lineWidth=1.5;
      ctx.stroke();
      ctx.setLineDash([34,HUGE]);
      ctx.lineDashOffset=34-rev;
      ctx.shadowBlur=15;
      ctx.shadowColor="rgba(255,206,120,.9)";
      ctx.strokeStyle="rgba(255,253,244,"+(0.94*curA).toFixed(3)+")";
      ctx.lineWidth=2.6;
      ctx.stroke();
      ctx.shadowBlur=0;
      ctx.setLineDash([]);
    }
  }
  drawArms(state,penX,penY);
  if(liveN>1&&curA>0.01){
    const rad=8+18*bloom;
    const g=ctx.createRadialGradient(penX,penY,0,penX,penY,rad);
    g.addColorStop(0,"rgba(255,255,255,"+(0.9*curA).toFixed(3)+")");
    g.addColorStop(0.3,"rgba(255,214,138,"+(0.42*curA).toFixed(3)+")");
    g.addColorStop(1,"rgba(255,180,90,0)");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(penX,penY,rad,0,TAU);
    ctx.fill();
    ctx.fillStyle="#fffdf6";
    ctx.beginPath();
    ctx.arc(penX,penY,2.5,0,TAU);
    ctx.fill();
    carriage.style.transform="translate3d("+penX.toFixed(1)+"px,"+penY.toFixed(1)+"px,0) translate(-50%,-50%)";
    carriage.classList.add("on");
  }else{
    carriage.classList.remove("on");
  }
}

function smooth(v){return v*v*(3-2*v);}

function pushSample(t){
  if(liveN>=CAP) return;
  penPoint(PRESETS[curEp],t,tmp);
  live[liveN*2]=tmp[0];
  live[liveN*2+1]=tmp[1];
  liveN++;
}
function commitFigure(){
  const t=rest;
  rest=live;
  live=t;
  restN=liveN;
  liveN=0;
  sampleT=0;
}

let t0=0,frame=0,raf=0,commitSec=-1e9;

function glideArms(dt,preset){
  const k=1-Math.exp(-dt/2.4);
  state.f[0]+=(preset.f1-state.f[0])*k;
  state.f[1]+=(preset.f2-state.f[1])*k;
  state.phiA+=TAU*state.f[0]*dt;
  state.phiB+=TAU*state.f[1]*dt;
}
function still(){
  curEp=1;
  live=bufA;
  rest=bufB;
  liveN=0;
  restN=0;
  clearBobs();
  for(let i=0;i<=1560;i++) pushSample(i/1560*DRAW_T*0.95);
  state.phiA=0.6;
  state.phiB=1.15;
  for(let i=0;i<BOB_CAP;i++){
    const f=i/BOB_CAP;
    pushBob(0,pivot[0].x+armLen*0.5*Math.sin(f*7),pivot[0].y+armLen*0.86);
    pushBob(1,pivot[1].x-armLen*0.5*Math.sin(f*5),pivot[1].y+armLen*0.86);
  }
  render(3.4,1,0.95,0,0.3);
}

function loop(now){
  if(!t0) t0=now;
  const dt=frame===0?1/60:Math.min(0.05,(now-tPrev)/1000);
  tPrev=now;
  const sec=(now-t0)/1000;
  const cycleIndex=Math.floor(sec/CYCLE_T);
  const u=sec-cycleIndex*CYCLE_T;
  curEp=cycleIndex%PRESETS.length;
  const p=PRESETS[curEp];
  glideArms(dt,p);

  let frac,curA,bloom;
  if(u<DRAW_T){
    frac=Math.min(1,sampleT/DRAW_T);
    curA=smooth(Math.min(1,u/0.8));
    bloom=smooth(Math.max(0,(frac-0.84)/0.16));
    let acc=dt*SAMPLE_HZ,guard=0;
    while(acc>=1&&guard<48){
      acc-=1;
      pushSample(sampleT);
      sampleT+=1/SAMPLE_HZ;
      guard++;
    }
  }else{
    frac=1;
    curA=0;
    bloom=0;
  }
  if(u>=DRAW_T&&liveN>2){
    commitSec=sec;
    commitFigure();
  }
  const prevA=1-smooth(Math.min(1,Math.max(0,(sec-commitSec)/(HOLD_T+FADE_T+3.0))));

  const pulse=TAU*sec/CYCLE_T;
  const k1=0.34*(0.78+0.22*Math.sin(pulse));
  const k2=0.29*(0.78+0.22*Math.cos(pulse+1.1));
  state.ang[0]=k1*Math.sin(state.phiA);
  state.ang[1]=k2*Math.sin(state.phiB);

  render(sec,frac,curA,prevA,bloom);
  if(frame%6===0){
    outRatio.textContent=p.f1+" : "+p.f2;
    outPhase.textContent=(((p.phi+DRIFT*Math.min(u,DRAW_T))*180/Math.PI)%360).toFixed(1)+"\u00B0";
    outDamp.textContent=p.d1.toFixed(3)+" / "+p.d2.toFixed(3);
    outInk.textContent=Math.round(frac*100)+"%";
    outFig.textContent=["I","II","III","IV"][curEp]+" / IV";
    tagA.textContent="Arm X \u00B7 "+state.f[0].toFixed(2)+" Hz";
    tagB.textContent="Arm Y \u00B7 "+state.f[1].toFixed(2)+" Hz";
  }
  frame++;
  raf=requestAnimationFrame(loop);
}

let tPrev=0;

function start(){
  resize();
  tPrev=0;
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
