// Polvo suspendido del hero en canvas 2D: el mismo efecto que la versión WebGL (motas frías y
// algunas rojas que suben despacio, con profundidad y parallax), sin cargar three.js.
// hero3d.ts sólo se usa cuando hay un modelo GLB configurado.

export function startHeroDust(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const mobile = matchMedia('(max-width: 960px)').matches;
  const COUNT = mobile ? 140 : 320;
  const dpr = Math.min(devicePixelRatio || 1, 1.25);

  // Sprites pre-dibujados (un degradado suave), así cada mota es un drawImage barato
  const sprite = (r: number, g: number, b: number) => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const x = c.getContext('2d')!;
    const grad = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = grad;
    x.fillRect(0, 0, 32, 32);
    return c;
  };
  const cold = sprite(214, 219, 224);
  const red = sprite(255, 56, 56);

  // Misma caja que la escena 3D: x ±8, y ±5, z ±4, cámara en z = 10
  const motes = Array.from({ length: COUNT }, () => {
    const seed = Math.random();
    return { x: (Math.random() - 0.5) * 16, y: (Math.random() - 0.5) * 10, z: (Math.random() - 0.5) * 8, seed };
  });

  let w = 0, h = 0, focal = 0;
  const resize = () => {
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    focal = (h / 2) / Math.tan((35 / 2) * Math.PI / 180); // fov 35°
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }, { passive: true });

  let alarm = 0;
  document.addEventListener('martzian:egg', () => { alarm = 1; setTimeout(() => (alarm = 0), 1800); });

  const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  let visible = true, running = false;
  const t0 = performance.now();
  const tick = (now: number) => {
    if (!visible || document.hidden) { running = false; return; }
    running = true;
    const t = (now - t0) / 1000;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    const camX = pointer.x * 0.5, camY = -pointer.y * 0.3;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const m of motes) {
      const speed = 0.08 + m.seed * 0.18 + alarm * 0.6;
      const y = ((m.y + 5 + t * speed) % 10 + 10) % 10 - 5;
      const x = m.x + Math.sin(t * 0.3 + m.seed * 30) * 0.25;
      const z = m.z + Math.cos(t * 0.2 + m.seed * 12) * 0.2;
      const depth = 10 - z;
      const fade = smooth(5, 3.5, Math.abs(y)) * smooth(-6, 1, z);
      if (fade <= 0.01) continue;
      const flicker = 0.6 + 0.4 * Math.sin(t * (1 + m.seed * 3) + m.seed * 40);
      const sx = w / 2 + (x - camX) * focal / depth;
      const sy = h / 2 - (y - camY) * focal / depth;
      const size = (1.2 + m.seed * 2.6) * 1.4 * (10 / depth) * 1.6;
      ctx.globalAlpha = fade * flicker * 0.55;
      ctx.drawImage(m.seed > 0.78 || alarm ? red : cold, sx - size / 2, sy - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(tick);
  };
  const kick = () => { if (!running) requestAnimationFrame(tick); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(hero);
  document.addEventListener('visibilitychange', kick);
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 2s';
  requestAnimationFrame(() => (canvas.style.opacity = '1'));
  kick();
}
