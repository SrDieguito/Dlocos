"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Producto, buscarPorCodigo, guardarReciente } from "@/lib/data";
import { Precios } from "@/components/ProductoCard";
import AgregarPedido from "@/components/AgregarPedido";
const beep = () => {
  try {
    const c = new AudioContext(); const o = c.createOscillator(); o.frequency.value = 880; o.connect(c.destination);
    o.start(); setTimeout(() => { o.stop(); c.close(); }, 120);
    navigator.vibrate?.(60);
  } catch {}
};
export default function Escaner() {
  const video = useRef<HTMLVideoElement>(null);
  const ctrl = useRef<{ stop: () => void } | null>(null);
  const last = useRef("");
  const [activo, setActivo] = useState(false);
  const [torch, setTorch] = useState(false);
  const [err, setErr] = useState("");
  const [manual, setManual] = useState("");
  const [res, setRes] = useState<{ codigo: string; p?: Producto } | null>(null);
  const parar = () => { ctrl.current?.stop(); ctrl.current = null; setActivo(false); setTorch(false); };
  const resolver = (c: string) => {
    if (!c || c === last.current) return;
    last.current = c; beep(); parar();
    const p = buscarPorCodigo(c); setRes({ codigo: c, p }); if (p) guardarReciente(p.id);
  };
  const iniciar = async () => {
    setErr(""); setRes(null); last.current = "";
    if (!navigator.mediaDevices?.getUserMedia) { setErr("Este navegador no permite usar la cámara (se requiere HTTPS). Usa la entrada manual."); return; }
    setActivo(true);
    try {
      const reader = new BrowserMultiFormatReader();
      ctrl.current = await reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, video.current!, (r) => { if (r) resolver(r.getText()); });
    } catch (e) {
      setActivo(false);
      const n = (e as Error)?.name;
      setErr(n === "NotAllowedError" ? "Permiso de cámara denegado. Actívalo en los ajustes del navegador y vuelve a intentar." : n === "NotFoundError" ? "No se encontró una cámara en este dispositivo." : "No se pudo abrir la cámara.");
    }
  };
  const linterna = async () => {
    try {
      const t = (video.current?.srcObject as MediaStream).getVideoTracks()[0];
      await t.applyConstraints({ advanced: [{ torch: !torch }] } as unknown as MediaTrackConstraints); setTorch(!torch);
    } catch { setErr("Este dispositivo no permite encender la linterna."); }
  };
  useEffect(() => () => ctrl.current?.stop(), []);
  return (
    <main className="space-y-4 p-5">
      <div className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-black ${activo ? "" : "hidden"}`}>
        <video ref={video} className="h-full w-full object-cover" playsInline muted />
        <div className="absolute inset-x-8 top-1/3 bottom-1/3 rounded-lg border-4 border-brand" />
        <div className="scanline absolute inset-x-8 h-0.5 bg-brand" style={{ animation: "scan 2s ease-in-out infinite" }} />
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
          <button onClick={linterna} className="rounded-full bg-surface/90 px-5 py-3 text-sm font-semibold">{torch ? "Apagar linterna" : "Linterna"}</button>
          <button onClick={parar} className="rounded-full bg-surface/90 px-5 py-3 text-sm font-semibold">Cerrar</button>
        </div>
      </div>
      {!activo && <button onClick={iniciar} className="h-28 w-full rounded-lg bg-brand text-2xl font-semibold text-white active:opacity-90">{res ? "ESCANEAR OTRO" : "ABRIR CÁMARA"}</button>}
      {err && <p className="rounded-md bg-red-500/10 p-3 text-sm text-red-600">{err}</p>}
      <form onSubmit={(e) => { e.preventDefault(); last.current = ""; resolver(manual.trim()); }} className="flex gap-2">
        <input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Código de barras manual" className="min-w-0 flex-1 rounded-md border border-line p-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand/40" />
        <button className="rounded-md bg-ink text-canvas px-5 font-semibold">Buscar</button>
      </form>
      {res && !res.p && (
        <div className="space-y-1 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
          <p className="font-semibold text-red-600">Producto no registrado</p>
          <p className="text-sm text-mute">El código {res.codigo} no está en el catálogo. Avisa al administrador.</p>
        </div>
      )}
      {res?.p && (
        <div className="space-y-3 rounded-lg border border-line p-4">
          <div><p className="text-xl font-semibold">{res.p.nombre}</p><p className="text-sm text-mute">{res.p.codigo} · {res.p.categoria}</p></div>
          <Precios p={res.p} grande />
          <AgregarPedido p={res.p} />
          <Link href={`/producto/${res.p.id}`} className="block text-center text-sm font-semibold text-accent">Ver ficha completa</Link>
        </div>
      )}
      <p className="text-center text-xs text-mute">Para probar: <Link href="/demo" className="underline">códigos demo para escanear</Link></p>
    </main>
  );
}
