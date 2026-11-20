"use client";
import { useEffect, useState } from "react";
import Ikon from "./Ikon";
import { hataMetni, supabase } from "./supabase";
import { tostGoster } from "./Hareket";
import { LISANS_WHATSAPP } from "../lib/paket";
import type { Dil } from "../lib/dil";

// Settings card "Hesap": the signed-in user (owner or technician) sets a new password (task 78).
// There is no e-mail service yet: a forgotten password is reset on WhatsApp with a temporary one
// (../fixnote-kontrol/sifre-ver.cjs), and the user changes it here. Shown in read-only mode too; not in /demo.
// Password errors the sign-up page already explains (weak, leaked, same as old, too short, no connection).
const BILINEN = /weak|easy to guess|pwned|same password|different from the old|at least \d+ char|should be at least|fetch|network/i;

export default function SifreKarti({ dil }: { dil: Dil }) {
  const c = (tr: string, en: string) => (dil === "en" ? en : tr);
  const [eposta, setEposta] = useState("");
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [isliyor, setIsliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [destek, setDestek] = useState(false);

  useEffect(() => {
    supabase()?.auth.getSession().then(({ data }) => setEposta(data.session?.user.email || ""));
  }, []);

  const waLink = `https://wa.me/${LISANS_WHATSAPP}?text=${encodeURIComponent(c(`Merhaba, Fixnote şifremi değiştiremiyorum. Hesabım: ${eposta}`, `Hello, I can't change my Fixnote password. My account: ${eposta}`))}`;

  const degistir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isliyor) return;
    setHata("");
    setDestek(false);
    if (s1.length < 8) { setHata(c("Şifre en az 8 karakter olmalı.", "The password must be at least 8 characters.")); return; }
    if (s1 !== s2) { setHata(c("İki şifre aynı değil.", "The two passwords don't match.")); return; }
    const sb = supabase();
    if (!sb) return;
    setIsliyor(true);
    try {
      const { error } = await sb.auth.updateUser({ password: s1 });
      if (error) throw error;
      setS1("");
      setS2("");
      tostGoster(c("Şifren değiştirildi", "Password changed"), 2600);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      if (BILINEN.test(m)) setHata(hataMetni(m));
      else { setHata(c("Şifre şu an değiştirilemedi. Bize WhatsApp'tan yaz.", "Your password couldn't be changed right now. Message us on WhatsApp.")); setDestek(true); }
    } finally {
      setIsliyor(false);
    }
  };

  return (
    <div className="card" data-sifre-karti style={{ padding: 18, marginTop: 14 }}>
      <div className="p-kbas">
        <span className="p-kikon"><Ikon ad="anahtar" boy={17} /></span>
        <div style={{ minWidth: 0 }}>
          <h2>{c("Hesap", "Account")}</h2>
          <p style={{ overflowWrap: "anywhere" }}>{eposta ? c(`Giriş e-postan: ${eposta}. Şifreni buradan değiştirebilirsin.`, `Your sign-in e-mail: ${eposta}. You can change your password here.`) : c("Şifreni buradan değiştirebilirsin.", "You can change your password here.")}</p>
        </div>
      </div>
      <form onSubmit={degistir}>
        {/* lets password managers attach the new password to the right account */}
        <input type="email" autoComplete="username" value={eposta} readOnly hidden />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <div><label className="lbl" htmlFor="sifre-yeni">{c("Yeni şifre", "New password")}</label><input id="sifre-yeni" className="field" type="password" autoComplete="new-password" placeholder={c("En az 8 karakter", "At least 8 characters")} value={s1} onChange={(e) => setS1(e.target.value)} disabled={isliyor} /></div>
          <div><label className="lbl" htmlFor="sifre-tekrar">{c("Yeni şifre (tekrar)", "New password (again)")}</label><input id="sifre-tekrar" className="field" type="password" autoComplete="new-password" value={s2} onChange={(e) => setS2(e.target.value)} disabled={isliyor} /></div>
        </div>
        {hata && <div role="alert" data-sifre-hata style={{ marginTop: 10, color: "var(--bad)", fontSize: 13.5, fontWeight: 700, lineHeight: 1.5 }}>{hata}</div>}
        {destek && <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: 10 }}><Ikon ad="mesaj" boy={15} />{c("WhatsApp'tan yaz", "Message us on WhatsApp")}</a>}
        <div><button type="submit" className="btn" data-sifre-degistir style={{ marginTop: 12 }} disabled={isliyor}>{isliyor ? c("Bekle...", "Please wait...") : c("Şifreyi değiştir", "Change password")}</button></div>
      </form>
    </div>
  );
}
