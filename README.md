# Catálogo D'Locos HV (maqueta)
Next.js 14 + TypeScript + Tailwind. Datos de demostración en `lib/data.ts` (sin base de datos aún).

## Local
npm install && npm run dev  -> http://localhost:3000
(La cámara funciona en localhost y en HTTPS; Vercel ya da HTTPS.)

## Vercel
1. Sube la carpeta a un repositorio de GitHub.
2. En vercel.com: Add New > Project > importa el repo > Deploy (sin variables por ahora).

## Probar el escáner
Abre `/demo` en la computadora y escanea los códigos con el celular, o usa la entrada manual.

## Instalar como app
Android: menú de Chrome > "Instalar aplicación". iPhone: Safari > Compartir > "Añadir a pantalla de inicio".

## Siguiente etapa
MySQL (mysql2), login real, panel admin, importación del catálogo y base de códigos de barras.
