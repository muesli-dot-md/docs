---
sidebar_position: 3
title: GitHub and Gitea
description: Store your documents' canonical .md files as commits in a git repository on GitHub, Gitea, or Forgejo.
---

# GitHub and Gitea

Connect a git repository so your documents' canonical `.md` files live as real commits on a branch you choose — on GitHub, Gitea, or Forgejo.

Muesli talks to the forge through the Contents API, which is wire-compatible across all three, so one backend (kind `"github"`) serves them all; only the API base URL differs. Connections are workspace-scoped and admin-created; documents are attached to a connection individually.

## Server setup: the token

The forge token lives only in the server's environment — never in the database:

```sh
MUESLI_GITHUB_TOKEN=...
```

The token needs repository write scope. The server sends it as `Authorization: token …`, which GitHub, Gitea, and Forgejo all accept.

## Connect a repository (web app)

1. Open **Settings → Connections → Connected storage** and pick the workspace. Only workspace admins can connect or disconnect.
2. Under **Connect storage**, next to **GitHub / Gitea**, click **Attach a repository**.
3. Fill in:
   - **API base** — `https://api.github.com` for GitHub, or `https://<host>/api/v1` for Gitea/Forgejo.
   - **Owner**, **Repository**, **Branch** (defaults to `main`), and an optional **Prefix** (a directory inside the repo).
4. Click **Attach**. The server probes the branch before creating the connection, so a bad owner/repo/branch or missing token fails inline.

The connection stores only `{api_base, owner, repo, branch, prefix?}` — no secrets.

## Connect and attach over REST

```sh
# 1. Connect a repo+branch to your workspace (admin); the branch is probed (bad config → 502)
curl -b "$COOKIES" -X POST localhost:8787/api/workspaces/$WS/storage \
  -H 'content-type: application/json' \
  -d '{"kind":"github","api_base":"https://api.github.com","owner":"acme","repo":"notes","branch":"main","prefix":"docs"}'
# → {"storage_conn_id":"…"}

# 2. Attach a document (editor) — the first commit lands immediately
curl -b "$COOKIES" -X POST localhost:8787/api/documents/my-doc/storage \
  -H 'content-type: application/json' \
  -d '{"storage_conn_id":"…","rel_path":"my-doc.md"}'
```

`rel_path` is optional and defaults to `<slug>.md`, prefixed by the document's folder path when the document lives in folders.

## How sync behaves

- **Every materialization is a commit.** When editing settles (~500ms after a typing burst), muesli writes the file through the Contents API as a commit on the configured branch, with the message `muesli: create <path>` or `muesli: update <path>`. Your repository history becomes an edit history of the document.
- **External commits are ingested.** Commits pushed to the file out-of-band — from your editor, CI, or an agent — are picked up by polling every `MUESLI_STORAGE_POLL_SECS` seconds (default 20), guarded by a content hash so muesli never re-ingests its own commits, and merged into the live document as a text diff.
- **Competing commits don't lose work.** Writes use the Contents API's blob-sha compare-and-swap: if someone commits to the file between muesli's read and write, the forge rejects the write, and muesli re-reads the fresh sha and retries once. Whatever happens, git history retains both sides — nothing is force-pushed or rebased away.

> **Note:** Polling latency is expected — an external commit appears in the live document within one poll interval. The local-file bridge via the [CLI](local-files.md) stays instant.

## See also

- [S3-compatible storage](s3.md) — the same connect-and-attach flow against a bucket.
- [Storage backends](../concepts/storage-backends.md) — the model shared by all backends.
