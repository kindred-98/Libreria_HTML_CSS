document.querySelectorAll('.theme-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.documentElement.dataset.theme = btn.dataset.theme;
    document.querySelectorAll('.theme-btn').forEach(b=>b.classList.toggle('active',b===btn));
  });
});