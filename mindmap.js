// Interactive HTML5 Canvas Mind Map (Carte Mentale 2D Dynamique & Interactive)
// High-DPI Retina support, Particle physics, Force repulsion, Mouse Drag, Touch Drag, Mouse Wheel Zoom & Pinch-to-Zoom.

class NeonMindMap {
  constructor(canvasOrId) {
    if (typeof canvasOrId === "string") {
      this.canvas = document.getElementById(canvasOrId);
    } else if (canvasOrId instanceof HTMLCanvasElement) {
      this.canvas = canvasOrId;
    } else if (canvasOrId instanceof HTMLElement) {
      this.canvas = canvasOrId.querySelector("canvas") || document.createElement("canvas");
      if (!this.canvas.parentElement) {
        canvasOrId.innerHTML = "";
        canvasOrId.appendChild(this.canvas);
      }
    }

    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.nodes = [];
    this.edges = [];
    this.particles = [];
    this.draggedNode = null;
    this.hoveredNode = null;
    this.activeWord = null;
    this.animId = null;

    // Pan & Zoom
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.lastTouchDist = 0;

    this.initEvents();
  }

  split(val) {
    if (Array.isArray(val)) return val.filter(Boolean);
    return String(val || "")
      .split(/\s*[·,;•]\s*/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = rect.width || 800;
    const h = rect.height || 520;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";

    this.width = w;
    this.height = h;
    this.dpr = dpr;
  }

  loadWord(wordObj) {
    if (!wordObj) return;
    this.activeWord = wordObj;
    this.resize();

    const cx = (this.width || 800) / 2;
    const cy = (this.height || 520) / 2;

    this.nodes = [];
    this.edges = [];
    this.particles = [];

    const synonyms = this.split(wordObj.synonyms);
    const antonyms = this.split(wordObj.antonyms);
    const collocations = this.split(wordObj.collocations);

    // Root node (Center Target Word) — Émeraude Néon
    const centerNode = {
      id: "center",
      label: String(wordObj.word || ""),
      sub: String(wordObj.meaning || wordObj.translation || ""),
      type: "root",
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      radius: 46,
      color: "#00D99A",
      glow: "rgba(0, 217, 154, 0.75)"
    };
    this.nodes.push(centerNode);

    // Satellites
    const satellites = [
      {
        id: "hook",
        label: "🧠 Memory Hook",
        sub: wordObj.hook || "Mental anchor",
        color: "#C9B27C",
        children: []
      },
      {
        id: "synonyms",
        label: "🔗 Synonyms",
        sub: synonyms.join(", ") || "None",
        color: "#00A878",
        children: synonyms.slice(0, 4).map((s, idx) => ({ id: `syn_${idx}`, label: s, color: "#00D99A" }))
      },
      {
        id: "antonyms",
        label: "⚡ Antonyms",
        sub: antonyms.join(", ") || "None",
        color: "#507C6D",
        children: antonyms.slice(0, 3).map((a, idx) => ({ id: `ant_${idx}`, label: a, color: "#8AAEA3" }))
      },
      {
        id: "collocations",
        label: "💼 Collocations",
        sub: collocations.slice(0, 3).join(" • ") || "None",
        color: "#00D99A",
        children: collocations.slice(0, 3).map((c, idx) => ({ id: `col_${idx}`, label: c, color: "#66F5CC" }))
      },
      {
        id: "story",
        label: "🎭 Mini Story",
        sub: wordObj.story || "",
        color: "#C9B27C",
        children: []
      },
      {
        id: "speak",
        label: "🗣️ Practice",
        sub: `“${wordObj.example || wordObj.word || ""}”`,
        color: "#00A878",
        children: []
      }
    ];

    const orbitRadius = Math.min(cx, cy) * 0.55;

    satellites.forEach((sat, i) => {
      const angle = (i / satellites.length) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(angle) * orbitRadius;
      const sy = cy + Math.sin(angle) * orbitRadius;

      const satNode = {
        id: sat.id,
        label: sat.label,
        sub: sat.sub,
        type: "satellite",
        x: sx,
        y: sy,
        vx: 0,
        vy: 0,
        radius: 34,
        color: sat.color,
        glow: sat.color + "88"
      };

      this.nodes.push(satNode);
      this.edges.push({ from: centerNode, to: satNode, color: sat.color });

      // Child leaves
      if (sat.children && sat.children.length > 0) {
        sat.children.forEach((child, ci) => {
          const childAngle = angle + (ci - (sat.children.length - 1) / 2) * 0.45;
          const leafDist = orbitRadius * 0.56;
          const leafNode = {
            id: child.id,
            label: child.label,
            sub: "",
            type: "leaf",
            x: sx + Math.cos(childAngle) * leafDist,
            y: sy + Math.sin(childAngle) * leafDist,
            vx: 0,
            vy: 0,
            radius: 20,
            color: child.color,
            glow: child.color + "66"
          };
          this.nodes.push(leafNode);
          this.edges.push({ from: satNode, to: leafNode, color: sat.color });
        });
      }
    });

    // Generate traveling energy particles along edges
    for (let p = 0; p < 20; p++) {
      const edge = this.edges[Math.floor(Math.random() * this.edges.length)];
      this.particles.push({
        edge,
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005
      });
    }

    this.startLoop();
  }

  getPointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left - this.panX) / this.scale,
      y: (clientY - rect.top - this.panY) / this.scale
    };
  }

  findNodeAt(pos) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dist = Math.hypot(n.x - pos.x, n.y - pos.y);
      if (dist <= n.radius + 8) return n;
    }
    return null;
  }

  initEvents() {
    if (!this.canvas) return;

    const onPointerDown = (e) => {
      if (e.cancelable && e.type.startsWith("touch")) e.preventDefault();

      if (e.touches && e.touches.length === 2) {
        this.isPanning = false;
        this.draggedNode = null;
        this.lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        return;
      }

      const pos = this.getPointerPos(e);
      const target = this.findNodeAt(pos);

      if (target) {
        this.draggedNode = target;
      } else {
        this.isPanning = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.panStart = { x: clientX - this.panX, y: clientY - this.panY };
      }
    };

    const onPointerMove = (e) => {
      if (e.cancelable && e.type.startsWith("touch")) e.preventDefault();

      if (e.touches && e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (this.lastTouchDist > 0) {
          const factor = dist / this.lastTouchDist;
          this.scale = Math.max(0.5, Math.min(2.0, this.scale * factor));
        }
        this.lastTouchDist = dist;
        return;
      }

      const pos = this.getPointerPos(e);
      this.hoveredNode = this.findNodeAt(pos);
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

    const onPointerUp = () => {
      if (this.draggedNode) {
        this.onNodeClick(this.draggedNode);
      }
      this.draggedNode = null;
      this.isPanning = false;
      this.lastTouchDist = 0;
      this.canvas.style.cursor = "default";
    };

    this.canvas.addEventListener("mousedown", onPointerDown);
    this.canvas.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    this.canvas.addEventListener("touchstart", onPointerDown, { passive: false });
    this.canvas.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp, { passive: true });

    // Wheel Zoom
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.scale = Math.max(0.5, Math.min(2.0, this.scale * zoomFactor));
    }, { passive: false });

    window.addEventListener("resize", () => {
      if (this.activeWord) this.resize();
    });
  }

  onNodeClick(node) {
    if (!node) return;

    // Trigger English speech synthesis
    if ((node.id === "speak" || node.type === "root") && this.activeWord && window.speakCurrent) {
      window.speakCurrent(this.activeWord.example || this.activeWord.word);
    }

    const infoBox = document.getElementById("mindmapInfo");
    if (infoBox) {
      const label = this.escape(node.label);
      const sub = this.escape(node.sub || node.label);
      infoBox.innerHTML = `
        <div style="color:${node.color}; font-weight:800; font-size:15px;">${label}</div>
        <div style="color:var(--muted, #A7AFAB); margin-top:4px; font-size:13px;">${sub}</div>
      `;
    }
  }

  escape(s) {
    return String(s || "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  updatePhysics() {
    for (let i = 0; i < this.nodes.length; i++) {
      const a = this.nodes[i];
      if (a === this.draggedNode) continue;

      for (let j = i + 1; j < this.nodes.length; j++) {
        const b = this.nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 1;
        const minDist = a.radius + b.radius + 32;

        if (dist < minDist) {
          const force = (minDist - dist) * 0.04;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.x -= fx;
          a.y -= fy;
          b.x += fx;
          b.y += fy;
        }
      }
    }
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);

    const loop = () => {
      this.updatePhysics();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };

    loop();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const dpr = this.dpr || Math.min(window.devicePixelRatio || 1, 2);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.setTransform(dpr * this.scale, 0, 0, dpr * this.scale, dpr * this.panX, dpr * this.panY);

    // Draw Edges
    this.edges.forEach(edge => {
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = edge.color;
      ctx.globalAlpha = 0.38;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw Traveling Energy Particles
    this.particles.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;

      const x = p.edge.from.x + (p.edge.to.x - p.edge.from.x) * p.progress;
      const y = p.edge.from.y + (p.edge.to.y - p.edge.from.y) * p.progress;

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = p.edge.color;
      ctx.shadowColor = p.edge.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Nodes
    this.nodes.forEach(n => {
      const isHovered = this.hoveredNode === n;
      const isRoot = n.type === "root";

      ctx.save();
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius + (isHovered ? 5 : 0), 0, Math.PI * 2);
      ctx.shadowColor = n.color;
      ctx.shadowBlur = isHovered ? 26 : isRoot ? 22 : 14;
      ctx.fillStyle = n.color;
      ctx.globalAlpha = isRoot ? 0.96 : 0.90;
      ctx.fill();
      ctx.restore();

      // Border outline
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isRoot ? "#0B0D0C" : "#F1F3F1";
      ctx.lineWidth = isHovered ? 2.5 : 1.2;
      ctx.stroke();

      // Text label
      ctx.fillStyle = isRoot ? "#0B0D0C" : "#F1F3F1";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = isRoot
        ? "900 15px Inter, -apple-system, sans-serif"
        : n.type === "satellite"
          ? "700 12px Inter, -apple-system, sans-serif"
          : "600 10.5px Inter, -apple-system, sans-serif";

      let text = n.label;
      if (text.length > 18) text = text.slice(0, 16) + "…";
      ctx.fillText(text, n.x, n.y);
    });
  }

  resetView() {
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    if (this.activeWord) this.loadWord(this.activeWord);
  }
}

window.NeonMindMap = NeonMindMap;
