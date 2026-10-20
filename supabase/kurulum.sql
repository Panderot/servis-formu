-- Fixnote: Supabase kurulumu (Supabase > SQL Editor'da çalıştırılabilir; tekrar çalıştırmak güvenlidir).
-- 1) abonelikler: ödeme yapan kullanıcının uygulamayı hangi tarihe kadar kullanacağı (Stripe ya da elle).
-- 1b) ekip: Firma paketinde teknisyenler kendi girişleriyle sahibin firma hesabına bağlanır.
-- 2) firmalar + raporlar + rapor-dosyalari: servis kayıtları (firma bilgisi, şablonlar, raporlar,
--    fotoğraf ve imzalar). Her firma hesabı (sahibi ve ekibi) sadece kendi kayıtlarını görür; deneme
--    ya da abonelik bitince yeni kayıt ve değişiklik sunucuda da engellenir, okuma ve silme serbest kalır.
-- 3) ekip fonksiyonları: davet, katılma, liste, çıkarma (uygulama bunları rpc ile çağırır).
-- 4) hesap silme: kullanıcı Ayarlar'dan kendi hesabını ve kayıtlarını siler.
-- 5) ödeme kilidi: aynı kullanıcı için aynı anda tek ödeme sayfası hazırlanır (sadece sunucu).

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

-- Satırı Stripe webhook'u (app/api/odeme/webhook, gizli anahtarla) ya da Supabase paneli (Table Editor)
-- yazar; uygulama yazamaz. Okuma kuralı 1b'de (sahip ve ekibi, firma hesabının satırını okur).

-- Online ödeme (Stripe) bilgileri. Elle girilen satırlarda boş kalır.
alter table public.abonelikler add column if not exists stripe_musteri text;
alter table public.abonelikler add column if not exists stripe_abonelik text;
alter table public.abonelikler add column if not exists plan text;
alter table public.abonelikler add column if not exists donem text;
alter table public.abonelikler add column if not exists durum text;
-- Abonelik dönem sonunda yenilenecek mi (iptal edilmişse false). Hesap silme buna bakar.
alter table public.abonelikler add column if not exists yenilenecek boolean;
alter table public.abonelikler add column if not exists guncelleme timestamptz not null default now();
create unique index if not exists abonelikler_stripe_musteri on public.abonelikler (stripe_musteri) where stripe_musteri is not null;
-- Stripe webhook'u satırı gizli anahtarla (service_role) yazar; bu projede service_role'ün yeni tablolara varsayılan yetkisi yok.
grant select, insert, update on table public.abonelikler to service_role;

-- ============ 1b) Ekip ============
-- Firma hesabı = sahibin hesabı (hesap_id = sahibin kullanıcı id'si). Teknisyen kendi girişiyle bu hesaba
-- bağlanır: firmanın kayıtlarını görür, rapor yazar ve düzenler. Rapor silme, firma bilgileri, şablonlar,
-- abonelik ve ekip yönetimi sahibindedir. Ekip sadece deneme süresinde ve Firma paketinde açıktır.
create table if not exists public.ekip_uyeleri (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hesap_id uuid not null references auth.users (id) on delete cascade,
  ad text not null default '' check (char_length(ad) <= 80),
  katilma timestamptz not null default now(),
  constraint ekip_uyeleri_kendisi check (user_id <> hesap_id)
);
create index if not exists ekip_uyeleri_hesap on public.ekip_uyeleri (hesap_id);

-- Davet bağlantısı: tek kişilik, 7 gün geçerli.
create table if not exists public.ekip_davetleri (
  kod text primary key check (char_length(kod) between 32 and 80),
  hesap_id uuid not null references auth.users (id) on delete cascade,
  olusturma timestamptz not null default now(),
  bitis timestamptz not null default now() + interval '7 days',
  kullanan uuid references auth.users (id) on delete set null,
  kullanma timestamptz
);
create index if not exists ekip_davetleri_hesap on public.ekip_davetleri (hesap_id);

alter table public.ekip_uyeleri enable row level security;
alter table public.ekip_davetleri enable row level security;
-- Bu iki tabloya doğrudan erişim yok; her şey aşağıdaki fonksiyonlarla.
revoke all on table public.ekip_uyeleri, public.ekip_davetleri from anon, authenticated;

-- Giriş yapanın firma hesabı: ekipteyse sahibin id'si, değilse kendi id'si.
create or replace function public.hesap_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select e.hesap_id from public.ekip_uyeleri e where e.user_id = (select auth.uid())),
    (select auth.uid())
  );
$$;
revoke all on function public.hesap_id() from public, anon;
grant execute on function public.hesap_id() to authenticated;

-- Hesabın ekibi açık mı: sahibin denemesi sürüyor ya da Firma aboneliği var
-- (plan boş = elle girilmiş abonelik, Firma sayılır). 3 gün, DENEME_GUN ile aynı olmalı.
create or replace function public.ekip_acik(h uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users u where u.id = h and u.created_at > now() - interval '3 days')
      or exists (
           select 1 from public.abonelikler a
           where a.user_id = h and a.bitis > now() and coalesce(a.plan, 'firma') = 'firma'
         );
$$;
revoke all on function public.ekip_acik(uuid) from public, anon, authenticated;

-- Abonelik satırını sahip ve ekibi okur (teknisyenin uygulaması firmanın süresini gösterir).
drop policy if exists "kendi aboneligini okur" on public.abonelikler;
create policy "kendi aboneligini okur" on public.abonelikler
  for select to authenticated
  using (user_id = (select public.hesap_id()));

-- ============ 2) Servis kayıtları ============
-- Yazma izni: sahip için aboneliği süren ya da hesabı 3 günden yeni (deneme); teknisyen için
-- firmanın ekibi açık (deneme ya da Firma paketi). 3 gün, DENEME_GUN (app/components/supabase.ts) ile aynı.
create or replace function public.erisim_var()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (select 1 from public.ekip_uyeleri e where e.user_id = (select auth.uid()))
      then public.ekip_acik(public.hesap_id())
    else exists (
           select 1 from public.abonelikler a
           where a.user_id = (select auth.uid()) and a.bitis > now()
         )
      or exists (
           select 1 from auth.users u
           where u.id = (select auth.uid()) and u.created_at > now() - interval '3 days'
         )
  end;
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
-- Raporu ilk yazan kişi (sahip ya da teknisyen); düzenlemede değişmez.
alter table public.raporlar add column if not exists yazan uuid default auth.uid() references auth.users (id) on delete set null;

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

-- Firma bilgisini sahip ve ekibi okur; ekleme, değiştirme ve silme sadece sahibin.
drop policy if exists "firma oku" on public.firmalar;
create policy "firma oku" on public.firmalar for select to authenticated
  using (user_id = (select public.hesap_id()));
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

-- Raporları sahip ve ekibi okur, yazar ve düzenler; silme sadece sahibin.
drop policy if exists "rapor oku" on public.raporlar;
create policy "rapor oku" on public.raporlar for select to authenticated
  using (user_id = (select public.hesap_id()));
drop policy if exists "rapor ekle" on public.raporlar;
create policy "rapor ekle" on public.raporlar for insert to authenticated
  with check (user_id = (select public.hesap_id()) and (select public.erisim_var()));
drop policy if exists "rapor guncelle" on public.raporlar;
create policy "rapor guncelle" on public.raporlar for update to authenticated
  using (user_id = (select public.hesap_id()))
  with check (user_id = (select public.hesap_id()) and (select public.erisim_var()));
drop policy if exists "rapor sil" on public.raporlar;
create policy "rapor sil" on public.raporlar for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Fotoğraf ve imzalar: özel (herkese kapalı) depo; yol <firma hesabı id>/<rapor id>/<dosya>.
-- Sahip ve ekibi okur ve yükler; silme sadece sahibin.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('rapor-dosyalari', 'rapor-dosyalari', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "rapor dosyasi oku" on storage.objects;
create policy "rapor dosyasi oku" on storage.objects for select to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select public.hesap_id())::text);
drop policy if exists "rapor dosyasi yukle" on storage.objects;
create policy "rapor dosyasi yukle" on storage.objects for insert to authenticated
  with check (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select public.hesap_id())::text and (select public.erisim_var()));
drop policy if exists "rapor dosyasi guncelle" on storage.objects;
create policy "rapor dosyasi guncelle" on storage.objects for update to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select public.hesap_id())::text)
  with check (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select public.hesap_id())::text and (select public.erisim_var()));
drop policy if exists "rapor dosyasi sil" on storage.objects;
create policy "rapor dosyasi sil" on storage.objects for delete to authenticated
  using (bucket_id = 'rapor-dosyalari' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============ 3) Ekip fonksiyonları (uygulama rpc ile çağırır) ============
-- Hata mesajları uygulamada metne çevrilir: oturum, sahip_degil, paket, cok_davet, gecersiz,
-- kullanildi, suresi_doldu, kendi_davetin, zaten_ekipte, ekibin_var, kayitlarin_var, aboneligin_var, yok.

-- Giriş yapanın ekip durumu: firma hesabı, rolü, firma adı, ekip açık mı; sahip için ekip ve davet sayısı.
create or replace function public.ekip_durumu()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'hesap_id', h.id,
    'rol', case when h.id = (select auth.uid()) then 'sahip' else 'teknisyen' end,
    'sahip_olusturma', u.created_at,
    'firma_ad', coalesce((select f.firma ->> 'ad' from public.firmalar f where f.user_id = h.id), ''),
    'ekip_acik', public.ekip_acik(h.id),
    'uye_sayisi', (select count(*) from public.ekip_uyeleri e where e.hesap_id = h.id),
    'bekleyen_davet', (
      select count(*) from public.ekip_davetleri d
      where d.hesap_id = h.id and d.kullanma is null and d.bitis > now() and h.id = (select auth.uid())
    )
  )
  from (select public.hesap_id() as id) h
  join auth.users u on u.id = h.id;
$$;

-- Sahip yeni davet bağlantısı kodu oluşturur (tek kişilik, 7 gün; aynı anda en fazla 20 açık davet).
create or replace function public.davet_olustur()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := (select auth.uid());
  k text;
begin
  if u is null then raise exception 'oturum'; end if;
  if exists (select 1 from public.ekip_uyeleri e where e.user_id = u) then raise exception 'sahip_degil'; end if;
  if not public.ekip_acik(u) then raise exception 'paket'; end if;
  if (select count(*) from public.ekip_davetleri d where d.hesap_id = u and d.kullanma is null and d.bitis > now()) >= 20 then
    raise exception 'cok_davet';
  end if;
  k := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
  insert into public.ekip_davetleri (kod, hesap_id) values (k, u);
  return k;
end;
$$;

-- Davet bağlantısı açılınca: geçerli mi ve hangi firmanın.
create or replace function public.davet_bilgisi(p_kod text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when d.kod is null then jsonb_build_object('durum', 'gecersiz')
    else jsonb_build_object(
      'durum', case
        when d.kullanma is not null then 'kullanildi'
        when d.bitis <= now() then 'suresi_doldu'
        else 'gecerli'
      end,
      'firma_ad', coalesce((select f.firma ->> 'ad' from public.firmalar f where f.user_id = d.hesap_id), ''),
      'kendi', d.hesap_id = (select auth.uid()),
      'uye', exists (select 1 from public.ekip_uyeleri e where e.user_id = (select auth.uid()) and e.hesap_id = d.hesap_id)
    )
  end
  from (select 1) x
  left join public.ekip_davetleri d on d.kod = p_kod;
$$;

-- Teknisyen davetle ekibe katılır. Kendi raporu, aboneliği ya da kendi ekibi olan hesap katılamaz
-- (o kayıtlar görünmez olurdu); bunun için ayrı bir e-postayla hesap açılır.
create or replace function public.ekibe_katil(p_kod text, p_ad text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := (select auth.uid());
  d public.ekip_davetleri%rowtype;
begin
  if u is null then raise exception 'oturum'; end if;
  select * into d from public.ekip_davetleri where kod = p_kod for update;
  if not found then raise exception 'gecersiz'; end if;
  -- kullanma stays set even when the account that used the link is deleted (kullanan becomes null),
  -- so a used link never works again.
  if d.kullanma is not null then
    if d.kullanan = u and exists (select 1 from public.ekip_uyeleri e where e.user_id = u and e.hesap_id = d.hesap_id) then
      return jsonb_build_object('hesap_id', d.hesap_id);
    end if;
    raise exception 'kullanildi';
  end if;
  if d.bitis <= now() then raise exception 'suresi_doldu'; end if;
  if d.hesap_id = u then raise exception 'kendi_davetin'; end if;
  if exists (select 1 from public.ekip_uyeleri e where e.user_id = u) then raise exception 'zaten_ekipte'; end if;
  if exists (select 1 from public.ekip_uyeleri e where e.hesap_id = u) then raise exception 'ekibin_var'; end if;
  if exists (select 1 from public.raporlar r where r.user_id = u) then raise exception 'kayitlarin_var'; end if;
  if exists (select 1 from public.abonelikler a where a.user_id = u and a.bitis > now()) then raise exception 'aboneligin_var'; end if;
  if not public.ekip_acik(d.hesap_id) then raise exception 'paket'; end if;
  insert into public.ekip_uyeleri (user_id, hesap_id, ad) values (u, d.hesap_id, left(btrim(coalesce(p_ad, '')), 80));
  update public.ekip_davetleri set kullanan = u, kullanma = now() where kod = p_kod;
  return jsonb_build_object('hesap_id', d.hesap_id);
end;
$$;

-- Sahip ekibini görür (e-posta, ad, katılma tarihi).
create or replace function public.ekip_listesi()
returns table (user_id uuid, eposta text, ad text, katilma timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select e.user_id, u.email::text, e.ad, e.katilma
  from public.ekip_uyeleri e
  join auth.users u on u.id = e.user_id
  where e.hesap_id = (select auth.uid())
  order by e.katilma;
$$;

-- Sahip bir teknisyeni ekipten çıkarır; teknisyenin erişimi hemen biter, yazdığı raporlar firmada kalır.
create or replace function public.uye_cikar(p_uye uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  delete from public.ekip_uyeleri e where e.user_id = p_uye and e.hesap_id = (select auth.uid());
  if not found then raise exception 'yok'; end if;
end;
$$;

-- Sahip kullanılmamış bütün davet bağlantılarını iptal eder.
create or replace function public.davetleri_iptal()
returns integer
language sql
volatile
security definer
set search_path = ''
as $$
  with silinen as (
    delete from public.ekip_davetleri d
    where d.hesap_id = (select auth.uid()) and d.kullanma is null
    returning 1
  )
  select count(*)::integer from silinen;
$$;

-- Teknisyen ekipten kendisi ayrılır.
create or replace function public.ekipten_ayril()
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from public.ekip_uyeleri e where e.user_id = (select auth.uid());
$$;

revoke all on function public.ekip_durumu(), public.davet_olustur(), public.davet_bilgisi(text),
  public.ekibe_katil(text, text), public.ekip_listesi(), public.uye_cikar(uuid),
  public.davetleri_iptal(), public.ekipten_ayril() from public, anon;
grant execute on function public.ekip_durumu(), public.davet_olustur(), public.davet_bilgisi(text),
  public.ekibe_katil(text, text), public.ekip_listesi(), public.uye_cikar(uuid),
  public.davetleri_iptal(), public.ekipten_ayril() to authenticated;

-- ============ 4) Hesap silme (uygulama rpc ile çağırır) ============
-- Kullanıcı kendi hesabını siler. Firma bilgisi, raporlar, abonelik satırı, ekip üyelikleri ve davetler
-- yabancı anahtarlarla (on delete cascade) birlikte silinir; sahip silinince teknisyenlerinin erişimi
-- biter. Teknisyen silinince yazdığı raporlar firmada kalır (yazan boşalır).
-- Fotoğraf ve imza dosyaları SQL ile silinemez: uygulama önce kendi klasörünü (<user id>/) depodan
-- boşaltır, klasörde dosya kaldıysa silme reddedilir (dosyalar_var).
-- Yenilenecek bir Stripe aboneliği varken silinmez (abonelik_aktif): önce Yönet > iptal. İptal edilmiş
-- ve dönem sonunu bekleyen abonelik silmeyi engellemez. Bitiş tarihi geçmiş olsa da yenilenecek abonelik
-- engeldir (ödeme alınamadı ve Stripe hâlâ tahsil etmeye çalışıyor olabilir).
-- p_kontrol = true: sadece kontrol eder (uygulama dosyaları silmeden önce sorar), hiçbir şey silmez.
create or replace function public.hesabimi_sil(p_kontrol boolean default false)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := (select auth.uid());
begin
  if u is null then raise exception 'oturum'; end if;
  if exists (
    select 1 from public.abonelikler a
    where a.user_id = u
      and a.stripe_abonelik is not null
      and coalesce(a.durum, '') in ('active', 'trialing', 'past_due')
      and coalesce(a.yenilenecek, true)
  ) then
    raise exception 'abonelik_aktif';
  end if;
  if p_kontrol then return; end if;
  if exists (
    select 1 from storage.objects o
    where o.bucket_id = 'rapor-dosyalari' and (storage.foldername(o.name))[1] = u::text
  ) then
    raise exception 'dosyalar_var';
  end if;
  delete from auth.users where id = u;
end;
$$;

revoke all on function public.hesabimi_sil(boolean) from public, anon;
grant execute on function public.hesabimi_sil(boolean) to authenticated;

-- ============ 5) Ödeme kilidi (sadece sunucu, gizli anahtarla rpc) ============
-- /api/odeme kilidi alır, Stripe'ta süren aboneliğe bakar, eski açık ödeme sayfalarını kapatır, yenisini
-- açar ve kilidi bırakır. Aynı anda gelen ikinci istek kilit boşalana kadar bekler; böylece iki ödeme
-- sayfası birlikte açık kalamaz. 30 saniyeden eski kilit (yarıda kalmış istek) geçersiz sayılır.
create table if not exists public.odeme_kilitleri (
  user_id uuid primary key references auth.users (id) on delete cascade,
  jeton uuid not null,
  zaman timestamptz not null default now()
);
alter table public.odeme_kilitleri enable row level security;
revoke all on table public.odeme_kilitleri from anon, authenticated;

-- Kilidi alırsa jeton döner, başka istek tutuyorsa null.
create or replace function public.odeme_kilidi_al(p_user uuid)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  j uuid := gen_random_uuid();
begin
  insert into public.odeme_kilitleri as k (user_id, jeton, zaman) values (p_user, j, now())
  on conflict (user_id) do update set jeton = excluded.jeton, zaman = now()
    where k.zaman < now() - interval '30 seconds';
  if found then return j; end if;
  return null;
end;
$$;

-- Sadece kendi jetonuyla bırakır (süresi dolup başkasına geçmiş kilide dokunmaz).
create or replace function public.odeme_kilidi_birak(p_user uuid, p_jeton uuid)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  delete from public.odeme_kilitleri where user_id = p_user and jeton = p_jeton;
$$;

revoke all on function public.odeme_kilidi_al(uuid), public.odeme_kilidi_birak(uuid, uuid) from public, anon, authenticated;
grant execute on function public.odeme_kilidi_al(uuid), public.odeme_kilidi_birak(uuid, uuid) to service_role;
