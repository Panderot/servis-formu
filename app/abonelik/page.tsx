import type { Metadata } from "next";
import AbonelikSecimi from "./AbonelikSecimi";

export const metadata: Metadata = {
  title: "Paket seç · Fixnote",
  description: "Fixnote aboneliğini başlat: Usta ya da Firma, aylık ya da yıllık.",
  robots: { index: false },
};

export default function Abonelik() {
  return <AbonelikSecimi />;
}
