// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE y BASE se pueden sobreescribir desde el workflow de GitHub Actions.
// - Repo "martzian.github.io"  → https://martzian.github.io/        (BASE = "/")   ← recomendado para SEO
// - Repo con otro nombre, p.ej. "Martzian" → https://martzian.github.io/Martzian/ (BASE = "/Martzian")
const SITE = process.env.SITE ?? 'https://martzian.github.io';
const BASE = process.env.BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } },
      filter: (page) => !page.includes('/overseer/') && !page.includes('/asteria/') && !page.includes('/404'),
    }),
  ],
});
