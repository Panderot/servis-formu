import type { Metadata } from "next";
import GirisFormu from "./GirisFormu";

export const metadata: Metadata = {
  title: "Giriş · Fixnote",
  description: "Fixnote hesabına giriş yap ya da 3 günlük ücretsiz denemeyi başlat.",
};

export default function Giris() {
  return <GirisFormu />;
}
