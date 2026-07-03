---
sidebar_position: 4
title: Storage backends
description: Where the canonical .md lives — local files, S3, git repos, Google Drive, or SharePoint.
---

# Storage backends

This page is an overview of where a document's canonical `.md` file can live and how each backend behaves; each backend has its own setup guide.

## The model

The live document is always the CRDT in its room — that is the authority while people are editing (see [Architecture](architecture.md)). The storage backend holds the **materialized** `.md`: shortly after a typing burst ends (about half a second), the room writes the full current text to the backend and records a content hash of what it wrote.

Traffic flows the other way too. When something rewrites the file in the backend directly — a git push, a Drive edit, a script — Muesli detects the change, uses the recorded hash to rule out its own write echoing back, and merges the new content into the live room as a text diff. Those merged edits appear in [version history](../guides/version-history.md) with the origin `ingest`.

A backend is connected **per workspace** (by a workspace admin) and documents are **attached** to it individually (by an editor). Once attached, a document's path in the backend mirrors its folder chain, and moving or renaming it inside Muesli relocates the file.

## The backends

| Backend | Out-of-band change detection | Setup guide |
| --- | --- | --- |
| Local filesystem (via the CLI) | Instant — native file watch | [Local files](../storage/local-files.md) |
| S3-compatible (MinIO, AWS S3, R2) | Polled | [S3](../storage/s3.md) |
| Git repo (GitHub, Gitea, Forgejo) | Polled | [GitHub and Gitea](../storage/github-and-gitea.md) |
| Google Drive | Polled | [Google Drive](../storage/google-drive.md) |
| SharePoint (Microsoft 365) | Polled | [SharePoint](../storage/sharepoint.md) |

### Local filesystem

The `muesli` CLI *is* the local-filesystem bridge: `muesli open ./notes.md` materializes a room into the file and ingests your editor's changes as you save. Detection uses the operating system's native file watching, so local sync is instant — no polling. See [Make any file multiplayer](../guides/make-any-file-multiplayer.md) and [Sync a folder](../guides/sync-a-folder.md).

### S3-compatible

A workspace connects a bucket (endpoint + bucket name); access keys stay in the server's environment and never leave it. Every materialization is an object write, and Muesli records the SHA-256 of each write so polled changes can be told apart from its own.

### Git repo (GitHub, Gitea, Forgejo)

A workspace connects a repo and branch, reached through the Contents API — wire-compatible across all three forges. **Every materialization is a commit** (`muesli: create <path>` / `muesli: update <path>`) on the configured branch. Out-of-band commits are polled and ingested like any other backend; competing commits are handled with the API's compare-and-swap on the file's sha (one retry), and git history always retains both sides.

### Google Drive

Documents live on the **user's own Drive** — the user bears their own storage cost. The connection is created through a per-workspace OAuth consent flow, and the token's scope is `drive.file` only: Muesli can touch the files it created, never the rest of the Drive. Files live flat in a "Muesli" folder (Drive has no real paths).

### SharePoint

A workspace's documents live in a SharePoint document library the customer owns, reached app-only through Microsoft Graph with the `Sites.Selected` permission — a tenant admin grants the app write access to exactly one site. Connection is a form-and-probe wizard, no OAuth redirect.

## Polling, latency, and the hash guard

Cloud backends have no reliable push channel, so Muesli **polls** each attached file — every `MUESLI_STORAGE_POLL_SECS` seconds, default 20 (the older name `MUESLI_S3_POLL_SECS` still works). Each poll compares the file's hash against the hash of Muesli's last write:

- Hash matches → the file is what Muesli wrote; nothing to do.
- Hash differs → someone edited the file out of band; the content is ingested into the live room as a diff with origin `ingest`.

> **Note:** Seeing an out-of-band edit appear up to ~20 seconds later is expected behavior for cloud backends, not a defect. If you need instant round-trips, work on the file through the CLI's local-filesystem bridge — native watch has no polling delay.

The hash guard is also what prevents write loops: without it, Muesli's own materialization would look like an external change, be ingested, trigger a materialization, and so on.

## What the backend never holds

Only the markdown text is materialized. Comments, suggestions, history, permissions, and presence live in Muesli's own database — the `.md` in your bucket, repo, Drive, or library stays a plain markdown file with nothing embedded in it. Trashing a document inside Muesli does **not** delete the backend file; the sync loops simply stop touching it (see [Documents and identity](documents-and-identity.md)).

## Configuration pointers

Backend credentials (`MUESLI_S3_ACCESS_KEY`, `MUESLI_GITHUB_TOKEN`, `MUESLI_MS_CLIENT_ID`, …) are server-environment settings — see [Configuration](../self-hosting/configuration.md) and each backend's setup page for the exact variables and connect calls.
