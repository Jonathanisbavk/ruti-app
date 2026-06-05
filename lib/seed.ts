import type { Documento, Pasajero, Ruta, Badge } from "./types";

/** Devuelve una fecha ISO desplazada N días respecto de hoy. */
function fechaRelativa(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Documentos reglamentarios del conductor (Perú). Fechas relativas a hoy
 *  para que las alertas de vencimiento se vean realistas en cualquier demo. */
export const documentosSeed: Documento[] = [
  {
    id: "soat",
    tipo: "SOAT",
    descripcion: "Seguro Obligatorio de Accidentes de Tránsito",
    fechaVencimiento: fechaRelativa(5), // por vencer
    archivoNombre: null,
  },
  {
    id: "licencia",
    tipo: "Licencia de conducir",
    descripcion: "Categoría A-IIb",
    fechaVencimiento: fechaRelativa(420), // vigente
    archivoNombre: null,
  },
  {
    id: "tarjeta",
    tipo: "Tarjeta de propiedad",
    descripcion: "Identificación vehicular",
    fechaVencimiento: fechaRelativa(900), // vigente
    archivoNombre: null,
  },
  {
    id: "revtec",
    tipo: "Revisión técnica",
    descripcion: "Certificado de Inspección Técnica Vehicular",
    fechaVencimiento: fechaRelativa(-12), // vencido
    archivoNombre: null,
  },
];

/** Rutas urbanas de Lima de ejemplo. */
export const rutasSeed: Ruta[] = [
  { id: "r1", codigo: "201", nombre: "San Juan de Lurigancho → Centro de Lima" },
  { id: "r2", codigo: "73", nombre: "Comas → Miraflores" },
  { id: "r3", codigo: "8515", nombre: "Ate → Callao" },
];

/** Pasajeros cercanos (mock) alrededor del centro de Lima. */
export const pasajerosSeed: Pasajero[] = [
  {
    id: "p1",
    nombre: "María Q.",
    origen: "Av. Grau",
    destino: "Plaza San Martín",
    tarifa: 3.5,
    lat: -12.0561,
    lng: -77.0322,
    ratingPasajero: 4.8,
  },
  {
    id: "p2",
    nombre: "Carlos R.",
    origen: "Mercado Central",
    destino: "Av. Abancay",
    tarifa: 2.5,
    lat: -12.0495,
    lng: -77.0265,
    ratingPasajero: 4.6,
  },
  {
    id: "p3",
    nombre: "Lucía P.",
    origen: "Jr. de la Unión",
    destino: "Estación Central",
    tarifa: 4.0,
    lat: -12.0512,
    lng: -77.038,
    ratingPasajero: 5.0,
  },
  {
    id: "p4",
    nombre: "Jorge M.",
    origen: "Av. Tacna",
    destino: "Rímac",
    tarifa: 3.0,
    lat: -12.0438,
    lng: -77.0339,
    ratingPasajero: 4.4,
  },
];

/** Centro aproximado de Lima (fallback si no hay geolocalización). */
export const LIMA_CENTER: [number, number] = [-12.0494, -77.033];

export const badgesSeed: Badge[] = [
  {
    id: "semaforos",
    nombre: "Respeta semáforos",
    descripcion: "10 días sin pasar la luz roja",
    emoji: "🚦",
    desbloqueado: true,
  },
  {
    id: "sin-distraccion",
    nombre: "0 distracciones",
    descripcion: "Sin uso del celular en marcha",
    emoji: "📵",
    desbloqueado: true,
  },
  {
    id: "documentos",
    nombre: "Papeles al día",
    descripcion: "Todos los documentos vigentes",
    emoji: "📄",
    desbloqueado: false,
  },
  {
    id: "velocidad",
    nombre: "Velocidad segura",
    descripcion: "Sin excesos de velocidad por 30 días",
    emoji: "🐢",
    desbloqueado: false,
  },
];
