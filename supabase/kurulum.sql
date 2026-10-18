-- Fixnote: Supabase kurulumu (Supabase > SQL Editor'da çalıştırılabilir; tekrar çalıştırmak güvenlidir).
-- 1) abonelikler: ödeme yapan kullanıcının uygulamayı hangi tarihe kadar kullanacağı (Stripe ya da elle).
-- 2) firmalar + raporlar + rapor-dosyalari: servis kayıtları (firma bilgisi, şablonlar, raporlar,
--    fotoğraf ve imzalar). Her kullanıcı sadece kendi kayıtlarını görür; deneme ya da abonelik
--    bitince yeni kayıt ve değişiklik sunucuda da engellenir, okuma ve silme serbest kalır.

-- ============ 1) Abonelikler ============
create table if not exists public.abonelikler (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bitis timestamptz not null,
  not_ text,
  olusturma timestamptz not null default now()
);

alter table public.abonelikler enable row level security;

-- İzinler: anonim kullanıcı tabloya hiç erişemez; giriş yapan kullanıcı sadece okuyabilir.
revoke all on table public.abonelikler from anon;
revoke insert, update, delete on table public.abonelikler from authenticated;
grant select on table public.abonelikler to authenticated;

-- Kullanıcı sadece kendi satırını okuyabilir. Satırı Stripe webhook'u (app/api/odeme/webhook,
-- gizli anahtarla) ya da Supabase paneli (Table Editor) yazar; uygulama yazamaz.
drop policy if exists "kendi aboneligini okur" on public.abonelikler;
create policy "kendi aboneligini okur" on public.abonelikler
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Online ödeme (Stripe) bilgileri. Elle girilen satırlarda boş kalır.
alter table public.abonelikler add column if not exists stripe_musteri text;
alter table public.abonelikler add column if not exists stripe_abonelik text;
alter table public.abonelikler add column if not exists plan text;
alter table public.abonelikler add column if not exists donem text;
alter table public.abonelikler add column if not exists durum text;
alter table public.abonelikler add column if not exists guncelleme timestamptz not null default now();
create unique index if not exists abonelikler_stripe_musteri on public.abonelikler (stripe_musteri) where stripe_musteri is not null;
-- Stripe webhook'u satırı gizli anahtarla (service_role) yazar; bu projede service_role'ün yeni tablolara varsayılan yetkisi yok.
grant select, insert, update on table public.abonelikler to service_role;

-- ============ 2) Servis kayıtları ============
-- Yazma izni: aboneliği süren ya da hesabı 3 günden yeni (deneme) kullanıcı.
-- 3 gün, uygulamadaki DENEME_GUN (app/components/supabase.ts) ile aynı olmalı.
create or replace function public.erisim_var()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
           select 1 from public.abonelikler a
           where a.user_id = (select auth.uid()) and a.bitis > now()
         )
      or exists (
           select 1 from auth.users u
           where u.id = (select auth.uid()) and u.created_at > now() - interval '3 days'
         );
$$;
revoke all on function public.erisim_var() from public, anon;
grant execute on function public.erisim_var() to authenticated;

create or replace function public.guncelleme_yaz()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.guncelleme := now();
  return new;
end;
$$;

-- Firma bilgisi (rapor başlığı, logo dahil) ve kullanıcının kendi şablonları: hesap başına tek satır.
create table if not exists public.firmalar (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  firma jsonb not null default '{}'::jsonb check (jsonb_typeof(firma) = 'object' and octet_length(firma::text) < 2097152),
  sablonlar jsonb not null default '[]'::jsonb check (jsonb_typeof(sablonlar) = 'array' and octet_length(sablonlar::text) < 1048576),
  guncelleme timestamptz not null default now()
);

-- Raporlar: id uygulamada üretilir; fotoğraf ve imza "veri" içinde sadece dosya yolu olarak durur.
create table if not exists public.raporlar (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  no text not null check (char_length(no) between 1 and 40),
  veri jsonb not null check (jsonb_typeof(veri) = 'object' and octet_length(veri::text) < 1048576),
  olusturma timestamptz not null default now(),
  guncelleme timestamptz not null default now(),
  constraint raporlar_pkey primary key (user_id, id),
  constraint raporlar_no_tekil unique (user_id, no)
);

drop trigger if exists firmalar_guncelleme on public.firmalar;
create trigger firmalar_guncelleme before update on public.firmalar
  for each row execute function public.guncelleme_yaz();
drop trigger if exists raporlar_guncelleme on public.raporlar;
create trigger raporlar_guncelleme before update on public.raporlar
  for each row execute function public.guncelleme_yaz();

alter table public.firmalar enable row level security;
alter table public.raporlar enable row level security;

revoke all on table public.firmalar, public.raporlar from anon;
grant select, insert, update, delete on table public.firmalar, public.raporlar to authenticated;

drop policy if exists "firma oku" on public.firmalar;
create policy "firma oku" on public.firmalar for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "firma ekle" on public.firmalar;
create policy "firma ekle" on public.firmalar for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.erisim_var()));
drop policy if exists "firma guncelle" on public.firmalar;
create policy "firma guncelle" on public.firmalar for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select public.erisim_var()));
drop policy if exists "firma sil" on public.firmalar;
create policy "firma sil" on public.firmalar for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "rapor oku" on public.raporlar;
create policy "rapor oku" on public.raporlar for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "rapor ekle" on public.raporlar;
create policy "rapor ekle" on public.raporlar for insert to authenticated
  with check ((select auth.uid()) = user_id and (select public.erisim_var()));
drop policy if exists "rapor guncelle" on public.raporlar;
create policy "rapor guncelle" on public.raporlar for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and (select public.erisim_var()));
drop policy if exists "rapor sil" on public.raporlar;
create policy "rapor sil" on public.raporlar for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Fotoğraf ve imzalar: özel (herkese kapalı) depo; yol <kullanıcı id>/<rapor id>/<dosya>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rapor-dosyalari', 'rapor-dosyalari', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "rapor dosyasi oku" on storage.objects;
create policy "rapor dosyasi oku" on storage.objects for select to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "rapor dosyasi yukle" on storage.objects;
create policy "rapor dosyasi yukle" on storage.objects for insert to authenticated
  with check (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.erisim_var()));
drop policy if exists "rapor dosyasi guncelle" on storage.objects;
create policy "rapor dosyasi guncelle" on storage.objects for update to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text and (select public.erisim_var()));
drop policy if exists "rapor dosyasi sil" on storage.objects;
create policy "rapor dosyasi sil" on storage.objects for delete to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text);
