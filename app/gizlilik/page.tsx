import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA } from "../components/supabase";

export const metadata: Metadata = {
  title: "Gizlilik politikası · Fixnote",
  description: "Fixnote'ta hangi kişisel verilerin işlendiği, nerede saklandığı ve hakların.",
};

const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
  ["Veri sorumlusu", [
    "Fixnote'u Motiq Automation Ltd sunar. Kişisel verilerin bakımından veri sorumlusu bu şirkettir:",
    [
    "Motiq Automation Ltd (İngiltere ve Galler'de kayıtlı özel limited şirket)",
    "Şirket numarası: 17303276",
    "Kayıtlı adres: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, Birleşik Krallık",
    `E-posta: ${E}`,
    ],
  ]],
  ["Kısaca", [[
    "Servis kayıtların (müşteri bilgileri, raporlar, fotoğraflar, imzalar ve firma bilgilerin) hesabında saklanır: altyapı sağlayıcımız Supabase'in Almanya'daki (Frankfurt) sunucularında.",
    "Bu kayıtları yalnızca hesabına giriş yapanlar görür. Biz onlara yalnızca sen destek istediğinde ya da yasal bir zorunluluk olduğunda bakarız.",
    "Hesabın için ayrıca e-posta adresin, giriş bilgilerin ve deneme ya da abonelik durumun tutulur.",
    "Verilerini satmayız ve reklam için kullanmayız. Sitede reklam ya da takip çerezi yoktur.",
  ]]],
  ["Hangi verileri işliyoruz", [[
    "Hesap bilgileri: e-posta adresin ve şifren. Şifren açık hâliyle saklanmaz; giriş altyapımız onu geri çözülemeyecek biçimde (hash) tutar.",
    "Google ile giriş: Google ile girmeyi seçersen Google bize adını, e-posta adresini ve profil fotoğrafının bağlantısını iletir. Google hesabının şifresini hiçbir zaman görmeyiz.",
    "Deneme ve abonelik: hesabının oluşturulma tarihi, deneme ya da abonelik bitiş tarihi ve abonelikle ilgili kısa notlar.",
    "Teknik kayıtlar: giriş ve güvenlik için altyapı sağlayıcılarımız IP adresi, tarayıcı bilgisi ve giriş zamanı gibi kayıtları sınırlı bir süre tutar.",
    "Servis kayıtları: uygulamaya girdiğin firma bilgileri ve logon, müşteri adları, telefonları ve adresleri, cihaz bilgileri, servis raporları, önce ve sonra fotoğrafları, müşteri imzaları ve kendi şablonların.",
    `Yazışmalar: ${E} adresine yazarsan e-posta adresin ve yazdıkların.`,
  ]]],
  ["Cihazında tutulanlar", [
    "İnternet yokken kaydettiğin raporlar, bağlantı gelene kadar telefonundaki tarayıcıda bekler; gönderilince hesabına geçer. Listenin hızlı açılması için kayıtlarının bir kopyası da tarayıcıda tutulur.",
    "Ayarlar'dan indirdiğin yedek dosyası senin cihazına iner ve nerede saklanacağına sen karar verirsin.",
    "Raporu WhatsApp ile gönderdiğinde mesaj, senin onayınla WhatsApp'ta açılır; oradan sonrası WhatsApp'ın kendi koşullarına tabidir.",
    "Girişini hatırlamak için tarayıcına bir oturum bilgisi kaydedilir. Bu bir reklam ya da takip çerezi değildir.",
  ]],
  ["Neden işliyoruz", [
    "Kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) uygun olarak, şu amaçlar ve hukuki sebeplerle işleriz:",
    [
      "Hesabını açmak, girişini sağlamak, servis kayıtlarını saklayıp cihazlarında göstermek ve deneme ya da abonelik durumunu kontrol etmek: sözleşmenin kurulması ve ifası için gerekli olması (KVKK m. 5/2-c).",
      "Hizmetin güvenliğini sağlamak ve kötüye kullanımı önlemek: meşru menfaatimiz (KVKK m. 5/2-f).",
      "Sorularını yanıtlamak ve abonelik işlemlerini yürütmek: sözleşmenin ifası ve meşru menfaatimiz.",
      "Yasal yükümlülüklerimizi yerine getirmek: kanunlarda açıkça öngörülmesi ve hukuki yükümlülük (KVKK m. 5/2-a ve 5/2-ç).",
    ],
  ]],
  ["Kimlerle paylaşıyoruz", [
    "Verilerini satmayız. Hizmeti sunmak için şu sağlayıcılarla çalışırız:",
    [
      "Supabase: hesap, giriş ve servis kayıtlarının (fotoğraflar ve imzalar dahil) saklandığı altyapı. Sunucular Almanya'da (Frankfurt) bulunur.",
      "Vercel: sitenin barındırılması ve sunulması.",
      "Google: yalnızca Google ile girişi seçersen, girişin için.",
    ],
    "Bu sağlayıcıların sunucuları Türkiye dışında olduğu için hesap bilgilerin ve servis kayıtların yurt dışında işlenir. Yasal bir zorunluluk olursa bilgilerini yetkili kurumlarla da paylaşabiliriz.",
  ]],
  ["Ne kadar saklıyoruz", [
    "Hesap bilgilerin ve servis kayıtların hesabın açık olduğu sürece saklanır. Deneme ya da abonelik bitince kayıtların silinmez; abonelik açılınca kaldığın yerden devam edersin.",
    "Bir raporu sildiğinde fotoğrafları ve imzası da silinir. Hesabının silinmesini istersen, kanunen saklamamız gereken kayıtlar dışında hesap bilgilerin ve servis kayıtların silinir. Altyapı sağlayıcımızın yedeklerinden tamamen silinmesi birkaç gün sürebilir.",
    "Teknik kayıtlar sağlayıcıların belirlediği sınırlı sürelerle tutulur.",
  ]],
  ["Hakların", [
    "KVKK'nın 11. maddesi uyarınca şu haklara sahipsin:",
    [
      "Kişisel verilerinin işlenip işlenmediğini öğrenmek ve işlendiyse bilgi istemek",
      "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenmek",
      "Yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilmek",
      "Eksik ya da yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini istemek",
      "Otomatik sistemlerle analiz edilmesi sonucu aleyhine çıkan bir sonuca itiraz etmek",
      "Kanuna aykırı işleme yüzünden zarara uğrarsan zararın giderilmesini istemek",
    ],
    `Başvurun için ${E} adresine yaz. Başvurunu en geç 30 gün içinde sonuçlandırırız.`,
  ]],
  ["Müşterilerinin bilgileri", [
    "Raporlara yazdığın müşteri bilgileri senin işinle ilgili bilgilerdir. Bu bilgiler için veri sorumlusu sensin; biz onları yalnızca senin adına ve hizmeti sunmak için saklarız. Müşterini bilgilendirmek gibi KVKK'dan doğan yükümlülükler sana aittir.",
  ]],
  ["Değişiklikler", [
    "Bu politikayı güncellersek bu sayfadaki tarihi değiştiririz. Önemli değişiklikleri ayrıca duyururuz.",
  ]],
  ["İletişim", [
    `Bu politikayla ilgili her soru ve başvurun için: ${E}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Data controller", [
    "Fixnote is provided by Motiq Automation Ltd, which is the data controller for your personal data:",
    [
    "Motiq Automation Ltd (a private limited company registered in England and Wales)",
    "Company number: 17303276",
    "Registered office: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom",
    `Email: ${E}`,
    ],
  ]],
  ["In short", [[
    "Your service records (customer details, reports, photos, signatures and your company details) are stored in your account: on the servers of our infrastructure provider Supabase in Germany (Frankfurt).",
    "Only people who sign in to your account can see these records. We look at them only when you ask for support or when the law requires it.",
    "For your account we also keep your email address, your sign-in details and your trial or subscription status.",
    "We don't sell your data or use it for advertising. The site has no advertising or tracking cookies.",
  ]]],
  ["What data we process", [[
    "Account details: your email address and password. Your password is not stored in plain form; our sign-in infrastructure keeps it in a form that cannot be reversed (a hash).",
    "Google sign-in: if you choose to sign in with Google, Google sends us your name, email address and a link to your profile photo. We never see your Google password.",
    "Trial and subscription: the date your account was created, the end date of your trial or subscription and short notes about the subscription.",
    "Technical logs: for sign-in and security, our infrastructure providers keep records such as IP address, browser details and sign-in time for a limited period.",
    "Service records: the company details and logo you enter in the app, customer names, phone numbers and addresses, appliance details, service reports, before and after photos, customer signatures and your own templates.",
    `Correspondence: if you write to ${E}, your email address and what you write.`,
  ]]],
  ["What is kept on your device", [
    "Reports you save without internet wait in your phone's browser until it is back online; once sent they move to your account. A copy of your records is also kept in the browser so the list opens quickly.",
    "A backup file you download from Settings is saved to your device, and you decide where to keep it.",
    "When you send a report on WhatsApp, the message opens in WhatsApp with your approval; from there on WhatsApp's own terms apply.",
    "A session token is saved in your browser to remember your sign-in. It is not an advertising or tracking cookie.",
  ]],
  ["Why we process it", [
    "We process your personal data in line with Turkey's Personal Data Protection Law No. 6698 (KVKK), for these purposes and on these legal grounds:",
    [
      "Opening your account, signing you in, storing your service records and showing them on your devices, and checking your trial or subscription status: necessary to set up and perform the contract (KVKK art. 5/2-c).",
      "Keeping the service secure and preventing misuse: our legitimate interest (KVKK art. 5/2-f).",
      "Answering your questions and handling subscriptions: performance of the contract and our legitimate interest.",
      "Meeting our legal obligations: expressly provided for by law and a legal obligation (KVKK art. 5/2-a and 5/2-ç).",
    ],
  ]],
  ["Who we share it with", [
    "We don't sell your data. We work with these providers to run the service:",
    [
      "Supabase: the infrastructure where accounts, sign-in and service records (including photos and signatures) are stored. The servers are in Germany (Frankfurt).",
      "Vercel: hosting and serving the site.",
      "Google: only if you choose Google sign-in, to sign you in.",
    ],
    "Because these providers' servers are outside Turkey, your account details and service records are processed abroad. If the law requires it, we may also share your information with the competent authorities.",
  ]],
  ["How long we keep it", [
    "Your account details and service records are kept while your account is open. When a trial or subscription ends your records are not deleted; once a subscription is active you carry on where you left off.",
    "When you delete a report, its photos and signature are deleted too. If you ask for your account to be deleted, your account details and service records are deleted, except for records we must keep by law. Full deletion from our infrastructure provider's backups may take a few days.",
    "Technical logs are kept for the limited periods set by the providers.",
  ]],
  ["Your rights", [
    "Under Article 11 of KVKK you have the right to:",
    [
      "Find out whether your personal data is processed and, if so, request information about it",
      "Find out the purpose of processing and whether it is used for that purpose",
      "Know the third parties in Turkey or abroad to whom it is transferred",
      "Ask for it to be corrected if incomplete or wrong, and deleted where the conditions are met",
      "Object to an outcome against you that results from analysis by automated systems",
      "Claim compensation if you suffer damage because of unlawful processing",
    ],
    `To make a request, write to ${E}. We respond within 30 days at the latest.`,
  ]],
  ["Your customers' details", [
    "The customer details you write in reports relate to your business. You are the data controller for this information; we store it only on your behalf and to provide the service. Obligations under data protection law, such as informing your customers, are yours.",
  ]],
  ["Changes", [
    "If we update this policy, we change the date on this page. We announce important changes separately.",
  ]],
  ["Contact", [
    `For any question or request about this policy: ${E}`,
  ]],
];

export default function Gizlilik() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Gizlilik politikası",
          tarih: "17 Ekim 2026",
          giris: "Bu sayfa, Fixnote'u kullanırken hangi kişisel verilerinin işlendiğini, nerede saklandığını ve hangi haklara sahip olduğunu anlatır. Kısaca: servis kayıtların hesabında, Almanya'daki sunucularda saklanır ve yalnızca hesabına giriş yapanlar görür.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Privacy policy",
          tarih: "17 October 2026",
          giris: "This page explains which personal data is processed when you use Fixnote, where it is stored and what rights you have. In short: your service records are stored in your account, on servers in Germany, and only people who sign in to your account can see them.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
