/**
 * math-systems.js — Standalone (no build system needed)
 * Math × Systems interactive learning visualization
 * Blocks, wires, minimal words. Heavy on visuals.
 *
 * Run: python3 -m http.server 8080
 * Export figures: see README.md
 */

// ── Theme (inlined) ──
const STORAGE_KEY = "math-sys-theme";
function getTheme() {
  return document.documentElement.getAttribute("data-theme") || "dark";
}
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(STORAGE_KEY, t);
}
function isDark() {
  return getTheme() !== "light";
}
function initThemeToggle() {
  applyTheme(localStorage.getItem(STORAGE_KEY) || "dark");
  var btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = isDark() ? "Light" : "Dark";
    btn.addEventListener("click", function () {
      applyTheme(isDark() ? "light" : "dark");
      btn.textContent = isDark() ? "Light" : "Dark";
      drawAll();
    });
  }
}
function isDark() {
  return getTheme() !== "light";
}

function C() {
  const d = isDark();
  return {
    text: d ? "#e2e0ef" : "#1a1a2e",
    dim: d ? "#9a96b8" : "#555770",
    muted: d ? "#5e5a78" : "#9ca3af",
    accent: "#e84393",
    cool: "#74b9ff",
    warm: "#e17055",
    green: "#00b894",
    grid: d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    wire: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    wireHi: d ? "rgba(232,67,147,0.5)" : "rgba(200,40,120,0.4)",
    pink: d ? "rgba(232,67,147,0.6)" : "rgba(200,40,120,0.5)",
    pinkSoft: d ? "rgba(232,67,147,0.15)" : "rgba(200,40,120,0.08)",
    blueSoft: d ? "rgba(116,185,255,0.15)" : "rgba(0,100,200,0.08)",
    blue: d ? "rgba(116,185,255,0.7)" : "rgba(0,100,200,0.6)",
    block: d ? "rgba(116,185,255,0.15)" : "rgba(0,100,200,0.1)",
    blockBdr: d ? "rgba(116,185,255,0.4)" : "rgba(0,100,200,0.3)",
  };
}

// ── Canvas helpers ──
function resizeCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.offsetWidth,
    h = canvas.offsetHeight;
  if (!w || !h) return null;
  const pw = Math.round(w * dpr),
    ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ── State ──
let gridSize = 3;
let alpha = 0.5;

// ═══════════════════════════════════════════════════════════
// I. Pipeline wire diagram
// ═══════════════════════════════════════════════════════════
function drawPipeline() {
  const canvas = document.getElementById("pipeline-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const blocks = [
    { label: "R", sub: "dgCMatrix", color: c.cool },
    { label: "FFI", sub: "extendr", color: c.muted },
    { label: "Rust", sub: "faer CSC", color: c.warm },
    { label: "CG", sub: "solve", color: c.green },
    { label: "x", sub: "smoothed", color: c.accent },
  ];

  const bw = 100,
    bh = 60;
  const gap = 40;
  const totalW = blocks.length * bw + (blocks.length - 1) * gap;
  const startX = (W - totalW) / 2;
  const cy = H / 2;

  blocks.forEach((b, i) => {
    const x = startX + i * (bw + gap);
    const y = cy - bh / 2;

    ctx.fillStyle = b.color + "22";
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 1.5;
    rr(ctx, x, y, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = c.text;
    ctx.font = "bold 14px var(--mono, monospace)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.label, x + bw / 2, cy - 8);

    ctx.fillStyle = c.dim;
    ctx.font = "10px var(--mono, monospace)";
    ctx.fillText(b.sub, x + bw / 2, cy + 12);

    if (i < blocks.length - 1) {
      const wx1 = x + bw,
        wx2 = x + bw + gap;
      ctx.strokeStyle = c.wireHi;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx1, cy);
      ctx.lineTo(wx2, cy);
      ctx.stroke();
      ctx.fillStyle = c.wireHi;
      ctx.beginPath();
      ctx.moveTo(wx2 - 6, cy - 4);
      ctx.lineTo(wx2, cy);
      ctx.lineTo(wx2 - 6, cy + 4);
      ctx.fill();
    }
  });
}

// ═══════════════════════════════════════════════════════════
// II. Vectors in Memory
// ═══════════════════════════════════════════════════════════
function drawVectors() {
  const canvas = document.getElementById("vec-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const vals = [2.0, -1.0, -1.0, 0.0];
  const cellW = 70,
    cellH = 40;
  const startX = (W - vals.length * cellW) / 2;

  // Math view
  const mathY = 50;
  ctx.fillStyle = c.dim;
  ctx.font = "12px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("math view", W / 2, mathY - 20);

  vals.forEach((v, i) => {
    const x = startX + i * cellW;
    ctx.fillStyle = c.pinkSoft;
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1;
    rr(ctx, x + 2, mathY, cellW - 4, cellH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = v < 0 ? c.warm : v > 0 ? c.cool : c.muted;
    ctx.font = "bold 13px var(--mono, monospace)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(v.toFixed(1), x + cellW / 2, mathY + cellH / 2);
  });

  // Wire
  const wireY1 = mathY + cellH + 15,
    wireY2 = wireY1 + 30;
  ctx.strokeStyle = c.wireHi;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(W / 2, wireY1);
  ctx.lineTo(W / 2, wireY2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Memory view
  const memY = wireY2 + 10;
  ctx.fillStyle = c.dim;
  ctx.font = "12px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("memory view", W / 2, memY - 5);

  const byteW = 16,
    byteH = 28,
    bytesPerVal = 8;
  const totalBytes = vals.length * bytesPerVal;
  const byteStartX = (W - totalBytes * byteW) / 2;

  vals.forEach((v, vi) => {
    for (let b = 0; b < bytesPerVal; b++) {
      const x = byteStartX + (vi * bytesPerVal + b) * byteW;
      const isFirst = b === 0;
      ctx.fillStyle = vi % 2 === 0 ? c.blueSoft : c.pinkSoft;
      ctx.strokeStyle = isFirst ? (vi % 2 === 0 ? c.cool : c.accent) : c.wire;
      ctx.lineWidth = isFirst ? 1.5 : 0.5;
      ctx.fillRect(x, memY + 10, byteW - 1, byteH);
      ctx.strokeRect(x, memY + 10, byteW - 1, byteH);
    }
    const addrX =
      byteStartX + vi * bytesPerVal * byteW + (bytesPerVal * byteW) / 2;
    ctx.fillStyle = c.muted;
    ctx.font = "8px var(--mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText(
      "0x" + (vi * 8).toString(16).padStart(2, "0"),
      addrX,
      memY + byteH + 22,
    );
  });

  const arrowY = memY + byteH + 35;
  ctx.strokeStyle = c.green;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(byteStartX, arrowY);
  ctx.lineTo(byteStartX + totalBytes * byteW, arrowY);
  ctx.stroke();
  ctx.fillStyle = c.green;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("contiguous · cache-friendly", W / 2, arrowY + 12);
}

// ═══════════════════════════════════════════════════════════
// III. Sparse vs Dense
// ═══════════════════════════════════════════════════════════
function drawSparse() {
  const canvas = document.getElementById("sparse-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const L = [
    [2, -1, -1, 0],
    [-1, 2, 0, -1],
    [-1, 0, 2, -1],
    [0, -1, -1, 2],
  ];
  const n = 4;
  const cellSize = Math.min((W - 80) / (n * 2 + 3), (H - 60) / n);
  const pad = 30;

  // Dense
  const denseX = pad,
    denseY = pad + 10;
  ctx.fillStyle = c.dim;
  ctx.font = "10px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("dense (all 16 cells)", denseX + (n * cellSize) / 2, denseY - 8);

  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const x = denseX + col * cellSize,
        y = denseY + r * cellSize;
      const v = L[r][col];
      ctx.fillStyle = v !== 0 ? c.pinkSoft : c.grid;
      ctx.strokeStyle = v !== 0 ? c.accent + "66" : c.wire;
      ctx.lineWidth = 0.5;
      ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
      ctx.strokeRect(x, y, cellSize - 2, cellSize - 2);
      if (v !== 0) {
        ctx.fillStyle = v < 0 ? c.warm : c.cool;
        ctx.font = "bold 11px var(--mono, monospace)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(v, x + cellSize / 2 - 1, y + cellSize / 2 - 1);
      }
    }
  }

  // Arrow
  const arrowX = denseX + n * cellSize + 20;
  const arrowY = denseY + (n * cellSize) / 2;
  ctx.strokeStyle = c.wireHi;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(arrowX, arrowY);
  ctx.lineTo(arrowX + 30, arrowY);
  ctx.stroke();
  ctx.fillStyle = c.wireHi;
  ctx.beginPath();
  ctx.moveTo(arrowX + 24, arrowY - 4);
  ctx.lineTo(arrowX + 30, arrowY);
  ctx.lineTo(arrowX + 24, arrowY + 4);
  ctx.fill();

  // CSC arrays
  const cscX = arrowX + 50;
  ctx.fillStyle = c.dim;
  ctx.font = "10px var(--mono, monospace)";
  ctx.textAlign = "left";
  ctx.fillText("CSC (3 arrays)", cscX, denseY - 8);

  const arrays = [
    { name: "p", vals: [0, 3, 6, 9, 12], color: c.green },
    { name: "i", vals: [0, 1, 2, 0, 1, 3, 0, 2, 3, 1, 2, 3], color: c.cool },
    {
      name: "x",
      vals: [2, -1, -1, -1, 2, -1, -1, 2, -1, -1, -1, 2],
      color: c.accent,
    },
  ];
  const arrCellW = 22,
    arrCellH = 22;
  arrays.forEach((arr, ai) => {
    const ay = denseY + ai * (arrCellH + 16);
    ctx.fillStyle = arr.color;
    ctx.font = "bold 11px var(--mono, monospace)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(arr.name, cscX + 10, ay + arrCellH / 2);
    arr.vals.forEach((v, vi) => {
      const x = cscX + 18 + vi * arrCellW;
      ctx.fillStyle = arr.color + "22";
      ctx.strokeStyle = arr.color + "55";
      ctx.lineWidth = 0.5;
      ctx.fillRect(x, ay, arrCellW - 2, arrCellH);
      ctx.strokeRect(x, ay, arrCellW - 2, arrCellH);
      ctx.fillStyle = c.text;
      ctx.font = "9px var(--mono, monospace)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(v, x + arrCellW / 2 - 1, ay + arrCellH / 2);
    });
  });
}

// ═══════════════════════════════════════════════════════════
// IV. Graph → Laplacian
// ═══════════════════════════════════════════════════════════
function buildGrid(n) {
  const nodes = n * n;
  const edges = [];
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++) {
      const idx = r * n + col;
      if (col + 1 < n) edges.push([idx, idx + 1]);
      if (r + 1 < n) edges.push([idx, idx + n]);
    }
  const L = Array.from({ length: nodes }, () => new Float64Array(nodes));
  edges.forEach(([a, b]) => {
    L[a][b] -= 1;
    L[b][a] -= 1;
    L[a][a] += 1;
    L[b][b] += 1;
  });
  let nnz = 0;
  for (let r = 0; r < nodes; r++)
    for (let c = 0; c < nodes; c++) if (L[r][c] !== 0) nnz++;

  // Build CSC arrays for O(nnz) SpMV
  const colPtr = new Int32Array(nodes + 1);
  const rowIdx = [];
  const vals = [];
  for (let j = 0; j < nodes; j++) {
    colPtr[j] = rowIdx.length;
    for (let i = 0; i < nodes; i++) {
      if (L[i][j] !== 0) {
        rowIdx.push(i);
        vals.push(L[i][j]);
      }
    }
  }
  colPtr[nodes] = rowIdx.length;

  return {
    nodes,
    edges,
    L,
    nnz,
    csc: {
      colPtr,
      rowIdx: new Int32Array(rowIdx),
      vals: new Float64Array(vals),
    },
  };
}

function drawGraph() {
  const canvas = document.getElementById("graph-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const n = gridSize;
  const { nodes, edges, nnz } = buildGrid(n);
  const pad = 40;
  const cellW = n > 1 ? (W - pad * 2) / (n - 1) : 0;
  const cellH = n > 1 ? (H - pad * 2) / (n - 1) : 0;

  const pos = [];
  for (let r = 0; r < n; r++)
    for (let col = 0; col < n; col++)
      pos.push({ x: pad + col * cellW, y: pad + r * cellH });

  ctx.strokeStyle = c.cool + "66";
  ctx.lineWidth = 1.5;
  edges.forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(pos[a].x, pos[a].y);
    ctx.lineTo(pos[b].x, pos[b].y);
    ctx.stroke();
  });

  const nodeR = Math.max(4, 14 - n * 2);
  pos.forEach((p, i) => {
    ctx.fillStyle = c.accent;
    ctx.beginPath();
    ctx.arc(p.x, p.y, nodeR, 0, Math.PI * 2);
    ctx.fill();
    if (n <= 4) {
      ctx.fillStyle = c.dim;
      ctx.font = "9px var(--mono, monospace)";
      ctx.textAlign = "center";
      ctx.fillText(i, p.x, p.y - nodeR - 4);
    }
  });

  const nc = document.getElementById("node-count");
  const ec = document.getElementById("edge-count");
  const nz = document.getElementById("nnz-count");
  if (nc) nc.textContent = nodes;
  if (ec) ec.textContent = edges.length;
  if (nz) nz.textContent = nnz;
}

// ═══════════════════════════════════════════════════════════
// V. CG Solver
// ═══════════════════════════════════════════════════════════
function solveCG(csc, b, a, maxIter = 100, tol = 1e-10) {
  const n = b.length;
  const { colPtr, rowIdx, vals } = csc;
  // O(nnz) sparse matrix-vector product: y = (I + a*L)*v
  const Ax = (v) => {
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = v[i]; // I*v
    for (let j = 0; j < n; j++) {
      for (let k = colPtr[j]; k < colPtr[j + 1]; k++)
        out[rowIdx[k]] += a * vals[k] * v[j];
    }
    return out;
  };
  const dot = (u, v) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += u[i] * v[i];
    return s;
  };
  const add = (u, v, s) => {
    const o = new Float64Array(n);
    for (let i = 0; i < n; i++) o[i] = u[i] + s * v[i];
    return o;
  };

  let x = new Float64Array(n),
    r = new Float64Array(b),
    p = new Float64Array(r);
  let rsOld = dot(r, r);
  const residuals = [Math.sqrt(rsOld)];

  for (let k = 0; k < maxIter; k++) {
    const Ap = Ax(p);
    const pAp = dot(p, Ap);
    if (Math.abs(pAp) < 1e-15) break;
    const ak = rsOld / pAp;
    x = add(x, p, ak);
    r = add(r, Ap, -ak);
    const rsNew = dot(r, r);
    residuals.push(Math.sqrt(rsNew));
    if (rsNew < tol) break;
    p = add(r, p, rsNew / rsOld);
    rsOld = rsNew;
  }
  return { x, residuals };
}

function drawCG() {
  const canvas = document.getElementById("cg-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const n = gridSize;
  const { csc } = buildGrid(n);
  const nodes = n * n;
  const b = new Float64Array(nodes);
  for (let i = 0; i < nodes; i++) b[i] = 3 + Math.sin(i * 1.7) * 2;

  const { x, residuals } = solveCG(csc, b, alpha);

  // Left: bar chart
  const showN = Math.min(nodes, 16);
  const pad = { top: 25, bottom: 25, left: 30, right: 10 };
  const halfW = W * 0.5;
  const chartW = halfW - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = chartW / showN;
  const maxVal = 6;

  ctx.fillStyle = c.dim;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("signal b vs smoothed x", halfW / 2, 12);

  for (let i = 0; i < showN; i++) {
    const bx = pad.left + i * barW;
    const bH = (Math.abs(b[i]) / maxVal) * chartH;
    const xH = (Math.abs(x[i]) / maxVal) * chartH;
    ctx.fillStyle = c.blue;
    ctx.fillRect(bx + 1, pad.top + chartH - bH, barW / 2 - 1, bH);
    ctx.fillStyle = c.pink;
    ctx.fillRect(bx + barW / 2, pad.top + chartH - xH, barW / 2 - 1, xH);
  }

  ctx.strokeStyle = c.wire;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  // Right: convergence
  const rPad = { top: 25, bottom: 25, left: halfW + 20, right: 20 };
  const rW = W - rPad.left - rPad.right;
  const rH = H - rPad.top - rPad.bottom;

  ctx.fillStyle = c.dim;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("CG convergence", rPad.left + rW / 2, 12);

  if (residuals.length > 1) {
    // Proper log scale: map [logFloor, logCeil] → [bottom, top] of chart
    const logCeil = Math.ceil(Math.log10(Math.max(residuals[0], 1e-12)));
    const minR = Math.max(residuals[residuals.length - 1], 1e-14);
    const logFloor = Math.floor(Math.log10(minR));
    const logRange = logCeil - logFloor || 1;

    const logY = (r) => {
      const lr = Math.log10(Math.max(r, Math.pow(10, logFloor)));
      const t = (lr - logFloor) / logRange; // 0 at bottom, 1 at top
      return rPad.top + rH - t * rH;
    };

    // Clip to chart area so line/dots don't bleed outside the box
    ctx.save();
    ctx.beginPath();
    ctx.rect(rPad.left, rPad.top, rW, rH);
    ctx.clip();

    ctx.strokeStyle = c.green;
    ctx.lineWidth = 2;
    ctx.beginPath();
    residuals.forEach((r, i) => {
      const rx = rPad.left + (i / (residuals.length - 1)) * rW;
      const ry = logY(r);
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    });
    ctx.stroke();

    ctx.fillStyle = c.green;
    residuals.forEach((r, i) => {
      const rx = rPad.left + (i / (residuals.length - 1)) * rW;
      const ry = logY(r);
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore(); // remove clip

    // Log scale tick labels (outside clip so they're always visible)
    ctx.fillStyle = c.muted;
    ctx.font = "8px var(--mono, monospace)";
    ctx.textAlign = "right";
    for (let e = logFloor; e <= logCeil; e++) {
      const y = logY(Math.pow(10, e));
      ctx.fillText("1e" + e, rPad.left - 4, y + 3);
      ctx.strokeStyle = c.wire;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rPad.left, y);
      ctx.lineTo(rPad.left + rW, y);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = c.wire;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rPad.left, rPad.top);
  ctx.lineTo(rPad.left, rPad.top + rH);
  ctx.lineTo(rPad.left + rW, rPad.top + rH);
  ctx.stroke();

  const iters = document.getElementById("cg-iters");
  const res = document.getElementById("cg-residual");
  if (iters) iters.textContent = residuals.length - 1;
  if (res) res.textContent = residuals[residuals.length - 1].toExponential(1);
}

// ═══════════════════════════════════════════════════════════
// VI. FFI Boundary
// ═══════════════════════════════════════════════════════════
function drawFFI() {
  const canvas = document.getElementById("ffi-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const midX = W / 2,
    pad = 30;

  // R side
  const rW = W * 0.35,
    rH = H - pad * 2;
  ctx.fillStyle = c.blueSoft;
  ctx.strokeStyle = c.cool;
  ctx.lineWidth = 1.5;
  rr(ctx, pad, pad, rW, rH, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.cool;
  ctx.font = "bold 14px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("R", pad + rW / 2, pad + 24);

  const slots = [
    { name: "L@i", type: "int32[]", desc: "row indices" },
    { name: "L@p", type: "int32[]", desc: "col pointers" },
    { name: "L@x", type: "f64[]", desc: "values" },
  ];
  const slotH = 36,
    slotW = rW - 30,
    slotX = pad + 15;
  slots.forEach((s, i) => {
    const sy = pad + 44 + i * (slotH + 8);
    ctx.fillStyle = c.grid;
    ctx.strokeStyle = c.cool + "55";
    ctx.lineWidth = 1;
    rr(ctx, slotX, sy, slotW, slotH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.cool;
    ctx.font = "bold 11px var(--mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText(s.name, slotX + 8, sy + 14);
    ctx.fillStyle = c.muted;
    ctx.font = "9px var(--mono, monospace)";
    ctx.fillText(s.type + " — " + s.desc, slotX + 8, sy + 28);
  });

  // Boundary
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(midX, pad - 10);
  ctx.lineTo(midX, H - pad + 10);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = c.accent;
  ctx.font = "bold 10px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("FFI BOUNDARY", midX, pad - 14);

  // Wires
  slots.forEach((s, i) => {
    const sy = pad + 44 + i * (slotH + 8) + slotH / 2;
    ctx.strokeStyle = c.wireHi;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(slotX + slotW, sy);
    ctx.lineTo(midX + 15, sy);
    ctx.stroke();
    ctx.fillStyle = c.wireHi;
    ctx.beginPath();
    ctx.moveTo(midX + 9, sy - 3);
    ctx.lineTo(midX + 15, sy);
    ctx.lineTo(midX + 9, sy + 3);
    ctx.fill();
    ctx.fillStyle = c.accent;
    ctx.font = "8px var(--mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText(i < 2 ? "i32→usize" : "copy", midX, sy - 6);
  });

  // Rust side
  const rustX = midX + 20,
    rustW = W - midX - pad - 20;
  ctx.fillStyle = c.pinkSoft;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.5;
  rr(ctx, rustX, pad, rustW, rH, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.accent;
  ctx.font = "bold 14px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("Rust", rustX + rustW / 2, pad + 24);

  const rustSlots = [
    { name: "validate()", desc: "panic on bad input" },
    { name: "SparseColMat", desc: "faer CSC matrix" },
    { name: "solve_cg()", desc: "O(N) per band" },
  ];
  const rSlotX = rustX + 15,
    rSlotW = rustW - 30;
  rustSlots.forEach((s, i) => {
    const sy = pad + 44 + i * (slotH + 8);
    ctx.fillStyle = c.grid;
    ctx.strokeStyle = c.accent + "55";
    ctx.lineWidth = 1;
    rr(ctx, rSlotX, sy, rSlotW, slotH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = c.accent;
    ctx.font = "bold 11px var(--mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText(s.name, rSlotX + 8, sy + 14);
    ctx.fillStyle = c.muted;
    ctx.font = "9px var(--mono, monospace)";
    ctx.fillText(s.desc, rSlotX + 8, sy + 28);
  });

  // Internal wires
  for (let i = 0; i < rustSlots.length - 1; i++) {
    const y1 = pad + 44 + i * (slotH + 8) + slotH,
      y2 = y1 + 8;
    const cx = rSlotX + rSlotW / 2;
    ctx.strokeStyle = c.accent + "44";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, y1);
    ctx.lineTo(cx, y2);
    ctx.stroke();
    ctx.fillStyle = c.accent + "44";
    ctx.beginPath();
    ctx.moveTo(cx - 3, y2 - 3);
    ctx.lineTo(cx, y2);
    ctx.lineTo(cx + 3, y2 - 3);
    ctx.fill();
  }

  // Safety box
  const safeY = pad + rH - 40;
  ctx.fillStyle = c.green + "22";
  ctx.strokeStyle = c.green;
  ctx.lineWidth = 1;
  rr(ctx, rustX + 10, safeY, rustW - 20, 30, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = c.green;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText(
    "panic → clean R error (session survives)",
    rustX + rustW / 2,
    safeY + 18,
  );
}

// ═══════════════════════════════════════════════════════════
// VII. Spectral View
// ═══════════════════════════════════════════════════════════
// Jacobi eigenvalue solver for small symmetric matrices
function eigenvalues(L, n) {
  // Copy L into flat column-major array
  const A = new Float64Array(n * n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) A[i * n + j] = L[i][j];
  const at = (r, c) => A[r * n + c];
  const set = (r, c, v) => {
    A[r * n + c] = v;
  };
  for (let sweep = 0; sweep < 50; sweep++) {
    let offDiag = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) offDiag += at(i, j) * at(i, j);
    if (offDiag < 1e-20) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(at(p, q)) < 1e-14) continue;
        const tau = (at(q, q) - at(p, p)) / (2 * at(p, q));
        const t = Math.sign(tau) / (Math.abs(tau) + Math.sqrt(1 + tau * tau));
        const co = 1 / Math.sqrt(1 + t * t),
          si = t * co;
        // Rotate rows/cols p,q
        for (let k = 0; k < n; k++) {
          const akp = at(k, p),
            akq = at(k, q);
          set(k, p, co * akp - si * akq);
          set(k, q, si * akp + co * akq);
        }
        for (let k = 0; k < n; k++) {
          const apk = at(p, k),
            aqk = at(q, k);
          set(p, k, co * apk - si * aqk);
          set(q, k, si * apk + co * aqk);
        }
      }
  }
  const eigs = [];
  for (let i = 0; i < n; i++) eigs.push(at(i, i));
  return eigs.sort((a, b) => a - b);
}

function drawEigen() {
  const canvas = document.getElementById("eigen-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const { L } = buildGrid(gridSize);
  const nodes = gridSize * gridSize;
  const eigs = eigenvalues(L, nodes);
  const maxLam = Math.ceil(Math.max(eigs[eigs.length - 1], 1) * 1.1);
  const steps = 40;
  const lambdas = [];
  for (let i = 0; i <= steps; i++) lambdas.push((i / steps) * maxLam);

  const pad = { top: 30, bottom: 30, left: 40, right: 20 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  // Axes
  ctx.strokeStyle = c.wire;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  ctx.fillStyle = c.muted;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("λ (frequency)", pad.left + chartW / 2, H - 8);
  ctx.save();
  ctx.translate(12, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("h(λ)", 0, 0);
  ctx.restore();

  // Fill under curve
  ctx.fillStyle = c.pinkSoft;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top + chartH);
  lambdas.forEach((lam) => {
    const h = 1 / (1 + alpha * lam);
    ctx.lineTo(
      pad.left + (lam / maxLam) * chartW,
      pad.top + chartH - h * chartH,
    );
  });
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.closePath();
  ctx.fill();

  // Curve
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  lambdas.forEach((lam, i) => {
    const h = 1 / (1 + alpha * lam);
    const x = pad.left + (lam / maxLam) * chartW;
    const y = pad.top + chartH - h * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Actual eigenvalue spikes
  eigs.forEach((lam) => {
    if (lam < 0.001) return; // skip zero eigenvalue
    const h = 1 / (1 + alpha * lam);
    const x = pad.left + (lam / maxLam) * chartW;
    const yTop = pad.top + chartH - h * chartH;
    const yBot = pad.top + chartH;
    ctx.strokeStyle = c.cool;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, yBot);
    ctx.lineTo(x, yTop);
    ctx.stroke();
    ctx.fillStyle = c.cool;
    ctx.beginPath();
    ctx.arc(x, yTop, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Labels
  ctx.fillStyle = c.green;
  ctx.font = "bold 10px var(--mono, monospace)";
  ctx.textAlign = "left";
  ctx.fillText("pass", pad.left + 8, pad.top + 16);
  ctx.fillStyle = c.warm;
  ctx.textAlign = "right";
  ctx.fillText("suppress", pad.left + chartW - 8, pad.top + chartH - 8);
  ctx.fillStyle = c.cool;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "right";
  ctx.fillText("eigenvalues λᵢ", pad.left + chartW - 8, pad.top + 14);

  // h=1 line
  ctx.strokeStyle = c.green + "44";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left + chartW, pad.top);
  ctx.stroke();
  ctx.setLineDash([]);
}

// ═══════════════════════════════════════════════════════════
// VIII. Complexity
// ═══════════════════════════════════════════════════════════
function drawComplexity() {
  const canvas = document.getElementById("complexity-canvas");
  if (!canvas) return;
  const ctx = resizeCanvas(canvas);
  if (!ctx) return;
  const W = canvas.offsetWidth,
    H = canvas.offsetHeight;
  const c = C();
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 30, bottom: 40, left: 50, right: 30 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  ctx.strokeStyle = c.wire;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, pad.top);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.lineTo(pad.left + chartW, pad.top + chartH);
  ctx.stroke();

  ctx.fillStyle = c.muted;
  ctx.font = "9px var(--mono, monospace)";
  ctx.textAlign = "center";
  ctx.fillText("N (pixels)", pad.left + chartW / 2, H - 8);
  ctx.save();
  ctx.translate(14, pad.top + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("time", 0, 0);
  ctx.restore();

  const curves = [
    {
      label: "O(N³) dense",
      fn: (n) => Math.pow(n, 3),
      color: c.warm,
      dash: [],
    },
    {
      label: "O(N^1.5) sparse R",
      fn: (n) => Math.pow(n, 1.5),
      color: c.cool,
      dash: [4, 4],
    },
    { label: "O(N) CG Rust", fn: (n) => n * 3, color: c.green, dash: [] },
  ];
  const maxN = 100,
    maxT = Math.pow(maxN, 3),
    steps = 60;

  curves.forEach((curve) => {
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash(curve.dash);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const n = (i / steps) * maxN;
      const t = curve.fn(n);
      const x = pad.left + (n / maxN) * chartW;
      const y = pad.top + chartH - Math.min(t / maxT, 1) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Legend
  const legX = pad.left + chartW - 160,
    legY = pad.top + 10;
  curves.forEach((curve, i) => {
    const y = legY + i * 18;
    ctx.strokeStyle = curve.color;
    ctx.lineWidth = 2;
    ctx.setLineDash(curve.dash);
    ctx.beginPath();
    ctx.moveTo(legX, y + 5);
    ctx.lineTo(legX + 20, y + 5);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = curve.color;
    ctx.font = "10px var(--mono, monospace)";
    ctx.textAlign = "left";
    ctx.fillText(curve.label, legX + 26, y + 9);
  });

  // N markers
  [
    { n: 16, label: "4×4" },
    { n: 64, label: "8×8" },
  ].forEach((m) => {
    const x = pad.left + (m.n / maxN) * chartW;
    ctx.strokeStyle = c.wire;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, pad.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.dim;
    ctx.font = "8px var(--mono, monospace)";
    ctx.textAlign = "center";
    ctx.fillText(m.label, x, pad.top + chartH + 14);
  });
}

// ═══════════════════════════════════════════════════════════
// Equations & Init
// ═══════════════════════════════════════════════════════════
function renderEqs() {
  const eqs = {
    "eq-vec":
      "\\vec{v} = \\begin{bmatrix} 2.0 & -1.0 & -1.0 & 0.0 \\end{bmatrix} \\in \\mathbb{R}^4",
    "eq-sparse": "L = D - W \\quad \\text{(CSC: } p, i, x \\text{)}",
    "eq-laplacian": "L = D - W",
    "eq-laplacian2":
      "L_{ij} = \\begin{cases} \\deg(i) & i = j \\\\ -1 & (i,j) \\in E \\\\ 0 & \\text{else} \\end{cases}",
    "eq-cg": "(I + \\alpha L)\\,x = b",
    "eq-cg2": "r_k = b - Ax_k, \\quad p_{k+1} = r_k + \\beta_k p_k",
    "eq-eigen": "L = U \\Lambda U^T \\quad \\text{(spectral triple)}",
    "eq-filter": "h(\\lambda) = \\frac{1}{1 + \\alpha \\lambda}",
    "eq-complexity":
      "\\underbrace{O(N^3)}_{\\text{dense}} \\gg \\underbrace{O(N\\sqrt{\\kappa})}_{\\text{sparse CG}} \\quad \\text{where } \\kappa = \\kappa(I + \\alpha L)",
  };
  Object.entries(eqs).forEach(([id, tex]) => {
    const el = document.getElementById(id);
    if (el) katex.render(tex, el, { throwOnError: false, displayMode: true });
  });
}

function drawAll() {
  drawPipeline();
  drawVectors();
  drawSparse();
  drawGraph();
  drawCG();
  drawFFI();
  drawEigen();
  drawComplexity();
}

function init() {
  initThemeToggle();

  // Redraw on theme change
  const observer = new MutationObserver(() => drawAll());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  renderEqs();
  drawAll();

  // Grid size buttons
  [3, 4, 5].forEach((n) => {
    const b = document.getElementById("btn-grid" + n);
    if (b)
      b.addEventListener("click", () => {
        gridSize = n;
        document
          .querySelectorAll(".grid-controls button")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        drawGraph();
        drawCG();
        drawEigen();
      });
  });

  // Alpha slider
  const alphaSlider = document.getElementById("alpha-slider");
  const alphaVal = document.getElementById("alpha-val");
  if (alphaSlider)
    alphaSlider.addEventListener("input", () => {
      alpha = parseFloat(alphaSlider.value);
      if (alphaVal) alphaVal.textContent = alpha.toFixed(2);
      drawCG();
      drawEigen();
    });

  let resizeRaf = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(drawAll);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () =>
    requestAnimationFrame(init),
  );
} else {
  requestAnimationFrame(init);
}
