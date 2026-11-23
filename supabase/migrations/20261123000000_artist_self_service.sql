-- ==========================================================================
-- MARTZIAN — Artist Registry · Perfil editable por el propio artista
-- Pega este archivo completo en Supabase → SQL Editor → Run
-- (después de 20261122000000_artist_registry.sql).
--
-- Qué añade:
--   · Interruptores de privacidad por campo + "aparecer en el directorio".
--   · El directorio público deja de leer la tabla y pasa por una función que
--     respeta esos interruptores (y nunca devuelve el correo ni las notas).
--   · Funciones para que un artista con sesión (código por correo) lea y edite
--     SÓLO su propio registro, y sólo los campos permitidos.
--
-- El artista NO recibe permisos sobre la tabla: todo pasa por funciones que
-- comprueban que el correo de la sesión está verificado y coincide con el registro.
-- ==========================================================================

-- ---------- Privacidad ----------
alter table public.artists
  add column listed            boolean not null default true,  -- aparecer en el directorio
  add column show_location     boolean not null default true,
  add column show_experience   boolean not null default true,
  add column show_bio          boolean not null default true,
  add column show_portfolio    boolean not null default true,
  add column show_socials      boolean not null default false, -- privado por defecto
  add column show_availability boolean not null default true,
  add column updated_at        timestamptz;

-- ---------- Directorio público: ahora sólo a través de esta función ----------
drop policy if exists "Directorio público: sólo aprobados" on public.artists;
revoke select on public.artists from anon;

create or replace function public.list_public_artists()
returns table (
  id uuid, created_at timestamptz, name text, location text, experience smallint, specialties text[],
  bio text, portfolio text, socials text, availability text, avatar_url text
)
language sql stable security definer set search_path = ''
as $$
  select a.id, a.created_at, a.name,
         case when a.show_location     then a.location     end,
         case when a.show_experience   then a.experience   end,
         a.specialties,
         case when a.show_bio          then a.bio          end,
         case when a.show_portfolio    then a.portfolio    end,
         case when a.show_socials      then a.socials      end,
         case when a.show_availability then a.availability end,
         a.avatar_url
  from public.artists a
  where a.status = 'approved' and a.listed
  order by a.created_at desc;
$$;
revoke all on function public.list_public_artists() from public;
grant execute on function public.list_public_artists() to anon, authenticated;

-- ---------- Identidad del artista con sesión ----------
-- Correo de la sesión, sólo si está verificado (el código por correo lo verifica).
create or replace function public.session_email()
returns text
language sql stable security definer set search_path = ''
as $$
  select lower(u.email) from auth.users u
  where u.id = auth.uid() and u.email_confirmed_at is not null;
$$;
revoke all on function public.session_email() from public;

-- Columnas que el artista puede ver de su propio registro (sin notas internas)
create or replace function public.my_profile()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', a.id, 'created_at', a.created_at, 'updated_at', a.updated_at, 'status', a.status,
    'name', a.name, 'email', a.email, 'location', a.location, 'experience', a.experience,
    'specialties', a.specialties, 'bio', a.bio, 'portfolio', a.portfolio, 'socials', a.socials,
    'availability', a.availability, 'additional', a.additional, 'avatar_url', a.avatar_url,
    'listed', a.listed, 'show_location', a.show_location, 'show_experience', a.show_experience,
    'show_bio', a.show_bio, 'show_portfolio', a.show_portfolio, 'show_socials', a.show_socials,
    'show_availability', a.show_availability
  )
  from public.artists a
  where lower(a.email) = public.session_email();
$$;
revoke all on function public.my_profile() from public;
grant execute on function public.my_profile() to authenticated;

-- Editar el propio registro: sólo campos permitidos y sólo si está aprobado/contactado.
-- (No se puede cambiar el correo, el estado ni las notas.) Los CHECK de la tabla validan los valores.
create or replace function public.update_my_profile(p jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  me text := public.session_email();
  n int;
begin
  if me is null then raise exception 'NOT_SIGNED_IN' using errcode = '42501'; end if;

  update public.artists a set
    name              = coalesce(nullif(trim(p->>'name'), ''), a.name),
    location          = nullif(trim(p->>'location'), ''),
    experience        = nullif(p->>'experience', '')::smallint,
    specialties       = coalesce((select array_agg(x) from jsonb_array_elements_text(p->'specialties') x), a.specialties),
    bio               = nullif(trim(p->>'bio'), ''),
    portfolio         = coalesce(nullif(trim(p->>'portfolio'), ''), a.portfolio),
    socials           = nullif(trim(p->>'socials'), ''),
    availability      = coalesce(nullif(p->>'availability', ''), a.availability),
    additional        = nullif(trim(p->>'additional'), ''),
    listed            = coalesce((p->>'listed')::boolean, a.listed),
    show_location     = coalesce((p->>'show_location')::boolean, a.show_location),
    show_experience   = coalesce((p->>'show_experience')::boolean, a.show_experience),
    show_bio          = coalesce((p->>'show_bio')::boolean, a.show_bio),
    show_portfolio    = coalesce((p->>'show_portfolio')::boolean, a.show_portfolio),
    show_socials      = coalesce((p->>'show_socials')::boolean, a.show_socials),
    show_availability = coalesce((p->>'show_availability')::boolean, a.show_availability),
    updated_at        = now()
  where lower(a.email) = me and a.status in ('approved', 'contacted');

  get diagnostics n = row_count;
  if n = 0 then raise exception 'NOT_EDITABLE' using errcode = '42501'; end if;
  return public.my_profile();
end;
$$;
revoke all on function public.update_my_profile(jsonb) from public;
grant execute on function public.update_my_profile(jsonb) to authenticated;

-- ---------- Blindaje: sólo el admin cambia estado, correo y notas ----------
-- (Por si algún día se dan permisos directos sobre la tabla a usuarios con sesión.)
-- Sin "security definer": así current_user es el rol de quien hace el UPDATE
-- ('authenticated' desde el navegador; 'postgres' dentro de update_my_profile o en el panel).
create or replace function public.guard_artist_update()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    if new.status is distinct from old.status or new.email is distinct from old.email
       or new.admin_notes is distinct from old.admin_notes or new.created_at is distinct from old.created_at then
      raise exception 'FORBIDDEN_FIELDS' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
create trigger artists_guard before update on public.artists
  for each row execute function public.guard_artist_update();
