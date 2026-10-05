(function(){
var cv=document.getElementById('fx');
var ctx=cv.getContext('2d');
var fl=document.getElementById('flash');
var mq=window.matchMedia('(prefers-reduced-motion: reduce)');

var TAU=Math.PI*2;
var W=1,H=1,DPR=1,S=1;
var topY=0,baseY=0,contact=0,rMin=1,rMax=1,ANG=1,lean=1,horizon=1,skirt=1;
var parts=[],chunks=[],haze=[],dust=[],streaks=[],marks=[],cloud=[],shapes=[];
var orderBuf=[];
var warm,dim,dark,glow,seeded=false,legPh=new Float32Array(80);
var time=0,last=0,raf=0,running=false,hudT=0;
var boltPts=null,seq=null,boltAge=0,boltOn=false,boltA=0,boltWait=3.15,flash=0,after=0,lastFlash=-1;
var ptr={x:-1e4,y:-1e4,act:false};
var hE=document.getElementById('hud-ef'),hW=document.getElementById('hud-wind');
var hM=document.getElementById('hud-meso'),hD=document.getElementById('hud-debris');

function cl(v,a,b){
  if(v<a)return a;
  if(v>b)return b;
  return v;
}
function rn(a,b){return a+Math.random()*(b-a);}
function ss(a,b,x){var t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);}

function R(t){
  var s=rMin+(rMax-rMin)*Math.pow(t,0.66);
  s*=1-0.34*ss(0.74,1,t);
  s*=1+0.05*Math.sin(t*8.4+time*0.7)+0.032*Math.sin(t*16.3-time*0.52);
  return s;
}
function CY(t){return topY+(baseY-topY)*Math.pow(t,0.97);}
function CX(t){
  var x=W*0.6-lean*(1-t)*0.94;
  x+=Math.sin(t*2.1+time*0.31)*rMax*0.1*t;
  x+=Math.sin(t*0.85-time*0.2)*rMax*0.16*t*t;
  if(ptr.act)x+=cl((ptr.x-W*0.5)*0.05,-rMax*0.15,rMax*0.15)*t;
  return x;
}

function mkSprite(stops,size){
  var c=document.createElement('canvas');
  c.width=size||96;c.height=size||96;
  var x=c.getContext('2d');
  var n=c.width,g=x.createRadialGradient(n/2,n/2,0,n/2,n/2,n/2);
  for(var stop of stops)g.addColorStop(stop[0],stop[1]);
  x.fillStyle=g;
  x.fillRect(0,0,n,n);
  return c;
}

function mkChunk(n){
  var a=[],i;
  for(i=0;i<n;i++){
    var th=i/n*TAU+rn(-0.18,0.18);
    var r=rn(0.4,1.05);
    a.push([Math.cos(th)*r,Math.sin(th)*r*rn(0.45,1.15)]);
  }
  return a;
}

function respawn(p,spread){
  p.t=spread?rn(-0.05,1.02):rn(0.86,1.04);
  p.rf=0.08+0.92*Math.pow(Math.random(),0.7);
  p.a=Math.random()*TAU;
}

function build(){
  var n,i,p;
  n=cl(Math.round(W*H/5200)+90,120,340);
  parts.length=0;
  for(i=0;i<n;i++){
    p={sh:undefined,vt:rn(0.05,0.13),spd:rn(0.7,1.36),tone:Math.random(),sz:rn(0.5,1.6),t:0,rf:0,a:0,z:0,x:0,y:0,r:0};
    respawn(p,true);
    parts.push(p);
  }
  n=cl(Math.round(W*H/42000)+18,22,54);
  chunks.length=0;
  for(i=0;i<n;i++){
    p={sh:(Math.random()*6 | 0),vt:rn(0.07,0.16),spd:rn(0.75,1.3),rot:rn(0,TAU),rotv:rn(-4.2,4.2),tone:Math.random(),sz:rn(0.6,1.7),t:0,rf:0,a:0,z:0,x:0,y:0,r:0};
    respawn(p,true);
    chunks.push(p);
  }
  dust.length=0;
  n=cl(Math.round(W*H/24000)+40,52,140);
  for(i=0;i<n;i++){
    dust.push({x:rn(0,W),y:rn(horizon-S*0.5,H),s:rn(0.03,0.15)*S,r:rn(0.35,1),v:rn(5,26),ph:rn(0,TAU),a:rn(0.03,0.11)});
  }
  streaks.length=0;
  n=cl(Math.round(W*H/26000)+24,30,64);
  for(i=0;i<n;i++){
    streaks.push({a:rn(0,TAU),l:0,sp:rn(0.28,0.62),rad:rn(0.55,1.25),w:rn(0.8,2.4),tone:Math.random(),on:Math.random()<0.7});
  }
  cloud.length=0;
  n=cl(Math.round(W*H/20000)+34,44,96);
  for(i=0;i<n;i++){
    p={};
    p.a=rn(0,TAU);
    p.s=rn(0.1,0.52);
    p.rr=rn(0.5,1.35);
    p.up=rn(0,1);
    p.ph=rn(0,TAU);
    p.sp=rn(0.5,1.5);
    p.tone=Math.random();
    p.on=Math.random()<0.82;
    cloud.push(p);
  }
  haze.length=0;
  for(i=0;i<14;i++){
    haze.push({x:rn(0,W),y:rn(0,H),s:rn(0.12,0.4)*S,a:rn(0.015,0.05),v:rn(8,30),front:i>10,ph:rn(0,TAU)});
  }
  marks.length=0;
  for(i=0;i<30;i++){
    marks.push({x:rn(-0.1,1.05)*W,y:horizon+Math.pow(rn(0,1),1.5)*(H-horizon)+rn(-2,2),l:W*(0.015+rn(0,0.06)),dy:rn(-2,2),a:rn(0.03,0.1),w:rn(0.8,2.2)});
  }
}

function resize(){
  var nw=Math.max(1,window.innerWidth),nh=Math.max(1,window.innerHeight);
  var nd=Math.min(2,window.devicePixelRatio||1);
  if(nw*nh>1500000)nd=Math.min(nd,1.4);
  if(nw===W&&nh===H&&nd===DPR)return false;
  W=nw;H=nh;DPR=nd;
  S=Math.min(W,H);
  cv.width=Math.round(W*DPR);
  cv.height=Math.round(H*DPR);
  cv.style.width=W+'px';
  cv.style.height=H+'px';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.lineJoin='round';
  ctx.lineCap='round';
  topY=-0.24*H;
  var port=H>W*1.15;
  baseY=port?0.77*H:0.815*H;
  contact=baseY-S*0.005;
  horizon=baseY+S*0.012;
  rMax=port?cl(S*0.24,W*0.29,S*0.34):cl(S*0.34,W*0.2,S*0.4);
  rMin=Math.max(5,S*(port?0.03:0.036));
  ANG=rMax*2.5;
  lean=rMax*0.95;
  skirt=rMax*(port?2.1:1.85);
  if(!seeded){
    seeded=true;
    warm=mkSprite([[0,'rgba(238,224,192,1)'],[0.2,'rgba(206,190,152,.6)'],[0.52,'rgba(164,146,110,.18)'],[1,'rgba(120,106,80,0)']]);
    dim=mkSprite([[0,'rgba(150,142,124,.75)'],[0.28,'rgba(112,106,94,.3)'],[0.66,'rgba(78,74,66,.07)'],[1,'rgba(60,58,52,0)']]);
    dark=mkSprite([[0,'rgba(20,22,30,.96)'],[0.32,'rgba(17,19,27,.62)'],[0.7,'rgba(13,15,23,.15)'],[1,'rgba(10,12,20,0)']],176);
    glow=mkSprite([[0,'rgba(226,238,255,.9)'],[0.16,'rgba(168,200,248,.38)'],[0.5,'rgba(120,156,214,.11)'],[1,'rgba(90,120,180,0)']],176);
    shapes=[mkChunk(5),mkChunk(6),mkChunk(7),mkChunk(4),mkChunk(6),mkChunk(5)];
  }
  var i;
  for(i=0;i<legPh.length;i++)legPh[i]=Math.random();
  build();
  return true;
}

function makeBolt(){
  var pts=[],n=13,i,t;
  for(i=0;i<=n;i++){
    t=i/n;
    pts.push({x:CX(t*0.9)+rn(-1,1)*rMax*0.3*(1-t*0.4),y:topY+(baseY-topY)*Math.pow(t,0.95)});
  }
  for(var pass=0;pass<2;pass++){
    var out=[pts[0]];
    for(i=1;i<pts.length;i++){
      var a=pts[i-1],b=pts[i];
      out.push({x:(a.x+b)*0.5+rn(-1,1)*rMax*0.07,y:(a.y+b)*0.5+rn(-1,1)*rMax*0.05});
      out.push(b);
    }
    pts=out;
  }
  var br=[],k;
  for(k=0;k<3;k++){
    var idx=(Math.random()*(pts.length-6 | 0));
    var st=pts[idx],seg=[st],cx=st.x,cy=st.y,m;
    for(m=0;m<4;m++){
      cx+=rn(-1,1)*rMax*0.36;
      cy+=rn(-1,1)*rMax*0.22;
      seg.push({x:cx,y:cy});
    }
    br.push(seg);
  }
  return {main:pts,br:br};
}

function fireBolt(){
  boltPts=makeBolt();
  seq=[];
  var t=0,i,n=3+((Math.random()*3 | 0));
  for(i=0;i<n;i++){
    var d=rn(0.05,0.13);
    seq.push({a:t,b:t+d,v:rn(0.4,1)});
    t+=d+rn(0.02,0.11);
  }
  boltAge=0;
  boltOn=true;
  boltA=0;
  boltWait=rn(3.4,6.4);
}

function step(dt){
  time+=dt;
  var i,p,r;
  for(i=0;i<parts.length;i++){
    p=parts[i];
    p.t-=p.vt*dt*(1+p.rf*0.4);
    if(p.t<-0.09)respawn(p,false);
    r=R(p.t)*(0.08+0.92*p.rf);
    p.r=r;
    p.a+=(ANG/(r+rMin*0.35))*p.spd*dt;
    p.z=Math.sin(p.a);
    p.x=CX(p.t)+Math.cos(p.a)*r;
    p.y=CY(p.t)+p.z*r*0.26;
  }
  for(i=0;i<chunks.length;i++){
    p=chunks[i];
    p.t-=p.vt*dt*(1+p.rf*0.4);
    if(p.t<-0.09)respawn(p,false);
    r=R(p.t)*(0.1+0.9*p.rf);
    p.r=r;
    p.a+=(ANG/(r+rMin*0.35))*p.spd*dt;
    p.rot+=p.rotv*dt;
    p.z=Math.sin(p.a);
    p.x=CX(p.t)+Math.cos(p.a)*r;
    p.y=CY(p.t)+p.z*r*0.28;
  }
  for(i=0;i<dust.length;i++){
    p=dust[i];
    p.x+=p.v*dt;
    p.y-=p.r*13*dt;
    if(p.x>W+p.s)p.x=-p.s;
    if(p.y<horizon-S*0.22){p.y=H+p.s;p.x=rn(0,W);}
  }
  for(i=0;i<haze.length;i++){
    p=haze[i];
    p.x+=p.v*dt;
    p.y+=Math.sin(time*0.4+p.ph)*4*dt;
    if(p.x>W+S*0.5)p.x=-S*0.5;
  }
  for(i=0;i<streaks.length;i++){
    p=streaks[i];
    p.l+=p.sp*dt*0.34;
    if(p.l>1.2){
      p.l=-0.16;
      p.a=rn(0,TAU);
      p.rad=rn(0.5,1.3);
      p.on=Math.random()<0.72;
    }
    p.a+=(0.5+p.rad*0.5)*dt*0.8;
  }
  for(i=0;i<cloud.length;i++){
    p=cloud[i];
    p.a+=(ANG/(skirt*p.rr*0.6+1))*p.sp*dt;
    p.up+=dt*(0.1+p.sp*0.08);
    if(p.up>1.4)p.up=-0.35;
  }
  boltWait-=dt;
  if(boltWait<=0&&!mq.matches)fireBolt();
  if(boltOn){
    boltAge+=dt;
    var av=0;
    for(i=0;i<seq.length;i++){
      var s=seq[i];
      if(boltAge>=s.a&&boltAge<s.b&&s.v>av)av=s.v;
    }
    boltA=av;
    if(boltAge>seq[seq.length-1].b+0.16){
      boltOn=false;
      boltA=0;
      boltPts=null;
    }
  }else boltA=0;
  flash*=Math.exp(-dt*5.4);
  after*=Math.exp(-dt*0.5);
  if(boltA>0){
    flash=Math.max(flash,boltA*0.7);
    after=Math.max(after,boltA);
  }
  if(ptr.act)after=Math.max(after,0.16);
}

function bandPath(t0,t1,k,ox,oy){
  ox=ox||0;oy=oy||0;
  ctx.beginPath();
  ctx.moveTo(CX(t0)-R(t0)*k+ox,CY(t0)+oy);
  for(var t=t0;t<t1;t+=0.018)ctx.lineTo(CX(t)-R(t)*k+ox,CY(t)+oy);
  for(t=t1;t>t0;t-=0.018)ctx.lineTo(CX(t)+R(t)*k+ox,CY(t)+oy);
  ctx.closePath();
}

function drawWall(){
  var i;
  for(i=0;i<10;i++){
    var x=CX(0.03)+Math.sin(time*0.16+i*1.9)*rMax*0.55;
    var y=topY+H*0.055+Math.cos(time*0.13+i*2.3)*H*0.016+i*H*0.007;
    var s=rMax*(0.95+i*0.16);
    ctx.drawImage(dark,x-s*0.5,y-s*0.32,s,s*0.64);
  }
}

function drawGround(){
  var g=ctx.createLinearGradient(0,horizon-S*0.06,0,H);
  g.addColorStop(0,'rgba(26,25,28,0)');
  g.addColorStop(0.12,'rgba(24,23,25,0.8)');
  g.addColorStop(0.45,'rgba(15,15,18,0.95)');
  g.addColorStop(1,'rgba(5,6,9,1)');
  ctx.fillStyle=g;
  ctx.fillRect(0,horizon-S*0.06,W,H-horizon+S*0.06);
  var lg=ctx.createLinearGradient(0,horizon-S*0.02,0,horizon+S*0.34);
  lg.addColorStop(0,'rgba(158,130,88,0.2)');
  lg.addColorStop(1,'rgba(120,100,70,0)');
  ctx.globalCompositeOperation='lighter';
  ctx.fillStyle=lg;
  ctx.fillRect(0,horizon-S*0.02,W,S*0.34);
  ctx.globalCompositeOperation='source-over';
  var i,m;
  for(i=0;i<marks.length;i++){
    m=marks[i];
    ctx.strokeStyle='rgba(112,102,84,'+m.a.toFixed(3)+')';
    ctx.lineWidth=m.w;
    ctx.beginPath();
    ctx.moveTo(m.x,m.y);
    ctx.lineTo(m.x+m.l,m.y+m.dy);
    ctx.stroke();
  }
  var bx=CX(1),by=contact;
  var sg=ctx.createRadialGradient(bx,by,0,bx,by,skirt*1.15);
  sg.addColorStop(0,'rgba(8,7,7,0.62)');
  sg.addColorStop(0.42,'rgba(12,11,10,0.3)');
  sg.addColorStop(1,'rgba(14,13,12,0)');
  ctx.fillStyle=sg;
  ctx.beginPath();
  ctx.ellipse(bx,by+S*0.014,skirt*1.1,skirt*0.2,0,0,TAU);
  ctx.fill();
}

function drawFunnel(){
  var i,j,t,k,g;
  g=ctx.createLinearGradient(0,topY,0,baseY);
  g.addColorStop(0,'rgba(62,68,94,0.55)');
  g.addColorStop(0.24,'rgba(88,92,110,0.72)');
  g.addColorStop(0.58,'rgba(118,114,102,0.85)');
  g.addColorStop(0.86,'rgba(142,128,102,0.93)');
  g.addColorStop(1,'rgba(160,144,114,0.96)');
  var k;
  var tw=0.055+0.02*Math.sin(time*0.9);
  bandPath(0.02,1,0.9,0,0);
  ctx.strokeStyle='rgba(146,148,158,0.03)';
  ctx.lineWidth=rMax*(0.52+tw);
  ctx.stroke();
  ctx.strokeStyle='rgba(152,150,142,0.034)';
  ctx.lineWidth=rMax*0.24;
  ctx.stroke();
  ctx.strokeStyle='rgba(158,152,138,0.04)';
  ctx.lineWidth=rMax*0.09;
  ctx.stroke();
  for(k=0;k<14;k++){
    bandPath(0.02,1,0.9-k*0.022,Math.sin(k*2.4+time*0.4)*rMax*0.012,Math.sin(k*1.7-time*0.33)*rMax*0.005);
    ctx.fillStyle=g;
    ctx.globalAlpha=0.28;
    ctx.fill();
  }
  ctx.globalAlpha=1;
  bandPath(0.06,0.99,0.42,0,0);
  var cd=ctx.createLinearGradient(0,topY,0,baseY);
  cd.addColorStop(0,'rgba(24,26,38,0.36)');
  cd.addColorStop(0.55,'rgba(32,32,38,0.3)');
  cd.addColorStop(1,'rgba(48,44,40,0.16)');
  ctx.fillStyle=cd;
  ctx.fill();
  var lp2=time*0.95;
  for(i=0;i<76;i++){
    t=0.03+i*0.0126+Math.sin(i*3.3)*0.011;
    var r=R(t);
    var a0=lp2*(0.36+t*1.2)+t*3.1+legPh[i%80]*TAU;
    var span=0.3+0.78*legPh[(i*7+3)%80];
    ctx.lineWidth=Math.max(0.7,r*0.026);
    ctx.strokeStyle='rgba(206,214,238,'+(0.02+0.05*(1-t*0.7)).toFixed(3)+')';
    ctx.beginPath();
    ctx.ellipse(CX(t),CY(t),r*0.96,r*0.24,0,a0,a0+span);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<22;i++){
    t=0.1+i*0.041;
    var r2=R(t);
    var a1=lp2*(0.36+t*1.2)+t*3.1+legPh[(i*3)%80]*TAU;
    ctx.lineWidth=Math.max(0.6,r2*0.018);
    ctx.strokeStyle='rgba(218,226,250,'+(0.028+0.038*(1-t)).toFixed(3)+')';
    ctx.beginPath();
    ctx.ellipse(CX(t),CY(t),r2*0.97,r2*0.24,0,a1+0.3,a1+1.0);
    ctx.stroke();
  }
  for(i=0;i<5;i++){
    var sgn=i&1?1:-1;
    var turn=1.6+i*0.26;
    ctx.beginPath();
    for(j=0;j<=30;j++){
      var tt=0.05+j/30*0.93;
      var rr=R(tt)*0.86;
      var aa=sgn*time*0.48+tt*TAU*turn+legPh[(i*13)%80]*TAU;
      var px2=CX(tt)+Math.cos(aa)*rr;
      var py2=CY(tt)+Math.sin(aa)*rr*0.25;
      if(j)ctx.lineTo(px2,py2);else ctx.moveTo(px2,py2);
    }
    ctx.strokeStyle='rgba(190,188,168,0.03)';
    ctx.lineWidth=Math.max(0.6,rMax*0.012);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
  ctx.lineWidth=Math.max(1,rMax*0.014);
  ctx.strokeStyle='rgba(220,228,250,0.1)';
  ctx.beginPath();
  for(i=0;i<=40;i++){
    t=i/40*0.985;
    if(i)ctx.lineTo(CX(t)+R(t)*0.9,CY(t));else ctx.moveTo(CX(t)+R(t)*0.9,CY(t));
  }
  ctx.stroke();
  ctx.strokeStyle='rgba(6,8,16,0.22)';
  ctx.beginPath();
  for(i=0;i<=40;i++){
    t=i/40*0.985;
    if(i)ctx.lineTo(CX(t)-R(t)*0.9,CY(t));else ctx.moveTo(CX(t)-R(t)*0.9,CY(t));
  }
  ctx.stroke();
}

function drawCloud(){
  var i,p,bx=CX(1),by=contact,s;
  for(i=0;i<7;i++){
    var a=legPh[(i*11)%80]*TAU+time*0.24;
    var rr=skirt*(0.3+0.42*legPh[(i*5)%80]);
    s=skirt*(0.85+0.5*legPh[(i*3)%80]);
    ctx.globalAlpha=0.1+0.07*legPh[(i*7)%80];
    ctx.drawImage(warm,bx+Math.cos(a)*rr*1.15-s*0.5,by+Math.sin(a)*rr*0.26-s*0.42,s,s*0.84);
  }
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<cloud.length;i++){
    p=cloud[i];
    if(!p.on)continue;
    var up=cl(p.up,0,1.3);
    var rr2=skirt*p.rr*(0.55+0.55*up);
    var yy=by-up*S*0.15+Math.sin(time*0.6+p.ph)*S*0.014;
    var xx=bx+Math.cos(p.a)*rr2*0.94;
    s=S*p.s*(0.75+0.55*up);
    ctx.globalAlpha=(0.06+0.12*p.tone)*cl(1-Math.abs(up-0.45)*1.1,0,1)*cl(up*4,0,1);
    ctx.drawImage(warm,xx-s*0.5,yy-s*0.5,s,s*0.82);
  }
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
  var g=ctx.createRadialGradient(bx,by,0,bx,by,skirt*1.15);
  g.addColorStop(0,'rgba(186,158,110,0.3)');
  g.addColorStop(0.36,'rgba(138,116,80,0.17)');
  g.addColorStop(1,'rgba(70,62,44,0)');
  ctx.fillStyle=g;
  ctx.beginPath();
  ctx.ellipse(bx,by,skirt*1.15,skirt*0.34,0,0,TAU);
  ctx.fill();
  var bg2=ctx.createLinearGradient(0,by-S*0.14,0,by+S*0.05);
  bg2.addColorStop(0,'rgba(150,130,96,0)');
  bg2.addColorStop(0.62,'rgba(150,130,96,0.34)');
  bg2.addColorStop(1,'rgba(120,104,78,0.5)');
  ctx.fillStyle=bg2;
  ctx.beginPath();
  ctx.moveTo(bx-rMax*0.66,by-S*0.14);
  ctx.lineTo(bx+rMax*0.66,by-S*0.14);
  ctx.lineTo(bx+rMax*0.9,by+S*0.05);
  ctx.lineTo(bx-rMax*0.9,by+S*0.05);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<3;i++){
    var t2=time*1.25+i*2.1;
    ctx.strokeStyle='rgba(198,178,134,'+(0.05+0.035*Math.sin(t2)).toFixed(3)+')';
    ctx.lineWidth=Math.max(0.7,rMax*0.02);
    ctx.beginPath();
    ctx.ellipse(bx,by,skirt*(0.62+i*0.2),skirt*(0.62+i*0.2)*0.34,0,t2%TAU,(t2%TAU)+2.2);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
}

function drawDust(){
  var i,p,s;
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<dust.length;i++){
    p=dust[i];
    s=p.s*2;
    ctx.globalAlpha=p.a*(0.6+0.4*Math.sin(time*0.7+p.ph));
    ctx.drawImage(warm,p.x-s*0.5,p.y-s*0.5,s,s);
  }
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
}

function drawStreaks(){
  var i,p;
  ctx.globalCompositeOperation='lighter';
  for(i=0;i<streaks.length;i++){
    p=streaks[i];
    if(!p.on)continue;
    var l0=p.l,l1=p.l-0.05;
    if(l0<0)continue;
    var f0=0.24+l0*1.05*p.rad, f1=0.24+l1*1.05*p.rad;
    var x0=CX(1)+Math.cos(p.a)*S*f0*1.1;
    var y0=contact+Math.sin(p.a)*S*f0*0.44;
    var x1=CX(1)+Math.cos(p.a)*S*f1*1.1;
    var y1=contact+Math.sin(p.a)*S*f1*0.44;
    var al=0.1+0.16*p.tone;
    al*=cl((l0+0.16)*3,0,1)*cl((1.2-l0)*2.2,0,1);
    if(al<0.01)continue;
    ctx.strokeStyle='rgba(214,222,240,'+al.toFixed(3)+')';
    ctx.lineWidth=p.w;
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    ctx.lineTo(x1,y1);
    ctx.stroke();
  }
  ctx.globalCompositeOperation='source-over';
}

function drawBolt(){
  if(!boltOn||boltA<=0.01||!boltPts)return;
  var i,j;
  var main=boltPts.main,br=boltPts.br;
  ctx.globalCompositeOperation='lighter';
  ctx.lineJoin='round';
  ctx.lineCap='round';
  var passes=[[20,0.05],[10,0.1],[3.8,0.3],[1.6,0.92]];
  for(i=0;i<passes.length;i++){
    ctx.lineWidth=passes[i][0];
    ctx.strokeStyle='rgba('+(i<2?'150,186,244':'230,242,255')+','+(passes[i][1]*boltA).toFixed(3)+')';
    ctx.beginPath();
    for(j=0;j<main.length;j++){
      if(j)ctx.lineTo(main[j].x,main[j].y);else ctx.moveTo(main[j].x,main[j].y);
    }
    ctx.stroke();
    for(var branch of br){
      ctx.beginPath();
      for(j=0;j<branch.length;j++){
        if(j)ctx.lineTo(branch[j].x,branch[j].y);else ctx.moveTo(branch[j].x,branch[j].y);
      }
      ctx.stroke();
    }
  }
  var gx=CX(0.5),gy=CY(0.5),gr=rMax*1.7;
  ctx.globalAlpha=0.85;
  ctx.drawImage(glow,gx-gr*0.5,gy-gr*0.5,gr,gr);
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
}

function render(){
  var i,z,p,s,n,i2;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation='source-over';
  ctx.clearRect(0,0,W,H);
  for(i=0;i<haze.length;i++){
    if(haze[i].front)continue;
    z=haze[i];
    ctx.globalAlpha=z.a;
    s=z.s*2;
    ctx.drawImage(dim,z.x-s*0.5,z.y-s*0.5,s,s);
  }
  ctx.globalAlpha=1;
  drawGround();
  drawWall();
  drawFunnel();
  n=parts.length+chunks.length;
  orderBuf.length=n;
  for(i2=0;i2<parts.length;i2++)orderBuf[i2]=parts[i2];
  for(i2=0;i2<chunks.length;i2++)orderBuf[parts.length+i2]=chunks[i2];
  orderBuf.sort(byZ);
  for(i=0;i<n;i++){
    p=orderBuf[i];
    if(p.sh===undefined){
      s=p.sz*Math.min(rMax*0.05,10)*(0.4+p.rf*0.95);
      var dep=0.3+0.7*Math.abs(p.z);
      ctx.globalCompositeOperation='lighter';
      ctx.globalAlpha=cl(0.05+0.18*p.tone*dep,0,0.36)*(0.4+p.rf*0.7);
      ctx.drawImage(warm,p.x-s*0.5,p.y-s*0.5,s,s);
      ctx.globalCompositeOperation='source-over';
    }else{
      var sc2=p.sz*Math.min(rMax*0.07,4.6)*(0.4+p.rf*0.9);
      var sh=shapes[p.sh];
      var lit=0.25+0.75*cl(p.z*0.5+0.5,0,1);
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot);
      ctx.beginPath();
      for(var q=0;q<sh.length;q++){
        if(q)ctx.lineTo(sh[q][0]*sc2,sh[q][1]*sc2*0.78);else ctx.moveTo(sh[q][0]*sc2,sh[q][1]*sc2*0.78);
      }
      ctx.closePath();
      ctx.globalAlpha=0.55+0.4*lit;
      ctx.fillStyle='rgb('+((16+p.tone*16 | 0))+','+((17+p.tone*15 | 0))+','+((22+p.tone*17 | 0))+')';
      ctx.fill();
      ctx.globalAlpha=(0.06+0.22*lit)*cl(p.z+0.3,0,1);
      ctx.strokeStyle='rgba(186,204,238,0.9)';
      ctx.lineWidth=Math.max(0.5,sc2*0.12);
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.globalAlpha=1;
  drawCloud();
  drawDust();
  drawStreaks();
  for(i=0;i<haze.length;i++){
    if(!haze[i].front)continue;
    z=haze[i];
    ctx.globalAlpha=z.a*0.8;
    s=z.s*2.6;
    ctx.drawImage(dim,z.x-s*0.5,z.y-s*0.5,s,s);
  }
  ctx.globalAlpha=1;
  if(after>0.01){
    var gx=CX(0.46),gy=CY(0.46),gr=rMax*2.2*cl(after,0,1);
    ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=cl(after*0.42,0,0.42);
    ctx.drawImage(glow,gx-gr*0.5,gy-gr*0.5,gr,gr);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-over';
  }
  drawBolt();
  if(flash>0.004){
    var fg=ctx.createLinearGradient(0,0,0,H);
    fg.addColorStop(0,'rgba(150,178,226,'+(flash*0.12).toFixed(3)+')');
    fg.addColorStop(0.5,'rgba(120,146,196,'+(flash*0.06).toFixed(3)+')');
    fg.addColorStop(1,'rgba(90,112,158,0)');
    ctx.fillStyle=fg;
    ctx.fillRect(0,0,W,H);
  }
  var v=Math.round(flash*1000)/1000;
  if(v!==lastFlash){
    lastFlash=v;
    fl.style.opacity=v;
  }
}

function byZ(a,b){return a.z-b.z;}

function hud(){
  if(!hE)return;
  hE.textContent='EF'+(2+((time*0.07 | 0)%3));
  hW.textContent=(168+Math.round(46*(0.5+0.5*Math.sin(time*0.23))+(after>0.1?60:0)))+' km/h';
  hM.textContent=(0.82+0.16*Math.sin(time*0.19)+after*0.2).toFixed(2);
  hD.textContent=(parts.length+chunks.length)*3;
}

function frame(ts){
  if(!last)last=ts;
  var dt=(ts-last)/1000;
  last=ts;
  if(dt>0.06)dt=0.06;
  if(dt<=0)dt=1/60;
  step(dt);
  render();
  hudT-=dt;
  if(hudT<=0){hudT=0.24;hud();}
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
  for(var i=0;i<120;i++)step(1/60);
  boltOn=false;
  boltA=0;
  boltPts=null;
  after=0.34;
  flash=0.2;
  render();
  hud();
  var v=Math.round(flash*1000)/1000;
  if(v!==lastFlash){
    lastFlash=v;
    fl.style.opacity=v;
  }
}

window.addEventListener('resize',function(){
  if(!resize())return;
  if(mq.matches)still();
  else{render();hud();}
},{passive:true});

window.addEventListener('pointermove',function(ev){
  ptr.x=ev.clientX;ptr.y=ev.clientY;ptr.act=true;
},{passive:true});

window.addEventListener('pointerleave',function(){ptr.act=false;});
window.addEventListener('blur',function(){ptr.act=false;});

document.addEventListener('visibilitychange',function(){
  if(document.hidden)stop();else start();
});

function onMQ(){
  if(mq.matches){stop();still();}
  else{boltWait=3.55;flash=0;after=0;start();}
}

if(mq.addEventListener)mq.addEventListener('change',onMQ);
else if(mq.addListener)mq.addListener(onMQ);

resize();
if(mq.matches)still();
else{render();hud();start();}
})();
