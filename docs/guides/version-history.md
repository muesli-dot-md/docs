---
sidebar_position: 6
title: Version history
description: Read the attributed, coalesced edit history of a document and view it at any point in time.
---

# Version history

Every edit to a document lands in an append-only log; the **History** panel turns that log into a readable, attributed timeline you can rewind.

## Open the history panel

Open a document and pick the **History** tab in the sidebar. Entries are listed newest first; click **Load more** at the bottom to page further back.

Each entry shows:

- **Who** — the author's name, with an agent indicator when the author is an AI agent.
- **Origin** — how the edit arrived:
  - `human` — typed in the editor by a signed-in person.
  - `agent` — made by an AI agent through the MCP or REST API.
  - `ingest` — an out-of-band change to the canonical `.md` file (your local editor via the CLI bridge, a git commit, a direct write to the storage backend) merged into the document.
- **When** — relative time of the edit.
- **Size** — how many raw updates the entry covers ("3 updates").
- A **suggestion** badge when the entry was applied as an accepted suggestion change set.

## How entries are grouped

Raw edits are far too granular to read — every keystroke is an update. The history endpoint coalesces them into reviewable entries:

- Consecutive updates by the **same author and origin within 60 seconds** of each other merge into one entry (a typing burst).
- Updates sharing a **change set** — one accepted suggestion set, or one atomic agent edit — always form exactly one entry, and are never blended into a neighboring burst.

## View the document at a point in time

Click any history entry to open a read-only **Snapshot** of the document as it stood after that edit. The snapshot banner shows the sequence number, author, and time; the live document keeps changing underneath, unaffected.

Click **Back to live** to return to the current, editable document.

> **Note:** Snapshots are read-only. There is no one-click restore; to bring old content forward, copy it out of the snapshot into the live document.

## For scripts and agents

The same data backs `GET /api/documents/{slug}/history?limit=50&before_seq=` (newest first; pass the oldest `first_seq` you received back as `before_seq` to page) and the `get_history` MCP tool. See the [agent tool reference](../agents/tool-reference.md).

## Requirements

History is read from the server's persistent update log, so it needs a server with a database configured. On a volatile (in-memory) server the collaboration sidebar — history included — is unavailable. See [Self-hosting configuration](../self-hosting/configuration.md).

## Related

- [Suggestions and review](suggestions-and-review.md) — where the "suggestion" badge comes from
- [Architecture](../concepts/architecture.md) — the update log and materialization model
- [Make any file multiplayer](make-any-file-multiplayer.md) — the CLI bridge whose file edits appear as `ingest`
