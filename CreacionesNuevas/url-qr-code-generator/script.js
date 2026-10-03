const genBtn=document.getElementById('qrGen');
const urlIn=document.getElementById('qrUrl');
const img=document.getElementById('qrImg');
const hint=document.getElementById('qrHint');
const dlBtn=document.getElementById('dlBtn');
genBtn.addEventListener('click',()=>{
  const url=urlIn.value.trim();if(!url)return;
  try{
    const qr=qrcode(0,'M');qr.addData(url);qr.make();
    // El tamano se calcula para que el GIF nazca cerca de los 180px que fija el
    // CSS de #qrImg: si nace mucho mas grande el navegador lo reduce y el QR
    // pierde nitidez, y si nace mucho mas pequeno lo amplia y sale borroso.
    const n=qr.getModuleCount();const s=Math.max(1,Math.round(180/(n+8)));
    img.src=qr.createDataURL(s);img.hidden=false;hint.hidden=true;dlBtn.removeAttribute('hidden');
  }catch(e){
    // qrcode-generator lanza una cadena, no un Error, cuando la URL no cabe en
    // el QR. Se comprueba el texto para no tapar ningun otro fallo real.
    if(String(e).indexOf('code length overflow')<0)throw e;
    img.hidden=true;dlBtn.setAttribute('hidden','');
    hint.textContent='URL too long for a QR code';hint.hidden=false;
  }
});
dlBtn.addEventListener('click',()=>{const a=document.createElement('a');a.href=img.src;a.download='qrcode.gif';a.click();});
