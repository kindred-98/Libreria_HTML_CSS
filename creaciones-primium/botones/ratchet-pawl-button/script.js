(function(){
  var el=document.querySelector(".rat");
  var wheel=document.querySelector(".rat__wheel");
  var pawl=document.querySelector(".rat__pawl");
  var count=document.querySelector(".rat__count");
  if(!el||!wheel||!pawl)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TEETH=20;
  var STEP=360/TEETH;
  for(var i=0;i<TEETH;i++){
    var b=document.createElement("b");
    b.style.transform="rotate("+(i*STEP).toFixed(3)+"deg)";
    wheel.appendChild(b);
  }
  var step=137,phase=0,dur=1.15,heat=0,push=0,last=0,lastCount=-1,burst=0,cool=1;

  function ratchet(x){
    if(x<.3){var u=x/.3;return 1-Math.pow(1-u,3.4)}
    if(x<.35)return 1.022;
    if(x<.44){return 1.022-.022*((x-.35)/.09)}
    var v=(x-.44)/.56;
    return 1-.016*Math.sin(v*26)*(1-v);
  }
  function lift(x){
    if(x<.3)return -15*Math.pow(x/.3,.85);
    if(x<.35)return -15+15.6*((x-.3)/.05);
    if(x<.5){var u=(x-.35)/.15;return 3.6*Math.sin(u*Math.PI)*(1-u*.4)-1.2*u}
    return -1.2*(1-Math.min(1,(x-.5)/.3))+.5*Math.sin(x*34)*(1-Math.min(1,(x-.5)/.5));
  }

  if(reduce){
    wheel.style.transform="rotate("+(STEP*144).toFixed(2)+"deg)";
    pawl.style.transform="rotate(0deg)";
    if(count)count.textContent="144";
    el.addEventListener("click",function(){
      step+=3;
      wheel.style.transform="rotate("+(STEP*step).toFixed(2)+"deg)";
      if(count)count.textContent=(step%1000<100?"0":"")+(step%1000<10?"0":"")+(step%1000);
    });
    return;
  }

  el.addEventListener("pointerdown",function(){
    el.classList.add("is-press");
    push=1;
    burst=8;
    cool=0;
  });
  el.addEventListener("pointerup",function(){el.classList.remove("is-press")});
  el.addEventListener("pointerleave",function(){el.classList.remove("is-press")});
  el.addEventListener("keydown",function(e){
    if(e.key!=="Enter"&&e.key!==" ")return;
    push=1;
    burst=8;
    cool=0;
    el.classList.add("is-press");
    setTimeout(function(){el.classList.remove("is-press")},300);
  });

  function frame(now){
    var dt=last?Math.min(.06,(now-last)/1000):.016;
    last=now;
    push+=(0-push)*Math.min(1,dt*9);
    heat+=(0-heat)*Math.min(1,dt*1.6);
    cool+=(1-cool)*Math.min(1,dt*1.1);
    if(burst>0){
      dur=.34-burst*.028;
      burst--;
      heat=1;
    }else{
      dur=.16+(1.15-.16)*cool;
      heat=Math.max(0,heat-dt*.5);
    }
    phase+=dt/Math.max(.07,dur);
    while(phase>=1){
      phase-=1;
      step++;
      heat=Math.min(1,heat+.24);
    }
    var pos=step+ratchet(phase);
    var ang=pos*STEP;
    wheel.style.transform="rotate("+ang.toFixed(2)+"deg)";
    pawl.style.transform="rotate("+lift(phase).toFixed(2)+"deg)";
    el.style.setProperty("--push",push.toFixed(4));
    el.style.setProperty("--heat",heat.toFixed(4));
    if(count){
      var c=step%1000;
      var s=(c<100?"0":"")+(c<10?"0":"")+c;
      if(s!==lastCount){
        lastCount=s;
        count.textContent=s;
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
