"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Producto, money } from "@/lib/data";
import { agregar, docena, leerCarrito } from "@/lib/pedidos";
const num = (s: string) => { const n = parseFloat(s.replace(",", ".")); return isFinite(n) && n > 0 ? n : null; };
const dec = (s: string) => s.replace(/[^\d.,]/g, "");
const r2 = (n: number) => Math.round(n * 100) / 100;
export default function AgregarPedido({ p }: { p: Producto }) {
  const [modo, setModo] = useState<"unidad" | "bulto">("unidad");
  const [txt, setTxt] = useState("1");
  const [uTxt, setUTxt] = useState("");
  const [pTxt, setPTxt] = useState("");
  const [en, setEn] = useState({ u: 0, b: 0 });
  const cant = Math.max(1, parseInt(txt) || 1);
  useEffect(() => {
    const f = () => {
      const ls = leerCarrito().filter((l) => l.pid === p.id);
      setEn({ u: ls.filter((l) => !l.bulto).reduce((s, l) => s + l.cant, 0), b: ls.filter((l) => l.bulto).reduce((s, l) => s + l.cant, 0) });
    };
    f(); window.addEventListener("carrito", f); return () => window.removeEventListener("carrito", f);
  }, [p.id]);
  const btn = "h-12 min-w-12 rounded-md border border-line bg-surface px-2 text-sm font-semibold active:bg-soft";
  const esBulto = modo === "bulto";
  const conocido = p.porBulto != null;
  const u = conocido ? p.porBulto : (num(uTxt) ? Math.floor(num(uTxt)!) : null);
  const base = p.mayor ?? p.unidad;
  const pbManual = conocido ? null : num(pTxt);
  const precioB = pbManual ?? (u != null && base != null ? r2(u * base) : null);
  const pedido = (
    <p className="text-center text-xs text-mute">
      {en.u > 0 ? `En el pedido: ${en.u} u. · ` : ""}{en.b > 0 ? `${en.b} bulto${en.b > 1 ? "s" : ""} · ` : ""}
      <Link href="/pedido" className="font-semibold text-accent">Ver pedido en curso</Link>
    </p>
  );
  const sel = (m: "unidad" | "bulto", t: string) => <button key={m} onClick={() => setModo(m)} className={`rounded-md border border-line p-2 text-sm font-semibold ${modo === m ? "bg-brand text-white" : "bg-surface"}`}>{t}</button>;
  return (
    <div className="space-y-2 rounded-lg border border-line bg-surface p-3">
      <div className="grid grid-cols-2 gap-2">{sel("unidad", "Por unidad")}{sel("bulto", "Por bulto")}</div>
      <div className="flex items-center gap-1.5">
        {esBulto ? (
          <button onClick={() => setTxt(String(Math.max(1, cant - 1)))} className={`${btn} text-xl`}>−</button>
        ) : (
          <>
            <button onClick={() => setTxt(String(docena(cant, -1)))} className={btn}>−12</button>
            <button onClick={() => setTxt(String(Math.max(1, cant - 1)))} className={`${btn} text-xl`}>−</button>
          </>
        )}
        <input value={txt} inputMode="numeric" onFocus={(e) => e.target.select()} onChange={(e) => setTxt(e.target.value.replace(/\D/g, ""))} onBlur={() => setTxt(String(cant))} className="h-12 min-w-0 flex-1 rounded-md border border-line text-center text-xl font-semibold" />
        <button onClick={() => setTxt(String(cant + 1))} className={`${btn} text-xl`}>+</button>
        {!esBulto && <button onClick={() => setTxt(String(docena(cant, 1)))} className={btn}>+12</button>}
      </div>
      {esBulto ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 5, 10].map((n) => <button key={n} onClick={() => setTxt(String(n))} className={`rounded-md border border-line p-2 text-xs font-semibold ${cant === n ? "bg-brand text-white" : "bg-surface"}`}>{n} bulto{n > 1 ? "s" : ""}</button>)}
          </div>
          {conocido ? (
            <p className="rounded-md bg-soft p-2 text-xs">1 bulto = <b>{p.porBulto!.toLocaleString("es")} u.</b>{precioB != null && <> · <b>{money(precioB)}</b> c/bulto (al mayor {base != null ? money(base) : "—"} c/u)</>}</p>
          ) : (
            <div className="space-y-2 rounded-md bg-soft p-2">
              <p className="text-xs text-mute">Este producto no tiene dato de bulto en el catálogo. Si lo sabes, complétalo; si no, agrégalo igual y lo ajustas en el pedido.</p>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-mute">Unidades por bulto<input value={uTxt} inputMode="numeric" onChange={(e) => setUTxt(e.target.value.replace(/\D/g, ""))} placeholder="opcional" className="mt-1 h-10 w-full rounded-md border border-line bg-surface px-2 text-center text-base font-semibold text-ink" /></label>
                <label className="text-xs text-mute">Precio del bulto ($)<input value={pTxt} inputMode="decimal" onChange={(e) => setPTxt(dec(e.target.value))} placeholder={precioB != null ? String(precioB).replace(".", ",") : "opcional"} className="mt-1 h-10 w-full rounded-md border border-line bg-surface px-2 text-center text-base font-semibold text-ink" /></label>
              </div>
            </div>
          )}
          {precioB != null && <p className="text-center text-sm font-semibold text-accent">{cant} bulto{cant > 1 ? "s" : ""}{u != null ? ` (${(cant * u).toLocaleString("es")} u.)` : ""} = {money(precioB * cant)}</p>}
          {u != null && p.stock != null && cant * u > p.stock && <p className="text-xs font-medium text-red-600">Pides más de lo que hay en bodega ({p.stock.toLocaleString("es")} u.).</p>}
          <p className="text-center text-xs text-mute">Los bultos siempre van al precio al mayor.</p>
          <button onClick={() => agregar(p.id, cant, "mayor", { u: conocido ? null : u, pb: pbManual })} className="w-full rounded-md bg-brand p-3 font-semibold text-white active:opacity-90">Agregar {cant} bulto{cant > 1 ? "s" : ""} al pedido</button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {[12, 24, 36, 60].map((n) => <button key={n} onClick={() => setTxt(String(n))} className={`rounded-md border border-line p-2 text-xs font-semibold ${cant === n ? "bg-brand text-white" : "bg-surface"}`}>{n / 12} doc. ({n})</button>)}
          </div>
          {p.stock != null && cant > p.stock && <p className="text-xs font-medium text-red-600">Pides más de lo que hay en bodega ({p.stock.toLocaleString("es")} u.).</p>}
          <button onClick={() => agregar(p.id, cant, "menor")} className="w-full rounded-md bg-brand p-3 font-semibold text-white active:opacity-90">Agregar {cant} al pedido</button>
        </>
      )}
      {pedido}
    </div>
  );
}
