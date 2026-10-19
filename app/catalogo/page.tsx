"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIAS, buscar } from "@/lib/data";
import ProductoCard from "@/components/ProductoCard";
import { leerCarrito } from "@/lib/pedidos";
export default function Catalogo() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [nc, setNc] = useState(0);
  useEffect(() => { const f = () => setNc(leerCarrito().length); f(); window.addEventListener("carrito", f); return () => window.removeEventListener("carrito", f); }, []);
  useEffect(() => { const u = new URLSearchParams(location.search).get("q"); setQ(u ?? sessionStorage.getItem("cq") ?? ""); setCat(sessionStorage.getItem("cc") ?? ""); }, []);
  useEffect(() => { sessionStorage.setItem("cq", q); sessionStorage.setItem("cc", cat); }, [q, cat]);
  const lista = useMemo(() => {
    return buscar(q).filter((p) => !cat || p.categoria === cat);
  }, [q, cat]);
  const chip = (c: string) => (
    <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${cat === c ? "bg-brand text-white" : "bg-soft"}`}>{c || "Todas"}</button>
  );
  return (
    <main className="space-y-4 p-5 pb-24">
      <h1 className="text-xl font-semibold">Catálogo</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre, código interno o de barras" className="w-full rounded-md border border-line p-4 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40" />
      <div id="categorias" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">{["", ...CATEGORIAS].map(chip)}</div>
      <div className="space-y-2">
        {lista.length === 0 ? <p className="py-8 text-center text-mute">Sin resultados. Prueba con otro nombre o código.</p> : lista.map((p) => <ProductoCard key={p.id} p={p} />)}
      </div>
      {nc > 0 && <Link href="/pedido" className="fixed inset-x-4 bottom-20 z-10 mx-auto max-w-md rounded-lg bg-ink text-canvas p-4 text-center font-semibold">Ver pedido ({nc})</Link>}
    </main>
  );
}
