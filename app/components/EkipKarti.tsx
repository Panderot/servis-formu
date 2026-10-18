"use client";
import { useCallback, useEffect, useState } from "react";
import Ikon from "./Ikon";
import { supabase, ABONELIK_EPOSTA } from "./supabase";
import { davetLinki, ekipCevir, ekipHataMetni, ekipOnbellekYaz, tekBasina, useEkip } from "./ekip";
import { ODEME_ACIK } from "../lib/paket";
import type { Dil } from "../lib/dil";

// Settings card "Ekip". Owner: technicians in the team, invite link (one person, 7 days), remove.
// Technician: which firm's team, leave the team.
type Uye = { user_id: string; eposta: string; ad: string; katilma: string };

const tarih = (s: string, dil: Dil) => {
  const d = new Date(s);
  return dil === "en" ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function EkipKarti({ dil }: { dil: Dil }) {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const ekip = useEkip();
  const [uyeler, setUyeler] = useState<Uye[] | null>(null);
  const [acik, setAcik] = useState(ekip?.ekipAcik ?? false);
  const [bekleyen, setBekleyen] = useState(ekip?.bekleyenDavet ?? 0);
  const [firmaAd, setFirmaAd] = useState(ekip?.firmaAd ?? "");
  const [link, setLink] = useState("");
  const [hata, setHata] = useState("");
  const [not, setNot] = useState("");
  const [isliyor, setIsliyor] = useState(false);
  const sahip = ekip?.rol !== "teknisyen";

  const yukle = useCallback(async () => {
    const sb = supabase();
    if (!sb || !ekip || !sahip) return;
    const [d, l] = await Promise.all([sb.rpc("ekip_durumu"), sb.rpc("ekip_listesi")]);
    if (d.error || l.error) {
      setHata(ekipHataMetni(d.error || l.error, dil));
      setUyeler([]);
      return;
    }
    const e = ekipCevir(d.data, ekip.uid, ekip.sahipOlusturma);
    setAcik(e.ekipAcik);
    setBekleyen(e.bekleyenDavet);
    setFirmaAd(e.firmaAd);
    setUyeler(((l.data as Uye[]) || []).map((u) => ({ ...u, ad: u.ad || "" })));
  }, [ekip, sahip, dil]);

  useEffect(() => {
    yukle();
  }, [yukle]);

  if (!ekip) return null;

  const islem = async (f: () => Promise<void>) => {
    if (isliyor) return;
    setIsliyor(true);
    setHata("");
    setNot("");
    try {
      await f();
    } catch (e) {
      setHata(ekipHataMetni(e, dil));
    } finally {
      setIsliyor(false);
    }
  };

  // ---------------- technician ----------------
  if (!sahip) {
    const ayril = () =>
      islem(async () => {
        if (!confirm(c("Ekipten ayrılırsan firmanın kayıtlarını artık göremezsin. Ayrılmak istiyor musun?", "If you leave the team you won't see the company's records any more. Do you want to leave?"))) return;
        const sb = supabase();
        if (!sb) return;
        const { error } = await sb.rpc("ekipten_ayril");
        if (error) throw error;
        ekipOnbellekYaz(ekip.uid, tekBasina(ekip.uid, "")); // left on purpose: no "removed" screen
        window.location.replace("/app");
      });
    return (
      <div className="card" data-ekip-karti="teknisyen" style={{ padding: 16 }}>
        <h2 className="font-display" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>{c("Ekip", "Team")}</h2>
        <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55 }}>
          {c(`${ekip.firmaAd || "Firma"} ekibindesin. Firmanın raporlarını görür, yeni rapor yazar ve düzenlersin. Rapor silme, firma bilgileri ve abonelik firma sahibinde.`, `You're in the ${ekip.firmaAd || "company"} team. You see the company's reports and write and edit reports. Deleting reports, company details and the subscription stay with the owner.`)}
        </div>
        {hata && <div role="alert" style={{ marginTop: 10, color: "var(--bad)", fontSize: 13.5, fontWeight: 700 }}>{hata}</div>}
        <button className="chip" data-ekipten-ayril style={{ marginTop: 12, color: "var(--bad)" }} onClick={ayril} disabled={isliyor}>{c("Ekipten ayrıl", "Leave the team")}</button>
      </div>
    );
  }

  // ---------------- owner ----------------
  const davet = () =>
    islem(async () => {
      const sb = supabase();
      if (!sb) return;
      const { data, error } = await sb.rpc("davet_olustur");
      if (error) throw error;
      setLink(davetLinki(String(data)));
      setBekleyen((b) => b + 1);
    });
  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setNot(c("Bağlantı kopyalandı", "Link copied"));
    } catch {
      setNot(c("Kopyalanamadı; bağlantıyı seçip kopyala.", "Couldn't copy; select the link and copy it."));
    }
  };
  const waMesaj = c(
    `${firmaAd ? firmaAd + " seni" : "Seni"} Fixnote'ta servis raporu ekibine ekliyor. Katılmak için bağlantıyı aç ve kendi hesabınla gir: ${link}`,
    `${firmaAd ? firmaAd + " is adding you" : "You're being added"} to the service report team on Fixnote. Open the link and sign in with your own account to join: ${link}`,
  );
  const cikar = (u: Uye) =>
    islem(async () => {
      const kim = u.ad || u.eposta;
      if (!confirm(c(`${kim} ekipten çıkarılsın mı? Firmanın kayıtlarına erişimi hemen biter; yazdığı raporlar firmada kalır.`, `Remove ${kim} from the team? Their access to the company's records ends at once; the reports they wrote stay with the company.`))) return;
      const sb = supabase();
      if (!sb) return;
      const { error } = await sb.rpc("uye_cikar", { p_uye: u.user_id });
      if (error) throw error;
      setNot(c(`${kim} ekipten çıkarıldı`, `${kim} was removed from the team`));
      await yukle();
    });
  const iptal = () =>
    islem(async () => {
      if (!confirm(c("Kullanılmamış bütün davet bağlantıları iptal edilsin mi?", "Cancel all unused invite links?"))) return;
      const sb = supabase();
      if (!sb) return;
      const { error } = await sb.rpc("davetleri_iptal");
      if (error) throw error;
      setLink("");
      setNot(c("Davet bağlantıları iptal edildi", "Invite links cancelled"));
      await yukle();
    });
  const paketLinki = ODEME_ACIK ? "/abonelik?paket=firma" : `mailto:${ABONELIK_EPOSTA}?subject=${encodeURIComponent(c("Fixnote Firma paketi", "Fixnote Team plan"))}`;

  return (
    <div className="card" data-ekip-karti="sahip" data-ekip-acik={acik ? "evet" : "hayir"} style={{ padding: 16, marginTop: 14 }}>
      <h2 className="font-display" style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>{c("Ekip", "Team")}</h2>
      <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, marginBottom: 12 }}>
        {acik
          ? c("Teknisyenlerin kendi e-posta ve şifreleriyle girer, firmanın raporlarını görür ve yeni rapor yazar. Rapor silme, firma bilgileri, şablonlar ve abonelik sende kalır.", "Your technicians sign in with their own email and password, see the company's reports and write new ones. Deleting reports, company details, templates and the subscription stay with you.")
          : c("Teknisyen ekibi Firma paketinde. Usta paketinde hesabı yalnızca sen kullanırsın.", "A technician team comes with the Team plan. On the Solo plan only you use the account.")}
      </div>

      {uyeler === null ? (
        <div style={{ fontSize: 13.5, color: "var(--faint)", fontWeight: 600 }}>{c("Ekip yükleniyor…", "Loading the team…")}</div>
      ) : uyeler.length === 0 ? (
        <div data-ekip-bos style={{ fontSize: 13.5, color: "var(--faint)", fontWeight: 600 }}>{c("Henüz ekipte kimse yok.", "No one in the team yet.")}</div>
      ) : (
        <div style={{ display: "grid", gap: 6 }}>
          {uyeler.map((u) => (
            <div key={u.user_id} data-ekip-uye style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 8 }}>
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.ad || u.eposta}</b>
                <span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.ad ? `${u.eposta} · ` : ""}{c("katıldı", "joined")} {tarih(u.katilma, dil)}</span>
              </span>
              <button className="chip" style={{ color: "var(--bad)", flex: "none" }} onClick={() => cikar(u)} disabled={isliyor}>{c("Çıkar", "Remove")}</button>
            </div>
          ))}
        </div>
      )}
      {!acik && uyeler && uyeler.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 13.5, color: "var(--warn)", fontWeight: 700 }}>{c("Bu pakette ekibin giriş yapamaz.", "Your team can't sign in on this plan.")}</div>
      )}

      {acik ? (
        <>
          <button className="btn btn-ghost" data-davet-olustur style={{ marginTop: 12 }} onClick={davet} disabled={isliyor}><Ikon ad="arti" boy={14} kalinlik={2.6} />{c("Davet bağlantısı oluştur", "Create an invite link")}</button>
          {link && (
            <div data-davet-link style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "var(--panel)", border: "1px solid var(--line)" }}>
              <label className="lbl" htmlFor="davet-link">{c("Davet bağlantısı", "Invite link")}</label>
              <input id="davet-link" className="field" readOnly value={link} onFocus={(e) => e.target.select()} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button className="chip" onClick={kopyala}>{c("Kopyala", "Copy")}</button>
                <a className="chip" href={`https://wa.me/?text=${encodeURIComponent(waMesaj)}`} target="_blank" rel="noopener noreferrer" style={{ color: "#16794c" }}><Ikon ad="mesaj" boy={14} />{c("WhatsApp'tan gönder", "Send on WhatsApp")}</a>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 8, lineHeight: 1.5 }}>{c("Bağlantı 7 gün geçerli ve tek kişi kullanabilir. Her teknisyen için yeni bağlantı oluştur.", "The link works for 7 days and for one person. Create a new link for each technician.")}</div>
            </div>
          )}
          {bekleyen > 0 && (
            <div data-bekleyen-davet style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 10, fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>
              <span>{c(`Kullanılmamış ${bekleyen} davet bağlantısı var.`, `${bekleyen} unused invite ${bekleyen === 1 ? "link" : "links"}.`)}</span>
              <button className="chip" onClick={iptal} disabled={isliyor}>{c("Hepsini iptal et", "Cancel them all")}</button>
            </div>
          )}
        </>
      ) : (
        <a className="btn btn-ghost" data-firma-paketi href={paketLinki} style={{ marginTop: 12 }}>{c("Firma paketine geç", "Move to the Team plan")}</a>
      )}
      {not && <div role="status" style={{ marginTop: 10, color: "var(--ok)", fontSize: 13.5, fontWeight: 700 }}>{not}</div>}
      {hata && <div role="alert" style={{ marginTop: 10, color: "var(--bad)", fontSize: 13.5, fontWeight: 700 }}>{hata}</div>}
    </div>
  );
}
