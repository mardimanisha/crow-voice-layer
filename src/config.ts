/**
 * Package-level configuration and defaults.
 */

/**
 * Default URL for the Deepgram token API. Used when no API key or override is provided.
 * Points to the package maintainers' token endpoint (this repo deployed to Vercel).
 * Host apps can override via VoiceLayerProvider's deepgramTokenUrl or their own env
 * when running a custom token endpoint.
 */
export const DEFAULT_DEEPGRAM_TOKEN_URL =
  "https://crow-voice-layer.vercel.app/api/deepgram-token";

