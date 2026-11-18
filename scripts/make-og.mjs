// Genera las imágenes optimizadas a partir de assets-src/.
// Uso: npm run og   (sólo hace falta volver a correrlo si cambias la imagen fuente)
//
// Fuente: render panorámico 1920x1080 con fondo transparente (PNG con alfa).
import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

const SRC = 'assets-src/martzian_final.png';
const OUT = 'public/img';
const BG = '#16090B';
await mkdir(OUT, { recursive: true });
const kb = async (f) => `${f.replace(OUT + '/', '')} ${((await stat(f)).size / 1024).toFixed(1)} KB`;
const log = [];

// 1) Hero panorámico con transparencia (WebP con canal alfa) en 3 anchos
for (const w of [960, 1440, 1920]) {
  const f = `${OUT}/martzian-hero-${w}.webp`;
  await sharp(SRC).resize(w).webp({ quality: 80, alphaQuality: 85, effort: 6, smartSubsample: true }).toFile(f);
  log.push(await kb(f));
}

// Respaldo PNG (navegadores sin WebP, muy raros hoy): 1440 px, paleta reducida
{
  const f = `${OUT}/martzian-hero-1440.png`;
  await sharp(SRC).resize(1440).png({ palette: true, quality: 85, effort: 10 }).toFile(f);
  log.push(await kb(f));
}

// 2) Recorte cuadrado centrado en el personaje, sobre fondo oscuro con brillo rojo
//    (bloque "¿Quién es Martzian?", schema Person y vista previa)
const glow = Buffer.from(`<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#4a1014"/><stop offset="0.55" stop-color="${BG}"/><stop offset="1" stop-color="#080808"/></radialGradient></defs>
  <rect width="1080" height="1080" fill="url(#g)"/></svg>`);
const square = await sharp(SRC).extract({ left: 420, top: 0, width: 1080, height: 1080 }).toBuffer();
const squareFlat = await sharp(glow).composite([{ input: square }]).png().toBuffer();
for (const w of [480, 800]) {
  const f = `${OUT}/martzian-${w}.webp`;
  await sharp(squareFlat).resize(w).webp({ quality: 80, effort: 6 }).toFile(f);
  log.push(await kb(f));
}
{
  const f = `${OUT}/martzian-1080.jpg`;
  await sharp(squareFlat).jpeg({ quality: 82, mozjpeg: true }).toFile(f);
  log.push(await kb(f));
}

// 3) Open Graph / Twitter 1200x630: personaje a la derecha, texto a la izquierda
const ogChar = await sharp(SRC).resize(1120, 630).toBuffer(); // 16:9 → 1120x630
const ogBg = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs><radialGradient id="g" cx="68%" cy="40%" r="55%"><stop offset="0" stop-color="#3a0d10"/><stop offset="0.6" stop-color="${BG}"/><stop offset="1" stop-color="#080808"/></radialGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/></svg>`);
const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0.30" stop-color="#080808" stop-opacity="1"/>
      <stop offset="0.58" stop-color="#080808" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <text x="72" y="150" font-family="Consolas, 'Courier New', monospace" font-size="22" letter-spacing="6" fill="#FF3737">SUBJECT 001 · REACTIVATION</text>
  <text x="66" y="300" font-family="'Arial Narrow', Arial, sans-serif" font-weight="800" font-size="128" letter-spacing="4" fill="#D7D7D7">MARTZIAN</text>
  <text x="72" y="370" font-family="'Arial Narrow', Arial, sans-serif" font-size="34" letter-spacing="8" fill="#D7D7D7">THE SYSTEM IS <tspan fill="#FF3737">STILL ALIVE.</tspan></text>
  <text x="72" y="540" font-family="Consolas, 'Courier New', monospace" font-size="20" letter-spacing="4" fill="#71808C">ENTER THE UNKNOWN</text>
</svg>`);
{
  const f = `${OUT}/og-martzian.jpg`;
  await sharp(ogBg)
    .composite([{ input: ogChar, left: 330, top: 0 }, { input: overlay, left: 0, top: 0 }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(f);
  log.push(await kb(f));
}

// 4) Íconos
const icon = Buffer.from(`
<svg width="512" height="512" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
  <rect width="34" height="34" fill="#080808"/>
  <g fill="none" stroke-width="1.4"><circle cx="17" cy="17" r="13" stroke="#D7D7D7"/>
  <path d="M6 15 H28 M7 19 H27" stroke="#D7D7D7"/>
  <path d="M12 24 L22 24 M13 22 L13 26 M17 22 L17 26 M21 22 L21 26" stroke="#FF3737"/></g>
</svg>`);
await sharp(icon).resize(180).png().toFile('public/apple-touch-icon.png');
await sharp(icon).resize(512).png().toFile(`${OUT}/icon-512.png`);
await sharp(icon).resize(192).png().toFile(`${OUT}/icon-192.png`);

console.log(`Fuente: ${SRC} (${((await stat(SRC)).size / 1024).toFixed(0)} KB)\n` + log.join('\n'));
