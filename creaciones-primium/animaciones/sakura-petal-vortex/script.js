(function(){
var scene=document.getElementById('scene');
var field=document.getElementById('field');
var ring=scene.querySelector('.sakura__ring');
var mq=window.matchMedia('(prefers-reduced-motion: reduce)');

var TAU=Math.PI*2;
var HAZE=[
  ['#fff3f8','#ffd2e3','#f0a0c0'],
  ['#fff7fa','#ffdde9','#f4aec9'],
  ['#ffeef4','#ffc7dc','#eb90b5'],
  ['#fff1f6','#ffd4e4','#f2a2c1'],
  ['#fff6fa','#ffdcea','#f6b2cd']
];
var BOLD=[
  ['#fff8fb','#ffa9c8','#cf3f78'],
  ['#fff3f8','#ff9cc0','#b02c66'],
  ['#fffbfc','#ffc2d8','#dc5b8e'],
  ['#ffe7f0','#f87cab','#8f2257'],
  ['#ffffff','#ffbdd5','#c23a76'],
  ['#fdecf3','#ee6da0','#7a1b4b'],
  ['#fff5f9','#ffa3c3','#a82a5e'],
  ['#ffeaf2','#ffb8d2','#c34b81']
];
var TIER=[
  {share:.36,pal:HAZE,w:[5,13],d:[19,32],sw:[5.4,9.2],sa:[.6,2.2],a:[.42,.64],sk:[.1,.24]},
  {share:.4,pal:BOLD,w:[14,32],d:[12,21],sw:[3.6,6.2],sa:[1.4,4.2],a:[.74,.92],sk:[.24,.5]},
  {share:.24,pal:BOLD,w:[36,86],d:[7,13.5],sw:[2.6,4.6],sa:[2.2,6.4],a:[.9,1],sk:[.6,.95]}
];
var pets=[],raf=0,last=0,time=0,startTime=0;
var W=1,H=1,VR=180,scale=1;
var ptr={x:-1e4,y:-1e4,age:9,act:false};
var strength=0,ringOn=false;

function cl(v,a,b){
  if(v<a)return a;
  if(v>b)return b;
  return v;
}
function rn(a,b){return a+Math.random()*(b-a);}
function setP(el,k,v){el.style.setProperty(k,v);}

function pick(){
  var r=Math.random(),a=0,i;
  for(i=0;i<TIER.length;i++){a+=TIER[i].share;if(r<a)return i;}
  return 1;
}

function build(){
  var n=cl(Math.round(W*H/11000)+20,48,132),i;
  field.textContent='';
  pets.length=0;
  scale=cl(Math.min(W/1180,H/760),.66,1.5);
  for(i=0;i<n;i++){
    var t=TIER[pick()],p={};
    p.x0=rn(-8,104);
    p.xd=rn(-19,19);
    p.d=rn(t.d[0],t.d[1]);
    p.ph=rn(0,p.d);
    p.sa=rn(t.sa[0],t.sa[1]);
    p.sw=rn(t.sw[0],t.sw[1]);
    p.swp=Math.random();
    p.t=rn(3.6,9.5);
    p.w=rn(t.w[0],t.w[1])*scale;
    p.a=rn(t.a[0],t.a[1]);
    p.streak=rn(t.sk[0],t.sk[1])*p.a;
    p.c=t.pal[(Math.random()*t.pal.length | 0)];
    p.rate=Math.random();
    p.wob=rn(0,TAU);
    p.k=0;
    p.on=0;
    var el=document.createElement('div');
    el.className='petal';
    var f=document.createElement('div');
    f.className='fall';
    var s=document.createElement('div');
    s.className='sway';
    var g=document.createElement('div');
    g.className='tilt';
    var b=document.createElement('div');
    b.className=p.w>t.w[1]*scale*.84?'spin spin--soft':'spin';
    g.appendChild(b);
    s.appendChild(g);
    f.appendChild(s);
    el.appendChild(f);
    field.appendChild(el);
    p.el=el;
    setP(el,'--x0',p.x0.toFixed(2)+'vw');
    setP(el,'--xd',p.xd.toFixed(2)+'vw');
    setP(el,'--d',p.d.toFixed(2)+'s');
    setP(el,'--dl',(-p.ph).toFixed(2)+'s');
    setP(el,'--sa',p.sa.toFixed(2)+'vw');
    setP(el,'--sw',p.sw.toFixed(2)+'s');
    setP(el,'--swd',(-p.sw*p.swp).toFixed(2)+'s');
    setP(el,'--w',p.w.toFixed(1)+'px');
    setP(el,'--a',p.a.toFixed(3));
    setP(el,'--streak',p.streak.toFixed(3));
    setP(el,'--t',p.t.toFixed(2)+'s');
    setP(el,'--c1',p.c[0]);
    setP(el,'--c2',p.c[1]);
    setP(el,'--c3',p.c[2]);
    setP(el,'--y0',rn(4,96).toFixed(1)+'vh');
    setP(el,'--r0',rn(0,360).toFixed(1)+'deg');
    setP(el,'--ry0',rn(-74,74).toFixed(1)+'deg');
    pets.push(p);
  }
  startTime=performance.now();
}

function measure(){
  W=window.innerWidth;
  H=window.innerHeight;
  VR=cl(Math.min(W,H)*0.3,110,320);
  ring.style.setProperty('--d',(VR*0.92).toFixed(0)+'px');
  setP(ring,'--px',(W*0.5).toFixed(0)+'px');
  setP(ring,'--py',(H*0.5).toFixed(0)+'px');
}

function clearAll(){
  var i;
  for(i=0;i<pets.length;i++){
    if(pets[i].on){
      setP(pets[i].el,'--wx','0px');
      setP(pets[i].el,'--wy','0px');
      setP(pets[i].el,'--wr','0deg');
      pets[i].on=0;
    }
    pets[i].k=0;
  }
  if(ringOn){
    setP(ring,'--vs','0');
    ringOn=false;
  }
}

function loop(ts){
  if(!last)last=ts;
  var dt=(ts-last)/1000;
  last=ts;
  if(dt>0.05)dt=0.05;
  if(dt<=0)dt=1/60;
  time+=dt;
  ptr.age+=dt;
  var tgt=(ptr.act&&ptr.age<0.14)?1:0;
  strength+=(tgt-strength)*Math.min(1,dt*4.6);
  if(strength<0.0015)strength=0;
  if(!ptr.act&&strength<=0){
    raf=0;
    clearAll();
    return;
  }
  var px=ptr.x,py=ptr.y,i,p;
  for(i=0;i<pets.length;i++){
    p=pets[i];
    var pr=(time+p.ph)%p.d/p.d;
    var x=(p.x0+p.xd*pr)*0.01*W;
    var y=(-16+132*pr)*0.01*H;
    x+=Math.sin(TAU*(time/p.sw+p.swp))*(p.sa*0.01*W);
    var k=0;
    if(strength>0.002){
      var dx=x-px,dy=y-py;
      var d=Math.hypot(dx, dy);
      if(d<VR){
        var f=1-d/VR;
        k=strength*f*f*(0.68+p.rate*0.64);
      }
    }
    p.k+=(k-p.k)*Math.min(1,dt*(3.4+p.rate*5.2));
    if(p.k<0.0015)p.k=0;
    if(p.k>0){
      var dx2=x-px,dy2=y-py;
      var d2=Math.hypot(dx2, dy2)||1;
      var tx=-dy2/d2,ty=dx2/d2;
      var sp=(84+p.rate*28)*p.k*(p.w>28?1.5:1);
      sp+=Math.sin(time*3.1+p.wob)*11*p.k;
      var pull=54*p.k;
      setP(p.el,'--wx',(tx*sp-dx2/d2*pull).toFixed(1)+'px');
      setP(p.el,'--wy',(ty*sp-dy2/d2*pull-32*p.k).toFixed(1)+'px');
      setP(p.el,'--wr',(p.k*(280+p.rate*340)).toFixed(1)+'deg');
      p.on=1;
    }else if(p.on){
      setP(p.el,'--wx','0px');
      setP(p.el,'--wy','0px');
      setP(p.el,'--wr','0deg');
      p.on=0;
    }
  }
  setP(ring,'--px',px.toFixed(0)+'px');
  setP(ring,'--py',py.toFixed(0)+'px');
  setP(ring,'--vs',(strength*0.92).toFixed(3));
  ringOn=true;
  raf=requestAnimationFrame(loop);
}

function kick(){
  if(mq.matches||raf)return;
  time=(performance.now()-startTime)/1000;
  last=0;
  raf=requestAnimationFrame(loop);
}

function halt(){
  if(!raf)return;
  cancelAnimationFrame(raf);
  raf=0;
  strength=0;
  clearAll();
}

function init(){
  measure();
  build();
  if(mq.matches){
    clearAll();
    return;
  }
  scene.addEventListener('pointermove',function(ev){
    ptr.x=ev.clientX;
    ptr.y=ev.clientY;
    ptr.age=0;
    ptr.act=true;
    kick();
  },{passive:true});
  scene.addEventListener('pointerdown',function(ev){
    ptr.x=ev.clientX;
    ptr.y=ev.clientY;
    ptr.age=0;
    ptr.act=true;
    strength=Math.max(strength,0.45);
    kick();
  },{passive:true});
  scene.addEventListener('pointerleave',function(){ptr.act=false;});
  window.addEventListener('blur',function(){ptr.act=false;});
  window.addEventListener('resize',function(){
    halt();
    measure();
    build();
  },{passive:true});
  document.addEventListener('visibilitychange',function(){
    if(document.hidden)halt();
  });
  if(mq.addEventListener)mq.addEventListener('change',function(){
    halt();
    if(mq.matches)clearAll();
  });
}

init();
})();
