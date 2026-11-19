import type { Metadata } from "next";
import AbonelikSecimi from "./AbonelikSecimi";

export const metadata: Metadata = {
  title: "Lisans al · Fixnote",
  description: "Fixnote lisansı: aylık, yıllık ya da süresiz.",
  robots: { index: false },
};

export default function Abonelik() {
  return <AbonelikSecimi />;
}
