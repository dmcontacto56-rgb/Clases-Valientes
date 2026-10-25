/* Cursor "blob" en vanilla JS (sin React). Opciones tomadas de la configuración de BlobCursor. */
export function initCursor(o = {}) {
  const opt = { color: '#3B82F6', size: 44, trail: 16, lag: 0.55, splashCount: 13, splashSpeed: 0.5, splashSize: 0.5, ...o };
  if (matchMedia('(pointer:coarse)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'blob-cursor'; document.body.append(c);
  document.body.classList.add('has-blob');
  const x = c.getContext('2d');
  let m = { x: -100, y: -100 }, pts = Array.from({ length: opt.trail }, () => ({ x: -100, y: -100 })), sp = [];
  const resize = () => { const d = devicePixelRatio || 1; c.width = innerWidth * d; c.height = innerHeight * d; x.setTransform(d, 0, 0, d, 0, 0); };
  addEventListener('resize', resize); resize();
  addEventListener('pointermove', e => { m = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointerdown', e => {
    for (let i = 0; i < opt.splashCount; i++) {
      const a = Math.random() * 6.28, v = (2 + Math.random() * 4) * (opt.splashSpeed * 2);
      sp.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: opt.size * opt.splashSize * (.3 + Math.random() * .5), life: 1 });
    }
  });
  (function loop() {
    x.clearRect(0, 0, innerWidth, innerHeight);
    const k = 1 - opt.lag;
    pts.forEach((p, i) => { const t = i ? pts[i - 1] : m; p.x += (t.x - p.x) * k; p.y += (t.y - p.y) * k; });
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i], r = (opt.size / 2) * (1 - (i / pts.length) * 0.65);
      const gr = x.createRadialGradient(p.x - r * .35, p.y - r * .35, r * .1, p.x, p.y, r);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(.35, opt.color); gr.addColorStop(1, '#10316b');
      x.fillStyle = gr; x.beginPath(); x.arc(p.x, p.y, r, 0, 6.28); x.fill();
    }
    sp = sp.filter(s => s.life > 0);
    sp.forEach(s => { s.x += s.vx; s.y += s.vy; s.life -= 0.03; x.globalAlpha = Math.max(0, s.life); x.fillStyle = opt.color; x.beginPath(); x.arc(s.x, s.y, s.r * s.life, 0, 6.28); x.fill(); x.globalAlpha = 1; });
    requestAnimationFrame(loop);
  })();
}
