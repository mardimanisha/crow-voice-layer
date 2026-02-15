/**
 * Mock Crow send for Phase A. Phase E will replace this with the real adapter.
 */
export function sendToCrowMock(text: string): void {
  console.log("[Crow mock] Send to Crow:", text);
}
