import type { CrowAdapter } from "./adapter";

const CROW_INPUT_SELECTOR = "[data-crow-input]";

/**
 * DOM adapter: fallback when no Crow SDK is present.
 * Injects text into Crow's input (marked with data-crow-input) and triggers submit.
 * Crow remains a black box; the embed should add data-crow-input for voice-layer compatibility.
 */
function getInput(): HTMLInputElement | HTMLTextAreaElement | null {
  if (typeof document === "undefined") return null;
  try {
    const el = document.querySelector(CROW_INPUT_SELECTOR);
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement
    ) {
      return el;
    }
    return null;
  } catch {
    return null;
  }
}

const domCrowAdapter: CrowAdapter = {
  isAvailable(): boolean {
    return getInput() != null;
  },

  send(text: string): void {
    const input = getInput();
    if (input == null) return;
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    if (input.form) {
      input.form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }
  },
};

export { domCrowAdapter };
