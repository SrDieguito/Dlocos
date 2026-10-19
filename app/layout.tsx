import "./globals.css";
import type { Metadata, Viewport } from "next";
import Navegacion from "@/components/Navegacion";
export const metadata: Metadata = { title: "Catálogo D'Locos HV", description: "Consulta de productos, precios y pedidos", manifest: "/manifest.webmanifest", icons: { icon: "/icon.svg", apple: "/icon.svg" } };
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#262624" }, { color: "#e4e6e7" }], width: "device-width", initialScale: 1 };
const antes = `try{var t=localStorage.getItem("tema");if(t==="oscuro"||(t!=="claro"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: antes }} /></head>
      <body className="font-sans"><Navegacion /><div className="mx-auto min-h-screen max-w-md pb-20 md:max-w-2xl">{children}</div></body>
    </html>
  );
}
