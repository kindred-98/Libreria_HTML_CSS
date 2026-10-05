(function(){
var cv=document.getElementById('water');
var ctx=cv.getContext('2d',{alpha:false});
var mq=window.matchMedia('(prefers-reduced-motion: reduce)');

var TAU=Math.PI*2;
var W=1,H=1,DPR=1,S=1,SS=1;
var koi=[],rings=[],motes=[],bub=[],surf=[];
var bgG,veilG;
var cbc,cac,cimg,cdat,NCX=11,NCY=7,CW=176,CH=112,jit=new Float32Array(11*7*2);
var dot,dsh;
var time=0,last=0,raf=0,running=false,seeded=false,hudT=0;
var ptr={x:-1e4,y:-1e4,r:0,act:false};
var hK=document.getElementById('hud-koi'),hR=document.getElementById('hud-rings');
var hD=document.getElementById('hud-depth'),hC=document.getElementById('hud-caustic');

var PAL=[
 {hi:'#fff4dc',mid:'#fba73c',lo:'#b84d0b',dk:'#6d2a05',fin:'rgba(252,206,146,.5)',eye:'#180f05',blot:null},
 {hi:'#ffe0b6',mid:'#f07a1e',lo:'#96350a',dk:'#5c1f04',fin:'rgba(250,186,120,.46)',eye:'#170d04',blot:['#221812']},
 {hi:'#fffdf8',mid:'#f4ece0',lo:'#c6ac8b',dk:'#8a7455',fin:'rgba(255,255,250,.54)',eye:'#1d150c',blot:['#dd4f1c','#f0a03c']},
 {hi:'#fff7d6',mid:'#ffd05e',lo:'#c4800c',dk:'#8a5405',fin:'rgba(255,232,164,.5)',eye:'#1a1206',blot:null},
 {hi:'#ffdfb8',mid:'#f28c28',lo:'#963707',dk:'#632204',fin:'rgba(248,178,106,.44)',eye:'#180e05',blot:['#ffe0b0']},
 {hi:'#fffefb',mid:'#f1ebdf',lo:'#b8a88b',dk:'#7c6d57',fin:'rgba(255,255,252,.52)',eye:'#1c150d',blot:['#d9571a','#f8edd9']}
];

function cl(v,a,b){
  if(v<a)return a;
  if(v>b)return b;
  return v;
}
function lp(a,b,t){return a+(b-a)*t;}
function rn(a,b){return a+Math.random()*(b-a);}
function wr(a){a=(a+Math.PI)%TAU;if(a<0)a+=TAU;return a-Math.PI;}

function prof(u){
  var a=(u-0.32)/0.30,b=(u-0.90)/0.105;
  return Math.exp(-a*a)+0.32*Math.exp(-b*b)+0.03;
}

function mkSprite(inner,mid,outer){
  var c=document.createElement('canvas');
  c.width=96;c.height=96;
  var x=c.getContext('2d');
  var g=x.createRadialGradient(48,48,0,48,48,48);
  g.addColorStop(0,inner);
  g.addColorStop(0.26,mid);
  g.addColorStop(0.6,outer);
  g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;
  x.fillRect(0,0,96,96);
  return c;
}

function addKoi(x,y){
  var k={},j;
  k.pal=PAL[(Math.random()*PAL.length | 0)];
  k.n=24;
  k.len=rn(0.19,0.30)*S;
  k.hw=k.len*0.155;
  k.lx=new Float32Array(k.n);
  k.ly=new Float32Array(k.n);
  k.wf=new Float32Array(k.n);
  for(j=0;j<k.n;j++)k.wf[j]=prof(j/(k.n-1));
  k.x=cl(x,S*0.1,W-S*0.1);
  k.y=cl(y,S*0.12,H-S*0.12);
  k.ang=rn(0,TAU);
  k.speed=k.len*rn(0.24,0.4);
  k.phase=rn(0,TAU);
  k.freq=rn(2.9,4.6);
  k.amp=rn(0.42,0.78);
  k.wave=rn(0.68,1.0);
  k.base=Math.random();
  k.depth=k.base*0.85;
  k.wt=rn(0.4,3.4);
  k.tx=k.x;k.ty=k.y;
  k.ringT=rn(0.1,1.1);
  k.tailX=k.x;k.tailY=k.y;
  koi.push(k);
}

function buildField(){
  var i,n=cl(Math.round(W*H/19000)+22,26,110);
  motes.length=0;
  for(i=0;i<n;i++){
    motes.push({x:rn(0,W),y:rn(0,H),r:rn(0.7,2.6)*SS,a:rn(0.05,0.3),v:rn(4,19),ph:rn(0,TAU),d:rn(0.3,1)});
  }
  bub.length=0;
  n=cl(Math.round(W*H/130000)+5,6,14);
  for(i=0;i<n;i++){
    bub.push({x:rn(0,W),y:rn(0,H),r:rn(1.4,3.6)*SS,v:rn(13,34),w:rn(0,TAU)});
  }
  surf.length=0;
  n=cl(Math.round(H/52),9,18);
  for(i=0;i<n;i++){
    surf.push({t:i/n,ph:rn(0,TAU),sp:rn(0.5,1.6),a:rn(0.016,0.05),w:rn(0.6,1.7)*SS,o:rn(0,TAU)});
  }
}

function resize(){
  var nw=Math.max(1,window.innerWidth),nh=Math.max(1,window.innerHeight);
  var nd=Math.min(2,window.devicePixelRatio||1);
  if(nw*nh>1600000)nd=Math.min(nd,1.4);
  if(nw===W&&nh===H&&nd===DPR)return false;
  W=nw;H=nh;
  DPR=nd;
  SS=cl(Math.min(W,H)/760,0.6,1.5);
  S=Math.min(W,H);
  cv.width=Math.round(W*DPR);
  cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';
  cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.lineJoin='round';
  ctx.lineCap='round';

  bgG=ctx.createLinearGradient(0,0,0,H);
  bgG.addColorStop(0,'#1e6b74');
  bgG.addColorStop(0.12,'#134e58');
  bgG.addColorStop(0.32,'#0b3a44');
  bgG.addColorStop(0.58,'#05242c');
  bgG.addColorStop(0.82,'#02141b');
  bgG.addColorStop(1,'#010d13');

  veilG=ctx.createLinearGradient(0,0,0,H);
  veilG.addColorStop(0,'rgba(150,226,216,0.07)');
  veilG.addColorStop(0.24,'rgba(70,168,166,0.05)');
  veilG.addColorStop(0.58,'rgba(4,26,32,0.16)');
  veilG.addColorStop(1,'rgba(1,10,15,0.5)');

  cbc=document.createElement('canvas');
  cbc.width=CW;cbc.height=CH;
  cac=cbc.getContext('2d');
  cimg=cac.createImageData(CW,CH);
  cdat=cimg.data;

  dot=mkSprite('rgba(232,255,250,1)','rgba(180,242,232,.5)','rgba(120,206,204,.12)');
  dsh=mkSprite('rgba(0,12,16,1)','rgba(0,16,20,.55)','rgba(0,22,26,.16)');

  buildField();
  if(!seeded){
    seeded=true;
    var n=cl(Math.round(W*H/138000),3,6),i;
    var cols=Math.max(1,Math.round(Math.sqrt(n*W/H))),rows=Math.max(1,Math.ceil(n/cols));
    for(i=0;i<n;i++){
      addKoi((i%cols+0.5)/cols*W+rn(-0.42,0.42)*(W/cols),
             (Math.floor(i/cols)+0.5)/rows*H+rn(-0.42,0.42)*(H/rows));
    }
  }
  return true;
}

function ring(x,y,s){
  var i,life=rn(2.0,3.2),lim=rn(62,158)*s;
  for(i=0;i<3;i++){
    if(rings.length>150)rings.shift();
    rings.push({x:x,y:y,age:-i*rn(0.1,0.18),life:life*(1+i*0.24),r0:rn(2,7),rm:lim,a:0.85*s*(1-i*0.18),w:rn(1.1,2.4)*SS,t:rn(0,TAU)});
  }
}

function step(dt){
  time+=dt;
  var i,j,k,p,u,a,ca,sa;
  for(i=0;i<koi.length;i++){
    k=koi[i];
    k.wt-=dt;
    k.base=cl(k.base+rn(-1,1)*0.09*dt,0,1);
    k.depth=lp(k.depth,k.base,0.5*dt);
    if(k.wt<=0){
      k.wt=rn(2.6,6.4);
      k.tx=cl(k.x+rn(-0.42,0.42)*W,S*0.08,W-S*0.08);
      k.ty=cl(k.y+rn(-0.42,0.42)*H,S*0.08,H-S*0.08);
    }
    var des=Math.atan2(k.ty-k.y,k.tx-k.x);
    var e=S*0.14;
    if(k.x<e)des=lp(des,0,0.62);
    if(k.x>W-e)des=lp(des,Math.PI,0.62);
    if(k.y<e)des=lp(des,Math.PI/2,0.62);
    if(k.y>H-e)des=lp(des,-Math.PI/2,0.62);
    if(ptr.act){
      var dx=k.x-ptr.x,dy=(k.y-ptr.y)*0.7,dd=dx*dx+dy*dy,rr=S*0.22;
      if(dd<rr*rr){
        var f=1-Math.sqrt(dd)/rr;
        des+=wr(Math.atan2(dy,dx)-des)*f*0.9;
      }
    }
    k.ang+=cl(wr(des-k.ang),-1.9*dt,1.9*dt);
    k.ang+=Math.sin(time*0.42+k.phase)*0.34*dt;
    ca=Math.cos(k.ang);sa=Math.sin(k.ang);
    k.x+=ca*k.speed*dt;
    k.y+=sa*k.speed*dt;
    k.phase+=k.freq*dt*(0.82+(1-k.depth)*0.44);
    var seg=k.len/(k.n-1);
    k.lx[0]=0;k.ly[0]=0;
    for(j=1;j<k.n;j++){
      u=j/(k.n-1);
      a=k.amp*Math.sin(TAU*(k.wave*u)-k.phase)*Math.pow(u,1.35);
      k.lx[j]=k.lx[j-1]+Math.cos(a)*seg;
      k.ly[j]=k.ly[j-1]+Math.sin(a)*seg;
    }
    k.tailX=k.x+(k.lx[k.n-1]*ca-k.ly[k.n-1]*sa);
    k.tailY=k.y+(k.lx[k.n-1]*sa+k.ly[k.n-1]*ca);
    k.ringT-=dt;
    if(k.ringT<=0&&k.depth<0.78){
      k.ringT=rn(0.45,1.3);
      ring(k.tailX,k.tailY,lp(1,0.55,k.depth/0.78));
    }
  }
  for(i=rings.length-1;i>=0;i--){
    rings[i].age+=dt;
    if(rings[i].age>rings[i].life)rings.splice(i,1);
  }
  for(i=0;i<koi.length;i++){
    var a1=koi[i];
    for(j=i+1;j<koi.length;j++){
      var b1=koi[j];
      var sx3=a1.x-b1.x,sy3=a1.y-b1.y;
      var want=(a1.len+b1.len)*0.62;
      var dd2=sx3*sx3+sy3*sy3;
      if(dd2<want*want&&dd2>1){
        var d2=Math.sqrt(dd2);
        var push=(want-d2)/want*dt*2.6;
        var ux3=sx3/d2*push*want*0.5,uy3=sy3/d2*push*want*0.5;
        a1.x+=ux3;a1.y+=uy3;
        b1.x-=ux3;b1.y-=uy3;
      }
    }
    a1.x=cl(a1.x,-S*0.16,W+S*0.16);
    a1.y=cl(a1.y,-S*0.16,H+S*0.16);
  }
  for(i=0;i<motes.length;i++){
    p=motes[i];
    p.y-=p.v*p.d*dt;
    p.x+=Math.sin(time*0.44+p.ph)*7*dt;
    if(p.y<-8){p.y=H+8;p.x=rn(0,W);}
    if(p.x<-8)p.x=W+8;else if(p.x>W+8)p.x=-8;
  }
  for(i=0;i<bub.length;i++){
    p=bub[i];
    p.y-=p.v*dt;
    p.x+=Math.sin(time*1.3+p.w)*9*dt;
    if(p.y<-10){p.y=H+10;p.x=rn(0,W);}
  }
}

function caustics(){
  var x,y,dx,dy,dd,f1,f2,v,fa,fb,a,id,px,py,ix,iy,fx,fy,gx,gy,i=0,k,tt;
  var nx,ny,col;
  var w=CW/NCX,h=CH/NCY,NN=NCX*NCY;
  for(k=0;k<NN;k++){
    tt=k*1.83;
    jit[k*2]=0.5+0.44*Math.sin(time*0.27+tt);
    jit[k*2+1]=0.5+0.44*Math.cos(time*0.21+tt*1.37);
  }
  var offx=(time*6.5)%w,offy=(time*3.1)%h;
  for(y=0;y<CH;y++){
    gy=(y+offy)/h;iy=Math.floor(gy);fy=gy-iy;
    for(x=0;x<CW;x++){
      gx=(x+offx)/w;ix=Math.floor(gx);fx=gx-ix;
      f1=9;f2=9;
      for(dy=-1;dy<=1;dy++){
        ny=iy+dy;if(ny<0)ny+=NCY;else if(ny>=NCY)ny-=NCY;
        for(dx=-1;dx<=1;dx++){
          nx=ix+dx;if(nx<0)nx+=NCX;else if(nx>=NCX)nx-=NCX;
          id=(ny*NCX+nx)*2;
          px=fx-(dx+jit[id]);py=fy-(dy+jit[id+1]);
          dd=px*px+py*py;
          if(dd<f1){f2=f1;f1=dd;}else if(dd<f2){f2=dd;}
        }
      }
      v=Math.sqrt(f2)-Math.sqrt(f1);
      fa=1-v/(0.24+0.12*Math.sin(x*0.11+y*0.08+time*0.23));
      if(fa<0)fa=0;
      fa*=fa;fa*=fa;
      fb=1-v/0.8;
      if(fb<0)fb=0;
      fb*=fb;fb*=fb;
      a=(fa*0.92+fb*0.24)*255;
      if(a>255)a=255;
      col=198+fa*44;
      cdat[i]=col>255?255:col;cdat[i+1]=250;cdat[i+2]=244;cdat[i+3]=a;
      i+=4;
    }
  }
  cac.putImageData(cimg,0,0);
  cac.globalCompositeOperation='destination-in';
  var mg=cac.createLinearGradient(0,0,0,CH);
  mg.addColorStop(0,'rgba(0,0,0,1)');
  mg.addColorStop(0.3,'rgba(0,0,0,0.8)');
  mg.addColorStop(0.62,'rgba(0,0,0,0.36)');
  mg.addColorStop(1,'rgba(0,0,0,0.06)');
  cac.fillStyle=mg;
  cac.fillRect(0,0,CW,CH);
  var rg=cac.createRadialGradient(CW*0.5,CH*0.3,0,CW*0.5,CH*0.34,CW*0.72);
  rg.addColorStop(0,'rgba(0,0,0,1)');
  rg.addColorStop(0.5,'rgba(0,0,0,0.78)');
  rg.addColorStop(1,'rgba(0,0,0,0.16)');
  cac.fillStyle=rg;
  cac.fillRect(0,0,CW,CH);
  cac.globalCompositeOperation='source-over';
}

function bodyPath(k){
  var n=k.n,i;
  ctx.beginPath();
  for(i=0;i<n;i++){
    var w=k.hw*k.wf[i];
    if(i)ctx.lineTo(k.lx[i],k.ly[i]-w);else ctx.moveTo(k.lx[i],k.ly[i]-w);
  }
  for(i=n-1;i>=0;i--){
    var w2=k.hw*k.wf[i];
    ctx.lineTo(k.lx[i],k.ly[i]+w2);
  }
  ctx.closePath();
}

function finPetal(bx,by,fa,L,fill,edge,ray){
  ctx.beginPath();
  ctx.moveTo(bx,by);
  ctx.quadraticCurveTo(bx+Math.cos(fa-0.92)*L*0.64,by+Math.sin(fa-0.92)*L*0.64,bx+Math.cos(fa)*L,by+Math.sin(fa)*L);
  ctx.quadraticCurveTo(bx+Math.cos(fa+0.92)*L*0.64,by+Math.sin(fa+0.64)*L*0.64,bx,by);
  ctx.closePath();
  ctx.fillStyle=fill;
  ctx.fill();
  if(ray>0){
    ctx.strokeStyle=edge;
    ctx.lineWidth=Math.max(0.5,L*0.03);
    ctx.beginPath();
    ctx.moveTo(bx,by);
    ctx.lineTo(bx+Math.cos(fa-0.4)*L*0.72,by+Math.sin(fa-0.4)*L*0.72);
    ctx.moveTo(bx,by);
    ctx.lineTo(bx+Math.cos(fa+0.12)*L*0.8,by+Math.sin(fa+0.12)*L*0.8);
    ctx.moveTo(bx,by);
    ctx.lineTo(bx+Math.cos(fa+0.56)*L*0.68,by+Math.sin(fa+0.56)*L*0.68);
    ctx.stroke();
  }
}

function drawTail(k){
  var n=k.n,hw=k.hw,len=k.len,lx=k.lx,ly=k.ly,i;
  var ra=n-3,rt=n-1;
  var ax=lx[ra],ay=ly[ra],bx=lx[rt],by=ly[rt];
  var ta=Math.atan2(by-ay,bx-ax);
  var sp=0.36+0.28*Math.sin(k.phase-2.1);
  var L=len*0.25;
  ctx.beginPath();
  ctx.moveTo(ax,ay);
  ctx.quadraticCurveTo(bx+Math.cos(ta-sp*0.5)*L*0.72,by+Math.sin(ta-sp*0.5)*L*0.72,bx+Math.cos(ta-sp)*L,by+Math.sin(ta-sp)*L);
  ctx.quadraticCurveTo(bx+Math.cos(ta)*L*0.44,by+Math.sin(ta)*L*0.44,bx+Math.cos(ta+sp)*L,by+Math.sin(ta+sp)*L);
  ctx.quadraticCurveTo(bx+Math.cos(ta+sp*0.5)*L*0.72,by+Math.sin(ta+sp*0.5)*L*0.72,ax,ay);
  ctx.closePath();
  var g=ctx.createLinearGradient(ax,ay,bx+Math.cos(ta)*L*0.5,by+Math.sin(ta)*L*0.5);
  g.addColorStop(0,'rgba(248,226,190,0.62)');
  g.addColorStop(0.4,k.pal.fin);
  g.addColorStop(1,'rgba(198,236,230,0.1)');
  ctx.fillStyle=g;
  ctx.fill();
  ctx.strokeStyle='rgba(255,246,226,0.13)';
  ctx.lineWidth=Math.max(0.5,hw*0.045);
  ctx.beginPath();
  for(i=-3;i<=3;i++){
    var aa=ta+(i/3)*sp*0.8;
    var m=1-Math.abs(i)/4.6;
    ctx.moveTo(bx,by);
    ctx.lineTo(bx+Math.cos(aa)*L*(0.5+0.32*m),by+Math.sin(aa)*L*(0.5+0.32*m));
  }
  ctx.stroke();
}

function drawDorsal(k){
  var n=k.n,j0=Math.round(0.34*(n-1)),j1=Math.round(0.7*(n-1)),j,u,L=k.len*0.05;
  ctx.beginPath();
  for(j=j0;j<=j1;j++){
    u=(j-j0)/(j1-j0);
    var d=-Math.sin(u*Math.PI)*L;
    if(j===j0)ctx.moveTo(k.lx[j],k.ly[j]+d);else ctx.lineTo(k.lx[j],k.ly[j]+d);
  }
  for(j=j1;j>=j0;j--)ctx.lineTo(k.lx[j],k.ly[j]-1.2);
  ctx.closePath();
  ctx.fillStyle='rgba(248,236,210,0.14)';
  ctx.fill();
  ctx.strokeStyle='rgba(255,248,228,0.1)';
  ctx.lineWidth=Math.max(0.5,k.hw*0.045);
  ctx.beginPath();
  for(j=j0;j<=j1;j++){
    u=(j-j0)/(j1-j0);
    var d2=-Math.sin(u*Math.PI)*L*0.9;
    if(j===j0)ctx.moveTo(k.lx[j],k.ly[j]+d2);else ctx.lineTo(k.lx[j],k.ly[j]+d2);
  }
  ctx.stroke();
}

function drawKoi(k){
  var n=k.n,hw=k.hw,len=k.len,pal=k.pal,lx=k.lx,ly=k.ly,ca,sa,i;
  var sc=1-k.depth*0.14;
  sa=Math.sin(k.ang);ca=Math.cos(k.ang);
  var im=(n*0.34 | 0);
  var mx=k.x+(lx[im]*ca-ly[im]*sa)*sc;
  var my=k.y+(lx[im]*sa+ly[im]*ca)*sc;
  var dl=hw*2.3*sc;
  ctx.globalAlpha=0.4-k.depth*0.16;
  ctx.drawImage(dsh,mx-dl*1.25+11*sc,my-dl*1.05+18*sc,dl*2.5,dl*2.1);
  ctx.globalAlpha=1;

  ctx.save();
  ctx.translate(k.x,k.y);
  ctx.rotate(k.ang);
  ctx.scale(sc,sc);
  ctx.globalAlpha=k.alpha;

  drawTail(k);
  drawDorsal(k);

  var fl=Math.sin(k.phase-0.8);
  var j3=Math.round(0.18*(n-1)),j4=Math.round(0.45*(n-1));
  finPetal(lx[j3],ly[j3],2.44-0.3*fl,len*(0.15+0.028*fl),'rgba(250,232,204,0.34)','rgba(255,246,224,0.16)',1);
  finPetal(lx[j3],ly[j3],-2.44+0.3*fl,len*(0.15+0.028*fl),'rgba(250,232,204,0.34)','rgba(255,246,224,0.16)',1);
  var fl2=Math.sin(k.phase-1.7);
  finPetal(lx[j4],ly[j4],2.04-0.24*fl2,len*0.095,'rgba(244,222,192,0.26)','rgba(255,244,220,0.1)',0);
  finPetal(lx[j4],ly[j4],-2.04+0.24*fl2,len*0.095,'rgba(244,222,192,0.26)','rgba(255,244,220,0.1)',0);

  bodyPath(k);
  var mx0=lx[(n*0.32 | 0)],my0=ly[(n*0.32 | 0)];
  var g=ctx.createLinearGradient(mx0,my0-hw*1.3,mx0,my0+hw*1.3);
  g.addColorStop(0,pal.lo);
  g.addColorStop(0.14,pal.mid);
  g.addColorStop(0.36,pal.hi);
  g.addColorStop(0.62,pal.mid);
  g.addColorStop(0.86,pal.lo);
  g.addColorStop(1,pal.mid);
  ctx.fillStyle=g;
  ctx.fill();

  ctx.save();
  ctx.clip();
  var tg=ctx.createLinearGradient(lx[0],ly[0],lx[n-1],ly[n-1]);
  tg.addColorStop(0,'rgba(255,252,240,0.16)');
  tg.addColorStop(0.42,'rgba(255,250,236,0)');
  tg.addColorStop(1,'rgba(8,44,54,0.4)');
  ctx.fillStyle=tg;
  ctx.fillRect(-len,-hw*2,len*2,hw*4);
  if(pal.blot){
    for(i=0;i<pal.blot.length;i++){
      var jj=Math.round((0.28+i*0.26)*(n-1));
      var rr=hw*(pal.blot.length>1?0.62:0.5)*(1-i*0.16);
      var oy=(i%2?-1:1)*hw*0.12*k.wf[jj];
      ctx.save();
      ctx.translate(lx[jj],ly[jj]+oy);
      ctx.rotate(Math.atan2(ly[Math.min(jj+1,n-1)]-ly[Math.max(jj-1,0)],lx[Math.min(jj+1,n-1)]-lx[Math.max(jj-1,0)]));
      ctx.fillStyle=pal.blot[i];
      ctx.globalAlpha=k.alpha*0.44;
      ctx.beginPath();
      ctx.ellipse(0,0,rr*1.5,rr*0.78,0.16,0,TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(rr*1.1,rr*0.34,rr*0.44,rr*0.3,-0.2,0,TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-rr*0.9,rr*0.5,rr*0.3,rr*0.22,0.1,0,TAU);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha=k.alpha;
    }
  }else{
    ctx.strokeStyle=pal.dk;
    ctx.globalAlpha=k.alpha*0.05;
    ctx.lineWidth=Math.max(0.4,hw*0.024);
    ctx.beginPath();
    for(i=0;i<15;i++){
      var u2=0.15+i*0.048;
      var j2=Math.round(u2*(n-1));
      var rw=hw*k.wf[j2]*0.6;
      var sx2=lx[j2]-hw*0.02;
      ctx.moveTo(sx2,ly[j2]-rw);
      ctx.quadraticCurveTo(sx2+hw*0.17,ly[j2],sx2,ly[j2]+rw);
      ctx.moveTo(sx2+hw*0.13,ly[j2]-rw*0.9);
      ctx.quadraticCurveTo(sx2+hw*0.3,ly[j2],sx2+hw*0.13,ly[j2]+rw*0.9);
      ctx.moveTo(sx2+hw*0.26,ly[j2]-rw*0.8);
      ctx.quadraticCurveTo(sx2+hw*0.42,ly[j2],sx2+hw*0.26,ly[j2]+rw*0.8);
    }
    ctx.stroke();
    ctx.globalAlpha=k.alpha;
  }
  ctx.globalAlpha=k.alpha*0.1;
  ctx.drawImage(dot,lx[(n*0.28 | 0)]-hw*0.95,ly[(n*0.28 | 0)]-hw*0.85,hw*1.9,hw*1.4);
  ctx.globalAlpha=k.alpha;
  ctx.restore();

  ctx.strokeStyle='rgba(12,54,64,0.4)';
  ctx.lineWidth=Math.max(0.6,hw*0.085);
  ctx.beginPath();
  for(i=0;i<n;i++){
    if(i)ctx.lineTo(lx[i],ly[i]);else ctx.moveTo(lx[i],ly[i]);
  }
  ctx.stroke();

  bodyPath(k);
  ctx.strokeStyle='rgba(255,248,228,0.17)';
  ctx.lineWidth=Math.max(0.6,hw*0.05);
  ctx.stroke();

  if(k.depth>0.04){
    bodyPath(k);
    ctx.fillStyle='rgba(9,50,62,'+(k.depth*0.4).toFixed(3)+')';
    ctx.fill();
  }

  var je=Math.round(0.088*(n-1));
  var ex=hw*0.42,er=hw*0.1;
  ctx.fillStyle=pal.eye;
  for(i=-1;i<=1;i+=2){
    ctx.beginPath();
    ctx.arc(lx[je],ly[je]+i*ex,er,0,TAU);
    ctx.fill();
  }
  ctx.fillStyle='rgba(255,255,250,0.85)';
  for(i=-1;i<=1;i+=2){
    ctx.beginPath();
    ctx.arc(lx[je]-er*0.3,ly[je]+i*ex-er*0.32,er*0.36,0,TAU);
    ctx.fill();
  }

  ctx.strokeStyle='rgba(236,222,196,0.24)';
  ctx.lineWidth=Math.max(0.5,hw*0.04);
  ctx.beginPath();
  for(i=-1;i<=1;i+=2){
    ctx.moveTo(lx[0]+len*0.006,ly[0]+i*hw*0.14);
    ctx.quadraticCurveTo(lx[0]+len*0.03,ly[0]+i*hw*0.66,lx[0]+len*0.062,ly[0]+i*len*0.086);
  }
  ctx.stroke();
  ctx.strokeStyle='rgba(24,16,8,0.34)';
  ctx.lineWidth=Math.max(0.6,hw*0.07);
  ctx.beginPath();
  ctx.moveTo(lx[0]+len*0.004,ly[0]-hw*0.26);
  ctx.quadraticCurveTo(lx[0]+len*0.024,ly[0],lx[0]+len*0.004,ly[0]+hw*0.26);
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha=1;
}

function drawRings(){
  var i,r,q,rad,a,ox;
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<rings.length;i++){
    r=rings[i];
    if(r.age<0)continue;
    q=r.age/r.life;
    if(q>1)continue;
    rad=r.r0+q*r.rm;
    a=r.a*(1-q)*(1-q);
    if(a<0.005)continue;
    ox=Math.sin(q*4.4+r.t)*rad*0.03;
    ctx.strokeStyle='rgba(178,236,228,'+a.toFixed(3)+')';
    ctx.lineWidth=r.w*(1-q*0.5);
    ctx.beginPath();
    ctx.ellipse(r.x+ox,r.y,rad,rad*0.3,0,0,TAU);
    ctx.stroke();
    ctx.strokeStyle='rgba(236,254,250,'+(a*0.45).toFixed(3)+')';
    ctx.lineWidth=r.w*0.4*(1-q*0.55);
    ctx.beginPath();
    ctx.ellipse(r.x+ox,r.y,rad*0.82,rad*0.246,0,0,TAU);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
}

function drawSurface(){
  var i,s,y,px,py,u,wv;
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<surf.length;i++){
    s=surf[i];
    y=H*(0.015+s.t*0.24);
    wv=S*0.022;
    ctx.strokeStyle='rgba(196,244,238,'+(s.a*(0.5+0.5*Math.sin(time*s.sp+s.ph))).toFixed(3)+')';
    ctx.lineWidth=s.w;
    ctx.beginPath();
    for(px=0;px<=30;px++){
      u=px/30;
      py=y+Math.sin(u*23+s.o+time*0.6*s.sp)*wv*(0.3+u*0.8)+Math.sin(u*51+s.ph*1.7)*wv*0.22;
      if(px)ctx.lineTo(-60+u*(W+120),py);else ctx.moveTo(-60+u*(W+120),py);
    }
    ctx.stroke();
  }
  for(i=0;i<8;i++){
    var gy2=H*(0.015+i*0.02);
    var gx2=W*(0.5+0.44*Math.sin(time*0.031+i*1.9));
    var gw=S*0.09;
    ctx.strokeStyle='rgba(234,254,250,'+(0.04+0.045*Math.max(0,Math.sin(time*0.62+i*2.1))).toFixed(3)+')';
    ctx.lineWidth=Math.max(1,S*0.0022);
    ctx.beginPath();
    ctx.moveTo(gx2-gw,gy2);
    ctx.lineTo(gx2+gw,gy2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
}

function render(){
  var i;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=bgG;
  ctx.fillRect(0,0,W,H);

  caustics();
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=0.34;
  ctx.drawImage(cbc,0,0,W,H*0.98);
  ctx.globalAlpha=0.17;
  var k=1.62;
  ctx.drawImage(cbc,-W*(k-1)*0.5+Math.sin(time*0.07)*W*0.05,-H*(k-1)*0.45,W*k,H*0.98*k);
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';

  var order=koi.slice();
  order.sort(function(a,b){return b.depth-a.depth;});
  for(i=0;i<order.length;i++)drawKoi(order[i]);

  drawRings();
  drawSurface();

  ctx.globalCompositeOperation='lighter';
  var gd=ctx.createLinearGradient(0,0,0,H*0.5);
  gd.addColorStop(0,'rgba(154,230,220,0.085)');
  gd.addColorStop(0.42,'rgba(122,208,202,0.05)');
  gd.addColorStop(1,'rgba(90,180,180,0)');
  ctx.fillStyle=gd;
  ctx.fillRect(0,0,W,H*0.5);
  for(i=0;i<motes.length;i++){
    var m=motes[i];
    ctx.globalAlpha=m.a*(0.45+0.55*Math.abs(Math.sin(time*0.8+m.ph)));
    ctx.drawImage(dot,m.x-m.r*3.4,m.y-m.r*3.4,m.r*6.8,m.r*6.8);
  }
  ctx.globalAlpha=1;
  for(i=0;i<bub.length;i++){
    var b=bub[i];
    var bt=0.5+0.5*Math.sin(time*2.1+b.w);
    ctx.strokeStyle='rgba(206,246,242,'+(0.08+0.16*bt).toFixed(3)+')';
    ctx.lineWidth=Math.max(0.7,b.r*0.24);
    ctx.beginPath();
    ctx.arc(b.x,b.y,b.r,0,TAU);
    ctx.stroke();
    ctx.fillStyle='rgba(226,252,248,'+(0.05+0.08*bt).toFixed(3)+')';
    ctx.beginPath();
    ctx.arc(b.x-b.r*0.3,b.y-b.r*0.3,b.r*0.38,0,TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';

  ctx.fillStyle=veilG;
  ctx.fillRect(0,0,W,H);

  if(ptr.act&&ptr.r>0.02){
    ctx.globalCompositeOperation='lighter';
    var pg=ctx.createRadialGradient(ptr.x,ptr.y,0,ptr.x,ptr.y,S*0.24);
    pg.addColorStop(0,'rgba(214,250,244,'+(0.12*ptr.r).toFixed(3)+')');
    pg.addColorStop(1,'rgba(214,250,244,0)');
    ctx.fillStyle=pg;
    ctx.fillRect(ptr.x-S*0.24,ptr.y-S*0.24,S*0.48,S*0.48);
    ctx.globalCompositeOperation='source-over';
  }
}

function hud(){
  if(!hK)return;
  var i,d=0;
  for(i=0;i<koi.length;i++)d+=koi[i].depth;
  hK.textContent=(koi.length<10?'0':'')+koi.length;
  hR.textContent=(rings.length<10?'0':'')+rings.length;
  hD.textContent=(d/koi.length*6.4).toFixed(1)+'m';
  hC.textContent=Math.round((0.5+0.5*Math.sin(time*0.42))*100)+'%';
}

function frame(ts){
  if(!last)last=ts;
  var dt=(ts-last)/1000;
  last=ts;
  if(dt>0.06)dt=0.06;
  if(dt<=0)dt=1/60;
  if(ptr.act&&ptr.r<1)ptr.r=Math.min(1,ptr.r+dt*4);
  step(dt);
  render();
  hudT-=dt;
  if(hudT<=0){hudT=0.22;hud();}
  raf=requestAnimationFrame(frame);
}

function start(){
  if(running||mq.matches)return;
  running=true;
  last=0;
  raf=requestAnimationFrame(frame);
}

function stop(){
  running=false;
  if(raf)cancelAnimationFrame(raf);
  raf=0;
}

function still(){
  for(var i=0;i<300;i++)step(1/60);
  ptr.act=false;
  ptr.r=0;
  render();
  hud();
}

window.addEventListener('resize',function(){
  if(!resize())return;
  if(mq.matches)still();
  else{render();hud();}
},{passive:true});

window.addEventListener('pointermove',function(ev){
  ptr.x=ev.clientX;ptr.y=ev.clientY;ptr.act=true;
  if(ev.pointerType==='touch'||ev.pointerType==='pen')ptr.r=1;
},{passive:true});

window.addEventListener('pointerdown',function(ev){
  ptr.x=ev.clientX;ptr.y=ev.clientY;ptr.act=true;ptr.r=1;
  ring(ev.clientX,ev.clientY,1.2);
},{passive:true});

window.addEventListener('pointerleave',function(){ptr.act=false;ptr.r=0;});
window.addEventListener('blur',function(){ptr.act=false;ptr.r=0;});

document.addEventListener('visibilitychange',function(){
  if(document.hidden)stop();else start();
});

function onMQ(){
  if(mq.matches){stop();still();}else start();
}

if(mq.addEventListener)mq.addEventListener('change',onMQ);
else if(mq.addListener)mq.addListener(onMQ);

resize();
if(mq.matches)still();
else{render();hud();start();}
})();
