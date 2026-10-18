"use client";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Ikon from "./Ikon";
import { supabase } from "./supabase";
import { BEKLEYEN_DAVET, useEkip } from "./ekip";
import { aboneligiYonet, odemeHataMetni } from "./odeme";
import { ODEME_ACIK } from "../lib/paket";
import type { Dil } from "../lib/dil";

// Settings card "Hesabımı sil": the user deletes their own account and records (UK GDPR / KVKK
// right to erasure). Database side: public.hesabimi_sil() in supabase/kurulum.sql (section 4).
// Order: check (subscription) -> owner empties their file folder -> delete the account -> sign out.
const KOVA = "rapor-dosyalari";

// Deletes every file under "<uid>/" (<uid>/<report id>/<file>). Lists again after each round,
// because a listing shifts while files are removed.
async function klasoruBosalt(sb: SupabaseClient, uid: string) {
  for (let tur = 0; tur < 200; tur++) {
    const { data, error } = await sb.storage.from(KOVA).list(uid, { limit: 100 });
    if (error) throw error;
    if (!data || data.length === 0) return;
    const sil: string[] = [];
    for (const o of data) {
      if (o.id) {
        sil.push(`${uid}/${o.name}`); // a file directly in the folder
        continue;
      }
      const alt = `${uid}/${o.name}`;
      const { data: d, error: e } = await sb.storage.from(KOVA).list(alt, { limit: 1000 });
      if (e) throw e;
      for (const f of d || []) sil.push(`${alt}/${f.name}`);
    }
    for (let i = 0; i < sil.length; i += 100) {
      const { error: e } = await sb.storage.from(KOVA).remove(sil.slice(i, i + 100));
      if (e) throw e;
    }
  }
  throw new Error("dosyalar_var");
}

// Everything this browser keeps for the account (outbox, cache, team, name, subscription date).
function yerelTemizle(uid: string) {
  for (const d of [localStorage, sessionStorage]) {
    try {
      const sil: string[] = [];
      for (let i = 0; i < d.length; i++) {
        const k = d.key(i);
        if (k && (k.includes(uid) || k === BEKLEYEN_DAVET || k === "fixnote_abonelik")) sil.push(k);
      }
      sil.forEach((k) => d.removeItem(k));
    } catch {}
  }
}

export default function HesapSilKarti({ dil }: { dil: Dil }) {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const ekip = useEkip();
  const [acik, setAcik] = useState(false);
  const [yazi, setYazi] = useState("");
  const [isliyor, setIsliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [abonelikVar, setAbonelikVar] = useState(false);
  const teknisyen = ekip?.rol === "teknisyen";
  const onayKelime = c("SİL", "DELETE");
  // "sil", "SIL" and "SİL" all count on a Turkish or an English keyboard.
  const sade = (s: string) => s.trim().toLocaleUpperCase(dil === "en" ? "en" : "tr").replace(/İ/g, "I");
  const onaylandi = sade(yazi) === sade(onayKelime);

  const hataMetni = (e: unknown) => {
    const m = String((e as { message?: string })?.message ?? e ?? "");
    setAbonelikVar(m.includes("abonelik_aktif"));
    if (m.includes("abonelik_aktif")) return c("Aboneliğin yenilenmeye devam ediyor. Önce aboneliği iptal et (üst çubukta Yönet), sonra hesabını sil.", "Your subscription still renews. Cancel it first (Manage in the top bar), then delete your account.");
    if (m.includes("oturum") || m.includes("JWT") || m.includes("jwt")) return c("Oturumun kapanmış. Yeniden giriş yapıp tekrar dene.", "Your session has ended. Sign in again and retry.");
    if (m.includes("dosyalar_var")) return c("Bazı fotoğraflar silinemedi, hesabın silinmedi. Bağlantını kontrol edip tekrar dene.", "Some photos couldn't be deleted, so your account wasn't deleted. Check your connection and try again.");
    return c("Hesabın silinemedi. Bağlantını kontrol edip tekrar dene.", "Your account couldn't be deleted. Check your connection and try again.");
  };

  const sil = async () => {
    if (!onaylandi || isliyor) return;
    if (!navigator.onLine) {
      setHata(c("Hesabını silmek için internet bağlantısı gerekli.", "You need an internet connection to delete your account."));
      return;
    }
    const sb = supabase();
    if (!sb) return;
    setIsliyor(true);
    setHata("");
    try {
      const { data } = await sb.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) throw new Error("oturum");
      // Ask first, so a refused deletion never loses the photos.
      const k = await sb.rpc("hesabimi_sil", { p_kontrol: true });
      if (k.error) throw k.error;
      if (!teknisyen) await klasoruBosalt(sb, uid);
      const s = await sb.rpc("hesabimi_sil", { p_kontrol: false });
      if (s.error) throw s.error;
      yerelTemizle(uid);
      try {
        await sb.auth.signOut({ scope: "local" });
      } catch {}
      yerelTemizle(uid);
      window.location.replace("/giris?silindi=1");
    } catch (e) {
      setHata(hataMetni(e));
      setIsliyor(false);
    }
  };

  return (
    <div className="card" data-hesap-sil style={{ padding: 18, marginTop: 14 }}>
      <div className="p-kbas">
        <span className="p-kikon" style={{ background: "var(--bad-soft)", color: "var(--bad)" }}><Ikon ad="cop" boy={17} /></span>
        <div style={{ minWidth: 0 }}>
          <h2>{c("Hesabımı sil", "Delete my account")}</h2>
          <p>
            {teknisyen
              ? c("Hesabın ve giriş bilgilerin silinir, ekipten çıkarsın. Firmada yazdığın raporlar firmada kalır.", "Your account and sign-in details are deleted and you leave the team. Reports you wrote stay with the company.")
              : c("Hesabın, firma bilgilerin, bütün raporların, fotoğrafların ve imzalar kalıcı olarak silinir; ekibindeki teknisyenlerin erişimi de biter. Saklamak istediğin kayıtlar için önce yukarıdan yedek indir.", "Your account, company details and every report, photo and signature are deleted for good, and your technicians lose access too. Download a backup above first if you want to keep anything.")}
          </p>
        </div>
      </div>
      {!acik ? (
        <button className="chip" data-hesap-sil-ac style={{ color: "var(--bad)" }} onClick={() => { setAcik(true); setHata(""); }}>{c("Hesabımı sil", "Delete my account")}</button>
      ) : (
        <div style={{ padding: 14, borderRadius: 12, background: "var(--bad-soft)", border: "1px solid #f3c9c4" }}>
          <label className="lbl" htmlFor="hesap-sil-onay" style={{ color: "var(--bad)" }}>
            {c(`Bu geri alınamaz. Onaylamak için ${onayKelime} yaz.`, `This can't be undone. Type ${onayKelime} to confirm.`)}
          </label>
          <input id="hesap-sil-onay" className="field" data-hesap-sil-onay value={yazi} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={20} onChange={(e) => setYazi(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sil(); }} disabled={isliyor} />
          {hata && <div role="alert" data-hesap-sil-hata style={{ marginTop: 10, color: "var(--bad)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{hata}</div>}
          {abonelikVar && ODEME_ACIK && (
            <button className="chip" data-hesap-sil-yonet style={{ marginTop: 8 }} onClick={async () => { const kod = await aboneligiYonet(dil); if (kod) setHata(odemeHataMetni(kod, dil)); }}>{c("Aboneliği yönet", "Manage subscription")}</button>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button className="btn" data-hesap-sil-onayla style={{ background: "var(--bad)", borderColor: "var(--bad)" }} onClick={sil} disabled={!onaylandi || isliyor}>
              {isliyor ? c("Siliniyor…", "Deleting…") : c("Hesabımı kalıcı olarak sil", "Delete my account for good")}
            </button>
            <button className="chip" onClick={() => { setAcik(false); setYazi(""); setHata(""); }} disabled={isliyor}>{c("Vazgeç", "Cancel")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
