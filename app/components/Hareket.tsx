"use client";
// Panel motion (task 76): only transform and opacity, 150-300 ms, ease-out. Every piece turns off with
// prefers-reduced-motion. Nothing here changes what a screen looks like at rest.
import { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { para } from "../lib/servis";
import type { Dil, ParaBirimi } from "../lib/servis";

const PARA_ON: Record<ParaBirimi, string> = { TL: "", USD: "$", EUR: "€", GBP: "£" };
const DONUS = { duration: 300, easing: "ease-out" };
const SAYI_ZAMAN = { transformTiming: DONUS, spinTiming: DONUS, opacityTiming: { duration: 200, easing: "ease-out" } };

// A KPI figure that rolls when it changes (and once from 0 on the first load). The text is exactly the
// app's own: money as para() writes it, counts as plain digits. If Intl would write the value differently
// from para() (or the value is negative), the plain text is shown instead.
export function Sayi({ n, birim, dil }: { n: number; birim?: ParaBirimi; dil: Dil }) {
  const [v, setV] = useState(0);
  useEffect(() => { setV(n); }, [n]);
  const yerel = dil === "en" ? "en-US" : "tr-TR";
  if (!birim) {
    if (!Number.isInteger(n) || n < 0) return <>{String(n)}</>;
    return <span className="sayi"><NumberFlow {...SAYI_ZAMAN} value={v} locales={yerel} format={{ useGrouping: false, maximumFractionDigits: 0 }} /></span>;
  }
  const bicim = { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true } as const;
  const on = PARA_ON[birim];
  const son = birim === "TL" ? " TL" : "";
  if (n < 0 || on + new Intl.NumberFormat(yerel, bicim).format(n) + son !== para(n, birim, dil)) return <>{para(n, birim, dil)}</>;
  return <span className="sayi"><NumberFlow {...SAYI_ZAMAN} value={v} locales={yerel} format={bicim} prefix={on || undefined} suffix={son || undefined} /></span>;
}
