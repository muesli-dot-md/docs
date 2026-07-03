---
sidebar_position: 1
title: Make any file multiplayer
description: Link a single Markdown file to a Muesli server and edit it live from the web app, your editor, and your agents at the same time.
---

# Make any file multiplayer

This guide turns one plain `.md` file on your disk into a live multiplayer document, without converting or moving it.

## How it works

`muesli open` runs a sync bridge between a file and a document room on a Muesli server. The file stays a normal Markdown file: edits made in the web app are written back to it, and edits made to it locally are merged into the live document. Muesli never touches git.

## Open a file

1. Link the file (it is created if it does not exist yet):

   ```sh
   muesli open ./notes.md
   ```

2. The command prints a share link once the first sync completes:

   ```
   ✓ ./notes.md is live — share: http://localhost:5173/#notes
   ```

3. Open that link in a browser. Type in the web app, or in any local editor — both sides converge live.

The bridge runs in the foreground for as long as you leave it running. Press Ctrl-C to stop it; any pending remote edits are flushed to the file first, and the file is left exactly as it is.

## What syncs, and when

- **Web app → file:** edits land in the file as atomic writes (a temp file is written, then renamed over the original), debounced about 500 ms after a typing burst ends. Your editor never sees a half-written file.
- **File → web app:** any change to the file — from your editor, an AI agent, a script, `git checkout`, anything — is detected instantly via a native file watch, diffed against the last known state, and merged into the live document as a text edit.

> **Note:** the file must be valid UTF-8. If it becomes non-UTF-8, Muesli skips the change rather than corrupting the document.

## Choosing the document id and server

The document id (the room name) defaults to the file stem — `notes.md` becomes `#notes`. Override it and the endpoints with flags or environment variables:

```sh
muesli open ./notes.md --doc my-doc          # explicit document id
muesli open ./notes.md --server ws://muesli.example.com/ws
muesli open ./notes.md --web https://muesli.example.com
```

`--server` defaults to `ws://localhost:8787/ws` (env `MUESLI_SERVER`); `--web` defaults to `http://localhost:5173` (env `MUESLI_WEB`) and is only used to print the share link.

## Restarts and offline edits

The bridge survives server restarts: on connection loss it reconnects with exponential backoff (capped at 30 seconds). While disconnected, keep editing the file — on reconnect, Muesli reconciles the room and the disk and merges your offline disk edits into the document as one coherent change. Nothing is discarded.

## Against an auth-enabled server

On a server with sign-in enabled, log in once before opening files:

```sh
muesli login              # OIDC device-code flow; token stored in the OS keychain
muesli open ./notes.md    # connects with the token; you own the document
muesli share ./notes.md --role viewer
muesli status             # who you are + linked files
muesli unlink ./notes.md  # forget the link; the file is never touched
muesli logout
```

- `muesli login` runs a device-code flow in your browser and stores a delegated agent token in the OS keychain, keyed by server. On an open server (no auth) it prints that no sign-in is needed.
- `muesli share` takes a linked file or a document id and a `--role` of `viewer`, `commenter`, or `editor` (default `editor`), and prints a role-scoped share link. On an open server it prints the plain document URL instead.
- `muesli status` shows the server, who you are signed in as, and every linked file with its last-synced time.
- `muesli unlink` only forgets the link; your local file is never deleted or modified.

> **Note:** if the server refuses the connection as unauthorized, the bridge stops with a hint to run `muesli login` — it never retries a hopeless connection forever.

## Next steps

- Sync a whole directory of Markdown files at once: [Sync a folder](./sync-a-folder.md).
- Share the document with teammates by role: [Share a document](./share-a-document.md).
- Full command and flag reference: [CLI reference](../reference/cli.md).
