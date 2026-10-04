const input=document.getElementById('tagInput');
const tags=document.getElementById('tags');
function addTag(val){
  val=val.trim();
  if(!val||[...tags.querySelectorAll('.chip')].some(c=>c.dataset.v===val))return;
  const chip=document.createElement('span');chip.className='chip';chip.dataset.v=val;
  // El valor del chip sale de un input del usuario: se inserta con
  // textContent, no con innerHTML, para que "<script>" o un evento inline no
  // se ejecuten. La equis del boton se crea tambien por DOM.
  chip.textContent = val + ' ';
  const cerrar = document.createElement('button');
  cerrar.textContent = '×';
  cerrar.addEventListener('click', () => chip.remove());
  chip.appendChild(cerrar);
  tags.appendChild(chip);
}
input.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===','){e.preventDefault();addTag(input.value);input.value='';}
  else if(e.key==='Backspace'&&!input.value){const last=tags.querySelector('.chip:last-child');if(last)last.remove();}
});