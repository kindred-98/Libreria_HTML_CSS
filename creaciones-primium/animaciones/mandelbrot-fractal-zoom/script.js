const TAU=Math.PI*2;
const C0_RE=-0.743643887037151;
const C0_IM=0.13182590420533;
const SPAN_TOP=0.66;
const SPAN_DEEP=1.4e-5;
const LOG_RANGE=Math.log(SPAN_TOP/SPAN_DEEP);
const HALF_CYCLE=15;
const CYCLE=30;
const BAIL=16;
const BAIL2=BAIL*BAIL;
const LOG_BAIL=Math.log(BAIL);
const LN2=Math.LN2;
const BUF_W=152;
const PAL_SIZE=1024;

const canvas=document.getElementById("plot");
const ctx=canvas.getContext("2d",{alpha:false});
const plate=document.querySelector(".plate");
const outZoom=document.getElementById("sZoom");
const outSpan=document.getElementById("sSpan");
const outDrift=document.getElementById("sDrift");
const outRows=document.getElementById("sRows");
const outPhase=document.getElementById("sPhase");
const outC=document.getElementById("sC");
const outIter=document.getElementById("sIter");
const outBuf=document.getElementById("sBuf");
const outFps=document.getElementById("sFps");
const calm=window.matchMedia("(prefers-reduced-motion: reduce)");

const STOPS=[
  [0.00,4,7,20],[0.09,12,22,62],[0.20,32,50,124],[0.34,70,60,158],
  [0.47,120,58,164],[0.60,172,62,124],[0.71,214,88,74],[0.81,240,140,56],
  [0.90,252,196,98],[0.96,255,238,182],[1.00,255,252,242]
];
const PAL=new Uint32Array(PAL_SIZE);
(function buildPalette(){
  let seg=0;
  for(let i=0;i<PAL_SIZE-1;i++){
    const t=i/(PAL_SIZE-2);
    while(seg<STOPS.length-2&&t>STOPS[seg+1][0]) seg++;
    const a=STOPS[seg],b=STOPS[seg+1];
    const span=b[0]-a[0]||1;
    const f=Math.min(1,Math.max(0,(t-a[0])/span));
    const r=(a[1]+(b[1]-a[1])*f)|0;
    const g=(a[2]+(b[2]-a[2])*f)|0;
    const bl=(a[3]+(b[3]-a[3])*f)|0;
    PAL[i]=0xff000000|(bl<<16)|(g<<8)|r;
  }
  PAL[PAL_SIZE-1]=0xff000000|(12<<16)|(11<<8)|5;
})();

const buf=document.createElement("canvas");
const bctx=buf.getContext("2d");
let bufW=0,bufH=0,img=null,pix=null,reBase=0,imBase=0,colStep=0,rowStep=0;
let dpr=1,cssW=0,cssH=0;
let rowCursor=0,rowsPerFrame=0,costAvg=6;

function buildBuffer(){
  const aspect=(cssW||16)/Math.max(1,cssH||10);
  bufW=BUF_W;
  bufH=Math.max(48,Math.min(BUF_W,Math.round(BUF_W/aspect)));
  buf.width=bufW;
  buf.height=bufH;
  img=bctx.createImageData(bufW,bufH);
  pix=new Uint32Array(img.data.buffer);
  rowStep=2/bufH;
  reBase=0;
  imBase=0;
  colStep=2/bufW;
  rowCursor=0;
  rowsPerFrame=bufH;
}

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
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality="high";
  buildBuffer();
}

function renderRow(row){
  const cim=imBase+row*rowStep;
  const iters=iterTarget;
  const eps=epsVal;
  const inv=1/iters;
  let idx=row*bufW;
  for(let j=0;j<bufW;j++){
    const cre=reBase+j*colStep;
    let zr=0,zi=0,pr=0,pi=0,n=0;
    for(n=0;n<iters;n++){
      const zr2=zr*zr;
      const zi2=zi*zi;
      const m=zr2+zi2;
      if(m>BAIL2) break;
      pr=zr;
      pi=zi;
      zi=2*zr*zi+cim;
      zr=zr2-zi2+cre;
    }
    if(n>=iters){
      pix[idx]=PAL[PAL_SIZE-1];
    }else if(Math.abs(zr-pr)<eps&&Math.abs(zi-pi)<eps){
      pix[idx]=PAL[PAL_SIZE-1];
    }else{
      const m=zr*zr+zi*zi;
      let sm=n+1-Math.log(Math.log(Math.sqrt(m))/LOG_BAIL)/LN2;
      sm*=inv;
      if(sm<0) sm=0;
      else if(sm>1) sm=1;
      const v=(Math.pow(sm,0.42)*(PAL_SIZE-2))|0;
      pix[idx]=PAL[v];
    }
    idx++;
  }
}

function interleave(k){
  const half=(bufH+1)>>1;
  if(k<half) return k*2;
  const v=k-half;
  return v*2+1<bufH?v*2+1:bufH-1;
}

let iterTarget=90,epsVal=1e-4;

function paint(){
  const t0=performance.now();
  let done=0;
  const target=rowsPerFrame;
  while(done<target){
    renderRow(interleave(rowCursor));
    rowCursor=rowCursor+1>=bufH?0:rowCursor+1;
    done++;
  }
  const cost=performance.now()-t0;
  costAvg=costAvg*0.85+cost*0.15;
  if(costAvg<6.2) rowsPerFrame=Math.min(bufH,rowsPerFrame+2);
  else if(costAvg>11.5) rowsPerFrame=Math.max(2,rowsPerFrame-1);
  bctx.putImageData(img,0,0);
  ctx.drawImage(buf,0,0,bufW,bufH,0,0,cssW,cssH);
}

let probe=-1,probeX=0,probeY=0,probeOn=false,probeIt=0;
function sampleAt(cx,ci,maxIter,eps){
  let zr=0,zi=0,pr=0,pi=0,n=0;
  for(n=0;n<maxIter;n++){
    const zr2=zr*zr;
    const zi2=zi*zi;
    if(zr2+zi2>BAIL2) break;
    pr=zr;
    pi=zi;
    zi=2*zr*zi+ci;
    zr=zr2-zi2+cx;
  }
  if(n>=maxIter) return -1;
  if(Math.abs(zr-pr)<eps&&Math.abs(zi-pi)<eps) return -1;
  return n+1;
}
function drawProbe(){
  if(!probeOn||probe<0) return;
  const x=cssW*probeX,y=cssH*probeY;
  ctx.save();
  ctx.strokeStyle="rgba(255,255,255,.55)";
  ctx.lineWidth=1;
  ctx.beginPath();
  ctx.moveTo(x-13,y);
  ctx.lineTo(x-4,y);
  ctx.moveTo(x+4,y);
  ctx.lineTo(x+13,y);
  ctx.moveTo(x,y-13);
  ctx.lineTo(x,y-4);
  ctx.moveTo(x,y+4);
  ctx.lineTo(x,y+13);
  ctx.stroke();
  ctx.strokeStyle="rgba(255,255,255,.8)";
  ctx.beginPath();
  ctx.arc(x,y,9,0,TAU);
  ctx.stroke();
  const t=Math.min(1,probe/iterTarget);
  ctx.beginPath();
  ctx.arc(x,y,9,-Math.PI/2,-Math.PI/2+TAU*Math.max(0.04,t));
  ctx.strokeStyle="rgba(255,200,97,.95)";
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.fillStyle="rgba(8,10,20,.72)";
  ctx.fillRect(x+14,y-19,58,16);
  ctx.strokeStyle="rgba(255,255,255,.22)";
  ctx.lineWidth=1;
  ctx.strokeRect(x+14.5,y-18.5,57,15);
  ctx.fillStyle="#ffe9c2";
  ctx.font="11px ui-monospace, Menlo, Consolas, monospace";
  ctx.textBaseline="middle";
  ctx.fillText(probe<0?"set":String(probe),x+19,y-10.5);
  ctx.restore();
}

plate.addEventListener("pointermove",function(e){
  const r=plate.getBoundingClientRect();
  probeX=(e.clientX-r.left)/r.width;
  probeY=(e.clientY-r.top)/r.height;
  probeOn=probeX>=0&&probeX<=1&&probeY>=0&&probeY<=1;
});
plate.addEventListener("pointerleave",function(){probeOn=false;});

function smooth(v){return v*v*(3-2*v);}

function camera(sec){
  const u=sec%CYCLE;
  const p=u<HALF_CYCLE?smooth(u/HALF_CYCLE):1-smooth((u-HALF_CYCLE)/HALF_CYCLE);
  const h=SPAN_TOP*Math.exp(-LOG_RANGE*p);
  const wx=0.42*Math.sin(TAU*3*u/CYCLE);
  const wy=0.34*Math.sin(TAU*2*u/CYCLE+1.1);
  return {h:h,re:C0_RE+h*wx,im:C0_IM+h*wy,drift:Math.hypot(wx,wy),p:p,u:u};
}

function render(sec,cam){
  const halfW=cam.h*((cssW/cssH)||1.6);
  reBase=cam.re-halfW;
  imBase=cam.im-cam.h;
  colStep=2*halfW/bufW;
  rowStep=2*cam.h/bufH;
  const depth=Math.log(SPAN_TOP/cam.h);
  iterTarget=Math.round(Math.min(168,Math.max(72,72+depth*17)));
  epsVal=Math.max(1e-9,cam.h*1e-3);
  paint();
  if(probeOn){
    const pcr=reBase+probeX*2*halfW;
    const pci=imBase+probeY*2*cam.h;
    probe=sampleAt(pcr,pci,Math.min(400,iterTarget),epsVal);
  }
  drawProbe();
  if(rowsPerFrame<bufH){
    const yy=interleave(rowCursor)/bufH*cssH;
    ctx.fillStyle="rgba(255,200,97,.05)";
    ctx.fillRect(0,yy-1,cssW,2);
  }
  return iterTarget;
}

function exp3(v){
  // Solo se quita el `+` de los exponentes positivos: `1.23e+5` -> `1.23e5`.
  // El segundo replace de antes era un no-op (`"e-"` -> `"e-"`) y era justo
  // lo que CodeQL marcaba como "Replacement of a substring with itself".
  return v.toExponential(2).replace("e+", "e");
}

let t0=0,tPrev=0,frame=0,raf=0,fpsAcc=0,fpsN=0,fpsShow=60;

function still(){
  const cam=camera(6.2);
  const it=render(6.2,cam);
  outIter.textContent=String(it);
  outZoom.textContent=Math.round(SPAN_TOP/cam.h)+"\u00D7";
  outSpan.textContent=exp3(cam.h);
  outRows.textContent=rowsPerFrame+" / "+bufH;
  outPhase.textContent="Descent \u00B7 "+Math.round(cam.p*100)+"%";
  outC.textContent=cam.re.toFixed(6)+" + "+cam.im.toFixed(6)+"i";
  outBuf.textContent=bufW+" \u00D7 "+bufH;
  outDrift.textContent=cam.drift.toFixed(3)+"\u00D7";
  outFps.textContent="still";
}

function loop(now){
  if(!t0) t0=now;
  const dt=frame===0?1/60:Math.min(0.05,(now-tPrev)/1000);
  tPrev=now;
  const sec=(now-t0)/1000;
  const cam=camera(sec);
  const it=render(sec,cam);
  fpsAcc+=dt;
  fpsN++;
  if(fpsAcc>0.5){
    fpsShow=Math.round(fpsN/fpsAcc);
    fpsAcc=0;
    fpsN=0;
  }
  if(frame%6===0){
    const mag=SPAN_TOP/cam.h;
    outZoom.textContent=(mag>=1000?Math.round(mag).toLocaleString("en-US"):mag.toFixed(2))+"\u00D7";
    outSpan.textContent=exp3(cam.h);
    outDrift.textContent=cam.drift.toFixed(3)+"\u00D7";
    outRows.textContent=rowsPerFrame+" / "+bufH;
    outPhase.textContent=cam.p<0.985?"Descent \u00B7 "+Math.round(cam.p*100)+"%":"Ascent \u00B7 "+Math.round((1-cam.p)*100)+"%";
    outC.textContent=cam.re.toFixed(6)+" + "+cam.im.toFixed(6)+"i";
    outIter.textContent=String(it);
    outBuf.textContent=bufW+" \u00D7 "+bufH;
    outFps.textContent=String(fpsShow);
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
  tPrev=0;
  frame=0;
  raf=requestAnimationFrame(loop);
}
let rt=0;
window.addEventListener("resize",function(){
  clearTimeout(rt);
  rt=setTimeout(function(){
    resize();
    if(calm.matches) still();
  },160);
});
start();
