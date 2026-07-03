---
sidebar_position: 4
title: Google Drive
description: Store your documents' canonical .md files on your own Google Drive, connected per workspace via OAuth.
---

# Google Drive

Connect Google Drive so your documents' canonical `.md` files live on **your own Drive** — you keep ownership of the files and bear your own storage cost.

Unlike S3 or GitHub, there is no form to fill in: a Drive connection (kind `"gdrive"`) is created through a per-workspace OAuth consent flow.

## Connect Drive (web app)

1. Open **Settings → Connections → Connected storage** and pick the workspace. Only workspace admins can connect.
2. Next to **Google Drive**, click **Connect Google Drive**. Your browser navigates to Google's consent screen.
3. Approve access. Google redirects back to muesli, which finds or creates a folder named **"Muesli"** in your Drive (this doubles as the connection probe), stores the connection, and returns you to the web app with the connection listed.

Attaching documents then works exactly like the other backends:

```sh
curl -b "$COOKIES" -X POST localhost:8787/api/documents/my-doc/storage \
  -H 'content-type: application/json' \
  -d '{"storage_conn_id":"…","rel_path":"notes/my-doc.md"}'
```

## What muesli can and cannot see

The OAuth scope is **`drive.file` only**: muesli can touch the files it created, never the rest of your Drive.

Files are stored **flat** inside the Muesli folder — Drive has no real paths, so the Drive file name is the document's `rel_path` with every `/` replaced by `∕` (U+2215 DIVISION SLASH). Nested paths stay distinct and round-trip losslessly.

## Tokens

The Drive refresh token is per-user, so it cannot live in the server environment the way S3/GitHub secrets do — it is stored on the connection itself and **redacted from every API response**. It is encrypted at rest when the server sets `MUESLI_SECRET_KEY`. Short-lived access tokens are cached in memory and refreshed transparently on expiry.

## How sync behaves

Writes and out-of-band ingest work like every other cloud backend: edits are written to the Drive file about 500ms after a typing burst ends, and changes made to the file directly in Drive are picked up by polling every `MUESLI_STORAGE_POLL_SECS` seconds (default 20), hash-guarded, and merged into the live document as a text diff.

> **Note:** Polling latency is expected — an edit made in Drive appears in the live document within one poll interval.

## Server setup (self-hosting)

The server needs a Google OAuth **web client**. Until one is configured, the Connect button in Settings is disabled with a "Setup required" badge. Configuration is read from, in order of precedence:

1. `MUESLI_GOOGLE_CLIENT_ID` + `MUESLI_GOOGLE_CLIENT_SECRET`
2. `MUESLI_GOOGLE_CLIENT_FILE` — a Google "OAuth client" JSON file (`{"web":{"client_id",…}}`)
3. `./muesli.json` in the server's working directory, when present (same shape)

```sh
MUESLI_GOOGLE_CLIENT_ID=...
MUESLI_GOOGLE_CLIENT_SECRET=...
# or:
MUESLI_GOOGLE_CLIENT_FILE=./muesli.json
```

> **Warning:** The redirect URI `{MUESLI_PUBLIC_URL}/auth/storage/google/callback` must be registered on the OAuth client in the Google Cloud Console — without it, Google refuses to show the consent screen. For local testing that is `http://localhost:8787/auth/storage/google/callback`. The Settings panel shows the exact URI for your server.

Under the hood, the flow is `GET /api/workspaces/{id}/storage/google/start` → 302 to Google's consent screen (scope `drive.file`, `access_type=offline`, `prompt=consent`) → `GET /auth/storage/google/callback?code&state` → the code is exchanged, the Muesli folder is found or created, and the browser is bounced back to the web app.

## See also

- [Storage backends](../concepts/storage-backends.md) — the model shared by all backends.
- [Self-hosting configuration](../self-hosting/configuration.md) — all server environment variables.
