---
sidebar_position: 7
title: Wikilinks and the graph
description: Link documents to each other with wikilinks or relative Markdown links, and explore the connections in the Graph view.
---

# Wikilinks and the graph

This guide covers cross-document links — how to write them, how they resolve, and how to explore them in the Graph view and the Linked mentions panel.

## Link forms

Muesli indexes four kinds of cross-document links:

| Form | Meaning |
|------|---------|
| `[[Target]]` | wikilink to another document |
| `[[Target\|label]]` | wikilink with a display label |
| `[[Target#Heading]]` | wikilink to a heading inside a document |
| `[text](./other.md)` | ordinary relative Markdown link to a `.md` file |

Targets are matched case-insensitively, and a trailing `.md` on a wikilink target is ignored. Heading fragments (`#Heading`) are resolved when you navigate, not stored in the index — the link itself points at the document.

> **Note:** links inside fenced code blocks or inline code spans never count. `` `[[not a link]]` `` stays plain text.

## Unresolved links

A link whose target does not exist yet is kept as an unresolved link rather than dropped. The moment a matching document is created, the link re-resolves automatically — write `[[Meeting notes]]` today, create the document tomorrow, and the edge appears without touching the original text. Link extraction runs on the server a couple of seconds after edits settle, so new links show up in the graph almost immediately.

## The Graph view

In the web app, click **Graph** at the bottom of the home screen's sidebar. It opens an Obsidian-style force-directed view of every document you can see, scoped to the workspace currently selected in the sidebar:

- Each document is a node; each link is an edge.
- Nodes are sized by degree — heavily linked documents are bigger.
- Unresolved targets render as dashed ghost nodes with italic labels.
- Click a node to open that document; drag nodes to untangle the layout.
- The header counts documents, links, and unresolved targets.

The graph shows only documents you are allowed to see. On a server running without a database (volatile mode), the graph is unavailable — it needs persistence to maintain the link index.

## Linked mentions (backlinks)

When a document is open, the Comments sidebar shows a **Linked mentions** section: every document whose wikilinks or relative Markdown links point at the one you are reading. Click an entry to jump to the linking document.

## Renames

Links follow how a change happens:

- A rename or move done outside Muesli (on disk, via the CLI's folder sync) re-binds the document's identity, and the link index re-resolves — but other files' contents are never rewritten behind your back. Links that no longer resolve simply show up as unresolved.
- The raw Markdown is the source of truth: Muesli never silently mutates your link text.

## For scripts and agents

The same data is available over REST: `GET /api/graph` returns the visible graph as `{nodes, edges, unresolved}`, and `GET /api/documents/{slug}/links` returns one document's outgoing links and backlinks. Both are scoped to what the caller can see. Agents get the equivalent `get_graph` and `get_document_links` MCP tools — see the [tool reference](../agents/tool-reference.md).

## Next steps

- Find documents by title or content: [Search](./search.md).
- Understand how documents keep their identity across renames: [Documents and identity](../concepts/documents-and-identity.md).
