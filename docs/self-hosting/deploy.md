---
sidebar_position: 1
title: Deploy to Production
description: Run Muesli in production with Docker Compose, Traefik, and Let's Encrypt.
---

# Deploy to Production

This page takes you from a fresh server to a running Muesli deployment behind TLS.

The production build is a single container image: the Rust sync server plus the built web app, served from the same process on port 8787. The provided `docker-compose.prod.yml` puts that container behind Traefik, which terminates TLS with automatic Let's Encrypt certificates.

## Prerequisites

- A host with Docker and Docker Compose.
- A domain name with an A/AAAA record pointing at the host (Let's Encrypt validates over HTTP, so ports 80 and 443 must be reachable from the internet).
- An OIDC identity provider (see [Authentication](authentication.md)).

## Steps

1. Clone the repository onto the host, then create your environment file from the template in the repository root:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env` and set the values the production stack requires:

   ```sh
   MUESLI_DOMAIN=muesli.example.com
   ACME_EMAIL=you@example.com
   POSTGRES_PASSWORD=a-long-random-password
   OIDC_ISSUER=https://your-idp.example.com
   OIDC_CLIENT_ID=muesli
   OIDC_CLIENT_SECRET=your-client-secret
   ```

3. Build and start the stack:

   ```sh
   docker compose -f docker-compose.prod.yml up -d --build
   ```

Traefik requests a certificate on first hit; after DNS and the ACME challenge resolve, your instance is live at `https://<MUESLI_DOMAIN>`.

## What runs where

| Service | Image | Role |
| --- | --- | --- |
| `traefik` | `traefik:v3.3` | Terminates TLS on ports 80/443, redirects HTTP to HTTPS, solves the Let's Encrypt HTTP challenge, and routes `MUESLI_DOMAIN` to the Muesli container on port 8787. |
| `muesli` | built from the repo `Dockerfile` | The sync server plus the built web app in one process. Not exposed directly — only Traefik reaches it. |
| `postgres` | `postgres:17-alpine` | All durable data: documents, history, workspaces, comments, audit log. Internal-only. |
| `redis` | `redis:7-alpine` | Login sessions. Internal-only. |
| `minio` (optional, commented out) | `minio/minio` | Self-hosted S3 for the [S3 storage backend](../storage/s3.md). Most deployments use external S3 or R2 instead. |

The compose file wires the container's configuration for you: `DATABASE_URL` points at the internal Postgres, `REDIS_URL` at the internal Redis, and `MUESLI_PUBLIC_URL` / `MUESLI_WEB_ORIGIN` are both set to `https://<MUESLI_DOMAIN>`. If you plan to use S3-backed storage, also set `MUESLI_S3_ACCESS_KEY` and `MUESLI_S3_SECRET_KEY` in `.env` — the compose file passes them through. See [Configuration](configuration.md) for every variable.

> **Note:** On shared infrastructure where Traefik, Postgres, or Redis already exist, drop those services from the compose file and point the environment variables at your existing instances instead.

## Health checks

- The Muesli image declares a Docker `HEALTHCHECK` that curls `http://localhost:8787/healthz` every 10 seconds.
- Postgres has a `pg_isready` health check, and the Muesli container waits for it (`depends_on: condition: service_healthy`) before starting.
- All services restart automatically (`restart: unless-stopped`).

## Persistence and volumes

With `DATABASE_URL` set, every edit lands in an append-only per-document log in Postgres, with periodic snapshots. Rooms hydrate from the log on first connect, so documents survive restarts and the log doubles as [version history](../guides/version-history.md).

The stack uses three named volumes:

| Volume | Holds | Loss impact |
| --- | --- | --- |
| `pgdata` | The Postgres data directory — all documents and metadata. | Data loss. Back this up. |
| `redisdata` | Redis persistence — login sessions. | Users sign in again. |
| `letsencrypt` | `acme.json`, the issued certificates. | Traefik re-issues certificates (subject to Let's Encrypt rate limits). |

> **Warning:** Without `DATABASE_URL` the server runs volatile — everything is in memory and lost on restart. The production compose file always sets it; this only concerns custom setups.

## Backups

All durable state lives in Postgres, so a database dump is a complete backup:

```sh
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U muesli muesli > muesli-backup.sql
```

Run it on a schedule and store the dumps off-host. Documents attached to a [storage backend](../concepts/storage-backends.md) additionally have their materialized `.md` files in that backend (your bucket, repo, Drive, or SharePoint library), which you back up under your own policies.

## Next steps

- Walk through the full [environment variable reference](configuration.md).
- Set up your identity provider in [Authentication](authentication.md).
- Enable the audit log and per-workspace SSO in [Enterprise features](enterprise.md).
