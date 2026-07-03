---
sidebar_position: 10
title: Workspaces
description: Create workspaces, invite members, manage roles, and rename or delete a workspace safely.
---

# Workspaces

A workspace is a shared home for documents and people: members see its documents, and its files live in storage the workspace owns.

## Your personal workspace

Signing in for the first time creates your account and a **personal workspace**. It is yours alone — it can't be renamed or left, and it has only you as a member. Documents you create outside any shared workspace live here.

## Create a workspace

1. On the home screen, open the **Workspaces** section and click **New workspace**.
2. Name it — you can rename it later.
3. Pick where its files should live. Muesli doesn't store your documents on its server; the wizard connects an S3-compatible bucket, Google Drive, a Git repository, or SharePoint. See [Storage backends](../concepts/storage-backends.md).

When the wizard finishes, you are the workspace's admin and can start inviting people.

## Invite members

1. Open **Settings**, pick the workspace, and go to **Members**.
2. Enter the person's email, choose a role (**admin** or **member**), and click **Invite**.

Two things can happen:

- **They already have an account on this server** — they're added immediately ("Added their@email.com.").
- **They don't yet** — a pending invite is stored and claimed automatically the first time they sign in ("Invite will be claimed when they first sign in.").

Pending invites are listed in the Members section, where an admin can **Revoke** any of them before they're claimed.

## Roles

| Role | What it grants |
| --- | --- |
| **member** | Full editor access to every document in the workspace. |
| **admin** | Everything a member has, plus: rename the workspace, manage members and invites, connect storage, read the audit log, delete the workspace. |

Admins change a member's role with the role selector on their row in **Members**, and remove members with **Remove from workspace**.

> **Note:** Every workspace needs at least one admin. The last admin can never be demoted or removed — the server rejects the change — so promote someone else first if you're stepping back. This also blocks the last admin from leaving.

Per-document roles (viewer / commenter / editor) for people *outside* the workspace are handled by [share links](share-a-document.md); see [Roles and permissions](../concepts/roles-and-permissions.md) for how the two interact.

## Rename a workspace

**Settings → General**, edit the **Name** field, and click **Save**. Admin only — other members see the field disabled with "Only workspace admins can change these settings."

## Leave a workspace

**Settings → General → Danger Zone → Leave workspace** removes you from a shared workspace; you lose access to its documents. Unavailable for your personal workspace, and blocked while you're the only admin.

## Delete a workspace

Deleting a workspace permanently removes the workspace **and every document, comment, and suggestion in it, for all members**. There is no undo.

1. Go to **Settings → General** as an admin.
2. In the **Danger Zone**, click **Delete workspace**.
3. Type the workspace's exact name into the confirmation prompt. A mismatch cancels the deletion ("The name didn't match — nothing was deleted.").

> **Warning:** This is irreversible and affects every member. Everything the server holds for the workspace is purged; `.md` files already materialized to your connected storage are not touched by the deletion — clean those up in your storage if you want them gone too.

## Related

- [Share a document](share-a-document.md) — access for people outside the workspace
- [Storage backends](../concepts/storage-backends.md) — where a workspace's files live
- [Self-hosting: authentication](../self-hosting/authentication.md) — accounts, SSO, and invite claiming
