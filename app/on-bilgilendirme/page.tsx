import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { fiyatSatirlari } from "../lib/paket";
import { SATICI, saticiSatirlari } from "../lib/satici";

export const metadata: Metadata = {
  title: "Ön Bilgilendirme Formu · Fixnote",
  description: "Fixnote aboneliği için ön bilgilendirme formu: hizmet sağlayıcı, hizmet, fiyat, ödeme, süre, iptal ve cayma hakkı.",
};

// Pre-information form (6502 sayılı Kanun, Mesafeli Sözleşmeler Yönetmeliği). Source: "MotiqAI Ön Bilgilendirme
// Formu ve Mesafeli Hizmet Sözleşmesi" (11 November 2026); only product details are filled in (Fixnote, plans, prices,
// seller, iyzico). Do not add new legal provisions here. Shown before payment on /abonelik (tick box "obf").
// Keep in line with app/mesafeli-satis, app/teslimat-ve-iade and app/kosullar. Not reviewed by a lawyer.
const E = SATICI.eposta;

const BOLUMLER: Bolum[] = [
  ["Hizmet sağlayıcı", [
    [...saticiSatirlari("tr"), "Şikâyetlerin için de aynı iletişim bilgilerini kullanabilirsin."],
  ]],
  ["Hizmetin temel nitelikleri", [[
    "Fixnote web uygulamasına, seçtiğin paket kapsamında internet tarayıcısı üzerinden erişim (yazılım hizmeti). Usta paketi 1 teknisyen, Firma paketi sınırsız teknisyen içindir. Uygulamanın özellikleri ana sayfada yazar.",
    "Uygulama güncel bir internet tarayıcısı ve internet bağlantısıyla çalışır; ek donanım ya da yazılım gerekmez. Hesap girişi dışında bir teknik koruma önlemi yoktur.",
  ]]],
  ["Fiyat ve ödeme", [
    "Güncel fiyatlar (Türk lirası, tüm vergiler dahil):",
    fiyatSatirlari("tr"),
    [
      "Paketin tüm vergiler dahil fiyatı ve ödeme dönemi (aylık ya da yıllık) ödeme sayfasında yazar. Teslimat ya da başka bir ek masraf yoktur; depozito ya da teminat istenmez.",
      "Ödeme, lisanslı bir ödeme kuruluşu (iyzico) aracılığıyla kartla alınır. Kart bilgilerin bize ulaşmaz.",
      "Abonelik, sen iptal edene kadar her dönem aynı gün kendiliğinden yenilenir ve o dönemin ücreti kartından çekilir.",
    ],
  ]],
  ["Hizmetin başlaması", [
    "Hizmet, ödemenin onaylanmasının ardından elektronik ortamda anında kullanımına açılır.",
  ]],
  ["Süre, yenileme ve iptal", [[
    "Sözleşme seçtiğin dönem (bir ay ya da bir yıl) içindir ve iptal etmedikçe aynı süreyle kendiliğinden yenilenir. Asgari süre bir dönemdir.",
    `Aboneliğini istediğin zaman uygulamadaki abonelik sayfasından ya da ${E} adresine yazarak iptal edebilirsin. İptal, ödediğin dönemin sonunda geçerli olur; o güne kadar uygulamayı kullanmaya devam edersin.`,
    "Yıllık aboneliklerde yenilemeden en az 7 gün önce e-postayla hatırlatma göndeririz.",
  ]]],
  ["Cayma hakkı", [[
    "Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin birinci fıkrasının (ğ) ve (h) bentleri gereğince, elektronik ortamda anında ifa edilen ve onayınla cayma süresi dolmadan ifasına başlanan hizmetlerde cayma hakkı kullanılamaz.",
    "Uygulama ödemenin ardından anında kullanımına açıldığı için, ödeme ekranında hizmetin hemen başlamasını onaylarsın ve bu nedenle cayma hakkın olmaz. Bu, aboneliğini istediğin zaman iptal etme hakkını etkilemez.",
    `Cayma hakkının kullanılabildiği bir durum olursa, sözleşmenin kurulduğu günden itibaren 14 gün içinde ${E} adresine yazarak cayabilirsin. Bu durumda ödediğin tutar, bildirimin bize ulaştığı günden itibaren 14 gün içinde aynı ödeme aracıyla iade edilir.`,
  ]]],
  ["Şikâyet ve uyuşmazlıklar", [[
    `Şikâyetlerini ${E} adresine yazabilirsin; en kısa sürede yanıtlarız.`,
    "Uyuşmazlıklarda, Ticaret Bakanlığı'nın her yıl ilan ettiği parasal sınırlar içinde yerleşim yerindeki ya da işlemi yaptığın yerdeki tüketici hakem heyetine, bu sınırların üzerinde tüketici mahkemesine başvurabilirsin. Tüketici hakem heyeti başvurunu e-Devlet üzerinden Tüketici Bilgi Sistemi'nden (TÜBİS) de yapabilirsin.",
  ]]],
  ["Kişisel veriler", [
    "Kişisel verilerinin nasıl işlendiği Gizlilik Politikası'nda anlatılır.",
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Service provider", [
    [...saticiSatirlari("en"), "You can also use these contact details for complaints."],
  ]],
  ["Main features of the service", [[
    "Access to the Fixnote web app through a web browser, within the plan you choose (a software service). The Solo plan is for 1 technician, the Team plan for unlimited technicians. The app's features are described on the home page.",
    "The app works with an up-to-date web browser and an internet connection; no extra hardware or software is needed. There is no technical protection measure other than the account sign-in.",
  ]]],
  ["Price and payment", [
    "Current prices (Turkish lira, all taxes included):",
    fiyatSatirlari("en"),
    [
      "The plan's price including all taxes and the billing period (monthly or yearly) are shown on the payment page. There is no delivery or other extra charge; no deposit or security is asked for.",
      "Payment is taken by card through a licensed payment institution (iyzico). Your card details never reach us.",
      "The subscription renews automatically on the same day every period until you cancel it, and that period's fee is charged to your card.",
    ],
  ]],
  ["Start of the service", [
    "The service is made available to you electronically as soon as the payment is confirmed.",
  ]],
  ["Term, renewal and cancellation", [[
    "The contract is for the period you choose (one month or one year) and renews automatically for the same period unless you cancel. The minimum term is one period.",
    `You can cancel your subscription at any time from the subscription page in the app or by writing to ${E}. Cancellation takes effect at the end of the period you have paid for; you keep using the app until then.`,
    "For yearly subscriptions we send a reminder by email at least 7 days before renewal.",
  ]]],
  ["Right of withdrawal", [[
    "Under Article 15(1)(ğ) and (h) of the Distance Contracts Regulation, the right of withdrawal cannot be used for services that are performed electronically at once and whose performance starts, with your approval, before the withdrawal period ends.",
    "Because the app is made available to you as soon as you pay, you approve on the payment screen that the service starts at once, so you have no right of withdrawal. This does not affect your right to cancel your subscription at any time.",
    `If a situation arises in which the right of withdrawal can be used, you can withdraw within 14 days of the contract being made by writing to ${E}. The amount you paid is then refunded to the same payment method within 14 days of your notice reaching us.`,
  ]]],
  ["Complaints and disputes", [[
    `You can send complaints to ${E}; we reply as soon as possible.`,
    "In disputes, you can apply to the consumer arbitration committee where you live or where you made the purchase, within the monetary limits announced each year by the Ministry of Trade, and to the consumer court above those limits. You can also apply to the consumer arbitration committee online through e-Devlet, via the Consumer Information System (TÜBİS).",
  ]]],
  ["Personal data", [
    "How your personal data is processed is explained in the Privacy policy.",
  ]],
];

export default function OnBilgilendirme() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Ön Bilgilendirme Formu",
          tarih: "12 Kasım 2026",
          giris: "Bu form, Fixnote aboneliği için 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında hazırlanmıştır. Satın aldığın paket, fiyat ve tarih ödeme sayfasında ve sipariş onay e-postasında yazar; bu form o bilgilerle birlikte geçerlidir. Fixnote işletmelere satılır: Fixnote'u işin için kullanıyorsan (işletme ya da serbest çalışan olarak) bu form yerine sadece Kullanım ve Abonelik Koşulları uygulanır.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Pre-information form",
          tarih: "12 November 2026",
          giris: "This form is prepared for the Fixnote subscription under Turkey's Consumer Protection Law No. 6502 and the Distance Contracts Regulation. The plan, price and date you buy are shown on the payment page and in the order confirmation email; this form applies together with that information. Fixnote is sold to businesses: if you use Fixnote for your work (as a business or self-employed person), only the Terms of use and subscription apply instead of this form.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
