// Configuración global del sitio. Edita aquí los enlaces reales.
export const site = {
  name: 'Martzian',
  youtube: 'https://www.youtube.com/@TheMartzian',
  portfolio: 'https://martzian.github.io/Portfolio/',
  // Otras redes (se añaden al schema "sameAs" para que Google relacione los perfiles).
  socials: [] as { label: string; url: string }[],

  // Último video destacado en la Home. Déjalo en null para mostrar el placeholder.
  // Ejemplo: { id: 'dQw4w9WgXcQ', title: { es: '...', en: '...' }, date: '2026-11-01', description: { es: '...', en: '...' } }
  latestVideo: {
    id: 'iafvZEwVeBQ',
    title: { es: 'HASTA PRONTO...', en: 'SEE YOU SOON...' },
    description: {
      es: 'Un video diferente: por qué pongo en pausa todo lo relacionado a Martzian por un tiempo y qué pasó detrás de cámaras estos últimos meses.',
      en: 'A different kind of video: why I’m putting everything Martzian on pause for a while, and what happened behind the scenes these past months.',
    },
    date: '2025-12-08T12:00:00',
  } as null | {
    id: string;
    title: { es: string; en: string };
    description: { es: string; en: string };
    date: string;
  },

  // Modelo 3D del personaje (GLB/GLTF). Ponlo en public/models/ y escribe la ruta relativa,
  // p.ej. 'models/martzian.glb'. Si es null se usa la imagen de referencia.
  characterModel: null as string | null,
};

export type Lang = 'es' | 'en';
export type L10n = { es: string; en: string };
