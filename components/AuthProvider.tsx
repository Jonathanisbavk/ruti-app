"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, firebaseEnabled } from "@/lib/firebase";
import { cargarOCrearPerfil, guardarPerfil } from "@/lib/profile";
import { useRuti } from "@/lib/store";

/** Conecta Firebase Auth con el store:
 *  - Sincroniza la sesión (onAuthStateChanged) y carga el perfil de Firestore.
 *  - Autoguarda los cambios del perfil (debounce) en users/{uid}.
 *  - Si no hay credenciales de Firebase, marca authReady tras la rehidratación
 *    local para mantener el flujo simulado.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lastSaved = useRef<string>("");
  const perfilListo = useRef(false);

  // 1. Estado de autenticación
  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      // Modo simulado: esperamos a que localStorage rehidrate.
      if (useRuti.persist.hasHydrated()) {
        useRuti.getState().setAuthReady(true);
        return;
      }
      const unsub = useRuti.persist.onFinishHydration(() =>
        useRuti.getState().setAuthReady(true),
      );
      return unsub;
    }

    const authInstance = auth;
    let unsub: () => void = () => {};
    let cancelado = false;

    (async () => {
      // Resuelve PRIMERO el resultado del redirect para que el primer
      // onAuthStateChanged ya traiga al usuario (evita el "flash" que rebota
      // al login al volver de Google con signInWithRedirect).
      try {
        await getRedirectResult(authInstance);
      } catch (e) {
        console.error("Error al volver del login con Google:", e);
      }
      if (cancelado) return;

      unsub = onAuthStateChanged(authInstance, (fbUser) => {
        const store = useRuti.getState();
        if (fbUser) {
          const usuario = {
            nombre: fbUser.displayName ?? "Conductor RUTI",
            email: fbUser.email ?? "",
            avatarUrl: fbUser.photoURL ?? "",
          };
          // Sesión lista de INMEDIATO; el perfil se carga en segundo plano
          // para no bloquear ni rebotar al login si Firestore tarda o falla.
          store.login(usuario);
          store.setUid(fbUser.uid);
          store.setAuthReady(true);
          perfilListo.current = false;
          cargarOCrearPerfil(fbUser.uid, usuario)
            .then((data) => {
              lastSaved.current = JSON.stringify(data);
              store.hydrateProfile(data);
              perfilListo.current = true;
            })
            .catch((e) => console.error("No se pudo cargar el perfil:", e));
        } else {
          perfilListo.current = false;
          store.clearSession();
          store.setAuthReady(true);
        }
      });
    })();

    return () => {
      cancelado = true;
      unsub();
    };
  }, []);

  // 2. Autoguardado del perfil en Firestore (debounce)
  useEffect(() => {
    if (!firebaseEnabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const unsub = useRuti.subscribe((state) => {
      // Sólo guarda una vez que el perfil real ya se cargó desde Firestore,
      // para no sobrescribirlo con los valores por defecto del arranque.
      if (!state.uid || !perfilListo.current) return;
      const snap = state.perfilSnapshot();
      if (!snap) return;
      const serial = JSON.stringify(snap);
      if (serial === lastSaved.current) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        lastSaved.current = serial;
        guardarPerfil(state.uid!, snap).catch((e) =>
          console.error("No se pudo guardar el perfil:", e),
        );
      }, 800);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  // 3. Redirección tras iniciar sesión (no dejar al usuario en el login)
  useEffect(() => {
    const unsub = useRuti.subscribe((s) => {
      if (s.authReady && s.usuario && pathname === "/") {
        router.replace(s.conductorCompleto() ? "/documentos" : "/onboarding");
      }
    });
    // chequeo inmediato por si ya hay sesión al montar
    const s = useRuti.getState();
    if (s.authReady && s.usuario && pathname === "/") {
      router.replace(s.conductorCompleto() ? "/documentos" : "/onboarding");
    }
    return unsub;
  }, [pathname, router]);

  return <>{children}</>;
}
