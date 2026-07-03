---
sidebar_position: 1
title: CLI Reference
description: Complete reference for the muesli command-line tool — every subcommand, flag, environment variable, and local file it touches.
---

# CLI Reference

The `muesli` binary is the local agent: it links plain `.md` files on your disk to live documents on a Muesli server and keeps the two in sync. It never rewrites your files destructively and it stays out of git's way. To get the binary, see [Install the CLI](../getting-started/install-the-cli.md).

```text
Usage: muesli <COMMAND>

Commands:
  login   Sign in via the device-code flow; stores an agent token
  open    Link a markdown file and keep it live-synced
  sync    Folder sync: every .md under <dir> is linked and live-synced
  share   Create a role-scoped share link for a linked file or document id
  status  Who am I, and which files are linked
  unlink  Forget a link (the local file is never deleted)
  logout  Remove the stored token for a server
  mcp     stdio MCP transport, proxied to the server
  help    Print help for the CLI or a subcommand
```

## Global options

| Option | Description |
| --- | --- |
| `-h, --help` | Print help (also available on every subcommand) |
| `-V, --version` | Print the CLI version |

Logging goes to stderr and is controlled by `RUST_LOG` (standard `tracing` filter syntax). The default filter is `muesli=info`.

## Server address resolution

Every network-facing subcommand takes a `--server` option, resolved in this order:

1. `--server <SERVER>` on the command line
2. the `MUESLI_SERVER` environment variable
3. the default: `ws://localhost:8787/ws`

Any of `ws://`, `wss://`, `http://`, or `https://` forms are accepted and normalized: the CLI derives the HTTP base URL (e.g. `ws://localhost:8787/ws` → `http://localhost:8787`) for API calls and token storage, and the websocket base (`<http-base>/ws`) for live sync. `--server https://muesli.example.com` and `--server wss://muesli.example.com/ws` refer to the same server.

Commands that print links to the web app also take `--web`, resolved as `--web` flag → `MUESLI_WEB` env var → default `http://localhost:5173`.

## Where state lives

**Token.** `muesli login` stores a delegated agent token in the OS keychain (`keyring` service `muesli`, one entry per server HTTP base URL). Lookup order when a command needs a token:

1. the `MUESLI_TOKEN` environment variable, if set
2. the OS keychain
3. a credentials-file fallback: `<config dir>/muesli/credentials.json`, written with `0600` permissions in a `0700` directory (macOS: `~/Library/Application Support/muesli/`, Linux: `~/.config/muesli/`)

Set `MUESLI_TOKEN_STORE=file` to skip the keychain entirely and use only the credentials file (useful for CI and headless machines).

**Link index.** The file-path ↔ document mapping lives in SQLite at `<data dir>/muesli/index.db` (macOS: `~/Library/Application Support/muesli/index.db`, Linux: `~/.local/share/muesli/index.db` or `$XDG_DATA_HOME/muesli/index.db`, Windows: `%APPDATA%\muesli\index.db`). Alongside it the CLI maintains `links.json`, a generated read-only mirror of the index kept for older integrations — its first entry is a `_generated` marker; do not edit it. A `links.json` from older CLI versions is migrated into `index.db` on first use and kept as `links.json.migrated`.

## Environment variables

| Variable | Effect |
| --- | --- |
| `MUESLI_SERVER` | Default for `--server` on all commands that take it |
| `MUESLI_WEB` | Default for `--web` (share-link base URL) |
| `MUESLI_TOKEN` | Token override; takes precedence over the keychain and credentials file |
| `MUESLI_TOKEN_STORE` | `file` = never touch the OS keychain; use the credentials file |
| `RUST_LOG` | Log filter (default `muesli=info`) |

---

## muesli login

```text
muesli login [OPTIONS]
```

Sign in using the OAuth device-code flow against the server's OIDC issuer, then store a delegated agent token. The CLI prints a verification URL (and opens your browser), waits for approval, and saves the token keyed by the server's HTTP base URL. The agent identity is labeled `muesli-cli@<hostname>`.

If the server runs in open mode (no authentication), `login` reports that no sign-in is needed and exits successfully.

| Option | Env | Default | Description |
| --- | --- | --- | --- |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Server to sign in to |

```bash
muesli login --server wss://muesli.example.com/ws
```

## muesli open

```text
muesli open [OPTIONS] <FILE>
```

Link one markdown file to a document and keep it live-synced until you stop the command. The file is created if missing. Local edits (from any editor) are pushed as text diffs; remote edits are materialized back to disk. The parent directory is watched, so editors that save via rename are handled. See [Make any file multiplayer](../guides/make-any-file-multiplayer.md).

Press Ctrl-C to stop: the session flushes any pending remote state to disk before exiting, and the file stays exactly as it is.

| Argument / Option | Env | Default | Description |
| --- | --- | --- | --- |
| `<FILE>` | — | — | The markdown file to sync (created if missing) |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Sync server websocket base URL |
| `--doc <DOC>` | — | file stem | Document id (room name) |
| `--web <WEB>` | `MUESLI_WEB` | `http://localhost:5173` | Web app base URL used to print the share link |

```bash
muesli open notes/meeting.md --doc team-meeting
```

## muesli sync

```text
muesli sync [OPTIONS] <DIR>
```

Folder sync, Drive-desktop-style: every `.md` under `<DIR>` (recursively) is linked and live-synced, and a new `.md` dropped into the tree auto-links. Hidden directories, `node_modules`, and `target` are skipped. See [Sync a folder](../guides/sync-a-folder.md).

Document slugs are derived from each file's path relative to `<DIR>`: path components are joined with `-`, the `.md` extension is dropped, and the result is slugified (lowercase ASCII letters and digits; everything else collapses to a single `-`). With `--prefix team`, `sub/notes.md` becomes `team-sub-notes`. Colliding slugs get a numeric suffix (`-2`, `-3`, …); an empty result becomes `untitled`.

The daemon holds at most 64 concurrent websocket connections. With more files than that, sessions run lazily: an idle session disconnects after 30 seconds and releases its slot, then reconnects on the next local or remote change.

**Exit behavior.** Ctrl-C triggers a clean shutdown: every session with unmaterialized remote state flushes to disk first, then the daemon waits for all sessions to finish and reports `sync stopped — N file(s); index and server docs retained`. Nothing is unlinked and nothing is deleted, locally or on the server.

| Argument / Option | Env | Default | Description |
| --- | --- | --- | --- |
| `<DIR>` | — | — | The folder to sync (recursive) |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Sync server websocket base URL |
| `--prefix <PREFIX>` | — | none | Prefix prepended to derived doc slugs |
| `--web <WEB>` | `MUESLI_WEB` | `http://localhost:5173` | Web app base URL (the printed link base) |

```bash
muesli sync ~/notes --prefix personal --server wss://muesli.example.com/ws
```

## muesli share

```text
muesli share [OPTIONS] <TARGET>
```

Create a role-scoped share link. `<TARGET>` is either a linked markdown file (resolved through the link index) or a raw document id. Roles are `viewer`, `commenter`, and `editor`.

On a server with authentication you must be signed in. On an open server no token is needed — the printed link is simply `<web>/#<doc>`. Passing a file that exists but is not linked is an error; run `muesli open <file>` first.

| Argument / Option | Env | Default | Description |
| --- | --- | --- | --- |
| `<TARGET>` | — | — | A linked markdown file, or a document id |
| `--role <ROLE>` | — | `editor` | Role granted by the link |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Server that hosts the document |
| `--web <WEB>` | `MUESLI_WEB` | `http://localhost:5173` | Web app base URL for the printed link |

```bash
muesli share ./notes.md --role viewer
```

## muesli status

```text
muesli status [OPTIONS]
```

Print the server address, whether you are signed in (or that the server runs in open mode, or is unreachable), and every linked file with its document id, last-synced time (UTC), and a marker if the local file is missing.

| Option | Env | Default | Description |
| --- | --- | --- | --- |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Server to query |

```bash
muesli status
```

## muesli unlink

```text
muesli unlink <FILE>
```

Forget the link for `<FILE>`: the entry is removed from the local index. The local file stays exactly as it is — it is never deleted or modified — and the server-side document is untouched. Unlinking a file that was never linked is not an error.

| Argument | Description |
| --- | --- |
| `<FILE>` | The previously linked markdown file |

```bash
muesli unlink notes/meeting.md
```

## muesli logout

```text
muesli logout [OPTIONS]
```

Remove the stored token for a server, from the OS keychain and the credentials-file fallback. Tokens for other servers are untouched.

| Option | Env | Default | Description |
| --- | --- | --- | --- |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Server whose token to remove |

```bash
muesli logout --server wss://muesli.example.com/ws
```

## muesli mcp

```text
muesli mcp [OPTIONS]
```

Run the stdio MCP transport for agent integrations: newline-delimited JSON-RPC messages on stdin are proxied to the server's `POST /mcp` endpoint with the stored token, and responses come back on stdout as single-line JSON. stderr carries logs only — stdout stays pure protocol. See [MCP setup](../agents/mcp-setup.md).

Behavior details:

- Notifications (messages without an `id`) produce no stdout output.
- If the server is unreachable, requests get a JSON-RPC error response (code `-32000`) so the client is never left hanging.
- A `401` from the server prints a hint on stderr to run `muesli login`.
- On an open server the proxy works without a token; the missing-token notice on stderr is informational.

MCP client configuration: command `muesli`, args `["mcp"]`.

| Option | Env | Default | Description |
| --- | --- | --- | --- |
| `--server <SERVER>` | `MUESLI_SERVER` | `ws://localhost:8787/ws` | Server whose `/mcp` endpoint to proxy to |

```json
{
  "mcpServers": {
    "muesli": {
      "command": "muesli",
      "args": ["mcp"],
      "env": { "MUESLI_SERVER": "wss://muesli.example.com/ws" }
    }
  }
}
```

> **Note:** `muesli mcp` uses the same token store as every other command. Sign in with `muesli login` first on authenticated servers, or set `MUESLI_TOKEN` in the MCP client's environment.
