# RUTI — Mockup funcional

> **Formalización, seguridad y conexión** para conductores de transporte en Lima/Callao.
> Prototipo para evaluación de jurados. Creaciones Fast.

App móvil (web) que demuestra los 5 pasos de la propuesta RUTI:

1. **Login con Google** (simulado, sin fricción para la demo).
2. **Registro por voz con un agente de IA** — el conductor se registra hablando.
3. **Documentos + alertas inteligentes** de vencimiento (SOAT, licencia, etc.).
4. **Mapa con GPS** y pasajeros cercanos en tiempo real.
5. **Reputación vial gamificada** — score, niveles (Bronce→Oro), insignias y beneficios.

## Stack (todo gratis)

- **Next.js 16 + React 19 + TypeScript** (App Router)
- **Tailwind CSS 4** — diseño mobile-first con marco de teléfono
- **Zustand + localStorage** — sin backend ni base de datos
- **react-leaflet + OpenStreetMap** — mapas sin API key
- **Web Speech API** — voz del navegador (reconocimiento + síntesis)
- **Google Gemini** (`gemini-2.0-flash`, free tier) — IA conversacional, con
  fallback por reglas si no hay API key

## Ejecutar en local

```bash
npm install
cp .env.example .env.local   # opcional: añade tu GEMINI_API_KEY
npm run dev
```

Abre http://localhost:3000 **en Google Chrome** (mejor soporte de Web Speech API)
y permite **micrófono** y **ubicación** cuando el navegador lo pida.

> Sin `GEMINI_API_KEY` la app funciona igual: el agente de voz usa un parser
> guionizado por reglas. Con la key, las respuestas son conversacionales.

### Conseguir la API key de Gemini (gratis, sin tarjeta)

1. Entra a https://aistudio.google.com/app/apikey
2. Crea una API key y cópiala.
3. Pégala en `.env.local` como `GEMINI_API_KEY=...`

### Login real con Google + perfiles por usuario (Firebase)

Por defecto el login es **simulado** (sin configuración). Para activar
autenticación real con Google y guardar el perfil de cada conductor en
Firestore, sigue la guía paso a paso en **[FIREBASE-SETUP.md](FIREBASE-SETUP.md)**.

## Desplegar en Vercel

1. Sube el repo a GitHub e impórtalo en https://vercel.com/new (framework Next.js, detección automática).
2. En **Project Settings → Environment Variables** añade `GEMINI_API_KEY` (opcional).
3. Deploy. Comparte la URL pública con los jurados.

```bash
# o desde la CLI
npm i -g vercel
vercel        # preview
vercel --prod # producción
```

## Flujo de demo sugerido

Login → registro por voz (habla y mira cómo se llenan los campos) → documentos
(sube un archivo y observa la alerta de vencimiento) → mapa (acepta un pasajero,
sube el ingreso) → reputación (simula eventos y mira subir/bajar el score).
El botón **Reiniciar demo** (en Reputación) restablece los datos.
