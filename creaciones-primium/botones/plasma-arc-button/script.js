(function(){
  var plates=[];
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR=Math.min(2,window.devicePixelRatio||1);

  function rnd(a,b){return a+Math.random()*(b-a)}

  function set(clock,crawl,amp,vol,cap){
    return {clock:clock,crawl:crawl,amp:amp,vol:vol,cap:cap};
  }

  function grab(list,i){
    var b=list[i];
    var cfg=[
      set(null,0.055,6.5,0,9.4),
      set([820,2100],0.1,9.6,0,9.4),
      set([260,640],0.16,14,0,9.4)
    ][i];
    return {
      b:b,
      cv:b.querySelector(".plate__arc"),
      flash:b.querySelector(".plate__flash"),
      kv:b.querySelector(".plate__kv"),
      fill:list[i].parentNode.querySelector(".meter__fill"),
      ctx:b.querySelector(".plate__arc").getContext("2d"),
      w:0,h:0,strike:0,life:1,a:null,c:null,amp:cfg.amp,br:2,
      vol:cfg.vol,cap:cfg.cap,clock:cfg.clock,crawl:cfg.crawl,next:0,seed:rnd(0,1),
      on:!b.hasAttribute("disabled")
    };
  }

  function fit(p){
    var w=p.cv.clientWidth,h=p.cv.clientHeight;
    if(!w||!h)return;
    p.cv.width=Math.round(w*DPR);
    p.cv.height=Math.round(h*DPR);
    p.ctx.setTransform(DPR,0,0,DPR,0,0);
    p.w=w;p.h=h;
  }

  function perim(t,W,H,r){
    var sw=Math.max(1,W-2*r),sh=Math.max(1,H-2*r),arc=Math.PI*r/2;
    var tot=2*sw+2*sh+4*arc;
    var d=((t%1)+1)%1*tot;
    var a;
    if(d<sw)return[r+d,0];
    d-=sw;
    if(d<arc){a=-Math.PI/2+d/r;return[W-r+Math.cos(a)*r,r+Math.sin(a)*r]}
    d-=arc;
    if(d<sh)return[W,r+d];
    d-=sh;
    if(d<arc){a=d/r;return[W-r+Math.cos(a)*r,H-r+Math.sin(a)*r]}
    d-=arc;
    if(d<sw)return[W-r-d,H];
    d-=sw;
    if(d<arc){a=Math.PI/2+d/r;return[r+Math.cos(a)*r,H-r+Math.sin(a)*r]}
    d-=arc;
    if(d<sh)return[0,H-r-d];
    d-=sh;
    a=Math.PI+d/r;
    return[r+Math.cos(a)*r,r+Math.sin(a)*r];
  }

  function jag(x1,y1,x2,y2,amp,seg){
    var dx=x2-x1,dy=y2-y1,len=Math.hypot(dx, dy)||1;
    var nx=-dy/len,ny=dx/len,pts=[],i,f,o;
    for(i=1;i<seg;i++){
      f=i/seg;
      o=(Math.random()-.5)*amp*Math.sin(Math.PI*f);
      pts.push([x1+dx*f+nx*o,y1+dy*f+ny*o]);
    }
    return pts;
  }

  function trace(ctx,x1,y1,x2,y2,amp,seg){
    var pts=jag(x1,y1,x2,y2,amp,seg),i,k;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    for(i=0;i<pts.length-1;i++){
      k=pts[i];
      ctx.quadraticCurveTo(k[0],k[1],(k[0]+pts[i+1][0])/2,(k[1]+pts[i+1][1])/2);
    }
    ctx.lineTo(x2,y2);
    return pts;
  }

  function hot(ctx,x,y,r,a){
    var g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,"rgba(255,255,255,"+a.toFixed(3)+")");
    g.addColorStop(.35,"rgba(180,150,255,"+(a*.55).toFixed(3)+")");
    g.addColorStop(1,"rgba(120,80,220,0)");
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(x,y,r,0,6.2832);
    ctx.fill();
  }

  function blip(p,x,y){
    if(x<-4||x>p.w+4||y<-4||y>p.h+4)return;
    var n=document.createElement("i");
    n.className="plate__blip";
    n.style.left=x.toFixed(1)+"px";
    n.style.top=y.toFixed(1)+"px";
    p.b.appendChild(n);
    setTimeout(function(){if(n.parentNode)n.remove()},760);
  }

  function fire(p,force,double){
    if(p.w<4)return;
    var W=p.w,H=p.h,r=9;
    var e1=perim(rnd(0,1),W,H,r);
    var e2=perim(rnd(0,1),W,H,r);
    var lx=W*(.5+rnd(-.14,.14)),ly=H*(.5+rnd(-.18,.18));
    if(Math.random()<.5){p.a=[e1[0],e1[1]];p.c=[lx,ly];}
    else{p.a=[lx,ly];p.c=[e2[0],e2[1]];}
    p.amp=rnd(p.amp*0.6,p.amp);
    p.seg=6+Math.round(Math.random()*4);
    p.br=rnd(2,3 | 0);
    p.life=force?340:300;
    p.strike=p.life;
    p.vol=Math.min(p.cap,p.vol+(force?3.4:rnd(1.6,2.8)));
    p.flash.style.setProperty("--fx",(p.a[0]/W*100).toFixed(1)+"%");
    p.flash.style.setProperty("--fy",(p.a[1]/H*100).toFixed(1)+"%");
    p.b.classList.add("is-strike");
    if(p.on){
      blip(p,p.a[0],p.a[1]);
      if(force)blip(p,p.c[0],p.c[1]);
    }
    clearTimeout(p.tid);
    p.tid=setTimeout(function(){p.b.classList.remove("is-strike")},force?320:220);
    if(double){
      setTimeout(function(){
        if(!p.w)return;
        var q1=perim(rnd(0,1),p.w,p.h,9);
        p.a=[q1[0],q1[1]];
        p.c=[p.w*(.5+rnd(-.2,.2)),p.h*(.5+rnd(-.2,.2))];
        p.life=260;p.strike=260;
        p.vol=Math.min(p.cap,p.vol+2.4);
        p.b.classList.add("is-strike");
        if(p.on)blip(p,p.a[0],p.a[1]);
        clearTimeout(p.tid);
        p.tid=setTimeout(function(){p.b.classList.remove("is-strike")},260);
      },170);
    }
  }

  function drawStrike(p,alpha){
    var ctx=p.ctx,i,k;
    var pts=trace(ctx,p.a[0],p.a[1],p.c[0],p.c[1],p.amp,p.seg);
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.shadowBlur=26;ctx.shadowColor="rgba(169,123,255,.95)";
    ctx.strokeStyle="rgba(150,110,240,"+(alpha*.6).toFixed(3)+")";
    ctx.lineWidth=4.2;
    ctx.stroke();
    ctx.shadowBlur=12;ctx.shadowColor="rgba(92,230,255,.95)";
    ctx.strokeStyle="rgba(150,235,255,"+(alpha*.9).toFixed(3)+")";
    ctx.lineWidth=2.2;
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.strokeStyle="rgba(255,255,255,"+alpha.toFixed(3)+")";
    ctx.lineWidth=1.4;
    ctx.stroke();
    for(i=0;i<p.br;i++){
      k=pts[(Math.random()*pts.length | 0)];
      trace(ctx,k[0],k[1],k[0]+rnd(-28,28),k[1]+rnd(-20,20),rnd(3,8),3);
      ctx.shadowBlur=7;ctx.shadowColor="rgba(169,123,255,.8)";
      ctx.strokeStyle="rgba(200,164,255,"+(alpha*.7).toFixed(3)+")";
      ctx.lineWidth=1.2;
      ctx.stroke();
      ctx.shadowBlur=0;
    }
    hot(ctx,p.a[0],p.a[1],17,alpha);
    hot(ctx,p.c[0],p.c[1],15,alpha*.8);
    ctx.restore();
  }

  function drawCrawl(p,t){
    var ctx=p.ctx,W=p.w,H=p.h,head=(p.seed+t*p.crawl)%1,tail=head-0.07,i,u,pt,pr;
    ctx.save();
    ctx.globalCompositeOperation="lighter";
    ctx.lineCap="round";
    for(i=0;i<=9;i++){
      u=tail+(head-tail)*(i/9);
      pt=perim(u,W,H,9);
      if(i===0){ctx.beginPath();ctx.moveTo(pt[0],pt[1]);continue}
      pr=perim(u-(head-tail)/9,W,H,9);
      ctx.beginPath();
      ctx.moveTo(pr[0],pr[1]);
      ctx.lineTo(pt[0],pt[1]);
      ctx.shadowBlur=13;ctx.shadowColor="rgba(92,230,255,.8)";
      ctx.strokeStyle="rgba(160,244,255,"+(0.7*Math.pow(i/9,1.7)).toFixed(3)+")";
      ctx.lineWidth=(.5+2*Math.pow(i/9,2.4)).toFixed(2);
      ctx.stroke();
    }
    pt=perim(head,W,H,9);
    hot(ctx,pt[0],pt[1],9,.6);
    ctx.restore();
  }

  function tick(p,ts){
    var ctx=p.ctx;
    ctx.clearRect(0,0,p.w,p.h);
    if(p.w<4)return;
    drawCrawl(p,ts/1000);
    if(p.strike>0){
      p.strike-=16.7;
      var f=p.strike/p.life;
      var a=(f>.45?1:.3+.5*Math.random())*Math.min(1,f*2.4);
      if(p.a&&p.c)drawStrike(p,a);
    }else if(p.clock&&ts>p.next){
      fire(p,false,false);
      p.next=ts+rnd(p.clock[0],p.clock[1]);
    }
    p.vol=Math.max(0,p.vol-0.014);
    if(ts>(p.volAt||0)){
      p.volAt=ts+80;
      p.kv.textContent=p.vol.toFixed(2)+" kV";
      p.fill.style.transform="scaleX("+Math.min(1,p.vol/p.cap).toFixed(3)+")";
      p.b.style.setProperty("--v",Math.min(1,p.vol/p.cap).toFixed(3));
    }
  }

  function loop(ts){
    for(var pl of plates)tick(pl,ts);
    requestAnimationFrame(loop);
  }

  function start(){
    var list=document.querySelectorAll(".plate"),i,p;
    for(i=0;i<list.length;i++){
      p=grab(list,i);
      plates.push(p);
      fit(p);
      if(p.on){
        p.next=rnd(120,900)+i*260;
        list[i].addEventListener("pointerdown",function(){
          var t=this;
          fire(plateOf(t),true,t===list[2]);
        });
        list[i].addEventListener("pointerenter",function(){this.classList.add("is-hot")});
        list[i].addEventListener("pointerleave",function(){this.classList.remove("is-hot")});
      }else{
        p.next=1e12;
      }
    }
    window.addEventListener("resize",function(){
      for(var pl of plates)fit(pl);
    });
  }

  function plateOf(b){
    for(var pl of plates)if(pl.b===b)return pl;
    return null;
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);
  else start();

  if(!reduce){
    requestAnimationFrame(loop);
  }else{
    setTimeout(function(){
      for(var pl of plates){
        fit(pl);
        drawCrawl(pl,0);
        pl.kv.textContent="0.00 kV";
        pl.fill.style.transform="scaleX(.02)";
      }
    },60);
  }
})();
