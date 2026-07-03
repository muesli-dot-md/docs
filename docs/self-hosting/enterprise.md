---
sidebar_position: 4
title: Enterprise Features
description: The append-only audit log and per-workspace SSO for bring-your-own identity providers.
---

# Enterprise Features

Self-hosted Muesli ships two enterprise primitives: an audit log and per-workspace SSO.

## Audit log

Security-relevant events land in an append-only `audit_log` table in Postgres. Writes are fire-and-forget: a failed insert is logged as a loud warning but never blocks or fails the action it describes.

What gets audited:

- **Logins** — web and CLI sign-ins, with the issuer used.
- **Tokens** — agent tokens minted and revoked.
- **Sharing** — share links created.
- **Documents and folders** — created, updated, trashed, restored, and purged.
- **Review actions** — suggestions accepted or rejected, comments resolved. Both REST and MCP paths are covered; MCP-performed actions carry `"via": "mcp"` in their detail, and agent actors are identifiable by the actor's kind.
- **Workspace lifecycle** — created, renamed, deleted; profile updates.
- **Membership** — invites created, claimed, and revoked; member role changes and removals.
- **Storage** — connections created and disconnected, documents attached to a backend.
- **SSO** — workspace SSO configured and removed, and memberships granted by SSO logins.
- **Agent policy** — every gated MCP action attempt, recorded as allowed or denied (see [Agent policies](../agents/policies.md)).

Workspace admins read the log two ways:

```sh
GET /api/workspaces/{id}/audit?limit=50&before_id=
```

Entries come newest-first; page by passing the last entry's `id` back as `before_id`. `limit` defaults to 50 and is clamped to 1–500. Each entry carries `id`, `action`, `actor`, `actor_label`, `document_id`, `detail`, and `created_at`. The same data appears in the **Audit** section of the workspace settings panel.

## Per-workspace SSO

Beyond the server's primary `OIDC_ISSUER` (see [Authentication](authentication.md)), each workspace can bring its own identity provider. A workspace admin configures it with one call:

```sh
curl -b "$COOKIES" -X PUT https://muesli.example.com/api/workspaces/$WS/sso \
  -H 'content-type: application/json' \
  -d '{"issuer":"https://idp.corp.example","client_id":"muesli",
       "client_secret":"…","email_domains":["corp.example"]}'
```

- The issuer is probed with OIDC discovery **before** anything is stored — a typo'd issuer fails this request with `502`, never a later login.
- `email_domains` must contain at least one plain domain (like `corp.example`); domains are normalized to lowercase.
- The IdP must allow the deployment's single redirect URI, `{MUESLI_PUBLIC_URL}/auth/callback`.

### How users sign in

Sign-in has two doors. `GET /auth/login` uses the primary issuer as always. The organization door is:

```
GET /auth/login/select?email=you@corp.example
```

It maps the email's domain to the workspace that claims it and runs the authorization-code + PKCE flow against that workspace's issuer (the login state records which issuer the attempt started with, so the callback validates against the right client). The web app's "Use organization SSO" button is this flow; an unclaimed domain returns `404` and the UI shows a toast.

A user who signs in through workspace W's IdP is automatically a member of W (role `member`) — that is the point of bringing your own IdP — and still gets a personal workspace. Users are keyed by `(issuer, subject)`, so identities never collide across issuers: the same email at two issuers is two distinct users. The CLI device-code login also works against per-workspace issuers, picking its verifying issuer from the token's `iss` claim.

> **Note:** Because success redirects into the issuer's login and an unclaimed domain returns 404, `/auth/login/select` does reveal which email domains have SSO configured. The response body never echoes the domain, and the per-IP rate limit on `/auth/*` keeps bulk probing slow.

### Removing an IdP

```sh
curl -b "$COOKIES" -X DELETE https://muesli.example.com/api/workspaces/$WS/sso
```

Existing users and sessions keyed on `(issuer, subject)` are untouched — only future logins change.

### Secret storage caveat

> **Warning:** The SSO `client_secret` is currently stored as plaintext JSONB in the `workspaces.sso` column. It is redacted from every API response (echoed only as `has_client_secret: true`), but it is not encrypted at rest. Treat database access and backups accordingly, and encrypt at rest before offering this to real enterprise tenants.
