(function(){
  var cv=document.getElementById('field');
  if(!cv) return;
  var g=cv.getContext('2d');
  var still=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=1;
  var H=1;
  var rows=[];
  var motes=[];
  var seeds=[];
  var wisps=[];
  var t=0;
  var last=0;
  var raf=0;
  var live=false;
  var px=-99999;
  var py=-99999;
  var hasPointer=false;
  var rnd=Math.random;

  var gusts=[
    {off:0,spd:78,w:200,amp:1.2,mod:.29,ph:0,gx:-9999,now:1},
    {off:560,spd:104,w:270,amp:1,mod:.17,ph:2.1,gx:-9999,now:1},
    {off:1040,spd:58,w:158,amp:1.4,mod:.43,ph:4.3,gx:-9999,now:1}
  ];

  function dot(size){
    var c=document.createElement('canvas');
    c.width=c.height=size;
    var q=c.getContext('2d');
    var grd=q.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
    grd.addColorStop(0,'rgba(255,236,186,1)');
    grd.addColorStop(.28,'rgba(255,222,150,.6)');
    grd.addColorStop(.62,'rgba(240,200,120,.14)');
    grd.addColorStop(1,'rgba(230,190,110,0)');
    q.fillStyle=grd;
    q.fillRect(0,0,size,size);
    return c;
  }

  function streak(w,h){
    var c=document.createElement('canvas');
    c.width=w;
    c.height=h;
    var q=c.getContext('2d');
    var grd=q.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    grd.addColorStop(0,'rgba(255,240,208,.9)');
    grd.addColorStop(.5,'rgba(255,236,196,.34)');
    grd.addColorStop(1,'rgba(255,232,190,0)');
    q.save();
    q.translate(w/2,h/2);
    q.scale(1,h/w);
    q.translate(-w/2,-h/2);
    q.fillStyle=grd;
    q.fillRect(0,0,w,w);
    q.restore();
    return c;
  }

  var mote=dot(24);
  var wisp=streak(256,256);

  function hsl(h,s,l){
    return 'hsl('+Math.round(h)+' '+Math.round(s)+'% '+Math.round(l)+'%)';
  }

  function span(){
    return Math.max(240,W*0.42);
  }

  function build(){
    rows.length=0;
    motes.length=0;
    seeds.length=0;
    wisps.length=0;
    var n=8;
    var unit=Math.max(.7,W/1440);
    for(var i=0;i<n;i++){
      var d=i/(n-1);
      var baseY=H*(0.645+0.355*Math.pow(d,1.12));
      var hgt=Math.max(5,H*(0.02+0.3*Math.pow(d,1.45)));
      var count=Math.max(7,Math.round(W/(3.2+34*Math.pow(1-d,1.2))));
      var hue=168-80*d;
      var sat=17+19*d;
      var lum=25-14*d;
      var deep=hsl(hue-4,sat-4,lum-7);
      var lit=hsl(hue-14,sat+16,lum+19);
      var grdA=g.createLinearGradient(0,baseY,0,baseY-hgt*1.06);
      grdA.addColorStop(0,deep);
      grdA.addColorStop(.55,hsl(hue,sat,lum+4));
      grdA.addColorStop(1,lit);
      var grdB=g.createLinearGradient(0,baseY,0,baseY-hgt*1.06);
      grdB.addColorStop(0,hsl(hue-4,sat-8,lum-11));
      grdB.addColorStop(.55,hsl(hue-2,sat-3,lum));
      grdB.addColorStop(1,hsl(hue-10,sat+9,lum+11));
      var list=new Array(count);
      for(var k=0;k<count;k++){
        list[k]={
          x:(k+rnd())*(W/count),
          w:Math.max(.45,hgt*.028*unit*(.62+rnd()*.9)),
          h:hgt*(.5+rnd()*.72),
          s:.72+rnd()*.7,
          v:k&1,
          o:rnd()*6.283
        };
      }
      rows.push({d:d,base:baseY,h:hgt,list:list,ga:grdA,gb:grdB,stiff:.8+rnd()*.5});
    }
    var mc=Math.round(46+Math.min(60,W/26));
    for(var m=0;m<mc;m++){
      motes.push({x:rnd()*W,y:H*(.5+rnd()*.5),s:.7+rnd()*2.1,a:.14+rnd()*.42,p:rnd()*6.283,v:.55+rnd()*1.1});
    }
    var sc=Math.round(9+Math.min(16,W/70));
    for(var q2=0;q2<sc;q2++){
      var d2=.25+rnd()*.74;
      seeds.push({
        x:rnd()*W,
        base:H*(.645+.355*Math.pow(d2,1.12)),
        h:H*(.05+.3*Math.pow(d2,1.3))*(.9+rnd()*.5),
        s:1.4+rnd()*1.5,
        p:rnd()*6.283,
        d:d2
      });
    }
    for(var w2=0;w2<7;w2++){
      wisps.push({y:H*(.6+rnd()*.38),len:.1+rnd()*.22,off:rnd(),k:rnd()<.5?0:1,ph:rnd()*6.283});
    }
  }

  function bendAt(x){
    var b=.112*Math.sin(x*.0052-t*.82)+.058*Math.sin(x*.0131-t*1.47+1.3)+.028*Math.sin(x*.0294+t*2.55+.7);
    for(var k=0;k<3;k++){
      var gu=gusts[k];
      var dx=(x-gu.gx)/gu.w;
      if(dx>-3.2&&dx<3.2) b+=gu.now*gu.amp*Math.exp(-dx*dx)*1.32;
    }
    return b;
  }

  function gustStep(){
    var sp=span();
    for(var k=0;k<3;k++){
      var gu=gusts[k];
      var travel=sp*2+gu.w*7;
      gu.gx=((t*gu.spd+gu.off*1.7)%travel)-gu.w*3.4;
      gu.now=.34+.66*(.5+.5*Math.sin(t*gu.mod+gu.ph));
    }
  }

  function drawBlades(){
    for(var row of rows){
      var list=row.list;
      var stiff=row.stiff;
      var drag=.52+.62*row.d;
      g.fillStyle=row.ga;
      for(var b of list){
        var bn=bendAt(b.x)*drag*b.s*stiff;
        if(bn>1.7) bn=1.7;
        else if(bn<-1.25) bn=-1.25;
        var th=b.h/Math.sqrt(1+bn*bn);
        var tx=b.x+bn*th;
        var hw=b.w*.9;
        g.fillStyle=b.v?row.gb:row.ga;
        g.beginPath();
        g.moveTo(b.x-b.w,row.base);
        g.quadraticCurveTo(b.x-b.w*.55+bn*th*.34,row.base-th*.56,tx-hw,row.base-th);
        g.lineTo(tx+hw,row.base-th);
        g.quadraticCurveTo(b.x+b.w*.55+bn*th*.34,row.base-th*.56,b.x+b.w,row.base);
        g.closePath();
        g.fill();
      }
    }
  }

  function drawSeeds(){
    for(var s of seeds){
      var bn=bendAt(s.x)*(.6+.7*s.d);
      if(bn>1.5) bn=1.5;
      else if(bn<-1.1) bn=-1.1;
      var th=s.h/Math.sqrt(1+bn*bn);
      var tx=s.x+bn*th;
      var tipY=s.base-th;
      g.strokeStyle='rgba(214,206,158,'+(.3+.34*s.d)+')';
      g.lineWidth=s.s*.6;
      g.beginPath();
      g.moveTo(s.x,s.base);
      g.quadraticCurveTo(s.x+bn*th*.3,s.base-th*.55,tx,tipY);
      g.stroke();
      var ang=Math.atan2(bn*.9,-1)+Math.PI/2;
      g.save();
      g.translate(tx,tipY);
      g.rotate(ang*.55);
      g.fillStyle='rgba(238,222,168,'+(.36+.4*s.d)+')';
      g.beginPath();
      g.ellipse(0,-s.h*.05,s.s*1.5,s.s*3.6,0,0,6.2832);
      g.fill();
      g.restore();
    }
  }

  function drawWisps(){
    g.globalCompositeOperation='lighter';
    for(var wp of wisps){
      var gu=gusts[wp.k];
      var lead=Math.sin(t*1.3+wp.ph)*26;
      var x=gu.gx+lead;
      var a=gu.now*gu.amp*.1;
      if(a<.006) continue;
      var lw=W*wp.len;
      var lh=lw*.11;
      g.globalAlpha=a;
      g.drawImage(wisp,x-lw*.5,wp.y-lh*.5,lw,lh);
    }
    g.globalAlpha=1;
    g.globalCompositeOperation='source-over';
  }

  function drawMotes(dt){
    g.globalCompositeOperation='lighter';
    for(var m of motes){
      var w=bendAt(m.x);
      m.x+=(16+w*54)*m.v*dt;
      m.y+=(Math.sin(t*1.15+m.p)*7-2.5)*dt;
      if(m.x>W+10) m.x=-10;
      else if(m.x<-10) m.x=W+10;
      if(m.y<H*.44||m.y>H-2) m.y=H*.44;
      var s=m.s*4.4;
      g.globalAlpha=m.a*(.5+.5*Math.abs(w));
      g.drawImage(mote,m.x-s*.5,m.y-s*.5,s,s);
    }
    g.globalAlpha=1;
    g.globalCompositeOperation='source-over';
  }

  function drawPointer(){
    if(!hasPointer) return;
    var w=bendAt(px);
    var a=Math.min(.16,Math.abs(w)*.05);
    if(a<.008) return;
    g.globalCompositeOperation='lighter';
    g.globalAlpha=a;
    var lw=W*.16;
    var lh=lw*.13;
    g.drawImage(wisp,px-lw*.5,py-lh*.5,lw,lh);
    g.globalAlpha=1;
    g.globalCompositeOperation='source-over';
  }

  function paint(dt){
    g.clearRect(0,0,W,H);
    gustStep();
    drawSeeds();
    drawBlades();
    drawWisps();
    drawMotes(dt||0);
    drawPointer();
  }

  function measure(){
    var rect=cv.getBoundingClientRect();
    W=Math.max(1,Math.round(rect.width));
    H=Math.max(1,Math.round(rect.height));
    var dpr=Math.min(2,window.devicePixelRatio||1);
    cv.width=Math.round(W*dpr);
    cv.height=Math.round(H*dpr);
    g.setTransform(dpr,0,0,dpr,0,0);
  }

  function fit(){
    var rect=cv.getBoundingClientRect();
    var nw=Math.max(1,Math.round(rect.width));
    var nh=Math.max(1,Math.round(rect.height));
    if(nw===W&&nh===H) return;
    W=nw;
    H=nh;
    measure();
    build();
    paint(0);
  }

  function frame(now){
    if(!last) last=now;
    var dt=(now-last)/1000;
    last=now;
    if(dt>.05) dt=.05;
    if(dt<0) dt=0;
    t+=dt;
    paint(dt);
    raf=window.requestAnimationFrame(frame);
  }

  function play(){
    if(live||still) return;
    live=true;
    last=0;
    raf=window.requestAnimationFrame(frame);
  }

  function pause(){
    if(!live) return;
    live=false;
    window.cancelAnimationFrame(raf);
  }

  function boot(){
    measure();
    build();
    paint(0);
    play();
  }

  window.addEventListener('pointermove',function(e){
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
    new window.ResizeObserver(fit).observe(cv);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
