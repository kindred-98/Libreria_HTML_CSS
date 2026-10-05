const c=document.getElementById('c');const ctx=c.getContext('2d');
c.width=window.innerWidth;c.height=window.innerHeight;
window.addEventListener('resize',()=>{c.width=window.innerWidth;c.height=window.innerHeight;});
let mx=c.width/2,my=c.height/2;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
const pts=Array.from({length:60},()=>({
  x:Math.random()*c.width,y:Math.random()*c.height,
  vx:0,vy:0,
  color:'hsl('+(Math.random()*60+220)+',70%,60%)'
}));
function draw(){
  ctx.fillStyle='rgba(5,5,16,.15)';ctx.fillRect(0,0,c.width,c.height);
  pts.forEach(p=>{
    const dx=mx-p.x,dy=my-p.y;
    const dist=Math.hypot(dx, dy)||1;
    const force=Math.min(2000/(dist*dist),2);
    p.vx=(p.vx+(dx/dist)*force)*.9;
    p.vy=(p.vy+(dy/dist)*force)*.9;
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>c.width)p.vx*=-1;
    if(p.y<0||p.y>c.height)p.vy*=-1;
    ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);
    ctx.fillStyle=p.color;ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();