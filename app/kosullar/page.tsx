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
    "Usta paketinde hesabı yalnızca sen kullanırsın. Firma paketinde teknisyenlerini davet bağlantısıyla ekibine eklersin; her teknisyen kendi e-postası ve şifresiyle girer, firmanın kayıtlarını görür, rapor yazar ve düzenler. Rapor silme, firma bilgileri, şablonlar, abonelik ve ekip yönetimi hesabın sahibi olarak sende kalır.",
    "Şifreni kimseyle paylaşmazsın. Ekipten çıkardığın teknisyenin firmanın kayıtlarına erişimi hemen biter; yazdığı raporlar firmada kalır.",
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
    "Raporlara yazdığın bilgilerin doğruluğundan sen sorumlusun. Müşteri onayı bölümünü yalnızca müşterinin kendisi imzalar.",
  ]],
  ["Kişisel veriler: senin ve bizim rolümüz", [
    "Fixnote'a girdiğin müşteri bilgileri (ad, telefon, adres, fotoğraf, imza) bakımından KVKK'ya göre veri sorumlusu sensin. Biz bu bilgileri yalnızca senin adına ve hizmeti sunmak için işleyen veri işleyeniz. Bu bölüm, bu konudaki karşılıklı yükümlülüklerimizi düzenler.",
    [
      "Müşterilerini KVKK'ya göre bilgilendirmek (aydınlatmak), gereken durumlarda açık rızalarını almak ve onlardan gelen başvuruları yanıtlamak senin yükümlülüğündür.",
      "Bu bilgileri yalnızca hizmeti sunmak için ve senin talimatınla işleriz; başka bir amaçla kullanmaz, satmaz ve reklam için kullanmayız.",
      "Bilgilere erişebilen kişileri ve sistemleri hizmetin çalışması için gerekenlerle sınırlar, gizlilik yükümlülüğüne tabi tutarız; verileri korumak için uygun teknik ve idari tedbirleri alırız.",
      "Hizmeti sunmak için altyapı sağlayıcılarıyla çalışırız (Supabase: veritabanı ve dosya depolama, Almanya; Vercel: sitenin sunulması; Google: yalnızca Google ile girişte). Bu listeyi değiştirirsek Gizlilik politikasında duyururuz.",
      "Bilgilerin yetkisiz kişilerce ele geçirildiğini öğrenirsek seni gecikmeden bilgilendiririz.",
      "Bir müşterin bilgileriyle ilgili olarak bize başvurursa başvuruyu sana iletir, yanıtlaman için gereken desteği veririz.",
      "Hesabın kapanınca bu bilgiler Gizlilik politikasında yazan sürelerle silinir; kapatmadan önce Ayarlar'dan yedek indirebilirsin.",
    ],
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
    "On the Solo plan only you use the account. On the Team plan you add your technicians to your team with an invite link; each technician signs in with their own email and password, sees the company's records and writes and edits reports. Deleting reports, company details, templates, the subscription and managing the team stay with you as the owner of the account.",
    "You don't share your password with anyone. A technician you remove from the team loses access to the company's records at once; the reports they wrote stay with the company.",
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
    "You are responsible for the accuracy of what you write in reports. Only the customer signs the customer sign-off section.",
  ]],
  ["Personal data: your role and ours", [
    "For the customer details you enter in Fixnote (name, phone, address, photos, signature), you are the data controller under KVKK (Turkey's Personal Data Protection Law). We are the data processor that processes this information only on your behalf and to provide the service. This section sets out our obligations to each other.",
    [
      "Informing your customers under KVKK, obtaining their explicit consent where required and answering their requests are your obligations.",
      "We process this information only to provide the service and on your instructions; we do not use it for any other purpose, sell it or use it for advertising.",
      "We limit access to the people and systems needed to run the service, keep them bound by confidentiality, and take appropriate technical and organisational measures to protect the data.",
      "We work with infrastructure providers to run the service (Supabase: database and file storage, Germany; Vercel: serving the site; Google: only for Google sign-in). If we change this list, we announce it in the Privacy policy.",
      "If we learn that the information has been obtained by unauthorised persons, we will inform you without delay.",
      "If one of your customers contacts us about their data, we pass the request to you and give you the support you need to answer it.",
      "When your account is closed, this information is deleted within the periods set out in the Privacy policy; you can download a backup from Settings before closing it.",
    ],
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
          tarih: "18 Ekim 2026",
          giris: "Fixnote'a hesap açarak ya da Fixnote'u kullanarak bu koşulları kabul etmiş olursun. Kişisel verilerinle ilgili ayrıntılar Gizlilik politikası sayfasındadır.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Terms of use",
          tarih: "18 October 2026",
          giris: "By opening a Fixnote account or using Fixnote, you accept these terms. Details about your personal data are on the Privacy policy page.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
