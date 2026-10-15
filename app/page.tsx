/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Ikon, { Isaret } from "./components/Ikon";
import { SureHesap, OrnekRapor, IsDongu, Fiyat } from "./components/LandingParcalar";
import {
  type Rapor, DEMO_FIRMA, DEMO_RAPORLAR, SABLONLAR, hesapla, tl, tarihTR, ozet, musteriler, waMetin, telefonGoster, demoFoto, demoImza,
} from "./lib/servis";

// ---------- maket verisi: hepsi motorun demo kayıtlarından hesaplanır ----------
const DEMO_GUN = "2026-10-03";
const AY = DEMO_GUN.slice(0, 7);
const OZ = ozet(DEMO_RAPORLAR, AY);
const SIRALI = [...DEMO_RAPORLAR].sort((a, b) => (b.tarih + b.saat).localeCompare(a.tarih + a.saat));
const YAKLASAN = DEMO_RAPORLAR.filter((r) => r.sonrakiBakim && r.sonrakiBakim > DEMO_GUN).sort((a, b) => a.sonrakiBakim.localeCompare(b.sonrakiBakim));
const GUNLER = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(2026, 8, 27 + i);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { g: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"][d.getDay()], n: DEMO_RAPORLAR.filter((r) => r.tarih === iso).length };
});
const MAXG = Math.max(1, ...GUNLER.map((x) => x.n));
const ORNEK = DEMO_RAPORLAR.find((r) => r.no === "SR-2026-0048")!;
const AYSE = musteriler(DEMO_RAPORLAR).find((m) => m.ad === "Ayşe Kaplan")!;
const BEKLEYEN_N = DEMO_RAPORLAR.filter((r) => r.odeme === "bekliyor").length;

function Durum({ r }: { r: Rapor }) {
  if (r.odeme === "bekliyor") return <span className="pill warn">Ödeme bekliyor</span>;
  if (r.odeme === "garanti") return <span className="pill info">Garanti</span>;
  return <span className="pill ok">Gönderildi</span>;
}
const buyuk = (s: string) => s.toLocaleUpperCase("tr-TR");

// ================= HERO MAKETİ =================
function PanelMaket() {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "20px 20px 0 0", boxShadow: "0 -2px 40px rgba(16,39,58,.07)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 5, background: "var(--line-2)" }} />)}
        <span style={{ margin: "0 auto", fontSize: 11, color: "var(--faint)", fontWeight: 600, paddingRight: 40 }}>Fixnote · panel</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", minHeight: 430 }}>
        <div style={{ borderRight: "1px solid var(--line)", padding: "16px 10px", background: "var(--panel)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13, padding: "0 6px 14px" }}><Isaret boy={18} />Fixnote</div>
          {[["belge", "Raporlar", true], ["kisiler", "Müşteriler", false], ["ayar", "Firma ve şablonlar", false]].map(([ik, t, on]) => (
            <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: on ? "var(--ink)" : "var(--muted)", background: on ? "var(--tile)" : "none" }}>
              <Ikon ad={ik as string} boy={14} style={{ color: on ? "var(--accent)" : "var(--faint)" }} />{t as string}
            </div>
          ))}
          <div className="mini" style={{ padding: "18px 8px 6px" }}>Şablonlar</div>
          {SABLONLAR.slice(0, 4).map((s) => <div key={s.id} style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, padding: "4px 8px", display: "flex", justifyContent: "space-between" }}>{s.ad}<span style={{ color: "var(--faint)" }}>{s.maddeler.length}</span></div>)}
        </div>
        <div style={{ padding: "18px 20px", paddingRight: 250, background: "#fff" }}>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em" }}>Günaydın Emre.</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{DEMO_FIRMA.ad} · 3 Ekim 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mini">Bu ay rapor</span><span className="pill ok" style={{ fontSize: 9 }}>%{OZ.imzali} imzalı</span></div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
                <span className="num" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>{OZ.adet}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 34, flex: 1 }}>
                  {GUNLER.map((x, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: 4 + (x.n / MAXG) * 22, borderRadius: 3, background: i === 6 ? "var(--accent)" : x.n ? "#a9cfdb" : "var(--tile)" }} />
                      <div style={{ fontSize: 7.5, color: "var(--faint)", fontWeight: 700, marginTop: 2 }}>{x.g}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <span className="mini">Bu ay tutar</span>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>{tl(OZ.ciro)}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>KDV dahil</div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px" }}>
              <span className="mini">Tahsil bekleyen</span>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 6 }}>{tl(OZ.bekleyen)}</div>
              <span className="pill warn" style={{ fontSize: 9, marginTop: 3 }}>{BEKLEYEN_N} rapor</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 10, padding: "9px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="arti" boy={13} kalinlik={2.6} /></span>Yeni servis formu</div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "9px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}><Ikon ad="ara" boy={14} />Müşteri, telefon, seri no ara</div>
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, marginTop: 10, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", fontSize: 12, fontWeight: 800 }}>Son raporlar<span style={{ fontSize: 10.5, color: "var(--faint)" }}>Tümü</span></div>
            {SIRALI.slice(0, 4).map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderTop: "1px solid var(--line)" }}>
                <span className="doc-ico" style={{ width: 26, height: 26, borderRadius: 7 }}><Ikon ad="belge" boy={13} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.no} · {buyuk(r.musteri.ad)}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}><Durum r={r} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{r.hizmet} · {r.cihaz.marka || r.cihaz.model}</span></div>
                </div>
                <span className="num" style={{ fontSize: 10, color: "var(--faint)", fontWeight: 700 }}>{tarihTR(r.tarih).slice(0, 5)}</span>
                <Ikon ad="sag" boy={12} style={{ color: "var(--faint)" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TelefonMaket({ kucuk = false }: { kucuk?: boolean }) {
  return (
    <div style={{ width: kucuk ? 280 : 292, background: "#fff", borderRadius: 46, padding: 6, border: "1px solid var(--line)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ borderRadius: 40, background: "var(--panel)", boxShadow: "inset 0 0 0 1px var(--line)", padding: "14px 14px 18px", overflow: "hidden" }}>
        <div style={{ width: 70, height: 6, borderRadius: 4, background: "var(--line)", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Isaret boy={22} />
          <span style={{ display: "flex", gap: 6 }}>
            {["takvim", "ayar"].map((x) => <span key={x} style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid var(--line)", background: "#fff", display: "grid", placeItems: "center", color: "var(--muted)" }}><Ikon ad={x} boy={13} /></span>)}
          </span>
        </div>
        <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 12 }}>Günaydın Emre</div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>3 Ekim Cumartesi · bu ay {OZ.adet} rapor</div>
        <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 10, padding: "8px 11px", fontSize: 10.5, fontWeight: 700, marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,.6)" }}>Firma</span><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Akyol Isı ve Klima</span><span style={{ marginLeft: "auto", color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" }}>2 teknisyen</span>
        </div>
        <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 14, padding: "14px 14px", marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 14 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="belge" boy={16} /></span>
          Yeni servis formu<Ikon ad="ok" boy={16} style={{ marginLeft: "auto" }} />
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "9px 11px", marginTop: 8, display: "flex", gap: 9, alignItems: "center" }}>
          <span style={{ width: 24, height: 24, borderRadius: 12, border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--muted)" }}><Ikon ad="mesaj" boy={12} /></span>
          <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 11, fontWeight: 800 }}>Son rapor gönderildi</span><span style={{ display: "block", fontSize: 9.5, color: "var(--muted)", fontWeight: 600 }}>{ORNEK.no} · {ORNEK.musteri.ad}</span></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14 }}>
          <b style={{ fontSize: 13.5 }}>Yaklaşan bakımlar</b><span style={{ fontSize: 10.5, color: "var(--accent)", fontWeight: 800 }}>Tümü</span>
        </div>
        {YAKLASAN.slice(0, kucuk ? 2 : 3).map((r, i) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 10px", marginTop: 7, display: "flex", gap: 10, alignItems: "stretch" }}>
            <div className="num" style={{ fontSize: 11, fontWeight: 800, lineHeight: 1.25, minWidth: 38 }}>{tarihTR(r.sonrakiBakim).slice(0, 5)}<div style={{ fontSize: 9, color: "var(--faint)" }}>{r.sonrakiBakim.slice(0, 4)}</div></div>
            <span style={{ width: 2, borderRadius: 2, background: i === 0 ? "var(--accent)" : "var(--line-2)" }} />
            <div style={{ minWidth: 0 }}>
              <div className="mini" style={{ fontSize: 8 }}>{r.hizmet}</div>
              <div style={{ fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.musteri.ad}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= SORUN: kağıt yığını =================
function KagitYigini() {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: 230, height: 190, margin: "0 auto" }}>
      {[-7, 4, -3, 6, -1].map((r, i) => (
        <div key={i} style={{ position: "absolute", left: 10 + (i % 2) * 8, right: 10 - (i % 2) * 8, top: 26 + i * 26, height: 64, transform: `rotate(${r}deg)`, background: ["#efe6d3", "#f6f1e6", "#e8dcc4", "#faf7f0", "#efe6d3"][i], border: "1px solid #d9cdb3", borderRadius: 3, boxShadow: "0 4px 10px rgba(80,60,20,.08)" }}>
          {[0, 1, 2].map((j) => <div key={j} style={{ height: 2, background: "#d6c9ad", margin: `${j === 0 ? 14 : 8}px 16px 0`, width: `${70 - j * 15}%` }} />)}
        </div>
      ))}
    </div>
  );
}

function Bildirim({ ik, kim, ne, t, style }: { ik: string; kim: string; ne: string; t: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", boxShadow: "0 14px 32px rgba(16,39,58,.16)", display: "flex", gap: 10, width: 260, ...style }}>
      <span style={{ flex: "none", width: 30, height: 30, borderRadius: 8, background: "var(--bad-soft)", color: "var(--bad)", display: "grid", placeItems: "center" }}><Ikon ad={ik} boy={15} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800 }}>{kim} <span style={{ fontWeight: 600, color: "var(--faint)", fontSize: 10.5, marginLeft: 4 }}>{t}</span></div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.4, marginTop: 1 }}>{ne}</div>
      </div>
    </div>
  );
}

// ================= SAYFA =================
const SSS = [
  ["Uygulama indirmek gerekiyor mu?", "Hayır. Telefonun tarayıcısında açılır. İstersen ana ekrana ekleyip uygulama gibi kullanırsın. Sayfa bir kez açıldıktan sonra form, çekmeyen bodrum katta da doldurulur; kayıt telefona yazılır."],
  ["PDF nasıl oluşuyor?", "\"PDF olarak kaydet\" düğmesi raporu A4 olarak yazdırma ekranına gönderir; hedef olarak \"PDF olarak kaydet\" seçersin. Android ve iPhone'da da çalışır."],
  ["WhatsApp'a PDF ekleniyor mu?", "WhatsApp düğmesi müşterinin numarasına rapor özetini (rapor no, yapılan işlemler, toplam, teknisyen) hazır mesaj olarak açar. Kaydettiğin PDF'i aynı sohbete ek olarak eklersin."],
  ["Hangi işler için uygun?", "Müşterinin evine ya da işyerine gidip iş teslim eden herkes için: kombi ve klima servisleri, beyaz eşya tamircileri, ilaçlama firmaları, elektrikçi ve tesisatçılar, asansör bakımı, kamera ve alarm kurulumu."],
  ["Kendi kontrol listemi ekleyebilir miyim?", "Evet. Ayarlar'da şablon adı ve her satıra bir işlem yazarsın; yeni formda hizmet türü olarak çıkar ve maddeler hazır işaretli gelir."],
  ["Bu bir e-fatura mı?", "Hayır. Fixnote iş teslim raporudur: ne yapıldı, ne değişti, müşteri onayladı mı. Faturayı mevcut yönteminle kesmeye devam edersin."],
  ["Kayıtlar nerede duruyor?", "Telefonunun tarayıcısında. Sunucuya veri gitmez. Ayarlar'dan tek dosyalık yedek indirip başka cihaza yükleyebilirsin."],
];

export default function Home() {
  const wa = waMetin(ORNEK, DEMO_FIRMA);
  return (
    <main>
      {/* NAV: yüzen kart */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, padding: "12px 16px 0" }}>
        <nav className="mx-auto flex max-w-[1120px] items-center justify-between gap-3" style={{ background: "rgba(255,255,255,.88)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid var(--line)", borderRadius: 18, boxShadow: "var(--shadow-sm)", padding: "9px 10px 9px 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</Link>
          <div className="hidden items-center gap-7 lg:flex" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--muted)" }}>
            <a href="#nasil" className="hover:text-[var(--ink)]">Nasıl çalışır</a>
            <a href="#rapor" className="hover:text-[var(--ink)]">Rapor</a>
            <a href="#sablon" className="hover:text-[var(--ink)]">Şablonlar</a>
            <a href="#fiyat" className="hover:text-[var(--ink)]">Fiyat</a>
            <a href="#sss" className="hover:text-[var(--ink)]">SSS</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hidden sm:inline" style={{ fontSize: 13.5, fontWeight: 700 }}>Uygulamayı aç</Link>
            <Link href="/app?yeni=1" className="btn" style={{ padding: "9px 14px", fontSize: 13, borderRadius: 11 }}>İlk raporu oluştur</Link>
          </div>
        </nav>
      </div>

      {/* HERO */}
      <section style={{ paddingTop: 64 }}>
        <div className="mx-auto max-w-[1120px] px-4 text-center">
          <span className="eyebrow" style={{ textTransform: "none", letterSpacing: 0, fontSize: 12, fontWeight: 700, padding: "6px 14px", color: "var(--ink)" }}>
            <Ikon ad="anahtar" boy={14} style={{ color: "var(--accent)" }} />Kombi, klima, beyaz eşya ve ilaçlama servisleri için
          </span>
          <h1 className="h1" style={{ marginTop: 22 }}>
            İmzalı servis raporu,<br /><span style={{ color: "#6f8396" }}>kapıdan çıkmadan gider.</span>
          </h1>
          <p className="sub mx-auto" style={{ maxWidth: 640, marginTop: 20, fontSize: 16 }}>
            Teknisyen telefondan formu doldurur, müşteriye parmağıyla imzalatır. Temiz bir A4 rapor bir dakikada hazır: PDF olarak kaydet, WhatsApp&apos;tan gönder.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Örnek raporları gör</Link>
          </div>
        </div>
        <div className="relative mx-auto mt-14 max-w-[1160px] px-4">
          <div className="hidden lg:block" style={{ marginRight: 40, height: 440, overflow: "hidden" }}><PanelMaket /></div>
          <div className="hidden lg:block suz" style={{ position: "absolute", right: 16, top: -28 }}><TelefonMaket /></div>
          <div className="flex justify-center lg:hidden" style={{ height: 520, overflow: "hidden" }}><TelefonMaket kucuk /></div>
        </div>
      </section>

      {/* SORUN: önce / sonra */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">Rapor sahada biter,<br />akşam ofiste değil.</h2>
            <p className="sub mt-3">Her şey iş yapılırken, teknisyenin telefonunda.</p>
          </div>
          <div className="mt-14 grid items-center gap-14 md:grid-cols-2">
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--tile)", borderColor: "var(--tile)" }}>Kağıt koçanla</span>
              <div className="relative mx-auto mt-6" style={{ maxWidth: 420, height: 330 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 60 }}><KagitYigini /></div>
                <div className="suz" style={{ position: "absolute", left: 0, top: 6 }}><Bildirim ik="telefon" kim="Hakan Bey" t="2 gün önce" ne="“Pompayı değiştirdiğinizi nereden bileyim? Ödemeyi yapmıyorum.”" /></div>
                <div className="suz2" style={{ position: "absolute", right: 0, top: 128 }}><Bildirim ik="kalem" kim="Murat, Buca servisi" t="dün 21:40" ne="“Karbon kopya silik çıkmış, seri no okunmuyor.”" style={{ width: 240 }} /></div>
                <div className="suz" style={{ position: "absolute", left: 10, bottom: 0 }}><Bildirim ik="saat" kim="Hatırlatma" t="3 gün" ne="12 servis fişi temize çekilmeyi bekliyor." style={{ width: 250 }} /></div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>Her şey dağınık</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>Kim neyi değiştirdi, kimse bilmiyor.</div>
            </div>
            <div className="text-center">
              <span className="eyebrow" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" }}>Fixnote ile</span>
              <div className="card mx-auto mt-6 text-left" style={{ maxWidth: 430, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>Kombi bakımı · Erzene Mah.</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>3 Ekim Cumartesi · {ORNEK.teknisyen}</div>
                  </div>
                  <span className="pill ok" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Ikon ad="tik" boy={11} kalinlik={3} />Tamamlandı</span>
                </div>
                {[
                  ["belge", "Form sahada dolduruldu", "15:32", "9 madde, 2 parça, KDV'li toplam.", "var(--info-soft)", "var(--info)"],
                  ["imza", "Müşteri imzaladı", "15:38", "Ayşe Hanım parmağıyla, telefonun ekranına.", "var(--accent-soft)", "var(--accent)"],
                  ["mesaj", "WhatsApp'tan gönderildi", "15:40", "PDF rapor kapıdan çıkmadan müşteride.", "var(--ok-soft)", "var(--ok)"],
                ].map(([ik, t, s, d, bg, fg]) => (
                  <div key={t} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ flex: "none", width: 34, height: 34, borderRadius: 9, background: bg, color: fg, display: "grid", placeItems: "center" }}><Ikon ad={ik} boy={17} /></span>
                    <div><div style={{ fontWeight: 800, fontSize: 13.5 }}>{t} <span className="num" style={{ fontSize: 11, color: "var(--faint)", marginLeft: 4 }}>{s}</span></div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
                  </div>
                ))}
                <div style={{ background: "var(--panel)", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 800, color: "var(--muted)" }}>Akşam temize çekmek yok.</div>
              </div>
              <div style={{ fontWeight: 800, marginTop: 22 }}>Her şey tek yerde</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>Müşteri imzalı raporunu aynı gün alır.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SÜRE HESABI */}
      <section>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <div>
            <span className="eyebrow">Zaman kazan</span>
            <h2 className="h2 mt-4">Servis fişleri sana ayda kaç saate mal oluyor?</h2>
            <p className="sub mt-4" style={{ maxWidth: 440 }}>Ayda kaç rapor yazdığını ve bir raporun bugün kaç dakikanı aldığını seç.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 8, fontSize: 14, fontWeight: 700 }}>
              {["Koçanı doldurmak, kopyayı ayırmak", "Akşam fişleri temize çekmek", "Fotoğrafları bulup müşteriye ayrıca atmak", "\"Hangi parçayı taktınız\" telefonlarına bakmak"].map((x) => (
                <li key={x} style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--accent)" }} />{x}</li>
              ))}
            </ul>
          </div>
          <SureHesap />
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Servis raporu, sadeleşti</span>
            <h2 className="h2 mt-4">Rapor yazmak hiç bu kadar kısa sürmemişti.</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 560 }}>Sen iş yaparken formu doldurursun, Fixnote A4 raporu dizer ve göndermeye hazırlar. Araca binmeden iş kapanır.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {/* 1 */}
            <div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 4 }}>{[0, 1, 2, 3, 4, 5].map((i) => <span key={i} style={{ height: 3, borderRadius: 2, background: i < 5 ? "var(--accent)" : "var(--line-2)" }} />)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                  {[["kisiler", "Ayşe Kaplan"], ["anahtar", "Kombi bakımı"]].map(([ik, t]) => <span key={t} style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px", fontSize: 10.5, fontWeight: 800, display: "flex", gap: 5, alignItems: "center" }}><Ikon ad={ik} boy={11} style={{ color: "var(--muted)" }} />{t}</span>)}
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Fotoğraflar</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                  <img src={demoFoto("once")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <img src={demoFoto("sonra")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 7 }} />
                  <span style={{ border: "1.5px dashed var(--line-2)", borderRadius: 7, display: "grid", placeItems: "center", color: "var(--faint)" }}><Ikon ad="kamera" boy={15} /></span>
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Kontrol listesi</div>
                {SABLONLAR[0].maddeler.slice(0, 3).map((m, i) => (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, padding: "5px 0", color: i === 2 ? "var(--faint)" : "var(--ink)" }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m}</span>
                    <span style={{ flex: "none", width: 26, height: 15, borderRadius: 8, background: i === 2 ? "var(--line-2)" : "var(--accent)", position: "relative" }}><span style={{ position: "absolute", top: 2, left: i === 2 ? 2 : 13, width: 11, height: 11, borderRadius: 6, background: "#fff" }} /></span>
                  </div>
                ))}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, marginTop: 8, padding: "6px 10px" }}>
                  <div className="mini" style={{ fontSize: 8.5 }}>Müşteri imzası</div>
                  <img src={demoImza(31)} alt="" style={{ height: 34, display: "block", margin: "0 auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num" style={{ flex: "none", width: 20, height: 20, borderRadius: 6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>1</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>Formu sahada doldur</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Hizmeti seç, liste hazır gelir. Yapılmayanı kapat, fotoğrafı çek, imzalat.</div></div>
              </div>
            </div>
            {/* 2 */}
            <div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" }}>
                <div style={{ width: "100%", maxWidth: 250, background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 16, boxShadow: "var(--shadow-md)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={16} /></span>
                    <div><div style={{ fontWeight: 800, fontSize: 13 }}>A4 rapor diziliyor</div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>{ORNEK.no}</div></div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "var(--tile)", marginTop: 14, overflow: "hidden" }}><div style={{ width: "72%", height: "100%", background: "var(--accent)" }} /></div>
                  {[["Firma başlığı ve rapor no", true], ["Kontrol listesi, parça, KDV", true], ["Fotoğraf ve imza", false]].map(([t, ok]) => (
                    <div key={t as string} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, fontWeight: 700, marginTop: 9, color: ok ? "var(--ink)" : "var(--faint)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 8, display: "grid", placeItems: "center", background: ok ? "var(--ok-soft)" : "var(--tile)", color: "var(--ok)" }}>{ok ? <Ikon ad="tik" boy={10} kalinlik={3} /> : null}</span>{t as string}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num" style={{ flex: "none", width: 20, height: 20, borderRadius: 6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>2</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>Rapor kendiliğinden dizilir</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Firma logon, numara, parça tablosu ve KDV&apos;li toplam tek sayfada.</div></div>
              </div>
            </div>
            {/* 3 */}
            <div>
              <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 18, height: 330, padding: 16, display: "grid", placeItems: "center" }}>
                <div style={{ width: "100%", maxWidth: 260, textAlign: "center" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 17, border: "1.5px solid var(--ok)", color: "var(--ok)", display: "inline-grid", placeItems: "center" }}><Ikon ad="tik" boy={18} kalinlik={2.6} /></span>
                  <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>Raporun hazır</div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 12, textAlign: "left" }}>
                    <div className="mini" style={{ fontSize: 8.5 }}>Dosya</div>
                    <div style={{ fontSize: 11.5, fontWeight: 800, marginTop: 2 }}>{ORNEK.no} {ORNEK.musteri.ad}.pdf</div>
                    <div style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>3 Ekim 2026 · 1 sayfa</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                    {[["indir", "PDF"], ["kalem", "Düzenle"]].map(([ik, t]) => <span key={t} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 9, padding: "7px", fontSize: 11, fontWeight: 800, display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}><Ikon ad={ik} boy={12} />{t}</span>)}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginTop: 6, textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>WhatsApp&apos;la gönder</div>
                    <div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{telefonGoster(ORNEK.musteri.telefon)}</div>
                    <div style={{ background: "var(--ok)", color: "#fff", borderRadius: 8, padding: "7px", fontSize: 11, fontWeight: 800, textAlign: "center", marginTop: 7 }}>Raporu gönder</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <span className="num" style={{ flex: "none", width: 20, height: 20, borderRadius: 6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>3</span>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>PDF kaydet, WhatsApp&apos;la gönder</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>Müşterinin numarasına hazır mesaj açılır, PDF&apos;i ekleyip gönderirsin.</div></div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Örnek raporları gör</Link>
          </div>
        </div>
      </section>

      {/* RAPOR GÖRÜNÜMÜ */}
      <section id="rapor" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Müşterinin eline geçen sayfa</span>
            <h2 className="h2 mt-4">Senin firmanın raporu.</h2>
            <p className="sub mt-3">Logon, vergi bilgin ve garanti notun başlıkta. İş değişir, sayfa hep aynı düzende kalır.</p>
          </div>
          <div className="mt-12"><OrnekRapor /></div>
        </div>
      </section>

      {/* KOYU BANT: iş */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-14 text-center">
          <div style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,.66)" }}>Fixnote senin işine uyar</div>
          <div className="h2" style={{ marginTop: 10, color: "#fff", minHeight: "1.1em" }}><IsDongu /></div>
        </div>
      </section>

      {/* ŞABLON EDİTÖRÜ */}
      <section id="sablon" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-28">
          <div className="text-center">
            <span className="eyebrow">Şablon editörü</span>
            <h2 className="h2 mt-4">Kendi kontrol listeni kur.</h2>
            <p className="sub mx-auto mt-3" style={{ maxWidth: 540 }}>Beş hazır şablonla başlarsın. Asansör, su arıtma, kamera kurulumu: kendi işin için her satıra bir madde yaz, formda hazır gelsin.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-[1fr_300px]">
            <div style={{ background: "var(--tile)", border: "1px solid var(--line)", borderRadius: 20, padding: 14, display: "grid", gap: 10 }}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[["belge", "Şablon adı", "Asansör periyodik bakım"], ["anahtar", "Cihaz türü", "Asansör"]].map(([ik, k, v]) => (
                  <div key={k} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ width: 28, height: 28 }}><Ikon ad={ik} boy={14} /></span>
                    <div><div className="mini">{k}</div><div style={{ fontWeight: 800, fontSize: 13.5 }}>{v}</div></div>
                  </div>
                ))}
              </div>
              {["Fren sistemi kontrol edildi", "Kapı kilitleri ve emniyet devresi test edildi", "Halat ve makaralar yağlandı", "Kabin aydınlatması ve alarm butonu denendi"].map((m, i) => (
                <div key={m} style={{ background: "#fff", border: i === 3 ? "1.5px solid var(--accent)" : "1px solid var(--line)", borderRadius: 12, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: i === 3 ? "0 0 0 4px var(--accent-soft)" : "none" }}>
                  <span className="num" style={{ fontSize: 11, color: "var(--faint)", fontWeight: 800, width: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{m}{i === 3 && <span style={{ display: "inline-block", width: 1.5, height: 15, background: "var(--accent)", marginLeft: 2, verticalAlign: "middle" }} />}</span>
                  <span style={{ flex: "none", width: 30, height: 17, borderRadius: 9, background: "var(--accent)", position: "relative" }}><span style={{ position: "absolute", top: 2, left: 15, width: 13, height: 13, borderRadius: 7, background: "#fff" }} /></span>
                </div>
              ))}
              <div style={{ border: "1.5px dashed var(--line-2)", borderRadius: 12, padding: "11px 12px", fontSize: 13, fontWeight: 700, color: "var(--faint)", display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="arti" boy={14} />Madde ekle</div>
            </div>
            <div className="card" style={{ borderRadius: 20, padding: 12 }}>
              <div className="mini" style={{ padding: "4px 6px 8px" }}>Hazır şablonlar</div>
              {SABLONLAR.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="liste" boy={14} style={{ color: "var(--faint)" }} />{s.ad}</span>
                  <span className="num" style={{ fontSize: 11, color: "var(--faint)" }}>{s.maddeler.length} madde</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "var(--ink)", color: "#fff", borderRadius: 10, padding: "9px 10px", fontSize: 13, fontWeight: 800 }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={14} kalinlik={2.6} />Asansör periyodik bakım</span>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.6)" }}>senin</span>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 190 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 190 }}>Uygulamayı aç</Link>
          </div>
        </div>
      </section>

      {/* MÜŞTERİ GEÇMİŞİ (referansın yapay zeka kutusu yerine) */}
      <section style={{ background: "#fff", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div className="text-center">
            <h2 className="h2">Müşteri aradığında her şey önünde.</h2>
            <p className="sub mt-3">Telefon numarasından bütün servis geçmişi, ekstra kayıt tutmadan.</p>
          </div>
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2" style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 24, padding: "clamp(20px, 4vw, 44px)" }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>“Geçen sene kombiye ne yapmıştınız?” sorusuna 5 saniyede cevap.</h3>
              <div style={{ marginTop: 20 }}>
                {[
                  ["Telefondan bütün geçmiş", "Hangi cihaz, ne zaman, ne değişti, ne kadar ödendi."],
                  ["Kayıtlı cihaz tek dokunuşla", "Marka, model ve seri no yeni forma kendiliğinden gelir."],
                  ["Sonraki bakım raporda", "Tarih müşterinin elindeki sayfada, senin panelinde."],
                  ["Bekleyen tahsilat görünür", "Ödemesi kalan raporlar ayrı rozetle işaretli."],
                ].map(([t, d], i) => (
                  <div key={t} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <Ikon ad="tik" boy={17} kalinlik={2.4} style={{ color: "var(--accent)", marginTop: 1 }} />
                    <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full" style={{ maxWidth: 400, minHeight: 330 }}>
              <span className="pill ok suz2" style={{ position: "absolute", left: "18%", top: 0, display: "inline-flex", gap: 5, alignItems: "center", padding: "4px 10px", fontSize: 11, boxShadow: "var(--shadow-sm)" }}><Ikon ad="tik" boy={11} kalinlik={3} />Kayıtlı müşteri bulundu</span>
              <div className="card" style={{ position: "absolute", left: 0, right: 30, top: 34, borderRadius: 14, padding: 16, boxShadow: "var(--shadow-md)" }}>
                <div className="mini">Müşteri kartı</div>
                <div style={{ fontWeight: 800, fontSize: 17, marginTop: 4 }}>{AYSE.ad}</div>
                <div className="num" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{telefonGoster(AYSE.telefon)} · Bornova</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
                  {[["Servis", String(AYSE.sayi)], ["Toplam", tl(AYSE.toplam).replace(",00", "")], ["Bekleyen", tl(AYSE.bekleyen).replace(",00", "")]].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 9, padding: "7px 9px" }}><div className="mini" style={{ fontSize: 8.5 }}>{k}</div><div className="num" style={{ fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="card suz" style={{ position: "absolute", right: 0, top: 196, borderRadius: 12, padding: "9px 12px", boxShadow: "var(--shadow-md)", maxWidth: 250 }}>
                <div className="mini" style={{ fontSize: 8.5 }}>Kayıtlı cihaz</div>
                <div style={{ fontSize: 12.5, fontWeight: 800 }}>{AYSE.cihazlar[0].marka} {AYSE.cihazlar[0].model}</div>
                <div className="num" style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600 }}>SN {AYSE.cihazlar[0].seriNo}</div>
              </div>
              <div className="card suz2" style={{ position: "absolute", left: 14, top: 262, borderRadius: 12, padding: "9px 12px", boxShadow: "var(--shadow-md)", display: "flex", gap: 9, alignItems: "center" }}>
                <span className="doc-ico" style={{ width: 28, height: 28, background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="takvim" boy={14} /></span>
                <div><div className="mini" style={{ fontSize: 8.5 }}>Sonraki bakım</div><div className="num" style={{ fontSize: 12.5, fontWeight: 800 }}>{tarihTR(ORNEK.sonrakiBakim)} · kombi</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FİYAT */}
      <section id="fiyat" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[1000px] px-4 py-20 md:py-28">
          <div className="text-center">
            <h2 className="h2">Ücretsiz dene, ekibin büyüdükçe ekle.</h2>
            <p className="sub mt-3">14 gün bütün özellikler açık. Sonra teknisyen başına sabit ücret.</p>
          </div>
          <div className="mt-12"><Fiyat /></div>
        </div>
      </section>

      {/* KOYU BANT: önce / sonra */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:items-center">
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Ne kazanırsın</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.12, marginTop: 8 }}>Rapor, sen kapıdan çıkmadan müşteride.</div>
          </div>
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Önce</div>
            {["Karbon kopyalı koçan", "Akşam ofiste temize çekmek", "İki gün sonra göndermek"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.5)", textDecoration: "line-through" }}><Ikon ad="carpi" boy={14} />{x}</div>
            ))}
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.14)", paddingLeft: 24 }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.55)" }}>Fixnote ile</div>
            {["İş yapılırken doldurulur", "Telefonda imzalanır", "Kapıdan çıkmadan gider"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 800 }}><Ikon ad="tik" boy={15} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{x}</div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section style={{ background: "#fff" }}>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <span className="pill ok" style={{ fontSize: 11.5, padding: "4px 10px" }}>Müşterinin zaten kullandığı yerden</span>
            <h2 className="h2 mt-4">Rapor WhatsApp&apos;tan gider, e-posta beklemez.</h2>
            <p className="sub mt-4" style={{ maxWidth: 460 }}>Müşterinin numarasına rapor özeti hazır mesaj olarak açılır: rapor no, yapılan işlemler, değişen parça, KDV&apos;li toplam ve teknisyen. PDF&apos;i aynı sohbete eklersin.</p>
            <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
              {[["indir", "PDF olarak kaydet", "Telefonun yazdırma ekranından tek sayfa A4, Android ve iPhone'da."], ["mesaj", "Hazır mesaj", "Numara 05xx diye yazılsa da doğru biçime çevrilir. Mesajı göndermeden önce görürsün."]].map(([ik, t, d]) => (
                <div key={t} style={{ display: "flex", gap: 12 }}>
                  <span className="doc-ico" style={{ width: 34, height: 34 }}><Ikon ad={ik} boy={16} /></span>
                  <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/app?yeni=1" className="btn">İlk raporu oluştur</Link>
              <Link href="/app" className="btn btn-ghost">Örnek raporları gör</Link>
            </div>
          </div>
          <div style={{ background: "var(--dark)", borderRadius: 22, padding: "36px 16px 0", display: "flex", justifyContent: "center", overflow: "hidden", height: 470 }}>
            <div style={{ width: 290, background: "#fff", borderRadius: "40px 40px 0 0", padding: "6px 6px 0" }}>
              <div style={{ background: "#efeae2", borderRadius: "34px 34px 0 0", height: "100%", overflow: "hidden" }}>
                <div style={{ background: "#fff", padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, background: "var(--tile)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 12, color: "var(--muted)" }}>AK</span>
                  <div><div style={{ fontSize: 12.5, fontWeight: 800 }}>{ORNEK.musteri.ad}</div><div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{telefonGoster(ORNEK.musteri.telefon)}</div></div>
                </div>
                <div style={{ padding: 12 }}>
                  <div style={{ background: "#dcf3d0", borderRadius: "12px 4px 12px 12px", padding: "9px 10px", fontSize: 10.5, lineHeight: 1.45, whiteSpace: "pre-wrap", color: "#1c2735", boxShadow: "0 1px 1px rgba(0,0,0,.06)", marginLeft: 18 }}>{wa}</div>
                  <div style={{ background: "#dcf3d0", borderRadius: 10, padding: "8px 10px", marginTop: 8, marginLeft: 18, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 26, height: 30, borderRadius: 4, background: "#fff", display: "grid", placeItems: "center", color: "var(--bad)", fontSize: 8, fontWeight: 800 }}>PDF</span>
                    <span style={{ fontSize: 10.5, fontWeight: 800 }}>{ORNEK.no} {ORNEK.musteri.ad}.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section id="sss" style={{ scrollMarginTop: 80 }}>
        <div className="mx-auto max-w-[760px] px-4 py-20 md:py-28">
          <h2 className="h2 text-center">Sık sorulan sorular</h2>
          <div className="mt-10" style={{ display: "grid", gap: 10 }}>
            {SSS.map(([s, c], i) => (
              <details key={s} className="sss card" open={i === 0} style={{ borderRadius: 14, padding: "16px 18px", boxShadow: "none" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 14.5 }}>
                  {s}<Ikon ad="asagi" boy={17} className="ok-ic" style={{ color: "var(--accent)", transition: "transform .2s" }} />
                </summary>
                <p style={{ margin: "10px 0 0", fontSize: 14, color: "var(--muted)", fontWeight: 600, lineHeight: 1.6 }}>{c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SON CTA */}
      <section style={{ borderTop: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[800px] px-4 py-20 text-center md:py-24">
          <span className="eyebrow">2 dakikada dene</span>
          <h2 className="h2 mt-4">Bir sonraki servisi<br />kağıtsız kapat.</h2>
          <p className="sub mt-3">Telefonundan aç, ilk raporu oluştur, müşteriye imzalat. Kurulum yok, kart yok.</p>
          <Link href="/app?yeni=1" className="btn mt-7" style={{ minWidth: 200, padding: "14px 22px" }}>İlk raporu oluştur</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.66)", overflow: "hidden" }}>
        <div className="mx-auto max-w-[900px] px-4 pt-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.03em" }}><Isaret boy={24} />Fixnote</div>
              <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.6, marginTop: 10, maxWidth: 280 }}>Teknisyenin sahada servis raporunu doldurup imzalatması ve WhatsApp&apos;tan göndermesi için. Kayıtlar senin cihazında durur.</p>
            </div>
            {[
              ["Ürün", [["Nasıl çalışır", "#nasil"], ["Rapor", "#rapor"], ["Şablonlar", "#sablon"], ["Fiyat", "#fiyat"]]],
              ["Kimler için", [["Kombi ve klima", "#sablon"], ["Beyaz eşya", "#sablon"], ["İlaçlama", "#sablon"], ["Elektrik", "#sablon"]]],
              ["Daha fazla", [["SSS", "#sss"], ["Uygulamayı aç", "/app"], ["Yeni form", "/app?yeni=1"]]],
            ].map(([b, l]) => (
              <div key={b as string}>
                <div className="mini" style={{ color: "rgba(255,255,255,.45)" }}>{b as string}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8, fontSize: 13, fontWeight: 600 }}>
                  {(l as string[][]).map(([t, h]) => <li key={t}><a href={h} className="hover:text-white">{t}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between" style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 40, paddingTop: 18, fontSize: 12, fontWeight: 600 }}>
            <span>© 2026 Fixnote</span>
            <span>Bu bir e-fatura değil, iş teslim raporudur.</span>
          </div>
        </div>
        <div aria-hidden="true" style={{ textAlign: "center", fontWeight: 800, fontSize: "clamp(56px, 12vw, 170px)", letterSpacing: "-0.06em", lineHeight: 0.8, color: "#243246", marginTop: 30, marginBottom: -18, whiteSpace: "nowrap" }}>Fixnote</div>
      </footer>
    </main>
  );
}
