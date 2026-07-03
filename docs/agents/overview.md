---
sidebar_position: 1
title: Agents Overview
description: How AI agents participate in Muesli as first-class collaborators with full attribution, presence, and operator-controlled guardrails.
---

# Agents Overview

Agents connect to Muesli over [MCP](mcp-setup.md) and collaborate on documents the same way people do — this page explains the mental model.

## Agents are ordinary collaborators

Muesli has no separate "API write path" for machines. Every agent action goes through the same document room, permission checks, and persistence that the web editor and the CLI use. That has three consequences:

- **Full attribution.** Every agent edit lands as an ordinary document event, attributed to the agent's own identity. [Version history](../guides/version-history.md) shows who changed what, when, and via which origin — `human`, `agent`, or `ingest` — grouped by change set. An `edit_document` call is always exactly one change set, so one agent action reads as one reviewable unit.
- **Live presence.** While an agent edits a document, it joins the presence bar under its display name, marked as an agent rather than with human initials. People co-editing the document see the agent working in real time.
- **Same permissions.** An agent can only see and touch what its identity is allowed to see and touch, under the same [roles](../concepts/roles-and-permissions.md) as everyone else.

## Two kinds of agent principals

Agents authenticate with an API token (`mua_…`). The token determines which of two identities the agent acts as:

- **Delegated agent token** — minted by you, for tools acting on your behalf ("Claude on my laptop"). The agent acts with (a subset of) *your* permissions: your document roles apply, capped by the token's scopes. Edits are attributed to the **agent identity**, which is linked to you as the owner — history shows the agent's name, not yours. This is what `muesli login` and a personal MCP config use.
- **Workspace service account** — a token whose agent identity is its own first-class user (no human owner). It holds its own document and workspace roles, like any member. This is the shape for shared bots and CI.

See [Tokens and permissions](tokens-and-permissions.md) for minting, scopes, and the exact capability math.

## Edits can be downgraded to suggestions

Agents edit in one of two modes: `direct` (apply live) or `suggest` (queue [suggestions](../guides/suggestions-and-review.md) for human review).

By default, the server applies a co-presence rule: when an agent requests a `direct` edit **while a human is live in the same document**, the edit is downgraded to suggestions instead. The humans in the room review the agent's proposal rather than colliding with it mid-keystroke. When nobody is around, the agent automates freely. The response always reports the `applied_mode` that was actually used, so the agent knows what happened.

Operators can pin this behavior in either direction with the `MUESLI_AGENT_DIRECT` policy — see [Policies](policies.md).

## Gated actions are off by default

Some actions *approve* work (accepting suggestions, resolving comments) or *destroy* it (permanently purging a document, deleting a workspace). Muesli treats these as human decisions: the corresponding tools are disabled for agents unless the operator explicitly enables `MUESLI_AGENT_GATED_ACTIONS` on the server. A disabled tool returns a clear policy error, and **every attempt — allowed or denied — is written to the workspace audit trail**.

The full list of gated tools and audit behavior is in [Policies](policies.md).

## What agents can never do

A few walls hold regardless of scopes or policy:

- **No self-service keys.** Account tools (`mint_api_token`, `list_api_tokens`, `revoke_api_token`, `update_profile`, `get_storage_usage`) require a human browser session. A delegated agent token is refused — an agent can never mint itself new keys, inspect its owner's keys, or rewrite its owner's profile.
- **No existence oracle.** For any document an agent cannot access, the server answers with one generic `document not found or access denied` — it never confirms whether the document exists.
- **Own inbox only.** [Notifications](../guides/notifications.md) tools read the agent identity's *own* inbox. Mention an agent and it sees the mention; it never reads its owner's notifications.

> **Note:** Agents also don't see the trash: `list_documents` excludes trashed documents (though `restore_document` can still restore one the agent already knows by slug or id).

## A typical agent loop

The tool surface is designed for a safe read–edit–review cycle:

1. `read_document` returns the markdown and the document's current `seq`.
2. `edit_document` anchors each change to exact text (or a byte range) and passes `base_seq` — if the document moved in the meantime, the edit fails cleanly and the agent re-reads and retries instead of clobbering someone.
3. The response's `applied_mode` says whether the edit applied live or landed as suggestions; on a downgrade the agent gets the suggestion ids and can `add_comment` to tell the humans what it proposed and why.
4. Humans review in the editor; the agent can watch progress with `list_suggestions` and its own notification inbox.

## Where to go next

- [Connect an MCP client](mcp-setup.md) — the two-line config or direct HTTP.
- [Tool reference](tool-reference.md) — all 52 tools.
- [Tokens and permissions](tokens-and-permissions.md) — minting and capability rules.
- [Policies](policies.md) — the operator switches.
