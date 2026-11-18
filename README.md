# MARTZIAN — Enter the Unknown

Sitio oficial de Martzian. Astro (HTML estático, ideal para SEO) + Three.js diferido + GitHub Pages.

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # genera dist/
npm run preview   # sirve dist/
```

## Publicar en GitHub Pages

1. Crea un repo llamado **`martzian.github.io`** (recomendado: el sitio queda en la raíz `https://martzian.github.io/`, lo mejor para SEO).
   Con otro nombre funciona igual, pero queda en `https://martzian.github.io/<repo>/`, y en ese caso el `robots.txt` y la página 404 no aplican.
   ⚠️ Tu portafolio vive en `martzian.github.io/Portfolio/` (repo `Portfolio`), así que no hay conflicto: ambos repos siguen independientes.
2. Sube el código a `main`.
3. En el repo: **Settings → Pages → Source: GitHub Actions**. El workflow `.github/workflows/deploy.yml` compila y publica en cada push.

## SEO: pasos después de publicar

1. Entra a [Google Search Console](https://search.google.com/search-console), añade la propiedad `https://martzian.github.io/` y verifícala (método "etiqueta HTML": pega la meta en `src/layouts/Base.astro`, dentro de `<head>`).
2. Envía el sitemap: `https://martzian.github.io/sitemap-index.xml`.
3. Pon el enlace al sitio en la descripción y en "Enlaces" del canal de YouTube, y en tus redes. Los enlaces de vuelta son lo que más ayuda a posicionar una marca nueva.
4. Añade tus redes reales a `socials` en `src/data/site.ts` (van al schema `sameAs`, que ayuda a Google a relacionar tus perfiles con "Martzian").

Lo que ya está incluido: HTML prerenderizado con el contenido real, títulos y descripciones únicos por página, canonical, hreflang ES/EN, Open Graph y Twitter Card con imagen 1200×630, JSON-LD (WebSite, Person, BreadcrumbList), sitemap, robots.txt, imágenes WebP optimizadas y JS mínimo en la carga inicial.

## Dónde editar el contenido

| Qué | Archivo |
|---|---|
| Enlaces (YouTube, portafolio, redes), último video, modelo 3D | `src/data/site.ts` |
| Challenges (expedientes, ganadores, videos) | `src/data/challenges.json` |
| Hall of Fame | `src/data/hall-of-fame.json` |
| Especialidades, disponibilidad, perfiles de ejemplo | `src/data/registry.ts` |
| Secciones del mapa (abrir una sección futura) | `src/data/modules.ts` |
| Todos los textos ES / EN | `src/i18n/ui.ts` |

Todo el contenido de challenges, ganadores y artistas es **placeholder** y está marcado así en la interfaz. Al poner `"placeholder": false` en un challenge desaparece el aviso de "contenido de ejemplo".

### Añadir una sección nueva (p. ej. Virtual Worlds)
1. Crea `src/views/VirtualWorldsView.astro` (copia `PortfolioView.astro` como base).
2. Crea `src/pages/virtual-worlds.astro` y `src/pages/en/virtual-worlds.astro` (dos líneas, igual que las demás).
3. En `src/data/modules.ts` cambia su `status` a `'open'`. La navegación, el mapa y el dock móvil se actualizan solos.

## Modelo 3D
Lee `public/models/LEEME.md`. Mientras no exista el modelo se usa la imagen de referencia; si el GLB falla o el dispositivo no tiene WebGL, se vuelve a la imagen automáticamente.

## Artist Registry: backend pendiente
El formulario valida los datos de verdad, pero **no envía ni guarda nada**, y la interfaz lo dice. Para conectarlo implementa `RegistryService` en `src/lib/registry-service.ts` (Supabase o Firebase encajan bien con un sitio estático) y reemplaza `OfflineRegistryService`.
La consola `/overseer/` es una maqueta (`noindex`): en GitHub Pages **no puede ser privada**. La versión real necesita autenticación del lado del backend.

## Easter eggs
- Escribe `martzian` en cualquier página.
- Haz clic 5 veces sobre el sujeto en la Home.
- Haz clic en el código hexadecimal del footer.
- Abre la consola del navegador.
