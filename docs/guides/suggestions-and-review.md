---
sidebar_position: 5
title: Suggestions and review
description: Propose edits in Suggesting mode, review pending change sets, and accept or reject them.
---

# Suggestions and review

Suggest mode lets anyone with comment access propose edits that editors review — proposed changes never touch the document (or the `.md` file in your storage) until someone accepts them.

## Switch to Suggesting

The mode picker sits at the right end of the formatting toolbar and shows the current mode:

- **Editing** — your keystrokes change the document directly.
- **Suggesting** — direct editing is paused; you queue proposed edits instead.

Click the picker and choose **Suggesting**. A "suggest mode" badge reminds you that editing is paused.

## Queue and submit suggestions

1. In Suggesting mode, select the text you want to change.
2. Click the **Suggest** affordance next to the selection.
3. Pick the operation — **Replace selection**, **Insert after selection**, or **Delete selection** — type the new text if there is any, and click **Add to suggestion**.
4. Repeat for as many edits as belong together. They collect in the **Suggestions** sidebar tab under **Queued edits (n)**, where you can remove any of them before sending.
5. Optionally add a note, then click **Submit suggestion** (or **Submit suggestions**).

Everything you submit together becomes one *change set*: a single reviewable unit that is accepted or rejected as a whole.

Creating suggestions requires the **commenter** role or higher, so guests with a commenter [share link](share-a-document.md) can propose edits without being able to change anything themselves.

## How suggestions render

The **Suggestions** panel lists each pending change set as a card showing the author, when it was submitted, the note, and every edit in the set as old text next to the proposed new text. Clicking a card highlights the affected range in the editor.

If the document has moved on since a suggestion was made and its original text was changed or deleted, the edit is marked **detached** — it can no longer be applied automatically, and accepting the set reports it as a conflict instead of guessing.

## Accept or reject

Each pending card has **Accept** and **Reject** buttons that act on the whole change set:

- **Accept** applies every edit in the set to the document as one atomic change, attributed to the accepting editor in [version history](version-history.md) with a "suggestion" badge. Edits whose anchored text is gone, or that overlap an earlier accepted edit, are skipped and reported as conflicts.
- **Reject** discards the set without touching the document.

Who can do what:

| Action | Required role |
| --- | --- |
| Create suggestions | Commenter or higher |
| Accept a suggestion or change set | Editor |
| Reject a suggestion or change set | Editor, or the suggestion's own author |

The REST API and MCP tools additionally support accepting or rejecting individual suggestions within a set.

## Agent edits arrive as suggestions

When an AI agent edits a document over MCP while a human is present in it, the server (by default, `MUESLI_AGENT_DIRECT=auto`) downgrades the agent's direct edits to suggestions — so live collaborators review agent changes instead of colliding with them. Agent-authored suggestions are marked with an agent indicator next to the author's name.

Whether agents may *accept* suggestions themselves is a separate policy switch that is off by default. See [Agent policies](../agents/policies.md).

> **Note:** Suggestions are unavailable when the server runs in volatile mode (no database), since there is nowhere to keep them.

## Related

- [Comments and mentions](comments-and-mentions.md) — discuss instead of proposing edits
- [Version history](version-history.md) — where accepted change sets land
- [Roles and permissions](../concepts/roles-and-permissions.md)
