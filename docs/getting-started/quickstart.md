---
sidebar_position: 2
title: Quickstart
description: Run a local Muesli instance and edit a document collaboratively in about five minutes.
---

# Quickstart

Self-host a development instance of Muesli and see live multiplayer editing in about five minutes.

## Prerequisites

- Docker (with Compose)
- The Rust toolchain (`cargo`)
- Node.js with `pnpm`
- A clone of the [muesli repository](https://github.com/muesli-dot-md/muesli)

## 1. Start the backing services

From the repository root, copy the local OIDC issuer configs and bring up the dev services:

```sh
cp dev/dex/config.example.yaml dev/dex/config.yaml
cp dev/dex2/config.example.yaml dev/dex2/config.yaml
docker compose up -d
```

This starts Postgres, Redis, Dex (two OIDC issuers), MinIO, and Gitea. Only Postgres is required for the basics — the rest back optional features you can explore later.

## 2. Configure and run the server

```sh
cp .env.example .env
cargo run -p muesli-server
```

The server loads `./.env` at startup (real environment variables win) and listens on `ws://localhost:8787`. The default `.env` already points `DATABASE_URL` at the compose Postgres, so every edit lands in an append-only per-document log with periodic snapshots — documents survive restarts, and the log doubles as edit history.

> **Note:** Without `DATABASE_URL` the server runs volatile (in-memory, with a loud warning). Without `OIDC_ISSUER` it runs in **open mode**: every connection is an anonymous editor, which is exactly right for a first local run. To try multi-user auth, uncomment the `OIDC_*` block in `.env` and sign in with the dev Dex user `dev@muesli.md` / `password`. See [Authentication](../self-hosting/authentication.md).

## 3. Run the web app

In a second terminal:

```sh
pnpm install
pnpm dev:web
```

The web app is now at http://localhost:5173.

## 4. Edit together

1. Open http://localhost:5173 in two browser windows side by side.
2. Type in one window — the other shows live cursors and instant sync.
3. Pick a different document via the URL hash: `http://localhost:5173/#my-doc`.

That's the whole loop: the live document is a CRDT over the raw markdown, and every surface — browser, CLI, agent — collaborates on the same text.

## Production deployment

For a real deployment, one image serves the server and the built web app behind Traefik with Let's Encrypt:

```sh
cp .env.example .env   # set MUESLI_DOMAIN, ACME_EMAIL, POSTGRES_PASSWORD, OIDC_*
docker compose -f docker-compose.prod.yml up -d --build
```

See [Deploy](../self-hosting/deploy.md) for the full walkthrough and [Configuration](../self-hosting/configuration.md) for every setting.

## Next steps

- [Install the CLI](install-the-cli.md) and [make any file multiplayer](../guides/make-any-file-multiplayer.md).
- [Share a document](../guides/share-a-document.md) with role-scoped guest links.
- [Connect an agent](../agents/overview.md) over MCP.
- [Use the desktop app](desktop-app.md) for local-first folder editing.
