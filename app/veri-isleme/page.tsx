import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA } from "../components/supabase";

export const metadata: Metadata = {
  title: "Veri işleme sözleşmesi · Fixnote",
  description: "Fixnote'a girdiğin müşteri bilgileri için senin (veri sorumlusu) ve Fixnote'un (veri işleyen) yükümlülükleri.",
};

// Data processing agreement between the business (controller of its customers' details) and
// Motiq Automation Ltd (processor). Part of the Terms of use (app/kosullar). Draft: not yet reviewed
// by a lawyer. Keep the provider list in line with app/gizlilik and app/kosullar.
const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
  ["Taraflar ve kapsam", [
    "Bu sözleşme, Fixnote'u kullanan firma (\"sen\", veri sorumlusu) ile Motiq Automation Ltd (\"biz\", veri işleyen; şirket no 17303276, 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, Birleşik Krallık) arasındadır.",
    "Fixnote'a girdiğin müşteri bilgilerinin işlenmesini düzenler. Kullanım koşullarının bir parçasıdır; Fixnote'u kullanarak ve abone olurken onay kutusunu işaretleyerek kabul edersin. Hesabın açık olduğu sürece geçerlidir. Kendi hesap bilgilerin için Gizlilik politikası geçerlidir.",
    "Bu sözleşme 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) 12. maddesi ve Birleşik Krallık veri koruma mevzuatı (UK GDPR madde 28) kapsamındaki veri işleyen yükümlülüklerimizi karşılamak için hazırlanmıştır.",
  ]],
  ["İşlemenin konusu, amacı ve süresi", [[
    "Konu: servis raporlarının ve müşteri kayıtlarının saklanması, senin ve ekibinin cihazlarında gösterilmesi, A4 rapor ve PDF hazırlanması, yedek dosyası oluşturulması.",
    "Amaç: yalnızca Fixnote hizmetinin sana sunulması.",
    "Süre: hesabın açık olduğu süre ve sonrasında 9. bölümdeki silme süreleri.",
  ]]],
  ["Veri türleri ve ilgili kişiler", [[
    "İlgili kişiler: müşterilerin ve onların adına imza atan kişiler.",
    "Veri türleri: ad soyad ya da unvan, telefon, adres, cihaz bilgileri (tür, marka, model, seri no), servis bilgileri (arıza, yapılan iş, parça, ücret, ödeme şekli, sonraki bakım), önce ve sonra fotoğrafları, müşteri imzası.",
    "Özel nitelikli kişisel veri (sağlık, biyometrik veri gibi) işlenmesi amaçlanmaz. Raporlara ya da fotoğraflara bu tür veri girmemen gerekir.",
  ]]],
  ["Talimat", [
    "Bu bilgileri yalnızca senin talimatınla işleriz. Fixnote'u kullanman (kayıt eklemen, değiştirmen, silmen, yedek indirmen) talimatındır. Bilgileri başka bir amaçla kullanmayız, satmayız, reklam için kullanmayız ve kendi amaçlarımız için analiz etmeyiz.",
    "Bir talimatının hukuka aykırı olduğunu düşünürsek bunu sana bildiririz.",
  ]],
  ["Gizlilik ve erişim", [
    "Bilgilere yalnızca hizmetin çalışması için gereken kişiler ve sistemler erişebilir. Biz kayıtlarına yalnızca sen destek istediğinde ya da yasal bir zorunluluk olduğunda bakarız. Erişimi olan herkes gizlilik yükümlülüğüne tabidir.",
  ]],
  ["Güvenlik önlemleri", [
    "Bilgileri korumak için şu teknik ve idari önlemleri alırız:",
    [
      "Site ile sunucular arasındaki bütün bağlantılar şifrelidir (HTTPS).",
      "Veritabanında her firma hesabı yalnızca kendi kayıtlarını görebilir; bu kural sunucu tarafında uygulanır ve gerçek veritabanında geçici hesaplarla test edilir.",
      "Fotoğraflar ve imzalar herkese açık olmayan bir depoda tutulur; yalnızca hesaba giriş yapmış kişiler kısa süreli bağlantılarla görebilir.",
      "Veriler altyapı sağlayıcımızın sunucularında şifreli durur; şifreler geri çözülemeyecek biçimde saklanır.",
      "Veritabanının günlük yedeği alınır ve 7 gün saklanır.",
      "Ekip üyeleri rapor silemez; silme yalnızca firma sahibindedir.",
      "Yazılı bir veri ihlali prosedürümüz vardır.",
    ],
  ]],
  ["Alt işleyenler", [
    "Hizmeti sunmak için şu sağlayıcılarla çalışırız. Bu sözleşmeyi kabul ederek onları kullanmamıza izin vermiş olursun:",
    [
      "Supabase (sözleşme tarafı Supabase Pte. Ltd, Singapur): veritabanı, giriş ve dosya depolama. Müşteri bilgileri Almanya'daki (Frankfurt) sunucularda saklanır. Müşteri bilgilerini işleyen tek alt işleyendir.",
      "Vercel: sitenin sunulması (ABD). Müşteri bilgilerini saklamaz; uygulama bilgileri tarayıcından doğrudan Supabase'e gönderir.",
      "Google (yalnızca Google ile girişte) ve Stripe (yalnızca abonelik ödemesi) müşteri bilgilerine erişmez.",
    ],
    "Alt işleyenlerle, bu sözleşmedeki yükümlülüklerden daha az koruyucu olmayan sözleşmeler yaparız. Müşteri bilgilerini işleyecek yeni bir alt işleyen eklersek ya da değiştirirsek, en az 30 gün önce bu sayfada duyurur ve kayıtlı e-posta adresine yazarız. İtiraz edersen ve uzlaşamazsak, değişiklik yürürlüğe girmeden hesabını kapatabilirsin.",
  ]],
  ["Yurt dışına aktarım", [
    "Şirketimiz Birleşik Krallık'tadır, müşteri bilgileri Almanya'da saklanır ve bazı altyapı hizmetleri ABD'dedir. Bu nedenle Türkiye'den girilen bilgiler yurt dışına aktarılır.",
    "Bu aktarımın KVKK'nın 9. maddesinde ve Birleşik Krallık mevzuatında öngörülen güvencelerle yapılması için seninle birlikte çalışırız. Gerektiğinde Kişisel Verileri Koruma Kurulu'nun ilan ettiği standart sözleşmeyi seninle imzalar ve bildirim için gereken bilgileri veririz. Alt işleyenlerimizle olan aktarımlar, onların veri işleme sözleşmelerindeki güvencelere dayanır.",
  ]],
  ["Hesabın kapanması: silme ve iade", [[
    "Hesabını kapatmadan önce Ayarlar'dan bütün kayıtlarını fotoğraf ve imzalarıyla birlikte yedek dosyası olarak indirebilirsin (iade).",
    "Ayarlar > Hesabımı sil ile ya da bize yazarak hesabını kapattığında müşteri bilgileri hemen silinir; altyapı sağlayıcımızın yedeklerinden silinmesi en geç 7 gün içinde tamamlanır.",
    "Tek tek sildiğin raporlar, fotoğrafları ve imzalarıyla birlikte hemen silinir.",
  ]]],
  ["Veri ihlali", [
    "Müşteri bilgilerinin yetkisiz kişilerce ele geçirildiğini, kaybolduğunu ya da değiştirildiğini öğrenirsek seni gecikmeden ve en geç 48 saat içinde kayıtlı e-posta adresinden bilgilendiririz. Bildirimde, o anda bildiğimiz kadarıyla ne olduğunu, hangi bilgilerin ve yaklaşık kaç kaydın etkilendiğini, aldığımız önlemleri ve iletişim bilgimizi yazarız; yeni bilgi öğrendikçe tamamlarız. Kurul'a ve müşterilerine yapacağın bildirimler için gereken desteği veririz.",
  ]],
  ["Başvurular ve destek", [
    "Bir müşterin bilgileriyle ilgili olarak bize başvurursa başvuruyu sana iletiriz ve yanıtlaman için gereken desteği veririz. Bilgileri uygulamada kendin düzeltebilir, silebilir ve dışa aktarabilirsin.",
    "Bu sözleşmeye uyduğumuzu göstermek için makul taleplerini yazılı olarak yanıtlarız. Kişisel veri etki değerlendirmesi ya da yetkili bir kurumun sorusu gibi durumlarda elimizdeki bilgileri veririz.",
  ]],
  ["Senin yükümlülüklerin", [[
    "Müşterilerini bilgilendirmek (aydınlatmak), gereken durumlarda açık rızalarını almak ve başvurularını yanıtlamak senin yükümlülüğündür.",
    "Fixnote'a yalnızca servis için gereken bilgileri girersin.",
    "Ekibine katılan teknisyenlerin bilgileri bu sözleşmeye uygun kullanmasından sen sorumlusun; ayrılan bir teknisyeni ekipten çıkarırsın.",
  ]]],
  ["Sorumluluk ve öncelik", [
    "Sorumluluğun sınırı Kullanım koşullarındaki gibidir; kanunun sınırlanmasına izin vermediği sorumluluklar saklıdır. Bu sözleşme ile Kullanım koşulları arasında müşteri bilgileri konusunda bir fark olursa bu sözleşme uygulanır.",
  ]],
  ["İletişim", [
    `Bu sözleşmeyle ilgili her soru ve bildirim için: ${E}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Parties and scope", [
    "This agreement is between the business using Fixnote (\"you\", the data controller) and Motiq Automation Ltd (\"we\", the data processor; company number 17303276, 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom).",
    "It governs the processing of the customer details you enter in Fixnote. It forms part of the Terms of use; you accept it by using Fixnote and by ticking the box when you subscribe. It applies while your account is open. The Privacy policy covers your own account details.",
    "This agreement is made to meet our obligations as a data processor under Article 12 of Turkey's Personal Data Protection Law No. 6698 (KVKK) and UK data protection law (UK GDPR Article 28).",
  ]],
  ["Subject, purpose and duration", [[
    "Subject: storing service reports and customer records, showing them on your and your team's devices, preparing the A4 report and PDF, and creating backup files.",
    "Purpose: only to provide the Fixnote service to you.",
    "Duration: while your account is open, then the deletion periods in section 9.",
  ]]],
  ["Types of data and data subjects", [[
    "Data subjects: your customers and the people who sign on their behalf.",
    "Types of data: name or company name, phone, address, appliance details (type, make, model, serial number), service details (fault, work done, parts, price, payment method, next service), before and after photos, customer signature.",
    "Special category data (such as health or biometric data) is not intended to be processed. You must not enter such data in reports or photos.",
  ]]],
  ["Instructions", [
    "We process this information only on your instructions. Using Fixnote (adding, changing or deleting records, downloading backups) is your instruction. We do not use the information for any other purpose, sell it, use it for advertising or analyse it for our own purposes.",
    "If we believe an instruction of yours is unlawful, we will tell you.",
  ]],
  ["Confidentiality and access", [
    "Only the people and systems needed to run the service can access the information. We look at your records only when you ask for support or when the law requires it. Everyone with access is bound by confidentiality.",
  ]],
  ["Security measures", [
    "We take these technical and organisational measures to protect the information:",
    [
      "All connections between the site and the servers are encrypted (HTTPS).",
      "In the database each company account can see only its own records; this rule is enforced on the server and tested on the real database with throwaway accounts.",
      "Photos and signatures are kept in a storage area that is not public; only signed-in users can see them through short-lived links.",
      "Data is encrypted at rest on our infrastructure provider's servers; passwords are stored in a form that cannot be reversed.",
      "The database is backed up daily and backups are kept for 7 days.",
      "Team members cannot delete reports; deletion is reserved to the company owner.",
      "We have a written data breach procedure.",
    ],
  ]],
  ["Sub-processors", [
    "We work with these providers to run the service. By accepting this agreement you authorise us to use them:",
    [
      "Supabase (contracting party Supabase Pte. Ltd, Singapore): database, sign-in and file storage. Customer details are stored on servers in Germany (Frankfurt). It is the only sub-processor that processes customer details.",
      "Vercel: serving the site (USA). It does not store customer details; the app sends them from your browser directly to Supabase.",
      "Google (only for Google sign-in) and Stripe (only for subscription payments) have no access to customer details.",
    ],
    "We bind our sub-processors by contracts no less protective than this agreement. If we add or replace a sub-processor that will process customer details, we will announce it on this page and email your registered address at least 30 days in advance. If you object and we cannot agree, you may close your account before the change takes effect.",
  ]],
  ["Transfers abroad", [
    "Our company is in the United Kingdom, customer details are stored in Germany and some infrastructure services are in the USA. Information entered from Turkey is therefore transferred abroad.",
    "We will work with you so that this transfer is made with the safeguards required by Article 9 of KVKK and by UK law. Where needed, we will sign the standard contract published by Turkey's Personal Data Protection Board with you and provide the information needed for the notification. Transfers to our sub-processors rely on the safeguards in their data processing agreements.",
  ]],
  ["Closing your account: deletion and return", [[
    "Before closing your account you can download all your records, with photos and signatures, as a backup file from Settings (return).",
    "When you close your account with Settings > Delete my account or by writing to us, customer details are deleted at once; deletion from our infrastructure provider's backups is completed within 7 days at most.",
    "Reports you delete one by one are deleted at once, together with their photos and signatures.",
  ]]],
  ["Data breaches", [
    "If we learn that customer details have been obtained by unauthorised persons, lost or altered, we will inform you without undue delay and within 48 hours at the latest, at your registered email address. The notice will say, as far as we know at the time, what happened, which information and roughly how many records were affected, what we have done and how to contact us; we will add to it as we learn more. We will give you the support you need for your notifications to the authorities and to your customers.",
  ]],
  ["Requests and assistance", [
    "If one of your customers contacts us about their data, we pass the request to you and give you the support you need to answer it. You can correct, delete and export the information yourself in the app.",
    "We will answer your reasonable written requests to show that we comply with this agreement. Where needed, for example for a data protection impact assessment or a question from an authority, we will provide the information we have.",
  ]],
  ["Your obligations", [[
    "Informing your customers, obtaining their explicit consent where required and answering their requests are your obligations.",
    "You enter in Fixnote only the information needed for the service.",
    "You are responsible for the technicians who join your team using the information in line with this agreement; you remove a technician who leaves.",
  ]]],
  ["Liability and precedence", [
    "Liability is limited as in the Terms of use, except for liability that the law does not allow to be limited. If this agreement and the Terms of use differ on customer details, this agreement applies.",
  ]],
  ["Contact", [
    `For any question or notice about this agreement: ${E}`,
  ]],
];

export default function VeriIsleme() {
  return (
    <YasalSayfa
      metin={{
        tr: {
          baslik: "Veri işleme sözleşmesi",
          tarih: "19 Ekim 2026",
          giris: "Fixnote'a girdiğin müşteri bilgilerinin sorumlusu sensin; biz bu bilgileri yalnızca senin adına saklar ve işleriz. Bu sözleşme ikimizin yükümlülüklerini anlatır ve Kullanım koşullarının parçasıdır.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Data processing agreement",
          tarih: "19 October 2026",
          giris: "You are responsible for the customer details you enter in Fixnote; we only store and process them on your behalf. This agreement sets out our obligations to each other and forms part of the Terms of use.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
