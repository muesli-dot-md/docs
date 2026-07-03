---
sidebar_position: 3
title: Install the CLI
description: Install the muesli command-line tool with the install script, Homebrew, a release download, or from source.
---

# Install the CLI

The `muesli` CLI is the sync bridge between Markdown files on your disk and live documents — install it with the script, Homebrew, a release download, or from source.

## Install script (macOS and Linux)

```sh
curl -fsSL https://muesli.md/install.sh | sh
```

The script downloads the latest release binary from GitHub for your platform (macOS arm64/x64, Linux x64/arm64) and installs it to `~/.local/bin` by default. If the install directory is not on your `PATH`, the script tells you what to add.

Two environment variables adjust the behavior:

```sh
MUESLI_VERSION=v0.3.0 curl -fsSL https://muesli.md/install.sh | sh   # pin a version
MUESLI_INSTALL_DIR=/usr/local/bin curl -fsSL https://muesli.md/install.sh | sh   # change the destination
```

## Homebrew (macOS and Linux)

```sh
brew install muesli-dot-md/tap/muesli
```

## Windows

Download the Windows `.zip` from the [releases page](https://github.com/muesli-dot-md/muesli/releases), extract it, and put `muesli.exe` somewhere on your `PATH`.

## From source

With the Rust toolchain installed, build from a clone of the repository:

```sh
cargo build --release -p muesli-cli
```

The binary lands at `target/release/muesli`; copy it onto your `PATH`.

## Verify the installation

```sh
muesli --version
```

This prints the installed version. If the command is not found, make sure the install directory (by default `~/.local/bin`) is on your `PATH` and restart your shell.

## First run

The fastest way to see what the CLI does is to make a file on your disk multiplayer:

```sh
muesli open ./notes.md
```

This links the file to a live document and prints a share link — edits in the web app land in the file, and edits to the file from any editor merge live into the room. The full walkthrough, including signing in to an auth-enabled server with `muesli login`, is in [Make any file multiplayer](../guides/make-any-file-multiplayer.md).

## Next steps

- [Make any file multiplayer](../guides/make-any-file-multiplayer.md) — the core CLI workflow.
- [Sync a folder](../guides/sync-a-folder.md) — Drive-style live sync for a whole tree of `.md` files.
- [CLI reference](../reference/cli.md) — every command and flag.
