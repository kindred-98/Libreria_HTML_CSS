(function(){
  var view=document.getElementById("view");
  var stack=document.getElementById("stack");
  var root=document.documentElement;
  if(!view||!stack)return;

  var plies=stack.querySelectorAll(".ply");
  var coat=stack.querySelector(".coat");
  var sheens=stack.querySelectorAll(".sheen");
  var gloss=stack.querySelector(".coat__gloss");
  var leaders=[];
  for(var i=0;i<5;i++)leaders.push(document.getElementById("l"+i));

  var n=plies.length+1;
  var half=(n-1)/2;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ph=new Float32Array(n);
  for(var q=0;q<n;q++)ph[q]=q*1.7;
  var t0=0,e=1,hit=-9999;

  function stepPx(){
    var ph=stack.offsetHeight;
    var vh=view.offsetHeight;
    var g=(vh-22-5*ph)/4;
    if(!(g>2))g=18;
    return ph+g;
  }

  function set(v){
    e=v;
    var st=stepPx();
    var i,y;
    for(i=0;i<plies.length;i++)plies[i].style.setProperty("--dy",((i+1-half)*st*v).toFixed(2));
    coat.style.setProperty("--dy",((0-half)*st*v).toFixed(2));
    for(i=0;i<leaders.length;i++){
      y=(i-half)*st*v;
      leaders[i].style.transform="translate3d(calc(var(--plyw) / 2 + 9px),"+y.toFixed(2)+"px,0)";
      leaders[i].style.setProperty("--lead",(12+30*v).toFixed(1));
    }
    root.classList.toggle("is-open",v>.35);
  }

  function ease(u){
    return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
  }

  function frame(t){
    if(!t0)t0=t;
    var p=(t-t0)%5900;
    var v;
    if(p<3150){
      v=1;
    }else if(p<4000){
      v=1-ease((p-3150)/850);
    }else if(p<5050){
      v=0;
    }else{
      v=ease((p-5050)/850);
    }
    set(v);
    var i,u;
    for(i=0;i<sheens.length;i++){
      u=ease(Math.min(1,Math.max(0,(Math.sin(t/3700*Math.PI*2+ph[i])+1)/2)));
      sheens[i].style.setProperty("--sh",(-190+u*430).toFixed(1));
      sheens[i].style.opacity=(0.1+u*0.5).toFixed(3);
    }
    u=ease(Math.min(1,Math.max(0,(Math.sin(t/4300*Math.PI*2+0.9)+1)/2)));
    gloss.style.setProperty("--gl",(-90+u*300).toFixed(1));
    if(t-hit<300)stack.classList.add("is-hit");
    else stack.classList.remove("is-hit");
    requestAnimationFrame(frame);
  }

  stack.addEventListener("click",function(){
    hit=performance.now();
    t0=performance.now()-3150;
  });

  if(reduce){
    set(1);
    for(var sh of sheens){
      sh.style.setProperty("--sh","40");
      sh.style.opacity=".5";
    }
    gloss.style.setProperty("--gl","70");
  }else{
    set(1);
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize",function(){set(e)});
})();
