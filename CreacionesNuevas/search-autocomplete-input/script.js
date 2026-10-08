const items=['Button hover effect','Card flip animation','Neon glow text','Progress loader','Toggle switch dark','Skeleton shimmer','Modal dialog','Tooltip hover','Dropdown select','Range slider','Glassmorphism card','Form floating label'];
const inp=document.getElementById('acInput');
const list=document.getElementById('acList');
let sel=-1;
inp.addEventListener('input',()=>{
  const q=inp.value.trim().toLowerCase();
  list.innerHTML='';sel=-1;
  if(!q){list.classList.remove('open');return;}
  const res=items.filter(i=>i.toLowerCase().includes(q));
  if(!res.length){list.classList.remove('open');return;}
  res.forEach((r,i)=>{
    const li=document.createElement('li');
    // Resaltado sin RegExp: la entrada del usuario nunca se interpreta como patron.
    // Se recorren todas las coincidencias (como hacia el replace global) con indexOf
    // sobre el texto en minusculas, y cada trozo se monta con nodos y textContent.
    const bajo=r.toLowerCase();let desde=0;let pos=bajo.indexOf(q,desde);
    if(pos<0){li.textContent=r;}
    else{
      while(pos>=0){
        li.appendChild(document.createTextNode(r.slice(desde,pos)));
        const mark=document.createElement('mark');mark.textContent=r.slice(pos,pos+q.length);
        li.appendChild(mark);desde=pos+q.length;pos=bajo.indexOf(q,desde);
      }
      li.appendChild(document.createTextNode(r.slice(desde)));
    }
    li.addEventListener('click',()=>{inp.value=r;list.classList.remove('open');});
    list.appendChild(li);
  });
  list.classList.add('open');
});
inp.addEventListener('keydown',e=>{
  const lis=[...list.querySelectorAll('li')];
  if(e.key==='ArrowDown'){sel=Math.min(sel+1,lis.length-1);}
  else if(e.key==='ArrowUp'){sel=Math.max(sel-1,0);}
  else if(e.key==='Enter'&&sel>=0){inp.value=lis[sel].textContent;list.classList.remove('open');return;}
  else if(e.key==='Escape'){list.classList.remove('open');}
  lis.forEach((l,i)=>l.classList.toggle('active',i===sel));
});
document.addEventListener('click',e=>{if(!e.target.closest('.ac-wrap'))list.classList.remove('open');});