---
sidebar_position: 4
title: Comments and mentions
description: Anchored comment threads, replies, resolving, @-mentions, and the linked-mentions section of the comments sidebar.
---

# Comments and mentions

Attach discussion threads to exact spans of text, pull people in with @-mentions, and keep every thread even as the document changes underneath it.

## Start a thread

1. Open the **Comments** tab of the document sidebar.
2. Select the text you want to discuss in the editor.
3. Click the **Comment** affordance that appears next to the selection (also available as **Add comment** in the toolbar).
4. Write your comment and submit it.

The selected text gets a highlight, and the thread appears as a card in the Comments panel. Clicking the highlight in the editor scrolls the sidebar to its thread; clicking a thread card highlights its text in the editor.

Commenting requires the **commenter** role or higher — workspace members always have it, and guests need at least a commenter [share link](share-a-document.md).

## Reply

Each thread card has a **Reply…** field at the bottom. Type and press Enter to send. Replies are indented under the first comment so the thread reads as one conversation.

## Resolve and reopen

- Click the checkmark on a thread (**Resolve thread**) when the discussion is done. Resolved threads leave the main list and collapse into a **Resolved (n)** section at the bottom of the panel — nothing is deleted.
- To bring one back, expand the resolved section and click the circular-arrow button (**Reopen thread**) on the thread's first comment.

## How anchors survive edits

A thread is anchored to a *position in the document's edit history*, not to line and column numbers. Muesli stores the anchor as a relative position in the underlying CRDT, so the highlight follows its text through concurrent edits, insertions above it, and moves — even edits made while you were offline.

If the anchored text itself is deleted, the thread is not lost: it moves to an **On deleted text** section in the panel, with the note that the text the comments were anchored to was deleted and the threads are preserved.

## @-mentions

Type `@` in any comment or reply to open the member picker; keep typing to filter by name, then pick someone. The mention renders as a colored chip matching that person's presence color.

- You can mention anyone who has access to the document — workspace members and people it was explicitly shared with.
- Mentioning someone sends them a notification (in-app, and by email if enabled) — see [Notifications](notifications.md).
- Threads that mention you are marked **Mentions you** so they stand out.

## Linked mentions (backlinks)

At the bottom of the Comments panel, the **Linked mentions (n)** section lists every document that links to the open one via wikilinks like `[[this-doc]]` or relative Markdown links. Click an entry to jump to that document.

If nothing links here yet, the section explains how to create the first backlink. See [Wikilinks and the graph](wikilinks-and-the-graph.md) for the full linking model.

## Comments from agents

AI agents connected over MCP can read, add, and reply to comments with the same role rules as humans. Resolving comments is an approval action that agents may be blocked from performing, depending on server policy — see [Agent policies](../agents/policies.md).

> **Note:** Comments live alongside the document on the server; they are not written into the `.md` file. The Markdown file in your storage stays clean.

## Related

- [Suggestions and review](suggestions-and-review.md) — proposing edits instead of discussing them
- [Notifications](notifications.md) — how mention alerts are delivered
- [Share a document](share-a-document.md) — giving guests comment access
