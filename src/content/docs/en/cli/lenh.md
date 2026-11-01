---
title: Command list
description: The commands of the embra CLI.
---

:::note[CLI sign-in is not available yet]
`embra login` needs an approval page in the browser, and that page is not enabled for customers yet. Meanwhile, everything can be done on the web: see [Quick start](/en/bat-dau/bat-dau-nhanh/).
:::

Run `embra <command> --help` to see every flag. Add `--json` for machine-readable output.

## Account and workspace

| Command | What it does |
|---|---|
| `embra login` | Sign in through the browser and get a token carrying your role |
| `embra login --agent` | Request an `agent` token for `embra mcp` |
| `embra logout` | Remove the token from the config |
| `embra workspace show` | Show the workspace and the token's permissions |
| `embra token create --scope <dev\|viewer\|agent\|ci> --name <name> --ttl <ttl>` | Create a token (printed once). `--ttl` is required, at most `90d` |
| `embra token list` / `revoke <token_id>` | List or revoke tokens |
| `embra members list` | List members and invitations (Owner, Admin). Inviting, changing roles and removing: on the web |

## Projects and environments

| Command | What it does |
|---|---|
| `embra project create <slug>` / `list` | Create / list projects |
| `embra env create <project> <slug>` / `list <project>` | Create / list environments |
| `embra github connect` | Connect GitHub |
| `embra source set` | Link an environment to a repo + branch through the installed GitHub App |

## Build and deploy

| Command | What it does |
|---|---|
| `embra up [directory]` | Upload a directory, build and deploy |
| `embra build` | Build from the linked repo; when the build finishes, a deploy plan is created |
| `embra deploy` | Create a deploy plan from `embra.json` and an image pinned by digest |
| `embra approve <op_id> --binding <sha256:…>` | An Owner or Admin approves a plan they have reviewed |
| `embra cancel <op_id>` | Cancel an operation that has not started running |
| `embra rollback` | Put the code back to the previous release |
| `embra plan` | Rehearse migrations on a copy of the data, without deploying |
| `embra status [op_id]` / `embra wait <op_id>` | Status / wait until an operation reaches a final state |
| `embra operation get <op_id>` | Show the status of one operation |
| `embra events` | The workspace's event stream |
| `embra schema` | Print the JSON Schema of `embra.json` |

`embra.json` is only used by `embra deploy`, when you already have a built image. Deploys from GitHub and `embra build` read `embra.toml` in the repo (see [Prepare your app](/en/huong-dan/chuan-bi-app/)).

## Postgres

| Command | What it does |
|---|---|
| `embra db create` | Set up a dedicated Postgres for the environment |
| `embra db url` | Print the runtime role's connection string (contains the password) |
| `embra db verify` | Check that backups can be restored |
| `embra db restore-points` | The time range you can restore to (PITR) |
| `embra db restore` | Restore to a point in time; switches only after an Owner or Admin approves |
| `embra db import --env <project>/<env> <file>` | Import data from a `pg_dump --data-only` file (gzip allowed). Target tables must be empty; production waits for an Owner or Admin to approve. See [Move an existing app](/en/huong-dan/chuyen-app-co-san/) |
| `embra db undo start` / `run` / `fix` … | Row-level undo: build a copy at a point in time, compare with production, generate SQL fix files (never applied automatically). See `embra db undo --help` |

## Secrets, logs, metrics

| Command | What it does |
|---|---|
| `embra secret set KEY` | Set a secret, value read from stdin |
| `embra secret list` | List secrets (without values) |
| `embra secret unset KEY --version N` | Revoke one version of a secret |
| `embra logs` | Logs of the app (`--env`) or of a build (`--build <op_id>`) |
| `embra metrics` | CPU, RAM, HTTP, Postgres with deploy/migration markers |
| `embra size <project>/<env> [<size>]` | Show app size and resources; add a size (e.g. `256MiB`) to set the production app size, applied on the next deploy |

## Delete and export

| Command | What it does |
|---|---|
| `embra export --env <project>/<env>` | Export an app + data bundle to run elsewhere (Owner, Admin) |
| `embra delete <project>/<env> --confirm <env-slug>` | Delete an environment, cannot be undone (Owner, Admin) |
| `embra delete --confirm <workspace-name>` | Delete the whole workspace, cannot be undone (Owner only) |

Exports and deleting production need a real person: do it on the web, or within 12 hours of `embra login`. See [Members and permissions](/en/workspace/phan-quyen/#actions-that-need-a-real-person).

## Other

| Command | What it does |
|---|---|
| `embra version` | Print the embra version |
