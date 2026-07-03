---
sidebar_position: 3
title: MCP Tool Reference
description: Every MCP tool the Muesli server exposes, with parameters, role requirements, and gating.
---

# MCP Tool Reference

The Muesli MCP server exposes 52 tools — the full user-facing surface; this page lists each tool's purpose and key parameters.

## Conventions

- **Document reference.** Every document-scoped tool accepts *either* `document_id` (the document's UUID) *or* `slug` (the room name). Pass one of the two.
- **Byte offsets.** All text ranges (`range: {start, end}`) are **UTF-8 byte offsets** into the current markdown. Ranges that split a multi-byte character are rejected.
- **Anchor text.** Where a tool accepts `anchor_text`, it must match the document text **exactly once**. Zero matches and multiple matches are both errors — an ambiguity error lists the matching offsets with context so you can pass a longer anchor or an explicit range. The server never guesses.
- **Existence is not leaked.** A document you may not access answers `document not found or access denied` — the same message as a document that does not exist.
- **Gated tools** (marked **gated** below) are disabled unless the server sets `MUESLI_AGENT_GATED_ACTIONS=true`; see [Policies](policies.md). Every attempt is audited.
- **Account tools** require a human browser session; delegated agent tokens are refused. See [Tokens and permissions](tokens-and-permissions.md).
- **Roles.** Tools note the minimum [document or workspace role](../concepts/roles-and-permissions.md) where it is stricter than "can see the document". "Admin" means workspace admin.
- **Limits.** `edit_document` accepts at most 500 edits per call; `list_comments` and `list_suggestions` return at most 200 items.
- Tool failures come back as tool results with `isError: true` and a plain-text message.

## Discovery and reading

| Tool | Description | Parameters |
|---|---|---|
| `list_documents` | List documents visible to you (owner ACL or workspace membership). Trashed documents are excluded. | `query` — optional substring filter on the slug |
| `read_document` | Read a document's markdown. Returns `markdown`, `seq`, and `title`. | doc ref; `version` — optional history seq (from `get_history`) for a point-in-time read |
| `get_history` | Attributed, coalesced edit history, newest first: who changed the document, when, via which origin (`human` / `agent` / `ingest`), grouped by change set. | doc ref; `limit` — max raw updates scanned (default 50, max 500) |

## Editing

| Tool | Description | Parameters |
|---|---|---|
| `create_document` | Create a new document and seed its content as one change set. Requires editor capability. | `slug` (required); `markdown` (required) |
| `edit_document` | Edit a document. Every call lands as **one change set**. | doc ref; `mode` (required) — `direct` or `suggest`; `edits` (required) — array, see below; `base_seq` — optional optimistic-concurrency check |

Each entry in `edits` is one of:

- `{ "anchor_text": "...", "delete": true }` — delete the anchored text
- `{ "anchor_text": "...", "insert": "..." }` — insert **after** the anchored text
- `{ "anchor_text": "...", "insert": "...", "delete": true }` — replace the anchored text
- `{ "range": { "start": N, "end": N }, "insert": "..." }` — replace a byte range (delete it when `insert` is omitted)
- `{ "replace_all": "..." }` — replace the whole document (must be the only edit)

Edits must not overlap. Pass `base_seq` (the `seq` from `read_document`) to fail cleanly if the document has moved — the error tells you to re-read and retry.

`mode: "direct"` requires the editor role and applies live, but **may be downgraded to suggestions while a human is co-present** — check `applied_mode` in the response (`downgraded: true` plus the created `suggestion_ids` on a downgrade). `mode: "suggest"` requires only the commenter role and stores pending [suggestions](../guides/suggestions-and-review.md) for human review. See [Policies](policies.md).

## Comments

| Tool | Description | Parameters |
|---|---|---|
| `add_comment` | Start a comment thread anchored to text. Commenter role. | doc ref; `body` (required); `anchor_text` or `range: {start, end}` |
| `reply_comment` | Reply to an existing thread. Commenter role. | `thread_id` (required); `body` (required) |
| `list_comments` | List comment threads with replies and their current text ranges. | doc ref; `status` — optional filter: `open`, `resolved`, or `orphaned` |
| `resolve_comment` | **Gated.** Resolve a comment thread. | `thread_id` (required) |
| `reopen_comment` | Reopen a resolved thread (the inverse of `resolve_comment`; not gated). | doc ref; `thread_id` (required) |

## Suggestions

| Tool | Description | Parameters |
|---|---|---|
| `list_suggestions` | List suggestions on a document with their current text ranges. | doc ref; `status` — optional filter: `pending`, `accepted`, or `rejected` |
| `accept_suggestion` | **Gated.** Accept one pending suggestion, applying it to the document. Editor role. | `suggestion_id` (required) |
| `reject_suggestion` | **Gated.** Reject one pending suggestion. Editors, or the suggestion's author withdrawing their own. | `suggestion_id` (required) |
| `accept_change_set` | **Gated.** Accept every pending suggestion in a change set as one atomic edit; unresolvable or overlapping suggestions are reported as conflicts. Editor role. | `change_set_id` (required) |
| `reject_change_set` | **Gated.** Reject every pending suggestion in a change set. Editors, or the author. | `change_set_id` (required) |

## Document lifecycle and search

| Tool | Description | Parameters |
|---|---|---|
| `update_document` | Rename (display title), move between folders, and/or star a document. Editor role. | doc ref; `title` — string or `null`/`""` to clear back to the slug; `folder_id` — folder UUID or `null` for the workspace root; `starred` — boolean |
| `trash_document` | Move a document to the trash (soft delete; restorable). Editor role. | doc ref |
| `restore_document` | Restore a trashed document. Editor role. | doc ref |
| `purge_document` | **Gated.** Permanently delete a document and all its comments, suggestions, and history. Editor role. | doc ref |
| `search` | Full-text [search](../guides/search.md) over documents visible to you (title and content, ranked), with snippets. | `q` (required); `limit` — max results (default 20, max 100) |

## Folders

| Tool | Description | Parameters |
|---|---|---|
| `create_folder` | Create a folder. | `name` (required); `parent_id` — parent folder UUID (absent = workspace root); `workspace_id` — defaults to the parent's, else your primary workspace |
| `update_folder` | Rename a folder and/or move it. Moving under a descendant is rejected. | `folder_id` (required); `name`; `parent_id` — new parent UUID or `null` for the root |
| `trash_folder` | Move a folder and its contents to the trash (restorable). | `folder_id` (required) |
| `restore_folder` | Restore a trashed folder and its contents. | `folder_id` (required) |

## Sharing

| Tool | Description | Parameters |
|---|---|---|
| `create_share_link` | Create a [share link](../guides/share-a-document.md) for a document at a role. Editor role. | doc ref; `role` (required) — `viewer`, `commenter`, or `editor`; `expires_in_secs` — link lifetime (absent = no expiry) |
| `list_document_members` | List who can access a document (workspace members and per-document grants). | doc ref |

## Graph

| Tool | Description | Parameters |
|---|---|---|
| `get_graph` | The cross-document [link graph](../guides/wikilinks-and-the-graph.md) visible to you: nodes (documents), edges (wikilinks), unresolved link targets. | none |
| `get_document_links` | One document's outgoing links and incoming backlinks. | doc ref |

## Notifications

These read the calling principal's **own** inbox — for a delegated agent token, that is the agent identity's inbox, never its owner's.

| Tool | Description | Parameters |
|---|---|---|
| `list_notifications` | Your [notification](../guides/notifications.md) inbox (newest first): mentions addressed to this principal. | `unread_only` — boolean; `before` — timestamp cursor for paging |
| `mark_notification_read` | Mark one notification read. | `notification_id` (required) |
| `mark_all_notifications_read` | Mark every unread notification read. | none |

## Workspaces

| Tool | Description | Parameters |
|---|---|---|
| `list_workspaces` | List [workspaces](../guides/workspaces.md) you belong to, with your role in each. | none |
| `create_workspace` | Create a workspace (you become its admin). It starts `pending_storage` until a storage connection is bound. | `name` (required) |
| `get_workspace` | One workspace's detail: members, invites, storage binding. | `workspace_id` (required) |
| `rename_workspace` | Rename a workspace. Admin. | `workspace_id` (required); `name` (required) |
| `delete_workspace` | **Gated.** Permanently delete a workspace and every document in it, for all members. Admin. | `workspace_id` (required) |
| `create_workspace_invite` | Invite an email at a role. Admin. | `workspace_id`, `email`, `role` (`admin` or `member`) — all required |
| `revoke_workspace_invite` | Revoke a pending invite. Admin. | `workspace_id` (required); `invite_id` (required) |
| `set_workspace_member_role` | Change a member's role. Demoting the last admin is rejected. Admin. | `workspace_id`, `user_id`, `role` (`admin` or `member`) — all required |
| `remove_workspace_member` | Remove a member (or yourself, to leave). Removing the last admin is rejected. | `workspace_id` (required); `user_id` (required) |
| `list_workspace_audit` | The workspace's security audit trail, newest first. Admin. | `workspace_id` (required); `limit`; `before_id` — paging cursor (an audit row id) |

## Storage

| Tool | Description | Parameters |
|---|---|---|
| `list_storage_connections` | List a workspace's [storage connections](../concepts/storage-backends.md) (S3 / GitHub / Google Drive / SharePoint). Admin. | `workspace_id` (required) |
| `create_storage_connection` | Create a storage connection; it is probed before being stored. Admin. Google Drive and SharePoint bind via browser OAuth, not this tool. | `workspace_id` (required); `kind` (required) — `s3` or `github`; for [S3](../storage/s3.md): `endpoint`, `bucket`, `region`, `access_key_id`, `secret_key`, `prefix?`; for [GitHub](../storage/github-and-gitea.md): `api_base`, `owner`, `repo`, `branch?`, `token`, `prefix?` |
| `delete_storage_connection` | Delete a workspace storage connection. Admin. | `workspace_id` (required); `connection_id` (required) |
| `get_storage_status` | Per-document materialization status for a workspace's storage (attached, pending, errors). Admin. | `workspace_id` (required) |
| `attach_document_storage` | Attach one document to a storage connection (writes the canonical file). Editor role; the connection must belong to the document's workspace. | doc ref; `storage_conn_id` (required); `rel_path` — path inside the backend (defaults to the computed folder path + title) |

## Account

These tools require a **human browser session** — delegated agent tokens are refused, so an agent can never mint itself keys or change its owner's profile.

| Tool | Description | Parameters |
|---|---|---|
| `get_me` | Who am I: the server's auth mode and the signed-in user (for delegated tokens, the token owner's identity). Works for any principal. | none |
| `update_profile` | Update the caller's profile. Agent tokens are refused (they may only stamp `onboarded`). | `display_name` — string or `null` to clear; `avatar_url` — string or `null` to clear; `onboarded` — boolean |
| `list_api_tokens` | List the caller's delegated agent tokens. Agent tokens refused. | none |
| `mint_api_token` | Mint a delegated agent token. Agent tokens refused. | `label` (required); `scopes` (required) — `["read"]` or `["read","write"]`; `expires_in_days` |
| `revoke_api_token` | Revoke one of the caller's tokens. Agent tokens refused. | `token_id` (required) |
| `get_storage_usage` | The caller's per-workspace storage usage. Agent tokens refused. | none |
