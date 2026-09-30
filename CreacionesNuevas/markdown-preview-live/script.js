const inp=document.getElementById('mdInput');const prev=document.getElementById('mdPreview');
function parse(md){
  return md.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/```([sS]*?)```/g,'<pre><code>$1</code></pre>').replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>').replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s,'<ul>$1<\/ul>').replace(/\n\n/g,'<br>');
}
inp.addEventListener('input',()=>prev.innerHTML=parse(inp.value));
prev.innerHTML=parse(inp.value);