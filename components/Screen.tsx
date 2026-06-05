"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, firebaseEnabled } from "@/lib/firebase";
import { useRuti } from "@/lib/store";
import { Avatar, RutiLogo } from "./Brand";
import { LogOut } from "lucide-react";

/** Envoltorio de pantallas internas: exige sesión y dibuja el encabezado. */
export function Screen({
  titulo,
  subtitulo,
  children,
  fill = false,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  /** Si es true, el contenido llena la altura sin scroll de página
   *  (para pantallas con scroll interno propio, como el chat de voz o el mapa). */
  fill?: boolean;
}) {
  const router = useRouter();
  const usuario = useRuti((s) => s.usuario);
  const authReady = useRuti((s) => s.authReady);
  const logout = useRuti((s) => s.logout);

  const cerrarSesion = async () => {
    const esInvitado = useRuti.getState().esInvitado;
    if (firebaseEnabled && auth && !esInvitado) {
      try {
        await signOut(auth); // AuthProvider limpia el store al detectar logout.
      } catch (e) {
        console.error("Error al cerrar sesión:", e);
      }
    } else {
      // Modo invitado o simulado: limpiamos la sesión local.
      logout();
    }
    router.replace("/");
  };

  useEffect(() => {
    if (authReady && !usuario) router.replace("/");
  }, [authReady, usuario, router]);

  if (!authReady) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Cargando…
      </div>
    );
  }
  if (!usuario) return null;

  return (
    <div className="flex h-full flex-col relative z-0">
      <header className="flex items-center justify-between border-b border-border/50 glass px-5 py-3.5 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <RutiLogo size={36} />
          <div>
            <h1 className="text-[17px] font-extrabold leading-tight tracking-tight">{titulo}</h1>
            {subtitulo && (
              <p className="text-xs text-muted/80">{subtitulo}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Avatar nombre={usuario.nombre} size={36} />
          <button
            onClick={cerrarSesion}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="rounded-xl border border-border/50 bg-surface-2/30 p-2 text-muted transition-all hover:border-danger/50 hover:bg-danger/10 hover:text-danger hover:scale-105 active:scale-95"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </header>
      <div
        className={`min-h-0 flex-1 px-5 py-5 ${
          fill ? "flex flex-col" : "no-scrollbar overflow-y-auto"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
