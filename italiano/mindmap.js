(() => {
'use strict';

class NeonItalianMindMap {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'neon-mindmap-canvas';
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.particles = [];
    this.draggedNode = null;
    this.hoveredNode = null;
    this.isPanning = false;
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.panStart = {x:0,y:0};
    this.activeWord = null;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.initEvents();
    this.resize();
  }

  asList(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || '').split('·').map(x => x.trim()).filter(Boolean);
  }

  resize() {
    const r = this.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.max(320, Math.floor(r.width * dpr));
    this.canvas.height = Math.max(420, Math.floor((r.height || 520) * dpr));
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cssWidth = r.width;
    this.cssHeight = r.height || 520;
  }

  loadWord(word) {
    if (!word) return;
    this.activeWord = word;
    this.scale = 1; this.panX = 0; this.panY = 0;
    this.resize();
    const cx = this.cssWidth / 2, cy = this.cssHeight / 2;
    const synonyms = this.asList(word.synonyms);
    const antonyms = this.asList(word.antonyms);
    const collocations = this.asList(word.collocations);
    const sats = [
      {id:'hook', label:'🧠 Mémoire', sub:word.hook, color:'#ffb52e', children:[]},
      {id:'synonyms', label:'🔗 Synonymes', sub:synonyms.join(' · ') || '—', color:'#ff6b35', children:synonyms.slice(0,4)},
      {id:'antonyms', label:'↔️ Antonymes', sub:antonyms.join(' · ') || '—', color:'#ff4d1c', children:antonyms.slice(0,4)},
      {id:'collocations', label:'🧩 Collocations', sub:collocations.slice(0,3).join(' · ') || '—', color:'#ff8a3d', children:collocations.slice(0,4)},
      {id:'story', label:'🎭 Mini Story', sub:word.story, color:'#ffc857', children:[]},
      {id:'speak', label:'🗣️ Practice', sub:`“${word.example || ''}”`, color:'#ff5a36', children:[]}
    ];
    const root = {id:'center',label:word.word,sub:word.translation,type:'root',x:cx,y:cy,radius:50,color:'#ff4d1c',glow:'rgba(255,77,28,.7)'};
    this.nodes=[root]; this.edges=[]; this.particles=[];
    const radius=Math.min(cx,cy)*.48;
    sats.forEach((s,index)=>{
      const angle=index/sats.length*Math.PI*2-Math.PI/2;
      const sx=cx+Math.cos(angle)*radius, sy=cy+Math.sin(angle)*radius;
      const sat={id:s.id,label:s.label,sub:s.sub,type:'satellite',x:sx,y:sy,radius:38,color:s.color,glow:s.color};
      this.nodes.push(sat); this.edges.push({from:root,to:sat,color:s.color});
      s.children.forEach((label,j)=>{
        const a=angle+(j-(s.children.length-1)/2)*.38;
        const dist=radius*.55;
        const child={id:`${s.id}-${j}`,label,type:'leaf',x:sx+Math.cos(a)*dist,y:sy+Math.sin(a)*dist,radius:24,color:s.color,glow:s.color};
        this.nodes.push(child); this.edges.push({from:sat,to:child,color:s.color});
      });
    });
    for(let i=0;i<18;i++){
      const edge=this.edges[Math.floor(Math.random()*this.edges.length)];
      if(edge)this.particles.push({edge,progress:Math.random(),speed:.004+Math.random()*.006});
    }
    this.loop();
  }

  initEvents() {
    const point=e=>{
      const r=this.canvas.getBoundingClientRect();
      const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
      const y=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
      return {x:(x-this.panX)/this.scale,y:(y-this.panY)/this.scale};
    };
    const hit=p=>{for(let i=this.nodes.length-1;i>=0;i--){const n=this.nodes[i],d=Math.hypot(n.x-p.x,n.y-p.y);if(d<=n.radius+8)return n;}return null;};
    const down=e=>{const p=point(e),n=hit(p);if(n)this.draggedNode=n;else{this.isPanning=true;const x=e.touches?e.touches[0].clientX:e.clientX,y=e.touches?e.touches[0].clientY:e.clientY;this.panStart={x:x-this.panX,y:y-this.panY};}if(e.cancelable)e.preventDefault();};
    const move=e=>{const p=point(e);this.hoveredNode=hit(p);if(this.draggedNode){this.draggedNode.x=p.x;this.draggedNode.y=p.y;}else if(this.isPanning){const x=e.touches?e.touches[0].clientX:e.clientX,y=e.touches?e.touches[0].clientY:e.clientY;this.panX=x-this.panStart.x;this.panY=y-this.panStart.y;}if(e.cancelable)e.preventDefault();};
    const up=()=>{if(this.draggedNode)this.onNodeClick(this.draggedNode);this.draggedNode=null;this.isPanning=false;};
    this.canvas.addEventListener('pointerdown',down);this.canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
    this.canvas.addEventListener('touchstart',down,{passive:false});this.canvas.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',up);
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.scale=Math.max(.65,Math.min(1.8,this.scale*(e.deltaY<0?1.08:.92)));},{passive:false});
  }

  onNodeClick(node) {
    const info=document.getElementById('mindmapInfo');
    if(info)info.innerHTML=`<div style="color:${node.color};font-weight:900;font-size:16px">${this.escape(node.label)}</div><div style="color:#c3c9c6;margin-top:5px;font-size:13px">${this.escape(node.sub||node.label)}</div>`;
    if(node.id==='speak' && window.speakCurrent && this.activeWord)window.speakCurrent(this.activeWord.example||'');
  }
  escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  loop(){if(this.raf)cancelAnimationFrame(this.raf);const tick=()=>{this.physics();this.draw();this.raf=requestAnimationFrame(tick)};tick();}
  physics(){for(let i=0;i<this.nodes.length;i++)for(let j=i+1;j<this.nodes.length;j++){const a=this.nodes[i],b=this.nodes[j];if(a===this.draggedNode||b===this.draggedNode)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.radius+b.radius+26;if(d<min){const f=(min-d)*.025;a.x-=dx/d*f;a.y-=dy/d*f;b.x+=dx/d*f;b.y+=dy/d*f;}}}
  draw(){const ctx=this.ctx,w=this.cssWidth,h=this.cssHeight;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(this.panX,this.panY);ctx.scale(this.scale,this.scale);
    this.edges.forEach(e=>{ctx.beginPath();ctx.moveTo(e.from.x,e.from.y);ctx.lineTo(e.to.x,e.to.y);ctx.strokeStyle=e.color;ctx.globalAlpha=.42;ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1});
    this.particles.forEach(p=>{p.progress+=p.speed;if(p.progress>1)p.progress=0;const x=p.edge.from.x+(p.edge.to.x-p.edge.from.x)*p.progress,y=p.edge.from.y+(p.edge.to.y-p.edge.from.y)*p.progress;ctx.beginPath();ctx.arc(x,y,3.5,0,Math.PI*2);ctx.fillStyle=p.edge.color;ctx.shadowColor=p.edge.color;ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0});
    this.nodes.forEach(n=>{const hover=this.hoveredNode===n,root=n.type==='root';ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,n.radius+(hover?6:0),0,Math.PI*2);ctx.shadowColor=n.color;ctx.shadowBlur=hover?28:root?24:14;ctx.fillStyle=n.color;ctx.globalAlpha=.92;ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(n.x,n.y,n.radius,0,Math.PI*2);ctx.strokeStyle=root?'#2a0b05':'#fff3ed';ctx.lineWidth=hover?2.5:1.2;ctx.stroke();ctx.fillStyle=root?'#170500':'#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=root?'900 16px -apple-system,sans-serif':n.type==='satellite'?'700 11px -apple-system,sans-serif':'600 10px -apple-system,sans-serif';let text=n.label;if(text.length>18)text=text.slice(0,16)+'…';ctx.fillText(text,n.x,n.y)});ctx.restore();
  }
}

window.NeonItalianMindMap=NeonItalianMindMap;

function installMindMap(){
  const box=document.getElementById('mapbox');
  if(!box)return;
  if(!window.__neonItalianMindMap)window.__neonItalianMindMap=new NeonItalianMindMap(box);
  const select=document.getElementById('mapWord');
  const vocab=window.ITALIANO_VOCAB||[];
  const load=()=>{const i=Number(select?.value||0);window.__neonItalianMindMap.loadWord(vocab[i]||vocab[0]);};
  if(select&&!select.dataset.mindmapBound){select.addEventListener('change',load);select.dataset.mindmapBound='1';}
  load();
  const info=document.getElementById('mindmapInfo');
  if(!info){const p=document.createElement('div');p.id='mindmapInfo';p.className='mindmap-info';box.parentElement.insertBefore(p,box.nextSibling);}
}
function boot(){
  const run=()=>{if(document.getElementById('mapbox'))installMindMap();};
  run();
  new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-go="map"]');if(b)setTimeout(run,50);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
