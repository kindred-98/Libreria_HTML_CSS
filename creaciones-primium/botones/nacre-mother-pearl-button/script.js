(function(){
  var plates=document.querySelectorAll(".nacre");
  if(!plates.length)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T=4200;
  var layers=[];
  for(var pl of plates){
    var ls=pl.querySelectorAll(".lay");
    layers.push(ls);
  }

  function rip(p){
    p.classList.remove("is-rip");
    p.getBoundingClientRect();
    p.classList.add("is-rip");
    p.classList.add("is-hit");
    setTimeout(function(){p.classList.remove("is-hit")},150);
  }

  for (let pl of plates) {
    (function (p) {
      p.addEventListener("click", function () { rip(p); });
    })(pl);
  }

  function frame(t){
    var i,j;
    for(i=0;i<plates.length;i++){
      for(j=0;j<5;j++){
        var a=t/T+i*0.9+j*0.42;
        var l=layers[i][j];
        if(!l)continue;
        if(i===0){
          l.style.setProperty("--d"+(j+1),(Math.sin(a*2*Math.PI+T*0)*7*(1+j*0.22)).toFixed(2)+"px");
        }else if(i===1){
          l.style.setProperty("--e"+(j+1),(Math.cos(a*1.4*Math.PI*2)*9).toFixed(2)+"px");
          l.style.setProperty("--f"+(j+1),(Math.sin(a*1.15*Math.PI*2+1.3)*8).toFixed(2)+"px");
        }else{
          l.style.setProperty("--r"+(j+1),(Math.sin(a*0.72*Math.PI*2+j*0.6)*11).toFixed(2)+"deg");
        }
      }
    }
    requestAnimationFrame(frame);
  }

  var next=1300;
  function tick(t){
    if(t>next){
      next=t+4300;
      rip(plates[Math.floor(next/4300)%plates.length]);
    }
    requestAnimationFrame(tick);
  }

  if(!reduce){
    frame(0);
    requestAnimationFrame(tick);
  }
})();
