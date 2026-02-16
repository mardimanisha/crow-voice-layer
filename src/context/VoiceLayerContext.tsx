"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { CrowAdapter } from "@/crow";

export interface VoiceLayerContextValue {
  crowAdapter: CrowAdapter | null;
}

const VoiceLayerContext = createContext<VoiceLayerContextValue | null>(null);

export interface VoiceLayerProviderProps {
  /** Optional Crow adapter. When provided, Send uses this instead of built-in SDK/DOM detection. */
  crowAdapter?: CrowAdapter | null;
  children: ReactNode;
}

/**
 * Provider for the voice layer. Optional: wrap your app or page when you need to supply
 * a custom Crow adapter. When not used, the voice layer falls back to getCrowAdapter() (SDK then DOM).
 */
export function VoiceLayerProvider({
  crowAdapter = null,
  children,
}: VoiceLayerProviderProps) {
  const value = useMemo<VoiceLayerContextValue>(
    () => ({ crowAdapter: crowAdapter ?? null }),
    [crowAdapter]
  );
  return (
    <VoiceLayerContext.Provider value={value}>
      {children}
    </VoiceLayerContext.Provider>
  );
}

export function useVoiceLayerContext(): VoiceLayerContextValue | null {
  return useContext(VoiceLayerContext);
}
