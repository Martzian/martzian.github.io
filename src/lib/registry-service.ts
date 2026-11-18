// Contrato para la futura integración del Artist Registry con un backend real
// (p.ej. Supabase, Firebase o una API propia). Hoy NO hay backend: el servicio
// por defecto se niega a guardar nada, y la interfaz lo comunica al usuario.

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

export interface ArtistProfile extends ArtistProfileInput {
  id: string;
  avatarUrl?: string;
  createdAt: string;
  status: 'new' | 'review' | 'approved' | 'contacted';
}

export interface RegistryService {
  readonly connected: boolean;
  submit(input: ArtistProfileInput): Promise<{ id: string }>;
  listPublic(filter?: { specialty?: string; q?: string }): Promise<ArtistProfile[]>;
}

export class OfflineRegistryService implements RegistryService {
  readonly connected = false;
  async submit(): Promise<{ id: string }> {
    throw new Error('REGISTRY_OFFLINE');
  }
  async listPublic(): Promise<ArtistProfile[]> {
    return [];
  }
}

// Cambia esta línea cuando exista el backend.
export const registryService: RegistryService = new OfflineRegistryService();

export function validateProfile(p: Partial<ArtistProfileInput>): Record<string, 'required' | 'invalid'> {
  const errors: Record<string, 'required' | 'invalid'> = {};
  if (!p.name?.trim()) errors.name = 'required';
  if (!p.email?.trim()) errors.email = 'required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) errors.email = 'invalid';
  if (!p.portfolio?.trim()) errors.portfolio = 'required';
  else {
    try { new URL(p.portfolio); } catch { errors.portfolio = 'invalid'; }
  }
  if (!p.specialties?.length) errors.specialties = 'required';
  return errors;
}
