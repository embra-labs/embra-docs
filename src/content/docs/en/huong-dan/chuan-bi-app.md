---
title: Prepare your app
description: What an app needs to run on Embra, how Embra builds it, the embra.toml reference.
sidebar:
  order: 2
---

## What the app must do

| Requirement | Details |
|---|---|
| Listen on the right port | Listen on `0.0.0.0` (not `127.0.0.1`) on the port in `[deploy] port`, **3000** by default, between 1024 and 65535. Embra sets `PORT` to this port (unless you set a `PORT` secret yourself), so reading `PORT` or hardcoding that port both work |
| Have a health check path | A `GET` to `[deploy] health_path` (default `/`) must return **2xx**. A redirect (3xx) does not pass |
| Not write to disk | The filesystem is read-only. Only `/tmp` is writable (at most 256 MB, lost on restart). Store user uploads in S3 or an Embra bucket |
| Not run migrations itself | The app's database user can read and write data but cannot change the schema. Remove commands like `prisma migrate deploy` from startup. Migrations go through Embra: see [Database and migrations](/en/huong-dan/database-va-migration/) |
| Read config from env vars | `DATABASE_URL` (when you have Postgres) and one env var per secret, same name |

## Health check

On each deploy, the new version runs next to the old one.

1. Embra calls `health_path` every 2 seconds. It needs **3 consecutive 2xx** within the startup window (`startup_grace_seconds`, 60 seconds by default).
2. Pass → traffic moves to the new version. Embra watches for another 30 seconds; more than 2 failures sends traffic back to the old version.
3. Fail → the deploy stops with `HEALTHCHECK_FAILED` and the old version keeps running.

Slow startup (for example loading a large cache)? Raise `startup_grace_seconds`, up to 300.

## How Embra builds your app

- `Dockerfile` at the repo root (or under `root`) → Embra uses it. None → Embra uses **Railpack** to detect and build (Node, Python, Go…).
- Each build has at most 25 minutes and runs in its own VM.
- **Builds receive no secrets.** `[build] env` is only used during the build, never reaches the app, and must not hold secret values.
- The image must fit in your plan's disk space.
- Embra caches images, npm packages and Node, so later builds are faster.

<details>
<summary>Where the build can reach on the network</summary>

Only: GitHub (including `ghcr.io`), npm and yarn (`registry.npmjs.org`, `registry.yarnpkg.com`, `nodejs.org`), PyPI (`pypi.org`, `files.pythonhosted.org`), Docker Hub, the Alpine, Debian and Ubuntu package mirrors, and `binaries.prisma.sh`.

If the build log says `egress từ chối "<host>"` (egress denied), the build needs a host that is not open yet: email that host name to hello@embra.cloud.

</details>

## `embra.toml`

Optional file at the repo root. Without it Embra uses the defaults. Unknown fields and wrong types are errors.

```toml
# root = "apps/web"          # monorepo: the app's folder, from the repo root

[build]
# builder = "dockerfile"     # "dockerfile" or "railpack"; leave out to auto-detect
# dockerfile = "Dockerfile"  # path, relative to root
env = { VITE_SHOP_NAME = "My shop" }   # build time only, no secrets here

[deploy]
port = 3000                  # default 3000
health_path = "/healthz"     # default "/"
startup_grace_seconds = 60   # 5–300
# start = ["node", "dist/main.js"]   # replaces the image's start command
migrations = "migrations"    # folder with NNNN_name.sql files, default "migrations"
database = true              # needs Postgres: Embra creates it and sets DATABASE_URL

[processes.worker]           # background process (within plan limits)
command = ["node", "dist/worker.js"]

[cron.cleanup]               # scheduled job, UTC, at least 5 minutes apart
schedule = "0 3 * * *"
command = ["node", "dist/cleanup.js"]

[preview]
seed = "seed/preview.sql"    # sample data for PR previews
```

:::note[Adding `database = true` after the first deploy]
That works. On the next build, Embra sets up Postgres for the environment first, then deploys the new version with `DATABASE_URL`. Removing the line from `embra.toml` later does **not** detach or delete the existing database.
:::

| Field | Rule |
|---|---|
| `[build] env` | Names match `^[A-Z][A-Z0-9_]{0,63}$`, don't start with `EMBRA_`, each value at most 4 KiB |
| `[processes.<name>]` | Lowercase letters and digits, at most 16 characters, not `web` |
| `[cron.<name>]` | Standard 5-field cron, in UTC. `@hourly` and `@every` are not supported. Two runs at least 5 minutes apart |
| Workers, cron | Count follows your plan. The trial has no cron |
