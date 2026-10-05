(function(){
  var pads=Array.prototype.slice.call(document.querySelectorAll(".pad"));
  if(!pads.length)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rnd(a,b){return a+Math.random()*(b-a)}

  pads.forEach(function(p,i){
    p.hzEl=p.querySelector(".pad__hz");
    p.arcEl=p.querySelector(".pad__arc");
    p.spd=1.42;
    p.next=rnd(500,2200);
    p.addEventListener("pointerenter",function(){p.classList.add("is-live")});
    p.addEventListener("pointerleave",function(){p.classList.remove("is-live")});
    p.addEventListener("pointerdown",function(){strike(p)});
  });

  function strike(p){
    p.classList.add("is-jet");
    p.spd=9.4;
    clearTimeout(p.tid);
    p.tid=setTimeout(function(){p.classList.remove("is-jet")},250);
  }

  function recon(p){
    p.arcEl.style.setProperty("--ar",rnd(-40,40).toFixed(1)+"deg");
    p.classList.add("is-recon");
    clearTimeout(p.rid);
    p.rid=setTimeout(function(){p.classList.remove("is-recon")},320);
  }

  function bar(){
    pads.forEach(function(p,i){
      setTimeout(function(){
        p.classList.add("is-beat");
        setTimeout(function(){p.classList.remove("is-beat")},200);
      },i*105);
    });
  }

  if(!reduce){
    setInterval(bar,2400);
  }

  setInterval(function(){
    var now=performance.now();
    for(var p of pads){
      if(reduce){
        if(p.hzEl)p.hzEl.textContent="1.42 Hz";
        continue;
      }
      if(now>p.next){
        p.next=now+rnd(1500,3800);
        recon(p);
      }
      // is-jet manda sobre is-live: por eso el if va antes que el else if.
      var want=1.42;
      if(p.classList.contains("is-jet"))want=1.42;
      else if(p.classList.contains("is-live"))want=3.08;
      p.spd+=(want-p.spd)*.1;
      if(p.hzEl)p.hzEl.textContent=p.spd.toFixed(2)+" Hz";
    }
  },reduce?1200:90);
})();
