/* =========================
   Dynamic Background: corporate green “detection” field
   Particles + subtle grid + scan sweeps + random blips
   Drop-in replacement for your existing bgCanvas script
   ========================= */

(function(){
  const canvas = document.getElementById("bgCanvas");
  if(!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  // Clamp DPR so it doesn't melt laptops
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  let w = 0, h = 0;
  let lastTs = 0;

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  window.addEventListener("mousemove", (e) => {
    mouse.tx = e.clientX / Math.max(1, window.innerWidth);
    mouse.ty = e.clientY / Math.max(1, window.innerHeight);
  }, { passive: true });

  const resize = () => {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);

    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);

    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    // Draw in CSS pixels
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };

  window.addEventListener("resize", resize, { passive: true });
  resize();

  const rand = (min, max) => min + Math.random() * (max - min);
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---------- Grid ----------
  function drawGrid(time, parallaxX, parallaxY) {
    const stepX = 72;    // CSS pixels
    const stepY = 52;

    ctx.save();
    ctx.globalAlpha = 0.12;

    // slight drift
    const driftX = (time * 18) + parallaxX;
    const driftY = (time * 10) + parallaxY;

    // vertical lines
    for (let x = (driftX % stepX); x < w; x += stepX) {
      ctx.strokeStyle = "rgba(46,229,157,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // horizontal lines (slightly more muted)
    for (let y = (driftY % stepY); y < h; y += stepY) {
      const a = 0.08 + (y / h) * 0.10;
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
  const particleCount = Math.floor(Math.min(170, Math.max(90, (window.innerWidth * window.innerHeight) / 14000)));
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.00022, 0.00022),
      vy: rand(-0.00018, 0.00018),
      r: rand(0.6, 1.8),
      a: rand(0.07, 0.20),
    });
  }

  // ---------- Scan sweeps ----------
  const sweeps = [
    { t: Math.random(), speed: 0.00060, width: 0.09, a: 0.10 },
    { t: Math.random(), speed: 0.00038, width: 0.12, a: 0.07 }
  ];

  // ---------- Random “blips” ----------
  const blips = [];
  function spawnBlip() {
    blips.push({
      x: Math.random(),
      y: Math.random(),
      life: 0,
      max: rand(0.55, 1.05),
      r: rand(10, 24),
    });
    if (blips.length > 14) blips.shift();
  }

  // Controlled blip rate (keeps it “alive” but not noisy)
  setInterval(() => { if (Math.random() < 0.65) spawnBlip(); }, 1100);

  function drawSweeps(time) {
    ctx.save();

    for (const s of sweeps) {
      s.t += s.speed * (1 + 0.6 * Math.sin(time * 0.35));
      if (s.t > 1.25) s.t = -0.25;

      const y = s.t * h;
      const half = s.width * h;

      const grad = ctx.createLinearGradient(0, y - half, 0, y + half);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(0.45, `rgba(46,229,157,${s.a})`);
      grad.addColorStop(0.55, `rgba(191,231,212,${s.a * 0.75})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.globalCompositeOperation = "screen";
      ctx.fillRect(0, y - half, w, half * 2);
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.restore();
  }

  function drawBlips(dt) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    for (let i = blips.length - 1; i >= 0; i--) {
      const b = blips[i];
      b.life += dt;
      const p = Math.min(1, b.life / b.max);
      const fade = (1 - p);

      const cx = b.x * w + (mouse.x - 0.5) * 24;
      const cy = b.y * h + (mouse.y - 0.5) * 14;
      const rr = b.r + p * 72;

      // ring
      ctx.strokeStyle = `rgba(46,229,157,${0.22 * fade})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();

      // inner glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr * 0.9);
      g.addColorStop(0, `rgba(46,229,157,${0.18 * fade})`);
      g.addColorStop(0.5, `rgba(191,231,212,${0.10 * fade})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);

      if (b.life >= b.max) blips.splice(i, 1);
    }

    ctx.restore();
  }

  function drawParticles(time) {
    const linkDist = Math.min(190, Math.max(115, w / 8));

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05;
      if (p.y > 1.05) p.y = -0.05;

      const px = (p.x * w) + (mouse.x - 0.5) * 26;
      const py = (p.y * h) + (mouse.y - 0.5) * 16;

      // node
      ctx.beginPath();
      ctx.fillStyle = `rgba(231,255,242,${p.a})`;
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // occasional links
      for (let k = 0; k < 2; k++) {
        const q = particles[(Math.random() * particles.length) | 0];
        const qx = (q.x * w) + (mouse.x - 0.5) * 26;
        const qy = (q.y * h) + (mouse.y - 0.5) * 16;
        const dx = qx - px;
        const dy = qy - py;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d < linkDist) {
          const a = (1 - d / linkDist) * 0.11;
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

  function baseHaze() {
    // gentle green haze with mouse bias
    ctx.save();
    ctx.globalAlpha = 0.30;

    const g = ctx.createRadialGradient(
      w * (0.28 + (mouse.x - 0.5) * 0.08),
      h * (0.20 + (mouse.y - 0.5) * 0.06),
      0,
      w * 0.55, h * 0.55,
      Math.max(w, h) * 0.95
    );
    g.addColorStop(0, "rgba(46,229,157,0.18)");
    g.addColorStop(0.45, "rgba(46,229,157,0.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // secondary soft bloom
    ctx.globalAlpha = 0.22;
    const g2 = ctx.createRadialGradient(
      w * 0.78, h * 0.35, 0,
      w * 0.78, h * 0.35, Math.max(w, h) * 0.65
    );
    g2.addColorStop(0, "rgba(57,199,127,0.12)");
    g2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  function loop(ts) {
    const now = ts || 0;
    const dt = Math.min(0.05, (now - lastTs) / 1000 || 0.016);
    lastTs = now;

    // smooth mouse (parallax)
    mouse.x = lerp(mouse.x, mouse.tx, 0.06);
    mouse.y = lerp(mouse.y, mouse.ty, 0.06);

    ctx.clearRect(0, 0, w, h);

    const time = now * 0.001;

    baseHaze();

    // grid follows scroll slightly (like your original) + mouse parallax
    const scrollY = (window.scrollY || 0);
    const parX = (mouse.x - 0.5) * 36;
    const parY = (mouse.y - 0.5) * 18 + scrollY * 0.18;
    drawGrid(time, parX, parY);

    drawParticles(time);
    drawSweeps(time);
    drawBlips(dt);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
