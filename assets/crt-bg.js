/* =========================
   Aspen Meridian — “Genius” Background
   Dark corporate green + high activity
   - Particles + links
   - Scan sweeps
   - Radar arcs
   - Binary blips (0/1 bursts)
   - Occasional glitch flash
   Drop-in replacement for bgCanvas script
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

  // ---------- Tunables (activity + contrast) ----------
  const THEME = {
    // darker base, brighter accents
    gridA: 0.16,
    linkA: 0.18,
    nodeAmin: 0.10,
    nodeAmax: 0.28,
    sweepA1: 0.18,
    sweepA2: 0.12,
    radarA: 0.16,
    binaryA: 0.55,
    hazeA: 0.22
  };

  // ---------- Grid ----------
  function drawGrid(time, parallaxX, parallaxY){
    const stepX = 66;
    const stepY = 46;

    ctx.save();
    ctx.globalAlpha = THEME.gridA;

    // more noticeable drift
    const driftX = (time * 34) + parallaxX;
    const driftY = (time * 22) + parallaxY;

    // vertical lines
    for (let x = (driftX % stepX); x < w; x += stepX){
      ctx.strokeStyle = "rgba(46,229,157,0.18)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // horizontal lines (slightly brighter at top)
    for (let y = (driftY % stepY); y < h; y += stepY){
      const a = 0.10 + (1 - y / h) * 0.10;
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
  const particleCount = Math.floor(Math.min(220, Math.max(130, (window.innerWidth * window.innerHeight) / 11000)));
  const particles = [];
  for (let i = 0; i < particleCount; i++){
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.00042, 0.00042),    // faster
      vy: rand(-0.00036, 0.00036),
      r: rand(0.7, 2.1),
      a: rand(THEME.nodeAmin, THEME.nodeAmax)
    });
  }

  function drawParticles(){
    const linkDist = Math.min(210, Math.max(130, w / 7.6));

    for (const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -0.05) p.x = 1.05;
      if (p.x >  1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y >  1.05) p.y = -0.05;

      const px = (p.x * w) + (mouse.x - 0.5) * 34;
      const py = (p.y * h) + (mouse.y - 0.5) * 22;

      // node
      ctx.beginPath();
      ctx.fillStyle = `rgba(231,255,242,${p.a})`;
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // links (more frequent than before)
      for (let k = 0; k < 3; k++){
        const q = particles[(Math.random() * particles.length) | 0];
        const qx = (q.x * w) + (mouse.x - 0.5) * 34;
        const qy = (q.y * h) + (mouse.y - 0.5) * 22;

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
    { t: Math.random(), speed: 0.00110, width: 0.075, a: THEME.sweepA1 },
    { t: Math.random(), speed: 0.00072, width: 0.110, a: THEME.sweepA2 },
    { t: Math.random(), speed: 0.00058, width: 0.155, a: 0.08 }
  ];

  function drawSweeps(time){
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (const s of sweeps){
      // animated speed wobble so it feels “alive”
      s.t += s.speed * (1 + 0.6 * Math.sin(time * 0.9));
      if (s.t > 1.25) s.t = -0.25;

      const y = s.t * h;
      const half = s.width * h;

      const grad = ctx.createLinearGradient(0, y - half, 0, y + half);
      grad.addColorStop(0.0, "rgba(0,0,0,0)");
      grad.addColorStop(0.40, `rgba(46,229,157,${s.a})`);
      grad.addColorStop(0.52, `rgba(191,231,212,${s.a * 0.75})`);
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
      r: rand(10, 26),
      hot: Math.random() < 0.35
    });
    if (blips.length > 22) blips.shift();
  }

  // More frequent blips
  setInterval(() => {
    if (Math.random() < 0.85) spawnBlip();
    // occasional clustered detection event
    if (Math.random() < 0.18){
      const bx = Math.random(), by = Math.random();
      spawnBlip(bx + rand(-0.03, 0.03), by + rand(-0.03, 0.03));
      spawnBlip(bx + rand(-0.03, 0.03), by + rand(-0.03, 0.03));
    }
  }, 700);

  function drawBlips(dt){
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = blips.length - 1; i >= 0; i--){
      const b = blips[i];
      b.life += dt;

      const p = Math.min(1, b.life / b.max);
      const fade = 1 - p;

      const cx = b.x * w + (mouse.x - 0.5) * 28;
      const cy = b.y * h + (mouse.y - 0.5) * 18;

      const rr = b.r + p * (b.hot ? 120 : 90);

      // ring
      ctx.strokeStyle = `rgba(46,229,157,${0.30 * fade})`;
      ctx.lineWidth = b.hot ? 1.7 : 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();

      // inner glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 0.9);
      g.addColorStop(0, `rgba(46,229,157,${0.22 * fade})`);
      g.addColorStop(0.45, `rgba(191,231,212,${0.12 * fade})`);
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

    const cx = w * (0.70 + (mouse.x - 0.5) * 0.05);
    const cy = h * (0.35 + (mouse.y - 0.5) * 0.05);

    const baseR = Math.min(w, h) * 0.26;
    const sweep = time * 1.2;

    for (let k = 0; k < 3; k++){
      const r = baseR + k * 46;
      const a0 = sweep + k * 0.85;
      const a1 = a0 + 0.75;

      ctx.strokeStyle = "rgba(46,229,157,0.20)";
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.stroke();
    }

    // faint radial line
    ctx.strokeStyle = "rgba(191,231,212,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweep) * (baseR + 120), cy + Math.sin(sweep) * (baseR + 120));
    ctx.stroke();

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Binary “blips” ----------
  // Small bursts of 0/1 that appear & fade quickly
  const binaryBursts = [];
  const BIN = ["0","1"];

  function spawnBinaryBurst(x = Math.random(), y = Math.random()){
    const count = (Math.random() < 0.25) ? 18 : 12;
    const glyphs = [];

    for (let i=0; i<count; i++){
      glyphs.push({
        ch: BIN[(Math.random()*2)|0],
        ox: rand(-54, 54),
        oy: rand(-38, 38),
        vx: rand(-12, 12),
        vy: rand(-10, 10),
        s: rand(10, 14), // font size
        a: rand(0.22, 0.55)
      });
    }

    binaryBursts.push({
      x, y,
      life: 0,
      max: rand(0.55, 1.05),
      glyphs
    });

    if (binaryBursts.length > 18) binaryBursts.shift();
  }

  // Frequent enough to be visible, not overwhelming
  setInterval(() => {
    if (Math.random() < 0.92) spawnBinaryBurst();
    if (Math.random() < 0.22) spawnBinaryBurst(Math.random(), Math.random());
  }, 520);

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

      const cx = b.x * w + (mouse.x - 0.5) * 30;
      const cy = b.y * h + (mouse.y - 0.5) * 20;

      for (const g of b.glyphs){
        const x = cx + g.ox + g.vx * p * 1.8;
        const y = cy + g.oy + g.vy * p * 1.8;

        // subtle “digital” wobble
        const wob = Math.sin((x + y) * 0.01 + p * 6.0) * 0.6;

        ctx.font = `600 ${g.s}px "JetBrains Mono", monospace`;
        ctx.fillStyle = `rgba(46,229,157,${(g.a * fade) * THEME.binaryA})`;
        ctx.fillText(g.ch, x + wob, y);

        // secondary highlight for “expensive” shimmer
        ctx.fillStyle = `rgba(191,231,212,${(g.a * fade) * 0.18})`;
        ctx.fillText(g.ch, x + wob + 0.6, y + 0.4);
      }

      if (b.life >= b.max) binaryBursts.splice(i, 1);
    }

    ctx.restore();
    ctx.globalCompositeOperation = "source-over";
  }

  // ---------- Base haze (darker) ----------
  function baseHaze(){
    ctx.save();
    ctx.globalAlpha = THEME.hazeA;

    // darker base vignette / haze
    const g = ctx.createRadialGradient(
      w * (0.30 + (mouse.x - 0.5) * 0.08),
      h * (0.22 + (mouse.y - 0.5) * 0.06),
      0,
      w * 0.55, h * 0.55,
      Math.max(w, h) * 1.05
    );
    g.addColorStop(0, "rgba(46,229,157,0.16)");
    g.addColorStop(0.42, "rgba(46,229,157,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // secondary bloom (kept subtle, but visible)
    ctx.globalAlpha = THEME.hazeA * 0.9;
    const g2 = ctx.createRadialGradient(
      w * 0.78, h * 0.36, 0,
      w * 0.78, h * 0.36, Math.max(w, h) * 0.72
    );
    g2.addColorStop(0, "rgba(57,199,127,0.10)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // ---------- Occasional glitch flash ----------
  let glitchT = 0;
  function maybeGlitch(dt){
    glitchT -= dt;
    if (glitchT <= 0 && Math.random() < 0.015){
      glitchT = rand(0.06, 0.14);
    }
    if (glitchT > 0){
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = "rgba(46,229,157,0.55)";
      const y = rand(0, h);
      const hh = rand(8, 22);
      ctx.fillRect(0, y, w, hh);
      ctx.restore();
    }
  }

  function loop(ts){
    const now = ts || 0;
    const dt = clamp(((now - lastTs) / 1000) || 0.016, 0.008, 0.040);
    lastTs = now;

    // smooth mouse parallax
    mouse.x = lerp(mouse.x, mouse.tx, 0.08);
    mouse.y = lerp(mouse.y, mouse.ty, 0.08);

    ctx.clearRect(0, 0, w, h);

    const time = now * 0.001;

    // slightly darker base fill to increase contrast
    ctx.save();
    ctx.fillStyle = "rgba(3,8,6,0.55)";
    ctx.fillRect(0,0,w,h);
    ctx.restore();

    baseHaze();

    // grid follows scroll + mouse parallax
    const scrollY = (window.scrollY || 0);
    const parX = (mouse.x - 0.5) * 44;
    const parY = (mouse.y - 0.5) * 26 + scrollY * 0.22;
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
