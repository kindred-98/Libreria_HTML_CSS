(function(){
  var field=document.getElementById("field");
  var pad=document.getElementById("pad");
  var cursor=document.getElementById("cursor");
  var ring=cursor.querySelector(".cursor__ring");
  var nap=document.getElementById("nap");
  var napPad=document.getElementById("napPad");
  var rake=document.getElementById("rake");
  var crush=document.getElementById("crush");
  var drags=document.getElementById("drags");
  var mNap=document.getElementById("mNap");
  var mRake=document.getElementById("mRake");
  var mPile=document.getElementById("mPile");
  var mCount=document.getElementById("mCount");
  if(!field||!pad||!cursor)return;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var POOL=24;
  var streaks=[];
  for(var i=0;i<POOL;i++){
    var s=document.createElement("i");
    s.className="streak";
    drags.appendChild(s);
    streaks.push({el:s,on:false,age:0,lt:0,x:0,y:0,a:0});
  }
  var px=0,py=0,pdx=1,pdy=0;
  var passes=0,pressAt=-9999,lastPress=-9999,ringAt=-9999;
  var fw=0,fh=0;
  var LIFE=1.75;
  var U0=0.28;

  function measure(){
    var r=field.getBoundingClientRect();
    fw=r.width;
    fh=r.height;
  }

  function path(u){
    if(u<0.62){
      var t=u/0.62;
      var e=t*t*(3-2*t);
      return [(-0.07+1.14*e)*fw,fh*(0.41+0.055*Math.sin(t*Math.PI*2.2))];
    }
    var t2=(u-0.62)/0.38;
    var e2=t2*t2*(3-2*t2);
    return [(1.07-1.16*e2)*fw,fh*(0.86-0.06*Math.sin(t2*Math.PI*2.4))];
  }

  function spawn(x,y,dx,dy,now){
    var s=null;
    for(var j=0;j<POOL;j++){
      if(!streaks[j].on){s=streaks[j];break}
    }
    if(!s)return;
    s.on=true;
    s.age=0;
    s.lt=now;
    s.x=x;
    s.y=y;
    s.a=Math.atan2(dy,dx)*180/Math.PI;
    s.el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) rotate("+s.a.toFixed(1)+"deg)";
  }

  function padBounds(){
    var r=pad.getBoundingClientRect();
    var f=field.getBoundingClientRect();
    return [r.left-f.left,r.top-f.top,r.width,r.height];
  }

  function frame(t){
    var u=((t/6300)+U0)%1;
    var p=path(u);
    var dx=p[0]-px,dy=p[1]-py;
    var dist=Math.hypot(dx, dy);
    if(dist>0.6){
      pdx=dx/Math.max(dist,0.001);
      pdy=dy/Math.max(dist,0.001);
      if(u<0.62&&dist>22){
        var n=Math.min(4,Math.floor(dist/22));
        for(var k=1;k<=n;k++){
          spawn(px+dx*(k/(n+1)),py+dy*(k/(n+1)),pdx,pdy,t);
        }
      }
    }
    px=p[0];
    py=p[1];
    cursor.style.transform="translate3d("+px.toFixed(1)+"px,"+py.toFixed(1)+"px,0)";

    var b=padBounds();
    var over=(u<0.62)&&px>b[0]-14&&px<b[0]+b[2]+14&&py>b[1]-14&&py<b[1]+b[3]+14;
    if(over&&t-lastPress>900){
      lastPress=t;
      pressAt=t;
      ringAt=t;
      passes++;
      pad.classList.add("is-hit");
      setTimeout(function(){pad.classList.remove("is-hit")},170);
      mCount.textContent=("000"+passes).slice(-4);
    }

    var age=(t-pressAt)/1000;
    var c=0;
    if(age>=0&&age<2.4){
      c=Math.pow(1-age/2.4,2.2);
    }
    crush.style.opacity=(c*0.92).toFixed(3);
    crush.style.transform="scale("+(1+c*0.06).toFixed(3)+","+(1+c*0.12).toFixed(3)+")";

    var ra=(t-ringAt)/520;
    if(ra>=0&&ra<1){
      ring.style.opacity=String((1-ra)*0.9);
      ring.style.transform="scale("+(0.3+ra*2.6).toFixed(2)+")";
    }else{
      ring.style.opacity="0";
    }

    for(var j=0;j<POOL;j++){
      var s2=streaks[j];
      if(!s2.on)continue;
      s2.age+=(t-s2.lt)/1000;
      s2.lt=t;
      if(s2.age>LIFE){
        s2.on=false;
        s2.el.style.opacity="0";
        continue;
      }
      var q=s2.age/LIFE;
      var op=Math.min(1,q*5)*(1-q)*(1-q)*0.9;
      var light=118+Math.sin(t/5300*Math.PI*2)*26;
      var diff=Math.abs(((s2.a-light+540)%180)-90);
      var boost=0.5+0.5*Math.cos(diff*Math.PI/90);
      s2.el.style.opacity=(op*(0.34+boost*0.8)).toFixed(3);
    }

    var napA=(t/7400*360+24)%180;
    nap.style.setProperty("--n",napA.toFixed(1));
    napPad.style.setProperty("--n",(napA*0.6-18).toFixed(1));
    nap.style.setProperty("--s",(0.55+0.4*Math.abs(Math.cos(t/7400*Math.PI*2))).toFixed(3));
    rake.style.setProperty("--x",(18+64*(0.5-0.5*Math.cos(t/4300*Math.PI*2))).toFixed(1));
    rake.style.setProperty("--rot",(Math.sin(t/4300*Math.PI*2)*7).toFixed(1));
    mNap.textContent=String(Math.round(napA)%180)+"\u00b0";
    mRake.textContent=String(118+Math.round(Math.sin(t/5300*Math.PI*2)*26))+"\u00b0";
    mPile.textContent=(1-c*0.72).toFixed(2);
    requestAnimationFrame(frame);
  }

  function seed(){
    var t=performance.now();
    for(var j=1;j<=14;j++){
      var uu=(U0-j*0.019+1)%1;
      var a=path(uu);
      var b=path((uu+0.006)%1);
      var dx=b[0]-a[0],dy=b[1]-a[1];
      if(Math.abs(dx)+Math.abs(dy)<0.01)continue;
      var k=Math.hypot(dx, dy);
      spawn(a[0],a[1],dx/k,dy/k,t-j*82);
    }
  }

  pad.addEventListener("click",function(){
    pressAt=performance.now();
    ringAt=pressAt;
    passes++;
    mCount.textContent=("000"+passes).slice(-4);
    pad.classList.add("is-hit");
    setTimeout(function(){pad.classList.remove("is-hit")},170);
  });

  measure();
  window.addEventListener("resize",function(){measure()});
  if(reduce){
    nap.style.setProperty("--n","24");
    napPad.style.setProperty("--n","-14");
    rake.style.setProperty("--x","38");
    rake.style.setProperty("--rot","6");
    cursor.style.transform="translate3d(46%,41%,0)";
    mNap.textContent="24\u00b0";
    mRake.textContent="118\u00b0";
    mPile.textContent="1.00";
  }else{
    var p0=path(U0);
    px=p0[0];
    py=p0[1];
    cursor.style.transform="translate3d("+px.toFixed(1)+"px,"+py.toFixed(1)+"px,0)";
    seed();
    requestAnimationFrame(frame);
  }
})();
