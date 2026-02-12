# 🧠 Finalized Project Definition

## “Crow Voice Layer” — Speech-to-Text Command Interface for Crow Agents

### Core Principle

Add voice as an input modality to Crow without touching Crow’s internal codebase.

- Crow remains a black box.  
- The system adapts **human voice → clean text → Crow input**.

---

## 🎯 Final Scope (Locked)

### What this project **IS**

- A drop-in voice layer that sits on top of the Crow embed  
- Uses **Deepgram** for high-quality speech-to-text  
- Converts spoken commands into Crow-compatible text  
- Works with any Crow agent (task, action, workflow)

### What this project **IS NOT**

- Not a replacement for Crow chat  
- Not modifying Crow internals  
- Not doing intent classification or agent logic  
- Not wake-word / always-listening (out of scope v1)

> This clarity is important.

---

## 👤 Final User Experience (UX Contract)

### Step-by-step User Flow

1. User opens a page with Crow embed  
2. Sees a 🎤 Voice Command button  
3. Clicks mic and speaks  
4. Live transcription appears  
5. User reviews / edits text  
6. User clicks **Send**  
7. Crow executes action as usual  

**Key UX rule:** User stays in control. No auto-execution.

---

## ✅ Final Feature Set (v1)

### 1. Microphone Capture
- Start / stop recording  
- Explicit user consent  
- Visual listening indicator  

### 2. Deepgram Speech-to-Text
- Streaming or final transcription  
- High accuracy conversational speech  
- English only (v1)  

### 3. Transcript Preview Layer
- Editable text area  
- Confidence indicator (optional)  
- Clear “Send to Crow” CTA  

### 4. Crow Adapter
Injects text into Crow via:
- SDK (if available)  
- DOM-based fallback  

### 5. Error Handling
- Mic denied  
- Network failure  
- Empty transcript  
- STT failure  

---

## 🧩 System Architecture (Final)

### Logical Architecture

```
┌────────────────────┐
│   Browser / App    │
│                    │
│  ┌──────────────┐  │
│  │ Voice UI     │  │
│  │ (Mic Button)│  │
│  └──────┬───────┘  │
│         │ Audio    │
│  ┌──────▼───────┐  │
│  │ Audio Stream │  │
│  └──────┬───────┘  │
│         │          │
└─────────┼──────────┘
          │
          ▼
┌────────────────────┐
│   Deepgram STT     │
│  (WebSocket API)  │
└─────────┬──────────┘
          │ Transcript
          ▼
┌────────────────────┐
│ Transcript Manager │
│  - cleanup         │
│  - confidence      │
└─────────┬──────────┘
          │ Clean Text
          ▼
┌────────────────────┐
│  Crow Adapter      │
│ (SDK / DOM Hook)  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│   Crow Agent       │
│ (Text → Action)   │
└────────────────────┘
```

---

## 🧠 Key Design Decisions (Locked)

### 1. Why Deepgram
- Streaming STT (low latency)  
- Production-grade accuracy  
- Designed for conversational agents  
- No vendor lock-in in architecture  

### 2. Why Manual “Send”
- Prevents accidental actions  
- Matches Crow’s mental model  
- Founder-safe choice  

### 3. Why Adapter Pattern

Crow is external.  
Adapters make the system:
- Replaceable  
- Testable  
- Merge-friendly  

---

## 🔌 Crow Adapter Design (Important)

### Interface (Core Abstraction)

```ts
interface CrowAdapter {
  isAvailable(): boolean;
  send(text: string): void;
}
```

### Implementations

#### 1️⃣ SDK Adapter
```ts
class CrowSDKAdapter implements CrowAdapter {
  send(text) {
    window.crow.sendMessage(text);
  }
}
```

#### 2️⃣ DOM Adapter
```ts
class CrowDOMAdapter implements CrowAdapter {
  send(text) {
    const input = document.querySelector('[data-crow-input]');
    input.value = text;
    input.dispatchEvent(new Event('input'));
    input.form?.dispatchEvent(new Event('submit'));
  }
}
```

> This abstraction alone shows senior-level design thinking.

---

## 🗂️ Folder Structure (Final)

```
crow-voice-layer/
├── src/
│   ├── audio/
│   │   ├── microphone.ts
│   │   └── recorder.ts
│   ├── deepgram/
│   │   └── client.ts
│   ├── transcript/
│   │   └── manager.ts
│   ├── crow/
│   │   ├── adapter.ts
│   │   ├── sdk-adapter.ts
│   │   └── dom-adapter.ts
│   ├── ui/
│   │   └── VoicePanel.tsx
│   └── index.ts
├── demo/
├── README.md
└── architecture.md
```

---

## 🔐 Security & Privacy (Explicitly Defined)

- Audio streams only to Deepgram  
- No audio stored  
- Transcripts only exist in browser memory  
- API keys never exposed in frontend (prod)  

> This is founder-grade thinking.

---

## 🚧 Non-Goals (Explicit)

These are intentionally excluded:
- Wake word detection  
- Auto-execution  
- Voice response (TTS)  
- Multilingual support  
- Mobile native apps  

This keeps scope tight and credible.

---

## 🧪 How You Validate It Works

### Success Criteria
- Spoken command appears correctly in Crow  
- Crow performs same action as typed input  
- Latency < ~1 second  
- No Crow code changes required  

---

## 🧭 What This Enables Later (Optional)

- Official Crow voice plugin  
- Native SDK integration  
- Voice-first agent mode  
- Multimodal agents (voice + text)  

**But not now.**
