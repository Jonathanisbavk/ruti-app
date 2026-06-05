import { Screen } from "@/components/Screen";
import { VoiceAgent } from "@/components/VoiceAgent";

export default function OnboardingPage() {
  return (
    <Screen
      titulo="Registro por voz"
      subtitulo="Agente de IA · paso 3 de 5"
      fill
    >
      <VoiceAgent />
    </Screen>
  );
}
