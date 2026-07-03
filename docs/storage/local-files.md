---
sidebar_position: 1
title: Local files
description: Sync documents with plain .md files on your own disk using the muesli CLI.
---

# Local files

The local filesystem "backend" is the `muesli` CLI: it bridges a `.md` file on your disk with a live document on the server, keeping both sides identical at all times.

Unlike the cloud backends (S3, GitHub, Google Drive, SharePoint), there is nothing to configure in the web app. You run the CLI next to your files, and it does the rest:

- `muesli open ./notes.md` materializes the document into the file and prints a share link. Edits made in the web app land in the file as atomic writes about 500ms after a typing burst ends; edits you make to the file — from any editor, agent, or script — are picked up instantly via a native filesystem watch, diffed, and merged live into the document.
- `muesli sync ./notes` does the same for every `*.md` under a folder, watching the tree live: new files auto-link within seconds, and deleting a file never deletes the server document.

```sh
muesli open ./CLAUDE.md        # one file, prints a share link
muesli sync ./notes            # a whole folder, live-synced
```

Because the watch is native, local-file sync is instant — there is no polling interval like the cloud backends have. The bridge also survives server restarts: it reconnects with backoff, and edits made to the file while offline are merged as one change on reconnect.

> **Note:** The CLI never touches git. Your repository workflow stays yours; muesli only reads and writes the `.md` files themselves.

## Where to go next

- [Make any file multiplayer](../guides/make-any-file-multiplayer.md) — the full `muesli open` walkthrough, including login and sharing.
- [Sync a folder](../guides/sync-a-folder.md) — folder sync, doc-id naming, renames, and large trees.
- [Install the CLI](../getting-started/install-the-cli.md) — get the `muesli` binary.
- [CLI reference](../reference/cli.md) — every command and flag.
- [Storage backends](../concepts/storage-backends.md) — how the local bridge relates to the cloud backends.
