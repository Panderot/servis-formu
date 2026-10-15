# Servis Formu: tasarım notu (referans: valideo.app)

Referans: `yeni-kitler/ref/servisformu/valideo-0..4.jpg` + `tasarim-icerik.json` (tarayıcıda ölçülmüş stil). Bu not yeniden giydirmeden önce yazıldı; landing ve panel bu nota göre kuruldu. Motor (`app/lib/*`), veri modeli, localStorage anahtarları (`sf_*`) ve akışlar aynı kaldı.

## 1. Referansın bölüm sırası ve ikna işi
| # | Referans bölümü | Ne iş yapıyor | Servis Formu karşılığı |
|---|---|---|---|
| nav | Sayfanın üstünde yüzen beyaz kart nav (köşe 18 px, ince çerçeve, yumuşak gölge), solda logo, ortada 6 link, sağda "Connexion" + turuncu "Réserver une démo" | Yön | Aynı yüzen kart: Nasıl çalışır, Rapor, Şablonlar, Fiyat, SSS; sağda "Uygulamayı aç" + turuncu "İlk raporu oluştur" |
| hero | Ortalanmış: beyaz hap rozet (4,9/5 yıldız), iki tonlu dev başlık (1. satır mürekkep, 2. satır arduvaz gri), iki buton, altında tarayıcı penceresinde panel maketi + sağa bindirilmiş telefon maketi, maket bölüm sonunda kesiliyor | Ürünün "bitmiş ve gerçek" olduğunu ilk ekranda gösterir | Rozet: "Kombi, klima, beyaz eşya ve ilaçlama servisleri için" (puan/indirme sayısı YOK). Başlık: "Rapor kapıda biter, / akşamın sana kalır." Maket: panelin kendisi (demo verisinden: bu ay rapor, tahsil bekleyen, son raporlar) + telefon maketi. Telefon maketi akışı canlandırır (kontrol listesi, imza, PDF, WhatsApp) ve panel yeni raporu alır (son raporlara düşer, bu ay sayısı ve tutarı artar) |
| sorun | "Le rapport se termine sur le terrain, pas le soir chez vous." Sol: "Sans Valideo" kağıt yığını + üstünde yüzen şikayet bildirimleri; sağ: "Avec Valideo" tek kart, 3 zaman damgalı adım, yeşil "Terminée" rozeti | Önce/sonra; acıyı somut mesajlarla gösterir | Sol: çizimle kağıt koçan yığını + yüzen mesajlar ("Parçayı değiştirdiğinizi nereden bileyim?", karbon kopya okunmuyor, akşam temize çekme hatırlatması). Sağ: "Kombi bakımı · Erzene Mah." kartı, 3 adım (sahada dolduruldu / imzalandı / WhatsApp'tan gitti), yeşil "Tamamlandı". Bölüm görününce bir kez oynar: solda kağıtlar ve şikayetler düşer, sağda adımlar bir çizgiyle sırayla tamamlanır. |
| hesap | "Combien de temps vous prennent vos rapports ?" iki kaydırıcı (aylık rapor, rapor başı süre) → bugün / Valideo ile saat, "≈24 jours/an" | Kazancı kullanıcının kendi rakamıyla hesaplatır | Aynı hesaplayıcı (gerçek çalışır): aylık rapor + rapor başı süre → bugün / Servis Formu ile (rapor başı 2 dk varsayımı açıkça yazılı), ayda kazanılan saat, yılda iş günü. Sol metin "Usta sahada kazanır, masada kaybeder."; her derdin altında Fixnote'taki karşılığı belirir. Hesaplayıcı görününce kaydırıcılar kendini gösterir (10 -> 60, 5 -> 15), sayılar akarak değişir, sonuç kısa bir an vurgulanır. |
| nasıl | "Faire un rapport n'a jamais été aussi simple": 3 kart, her kartın içinde mini maket (form + imza, PDF üretiliyor, rapor hazır + gönder), numaralı alt başlıklar, iki buton | Akışı 3 adımda gösterir | 1 Sahada doldur (form, anahtar düğmeli kontrol listesi, imza), 2 A4 rapor oluşur, 3 PDF kaydet + WhatsApp'la gönder |
| görünüm | "Un rapport à votre image": solda 6 seçenekli liste (seçili koyu), sağda gri tuval üstünde gerçek A4 önizleme, renk noktaları | Çıktının kalitesini gösterir | Solda 6 örnek iş (kombi, klima, beyaz eşya, elektrik, ilaçlama, garanti işi), seçince sağda motorun gerçek A4 raporu (`RaporSayfa`) değişir |
| koyu bant | "Valideo s'adapte à votre métier" + dönen meslek adı | Kapsam | "Servis Formu senin işine uyar" + dönen iş adı (kombi bakımı, klima servisi, beyaz eşya, ilaçlama, elektrik, asansör bakımı) |
| editör | "Créez votre propre modèle": solda alan kartları, sağda alan türü listesi | Esneklik | "Kendi kontrol listeni kur": solda yapım halinde "Asansör periyodik bakım" şablonu, sağda hazır şablonlar ve madde sayıları (Ayarlar'daki gerçek özellik) |
| IA | "Valideo embarque l'IA": gri kutu, solda 4 maddelik turuncu tikli liste, sağda yüzen kartlar | Ek değer | **Yapay zeka bölümü ALINMADI** (ürün yapmıyor). Aynı kutu dilinde "Telefon numarasından bütün geçmiş": müşteri kartı, kayıtlı cihaz, sonraki bakım, bekleyen tahsilat yüzen kartları |
| fiyat | Üstte "Découverte" ücretsiz şerit + aylık/yıllık anahtarı, 3 plan kartı, kullanıcı sayısı +/- sayacı, dahil/dahil değil listeleri | Fiyat itirazı | Üst şerit: 14 gün ücretsiz deneme; aylık/yıllık anahtarı (yıllıkta 2 ay hediye); teknisyen sayısı sayaçlı tek plan kartı (299 TL/ay teknisyen başı, KDV hariç ve dahil hesaplanır) + "neler dahil" kartı |
| koyu bant 2 | "Ce que vous gagnez": ÖNCE (üstü çizili) / SONRA (tikli) | Özet | Aynı: kağıt koçan, akşam temize çekme, iki gün sonra gönderme / sahada dolduruldu, telefonda imzalandı, kapıdan çıkmadan gitti |
| yorumlar | App Store yorum kaydırıcısı | Sosyal kanıt | **ALINMADI** (sahte yorum yok) |
| e-fatura | Sol metin + iki özellik satırı + butonlar; sağda elde telefon fotoğrafı | Ek modül | "Rapor WhatsApp'tan gider": sağda fotoğraf yerine koyu kart üstünde telefon maketi, içinde motorun `waMetin()` ürettiği gerçek mesaj. E-fatura iddiası YOK (SSS'de "bu bir e-fatura değil") |
| SSS | Ortalanmış, beyaz yuvarlak kartlar, ilki açık, turuncu ok | İtiraz kırma | Aynı, 7 soru |
| makaleler | Blog kartları | SEO | **ALINMADI** (blog yok) |
| son CTA | Gri zemin, hap rozet "Démo de 15 minutes", başlık, turuncu buton | Kapanış | "2 dakikada dene" rozeti, "Bir sonraki servisi kağıtsız kapat." |
| footer | Lacivert, logo + açıklama, 3 sütun, dev soluk marka yazısı | Kapanış | Aynı; dev "Servis Formu" yazısı düz, bir ton açık lacivert (gradyan yok) |

## 2. Tipografi (ölçülen → kullanılan)
Referansın tek yüzü **Manrope** (400-800). Google Fonts'ta var; aynısı `next/font/google` ile, `subsets: ["latin","latin-ext"]` (ş ğ ı İ ç ö ü kontrol edildi). İkinci bir yüz yok; rakamlar `tabular-nums`.
- H1: 76 px, 800, satır 1,0, harf aralığı -0,05em (-3,8 px). Mobil `clamp(40px, 10.5vw, 76px)`.
- H2: 40-46 px, 800, satır 1,05, -0,04em. Mobil 30 px.
- Alt başlık paragrafı: 14,5-16 px, 600, arduvaz `#5f7284`.
- Gövde 15 px; nav 13,5 px 600.
- Hap rozet (eyebrow): 10,5 px, 800, büyük harf, harf aralığı 0,12em, beyaz zemin, 1 px çizgi, tam yuvarlak.
- Maket içi küçük etiketler: 9-10 px büyük harf, 700-800, 0,08em.

## 3. Palet
Referans: zemin `#f4f6f8`, kart beyaz, mürekkep `#1e2836` / `#10273a`, ikincil `#6b7f91`, soluk `#93a4b3`, çizgi `#ebeff4`, tek aksan turuncu `#ff6b2c`, başarı yeşili `#1f7a55` (`#eaf6f0`), koyu bant `#1e2836` (referansta koyu bantta gradyan değişkeni de var).
Servis Formu (gradyan yok, mor-mavi yok, lime yok):
- Zemin `#f3f5f7`, kart `#ffffff`, panel `#fafbfc`, çizgi `#e6ebf0`, çizgi-2 `#d5dde5`
- Mürekkep `#1c2735`, ikincil `#5f7284` (beyazda 4,97:1), soluk `#94a3b2`
- **Tek aksan: servis turuncusu `#d44b12`** (beyaz yazı 4,4:1; referansın `#ff6b2c` turuncusu beyazla 2,8:1 kaldığı için koyultuldu), yıkama `#fdeee6`, aksan mürekkebi `#a83a0b`
- Durum: Ödendi yeşil `#16794c` / `#e6f4ec`; Ödeme bekliyor amber `#93590a` / `#fdf2de`; Garanti mavi `#2b5bb8` / `#eaf0fb`; İmzasız kırmızı `#b7352a` / `#fdecea`
- Koyu bant ve footer: düz `#1c2735`

## 4. Buton / kart / rozet dili
- Buton: Manrope 14 px 700, köşe 12 px, dolgu 12px 20px. Birincil turuncu zemin beyaz yazı; ikincil beyaz zemin, 1 px `#e6ebf0` çerçeve, mürekkep yazı. Koyu buton lacivert.
- Kart: beyaz, 1 px `#e6ebf0`, köşe 14-20 px, gölge `0 10px 30px rgba(16,39,58,.06)`; maket kartları `0 18px 40px rgba(16,39,58,.12)`; telefon maketi köşe 46 px, 6 px beyaz çerçeve, `0 30px 70px rgba(16,39,58,.16)`.
- Durum rozeti: 10,5-11 px 700, köşe 6 px, dolgu `2px 7px`, yıkama zemin + koyu ton yazı (referanstaki "En cours" / "Envoyé" hapları).
- Liste satırı: solda 32 px açık gri ikon karesi (belge simgesi), "SR-2026-0048 · AYŞE KAPLAN" kalın büyük harf satırı, altında rozet + gri açıklama, sağda tarih ve ok.
- Kontrol listesi: referansın "Vérifications" maketindeki gibi satır + sağda turuncu anahtar düğme (switch).
- Adım göstergesi: üstte 6 parça ince turuncu çubuk.

## 5. Boşluk ritmi
Bölüm dikey dolgu 96-120 px (mobil 64 px). Başlık ile içerik arası 48-56 px. İçerik genişliği 1120 px (maket 1160 px). Zemin sırası: gri hero → beyaz → gri → beyaz → gri → lacivert bant → gri → beyaz → gri → lacivert → beyaz → gri → lacivert footer, yani referanstaki gibi gri/beyaz dönüşümlü.

## 6. Hero ürün maketi nasıl kurulmuş
Referansta: 20 px üst köşeli beyaz tarayıcı penceresi (üç gri nokta + ortada adres), solda ikonlu ince menü, "Bonjour Julien." karşılama, üç metrik kartı (küçük çubuk grafik, yeşil artış hapı, önce/sonra süre kutusu), turuncu "Nouveau rapport" düğmesi, son raporlar listesi (ikon karesi, numara + ad, renkli hap, tarih), sağda günlük plan; sağ alt köşeye bindirilmiş 46 px köşeli telefon: "Bonjour Julien", tarih, koyu sekme şeridi, büyük turuncu "Nouveau" kartı, yardım kartı, yaklaşan iş kartları (saat + renkli dikey çizgi). Maket bölüm sonunda kesilir.
Servis Formu'nda aynı kurgu, veriler motorun demo kayıtlarından hesaplanır: menü (Raporlar, Müşteriler, Firma ve şablonlar), "Günaydın Emre.", metrikler (Bu ay rapor + 6 aylık mini çubuk, Bu ay tutar, Tahsil bekleyen), turuncu "Yeni servis formu", son 4 rapor, sağda "Yaklaşan bakımlar" (sonraki bakım tarihleri). Telefonda: "Günaydın Emre", tarih, koyu şerit (firma adı), turuncu "Yeni servis formu" kartı, son raporlar kartları. Maketin üstünde "örnek veri" notu yok ama panelde "Demo mod" etiketi var.

## 7. Panel (`/app`) aynı dili taşır
Koyu yan menü yerine referans maketindeki gibi beyaz yan menü (ikon + etiket, seçili satır gri zemin + turuncu ikon), gri uygulama zemini, "Günaydın Emre." karşılaması, metrik kartları (büyük harf mini etiket + 26 px sayı + 6 aylık mini çubuk), yaklaşan bakımlar şeridi, rapor listesi maketteki satır dilinde, detayda A4 rapor. Form: üstte 6 parçalı turuncu ilerleme çubuğu, beyaz kartlar, kontrol listesi anahtar düğmeli satırlar, imza kartı. Mobilde: beyaz üst bar, telefon maketindeki "Günaydın" + büyük turuncu "Yeni servis formu" kartı, altta beyaz sekme çubuğu. "Demo mod" etiketi üst barda ve yan menüde.

## 8. Bilerek alınmayanlar
Valideo adı, logosu (turuncu eğik çizgi), metinler (çeviri değil, yeniden yazıldı), 4,9/5 puan ve "+1000 indirme" rozeti, App Store yorumu, müşteri adları (Thermibat, Duval & Fils), fiyatlar (30/69/99 €), yapay zeka bölümü, e-fatura bölümü, blog makaleleri, gerçek fotoğraflar (elde telefon, kağıt yığını), parlak `#ff6b2c` turuncu (kontrast için koyultuldu), koyu bant gradyanı.
