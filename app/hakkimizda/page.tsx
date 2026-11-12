import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { DENEME_GUN } from "../components/supabase";
import { fiyatSatirlari } from "../lib/paket";
import { SATICI, saticiSatirlari } from "../lib/satici";

export const metadata: Metadata = {
  title: "Hakkımızda · Fixnote",
  description: "Fixnote nedir, kimler için, kim geliştirir ve satar; satıcı ve iletişim bilgileri.",
};

// About page (one of iyzico's site criteria): what Fixnote is, who it is for, who builds and sells it, and the
// seller's details. No invented figures or testimonials. Seller details come from app/lib/satici.ts, prices from
// app/lib/paket.ts. The "iletisim" anchor is the footer's Contact link.
const S = SATICI;

const BOLUMLER: Bolum[] = [
  ["Fixnote nedir", [
    "Fixnote, saha servis ekipleri için dijital servis raporu uygulamasıdır. Teknisyen formu telefonda doldurur, müşteriye ekranda imzalatır; firma başlıklı A4 rapor PDF olur ve WhatsApp'tan gönderilir.",
    [
      "Kayıtlar hesapta saklanır ve aynı hesapla giren her telefonda açılır. İnternet yokken kaydedilen rapor, bağlantı gelince gönderilir.",
      "Hazır kontrol listeleri ve firmanın kendi şablonları, önce ve sonra fotoğrafları, müşteri imzası, müşteri geçmişi ve arşiv araması tek uygulamadadır.",
      "Fixnote bir iş teslim raporu üretir; e-fatura ya da mali belge değildir.",
    ],
  ]],
  ["Kimler için", [
    "Kombi ve klima, beyaz eşya, ilaçlama, elektrik gibi sahada servis veren işletmeler için: tek başına çalışan usta için Usta paketi, ekibi olan servis firması için Firma paketi.",
    "Fixnote işletmelere, esnafa ve serbest çalışanlara işleri için sunulur; tüketicilere satılmaz.",
  ]],
  ["Paketler ve fiyatlar", [
    fiyatSatirlari("tr"),
    `Fiyatlar Türk lirası ve KDV dahildir. Yeni hesap ${DENEME_GUN} gün ücretsiz deneme ile açılır, kart istenmez. Abonelik ödemesi iyzico güvencesiyle kartla alınır; kart bilgilerin bize ulaşmaz.`,
  ]],
  ["Kim geliştiriyor", [
    `Fixnote, ${S.marka} markasıyla ${S.ad} (şahıs işletmesi) tarafından geliştirilir ve satılır.`,
  ]],
  ["İletişim ve satıcı bilgileri", [
    saticiSatirlari("tr"),
    `Sorularını ${S.eposta} adresine e-postayla ya da ${S.telefon} numarasına WhatsApp'tan yazabilirsin.`,
  ], "iletisim"],
];

const BOLUMLER_EN: Bolum[] = [
  ["What Fixnote is", [
    "Fixnote is a digital service report app for field service teams. The technician fills in the form on the phone and has the customer sign on screen; the result is a branded A4 report as a PDF, sent on WhatsApp.",
    [
      "Records are stored in the account and open on every phone signed in to it. A report saved without internet is sent when the connection is back.",
      "Ready-made checklists and the company's own templates, before and after photos, the customer's signature, customer history and archive search are all in one app.",
      "Fixnote produces a job completion report; it is not an invoice or a tax document.",
    ],
  ]],
  ["Who it's for", [
    "Businesses that do service work on site, such as boilers and air conditioning, appliances, pest control and electrical work: the Solo plan for the technician who works alone, the Team plan for service companies with a crew.",
    "Fixnote is offered to businesses, tradespeople and self-employed people for their work; it is not sold to consumers.",
  ]],
  ["Plans and prices", [
    fiyatSatirlari("en"),
    `Prices are in Turkish lira (TRY), VAT included. A new account starts with a free ${DENEME_GUN}-day trial and no card is needed. Subscriptions are paid by card, secured by iyzico; your card details never reach us.`,
  ]],
  ["Who builds it", [
    `Fixnote is developed and sold by ${S.ad} (sole proprietorship) under the ${S.marka} brand.`,
  ]],
  ["Contact and seller details", [
    saticiSatirlari("en"),
    `Write to ${S.eposta} by email or to ${S.telefon} on WhatsApp with any question.`,
  ], "iletisim"],
];

export default function Hakkimizda() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Hakkımızda",
          giris: "Fixnote, saha servis ekipleri için dijital servis raporudur: doldur, imzalat, WhatsApp'tan gönder.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "About us",
          giris: "Fixnote is a digital service report for field service teams: fill in, sign, send on WhatsApp.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
