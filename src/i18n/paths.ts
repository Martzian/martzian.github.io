import type { Lang } from '../data/site';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Ruta interna con base y prefijo de idioma. slug '' = home. */
export function href(lang: Lang, slug = ''): string {
  const s = slug.replace(/^\/|\/$/g, '');
  const prefix = lang === 'en' ? 'en/' : '';
  return BASE + prefix + (s ? s + '/' : '');
}

/** Recurso estático dentro de public/. */
export function asset(path: string): string {
  return BASE + path.replace(/^\//, '');
}

export function absolute(site: URL | undefined, path: string): string {
  return new URL(path, site ?? 'https://martzian.github.io').href;
}
