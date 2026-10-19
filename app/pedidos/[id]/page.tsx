"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PRODUCTOS, money } from "@/lib/data";
import { ESTADOS, Pedido, actualizar, fecha, leerPedidos, precioBulto, precioLinea, totalLinea, totalLineas, uBulto, unidadesLinea, usuario } from "@/lib/pedidos";
export default function Detalle() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Pedido | null | undefined>(undefined);
  const [u, setU] = useState<{ nombre: string; rol: string } | null>(null);
  useEffect(() => { setP(leerPedidos().find((x) => x.id === id) || null); setU(usuario()); }, [id]);
  if (p === undefined) return null;
  if (!p) return <main className="p-5"><p>Pedido no encontrado en este dispositivo.</p><Link href="/pedidos" className="text-accent">Volver</Link></main>;
  const bod = u?.rol === "bodeguero" || u?.rol === "admin";
  const act = (f: (x: Pedido) => Pedido) => setP(actualizar(p.id, f) || p);
  const ahora = () => new Date().toISOString();
  const total = totalLineas(p.lineas);
  const texto = `Proforma ${p.id} - D'Locos HV\nCliente: ${p.cliente}\n` + p.lineas.map((l) => { const x = PRODUCTOS.find((y) => y.id === l.pid)!; if (l.bulto) { const u = uBulto(x, l); const pb = precioBulto(x, l) ?? 0; return `- ${l.cant} bulto${l.cant > 1 ? "s" : ""}${u ? ` (${u} u. c/u)` : ""} x ${x.nombre} (${x.codigo}) ${money(pb)} c/bulto = ${money(totalLinea(x, l))}`; } const pr = precioLinea(x, l); return `- ${l.cant} x ${x.nombre} (${x.codigo}) ${money(pr)} = ${money(pr * l.cant)}`; }).join("\n") + `\nTotal: ${money(total)}`;
  const wa = `https://wa.me/${p.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
  const b = "w-full rounded-lg p-4 text-lg font-semibold print:hidden";
  return (
    <main className="space-y-4 p-5">
      <div className="flex items-start justify-between"><div><p className="text-xs text-mute">Importadora D'Locos HV · Proforma</p><h1 className="text-2xl font-semibold">{p.id}</h1></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADOS[p.estado].c}`}>{ESTADOS[p.estado].t}</span></div>
      <div className="space-y-1 rounded-lg bg-surface p-4 text-sm">
        <p><b>Cliente:</b> {p.cliente}{p.telefono && ` · ${p.telefono}`}</p>
        <p><b>Vendedor:</b> {p.vendedor} · {fecha(p.creado)}</p>
        <p><b>Bodeguero:</b> {p.bodeguero || "sin asignar"}{p.tomado && ` · tomó ${fecha(p.tomado)}`}</p>
        {p.listo && <p><b>Listo:</b> {fecha(p.listo)}</p>}{p.entregado && <p><b>Entregado:</b> {fecha(p.entregado)}</p>}
        {p.nota && <p><b>Nota:</b> {p.nota}</p>}
      </div>
      {p.lineas.map((l, i) => {
        const x = PRODUCTOS.find((y) => y.id === l.pid)!; const pr = precioLinea(x, l);
        const bl = !!l.bulto; const u = uBulto(x, l); const pb = precioBulto(x, l) ?? 0;
        return (
          <label key={i} className={`flex items-center gap-3 rounded-lg border p-3 ${l.ok ? "border-brand bg-brand/5" : "border-line"}`}>
            {p.estado === "en_preparacion" && bod && <input type="checkbox" className="h-6 w-6 accent-[#00983D]" checked={!!l.ok} onChange={() => act((o) => ({ ...o, lineas: o.lineas.map((m, j) => (j === i ? { ...m, ok: !m.ok } : m)) }))} />}
            <div className="min-w-0 flex-1"><p className="font-semibold">{l.cant} {bl ? `bulto${l.cant > 1 ? "s" : ""}` : "×"} {bl ? "de " : ""}{x.nombre}</p><p className="text-xs text-mute">{x.codigo} · {bl ? `${u ? `${u.toLocaleString("es")} u. c/bulto (${unidadesLinea(x, l).toLocaleString("es")} u.) · ` : ""}al mayor ${money(pb)} c/bulto` : `al ${l.precio} ${money(pr)}`}</p></div>
            <p className="font-semibold">{money(totalLinea(x, l))}</p>
          </label>
        );
      })}
      <div className="flex items-baseline justify-between rounded-md bg-brand p-4 text-white"><span>Total</span><span className="text-2xl font-semibold">{money(total)}</span></div>
      {p.estado === "pendiente" && bod && <button className={`${b} bg-brand text-white`} onClick={() => act((o) => ({ ...o, estado: "en_preparacion", bodeguero: u!.nombre, tomado: ahora() }))}>Tomar pedido</button>}
      {p.estado === "en_preparacion" && bod && <button disabled={!p.lineas.every((l) => l.ok)} className={`${b} bg-brand text-white disabled:opacity-40`} onClick={() => act((o) => ({ ...o, estado: "listo", listo: ahora() }))}>Marcar listo (revisa todos los ítems)</button>}
      {p.estado === "listo" && bod && <button className={`${b} bg-ink text-canvas`} onClick={() => act((o) => ({ ...o, estado: "entregado", entregado: ahora() }))}>Marcar entregado</button>}
      <div className="grid grid-cols-2 gap-2 print:hidden">
        <a href={wa} target="_blank" className="rounded-md border-2 border-brand p-3 text-center font-semibold text-accent">WhatsApp</a>
        <button onClick={() => window.print()} className="rounded-md border-2 border-brand p-3 font-semibold text-accent">Imprimir / PDF</button>
      </div>
      {(p.estado === "pendiente" || p.estado === "en_preparacion") && u?.rol !== "bodeguero" && <button className="w-full p-2 text-sm text-red-600 print:hidden" onClick={() => confirm("¿Anular este pedido?") && act((o) => ({ ...o, estado: "anulado" }))}>Anular pedido</button>}
    </main>
  );
}
