"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Usuario,
  Conductor,
  Documento,
  Ruta,
  Pasajero,
} from "./types";
import { documentosSeed } from "./seed";
import { EVENTOS, EventoKey, clampScore } from "./gamification";
import type { PerfilData } from "./profile";

interface RegistroEvento {
  id: string;
  label: string;
  delta: number;
  emoji: string;
  ts: number;
}

interface RutiState {
  usuario: Usuario | null;
  /** uid de Firebase del usuario autenticado (null en modo simulado). */
  uid: string | null;
  conductor: Conductor;
  documentos: Documento[];
  score: number;
  historial: RegistroEvento[];
  rutaSeleccionada: Ruta | null;
  pasajerosAceptados: string[];
  ingresos: number;
  /** true una vez que Zustand rehidrató desde localStorage. Evita que el
   *  guard de sesión redirija a login antes de leer el estado persistido. */
  hydrated: boolean;
  /** true cuando ya se resolvió el estado de autenticación (Firebase o
   *  rehidratación local). El guard de sesión espera a esto. */
  authReady: boolean;
  /** true cuando el usuario entró en modo invitado (sin Google/Firestore).
   *  Evita que AuthProvider borre la sesión al no haber usuario de Firebase. */
  esInvitado: boolean;

  // acciones
  setHydrated: () => void;
  setAuthReady: (v: boolean) => void;
  login: (u: Usuario) => void;
  /** Entra en modo demo sin registrarse (sin Google ni Firestore). */
  entrarInvitado: () => void;
  logout: () => void;
  setUid: (uid: string | null) => void;
  /** Carga el perfil (Firestore) en el store al iniciar sesión. */
  hydrateProfile: (data: PerfilData) => void;
  /** Limpia la sesión y restablece a valores por defecto. */
  clearSession: () => void;
  /** Snapshot serializable del perfil para guardar en Firestore. */
  perfilSnapshot: () => PerfilData | null;
  setConductorCampo: (campo: keyof Conductor, valor: string) => void;
  mergeConductor: (parcial: Partial<Conductor>) => void;
  conductorCompleto: () => boolean;
  setDocArchivo: (id: string, nombre: string) => void;
  aplicarEvento: (key: EventoKey) => void;
  seleccionarRuta: (r: Ruta) => void;
  aceptarPasajero: (p: Pasajero) => void;
  resetDemo: () => void;
}

const conductorVacio: Conductor = {
  nombre: "",
  dni: "",
  licencia: "",
  placa: "",
  tipoVehiculo: "",
};

export const useRuti = create<RutiState>()(
  persist(
    (set, get) => ({
      usuario: null,
      uid: null,
      conductor: { ...conductorVacio },
      documentos: documentosSeed,
      score: 62,
      historial: [],
      rutaSeleccionada: null,
      pasajerosAceptados: [],
      ingresos: 0,
      hydrated: false,
      authReady: false,
      esInvitado: false,

      setHydrated: () => set({ hydrated: true }),
      setAuthReady: (v) => set({ authReady: v }),
      login: (u) => set({ usuario: u, esInvitado: false }),
      entrarInvitado: () =>
        set({
          usuario: { nombre: "Invitado", email: "", avatarUrl: "" },
          uid: null,
          esInvitado: true,
          authReady: true,
        }),
      logout: () => set({ usuario: null, uid: null, esInvitado: false }),
      setUid: (uid) => set({ uid }),

      hydrateProfile: (data) =>
        set({
          usuario: data.perfil,
          conductor: { ...conductorVacio, ...data.conductor },
          documentos: data.documentos?.length
            ? data.documentos
            : documentosSeed.map((d) => ({ ...d })),
          score: data.score ?? 62,
          historial: data.historial ?? [],
          rutaSeleccionada: data.rutaSeleccionada ?? null,
          pasajerosAceptados: data.pasajerosAceptados ?? [],
          ingresos: data.ingresos ?? 0,
        }),

      clearSession: () =>
        set({
          usuario: null,
          uid: null,
          esInvitado: false,
          conductor: { ...conductorVacio },
          documentos: documentosSeed.map((d) => ({ ...d, archivoNombre: null })),
          score: 62,
          historial: [],
          rutaSeleccionada: null,
          pasajerosAceptados: [],
          ingresos: 0,
        }),

      perfilSnapshot: () => {
        const s = get();
        if (!s.usuario) return null;
        return {
          perfil: s.usuario,
          conductor: s.conductor,
          documentos: s.documentos,
          score: s.score,
          historial: s.historial,
          rutaSeleccionada: s.rutaSeleccionada,
          pasajerosAceptados: s.pasajerosAceptados,
          ingresos: s.ingresos,
        };
      },

      setConductorCampo: (campo, valor) =>
        set((s) => ({ conductor: { ...s.conductor, [campo]: valor } })),

      mergeConductor: (parcial) =>
        set((s) => {
          const limpio = Object.fromEntries(
            Object.entries(parcial).filter(
              ([, v]) => typeof v === "string" && v.trim() !== "",
            ),
          );
          return { conductor: { ...s.conductor, ...limpio } };
        }),

      conductorCompleto: () =>
        Object.values(get().conductor).every((v) => v.trim() !== ""),

      setDocArchivo: (id, nombre) =>
        set((s) => ({
          documentos: s.documentos.map((d) =>
            d.id === id ? { ...d, archivoNombre: nombre } : d,
          ),
        })),

      aplicarEvento: (key) =>
        set((s) => {
          const ev = EVENTOS[key];
          return {
            score: clampScore(s.score + ev.delta),
            historial: [
              {
                id: crypto.randomUUID(),
                label: ev.label,
                delta: ev.delta,
                emoji: ev.emoji,
                ts: Date.now(),
              },
              ...s.historial,
            ].slice(0, 12),
          };
        }),

      seleccionarRuta: (r) => set({ rutaSeleccionada: r }),

      aceptarPasajero: (p) =>
        set((s) =>
          s.pasajerosAceptados.includes(p.id)
            ? s
            : {
                pasajerosAceptados: [...s.pasajerosAceptados, p.id],
                ingresos: +(s.ingresos + p.tarifa).toFixed(2),
              },
        ),

      resetDemo: () =>
        set({
          conductor: { ...conductorVacio },
          documentos: documentosSeed.map((d) => ({ ...d, archivoNombre: null })),
          score: 62,
          historial: [],
          rutaSeleccionada: null,
          pasajerosAceptados: [],
          ingresos: 0,
        }),
    }),
    {
      name: "ruti-store",
      version: 1,
      partialize: (s) => ({
        usuario: s.usuario,
        esInvitado: s.esInvitado,
        conductor: s.conductor,
        documentos: s.documentos,
        score: s.score,
        historial: s.historial,
        rutaSeleccionada: s.rutaSeleccionada,
        pasajerosAceptados: s.pasajerosAceptados,
        ingresos: s.ingresos,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
