import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA, DENEME_GUN } from "../components/supabase";

export const metadata: Metadata = {
  title: "Kullanım koşulları · Fixnote",
  description: "Fixnote'u kullanırken geçerli olan koşullar: hesap, deneme, abonelik, kayıtlar ve sorumluluklar.",
};

const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
  ["Hizmet sağlayıcı", [
    "Fixnote'u Motiq Automation Ltd sunar. Bu koşullarda \"biz\" bu şirketi, \"sen\" Fixnote'u kullanan kişiyi ya da firmayı anlatır.",
    [
    "Motiq Automation Ltd (İngiltere ve Galler'de kayıtlı özel limited şirket)",
    "Şirket numarası: 17303276",
    "Kayıtlı adres: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, Birleşik Krallık",
    `E-posta: ${E}`,
    ],
  ]],
  ["Hizmet", [
    "Fixnote, saha servis ekiplerinin servis raporunu telefondan doldurmasını, müşteriye ekranda imzalatmasını, A4 rapor ve PDF almasını ve raporu WhatsApp ile göndermesini sağlayan bir web uygulamasıdır.",
    "Fixnote bir iş teslim raporu üretir. E-fatura ya da mali belge değildir; faturanı bugünkü yönteminle kesmeye devam edersin.",
  ]],
  ["Hesap", [[
    "Hesap açarken gerçek ve sana ait bir e-posta adresi kullanırsın.",
    "Firma hesabını kendi teknisyenlerinle kullanabilirsin (Usta paketinde bir teknisyen, Firma paketinde sınırsız). Hesabı kullanan herkes aynı kayıtları görür; şifreni bunların dışında kimseyle paylaşmazsın.",
    "Hesabında yapılan işlemlerden sen sorumlusun.",
    `Hesabının izinsiz kullanıldığını düşünürsen hemen ${E} adresine yaz.`,
  ]]],
  ["Ücretsiz deneme", [
    `Yeni hesap ${DENEME_GUN} gün ücretsiz deneme ile açılır ve kart istenmez. Deneme bitince uygulama kilitlenir. Kayıtların hesabında saklanmaya devam eder; abonelik açılınca kaldığın yerden devam edersin.`,
  ]],
  ["Abonelik ve ücretler", [[
    "Güncel fiyatlar ana sayfadaki Fiyat bölümünde yazar. Fiyatlara KDV dahil değildir.",
    "İki paket vardır: Usta (bir teknisyen) ve Firma (sınırsız teknisyen). İkisi de aylık ya da yıllık açılır; yıllık peşin ödemede aylık fiyata göre %20 indirim uygulanır.",
    "Fiyatlar ABD doları cinsindendir.",
    `Abonelik için ${E} adresine yazarsın. Ödeme ve fatura bilgileri sana bu yazışmada iletilir.`,
    "Abonelik süren bitince yenilemezsen uygulama yeniden kilitlenir; kayıtların hesabında kalır.",
    "Fiyatları değiştirirsek, değişiklik ödemesini yapmış olduğun dönemi etkilemez.",
  ]]],
  ["Kayıtların ve yedek", [
    "Servis kayıtların hesabında, altyapı sağlayıcımızın Almanya'daki sunucularında saklanır ve aynı hesapla giren her cihazda görünür.",
    "İnternet yokken kaydettiğin rapor, bağlantı gelene kadar o cihazda bekler. Bu sırada tarayıcı verileri silinirse ya da cihaz kaybolursa henüz gönderilmemiş rapor kaybolabilir.",
    "Kayıtlarını korumak için gereken özeni gösteririz. Yine de Ayarlar'dan ara sıra yedek indirmeni öneririz.",
  ]],
  ["Raporların içeriği ve müşteri bilgileri", [
    "Raporlara yazdığın bilgilerin doğruluğundan ve müşterilerinin kişisel verilerini KVKK'ya uygun işlemekten sen sorumlusun. Müşteri onayı bölümünü yalnızca müşterinin kendisi imzalar.",
  ]],
  ["Kabul edilmeyen kullanım", [
    "Fixnote'u yasa dışı amaçlarla, yanıltıcı ya da sahte rapor hazırlamak için, başkası adına imza atmak için, hizmeti bozmaya ya da başkalarının hesaplarına erişmeye çalışmak için kullanamazsın. Bu durumlarda hesabını askıya alabilir ya da kapatabiliriz.",
  ]],
  ["Hizmetin sürekliliği", [
    "Fixnote'u kesintisiz ve hatasız çalıştırmak için çalışırız, ancak bunu garanti edemeyiz. Bakım, güncelleme ya da altyapı sağlayıcılarından kaynaklanan kesintiler olabilir. Hizmeti geliştirirken özellikleri değiştirebiliriz.",
  ]],
  ["Sorumluluğun sınırı", [
    "Fixnote olduğu gibi sunulur. Yürürlükteki hukukun izin verdiği ölçüde; henüz gönderilmemiş kayıtların cihazında kaybolmasından, raporlara girilen bilgilerden ve dolaylı zararlardan (kâr kaybı gibi) sorumlu değiliz. Her durumda sorumluluğumuz, son 12 ayda Fixnote için ödediğin tutarla sınırlıdır.",
  ]],
  ["Hesabın kapatılması", [
    `Hesabını istediğin zaman kapatabilirsin; bunun için ${E} adresine yaz. Hesap kapanınca hesap bilgilerin ve servis kayıtların Gizlilik politikasına göre silinir; kapatmadan önce Ayarlar'dan yedek indirebilirsin.`,
  ]],
  ["Değişiklikler", [
    "Bu koşulları güncellersek bu sayfadaki tarihi değiştiririz ve önemli değişiklikleri ayrıca duyururuz. Güncellemeden sonra Fixnote'u kullanmaya devam etmen, yeni koşulları kabul ettiğin anlamına gelir.",
  ]],
  ["İletişim", [
    `Bu koşullarla ilgili her soru için: ${E}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Service provider", [
    "Fixnote is provided by Motiq Automation Ltd. In these terms, \"we\" means this company and \"you\" means the person or company using Fixnote.",
    [
    "Motiq Automation Ltd (a private limited company registered in England and Wales)",
    "Company number: 17303276",
    "Registered office: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom",
    `Email: ${E}`,
    ],
  ]],
  ["The service", [
    "Fixnote is a web app that lets field service teams fill in a service report on a phone, have the customer sign it on screen, get an A4 report and PDF, and send the report on WhatsApp.",
    "Fixnote produces a job completion report. It is not an invoice or a tax document; keep invoicing the way you do today.",
  ]],
  ["Your account", [[
    "You open your account with a real email address that belongs to you.",
    "You may use your company account with your own technicians (one technician on the Solo plan, unlimited on the Team plan). Everyone using the account sees the same records; you don't share your password with anyone else.",
    "You are responsible for what is done in your account.",
    `If you think your account has been used without permission, write to ${E} straight away.`,
  ]]],
  ["Free trial", [
    `A new account opens with a free ${DENEME_GUN}-day trial and no card is needed. When the trial ends the app locks. Your records stay in your account; once a subscription is active you carry on where you left off.`,
  ]],
  ["Subscription and fees", [[
    "Current prices are shown in the Pricing section on the home page. Prices exclude VAT.",
    "There are two plans: Solo (one technician) and Team (unlimited technicians). Both can be paid monthly or yearly; paying a year upfront gives 20% off the monthly price.",
    "Prices are in US dollars.",
    `To subscribe, write to ${E}. Payment and invoice details are sent to you in that conversation.`,
    "If you don't renew when your subscription ends, the app locks again; your records stay in your account.",
    "If we change our prices, the change does not affect a period you have already paid for.",
  ]]],
  ["Your records and backups", [
    "Your service records are stored in your account on our infrastructure provider's servers in Germany and appear on every device signed in to the same account.",
    "A report saved without internet waits on that device until it is back online. If the browser data is cleared or the device is lost in the meantime, a report that has not been sent yet may be lost.",
    "We take due care to protect your records. Even so, we recommend downloading a backup from Settings from time to time.",
  ]],
  ["Report content and customer details", [
    "You are responsible for the accuracy of what you write in reports and for processing your customers' personal data lawfully, including under KVKK (Turkey's Personal Data Protection Law). Only the customer signs the customer sign-off section.",
  ]],
  ["Unacceptable use", [
    "You may not use Fixnote for illegal purposes, to prepare misleading or fake reports, to sign on someone else's behalf, or to try to disrupt the service or access other people's accounts. In these cases we may suspend or close your account.",
  ]],
  ["Continuity of the service", [
    "We work to keep Fixnote running without interruptions or errors, but we cannot guarantee it. There may be interruptions caused by maintenance, updates or infrastructure providers. We may change features as we improve the service.",
  ]],
  ["Limitation of liability", [
    "Fixnote is provided as is. To the extent permitted by applicable law, we are not liable for records that have not yet been sent being lost on your device, for the information entered in reports, or for indirect losses (such as loss of profit). In any case our liability is limited to the amount you paid for Fixnote in the last 12 months.",
  ]],
  ["Closing your account", [
    `You can close your account at any time by writing to ${E}. When the account is closed, your account details and service records are deleted in line with the Privacy policy; you can download a backup from Settings before closing it.`,
  ]],
  ["Changes", [
    "If we update these terms, we change the date on this page and announce important changes separately. Continuing to use Fixnote after an update means you accept the new terms.",
  ]],
  ["Contact", [
    `For any question about these terms: ${E}`,
  ]],
];

export default function Kosullar() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Kullanım koşulları",
          tarih: "17 Ekim 2026",
          giris: "Fixnote'a hesap açarak ya da Fixnote'u kullanarak bu koşulları kabul etmiş olursun. Kişisel verilerinle ilgili ayrıntılar Gizlilik politikası sayfasındadır.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Terms of use",
          tarih: "17 October 2026",
          giris: "By opening a Fixnote account or using Fixnote, you accept these terms. Details about your personal data are on the Privacy policy page.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
