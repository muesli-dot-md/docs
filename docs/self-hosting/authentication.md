---
sidebar_position: 3
title: Authentication
description: Connect Muesli to your OIDC identity provider, or run it in open mode.
---

# Authentication

This page explains Muesli's two auth modes and how to wire up your identity provider.

Muesli is a pure OIDC relying party — it has no user database with passwords, no signup flow, and no auth of its own. Identity comes entirely from an OpenID Connect provider you configure: Keycloak, Dex, Authentik, Entra ID, Okta, Google Workspace, or anything else that speaks standard OIDC.

## Open mode (no identity provider)

Without `OIDC_ISSUER`, the server runs in open mode: every connection is an anonymous editor. There are no accounts, no roles, and no sharing controls. The server logs a warning at startup to make the mode unmistakable.

> **Warning:** Open mode is for local development and solo use only. Anyone who can reach the server can read and edit every document. Never expose an open-mode server to the internet.

## OIDC mode

Setting `OIDC_ISSUER` switches the server to full relying-party mode. It requires `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, and `DATABASE_URL` (users and sharing live in Postgres) — the server fails fast at startup if any is missing or if issuer discovery fails, rather than coming up half-open.

1. Register a confidential web client on your identity provider for the Muesli server.

2. Register the redirect URI. Muesli uses exactly one:

   ```
   {MUESLI_PUBLIC_URL}/auth/callback
   ```

   For example `https://muesli.example.com/auth/callback`. This single redirect URI serves every issuer the deployment trusts, including per-workspace IdPs added later.

3. Set the environment:

   ```sh
   OIDC_ISSUER=https://your-idp.example.com
   OIDC_CLIENT_ID=muesli
   OIDC_CLIENT_SECRET=your-client-secret
   MUESLI_PUBLIC_URL=https://muesli.example.com
   ```

4. Restart the server. The log line `oidc auth enabled` confirms discovery succeeded.

Browser sign-in runs the standard authorization-code flow with PKCE, with login-CSRF binding between the browser and the login attempt. On first login Muesli creates a user record and a personal workspace, and claims any pending [workspace invites](../guides/workspaces.md) sent to the user's email.

Users are keyed by `(issuer, subject)` — never by email alone — so identities from different issuers can never collide. Signed-in users can share documents with role-scoped guest links that need no account; see [Share a document](../guides/share-a-document.md).

## Sessions

Login sessions live in Redis when `REDIS_URL` is set, and in server memory otherwise. In-memory sessions are lost on restart — everyone signs in again — so production deployments should run Redis (the [production compose stack](deploy.md) includes it).

## CLI and desktop login (device-code flow)

The `muesli` CLI and the desktop app authenticate with the OIDC device-code flow rather than a browser redirect:

1. The client fetches `GET /api/cli/auth-config`, which reports the auth mode, the issuer, and the public CLI client ID (`OIDC_CLI_CLIENT_ID`, default `muesli-cli`).
2. It runs the device-code flow against the issuer using that public client and obtains an ID token.
3. It posts the ID token to `POST /api/cli/login`, which validates it and returns a delegated agent token (`mua_…`) stored in the OS keychain — a distinct agent identity that acts within your permissions and is attributed in edits.

For this to work, register a second, public client on your IdP (no secret) with the device-code grant enabled, named `muesli-cli` or matching whatever you set `OIDC_CLI_CLIENT_ID` to. The verifying issuer is picked from the token's `iss` claim, so CLI login also works against per-workspace issuers.

See [Install the CLI](../getting-started/install-the-cli.md) and [Tokens and permissions](../agents/tokens-and-permissions.md).

## Organization SSO (per-workspace IdP)

Beyond the primary issuer, each workspace can bring its own identity provider. The sign-in door for it is:

```
GET /auth/login/select?email=you@corp.example
```

which maps the email's domain to the workspace that claims it and runs the login against that workspace's issuer — this is the web app's "Use organization SSO" button. Configuration and behavior are covered in [Enterprise features](enterprise.md).
