"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, firebaseEnabled } from "@/lib/firebase";
import { useRuti } from "@/lib/store";

const USUARIO_DEMO = {
  nombre: "Jonathan Gutiérrez",
  email: "jonathan.conductor@gmail.com",
  avatarUrl: "",
};

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.3-.1-3.5Z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.6 39.6 16.2 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C41.9 35.6 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5Z"
      />
    </svg>
  );
}

export function GoogleLoginButton() {
  const router = useRouter();
  const login = useRuti((s) => s.login);
  const conductorCompleto = useRuti((s) => s.conductorCompleto);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    setCargando(true);

    if (firebaseEnabled && auth) {
      try {
        // Login real con Google. AuthProvider carga el perfil y redirige.
        await signInWithPopup(auth, googleProvider);
        // No navegamos aquí: AuthProvider hace el push tras cargar el perfil.
      } catch (e) {
        const code = (e as { code?: string })?.code ?? "";
        if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
          console.error("Error de login:", e);
          setError("No se pudo iniciar sesión. Intenta de nuevo.");
        }
        setCargando(false);
      }
      return;
    }

    // Fallback simulado (sin credenciales de Firebase): la demo nunca falla.
    setTimeout(() => {
      login(USUARIO_DEMO);
      router.push(conductorCompleto() ? "/documentos" : "/onboarding");
    }, 700);
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handle}
        disabled={cargando}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 font-semibold text-gray-800 shadow-lg transition hover:bg-gray-50 active:scale-[0.99] disabled:opacity-70"
      >
        {cargando ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
            Conectando…
          </>
        ) : (
          <>
            <GoogleG />
            Continuar con Google
          </>
        )}
      </button>
      {error && (
        <p className="text-center text-xs text-danger">{error}</p>
      )}
    </div>
  );
}
