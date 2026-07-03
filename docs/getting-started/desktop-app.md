---
sidebar_position: 4
title: Use the desktop app
description: A local-first desktop editor over a folder of Markdown files, with the full collaboration surface and on-device dictation.
---

# Use the desktop app

The Muesli desktop app is a local-first editor over a real folder of `.md` files on your disk, with the full collaboration surface built in.

## What it is

The desktop app (built on Tauri) treats a **folder as a workspace**: your notes are plain Markdown files, edited in place. It embeds the same sync engine as the `muesli` CLI in-process, so a connected folder stays live-synced with the server while open editors additionally join as full CRDT peers — you get live cursors, comments, suggestions, version history, mentions, notifications, and the graph view over the same documents as the web app.

On top of that it adds desktop-only features: a local file tree with tabs, a command palette and quick switcher, full-text search, and — on macOS — **on-device speech-to-text dictation**. A local model transcribes your microphone (and optionally system audio) into a meeting transcript or straight into the current note. Dictation is transcription only: it runs no LLM and no audio ever leaves your machine. See [Dictation](../guides/dictation.md).

You can also work entirely offline and local-only: open a folder, edit, and never sign in. No account, no server.

## First launch

On first launch the app asks **"How do you want to work?"** and offers two cards. You can add the other way of working any time.

### Work locally

Choose **Work locally** to open a folder of Markdown files on this computer — no account, no server. The workspace picker opens; pick a folder and start editing.

### Connect to a server

Choose **Connect to a server** to sign in and collaborate:

1. The **Sign in to Muesli** dialog opens. It always shows which server the sign-in will run against (a fresh install defaults to `muesli.md`); click **Change…** to point it at your own instance instead.
2. Click **Continue**. Sign-in uses the OIDC device-code flow: your system browser opens to the server's identity provider, and the app picks up the credential when you approve.
3. After signing in, the create-workspace wizard walks you through setting up your first workspace.

The resulting token is stored in the OS keychain and is never exposed to the app's web view.

> **Note:** On macOS the app shows a short in-app explainer before the system Keychain prompt — and only when you initiate a sign-in. Launching the app never triggers a Keychain prompt.

A local folder becomes collaborative by **cloning** a cloud workspace into it, or by **promoting** a local-only folder into a shared one. See [Workspaces](../guides/workspaces.md).

## Install

The current install story is building from source. You need the Rust toolchain, the Tauri prerequisites for your platform, and `pnpm`.

From a clone of the [muesli repository](https://github.com/muesli-dot-md/muesli):

```sh
pnpm install
cd apps/desktop
pnpm tauri dev      # run in development
pnpm tauri build    # produce a release bundle for your platform
```

Signed macOS builds are produced by the project's release workflow and published on the [releases page](https://github.com/muesli-dot-md/muesli/releases); installed apps check for updates automatically and offer a one-click "Restart and Update".

## Next steps

- [Workspaces](../guides/workspaces.md) — local, cloud, and cloned workspaces.
- [Dictation](../guides/dictation.md) — on-device speech-to-text on macOS.
- [Quickstart](quickstart.md) — run your own server to connect the app to.
- [Install the CLI](install-the-cli.md) — the same sync engine, from the terminal.
