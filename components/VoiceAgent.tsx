"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRuti } from "@/lib/store";
import { useSpeech } from "@/lib/useSpeech";
import type { Conductor, ChatMsg } from "@/lib/types";
import { MicIcon, CheckIcon } from "./icons";

const CAMPOS: { key: keyof Conductor; label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "dni", label: "DNI" },
  { key: "licencia", label: "Licencia" },
  { key: "placa", label: "Placa" },
  { key: "tipoVehiculo", label: "Vehículo" },
];

type Fase = "inicio" | "escuchando" | "pensando" | "hablando" | "listo";

export function VoiceAgent() {
  const router = useRouter();
  const conductor = useRuti((s) => s.conductor);
  const mergeConductor = useRuti((s) => s.mergeConductor);
  const { supported, escuchando, hablando, escuchar, hablar } = useSpeech();

  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [fase, setFase] = useState<Fase>("inicio");
  const [texto, setTexto] = useState("");
  const [fuente, setFuente] = useState<"gemini" | "reglas" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completados = CAMPOS.filter((c) => conductor[c.key]?.trim()).length;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  async function pedirAgente(
    action: "start" | "reply",
    userText: string,
  ) {
    setFase("pensando");
    let data: {
      reply: string;
      extracted: Partial<Conductor>;
      done: boolean;
      source: "gemini" | "reglas";
    };
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userText, conductor }),
      });
      data = await res.json();
    } catch {
      data = {
        reply: "Hubo un problema de conexión. Intenta de nuevo.",
        extracted: {},
        done: false,
        source: "reglas",
      };
    }

    setFuente(data.source);
    if (Object.keys(data.extracted).length) mergeConductor(data.extracted);
    setChat((c) => [...c, { role: "agent", text: data.reply }]);

    setFase("hablando");
    await hablar(data.reply);
    setFase(data.done ? "listo" : "escuchando");
  }

  function iniciar() {
    setChat([]);
    pedirAgente("start", "");
  }

  function enviarRespuesta(valor: string) {
    const limpio = valor.trim();
    if (!limpio) return;
    setChat((c) => [...c, { role: "user", text: limpio }]);
    setTexto("");
    pedirAgente("reply", limpio);
  }

  function usarMicrofono() {
    escuchar((t) => {
      if (t) enviarRespuesta(t);
      else setFase("escuchando");
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Progreso */}
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Progreso del registro</span>
          <span>{completados}/5</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${(completados / 5) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CAMPOS.map((c) => {
            const val = conductor[c.key]?.trim();
            return (
              <span
                key={c.key}
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  val
                    ? "bg-success/15 text-success"
                    : "bg-surface-2 text-muted"
                }`}
              >
                {val ? `${c.label}: ${val}` : c.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Conversación */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto rounded-2xl border border-border bg-surface/40 p-3"
      >
        {chat.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
            <MicIcon className="mb-2 h-8 w-8 text-accent" />
            Pulsa “Iniciar registro” y el agente de RUTI te guiará por voz.
          </div>
        )}
        {chat.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`fade-up max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-white"
                  : "rounded-bl-sm bg-surface-2 text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {fase === "pensando" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-surface-2 px-3.5 py-2 text-sm text-muted">
              <span className="inline-flex gap-1">
                <Dot /> <Dot /> <Dot />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="mt-3 space-y-2">
        {fase === "inicio" && (
          <button
            onClick={iniciar}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3.5 font-semibold text-white shadow-lg active:scale-[0.99]"
          >
            Iniciar registro por voz
          </button>
        )}

        {fase === "listo" && (
          <button
            onClick={() => router.push("/documentos")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-success py-3.5 font-semibold text-white shadow-lg active:scale-[0.99]"
          >
            <CheckIcon className="h-5 w-5" /> Registro completo — Continuar
          </button>
        )}

        {(fase === "escuchando" ||
          fase === "hablando" ||
          fase === "pensando") && (
          <>
            {supported && (
              <button
                onClick={usarMicrofono}
                disabled={escuchando || hablando || fase === "pensando"}
                className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-semibold text-white shadow-lg active:scale-[0.99] disabled:opacity-60"
              >
                <span
                  className={`relative inline-flex ${escuchando ? "mic-pulse" : ""}`}
                >
                  <MicIcon className="h-5 w-5" />
                </span>
                {escuchando
                  ? "Escuchando… habla ahora"
                  : hablando
                    ? "El agente está hablando…"
                    : "Mantén la conversación — Hablar"}
              </button>
            )}

            {/* Respaldo por texto (sin micrófono o navegador no compatible) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarRespuesta(texto);
              }}
              className="flex gap-2"
            >
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={
                  supported ? "…o escribe tu respuesta" : "Escribe tu respuesta"
                }
                className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-xl bg-surface-2 px-4 text-sm font-semibold"
              >
                Enviar
              </button>
            </form>
          </>
        )}

        {fuente && (
          <p className="text-center text-[10px] text-muted">
            {fuente === "gemini"
              ? "IA: Google Gemini"
              : "IA: modo guionizado (sin API key)"}
            {!supported && " · reconocimiento de voz no disponible en este navegador"}
          </p>
        )}
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:var(--d)]" />
  );
}
