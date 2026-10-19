"use client";
import { useEffect, useState } from "react";
export default function TemaBoton() {
  const [osc, setOsc] = useState(false);
  useEffect(() => setOsc(document.documentElement.classList.contains("dark")), []);
  const cambiar = () => {
    const n = !osc; setOsc(n);
    document.documentElement.classList.toggle("dark", n);
    try { localStorage.setItem("tema", n ? "oscuro" : "claro"); } catch {}
  };
  return <button onClick={cambiar} className="rounded-md px-3 py-2 text-sm text-mute active:bg-soft">{osc ? "Modo día" : "Modo noche"}</button>;
}
