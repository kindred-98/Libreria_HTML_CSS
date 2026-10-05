const inp=document.getElementById('vemail');
const status=document.getElementById('vstatus');
const hints=document.getElementById('vhints');
const rules={
  nonempty:v=>v.length>0,
  atsign:v=>v.includes('@'),
  domain:v=>v.split('@')[1]?.length>1,
  tld:v=>/.[a-z]{2,}$/i.test(v),
};
inp.addEventListener('input',()=>{
  const v=inp.value;
  let pass=0;
  hints.querySelectorAll('li').forEach(li=>{
    const ok=rules[li.dataset.rule](v);
    li.classList.toggle('pass',ok);if(ok)pass++;
  });
  const valid=pass===4;
  // Los dos ternarios van separados: solo hay que marcar el campo cuando hay texto.
  let clase='';
  if(v)clase=valid?'valid':'invalid';
  inp.className='vinput '+clase;
  let marca='';
  if(v)marca=valid?'✅':'❌';
  status.textContent=marca;
});