-- Fixnote: hesap ve abonelik tablosu (Supabase > SQL Editor'da bir kez çalıştır).
-- Servis kayıtları burada DEĞİL, kullanıcının tarayıcısında durur. Bu tablo sadece
-- ödeme yapan kullanıcının uygulamayı hangi tarihe kadar açık kullanacağını tutar.

create table if not exists public.abonelikler (
  user_id uuid primary key references auth.users (id) on delete cascade,
  bitis timestamptz not null,
  not_ text,
  olusturma timestamptz not null default now()
);

alter table public.abonelikler enable row level security;

-- Kullanıcı sadece kendi satırını okuyabilir. Ekleme ve değiştirme sadece Supabase panelinden
-- (Table Editor) yapılır; uygulamadan yazılamaz.
drop policy if exists "kendi aboneligini okur" on public.abonelikler;
create policy "kendi aboneligini okur" on public.abonelikler
  for select to authenticated
  using ((select auth.uid()) = user_id);
