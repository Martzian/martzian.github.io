const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Cursor personalizado ---------- */
function initCursor() {
  const el = document.querySelector<HTMLElement>('.cursor');
  if (!el || !finePointer || reduced) return;
  document.documentElement.classList.add('has-cursor');
  const ring = el.querySelector<HTMLElement>('.cursor__ring')!;
  const dot = el.querySelector<HTMLElement>('.cursor__dot')!;
  const label = el.querySelector<HTMLElement>('.cursor__label')!;
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y, raf = 0;

  const loop = () => {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    label.style.transform = `translate(${rx}px, ${ry}px)`;
    raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(loop) : 0;
  };
  // Dentro de un iframe (p.ej. el portafolio) los eventos del mouse ya no llegan a esta página:
  // ocultamos el cursor propio para que no se quede congelado en el borde y mande el de la otra página.
  const hide = () => { el.style.opacity = '0'; };
  const watchFrames = () => document.querySelectorAll('iframe').forEach((f) => f.addEventListener('pointerenter', hide));
  watchFrames();
  addEventListener('blur', hide); // el foco pasó al iframe

  addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if ((e.target as Element).tagName === 'IFRAME') { hide(); return; }
    el.style.opacity = '1';
    if (!raf) raf = requestAnimationFrame(loop);
    const target = (e.target as Element).closest?.('a, button, [data-cursor], input, textarea, select, label');
    if (!target) { el.dataset.state = ''; return; }
    if (target.matches('input, textarea, select')) { el.dataset.state = 'text'; return; }
    el.dataset.state = 'hover';
    label.textContent = (target as HTMLElement).dataset.cursor ?? '';
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.style.opacity = '0'; });
  document.addEventListener('pointerenter', () => { el.style.opacity = '1'; });
}

/* ---------- Revelado al hacer scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>('.reveal');
  if (!('IntersectionObserver' in window) || reduced) { items.forEach((i) => i.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((i) => io.observe(i));
}

/* ---------- Mapa móvil ---------- */
function initMapSheet() {
  const btn = document.querySelector<HTMLButtonElement>('[data-map-toggle]');
  const sheet = document.getElementById('map-sheet');
  if (!btn || !sheet) return;
  const set = (open: boolean) => { sheet.dataset.open = String(open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(sheet.dataset.open !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* ---------- Easter eggs ---------- */
function flashEgg(text: string) {
  const ov = document.querySelector<HTMLElement>('.egg-overlay');
  if (!ov) return;
  ov.querySelector('p')!.textContent = text;
  ov.classList.add('is-on');
  document.dispatchEvent(new CustomEvent('martzian:egg'));
  setTimeout(() => ov.classList.remove('is-on'), 2200);
}

function initEggs() {
  const msg = document.querySelector<HTMLElement>('[data-egg-msg]')?.dataset.eggMsg ?? 'MARTZIAN';
  // 1) Escribir "martzian" en cualquier parte
  let buffer = '';
  addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.key.length !== 1) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-8);
    if (buffer === 'martzian') { buffer = ''; flashEgg(msg); }
  });
  // 2) El código hexadecimal del footer se decodifica
  const hex = document.querySelector<HTMLButtonElement>('[data-hex-egg]');
  if (hex) {
    const original = hex.textContent ?? '';
    hex.addEventListener('click', () => {
      const plain = hex.dataset.plain ?? 'MARTZIAN';
      hex.textContent = hex.textContent === original ? 'MARTZIAN · ' + plain : original;
    });
  }
  // 3) Para los curiosos que abren la consola
  console.log('%cMARTZIAN%c\nSUBJECT 001 · STILL CONNECTED.\nType "martzian" anywhere.',
    'font:800 32px "Barlow Condensed",sans-serif;color:#FF3737;letter-spacing:6px', 'font:12px monospace;color:#71808C');
}

initCursor();
initReveal();
initMapSheet();
initEggs();
