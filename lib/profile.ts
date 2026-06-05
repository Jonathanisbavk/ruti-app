import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { documentosSeed } from "./seed";
import type {
  Conductor,
  Documento,
  Ruta,
  Usuario,
} from "./types";

interface RegistroEvento {
  id: string;
  label: string;
  delta: number;
  emoji: string;
  ts: number;
}

/** Datos del perfil de un conductor que viven en Firestore (users/{uid}). */
export interface PerfilData {
  perfil: Usuario;
  conductor: Conductor;
  documentos: Documento[];
  score: number;
  historial: RegistroEvento[];
  rutaSeleccionada: Ruta | null;
  pasajerosAceptados: string[];
  ingresos: number;
}

const conductorVacio: Conductor = {
  nombre: "",
  dni: "",
  licencia: "",
  placa: "",
  tipoVehiculo: "",
};

function perfilInicial(usuario: Usuario): PerfilData {
  return {
    perfil: usuario,
    conductor: { ...conductorVacio },
    documentos: documentosSeed.map((d) => ({ ...d })),
    score: 62,
    historial: [],
    rutaSeleccionada: null,
    pasajerosAceptados: [],
    ingresos: 0,
  };
}

/** Carga el perfil del usuario; si es su primer ingreso, lo crea con valores
 *  por defecto. Devuelve siempre un PerfilData listo para hidratar el store. */
export async function cargarOCrearPerfil(
  uid: string,
  usuario: Usuario,
): Promise<PerfilData> {
  if (!db) return perfilInicial(usuario);
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as Partial<PerfilData>;
    // Combina con el inicial por si faltan campos en documentos antiguos.
    return { ...perfilInicial(usuario), ...data, perfil: usuario };
  }

  const inicial = perfilInicial(usuario);
  await setDoc(ref, { ...inicial, createdAt: serverTimestamp() });
  return inicial;
}

/** Guarda (merge) el estado del perfil del usuario en Firestore. */
export async function guardarPerfil(
  uid: string,
  data: PerfilData,
): Promise<void> {
  if (!db) return;
  const ref = doc(db, "users", uid);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
