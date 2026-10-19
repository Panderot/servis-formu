import type { Dil, Firma } from "./servis";

// Helps a business inform its own customers (the business is the data controller of its customers'
// details; Fixnote stores them on its behalf). Settings > Company and templates > Informing your customers.
// These are drafts the business can adapt; the app says so next to them.

const iletisim = (f: Firma) => [f.telefon, f.eposta].map((s) => s.trim()).filter(Boolean).join(", ");

// Short note under the A4 report (shown when Firma.kvkkNot is on), in the report's language.
export function kvkkNotu(f: Firma, dil: Dil): string {
  const ad = f.ad.trim() || (dil === "en" ? "the service company" : "servis firması");
  const ile = iletisim(f);
  if (dil === "en")
    return `Your personal data (name, contact details, address, appliance details, photos and signature) is processed by ${ad} to keep a record of this service and for warranty and future maintenance, in line with data protection law.${ile ? ` For information and your rights: ${ile}.` : ""}`;
  return `Kişisel verileriniz (ad, iletişim, adres, cihaz bilgileri, fotoğraf ve imza) ${ad} tarafından bu servisin kaydının tutulması, garanti ve sonraki bakım hizmetleri amacıyla 6698 sayılı KVKK'ya uygun olarak işlenir.${ile ? ` Bilgi ve haklarınız için: ${ile}.` : ""}`;
}

// Full notice the business can copy and give to customers (WhatsApp, website, printed at the shop).
export function kvkkMetni(f: Firma, dil: Dil): string {
  const bos = dil === "en" ? "[please fill in]" : "[doldurun]";
  const ad = f.ad.trim() || bos;
  const adres = f.adres.trim() || bos;
  const ile = iletisim(f) || bos;
  if (dil === "en")
    return [
      `PRIVACY NOTICE FOR OUR CUSTOMERS`,
      ``,
      `Who we are: ${ad}, ${adres}. Contact: ${ile}. We are the controller of your personal data.`,
      ``,
      `What we collect: your name, phone number and address; details of your appliance (type, make, model, serial number); the service record (fault, work done, parts, price); before and after photos; and your signature confirming the work.`,
      ``,
      `Why: to carry out the service you asked for, to keep a record of the work handed over, for warranty claims and future maintenance, and to meet our legal obligations. The legal basis is the performance of our contract with you, our legal obligations and our legitimate interest in keeping service records.`,
      ``,
      `Where it is kept: we keep service records with a service report software provider (Fixnote, Motiq Automation Ltd, United Kingdom). The data is stored on servers in Germany, and some of its infrastructure providers are based in the USA and Singapore, so your data is transferred abroad for this purpose. If we send you the report on WhatsApp, it is delivered through WhatsApp (Meta). We may also share it with authorities where the law requires.`,
      ``,
      `How long: we keep service records for as long as needed for warranty, maintenance and legal record-keeping, then delete them.`,
      ``,
      `Your rights: you can ask whether your data is processed and for information about it, learn the purpose and who it was shared with, ask us to correct or delete it and to tell those it was shared with, object to a result of automated analysis against you, and claim compensation for damage from unlawful processing. Contact us at ${ile}. We answer free of charge within 30 days. If you are not satisfied, you can complain to the Personal Data Protection Board in Turkey.`,
    ].join("\n");
  return [
    `MÜŞTERİLERİMİZE KİŞİSEL VERİLERİN İŞLENMESİNE İLİŞKİN AYDINLATMA METNİ`,
    ``,
    `Veri sorumlusu: ${ad}, ${adres}. İletişim: ${ile}.`,
    ``,
    `İşlenen veriler: adınız soyadınız, telefonunuz ve adresiniz; cihazınızın bilgileri (tür, marka, model, seri no); servis kaydı (arıza, yapılan iş, parça, ücret); önce ve sonra fotoğrafları; işin yapıldığını onaylayan imzanız.`,
    ``,
    `Amaç ve hukuki sebep: talep ettiğiniz servis hizmetinin yürütülmesi, iş teslim kaydının tutulması, garanti ve sonraki bakım işlemleri ile yasal yükümlülüklerimizin yerine getirilmesi. Hukuki sebepler: sözleşmenin kurulması ve ifası (KVKK m. 5/2-c), hukuki yükümlülüğümüz (m. 5/2-ç) ve servis kayıtlarını tutmaktaki meşru menfaatimiz (m. 5/2-f).`,
    ``,
    `Toplama yöntemi: verileriniz servis sırasında sizden, elektronik ortamda (telefon ya da tablet üzerinden) toplanır.`,
    ``,
    `Aktarım: servis kayıtlarımızı bir servis raporu yazılımı sağlayıcısı (Fixnote, Motiq Automation Ltd, Birleşik Krallık) aracılığıyla tutuyoruz. Kayıtlar Almanya'daki sunucularda saklanır; sağlayıcının bazı altyapı hizmetleri ABD ve Singapur'dadır. Bu nedenle verileriniz bu amaçla yurt dışına aktarılır. Raporu size WhatsApp ile gönderirsek, mesaj WhatsApp (Meta) üzerinden iletilir. Kanunen gerekli olduğunda verileriniz yetkili kurum ve kuruluşlarla paylaşılabilir.`,
    ``,
    `Saklama süresi: servis kayıtlarınız garanti, bakım ve yasal saklama yükümlülükleri için gereken süre boyunca saklanır, sonra silinir.`,
    ``,
    `Haklarınız (KVKK m. 11): kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi isteme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde ya da yurt dışında aktarıldığı üçüncü kişileri bilme, eksik ya da yanlış işlenmişse düzeltilmesini, şartları oluşmuşsa silinmesini ya da yok edilmesini ve bu işlemlerin aktarıldığı kişilere bildirilmesini isteme, otomatik sistemlerle analiz sonucu aleyhinize çıkan bir sonuca itiraz etme ve kanuna aykırı işleme nedeniyle zarara uğrarsanız zararın giderilmesini isteme.`,
    ``,
    `Başvuru: başvurularınızı yazılı olarak ıslak imzalı dilekçeyle adresimize ya da güvenli elektronik imza, mobil imza veya bize daha önce bildirdiğiniz ve kayıtlarımızda bulunan e-posta adresiniz aracılığıyla iletebilirsiniz (iletişim: ${ile}). Başvurunuz en geç 30 gün içinde ücretsiz sonuçlandırılır. Cevabımızı yeterli bulmazsanız Kişisel Verileri Koruma Kurulu'na şikâyette bulunabilirsiniz.`,
  ].join("\n");
}
