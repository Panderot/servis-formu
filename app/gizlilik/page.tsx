import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA } from "../components/supabase";

export const metadata: Metadata = {
  title: "Gizlilik politikası · Fixnote",
  description: "Fixnote'ta hangi kişisel verilerin işlendiği, nerede saklandığı ve hakların.",
};

// Privacy policy for account holders (owners and technicians). Target market: Turkey, so it is
// written for KVKK; as a UK company we are also under UK GDPR (short section "Birleşik Krallık
// mevzuatı"). Draft, not yet reviewed by a lawyer. Keep the provider list in line with app/kosullar and
// app/veri-isleme.
const E = ABONELIK_EPOSTA;
const ADRES_TR = "71-75 Shelton Street, Covent Garden, London WC2H 9JQ, Birleşik Krallık";
const ADRES_EN = "71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom";

const BOLUMLER: Bolum[] = [
  ["Veri sorumlusu ve bu politikanın kapsamı", [
    "Fixnote'u Motiq Automation Ltd sunar. Kişisel verilerin bakımından veri sorumlusu bu şirkettir:",
    [
      "Motiq Automation Ltd (İngiltere ve Galler'de kayıtlı özel limited şirket)",
      "Şirket numarası: 17303276",
      `Kayıtlı adres: ${ADRES_TR}`,
      `E-posta: ${E}`,
    ],
    "Bu politika, Fixnote'u kullanan firma sahiplerinin ve teknisyenlerin (hesap sahiplerinin), bize yazan kişilerin ve Fixnote'u tanıttığımız işletme yetkililerinin verilerini anlatır. Hesap sahiplerinin uygulamaya girdiği müşteri bilgileri bakımından veri sorumlusu o firmadır; biz bu bilgileri yalnızca firma adına saklarız (bkz. \"Müşterilerinin bilgileri\").",
    "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun (KVKK) 10. maddesi uyarınca seni bilgilendirmek için hazırlanmıştır.",
  ]],
  ["Kısaca", [[
    "Servis kayıtların (firma bilgilerin, raporlar, fotoğraflar, imzalar ve müşteri bilgileri) hesabında saklanır: altyapı sağlayıcımız Supabase'in Almanya'daki (Frankfurt) sunucularında.",
    "Bu kayıtları yalnızca hesabına ve Firma paketinde ekibine katılan teknisyenlerin görür. Biz onlara yalnızca sen destek istediğinde ya da yasal bir zorunluluk olduğunda bakarız.",
    "Verilerini satmayız, reklam için kullanmayız ve otomatik kararla seni etkileyen bir profil çıkarmayız. Sitede reklam ya da takip çerezi yoktur.",
    "Hesabını ve bütün kayıtlarını istediğin zaman uygulamadan kendin silebilirsin.",
  ]]],
  ["Hangi verileri işliyoruz", [[
    "Hesap bilgileri: e-posta adresin ve şifren. Şifren açık hâliyle saklanmaz; giriş altyapımız onu geri çözülemeyecek biçimde (hash) tutar.",
    "Google ile giriş: Google ile girmeyi seçersen Google bize adını, e-posta adresini ve profil fotoğrafının bağlantısını iletir. Google hesabının şifresini hiçbir zaman görmeyiz.",
    "Firma bilgileri: uygulamaya girdiğin firma adı, telefonu, e-postası, adresi, vergi bilgileri, logon, rapor ayarların ve kendi şablonların.",
    "Ekip: Firma paketinde bir firmanın ekibine katılırsan e-posta adresin, ekipte görünen adın, katılma tarihin ve hangi raporu ilk senin yazdığın; bu bilgileri firma sahibi görür. Davet bağlantıları 7 gün sonra geçersiz olur.",
    "Deneme ve abonelik: hesabının oluşturulma tarihi, deneme ya da abonelik bitiş tarihi ve abonelikle ilgili kısa notlar.",
    "Online ödeme: abonelik ödemesi Stripe'ın ödeme sayfasında yapılır; kart bilgilerin bize ulaşmaz, yalnızca Stripe'ta işlenir. Biz Stripe müşteri ve abonelik numaranı, paketini, ödeme durumunu ve aboneliğin yenilenip yenilenmeyeceğini saklarız. Abone olurken Fixnote'u işin için kullandığını beyan edersin; bu beyan ve tarihi Stripe'taki aboneliğine kaydedilir.",
    "Servis kayıtları: müşteri adları, telefonları ve adresleri, cihaz bilgileri, servis raporları, önce ve sonra fotoğrafları ve müşteri imzaları. Bunlar senin müşterilerinin bilgileridir; sorumlusu sensin (bkz. \"Müşterilerinin bilgileri\").",
    "Teknik kayıtlar: giriş ve güvenlik için altyapı sağlayıcılarımız IP adresi, tarayıcı bilgisi ve giriş zamanı gibi kayıtları sınırlı bir süre tutar.",
    `Yazışmalar: ${E} adresine e-postayla ya da WhatsApp'tan yazarsan e-posta adresin ya da telefon numaran ve yazdıkların.`,
  ]]],
  ["Verileri nasıl topluyoruz", [
    "Kişisel verilerin elektronik ortamda ve otomatik yollarla toplanır: hesap açarken ve giriş yaparken girdiğin bilgilerden, Google ile girişi seçersen Google'dan, uygulamayı kullanırken doldurduğun formlardan, eklediğin fotoğraflardan ve aldığın imzalardan, ödeme yaptığında Stripe'tan, bize yazdığın e-postalardan ve siteyi kullanırken altyapı sağlayıcılarımızın tuttuğu teknik kayıtlardan.",
  ]],
  ["Cihazında tutulanlar", [
    "İnternet yokken kaydettiğin raporlar, bağlantı gelene kadar telefonundaki tarayıcıda bekler; gönderilince hesabına geçer. Listenin hızlı açılması için kayıtlarının bir kopyası da tarayıcıda tutulur. Çıkış yaptığında bu kopya, hesabını sildiğinde bütün kopyalar temizlenir; henüz gönderilmemiş raporlar gönderilene kadar cihazda kalır.",
    "Ayarlar'dan indirdiğin yedek dosyası senin cihazına iner ve nerede saklanacağına sen karar verirsin.",
    "Raporu WhatsApp ile gönderdiğinde mesaj, senin onayınla WhatsApp'ta açılır; oradan sonrası WhatsApp'ın kendi koşullarına tabidir.",
    "Girişini hatırlamak için tarayıcına bir oturum bilgisi kaydedilir. \"Beni hatırla\" işaretli değilse bu bilgi kalıcı olarak saklanmaz. Dil seçimin ve bu tercihin de tarayıcında saklanır. Bunlar hizmetin çalışması için zorunlu kayıtlardır; reklam ya da takip çerezi değildir.",
  ]],
  ["Neden işliyoruz ve hukuki sebepler", [
    "Kişisel verilerini KVKK'nın 5. maddesine uygun olarak, şu amaçlar ve hukuki sebeplerle işleriz:",
    [
      "Hesabını açmak, girişini sağlamak, servis kayıtlarını saklayıp cihazlarında göstermek, ekibini yönetmek ve deneme ya da abonelik durumunu kontrol etmek: sözleşmenin kurulması ve ifası için gerekli olması (KVKK m. 5/2-c).",
      "Abonelik ödemesini almak, fatura ve ödeme kayıtlarını tutmak: sözleşmenin ifası ve hukuki yükümlülüğümüz (KVKK m. 5/2-c ve 5/2-ç).",
      "Hizmetin güvenliğini sağlamak, kötüye kullanımı önlemek ve hataları gidermek: meşru menfaatimiz (KVKK m. 5/2-f).",
      "Sorularını ve destek taleplerini yanıtlamak: sözleşmenin ifası ve meşru menfaatimiz (KVKK m. 5/2-c ve 5/2-f).",
      "Hizmetle ilgili önemli bildirimler (fiyat, koşul ya da güvenlik değişiklikleri) göndermek: sözleşmenin ifası ve hukuki yükümlülük.",
      "Yasal yükümlülüklerimizi yerine getirmek ve haklarımızı korumak: kanunlarda öngörülmesi, hukuki yükümlülük ve bir hakkın tesisi, kullanılması ya da korunması (KVKK m. 5/2-a, 5/2-ç ve 5/2-e).",
    ],
    "Tanıtım e-postası göndermeyiz. İleride göndermek istersek ayrıca onayını alırız.",
  ]],
  ["Kimlerle paylaşıyoruz ve yurt dışına aktarım", [
    "Verilerini satmayız. Hizmeti sunmak için şu sağlayıcılarla çalışırız; bu sağlayıcılar verileri yalnızca hizmeti sunmak için ve bizim adımıza, aralarındaki veri işleme sözleşmelerine göre işler:",
    [
      "Supabase (sözleşme tarafımız Supabase Pte. Ltd, Singapur): hesap, giriş ve servis kayıtlarının (fotoğraflar ve imzalar dahil) saklandığı altyapı. Sunucular Almanya'da (Frankfurt) bulunur.",
      "Vercel: sitenin barındırılması ve sunulması. Merkezi ABD'dedir; site dünya genelindeki sunucularından sunulur.",
      "Google: yalnızca Google ile girişi seçersen, girişin için. Merkezi ABD'dedir.",
      "Stripe: online abonelik ödemeleri. Kart bilgilerin yalnızca Stripe'ta işlenir. Stripe verileri Birleşik Krallık, Avrupa Birliği ve ABD'deki sistemlerinde işler.",
      "WhatsApp (Meta): yalnızca bize WhatsApp'tan yazarsan, yazışma için. Merkezi ABD'dedir.",
    ],
    "Şirketimiz Birleşik Krallık'ta, sunucularımız Almanya'da, bazı sağlayıcılarımız ABD'de ve Singapur'dadır. Bu yüzden hesap bilgilerin, servis kayıtların, ödeme bilgilerin ve teknik kayıtlar Türkiye dışına aktarılır. Aktarımın amacı hizmetin barındırılması, sunulması, girişin sağlanması ve ödemenin alınmasıdır.",
    "Bu aktarımlar KVKK'nın 9. maddesine tabidir. Sağlayıcılarımızla aramızdaki veri işleme sözleşmeleri, verilerin yalnızca hizmet için ve uygun güvencelerle işlenmesini düzenler. Müşterilerinin bilgileri için yürütülen işlemler Veri işleme sözleşmesinde yazar.",
    "Yasal bir zorunluluk olursa bilgilerini yetkili kurum ve kuruluşlarla da paylaşabiliriz.",
  ]],
  ["Ne kadar saklıyoruz", [[
    "Hesap bilgilerin, firma bilgilerin ve servis kayıtların: hesabın açık olduğu sürece. Deneme ya da abonelik bitince kayıtların silinmez; abonelik açılınca kaldığın yerden devam edersin.",
    "Sildiğin bir rapor: fotoğrafları ve imzasıyla birlikte hemen silinir.",
    "Hesabını sildiğinde (Ayarlar > Hesabımı sil ya da bize yazarak): kanunen saklamamız gerekenler dışında her şey hemen silinir. Altyapı sağlayıcımızın yedeklerinden silinmesi en geç 7 gün içinde tamamlanır.",
    "Ödeme ve fatura kayıtları: vergi ve muhasebe mevzuatının öngördüğü süre boyunca (İngiltere'de genel olarak mali yılın bitiminden itibaren 6 yıl) Stripe'ta ve muhasebe kayıtlarımızda. Hesabını silsen de bu süre dolana kadar saklanır.",
    "Teknik kayıtlar: sağlayıcıların belirlediği sınırlı sürelerle.",
    "Yazışmalar: talebin sonuçlandıktan sonra, olası bir uyuşmazlık için gereken süre boyunca.",
  ]]],
  ["Verilerin güvenliği", [
    "Verilerini korumak için şu önlemleri alırız:",
    [
      "Site ile sunucular arasındaki bütün bağlantılar şifrelidir (HTTPS).",
      "Veritabanında her firma hesabı yalnızca kendi kayıtlarını görebilir; bu kural sunucu tarafında uygulanır ve test edilir. Fotoğraflar ve imzalar herkese açık olmayan bir depoda tutulur.",
      "Şifreler geri çözülemeyecek biçimde saklanır; veriler altyapı sağlayıcımızın sunucularında şifreli durur.",
      "Veritabanının günlük yedeği alınır ve 7 gün saklanır.",
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
    `Başvurunu Fixnote hesabında kayıtlı e-posta adresinden ${E} adresine yazarak, güvenli elektronik imza ya da mobil imzayla imzalayıp ${E} adresine göndererek ya da ıslak imzalı dilekçeyle ${ADRES_TR} adresine yazılı olarak yapabilirsin.`,
    "Başvurunda adını soyadını, Türk vatandaşıysan T.C. kimlik numaranı (değilsen uyruğunu ve pasaport ya da kimlik numaranı), tebligata esas adresini, varsa e-posta adresini ve telefon numaranı ve talebini açıkça yazmalısın. Kimliğini doğrulamak için ek bilgi isteyebiliriz.",
    "Başvurunu en geç 30 gün içinde ücretsiz sonuçlandırırız. İşlem ayrıca bir maliyet gerektirirse Kişisel Verileri Koruma Kurulu'nun belirlediği tarifedeki ücreti isteyebiliriz.",
    "Başvurun reddedilirse, cevabımızı yetersiz bulursan ya da süresinde cevap vermezsek, cevabımızı öğrendiğin tarihten itibaren 30 gün ve her hâlde başvuru tarihinden itibaren 60 gün içinde Kişisel Verileri Koruma Kurulu'na şikâyette bulunabilirsin.",
    "Verilerinin bir kopyasını uygulamada Ayarlar > Yedek indir ile alabilir, hesabını ve bütün kayıtlarını Ayarlar > Hesabımı sil ile kendin silebilirsin.",
  ]],
  ["Müşterilerinin bilgileri", [
    "Raporlara yazdığın müşteri bilgileri (ad, telefon, adres, fotoğraf, imza) senin işinle ilgili bilgilerdir. Bu bilgiler için veri sorumlusu sensin; biz onları yalnızca senin adına, senin talimatınla ve hizmeti sunmak için işleyen \"veri işleyen\"iz.",
    "Müşterilerini bilgilendirmek (aydınlatmak) ve gereken durumlarda açık rızalarını almak senin yükümlülüğündür. Kolaylık olsun diye uygulamada Firma ve şablonlar > Müşteri bilgilendirmesi'nde hazır bir bilgilendirme metni taslağı ve raporun altına eklenebilen kısa bir not bulunur.",
    "Bu bilgiler senin kayıtlarınla aynı yerde, aynı sağlayıcılarda ve aynı güvenlik önlemleriyle saklanır; hesabın silinince onlar da silinir. Karşılıklı yükümlülüklerimiz Veri işleme sözleşmesinde (fixnotee.vercel.app/veri-isleme) yazar.",
    "Bir müşterin bilgileriyle ilgili olarak bize başvurursa, başvuruyu sana iletiriz ve senin talimatına göre yardımcı oluruz.",
  ]],
  ["Birleşik Krallık mevzuatı", [
    "Şirketimiz Birleşik Krallık'ta kurulu olduğu için kişisel verilerin ayrıca Birleşik Krallık veri koruma mevzuatına (UK GDPR ve 2018 tarihli Data Protection Act) göre de korunur. Bu mevzuattan doğan hakların için de bize yazabilir, Birleşik Krallık'ın veri koruma otoritesi ICO'ya (Information Commissioner's Office, ico.org.uk) şikâyette bulunabilirsin.",
  ]],
  ["Fixnote'u tanıttığımız kişiler", [
    "Fixnote'u tanıtmak için işletmelerle birebir iletişime geçebiliriz. Bunun için işletme yetkilisinin adını, işletmenin adını ve iş kolunu, telefonunu ya da e-posta adresini ve görüşme notlarımızı; kişinin kendisinden, bir tanıdığın tavsiyesinden ya da herkese açık işletme kayıtlarından (harita ve hizmet platformlarındaki işletme sayfaları gibi) alırız.",
    "Amacımız Fixnote'u tanıtmak ve teklif sunmaktır; hukuki sebebimiz meşru menfaatimizdir (KVKK m. 5/2-f). Toplu tanıtım mesajı göndermeyiz.",
    "Fixnote'u kullanmaya başlarsan bu bilgiler hesap bilgilerinle birlikte bu politikaya göre işlenir. İlgilenmezsen son görüşmemizden 6 ay sonra sileriz. İstemediğini söylersen hemen sileriz; yalnızca seni tekrar aramamak için adını ve numaranı tutarız. Hakların için \"Hakların\" bölümü geçerlidir.",
  ]],
  ["Çocuklar", [
    "Fixnote işletmeler için tasarlanmıştır; 18 yaşından küçüklerin hesap açmasını amaçlamaz ve onlardan bilerek kişisel veri toplamayız.",
  ]],
  ["Değişiklikler", [
    "Bu politikayı güncellersek bu sayfadaki tarihi değiştiririz. Önemli değişiklikleri ayrıca e-postayla ya da uygulama içinde duyururuz.",
  ]],
  ["İletişim", [
    `Bu politikayla ilgili her soru ve başvurun için: ${E}`,
    `Posta adresi: Motiq Automation Ltd, ${ADRES_TR}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Data controller and scope of this policy", [
    "Fixnote is provided by Motiq Automation Ltd, which is the data controller for your personal data:",
    [
      "Motiq Automation Ltd (a private limited company registered in England and Wales)",
      "Company number: 17303276",
      `Registered office: ${ADRES_EN}`,
      `Email: ${E}`,
    ],
    "This policy covers the data of the company owners and technicians who use Fixnote (account holders), of people who write to us and of the business contacts we introduce Fixnote to. For the customer details that account holders enter in the app, the company is the data controller; we only store that information on the company's behalf (see \"Your customers' details\").",
    "This text is provided to inform you under Article 10 of Turkey's Personal Data Protection Law No. 6698 (KVKK).",
  ]],
  ["In short", [[
    "Your service records (your company details, reports, photos, signatures and customer details) are stored in your account: on the servers of our infrastructure provider Supabase in Germany (Frankfurt).",
    "Only people who sign in to your account, and on the Team plan the technicians who join your team, can see these records. We look at them only when you ask for support or when the law requires it.",
    "We don't sell your data, use it for advertising or build profiles that affect you through automated decisions. The site has no advertising or tracking cookies.",
    "You can delete your account and all your records yourself in the app at any time.",
  ]]],
  ["What data we process", [[
    "Account details: your email address and password. Your password is not stored in plain form; our sign-in infrastructure keeps it in a form that cannot be reversed (a hash).",
    "Google sign-in: if you choose to sign in with Google, Google sends us your name, email address and a link to your profile photo. We never see your Google password.",
    "Company details: the company name, phone, email, address, tax details, logo, report settings and your own templates that you enter in the app.",
    "Team: if you join a company's team on the Team plan, your email address, the name shown in the team, the date you joined and which reports you first wrote; the owner of the company account can see this. Invite links stop working after 7 days.",
    "Trial and subscription: the date your account was created, the end date of your trial or subscription and short notes about the subscription.",
    "Online payment: subscriptions are paid on Stripe's payment page; your card details never reach us and are processed only by Stripe. We keep your Stripe customer and subscription numbers, your plan, the payment status and whether the subscription renews. When you subscribe you confirm that you use Fixnote for your business; this confirmation and its date are recorded on your subscription at Stripe.",
    "Service records: customer names, phone numbers and addresses, appliance details, service reports, before and after photos and customer signatures. These are your customers' details and you are responsible for them (see \"Your customers' details\").",
    "Technical logs: for sign-in and security, our infrastructure providers keep records such as IP address, browser details and sign-in time for a limited period.",
    `Correspondence: if you write to ${E} by email or to us on WhatsApp, your email address or phone number and what you write.`,
  ]]],
  ["How we collect data", [
    "Your personal data is collected electronically and by automated means: from what you enter when you create an account and sign in, from Google if you choose Google sign-in, from the forms you fill in, the photos you add and the signatures you take in the app, from Stripe when you pay, from the emails you send us, and from the technical logs our infrastructure providers keep while you use the site.",
  ]],
  ["What is kept on your device", [
    "Reports you save without internet wait in your phone's browser until it is back online; once sent they move to your account. A copy of your records is also kept in the browser so the list opens quickly. This copy is cleared when you sign out, and all copies when you delete your account; reports not yet sent stay on the device until they are sent.",
    "A backup file you download from Settings is saved to your device, and you decide where to keep it.",
    "When you send a report on WhatsApp, the message opens in WhatsApp with your approval; from there on WhatsApp's own terms apply.",
    "A session token is saved in your browser to remember your sign-in. If \"Remember me\" is not ticked, it is not kept permanently. Your language choice and this preference are also kept in your browser. These are strictly necessary for the service to work; they are not advertising or tracking cookies.",
  ]],
  ["Why we process it and legal grounds", [
    "We process your personal data in line with Article 5 of KVKK, for these purposes and on these legal grounds:",
    [
      "Opening your account, signing you in, storing your service records and showing them on your devices, managing your team and checking your trial or subscription status: necessary to set up and perform the contract (KVKK art. 5/2-c).",
      "Taking subscription payments and keeping invoice and payment records: performance of the contract and our legal obligations (KVKK art. 5/2-c and 5/2-ç).",
      "Keeping the service secure, preventing misuse and fixing errors: our legitimate interest (KVKK art. 5/2-f).",
      "Answering your questions and support requests: performance of the contract and our legitimate interest (KVKK art. 5/2-c and 5/2-f).",
      "Sending important service notices (changes to prices, terms or security): performance of the contract and legal obligation.",
      "Meeting our legal obligations and protecting our rights: provided for by law, legal obligation and the establishment, exercise or defence of a right (KVKK art. 5/2-a, 5/2-ç and 5/2-e).",
    ],
    "We don't send marketing emails. If we want to in the future, we will ask for your consent separately.",
  ]],
  ["Who we share it with and transfers abroad", [
    "We don't sell your data. We work with these providers to run the service; they process data only to provide the service, on our behalf and under the data processing agreements between us:",
    [
      "Supabase (our contracting party is Supabase Pte. Ltd, Singapore): the infrastructure where accounts, sign-in and service records (including photos and signatures) are stored. The servers are in Germany (Frankfurt).",
      "Vercel: hosting and serving the site. Headquartered in the USA; the site is served from its servers around the world.",
      "Google: only if you choose Google sign-in, to sign you in. Headquartered in the USA.",
      "Stripe: online subscription payments. Your card details are processed only by Stripe. Stripe processes data on its systems in the United Kingdom, the European Union and the USA.",
      "WhatsApp (Meta): only if you write to us on WhatsApp, for that conversation. Headquartered in the USA.",
    ],
    "Our company is in the United Kingdom, our servers are in Germany and some of our providers are in the USA and Singapore, so your account details, service records, payment details and technical logs are transferred outside Turkey. The purpose of the transfer is hosting and serving the service, signing you in and taking payment.",
    "These transfers are subject to Article 9 of KVKK. The data processing agreements with our providers require the data to be processed only for the service and with appropriate safeguards. The steps taken for your customers' details are set out in the Data processing agreement.",
    "If the law requires it, we may also share your information with the competent authorities.",
  ]],
  ["How long we keep it", [[
    "Account details, company details and service records: while your account is open. When a trial or subscription ends your records are not deleted; once a subscription is active you carry on where you left off.",
    "A report you delete: deleted at once, together with its photos and signature.",
    "When you delete your account (Settings > Delete my account, or by writing to us): everything is deleted at once, except what we must keep by law. Deletion from our infrastructure provider's backups is completed within 7 days at most.",
    "Payment and invoice records: kept by Stripe and in our accounting records for the period required by tax and accounting law (in the UK generally 6 years from the end of the financial year), even if you delete your account.",
    "Technical logs: for the limited periods set by the providers.",
    "Correspondence: after your request is resolved, for as long as needed for a possible dispute.",
  ]]],
  ["Security", [
    "We take these measures to protect your data:",
    [
      "All connections between the site and the servers are encrypted (HTTPS).",
      "In the database each company account can see only its own records; this rule is enforced on the server and tested. Photos and signatures are kept in a storage area that is not public.",
      "Passwords are stored in a form that cannot be reversed; data is encrypted at rest on our infrastructure provider's servers.",
      "The database is backed up daily and backups are kept for 7 days.",
      "Only the people and systems needed to run the service can access records.",
    ],
    "If we learn that your personal data has been obtained by unauthorised persons, we will tell you and Turkey's Personal Data Protection Board as soon as possible.",
  ]],
  ["Your rights", [
    "Under Article 11 of KVKK you have the right:",
    [
      "To learn whether your personal data is processed and, if so, to request information",
      "To learn the purpose of processing and whether it is used for that purpose",
      "To know the third parties in Turkey or abroad to whom it is transferred",
      "To ask for incomplete or inaccurate data to be corrected and, where the conditions are met, for it to be deleted or destroyed, and for these actions to be notified to the third parties it was transferred to",
      "To object to a result against you arising from analysis by automated systems",
      "To claim compensation if you suffer damage because of unlawful processing",
    ],
    `You can make your request by writing to ${E} from the email address registered to your Fixnote account, by sending it to ${E} signed with a secure electronic signature or mobile signature, or by a signed letter to ${ADRES_EN}.`,
    "Your request should state your name, your Turkish ID number if you are a Turkish citizen (otherwise your nationality and passport or ID number), your address for notices, your email address and phone number if any, and your request. We may ask for extra information to verify your identity.",
    "We conclude your request free of charge within 30 days at the latest. If it involves extra cost, we may charge the fee set by Turkey's Personal Data Protection Board.",
    "If your request is rejected, you find our answer insufficient or we don't answer in time, you can complain to the Personal Data Protection Board within 30 days of learning our answer and in any case within 60 days of your request.",
    "You can also get a copy of your data yourself in the app with Settings > Download backup, and delete your account and all records with Settings > Delete my account.",
  ]],
  ["Your customers' details", [
    "The customer details you write in reports (name, phone, address, photos, signature) relate to your business. You are the data controller for this information; we are the \"data processor\" that processes it only on your behalf, on your instructions and to provide the service.",
    "Informing your customers and obtaining their explicit consent where required are your obligations. To help, the app has a draft notice for your customers and a short note you can add under reports, in Company and templates > Informing your customers.",
    "This information is stored in the same place as your records, with the same providers and the same security measures, and is deleted when your account is deleted. Our obligations to each other are set out in the Data processing agreement (fixnotee.vercel.app/veri-isleme).",
    "If one of your customers contacts us about their data, we pass the request to you and help according to your instructions.",
  ]],
  ["UK law", [
    "Because our company is established in the United Kingdom, your personal data is also protected under UK data protection law (the UK GDPR and the Data Protection Act 2018). You can also write to us about your rights under this law and complain to the UK's data protection authority, the ICO (Information Commissioner's Office, ico.org.uk).",
  ]],
  ["People we introduce Fixnote to", [
    "We may contact businesses one to one to introduce Fixnote. For this we hold the business contact's name, the business name and trade, phone number or email address and our notes of the conversation, obtained from the person, from a recommendation or from public business listings (such as business pages on maps and service platforms).",
    "Our purpose is to introduce Fixnote and make an offer; our legal basis is our legitimate interest (KVKK Art. 5/2-f). We don't send bulk marketing messages.",
    "If you start using Fixnote, this information is handled with your account details under this policy. If you are not interested, we delete it 6 months after our last conversation. If you tell us you don't want to hear from us, we delete it at once and keep only your name and number so that we don't contact you again. The \"Your rights\" section applies.",
  ]],
  ["Children", [
    "Fixnote is designed for businesses; it is not intended for people under 18 to open accounts, and we do not knowingly collect personal data from them.",
  ]],
  ["Changes", [
    "If we update this policy, we change the date on this page. We also announce important changes by email or in the app.",
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
          tarih: "19 Ekim 2026",
          giris: "Bu sayfa, Fixnote'u kullanırken hangi kişisel verilerinin işlendiğini, nerede saklandığını ve hangi haklara sahip olduğunu anlatır. Kısaca: servis kayıtların hesabında, Almanya'daki sunucularda saklanır ve yalnızca hesabına giriş yapanlar görür.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Privacy policy",
          tarih: "19 October 2026",
          giris: "This page explains which personal data is processed when you use Fixnote, where it is stored and what rights you have. In short: your service records are stored in your account, on servers in Germany, and only people who sign in to your account can see them.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
