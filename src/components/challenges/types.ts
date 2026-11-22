import type { L10n } from '../../data/site';

export type ChallengeStatus = 'COMPLETED' | 'ACTIVE' | 'UPCOMING';

export type CriterionIcon = 'skull' | 'clock' | 'bolt' | 'star' | 'chair' | 'hash';

/** Un criterio de comparación. */
export interface CriterionDef {
  /** Clave con la que se guarda el valor en results[].scores */
  id: string;
  /** count = número entero · time = milisegundos o "mm:ss.mmm" */
  type: 'count' | 'time';
  /** asc = gana el menor (muertes, tiempo) · desc = gana el mayor (puntos) */
  order: 'asc' | 'desc';
  icon: CriterionIcon;
  label: L10n;
  /** Etiqueta corta para la columna de la tabla en móvil (opcional). */
  short?: L10n;
}

/**
 * Id de un criterio predefinido ("deaths", "time", "powers", "points", "chairs"), opcionalmente con orden
 * ("deaths:desc" = gana quien tenga más muertes), o un objeto. Un objeto con id predefinido solo
 * necesita lo que cambia ({ "id": "time", "order": "desc" }); uno propio necesita "label".
 */
export type CriterionInput = string | (Partial<CriterionDef> & { id: string });

/** Un participante. scores usa los ids de los criterios; vacío/null mientras no haya resultados. */
export interface Result {
  name: string;
  avatar: string | null;
  scores: Record<string, number | string | null>;
}

export interface Challenge {
  id: string;
  number: string;
  status: ChallengeStatus;
  date: string | null;
  placeholder: boolean;
  title: L10n;
  /** Texto corto que se muestra bajo el título en el panel de resultados. */
  description: L10n;
  /** Reglas del challenge, una por elemento. Listas vacías = la sección no se muestra. */
  rules: { es: string[]; en: string[] };
  /** Criterios de comparación en orden de prioridad. Por defecto: ["deaths", "time"]. */
  criteria?: CriterionInput[];
  /** Cuántos ganadores se muestran en el ranking. Por defecto: 3. */
  winners?: number;
  results: Result[];
  youtube: string | null;
  thumbnail: string | null;
  winnersImage: string | null;
}
