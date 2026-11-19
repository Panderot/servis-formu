import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA, DENEME_GUN } from "../components/supabase";
import { fiyatSatirlari } from "../lib/paket";
import { saticiSatirlari } from "../lib/satici";

export const metadata: Metadata = {
  title: "Kullanım ve Abonelik Koşulları · Fixnote",
  description: "Fixnote'u kullanırken geçerli olan koşullar: hesap, deneme, abonelik, ödeme, iptal, kayıtlar ve sorumluluklar.",
};

// Terms of use and subscription, Fixnote's own terms (they act as the product-specific terms the MotiqAI Abonelik Koşulları
// allow; where they differ, these apply). Seller: Baret Güngörmezer (MotiqAI), app/lib/satici.ts. Target market: Turkey.
// Draft, not yet reviewed by a lawyer. Keep the provider list in line with app/gizlilik and app/veri-isleme, and the payment,
// refund and cancellation rules in line with app/teslimat-ve-iade, app/on-bilgilendirme and app/mesafeli-satis; prices come
// from app/lib/paket.ts (PAKET).
const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
  ["Hizmet sağlayıcı", [
    "Fixnote'u MotiqAI markasıyla Baret Güngörmezer (şahıs işletmesi) sunar. Bu koşullarda \"biz\" Baret Güngörmezer'i, \"sen\" Fixnote'u kullanan işletmeyi ve onun adına hesap açan kişiyi anlatır.",
    saticiSatirlari("tr"),
  ]],
  ["Hizmet ve kimler kullanabilir", [
    "Fixnote, saha servis ekiplerinin servis raporunu telefondan doldurmasını, müşteriye ekranda imzalatmasını, A4 rapor ve PDF almasını ve raporu WhatsApp ile göndermesini sağlayan bir web uygulamasıdır.",
    "Fixnote bir iş teslim raporu üretir. E-fatura ya da mali belge değildir; faturanı bugünkü yönteminle kesmeye devam edersin.",
    "Fixnote yalnızca ticari ve mesleki kullanım içindir: işletmelere, esnafa ve serbest çalışanlara işleri için sunulur, tüketicilere satılmaz. Abone olurken Fixnote'u işin için kullandığını beyan edersin; bu beyan tarihiyle birlikte kaydedilir.",
    "Fixnote şu an Türkiye'de faaliyet gösteren işletmelere sunulur.",
    "Hesap açmak için 18 yaşını doldurmuş olman ve işletme adına bu koşulları kabul etmeye yetkili olman gerekir.",
  ]],
  ["Hesap ve ekip", [[
    "Hesap açarken gerçek ve sana ait bir e-posta adresi kullanırsın.",
    "Usta paketinde hesabı yalnızca sen kullanırsın. Firma paketinde teknisyenlerini davet bağlantısıyla ekibine eklersin; her teknisyen kendi hesabıyla girer, firmanın kayıtlarını görür, rapor yazar ve düzenler. Rapor silme, firma bilgileri, şablonlar, abonelik ve ekip yönetimi hesabın sahibi olarak sende kalır.",
    "Giriş bilgilerini kimseyle paylaşmazsın. Ekipten çıkardığın teknisyenin firmanın kayıtlarına erişimi hemen biter; yazdığı raporlar firmada kalır.",
    "Hesabında ve ekibinin yaptığı işlemlerden sen sorumlusun.",
    `Hesabının izinsiz kullanıldığını düşünürsen hemen ${E} adresine yaz.`,
  ]]],
  ["Ücretsiz deneme", [
    `Yeni hesap ${DENEME_GUN} gün ücretsiz deneme ile açılır ve kart istenmez. Deneme kendiliğinden ücretli aboneliğe dönüşmez. Deneme bitince uygulama yeni kayıt için kilitlenir; kayıtların hesabında saklanmaya devam eder ve abonelik açılınca kaldığın yerden devam edersin.`,
  ]],
  ["Paketler ve fiyatlar", [[
    "İki paket vardır: Usta (bir kullanıcı) ve Firma (sınırsız teknisyen). İkisi de aylık ya da yıllık açılır; yıllık peşin ödemede aylık fiyata göre %20 indirim uygulanır.",
    `Güncel fiyatlar: ${fiyatSatirlari("tr").join("; ")}. Fiyatlar ana sayfadaki Fiyat bölümünde de yazar.`,
    "Fiyatlar Türk lirası ve KDV dahildir; ödeyeceğin tutar ödeme sayfasında ayrıca yazar.",
    "Fiyatları değiştirirsek bunu en az 30 gün önce kayıtlı e-posta adresine yazarak ve sitede duyururuz. Yeni fiyat, duyurudan sonraki ilk yenilemeden itibaren geçerli olur; ödemesini yaptığın dönemi etkilemez. Yeni fiyatı kabul etmezsen yenilemeden önce aboneliğini iptal edebilirsin.",
  ]]],
  ["Ödeme ve otomatik yenileme", [[
    `Aboneliği uygulamadaki Abonelik sayfasından kartla açarsın ya da ${E} adresine yazarak bizimle birlikte açarsın.`,
    "Kartla ödemeler, Türkiye'de yerleşik lisanslı ödeme kuruluşu iyzico aracılığıyla alınır. Kart bilgilerin Fixnote'ta saklanmaz, iyzico'da işlenir.",
    "Kartla açılan abonelik, iptal etmediğin sürece her ay ya da her yıl aynı gün kendiliğinden yenilenir ve o dönemin ücreti kartından çekilir. Yenileme tarihi ve tutarı abonelik yönetim sayfasında görünür.",
    "Bir yenileme ödemesi alınamazsa ödeme altyapımız birkaç gün içinde yeniden dener. Ödeme 7 gün içinde tamamlanmazsa uygulama yeni kayıt için kilitlenir; kayıtların silinmez.",
    "Her ödeme için adına (işletmeysen işletmen adına) e-Arşiv fatura ya da e-Fatura düzenlenir ve hesabındaki e-posta adresine gönderilir. Bunun için fatura bilgilerini doğru girmen gerekir.",
  ]]],
  ["İptal ve iade", [[
    "Aboneliğini istediğin zaman, uygulamada üst çubuktaki Yönet bağlantısından (abonelik yönetim sayfası) ya da bize yazarak iptal edebilirsin.",
    "İptal, ödemesini yaptığın dönemin sonunda geçerli olur. Dönem sonuna kadar Fixnote'u kullanmaya devam edersin; sonraki dönem için ücret alınmaz.",
    "Kullanılmayan süre için kısmi iade yapılmaz. Kanunun zorunlu kıldığı iade hakları saklıdır. Hatalı ya da mükerrer bir ödeme olursa bize yaz, inceleyip iade ederiz.",
    "Daha üst bir pakete (Usta'dan Firma'ya) geçersen aradaki fark kalan gün sayısına göre hesaplanır. Daha alt bir pakete geçiş, ödediğin dönemin sonunda geçerli olur.",
  ]]],
  ["Kayıtların ve yedek", [
    "Servis kayıtların hesabında, altyapı sağlayıcımızın Almanya'daki sunucularında saklanır ve aynı hesapla giren her cihazda görünür.",
    "İnternet yokken kaydettiğin rapor, bağlantı gelene kadar o cihazda bekler. Bu sırada tarayıcı verileri silinirse ya da cihaz kaybolursa henüz gönderilmemiş rapor kaybolabilir.",
    "Kayıtlarını korumak için gereken özeni gösteririz ve veritabanının günlük yedeğini alırız. Yine de Ayarlar'dan ara sıra kendi yedeğini indirmeni öneririz.",
  ]],
  ["Haklar ve sahiplik", [[
    "Fixnote'a girdiğin kayıtlar (firma bilgilerin, raporlar, fotoğraflar, imzalar, müşteri bilgileri) senindir. Bize yalnızca hizmeti sunmak için bunları saklama, işleme ve gösterme izni verirsin.",
    "Kayıtlarını istediğin zaman Ayarlar'dan yedek dosyası olarak indirebilirsin.",
    "Fixnote yazılımı, tasarımı ve markası bize aittir. Abonelik süresince sana Fixnote'u bu koşullara uygun olarak kullanma hakkı veririz; yazılımı kopyalayamaz, satamaz ya da kaynak kodunu çıkarmaya çalışamazsın.",
  ]]],
  ["Raporların içeriği ve müşteri bilgileri", [
    "Raporlara yazdığın bilgilerin doğruluğundan ve raporun kullanıldığı işe uygunluğundan sen sorumlusun. Müşteri onayı bölümünü yalnızca müşterinin kendisi imzalar.",
    "Ekranda alınan imza, müşterinin işi onayladığını gösteren bir kayıttır; 5070 sayılı Elektronik İmza Kanunu'ndaki güvenli elektronik imza değildir.",
    "Bazı işler için kanunla belirlenmiş resmi formlar ya da belgeler gerekebilir. Fixnote raporu bunların yerine geçmez; hangi belgenin gerektiğini sen bilir ve sağlarsın.",
  ]],
  ["Kişisel veriler: senin ve bizim rolümüz", [
    "Fixnote'a girdiğin müşteri bilgileri (ad, telefon, adres, fotoğraf, imza) bakımından veri sorumlusu sensin; biz bu bilgileri yalnızca senin adına ve hizmeti sunmak için işleyen veri işleyeniz.",
    [
      "Müşterilerini bilgilendirmek (aydınlatmak), gereken durumlarda açık rızalarını almak ve onlardan gelen başvuruları yanıtlamak senin yükümlülüğündür.",
      "Bu bilgileri yalnızca hizmeti sunmak için ve senin talimatınla işleriz; başka bir amaçla kullanmaz, satmaz ve reklam için kullanmayız.",
      "Hizmeti sunmak için altyapı sağlayıcılarıyla çalışırız (Supabase: veritabanı ve dosya depolama, Almanya; Vercel: sitenin sunulması; iyzico: yalnızca abonelik ödemesi, Türkiye, müşteri bilgilerine erişmez).",
    ],
    "Karşılıklı yükümlülüklerimizin ayrıntıları Veri işleme sözleşmesindedir (fixnotee.vercel.app/veri-isleme). Bu sözleşme Kullanım koşullarının parçasıdır ve müşteri bilgileri konusunda önceliklidir. Kendi kişisel verilerin için Gizlilik politikası geçerlidir.",
  ]],
  ["Kabul edilmeyen kullanım", [
    "Fixnote'u yasa dışı amaçlarla, yanıltıcı ya da sahte rapor hazırlamak için, başkası adına imza atmak için, izinsiz kişisel veri toplamak için, hizmeti bozmaya, aşırı yüklemeye ya da başkalarının hesaplarına erişmeye çalışmak için kullanamazsın.",
  ]],
  ["Hizmetin sürekliliği ve değişiklikler", [
    "Fixnote'u kesintisiz ve hatasız çalıştırmak için çalışırız, ancak bunu garanti edemeyiz. Bakım, güncelleme ya da altyapı sağlayıcılarından kaynaklanan kesintiler olabilir.",
    "Hizmeti geliştirirken özellikleri değiştirebiliriz. Ödediğin paketin temel bir özelliğini kaldırırsak bunu önceden duyururuz; kabul etmezsen aboneliğini iptal edebilir, kalan tam ayların ücretinin iadesini isteyebilirsin.",
    "Fixnote'u tamamen kapatırsak en az 30 gün önce duyururuz, kayıtlarını alman için süre veririz ve ödediğin ama kullanamayacağın sürenin ücretini iade ederiz.",
    "Kontrolümüz dışındaki olaylar (doğal afet, yaygın internet ya da altyapı arızası, resmi kararlar gibi) yüzünden yükümlülüklerimizi yerine getiremezsek bundan sorumlu olmayız; bu süre içinde hizmeti en kısa sürede yeniden açmak için çalışırız.",
  ]],
  ["Sorumluluğun sınırı", [
    "Fixnote olduğu gibi sunulur. Yürürlükteki hukukun izin verdiği ölçüde; henüz gönderilmemiş kayıtların cihazında kaybolmasından, raporlara girilen bilgilerden ve dolaylı zararlardan (kâr, iş ya da itibar kaybı gibi) sorumlu değiliz.",
    "Her durumda toplam sorumluluğumuz, zarara yol açan olaydan önceki 12 ayda Fixnote için ödediğin tutarla sınırlıdır.",
    "Bu sınırlar, kanunun sınırlanmasına izin vermediği sorumlulukları (örneğin kasıt, ağır ihmal ya da dolandırıcılık) etkilemez.",
  ]],
  ["Askıya alma ve hesabın kapatılması", [[
    "Hesabını istediğin zaman uygulamada Ayarlar > Hesabımı sil ile kendin kapatabilir ya da bize yazarak kapatılmasını isteyebilirsin. Yenilenmeye devam eden bir aboneliğin varsa önce onu iptal etmen gerekir. Kapatmadan önce Ayarlar'dan yedek indirebilirsin.",
    "Bu koşulları ciddi biçimde ihlal edersen (örneğin kabul edilmeyen kullanım) hesabını askıya alabilir ya da kapatabiliriz. Mümkünse önce sana yazar ve düzeltmen için süre veririz.",
    "Hesap kapanınca hesap bilgilerin ve servis kayıtların Gizlilik politikasında yazan sürelerle silinir.",
    "Abonelik sona erdikten sonra veriler 90 gün saklanır; bu sürede yeniden abone olunabilir ya da veriler indirilebilir; sonra silinir.",
  ]]],
  ["Bildirimler", [
    `Sana yapacağımız bildirimleri hesabındaki e-posta adresine ya da uygulama içinde yaparız. Bize yapacağın bildirimler için ${E} adresini kullanırsın.`,
    "Kanunun belirli bir şekil öngördüğü bildirimler (örneğin tacirler arasında temerrüt ya da fesih ihtarları) o şekle uygun olarak yapılır.",
  ]],
  ["Değişiklikler", [
    "Bu koşulları güncellersek bu sayfadaki tarihi değiştiririz. Önemli değişiklikleri en az 30 gün önce e-postayla ya da uygulama içinde duyururuz.",
    "Aleyhine olan bir değişiklik, ödemesini yaptığın dönemi etkilemez; duyurudan sonraki ilk yenilemeden itibaren geçerli olur. Kabul etmezsen yenilemeden önce aboneliğini iptal edebilir ya da hesabını kapatabilirsin. Gerekirse yeni koşulları uygulama içinde ayrıca onaylamanı isteriz.",
    "Lehine olan ya da yalnızca açıklık getiren değişiklikler yayımlandığı gün geçerli olur.",
    "Bu koşulların her sürümünü tarihiyle saklarız; kabul ettiğin sürümün bir kopyasını istersen e-postayla göndeririz.",
    "İşletmenin devri ya da şirkete dönüştürülmesi halinde bu sözleşmeyi, seni önceden bilgilendirerek işi devralan işletmeye ya da şirkete devredebiliriz.",
  ]],
  ["Uygulanacak hukuk ve uyuşmazlıklar", [
    "Bir sorun olursa önce bize yaz; uyuşmazlıkları öncelikle iyi niyetle ve yazışarak çözmeye çalışırız.",
    "Bu koşullara Türkiye Cumhuriyeti hukuku uygulanır.",
    "Tacir olan kullanıcılarla aramızdaki uyuşmazlıklarda İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir. Diğer kullanıcılar için kanunun gösterdiği yetkili mahkemeler geçerlidir. Dava şartı arabuluculuğa ilişkin kanun hükümleri saklıdır.",
    "Uyuşmazlıklarda tarafların ticari defterleri ve elektronik kayıtları (sunucu ve ödeme kayıtları, e-postalar), 6100 sayılı Hukuk Muhakemeleri Kanunu'nun 193. maddesi uyarınca delil olarak kullanılabilir; karşı delil sunma hakkı saklıdır.",
    "Bu koşullar Türkçe ve İngilizce yayımlanır; iki metin arasında fark olursa Türkçe metin esas alınır.",
  ]],
  ["İletişim", [
    `Bu koşullarla ilgili her soru için: ${E}`,
  ]],
];

const BOLUMLER_EN: Bolum[] = [
  ["Service provider", [
    "Fixnote is provided by Baret Güngörmezer (sole proprietorship) under the MotiqAI brand. In these terms \"we\" means Baret Güngörmezer and \"you\" means the business using Fixnote and the person who opens the account on its behalf.",
    saticiSatirlari("en"),
  ]],
  ["The service and who can use it", [
    "Fixnote is a web app that lets field service teams fill in a service report on a phone, have the customer sign it on screen, get an A4 report and PDF, and send the report on WhatsApp.",
    "Fixnote produces a job completion report. It is not an invoice or a tax document; keep invoicing the way you do today.",
    "Fixnote is for business and professional use only: it is offered to businesses, tradespeople and self-employed people for their work and is not sold to consumers. When you subscribe, you confirm that you use Fixnote for your business; this confirmation is recorded with its date.",
    "Fixnote is currently offered to businesses operating in Turkey.",
    "To open an account you must be at least 18 and authorised to accept these terms on behalf of the business.",
  ]],
  ["Account and team", [[
    "You open your account with a real email address that belongs to you.",
    "On the Solo plan only you use the account. On the Team plan you add your technicians to your team with an invite link; each technician signs in with their own account, sees the company's records, and writes and edits reports. Deleting reports, company details, templates, the subscription and team management stay with you as the account owner.",
    "You don't share your sign-in details with anyone. When you remove a technician from the team, their access to the company's records ends at once; the reports they wrote stay with the company.",
    "You are responsible for what is done in your account and by your team.",
    `If you think your account has been used without permission, write to ${E} straight away.`,
  ]]],
  ["Free trial", [
    `A new account starts with a free ${DENEME_GUN}-day trial and no card is needed. The trial does not turn into a paid subscription by itself. When the trial ends the app is locked for new records; your records stay in your account and you carry on where you left off once a subscription is active.`,
  ]],
  ["Plans and prices", [[
    "There are two plans: Solo (one user) and Team (unlimited technicians). Both can be monthly or yearly; paying yearly in advance gives 20% off the monthly price.",
    `Current prices: ${fiyatSatirlari("en").join("; ")}. They are also shown in the Pricing section of the home page.`,
    "Prices are in Turkish lira (TRY), VAT included; the amount you pay is also shown on the payment page.",
    "If we change prices, we will tell you at least 30 days in advance by email and on the site. The new price applies from your first renewal after the notice; it does not affect a period you have already paid for. If you don't accept the new price, you can cancel before the renewal.",
  ]]],
  ["Payment and automatic renewal", [[
    `You open a subscription by card on the Subscription page in the app, or together with us by writing to ${E}.`,
    "Card payments are taken through iyzico, a licensed payment institution based in Turkey. Your card details are not stored by Fixnote; they are processed by iyzico.",
    "A subscription opened by card renews automatically on the same day every month or every year until you cancel it, and that period's fee is charged to your card. The renewal date and amount are shown on the subscription management page.",
    "If a renewal payment fails, our payment provider tries again over a few days. If the payment is not completed within 7 days, the app is locked for new records; your records are not deleted.",
    "For every payment an e-Archive invoice or e-Invoice is issued in your name (or your business's name) and sent to the email address in your account. For this you need to enter your billing details correctly.",
  ]]],
  ["Cancellation and refunds", [[
    "You can cancel your subscription at any time from the Manage link in the top bar of the app (the subscription management page) or by writing to us.",
    "Cancellation takes effect at the end of the period you have paid for. You keep using Fixnote until then; you are not charged for the next period.",
    "We don't give partial refunds for unused time. Refund rights required by law are not affected. If a payment was made in error or twice, write to us and we will review it and refund it.",
    "If you move to a higher plan (from Solo to Team), the difference is calculated by the number of days left. Moving to a lower plan takes effect at the end of the period you have paid for.",
  ]]],
  ["Your records and backups", [
    "Your service records are stored in your account, on our infrastructure provider's servers in Germany, and appear on every device signed in to the same account.",
    "A report saved without internet waits on that device until it is back online. If browser data is cleared or the device is lost in the meantime, a report not yet sent may be lost.",
    "We take due care to protect your records and back up the database daily. We still recommend downloading your own backup from Settings from time to time.",
  ]],
  ["Rights and ownership", [[
    "The records you enter in Fixnote (company details, reports, photos, signatures, customer details) are yours. You give us permission to store, process and display them only to provide the service.",
    "You can download your records as a backup file from Settings at any time.",
    "The Fixnote software, design and brand belong to us. During your subscription we give you the right to use Fixnote in line with these terms; you may not copy or resell the software or try to extract its source code.",
  ]]],
  ["Report content and customer details", [
    "You are responsible for the accuracy of what you write in reports and for whether a report suits the job it is used for. Only the customer signs the customer sign-off section.",
    "The signature taken on screen is a record that the customer approved the work; it is not a secure electronic signature under Turkish Electronic Signature Law No. 5070.",
    "Some jobs require official forms or certificates set by law. A Fixnote report does not replace them; you know which document is required and provide it.",
  ]],
  ["Personal data: your role and ours", [
    "For the customer details you enter in Fixnote (name, phone, address, photos, signature), you are the data controller; we are the data processor that processes them only on your behalf and to provide the service.",
    [
      "Informing your customers, obtaining their explicit consent where required and answering their requests are your obligations.",
      "We process this information only to provide the service and on your instructions; we do not use it for any other purpose, sell it or use it for advertising.",
      "We work with infrastructure providers to run the service (Supabase: database and file storage, Germany; Vercel: serving the site; iyzico: subscription payments only, Turkey, with no access to customer details).",
    ],
    "The details of our obligations to each other are in the Data processing agreement (fixnotee.vercel.app/veri-isleme). It forms part of these Terms of use and takes precedence on customer details. The Privacy policy covers your own personal data.",
  ]],
  ["Unacceptable use", [
    "You may not use Fixnote for unlawful purposes, to prepare misleading or false reports, to sign on someone else's behalf, to collect personal data without permission, or to try to disrupt or overload the service or access other people's accounts.",
  ]],
  ["Continuity of the service and changes", [
    "We work to keep Fixnote running without interruption or errors, but we cannot guarantee this. There may be interruptions for maintenance, updates or because of our infrastructure providers.",
    "We may change features as we develop the service. If we remove a core feature of the plan you pay for, we will announce it in advance; if you don't accept it, you can cancel and ask for a refund of the remaining full months.",
    "If we close Fixnote completely, we will announce it at least 30 days in advance, give you time to take your records and refund the time you have paid for but cannot use.",
    "We are not responsible if events outside our control (natural disasters, widespread internet or infrastructure failures, official decisions and the like) prevent us from meeting our obligations; during that time we work to restore the service as soon as possible.",
  ]],
  ["Limitation of liability", [
    "Fixnote is provided as is. To the extent the applicable law allows, we are not liable for the loss on your device of records not yet sent, for the information entered in reports, or for indirect losses (such as loss of profit, business or reputation).",
    "In any case our total liability is limited to the amount you paid for Fixnote in the 12 months before the event that caused the loss.",
    "These limits do not affect liability that the law does not allow to be limited (for example intent, gross negligence or fraud).",
  ]],
  ["Suspension and closing your account", [[
    "You can close your account yourself at any time in the app under Settings > Delete my account, or ask us to close it. If you have a subscription that still renews, cancel it first. You can download a backup from Settings before closing.",
    "If you seriously breach these terms (for example unacceptable use), we may suspend or close your account. Where possible we will write to you first and give you time to put it right.",
    "When your account is closed, your account details and service records are deleted within the periods set out in the Privacy policy.",
    "After a subscription ends, the data is kept for 90 days; during that time you can subscribe again or download the data; after that it is deleted.",
  ]]],
  ["Notices", [
    `We send notices to the email address in your account or inside the app. Use ${E} for notices to us.`,
    "Notices for which the law requires a particular form (for example notices of default or termination between merchants) are given in that form.",
  ]],
  ["Changes", [
    "If we update these terms, we change the date on this page. We announce important changes at least 30 days in advance by email or in the app.",
    "A change that is to your disadvantage does not affect a period you have already paid for; it applies from your first renewal after the notice. If you don't accept it, you can cancel your subscription or close your account before the renewal. Where needed we will ask you to accept the new terms in the app.",
    "Changes in your favour or that only clarify the terms apply from the day they are published.",
    "We keep every version of these terms with its date; if you ask, we will email you a copy of the version you accepted.",
    "If the business is transferred or turned into a company, we may transfer this agreement to the business or company taking it over, after letting you know in advance.",
  ]],
  ["Governing law and disputes", [
    "If there is a problem, write to us first; we try to resolve disputes in good faith and in writing.",
    "These terms are governed by the law of the Republic of Turkey.",
    "For disputes with users who are merchants, the courts and enforcement offices of Istanbul (Çağlayan) have jurisdiction. For other users, the courts set by law apply. Statutory rules on mandatory mediation before a lawsuit are not affected.",
    "In disputes, the parties' commercial books and electronic records (server and payment records, emails) may be used as evidence under Article 193 of the Turkish Code of Civil Procedure No. 6100; the right to submit counter-evidence is reserved.",
    "These terms are published in Turkish and English; if the two differ, the Turkish text prevails.",
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
          baslik: "Kullanım ve Abonelik Koşulları",
          tarih: "19 Kasım 2026",
          giris: "Fixnote'a hesap açarak ya da Fixnote'u kullanarak bu koşulları kabul etmiş olursun. Kişisel verilerinle ilgili ayrıntılar Gizlilik politikasında, müşterilerinin bilgileriyle ilgili ayrıntılar Veri işleme sözleşmesinde yazar.",
          bolumler: BOLUMLER,
        },
        en: {
          baslik: "Terms of use and subscription",
          tarih: "19 November 2026",
          giris: "By opening a Fixnote account or using Fixnote, you accept these terms. Details about your personal data are in the Privacy policy, and details about your customers' information are in the Data processing agreement.",
          bolumler: BOLUMLER_EN,
        },
      }}
    />
  );
}
