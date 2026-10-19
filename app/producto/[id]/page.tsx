"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTOS } from "@/lib/data";
import { Precios } from "@/components/ProductoCard";
import AgregarPedido from "@/components/AgregarPedido";
export default function Ficha() {
  const { id } = useParams<{ id: string }>();
  const p = PRODUCTOS.find((x) => x.id === id);
  if (!p) return <main className="p-5"><p>Producto no encontrado.</p><Link href="/catalogo" className="text-accent">Volver al catálogo</Link></main>;
  const fila = (k: string, v: string) => <div className="flex justify-between gap-4 border-b border-line py-2 text-sm"><span className="text-mute">{k}</span><span className="text-right font-medium">{v}</span></div>;
  return (
    <main className="space-y-4 p-5">
      <Link href="/escaner" className="block rounded-md bg-brand p-3 text-center font-semibold text-white">Escanear otro producto</Link>
      {p.foto ? <img src={p.foto} alt={p.nombre} className="h-56 w-full rounded-lg bg-soft object-contain" /> : <div className="flex h-48 items-center justify-center rounded-lg bg-soft text-mute">Sin fotografía</div>}
      <h1 className="text-2xl font-semibold">{p.nombre}</h1>
      <Precios p={p} grande />
      <AgregarPedido p={p} />
      <div className={`rounded-md p-4 ${(p.stock ?? 1) > 0 ? "bg-brand/10" : "bg-red-500/10"}`}>
        <p className="font-semibold">{p.stock == null ? "Stock no registrado" : p.stock > 0 ? `Hay en bodega: ${p.stock.toLocaleString("es")} u.` : "Sin existencias"}</p>
        <p className="text-xs text-mute">Stock inicial según el ingreso del contenedor; aún no descuenta ventas.</p>
      </div>
      <div>
        {fila("Código", p.codigo)}{fila("Código de barras (demo)", p.barras)}{fila("Categoría", p.categoria)}
        {p.total != null && fila("Bultos", `${p.bultos} × ${p.porBulto!.toLocaleString("es")} u.`)}{p.total != null && fila("Ingreso total", `${p.total.toLocaleString("es")} u.`)}
        {fila("Lote", p.lote)}{p.nota && fila("Nota", p.nota)}
      </div>
    </main>
  );
}
