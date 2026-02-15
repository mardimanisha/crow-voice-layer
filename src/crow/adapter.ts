/**
 * Crow adapter interface (Phase E).
 * Abstraction for sending text to Crow without touching Crow's codebase.
 * Implementations: SDK adapter (when Crow exposes an API) or DOM adapter (inject into input + submit).
 */
export interface CrowAdapter {
  /** Whether this adapter can send to Crow in the current environment. */
  isAvailable(): boolean;
  /** Send text to Crow. No-op if not available. */
  send(text: string): void;
}
