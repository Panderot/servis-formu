import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA } from "../components/supabase";

export const metadata: Metadata = {
  title: "Gizlilik politikası · Fixnote",
  description: "Fixnote'ta hangi kişisel verilerin işlendiği, nerede saklandığı ve hakların.",
};

const E = ABONELIK_EPOSTA;
const ADRES_TR = "71-75 Shelton Street, Covent Garden, London WC2H 9JQ, Birleşik Krallık";
const ADRES_EN = "71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom";

const BOLUMLER: Bolum[] = [
  ["Veri sorumlusu", [
    "Fixnote'u Motiq Automation Ltd sunar. Kişisel verilerin bakımından veri sorumlusu bu şirkettir:",
    [
      "Motiq Automation Ltd (İngiltere ve Galler'de kayıtlı özel limited şirket)",
      "Şirket numarası: 17303276",
      `Kayıtlı adres: ${ADRES_TR}`,
      `E-posta: ${E}`,
    ],
    "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (KVKK) 10. maddesi uyarınca seni bilgilendirmek için hazırlanmıştır.",
  ]],
  ["Kısaca", [[
    "Servis kayıtların (müşteri bilgileri, raporlar, fotoğraflar, imzalar ve firma bilgilerin) hesabında saklanır: altyapı sağlayıcımız Supabase'in Almanya'daki (Frankfurt) sunucularında.",
    "Bu kayıtları yalnızca hesabına ve Firma paketinde ekibine katılan teknisyenlerin görür. Biz onlara yalnızca sen destek istediğinde ya da yasal bir zorunluluk olduğunda bakarız.",
    "Hesabın için ayrıca e-posta adresin, giriş bilgilerin ve deneme ya da abonelik durumun tutulur.",
    "Verilerini satmayız ve reklam için kullanmayız. Sitede reklam ya da takip çerezi yoktur.",
  ]]],
  ["Hangi verileri işliyoruz", [[
    "Hesap bilgileri: e-posta adresin ve şifren. Şifren açık hâliyle saklanmaz; giriş altyapımız onu geri çözülemeyecek biçimde (hash) tutar.",
    "Google ile giriş: Google ile girmeyi seçersen Google bize adını, e-posta adresini ve profil fotoğrafının bağlantısını iletir. Google hesabının şifresini hiçbir zaman görmeyiz.",
    "Deneme ve abonelik: hesabının oluşturulma tarihi, deneme ya da abonelik bitiş tarihi ve abonelikle ilgili kısa notlar.",
    "Ekip: Firma paketinde bir firmanın ekibine katılırsan e-posta adresin, ekipte görünen adın, katılma tarihin ve hangi raporu ilk senin yazdığın; bu bilgileri firma sahibi görür. Davet bağlantıları 7 gün sonra geçersiz olur.",
    "Teknik kayıtlar: giriş ve güvenlik için altyapı sağlayıcılarımız IP adresi, tarayıcı bilgisi ve giriş zamanı gibi kayıtları sınırlı bir süre tutar.",
    "Servis kayıtları: uygulamaya girdiğin firma bilgileri ve logon, müşteri adları, telefonları ve adresleri, cihaz bilgileri, servis raporları, önce ve sonra fotoğrafları, müşteri imzaları ve kendi şablonların.",
    `Yazışmalar: ${E} adresine yazarsan e-posta adresin ve yazdıkların.`,
  ]]],
  ["Verileri nasıl topluyoruz", [
    "Kişisel verilerin elektronik ortamda ve otomatik yollarla toplanır: hesap açarken ve giriş yaparken girdiğin bilgilerden, Google ile girişi seçersen Google'dan, uygulamayı kullanırken doldurduğun formlardan, eklediğin fotoğraflardan ve aldığın imzalardan, bize yazdığın e-postalardan ve siteyi kullanırken altyapı sağlayıcılarımızın tuttuğu teknik kayıtlardan.",
  ]],
  ["Cihazında tutulanlar", [
    "İnternet yokken kaydettiğin raporlar, bağlantı gelene kadar telefonundaki tarayıcıda bekler; gönderilince hesabına geçer. Listenin hızlı açılması için kayıtlarının bir kopyası da tarayıcıda tutulur.",
    "Ayarlar'dan indirdiğin yedek dosyası senin cihazına iner ve nerede saklanacağına sen karar verirsin.",
    "Raporu WhatsApp ile gönderdiğinde mesaj, senin onayınla WhatsApp'ta açılır; oradan sonrası WhatsApp'ın kendi koşullarına tabidir.",
    "Girişini hatırlamak için tarayıcına bir oturum bilgisi kaydedilir. \"Beni hatırla\" işaretli değilse bu bilgi sekme kapanınca silinir. Dil seçimin ve bu tercihin de tarayıcında saklanır. Bunlar reklam ya da takip çerezi değildir.",
  ]],
  ["Neden işliyoruz ve hukuki sebepler", [
    "Kişisel verilerini KVKK'ya uygun olarak, şu amaçlar ve hukuki sebeplerle işleriz:",
    [
      "Hesabını açmak, girişini sağlamak, servis kayıtlarını saklayıp cihazlarında göstermek ve deneme ya da abonelik durumunu kontrol etmek: sözleşmenin kurulması ve ifası için gerekli olması (KVKK m. 5/2-c).",
      "Hizmetin güvenliğini sağlamak ve kötüye kullanımı önlemek: meşru menfaatimiz (KVKK m. 5/2-f).",
      "Sorularını yanıtlamak ve abonelik işlemlerini yürütmek: sözleşmenin ifası ve meşru menfaatimiz.",
      "Yasal yükümlülüklerimizi yerine getirmek: kanunlarda açıkça öngörülmesi ve hukuki yükümlülük (KVKK m. 5/2-a ve 5/2-ç).",
    ],
  ]],
  ["Kimlerle paylaşıyoruz ve yurt dışına aktarım", [
    "Verilerini satmayız. Hizmeti sunmak için şu sağlayıcılarla çalışırız; bu sağlayıcılar verileri yalnızca hizmeti sunmak için ve bizim adımıza işler:",
    [
      "Supabase: hesap, giriş ve servis kayıtlarının (fotoğraflar ve imzalar dahil) saklandığı altyapı. Sunucular Almanya'da (Frankfurt) bulunur.",
      "Vercel: sitenin barındırılması ve sunulması. Merkezi ABD'dedir; site dünya genelindeki sunucularından sunulur.",
      "Google: yalnızca Google ile girişi seçersen, girişin için. Merkezi ABD'dedir.",
    ],
    "Bu sağlayıcıların sunucuları Türkiye dışında olduğu için hesap bilgilerin, servis kayıtların ve teknik kayıtlar yurt dışına aktarılır. Aktarımın amacı hizmetin barındırılması, sunulması ve girişin sağlanmasıdır.",
    "Yasal bir zorunluluk olursa bilgilerini yetkili kurum ve kuruluşlarla da paylaşabiliriz.",
  ]],
  ["Ne kadar saklıyoruz", [
    "Hesap bilgilerin ve servis kayıtların hesabın açık olduğu sürece saklanır. Deneme ya da abonelik bitince kayıtların silinmez; abonelik açılınca kaldığın yerden devam edersin.",
    "Bir raporu sildiğinde fotoğrafları ve imzası da silinir. Hesabının silinmesini istersen, kanunen saklamamız gereken kayıtlar dışında hesap bilgilerin ve servis kayıtların silinir. Altyapı sağlayıcımızın yedeklerinden tamamen silinmesi birkaç gün sürebilir.",
    "Teknik kayıtlar sağlayıcıların belirlediği sınırlı sürelerle tutulur.",
  ]],
  ["Verilerin güvenliği", [
    "Verilerini korumak için şu önlemleri alırız:",
    [
      "Site ile sunucular arasındaki bütün bağlantılar şifrelidir (HTTPS).",
      "Veritabanında her hesap yalnızca kendi kayıtlarını görebilir; fotoğraflar ve imzalar herkese açık olmayan bir depoda tutulur.",
      "Şifreler geri çözülemeyecek biçimde saklanır; veriler altyapı sağlayıcımızın sunucularında şifreli durur.",
      "Kayıtlara yalnızca hizmetin çalışması için gereken kişiler ve sistemler erişebilir.",
    ],
    "Kişisel verilerin yetkisiz kişilerce ele geçirildiğini öğrenirsek bunu en kısa sürede sana ve Kişisel Verileri Koruma Kurulu'na bildiririz.",
  ]],
  ["Hakların", [
    "KVKK'nın 11. maddesi uyarınca şu haklara sahipsin:",
    [
      "Kişisel verilerinin işlenip işlenmediğini öğrenmek ve işlendiyse bilgi istemek",
      "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenmek",
      "Yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilmek",
      "Eksik ya da yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini ya da yok edilmesini istemek, bu işlemlerin verilerin aktarıldığı üçüncü kişilere bildirilmesini istemek",
      "Otomatik sistemlerle analiz edilmesi sonucu aleyhine çıkan bir sonuca itiraz etmek",
      "Kanuna aykırı işleme yüzünden zarara uğrarsan zararın giderilmesini istemek",
    ],
    `Başvurunu, Fixnote hesabında kayıtlı e-posta adresinden ${E} adresine yazarak ya da ${ADRES_TR} adresine yazılı olarak yapabilirsin. Başvurunda adını soyadını, iletişim bilgilerini ve talebini açıkça yaz; kimliğini doğrulamak için ek bilgi isteyebiliriz.`,
    "Başvurunu en geç 30 gün içinde ücretsiz sonuçlandırırız. İşlem ayrıca bir maliyet gerektirirse Kişisel Verileri Koruma Kurulu'nun belirlediği tarifedeki ücreti isteyebiliriz.",
    "Başvurun reddedilirse, cevabımızı yetersiz bulursan ya da süresinde cevap vermezsek, cevabımızı öğrendiğin tarihten itibaren 30 gün ve her hâlde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu'na şikâyette bulunabilirsin.",
  ]],
  ["Müşterilerinin bilgileri", [
    "Raporlara yazdığın müşteri bilgileri (ad, telefon, adres, fotoğraf, imza) senin işinle ilgili bilgilerdir. Bu bilgiler için veri sorumlusu sensin; biz onları yalnızca senin adına, senin talimatınla ve hizmeti sunmak için işleyen \"veri işleyen\"iz.",
    "Müşterilerini KVKK'ya göre bilgilendirmek (aydınlatmak) ve gereken durumlarda açık rızalarını almak senin yükümlülüğündür.",
    "Bir müşterin bilgileriyle ilgili olarak bize başvurursa, başvuruyu sana iletiriz ve senin talimatına göre yardımcı oluruz.",
  ]],
  ["Birleşik Krallık mevzuatı", [
    "Şirketimiz Birleşik Krallık'ta kurulu olduğu için kişisel verilerin ayrıca Birleşik Krallık veri koruma mevzuatına (UK GDPR ve 2018 tarihli Data Protection Act) göre de korunur. Bu mevzuattan doğan hakların için de bize yazabilir, Birleşik Krallık'ın veri koruma otoritesi ICO'ya (Information Commissioner's Office) şikâyette bulunabilirsin.",
  ]],
  ["Çocuklar", [
    "Fixnote işletmeler için tasarlanmıştır; 18 yaşından küçüklerin hesap açmasını amaçlamaz ve onlardan bilerek kişisel veri toplamayız.",
  ]],
  ["Değişiklikler", [
    "Bu politikayı güncellersek bu sayfadaki tarihi değiştiririz. Önemli değişiklikleri ayrıca duyururuz.",
  ]],
  ["İletişim", [
    `Bu politikayla ilgili her soru ve başvurun için: ${E}`,
    `Posta adresi: Motiq Automation Ltd, ${ADRES_TR}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Data controller", [
    "Fixnote is provided by Motiq Automation Ltd, which is the data controller for your personal data:",
    [
      "Motiq Automation Ltd (a private limited company registered in England and Wales)",
      "Company number: 17303276",
      `Registered office: ${ADRES_EN}`,
      `Email: ${E}`,
    ],
    "This text is provided to inform you under Article 10 of Turkey's Personal Data Protection Law No. 6698 (KVKK).",
  ]],
  ["In short", [[
    "Your service records (customer details, reports, photos, signatures and your company details) are stored in your account: on the servers of our infrastructure provider Supabase in Germany (Frankfurt).",
    "Only people who sign in to your account, and on the Team plan the technicians who join your team, can see these records. We look at them only when you ask for support or when the law requires it.",
    "For your account we also keep your email address, your sign-in details and your trial or subscription status.",
    "We don't sell your data or use it for advertising. The site has no advertising or tracking cookies.",
  ]]],
  ["What data we process", [[
    "Account details: your email address and password. Your password is not stored in plain form; our sign-in infrastructure keeps it in a form that cannot be reversed (a hash).",
    "Google sign-in: if you choose to sign in with Google, Google sends us your name, email address and a link to your profile photo. We never see your Google password.",
    "Trial and subscription: the date your account was created, the end date of your trial or subscription and short notes about the subscription.",
    "Team: if you join a company's team on the Team plan, your email address, the name shown in the team, the date you joined and which reports you first wrote; the owner of the company account can see this. Invite links stop working after 7 days.",
    "Technical logs: for sign-in and security, our infrastructure providers keep records such as IP address, browser details and sign-in time for a limited period.",
    "Service records: the company details and logo you enter in the app, customer names, phone numbers and addresses, appliance details, service reports, before and after photos, customer signatures and your own templates.",
    `Correspondence: if you write to ${E}, your email address and what you write.`,
  ]]],
  ["How we collect data", [
    "Your personal data is collected electronically and by automated means: from what you enter when you create an account and sign in, from Google if you choose Google sign-in, from the forms you fill in, the photos you add and the signatures you take in the app, from the emails you send us, and from the technical logs our infrastructure providers keep while you use the site.",
  ]],
  ["What is kept on your device", [
    "Reports you save without internet wait in your phone's browser until it is back online; once sent they move to your account. A copy of your records is also kept in the browser so the list opens quickly.",
    "A backup file you download from Settings is saved to your device, and you decide where to keep it.",
    "When you send a report on WhatsApp, the message opens in WhatsApp with your approval; from there on WhatsApp's own terms apply.",
    "A session token is saved in your browser to remember your sign-in. If \"Remember me\" is not ticked, it is deleted when the tab is closed. Your language choice and this preference are also kept in your browser. None of these are advertising or tracking cookies.",
  ]],
  ["Why we process it and legal grounds", [
    "We process your personal data in line with KVKK, for these purposes and on these legal grounds:",
    [
      "Opening your account, signing you in, storing your service records and showing them on your devices, and checking your trial or subscription status: necessary to set up and perform the contract (KVKK art. 5/2-c).",
      "Keeping the service secure and preventing misuse: our legitimate interest (KVKK art. 5/2-f).",
      "Answering your questions and handling subscriptions: performance of the contract and our legitimate interest.",
      "Meeting our legal obligations: expressly provided for by law and a legal obligation (KVKK art. 5/2-a and 5/2-ç).",
    ],
  ]],
  ["Who we share it with and transfers abroad", [
    "We don't sell your data. We work with these providers to run the service; they process data only to provide the service and on our behalf:",
    [
      "Supabase: the infrastructure where accounts, sign-in and service records (including photos and signatures) are stored. The servers are in Germany (Frankfurt).",
      "Vercel: hosting and serving the site. Headquartered in the USA; the site is served from its servers around the world.",
      "Google: only if you choose Google sign-in, to sign you in. Headquartered in the USA.",
    ],
    "Because these providers' servers are outside Turkey, your account details, service records and technical logs are transferred abroad. The purpose of the transfer is hosting and serving the service and signing you in.",
    "If the law requires it, we may also share your information with the competent authorities.",
  ]],
  ["How long we keep it", [
    "Your account details and service records are kept while your account is open. When a trial or subscription ends your records are not deleted; once a subscription is active you carry on where you left off.",
    "When you delete a report, its photos and signature are deleted too. If you ask for your account to be deleted, your account details and service records are deleted, except for records we must keep by law. Full deletion from our infrastructure provider's backups may take a few days.",
    "Technical logs are kept for the limited periods set by the providers.",
  ]],
  ["Keeping data secure", [
    "We take these measures to protect your data:",
    [
      "All connections between the site and the servers are encrypted (HTTPS).",
      "In the database each account can see only its own records; photos and signatures are kept in storage that is not public.",
      "Passwords are stored in a form that cannot be reversed; data is encrypted at rest on our infrastructure provider's servers.",
      "Only the people and systems needed to run the service can access records.",
    ],
    "If we learn that your personal data has been obtained by unauthorised persons, we will notify you and Turkey's Personal Data Protection Board as soon as possible.",
  ]],
  ["Your rights", [
    "Under Article 11 of KVKK you have the right to:",
    [
      "Find out whether your personal data is processed and, if so, request information about it",
      "Find out the purpose of processing and whether it is used for that purpose",
      "Know the third parties in Turkey or abroad to whom it is transferred",
      "Ask for it to be corrected if incomplete or wrong, deleted or destroyed where the conditions are met, and for these actions to be notified to the third parties it was transferred to",
      "Object to an outcome against you that results from analysis by automated systems",
      "Claim compensation if you suffer damage because of unlawful processing",
    ],
    `You can make a request by writing to ${E} from the email address registered in your Fixnote account, or in writing to ${ADRES_EN}. Include your name, your contact details and a clear description of your request; we may ask for more information to verify your identity.`,
    "We respond to your request free of charge within 30 days at the latest. If the action requires an additional cost, we may charge the fee set by Turkey's Personal Data Protection Board.",
    "If your request is refused, you find our answer insufficient or we do not answer in time, you can complain to Turkey's Personal Data Protection Board within 30 days of learning our answer and in any case within 60 days of your request.",
  ]],
  ["Your customers' details", [
    "The customer details you write in reports (name, phone, address, photos, signature) relate to your business. You are the data controller for this information; we are the \"data processor\" that processes it only on your behalf, on your instructions and to provide the service.",
    "Informing your customers under KVKK and obtaining their explicit consent where required are your obligations.",
    "If one of your customers contacts us about their data, we pass the request to you and help according to your instructions.",
  ]],
  ["UK law", [
    "Because our company is established in the United Kingdom, your personal data is also protected under UK data protection law (the UK GDPR and the Data Protection Act 2018). You can write to us about your rights under this law too, and you can complain to the UK's data protection authority, the ICO (Information Commissioner's Office).",
  ]],
  ["Children", [
    "Fixnote is designed for businesses; it is not intended for people under 18 to open accounts, and we do not knowingly collect personal data from them.",
  ]],
  ["Changes", [
    "If we update this policy, we change the date on this page. We announce important changes separately.",
  ]],
  ["Contact", [
    `For any question or request about this policy: ${E}`,
    `Postal address: Motiq Automation Ltd, ${ADRES_EN}`,
  ]],
];

export default function Gizlilik() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Gizlilik politikası",
          tarih: "18 Ekim 2026",
          giris: "Bu sayfa, Fixnote'u kullanırken hangi kişisel verilerinin işlendiğini, nerede saklandığını ve hangi haklara sahip olduğunu anlatır. Kısaca: servis kayıtların hesabında, Almanya'daki sunucularda saklanır ve yalnızca hesabına giriş yapanlar görür.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Privacy policy",
          tarih: "18 October 2026",
          giris: "This page explains which personal data is processed when you use Fixnote, where it is stored and what rights you have. In short: your service records are stored in your account, on servers in Germany, and only people who sign in to your account can see them.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
