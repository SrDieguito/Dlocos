// Pedidos/proformas guardados en localStorage (MAQUETA: cada celular guarda los suyos; se compartirán con MySQL).
import { PRODUCTOS, Producto } from "./data";
// Si `bulto` existe, la línea es por bulto: `cant` = nº de bultos, siempre al precio al mayor.
// bulto.u = unidades por bulto (null = usar el dato del catálogo); bulto.pb = precio del bulto (null = unidades × precio al mayor).
export type Linea = { pid: string; cant: number; precio: "mayor" | "menor"; ok?: boolean; bulto?: { u: number | null; pb: number | null } };
export type Estado = "pendiente" | "en_preparacion" | "listo" | "entregado" | "anulado";
export type Pedido = {
  id: string; n: number; cliente: string; telefono: string; vendedor: string; bodeguero: string;
  estado: Estado; lineas: Linea[]; nota: string; creado: string; tomado?: string; listo?: string; entregado?: string;
};
export const ESTADOS: Record<Estado, { t: string; c: string }> = {
  pendiente: { t: "Pendiente", c: "bg-gold/30 text-ink" },
  en_preparacion: { t: "En preparación", c: "bg-blue-500/15 text-blue-500" },
  listo: { t: "Listo para entregar", c: "bg-brand/15 text-accent" },
  entregado: { t: "Entregado", c: "bg-soft text-mute" },
  anulado: { t: "Anulado", c: "bg-red-100 text-red-600" },
};
function get<T>(k: string, d: T): T { try { return JSON.parse(localStorage.getItem(k) || "") ?? d; } catch { return d; } }
const set = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
export const usuario = () => get<{ nombre: string; rol: string } | null>("usuario", null);
export type Modo = "auto" | "menor" | "mayor" | "manual";
export const UMBRAL = 50; // compras de más de este monto (a precio al menor) pasan al precio al mayor
export const leerModo = () => get<Modo>("modo", "auto");
export const guardarModo = (m: Modo) => set("modo", m);
export const docena = (n: number, d: 1 | -1) => (d > 0 ? (Math.floor(n / 12) + 1) * 12 : Math.max(1, (Math.ceil(n / 12) - 1) * 12));
export const leerCarrito = () => get<Linea[]>("carrito", []);
export const guardarCarrito = (l: Linea[]) => set("carrito", l);
export const leerPedidos = () => get<Pedido[]>("pedidos", []);
export const agregar = (pid: string, cant: number, precio: Linea["precio"], bulto?: Linea["bulto"]) => {
  const c = leerCarrito(); const e = c.find((l) => l.pid === pid && !!l.bulto === !!bulto);
  if (e) { e.cant += cant; if (bulto) e.bulto = { u: bulto.u ?? e.bulto!.u, pb: bulto.pb ?? e.bulto!.pb }; }
  else c.push(bulto ? { pid, cant, precio: "mayor", bulto } : { pid, cant, precio });
  guardarCarrito(c);
  window.dispatchEvent(new Event("carrito"));
};
export const precioLinea = (p: Producto, l: Linea) => (l.precio === "mayor" ? p.mayor : p.unidad) ?? p.unidad ?? p.mayor ?? 0;
const r2 = (n: number) => Math.round(n * 100) / 100;
export const uBulto = (p: Producto, l: Linea) => l.bulto?.u ?? p.porBulto ?? null;
export const precioBulto = (p: Producto, l: Linea): number | null => {
  const u = uBulto(p, l); const base = p.mayor ?? p.unidad;
  return l.bulto?.pb ?? (u != null && base != null ? r2(u * base) : null);
};
export const unidadesLinea = (p: Producto, l: Linea) => (l.bulto ? l.cant * (uBulto(p, l) ?? 0) : l.cant);
export const totalLinea = (p: Producto, l: Linea) => (l.bulto ? (precioBulto(p, l) ?? 0) * l.cant : precioLinea(p, l) * l.cant);
export const totalLineas = (ls: Linea[]) => ls.reduce((s, l) => { const p = PRODUCTOS.find((x) => x.id === l.pid); return s + (p ? totalLinea(p, l) : 0); }, 0);
export const totalAl = (ls: Linea[], t: Linea["precio"]) => totalLineas(ls.map((l) => ({ ...l, precio: t })));
export const crearPedido = (cliente: string, telefono: string, nota: string, lineas: Linea[]) => {
  const ps = leerPedidos(); const n = ps.reduce((m, p) => Math.max(m, p.n), 0) + 1; const id = `P-${String(n).padStart(4, "0")}`;
  set("pedidos", [{ id, n, cliente, telefono, nota, lineas, vendedor: usuario()?.nombre || "—", bodeguero: "", estado: "pendiente", creado: new Date().toISOString() }, ...ps]);
  guardarCarrito([]); guardarModo("auto"); return id;
};
export const actualizar = (id: string, f: (p: Pedido) => Pedido) => {
  const ps = leerPedidos().map((p) => (p.id === id ? f(p) : p)); set("pedidos", ps); return ps.find((p) => p.id === id);
};
export const fecha = (s?: string) => (s ? new Date(s).toLocaleString("es", { dateStyle: "short", timeStyle: "short" }) : "—");
