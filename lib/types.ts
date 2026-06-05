// Modelo de datos del mockup RUTI

export interface Usuario {
  nombre: string;
  email: string;
  avatarUrl: string;
}

/** Campos del conductor que captura el agente de IA por voz */
export interface Conductor {
  nombre: string;
  dni: string;
  licencia: string;
  placa: string;
  tipoVehiculo: string;
}

export type CampoConductor = keyof Conductor;

export type EstadoDocumento = "vigente" | "por_vencer" | "vencido";

export interface Documento {
  id: string;
  tipo: string;
  descripcion: string;
  fechaVencimiento: string; // ISO yyyy-mm-dd
  archivoNombre: string | null;
}

export interface Pasajero {
  id: string;
  nombre: string;
  origen: string;
  destino: string;
  tarifa: number;
  lat: number;
  lng: number;
  ratingPasajero: number;
}

export interface Ruta {
  id: string;
  codigo: string;
  nombre: string;
}

export interface Badge {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  desbloqueado: boolean;
}

export interface Nivel {
  nombre: string;
  min: number;
  color: string;
  emoji: string;
  beneficio: string;
}

export interface ChatMsg {
  role: "agent" | "user";
  text: string;
}
