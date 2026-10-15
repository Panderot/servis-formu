# Neden Bu Fikir: Saha Servis Raporu (Servis Formu)

B2B (tek teknisyenli esnaf ve küçük servis ekipleri). Web-native, telefon öncelikli: form → kontrol listesi → foto → parmakla imza → A4 PDF + WhatsApp.

## Kanıt (ayrıntı: `RAPOR-kanit.md`, ham veri `faz-b/`)
- **Doğrulanmış gelir:** Valideo ("Your intervention report in less than 1min", Fransa, 2025-05 kuruluş). TrustMRR Stripe doğrulamalı: son 30 gün **5.475 $**, MRR 3.843 $, 58 aktif abonelik, son 30 günde **%172 büyüme**. Yani tam bu dar iş, yani "müdahale raporunu bir dakikada çıkar", tek başına abonelik satıyor (`faz-b/trustmrr.json`).
- **Kategori sürekli reklam veriyor (Meta Ad Library, ABD, aktif, 2026-10-04):**
  - Jobber: çekilen 100 aktif reklamın en eskisi 2026-05-12'den beri yayında (~145 gün), 9'u 90 günü aşmış (`faz-b/meta-page-jobber.json`).
  - Housecall Pro: 100 aktif reklam, en eskisi 2025-08-21'den beri yayında (~409 gün), 5'i 90 günü aşmış (`faz-b/meta-page-housecallpro.json`).
  - Uzun süre yayında kalan reklam, para kazandıran reklamdır. Saha servis yazılımı kategorisi aylardır kesintisiz bütçe yakıyor.
- **Gerçek reklam açıları ürünü doğruluyor:** "No Paperwork Club", "Pen and paper. Missed calls...", "You didn't build your business to spend every night and weekend on paperwork" (Jobber); "Protect yourself with proof... when a customer questions the work, you have the receipts. Snap photos at the start, middle, and end of the job", "No more handwritten quotes", "homeowners hire a Pro for fast updates, clear pricing, and visual proof" (Housecall Pro). Servis Formu'nun üç ana işi (kağıtsız rapor, fotoğraf kanıtı, imzalı yazılı fiyat) birebir bu açılar.

## Dert
Türkiye'de kombi/klima servisi, beyaz eşya tamircisi, ilaçlamacı, elektrikçi hâlâ karbon kopyalı koçan kullanıyor. El yazısı okunmuyor, fiş arabada kayboluyor, müşteri "bu parçayı değiştirmediniz" diyor, usta akşam raporları ofiste yeniden yazıyor. Jobber/Housecall Pro gibi tam teşekküllü yazılımlar İngilizce, dolar fiyatlı ve tek ustaya ağır.

## Portföyde ayrışma
- **dispatch** = ekip iş emri ve planlama (ofis tarafı: kim, hangi işe, ne zaman).
- **bakim** = araç bakım defteri (araç sahibinin kendi bakım kaydı).
- **Servis Formu** = sahadaki tek teknisyenin rapor + imza + PDF anı. Planlama yapmaz, iş atamaz; kapıda, işi bitirdiği dakikada belgeyi çıkarır ve müşteriye onaylatır.
Üçü farklı kullanıcı, farklı an. Servis Formu, dispatch kullanan bir ekipte bile teknisyenin cebindeki parça olabilir.

## Fark
- Tamamen client-side, anahtarsız: işlem başına maliyet yok, üye sıfır altyapı maliyetiyle satar.
- Türkçe, KDV oranları (%20/10/1/0), TL, garanti kapsamı, WhatsApp; Türkiye'deki ustanın gerçek akışı.
- Hazır 5 kontrol listesi + kullanıcı şablonu: asansör, kamera kurulumu, su arıtma gibi sektörlere 1 dakikada uyarlanır.

## Satış
Fiyat önerisi: **299 TL/ay teknisyen başı** (Valideo'nun Avrupa fiyatının çok altında, koçan + kayıp iş maliyetinin altında). Üye için ilk müşteri: mahalledeki kombi/klima servisleri (sezon başı bakım yoğunluğu), beyaz eşya tamircileri, ilaçlama firmaları (site yönetimlerine imzalı rapor şart), asansör bakım firmaları. Satış cümlesi: "Bir sonraki servisi kağıtsız kapat; müşteri imzalı raporu kapıdan çıkmadan WhatsApp'ında görsün."
