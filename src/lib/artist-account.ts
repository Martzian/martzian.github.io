// Cuenta del artista: acceso con código por correo y edición de SU propio registro.
// Todo pasa por funciones de la base de datos (supabase/migrations/20261123000000_artist_self_service.sql)
// que comprueban que el correo de la sesión está verificado y coincide con el registro.
import { supabase } from './supabase';

export type ArtistStatus = 'new' | 'review' | 'approved' | 'contacted' | 'rejected';

export interface MyProfile {
  id: string; created_at: string; updated_at: string | null; status: ArtistStatus;
  name: string; email: string; location: string | null; experience: number | null; specialties: string[];
  bio: string | null; portfolio: string; socials: string | null; availability: string; additional: string | null;
  listed: boolean; show_location: boolean; show_experience: boolean; show_bio: boolean;
  show_portfolio: boolean; show_socials: boolean; show_availability: boolean;
}

export type ProfileUpdate = Omit<MyProfile, 'id' | 'created_at' | 'updated_at' | 'status' | 'email' | 'experience'> & { experience: string };

export const EDITABLE: ArtistStatus[] = ['approved', 'contacted'];

const db = () => {
  if (!supabase) throw new Error('OFFLINE');
  return supabase;
};

/** Envía el código de acceso (y un enlace equivalente) al correo. */
export async function requestCode(email: string) {
  const { error } = await db().auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true, emailRedirectTo: location.href.split(/[?#]/)[0] },
  });
  if (error) throw new Error(error.status === 429 ? 'RATE_LIMIT' : 'SEND_FAILED');
}

export async function verifyCode(email: string, token: string) {
  const { data, error } = await db().auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: 'email' });
  if (error || !data.session) throw new Error('BAD_CODE');
}

export async function currentEmail(): Promise<string | null> {
  const { data } = await db().auth.getSession();
  return data.session?.user.email ?? null;
}

export function onSignedIn(cb: () => void) {
  db().auth.onAuthStateChange((event) => { if (event === 'SIGNED_IN') cb(); });
}

export async function signOut() {
  await db().auth.signOut();
}

/** El registro del artista con sesión, o null si su correo no tiene registro. */
export async function getMyProfile(): Promise<MyProfile | null> {
  const { data, error } = await db().rpc('my_profile');
  if (error) throw new Error('LOAD_FAILED');
  return (data as MyProfile | null) ?? null;
}

export async function saveMyProfile(p: ProfileUpdate): Promise<MyProfile> {
  const { data, error } = await db().rpc('update_my_profile', { p });
  if (error) throw new Error(error.message.includes('NOT_EDITABLE') ? 'NOT_EDITABLE' : error.code === '23514' ? 'INVALID' : 'SAVE_FAILED');
  return data as MyProfile;
}
