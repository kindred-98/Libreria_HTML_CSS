(function(){
  var ids=["k0","k1","k2"];
  var knobs=[],dials=[],rings=[],nums=[];
  for(var id of ids){
    var k=document.getElementById(id);
    if(!k)return;
    knobs.push(k);
    dials.push(k.querySelector(".knob__dial"));
    rings.push(k.querySelector(".knob__ring"));
    nums.push(k.querySelector(".knob__num"));
  }
  var N=12;
  var step=360/N;
  var idx=[3,7,11];
  var ang=[0,0,0];
  var vel=[0,0,0];
  var rate=[340,470,690];
  var acc=[40,205,430];
  var dir=[1,-1,1];
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0=0,last=0;

  function paint(i){
    var a=ang[i];
    dials[i].style.setProperty("--a",a.toFixed(2));
    rings[i].style.setProperty("--a",(-a).toFixed(2));
    var n=((Math.round(a/step)%N)+N)%N;
    nums[i].textContent=(n<10?"0":"")+n;
  }

  function step1(i){
    idx[i]=(idx[i]+1)%N;
    knobs[i].classList.add("is-hit");
    setTimeout(function(){knobs[i].classList.remove("is-hit")},150);
  }

  for(var q=0;q<ids.length;q++){
    (function(i){
      knobs[i].addEventListener("click",function(){
        step1(i);
        idx[i]=(idx[i]+(i===1?2:1))%N;
      });
    })(q);
  }

  function frame(t){
    if(!t0)t0=t;
    var dt=last?Math.min(.05,(t-last)/1000):.016;
    last=t;
    var i;
    for(i=0;i<knobs.length;i++){
      acc[i]+=dt*1000;
      if(acc[i]>=rate[i]){
        acc[i]-=rate[i];
        idx[i]=(idx[i]+dir[i]+N)%N;
        knobs[i].classList.add("is-hit");
        setTimeout(function(el){return function(){el.classList.remove("is-hit")};}(knobs[i]),150);
      }
      var target=idx[i]*step;
      if(target-ang[i]>180)target-=360;
      if(ang[i]-target>180)target+=360;
      vel[i]+=(target-ang[i])*520*dt;
      vel[i]*=Math.exp(-13*dt);
      ang[i]+=vel[i]*dt;
      paint(i);
    }
    requestAnimationFrame(frame);
  }

  if(reduce){
    for(var r=0;r<knobs.length;r++){
      ang[r]=idx[r]*step;
      knobs[r].querySelector(".knob__notch").style.opacity=".8";
      paint(r);
    }
  }else{
    for(var s=0;s<knobs.length;s++)paint(s);
    requestAnimationFrame(frame);
  }
})();
