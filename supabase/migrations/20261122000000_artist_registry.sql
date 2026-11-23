-- ==========================================================================
-- MARTZIAN — Artist Registry
-- Pega este archivo completo en Supabase → SQL Editor → Run.
--
-- Modelo de seguridad (el sitio es estático, así que el navegador habla
-- directo con Supabase usando la clave pública; TODO se protege con RLS):
--   · Visitantes (anon):  pueden INSERTAR un registro. No pueden leer, editar
--                         ni borrar nada, ni elegir su propio estado.
--                         Pueden LEER sólo perfiles aprobados y sólo columnas
--                         públicas (nunca el correo ni las notas).
--   · Admin (tú):         con sesión iniciada y en la tabla `admins`, puede
--                         leer todo, cambiar estados y borrar (consola Overseer).
-- ==========================================================================

-- ---------- Tabla principal ----------
create table public.artists (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  status       text not null default 'new'
               check (status in ('new', 'review', 'approved', 'contacted', 'rejected')),

  name         text not null check (char_length(trim(name)) between 1 and 120),
  email        text not null check (char_length(email) <= 254 and email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  location     text check (char_length(location) <= 120),
  experience   smallint check (experience between 0 and 3),          -- índice de `experience` en src/data/registry.ts
  specialties  text[] not null check (
                 cardinality(specialties) between 1 and 12
                 and specialties <@ array['model','char','rig','anim','env','concept','tex','vfx','game','edit','motion','sound']
               ),                                                    -- ids de `specialties` en src/data/registry.ts
  bio          text check (char_length(bio) <= 1500),
  portfolio    text not null check (char_length(portfolio) <= 500 and portfolio ~* '^https?://'),
  socials      text check (char_length(socials) <= 300),
  availability text not null default 'free' check (availability in ('now', 'free', 'part', 'none')),
  additional   text check (char_length(additional) <= 1500),
  avatar_url   text,
  admin_notes  text                                                  -- sólo visible para el admin
);

-- Un registro por correo (sin distinguir mayúsculas)
create unique index artists_email_key on public.artists (lower(email));
create index artists_status_idx on public.artists (status, created_at desc);

-- ---------- Administradores ----------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
-- (sin políticas: nadie la lee desde el navegador; se usa sólo dentro de is_admin())

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Permisos por columna ----------
alter table public.artists enable row level security;

revoke all on public.artists from anon, authenticated;

-- Visitantes: insertar sólo los campos del formulario (no status, avatar, notas…)
grant insert (name, email, location, experience, specialties, bio, portfolio, socials, availability, additional)
  on public.artists to anon, authenticated;

-- Visitantes: leer sólo columnas públicas (el correo y las notas quedan fuera)
grant select (id, created_at, name, location, experience, specialties, bio, portfolio, socials, availability, avatar_url)
  on public.artists to anon;

-- Admin: todo
grant select, update, delete on public.artists to authenticated;

-- ---------- Políticas RLS ----------
create policy "Cualquiera puede registrarse"
  on public.artists for insert to anon, authenticated
  with check (true);

create policy "Directorio público: sólo aprobados"
  on public.artists for select to anon
  using (status = 'approved');

create policy "Admin lee todo"
  on public.artists for select to authenticated
  using (public.is_admin());

create policy "Admin actualiza"
  on public.artists for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admin borra"
  on public.artists for delete to authenticated
  using (public.is_admin());

-- ==========================================================================
-- DESPUÉS de crear tu usuario admin (Authentication → Users → Add user),
-- copia su UUID y ejecuta:
--   insert into public.admins (user_id) values ('<UUID-de-tu-usuario>');
-- ==========================================================================
