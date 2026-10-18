import type { Metadata } from "next";
import KatilFormu from "./KatilFormu";

export const metadata: Metadata = {
  title: "Ekibe katıl · Fixnote",
  description: "Firmanın Fixnote ekibine davet bağlantısıyla katıl.",
  robots: { index: false },
};

export default function Katil() {
  return <KatilFormu />;
}
