---
title: Install the CLI
description: Install the embra CLI on Linux and macOS with one command, with minisign signature checks.
sidebar:
  order: 0
---

```bash
curl -fsSL https://console.embra.cloud/install.sh | sh
```

The script installs `embra` into `~/.local/bin` (no sudo), on Linux and macOS, amd64 and arm64. Check: `embra --version`.

If your shell cannot find `embra`, add the line the script prints (`export PATH="$HOME/.local/bin:$PATH"`) to `~/.bashrc` or `~/.zshrc`.

## Signature check

Every release has a `checksums.txt` signed with minisign. The script always checks the sha256 of what it downloads; with [minisign](https://jedisct1.github.io/minisign/) installed it also checks the signature. To require the signature (recommended in CI):

```bash
curl -fsSL https://console.embra.cloud/install.sh | sh -s -- --require-signature
```

Embra's public key:

```
RWRQ+gb11I5WKUICOuDWjHHK6S7qz2OWWqdF4CZX/8M9DQbgKx8Gfb+l
```

Releases live at [github.com/embra-labs/cli-releases](https://github.com/embra-labs/cli-releases/releases). To check by hand:

```bash
minisign -Vm checksums.txt -P RWRQ+gb11I5WKUICOuDWjHHK6S7qz2OWWqdF4CZX/8M9DQbgKx8Gfb+l
sha256sum -c --ignore-missing checksums.txt
```

## Options

| Flag | Environment variable | What it does |
|---|---|---|
| `--dir DIR` | `EMBRA_INSTALL_DIR` | Install directory, default `~/.local/bin` |
| `--version VER` | `EMBRA_VERSION` | Install a specific version |
| `--require-signature` | `EMBRA_REQUIRE_SIGNATURE=1` | Fail if the signature cannot be checked |

Example: `curl -fsSL https://console.embra.cloud/install.sh | sh -s -- --dir /usr/local/bin --version 0.1.1`.

## Next steps

```bash
embra login                 # opens the browser to approve
embra up                    # deploy the current directory
```

See [Commands](/en/cli/lenh/). For AI agents: [AI agents](/en/huong-dan/ai-agent/).

## Update and uninstall

- Update: run the install command again. The CLI reminds you (at most once a day) when a new version exists; turn it off with `EMBRA_NO_UPDATE_CHECK=1`.
- Uninstall: `rm ~/.local/bin/embra`, then delete the config `~/.config/embra/` (holds the token) and `~/.local/state/embra/`.
