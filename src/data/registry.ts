import type { L10n } from './site';

// Categorías de especialidad. Añade o quita entradas libremente; el formulario,
// los filtros del directorio y la futura base de datos usan estos `id`.
export const specialties: { id: string; label: L10n }[] = [
  { id: 'model', label: { es: 'Modelado 3D', en: '3D Modeling' } },
  { id: 'char', label: { es: 'Diseño de personajes', en: 'Character Design' } },
  { id: 'rig', label: { es: 'Rigging', en: 'Rigging' } },
  { id: 'anim', label: { es: 'Animación', en: 'Animation' } },
  { id: 'env', label: { es: 'Arte de entornos', en: 'Environment Art' } },
  { id: 'concept', label: { es: 'Arte conceptual', en: 'Concept Art' } },
  { id: 'tex', label: { es: 'Texturizado', en: 'Texturing' } },
  { id: 'vfx', label: { es: 'VFX', en: 'VFX' } },
  { id: 'game', label: { es: 'Desarrollo de videojuegos', en: 'Game Development' } },
  { id: 'edit', label: { es: 'Edición de video', en: 'Video Editing' } },
  { id: 'motion', label: { es: 'Motion graphics', en: 'Motion Graphics' } },
  { id: 'sound', label: { es: 'Diseño sonoro', en: 'Sound Design' } },
];

export const availability: { id: string; label: L10n; tag: L10n }[] = [
  { id: 'now', label: { es: 'Disponible ahora', en: 'Available now' }, tag: { es: 'DISPONIBLE', en: 'AVAILABLE' } },
  { id: 'free', label: { es: 'Freelance', en: 'Freelance' }, tag: { es: 'FREELANCE', en: 'FREELANCE' } },
  { id: 'part', label: { es: 'Medio tiempo', en: 'Part-time' }, tag: { es: 'MEDIO TIEMPO', en: 'PART-TIME' } },
  { id: 'none', label: { es: 'No disponible', en: 'Unavailable' }, tag: { es: 'NO DISPONIBLE', en: 'UNAVAILABLE' } },
];

export const experience: L10n[] = [
  { es: 'Menos de 1 año', en: 'Under 1 year' },
  { es: '1 – 3 años', en: '1 – 3 years' },
  { es: '3 – 5 años', en: '3 – 5 years' },
  { es: 'Más de 5 años', en: 'Over 5 years' },
];

// Perfiles de EJEMPLO para mostrar el directorio. Se reemplazarán por los datos del backend.
export const sampleArtists = [
  { name: 'ARTIST SLOT 01', tags: ['model', 'tex'], av: 'now' },
  { name: 'ARTIST SLOT 02', tags: ['concept', 'char'], av: 'free' },
  { name: 'ARTIST SLOT 03', tags: ['rig', 'anim'], av: 'none' },
  { name: 'ARTIST SLOT 04', tags: ['env'], av: 'now' },
  { name: 'ARTIST SLOT 05', tags: ['vfx', 'motion'], av: 'part' },
  { name: 'ARTIST SLOT 06', tags: ['sound', 'edit'], av: 'free' },
];
