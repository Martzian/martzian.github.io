// Artist Registry: acceso a datos. El backend es Supabase (tabla public.artists,
// esquema y reglas de seguridad en supabase/migrations/). Si el build no tiene las
// variables de entorno, se usa el servicio desconectado y la interfaz lo comunica.
import { supabase } from './supabase';

export interface ArtistProfileInput {
  name: string;
  email: string;
  location?: string;
  experience?: string;
  specialties: string[];
  bio?: string;
  portfolio: string;
  socials?: string;
  availability: string;
  additional?: string;
}

// Lo que el directorio público puede ver (nunca el correo ni las notas)
export interface PublicArtist {
  id: string;
  createdAt: string;
  name: string;
  location: string | null;
  experience: number | null;
  specialties: string[];
  bio: string | null;
  portfolio: string;
  socials: string | null;
  availability: string;
  avatarUrl: string | null;
}

export type SubmitError = 'REGISTRY_OFFLINE' | 'DUPLICATE' | 'INVALID' | 'NETWORK';

export interface RegistryService {
  readonly connected: boolean;
  submit(input: ArtistProfileInput): Promise<void>;
  listPublic(): Promise<PublicArtist[]>;
}

// Límites: deben coincidir con los CHECK de la tabla
export const LIMITS = { name: 120, email: 254, location: 120, bio: 1500, portfolio: 500, socials: 300, additional: 1500 } as const;

export class OfflineRegistryService implements RegistryService {
  readonly connected = false;
  async submit(): Promise<void> {
    throw new Error('REGISTRY_OFFLINE' satisfies SubmitError);
  }
  async listPublic(): Promise<PublicArtist[]> {
    return [];
  }
}

const PUBLIC_COLUMNS = 'id, created_at, name, location, experience, specialties, bio, portfolio, socials, availability, avatar_url';
const orNull = (v?: string) => (v && v.trim() ? v.trim() : null);

export class SupabaseRegistryService implements RegistryService {
  readonly connected = true;
  constructor(private db: NonNullable<typeof supabase>) {}

  async submit(p: ArtistProfileInput): Promise<void> {
    // Sin .select(): los visitantes pueden insertar pero no leer la tabla
    const { error } = await this.db.from('artists').insert({
      name: p.name.trim(),
      email: p.email.trim().toLowerCase(),
      location: orNull(p.location),
      experience: p.experience ? Number(p.experience) : null,
      specialties: p.specialties,
      bio: orNull(p.bio),
      portfolio: p.portfolio.trim(),
      socials: orNull(p.socials),
      availability: p.availability || 'free',
      additional: orNull(p.additional),
    });
    if (!error) return;
    const code: SubmitError = error.code === '23505' ? 'DUPLICATE' : error.code === '23514' || error.code === '22P02' ? 'INVALID' : 'NETWORK';
    throw new Error(code);
  }

  async listPublic(): Promise<PublicArtist[]> {
    const { data, error } = await this.db.from('artists').select(PUBLIC_COLUMNS).order('created_at', { ascending: false });
    if (error) throw new Error('NETWORK');
    return (data ?? []).map((r) => ({
      id: r.id, createdAt: r.created_at, name: r.name, location: r.location, experience: r.experience,
      specialties: r.specialties ?? [], bio: r.bio, portfolio: r.portfolio, socials: r.socials,
      availability: r.availability, avatarUrl: r.avatar_url,
    }));
  }
}

export const registryService: RegistryService = supabase ? new SupabaseRegistryService(supabase) : new OfflineRegistryService();

export function validateProfile(p: Partial<ArtistProfileInput>): Record<string, 'required' | 'invalid'> {
  const errors: Record<string, 'required' | 'invalid'> = {};
  if (!p.name?.trim()) errors.name = 'required';
  else if (p.name.trim().length > LIMITS.name) errors.name = 'invalid';
  if (!p.email?.trim()) errors.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim()) || p.email.length > LIMITS.email) errors.email = 'invalid';
  if (!p.portfolio?.trim()) errors.portfolio = 'required';
  else {
    try {
      const u = new URL(p.portfolio.trim());
      if (!/^https?:$/.test(u.protocol) || p.portfolio.length > LIMITS.portfolio) errors.portfolio = 'invalid';
    } catch { errors.portfolio = 'invalid'; }
  }
  if (!p.specialties?.length) errors.specialties = 'required';
  return errors;
}
