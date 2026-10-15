# Fixnote: kişiselleştirme rehberi

Kullanıcı "Kuruluma başla" dediğinde sırayla sor, cevaba göre değişiklikleri sen yap:

1) **Marka adı** (vars. Fixnote). Değişecek yerler: `app/page.tsx` (yüzen nav, hero maketleri, footer ve dev soluk marka yazısı, metinler), `app/components/LandingParcalar.tsx` (fiyat kartı), `app/app/page.tsx` (yan menü ve mobil üst bar), `app/layout.tsx` (title/description).
2) **Logo** (aşağıdaki "Logo ekleme" bölümü, marka adından hemen sonra).
3) **Aksan renk** (vars. petrol mavisi `#0d5b73`, tek aksan) → `app/globals.css` içinde `--accent`, koyu tonu `--accent-ink` (`#08455a`), yıkama tonu `--accent-soft` (`#e3f0f3`), `--accent-mark` #c9e2ea (başlık vurgu çizgisi). Butonlarda yazı beyazdır; çok açık bir renk seçilirse `.btn` içindeki `color: #fff` değerini `var(--ink)` yap. A4 raporda renk sabit yazılıdır: `app/components/RaporSayfa.tsx` içinde `#0d5b73`, `#e3f0f3`, `#08455a` değerlerini aynı renge çevir. Landing'deki mini çubuk grafikte açık ton `#a9cfdb` ve koyu bantlardaki tik rengi `#7cc4d6` de aksanın açık tonlarıdır.
   Diğer renkler (`app/globals.css`): zemin `--bg #f3f5f7`, mürekkep `--ink #1c2735`, ikincil `--muted #5f7284`, çizgi `--line #e6ebf0`, koyu bant/footer `--dark #1c2735`. Gradyan kullanma.
   Font: Manrope (tek aile, `app/layout.tsx`, `next/font/google`, `subsets: ["latin","latin-ext"]`). Değiştirilirse Türkçe karakter (ş ğ ı İ) desteği olan bir Google fontu seç.
4) **Fiyat** (vars. 299 TL/ay teknisyen başı, yıllıkta 2 ay hediye) → `app/components/LandingParcalar.tsx` içinde `FIYAT` sabiti ve `DAHIL` listesi.
5) **Hedef sektör** (vars. kombi/klima/beyaz eşya/ilaçlama/elektrik). Sektöre özel şablon istenirse `app/lib/servis.ts` içindeki `SABLONLAR` dizisine ekle (id, ad, cihazTuru, maddeler). Landing'deki şablon editörü bölümü (`#sablon`), koyu banttaki dönen iş adları (`ISLER`, `app/components/LandingParcalar.tsx`) ve footer'daki "Kimler için" sütununu buna göre güncelle.
6) **Örnek firma** (isteğe bağlı): `DEMO_FIRMA` alanlarını üyenin kendi firmasıyla doldur ki ilk açılışta rapor başlığı doğru görünsün. Örnek raporlar (`DEMO_RAPORLAR`) uydurma müşterilerdir; canlıya almadan önce silinmesini isteyebilir (Ayarlar > Tüm raporları sil zaten var).

Kurallar: em dash yok; "yapay zeka" şapkasız; para birimi "TL" (₺ değil); tek aksan renk, gradient yok. Uygulama tamamen client-side ve anahtarsız kalır; sunucu/veritabanı ekleme isteği gelirse önce kullanıcıya maliyetini ve gerekliliğini sor.

Motor dosyaları (markalamada DEĞİŞTİRİLMEZ, sadece şablon eklenir):
- `app/lib/servis.ts`: rapor modeli, KDV/toplam hesabı, rapor no (`SR-2026-0001`), WhatsApp metni, arama, müşteri geçmişi.
- `app/lib/gorsel.ts`: fotoğrafı canvas ile küçültme (en uzun kenar 1000 px, JPEG 0.7) ve depolama ölçümü.
- `app/components/ImzaPad.tsx`: parmakla imza.
- `app/components/RaporSayfa.tsx`: A4 rapor; yazdırma CSS'i `app/globals.css` sonunda (`.print-only`).

Görünüm dosyaları (markalamada serbestçe değişir): `app/page.tsx` (landing, bölüm sırası `TASARIM-NOTU.md`'de), `app/components/LandingParcalar.tsx` (süre hesaplayıcı, örnek rapor seçici, dönen iş adı, fiyat kartı), `app/components/Ikon.tsx` (çizgi ikonlar + marka işareti `Isaret`), `app/components/GorununceOynat.tsx` (bölümü görününce bir kez oynatır), `app/globals.css` (renkler, buton/kart/rozet sınıfları).

"Canlıya al" denirse: `npx vercel --prod` (kullanıcının Vercel hesabıyla). Ortam değişkeni gerekmez.

## Logo ekleme (kişiselleştirmenin parçası, marka adından hemen sonra sor)

"Logon var mı? Dosyayı (png/jpg/svg) bu klasöre bırakman yeterli, ben yerleştiririm."
- Dosya verirse: `public/logo.png` olarak kopyala. Landing'deki nav ve footer'da marka adının yanındaki petrol mavisi tikli kareyi (`<Isaret />`, `app/components/Ikon.tsx`) bu logoyla değiştir (yükseklik ~28px, köşeleri hafif yuvarlat); uygulamanın yan menüsünde ve mobil üst barında da aynısını yap.
- Aynı görseli `app/icon.png` olarak da kaydet; Next.js bunu otomatik favicon yapar.
- Logo yoksa: "Sorun değil, marka adının yanında sade bir petrol mavisi tik işareti zaten var; logon hazır olunca dosyayı bırakman yeterli" de.
- Not: Bu, ürünün (senin markanın) logosudur. Uygulamayı kullanan servis firmasının kendi logosu ise uygulama içinde **Firma ve şablonlar > Logo yükle** ile girilir ve A4 raporun başlığına basılır.
- Logoyu yerleştirdikten sonra kullanıcıya ekranda nasıl göründüğünü kontrol ettir.
