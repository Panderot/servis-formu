import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { fiyatSatirlari } from "../lib/paket";
import { SATICI, saticiSatirlari } from "../lib/satici";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi · Fixnote",
  description: "Fixnote aboneliği için mesafeli satış (hizmet) sözleşmesi: taraflar, konu, kurulma, fiyat, iptal, cayma ve uyuşmazlıklar.",
};

// Distance sales agreement (the source calls it "Mesafeli Hizmet Sözleşmesi"). Source: "MotiqAI Ön Bilgilendirme Formu
// ve Mesafeli Hizmet Sözleşmesi" (11 November 2026); only product details are filled in. Do not add new legal provisions.
// Accepted before payment on /abonelik (tick box "mesafeli"). Keep in line with app/on-bilgilendirme. Not reviewed by a lawyer.
const S = SATICI;

const BOLUMLER: Bolum[] = [
  ["Taraflar", [[
    `Hizmet sağlayıcı: ${S.ad} (${S.marka}); iletişim bilgileri Ön Bilgilendirme Formu'nun 1. maddesinde ve aşağıda yazar.`,
    "Alıcı: Ödeme sırasında adını ve e-posta adresini giren bireysel kullanıcı.",
  ], saticiSatirlari("tr")]],
  ["Konu", [
    "Alıcının ödeme sayfasında seçtiği Fixnote paketinin (Usta ya da Firma; aylık ya da yıllık) bu sözleşmeye ve Kullanım ve Abonelik Koşulları'na göre sunulması ile tarafların hak ve yükümlülükleri.",
  ]],
  ["Sözleşmenin kurulması ve saklanması", [[
    "Alıcı, ödemeden önce Ön Bilgilendirme Formu'nu okuduğunu onaylar; sözleşme, ödemenin onaylanmasıyla kurulur.",
    "Bu sözleşme, Ön Bilgilendirme Formu ve sipariş bilgileri (uygulama, paket, fiyat, tarih) alıcının e-posta adresine gönderilir. Hizmet sağlayıcı bu belgeleri en az 3 yıl saklar.",
  ]]],
  ["Fiyat, ödeme, yenileme ve iptal", [
    "Ön Bilgilendirme Formu'nun 3. ve 5. maddelerindeki gibidir. Güncel fiyatlar (Türk lirası, KDV dahil):",
    fiyatSatirlari("tr"),
  ]],
  ["Cayma hakkı", [
    "Ön Bilgilendirme Formu'nun 6. maddesindeki gibidir.",
  ]],
  ["Diğer hükümler", [[
    "Bu sözleşmede yer almayan konularda Kullanım ve Abonelik Koşulları uygulanır. Kullanım ve Abonelik Koşulları'nın sorumluluğu sınırlayan ve yetkili mahkemeyi belirleyen hükümleri alıcıya uygulanmaz.",
    "Alıcının kanundan doğan hakları saklıdır.",
  ]]],
  ["Uyuşmazlıklar", [
    "Ön Bilgilendirme Formu'nun 7. maddesindeki gibidir.",
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Parties", [[
    `Service provider: ${S.ad} (${S.marka}); contact details are in section 1 of the Pre-information form and below.`,
    "Buyer: the individual user who enters their name and email address during payment.",
  ], saticiSatirlari("en")]],
  ["Subject", [
    "Provision of the Fixnote plan the buyer chooses on the payment page (Solo or Team; monthly or yearly) under this agreement and the Terms of use and subscription, and the rights and obligations of the parties.",
  ]],
  ["Making and keeping the agreement", [[
    "Before paying, the buyer confirms having read the Pre-information form; the agreement is made when the payment is confirmed.",
    "This agreement, the Pre-information form and the order details (app, plan, price, date) are sent to the buyer's email address. The service provider keeps these documents for at least 3 years.",
  ]]],
  ["Price, payment, renewal and cancellation", [
    "As set out in sections 3 and 5 of the Pre-information form. Current prices (Turkish lira, VAT included):",
    fiyatSatirlari("en"),
  ]],
  ["Right of withdrawal", [
    "As set out in section 6 of the Pre-information form.",
  ]],
  ["Other provisions", [[
    "Matters not covered by this agreement are governed by the Terms of use and subscription. The provisions of the Terms of use and subscription that limit liability or set the competent court do not apply to the buyer.",
    "The buyer's statutory rights are not affected.",
  ]]],
  ["Disputes", [
    "As set out in section 7 of the Pre-information form.",
  ]],
];

export default function MesafeliSatis() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Mesafeli Satış Sözleşmesi",
          tarih: "12 Kasım 2026",
          giris: "Bu sözleşme (Mesafeli Hizmet Sözleşmesi), Fixnote aboneliği için 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır ve Ön Bilgilendirme Formu ile birlikte geçerlidir. Fixnote işletmelere satılır: Fixnote'u işin için kullanıyorsan (işletme ya da serbest çalışan olarak) bu sözleşme yerine sadece Kullanım ve Abonelik Koşulları uygulanır.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Distance sales agreement",
          tarih: "12 November 2026",
          giris: "This agreement (distance service agreement) is prepared for the Fixnote subscription under Turkey's Consumer Protection Law No. 6502 and the Distance Contracts Regulation, and applies together with the Pre-information form. Fixnote is sold to businesses: if you use Fixnote for your work (as a business or self-employed person), only the Terms of use and subscription apply instead of this agreement.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
