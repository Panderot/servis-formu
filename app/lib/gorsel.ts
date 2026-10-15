// Tarayıcıda canvas ile fotoğraf küçültme (localStorage'a sığsın diye).
export function kucult(dosya: File, maxKenar = 1000, kalite = 0.72, tip: "image/jpeg" | "image/png" = "image/jpeg"): Promise<string> {
  return new Promise((coz, red) => {
    const okuyucu = new FileReader();
    okuyucu.onerror = () => red(new Error("Dosya okunamadı"));
    okuyucu.onload = () => {
      const img = new Image();
      img.onerror = () => red(new Error("Görsel açılamadı"));
      img.onload = () => {
        const oran = Math.min(1, maxKenar / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * oran));
        const h = Math.max(1, Math.round(img.height * oran));
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const ctx = c.getContext("2d");
        if (!ctx) return red(new Error("Canvas yok"));
        if (tip === "image/jpeg") {
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        coz(c.toDataURL(tip, kalite));
      };
      img.src = String(okuyucu.result);
    };
    okuyucu.readAsDataURL(dosya);
  });
}

// localStorage'da kullanılan yaklaşık alan (KB)
export function depoKB(): number {
  try {
    let t = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      t += k.length + (localStorage.getItem(k) || "").length;
    }
    return Math.round((t * 2) / 1024);
  } catch {
    return 0;
  }
}
