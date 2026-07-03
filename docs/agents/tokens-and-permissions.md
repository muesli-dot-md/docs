---
sidebar_position: 4
title: Tokens and Permissions
description: Mint agent API tokens, understand scopes and restrictions, and see how a token's effective capability is computed.
---

# Tokens and Permissions

Agents authenticate with delegated API tokens; this page covers minting them, what they can carry, and how their permissions are computed.

## Minting a token

**From the CLI.** `muesli login` runs a device-code flow against your server's identity provider and stores a fresh delegated agent token in your OS keychain. The agent identity is labeled `muesli-cli@<hostname>`. This is the zero-config path for the [stdio proxy](mcp-setup.md).

**From the web app.** Go to **Settings → API keys** and click **Create API key**. You choose:

- a **label** (e.g. "Claude on my laptop") — it becomes the agent identity's display name, so this is the name humans see in presence and history
- an **access** preset: *Read-only* (agents can read your documents) or *Read & write* (agents can read and edit them)
- an **expiry**: 30 days, 90 days, 1 year, or no expiry

The new `mua_…` secret is shown **exactly once**, together with a ready-to-paste MCP configuration snippet pointing at your server's `/mcp` endpoint. Copy it before closing the dialog.

Each minted key creates its own agent identity linked to you as the owner. The keys list shows every key's label, access, creation date, and expiry — and a **Revoke** button that cuts the agent off immediately.

## Token properties

- **Opaque secret, shown once.** The raw `mua_` secret appears only in the mint response; the server stores a SHA-256 hash, never the secret itself.
- **Scopes.** The permission model recognizes the scopes `read`, `write`, `comment`, `suggest`, and `admin`, which cap the token's role: `write` or `admin` caps at Editor, `comment` or `suggest` at Commenter, `read` alone at Viewer. The minting surfaces (web settings and the `mint_api_token` tool) currently offer two presets: `["read"]` and `["read", "write"]`.
- **Optional restriction.** A token can be restricted to a single workspace or a single document; a restricted token cannot see or touch anything outside its restriction, whatever the owner could otherwise access.
- **Optional expiry.** From 1 day to 10 years, or no expiry. An expired token stops authenticating.
- **Revocable.** Revoking takes effect immediately. Minting and revoking are both recorded in the workspace audit trail (`agent_token_minted`, `agent_token_revoked`).

## Effective capability

For a delegated token, what an agent may do on a given document is the **intersection** of:

1. the owner's [role on that document](../concepts/roles-and-permissions.md) (viewer, commenter, or editor — via workspace membership or a per-document grant),
2. the ceiling imposed by the token's scopes, and
3. any workspace/document restriction on the token.

So a read-only token held by a workspace admin still cannot edit anything, and a read-write token cannot edit a document its owner can only view. On top of that intersection, the server-wide [agent policies](policies.md) decide whether direct edits stick and whether gated actions run at all.

Edits made through a delegated token are attributed to the **agent identity** (linked to its owner) — never silently to the owner. For a service-account token with no owner, the agent identity holds its own roles like any workspace member.

## The account-settings wall

Account endpoints are session-only: they require a human browser session, and any API token — whatever its scopes — is refused with a 403. In practice this means an agent can never:

- mint new tokens (`mint_api_token`)
- list or revoke its owner's tokens (`list_api_tokens`, `revoke_api_token`)
- change its owner's profile (`update_profile`)
- read its owner's storage usage (`get_storage_usage`)

An agent cannot escalate by minting itself keys, and a leaked token cannot be used to create more tokens. (`get_me` still works for any principal — it reports the auth mode and, for a delegated token, the owner's identity.)

## Notifications go to the agent

Every agent identity has its own [notification](../guides/notifications.md) inbox. When someone mentions an agent in a comment, the mention lands in the *agent's* inbox, and the notification tools over MCP read that inbox — a delegated agent never reads its owner's notifications.

> **Warning:** Treat `mua_` tokens like passwords. Anyone holding the secret acts as that agent, with the owner's document access up to the token's scopes. Prefer short expiries, one token per tool, and revoke anything you no longer use.
