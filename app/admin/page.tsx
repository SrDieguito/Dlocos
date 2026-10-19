"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
const modulos = ["Registrar y editar productos", "Cambiar precios e historial", "Importar Excel/CSV", "Exportar catálogo", "Categorías y fotografías", "Usuarios y permisos"];
export default function Admin() {
  const [rol, setRol] = useState<string | null>(null);
  useEffect(() => { try { setRol(JSON.parse(localStorage.getItem("usuario") || "null")?.rol ?? ""); } catch { setRol(""); } }, []);
  if (rol === null) return null;
  if (rol !== "admin") return <main className="p-5"><p className="font-semibold">Acceso restringido a administradores.</p><Link href="/" className="text-accent">Volver</Link></main>;
  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">Panel administrativo</h1>
      <p className="text-sm text-mute">Maqueta: estas secciones se conectan a MySQL en la siguiente etapa.</p>
      {modulos.map((m) => <div key={m} className="flex items-center justify-between rounded-lg border border-line p-4"><span className="font-medium">{m}</span><span className="rounded-full bg-soft px-3 py-1 text-xs">Próximamente</span></div>)}
    </main>
  );
}
