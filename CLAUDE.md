# Fixnote

Saha servis ekipleri için dijital servis raporu: teknisyen formu telefonda doldurur, müşteriye ekranda imzalatır, firma başlıklı A4 rapor PDF olur ve WhatsApp'tan gönderilir. Canlı site: https://fixnotee.vercel.app (GitHub main'e giren her şey Vercel'de kendiliğinden yayına çıkar). Satan şirket: Motiq Automation Ltd (İngiltere, şirket no 17303276); bilgileri gizlilik ve koşullar sayfasının ilk bölümünde ve footer'da yazar.

## Kurallar
- Gizli bilgi (Google client secret, Supabase secret, erişim anahtarları, `.env.local` içeriği) hiçbir dosyaya yazılmaz, ekrana basılmaz.
- `vercel --prod` çalıştırılmaz; yayın sadece main'e birleştirme ile olur. Değişiklik `is/<ad>` dalında yapılır, kullanıcı birleştirir.
- Sormadan reset, clean, stash ya da "baştan başla" yapılmaz.
- Görev dosyaları (`fixnote-*.txt`) projenin içinde durmaz ve commit edilmez; yerleri `../FIXNOTE-PROMPTS/`.
- Tarayıcı kontrolleri sadece Playwright MCP ile yapılır (Claude in Chrome değil); `.playwright-mcp/` commit'ten önce silinir.
- Yeni sunucu, veritabanı ya da ücretli servis isteği gelirse önce kullanıcıya maliyetini ve gerekliliğini sor.
- Yazı kuralları: em dash yok; "yapay zeka" şapkasız; para birimi "TL" yazılır (₺ değil); tek aksan renk, gradient yok. Müşteriye görünen metinlerde kullanılan hizmetlerin adı (Supabase, Vercel) geçmez; yasal sayfalar hariç.
- Kontrol: test, lint, CI yok. Değişiklikten sonra `npx tsc --noEmit` ve `npm run build`.

## Yapı
- Next.js 15 (App Router), React 19, Tailwind 4. Uygulama client-side çalışır.
- `app/page.tsx` landing; `app/components/LandingParcalar.tsx` landing parçaları (süre hesabı, örnek rapor, şablon editörü, müşteri geçmişi, WhatsApp, fiyat); `app/components/HeroMaket.tsx` hero animasyonu.
- `app/components/Uygulama.tsx` panel; `/app` (hesap, bulut) ve `/demo` (örnek kayıtlar, sadece tarayıcıda) aynı bileşeni kullanır.
- `app/lib/servis.ts` motor: rapor modeli, KDV/toplam, rapor no (`SR-2026-0001`), WhatsApp metni, arama, müşteri geçmişi, şablonlar, demo verisi. `app/lib/gorsel.ts` foto küçültme (1000 px, JPEG 0.7). `app/components/ImzaPad.tsx` imza. `app/components/RaporSayfa.tsx` A4 rapor (yazdırma CSS'i `app/globals.css` sonunda, `.print-only`).
- `app/giris/` giriş ve kayıt; `app/components/HesapKapisi.tsx` oturum, deneme ve kilit ekranları; `app/kosullar`, `app/gizlilik` yasal sayfalar (`app/components/YasalSayfa.tsx`, iki dil).
- Sekme simgesi: `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png` (marka işaretinden; logo gelirse aynı adlarla yeniden üretilir). Marka işareti `Isaret` (`app/components/Ikon.tsx`).
- Renkler `app/globals.css`: aksan `--accent #0d5b73` (koyu `#08455a`, yıkama `#e3f0f3`); A4 raporda aynı renkler sabit yazılı. Font Manrope (`app/layout.tsx`).

## Veri ve hesap
- Supabase projesi FİXNOTE (Frankfurt). Tablolar: `public.firmalar` (firma bilgisi ve kendi şablonlar, hesap başına tek satır), `public.raporlar` (rapor `veri` jsonb; foto ve imza `sb:<yol>`), `public.abonelikler` (abonelik bitiş tarihi; Stripe webhook'u ya da elle yazılır). Dosyalar özel depo `rapor-dosyalari` (`<kullanıcı id>/<rapor id>/<dosya>`). Kurulum SQL'i `supabase/kurulum.sql`, ortam değişkenleri `.env.example`.
- Kayıt mantığı `app/components/depo.ts`: bulutta her değişiklik önce telefondaki kuyruğa (`fx_kuyruk_<kullanıcı id>`) yazılır, internet gelince gönderilir; liste önbelleği `fx_onbellek_<kullanıcı id>`. Rapor numarası başka cihazda kullanılmışsa sıradaki verilir. Eski sürümün yerel kayıtları (`sf_*`) silinmez; girişte "Hesabıma aktar" ile kopyalanır. Demo kayıtları `fx_demo_*` (İngilizce `fx_demo_en_*`).
- Deneme 3 gün (`DENEME_GUN`, `app/components/supabase.ts`); yazma izni `public.erisim_var()` ile deneme ya da abonelik süresine bağlı. Firma hesabını teknisyenler aynı e-posta ve şifreyle kullanır.
- Google girişi açık (Google Cloud projesi Fixnote, istemci "Fixnote web", yayında); geri dönüş adresi https://wpvivfwzqrkgghqgqhig.supabase.co/auth/v1/callback. Kendi e-posta servisi (SMTP) yok; alan adı alınınca Resend bağlanacak.

## Fiyat
İki paket, sadece ABD doları, iki dilde aynı: Usta (EN: Solo) $10/ay, 1 teknisyen; Firma (EN: Team) $25/ay, sınırsız teknisyen; yıllık peşin %20 indirimli ($96 ve $240). Tutarlar `app/lib/paket.ts` (`PAKET`); landing metinleri `app/components/LandingParcalar.tsx` içinde `FT` (`FT.tr`, `FT.en`); koşullar sayfasında da yazar.

## Ödeme (Stripe)
- `NEXT_PUBLIC_ODEME_ACIK=1` ve anahtarlar (`.env.example`) yoksa abonelik eskisi gibi e-postayla (info@motiqai.com) açılır, `public.abonelikler`'e elle girilir.
- Açıkken: deneme çubuğu ve kilit ekranı `/abonelik`'e gider (`app/abonelik/`), `POST /api/odeme` Stripe Checkout açar (abonelik sürüyorsa müşteri portalı), `POST /api/odeme/portal` müşteri portalı (kart, paket, fatura, iptal). Stripe olayları `POST /api/odeme/webhook` (imza kontrolü) > `aboneligiYaz` (`app/lib/odemeSunucu.ts`, sadece sunucu): aboneliği Stripe'tan yeniden okur, `abonelikler.bitis`'i dönem sonuna yazar (past_due: dönem başı + 7 gün; iptal: bitiş anı). Uygulama yine sadece `bitis`'e bakar.
- Stripe fiyatları metadata ile bulunur (`plan`=usta|firma, `donem`=aylik|yillik); tutar ve dönem `PAKET` ile birebir tutmazsa ödeme açılmaz. Canlı hesapta da fiyatlar aynı metadata ile kurulur.
- Webhook olayları: checkout.session.completed, customer.subscription.created/updated/deleted/paused/resumed. Yerel deneme: `stripe listen --forward-to localhost:3000/api/odeme/webhook`.
- Gizli anahtarlar (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SECRET_KEY`) sadece `.env.local` ve Vercel'de durur; ekrana basılmaz. Stripe MCP sadece test modunda (sandbox) bağlı.
- Canlıya geçmeden: gizlilik politikasına Stripe (ödeme işleyen, yurt dışı aktarım), koşullara kartla ödeme, yenileme ve iptal; KDV/VAT (Stripe Tax) muhasebeciyle; Stripe hesabı Company (Motiq Automation Ltd) ve şirket banka hesabı.

## Dil (Türkçe / İngilizce)
`app/lib/dil.ts` (`useDil`, `dilSec`, tarayıcıda `fx_dil`), düğme ve sekme başlıkları `app/components/Dil.tsx`, ilk boyamadan önce çalışan betik `app/lib/dilBetigi.ts`. Seçim yoksa tarayıcı dili karar verir (tr ise Türkçe, değilse İngilizce). Sunucu Türkçe çizer; İngilizce sayfa dil değişene kadar gizli kalır (`dil-bekle`). Metinler `c("Türkçe", "English")` ile yazılır; yeni metin iki dilde birlikte eklenir. Her rapor kendi dilini ve para birimini taşır (`dil`, `para`; eski raporlar Türkçe / TL). Firma bunları Ayarlar > Dil ve para birimi'nden seçer (`raporDili`, `paraBirimi`: TL, USD, EUR, GBP). İngilizce şablonlar `SABLONLAR_EN`, İngilizce demo `DEMO_FIRMA_EN` / `DEMO_RAPORLAR_EN` (Londra, GBP). Ekran testlerinde dil açıkça seçilir: `localStorage.fx_dil = "tr"` ya da `"en"`. WhatsApp numarası Türkiye biçimine göre düzeltilir; İngilizce arayüz ülke kodu (+44 gibi) ister.
