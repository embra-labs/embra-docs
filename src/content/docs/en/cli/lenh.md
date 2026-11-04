---
title: Command list
description: The commands of the embra CLI.
---

Not installed yet? See [Install the CLI](/en/cli/cai-dat/). Then `embra login`: the CLI prints a code and a URL; open the URL, enter the code, approve.

Run `embra <command> --help` to see every flag. Add `--json` for machine-readable output.

## Account and workspace

| Command | What it does |
|---|---|
| `embra login` | Sign in through the browser and get a token carrying your role |
| `embra login --agent` | Request an `agent` token for `embra mcp` |
| `embra login --profile <name>` | Sign in into a separate profile (one token per workspace, e.g. each client's workspace). Switch workspace on the web before approving |
| `embra profile list` / `use <name>` / `remove <name>` | List, switch, remove profiles on this machine. One command with another profile: `embra --profile <name> …` or `EMBRA_PROFILE` |
| `embra login --with-token < token.txt` | Sign in with an existing token (CI, no terminal). Without a terminal and without this flag, the CLI fails at once |
| `embra logout` | Remove the token from the config |
| `embra workspace show` | Show the workspace and the token's permissions |
| `embra workspace rename <new name>` | Rename the workspace (owner only). The ID, app addresses and tokens stay the same |
| `embra token create --scope <dev\|viewer\|agent\|ci> --name <name> --ttl <ttl>` | Create a token (printed once). `--ttl` is required, at most `90d` |
| `embra token list` / `revoke <token_id>` | List or revoke tokens |
| `embra members list` | List members and invitations (Owner, Admin). Inviting, changing roles and removing: on the web |

## Projects and environments

| Command | What it does |
|---|---|
| `embra project create <slug>` / `list` | Create / list projects |
| `embra env create <project> <slug>` / `list <project>` | Create / list environments |
| `embra env pause <project>/<env>` / `resume <project>/<env>` | Pause the app (data kept, backups kept) / run the active release again, starting the database too if it is stopped |
| `embra github connect` | Connect GitHub |
| `embra source set` | Link an environment to a repo + branch through the installed GitHub App |
| `embra link <project>/<env>` / `embra unlink` | Tie the directory to an environment (writes `.embra/link.json`; `embra up` writes it too) / remove it |

You can omit `--env` when the directory (or a parent inside the same repo) has `.embra/link.json`, or when `EMBRA_ENV=<project>/<env>` is set. Order: `--env` > `EMBRA_ENV` > `link.json`. Commands that delete or overwrite data (`rollback`, `db restore`, `db import`, `db start`/`stop`, `env pause`/`resume`, `export`, `secret unset`, `env delete`) always need an explicit `--env`.

## Build and deploy

| Command | What it does |
|---|---|
| `embra up [directory]` (`--detach`: exit once the build exists) | Upload a directory, build and deploy |
| `embra build` | Build from the linked repo; when the build finishes, a deploy plan is created |
| `embra deploy` | Create a deploy plan from `embra.json` and an image pinned by digest |
| `embra approve <op_id> --binding <sha256:…>` | An Owner or Admin approves a plan they have reviewed |
| `embra cancel <op_id>` | Cancel an operation that has not started running |
| `embra rollback [--to <release_id>]` | Roll code back to the previous release, or an older one. See [Rollback](/en/huong-dan/rollback-va-khoi-phuc/) |
| `embra plan` | Rehearse migrations on a copy of the data, without deploying |
| `embra status [op_id]` / `embra wait <op_id>` | Status / wait until an operation reaches a final state |
| `embra operation get <op_id>` | Show the status of one operation |
| `embra events` | The workspace's 20 latest events (`--limit`, `--since <seq>`, `--follow` to keep watching) |
| `embra schema` | Print the JSON Schema of `embra.json` |

`embra.json` is only used by `embra deploy`, when you already have a built image. Deploys from GitHub and `embra build` read `embra.toml` in the repo (see [Prepare your app](/en/huong-dan/chuan-bi-app/)).

## Postgres

| Command | What it does |
|---|---|
| `embra db create` | Set up a dedicated Postgres for the environment |
| `embra db url` | Print the runtime role's connection string (contains the password) |
| `embra db verify` | Check that backups can be restored |
| `embra db stop` / `db start` | Stop the database (the app must be paused; data and backups kept) / start it again; the app stays paused until `embra env resume` |
| `embra db restore-points` | The time range you can restore to (PITR) |
| `embra db restore` | Restore to a point in time; switches only after an Owner or Admin approves |
| `embra db import --env <project>/<env> <file>` | Import data from a `pg_dump --data-only` file (gzip allowed). Target tables must be empty; production waits for an Owner or Admin to approve. See [Move an existing app](/en/huong-dan/chuyen-app-co-san/) |
| `embra db undo start` / `run` / `fix` … | Row-level undo: build a copy at a point in time, compare with production, generate SQL fix files (never applied automatically). See [Row-level undo](/en/huong-dan/undo-tung-dong/) |

## Secrets, logs, metrics, app size

| Command | What it does |
|---|---|
| `embra secret set KEY` | Set a secret, value read from stdin |
| `embra secret import --file .env` | Set many secrets from a `.env` file at once (all or nothing; `--dry-run` lists the names only) |
| `embra secret list` | List secrets (without values) |
| `embra secret unset KEY --version N` | Revoke one version of a secret |
| `embra logs` | Logs of the app (`--env`) or of a build (`--build <op_id>`) |
| `embra metrics` | CPU, RAM, HTTP, Postgres with deploy/migration markers |
| `embra env size <project>/<env> [<size>]` | Show app size and resources; add a size (e.g. `256MiB`) to set the production app size, applied on the next deploy |

## Delete and export

| Command | What it does |
|---|---|
| `embra export --env <project>/<env>` | Export an app + data bundle to run elsewhere (Owner, Admin) |
| `embra env delete <project>/<env> --confirm <env-slug>` (add `--dry-run` to preview) | Delete an environment, cannot be undone (Owner, Admin) |
| `embra workspace delete --confirm <workspace-name>` | Delete the whole workspace, cannot be undone (Owner only) |

`embra rollback`, `embra db restore` and `embra env delete` accept `--dry-run`: the CLI only reads and prints what it would do (`dry_run: true`) and sends nothing. Permissions and migrations are still checked by the server on the real run.

Exports and deleting production need a real person: do it on the web, or within 12 hours of `embra login`. See [Members and permissions](/en/workspace/phan-quyen/#actions-that-need-a-real-person).

## Other

| Command | What it does |
|---|---|
| `embra version` (or `embra --version`) | Print the embra version |
| `embra commands` | Print every command, flag and exit code as JSON (for AI agents) |
| `--field <path>` (global flag) | Print only one value of the JSON result, e.g. `--field url`. See [Exit codes and JSON](/en/cli/exit-code-va-json/) |
