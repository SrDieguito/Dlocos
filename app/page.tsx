"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Producto, leerRecientes } from "@/lib/data";
import { leerCarrito } from "@/lib/pedidos";
import ProductoCard from "@/components/ProductoCard";
import TemaBoton from "@/components/TemaBoton";
type U = { nombre: string; rol: "admin" | "empleado" | "bodeguero" };
export default function Home() {
  const [u, setU] = useState<U | null>(null);
  const [nombre, setNombre] = useState("");
  const [rec, setRec] = useState<Producto[]>([]);
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem("usuario"); if (s) setU(JSON.parse(s)); } catch {}
    setRec(leerRecientes()); setOk(true);
  }, []);
  const entrar = (rol: U["rol"]) => {
    const x = { nombre: nombre.trim() || ({ admin: "Administrador", empleado: "Empleado", bodeguero: "Bodeguero" })[rol], rol };
    localStorage.setItem("usuario", JSON.stringify(x)); setU(x); window.dispatchEvent(new Event("usuario"));
  };
  const salir = () => { localStorage.removeItem("usuario"); setU(null); window.dispatchEvent(new Event("usuario")); };
  if (!ok) return null;
  if (!u)
    return (
      <main className="flex min-h-screen flex-col justify-center gap-5 p-6">
        <div className="fixed right-3 top-3"><TemaBoton /></div>
        <div><p className="text-2xl font-semibold text-accent">D'Locos HV</p><p className="text-mute">Catálogo y precios para el personal</p></div>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className="rounded-md border border-line p-4 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40" />
        <button onClick={() => entrar("empleado")} className="rounded-md bg-brand p-4 text-lg font-semibold text-white active:opacity-90">Entrar como empleado</button>
        <button onClick={() => entrar("admin")} className="rounded-md border-2 border-brand p-4 font-semibold text-accent">Entrar como administrador</button>
        <button onClick={() => entrar("bodeguero")} className="rounded-md border border-line p-4 font-semibold">Entrar como bodeguero</button>
        <p className="text-xs text-mute">Maqueta: el inicio de sesión real con usuario y contraseña se implementa con MySQL.</p>
      </main>
    );
  return (
    <main className="space-y-5 p-5">
      <header className="flex items-start justify-between">
        <div><p className="text-xl font-semibold text-accent">D'Locos HV</p><p className="text-sm text-mute">Hola, {u.nombre}</p></div>
        <div className="flex items-center">
          <TemaBoton />
          <button onClick={salir} className="rounded-lg px-3 py-2 text-sm text-mute active:bg-soft">Cerrar sesión</button>
        </div>
      </header>
      <form action="/catalogo"><input name="q" placeholder="Buscar por nombre o código" className="w-full rounded-md border border-line p-4 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40" /></form>
      <Link href="/escaner" className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg bg-brand text-white">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#E0B800" strokeWidth="2" strokeLinecap="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8v8M12 8v8M16 8v8" /></svg>
        <span className="text-2xl font-semibold">ESCANEAR PRODUCTO</span>
      </Link>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/catalogo" className="rounded-lg border border-line p-4 text-center font-semibold active:bg-soft">Catálogo</Link>
        <Link href="/catalogo#categorias" className="rounded-lg border border-line p-4 text-center font-semibold active:bg-soft">Categorías</Link>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {u.rol !== "bodeguero" && <Link href="/pedido" className="rounded-lg bg-ink text-canvas p-4 text-center font-semibold active:opacity-90">Nuevo pedido{leerCarrito().length > 0 ? ` (${leerCarrito().length})` : ""}</Link>}
        <Link href="/pedidos" className="rounded-lg bg-soft p-4 text-center font-semibold active:opacity-90">Pedidos</Link>
      </div>
      {u.rol === "admin" && <Link href="/admin" className="block rounded-lg bg-soft p-4 text-center font-semibold">Panel administrativo</Link>}
      <section className="space-y-2">
        <h2 className="font-semibold">Consultados recientemente</h2>
        {rec.length === 0 ? <p className="text-sm text-mute">Aún no has consultado productos. Escanea el primero.</p> : rec.map((p) => <ProductoCard key={p.id} p={p} />)}
      </section>
    </main>
  );
}
