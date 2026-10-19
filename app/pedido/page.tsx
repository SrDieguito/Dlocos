"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PRODUCTOS, money } from "@/lib/data";
import { Linea, Modo, UMBRAL, crearPedido, docena, guardarCarrito, guardarModo, leerCarrito, leerModo, precioBulto, precioLinea, totalAl, totalLineas, totalLinea, uBulto, unidadesLinea } from "@/lib/pedidos";
function Cant({ v, set }: { v: number; set: (n: number) => void }) {
  const [t, setT] = useState(String(v));
  useEffect(() => setT(String(v)), [v]);
  return <input value={t} inputMode="numeric" onFocus={(e) => e.target.select()} onChange={(e) => { const s = e.target.value.replace(/\D/g, ""); setT(s); if (s) set(Math.max(1, parseInt(s))); }} onBlur={() => setT(String(v))} className="h-10 w-16 rounded-md border border-line text-center font-semibold" />;
}
function NumLibre({ v, ph, dec, set }: { v: number | null; ph: string; dec?: boolean; set: (n: number | null) => void }) {
  const [t, setT] = useState(v == null ? "" : String(v).replace(".", ","));
  return <input value={t} inputMode={dec ? "decimal" : "numeric"} placeholder={ph} onFocus={(e) => e.target.select()} onChange={(e) => { const x = e.target.value.replace(dec ? /[^\d.,]/g : /\D/g, ""); setT(x); const n = parseFloat(x.replace(",", ".")); set(isFinite(n) && n > 0 ? (dec ? n : Math.floor(n)) : null); }} className="mt-1 h-10 w-full rounded-md border border-line bg-surface px-2 text-center font-semibold text-ink" />;
}
export default function Pedido() {
  const r = useRouter();
  const [ls, setLs] = useState<Linea[]>([]);
  const [modo, setModo] = useState<Modo>("auto");
  const [cli, setCli] = useState(""); const [tel, setTel] = useState(""); const [nota, setNota] = useState("");
  useEffect(() => { setLs(leerCarrito()); setModo(leerModo()); }, []);
  const upd = (n: Linea[]) => { setLs(n); guardarCarrito(n); };
  const cambiarModo = (m: Modo) => { setModo(m); guardarModo(m); };
  const base = totalAl(ls, "menor");
  const sube = base > UMBRAL;
  const tipo = (l: Linea): Linea["precio"] => (l.bulto ? "mayor" : modo === "auto" ? (sube ? "mayor" : "menor") : modo === "manual" ? l.precio : modo);
  const ef = ls.map((l) => ({ ...l, precio: tipo(l) }));
  const setCant = (i: number, n: number) => upd(ls.map((l, j) => (j === i ? { ...l, cant: Math.max(1, n) } : l)));
  const setBulto = (i: number, patch: Partial<NonNullable<Linea["bulto"]>>) => upd(ls.map((l, j) => (j === i && l.bulto ? { ...l, bulto: { ...l.bulto, ...patch } } : l)));
  const toggle = (i: number) => { upd(ef.map((l, j) => (j === i ? { ...l, precio: l.precio === "menor" ? "mayor" : "menor" } : l))); cambiarModo("manual"); };
  const inp = "w-full rounded-md border border-line p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40";
  const sb = "h-10 min-w-10 rounded-md border border-line bg-surface px-2 text-sm font-semibold active:bg-soft";
  const mb = (m: Modo, t: string) => <button key={m} onClick={() => cambiarModo(m)} className={`rounded-md border border-line p-2 text-sm font-semibold ${modo === m ? "bg-brand text-white" : "bg-surface"}`}>{t}</button>;
  return (
    <main className="space-y-4 p-5">
      <h1 className="text-xl font-semibold">Pedido en curso</h1>
      <input className={inp} value={cli} onChange={(e) => setCli(e.target.value)} placeholder="Nombre del cliente *" />
      <input className={inp} value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" placeholder="Teléfono / WhatsApp (con código de país)" />
      {ls.length > 0 && (
        <div className="space-y-2 rounded-lg border border-line bg-surface p-3">
          <p className="text-xs font-semibold text-mute">Precios de todo el pedido</p>
          <div className="grid grid-cols-3 gap-2">{mb("auto", "Automático")}{mb("menor", "Todo al menor")}{mb("mayor", "Todo al mayor")}</div>
          <p className="text-xs text-mute">{modo === "auto" ? (sube ? `Compra de más de ${money(UMBRAL)}: se aplica el precio al mayor.` : `Faltan ${money(UMBRAL - base + 0.01)} para pasar al precio al mayor (más de ${money(UMBRAL)}).`) : modo === "manual" ? "Precios elegidos producto por producto." : `Todo el pedido va al ${modo}.`}</p>
        </div>
      )}
      {ls.length === 0 && <p className="rounded-md bg-surface p-4 text-center text-sm text-mute">Aún no hay productos. Escanea o busca en el catálogo y pulsa "+1", "+12" o "+1 bulto".</p>}
      {ef.map((l, i) => {
        const p = PRODUCTOS.find((x) => x.id === l.pid)!; const pr = precioLinea(p, l);
        const bl = !!l.bulto; const u = uBulto(p, l); const pb = precioBulto(p, l); const uds = unidadesLinea(p, l);
        return (
          <div key={`${l.pid}-${bl ? "b" : "u"}`} className="space-y-2 rounded-lg border border-line bg-surface p-3">
            <div className="flex justify-between gap-2"><div><p className="font-semibold">{p.nombre}{bl && <span className="ml-2 rounded-full bg-gold/30 px-2 py-0.5 text-xs font-semibold text-ink">Bulto</span>}</p><p className="text-xs text-mute">{p.codigo}</p></div><button onClick={() => upd(ls.filter((_, j) => j !== i))} className="text-sm text-red-600">Quitar</button></div>
            <div className="flex items-center gap-1.5">
              {!bl && <button onClick={() => setCant(i, docena(l.cant, -1))} className={sb}>−12</button>}
              <button onClick={() => setCant(i, l.cant - 1)} className={sb}>−</button>
              <Cant v={l.cant} set={(n) => setCant(i, n)} />
              <button onClick={() => setCant(i, l.cant + 1)} className={sb}>+</button>
              {!bl && <button onClick={() => setCant(i, docena(l.cant, 1))} className={sb}>+12</button>}
              {bl && <span className="text-sm text-mute">bulto{l.cant > 1 ? "s" : ""}</span>}
            </div>
            {bl ? (
              <div className="space-y-2 rounded-md bg-soft p-2">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-mute">Unidades por bulto<NumLibre v={l.bulto!.u} ph={p.porBulto != null ? String(p.porBulto) : "sin dato"} set={(n) => setBulto(i, { u: n })} /></label>
                  <label className="text-xs text-mute">Precio del bulto ($)<NumLibre v={l.bulto!.pb} dec ph={pb != null ? String(pb).replace(".", ",") : "sin dato"} set={(n) => setBulto(i, { pb: n })} /></label>
                </div>
                <p className="text-xs text-mute">{u != null ? `${l.cant} × ${u.toLocaleString("es")} = ${uds.toLocaleString("es")} u.` : "Sin unidades por bulto: ponlas si las sabes."} · siempre al mayor{pb == null && " · ⚠ falta el precio del bulto"}</p>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              {bl ? <p className="text-xs font-semibold text-mute">{pb != null ? `${money(pb)} c/bulto` : "Sin precio"}</p> : <button onClick={() => toggle(i)} className="rounded-md border border-line bg-soft px-3 py-2 text-xs font-semibold">Al {l.precio}: {money(pr)} · cambiar</button>}
              <p className="font-semibold text-accent">{money(totalLinea(p, l))}</p>
            </div>
            {p.stock != null && uds > p.stock && <p className="text-xs text-red-600">Supera la bodega ({p.stock.toLocaleString("es")} u.)</p>}
          </div>
        );
      })}
      <textarea className={inp} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota para bodega (opcional)" rows={2} />
      <div className="flex items-baseline justify-between rounded-md bg-brand p-4 text-white"><span>Total proforma</span><span className="text-2xl font-semibold">{money(totalLineas(ef))}</span></div>
      <button disabled={!cli.trim() || ls.length === 0} onClick={() => r.push(`/pedidos/${crearPedido(cli.trim(), tel.trim(), nota.trim(), ef)}`)} className="w-full rounded-lg bg-ink p-4 text-lg font-semibold text-white disabled:opacity-40">Enviar a bodega</button>
      <Link href="/escaner" className="block text-center text-sm font-semibold text-accent">+ Escanear más productos</Link>
    </main>
  );
}
