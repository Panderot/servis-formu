"use client";
import { useEffect, useRef } from "react";
import { aktifDil, dilSec, useDil } from "../lib/dil";

// English page titles (the Turkish ones come from each page's metadata).
const BASLIK_EN: Record<string, string> = {
  "/": "Fixnote: service reports finished on site",
  "/app": "Fixnote: service reports finished on site",
  "/giris": "Sign in · Fixnote",
  "/demo": "Demo · Fixnote",
  "/kosullar": "Terms of use · Fixnote",
  "/gizlilik": "Privacy policy · Fixnote",
  "/veri-isleme": "Data processing agreement · Fixnote",
  "/abonelik": "Choose your plan · Fixnote",
  "/katil": "Join the team · Fixnote",
};

// Mounted once in app/layout.tsx: shows the page again once it renders in the chosen language,
// and keeps the tab title in that language.
const EN_BASLIKLAR = new Set(Object.values(BASLIK_EN));

export function DilKoku() {
  const dil = useDil();
  const trBaslik = useRef<Record<string, string>>({}); // Turkish title of each page, as Next.js wrote it
  useEffect(() => {
    if (dil !== aktifDil()) return; // still the server (Turkish) render
    document.documentElement.classList.remove("dil-bekle");
    document.documentElement.lang = dil;
    const uygula = () => {
      const yol = window.location.pathname.replace(/\/$/, "") || "/";
      const su = document.title;
      if (su && !EN_BASLIKLAR.has(su)) trBaslik.current[yol] = su;
      const istenen = dil === "en" ? BASLIK_EN[yol] || trBaslik.current[yol] : trBaslik.current[yol];
      if (istenen && su !== istenen) document.title = istenen;
    };
    uygula();
    // Next.js writes the page's (Turkish) title again after loading and on every page change; keep ours.
    const izle = new MutationObserver(uygula);
    izle.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => izle.disconnect();
  }, [dil]);
  return null;
}

// TR / EN switch: shows the other language's code. koyu = for dark backgrounds.
export function DilDugmesi({ koyu, style, className }: { koyu?: boolean; style?: React.CSSProperties; className?: string }) {
  const dil = useDil();
  const hedef = dil === "en" ? "tr" : "en";
  return (
    <button
      type="button"
      data-dil-dugme={hedef}
      className={className}
      onClick={() => dilSec(hedef)}
      aria-label={hedef === "en" ? "Switch to English" : "Türkçeye geç"}
      title={hedef === "en" ? "English" : "Türkçe"}
      lang={hedef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        minWidth: 40,
        minHeight: 40,
        padding: "0 10px",
        borderRadius: 10,
        border: `1px solid ${koyu ? "rgba(255,255,255,.22)" : "var(--line)"}`,
        background: koyu ? "transparent" : "var(--paper)",
        color: koyu ? "#fff" : "var(--ink)",
        font: "inherit",
        fontSize: 12.5,
        fontWeight: 800,
        letterSpacing: ".04em",
        cursor: "pointer",
        flex: "none",
        ...style,
      }}
    >
      <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3.5 9h17 M3.5 15h17 M12 3c2.5 2.6 3.6 5.6 3.6 9s-1.1 6.4-3.6 9c-2.5-2.6-3.6-5.6-3.6-9S9.5 5.6 12 3z" />
      </svg>
      {hedef.toUpperCase()}
    </button>
  );
}
