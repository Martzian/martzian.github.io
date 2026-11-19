import type { L10n } from './site';

// Mapa de la instalación. Cada módulo es una sección del sitio.
// Para abrir una sección futura: crea su página (src/pages/<slug>.astro y src/pages/en/<slug>.astro)
// y cambia `status` a 'open' con su `slug`. La navegación, el mapa y el dock móvil se actualizan solos.
export interface FacilityModule {
  n: string;
  slug: string; // '' = home
  status: 'open' | 'sealed';
  name: L10n;
  code: L10n;
  desc: L10n;
  short: L10n; // etiqueta corta para el dock móvil
}

export const modules: FacilityModule[] = [
  {
    n: '01', slug: '', status: 'open',
    name: { es: 'INICIO', en: 'HOME' },
    code: { es: 'NÚCLEO · INICIO', en: 'CORE · HOME' },
    desc: { es: 'El punto de despertar. Origen de Martzian y estado del sistema.', en: 'The waking point. Martzian’s origin and the system status.' },
    short: { es: 'INICIO', en: 'HOME' },
  },
  {
    n: '02', slug: 'challenges', status: 'open',
    name: { es: 'IDV CHALLENGES', en: 'IDV CHALLENGES' },
    code: { es: 'ARCHIVO DE PRUEBAS', en: 'TRIAL ARCHIVE' },
    desc: { es: 'Expedientes de cada prueba, participantes y el Hall of Fame.', en: 'Files for every trial, its participants and the Hall of Fame.' },
    short: { es: 'CHALLENGES', en: 'TRIALS' },
  },
  {
    n: '03', slug: 'portfolio', status: 'open',
    name: { es: 'PORTAFOLIO', en: 'PORTFOLIO' },
    code: { es: 'BASE DEL CREADOR', en: 'CREATOR DATABASE' },
    desc: { es: 'Artefactos del creador: 3D, desarrollo y trabajo profesional.', en: 'The creator’s artifacts: 3D, development and professional work.' },
    short: { es: 'PORTAFOLIO', en: 'ARCHIVE' },
  },
  {
    n: '04', slug: 'registry', status: 'open',
    name: { es: 'ARTISTAS', en: 'ARTIST REGISTRY' },
    code: { es: 'INGRESO / DIRECTORIO', en: 'INTAKE / DIRECTORY' },
    desc: { es: 'Regístrate como artista y únete a la red de colaboradores.', en: 'Sign up as an artist and join the collaborator network.' },
    short: { es: 'ARTISTAS', en: 'REGISTRY' },
  },
  {
    n: '05', slug: 'virtual-worlds', status: 'sealed',
    name: { es: 'VIRTUAL WORLDS', en: 'VIRTUAL WORLDS' },
    code: { es: 'MUNDOS', en: 'WORLDS' },
    desc: { es: 'Escenarios WebGL, museos y pequeños juegos explorables.', en: 'WebGL scenes, museums and small explorable games.' },
    short: { es: 'MUNDOS', en: 'WORLDS' },
  },
  {
    n: '06', slug: 'experiments', status: 'sealed',
    name: { es: 'EXPERIMENTS', en: 'EXPERIMENTS' },
    code: { es: 'LABORATORIO', en: 'LAB' },
    desc: { es: 'Shaders, simulaciones, prototipos y pruebas técnicas.', en: 'Shaders, simulations, prototypes and tech tests.' },
    short: { es: 'LAB', en: 'LAB' },
  },
  {
    n: '07', slug: 'media', status: 'sealed',
    name: { es: 'MEDIA ARCHIVE', en: 'MEDIA ARCHIVE' },
    code: { es: 'MEDIA', en: 'MEDIA' },
    desc: { es: 'Videos, detrás de cámaras y material del canal.', en: 'Videos, behind the scenes and channel material.' },
    short: { es: 'MEDIA', en: 'MEDIA' },
  },
  {
    n: '08', slug: 'community', status: 'sealed',
    name: { es: 'COMMUNITY', en: 'COMMUNITY' },
    code: { es: 'COMUNIDAD', en: 'COMMUNITY' },
    desc: { es: 'Actividades, participaciones y eventos de la comunidad.', en: 'Community activities, entries and events.' },
    short: { es: 'COMUNIDAD', en: 'COMMUNITY' },
  },
];

export const openModules = modules.filter((m) => m.status === 'open');
export const sealedModules = modules.filter((m) => m.status === 'sealed');
