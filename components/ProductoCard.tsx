"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Producto, money } from "@/lib/data";
import { agregar, leerCarrito } from "@/lib/pedidos";
export function Precios({ p, grande }: { p: Producto; grande?: boolean }) {
  const [adm, setAdm] = useState(false);
  useEffect(() => { try { setAdm(JSON.parse(localStorage.getItem("usuario") || "null")?.rol === "admin"); } catch {} }, []);
  const fila = (t: string, v: number | null, u: string, main?: boolean) => (
    <div className={`flex items-baseline justify-between rounded-md px-4 py-3 ${main ? "bg-brand text-white" : "bg-surface"}`}>
      <span className="text-sm">{t}</span>
      <span className={`${grande ? "text-2xl" : "text-xl"} font-semibold`}>{v == null ? "—" : money(v)} <span className="text-xs font-normal opacity-80">{u}</span></span>
    </div>
  );
  return (
    <div className="space-y-2">
      {fila("Precio al menor", p.unidad, "c/u", true)}
      {fila("Precio al mayor", p.mayor, "c/u")}
      {adm && p.socios != null && fila("Precio socios", p.socios, "c/u")}
    </div>
  );
}
export default function ProductoCard({ p }: { p: Producto }) {
  const [en, setEn] = useState({ u: 0, b: 0 });
  useEffect(() => {
    const f = () => {
      const ls = leerCarrito().filter((l) => l.pid === p.id);
      setEn({ u: ls.filter((l) => !l.bulto).reduce((s, l) => s + l.cant, 0), b: ls.filter((l) => l.bulto).reduce((s, l) => s + l.cant, 0) });
    };
    f(); window.addEventListener("carrito", f); return () => window.removeEventListener("carrito", f);
  }, [p.id]);
  const b = "flex-1 rounded-md border border-line bg-surface py-2 text-sm font-semibold text-accent active:bg-soft";
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <Link href={`/producto/${p.id}`} className="flex items-center gap-3 active:opacity-80">
        {p.foto ? <img src={p.foto} alt={p.nombre} loading="lazy" className="h-16 w-16 shrink-0 rounded-md bg-soft object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-soft text-xs text-mute">Sin foto</div>}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{p.nombre}</p>
          <p className="text-xs text-mute">{p.codigo} · {p.categoria}</p>
          <p className="text-xs text-accent">{p.stock == null ? "Bodega: sin dato" : `Bodega: ${p.stock.toLocaleString("es")} u.`}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-accent">{p.unidad == null ? "—" : money(p.unidad)}</p>
          <p className="text-xs text-mute">mayor {p.mayor == null ? "—" : money(p.mayor)}</p>
        </div>
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={() => agregar(p.id, 1, "menor")} className={b}>+1</button>
        <button onClick={() => agregar(p.id, 12, "menor")} className={b}>+12 (docena)</button>
        {p.porBulto != null && <button onClick={() => agregar(p.id, 1, "mayor", { u: null, pb: null })} className={b}>+1 bulto ({p.porBulto.toLocaleString("es")})</button>}
      </div>
      {(en.u > 0 || en.b > 0) && <p className="mt-2 rounded-md bg-soft py-1.5 text-center text-xs font-semibold">En pedido: {[en.u > 0 && `${en.u} u.`, en.b > 0 && `${en.b} bulto${en.b > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}</p>}
    </div>
  );
}
