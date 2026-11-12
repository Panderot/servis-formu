import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { DENEME_GUN } from "../components/supabase";
import { SATICI } from "../lib/satici";

export const metadata: Metadata = {
  title: "Teslimat ve İade Şartları · Fixnote",
  description: "Fixnote aboneliğinin teslimatı, cayma hakkı, iade, abonelik iptali ve yenileme kuralları.",
};

// Delivery and refund terms (one of iyzico's site criteria). Built from the sources (MotiqAI Ön Bilgilendirme Formu,
// Abonelik Koşulları m.5, 6, 11) and app/kosullar; no new legal provisions. Activation is shown in the app (we have no
// e-mail service of our own yet). Keep in line with app/kosullar, app/on-bilgilendirme and app/mesafeli-satis.
const E = SATICI.eposta;

const BOLUMLER: Bolum[] = [
  ["Teslimat", [[
    "Fixnote bir web uygulaması aboneliğidir; fiziksel ürün ya da kargo yoktur. Teslimat ya da başka bir ek masraf alınmaz.",
    "Ödeme onaylanınca abonelik hesabında hemen aktifleşir ve uygulama içinde gösterilir. Hizmet elektronik ortamda anında kullanımına açılır.",
    "Uygulama güncel bir internet tarayıcısı ve internet bağlantısıyla çalışır; ek donanım ya da yazılım gerekmez.",
    `Yeni hesap ${DENEME_GUN} gün ücretsiz deneme ile açılır ve kart istenmez. Deneme kendiliğinden ücretli aboneliğe dönüşmez.`,
  ]]],
  ["Cayma hakkı", [[
    "Fixnote işletmelere satılır. Fixnote'u işin için kullanıyorsan cayma hakkına ilişkin tüketici hükümleri yerine Kullanım ve Abonelik Koşulları uygulanır.",
    "Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin birinci fıkrasının (ğ) ve (h) bentleri gereğince, elektronik ortamda anında ifa edilen ve onayınla cayma süresi dolmadan ifasına başlanan hizmetlerde cayma hakkı kullanılamaz. Ödeme ekranında hizmetin hemen başlamasını onaylarsın; bu, aboneliğini istediğin zaman iptal etme hakkını etkilemez.",
    `Cayma hakkının kullanılabildiği bir durum olursa, sözleşmenin kurulduğu günden itibaren 14 gün içinde ${E} adresine yazarak cayabilirsin. Ödediğin tutar, bildirimin bize ulaştığı günden itibaren 14 gün içinde aynı ödeme aracıyla iade edilir.`,
  ]]],
  ["İade", [[
    "Kullanılmayan süre için kısmi iade yapılmaz. Kanunun tanıdığı haklar saklıdır.",
    "Yanlışlıkla ya da iki kez çekilen bir ödeme olursa bize yaz; inceleyip iade ederiz.",
    "Daha üst bir pakete (Usta'dan Firma'ya) geçersen aradaki fark kalan gün sayısına göre hesaplanır. Daha alt bir pakete geçiş, ödediğin dönemin sonunda geçerli olur.",
    "Ödediğin paketin temel bir özelliğini kaldırırsak bunu önceden duyururuz; kabul etmezsen aboneliğini iptal edip kalan tam ayların ücretinin iadesini isteyebilirsin.",
    "Fixnote'u tamamen kapatırsak en az 30 gün önce duyururuz, kayıtlarını alman için süre veririz ve ödediğin ama kullanamayacağın sürenin ücretini iade ederiz.",
    "İadeler ödemenin yapıldığı karta yapılır.",
  ]]],
  ["Abonelik iptali ve yenileme", [[
    "Abonelik, sen iptal edene kadar her ay ya da her yıl aynı gün kendiliğinden yenilenir ve o dönemin ücreti kartından çekilir.",
    `Aboneliğini istediğin zaman uygulamadaki abonelik sayfasından ya da ${E} adresine yazarak iptal edebilirsin.`,
    "İptal, ödediğin dönemin sonunda geçerli olur. O güne kadar Fixnote'u kullanmaya devam edersin; sonraki dönem için ücret çekilmez.",
    "Yenileme ödemesi alınamazsa birkaç gün içinde yeniden denenir. Ödeme 7 gün içinde tamamlanmazsa uygulama yeni kayıt için kilitlenir; kayıtların hemen silinmez.",
    "Abonelik sona erdikten sonra veriler 90 gün saklanır; bu sürede yeniden abone olabilir ya da verilerini indirebilirsin. Süre dolunca silinir.",
  ]]],
  ["İletişim", [
    `Teslimat, iade ve iptalle ilgili her soru için: ${E}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Delivery", [[
    "Fixnote is a web app subscription; there is no physical product or shipping. No delivery or other extra charge is taken.",
    "Once the payment is confirmed, the subscription becomes active in your account at once and is shown in the app. The service is made available to you electronically straight away.",
    "The app works with an up-to-date web browser and an internet connection; no extra hardware or software is needed.",
    `A new account starts with a free ${DENEME_GUN}-day trial and no card is needed. The trial does not turn into a paid subscription by itself.`,
  ]]],
  ["Right of withdrawal", [[
    "Fixnote is sold to businesses. If you use Fixnote for your work, the Terms of use and subscription apply instead of the consumer provisions on withdrawal.",
    "Under Article 15(1)(ğ) and (h) of the Distance Contracts Regulation, the right of withdrawal cannot be used for services that are performed electronically at once and whose performance starts, with your approval, before the withdrawal period ends. You approve on the payment screen that the service starts at once; this does not affect your right to cancel your subscription at any time.",
    `If a situation arises in which the right of withdrawal can be used, you can withdraw within 14 days of the contract being made by writing to ${E}. The amount you paid is refunded to the same payment method within 14 days of your notice reaching us.`,
  ]]],
  ["Refunds", [[
    "We don't give partial refunds for unused time. Your statutory rights are not affected.",
    "If a payment was taken by mistake or twice, write to us; we will review it and refund it.",
    "If you move to a higher plan (from Solo to Team), the difference is calculated by the number of days left. Moving to a lower plan takes effect at the end of the period you have paid for.",
    "If we remove a core feature of the plan you pay for, we announce it in advance; if you don't accept it, you can cancel and ask for a refund of the remaining full months.",
    "If we close Fixnote completely, we announce it at least 30 days in advance, give you time to take your records and refund the time you have paid for but cannot use.",
    "Refunds are made to the card the payment was made with.",
  ]]],
  ["Cancellation and renewal", [[
    "The subscription renews automatically on the same day every month or every year until you cancel it, and that period's fee is charged to your card.",
    `You can cancel your subscription at any time from the subscription page in the app or by writing to ${E}.`,
    "Cancellation takes effect at the end of the period you have paid for. You keep using Fixnote until then; you are not charged for the next period.",
    "If a renewal payment fails, it is tried again over a few days. If the payment is not completed within 7 days, the app is locked for new records; your records are not deleted straight away.",
    "After a subscription ends, your data is kept for 90 days; during that time you can subscribe again or download your data. After that it is deleted.",
  ]]],
  ["Contact", [
    `For any question about delivery, refunds or cancellation: ${E}`,
  ]],
];

export default function TeslimatVeIade() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Teslimat ve İade Şartları",
          tarih: "12 Kasım 2026",
          giris: "Bu sayfa Fixnote aboneliğinin teslimatını, cayma hakkını, iadeleri, iptali ve yenilemeyi bir arada anlatır. Ayrıntılar Kullanım ve Abonelik Koşulları, Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'nde yazar.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Delivery and refund terms",
          tarih: "12 November 2026",
          giris: "This page sets out delivery, the right of withdrawal, refunds, cancellation and renewal for the Fixnote subscription in one place. The details are in the Terms of use and subscription, the Pre-information form and the Distance sales agreement.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
