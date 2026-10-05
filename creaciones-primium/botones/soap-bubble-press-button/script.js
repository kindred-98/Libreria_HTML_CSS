(function(){
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bub=document.querySelector(".bub");
  if(!bub)return;

  function pop(){
    if(reduce)return;
    var r=document.createElement("b");
    r.className="pop";
    var r2=document.createElement("b");
    r2.className="pop pop--2";
    bub.appendChild(r);
    bub.appendChild(r2);
    setTimeout(function(){
      if(r.parentNode)r.remove();
      if(r2.parentNode)r2.remove();
    },1500);
  }

  bub.addEventListener("pointerdown",function(){
    if(bub.classList.contains("is-press"))return;
    bub.classList.add("is-press");
    pop();
    if(reduce)bub.classList.remove("is-press");
  });

  bub.addEventListener("animationend",function(e){
    if(e.animationName==="bp-squash"){
      bub.classList.remove("is-press");
      bub.classList.add("is-burst");
      setTimeout(function(){bub.classList.remove("is-burst")},760);
    }
  });
})();
