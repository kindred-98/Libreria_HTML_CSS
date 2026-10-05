const dz=document.getElementById('dz');
const fi=document.getElementById('fileInput');
const fl=document.getElementById('fileList');
['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('over')}));
['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('over')}));
dz.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
fi.addEventListener('change',()=>addFiles(fi.files));
dz.addEventListener('click',e=>{if(!e.target.closest('label'))fi.click();});
function addFiles(files){
  [...files].forEach(f=>{
    // Se construye con createElement + textContent para que el nombre del
    // archivo (que viene del usuario) se inserte como texto, no como HTML.
    // Antes iba en `li.innerHTML = '...'` y CodeQL marcaba "DOM text
    // reinterpreted as HTML" aunque el demo solo lo ve quien arrastra sus
    // propios archivos.
    const li=document.createElement('li');
    let icon='📎';
    if(f.type.includes('image'))icon='🖼️';
    else if(f.type.includes('pdf'))icon='📄';
    const size=(f.size/1024).toFixed(1)+'KB';
    const s1=document.createElement('span'); s1.textContent=icon+' '+f.name;
    const s2=document.createElement('span'); s2.textContent=size; s2.style.color='#475569';
    const btn=document.createElement('button'); btn.title='Remove'; btn.textContent='✕';
    btn.onclick=()=>li.remove();
    li.appendChild(s1); li.appendChild(s2); li.appendChild(btn);
    fl.appendChild(li);
  });
}