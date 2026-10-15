/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import Ikon, { Isaret } from "./components/Ikon";
import { SureHesap, OrnekRapor, IsDongu, Fiyat } from "./components/LandingParcalar";
import {
  type Rapor, DEMO_FIRMA, DEMO_RAPORLAR, SABLONLAR, tl, tarihTR, ozet, musteriler, waMetin, telefonGoster, demoFoto, demoImza,
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

// ortak bölüm kickeri: kısa aksan çizgisi + cümle düzeni etiket (tracked-caps hap değil)
function Kick({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}

// ================= HERO MAKETİ: servis konsolu + telefon =================
function PanelMaket() {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
      {/* tarayıcı noktaları yerine ledger başlık şeridi */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: "1px solid var(--line)", background: "var(--panel)" }}>
        <Isaret boy={16} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "-0.01em" }}>Fixnote · panel</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "172px 1fr", minHeight: 430 }}>
        <div style={{ borderRight: "1px solid var(--line)", padding: "16px 10px", background: "var(--panel)" }}>
          <div className="font-display" style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13, padding: "0 6px 14px" }}><Isaret boy={18} />Fixnote</div>
          {[["belge", "Raporlar", true], ["kisiler", "Müşteriler", false], ["ayar", "Firma ve şablonlar", false]].map(([ik, t, on]) => (
            <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 8px", borderRadius: 6, fontSize: 11.5, fontWeight: 600, color: on ? "var(--ink)" : "var(--muted)", background: on ? "var(--paper)" : "none", boxShadow: on ? "inset 2px 0 0 var(--accent)" : "none" }}>
              <Ikon ad={ik as string} boy={14} style={{ color: on ? "var(--accent)" : "var(--faint)" }} />{t as string}
            </div>
          ))}
          <div className="mini" style={{ padding: "18px 8px 6px" }}>Şablonlar</div>
          {SABLONLAR.slice(0, 4).map((s) => <div key={s.id} style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, padding: "4px 8px", display: "flex", justifyContent: "space-between" }}>{s.ad}<span className="num" style={{ color: "var(--faint)" }}>{s.maddeler.length}</span></div>)}
        </div>
        <div style={{ padding: "18px 20px", background: "#fff" }}>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 600 }}>Günaydın Emre.</div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{DEMO_FIRMA.ad} · 3 Ekim 2026</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 0, marginTop: 14, border: "1px solid var(--line)", borderRadius: 7, overflow: "hidden" }}>
            <div style={{ padding: "10px 12px", borderRight: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span className="mini">Bu ay rapor</span><span className="pill ok nodot" style={{ fontSize: 9 }}>%{OZ.imzali} imzalı</span></div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
                <span className="num font-display" style={{ fontSize: 26, fontWeight: 600 }}>{OZ.adet}</span>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 34, flex: 1 }}>
                  {GUNLER.map((x, i) => (
                    <div key={i} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: 4 + (x.n / MAXG) * 22, borderRadius: 1, background: i === 6 ? "var(--accent)" : x.n ? "#9cc6d2" : "var(--tile)" }} />
                      <div style={{ fontSize: 7.5, color: "var(--faint)", fontWeight: 600, marginTop: 2 }}>{x.g}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "10px 12px", borderRight: "1px solid var(--line)" }}>
              <span className="mini">Bu ay tutar</span>
              <div className="num font-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{tl(OZ.ciro)}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>KDV dahil</div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <span className="mini">Tahsil bekleyen</span>
              <div className="num font-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>{tl(OZ.bekleyen)}</div>
              <span className="pill warn nodot" style={{ fontSize: 9, marginTop: 3 }}>{BEKLEYEN_N} rapor</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 6, padding: "9px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 20, height: 20, borderRadius: 4, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="arti" boy={13} kalinlik={2.6} /></span>Yeni servis formu</div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 6, padding: "9px 12px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}><Ikon ad="ara" boy={14} />Müşteri, telefon, seri no ara</div>
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 7, marginTop: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", fontSize: 12, fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Son raporlar<span style={{ fontSize: 10.5, color: "var(--accent)", fontWeight: 600 }}>Tümü</span></div>
            {SIRALI.slice(0, 4).map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", borderTop: "1px solid var(--line)" }}>
                <span className="doc-ico" style={{ width: 26, height: 26, borderRadius: 5 }}><Ikon ad="belge" boy={13} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="num" style={{ fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.no} · {buyuk(r.musteri.ad)}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}><Durum r={r} /><span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>{r.hizmet} · {r.cihaz.marka || r.cihaz.model}</span></div>
                </div>
                <span className="num" style={{ fontSize: 10, color: "var(--faint)", fontWeight: 600 }}>{tarihTR(r.tarih).slice(0, 5)}</span>
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
    <div style={{ width: kucuk ? 280 : 288, background: "#fff", borderRadius: 34, padding: 6, border: "1px solid var(--line-2)", boxShadow: "var(--shadow-lg)" }}>
      <div style={{ borderRadius: 28, background: "var(--panel)", boxShadow: "inset 0 0 0 1px var(--line)", padding: "14px 14px 18px", overflow: "hidden" }}>
        <div style={{ width: 54, height: 5, borderRadius: 3, background: "var(--line-2)", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Isaret boy={22} />
          <span style={{ display: "flex", gap: 6 }}>
            {["takvim", "ayar"].map((x) => <span key={x} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--line)", background: "#fff", display: "grid", placeItems: "center", color: "var(--muted)" }}><Ikon ad={x} boy={13} /></span>)}
          </span>
        </div>
        <div className="font-display" style={{ fontSize: 21, fontWeight: 600, marginTop: 12 }}>Günaydın Emre</div>
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>3 Ekim Cumartesi · bu ay {OZ.adet} rapor</div>
        <div style={{ background: "var(--ink)", color: "#fff", borderRadius: 6, padding: "8px 11px", fontSize: 10.5, fontWeight: 600, marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,.6)" }}>Firma</span><span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Akyol Isı ve Klima</span><span style={{ marginLeft: "auto", color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" }}>2 teknisyen</span>
        </div>
        <div style={{ background: "var(--accent)", color: "#fff", borderRadius: 8, padding: "14px 14px", marginTop: 10, display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 14 }}>
          <span style={{ width: 30, height: 30, borderRadius: 7, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Ikon ad="belge" boy={16} /></span>
          Yeni servis formu<Ikon ad="ok" boy={16} style={{ marginLeft: "auto" }} />
        </div>
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 7, padding: "9px 11px", marginTop: 8, display: "flex", gap: 9, alignItems: "center" }}>
          <span style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid var(--line)", display: "grid", placeItems: "center", color: "var(--muted)" }}><Ikon ad="mesaj" boy={12} /></span>
          <span style={{ minWidth: 0 }}><span style={{ display: "block", fontSize: 11, fontWeight: 700 }}>Son rapor gönderildi</span><span className="num" style={{ display: "block", fontSize: 9.5, color: "var(--muted)", fontWeight: 500 }}>{ORNEK.no} · {ORNEK.musteri.ad}</span></span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 14 }}>
          <b style={{ fontSize: 13.5 }}>Yaklaşan bakımlar</b><span style={{ fontSize: 10.5, color: "var(--accent)", fontWeight: 700 }}>Tümü</span>
        </div>
        {YAKLASAN.slice(0, kucuk ? 2 : 3).map((r, i) => (
          <div key={r.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 7, padding: "8px 10px", marginTop: 7, display: "flex", gap: 10, alignItems: "stretch" }}>
            <div className="num" style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.25, minWidth: 38 }}>{tarihTR(r.sonrakiBakim).slice(0, 5)}<div style={{ fontSize: 9, color: "var(--faint)" }}>{r.sonrakiBakim.slice(0, 4)}</div></div>
            <span style={{ width: 2, borderRadius: 1, background: i === 0 ? "var(--accent)" : "var(--line-2)" }} />
            <div style={{ minWidth: 0 }}>
              <div className="mini" style={{ fontSize: 8 }}>{r.hizmet}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.musteri.ad}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= SORUN: işaretlenmiş karbon koçan =================
function KocanKarti() {
  return (
    <div aria-hidden="true" style={{ position: "relative", width: "100%", maxWidth: 300, margin: "0 auto" }}>
      {/* altta kayık ikinci/üçüncü koçan */}
      <div style={{ position: "absolute", inset: "14px -10px -10px 14px", background: "#f1ece0", border: "1px solid #d9cdb3", borderRadius: 4, transform: "rotate(2.2deg)" }} />
      <div style={{ position: "absolute", inset: "8px -4px -4px 6px", background: "#f6f1e6", border: "1px solid #ddd2ba", borderRadius: 4, transform: "rotate(-1.4deg)" }} />
      {/* üstteki koçan (yazısız illüstrasyon) */}
      <div style={{ position: "relative", background: "#faf7ef", border: "1px solid #d9cdb3", borderRadius: 4, padding: "16px 16px 18px", boxShadow: "0 10px 26px -14px rgba(80,60,20,.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #cbbd9c", paddingBottom: 10 }}>
          <span style={{ height: 8, width: 92, borderRadius: 2, background: "#d8c9a6" }} />
          <span style={{ height: 6, width: 44, borderRadius: 2, background: "#e4d8ba" }} />
        </div>
        {[72, 60, 66].map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 13 }}>
            <span style={{ height: 5, width: 52, borderRadius: 2, background: "#e0d2af", flex: "none" }} />
            <span style={{ flex: 1, borderBottom: "1px dashed #c3b48f", height: 1 }} />
            <span style={{ height: 5, width: `${w - 40}px`, borderRadius: 2, background: "#e8ddc2", flex: "none" }} />
          </div>
        ))}
        <div style={{ marginTop: 16, height: 46, border: "1px dashed #c3b48f", borderRadius: 3, display: "grid", placeItems: "center", transform: "rotate(-5deg)" }}>
          <span style={{ width: 118, height: 22, border: "1.5px solid #c0493c", borderRadius: 3, opacity: .55 }} />
        </div>
      </div>
    </div>
  );
}

function KenarNot({ ik, kim, ne, t, style }: { ik: string; kim: string; ne: string; t: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderLeft: "3px solid var(--bad)", borderRadius: 6, padding: "10px 12px", boxShadow: "var(--shadow-md)", display: "flex", gap: 10, width: 258, ...style }}>
      <span style={{ flex: "none", width: 28, height: 28, borderRadius: 6, background: "var(--bad-soft)", color: "var(--bad)", display: "grid", placeItems: "center" }}><Ikon ad={ik} boy={15} /></span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700 }}>{kim} <span style={{ fontWeight: 500, color: "var(--faint)", fontSize: 10.5, marginLeft: 4 }}>{t}</span></div>
        <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500, lineHeight: 1.4, marginTop: 1 }}>{ne}</div>
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
      {/* NAV: tam genişlik düz bar, alt hairline */}
      <div style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(239,238,232,.82)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
        <nav className="mx-auto flex max-w-[1160px] items-center justify-between gap-3 px-4" style={{ height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 18, letterSpacing: "-0.01em" }}><Isaret boy={24} /><span className="font-display" style={{ fontWeight: 600 }}>Fixnote</span></Link>
          <div className="hidden items-center gap-7 lg:flex" style={{ fontSize: 14, fontWeight: 500, color: "var(--muted)" }}>
            <a href="#nasil" className="hover:text-[var(--ink)]">Nasıl çalışır</a>
            <a href="#rapor" className="hover:text-[var(--ink)]">Rapor</a>
            <a href="#sablon" className="hover:text-[var(--ink)]">Şablonlar</a>
            <a href="#fiyat" className="hover:text-[var(--ink)]">Fiyat</a>
            <a href="#sss" className="hover:text-[var(--ink)]">SSS</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hidden sm:inline" style={{ fontSize: 14, fontWeight: 600 }}>Uygulamayı aç</Link>
            <Link href="/app?yeni=1" className="btn" style={{ padding: "9px 15px", fontSize: 13 }}>İlk raporu oluştur</Link>
          </div>
        </nav>
      </div>

      {/* HERO: sola yaslı asimetrik */}
      <section>
        <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]" style={{ paddingTop: 56, paddingBottom: 64 }}>
          <div>
            <Kick><Ikon ad="anahtar" boy={14} style={{ color: "var(--accent)" }} />Kombi, klima, beyaz eşya ve ilaçlama servisleri için</Kick>
            <h1 className="h1" style={{ marginTop: 20 }}>
              İmzalı servis raporu,<br />kapıdan çıkmadan gider.
            </h1>
            <p className="sub" style={{ maxWidth: 520, marginTop: 20 }}>
              Teknisyen telefondan formu doldurur, müşteriye parmağıyla imzalatır. Temiz bir A4 rapor bir dakikada hazır: PDF olarak kaydet, WhatsApp&apos;tan gönder.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link href="/app?yeni=1" className="btn" style={{ minWidth: 180 }}>İlk raporu oluştur</Link>
              <Link href="/app" className="btn btn-ghost" style={{ minWidth: 180 }}>Örnek raporları gör</Link>
            </div>
          </div>
          <div className="relative">
            <div className="hidden lg:block" style={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--panel)", padding: "14px 14px 0", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
              <PanelMaket />
            </div>
            <div className="hidden lg:block suz" style={{ position: "absolute", right: -26, bottom: -92, transform: "scale(.72)", transformOrigin: "bottom right" }}><TelefonMaket /></div>
            <div className="flex justify-center lg:hidden"><TelefonMaket kucuk /></div>
          </div>
        </div>
      </section>

      {/* SORUN: önce / sonra */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 560 }}>
            <h2 className="h2">Rapor sahada biter,<br />akşam ofiste değil.</h2>
            <p className="sub mt-3">Her şey iş yapılırken, teknisyenin telefonunda.</p>
          </div>
          <div className="mt-14 grid items-stretch gap-6 md:grid-cols-2">
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "22px 20px", background: "var(--bg)" }}>
              <span className="eyebrow" style={{ background: "var(--tile)", borderColor: "var(--line-2)" }}>Kağıt koçanla</span>
              <div className="relative mx-auto mt-8" style={{ maxWidth: 420, minHeight: 340 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 16 }}><KocanKarti /></div>
                <div className="suz" style={{ position: "absolute", left: -6, top: 0, zIndex: 2 }}><KenarNot ik="telefon" kim="Hakan Bey" t="2 gün önce" ne="“Pompayı değiştirdiğinizi nereden bileyim? Ödemeyi yapmıyorum.”" /></div>
                <div className="suz2" style={{ position: "absolute", right: -8, top: 150, zIndex: 2 }}><KenarNot ik="kalem" kim="Murat, Buca servisi" t="dün 21:40" ne="“Karbon kopya silik çıkmış, seri no okunmuyor.”" style={{ width: 238 }} /></div>
                <div className="suz" style={{ position: "absolute", left: 6, bottom: -6, zIndex: 2 }}><KenarNot ik="saat" kim="Hatırlatma" t="3 gün" ne="12 servis fişi temize çekilmeyi bekliyor." style={{ width: 248 }} /></div>
              </div>
              <div style={{ fontWeight: 700, marginTop: 20 }}>Her şey dağınık</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>Kim neyi değiştirdi, kimse bilmiyor.</div>
            </div>
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "22px 20px", background: "var(--paper)" }}>
              <span className="eyebrow" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "#fff" }}>Fixnote ile</span>
              <div className="mt-8" style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--paper)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "14px 16px", borderBottom: "1px solid var(--line)", background: "var(--panel)" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Kombi bakımı · Erzene Mah.</div>
                    <div className="num" style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500 }}>3 Ekim Cumartesi · {ORNEK.teknisyen}</div>
                  </div>
                  <span className="pill ok"><Ikon ad="tik" boy={11} kalinlik={3} />Tamamlandı</span>
                </div>
                {[
                  ["belge", "Form sahada dolduruldu", "15:32", "9 madde, 2 parça, KDV'li toplam.", "var(--info-soft)", "var(--info)"],
                  ["imza", "Müşteri imzaladı", "15:38", "Ayşe Hanım parmağıyla, telefonun ekranına.", "var(--accent-soft)", "var(--accent)"],
                  ["mesaj", "WhatsApp'tan gönderildi", "15:40", "PDF rapor kapıdan çıkmadan müşteride.", "var(--ok-soft)", "var(--ok)"],
                ].map(([ik, t, s, d, bg, fg]) => (
                  <div key={t} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
                    <span style={{ flex: "none", width: 34, height: 34, borderRadius: 7, background: bg, color: fg, display: "grid", placeItems: "center" }}><Ikon ad={ik} boy={17} /></span>
                    <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{t} <span className="num" style={{ fontSize: 11, color: "var(--faint)", marginLeft: 4 }}>{s}</span></div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{d}</div></div>
                  </div>
                ))}
                <div style={{ background: "var(--panel)", textAlign: "center", padding: "10px", fontSize: 12, fontWeight: 700, color: "var(--muted)" }}>Akşam temize çekmek yok.</div>
              </div>
              <div style={{ fontWeight: 700, marginTop: 20 }}>Her şey tek yerde</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>Müşteri imzalı raporunu aynı gün alır.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SÜRE HESABI */}
      <section>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <div>
            <Kick>Zaman kazan</Kick>
            <h2 className="h2 mt-4">Servis fişleri sana ayda kaç saate mal oluyor?</h2>
            <p className="sub mt-4" style={{ maxWidth: 440 }}>Ayda kaç rapor yazdığını ve bir raporun bugün kaç dakikanı aldığını seç.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "grid", gap: 2, fontSize: 14, fontWeight: 500 }}>
              {["Koçanı doldurmak, kopyayı ayırmak", "Akşam fişleri temize çekmek", "Fotoğrafları bulup müşteriye ayrıca atmak", "\"Hangi parçayı taktınız\" telefonlarına bakmak"].map((x) => (
                <li key={x} style={{ display: "flex", gap: 11, alignItems: "center", padding: "9px 0", borderTop: "1px solid var(--line)" }}><Ikon ad="carpi" boy={14} style={{ color: "var(--faint)" }} />{x}</li>
              ))}
            </ul>
          </div>
          <SureHesap />
        </div>
      </section>

      {/* NASIL ÇALIŞIR */}
      <section id="nasil" style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", scrollMarginTop: 72 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 580 }}>
            <Kick>Servis raporu, sadeleşti</Kick>
            <h2 className="h2 mt-4">Rapor yazmak hiç bu kadar kısa sürmemişti.</h2>
            <p className="sub mt-3" style={{ maxWidth: 560 }}>Sen iş yaparken formu doldurursun, Fixnote A4 raporu dizer ve göndermeye hazırlar. Araca binmeden iş kapanır.</p>
          </div>
          <div className="mt-14 grid gap-0 md:grid-cols-3" style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "var(--paper)" }}>
            {/* 1 */}
            <div style={{ borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)" }} className="md:border-b-0">
              <div style={{ background: "var(--panel)", height: 320, padding: 16, overflow: "hidden", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {[["kisiler", "Ayşe Kaplan"], ["anahtar", "Kombi bakımı"]].map(([ik, t]) => <span key={t} style={{ flex: 1, background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "6px 8px", fontSize: 10.5, fontWeight: 700, display: "flex", gap: 5, alignItems: "center" }}><Ikon ad={ik} boy={11} style={{ color: "var(--muted)" }} />{t}</span>)}
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Fotoğraflar</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 }}>
                  <img src={demoFoto("once")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 5 }} />
                  <img src={demoFoto("sonra")} alt="" style={{ width: "100%", height: 46, objectFit: "cover", borderRadius: 5 }} />
                  <span style={{ border: "1.5px dashed var(--line-2)", borderRadius: 5, display: "grid", placeItems: "center", color: "var(--faint)" }}><Ikon ad="kamera" boy={15} /></span>
                </div>
                <div className="mini" style={{ marginTop: 12 }}>Kontrol listesi</div>
                {SABLONLAR[0].maddeler.slice(0, 3).map((m, i) => (
                  <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 600, padding: "5px 0", color: i === 2 ? "var(--faint)" : "var(--ink)" }}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m}</span>
                    <span style={{ flex: "none", width: 16, height: 16, borderRadius: 4, border: i === 2 ? "1.5px solid var(--line-2)" : "none", background: i === 2 ? "transparent" : "var(--accent)", display: "grid", placeItems: "center", color: "#fff" }}>{i === 2 ? null : <Ikon ad="tik" boy={10} kalinlik={3} />}</span>
                  </div>
                ))}
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, marginTop: 8, padding: "6px 10px" }}>
                  <div className="mini" style={{ fontSize: 8.5 }}>Müşteri imzası</div>
                  <img src={demoImza(31)} alt="" style={{ height: 34, display: "block", margin: "0 auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "16px 16px" }}>
                <span className="num font-display" style={{ flex: "none", width: 24, height: 24, borderRadius: 5, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 13, fontWeight: 600, display: "grid", placeItems: "center" }}>1</span>
                <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>Formu sahada doldur</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>Hizmeti seç, liste hazır gelir. Yapılmayanı kapat, fotoğrafı çek, imzalat.</div></div>
              </div>
            </div>
            {/* 2 */}
            <div style={{ borderBottom: "1px solid var(--line)", borderRight: "1px solid var(--line)" }} className="md:border-b-0">
              <div style={{ background: "var(--panel)", height: 320, padding: 16, display: "grid", placeItems: "center", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: "100%", maxWidth: 250, background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 16 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="belge" boy={16} /></span>
                    <div><div style={{ fontWeight: 700, fontSize: 13 }}>A4 rapor diziliyor</div><div className="num" style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>{ORNEK.no}</div></div>
                  </div>
                  <div style={{ height: 5, borderRadius: 2, background: "var(--tile)", marginTop: 14, overflow: "hidden" }}><div style={{ width: "72%", height: "100%", background: "var(--accent)" }} /></div>
                  {[["Firma başlığı ve rapor no", true], ["Kontrol listesi, parça, KDV", true], ["Fotoğraf ve imza", false]].map(([t, ok]) => (
                    <div key={t as string} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, fontWeight: 600, marginTop: 9, color: ok ? "var(--ink)" : "var(--faint)" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, display: "grid", placeItems: "center", background: ok ? "var(--ok-soft)" : "var(--tile)", color: "var(--ok)" }}>{ok ? <Ikon ad="tik" boy={10} kalinlik={3} /> : null}</span>{t as string}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "16px 16px" }}>
                <span className="num font-display" style={{ flex: "none", width: 24, height: 24, borderRadius: 5, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 13, fontWeight: 600, display: "grid", placeItems: "center" }}>2</span>
                <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>Rapor kendiliğinden dizilir</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>Firma logon, numara, parça tablosu ve KDV&apos;li toplam tek sayfada.</div></div>
              </div>
            </div>
            {/* 3 */}
            <div>
              <div style={{ background: "var(--panel)", height: 320, padding: 16, display: "grid", placeItems: "center", borderBottom: "1px solid var(--line)" }}>
                <div style={{ width: "100%", maxWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--ok-soft)", color: "var(--ok)", display: "grid", placeItems: "center" }}><Ikon ad="tik" boy={16} kalinlik={2.6} /></span>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Raporun hazır</div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px", marginTop: 12 }}>
                    <div className="mini" style={{ fontSize: 8.5 }}>Dosya</div>
                    <div className="num" style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{ORNEK.no} {ORNEK.musteri.ad}.pdf</div>
                    <div className="num" style={{ fontSize: 10, color: "var(--faint)", fontWeight: 500 }}>3 Ekim 2026 · 1 sayfa</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 6 }}>
                    {[["indir", "PDF"], ["kalem", "Düzenle"]].map(([ik, t]) => <span key={t} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "7px", fontSize: 11, fontWeight: 700, display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}><Ikon ad={ik} boy={12} />{t}</span>)}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 6, padding: "8px 10px", marginTop: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>WhatsApp&apos;la gönder</div>
                    <div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500, marginTop: 1 }}>{telefonGoster(ORNEK.musteri.telefon)}</div>
                    <div style={{ background: "var(--ok)", color: "#fff", borderRadius: 5, padding: "7px", fontSize: 11, fontWeight: 700, textAlign: "center", marginTop: 7 }}>Raporu gönder</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, padding: "16px 16px" }}>
                <span className="num font-display" style={{ flex: "none", width: 24, height: 24, borderRadius: 5, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: 13, fontWeight: 600, display: "grid", placeItems: "center" }}>3</span>
                <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>PDF kaydet, WhatsApp&apos;la gönder</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginTop: 2 }}>Müşterinin numarasına hazır mesaj açılır, PDF&apos;i ekleyip gönderirsin.</div></div>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 180 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 180 }}>Örnek raporları gör</Link>
          </div>
        </div>
      </section>

      {/* RAPOR GÖRÜNÜMÜ */}
      <section id="rapor" style={{ scrollMarginTop: 72 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 560 }}>
            <Kick>Müşterinin eline geçen sayfa</Kick>
            <h2 className="h2 mt-4">Senin firmanın raporu.</h2>
            <p className="sub mt-3">Logon, vergi bilgin ve garanti notun başlıkta. İş değişir, sayfa hep aynı düzende kalır.</p>
          </div>
          <div className="mt-12"><OrnekRapor /></div>
        </div>
      </section>

      {/* KOYU BANT: iş */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-16 md:flex md:items-baseline md:gap-6">
          <div style={{ fontSize: 14.5, fontWeight: 500, color: "rgba(255,255,255,.62)", whiteSpace: "nowrap" }}>Fixnote senin işine uyar</div>
          <div className="h2" style={{ marginTop: 10, color: "#fff", minHeight: "1.1em" }}><IsDongu /></div>
        </div>
      </section>

      {/* ŞABLON EDİTÖRÜ */}
      <section id="sablon" style={{ scrollMarginTop: 72 }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 560 }}>
            <Kick>Şablon editörü</Kick>
            <h2 className="h2 mt-4">Kendi kontrol listeni kur.</h2>
            <p className="sub mt-3" style={{ maxWidth: 540 }}>Beş hazır şablonla başlarsın. Asansör, su arıtma, kamera kurulumu: kendi işin için her satıra bir madde yaz, formda hazır gelsin.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-[1fr_300px]">
            <div style={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, padding: 14, display: "grid", gap: 10 }}>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {[["belge", "Şablon adı", "Asansör periyodik bakım"], ["anahtar", "Cihaz türü", "Asansör"]].map(([ik, k, v]) => (
                  <div key={k} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 7, padding: "10px 12px", display: "flex", gap: 10, alignItems: "center" }}>
                    <span className="doc-ico" style={{ width: 28, height: 28 }}><Ikon ad={ik} boy={14} /></span>
                    <div><div className="mini">{k}</div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{v}</div></div>
                  </div>
                ))}
              </div>
              {["Fren sistemi kontrol edildi", "Kapı kilitleri ve emniyet devresi test edildi", "Halat ve makaralar yağlandı", "Kabin aydınlatması ve alarm butonu denendi"].map((m, i) => (
                <div key={m} style={{ background: "#fff", border: i === 3 ? "1.5px solid var(--accent)" : "1px solid var(--line)", borderRadius: 7, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10, boxShadow: i === 3 ? "0 0 0 3px var(--accent-soft)" : "none" }}>
                  <span className="num" style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700, width: 16 }}>{i + 1}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, flex: 1 }}>{m}{i === 3 && <span style={{ display: "inline-block", width: 1.5, height: 15, background: "var(--accent)", marginLeft: 2, verticalAlign: "middle" }} />}</span>
                  <span style={{ flex: "none", width: 20, height: 20, borderRadius: 5, background: "var(--accent)", display: "grid", placeItems: "center", color: "#fff" }}><Ikon ad="tik" boy={12} kalinlik={3} /></span>
                </div>
              ))}
              <div style={{ border: "1.5px dashed var(--line-2)", borderRadius: 7, padding: "11px 12px", fontSize: 13, fontWeight: 600, color: "var(--faint)", display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="arti" boy={14} />Madde ekle</div>
            </div>
            <div className="card" style={{ padding: 12 }}>
              <div className="mini" style={{ padding: "4px 6px 8px" }}>Hazır şablonlar</div>
              {SABLONLAR.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, borderTop: "1px solid var(--line)", padding: "9px 8px", fontSize: 13, fontWeight: 600 }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="liste" boy={14} style={{ color: "var(--faint)" }} />{s.ad}</span>
                  <span className="num" style={{ fontSize: 11, color: "var(--faint)" }}>{s.maddeler.length} madde</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: "var(--ink)", color: "#fff", borderRadius: 6, padding: "9px 10px", fontSize: 13, fontWeight: 700, marginTop: 10 }}>
                <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Ikon ad="tik" boy={14} kalinlik={2.6} />Asansör periyodik bakım</span>
                <span style={{ fontSize: 10.5, color: "rgba(255,255,255,.6)" }}>senin</span>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-2.5">
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 180 }}>İlk raporu oluştur</Link>
            <Link href="/app" className="btn btn-ghost" style={{ minWidth: 180 }}>Uygulamayı aç</Link>
          </div>
        </div>
      </section>

      {/* MÜŞTERİ GEÇMİŞİ */}
      <section style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="mx-auto max-w-[1120px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 560 }}>
            <h2 className="h2">Müşteri aradığında her şey önünde.</h2>
            <p className="sub mt-3">Telefon numarasından bütün servis geçmişi, ekstra kayıt tutmadan.</p>
          </div>
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2" style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 12, padding: "clamp(20px, 4vw, 44px)" }}>
            <div>
              <h3 className="font-display" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.2, margin: 0 }}>“Geçen sene kombiye ne yapmıştınız?” sorusuna 5 saniyede cevap.</h3>
              <div style={{ marginTop: 20 }}>
                {[
                  ["Telefondan bütün geçmiş", "Hangi cihaz, ne zaman, ne değişti, ne kadar ödendi."],
                  ["Kayıtlı cihaz tek dokunuşla", "Marka, model ve seri no yeni forma kendiliğinden gelir."],
                  ["Sonraki bakım raporda", "Tarih müşterinin elindeki sayfada, senin panelinde."],
                  ["Bekleyen tahsilat görünür", "Ödemesi kalan raporlar ayrı rozetle işaretli."],
                ].map(([t, d], i) => (
                  <div key={t} style={{ display: "flex", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                    <Ikon ad="tik" boy={17} kalinlik={2.4} style={{ color: "var(--accent)", marginTop: 1 }} />
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div><div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 500 }}>{d}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full" style={{ maxWidth: 400, minHeight: 330 }}>
              <span className="pill ok suz2" style={{ position: "absolute", left: "18%", top: 0, fontSize: 11, boxShadow: "var(--shadow-sm)", padding: "4px 10px" }}><Ikon ad="tik" boy={11} kalinlik={3} />Kayıtlı müşteri bulundu</span>
              <div className="card" style={{ position: "absolute", left: 0, right: 30, top: 34, padding: 16, boxShadow: "var(--shadow-md)" }}>
                <div className="mini">Müşteri kartı</div>
                <div className="font-display" style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>{AYSE.ad}</div>
                <div className="num" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{telefonGoster(AYSE.telefon)} · Bornova</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 12, border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                  {[["Servis", String(AYSE.sayi)], ["Toplam", tl(AYSE.toplam).replace(",00", "")], ["Bekleyen", tl(AYSE.bekleyen).replace(",00", "")]].map(([k, v], i) => (
                    <div key={k} style={{ padding: "7px 9px", borderRight: i < 2 ? "1px solid var(--line)" : "none" }}><div className="mini" style={{ fontSize: 8.5 }}>{k}</div><div className="num" style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="card suz" style={{ position: "absolute", right: 0, top: 196, padding: "9px 12px", boxShadow: "var(--shadow-md)", maxWidth: 250 }}>
                <div className="mini" style={{ fontSize: 8.5 }}>Kayıtlı cihaz</div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{AYSE.cihazlar[0].marka} {AYSE.cihazlar[0].model}</div>
                <div className="num" style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>SN {AYSE.cihazlar[0].seriNo}</div>
              </div>
              <div className="card suz2" style={{ position: "absolute", left: 14, top: 262, padding: "9px 12px", boxShadow: "var(--shadow-md)", display: "flex", gap: 9, alignItems: "center" }}>
                <span className="doc-ico" style={{ width: 28, height: 28, background: "var(--accent-soft)", color: "var(--accent)" }}><Ikon ad="takvim" boy={14} /></span>
                <div><div className="mini" style={{ fontSize: 8.5 }}>Sonraki bakım</div><div className="num" style={{ fontSize: 12.5, fontWeight: 700 }}>{tarihTR(ORNEK.sonrakiBakim)} · kombi</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FİYAT */}
      <section id="fiyat" style={{ scrollMarginTop: 72 }}>
        <div className="mx-auto max-w-[1000px] px-4 py-20 md:py-24">
          <div style={{ maxWidth: 560 }}>
            <h2 className="h2">Ücretsiz dene, ekibin büyüdükçe ekle.</h2>
            <p className="sub mt-3">14 gün bütün özellikler açık. Sonra teknisyen başına sabit ücret.</p>
          </div>
          <div className="mt-12"><Fiyat /></div>
        </div>
      </section>

      {/* KOYU BANT: önce / sonra */}
      <section style={{ background: "var(--dark)", color: "#fff" }}>
        <div className="mx-auto grid max-w-[1120px] gap-10 px-4 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:items-start">
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.5)" }}>Ne kazanırsın</div>
            <div className="font-display" style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15, marginTop: 10 }}>Rapor, sen kapıdan çıkmadan müşteride.</div>
          </div>
          <div>
            <div className="mini" style={{ color: "rgba(255,255,255,.5)" }}>Önce</div>
            {["Karbon kopyalı koçan", "Akşam ofiste temize çekmek", "İki gün sonra göndermek"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.5)", textDecoration: "line-through" }}><Ikon ad="carpi" boy={14} />{x}</div>
            ))}
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,.14)", paddingLeft: 24 }}>
            <div className="mini" style={{ color: "rgba(255,255,255,.5)" }}>Fixnote ile</div>
            {["İş yapılırken doldurulur", "Telefonda imzalanır", "Kapıdan çıkmadan gider"].map((x) => (
              <div key={x} style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 10, fontSize: 14, fontWeight: 600 }}><Ikon ad="tik" boy={15} kalinlik={2.6} style={{ color: "#7cc4d6" }} />{x}</div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP */}
      <section style={{ background: "var(--paper)" }}>
        <div className="mx-auto grid max-w-[1120px] items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-24">
          <div>
            <Kick>Müşterinin zaten kullandığı yerden</Kick>
            <h2 className="h2 mt-4">Rapor WhatsApp&apos;tan gider, e-posta beklemez.</h2>
            <p className="sub mt-4" style={{ maxWidth: 460 }}>Müşterinin numarasına rapor özeti hazır mesaj olarak açılır: rapor no, yapılan işlemler, değişen parça, KDV&apos;li toplam ve teknisyen. PDF&apos;i aynı sohbete eklersin.</p>
            <div style={{ display: "grid", gap: 2, marginTop: 20 }}>
              {[["indir", "PDF olarak kaydet", "Telefonun yazdırma ekranından tek sayfa A4, Android ve iPhone'da."], ["mesaj", "Hazır mesaj", "Numara 05xx diye yazılsa da doğru biçime çevrilir. Mesajı göndermeden önce görürsün."]].map(([ik, t, d]) => (
                <div key={t} style={{ display: "flex", gap: 12, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
                  <span className="doc-ico" style={{ width: 34, height: 34 }}><Ikon ad={ik} boy={16} /></span>
                  <div><div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/app?yeni=1" className="btn">İlk raporu oluştur</Link>
              <Link href="/app" className="btn btn-ghost">Örnek raporları gör</Link>
            </div>
          </div>
          <div style={{ background: "var(--dark)", borderRadius: 12, padding: "36px 16px 0", display: "flex", justifyContent: "center", overflow: "hidden", height: 470 }}>
            <div style={{ width: 290, background: "#fff", borderRadius: "28px 28px 0 0", padding: "6px 6px 0" }}>
              <div style={{ background: "#efeae2", borderRadius: "22px 22px 0 0", height: "100%", overflow: "hidden" }}>
                <div style={{ background: "#fff", padding: "16px 14px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--line)" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 15, background: "var(--tile)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12, color: "var(--muted)" }}>AK</span>
                  <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{ORNEK.musteri.ad}</div><div className="num" style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>{telefonGoster(ORNEK.musteri.telefon)}</div></div>
                </div>
                <div style={{ padding: 12 }}>
                  <div className="num" style={{ background: "#dcf3d0", borderRadius: "10px 3px 10px 10px", padding: "9px 10px", fontSize: 10.5, lineHeight: 1.45, whiteSpace: "pre-wrap", color: "#1c2735", boxShadow: "0 1px 1px rgba(0,0,0,.06)", marginLeft: 18 }}>{wa}</div>
                  <div style={{ background: "#dcf3d0", borderRadius: 8, padding: "8px 10px", marginTop: 8, marginLeft: 18, display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ width: 26, height: 30, borderRadius: 4, background: "#fff", display: "grid", placeItems: "center", color: "var(--bad)", fontSize: 8, fontWeight: 800 }}>PDF</span>
                    <span className="num" style={{ fontSize: 10.5, fontWeight: 700 }}>{ORNEK.no} {ORNEK.musteri.ad}.pdf</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SSS */}
      <section id="sss" style={{ scrollMarginTop: 72 }}>
        <div className="mx-auto max-w-[820px] px-4 py-20 md:py-24">
          <h2 className="h2">Sık sorulan sorular</h2>
          <div className="mt-10" style={{ border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden", background: "var(--paper)" }}>
            {SSS.map(([s, c], i) => (
              <details key={s} className="sss" open={i === 0} style={{ borderTop: i ? "1px solid var(--line)" : "none", padding: "16px 18px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 15 }}>
                  {s}<Ikon ad="asagi" boy={17} className="ok-ic" style={{ color: "var(--accent)", transition: "transform .2s", flex: "none" }} />
                </summary>
                <p style={{ margin: "10px 0 0", fontSize: 14.5, color: "var(--muted)", fontWeight: 400, lineHeight: 1.6 }}>{c}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SON CTA */}
      <section style={{ borderTop: "1px solid var(--line)", background: "var(--paper)" }}>
        <div className="mx-auto max-w-[900px] px-4 py-20 md:py-24">
          <div style={{ border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)", padding: "clamp(28px,5vw,52px)", display: "grid", gap: 16, alignItems: "center" }} className="md:grid-cols-[1fr_auto]">
            <div>
              <Kick>2 dakikada dene</Kick>
              <h2 className="h2 mt-4">Bir sonraki servisi<br />kağıtsız kapat.</h2>
              <p className="sub mt-3">Telefonundan aç, ilk raporu oluştur, müşteriye imzalat. Kurulum yok, kart yok.</p>
            </div>
            <Link href="/app?yeni=1" className="btn" style={{ minWidth: 200, padding: "14px 22px" }}>İlk raporu oluştur</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--dark)", color: "rgba(255,255,255,.66)" }}>
        <div className="mx-auto max-w-[1000px] px-4 py-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, fontSize: 20, color: "#fff" }}><Isaret boy={24} /><span className="font-display" style={{ fontWeight: 600 }}>Fixnote</span></div>
              <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.6, marginTop: 12, maxWidth: 280 }}>Teknisyenin sahada servis raporunu doldurup imzalatması ve WhatsApp&apos;tan göndermesi için. Kayıtlar senin cihazında durur.</p>
            </div>
            {[
              ["Ürün", [["Nasıl çalışır", "#nasil"], ["Rapor", "#rapor"], ["Şablonlar", "#sablon"], ["Fiyat", "#fiyat"]]],
              ["Kimler için", [["Kombi ve klima", "#sablon"], ["Beyaz eşya", "#sablon"], ["İlaçlama", "#sablon"], ["Elektrik", "#sablon"]]],
              ["Daha fazla", [["SSS", "#sss"], ["Uygulamayı aç", "/app"], ["Yeni form", "/app?yeni=1"]]],
            ].map(([b, l]) => (
              <div key={b as string}>
                <div className="mini" style={{ color: "rgba(255,255,255,.45)" }}>{b as string}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 8, fontSize: 13, fontWeight: 500 }}>
                  {(l as string[][]).map(([t, h]) => <li key={t}><a href={h} className="hover:text-white">{t}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center" style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 40, paddingTop: 18, fontSize: 12, fontWeight: 500 }}>
            <span className="num">© 2026 Fixnote</span>
            <span>Bu bir e-fatura değil, iş teslim raporudur.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
