import { useSyncExternalStore } from "react";
import type { Dil } from "./servis";

// Site language (tr / en). A choice made with the TR/EN button is kept in this browser (fx_dil);
// without one the browser language decides: Turkish -> tr, anything else -> en. The server always
// renders Turkish; the browser switches right after loading. While an English page is switching,
// the inline script in app/layout.tsx keeps it hidden (class "dil-bekle") so Turkish never flashes.
export type { Dil };
import { DIL_ANAHTAR } from "./dilBetigi";
export { DIL_ANAHTAR };

export function algila(): Dil {
  try {
    const d = localStorage.getItem(DIL_ANAHTAR);
    if (d === "tr" || d === "en") return d;
  } catch {}
  const l = (typeof navigator !== "undefined" && ((navigator.languages && navigator.languages[0]) || navigator.language)) || "";
  return /^tr/i.test(l) ? "tr" : "en";
}

let mevcut: Dil | null = null;
const dinleyenler = new Set<() => void>();

export function aktifDil(): Dil {
  if (typeof window === "undefined") return "tr";
  if (!mevcut) mevcut = algila();
  return mevcut;
}

export function dilSec(d: Dil) {
  mevcut = d;
  try {
    localStorage.setItem(DIL_ANAHTAR, d);
  } catch {}
  document.documentElement.lang = d;
  dinleyenler.forEach((f) => f());
}

function abone(f: () => void) {
  dinleyenler.add(f);
  const depo = (e: StorageEvent) => {
    if (e.key === DIL_ANAHTAR && (e.newValue === "tr" || e.newValue === "en") && e.newValue !== mevcut) {
      mevcut = e.newValue;
      document.documentElement.lang = e.newValue;
      f();
    }
  };
  window.addEventListener("storage", depo);
  return () => {
    dinleyenler.delete(f);
    window.removeEventListener("storage", depo);
  };
}

export function useDil(): Dil {
  return useSyncExternalStore(abone, aktifDil, () => "tr");
}

// c("Türkçe", "English") picks the text of the current language.
export function useC() {
  const d = useDil();
  return (tr: string, en: string) => (d === "en" ? en : tr);
}
