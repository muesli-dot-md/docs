---
sidebar_position: 2
title: Sync a folder
description: Keep every Markdown file under a directory linked and live-synced with a Muesli server, Drive-desktop style.
---

# Sync a folder

This guide runs the Muesli folder daemon so that every `.md` file under a directory is a live multiplayer document.

## Start syncing

```sh
muesli sync ./notes --prefix team
```

Every `*.md` under `./notes` (recursively) is linked and live-synced. The startup summary lists the directory, the server, and each file with its document id:

```
muesli sync — 3 file(s) linked
  dir     /home/you/notes
  server  http://localhost:8787
  web     http://localhost:5173/#<doc>
  ideas.md  ⇄  #team-ideas
  sub/deep.md  ⇄  #team-sub-deep
```

The daemon runs in the foreground and prints a line for each sync event (edits sent, edits received, files linked). `--server` and `--web` work exactly as they do for `muesli open`; against an auth-enabled server, run `muesli login` first.

## How document ids are derived

Each file's document id comes from its directory-relative path: path separators become dashes and the result is slugified (lowercase ASCII letters, digits, `-`), with the optional `--prefix` prepended. `sub/deep.md` becomes `sub-deep`, or `team-sub-deep` with `--prefix team`.

- A file that was already linked keeps its existing document id — the naming rule never overrides an established identity.
- Collisions (for example `a/b.md` and `a-b.md` both slugify to `a-b`) get a numeric suffix: `a-b-2`.

## What is skipped

Hidden files and directories (anything starting with `.`, which includes `.git`), `node_modules`, and `target` are never descended into or linked.

## The tree is watched live

- **New file:** drop a new `.md` anywhere under the directory and it auto-links within seconds.
- **Deleted file:** the file's session stops immediately and nothing is written back to disk. If the document had already synced to the server, it is moved to the server's trash — a reversible soft-delete. A file that never completed a sync leaves the server untouched. The local index entry is kept, so restoring the file re-links it to the same document.
- **Renamed file:** a "new" file whose content is byte-identical to a file that just disappeared is recognized as a rename and re-binds to the same document id, so the document's identity and history survive the move. If several vanished files match, Muesli does not guess — the file gets a fresh document id instead.

Your subdirectory structure is also mirrored into Muesli folders in the web app, and documents you later reorganize in the web app are not moved back.

## Large trees

The daemon holds up to 64 concurrent websocket connections. With 64 files or fewer, every file keeps a persistent connection. Beyond that, sessions run lazily: they idle-disconnect after about 30 seconds to free a slot, then reconnect on the next local change or on a periodic round-robin pass (about every 5 minutes) — so every file still gets its initial sync, and remote edits land within one pass at worst.

## Stopping

Press Ctrl-C. The daemon flushes any pending remote edits to disk before exiting:

```
stopping — flushing dirty buffers…
✓ sync stopped — 3 file(s); index and server docs retained
```

## Checking what is linked

```sh
muesli status
```

lists the server, who you are signed in as, and every linked file with its document id and last-synced time.

## Where the link index lives

The path-to-document index is a SQLite database, `index.db`, in Muesli's per-user data directory. A generated `links.json` mirror is kept next to it for the Muesli Presence VS Code extension. Nothing is ever written into your synced folder itself — no sidecar files, no dotfiles next to your `.md`s.

## Next steps

- Sync a single file instead: [Make any file multiplayer](./make-any-file-multiplayer.md).
- Share individual documents by role: [Share a document](./share-a-document.md).
- Full command and flag reference: [CLI reference](../reference/cli.md).
