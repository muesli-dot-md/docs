---
sidebar_position: 2
title: Configuration Reference
description: Every environment variable the Muesli server reads, grouped by area, with defaults.
---

# Configuration Reference

The Muesli server is configured entirely through environment variables; this page lists all of them.

## How configuration loads

At startup the server loads `./.env` from its working directory when present. Real environment variables always win over `.env` values. The repository ships a commented `.env.example` to copy from.

Two variables change the server's fundamental mode:

- Without `DATABASE_URL` the server runs **volatile** — everything lives in memory, edits are lost on restart, and the server logs a loud warning. This is a dev/demo mode, never production.
- Without `OIDC_ISSUER` the server runs in **open mode** — every connection is an anonymous editor. See [Authentication](authentication.md).

## Core

| Variable | Default | What it does |
| --- | --- | --- |
| `DATABASE_URL` | unset (volatile mode) | Postgres connection string. When set, migrations apply on boot and every edit lands in an append-only per-document log with periodic snapshots. When set but unreachable, the server fails fast. |
| `MUESLI_LISTEN` | `127.0.0.1:8787` | Address and port the server binds. The Docker image sets `0.0.0.0:8787`. |
| `MUESLI_PUBLIC_URL` | `http://localhost:8787` | The URL the outside world reaches the server on. Used to build the OIDC redirect URI and OAuth callbacks; an `https://` value also turns on `Secure` auth cookies. |
| `MUESLI_WEB_ORIGIN` | `http://localhost:5173` | Origin of the web app, used for CORS, share URLs, and redirect validation. In the single-image deployment this equals `MUESLI_PUBLIC_URL`. |
| `REDIS_URL` | unset (in-memory sessions) | Redis connection string for login sessions. Without it, sessions are in-memory and lost on restart. |
| `MUESLI_WEB_DIR` | unset | Directory of a built web app to serve from the same process (SPA fallback to its `index.html`). The Docker image sets `/srv/muesli-web`. |
| `RUST_LOG` | `muesli_server=debug,info` | Log filter (standard `tracing`/`env_logger` syntax). |
| `MUESLI_RETENTION` | `full` | Server-wide default history retention for storage-attached documents: `full` keeps everything; `bounded` prunes old updates and snapshots once the bytes are durable in the storage backend. |
| `MUESLI_PENDING_WS_TTL_HOURS` | `24` | Hours before a wizard-abandoned pending workspace is garbage-collected. |

## Auth (OIDC)

Muesli is a pure OIDC relying party — see [Authentication](authentication.md) for the setup walkthrough.

| Variable | Default | What it does |
| --- | --- | --- |
| `OIDC_ISSUER` | unset (open mode) | Your identity provider's issuer URL. Setting it requires `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `DATABASE_URL`; the server fails fast if any is missing or discovery fails. |
| `OIDC_CLIENT_ID` | — | Client ID of the Muesli app registered on the IdP. |
| `OIDC_CLIENT_SECRET` | — | Client secret of that app. |
| `OIDC_CLI_CLIENT_ID` | `muesli-cli` | The public client ID the CLI and desktop app use for the OIDC device-code flow. |

## Storage backends

Backend credentials are env-only — they are never stored in the database. Per-workspace storage connections hold only locations (endpoint, bucket, repo, and so on). See [Storage backends](../concepts/storage-backends.md).

| Variable | Default | What it does |
| --- | --- | --- |
| `MUESLI_S3_ACCESS_KEY` | unset | Access key for [S3-compatible storage](../storage/s3.md) (AWS S3, R2, MinIO). S3 connections fail until both S3 variables are set. |
| `MUESLI_S3_SECRET_KEY` | unset | Secret key for S3-compatible storage. |
| `MUESLI_GITHUB_TOKEN` | unset | Token for the [GitHub/Gitea/Forgejo backend](../storage/github-and-gitea.md); needs repo write scope. Sent as `Authorization: token …`, which all three forges accept. |
| `MUESLI_GOOGLE_CLIENT_ID` | unset | OAuth web client ID for [Google Drive storage](../storage/google-drive.md). Highest-precedence source of the Google client. |
| `MUESLI_GOOGLE_CLIENT_SECRET` | unset | The matching client secret. |
| `MUESLI_GOOGLE_CLIENT_FILE` | unset | Path to a Google "OAuth client" JSON file (`{"web":{…}}`) as an alternative to the two variables above. Fails fast when set but unreadable. Without any of the three, an implicit `./muesli.json` is tried and ignored with a warning when malformed. |
| `MUESLI_GOOGLE_AUTH_URI` | `https://accounts.google.com/o/oauth2/auth` | Test hook: override Google's authorization endpoint. Leave unset in production. |
| `MUESLI_GOOGLE_TOKEN_URI` | `https://oauth2.googleapis.com/token` | Test hook: override Google's token endpoint. Leave unset in production. |
| `MUESLI_GOOGLE_API_BASE` | `https://www.googleapis.com` | Test hook: override the Google API base. Leave unset in production. |
| `MUESLI_MS_CLIENT_ID` | unset | Application (client) ID of the Entra app for [SharePoint storage](../storage/sharepoint.md). Requires a secret or certificate alongside it; ignored (with a warning) otherwise. |
| `MUESLI_MS_CLIENT_SECRET` | unset | Client secret for the Entra app. |
| `MUESLI_MS_CLIENT_CERT_FILE` | unset | Path to a PEM file with the app's certificate and unencrypted private key. The certificate wins when both a secret and a certificate are set; a set-but-unusable file fails fast. |
| `MUESLI_MS_LOGIN_BASE` | `https://login.microsoftonline.com` | Microsoft login base — override for sovereign clouds (`.us`, `partner.microsoftonline.cn`). |
| `MUESLI_MS_GRAPH_BASE` | `https://graph.microsoft.com/v1.0` | Microsoft Graph base — override for sovereign clouds. |
| `MUESLI_STORAGE_POLL_SECS` | `20` | Seconds between out-of-band ingest polls of attached objects/files. External edits appear within one interval; the polling latency is expected behavior on S3, git forges, Drive, and SharePoint. |
| `MUESLI_S3_POLL_SECS` | `20` | Legacy name for `MUESLI_STORAGE_POLL_SECS`; still honored when the new name is unset. |
| `MUESLI_SECRET_KEY` | unset | The operator's application secret key: 32 bytes as 64 hex chars or standard base64. Required to store per-workspace credentials (for example bring-your-own Entra apps) encrypted at rest; such credentials are refused when it is unset or malformed. |
| `MUESLI_STORAGE_HOST_ALLOWLIST` | unset | Comma-separated list of hosts storage endpoints may point at. When set, it is the only rule — any host not on the list is rejected. |
| `MUESLI_STORAGE_ALLOW_PRIVATE` | unset | `true` or `1` disables the public-HTTPS posture for storage endpoints (which otherwise rejects plain HTTP, localhost, and private/loopback addresses). An escape hatch for fully private LAN deployments; never set it on hosted, multi-customer instances. |

## Agents

Policies for AI agents connecting over MCP — see [Agent policies](../agents/policies.md).

| Variable | Default | What it does |
| --- | --- | --- |
| `MUESLI_AGENT_DIRECT` | `auto` | `auto` downgrades agent `direct` edits to suggestions while a human is co-present in the document; `always` never downgrades; `never` makes agents always suggest. |
| `MUESLI_AGENT_GATED_ACTIONS` | off | `true`, `1`, or `yes` lets agents perform gated actions (accepting suggestions, resolving comments, purging documents, deleting workspaces). Off by default: gated tools return a policy-disabled error, and every attempt — allowed or denied — is written to the [audit log](enterprise.md). |

## Email (notifications)

Without `MUESLI_SMTP_HOST`, notification emails are logged to the console (the dev transport). See [Notifications](../guides/notifications.md).

| Variable | Default | What it does |
| --- | --- | --- |
| `MUESLI_SMTP_HOST` | unset (console transport) | SMTP server hostname. Setting it turns on the real email transport. |
| `MUESLI_SMTP_PORT` | `587` | SMTP port. |
| `MUESLI_SMTP_USERNAME` | empty | SMTP username. |
| `MUESLI_SMTP_PASSWORD` | empty | SMTP password. |
| `MUESLI_SMTP_FROM` | `muesli <no-reply@muesli.local>` | The `From:` address on notification emails. |

## Production stack variables

These are read by `docker-compose.prod.yml`, not by the server itself — see [Deploy to Production](deploy.md).

| Variable | What it does |
| --- | --- |
| `MUESLI_DOMAIN` | The public hostname Traefik routes to Muesli and requests a certificate for. |
| `ACME_EMAIL` | Contact email for Let's Encrypt registration. |
| `POSTGRES_PASSWORD` | Password for the stack's internal Postgres (also embedded into the `DATABASE_URL` the compose file builds). |
