// NEON ITALIANO — direct port of the NEON ENGLISH Canvas Mind Map engine.
// Adaptation: Italian vocabulary stores synonyms/collocations as strings instead of arrays.
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
    this.draggedNode = null;
    this.hoveredNode = null;
    this.activeWord = null;
    this.animId = null;
    this.particles = [];
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStart = {x:0,y:0};
    this.lastPointer = null;
    this.initEvents();
    this.resize();
  }
  split(value){
    if(Array.isArray(value)) return value.filter(Boolean);
    return String(value||'').split(/\s*[·,;]\s*/).map(x=>x.trim()).filter(Boolean);
  }
  resize(){
    const rect=this.container.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    this.canvas.width=Math.max(320,Math.floor((rect.width||800)*dpr));
    this.canvas.height=Math.max(420,Math.floor((rect.height||560)*dpr));
    this.canvas.style.width='100%';
    this.canvas.style.height='100%';
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    this.width=rect.width||800; this.height=rect.height||560;
  }
  loadWord(wordObj){
    this.activeWord=wordObj; this.resize();
    const cx=this.width/2,cy=this.height/2;
    this.nodes=[];this.edges=[];this.particles=[];
    const synonyms=this.split(wordObj.synonyms), antonyms=this.split(wordObj.antonyms), collocations=this.split(wordObj.collocations);
    const center={id:'center',label:String(wordObj.word||''),sub:String(wordObj.translation||''),type:'root',x:cx,y:cy,vx:0,vy:0,radius:48,color:'#ff4d1c',glow:'rgba(255,77,28,.72)'};
    this.nodes.push(center);
    const sats=[
      {id:'hook',label:'🧠 Memory Hook',sub:wordObj.hook,color:'#ffd166',children:[]},
      {id:'synonyms',label:'🔗 Synonyms',sub:synonyms.join(', ')||'Aucun',color:'#ff6b35',children:synonyms.map((s,i)=>({id:'syn_'+i,label:s,color:'#ff9f68'}))},
      {id:'antonyms',label:'⚡ Antonyms',sub:antonyms.join(', ')||'Aucun',color:'#c94b2c',children:antonyms.map((a,i)=>({id:'ant_'+i,label:a,color:'#ff7b59'}))},
      {id:'collocations',label:'💼 Collocations',sub:collocations.slice(0,3).join(' • ')||'Aucune',color:'#ffb347',children:collocations.map((c,i)=>({id:'col_'+i,label:c,color:'#ffd166'}))},
      {id:'story',label:'🎭 Mini Story',sub:wordObj.story||'',color:'#ff7a45',children:[]},
      {id:'speak',label:'🗣️ Practice',sub:'“'+String(wordObj.example||'')+'”',color:'#ff4d1c',children:[]}
    ];
    const radiusDist=Math.min(cx,cy)*.52;
    sats.forEach((sat,index)=>{
      const angle=index/sats.length*Math.PI*2-Math.PI/2;
      const sx=cx+Math.cos(angle)*radiusDist,sy=cy+Math.sin(angle)*radiusDist;
      const node={id:sat.id,label:sat.label,sub:sat.sub,type:'satellite',x:sx,y:sy,vx:0,vy:0,radius:36,color:sat.color,glow:'rgba(255,120,60,.55)'};
      this.nodes.push(node);this.edges.push({from:center,to:node,color:sat.color});
      sat.children.forEach((child,ci)=>{
        const ca=angle+(ci-(sat.children.length-1)/2)*.45,dist=radiusDist*.58;
        const leaf={id:child.id,label:child.label,type:'leaf',x:sx+Math.cos(ca)*dist,y:sy+Math.sin(ca)*dist,vx:0,vy:0,radius:22,color:child.color,glow:'rgba(255,180,100,.3)'};
        this.nodes.push(leaf);this.edges.push({from:node,to:leaf,color:sat.color});
      });
    });
    for(let i=0;i<18;i++){const edge=this.edges[Math.floor(Math.random()*this.edges.length)];this.particles.push({edge,progress:Math.random(),speed:.004+Math.random()*.006});}
    this.startLoop();
  }
  getPos(e){const r=this.canvas.getBoundingClientRect(),touch=e.touches&&e.touches[0];const x=touch?touch.clientX:e.clientX,y=touch?touch.clientY:e.clientY;return{x:(x-r.left-this.panX)/this.scale,y:(y-r.top-this.panY)/this.scale};}
  findNodeAt(pos){for(let i=this.nodes.length-1;i>=0;i--){const n=this.nodes[i],dx=n.x-pos.x,dy=n.y-pos.y;if(Math.hypot(dx,dy)<=n.radius+8)return n;}return null;}
  initEvents(){
    const down=e=>{if(e.cancelable)e.preventDefault();const p=this.getPos(e),target=this.findNodeAt(p);if(target){this.draggedNode=target;this.lastPointer=p;}else{this.isPanning=true;const t=e.touches&&e.touches[0],x=t?t.clientX:e.clientX,y=t?t.clientY:e.clientY;this.panStart={x:x-this.panX,y:y-this.panY};}};
    const move=e=>{if(e.cancelable)e.preventDefault();const p=this.getPos(e);this.hoveredNode=this.findNodeAt(p);if(this.draggedNode){this.draggedNode.x=p.x;this.draggedNode.y=p.y;}else if(this.isPanning){const t=e.touches&&e.touches[0],x=t?t.clientX:e.clientX,y=t?t.clientY:e.clientY;this.panX=x-this.panStart.x;this.panY=y-this.panStart.y;}};
    const up=()=>{if(this.draggedNode)this.onNodeClick(this.draggedNode);this.draggedNode=null;this.isPanning=false;};
    this.canvas.addEventListener('mousedown',down);this.canvas.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
    this.canvas.addEventListener('touchstart',down,{passive:false});this.canvas.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',up,{passive:true});
    this.canvas.addEventListener('wheel',e=>{e.preventDefault();const factor=e.deltaY<0?1.08:.92;this.scale=Math.max(.55,Math.min(1.8,this.scale*factor));},{passive:false});
    window.addEventListener('resize',()=>{if(this.activeWord)this.resize();});
  }
  onNodeClick(node){
    if((node.id==='speak'||node.type==='root')&&this.activeWord&&window.speakCurrent)window.speakCurrent(this.activeWord.example);
    const box=document.getElementById('mindmapInfo');
    if(box)box.innerHTML='<b style="color:'+node.color+'">'+this.escape(node.label)+'</b><div style="color:#b8aaa4;margin-top:5px">'+this.escape(node.sub||node.label)+'</div>';
  }
  escape(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  updatePhysics(){for(let i=0;i<this.nodes.length;i++){const a=this.nodes[i];if(a===this.draggedNode)continue;for(let j=i+1;j<this.nodes.length;j++){const b=this.nodes[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,min=a.radius+b.radius+35;if(d<min){const f=(min-d)*.04,fx=dx/d*f,fy=dy/d*f;a.x-=fx;a.y-=fy;b.x+=fx;b.y+=fy;}}}}
  startLoop(){if(this.animId)cancelAnimationFrame(this.animId);const loop=()=>{this.updatePhysics();this.draw();this.animId=requestAnimationFrame(loop);};loop();}
  draw(){
    const ctx=this.ctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,this.canvas.width,this.canvas.height);const dpr=Math.min(window.devicePixelRatio||1,2);ctx.setTransform(dpr*this.scale,0,0,dpr*this.scale,dpr*this.panX,dpr*this.panY);
    this.edges.forEach(edge=>{ctx.beginPath();ctx.moveTo(edge.from.x,edge.from.y);ctx.lineTo(edge.to.x,edge.to.y);ctx.strokeStyle=edge.color;ctx.globalAlpha=.42;ctx.lineWidth=2.5;ctx.stroke();ctx.globalAlpha=1;});
    this.particles.forEach(p=>{p.progress+=p.speed;if(p.progress>1)p.progress=0;const x=p.edge.from.x+(p.edge.to.x-p.edge.from.x)*p.progress,y=p.edge.from.y+(p.edge.to.y-p.edge.from.y)*p.progress;ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle=p.edge.color;ctx.shadowColor=p.edge.color;ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;});
    this.nodes.forEach(n=>{const hover=this.hoveredNode===n,root=n.type==='root';ctx.save();ctx.beginPath();ctx.arc(n.x,n.y,n.radius+(hover?6:0),0,Math.PI*2);ctx.shadowColor=n.color;ctx.shadowBlur=hover?28:root?24:15;ctx.fillStyle=n.color;ctx.globalAlpha=root?.96:.9;ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(n.x,n.y,n.radius,0,Math.PI*2);ctx.strokeStyle=root?'#1b0b06':'#fff4ee';ctx.lineWidth=hover?2.5:1.2;ctx.stroke();ctx.fillStyle=root?'#1b0b06':'#fff4ee';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=root?'900 16px Inter,sans-serif':n.type==='satellite'?'700 12px Inter,sans-serif':'600 11px Inter,sans-serif';let text=n.label;if(text.length>17)text=text.slice(0,15)+'…';ctx.fillText(text,n.x,n.y);});
  }
  resetView(){this.scale=1;this.panX=0;this.panY=0;if(this.activeWord)this.loadWord(this.activeWord);}
}
window.NeonItalianMindMap=NeonItalianMindMap;
