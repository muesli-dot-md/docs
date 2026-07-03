---
sidebar_position: 5
title: Agent Policies
description: The two server-side policies that govern agent behavior — co-present edit downgrading and gated approval/destruction actions.
---

# Agent Policies

Two environment variables on the server decide how much autonomy agents get; both default to the cautious setting.

## MUESLI_AGENT_DIRECT — direct edits vs. suggestions

Controls what happens when an agent calls `edit_document` with `mode: "direct"`.

| Value | Behavior |
|---|---|
| `auto` (default) | Direct edits apply live **unless a human is co-present in the document** — then they are downgraded to suggestions for review. |
| `always` | Direct edits always apply live, human co-present or not. |
| `never` | Agents can never edit directly; every edit is stored as suggestions. |

"Co-present" means at least one human is live in the document's room at the moment of the edit. `mode: "suggest"` is never upgraded — an agent that asks to suggest always suggests, under every policy value.

The full decision matrix:

| Requested mode | Human present | Policy | Applied mode |
|---|---|---|---|
| `direct` | no | `auto` | `direct` |
| `direct` | yes | `auto` | `suggest` (downgraded) |
| `direct` | yes or no | `always` | `direct` |
| `direct` | yes or no | `never` | `suggest` |
| `suggest` | yes or no | any | `suggest` |

The tool response always carries `applied_mode`. On a downgrade it additionally carries `downgraded: true` and a `reason`, and returns the created `change_set_id` and `suggestion_ids` so the agent can point humans at its pending [suggestions](../guides/suggestions-and-review.md).

> **Note:** The default exists so that live humans review agent changes instead of colliding with them. When nobody is in the document, `auto` lets agents automate at full speed.

## MUESLI_AGENT_GATED_ACTIONS — approval and destruction

Off by default. Some tools either *approve* work or *irreversibly destroy* it; Muesli reserves those for humans unless the operator opts in. The gated tools are exactly:

- `accept_suggestion`
- `reject_suggestion`
- `accept_change_set`
- `reject_change_set`
- `resolve_comment`
- `purge_document`
- `delete_workspace`

While the policy is off, each of these returns the error:

```text
policy-disabled: agent gated actions (accept/resolve/purge/delete-workspace) are disabled on this server (MUESLI_AGENT_GATED_ACTIONS)
```

To enable them, set `MUESLI_AGENT_GATED_ACTIONS=true` (`1` and `yes` also work) on the server. Everything else — reading, editing, suggesting, commenting, listing — is unaffected by this policy.

`reopen_comment` is deliberately **not** gated: flagging work as unfinished is not an approval.

### Every gated attempt is audited

Each call to a gated tool writes a workspace [audit](../guides/workspaces.md) event before anything else happens — `mcp_gated_action_allowed` or `mcp_gated_action_denied` — recording the acting principal and the tool name. Allowed actions additionally audit their concrete effect (for example `suggestion_accepted` or `comment_resolved`) with full document context and a `via: "mcp"` marker, exactly like the equivalent human actions in the web app. Workspace admins can review the trail in the workspace settings audit section or via the `list_workspace_audit` tool.

## Choosing settings

- **Default (`auto` + gated off):** agents draft and propose; humans review, accept, and delete. The right posture for shared workspaces.
- **`always` + gated on:** full automation — suitable for a bot-driven pipeline on documents humans rarely touch live. The audit trail still records every gated action.
- **`never` + gated off:** maximum caution — agents can only ever suggest and comment.

See also: [Agents overview](overview.md), [Tool reference](tool-reference.md), [server configuration](../self-hosting/configuration.md).
