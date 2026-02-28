/* =========================
   Aspen Meridian — “Genius” Background (DARK + HIGH VISIBILITY)
   Dark corporate green + unmistakable activity
   - Particles + links (brighter)
   - Scan sweeps (brighter)
   - Radar arcs (brighter)
   - Binary blips (0/1 bursts, very visible)
   - Occasional glitch flash
   Drop-in file: assets/crt-bg.js
   ========================= */

(function(){
  const canvas = document.getElementById("bgCanvas");
  if(!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  // Keep it fast on laptops
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  let w = 0, h = 0;
  let lastTs = 0;

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  window.addEventListener("mousemove", (e) => {
    mouse.tx = e.clientX / Math.max(1, window.innerWidth);
    mouse.ty = e.clientY / Math.max(1, window.innerHeight);
  }, { passive: true });

  function resize(){
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);

    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + "px";
    canvas.style.height = h + "px";

    // Render in CSS px
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const rand = (min, max) => min + Math.random() * (max - min);
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- Tunables (DARKER base + BRIGHTER effects) ----------
  const THEME = {
    gridA: 0.28,
    linkA: 0.26,
    nodeAmin: 0.18,
    nodeAmax: 0.42,
    sweepA1: 0.34,
    sweepA2: 0.22,
    radarA: 0.26,
    binaryA: 0.95,
    hazeA: 0.28
  };

  // ---------- Grid ----------
  function drawGrid(time, parallaxX, parallaxY){
    const stepX = 64;
    const stepY = 44;

    ctx.save();
    ctx.globalAlpha = THEME.gridA;

    // more noticeable drift
    const driftX = (time * 42) + parallaxX;
    const driftY = (time * 28) + parallaxY;

    // vertical lines (brighter)
    for (let x = (driftX % stepX); x < w; x += stepX){
      ctx.strokeStyle = "rgba(46,229,157,0.30)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // horizontal lines
    for (let y = (driftY % stepY); y < h; y += stepY){
      const a = 0.14 + (1 - y / h) * 0.10; // stronger
      ctx.strokeStyle = `rgba(191,231,212,${a})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ---------- Particles ----------
  const particleCount = Math.floor(Math.min(260, Math.max(160, (window.innerWidth * window.innerHeight) / 9000)));
  const particles = [];
  for (let i = 0; i < particleCount; i++){
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.00055, 0.00055),
      vy: rand(-0.00046, 0.00046),
      r: rand(0.8, 2.4),
      a: rand(THEME.nodeAmin, THEME.nodeAmax)
    });
  }

  function drawParticles(){
    const linkDist = Math.min(230, Math.max(145, w / 7.0));

    for (const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -0.06) p.x = 1.06;
      if (p.x >  1.06) p.x = -0.06;
      if (p.y < -0.06) p.y = 1.06;
      if (p.y >  1.06) p.y = -0.06;

      const px = (p.x * w) + (mouse.x - 0.5) * 38;
      const py = (p.y * h) + (mouse.y - 0.5) * 26;

      // node (brighter)
      ctx.beginPath();
      ctx.fillStyle = `rgba(231,255,242,${p.a})`;
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // links (more frequent + brighter)
      for (let k = 0; k < 3; k++){
        const q = particles[(Math.random() * particles.length) | 0];
        const qx = (q.x * w) + (mouse.x - 0.5) * 38;
        const qy = (q.y * h) + (mouse.y - 0.5) * 26;

        const dx = qx - px, dy = qy - py;
        const d = Math.sqrt(dx*dx + dy*dy);

        if (d < linkDist){
          const a = (1 - d / linkDist) * THEME.linkA;
          ctx.strokeStyle = `rgba(46,229,157,${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(qx, qy);
          ctx.stroke();
        }
      }
    }
  }

  // ---------- Scan sweeps ----------
  const sweeps = [
    { t: Math.random(), speed: 0.00135, width: 0.080, a: THEME.sweepA1 },
    { t: Math.random(), speed: 0.00090, width: 0.120, a: THEME.sweepA2 },
    { t: Math.random(), speed: 0.00062, width: 0.170, a: 0.14 }
  ];

  function drawSweeps(time){
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const s of sweeps){
      s.t += s.speed * (1 + 0.65 * Math.sin(time * 1.15));
      if (s.t > 1.25) s.t = -0.25;

      const y = s.t * h;
      const half = s.width * h;

      const grad = ctx.createLinearGradient(0, y - half, 0, y + half);
      grad.addColorStop(0.0, "rgba(0,0,0,0)");
      grad.addColorStop(0.38, `rgba(46,229,157,${s.a})`);
      grad.addColorStop(0.52, `rgba(231,255,242,${s.a * 0.85})`);
      grad.addColorStop(1.0, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, y - half, w, half * 2);
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Blips (rings) ----------
  const blips = [];
  function spawnBlip(x = Math.random(), y = Math.random()){
    blips.push({
      x, y,
      life: 0,
      max: rand(0.45, 0.95),
      r: rand(12, 30),
      hot: Math.random() < 0.42
    });
    if (blips.length > 26) blips.shift();
  }

  // More frequent blips + clusters
  setInterval(() => {
    if (Math.random() < 0.92) spawnBlip();
    if (Math.random() < 0.22){
      const bx = Math.random(), by = Math.random();
      spawnBlip(bx + rand(-0.03, 0.03), by + rand(-0.03, 0.03));
      spawnBlip(bx + rand(-0.03, 0.03), by + rand(-0.03, 0.03));
    }
  }, 560);

  function drawBlips(dt){
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = blips.length - 1; i >= 0; i--){
      const b = blips[i];
      b.life += dt;

      const p = Math.min(1, b.life / b.max);
      const fade = 1 - p;

      const cx = b.x * w + (mouse.x - 0.5) * 30;
      const cy = b.y * h + (mouse.y - 0.5) * 20;

      const rr = b.r + p * (b.hot ? 140 : 105);

      // ring
      ctx.strokeStyle = `rgba(46,229,157,${0.42 * fade})`;
      ctx.lineWidth = b.hot ? 2.0 : 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();

      // inner glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 0.95);
      g.addColorStop(0, `rgba(46,229,157,${0.30 * fade})`);
      g.addColorStop(0.50, `rgba(231,255,242,${0.14 * fade})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);

      if (b.life >= b.max) blips.splice(i, 1);
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Radar arcs ----------
  function drawRadar(time){
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = THEME.radarA;

    const cx = w * (0.70 + (mouse.x - 0.5) * 0.06);
    const cy = h * (0.35 + (mouse.y - 0.5) * 0.06);

    const baseR = Math.min(w, h) * 0.26;
    const sweep = time * 1.5;

    for (let k = 0; k < 3; k++){
      const r = baseR + k * 48;
      const a0 = sweep + k * 0.92;
      const a1 = a0 + 0.85;

      ctx.strokeStyle = "rgba(46,229,157,0.30)";
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.stroke();
    }

    // faint radial line
    ctx.strokeStyle = "rgba(231,255,242,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * (baseR + 140), cy + Math.sin(sweep) * (baseR + 140));
    ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Binary “blips” ----------
  const binaryBursts = [];
  const BIN = ["0","1"];

  function spawnBinaryBurst(x = Math.random(), y = Math.random()){
    const count = (Math.random() < 0.28) ? 22 : 14;
    const glyphs = [];

    for (let i = 0; i < count; i++){
      glyphs.push({
        ch: BIN[(Math.random()*2)|0],
        ox: rand(-64, 64),
        oy: rand(-44, 44),
        vx: rand(-18, 18),
        vy: rand(-14, 14),
        s: rand(11, 16),
        a: rand(0.28, 0.70)
      });
    }

    binaryBursts.push({
      x, y,
      life: 0,
      max: rand(0.65, 1.15),
      glyphs
    });

    if (binaryBursts.length > 22) binaryBursts.shift();
  }

  // Frequent binary for obvious motion
  setInterval(() => {
    if (Math.random() < 0.96) spawnBinaryBurst();
    if (Math.random() < 0.25) spawnBinaryBurst(Math.random(), Math.random());
  }, 420);

  function drawBinary(dt){
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    for (let i = binaryBursts.length - 1; i >= 0; i--){
      const b = binaryBursts[i];
      b.life += dt;

      const p = Math.min(1, b.life / b.max);
      const fade = 1 - p;

      const cx = b.x * w + (mouse.x - 0.5) * 34;
      const cy = b.y * h + (mouse.y - 0.5) * 22;

      for (const g of b.glyphs){
        const x = cx + g.ox + g.vx * p * 2.0;
        const y = cy + g.oy + g.vy * p * 2.0;

        const wob = Math.sin((x + y) * 0.012 + p * 7.0) * 0.8;

        ctx.font = `700 ${g.s}px "JetBrains Mono", monospace`;

        // primary green
        ctx.fillStyle = `rgba(46,229,157,${(g.a * fade) * THEME.binaryA})`;
        ctx.fillText(g.ch, x + wob, y);

        // crisp pale highlight to read as “expensive”
        ctx.fillStyle = `rgba(231,255,242,${(g.a * fade) * 0.22})`;
        ctx.fillText(g.ch, x + wob + 0.8, y + 0.5);
      }

      if (b.life >= b.max) binaryBursts.splice(i, 1);
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Base haze (darker, still visible) ----------
  function baseHaze(){
    ctx.save();
    ctx.globalAlpha = THEME.hazeA;

    const g = ctx.createRadialGradient(
      w * (0.30 + (mouse.x - 0.5) * 0.08),
      h * (0.22 + (mouse.y - 0.5) * 0.06),
      0,
      w * 0.55, h * 0.55,
      Math.max(w, h) * 1.05
    );
    g.addColorStop(0, "rgba(46,229,157,0.18)");
    g.addColorStop(0.44, "rgba(46,229,157,0.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = THEME.hazeA * 0.9;
    const g2 = ctx.createRadialGradient(
      w * 0.78, h * 0.36, 0,
      w * 0.78, h * 0.36, Math.max(w, h) * 0.75
    );
    g2.addColorStop(0, "rgba(57,199,127,0.12)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // ---------- Occasional glitch flash ----------
  let glitchT = 0;
  function maybeGlitch(dt){
    glitchT -= dt;
    if (glitchT <= 0 && Math.random() < 0.020){
      glitchT = rand(0.07, 0.16);
    }
    if (glitchT > 0){
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "rgba(46,229,157,0.70)";
      const y = rand(0, h);
      const hh = rand(10, 26);
      ctx.fillRect(0, y, w, hh);
      ctx.restore();
    }
  }

  function loop(ts){
    const now = ts || 0;
    const dt = clamp(((now - lastTs) / 1000) || 0.016, 0.008, 0.040);
    lastTs = now;

    mouse.x = lerp(mouse.x, mouse.tx, 0.09);
    mouse.y = lerp(mouse.y, mouse.ty, 0.09);

    ctx.clearRect(0, 0, w, h);

    const time = now * 0.001;

    // DARK base fill for contrast (key)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    baseHaze();

    // grid follows scroll + mouse parallax
    const scrollY = (window.scrollY || 0);
    const parX = (mouse.x - 0.5) * 54;
    const parY = (mouse.y - 0.5) * 34 + scrollY * 0.28;
    drawGrid(time, parX, parY);

    drawParticles();
    drawRadar(time);
    drawSweeps(time);
    drawBlips(dt);
    drawBinary(dt);
    maybeGlitch(dt);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
