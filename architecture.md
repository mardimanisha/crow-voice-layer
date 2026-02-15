# Crow Voice Layer --- Final Architecture

## Overview

Crow Voice Layer is a browser‑side voice command interface that converts
spoken input into text and injects it into Crow without modifying Crow's
internal codebase.

**Principle:** Crow is treated as a black box.

Speech → Text → Crow Command

------------------------------------------------------------------------

## High-Level Architecture

    User
     │
     ▼
    Browser (Next.js App)
     │
     ├── Audio Capture
     ├── Streaming Client
     ├── Transcript Manager
     ├── Crow Adapter
     └── UI Layer (shadcn)
     │
     ▼
    Deepgram API (WebSocket STT)
     │
     ▼
    Transcript
     │
     ▼
    Crow Adapter
     │
     ▼
    Crow Agent Executes Action

------------------------------------------------------------------------

## Tech Stack

  Layer             Tech
  ----------------- ----------------------
  Frontend          Next.js + TypeScript
  UI                shadcn/ui
  Streaming STT     Deepgram
  Transport         WebSocket
  Hosting           Vercel / Edge
  Auth (optional)   NextAuth
  Backend           Next.js API Routes

------------------------------------------------------------------------

## Frontend Architecture

### 1. Audio Layer

Handles microphone interaction.

Responsibilities: - permission handling - start/stop recording - stream
audio chunks

Modules:

    audio/microphone.ts
    audio/recorder.ts

------------------------------------------------------------------------

### 2. Streaming Layer (Deepgram Client)

Responsibilities: - open websocket - send audio chunks - receive
transcripts - handle reconnect logic

Module:

    deepgram/client.ts

------------------------------------------------------------------------

### 3. Transcript Manager

Acts as processing layer between STT and UI.

Responsibilities: - merge partial transcripts - clean text - confidence
handling - final transcript generation

Module:

    transcript/manager.ts

------------------------------------------------------------------------

### 4. Crow Adapter Layer

Abstraction allowing communication with Crow regardless of integration
method.

Interface:

    interface CrowAdapter {
      isAvailable(): boolean
      send(text: string): void
    }

Implementations:

SDK Adapter\
Uses official Crow SDK if available.

DOM Adapter\
Fallback method that injects text into Crow input field and triggers
submit.

Modules:

    crow/adapter.ts
    crow/sdk-adapter.ts
    crow/dom-adapter.ts

------------------------------------------------------------------------

### 5. UI Layer (shadcn Components)

UI is built using shadcn for accessibility + composability.

Component Tree:

    VoicePanel
     ├── Card
     ├── Button (Mic Toggle)
     ├── Badge (Listening Indicator)
     ├── Textarea (Transcript Editor)
     ├── Progress (Confidence)
     ├── Tooltip (Hints)
     └── Send Button

Responsibilities: - show recording state - show live transcript - allow
editing - send command - show errors

File:

    ui/VoicePanel.tsx

------------------------------------------------------------------------

## Backend Architecture (Minimal)

No full backend required for v1.

Optional API route:

    GET /api/deepgram-token

Returns: - temporary signed token

Purpose: - hide API key - rotate credentials - prevent abuse

------------------------------------------------------------------------

## Runtime Flow

1 User clicks mic\
2 Browser records audio\
3 Audio streamed to Deepgram\
4 Deepgram returns transcript\
5 Transcript cleaned\
6 UI displays text\
7 User edits text\
8 User clicks Send\
9 Adapter sends text to Crow\
10 Crow executes action

------------------------------------------------------------------------

## Security Design

-   audio never stored
-   transcript exists only in memory
-   API keys never exposed
-   explicit mic permission required

------------------------------------------------------------------------

## Error Handling

System handles:

  Error              Behavior
  ------------------ --------------------
  Mic denied         show permission UI
  No speech          show retry
  Network drop       reconnect
  STT failure        fallback message
  Crow unavailable   disable send

------------------------------------------------------------------------

## Folder Structure

    src/
     ├── audio/
     ├── deepgram/
     ├── transcript/
     ├── crow/
     ├── ui/
     └── index.ts

    app/
     └── api/
         └── deepgram-token/

------------------------------------------------------------------------

## Scalability Strategy

Phase 1 --- Local Only\
Client‑side only processing

Phase 2 --- Observability\
Add logging + metrics

Phase 3 --- Intelligence Layer\
Command parsing + routing

Phase 4 --- Multimodal Agents\
Voice + text + files

------------------------------------------------------------------------

## Architectural Strengths

-   zero modification to Crow
-   modular replaceable layers
-   adapter pattern isolation
-   production-safe security model
-   easily testable modules

------------------------------------------------------------------------

## Non Goals (v1)

-   wake word
-   auto execution
-   TTS voice output
-   multilingual support
-   mobile native apps

------------------------------------------------------------------------

## Definition

This system is a:

**Client‑side streaming voice interface with adapter‑based agent
integration.**

Not a voice assistant.\
Not a chatbot.\
It is an infrastructure layer.
