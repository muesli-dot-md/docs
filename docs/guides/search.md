---
sidebar_position: 8
title: Search
description: Find documents by title or content from anywhere in the web app with the search palette.
---

# Search

This guide covers the web app's search palette — how to open it, what it matches, and what it will never show you.

## Open the palette

Any of these summons the search palette:

- Press **⌘K** (macOS) or **Ctrl+K**.
- Press **/** anywhere you are not typing (it never steals the key from an input or the editor).
- Click the **Search** pill in the home screen's header, or the search icon in an open document's header (its tooltip shows the shortcut).

Type into the "Search in Muesli" field; results update live as you type. Use the arrow keys to move through results, **Enter** to open the selected document, and **Esc** to close.

## What it matches

Results are ranked in four tiers, best first:

1. **Title prefix** — the document title starts with your query.
2. **Title substring** — the title contains your query.
3. **Content full-text** — the document body matches your query as words.
4. **Partial-token fallback** — the body contains your query as a raw substring, which catches short or incomplete words the full-text tier would miss.

Title matches highlight the hit in the title. Content matches show a short snippet of the surrounding text, centered on the first occurrence, with the hit highlighted.

## How results are grouped

Results are grouped by where the document's canonical file lives: documents on Muesli's own storage appear first under **Muesli Cloud**, followed by documents attached to connected storage (a Google Drive folder, a GitHub repository shown as `owner/repo`, an S3 bucket). Within each group, the server's ranking is preserved. See [Storage backends](../concepts/storage-backends.md) for how documents get attached to external storage.

Each result also shows its folder path and last-updated time.

## You only find what you can see

Search visibility is identical to your document list:

- On a server with sign-in enabled, you find documents you own, documents in workspaces you belong to, and documents that have been shared with you.
- Documents shared with you by someone else are marked with the owner's name (or a "Shared" badge) next to the title — the same set as "Shared with me".
- On an open server (no sign-in), everything is searchable.

## What never matches

Trashed documents never appear in search results. Restore a document from the trash to make it findable again.

> **Note:** search runs on the server and needs a database. On a server running in volatile mode (no `DATABASE_URL`), the search endpoint is unavailable.

## Next steps

- Explore connections between documents instead: [Wikilinks and the graph](./wikilinks-and-the-graph.md).
- Control who can see what: [Roles and permissions](../concepts/roles-and-permissions.md).
