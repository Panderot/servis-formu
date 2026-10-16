import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA } from "../components/supabase";

export const metadata: Metadata = {
  title: "Gizlilik politikası · Fixnote",
  description: "Fixnote'ta hangi kişisel verilerin işlendiği, nerede saklandığı ve hakların.",
};

const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
  ["Kısaca", [[
    "Servis kayıtların (müşteri bilgileri, raporlar, fotoğraflar, imzalar ve firma bilgilerin) yalnızca kendi cihazının tarayıcısında saklanır. Sunucumuza gönderilmez, biz bunları göremeyiz.",
    "Sunucuda yalnızca hesabın için gerekenler tutulur: e-posta adresin, giriş bilgilerin ve deneme ya da abonelik durumun.",
    "Verilerini satmayız ve reklam için kullanmayız. Sitede reklam ya da takip çerezi yoktur.",
  ]]],
  ["Hangi verileri işliyoruz", [[
    "Hesap bilgileri: e-posta adresin ve şifren. Şifren açık hâliyle saklanmaz; giriş altyapımız onu geri çözülemeyecek biçimde (hash) tutar.",
    "Google ile giriş: Google ile girmeyi seçersen Google bize adını, e-posta adresini ve profil fotoğrafının bağlantısını iletir. Google hesabının şifresini hiçbir zaman görmeyiz.",
    "Deneme ve abonelik: hesabının oluşturulma tarihi, deneme ya da abonelik bitiş tarihi ve abonelikle ilgili kısa notlar.",
    "Teknik kayıtlar: giriş ve güvenlik için altyapı sağlayıcılarımız IP adresi, tarayıcı bilgisi ve giriş zamanı gibi kayıtları sınırlı bir süre tutar.",
    `Yazışmalar: ${E} adresine yazarsan e-posta adresin ve yazdıkların.`,
  ]]],
  ["Cihazında kalanlar", [
    "Uygulamaya girdiğin firma bilgileri, müşteri adları, telefonları ve adresleri, servis raporları, fotoğraflar, imzalar ve şablonlar yalnızca bu cihazdaki tarayıcının depolama alanında durur.",
    "Tarayıcı verilerini silersen ya da cihazı kaybedersen bu kayıtlar da gider. Bu yüzden Ayarlar'dan düzenli yedek almanı öneririz. Yedek dosyası senin cihazına iner ve nerede saklanacağına sen karar verirsin.",
    "Raporu WhatsApp ile gönderdiğinde mesaj, senin onayınla WhatsApp'ta açılır; oradan sonrası WhatsApp'ın kendi koşullarına tabidir.",
    "Girişini hatırlamak için tarayıcına bir oturum bilgisi kaydedilir. Bu bir reklam ya da takip çerezi değildir.",
  ]],
  ["Neden işliyoruz", [
    "Kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu'na (KVKK) uygun olarak, şu amaçlar ve hukuki sebeplerle işleriz:",
    [
      "Hesabını açmak, girişini sağlamak ve deneme ya da abonelik durumunu kontrol etmek: sözleşmenin kurulması ve ifası için gerekli olması (KVKK m. 5/2-c).",
      "Hizmetin güvenliğini sağlamak ve kötüye kullanımı önlemek: meşru menfaatimiz (KVKK m. 5/2-f).",
      "Sorularını yanıtlamak ve abonelik işlemlerini yürütmek: sözleşmenin ifası ve meşru menfaatimiz.",
      "Yasal yükümlülüklerimizi yerine getirmek: kanunlarda açıkça öngörülmesi ve hukuki yükümlülük (KVKK m. 5/2-a ve 5/2-ç).",
    ],
  ]],
  ["Kimlerle paylaşıyoruz", [
    "Verilerini satmayız. Hizmeti sunmak için şu sağlayıcılarla çalışırız:",
    [
      "Supabase: hesap ve giriş altyapısı. Veritabanı sunucuları Almanya'da (Frankfurt) bulunur.",
      "Vercel: sitenin barındırılması ve sunulması.",
      "Google: yalnızca Google ile girişi seçersen, girişin için.",
    ],
    "Bu sağlayıcıların sunucuları Türkiye dışında olduğu için hesap bilgilerin yurt dışında işlenir. Yasal bir zorunluluk olursa bilgilerini yetkili kurumlarla da paylaşabiliriz.",
  ]],
  ["Ne kadar saklıyoruz", [
    "Hesap bilgilerin hesabın açık olduğu sürece saklanır. Hesabının silinmesini istersen, kanunen saklamamız gereken kayıtlar dışında bilgilerin silinir. Teknik kayıtlar sağlayıcıların belirlediği sınırlı sürelerle tutulur.",
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
    "Raporlara yazdığın müşteri bilgileri senin işinle ilgili bilgilerdir ve senin cihazında kalır. Bu bilgileri toplarken ve saklarken KVKK'dan doğan yükümlülükler (örneğin müşterini bilgilendirmek) sana aittir.",
  ]],
  ["Değişiklikler", [
    "Bu politikayı güncellersek bu sayfadaki tarihi değiştiririz. Önemli değişiklikleri ayrıca duyururuz.",
  ]],
  ["İletişim", [
    `Bu politikayla ilgili her soru ve başvurun için: ${E}`,
  ]],
];

export default function Gizlilik() {
  return (
    <YasalSayfa
      baslik="Gizlilik politikası"
      tarih="16 Ekim 2026"
      giris="Bu sayfa, Fixnote'u kullanırken hangi kişisel verilerinin işlendiğini, nerede saklandığını ve hangi haklara sahip olduğunu anlatır. Temel ilkemiz basit: servis kayıtların senin cihazında kalır."
      bolumler={BOLUMLER}
    />
  );
}
