(function(){
  var key=document.getElementById("key");
  var picker=document.getElementById("picker");
  var root=document.documentElement;
  if(!key||!picker)return;

  var TINTS=[
    {n:"signal red",a:"#3a0a07",b:"#7c1a11",c:"#cf3a1e",s:"#ffc0aa",g:"#ff5f3c",th:"18 \u00b5m"},
    {n:"cobalt",a:"#071436",b:"#123a7c",c:"#2d6fdc",s:"#b3d0ff",g:"#4f96ff",th:"22 \u00b5m"},
    {n:"teal",a:"#04201c",b:"#0a4c42",c:"#12a48f",s:"#a8f5e6",g:"#37e3c2",th:"15 \u00b5m"},
    {n:"amber",a:"#2c1902",b:"#70460a",c:"#d18e1c",s:"#ffe3ae",g:"#ffb43c",th:"26 \u00b5m"},
    {n:"violet",a:"#180a2b",b:"#40206e",c:"#7739c8",s:"#e0c6ff",g:"#a86cff",th:"20 \u00b5m"},
    {n:"graphite",a:"#14171a",b:"#2c3237",c:"#4d565d",s:"#d5dee4",g:"#93a3ad",th:"12 \u00b5m"}
  ];

  var sws=[];
  for(var t of TINTS){
    var b=document.createElement("button");
    b.type="button";
    b.className="sw";
    b.setAttribute("aria-label","Set anodise tint to "+t.n);
    b.style.setProperty("--a",t.a);
    b.style.setProperty("--b",t.b);
    b.style.setProperty("--c",t.c);
    b.style.setProperty("--g",t.g);
    b.appendChild(document.createElement("i"));
    picker.appendChild(b);
    sws.push(b);
  }

  var grain=key.querySelector(".key__grain");
  var spec=key.querySelector(".key__spec");
  var hot=key.querySelector(".key__hot");
  var state=document.getElementById("state");
  var clk=document.getElementById("clk");
  var cycles=document.getElementById("cycles");
  var finish=document.getElementById("finish");
  var thick=document.getElementById("thick");
  var lot=document.getElementById("lot");
  var pfill=document.getElementById("pfill");
  var loglist=document.getElementById("loglist");
  var bars=[document.getElementById("b1"),document.getElementById("b2"),document.getElementById("b3")];
  var vals=[document.getElementById("v1"),document.getElementById("v2"),document.getElementById("v3")];

  var cur=0;
  var count=412;
  var cycleStart=-1;
  var hotAt=-9999;
  var nextRun=2600;
  var base=41412;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0=0;

  function apply(i){
    cur=i;
    var t=TINTS[i];
    root.style.setProperty("--ta",t.a);
    root.style.setProperty("--tb",t.b);
    root.style.setProperty("--tc",t.c);
    root.style.setProperty("--ts",t.s);
    root.style.setProperty("--tg",t.g);
    finish.textContent=t.n;
    thick.textContent=t.th;
    for(var k=0;k<sws.length;k++){
      if(k===i)sws[k].classList.add("is-on");
      else sws[k].classList.remove("is-on");
    }
  }

  for(var q=0;q<sws.length;q++){
    (function(idx){
      sws[idx].addEventListener("click",function(){
        if(idx===cur)return;
        apply(idx);
        hotAt=now;
        push("anodise tint set to "+TINTS[idx].n+" \u00b7 lot reassigned");
      });
    })(q);
  }

  function pad(v){
    return (v<10?"0":"")+v;
  }

  function hhmmss(ms){
    var s=base+Math.floor(ms/1000);
    var h=Math.floor(s/3600)%24;
    var m=Math.floor(s/60)%60;
    return pad(h)+":"+pad(m)+":"+pad(s%60);
  }

  function push(text){
    var li=document.createElement("li");
    var b=document.createElement("b");
    b.textContent=hhmmss(now-t0);
    li.appendChild(b);
    li.appendChild(document.createTextNode(" "+text));
    loglist.insertBefore(li,loglist.firstChild);
    while(loglist.children.length>4)loglist.lastChild.remove();
  }

  function start(){
    if(cycleStart>=0)return;
    cycleStart=now;
    count++;
    cycles.textContent=("000"+count).slice(-4);
    var r=(""+(1000+Math.floor(Math.random()*8999))).slice(-4);
    lot.textContent="A-"+r;
    key.classList.add("is-down");
    setTimeout(function(){key.classList.remove("is-down")},130);
    hotAt=now;
    root.classList.add("is-run");
    state.textContent="running";
    push("cycle "+count+" started \u00b7 "+TINTS[cur].n+" \u00b7 rack sealed");
  }

  key.addEventListener("click",start);

  var now=0;

  function frame(t){
    now=t;
    if(!t0)t0=t;
    var e=t-cycleStart;
    var p=0.5-0.5*Math.cos(t/4700*Math.PI*2+1.245);
    spec.style.setProperty("--p",p.toFixed(4));
    grain.style.setProperty("--gx",(Math.sin(t/2600*Math.PI*2)*0.7).toFixed(2));
    var h=(t-hotAt)/240;
    if(h>=0&&h<1){
      hot.style.opacity=(Math.sin(h*Math.PI)*0.95).toFixed(3);
      hot.style.setProperty("--q",(h*1.18).toFixed(3));
    }else{
      hot.style.opacity="0";
    }
    var k=cycleStart>=0?Math.min(1,e/2400):0;
    pfill.style.transform="scaleX("+k.toFixed(4)+")";
    if(cycleStart>=0&&e>=2400){
      cycleStart=-1;
      root.classList.remove("is-run");
      state.textContent="ready";
      push("cycle "+count+" sealed \u00b7 "+TINTS[cur].n+" \u00b7 "+TINTS[cur].th+" on part");
      setTimeout(function(){
        if(cycleStart<0)pfill.style.transform="scaleX(0)";
      },900);
    }
    var run=cycleStart>=0?1:0;
    var n1=0.52+0.2*Math.sin(t/3100*Math.PI*2)+run*0.24;
    var n2=0.78+0.09*Math.sin(t/4300*Math.PI*2+1.4)+run*0.16;
    var n3=0.4+0.16*Math.sin(t/2300*Math.PI*2+2.6)-run*0.12;
    if(n1<0.08)n1=0.08;
    if(n2<0.2)n2=0.2;
    if(n3<0.08)n3=0.08;
    bars[0].style.transform="scaleX("+n1.toFixed(4)+")";
    bars[1].style.transform="scaleX("+n2.toFixed(4)+")";
    bars[2].style.transform="scaleX("+n3.toFixed(4)+")";
    vals[0].textContent=(21.4+run*2.2+Math.sin(t/3100*Math.PI*2)*.9).toFixed(1);
    vals[1].textContent=(63.8+run*1.4+Math.sin(t/4300*Math.PI*2+1.4)*.5).toFixed(1);
    vals[2].textContent=(17.6+Math.sin(t/2300*Math.PI*2+2.6)*.8).toFixed(1);
    clk.textContent=hhmmss(t-t0);
    if(t>nextRun){
      nextRun=t+7400;
      start();
    }
    requestAnimationFrame(frame);
  }

  apply(0);
  if(reduce){
    spec.style.setProperty("--p",".42");
    pfill.style.transform="scaleX(.62)";
  }else{
    bars[0].style.transform="scaleX(.52)";
    bars[1].style.transform="scaleX(.78)";
    bars[2].style.transform="scaleX(.4)";
    requestAnimationFrame(frame);
  }
})();
