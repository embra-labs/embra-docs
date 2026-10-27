---
title: Prepare your app
description: What an app needs to run on Embra, how Embra builds it, and the embra.toml reference.
sidebar:
  order: 2
---

## What the app must do

| Requirement | Details |
|---|---|
| Listen on the right port | Listen on `0.0.0.0` (not `127.0.0.1`) on the port set in `[deploy] port`, **3000** by default, between 1024 and 65535. Embra sets a `PORT` variable to this port (unless you set a `PORT` secret yourself), so reading `PORT` or listening on that fixed port both work; you can also fix it in `embra.toml`. |
| Have a health-check path | A `GET` to `[deploy] health_path` (default `/`) must return **2xx**. A redirect (3xx) does not count as passing. |
| Not write to disk | The file system is read-only. Only `/tmp` is writable (at most 256 MB, lost when the app restarts). Store uploaded files in S3 or an Embra bucket. |
| Not run migrations itself | The app's database account can read and write data but cannot change the schema. Remove commands like `prisma migrate deploy` from startup. Migrations go through Embra: see [Database and migrations](/en/huong-dan/database-va-migration/). |
| Read config from env vars | `DATABASE_URL` (when you have Postgres) and one variable per secret, with the same name. |

## Health check

On each deploy, the new version runs next to the old one.

1. Embra calls `health_path` every 2 seconds. It needs **3 consecutive 2xx responses** within the startup window (`startup_grace_seconds`, 60 seconds by default).
2. If it passes, traffic moves to the new version. Embra watches for another 30 seconds; more than 2 failures sends traffic back to the old version.
3. If it fails, the deploy stops with `HEALTHCHECK_FAILED` and the old version keeps running.

If your app starts slowly (for example it loads a large cache), raise `startup_grace_seconds`, up to 300.

## How Embra builds your app

- If the repo has a `Dockerfile` at its root (or under `root`), Embra uses it. Otherwise Embra uses **Railpack** to detect and build the project (Node, Python, Go…).
- Each build has at most 25 minutes and runs in its own virtual machine.
- During the build, the network only reaches GitHub (including `ghcr.io`), npm and yarn (`registry.npmjs.org`, `registry.yarnpkg.com`, `nodejs.org`), PyPI (`pypi.org`, `files.pythonhosted.org`), Docker Hub, the Alpine, Debian and Ubuntu package mirrors, and `binaries.prisma.sh`. Embra caches images, npm packages and Node, so later builds are faster. If the build log says `egress từ chối "<host>"` (egress denied), the build needs a host that is not open yet: email that host name to hello@embra.cloud.
- **Builds receive no secrets.** `[build] env` is only used during the build, never reaches the app, and must not hold secret values.
- The image must fit in your plan's disk space.

## `embra.toml`

Optional file at the repo root. Without it Embra uses the defaults. Unknown fields and wrong types are reported as errors.

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
database = true              # needs Postgres: set BEFORE the first deploy

[processes.worker]           # background process (within plan limits)
command = ["node", "dist/worker.js"]

[cron.cleanup]               # scheduled job, UTC, at least 5 minutes apart
schedule = "0 3 * * *"
command = ["node", "dist/cleanup.js"]

[preview]
seed = "seed/preview.sql"    # sample data for PR previews
```

:::caution[`database = true` only counts on the first deploy]
Once the environment has a running version, Embra keeps that version's database setting; changing `database` in `embra.toml` no longer has any effect. If you forgot it the first time, email hello@embra.cloud and the Embra team will turn it on.
:::

Detailed rules:

- `[build] env`: names match `^[A-Z][A-Z0-9_]{0,63}$`, do not start with `EMBRA_`, each value at most 4 KiB.
- `[processes.<name>]`: lowercase letters and digits, at most 16 characters, not `web`.
- `[cron.<name>]`: a standard 5-field cron schedule, in UTC. `@hourly` and `@every` are not supported. Two runs must be at least 5 minutes apart.
- The number of workers and cron jobs follows your plan. The trial has no cron.
