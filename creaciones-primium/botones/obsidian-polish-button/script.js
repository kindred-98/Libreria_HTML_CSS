(function(){
  var slab=document.getElementById("slab");
  var spec=slab.querySelector(".slab__spec");
  var depth=slab.querySelector(".slab__depth");
  var refl=slab.querySelector(".slab__refl");
  var glare=document.querySelector(".case__glare");
  var root=document.documentElement;
  if(!spec||!depth||!refl)return;

  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var p=0.34,hit=-9999,gt=0;

  function apply(){
    var prox=Math.max(0,1-Math.abs(p-0.5)*2.3);
    spec.style.setProperty("--p",p.toFixed(4));
    depth.style.setProperty("--d",(0.3+prox*0.62).toFixed(3));
    var e=(performance.now()-hit)/900;
    var extra=0,sharp=0;
    if(e>=0&&e<1){
      extra=Math.sin(e*Math.PI);
      sharp=1;
    }
    refl.style.setProperty("--ro",(0.34+prox*0.16+extra*0.3).toFixed(3));
    refl.style.setProperty("--rb",(1.5-prox*0.8-sharp*0.7*(1-e)).toFixed(3));
    slab.style.setProperty("--tilt",(2+extra*7).toFixed(2));
    slab.style.setProperty("--turn",(-1.2-extra*3).toFixed(2));
    if(glare)glare.style.setProperty("--g",(gt+Math.sin(p*3.1)*40).toFixed(1));
  }

  function frame(t){
    p=0.5-0.5*Math.cos(t/4100*Math.PI*2+0.72);
    gt=(Math.sin(t/6900*Math.PI*2)*0.5+0.5)*420;
    apply();
    requestAnimationFrame(frame);
  }

  slab.addEventListener("click",function(){hit=performance.now()});

  if(reduce){
    root.classList.add("is-still");
    p=0.4;
    gt=180;
    slab.style.setProperty("--tilt","5");
    slab.style.setProperty("--turn","-2");
    apply();
  }else{
    p=0.34;
    apply();
    requestAnimationFrame(frame);
  }
})();
