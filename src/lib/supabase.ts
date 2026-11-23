import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Cliente de Supabase para el navegador. Usa la clave PUBLISHABLE (pública por diseño):
// la seguridad la dan las reglas RLS de supabase/migrations/. Nunca uses aquí la secret key.
// Si faltan las variables (p.ej. un build sin .env), queda en null y el sitio funciona en modo desconectado.
const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;
