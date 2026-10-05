const cells=[...document.querySelectorAll('.otp-cell')];
cells.forEach((c,i)=>{
  c.addEventListener('input',e=>{
    c.value=c.value.replace(/\D/g,'');
    c.classList.toggle('filled',c.value!=='');
    if(c.value&&i<5)cells[i+1].focus();
  });
  c.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!c.value&&i>0)cells[i-1].focus();});
});
cells[0].parentElement.addEventListener('paste',e=>{
  const data=(e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
  cells.forEach((c,i)=>{c.value=data[i]||'';c.classList.toggle('filled',!!c.value);});
  cells[Math.min(data.length,5)].focus();e.preventDefault();
});
document.getElementById('otpBtn').addEventListener('click',()=>{
  const code=cells.map(c=>c.value).join('');
  alert(code.length===6?'Code: '+code:'Please enter all 6 digits.');
});