# Fixnote: kişiselleştirme rehberi

Kullanıcı "Kuruluma başla" dediğinde sırayla sor, cevaba göre değişiklikleri sen yap:

1) **Marka adı** (vars. Fixnote). Değişecek yerler: `app/page.tsx` (üst bar, hero maketleri, footer, metinler), `app/components/LandingParcalar.tsx` (fiyat kartı), `app/app/page.tsx` (koyu yan menü ve mobil üst bar), `app/layout.tsx` (title/description).
2) **Logo** (aşağıdaki "Logo ekleme" bölümü, marka adından hemen sonra).
3) **Aksan renk** (vars. petrol mavisi `#0d5b73`, tek aksan) → `app/globals.css` içinde `--accent`, koyu tonu `--accent-ink` (`#08455a`), yıkama tonu `--accent-soft` (`#e3f0f3`). Butonlarda yazı beyazdır; çok açık bir renk seçilirse `.btn` içindeki `color: #fff` değerini `var(--ink)` yap. A4 raporda renk sabit yazılıdır: `app/components/RaporSayfa.tsx` içinde `#0d5b73`, `#e3f0f3`, `#08455a` değerlerini aynı renge çevir. Aktivite ısı şeridi aksanı opaklıkla kullanır; koyu bant tik `#7cc4d6` ve koyu menü aktif tik `#6cc0d4` de aksanın açık tonlarıdır.
   Diğer renkler (`app/globals.css`): zemin `--bg #efeee8` (ılık nötr), kağıt `--paper #fff`, inset `--panel #f6f5ef`, mürekkep `--ink #1c2735`, ikincil `--muted #4d5860`, çizgi `--line #e2e1d7`, koyu bant/footer/panel menüsü `--dark #1c2735`. Köşe `--r 7px`; gölge yerine ince hairline. Gradyan kullanma.
   Font: başlık **Fraunces** (serif, `--font-display`), gövde/UI **Inter** (`--font-body`); ikisi de `app/layout.tsx`'te `next/font/google`, `subsets: ["latin","latin-ext"]` (Türkçe ş ğ ı İ). A4 servis raporu kendi sabit yüzünde **Manrope** kalır (`--font-report`; `.a4` içinde `--font-display/--font-mono` buna sabitlenir) — rapor çıktısı değişmez. Değiştirilirse latin-ext destekli Google fontu seç; en fazla iki arayüz ailesi + rapor fontu.
4) **Fiyat** (vars. 299 TL/ay teknisyen başı, yıllıkta 2 ay hediye) → `app/components/LandingParcalar.tsx` içinde `FIYAT` sabiti ve `DAHIL` listesi.
5) **Hedef sektör** (vars. kombi/klima/beyaz eşya/ilaçlama/elektrik). Sektöre özel şablon istenirse `app/lib/servis.ts` içindeki `SABLONLAR` dizisine ekle (id, ad, cihazTuru, maddeler). Landing'deki şablon editörü bölümü (`#sablon`), koyu banttaki dönen iş adları (`ISLER`, `app/components/LandingParcalar.tsx`) ve footer'daki "Kimler için" sütununu buna göre güncelle.
6) **Örnek firma** (isteğe bağlı): `DEMO_FIRMA` alanlarını üyenin kendi firmasıyla doldur ki ilk açılışta rapor başlığı doğru görünsün. Örnek raporlar (`DEMO_RAPORLAR`) uydurma müşterilerdir; canlıya almadan önce silinmesini isteyebilir (Ayarlar > Tüm raporları sil zaten var).

Kurallar: em dash yok; "yapay zeka" şapkasız; para birimi "TL" (₺ değil); tek aksan renk, gradient yok. Uygulama tamamen client-side ve anahtarsız kalır; sunucu/veritabanı ekleme isteği gelirse önce kullanıcıya maliyetini ve gerekliliğini sor.

Motor dosyaları (markalamada DEĞİŞTİRİLMEZ, sadece şablon eklenir):
- `app/lib/servis.ts`: rapor modeli, KDV/toplam hesabı, rapor no (`SR-2026-0001`), WhatsApp metni, arama, müşteri geçmişi.
- `app/lib/gorsel.ts`: fotoğrafı canvas ile küçültme (en uzun kenar 1000 px, JPEG 0.7) ve depolama ölçümü.
- `app/components/ImzaPad.tsx`: parmakla imza.
- `app/components/RaporSayfa.tsx`: A4 rapor; yazdırma CSS'i `app/globals.css` sonunda (`.print-only`).

Görünüm dosyaları (markalamada serbestçe değişir): `app/page.tsx` (landing, bölüm sırası `TASARIM-NOTU.md`'de), `app/components/LandingParcalar.tsx` (süre hesaplayıcı, örnek rapor seçici, dönen iş adı, fiyat kartı), `app/components/Ikon.tsx` (çizgi ikonlar + marka işareti `Isaret`), `app/globals.css` (renkler, buton/kart/rozet sınıfları).

"Canlıya al" denirse: `npx vercel --prod` (kullanıcının Vercel hesabıyla). Ortam değişkeni gerekmez.

## Logo ekleme (kişiselleştirmenin parçası, marka adından hemen sonra sor)

"Logon var mı? Dosyayı (png/jpg/svg) bu klasöre bırakman yeterli, ben yerleştiririm."
- Dosya verirse: `public/logo.png` olarak kopyala. Landing'deki nav ve footer'da marka adının yanındaki petrol mavisi tikli kareyi (`<Isaret />`, `app/components/Ikon.tsx`) bu logoyla değiştir (yükseklik ~28px, köşeleri hafif yuvarlat); uygulamanın koyu yan menüsünde ve mobil üst barında da aynısını yap.
- Aynı görseli `app/icon.png` olarak da kaydet; Next.js bunu otomatik favicon yapar.
- Logo yoksa: "Sorun değil, marka adının yanında sade bir petrol mavisi tik işareti zaten var; logon hazır olunca dosyayı bırakman yeterli" de.
- Not: Bu, ürünün (senin markanın) logosudur. Uygulamayı kullanan servis firmasının kendi logosu ise uygulama içinde **Firma ve şablonlar > Logo yükle** ile girilir ve A4 raporun başlığına basılır.
- Logoyu yerleştirdikten sonra kullanıcıya ekranda nasıl göründüğünü kontrol ettir.
