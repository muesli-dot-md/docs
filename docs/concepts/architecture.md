---
sidebar_position: 1
title: Architecture
description: How Muesli keeps a plain markdown file and a live multiplayer document in sync.
---

# Architecture

This page explains the whole system on one page: what is authoritative, where state lives, and how edits flow between the live document and the plain `.md` file.

## The core idea

The live document is a **text CRDT** (yrs on the server, Yjs in the browser) over the **raw markdown source**. Nothing is ever converted to an internal format — the CRDT *is* the markdown text, so any syntax round-trips losslessly. While a document is open, the CRDT is the live authority; the canonical artifact is the plain `.md` that Muesli continuously **materializes** into your storage backend.

Edits made to that file from outside Muesli — your editor, a script, an agent, a git pull — are detected, diffed against the text the CRDT currently holds, and **ingested** back into the live document as a text diff. Because ingest is a text diff merged into a text CRDT, out-of-band edits and live edits converge without locking.

```
   CRDT (live authority while open) ──materialize──▶  .md in the storage backend
   CRDT ◀────────ingest (text diff)──  external rewrite of the .md
```

## Components

```
                      ┌────────────────────────────────────────────┐
                      │              Storage backend               │
                      │  plain .md  (local FS · S3 · git · Drive · │
                      │             SharePoint)                    │
                      └───────────────▲────────────────────────────┘
                                      │ materialize ▲ / ingest ▼
  CRDT surfaces             ┌─────────┴──────────┐
  ┌─────────────┐  y-sync   │    muesli-server   │  Rust · tokio · axum
  │  web app    │◀─────────▶│  ┌──────────────┐  │
  ├─────────────┤ websocket │  │  Doc Rooms   │  │  single-owner actors
  │ desktop app │◀─────────▶│  │ (in-mem CRDT)│──┼──▶ Postgres
  └─────────────┘           │  └──────────────┘  │    (append-only update log
  ┌─────────────┐           │  REST · MCP · OIDC │     + snapshots + metadata)
  │ VS Code     │ presence  └─────────▲──────────┘
  │ extension   │──────────▶          │ disk diffs
  └─────────────┘           ┌─────────┴──────────┐
                            │ muesli CLI /       │  watches + writes
                            │ local agent        │  a local .md
                            └────────────────────┘
```

- **Sync server** — an axum/tokio service speaking the standard y-websocket protocol (`y-sync` plus awareness for presence). REST handles everything non-realtime; an MCP endpoint exposes the same surface to agents (see [Agents overview](../agents/overview.md)).
- **Web app** — the browser editor (CodeMirror 6 + Yjs): live cursors, comments, suggestions, history, graph view.
- **Desktop app** — a local-first editor over a real folder of `.md` files; it runs the folder-sync engine in-process and joins rooms as a CRDT peer. See [Desktop app](../getting-started/desktop-app.md).
- **CLI / local agent** — `muesli open` and `muesli sync` bridge files on your disk to server rooms: watch disk, ingest changes; materialize remote edits back to disk. See [Install the CLI](../getting-started/install-the-cli.md) and the [CLI reference](../reference/cli.md).
- **VS Code extension** — presence only: live cursors and participants for muesli-linked files. Content still syncs through the CLI bridge.

## Document rooms

Each document has exactly one **owner room** in the server at a time — a single-owner actor that holds the in-memory CRDT. The owner room is the sole writer to the update log and the sole materializer to the `.md`, which is what makes the materialize/ingest loop safe. Clients connect over a websocket, exchange `y-sync` steps to catch up, then trade CRDT updates and awareness (cursors, selections, identity).

When the last client leaves and the room goes quiet, it snapshots, flushes, and is evicted from memory. The next connection re-hydrates it from storage.

## Persistence: log plus snapshots

Every applied update is appended to a per-document, **append-only log** in Postgres, with periodic **snapshots** for compaction. Loading a room means: latest snapshot + replay of the tail. Two consequences:

- Documents survive server restarts with no data loss — rooms hydrate on first connect.
- The log doubles as the document's **edit history**: every entry carries an origin (`human`, `agent`, or `ingest`) and an author, which powers [version history](../guides/version-history.md).

> **Note:** Without a database configured, the server runs volatile (in-memory, with a loud warning) — fine for trying things out, not for real use.

Comments, suggestions, folders, permissions, and other collaborative metadata also live in the database — never inside the `.md` and never in your storage backend. Presence and sessions are ephemeral (in-memory, or Redis when configured).

## Life of an edit

1. You type in the web or desktop app. The keystrokes become CRDT updates, applied in the owner room, broadcast to every connected client, and appended to the log.
2. After a short debounce following the typing burst, the room materializes the full text to the `.md` in the storage backend (atomic write) and records a content hash.
3. Someone rewrites the `.md` out of band. The change is detected — instantly via native file watch for local files through the CLI, by polling for cloud backends — and the hash rules out Muesli's own write echoing back.
4. The new file content is diffed against the CRDT's current text; the diff is applied as CRDT operations tagged with origin `ingest` and broadcast like any other edit. Large rewrites are grouped as a single change set so history shows one coherent, revertable unit.

## Concurrency is merge, not locking

There are no file locks and no "document is being edited by someone else" states. Concurrent edits — two humans, a human and an agent, a live cursor and a disk write — all become CRDT updates, and the CRDT guarantees every replica converges to the same text. Offline edits merge on reconnect: a CRDT surface replays buffered updates, and offline disk edits are ingested as one diff.

What the CRDT cannot resolve is ambiguity about *intent* — for example, a file that was both moved and heavily rewritten while the bridge was offline. Muesli's rule for those cases is fail-safe: never silently discard or overwrite divergent on-disk content; stop and surface the situation instead.

## Where to go next

- [Documents and identity](documents-and-identity.md) — slugs, document ids, folders, trash.
- [Roles and permissions](roles-and-permissions.md) — who can do what.
- [Storage backends](storage-backends.md) — where the canonical `.md` lives.
- [Make any file multiplayer](../guides/make-any-file-multiplayer.md) — the five-minute version of all of the above.
