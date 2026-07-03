---
sidebar_position: 3
title: Roles and permissions
description: Document roles, workspace membership, guest links, agent token scopes, and open mode.
---

# Roles and permissions

This page describes Muesli's permission model: the three document roles, how workspace membership and share links grant them, and how agent tokens are capped by scopes.

## Document roles

A connection to a document acts with exactly one of three roles, ordered from least to most capable:

| Role | Can |
| --- | --- |
| `viewer` | Read the document and see live cursors and presence. Any write is rejected server-side. |
| `commenter` | Everything a viewer can, plus comments and suggestions. Direct edits are rejected — a commenter's changes must be [suggestions](../guides/suggestions-and-review.md). |
| `editor` | Everything, including direct edits, sharing, rename/move, trash, restore, purge, and attaching storage. |

Role checks are enforced on the server for every websocket message and REST call — a modified client cannot escalate itself.

There is no separate "owner" role. The user who creates a document is recorded as its creator and granted `editor`; the document belongs to that user's workspace.

## How you get a role

Your effective role on a document is the highest of:

1. **An explicit per-user grant** on the document (`viewer`, `commenter`, or `editor`).
2. **Workspace membership** — members of the document's workspace are editors on its documents.
3. **A share-link token** presented with the connection (see below).

If you have none of these, you have no access.

## Workspace membership and admins

Workspace membership has two levels: `admin` and `member`. Both are editors on the workspace's documents; admins additionally manage the workspace itself — renaming it, inviting people, changing member roles, connecting [storage backends](storage-backends.md), configuring SSO, reading the audit log, and deleting the workspace.

**Last-admin protection:** the last admin of a workspace can never be demoted or removed — the request fails until another admin exists. See [Workspaces](../guides/workspaces.md).

## Guest links

The **Share** button (or `muesli share`) mints a role-scoped guest link: the role — `viewer`, `commenter`, or `editor` — is chosen at share time and travels with the link. Anyone holding the link gets that role on that one document, no account required. Links can carry an expiry, and the token is stored hashed on the server. See [Share a document](../guides/share-a-document.md).

## Agent tokens: scopes ∩ role

Agents authenticate with bearer tokens (`mua_…`) rather than sessions. A **delegated agent token** — the kind `muesli login` mints — is bound to the human who created it and acts *within that person's permissions*, but every token also carries **scopes** that cap what it can do:

- `write` or `admin` scope caps at `editor`
- `comment` or `suggest` caps at `commenter`
- anything less caps at `viewer`

The effective capability is the intersection: **token scopes ∩ the owner's document role**. A read-only token never edits, no matter how powerful its owner is; a full-scope token still cannot exceed what its owner could do. Tokens can additionally be restricted to a single workspace or a single document.

Two more properties worth knowing:

- Edits made with an agent token are **attributed to the agent identity**, not the human owner — history and presence show the agent.
- Agent tokens cannot mint further tokens or inspect the owner's keys; account-level operations require a human session.

See [Tokens and permissions](../agents/tokens-and-permissions.md) for minting and managing tokens, and [Agent policies](../agents/policies.md) for the operator switches that downgrade agent edits to suggestions or gate destructive actions.

## Open mode

A server started without an OIDC issuer runs in **open mode**: there are no users, and every connection — browser, CLI, agent — is an anonymous editor. This is the intended setup for local, single-person use; anything multi-user should run with authentication. See [Authentication](../self-hosting/authentication.md).

## Odds and ends

- **Trashed documents** refuse new connections outright (HTTP 410), whatever your role — restore first. See [Documents and identity](documents-and-identity.md).
- **Sharing requires editor.** Viewers and commenters cannot mint guest links.
- **Purge requires editor** on the document; deleting a workspace requires admin. Both are permanent.
