---
sidebar_position: 9
title: Dictation
description: Transcribe your voice — and optionally a meeting's system audio — into Markdown, fully on-device, in the desktop app on macOS.
---

# Dictation

This guide covers the desktop app's on-device speech-to-text: dictating into the note you are writing, and capturing a meeting as a Markdown transcript.

> **Note:** dictation is available in the [desktop app](../getting-started/desktop-app.md) on macOS only. On other platforms the controls are hidden.

## Fully local

Transcription runs entirely on your machine using a local Parakeet speech-recognition model (ONNX, CPU). No audio ever leaves the computer, and no cloud transcription service is involved — it is transcription only, with no language model behind it.

The model is downloaded once, on first use (a download of roughly 480 MB), and cached in the app's data directory. A progress indicator streams while it downloads; the download resumes if interrupted. After that, dictation works offline.

## Dictate into the current note

1. Open the note you want to dictate into.
2. Click **Record** in the editor toolbar (its tooltip reads "Record transcription into this note"). The button shows **Recording** while capture is live; the first start takes a few seconds while the model loads.
3. Speak. Each finished utterance is appended to the note as a line, attributed by source:

   ```markdown
   **Me:** let's move the launch to Thursday
   **Them:** works for me, I'll update the doc
   ```

4. Click the button again to stop.

Recording stays pinned to the note that was active when you started. If you browse to other files mid-recording, lines are buffered and flushed back into the target note — into the editor when you return, or to the file on disk when you stop.

## Capture a meeting transcript

For a standalone transcript instead of dictating into a note:

1. Open the command palette with **⌘P** and run **Start meeting transcription**. A transcript panel opens with two live lanes — **Me** (your microphone) and **Them** (system audio, when available) — plus **Start** and **Stop** buttons.
2. When you are done, run **Stop meeting transcription** from the palette (or click **Stop** in the panel).

The transcript is written as a Markdown file with per-speaker turn blocks. It lands inside your active workspace folder (so it appears in the file tree), or in `~/Documents/muesli-transcripts/` as `meeting-<timestamp>.md` when no workspace is open.

## Microphone and system audio

- **Your voice** is captured from the microphone using macOS voice processing — echo cancellation, noise suppression, and automatic gain — so it holds up on calls and in noisy rooms. Microphone permission is required.
- **The other side** (the "Them" lane) is captured from system audio via ScreenCaptureKit, which requires the Screen Recording permission in System Settings. This lane is best-effort: without the permission, dictation still works with your microphone alone.

Voice-activity detection segments the audio into utterances, so only speech is transcribed and pauses become line breaks rather than noise.

## Next steps

- Set up the desktop app: [Desktop app](../getting-started/desktop-app.md).
- Turn the transcript folder into a live-synced shared space: [Sync a folder](./sync-a-folder.md).
