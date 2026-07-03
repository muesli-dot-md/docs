---
sidebar_position: 1
title: What is Muesli?
description: An overview of Muesli — real-time multiplayer editing for plain Markdown files, with AI agents as first-class collaborators.
---

# What is Muesli?

Muesli is Google Docs for Markdown files: real-time multiplayer editing where the plain `.md` in your storage stays canonical, AI agents are first-class collaborators, and the whole thing is self-hostable.

## The mental model

Most collaborative editors import your file into a proprietary document format and export it back out. Muesli never does that. **Nothing is ever converted — the file stays a markdown file.**

- The live document is a **text CRDT over the raw markdown source**. What you edit together *is* the markdown text, so any syntax — including syntax Muesli's preview doesn't render — round-trips losslessly.
- The live document is **continuously materialized** to a plain `.md` in your storage. That file is the canonical artifact; the editor is a window onto it.
- **External edits flow back in.** When anything else touches the file — your editor, a script, an AI agent, a git checkout — Muesli detects the change, computes a text diff, and ingests it into the live document. Everyone in the room sees it as an ordinary edit.

## What lives where

Because the file is canonical, it's worth being precise about what Muesli stores:

- **Your content** — the plain `.md` (plus any assets) in a storage backend you choose: your local filesystem, an S3 bucket, a git repo, Google Drive, or SharePoint. See [Storage backends](../concepts/storage-backends.md).
- **Collaborative metadata** — comments, suggestions, edit history, identity, and permissions live in Muesli's database, never in the `.md` itself and never in your bucket or Drive. Your file stays clean.
- **Ephemeral state** — presence and cursors exist only while people are connected.

At any moment, the `.md` in your storage is a complete, ordinary markdown file — readable and editable with or without Muesli.

## Three surfaces

You can work on the same documents from three places:

- **Web app** — the full collaboration surface in the browser: live cursors, markdown preview, comments, suggestions, mentions, version history, sharing, search, and the link graph.
- **Desktop app** — a local-first editor over a real folder of `.md` files on your disk. It embeds the sync engine, so the folder stays live-synced while you get the same collaboration features as the web app, plus on-device dictation on macOS. See [Use the desktop app](desktop-app.md).
- **CLI** — the `muesli` command bridges any `.md` on disk to a live document. `muesli open ./notes.md` makes the file multiplayer while you keep editing it in Vim, VS Code, or anything else. See [Install the CLI](install-the-cli.md).

The web and desktop apps are fully live: keystroke-level sync, presence, and cursors. The CLI syncs file content at save granularity — perfect for keeping your own editor.

## Agents are collaborators, not scripts

Muesli exposes its full document surface to AI agents over [MCP](../agents/overview.md): agents can read and edit documents, leave comments, and propose changes as suggestions. Agent edits are attributed, grouped into change sets, and — by default — downgraded to suggestions while a human is present in the document, so people review agent work instead of colliding with it. Operators control what agents may do with [policies](../agents/policies.md).

## Self-hostable

Muesli is free software (AGPL-3.0). You can run the entire stack — sync server, web app, database — on your own infrastructure with a single Docker Compose file, and keep documents in storage you control: your filesystem, S3, a git repo, Google Drive, or SharePoint. See [Deploy your own instance](../self-hosting/deploy.md) and [Storage backends](../concepts/storage-backends.md).

## Next steps

- [Quickstart](quickstart.md) — run a local instance and edit a document collaboratively in about five minutes.
- [Install the CLI](install-the-cli.md) — get the `muesli` command.
- [Make any file multiplayer](../guides/make-any-file-multiplayer.md) — the one-command wedge.
- [Use the desktop app](desktop-app.md) — local-first editing over a folder.
- [Architecture](../concepts/architecture.md) — how the pieces fit together.
