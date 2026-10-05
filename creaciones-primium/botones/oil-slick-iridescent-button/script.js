(function(){
  var el=document.querySelector(".slick");
  if(!el)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nm=el.querySelector(".slick__nm");
  var px=0,py=0,tx=0,ty=0,over=0,press=0,t0=performance.now(),pressTimer=0;
  var band=[472,498,534,568,612,650,436,478,556,588,634,462];

  if(reduce){
    el.style.setProperty("--oh","214deg");
    el.style.setProperty("--ot",".46");
    el.style.setProperty("--oa","26deg");
    el.style.setProperty("--ox","44%");
    el.style.setProperty("--oy","38%");
    el.style.setProperty("--orad",".72");
    el.style.setProperty("--fx","212%");
    el.style.setProperty("--fy","26%");
    if(nm)nm.textContent="film 498 nm";
    el.addEventListener("click",function(){
      el.style.setProperty("--oh","286deg");
      if(nm)nm.textContent="film 612 nm";
    });
    return;
  }

  function track(e){
    var r=el.getBoundingClientRect();
    var nx=((e.clientX-r.left)/r.width)*2-1;
    var ny=((e.clientY-r.top)/r.height)*2-1;
    var d=Math.hypot(nx, ny);
    if(d>1.34){nx=nx/d*1.34;ny=ny/d*1.34}
    tx=nx;ty=ny;over=1;
  }
  el.addEventListener("pointermove",track);
  el.addEventListener("pointerdown",function(e){
    track(e);
    el.classList.add("is-press");
    if(pressTimer)clearTimeout(pressTimer);
    pressTimer=setTimeout(function(){el.classList.remove("is-press")},780);
  });
  el.addEventListener("pointerleave",function(){over=0});
  window.addEventListener("pointermove",function(e){
    if(over)return;
    var r=el.getBoundingClientRect();
    if(e.clientX<r.left-160||e.clientX>r.right+160||e.clientY<r.top-160||e.clientY>r.bottom+160)return;
    track(e);
    over=.45;
  });

  function frame(now){
    var t=(now-t0)/1000;
    if(over<.5&&!el.matches(":hover")){
      tx=Math.cos(t*.42)*.9+Math.sin(t*.23)*.34;
      ty=Math.sin(t*.33)*.72+Math.cos(t*.17)*.22;
    }
    px+=(tx-px)*.085;
    py+=(ty-py)*.085;
    var rad=Math.min(1,Math.hypot(px, py));
    var ang=Math.atan2(py,px);
    var deg=ang*57.29577951+90;
    var th=.36+.2*Math.sin(t*.62)+rad*.2+press*.1;
    var hue=(188+Math.sin(t*.31)*44+ang*46+rad*26+360)%360;
    var tilt=Math.min(1,rad*.86+.1);
    var ca=Math.cos(ang+.32*Math.sin(t*.27));
    var sa=Math.sin(ang+.32*Math.sin(t*.27));
    var R=3.1+.5*Math.sin(t*.44+.6);
    el.style.setProperty("--oh",hue.toFixed(2)+"deg");
    el.style.setProperty("--ot",th.toFixed(4));
    el.style.setProperty("--oa",(((deg+Math.sin(t*.5)*9)%360+360)%360).toFixed(2)+"deg");
    el.style.setProperty("--ox",((px*.5+.5)*100).toFixed(2)+"%");
    el.style.setProperty("--oy",((py*.5+.5)*100).toFixed(2)+"%");
    el.style.setProperty("--orad",rad.toFixed(4));
    el.style.setProperty("--lift",tilt.toFixed(4));
    el.style.setProperty("--fx",(50+ca*R*100).toFixed(2)+"%");
    el.style.setProperty("--fy",(44+sa*R*100*1.5).toFixed(2)+"%");
    if(nm){
      var idx=Math.floor((hue/360)*band.length)%band.length;
      if(idx<0)idx=0;
      var nmv=band[idx]+Math.round(rad*22);
      if(nmv>700)nmv-=300;
      nm.textContent="film "+nmv+" nm";
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
