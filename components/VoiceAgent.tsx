"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRuti } from "@/lib/store";
import { useSpeech } from "@/lib/useSpeech";
import type { Conductor, ChatMsg } from "@/lib/types";
import { Mic, CheckCircle2, Sparkles, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  }, [chat, fase]);

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
    <div className="flex h-full flex-col relative">
      {/* Fondo brillante difuminado detrás del agente */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[250px] h-[250px] bg-primary/20 blur-[100px] -z-10 rounded-full pointer-events-none" />

      {/* Progreso */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-[13px] font-semibold text-muted">
          <span>Progreso del registro</span>
          <span className="text-primary">{completados}/5</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2 border border-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(completados / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CAMPOS.map((c) => {
            const val = conductor[c.key]?.trim();
            return (
              <span
                key={c.key}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                  val
                    ? "bg-success/20 text-success border-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    : "bg-surface-2/50 text-muted border-white/5"
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
        className="no-scrollbar flex-1 space-y-3 overflow-y-auto rounded-3xl border border-white/10 glass-panel p-4 mb-2 shadow-inner"
      >
        {chat.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="mb-4 rounded-full bg-primary/20 p-5 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            >
              <Mic className="h-10 w-10 text-primary" strokeWidth={2} />
            </motion.div>
            <h3 className="text-lg font-bold text-foreground mb-1">Registro sin manos</h3>
            <p className="text-[13px] text-muted">
              Pulsa “Iniciar registro” y el agente inteligente de RUTI te guiará por voz.
            </p>
          </div>
        )}
        <AnimatePresence>
          {chat.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "agent" && (
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-md ${
                  m.role === "user"
                    ? "rounded-tr-sm bg-gradient-to-br from-primary to-purple-600 text-white"
                    : "rounded-tl-sm glass border border-white/5 text-foreground"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {fase === "pensando" && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
            className="flex justify-start items-end"
          >
            <div className="flex-shrink-0 mr-2 mt-1">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
            </div>
            <div className="rounded-2xl rounded-tl-sm glass border border-white/5 px-4 py-3 text-sm text-muted flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Controles */}
      <div className="mt-2 space-y-3 z-10 relative">
        {fase === "inicio" && (
          <button
            onClick={iniciar}
            className="w-full rounded-2xl bg-gradient-to-r from-primary via-purple-500 to-accent py-4 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_10px_40px_rgba(139,92,246,0.5)] transition-all active:scale-[0.98]"
          >
            Iniciar registro por voz
          </button>
        )}

        {fase === "listo" && (
          <button
            onClick={() => router.push("/documentos")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-success to-emerald-400 py-4 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} /> Registro completo
          </button>
        )}

        {(fase === "escuchando" ||
          fase === "hablando" ||
          fase === "pensando") && (
          <div className="flex flex-col gap-3">
            {supported && (
              <button
                onClick={usarMicrofono}
                disabled={escuchando || hablando || fase === "pensando"}
                className={`relative flex w-full items-center justify-center gap-3 rounded-2xl py-4 font-bold text-white transition-all shadow-lg overflow-hidden ${
                  escuchando ? "bg-accent/20 border border-accent/50 text-accent" : "bg-gradient-to-r from-primary to-purple-600 disabled:opacity-50"
                } active:scale-[0.98]`}
              >
                {escuchando && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_60%)] animate-pulse" />
                  </div>
                )}
                <span
                  className={`relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full ${escuchando ? "bg-accent/20 mic-pulse" : "bg-white/20"}`}
                >
                  <Mic className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="relative z-10 text-[14px]">
                  {escuchando
                    ? "Escuchando... habla ahora"
                    : hablando
                      ? "El agente está hablando..."
                      : "Mantén presionado para hablar"}
                </span>
              </button>
            )}

            {/* Respaldo por texto */}
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
                  supported ? "…o escribe aquí" : "Escribe tu respuesta"
                }
                className="flex-1 rounded-2xl border border-white/10 glass px-4 py-3 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted/50"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-2xl bg-surface-2 border border-white/5 w-[52px] transition-colors hover:bg-surface-2/80 hover:text-primary active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {fuente && (
          <p className="text-center text-[11px] text-muted/60 font-medium tracking-wide">
            {fuente === "gemini"
              ? "⚡ IA Powered by Google Gemini"
              : "IA: modo guionizado (sin API key)"}
            {!supported && " · Voz no compatible"}
          </p>
        )}
      </div>
    </div>
  );
}
