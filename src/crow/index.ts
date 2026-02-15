/**
 * Crow adapter layer — single entry for the app.
 *
 * Selection (feature detection):
 * - SDK path: When Crow exposes an official SDK (e.g. on window.crow), the SDK adapter is used; no DOM selector needed.
 * - DOM path: When the page embeds Crow and marks its input with [data-crow-input], the DOM adapter is used.
 *   Crow's embed/docs should recommend adding this attribute for voice-layer compatibility.
 *
 * Optional: an env flag (e.g. NEXT_PUBLIC_CROW_ADAPTER=dom) could override to force DOM for debugging.
 */
import type { CrowAdapter } from "./adapter";
import { sdkCrowAdapter } from "./sdk-adapter";
import { domCrowAdapter } from "./dom-adapter";

export type { CrowAdapter } from "./adapter";
export { sdkCrowAdapter } from "./sdk-adapter";
export { domCrowAdapter } from "./dom-adapter";

/** Prefer SDK adapter when available, otherwise fall back to DOM adapter. */
export function getCrowAdapter(): CrowAdapter {
  if (sdkCrowAdapter.isAvailable()) {
    return sdkCrowAdapter;
  }
  return domCrowAdapter;
}
