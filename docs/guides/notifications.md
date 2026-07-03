---
sidebar_position: 11
title: Notifications
description: The in-app inbox behind the bell, what triggers notifications, and the per-channel preference toggles.
---

# Notifications

Muesli tells you when something needs your attention — currently, when someone @-mentions you — through an in-app inbox and optional email.

## What generates a notification

Being **@-mentioned in a comment or reply** creates one notification for you. Mentions are parsed server-side when the comment is posted, and each newly mentioned person gets exactly one notification per comment. See [Comments and mentions](comments-and-mentions.md).

Notifications are per-account, so they exist only on servers with sign-in configured; an open-mode server has no inboxes.

## The bell

The bell button lives in the document top bar. An unread badge on it shows how many notifications you haven't seen (capped at "99+"); the count refreshes every few seconds while the app is open.

Click the bell to open the inbox panel:

- Each row reads like "*Alice mentioned you in «Project notes»*", with a relative timestamp. Unread rows are emphasized and marked with a dot.
- **Clicking a row marks it read and takes you to the document.**
- **Mark all read** at the top clears the whole badge at once.
- When there is nothing left, the panel says "You're all caught up."

## Notification preferences

Open **Settings → Notifications** to choose how Muesli reaches you. Preferences are a matrix of event types and delivery channels; each channel is toggled independently:

| Preference | Default | Effect |
| --- | --- | --- |
| **In-app inbox** | On | Show mention notifications in the bell menu. |
| **Email me when I'm mentioned** | On | Send an email when someone @mentions you in a comment. |

Turn off both channels to stop mention notifications entirely. Preferences are stored per user on the server, so they follow you across browsers.

## Email delivery

Email is only sent if the server has an SMTP transport configured. Self-hosters set:

```sh
MUESLI_SMTP_HOST=smtp.example.com
MUESLI_SMTP_PORT=587
MUESLI_SMTP_USERNAME=…
MUESLI_SMTP_PASSWORD=…
MUESLI_SMTP_FROM=muesli@example.com
```

Any SMTP provider works (SES, Postmark, Resend, your own relay). Without `MUESLI_SMTP_HOST`, notification emails are logged to the server console instead of being sent — handy in development, invisible to users. See [Self-hosting configuration](../self-hosting/configuration.md).

> **Note:** The email deep-links back to the document in the web app, so recipients land directly on the conversation.

## Agents have their own inbox

An AI agent authenticated with an API key reads the *agent identity's* own notifications, never its owner's — mentioning an agent notifies the agent, not you. See [Tokens and permissions](../agents/tokens-and-permissions.md).

## Related

- [Comments and mentions](comments-and-mentions.md) — how mentions work
- [Workspaces](workspaces.md) — who can be mentioned where
