# Conectar RUTI con Firebase (Auth + perfiles por usuario)

Esta guía conecta el login real con **Google** y guarda el **perfil de cada
conductor** (datos del registro por voz, documentos, score y reputación) en
**Cloud Firestore**, una colección `users/{uid}` por usuario.

> **Sin estas credenciales la app sigue funcionando** con login simulado +
> localStorage. En cuanto pegas las claves, el login pasa a ser real con Google.

---

## Paso 1 — Crear el proyecto Firebase

1. Entra a <https://console.firebase.google.com> e inicia sesión con tu cuenta Google.
2. **Agregar proyecto** → nombre `ruti` (o el que quieras) → continuar.
3. Puedes **desactivar** Google Analytics (no es necesario) → **Crear proyecto**.

## Paso 2 — Registrar la app web

1. En el proyecto, pulsa el ícono **`</>`** (Web) para “Agregar app web”.
2. Apodo: `ruti-web`. **No** marques Firebase Hosting → **Registrar app**.
3. Firebase te muestra el objeto `firebaseConfig`. **Copia esos valores**, los
   necesitarás en el Paso 5. Ejemplo:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "ruti-xxxx.firebaseapp.com",
     projectId: "ruti-xxxx",
     storageBucket: "ruti-xxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef...",
   };
   ```

## Paso 3 — Activar el login con Google

1. Menú izquierdo → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → **Add new provider** → **Google** → **Activar**.
3. Elige un correo de soporte → **Guardar**.
4. **Settings → Authorized domains**: ya están `localhost` y tu dominio de
   Firebase. Cuando despliegues en Vercel, **agrega tu dominio**
   (ej. `ruti-app.vercel.app`) aquí, o el popup de Google será bloqueado.

## Paso 4 — Crear Firestore y sus reglas

1. Menú izquierdo → **Compilación → Firestore Database** → **Crear base de datos**.
2. Modo **Producción** → elige la región (ej. `nam5` / `southamerica-east1`) → habilitar.
3. Pestaña **Reglas** → pega esto y **Publicar**. Cada usuario solo puede leer/
   escribir su propio documento:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

## Paso 5 — Pegar las credenciales en el proyecto

1. Copia `.env.example` a **`.env.local`** (en la raíz del proyecto).
2. Rellena los valores de `firebaseConfig` (Paso 2):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ruti-xxxx.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=ruti-xxxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ruti-xxxx.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
   NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...
   ```
3. Reinicia el dev server: `npm run dev`.

## Paso 6 — Probar

1. Abre <http://localhost:3000> en Chrome → **Continuar con Google** → elige tu cuenta.
2. Completa el registro por voz. En **Firebase Console → Firestore** verás
   aparecer `users/{tu-uid}` con `perfil`, `conductor`, `documentos`, `score`, etc.,
   actualizándose en vivo.
3. **Cerrar sesión** (ícono arriba a la derecha) y volver a entrar: tus datos se
   recargan desde Firestore. Si entras con **otra cuenta Google**, verás un perfil
   independiente.

## Paso 7 — Desplegar en Vercel

1. En el proyecto de Vercel → **Settings → Environment Variables**, agrega las 6
   variables `NEXT_PUBLIC_FIREBASE_*` (y `GEMINI_API_KEY` si la usas).
2. **Redeploy**.
3. En **Firebase → Authentication → Settings → Authorized domains**, agrega el
   dominio de Vercel (ej. `ruti-app.vercel.app`).

---

### ¿Cómo funciona por dentro?

| Archivo | Rol |
|---------|-----|
| [lib/firebase.ts](lib/firebase.ts) | Inicializa Firebase; `firebaseEnabled` decide real vs simulado |
| [lib/profile.ts](lib/profile.ts) | Crea/carga/guarda `users/{uid}` en Firestore |
| [components/AuthProvider.tsx](components/AuthProvider.tsx) | Escucha la sesión, carga el perfil y **autoguarda** (debounce) los cambios |
| [components/GoogleLoginButton.tsx](components/GoogleLoginButton.tsx) | `signInWithPopup` con Google (o simulado) |
| [components/Screen.tsx](components/Screen.tsx) | Guard de sesión (`authReady`) + cerrar sesión (`signOut`) |

El modelo en Firestore (`users/{uid}`): `perfil` (nombre, email, foto),
`conductor`, `documentos[]`, `score`, `historial[]`, `rutaSeleccionada`,
`pasajerosAceptados[]`, `ingresos`, `createdAt`, `updatedAt`.
