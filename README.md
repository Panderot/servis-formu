# Fixnote

Saha servis ekipleri için dijital servis raporu: formu telefonda doldur, müşteriye ekranda imzalat, A4 raporu PDF olarak kaydet ve WhatsApp'tan gönder. Türkçe ve İngilizce.

Canlı: https://fixnotee.vercel.app · Demo: https://fixnotee.vercel.app/demo

## Geliştirme
```bash
npm install
cp .env.example .env.local   # Supabase adresi ve anahtarı
npm run dev                  # http://localhost:3000
```
Veritabanı kurulumu: `supabase/kurulum.sql` dosyasını Supabase SQL Editor'da bir kez çalıştır. Yapı, kurallar ve ayrıntılar `CLAUDE.md` içinde.

Next.js 15, React 19, Tailwind 4, Supabase. © 2026 Motiq Automation Ltd.
