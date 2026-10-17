import type { Metadata } from "next";
import YasalSayfa, { type Bolum } from "../components/YasalSayfa";
import { ABONELIK_EPOSTA, DENEME_GUN } from "../components/supabase";

export const metadata: Metadata = {
  title: "Kullanım koşulları · Fixnote",
  description: "Fixnote'u kullanırken geçerli olan koşullar: hesap, deneme, abonelik, kayıtlar ve sorumluluklar.",
};

const E = ABONELIK_EPOSTA;

const BOLUMLER: Bolum[] = [
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
    "İki paket vardır: Usta (bir teknisyen) ve Firma (sınırsız teknisyen). İkisi de aylık ya da yıllık açılır; yıllık ödemede 12 ay için 10 ayın ücreti ödenir.",
    "Fiyatlar ABD doları üzerinden belirlenir. Ödeme ve fatura Türk lirasıdır; ödeme günündeki Türkiye Cumhuriyet Merkez Bankası döviz satış kuru uygulanır. Yıllık ödemede tutar ödeme günü sabitlenir.",
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

export default function Kosullar() {
  return (
    <YasalSayfa
      baslik="Kullanım koşulları"
      tarih="17 Ekim 2026"
      giris="Fixnote'a hesap açarak ya da Fixnote'u kullanarak bu koşulları kabul etmiş olursun. Kişisel verilerinle ilgili ayrıntılar Gizlilik politikası sayfasındadır."
      bolumler={BOLUMLER}
    />
  );
}
