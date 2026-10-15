# Fixnote: tasarım notu — "Servis kartı / saha defteri"

Estetik: iyi tutulmuş bir servis kartı. Kombi/klima/beyaz eşya/ilaçlama ustasına güven veren,
sade, okunaklı, profesyonel bir saha aracı. Motor (`app/lib/*`), veri modeli, localStorage
anahtarları (`sf_*`) ve akışlar değişmez; bu not yalnızca görünümü anlatır.

## 1. Tipografi
- Başlık/display: **Fraunces** (serif, `--font-display`), ağırlık 500-600, hafif negatif izleme.
  Tek renk mürekkep; iki-tonlu kelime vurgusu yok.
- Gövde/UI/rakam: **Inter** (`--font-body`). Rakamlar tabular (`.num`).
- A4 servis raporu kendi sabit yüzünde **Manrope** kalır (`--font-report`; `.a4` içinde
  `--font-display/--font-mono` buna sabitlenir), böylece basılı/PDF çıktı değişmez.
- İki arayüz ailesi (Fraunces + Inter) net biçimde ayrı; hepsi latin-ext (Türkçe ş ğ ı İ ç ö ü).

## 2. Palet (tek aksan, gradyan yok)
- Zemin `--bg #efeee8` (ılık nötr), kağıt `--paper #fff`, inset tepsi `--panel #f6f5ef`.
- Mürekkep `--ink #1c2735`, ikincil `--muted #4d5860`, soluk `--faint #6c767c`.
- Çizgi `--line #e2e1d7`, `--line-2 #cdccc0`, tile `--tile #eae9e0`.
- Tek aksan **petrol mavisi `--accent #0d5b73`** (koyu `--accent-ink #08455a`, yıkama
  `--accent-soft #e3f0f3`). Koyu yüzeylerde açık petrol `#6cc0d4` / `#7cc4d6`.
- Durum: Ödendi yeşil `#16794c`, Ödeme bekliyor amber `#93590a`, Garanti mavi `#2b5bb8`,
  İmzasız kırmızı `#b7352a` (her biri yıkama zeminiyle). WhatsApp yeşili `#16794c`.
- Koyu bant/footer/panel yan menüsü düz `--dark #1c2735`.

## 3. Bileşen dili
- Köşe `--r 7px` (yumuşak değil, sıfır da değil). Gölge yerine **ince hairline kenarlık**;
  tek gerçek yükseklik hero telefon/önizlemede.
- Buton: Inter 600, köşe 7px. Birincil petrol/beyaz, ikincil beyaz/çerçeve, koyu lacivert, WhatsApp yeşil.
- Kicker etiketi (`.eyebrow`): kare köşeli, cümle düzeni, solunda kısa petrol çubuk.
- Durum göstergesi (`.pill`): kare etiket + sol renk şeridi (yuvarlak hap değil); renk/anlam sabit.
- Kontrol listesi (`.check`): kare onay kutusu (damga), pill-switch değil.
- Form adım göstergesi: 6 parçalı numaralı kare step track (tamamlanan tikli).
- Metrik: tek kap içinde hairline bölücülü şerit; "bu ay rapor" 7 kareli aktivite ısı şeridi.
- Yaklaşan bakımlar: nokta + chevron'lu dikey zaman çizgisi.

## 4. Landing bölüm sırası (`app/page.tsx`)
Zemin tektir (ılık nötr); bölümler hairline + boşlukla ayrılır, iki vurgu bandı renk katar.

| # | Bölüm | İş |
|---|---|---|
| nav | Tam genişlik düz üst bar, alt hairline | Yön |
| hero | Sola yaslı Fraunces başlık + altında bindirmesiz cihaz vitrini (konsol baskın + telefon) | Ürünün gerçekliği |
| sorun | İşaretlenmiş karbon koçan (yazısız) + kenar notları / tamamlanan iş kartı | Önce-sonra |
| hesap | Süre hesaplayıcı (gerçek çalışır) | Kazanç |
| nasıl | 3 adımlı bağlı ruled akış, içinde mini maketler | Akış |
| rapor | Üstte 6'lı iş seçici ızgara + ortalanmış gerçek A4 (`RaporSayfa`) | Çıktı kalitesi |
| petrol bant | Petrol zemin + dönen iş adı (`IsDongu`) | Kapsam |
| şablon | Kendi kontrol listeni kur (Ayarlar'daki gerçek özellik) | Esneklik |
| müşteri | Telefon numarasından geçmiş, yüzen müşteri kartları | Ek değer |
| fiyat | Teknisyen sayaçlı tek plan + "dahil" kartı | Fiyat itirazı |
| koyu bant | Önce (üstü çizili) / sonra (tikli) | Özet |
| whatsapp | Koyu tepside telefon + `waMetin()` gerçek mesajı | Dağıtım |
| sss | Düz ruled akordeon | İtiraz kırma |
| son cta | Kağıtsız kapat | Kapanış |
| footer | Lacivert, 3 sütun link (dev soluk marka yazısı yok) | Kapanış |

## 5. Panel (`/app`)
Koyu lacivert yan menü (beyaz menü değil): marka, firma, birincil "Yeni servis formu",
ışıklı navlink'ler, şablon listesi. Gri uygulama zemini; saate göre karşılama (Fraunces);
hairline bölücülü metrik şeridi (aktivite ısı şeridiyle); dikey yaklaşan-bakım zaman çizgisi;
ruled rapor listesi; detayda gerçek A4. Form: numaralı step track, beyaz inputlar, kare onay
kutulu kontrol listesi, imza kartı, canlı A4 önizleme. Mobilde koyu üst bar, büyük petrol
"Yeni servis formu" kartı, alt sekme çubuğu. "Demo mod" etiketi üst barda ve yan menüde.

## 6. Dokunulmazlar
Motor dosyaları (`app/lib/*`, `ImzaPad.tsx`, `RaporSayfa.tsx`) ve `app/globals.css` sonundaki
yazdırma (print) CSS'i değişmez. A4 rapor ve PDF çıktısı birebir aynı kalır.
