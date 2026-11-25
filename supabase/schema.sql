-- Qamar Abbas portfolio: content tables, row level security, photo storage.
-- Run once in Supabase -> SQL editor (safe to run again: it only creates what is missing).
--
-- Who may do what:
--   anyone (anon)      read the public content (visible works/series, published posts), send an enquiry through submit_enquiry()
--   admin (logged in)  everything on the content tables, read and manage enquiries, upload photos to the "media" bucket
--   nobody else        the admins table is only read through is_admin()

-- ---------------------------------------------------------------------------
-- 1. who is an admin
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- no policies and no grants on purpose: the table is only reachable through is_admin()

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. content tables
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  name text not null check (char_length(name) between 1 and 120),
  name_urdu text not null default '',
  role text not null default '',
  base text not null default '',
  origin text not null default '',
  born text not null default '',
  email text not null default '',
  email2 text not null default '',
  phone text not null default '',
  studio text[] not null default '{}',
  studio2 text[] not null default '{}',
  socials jsonb not null default '[]' check (jsonb_typeof(socials) = 'array'),
  portfolio_pdf text not null default '',
  bio text not null default '',
  career text[] not null default '{}',
  statement text[] not null default '{}',
  statement_note text not null default '',
  teaching_intro text not null default '',
  teaching_principles jsonb not null default '[]' check (jsonb_typeof(teaching_principles) = 'array'),
  commission_steps jsonb not null default '[]' check (jsonb_typeof(commission_steps) = 'array'),
  commission_intro text not null default '',
  enquiry_kinds text[] not null default '{}',
  hero_image text not null default '' check (hero_image = '' or hero_image ~ '^(/|https://)'),
  hero_tagline text not null default '',
  hero_blurb text not null default '',
  highlights jsonb not null default '[]' check (jsonb_typeof(highlights) = 'array'),
  footer_blurb text not null default '',
  seo_description text not null default '',
  portrait_image text not null default '' check (portrait_image = '' or portrait_image ~ '^(/|https://)'),
  portrait_blur text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.series (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  title text not null check (char_length(title) between 1 and 120),
  kind text not null default '',
  medium text not null default '',
  statement text[] not null default '{}',
  cover_work_id uuid,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  no text not null unique check (char_length(no) between 1 and 12),
  title text not null default 'Untitled' check (char_length(title) between 1 and 160),
  series_id uuid not null references public.series (id) on update cascade on delete restrict,
  size_text text not null default '',
  h_cm numeric(7, 2) check (h_cm is null or h_cm > 0),
  w_cm numeric(7, 2) check (w_cm is null or w_cm > 0),
  medium text not null default '',
  note text not null default '',
  year smallint check (year is null or year between 1900 and 2100),
  price text not null default '',
  availability text not null default 'available' check (availability in ('available', 'sold', 'not_available')),
  ratio numeric(7, 4) not null check (ratio > 0.05 and ratio < 20),
  photo text not null check (photo ~ '^(/|https://)'),
  photo_md text not null check (photo_md ~ '^(/|https://)'),
  photo_thumb text not null check (photo_thumb ~ '^(/|https://)'),
  blur text not null default '',
  position int not null default 0,
  visible boolean not null default true,
  featured_pos int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((h_cm is null) = (w_cm is null))
);
create index if not exists works_series_position_idx on public.works (series_id, position);
create index if not exists works_featured_idx on public.works (featured_pos) where featured_pos is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'series_cover_work_fk') then
    alter table public.series
      add constraint series_cover_work_fk foreign key (cover_work_id) references public.works (id) on delete set null;
  end if;
end $$;

create table if not exists public.journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 200),
  category text not null default '',
  published_on date not null default current_date,
  read_minutes int not null default 1 check (read_minutes between 1 and 120),
  dek text not null default '',
  body jsonb not null default '[]' check (jsonb_typeof(body) = 'array'),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.record_entries (
  id uuid primary key default gen_random_uuid(),
  year text not null default '' check (char_length(year) <= 12),
  what text not null check (char_length(what) between 1 and 300),
  place text not null default '' check (char_length(place) <= 200),
  exhibition boolean not null default false,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default '',
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null default '',
  budget text not null default '',
  work_ref text not null default '',
  message text not null check (char_length(message) between 5 and 4000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  admin_note text not null default ''
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
create index if not exists enquiries_email_idx on public.enquiries (email, created_at desc);

-- updated_at is kept by the database itself
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'series', 'works', 'journal_posts', 'record_entries'] loop
    if not exists (select 1 from pg_trigger where tgname = t || '_touch' and tgrelid = ('public.' || t)::regclass) then
      execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', t || '_touch', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 3. row level security
-- ---------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.series enable row level security;
alter table public.works enable row level security;
alter table public.journal_posts enable row level security;
alter table public.record_entries enable row level security;
alter table public.enquiries enable row level security;

-- table privileges (RLS below still decides which rows)
grant select on public.site_settings, public.series, public.works, public.journal_posts, public.record_entries to anon, authenticated;
grant insert, update, delete on public.series, public.works, public.journal_posts, public.record_entries to authenticated;
grant update on public.site_settings to authenticated;
grant select, update, delete on public.enquiries to authenticated;

-- the public site reads only what is visible / published
drop policy if exists "public reads site settings" on public.site_settings;
create policy "public reads site settings" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "public reads visible series" on public.series;
create policy "public reads visible series" on public.series for select to anon, authenticated using (visible);

drop policy if exists "public reads visible works" on public.works;
create policy "public reads visible works" on public.works for select to anon, authenticated using (visible);

drop policy if exists "public reads published posts" on public.journal_posts;
create policy "public reads published posts" on public.journal_posts for select to anon, authenticated using (published);

drop policy if exists "public reads visible record" on public.record_entries;
create policy "public reads visible record" on public.record_entries for select to anon, authenticated using (visible);

-- the admin sees and changes everything (hidden rows included)
drop policy if exists "admin manages series" on public.series;
create policy "admin manages series" on public.series for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin manages works" on public.works;
create policy "admin manages works" on public.works for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin manages posts" on public.journal_posts;
create policy "admin manages posts" on public.journal_posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin manages record" on public.record_entries;
create policy "admin manages record" on public.record_entries for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin updates site settings" on public.site_settings;
create policy "admin updates site settings" on public.site_settings for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admin reads enquiries" on public.enquiries;
create policy "admin reads enquiries" on public.enquiries for select to authenticated using ((select public.is_admin()));
drop policy if exists "admin updates enquiries" on public.enquiries;
create policy "admin updates enquiries" on public.enquiries for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admin deletes enquiries" on public.enquiries;
create policy "admin deletes enquiries" on public.enquiries for delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 4. the contact form: the only way in for the public, with limits that hold even if the API is called directly
-- ---------------------------------------------------------------------------
create or replace function public.submit_enquiry(
  p_kind text,
  p_name text,
  p_email text,
  p_phone text,
  p_budget text,
  p_work text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_message text := btrim(coalesce(p_message, ''));
  v_id uuid;
begin
  if char_length(v_name) not between 1 and 120 then
    raise exception 'invalid_name' using errcode = '22023';
  end if;
  if char_length(v_email) > 200 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'invalid_email' using errcode = '22023';
  end if;
  if char_length(v_message) not between 5 and 4000 then
    raise exception 'invalid_message' using errcode = '22023';
  end if;

  -- no more than 3 messages an hour from one address, 40 an hour in all
  if (select count(*) from public.enquiries e where e.email = v_email and e.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.enquiries e where e.created_at > now() - interval '1 hour') >= 40 then
    raise exception 'rate_limited' using errcode = '54000';
  end if;

  insert into public.enquiries (kind, name, email, phone, budget, work_ref, message)
  values (
    left(btrim(coalesce(p_kind, '')), 60),
    v_name,
    v_email,
    left(btrim(coalesce(p_phone, '')), 60),
    left(btrim(coalesce(p_budget, '')), 60),
    left(btrim(coalesce(p_work, '')), 80),
    v_message
  )
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.submit_enquiry(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_enquiry(text, text, text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. photo storage: a public bucket (anyone may view), only the admin may add, replace or remove
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 6291456, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin adds media" on storage.objects;
create policy "admin adds media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admin lists media" on storage.objects;
create policy "admin lists media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admin replaces media" on storage.objects;
create policy "admin replaces media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
drop policy if exists "admin removes media" on storage.objects;
create policy "admin removes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
