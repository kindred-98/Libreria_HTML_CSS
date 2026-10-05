(function(){
  var form=document.querySelector(".panel");
  var door=document.getElementById("door");
  var digits=document.getElementById("digits");
  var tries=document.getElementById("tries");
  var stateTxt=document.getElementById("state");
  var boltTxt=document.getElementById("boltstate");
  var log=document.getElementById("log");
  var submit=document.getElementById("submit");
  var console_=document.querySelector(".console");
  if(!form||!digits||!submit)return;
  var PIN="4817";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var entry="";
  var attempts=0;
  var lockUntil=0;
  var clock=14*3600+2*60+11;
  var t0=performance.now();
  var throwV=0,throwT=0,okV=0,okT=0,badV=0,badT=0,last=0;

  function stamp(){
    var h=Math.floor(clock/3600),m=Math.floor(clock/60)%60,s=clock%60;
    clock+=1;
    return (h<10?"0":"")+h+":"+(m<10?"0":"")+m+":"+(s<10?"0":"")+s;
  }
  function addLine(txt,cls){
    var li=document.createElement("li");
    li.className=cls||"";
    var b=document.createElement("b");
    b.textContent=stamp();
    li.appendChild(b);
    li.appendChild(document.createTextNode(txt));
    log.insertBefore(li,log.firstChild);
    while(log.children.length>4)log.lastChild.remove();
  }
  function paint(){
    var out="";
    for(var i=0;i<4;i++)out+=(i<entry.length?entry.charAt(i):"\u2013");
    digits.textContent=out.split("").join(" ");
    tries.textContent=(attempts<10?"0":"")+attempts;
  }
  function strike(){
    boltTxt.textContent="thrown";
    stateTxt.textContent="secured";
  }
  function unlock(){
    okT=1;
    throwT=1;
    door.style.setProperty("--liftA","1");
    setTimeout(function(){door.style.setProperty("--liftB","1")},130);
    setTimeout(function(){door.style.setProperty("--liftC","1")},260);
    setTimeout(strike,540);
    addLine("code accepted, bolt thrown","is-ok");
  }
  function deny(){
    attempts++;
    badT=1;
    okT=0;
    door.style.setProperty("--liftA","0");
    door.style.setProperty("--liftB","0");
    door.style.setProperty("--liftC","0");
    form.classList.remove("is-bad");
    form.getBoundingClientRect();
    form.classList.add("is-bad");
    boltTxt.textContent="open";
    stateTxt.textContent="fault";
    addLine("code rejected, fault latched","is-bad");
    lockUntil=performance.now()+2600;
    console_.classList.add("is-locked","is-fault");
    setTimeout(function(){
      console_.classList.remove("is-locked","is-fault");
      stateTxt.textContent="armed";
      addLine("keypad released, awaiting code");
    },2600);
  }

  form.addEventListener("click",function(e){
    var k=e.target.closest?e.target.closest(".key"):null;
    if(!k)return;
    if(performance.now()<lockUntil)return;
    var v=k.dataset.k;
    k.classList.add("is-hit");
    setTimeout(function(){k.classList.remove("is-hit")},120);
    if(v==="c"){entry="";paint();addLine("entry cleared");return}
    if(v==="b"){entry=entry.slice(0,-1);paint();return}
    if(entry.length<4){entry+=v;paint()}
  });
  form.addEventListener("submit",function(e){
    e.preventDefault();
    if(performance.now()<lockUntil)return;
    if(entry===PIN)unlock();
    else deny();
    entry="";
    paint();
  });
  submit.addEventListener("pointerdown",function(){
    if(!reduce)submit.classList.add("is-down");
  });
  window.addEventListener("pointerup",function(){submit.classList.remove("is-down")});
  submit.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" ")submit.classList.add("is-down");
  });
  submit.addEventListener("keyup",function(){submit.classList.remove("is-down")});
  paint();

  if(reduce){
    door.style.setProperty("--liftA","1");
    door.style.setProperty("--liftB","1");
    door.style.setProperty("--liftC","1");
    form.style.setProperty("--throw","1");
    strike();
    return;
  }

  function frame(now){
    var dt=last?Math.min(.06,(now-last)/1000):.016;
    last=now;
    throwV+=(throwT-throwV)*Math.min(1,dt*(throwT>throwV?7.5:9));
    okV+=(okT-okV)*Math.min(1,dt*(okT>okV?6:2.2));
    badV+=(badT-badV)*Math.min(1,dt*(badT>badV?16:4.5));
    badT=Math.max(0,badT-dt*.55);
    if(now<lockUntil)badT=Math.max(badT,.46+.2*Math.sin((now-t0)/110));
    door.style.setProperty("--throw",throwV.toFixed(4));
    door.style.setProperty("--ok",okV.toFixed(4));
    door.style.setProperty("--bad",badV.toFixed(4));
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
