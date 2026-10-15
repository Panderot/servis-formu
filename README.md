# Servis Formu: sahada 1 dakikada servis raporu

## En kolay yol: Claude Code ile kur ve canlıya al

1. Bu klasörde terminal aç ve `claude` yaz (Claude Code kuruluysa; değilse claude.com/code adresinden indir).
2. Şunu söyle: **"Kuruluma başla"**: Claude sana işletme adını, renklerini ve logonu sorar, bütün değişiklikleri kendisi yapar.
3. Bittiğinde **"canlıya al"** de: Claude uygulamayı senin adına internete açar (Vercel, ücretsiz katman yeter).

Kod bilmene gerek yok; dosyalara elle dokunmazsın. Manuel kurulum istersen aşağıdaki adımlar da geçerli.

Teknisyen sahada telefondan formu doldurur, kontrol listesini işaretler, önce/sonra fotoğrafını çeker, müşteriye parmağıyla imzalatır. Temiz bir A4 rapor çıkar: PDF olarak kaydedilir, WhatsApp ile gönderilir.

## Kurulum
```bash
npm install
npm run dev   # http://localhost:3000
```
Anahtar gerekmez. Her şey tarayıcıda çalışır, kayıtlar localStorage'da durur. İlk açılışta örnek firma ve 8 örnek rapor yüklenir (Ayarlar'dan silinir).

## Akış
1. **Müşteri**: ad, telefon, adres. Kayıtlı müşteri ad yazarken önerilir, telefondan önceki servis sayısı görünür.
2. **Cihaz**: hizmet türü (kombi bakımı, klima bakımı, beyaz eşya tamiri, ilaçlama, elektrik arızası ya da kendi şablonun), marka/model/seri no, şikayet. Müşterinin kayıtlı cihazları tek dokunuşla gelir.
3. **İşlemler**: şablonun kontrol listesi işaretli gelir; yapılmayana dokunulur, ek madde yazılır. Tespit, not, sonraki bakım tarihi.
4. **Ücret**: parça (ad, adet, birim), işçilik, KDV (%20/10/1/0), ödeme durumu (nakit/kart/havale/bekliyor/garanti). Toplam anında hesaplanır.
5. **Foto**: önce/sonra, telefon kamerasıyla. Canvas ile küçültülür (en uzun kenar 1000 px, JPEG), en fazla 6.
6. **İmza**: müşteri parmağıyla imzalar, teknisyen adı.
7. **Rapor**: A4 sayfa (firma logosu/adı, vergi no, rapor no, tarih, tüm alanlar, imza, garanti notu). "PDF olarak kaydet" (`window.print` + print CSS) ve "WhatsApp'la gönder" (wa.me, rapor özeti hazır metin).

Ayrıca: rapor arşivi + arama (ad, telefon, rapor no, seri no, marka), hizmet filtresi, müşteri kartı (geçmiş, cihazlar, toplam, bekleyen tahsilat), firma ayarları (logo, vergi bilgisi, rapor ön eki, varsayılan KDV, alt not), özel şablonlar, JSON yedek indir/yükle.

## Teknik
- Next.js 15 (App Router) + React 19 + Tailwind 4, tamamen client-side
- Motor: `app/lib/servis.ts` (saf mantık), `app/lib/gorsel.ts` (foto küçültme), `app/components/ImzaPad.tsx`, `app/components/RaporSayfa.tsx`
- Font: Manrope (tek aile, 400-800); palet ve bileşen dili `TASARIM-NOTU.md` içinde (referans: Valideo)
- Görünüm: `app/page.tsx` + `app/components/LandingParcalar.tsx` (landing), `app/app/page.tsx` (panel), `app/components/Ikon.tsx`

## Bilinmesi gerekenler
- WhatsApp bağlantısı PDF dosyasını ekleyemez (wa.me yalnızca metin taşır). Teknisyen PDF'i kaydedip aynı sohbete ekler.
- Veriler cihazdadır; telefon değişirse Ayarlar > Yedek indir / yükle kullanılır. Ekipte merkezi arşiv istenirse sunucu tarafı eklemek gerekir.
- Bu bir e-fatura değildir; iş teslim raporudur.

## Satış açısı
Kategori talebi kanıtlı: Fransa'da yalnızca "1 dakikada müdahale raporu" yapan Valideo, TrustMRR'de doğrulanmış son 30 gün 5,5 bin $ gelir ve %172 büyüme gösteriyor. ABD'de Jobber ve Housecall Pro 100+ aktif reklamla sürekli reklam veriyor (Housecall Pro'nun hâlâ yayındaki en eski reklamı Ağustos 2025'ten beri). Ayrıntı: `RAPOR-kanit.md`.
Fiyat önerisi: **299 TL/ay teknisyen başı**. İlk müşteri: kombi/klima servisleri, beyaz eşya tamircileri, ilaçlamacılar.
