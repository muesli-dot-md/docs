---
sidebar_position: 2
title: Documents and identity
description: What a Muesli document is — slugs, stable document ids, titles, folders, and the trash.
---

# Documents and identity

This page explains how documents are identified, how those identities stay stable through renames and moves, and what trash and purge actually do.

## Slug and document id

Every document has two identifiers:

- **Slug** — the room name: the human-readable key you see in URLs (`/#my-doc`) and the key that [wikilinks](../guides/wikilinks-and-the-graph.md) resolve against. The slug is stable: it never changes once the document exists.
- **Document id** — an opaque, stable UUID. Sharing, permissions, comments, history, and storage attachments all reference the id.

A document also has an optional **title** — display only. Renaming a document sets its title; the slug (and therefore every link and URL pointing at it) never changes. A document with no title displays its slug.

## Doc ids in folder sync

When you [sync a folder](../guides/sync-a-folder.md) with the CLI, each file's doc id derives from its directory-relative path: `sub/deep.md` becomes `sub-deep` (slugified), with the optional `--prefix` prepended. Files that are already linked keep their existing doc id — the derivation only applies to files Muesli has never seen.

The CLI keeps a local path-to-document index on disk, and it is deliberately non-destructive:

- A **new** `.md` in the tree auto-links within seconds.
- A **deleted** file stops its sync session, but the server document and the index entry are kept.
- A **rename with identical content** re-binds the file to the same doc id — moving `notes.md` to `ideas.md` does not fork the document, its history, or its comments.

## Folders

Documents live in a per-workspace folder tree. A document's home folder is either a folder or the workspace root; sibling folder names are unique (case-insensitively) among live folders, and a folder cannot be moved under its own descendant.

Folders are not just organization: when a document is attached to a [storage backend](storage-backends.md), its path in the backend mirrors its folder chain. Moving a document — or renaming or moving any folder above it — relocates the canonical file in the backend.

## Starred

A document can be **starred** — a workspace-global favourite flag. Starring does not touch the document's updated time, so it never reorders recents.

## Trash

Trashing a document is a reversible soft delete:

- The document disappears from listings, search, the link graph, and wikilink resolution.
- New connections to it are refused, so nothing can quietly edit a trashed document.
- Inbound wikilinks become unresolved — and re-resolve the moment the document is restored.
- The canonical file in your storage backend is **not** touched. Storage is user-owned; Muesli simply stops materializing to and ingesting from the file while the document sits in the trash.

Restoring clears the flag. If the document's folder is itself still in the trash, the document restores to the workspace root (and its backend file relocates accordingly). Whole folders can be trashed and restored as a subtree — folders and documents together.

## Purge

Purge is the hard delete: the document and every child record — comments, suggestions, the entire edit history — are removed in one transaction. There is no undo.

> **Warning:** Purge is permanent. Unlike trash, there is nothing to restore from — the append-only history is deleted with the document.

Purging requires the editor role on the document. For agents, purge is additionally locked behind an operator-enabled policy switch, and every attempt is written to the audit log — see [Agent policies](../agents/policies.md).

Deleting a whole workspace is similarly permanent and is admin-only: it removes every document, comment, and suggestion in the workspace.

## Where identity lives, in short

| Thing | Identity | Survives |
| --- | --- | --- |
| Room / links / URL | slug | renames, moves, trash + restore |
| Sharing, history, comments | document id | renames, moves, trash + restore, file renames on disk |
| Display name | title | nothing depends on it |
| Canonical file location | backend path from folder chain | changes when you move the document |

See [Roles and permissions](roles-and-permissions.md) for who is allowed to rename, move, trash, and purge.
