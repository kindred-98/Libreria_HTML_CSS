const msgs={success:['Saved!','Your changes have been saved.'],error:['Error!','Something went wrong.'],warning:['Warning','Please review your input.'],info:['Info','New update available.']};
const icons={success:'✅',error:'❌',warning:'⚠️',info:'ℹ️'};
document.querySelectorAll('.trigger').forEach(btn=>btn.addEventListener('click',()=>toast(btn.dataset.type)));
function toast(type){
  const [title,sub]=msgs[type];const t=document.createElement('div');
  t.className='toast toast-'+type;
  const icon=document.createElement('span');icon.className='toast-icon';icon.textContent=icons[type];
  const body=document.createElement('div');body.className='toast-body';
  const strong=document.createElement('strong');strong.textContent=title;
  const detail=document.createElement('span');detail.textContent=sub;
  body.append(strong,detail);
  const close=document.createElement('button');close.className='toast-close';close.textContent='✕';
  t.append(icon,body,close);
  document.getElementById('stack').prepend(t);
  t.querySelector('.toast-close').onclick=()=>remove(t);
  setTimeout(()=>remove(t),4000);
}
function remove(t){t.classList.add('removing');setTimeout(()=>t.remove(),300);}