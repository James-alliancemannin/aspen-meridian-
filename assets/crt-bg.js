/* =========================
   Dynamic Background: neon plasma + parallax grid
   ========================= */

(function(){
  const canvas = document.getElementById("bgCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");

  let w=0,h=0, t=0;
  const resize=()=>{
    w = canvas.width = window.innerWidth * devicePixelRatio;
    h = canvas.height = window.innerHeight * devicePixelRatio;
  };
  window.addEventListener("resize", resize);
  resize();

  function drawGrid(offsetX, offsetY){
    const step = 56 * devicePixelRatio;
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = "rgba(255,45,90,0.25)";
    ctx.lineWidth = 1 * devicePixelRatio;

    for(let x = (offsetX%step); x < w; x += step){
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for(let y = (offsetY%step); y < h; y += step){
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function loop(){
    t += 0.0035;

    ctx.clearRect(0,0,w,h);

    // Base gradient
    const g = ctx.createRadialGradient(
      w*0.32, h*0.10, 20*devicePixelRatio,
      w*0.55, h*0.45, Math.max(w,h)*0.75
    );
    g.addColorStop(0,   "rgba(255,45,90,0.22)");
    g.addColorStop(0.4, "rgba(255,45,90,0.10)");
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // Moving plasma blobs
    const cx1 = w*(0.20 + 0.06*Math.sin(t*1.3));
    const cy1 = h*(0.35 + 0.08*Math.cos(t*1.1));
    const cx2 = w*(0.80 + 0.07*Math.cos(t*0.9));
    const cy2 = h*(0.30 + 0.10*Math.sin(t*1.0));

    const p1 = ctx.createRadialGradient(cx1,cy1, 10*devicePixelRatio, cx1,cy1, 520*devicePixelRatio);
    p1.addColorStop(0, "rgba(255,95,127,0.16)");
    p1.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = p1;
    ctx.fillRect(0,0,w,h);

    const p2 = ctx.createRadialGradient(cx2,cy2, 10*devicePixelRatio, cx2,cy2, 620*devicePixelRatio);
    p2.addColorStop(0, "rgba(255,45,90,0.12)");
    p2.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = p2;
    ctx.fillRect(0,0,w,h);

    // Parallax grid follows scroll slightly
    const scrollY = (window.scrollY || 0) * devicePixelRatio;
    drawGrid( (t*220*devicePixelRatio), scrollY*0.25 );

    requestAnimationFrame(loop);
  }

  loop();
})();
