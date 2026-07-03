---
slug: /
sidebar_label: Overview
sidebar_position: 1
title: Muesli Documentation
description: Live multiplayer editing for plain markdown files — docs for the web app, desktop app, CLI, agents, and self-hosting.
---

# Muesli Documentation

Muesli is Google-Docs-style collaboration for plain `.md` files: real-time multiplayer
editing where the markdown file in your storage stays canonical, AI agents are first-class
collaborators, and the whole thing is self-hostable.

New here? Start with [What is muesli?](getting-started/what-is-muesli.md), then the
[Quickstart](getting-started/quickstart.md).

## Getting started

- [What is muesli?](getting-started/what-is-muesli.md) — the mental model in five minutes
- [Quickstart](getting-started/quickstart.md) — run a server and edit together
- [Install the CLI](getting-started/install-the-cli.md) — `curl | sh`, Homebrew, or from source
- [The desktop app](getting-started/desktop-app.md) — local-first editing over a folder

## Guides

- [Make any file multiplayer](guides/make-any-file-multiplayer.md) — `muesli open ./notes.md`
- [Sync a folder](guides/sync-a-folder.md) — Drive-style live sync for a whole tree
- [Share a document](guides/share-a-document.md) — role-scoped guest links
- [Comments and mentions](guides/comments-and-mentions.md)
- [Suggestions and review](guides/suggestions-and-review.md)
- [Version history](guides/version-history.md)
- [Wikilinks and the graph](guides/wikilinks-and-the-graph.md)
- [Search](guides/search.md)
- [Dictation](guides/dictation.md) — on-device speech-to-text (desktop, macOS)
- [Workspaces](guides/workspaces.md) — members, roles, invites
- [Notifications](guides/notifications.md)

## Concepts

- [Architecture](concepts/architecture.md) — CRDT over markdown, rooms, materialization
- [Documents and identity](concepts/documents-and-identity.md) — slugs, ids, trash vs purge
- [Roles and permissions](concepts/roles-and-permissions.md)
- [Storage backends](concepts/storage-backends.md) — where the canonical file lives

## Storage backends

- [Local files](storage/local-files.md) · [S3](storage/s3.md) ·
  [GitHub and Gitea](storage/github-and-gitea.md) ·
  [Google Drive](storage/google-drive.md) · [SharePoint](storage/sharepoint.md)

## Agents

- [Overview](agents/overview.md) — agents as first-class collaborators
- [MCP setup](agents/mcp-setup.md) — connect any MCP client in two lines
- [Tool reference](agents/tool-reference.md) — all 52 tools
- [Tokens and permissions](agents/tokens-and-permissions.md)
- [Policies](agents/policies.md) — suggestion downgrade and gated actions

## Self-hosting

- [Deploy](self-hosting/deploy.md) — one image behind Traefik with Let's Encrypt
- [Configuration](self-hosting/configuration.md) — the environment variable reference
- [Authentication](self-hosting/authentication.md) — OIDC setup and open mode
- [Enterprise](self-hosting/enterprise.md) — audit log and per-workspace SSO

## Reference

- [CLI reference](reference/cli.md) — every `muesli` command and flag
