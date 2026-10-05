const palette=document.getElementById('palette');
const toast=document.getElementById('toast');
function rndHex(){return '#'+Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0');}
function gen(){
  palette.innerHTML='';
  for(let i=0;i<5;i++){
    const c=rndHex();const s=document.createElement('div');s.className='swatch';
    s.style.background=c;s.innerHTML='<span class="sw-hex">'+c+'</span>';
    s.addEventListener('click',()=>{navigator.clipboard?.writeText(c).catch(()=>{});showToast(c+' copied!');});
    palette.appendChild(s);
  }
}
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1800);}
document.getElementById('genBtn').addEventListener('click',gen);gen();