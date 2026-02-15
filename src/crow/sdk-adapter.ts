import type { CrowAdapter } from "./adapter";

/**
 * Crow SDK shape when exposed on window (e.g. by official Crow embed/SDK).
 * This adapter is used when Crow provides an official API; until then, the DOM adapter is the primary path.
 */
declare global {
  interface Window {
    crow?: {
      sendMessage?: (text: string) => void;
    };
  }
}

function isSdkAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return typeof window.crow?.sendMessage === "function";
  } catch {
    return false;
  }
}

const sdkCrowAdapter: CrowAdapter = {
  isAvailable(): boolean {
    return isSdkAvailable();
  },

  send(text: string): void {
    if (!isSdkAvailable()) return;
    window.crow!.sendMessage!(text);
  },
};

export { sdkCrowAdapter };
