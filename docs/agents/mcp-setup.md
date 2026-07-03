---
sidebar_position: 2
title: Connect an MCP Client
description: Connect any MCP client to Muesli through the muesli CLI's stdio proxy or directly over HTTP with an API token.
---

# Connect an MCP Client

Muesli exposes its agent surface as an MCP server; you connect either through the `muesli` CLI's stdio proxy or directly over HTTP.

## Option 1: the stdio proxy (recommended)

If you have the [CLI installed](../getting-started/install-the-cli.md), the whole setup is two steps and your config never contains a URL or a token.

Sign in once (a device-code flow against your server's identity provider; the resulting token is stored in your OS keychain):

```sh
muesli login
```

Then add Muesli to your MCP client's configuration:

```json
{ "mcpServers": { "muesli": { "command": "muesli", "args": ["mcp"] } } }
```

`muesli mcp` reads newline-delimited JSON-RPC on stdin and proxies each message to the server's `POST /mcp` with your stored token. It targets the same server as the rest of the CLI (`--server` flag or the `MUESLI_SERVER` environment variable; the default is your local dev server).

For Claude Code specifically:

```sh
claude mcp add muesli -- muesli mcp
```

> **Note:** In headless environments without a keychain (CI, containers), set the token directly via the `MUESLI_TOKEN` environment variable — it takes precedence over the keychain.

## Option 2: direct HTTP

Any MCP client that speaks streamable HTTP can talk to the server directly:

- Endpoint: `POST /mcp` on your server's base URL
- Auth: `Authorization: Bearer mua_<token>` header ([mint a token](tokens-and-permissions.md))
- Protocol: JSON-RPC 2.0, **one request per POST** (`GET /mcp` answers 405; there is no SSE stream)
- Methods: `initialize`, `ping`, `tools/list`, `tools/call`

A generic client configuration looks like:

```json
{
  "mcpServers": {
    "muesli": {
      "type": "http",
      "url": "https://your-server.example/mcp",
      "headers": { "Authorization": "Bearer mua_..." }
    }
  }
}
```

This exact snippet, prefilled with your server URL and fresh token, is shown once when you [create an API key in the web app's settings](tokens-and-permissions.md).

You can also drive the endpoint by hand:

```sh
curl -s https://your-server.example/mcp \
  -H "content-type: application/json" \
  -H "authorization: Bearer mua_..." \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

```sh
curl -s https://your-server.example/mcp \
  -H "content-type: application/json" \
  -H "authorization: Bearer mua_..." \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",
       "params":{"name":"read_document","arguments":{"slug":"team-notes"}}}'
```

## Protocol details

- **Supported protocol versions:** `2024-11-05`, `2025-03-26`, and `2025-06-18`. If the client proposes an unknown version, the server answers with `2025-03-26`.
- **Notifications** (JSON-RPC messages without an `id`, method prefixed `notifications/`) are acknowledged with HTTP 202 and no body.
- **Tool failures** come back as ordinary tool-call results with `isError: true` and a plain-text explanation — never as JSON-RPC protocol errors. Protocol errors are reserved for malformed requests and unknown methods or tools.

## Authentication modes

- **Identity-enabled servers** (the normal case): every MCP request needs a principal — a `mua_` Bearer token or a browser session cookie. A missing or invalid token gets a 401 telling you to run `muesli login`.
- **Open-mode servers** (no identity provider configured, e.g. a local solo instance): `POST /mcp` needs **no token at all** — the endpoint admits an anonymous agent. `muesli mcp` works there without a login; it just warns that no token is stored.

Per-document authorization always happens inside each tool, under the same [roles and permissions](../concepts/roles-and-permissions.md) as human access.

## Next steps

- Browse the [tool reference](tool-reference.md) to see everything an agent can do.
- Read [Policies](policies.md) to understand when direct edits become suggestions.
