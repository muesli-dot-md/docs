---
sidebar_position: 3
title: Share a document
description: Create role-scoped guest links so anyone can view, comment on, or edit a document — no account required.
---

# Share a document

Share a document by minting a guest link scoped to a role; anyone with the link can open the document without an account.

## Roles

Every share link grants one of three roles:

| Role | What the link allows |
| --- | --- |
| **Viewer — read only** | Read the document and see live cursors. Any write is rejected by the server. |
| **Commenter** | Everything a viewer can do, plus comment threads and suggested edits. |
| **Editor — full edit** | Full editing, including accepting suggestions and creating further share links. |

Role checks are enforced server-side on every connection and API call — a viewer link cannot write even if the client is modified. See [Roles and permissions](../concepts/roles-and-permissions.md) for the full model.

## Create a link from the web app

1. Open the document.
2. Click **Share** in the top bar.
3. Pick a role: **Viewer — read only**, **Commenter**, or **Editor — full edit**.
4. Click **Create link** and copy the URL that appears.

You can also share from the home screen: select a document, open its details panel, and use the **Sharing** section — it is the same role picker and **Create link** button.

Only editors of a document can share it. If you hold a lesser role you'll see "Only editors can share this document."

## What guests see

A guest opening a share link joins the live document immediately — no sign-up, no login. They appear in the presence bar as anonymous participants, see everyone's cursors, and get the capabilities of the link's role. If a guest with a viewer link tries to type, the edit never lands: the server rejects viewer writes.

> **Note:** The link itself is the credential. Anyone who has the URL gets the role it carries, so treat editor links like a password.

## Link expiry

The web app's Share menu creates links that do not expire. To mint a time-limited link, call the REST API directly with `expires_in_secs`:

```sh
curl -b "$COOKIES" -X POST https://your-server/api/documents/my-doc/share \
  -H 'content-type: application/json' \
  -d '{"role":"viewer","expires_in_secs":86400}'
```

The response contains the full `url` and the raw `token`. Once `expires_in_secs` elapses the link stops resolving and guests using it lose access. The same option is available to agents through the `create_share_link` MCP tool.

> **Warning:** A link created without an expiry stays valid indefinitely. If a link may leak, prefer creating it with an expiry.

## Sharing from the CLI

If you've linked a local file with the `muesli` CLI, you can mint a link without opening the web app:

```sh
muesli share ./notes.md --role viewer
```

See [Make any file multiplayer](make-any-file-multiplayer.md) and the [CLI reference](../reference/cli.md).

## Open-mode servers

A server running without OIDC configured is in *open mode*: there are no accounts, every connection is an anonymous editor, and the document URL itself is the share link — the **Share** endpoint is not used. See [Authentication](../self-hosting/authentication.md).

## Related

- [Comments and mentions](comments-and-mentions.md) — what commenters can do
- [Suggestions and review](suggestions-and-review.md) — reviewing guest edits
- [Workspaces](workspaces.md) — sharing with a whole team instead of link-by-link
