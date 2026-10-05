(function(){
  var slug=document.getElementById("slug");
  var type=document.getElementById("type");
  var stage=document.getElementById("stage");
  var plate=slug.querySelector(".slug__plate");
  var strut=type.querySelector(".gstrut");
  var letters=[];
  for(var ch of type.children){
    if(ch.className==="g")letters.push(ch);
  }
  var n=letters.length;
  if(n<2)return;
  var optics=document.getElementById("optics").children;
  var oLines=[];
  for(var o of optics)oLines.push(o);
  var measL=document.querySelector(".meas__line--l");
  var measR=document.querySelector(".meas__line--r");
  var dim=document.getElementById("dim");
  var probes=document.querySelectorAll(".probe");
  var rspan=document.getElementById("rspan");
  var rcursor=document.querySelector(".ruler__cursor");
  var rread=document.getElementById("rread");
  var cPair=document.getElementById("cPair");
  var cKern=document.getElementById("cKern");
  var cOpt=document.getElementById("cOpt");
  var cFit=document.getElementById("cFit");
  var cState=document.getElementById("cState");
  var logline=document.getElementById("logline");
  var trace=document.getElementById("trace");
  var root=document.documentElement;

  var PAIR=[
    {name:"A V",opt:-72,amp:78,ph:0.00},
    {name:"V A",opt:-74,amp:94,ph:1.15},
    {name:"A T",opt:-70,amp:56,ph:2.35},
    {name:"T A",opt:-64,amp:88,ph:3.50},
    {name:"A R",opt:-48,amp:64,ph:4.70}
  ];
  while(PAIR.length<n-1)PAIR.push({name:"pair",opt:-60,amp:70,ph:PAIR.length*1.3});

  var TAU=Math.PI*2;
  var baseRel=new Float32Array(n);
  var wid=new Float32Array(n);
  var kern=new Float32Array(n-1);
  var optK=new Float32Array(n-1);
  var delta=new Float32Array(n-1);
  var pos=new Float32Array(n);
  var optPos=new Float32Array(n);
  var ox=0,fs=40;
  var idx=0,lockAt=-1,locked=false;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hist=new Float32Array(80);
  var hi=0;

  for(var i=0;i<n-1;i++)optK[i]=PAIR[i].opt;

  function measure(){
    var i;
    for(i=0;i<n;i++)letters[i].style.transform="none";
    var tb=type.getBoundingClientRect();
    var sb=stage.getBoundingClientRect();
    var pb=plate.getBoundingClientRect();
    ox=tb.left-sb.left;
    for(i=0;i<n;i++){
      var r=letters[i].getBoundingClientRect();
      baseRel[i]=r.left-tb.left;
      wid[i]=r.width;
    }
    var gb=strut.getBoundingClientRect();
    plate.style.setProperty("--base",(gb.top-pb.top).toFixed(2)+"px");
    fs=Number.parseFloat(getComputedStyle(type).fontSize)||40;
    var cum=0;
    for(i=0;i<n;i++){
      optPos[i]=ox+baseRel[i]+cum;
      if(i<n-1)cum+=optK[i]*fs/1000;
    }
    for(i=0;i<oLines.length;i++){
      oLines[i].style.setProperty("--x",(i<n?optPos[i].toFixed(2):"0"));
    }
  }

  function drift(j,t){
    var p=PAIR[j];
    return p.opt+p.amp*(0.62*Math.sin(TAU*t/3200+p.ph)+0.38*Math.sin(TAU*t/4100+p.ph*1.7));
  }

  function sign(v){
    return (v<0?"-":"+")+Math.abs(v).toFixed(3);
  }

  function press(){
    if(locked)return;
    var i;
    for(i=0;i<n-1;i++)delta[i]=kern[i]-optK[i];
    lockAt=now;
    locked=true;
    cycle++;
    root.classList.add("is-locked");
    slug.classList.add("is-down");
    setTimeout(function(){slug.classList.remove("is-down")},190);
  }

  slug.addEventListener("click",press);

  function paint(dev){
    var i,dk=0;
    var fit=Math.max(0,Math.min(1,1-dev/110));
    cPair.textContent=PAIR[idx].name;
    cKern.textContent=sign(kern[idx]);
    cOpt.textContent=sign(optK[idx]);
    cFit.textContent=fit.toFixed(2);
    var estadoTxt="near";
    if(locked)estadoTxt=fit>0.995?"locked":"seating";
    else if(dev>44)estadoTxt="drift";
    cState.textContent=estadoTxt;
    dim.textContent=PAIR[idx].name+" "+sign(kern[idx]);
    dim.style.setProperty("--x",((pos[idx]+pos[idx+1]+wid[idx+1])/2).toFixed(2));
    for(i=0;i<2;i++){
      var p=pos[idx+i];
      var x=i===0?p:p+wid[idx+1];
      if(i===0)measL.style.setProperty("--x",x.toFixed(2));
      else measR.style.setProperty("--x",x.toFixed(2));
      if(probes[i])probes[i].style.setProperty("--x",x.toFixed(2));
    }
    var a=pos[idx],b=pos[idx+1]+wid[idx+1];
    rspan.style.setProperty("--x",a.toFixed(2));
    rspan.style.setProperty("--s",Math.max(.02,(b-a)/120).toFixed(4));
    rcursor.style.setProperty("--x",a.toFixed(2));
    rread.style.setProperty("--x",((a+b)/2).toFixed(2));
    rread.textContent=Math.round((b-a)/fs*1000)+" u";
    logline.textContent=locked
      ?("cycle "+pad(cycle)+" \u00b7 slug drop \u00b7 "+PAIR[idx].name+" seated at "+sign(optK[idx])+" \u00b7 measure lines locked")
      :("cycle "+pad(cycle)+" \u00b7 slug up \u00b7 "+PAIR[idx].name+" drifting "+sign(kern[idx])+" against "+sign(optK[idx])+" \u00b7 residual "+sign(dev));
    return dk;
  }

  function pad(v){
    return (v<10?"0":"")+v;
  }

  function outCubic(u){
    return 1-Math.pow(1-u,3);
  }

  function place(){
    var i,cum=0;
    for(i=0;i<n;i++){
      pos[i]=ox+baseRel[i]+cum;
      letters[i].style.transform="translate3d("+cum.toFixed(2)+"px,0,0)";
      if(i<n-1)cum+=kern[i]*fs/1000;
    }
  }

  function tracePaint(){
    var s="",i;
    for(i=0;i<hist.length;i++){
      var v=hist[(hi+i)%hist.length];
      if(v>52)v=52;
      if(v<-52)v=-52;
      s+=(i?" ":"")+(i*4.3).toFixed(1)+","+(24-v/52*20).toFixed(2);
    }
    trace.setAttribute("points",s);
  }

  var now=0,t0=0,last=0,acc=0,nextAuto=4200,cycle=1;
  var sweep=document.querySelector(".slug__sweep");

  function step(t){
    now=t;
    if(!t0)t0=t;
    var dt=last?Math.min(.05,(t-last)/1000):.016;
    last=t;
    var e=t-lockAt;
    var i,dev=0;
    if(sweep){
      var u=t/340;
      if(u>=1){
        sweep.style.opacity="0";
      }else{
        sweep.style.opacity=String(Math.sin(Math.min(1,u)*Math.PI)*0.9);
        sweep.style.transform="translate3d("+((-1.2+2.4*outCubic(u))*100).toFixed(1)+"%,0,0)";
      }
    }
    for(i=0;i<n-1;i++){
      if(locked){
        if(e<1250){
          kern[i]=optK[i]+delta[i]*Math.exp(-e/235)*Math.cos(e/47);
        }else{
          kern[i]=optK[i];
        }
      }else{
        kern[i]=drift(i,t);
      }
      dev+=kern[i]-optK[i];
    }
    dev=dev/(n-1);
    if(locked&&e>3000){
      locked=false;
      lockAt=-1;
      root.classList.remove("is-locked");
    }
    place();
    idx=Math.floor(t/1900)%(n-1);
    if(t>nextAuto){
      nextAuto=t+6400;
      press();
    }
    acc+=dt;
    if(acc>.032){
      acc=0;
      hist[hi]=dev;
      hi=(hi+1)%hist.length;
      paint(dev);
      tracePaint();
    }
    requestAnimationFrame(step);
  }

  function settle(){
    var i;
    for(i=0;i<n;i++){
      letters[i].style.transform="translate3d("+(optPos[i]-ox-baseRel[i]).toFixed(2)+"px,0,0)";
      pos[i]=optPos[i];
    }
    for(i=0;i<n-1;i++)kern[i]=optK[i];
    hist.fill(0);
    paint(0);
    tracePaint();
    root.classList.add("is-locked");
    locked=true;
    if(sweep)sweep.style.opacity="0";
  }

  measure();
  for(var z=0;z<n-1;z++)kern[z]=drift(z,0);
  place();
  idx=0;
  if(reduce){
    settle();
  }else{
    for(var w=0;w<hist.length;w++)hist[w]=Math.sin(w*0.5)*0.05;
    paint(drift(0,0)-optK[0]);
    tracePaint();
    window.addEventListener("resize",function(){
      measure();
      for(var w2=0;w2<hist.length;w2++)hist[w2]=0;
      paint(0);
      tracePaint();
    });
    requestAnimationFrame(step);
  }
})();
