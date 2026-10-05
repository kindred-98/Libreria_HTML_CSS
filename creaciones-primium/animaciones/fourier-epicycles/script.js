const TAU=Math.PI*2;
const P_HARM=480;
const SAMPLES=2560;
const GHOST_MAX=520;
const TRAIL_CAP=1500;
const SAMPLES_PER_SEC=118;
const DRAW_T=12.6,HOLD_T=1.8,FADE_T=1.6;
const CYCLE_T=DRAW_T+HOLD_T+FADE_T;
const PITCH=0.82;
const WORD="FOURIER";
const LV=5;

const canvas=document.getElementById("plot");
const ctx=canvas.getContext("2d");
const outHarm=document.getElementById("sHarm");
const outTerms=document.getElementById("sTerms");
const outSweep=document.getElementById("sSweep");
const outRad=document.getElementById("sRad");
const outLoop=document.getElementById("sLoop");
const calm=window.matchMedia("(prefers-reduced-motion: reduce)");

function ell(cx,cy,rx,ry,a0,a1,steps){
  const o=[];
  for(let i=0;i<=steps;i++){
    const a=(a0+(a1-a0)*i/steps)*Math.PI/180;
    o.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);
  }
  return o;
}
function arcTo(list,extra){
  for(const e of extra) list.push(e);
  return list;
}
const GLYPH={
  F:[[[0,1],[0,0],[0.62,0]],[[0,0.46],[0.5,0.46]]],
  O:[ell(0.36,0.5,0.36,0.5,0,360,52)],
  U:[arcTo([[0,0],[0,0.66]],ell(0.31,0.66,0.31,0.34,180,0,28)).concat([[0.62,0]])],
  R:[arcTo([[0,1],[0,0]],ell(0,0.28,0.46,0.28,-90,90,30)).concat([[0.58,1]])],
  I:[[[0.12,0],[0.6,0]],[[0.36,0],[0.36,1]],[[0.12,1],[0.6,1]]],
  E:[[[0,1],[0,0],[0.62,0]],[[0,0.5],[0.5,0.5]],[[0,1],[0.62,1]]]
};

function buildSegments(){
  const segs=[];
  for(let i=0;i<WORD.length;i++){
    const strokes=GLYPH[WORD[i]],ox=i*PITCH;
    for(const stroke of strokes){
      const pts=[];
      for(const pt of stroke) pts.push([pt[0]+ox,pt[1]]);
      segs.push({pen:1,pts:pts});
    }
  }
  const last=segs[segs.length-1].pts;
  const a=last[last.length-1];
  const b=segs[0].pts[0];
  const c=[(a[0]+b[0])/2,Math.max(a[1],b[1])+1.7];
  const back=[];
  for(let i=0;i<=72;i++){
    const t=i/72,s=1-t;
    back.push([s*s*a[0]+2*s*t*c[0]+t*t*b[0],s*s*a[1]+2*s*t*c[1]+t*t*b[1]]);
  }
  segs.push({pen:0,pts:back});
  return segs;
}
function flatten(segs){
  const out=[];
  let prev=null;
  for(const seg of segs){
    const pts=seg.pts,pen=seg.pen;
    if(prev){
      out.push({x:prev[0],y:prev[1],pen:0});
      out.push({x:pts[0][0],y:pts[0][1],pen:0});
    }
    for(const pt of pts) out.push({x:pt[0],y:pt[1],pen:pen});
    prev=pts[pts.length-1];
  }
  return out;
}
function densify(pts,maxLen){
  const out=[pts[0]];
  for(let i=0;i<pts.length-1;i++){
    const a=pts[i],b=pts[i+1];
    const dx=b.x-a.x,dy=b.y-a.y;
    const d=Math.hypot(dx, dy);
    const n=Math.max(1,Math.ceil(d/maxLen));
    for(let k=1;k<=n;k++){
      const f=k/n;
      out.push({x:a.x+dx*f,y:a.y+dy*f,pen:k===n?b.pen:a.pen});
    }
  }
  return out;
}
function chaikin(pts,rounds){
  let p=pts;
  for(let r=0;r<rounds;r++){
    const n=p.length,o=[p[0]];
    for(let i=0;i<n-1;i++){
      const a=p[i],b=p[i+1];
      o.push({x:a.x*0.75+b.x*0.25,y:a.y*0.75+b.y*0.25,pen:a.pen});
      o.push({x:a.x*0.25+b.x*0.75,y:a.y*0.25+b.y*0.75,pen:a.pen});
    }
    o.push(p[n-1]);
    p=o;
  }
  return p;
}
function resample(pts,n){
  const m=pts.length,cum=new Float64Array(m);
  for(let i=1;i<m;i++){
    const dx=pts[i].x-pts[i-1].x,dy=pts[i].y-pts[i-1].y;
    cum[i]=cum[i-1]+Math.hypot(dx, dy);
  }
  const total=cum[m-1]||1e-6;
  const z=new Float64Array(n*2),pen=new Uint8Array(n);
  let j=0;
  for(let i=0;i<n;i++){
    const d=total*i/(n-1);
    while(j<m-2&&cum[j+1]<d) j++;
    const seg=(cum[j+1]-cum[j])||1e-9;
    const f=(d-cum[j])/seg;
    z[i*2]=pts[j].x+(pts[j+1].x-pts[j].x)*f;
    z[i*2+1]=pts[j].y+(pts[j+1].y-pts[j].y)*f;
    pen[i]=pts[j].pen;
  }
  return {z:z,pen:pen,total:total};
}
function centerOnInk(z,pen,n){
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9,found=false;
  for(let i=0;i<n;i++){
    if(!pen[i]) continue;
    const x=z[i*2],y=z[i*2+1];
    found=true;
    if(x<minX)minX=x;
    if(x>maxX)maxX=x;
    if(y<minY)minY=y;
    if(y>maxY)maxY=y;
  }
  if(!found){minX=maxX=minY=maxY=0;}
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  for(let i=0;i<n;i++){z[i*2]-=cx;z[i*2+1]-=cy;}
  return {w:maxX-minX,h:maxY-minY};
}
function spectrum(z,n,P){
  const tabR=new Float64Array(n),tabI=new Float64Array(n);
  for(let j=0;j<n;j++){
    const a=-TAU*j/n;
    tabR[j]=Math.cos(a);
    tabI[j]=Math.sin(a);
  }
  const out=[];
  for(let k=-P;k<=P;k++){
    let sr=0,si=0,idx=0,step=k<0?k+n:k;
    for(let m=0;m<n;m++){
      const xr=z[m*2],xi=z[m*2+1],c=tabR[idx],s=tabI[idx];
      sr+=xr*c-xi*s;
      si+=xr*s+xi*c;
      idx+=step;
      if(idx>=n) idx-=n;
    }
    sr/=n;
    si/=n;
    out.push({k:k,r:Math.hypot(sr, si),a0:Math.atan2(si,sr)});
  }
  return out;
}

const rs=resample(chaikin(densify(flatten(buildSegments()),0.05),2),SAMPLES);
const inkBox=centerOnInk(rs.z,rs.pen,SAMPLES);
const terms=spectrum(rs.z,SAMPLES,P_HARM).filter(function(t){return t.r>0;});
let totalR=0,maxTerm=0;
for(const t of terms){
  totalR+=t.r;
  if(t.r>maxTerm) maxTerm=t.r;
}
const GHOST=(function(){
  const gx=[],gy=[],gb=[];
  let started=false,count=0,stride=1;
  while(count<GHOST_MAX&&stride<64){
    stride++;
    count=0;
    for(let i=0;i<SAMPLES;i+=stride) if(rs.pen[i]) count++;
  }
  for(let i=0;i<SAMPLES;i+=stride){
    if(!rs.pen[i]){started=false;continue;}
    if(!started){started=true;gb.push(1);}
    else gb.push(0);
    gx.push(rs.z[i*2]);
    gy.push(rs.z[i*2+1]);
  }
  return {x:gx,y:gy,b:gb};
})();

const trX=new Float32Array(TRAIL_CAP);
const trY=new Float32Array(TRAIL_CAP);
const trB=new Uint8Array(TRAIL_CAP);
let trHead=0,trCount=0,trBreak=1;
function pushTrail(x,y,brk){
  trX[trHead]=x;
  trY[trHead]=y;
  trB[trHead]=brk?1:0;
  trHead=(trHead+1)%TRAIL_CAP;
  if(trCount<TRAIL_CAP) trCount++;
}
function clearTrail(){trHead=0;trCount=0;trBreak=1;}

let dpr=1,cssW=0,cssH=0;
const A={x:0,y:0,r:0,lam:1};
const B={x:0,y:0,r:0,lam:1};

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
  const cut=cssW*0.45;
  const aw=cut*0.5,ah=cssH*0.5;
  const wordHalfW=inkBox.w/2;
  A.x=aw;
  A.y=cssH*0.5;
  A.r=Math.min(aw,ah);
  A.lam=Math.min(A.r*0.92/totalR,aw*0.95/wordHalfW);
  const bw=(cssW-cut)*0.5;
  B.x=cut+bw;
  B.y=cssH*0.5;
  B.r=bw;
  B.lam=Math.min(bw*0.94/wordHalfW,(cssH*0.5*0.44)/(inkBox.h/2));
}

const CIRCLE_COLS=["rgba(94,224,255,ALPHA)","rgba(126,196,255,ALPHA)","rgba(150,158,255,ALPHA)","rgba(178,146,250,ALPHA)","rgba(255,207,112,ALPHA)"];
const VEC_COLS=["rgba(94,224,255,ALPHA)","rgba(122,190,255,ALPHA)","rgba(146,150,255,ALPHA)","rgba(176,140,250,ALPHA)","rgba(255,207,112,ALPHA)"];

function chainNorm(u,out){
  let x=0,y=0;
  for(const t of terms){
    const a=t.a0+TAU*t.k*u;
    x+=t.r*Math.cos(a);
    y+=t.r*Math.sin(a);
  }
  out[0]=x;
  out[1]=y;
  return out;
}
const tipBuf=[0,0];

function drawBed(panel,clock,bloom){
  const cx=panel.x,cy=panel.y;
  const maxR=totalR*panel.lam;
  ctx.lineWidth=1;
  ctx.setLineDash([2,7]);
  for(let i=0;i<3;i++){
    ctx.lineDashOffset=clock*(i%2?-26:16);
    ctx.strokeStyle="rgba(122,164,224,"+(0.17-i*0.038).toFixed(3)+")";
    ctx.beginPath();
    ctx.arc(cx,cy,maxR*(1-i*0.3),0,TAU);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  const teeth=panel===A?66:52;
  ctx.strokeStyle="rgba(140,182,240,.20)";
  ctx.beginPath();
  for(let i=0;i<teeth;i++){
    const a=clock*0.15+TAU*i/teeth;
    const ca=Math.cos(a),sa=Math.sin(a);
    const r0=maxR*1.04,r1=maxR*(i%3===0?1.13:1.08);
    ctx.moveTo(cx+ca*r0,cy+sa*r0);
    ctx.lineTo(cx+ca*r1,cy+sa*r1);
  }
  ctx.stroke();
  ctx.strokeStyle="rgba(94,224,255,"+(0.10+0.12*bloom).toFixed(3)+")";
  ctx.lineWidth=1.2;
  ctx.beginPath();
  ctx.arc(cx,cy,maxR,0,TAU);
  ctx.stroke();
  ctx.lineWidth=1;
  ctx.strokeStyle="rgba(150,186,238,.13)";
  ctx.beginPath();
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+TAU*i/16;
    const ca=Math.cos(a),sa=Math.sin(a);
    ctx.moveTo(cx+ca*maxR*1.17,cy+sa*maxR*1.17);
    ctx.lineTo(cx+ca*maxR*1.22,cy+sa*maxR*1.22);
  }
  ctx.stroke();
}

function tracePath(panel,alpha,scale,from,to,color,width,blur){
  if(to-from<2) return;
  const start=(trHead-trCount+TRAIL_CAP)%TRAIL_CAP;
  const lam=panel.lam;
  ctx.beginPath();
  let pen=false;
  for(let i=from;i<to;i++){
    const k=(start+i)%TRAIL_CAP;
    const x=panel.x+trX[k]*lam;
    const y=panel.y+trY[k]*lam;
    if(trB[k]===1||!pen){ctx.moveTo(x,y);pen=true;}
    else ctx.lineTo(x,y);
  }
  if(blur) ctx.shadowBlur=blur;
  ctx.strokeStyle=color;
  ctx.lineWidth=width;
  ctx.stroke();
  if(blur) ctx.shadowBlur=0;
}

function drawTrace(panel,alpha,scale,hot){
  if(trCount<3) return;
  const n=Math.min(trCount,Math.round(90*scale)+50);
  tracePath(panel,alpha,scale,0,trCount,"rgba(58,142,255,"+(0.13*alpha).toFixed(3)+")",7*scale,0);
  tracePath(panel,alpha,scale,0,trCount,"rgba(150,240,255,"+(0.66*alpha).toFixed(3)+")",1.5*scale,0);
  if(hot>0) tracePath(panel,alpha,scale,trCount-n,trCount,"rgba(255,255,255,"+(0.9*alpha*hot).toFixed(3)+")",2.1*scale,16*scale);
}

function drawGhost(panel,alpha,clock,phase){
  ctx.setLineDash([5,6]);
  ctx.lineDashOffset=-clock*18+phase;
  ctx.lineWidth=1.1;
  ctx.strokeStyle="rgba(122,196,240,"+alpha.toFixed(3)+")";
  const lam=panel.lam;
  ctx.beginPath();
  let pen=false;
  for(let i=0;i<GHOST.x.length;i++){
    const x=panel.x+GHOST.x[i]*lam;
    const y=panel.y+GHOST.y[i]*lam;
    if(GHOST.b[i]===1||!pen){ctx.moveTo(x,y);pen=true;}
    else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawMachine(panel,u,clock){
  const lam=panel.lam,px=panel.x,py=panel.y;
  const inv=1/(maxTerm||1);
  for(let L=0;L<LV;L++){
    const lo=Math.pow((L+0.35)/LV,1.55);
    const hi=Math.pow((L+1.55)/LV,1.55);
    ctx.beginPath();
    let any=false;
    for(const t of terms){
      const n=t.r*inv;
      if(n<lo||n>=hi) continue;
      const a=t.a0+TAU*t.k*u;
      const r=t.r*lam;
      const cxx=px+r*Math.cos(a),cyy=py+r*Math.sin(a);
      ctx.moveTo(cxx+r,cyy);
      ctx.arc(cxx,cyy,r,0,TAU);
      any=true;
    }
    if(any){
      ctx.strokeStyle=CIRCLE_COLS[L].replace("ALPHA",(0.10+0.32*((L+1)/LV)).toFixed(3));
      ctx.lineWidth=1;
      ctx.stroke();
    }
  }
  for(let L=0;L<LV;L++){
    const lo=Math.pow((L+0.35)/LV,1.55);
    const hi=Math.pow((L+1.55)/LV,1.55);
    ctx.beginPath();
    let x=px,y=py,any=false;
    for(const t of terms){
      const n=t.r*inv;
      if(n<lo||n>=hi) continue;
      const a=t.a0+TAU*t.k*u;
      const nx=x+t.r*lam*Math.cos(a);
      const ny=y+t.r*lam*Math.sin(a);
      ctx.moveTo(x,y);
      ctx.lineTo(nx,ny);
      x=nx;
      y=ny;
      any=true;
    }
    if(any){
      ctx.strokeStyle=VEC_COLS[L].replace("ALPHA",(0.16+0.68*((L+1)/LV)).toFixed(3));
      ctx.lineWidth=L>2?1.2:1;
      ctx.stroke();
    }
  }
  chainNorm(u,tipBuf);
  const tx=px+tipBuf[0]*lam,ty=py+tipBuf[1]*lam;
  ctx.strokeStyle="rgba(150,186,238,.32)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(px-9,py);
  ctx.lineTo(px+9,py);
  ctx.moveTo(px,py-9);
  ctx.lineTo(px,py+9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px,py,5.5,0,TAU);
  ctx.fillStyle="rgba(8,14,26,.95)";
  ctx.fill();
  ctx.strokeStyle="rgba(94,224,255,.78)";
  ctx.lineWidth=1.3;
  ctx.stroke();
  const g=ctx.createRadialGradient(tx,ty,0,tx,ty,26);
  g.addColorStop(0,"rgba(255,255,255,.95)");
  g.addColorStop(0.3,"rgba(150,240,255,.5)");
  g.addColorStop(1,"rgba(94,224,255,0)");
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.arc(tx,ty,26,0,TAU);
  ctx.fill();
  ctx.fillStyle="#ffffff";
  ctx.beginPath();
  ctx.arc(tx,ty,2.2,0,TAU);
  ctx.fill();
}

function drawScale(panel,clock){
  const bx=panel.x-panel.r*0.34,by=panel.y+panel.r*0.82;
  const len=Math.max(34,panel.r*0.46);
  ctx.strokeStyle="rgba(150,186,238,.30)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(bx,by);
  ctx.lineTo(bx+len,by);
  ctx.moveTo(bx,by-4);
  ctx.lineTo(bx,by+4);
  ctx.moveTo(bx+len,by-4);
  ctx.lineTo(bx+len,by+4);
  ctx.stroke();
  ctx.strokeStyle="rgba(150,186,238,.18)";
  ctx.beginPath();
  for(let i=1;i<6;i++){
    const x=bx+len*i/6;
    ctx.moveTo(x,by-3);
    ctx.lineTo(x,by+3);
  }
  ctx.stroke();
  ctx.fillStyle="rgba(94,224,255,"+(0.45+0.4*Math.sin(clock*1.7)).toFixed(3)+")";
  ctx.beginPath();
  ctx.arc(bx,by,2.2,0,TAU);
  ctx.fill();
}

function render(clock,frac,trailAlpha,bloom,hot){
  ctx.clearRect(0,0,cssW,cssH);
  drawBed(A,clock,bloom);
  drawBed(B,clock*0.62,bloom);
  drawGhost(A,0.05+0.06*bloom,clock,0);
  drawGhost(B,0.055+0.3*bloom,clock,0);
  drawMachine(A,frac,clock);
  drawTrace(A,trailAlpha*0.4,0.7,0);
  drawTrace(B,trailAlpha,1,hot);
  drawScale(A,clock);
  drawScale(B,clock*0.8);
}

function smooth(v){return v*v*(3-2*v);}

let t0=0,frame=0,raf=0,sampleIdx=0;

function primeTrail(){
  clearTrail();
  const steps=1180;
  for(let i=0;i<=steps;i++){
    const f=i/steps;
    const si=Math.min(SAMPLES-1,Math.round(f*(SAMPLES-1)));
    if(!rs.pen[si]){trBreak=1;continue;}
    chainNorm(f,tipBuf);
    pushTrail(tipBuf[0],tipBuf[1],trBreak===1);
    trBreak=0;
  }
}
function still(){
  primeTrail();
  render(1.4,0.22,0.8,0,0);
}
function loop(now){
  if(!t0) t0=now;
  const sec=(now-t0)/1000;
  const u=sec%CYCLE_T;
  let frac,trailAlpha,bloom,hot;
  if(u<DRAW_T){
    frac=u/DRAW_T;
    trailAlpha=1;
    bloom=0;
    hot=1;
    outSweep.textContent=Math.round(frac*100)+"%";
    let guard=0;
    while(sampleIdx/SAMPLES_PER_SEC<u&&guard<400){
      const tsec=sampleIdx/SAMPLES_PER_SEC;
      const f=Math.min(1,tsec/DRAW_T);
      const si=Math.min(SAMPLES-1,Math.round(f*(SAMPLES-1)));
      if(rs.pen[si]){
        chainNorm(f,tipBuf);
        pushTrail(tipBuf[0],tipBuf[1],trBreak===1);
        trBreak=0;
      }else{
        trBreak=1;
      }
      sampleIdx++;
      guard++;
    }
  }else if(u<DRAW_T+HOLD_T){
    frac=1;
    trailAlpha=1;
    bloom=smooth((u-DRAW_T)/(HOLD_T*0.7));
    hot=1;
    outSweep.textContent="100%";
  }else{
    const p=(u-DRAW_T-HOLD_T)/FADE_T;
    frac=1;
    trailAlpha=1-smooth(p);
    bloom=1-smooth(Math.min(1,p*1.7));
    hot=0;
    outSweep.textContent="100%";
    if(p>=0.15){clearTrail();sampleIdx=0;}
  }
  render(sec,frac,trailAlpha,bloom,hot);
  if(frame%6===0){
    outHarm.textContent=String(P_HARM*2+1);
    outTerms.textContent=String(terms.length);
    outRad.textContent=totalR.toFixed(2)+" u";
    outLoop.textContent=u.toFixed(1)+" / "+CYCLE_T.toFixed(1)+" s";
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
  sampleIdx=0;
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
