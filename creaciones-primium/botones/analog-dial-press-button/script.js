(function(){
  var gauge=document.getElementById("gauge");
  var hub=document.getElementById("hub");
  var needle=document.getElementById("needle");
  var ticks=document.getElementById("ticks");
  var arc=document.getElementById("arc");
  var zone=document.getElementById("zone");
  var trace=document.getElementById("trace");
  var tSet=document.getElementById("tSet");
  var tAct=document.getElementById("tAct");
  var tDev=document.getElementById("tDev");
  var tFlux=document.getElementById("tFlux");
  var devbar=document.getElementById("devbar");
  var hubSet=hub?hub.querySelector(".hub__set"):null;
  if(!gauge||!hub||!needle||!ticks)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var SVGNS="http://www.w3.org/2000/svg";
  var CX=100,CY=100,R1=88,R2=76;
  var A0=-222,A1=42;
  var SPAN=A1-A0;
  var MIN=0,MAX=4;
  function pol(a,r){
    var rad=a*Math.PI/180;
    return [CX+Math.cos(rad)*r,CY+Math.sin(rad)*r];
  }
  function arcPath(a0,a1,r1,r2){
    var p1=pol(a0,r2),p2=pol(a1,r2),p3=pol(a1,r1),p4=pol(a0,r1);
    var large=Math.abs(a1-a0)>180?1:0;
    return "M"+p1[0].toFixed(2)+" "+p1[1].toFixed(2)+
      "A"+r2+" "+r2+" 0 "+large+" 1 "+p2[0].toFixed(2)+" "+p2[1].toFixed(2)+
      "L"+p3[0].toFixed(2)+" "+p3[1].toFixed(2)+
      "A"+r1+" "+r1+" 0 "+large+" 0 "+p4[0].toFixed(2)+" "+p4[1].toFixed(2)+"Z";
  }
  if(arc)arc.setAttribute("d",arcPath(A0,A1,R1-1,R1-3.4));
  if(zone)zone.setAttribute("d",arcPath(A0+SPAN*.78,A1,R1-1,R1-3.4));
  var MAJ=8,MINOR=40;
  for(var i=0;i<=MINOR;i++){
    var f=i/MINOR;
    var a=A0+SPAN*f;
    var maj=(i%(MINOR/MAJ)===0);
    var r1=maj?R2-9:R2-4.5;
    var p1=pol(a,r1),p2=pol(a,R2-1);
    var ln=document.createElementNS(SVGNS,"line");
    ln.setAttribute("x1",p1[0].toFixed(2));
    ln.setAttribute("y1",p1[1].toFixed(2));
    ln.setAttribute("x2",p2[0].toFixed(2));
    ln.setAttribute("y2",p2[1].toFixed(2));
    if(maj)ln.setAttribute("class","maj");
    ticks.appendChild(ln);
    if(maj){
      var lp=pol(a,R2-18);
      var tx=document.createElementNS(SVGNS,"text");
      tx.setAttribute("x",lp[0].toFixed(2));
      tx.setAttribute("y",(lp[1]+2.4).toFixed(2));
      tx.textContent=(MIN+(MAX-MIN)*f).toFixed(1);
      ticks.appendChild(tx);
    }
  }
  var set=[3.4,1.15,2.72,.62,3.86,1.95];
  var si=0;
  var target=3.4,ang=2.55,vel=26;
  var kick=0,warn=0,last=0,t0=performance.now();
  var hist=new Float32Array(56);
  var hi=0,acc=0;

  function push(v){
    hist[hi]=v;
    hi=(hi+1)%hist.length;
  }
  function label(v){return v.toFixed(2)}
  function paint(){
    var dev=ang-target;
    if(hubSet)hubSet.textContent=label(target);
    if(tSet)tSet.textContent=label(target);
    if(tAct)tAct.textContent=label(ang);
    if(tDev)tDev.textContent=(dev>=0?"+":"")+dev.toFixed(2);
    if(tFlux)tFlux.textContent=(3.1+Math.sin((performance.now()-t0)/900)*.5+Math.abs(dev)*1.4).toFixed(1);
    if(devbar)devbar.style.setProperty("--dev",Math.max(-1,Math.min(1,dev*1.6)).toFixed(3));
    gauge.style.setProperty("--warn",warn.toFixed(3));
    hub.style.setProperty("--kick",kick.toFixed(3));
  }
  function tracePaint(){
    var n=hist.length,s="";
    for(var i=0;i<n;i++){
      var v=hist[(hi+i)%n];
      var y=(38-v/MAX*34).toFixed(2);
      s+=(i?" ":"")+((i/(n-1))*240).toFixed(1)+","+y;
    }
    trace.setAttribute("points",s);
  }

  function go(){
    si=(si+1)%set.length;
    target=set[si];
    kick=1;
    hub.classList.remove("is-kick");
    hub.getBoundingClientRect();
    hub.classList.add("is-kick");
  }
  hub.addEventListener("pointerdown",go);
  hub.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}
  });
  for(var w=0;w<hist.length;w++)hist[w]=2.3+1.1*Math.sin(w*.42)+.3*Math.sin(w*1.7);
  paint();
  tracePaint();

  if(reduce){
    ang=3.4;target=3.4;
    needle.style.transform="rotate("+(A0+SPAN*((ang-MIN)/(MAX-MIN))).toFixed(2)+"deg)";
    hist.fill(3.4);
    paint();
    tracePaint();
    return;
  }

  function frame(now){
    var dt=last?Math.min(.04,(now-last)/1000):.016;
    last=now;
    var t=(now-t0)/1000;
    if(t>7.2){t0=now;go()}
    var k=132,c=9.4;
    var a=-k*(ang-target)-c*vel;
    vel+=a*dt;
    ang+=vel*dt;
    if(ang<MIN){ang=MIN;vel*=-.22}
    if(ang>MAX){ang=MAX;vel*=-.22}
    kick+=(0-kick)*Math.min(1,dt*6);
    var inZone=ang>MIN+(MAX-MIN)*.78;
    warn+=((inZone?1:0)-warn)*Math.min(1,dt*(inZone?9:3));
    needle.style.transform="rotate("+(A0+SPAN*((ang-MIN)/(MAX-MIN))).toFixed(2)+"deg)";
    acc+=dt;
    if(acc>.028){
      acc=0;
      push(ang);
      paint();
      tracePaint();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
