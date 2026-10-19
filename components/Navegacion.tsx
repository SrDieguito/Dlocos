"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { leerCarrito, usuario } from "@/lib/pedidos";
const titulo = (p: string) =>
  p.startsWith("/pedidos/") ? "Proforma" : p.startsWith("/producto") ? "Producto" :
  ({ "/catalogo": "Catálogo", "/escaner": "Escáner", "/pedido": "Pedido en curso", "/pedidos": "Pedidos", "/admin": "Administración", "/demo": "Códigos de prueba" } as Record<string, string>)[p] ?? "";
export default function Navegacion() {
  const path = usePathname();
  const r = useRouter();
  const [u, setU] = useState<{ rol: string } | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const f = () => { setU(usuario()); setN(leerCarrito().length); };
    f(); window.addEventListener("carrito", f); window.addEventListener("usuario", f);
    return () => { window.removeEventListener("carrito", f); window.removeEventListener("usuario", f); };
  }, [path]);
  if (!u) return null;
  const volver = () => (history.length > 1 ? r.back() : r.push("/"));
  const items = [
    { href: "/", t: "Inicio" }, { href: "/catalogo", t: "Catálogo" }, { href: "/escaner", t: "Escanear", main: true },
    ...(u.rol !== "bodeguero" ? [{ href: "/pedido", t: n > 0 ? `Pedido (${n})` : "Pedido" }] : []), { href: "/pedidos", t: "Pedidos" },
  ];
  const activo = (h: string) => (h === "/" ? path === "/" : path === h || (h === "/pedidos" && path.startsWith("/pedidos/")));
  return (
    <>
      {path !== "/" && (
        <div className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur print:hidden">
          <div className="mx-auto flex h-12 max-w-md items-center gap-2 px-2 md:max-w-2xl">
            <button onClick={volver} className="flex h-10 items-center gap-1 rounded-md px-3 text-sm font-semibold active:bg-soft">← Atrás</button>
            <span className="truncate text-sm text-mute">{titulo(path)}</span>
          </div>
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface print:hidden">
        <div className="mx-auto flex h-14 max-w-md items-center justify-around px-1 md:max-w-2xl">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={i.main ? "rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white" : `px-2 py-2 text-xs font-semibold ${activo(i.href) ? "text-accent" : "text-mute"}`}>{i.t}</Link>
          ))}
        </div>
      </nav>
    </>
  );
}
