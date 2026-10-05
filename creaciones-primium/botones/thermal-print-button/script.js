(function(){
  var unit=document.getElementById("unit");
  var paper=document.getElementById("paper");
  var pad=document.getElementById("pad");
  if(!unit||!paper||!pad)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LINES=16;
  var MSG=[
    "SEQ START  OK",
    "KEY 1  HEAT 82C",
    "KEY 2  ADV 1 STEP",
    "KEY 3  ADV 1 STEP",
    "KEY 4  ADV 1 STEP",
    "KEY 5  ADV 1 STEP",
    "KEY 6  ADV 1 STEP",
    "HEAD COOL 41C",
    "SEQ CYCLE 6/6",
    "PAPER 58MM  LEFT",
    "CUT READY",
    "SEQ LOOP 02",
    "THANK YOU"
  ];
  var rows=[];
  for(var i=0;i<LINES;i++){
    var d=document.createElement("div");
    d.className="pl";
    d.style.setProperty("--i",String(i));
    var s=document.createElement("span");
    s.textContent=MSG[i%MSG.length];
    d.appendChild(s);
    paper.appendChild(d);
    rows.push(d);
  }
  var lh=20;
  function measure(){
    var v=Number.parseFloat(getComputedStyle(unit).getPropertyValue("--lh"));
    if(v&&!isNaN(v))lh=v;
  }
  measure();
  window.addEventListener("resize",measure);

  var fed=0,heat=0,car=0,count=0,step=0,next=0.6,reset=0,justReset=false;
  var job=null;
  var t0=performance.now(),last=0;
  var keys=pad.querySelectorAll(".tk");

  function setLine(i,p){
    if(i<0||i>=rows.length)return;
    rows[i].style.setProperty("--p",Math.max(0,Math.min(1,p)).toFixed(4));
  }
  function paint(){
    unit.style.setProperty("--fed",fed.toFixed(2)+"px");
    unit.style.setProperty("--heatv",heat.toFixed(4));
    unit.style.setProperty("--car",car.toFixed(4));
  }
  function fire(k){
    var key=keys[k];
    if(key){
      key.classList.add("is-hit");
      setTimeout(function(){key.classList.remove("is-hit")},150);
    }
    heat=1;
    var idx=LINES-1-count;
    job={t:0,line:idx,reset:false};
    count++;
    if(count>=12)job.reset=true;
  }

  for(var w=0;w<6;w++)setLine(LINES-1-w,1);
  count=6;
  fed=lh*6;
  paint();

  if(reduce){
    pad.addEventListener("click",function(e){
      var b=e.target.closest?e.target.closest(".tk"):null;
      if(!b)return;
      setLine(LINES-1-6,1);
      fed=lh*7;
      heat=.5;
      paint();
    });
    return;
  }

  pad.addEventListener("click",function(e){
    var b=e.target.closest?e.target.closest(".tk"):null;
    if(!b)return;
    var k=parseInt(b.dataset.k,10);
    if(k>=1&&k<=6)fire(k-1);
  });

  function frame(now){
    var t=(now-t0)/1000;
    var dt=last?Math.min(.05,(now-last)/1000):.016;
    last=now;
    if(t>=next){
      next=t+.36;
      fire(step);
      step=(step+1)%6;
      if(step===0){next=t+(justReset?.7:2.6);justReset=false;}
    }
    if(job){
      job.t+=dt;
      var u=Math.min(1,job.t/.34);
      var e=1-Math.pow(1-u,2.4);
      if(!job.reset||job.t<.34){
        setLine(job.line,e);
        var want=lh*(count);
        fed+=(want-fed)*Math.min(1,dt*13);
        car=e;
        if(u>=1&&!job.reset)job=null;
      }else{
        if(job.t>=.34&&reset===0)reset=job.t;
        var out=lh*12+130;
        fed+=(out-fed)*Math.min(1,dt*8);
        car=0;
        if(job.t-reset>.62){
          for(var q=0;q<LINES;q++)setLine(q,0);
          count=0;
          justReset=true;
          fed=0;
          job=null;
          reset=0;
        }
      }
    }else{
      car*=1-Math.min(1,dt*9);
    }
    heat+=(0-heat)*Math.min(1,dt*2.4);
    paint();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
