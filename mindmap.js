// Interactive HTML5 Canvas Mind Map (Carte Mentale Interactive)

class NeonMindMap {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
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
    this.panStart = { x: 0, y: 0 };

    this.initEvents();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width || 800;
    this.canvas.height = rect.height || 550;
  }

  loadWord(wordObj) {
    this.activeWord = wordObj;
    this.resize();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    this.nodes = [];
    this.edges = [];
    this.particles = [];

    // Central Node (Target Word) — Émeraude Néon
    const centerNode = {
      id: "center",
      label: wordObj.word,
      sub: wordObj.meaning,
      type: "root",
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: 48,
      color: "#00D99A",
      glow: "rgba(0, 217, 154, 0.65)"
    };
    this.nodes.push(centerNode);

    // Satellite Nodes matching custom luxury emerald palette
    const satellites = [
      {
        id: "hook",
        label: "🧠 Memory Hook",
        sub: wordObj.hook,
        color: "#C9B27C",
        glow: "rgba(201, 178, 124, 0.55)",
        children: []
      },
      {
        id: "synonyms",
        label: "🔗 Synonyms",
        sub: wordObj.synonyms.join(", ") || "None",
        color: "#00A878",
        glow: "rgba(0, 168, 120, 0.55)",
        children: wordObj.synonyms.map((s, i) => ({ id: `syn_${i}`, label: s, color: "#00D99A" }))
      },
      {
        id: "antonyms",
        label: "⚡ Antonyms",
        sub: wordObj.antonyms.join(", ") || "None",
        color: "#507C6D",
        glow: "rgba(80, 124, 109, 0.55)",
        children: wordObj.antonyms.map((a, i) => ({ id: `ant_${i}`, label: a, color: "#8AAEA3" }))
      },
      {
        id: "collocations",
        label: "💼 Collocations",
        sub: wordObj.collocations.slice(0, 3).join(" • "),
        color: "#00D99A",
        glow: "rgba(0, 217, 154, 0.55)",
        children: wordObj.collocations.map((c, i) => ({ id: `col_${i}`, label: c, color: "#66F5CC" }))
      },
      {
        id: "story",
        label: "🎭 Mini Story",
        sub: wordObj.story,
        color: "#C9B27C",
        glow: "rgba(201, 178, 124, 0.55)",
        children: []
      },
      {
        id: "speak",
        label: "🗣️ Practice",
        sub: `“${wordObj.example}”`,
        color: "#00A878",
        glow: "rgba(0, 168, 120, 0.55)",
        children: []
      }
    ];

    const radiusDist = Math.min(cx, cy) * 0.52;
    satellites.forEach((sat, index) => {
      const angle = (index / satellites.length) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(angle) * radiusDist;
      const sy = cy + Math.sin(angle) * radiusDist;

      const satNode = {
        id: sat.id,
        label: sat.label,
        sub: sat.sub,
        type: "satellite",
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        radius: 36,
        color: sat.color,
        glow: sat.glow
      };
      this.nodes.push(satNode);
      this.edges.push({ from: centerNode, to: satNode, color: sat.color });

      // Add child detail nodes around satellites
      if (sat.children && sat.children.length > 0) {
        sat.children.forEach((child, cIdx) => {
          const childAngle = angle + ((cIdx - (sat.children.length - 1) / 2) * 0.45);
          const childDist = radiusDist * 0.58;
          const childNode = {
            id: child.id,
            label: child.label,
            type: "leaf",
            x: sx + Math.cos(childAngle) * childDist,
            y: sy + Math.sin(childAngle) * childDist,
            vx: 0,
            vy: 0,
            radius: 22,
            color: child.color,
            glow: "rgba(255, 255, 255, 0.3)"
          };
          this.nodes.push(childNode);
          this.edges.push({ from: satNode, to: childNode, color: sat.color });
        });
      }
    });

    // Spawn energy particles along edges
    for (let i = 0; i < 16; i++) {
      const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
      this.particles.push({
        edge,
        progress: Math.random(),
        speed: 0.004 + Math.random() * 0.006
      });
    }

    this.startLoop();
  }

  initEvents() {
    const getPos = e => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left - this.panX) / this.scale,
        y: (clientY - rect.top - this.panY) / this.scale
      };
    };

    const findNodeAt = pos => {
      for (let i = this.nodes.length - 1; i >= 0; i--) {
        const n = this.nodes[i];
        const dx = n.x - pos.x;
        const dy = n.y - pos.y;
        if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 6) return n;
      }
      return null;
    };

    const onDown = e => {
      const pos = getPos(e);
      const target = findNodeAt(pos);
      if (target) {
        this.draggedNode = target;
      } else {
        this.isPanning = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.panStart = { x: clientX - this.panX, y: clientY - this.panY };
      }
    };

    const onMove = e => {
      const pos = getPos(e);
      this.hoveredNode = findNodeAt(pos);
      this.canvas.style.cursor = this.hoveredNode ? "pointer" : this.isPanning ? "grabbing" : "default";

      if (this.draggedNode) {
        this.draggedNode.x = pos.x;
        this.draggedNode.y = pos.y;
      } else if (this.isPanning) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.panX = clientX - this.panStart.x;
        this.panY = clientY - this.panStart.y;
      }
    };

    const onUp = e => {
      if (this.draggedNode && !this.isPanning) {
        this.onNodeClick(this.draggedNode);
      }
      this.draggedNode = null;
      this.isPanning = false;
    };

    this.canvas.addEventListener("mousedown", onDown);
    this.canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    this.canvas.addEventListener("touchstart", onDown, { passive: true });
    this.canvas.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
  }

  onNodeClick(node) {
    if (node.id === "speak" || node.type === "root") {
      if (this.activeWord && window.speakCurrent) {
        window.speakCurrent(this.activeWord.example);
      }
    }
    const infoBox = document.getElementById("mindmapInfo");
    if (infoBox) {
      infoBox.innerHTML = `
        <div style="color:${node.color}; font-weight:800; font-size:16px;">${node.label}</div>
        <div style="color:#A7AFAB; margin-top:4px; font-size:13px;">${node.sub || node.label}</div>
      `;
    }
  }

  updatePhysics() {
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      if (n1 === this.draggedNode) continue;

      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const dx = n2.x - n1.x;
        const dy = n2.y - n1.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = n1.radius + n2.radius + 35;

        if (dist < minDist) {
          const force = (minDist - dist) * 0.04;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.x -= fx;
          n1.y -= fy;
          n2.x += fx;
          n2.y += fy;
        }
      }
    }
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const render = () => {
      this.updatePhysics();
      this.draw();
      this.animId = requestAnimationFrame(render);
    };
    render();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.scale, this.scale);

    // Draw Edges
    this.edges.forEach(edge => {
      this.ctx.beginPath();
      this.ctx.moveTo(edge.from.x, edge.from.y);
      this.ctx.lineTo(edge.to.x, edge.to.y);
      this.ctx.strokeStyle = edge.color;
      this.ctx.globalAlpha = 0.4;
      this.ctx.lineWidth = 2.5;
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    });

    // Draw Traveling Particles along Edges
    this.particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
      const px = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * p.progress;
      const py = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * p.progress;

      this.ctx.beginPath();
      this.ctx.arc(px, py, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = p.edge.color;
      this.ctx.shadowColor = p.edge.color;
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Draw Nodes
    this.nodes.forEach(node => {
      const isHovered = this.hoveredNode === node;
      const isRoot = node.type === "root";

      // Glow effect
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius + (isHovered ? 6 : 0), 0, Math.PI * 2);
      this.ctx.shadowColor = node.color;
      this.ctx.shadowBlur = isHovered ? 28 : isRoot ? 22 : 14;
      this.ctx.fillStyle = node.color;
      this.ctx.globalAlpha = isRoot ? 0.95 : 0.88;
      this.ctx.fill();
      this.ctx.restore();

      // Inner border
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = isRoot ? "#0B0D0C" : "#F1F3F1";
      this.ctx.lineWidth = isHovered ? 2.5 : 1.2;
      this.ctx.stroke();

      // Label Text
      this.ctx.fillStyle = isRoot ? "#0B0D0C" : "#F1F3F1";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.font = isRoot ? "900 16px Inter, sans-serif" : node.type === "satellite" ? "700 12px Inter, sans-serif" : "600 11px Inter, sans-serif";

      let text = node.label;
      if (text.length > 16) text = text.substring(0, 14) + "…";
      this.ctx.fillText(text, node.x, node.y);
    });

    this.ctx.restore();
  }

  resetView() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    if (this.activeWord) this.loadWord(this.activeWord);
  }
}

window.NeonMindMap = NeonMindMap;
