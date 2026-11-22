import type { L10n } from '../../data/site';
import type { CriterionDef, CriterionInput, Result } from './types';

/**
 * Criterios predefinidos. En challenges.json basta con escribir su id:
 *   "criteria": ["deaths", "time"]   → menos muertes; desempata el menor tiempo
 *   "criteria": ["time"]             → solo cuenta el tiempo
 *   "criteria": ["powers", "time"]   → menos poderes usados; desempata el tiempo
 * También puedes definir uno propio con un objeto (ver CriterionDef en types.ts).
 */
export const PRESETS: Record<string, CriterionDef> = {
  deaths: { id: 'deaths', type: 'count', order: 'asc', icon: 'skull', label: { es: 'Muertes', en: 'Deaths' }, short: { es: 'Muer.', en: 'Dth' } },
  time: { id: 'time', type: 'time', order: 'asc', icon: 'clock', label: { es: 'Tiempo', en: 'Time' } },
  powers: { id: 'powers', type: 'count', order: 'asc', icon: 'bolt', label: { es: 'Poderes usados', en: 'Powers used' }, short: { es: 'Pod.', en: 'Pwr' } },
  points: { id: 'points', type: 'count', order: 'desc', icon: 'star', label: { es: 'Puntos', en: 'Points' }, short: { es: 'Pts', en: 'Pts' } },
  chairs: { id: 'chairs', type: 'count', order: 'desc', icon: 'chair', label: { es: 'Sillas', en: 'Chairs' }, short: { es: 'Sil.', en: 'Chr' } },
};

export const DEFAULT_CRITERIA: CriterionInput[] = ['deaths', 'time'];

export function resolveCriteria(input: CriterionInput[] | undefined | null): CriterionDef[] {
  const list = input && input.length ? input : DEFAULT_CRITERIA;
  return list.map((c) => {
    if (typeof c === 'string') {
      // "deaths" usa el orden predefinido; "deaths:desc" / "time:asc" lo invierten o fijan
      const [id, order] = c.split(':').map((s) => s.trim());
      const p = PRESETS[id];
      if (!p) throw new Error(`[challenges] Criterio desconocido "${c}". Usa ${Object.keys(PRESETS).join(', ')} o un objeto.`);
      if (order && order !== 'asc' && order !== 'desc') throw new Error(`[challenges] Orden no válido en "${c}": usa :asc o :desc.`);
      return order ? { ...p, order } : p;
    }
    const base = PRESETS[c.id];
    if (!base && !c.label) throw new Error(`[challenges] El criterio propio "${c.id}" necesita "label".`);
    return { icon: 'hash', type: 'count', order: 'asc', ...base, ...c } as CriterionDef;
  });
}

/** Acepta milisegundos (873483) o texto "mm:ss.mmm" / "h:mm:ss.mmm" ("14:33.483"). */
export function toNumber(v: number | string | null | undefined, type: CriterionDef['type']): number | null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return v;
  if (type === 'time') {
    const parts = v.trim().split(':').map(Number);
    if (parts.some(Number.isNaN)) return null;
    const secs = parts.reduce((acc, p) => acc * 60 + p, 0);
    return Math.round(secs * 1000);
  }
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

const pad = (n: number, l = 2) => String(n).padStart(l, '0');
/** mm:ss (h:mm:ss si pasa de una hora) */
export function fmtTime(ms: number | null): string {
  if (ms == null) return '—';
  const h = Math.floor(ms / 3600000);
  const mmss = `${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}`;
  return h ? `${h}:${mmss}` : mmss;
}

export const fmtValue = (v: number | null, c: CriterionDef) => (v == null ? '—' : c.type === 'time' ? fmtTime(v) : String(v));

export interface Ranked extends Result {
  place: number;
  values: (number | null)[];
  /** Índice del criterio que decidió frente al rival de referencia; -1 = empate total. */
  decidedAt: number;
  /** Diferencia en ese criterio (siempre positiva). */
  gap: number;
}

/** Ordena por cada criterio en orden; un valor vacío siempre va al final. */
export function rank(results: Result[], criteria: CriterionDef[]): Ranked[] {
  const rows = results.map((r) => ({ r, values: criteria.map((c) => toNumber(r.scores?.[c.id], c.type)) }));
  const cmpAt = (a: (number | null)[], b: (number | null)[], i: number) => {
    const x = a[i], y = b[i];
    if (x == null || y == null) return x == null && y == null ? 0 : x == null ? 1 : -1;
    return criteria[i].order === 'desc' ? y - x : x - y;
  };
  rows.sort((a, b) => {
    for (let i = 0; i < criteria.length; i++) { const d = cmpAt(a.values, b.values, i); if (d) return d; }
    return 0;
  });
  return rows.map(({ r, values }, i) => {
    const other = i === 0 ? rows[1] : rows[i - 1];
    let decidedAt = -1, gap = 0;
    if (other) {
      decidedAt = criteria.findIndex((_, k) => cmpAt(values, other.values, k) !== 0);
      if (decidedAt >= 0) gap = Math.abs((values[decidedAt] ?? 0) - (other.values[decidedAt] ?? 0));
    } else decidedAt = 0;
    return { ...r, place: i + 1, values, decidedAt, gap };
  });
}

export const label = (c: CriterionDef, lang: keyof L10n) => c.label[lang].toUpperCase();
export const shortLabel = (c: CriterionDef, lang: keyof L10n) => (c.short ?? c.label)[lang].toUpperCase();
