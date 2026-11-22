import type { Lang } from '../data/site';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Ruta interna con base y prefijo de idioma. slug '' = home. */
export function href(lang: Lang, slug = ''): string {
  const s = slug.replace(/^\/|\/$/g, '');
  const prefix = lang === 'en' ? 'en/' : '';
  return BASE + prefix + (s ? s + '/' : '');
}

/**
 * Recurso estático dentro de public/, o una URL externa completa (https://…), que se deja tal cual.
 * Acepta la ruta con o sin "public/" delante ("IDV/x.webp" y "public/IDV/x.webp" son lo mismo).
 */
export function asset(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return BASE + path.replace(/^\/+/, '').replace(/^public\//, '');
}

/** ID de YouTube a partir del ID o de cualquier enlace (watch?v=, youtu.be/, shorts/, embed/). */
export function youtubeId(value: string): string {
  const m = value.match(/(?:v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  return m ? m[1] : value.trim();
}

export function absolute(site: URL | undefined, path: string): string {
  return new URL(path, site ?? 'https://martzian.github.io').href;
}
