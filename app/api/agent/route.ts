import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

type Conductor = {
  nombre: string;
  dni: string;
  licencia: string;
  placa: string;
  tipoVehiculo: string;
};
type Campo = keyof Conductor;

const ORDEN: Campo[] = ["nombre", "dni", "licencia", "placa", "tipoVehiculo"];

const PREGUNTAS: Record<Campo, string> = {
  nombre: "¿Cuál es tu nombre completo?",
  dni: "Perfecto. Ahora dime tu número de DNI.",
  licencia: "Gracias. ¿Cuál es el número de tu licencia de conducir?",
  placa: "Muy bien. ¿Cuál es la placa de tu vehículo?",
  tipoVehiculo:
    "Por último, ¿qué tipo de vehículo conduces? Por ejemplo: auto, combi o mototaxi.",
};

function primerFaltante(c: Partial<Conductor>): Campo | null {
  return ORDEN.find((k) => !c[k] || c[k]!.trim() === "") ?? null;
}

function limpiar(campo: Campo, texto: string): string {
  const t = texto.trim();
  if (campo === "dni") return (t.match(/\d/g) ?? []).join("").slice(0, 8) || t;
  if (campo === "placa")
    return t.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
  if (campo === "licencia")
    return t.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
  return t.replace(/\s+/g, " ");
}

// ---- Fallback determinista (sin API key) ----
function porReglas(
  action: "start" | "reply",
  userText: string,
  conductor: Partial<Conductor>,
) {
  const merged: Partial<Conductor> = { ...conductor };
  const extracted: Partial<Conductor> = {};

  if (action === "reply") {
    const objetivo = primerFaltante(conductor);
    if (objetivo && userText.trim()) {
      const val = limpiar(objetivo, userText);
      if (val) {
        extracted[objetivo] = val;
        merged[objetivo] = val;
      }
    }
  }

  const siguiente = primerFaltante(merged);
  const done = siguiente === null;
  const saludo =
    action === "start"
      ? "Hola, soy el agente de RUTI. Voy a registrarte hablando. "
      : "";
  const reply = done
    ? "¡Listo! Registré todos tus datos. Tu perfil de conductor quedó creado en RUTI."
    : saludo + PREGUNTAS[siguiente];

  return { reply, extracted, done, source: "reglas" as const };
}

// ---- Gemini (free tier) ----
async function porGemini(
  action: "start" | "reply",
  userText: string,
  conductor: Partial<Conductor>,
  apiKey: string,
) {
  const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
  const { generateObject } = await import("ai");

  const google = createGoogleGenerativeAI({ apiKey });
  const objetivo = primerFaltante(conductor);

  const schema = z.object({
    extracted: z
      .object({
        nombre: z.string().optional(),
        dni: z.string().optional(),
        licencia: z.string().optional(),
        placa: z.string().optional(),
        tipoVehiculo: z.string().optional(),
      })
      .describe("Sólo los campos claramente mencionados en el mensaje del usuario"),
    reply: z.string().describe("Lo que el agente dice a continuación, en español"),
  });

  const system = `Eres el agente de voz de RUTI, una app peruana que formaliza a conductores de transporte.
Tu trabajo es registrar al conductor pidiendo, uno por uno y en este orden, estos datos:
nombre completo, DNI (8 dígitos), número de licencia de conducir, placa del vehículo y tipo de vehículo.
Reglas:
- Habla en español peruano, cálido y breve (1-2 frases). Sin emojis.
- Extrae en "extracted" SOLO lo que el usuario dijo en su último mensaje.
- Luego pide el siguiente dato que falte. El siguiente dato faltante es: "${objetivo ?? "ninguno, ya están todos"}".
- Si ya están todos los datos, felicita y confirma que el registro quedó completo.
Datos ya capturados: ${JSON.stringify(conductor)}.`;

  const prompt =
    action === "start"
      ? "Saluda al conductor presentándote como el agente de RUTI y pídele el primer dato faltante."
      : `El conductor respondió por voz: "${userText}". Extrae lo que corresponda y pide el siguiente dato.`;

  const { object } = await generateObject({
    model: google("gemini-2.0-flash"),
    schema,
    system,
    prompt,
  });

  // Limpieza y normalización de lo extraído.
  const extracted: Partial<Conductor> = {};
  for (const k of ORDEN) {
    const v = object.extracted?.[k];
    if (typeof v === "string" && v.trim()) extracted[k] = limpiar(k, v);
  }
  const merged = { ...conductor, ...extracted };
  const done = primerFaltante(merged) === null;

  return { reply: object.reply, extracted, done, source: "gemini" as const };
}

export async function POST(req: NextRequest) {
  let body: {
    action?: "start" | "reply";
    userText?: string;
    conductor?: Partial<Conductor>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const action = body.action === "start" ? "start" : "reply";
  const userText = body.userText ?? "";
  const conductor = body.conductor ?? {};
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (apiKey) {
    try {
      return NextResponse.json(
        await porGemini(action, userText, conductor, apiKey),
      );
    } catch (e) {
      // Si Gemini falla (cuota, red, etc.) caemos a reglas sin romper la demo.
      console.error("Gemini falló, usando reglas:", e);
    }
  }

  return NextResponse.json(porReglas(action, userText, conductor));
}
