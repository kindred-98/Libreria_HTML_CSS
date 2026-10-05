(function(){
  var back=document.getElementById('swarm');
  var front=document.getElementById('swarm-front');
  if(!back||!front) return;
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sprite(size,stops){
    var c=document.createElement('canvas');
    c.width=size;
    c.height=size;
    var g=c.getContext('2d');
    var grd=g.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    for(var stop of stops) grd.addColorStop(stop[0],stop[1]);
    g.fillStyle=grd;
    g.fillRect(0,0,size,size);
    return c;
  }

  var core=sprite(48,[
    [0,'rgba(255,252,238,1)'],[0.07,'rgba(255,246,210,.97)'],[0.17,'rgba(255,226,146,.84)'],
    [0.31,'rgba(252,198,90,.5)'],[0.52,'rgba(244,164,50,.2)'],[0.78,'rgba(232,136,30,.045)'],
    [1,'rgba(224,126,22,0)']]);
  var bloom=sprite(128,[
    [0,'rgba(255,238,176,.66)'],[0.11,'rgba(255,226,140,.38)'],[0.24,'rgba(254,204,104,.2)'],
    [0.4,'rgba(250,178,66,.095)'],[0.6,'rgba(242,152,42,.035)'],[0.82,'rgba(230,130,28,.008)'],
    [1,'rgba(222,124,22,0)']]);
  var disc=sprite(160,[
    [0,'rgba(255,246,206,.6)'],[0.15,'rgba(255,232,164,.48)'],[0.33,'rgba(252,206,112,.33)'],
    [0.53,'rgba(248,182,74,.19)'],[0.73,'rgba(240,162,50,.095)'],[0.89,'rgba(232,144,36,.03)'],
    [1,'rgba(226,132,26,0)']]);

  var layers=[{
    el:back,
    glowy:true,
    density:10500,
    min:60,
    max:170,
    sizeMin:6,
    sizeMax:15,
    alphaMin:.5,
    alphaMax:1,
    baseMin:.22,
    baseMax:.5,
    dutyMin:.2,
    dutyMax:.36,
    speedMin:.5,
    speedMax:1.15,
    periodMin:1.9,
    periodMax:5.4,
    top:.06,
    bot:.88
  },{
    el:front,
    glowy:false,
    density:1,
    min:7,
    max:10,
    sizeMin:56,
    sizeMax:148,
    alphaMin:.18,
    alphaMax:.36,
    baseMin:.28,
    baseMax:.55,
    dutyMin:.24,
    dutyMax:.42,
    speedMin:.34,
    speedMax:.7,
    periodMin:2.4,
    periodMax:6.2,
    top:.24,
    bot:.74
  }];

  var W=1;
  var H=1;
  var clock=0;
  var last=0;
  var handle=0;
  var live=false;
  var px=-99999;
  var py=-99999;
  var hasPointer=false;
  var r1=Math.random;
  var clamp=function(v,a,b){
    if(v<a)return a;
    if(v>b)return b;
    return v;
  };

  function rnd(a,b){return a+(b-a)*r1();}

  function build(layer){
    var n=layer.min;
    if(layer.density>1){
      n=Math.round((W*H)/layer.density);
      n=clamp(n,layer.min,layer.max);
    }
    layer.list=new Array(n);
    for(var i=0;i<n;i++){
      var z=layer.glowy?Math.pow(r1(),.72):.82+r1()*.18;
      var u=r1();
      layer.list[i]={
        x:r1()*W,
        y:H*(layer.top+(layer.bot-layer.top)*(.58*u+.42*u*u)),
        vx:rnd(-9,9),
        vy:rnd(-6,6),
        z:z,
        size:layer.sizeMin+(layer.sizeMax-layer.sizeMin)*Math.pow(z,1.3)*rnd(.76,1.26),
        alpha:layer.alphaMin+(layer.alphaMax-layer.alphaMin)*z*rnd(.72,1.28),
        base:layer.baseMin+(layer.baseMax-layer.baseMin)*rnd(.5,1.15),
        period:rnd(layer.periodMin,layer.periodMax),
        off:r1(),
        duty:rnd(layer.dutyMin,layer.dutyMax),
        dbl:r1()<.32?rnd(.5,.78):0,
        phase:r1()*6.2832,
        turn:rnd(.16,.52),
        force:rnd(4,13),
        top:layer.top,
        bot:layer.bot,
        drift:rnd(layer.speedMin,layer.speedMax)
      };
    }
  }

  function blink(f){
    var c=(clock/f.period+f.off)%1;
    var d=f.duty,v=0,u;
    if(c<d){
      u=c/d;
      if(u<.16)v=u/.16;
      else v=Math.pow(1-(u-.16)/.84,2.5);
    }
    if(f.dbl>0){
      var d2=d*f.dbl;
      if(c>=d&&c<d+d2){
        u=(c-d)/d2;
        if(u<.18)v=Math.max(v,u/.18);
        else v=Math.max(v,Math.pow(1-(u-.18)/.82,2.9)*.68);
      }
    }
    return v;
  }

  function move(f,dt){
    var a=f.phase+clock*f.turn*f.drift;
    f.vx+=(Math.sin(a)*1.2+Math.sin(clock*.43+f.phase*2.7)*.6)*f.force*dt;
    f.vy+=(Math.cos(a*.77)*.85+Math.cos(clock*.29+f.phase*1.3)*.55)*f.force*.6*dt;
    if(hasPointer){
      var dx=px-f.x;
      var dy=py-f.y;
      var d2=dx*dx+dy*dy;
      if(d2<125000&&d2>4){
        var d=Math.sqrt(d2);
        var pull=(1-d/354)*(0.35+f.z*1.2)*f.force*.6;
        f.vx+=dx/d*pull*dt;
        f.vy+=dy/d*pull*dt;
      }
    }
    f.vx*=.981;
    f.vy*=.981;
    var sp=Math.hypot(f.vx, f.vy);
    var top=H*f.top;
    var bot=H*f.bot;
    var m=f.z*20+16;
    if(f.x<m) f.vx+=(m-f.x)*9*dt;
    else if(f.x>W-m) f.vx-=(f.x-(W-m))*9*dt;
    if(f.y<top) f.vy+=(top-f.y)*9*dt;
    else if(f.y>bot) f.vy-=(f.y-bot)*9*dt;
    var cap=6+f.z*26;
    if(sp>cap){
      var k=cap/sp;
      f.vx*=k;
      f.vy*=k;
    }
    f.x+=f.vx*dt;
    f.y+=f.vy*dt;
  }

  function render(layer){
    var g=layer.g;
    var list=layer.list;
    g.clearRect(0,0,W,H);
    g.globalCompositeOperation='lighter';
    for(var f of list){
      var p=blink(f);
      var a=f.alpha*(f.base+p*(1-f.base*1.06));
      if(a<=.012) continue;
      if(a>1)a=1;
      if(!layer.glowy){
        var ds=f.size*(.9+.16*p);
        g.globalAlpha=a;
        g.drawImage(disc,f.x-ds*.5,f.y-ds*.5,ds,ds);
        if(p>.14){
          var c2=ds*(.05+.028*p);
          g.globalAlpha=Math.min(1,a*p*1.3);
          g.drawImage(core,f.x-c2*.5,f.y-c2*.5,c2,c2);
        }
        continue;
      }
      var s=f.size*(.84+.3*p);
      var bl=s*(3.8+3.4*p);
      g.globalAlpha=Math.min(1,a*.92);
      g.drawImage(bloom,f.x-bl*.5,f.y-bl*.5,bl,bl);
      g.globalAlpha=a;
      g.drawImage(core,f.x-s*.5,f.y-s*.5,s,s);
      if(p>.3){
        var sp=s*(.5+.16*p);
        g.globalAlpha=Math.min(1,a*(1+p*.5));
        g.drawImage(core,f.x-sp*.5,f.y-sp*.5,sp,sp);
      }
    }
    g.globalAlpha=1;
    g.globalCompositeOperation='source-over';
  }

  function measure(){
    var rect=layers[0].el.getBoundingClientRect();
    W=Math.max(1,Math.round(rect.width));
    H=Math.max(1,Math.round(rect.height));
    var dpr=Math.min(2,window.devicePixelRatio||1);
    for(var L of layers){
      L.el.width=Math.round(W*dpr);
      L.el.height=Math.round(H*dpr);
      L.g=L.el.getContext('2d');
      L.g.setTransform(dpr,0,0,dpr,0,0);
    }
  }

  function fit(){
    if(!layers[0].list) return;
    var rect=layers[0].el.getBoundingClientRect();
    var nw=Math.max(1,Math.round(rect.width));
    var nh=Math.max(1,Math.round(rect.height));
    if(nw===W&&nh===H) return;
    var sx=nw/W;
    var sy=nh/H;
    W=nw;
    H=nh;
    for(var L of layers){
      if(L.list){
        for(var f of L.list){
          f.x*=sx;
          f.y*=sy;
        }
      }
    }
    measure();
    for(var lay of layers) render(lay);
  }

  function buildAll(){
    for(var L of layers) build(L);
  }

  function paint(){
    for(var L of layers) render(L);
  }

  function frame(now){
    if(!last) last=now;
    var dt=(now-last)/1000;
    last=now;
    if(dt>.05) dt=.05;
    if(dt<0) dt=0;
    clock+=dt;
    for(var L of layers){
      var list=L.list;
      for(var f of list) move(f,dt);
      render(L);
    }
    handle=window.requestAnimationFrame(frame);
  }

  function play(){
    if(live||still) return;
    live=true;
    last=0;
    handle=window.requestAnimationFrame(frame);
  }

  function pause(){
    if(!live) return;
    live=false;
    window.cancelAnimationFrame(handle);
  }

  function boot(){
    measure();
    buildAll();
    paint();
    play();
  }

  window.addEventListener('pointermove',function(e){
    px=e.clientX;
    py=e.clientY;
    hasPointer=true;
  },{passive:true});

  window.addEventListener('pointerdown',function(e){
    px=e.clientX;
    py=e.clientY;
    hasPointer=true;
  },{passive:true});

  document.addEventListener('pointerleave',function(){hasPointer=false;});

  document.addEventListener('visibilitychange',function(){
    if(document.hidden) pause();
    else play();
  });

  window.addEventListener('resize',fit);
  if(window.ResizeObserver){
    new window.ResizeObserver(fit).observe(layers[0].el);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
