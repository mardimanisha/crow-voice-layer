/**
 * Public API for crow-voice-layer.
 * Host apps import from this entry; do not depend on internal paths.
 *
 * Usage:
 *   import { VoicePanel, VoiceLayerProvider } from 'crow-voice-layer';
 *   // Optional: wrap with <VoiceLayerProvider crowAdapter={myAdapter}> when using a custom Crow adapter.
 */

export { VoicePanel } from "./components/voice/VoicePanel";
export {
  VoiceLayerProvider,
  useVoiceLayerContext,
  type VoiceLayerContextValue,
  type VoiceLayerProviderProps,
} from "./context/VoiceLayerContext";
export { useSendToCrow } from "./hooks/useSendToCrow";
export {
  useVoicePipeline,
  type UseVoicePipelineOptions,
} from "./hooks/useVoicePipeline";
export { useTranscriptManager } from "./hooks/useTranscriptManager";
export type { CrowAdapter } from "./crow";
export { sdkCrowAdapter, domCrowAdapter, getCrowAdapter } from "./crow";
export { DEFAULT_DEEPGRAM_TOKEN_URL } from "./config";
