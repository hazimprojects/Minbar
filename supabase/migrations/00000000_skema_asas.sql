-- Minbar — skema asas. Dipisahkan daripada Sistem ALC (Biro Pendidikan +
-- Laporan Bendahari), dibina semula dengan Supabase Auth sebenar (bukan
-- corak RPC + caller_id sistem-alc) supaya RLS boleh terus semak
-- auth.uid()/auth.role() tanpa perlu "kunci" setiap RPC/jadual satu-satu.
--
-- Log masuk: cipta pengguna admin melalui Supabase Dashboard → Authentication
-- → Add user (emel + kata laluan). Semua pengguna authenticated ada akses
-- penuh (tiada tier Owner/Admin — sepadan dengan penggunaan sebenar: ahli
-- jawatankuasa biro, semua dipercayai sama rata).

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- JADUAL
-- ----------------------------------------------------------------------------

create table public.biro_bulan (
  id            uuid primary key default gen_random_uuid(),
  bulan         text not null unique,
  label         text not null,
  data          jsonb not null default '{}',
  dikemas_pada  timestamptz default now()
);

create table public.biro_penceramah (
  id              uuid primary key default gen_random_uuid(),
  nama            text not null unique,
  aktif           boolean default true,
  pengisian_list  jsonb not null default '[]',
  gambar_url      text,
  no_tel          text
);

create table public.biro_senarai (
  id            uuid primary key default gen_random_uuid(),
  jenis         text not null check (jenis in ('pengisian', 'kitab')),
  nilai         text not null,
  dicipta_pada  timestamptz not null default now()
);

create index idx_biro_senarai_jenis on public.biro_senarai (jenis);

-- Singleton (1 baris sahaja) — token untuk portal awam Laporan Bendahari.
create table public.tetapan (
  id                boolean primary key default true check (id),
  bendahari_token   text not null default encode(gen_random_bytes(16), 'hex')
);
insert into public.tetapan default values;

-- Seed nilai pengisian/kitab sedia ada (dari Sistem ALC)
insert into public.biro_senarai (jenis, nilai)
select 'pengisian', v from unnest(array[
  'Pengajian Am', 'Tauhid', 'Hadith', 'Sirah Nabawiyah',
  'Tajwid & Tafsir', 'Tazkirah Jumaat', 'Pengurusan Jenazah',
  'Tahsin Al-Quran', 'Tasauf', 'Tafsir', 'Fiqh',
  'Wirid Khujakan', 'Wirid Ratib Al-Atas', 'Ceramah Maal Hijrah'
]) as v;

insert into public.biro_senarai (jenis, nilai)
select 'kitab', v from unnest(array[
  'Kitab Nashaihul''ibad',
  'Kitab Minhaj Abideen',
  'Kitab Mukashafah Al-Qulub',
  'Kitab Tafsir Nurul Ehsan',
  'Kitab Tafsir Ibn Kathir',
  'Kitab Riyadhus Salihin',
  'Kitab Hukum Hakam Solat Berjamaah',
  'Kitab Wisyahul Afrah Waisbahul Falah',
  'Kitab Panduan Ilmu Fiqh, Bab Solat'
]) as v;

-- ----------------------------------------------------------------------------
-- RLS — authenticated sahaja (Supabase Auth sebenar; tiada akses anon
-- langsung pada jadual — portal awam Laporan Bendahari laluan RPC token).
-- ----------------------------------------------------------------------------

do $$
declare
  t text;
  jadual text[] := array['biro_bulan', 'biro_penceramah', 'biro_senarai', 'tetapan'];
begin
  foreach t in array jadual loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "admin_penuh" on public.%I for all to authenticated using (true) with check (true)',
      t
    );
    execute format('grant all on table public.%I to authenticated, service_role', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- STORAGE — gambar penceramah. Bacaan awam (papar dalam app), tulis
-- authenticated sahaja.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('penceramah', 'penceramah', true)
on conflict (id) do nothing;

create policy "penceramah_awam_baca" on storage.objects
  for select using (bucket_id = 'penceramah');

create policy "penceramah_admin_tulis" on storage.objects
  for insert to authenticated with check (bucket_id = 'penceramah');

create policy "penceramah_admin_kemaskini" on storage.objects
  for update to authenticated using (bucket_id = 'penceramah');

-- ----------------------------------------------------------------------------
-- RPC — portal awam Laporan Bendahari (token dalam URL, tiada log masuk)
-- ----------------------------------------------------------------------------

create or replace function public.get_laporan_bendahari(p_token text, p_bulan_id uuid default null)
 returns json
 language plpgsql
 security definer
 set search_path = public
as $function$
declare
  v_token text;
begin
  select bendahari_token into v_token from public.tetapan;
  if p_token is null or p_token <> v_token then
    return null;
  end if;

  if p_bulan_id is not null then
    return (select row_to_json(b) from public.biro_bulan b where b.id = p_bulan_id);
  end if;

  return (
    select coalesce(json_agg(row_to_json(t) order by t.bulan desc), '[]'::json)
    from (select id, bulan, label from public.biro_bulan) t
  );
end;
$function$;

grant execute on function public.get_laporan_bendahari(text, uuid) to anon, authenticated, service_role;
