"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Square, Send, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useVoicePipeline } from "@/hooks/useVoicePipeline";
import { useTranscriptManager } from "@/hooks/useTranscriptManager";
import { useSendToCrow } from "@/hooks/useSendToCrow";
import { DEFAULT_DEEPGRAM_TOKEN_URL } from "@/config";

/**
 * Voice panel: mic toggle, live transcript, edit, send.
 * Phase B (audio) + Phase C (Deepgram STT) + Phase D (transcript manager) wired via useVoicePipeline.
 */
export function VoicePanel() {
  const { transcript, setTranscript, handleResult, reset } =
    useTranscriptManager();
  const [sttError, setSttError] = useState<string | undefined>(undefined);
  const prevIsRecordingRef = useRef(false);
  const resetRef = useRef(reset);
  resetRef.current = reset;

  const {
    isRecording,
    isRequestingPermission,
    toggleRecording,
    error: recordingError,
  } = useVoicePipeline({
    tokenUrl: DEFAULT_DEEPGRAM_TOKEN_URL,
    onTranscript: handleResult,
    onError: (err) => setSttError(err.message),
  });

  // Reset transcript manager and clear STT error only when transitioning to recording (session start).
  useEffect(() => {
    const wasRecording = prevIsRecordingRef.current;
    prevIsRecordingRef.current = isRecording;
    if (!wasRecording && isRecording) {
      resetRef.current();
      setSttError(undefined);
    }
  }, [isRecording]);

  const { send, isAvailable } = useSendToCrow();

  const canSend = isAvailable && transcript.trim().length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Voice command</CardTitle>
          <CardDescription>
            Speak or type, then send to Crow
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <Badge variant="secondary" className="animate-pulse">
              Listening
            </Badge>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="icon"
                onClick={toggleRecording}
                disabled={isRequestingPermission}
                aria-label={
                  isRequestingPermission
                    ? "Requesting microphone permission"
                    : isRecording
                      ? "Stop recording"
                      : "Start recording"
                }
              >
                {isRequestingPermission ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isRecording ? (
                  <Square className="size-4 fill-current" />
                ) : (
                  <Mic className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isRequestingPermission
                ? "Allow microphone when your browser asks"
                : isRecording
                  ? "Stop recording"
                  : "Start recording"}
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="transcript" className="text-sm font-medium">
            Transcript
          </label>
          <Textarea
            id="transcript"
            placeholder="Transcript will appear here, or type manually..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        {(recordingError ?? sttError ?? null) && (
          <p className="text-sm text-destructive" role="alert">
            {recordingError ?? sttError}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                disabled={!canSend}
                onClick={() => send(transcript.trim())}
              >
                <Send className="size-4" />
                Send to Crow
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {!isAvailable
              ? "Crow is not available"
              : !transcript.trim()
                ? "Enter or speak a command first"
                : "Send transcript to Crow"}
          </TooltipContent>
        </Tooltip>
      </CardFooter>
    </Card>
  );
}
