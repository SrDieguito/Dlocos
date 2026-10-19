"use client";
import Link from "next/link";
import { useEffect } from "react";
import JsBarcode from "jsbarcode";
import { PRODUCTOS } from "@/lib/data";
export default function Demo() {
  const lista = PRODUCTOS.slice(0, 6);
  useEffect(() => { lista.forEach((p) => JsBarcode(`#b${p.id}`, p.barras, { format: "CODE128", height: 60, fontSize: 14 })); }, []);
  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">Códigos de prueba</h1>
      <p className="text-sm text-mute">Abre esta página en la computadora y escanea la pantalla con el celular.</p>
      {lista.map((p) => (<div key={p.id} className="rounded-lg border border-line p-3 text-center"><p className="text-sm font-medium">{p.nombre}</p><svg id={`b${p.id}`} className="mx-auto max-w-full" /></div>))}
    </main>
  );
}
