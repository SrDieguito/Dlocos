"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/data";
import { ESTADOS, Estado, Pedido, leerPedidos, totalLineas, usuario } from "@/lib/pedidos";
export default function Pedidos() {
  const [ps, setPs] = useState<Pedido[]>([]);
  const [f, setF] = useState<"" | Estado>("");
  useEffect(() => { setPs(leerPedidos()); if (usuario()?.rol === "bodeguero") setF("pendiente"); }, []);
  const lista = ps.filter((p) => !f || p.estado === f);
  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">Pedidos</h1>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {(["", "pendiente", "en_preparacion", "listo", "entregado", "anulado"] as const).map((e) => (
          <button key={e} onClick={() => setF(e)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${f === e ? "bg-brand text-white" : "bg-soft"}`}>{e ? ESTADOS[e].t : "Todos"}</button>
        ))}
      </div>
      {lista.length === 0 && <p className="py-8 text-center text-mute">No hay pedidos en este estado.</p>}
      {lista.map((p) => (
        <Link key={p.id} href={`/pedidos/${p.id}`} className="block space-y-1 rounded-lg border border-line p-3 active:bg-soft">
          <div className="flex items-center justify-between"><span className="font-semibold">{p.id} · {p.cliente}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADOS[p.estado].c}`}>{ESTADOS[p.estado].t}</span></div>
          <p className="text-xs text-mute">Vendedor: {p.vendedor} · Bodeguero: {p.bodeguero || "sin asignar"}</p>
          <p className="text-right font-semibold text-accent">{money(totalLineas(p.lineas))}</p>
        </Link>
      ))}
    </main>
  );
}
