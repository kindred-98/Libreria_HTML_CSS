(function(){
  var log=document.getElementById("log");
  var key=document.querySelector(".tw");
  if(!log)return;
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MAX=8;
  var count=0;

  var SCRIPT=[
    ["carriage return at margin 0","ln"],
    ["line 002 struck in 38 ms","ln--ok"],
    ["spool L 4.2 turns &middot; spool R 4.2 turns","ln--sys"],
    ["ribbon tension 0.41 N low","ln--warn"],
    ["typebar 7 seated &middot; escapement clean","ln--sys"],
    ["line 003 struck in 36 ms","ln--ok"],
    ["platen roll 2.1 mm &middot; impression even","ln"],
    ["margin stop engaged at column 0","ln--sys"],
    ["line 004 struck in 39 ms","ln--ok"]
  ];
  var si=0;
  var lnNo=5;

  function push(html,cls){
    var p=document.createElement("p");
    p.className="ln "+(cls||"");
    p.innerHTML=html;
    log.appendChild(p);
    count++;
    while(count>MAX){
      var first=log.firstElementChild;
      if(!first)break;
      first.remove();
      count--;
    }
    if(reduce){
      p.classList.add("is-typed");
    }else{
      p.classList.add("is-typing");
      p.addEventListener("animationend",function(){p.classList.remove("is-typing")},{once:true});
    }
    return p;
  }

  function strike(){
    var row=SCRIPT[si%SCRIPT.length];
    si++;
    var line;
    if(/^line \d+ struck/.test(row[0])){
      lnNo++;
      line=push("line "+("00"+lnNo).slice(-3)+" struck in "+(34+Math.round(Math.random()*9))+" ms",row[1]);
    }else{
      line=push(row[0],row[1]);
    }
    if(si%3===0)push("awaiting key","ln");
    return line;
  }

  if(key){
    key.addEventListener("pointerdown",function(){
      if(key.classList.contains("is-hit"))return;
      key.classList.add("is-hit");
      strike();
    });
    key.addEventListener("animationend",function(e){
      if(e.animationName==="tw-jolt"||e.animationName==="tw-line-hit"){
        key.classList.remove("is-hit");
      }
    });
  }

  if(reduce)return;

  var wait=setInterval(function(){strike()},3200);
  document.addEventListener("visibilitychange",function(){
    if(document.hidden){
      clearInterval(wait);
    }else{
      clearInterval(wait);
      wait=setInterval(function(){strike()},3200);
    }
  });
})();
