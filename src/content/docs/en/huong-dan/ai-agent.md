---
title: Using Embra with an AI agent
description: Let Claude Code, Cursor, Copilot or ChatGPT read the Embra docs and prepare your repo for deploy, with an AGENTS.md template.
sidebar:
  order: 8
---

This page is for you if an AI agent (Claude Code, Cursor, GitHub Copilot, ChatGPT…) is changing your repo to run on Embra.

Today agents do best at **preparing the repo**: port, health check, `embra.toml`, migrations, Dockerfile. You push to GitHub and Embra builds and deploys as usual. Anything that needs permissions, such as setting secrets and approving production, you still do on the web.

## Let the agent read the docs

The Embra docs have plain-text versions for AI:

| File | Contents |
|---|---|
| `https://docs.embra.cloud/llms-full.txt` | All docs in one file (Vietnamese) |
| `https://docs.embra.cloud/llms-small.txt` | Short version |
| `https://docs.embra.cloud/llms.txt` | Index |

These files are in Vietnamese. Current models read Vietnamese well, so you can use them as they are. If the agent can't fetch URLs, open the file in a browser and paste the part you need into the chat.

## Add AGENTS.md to the repo

Create `AGENTS.md` at the repo root. Claude Code, Cursor, Copilot and Codex all read it when working in the repo. Copy the template below and fill in the two lines marked `<…>`.

```markdown
# AGENTS.md

This app deploys to Embra. Docs: https://docs.embra.cloud/llms-full.txt

## Embra requirements
- Deploy config lives in `embra.toml` at the repo root. Unknown fields or wrong types are rejected.
- The app listens on `0.0.0.0`, port from the `PORT` variable (default 3000). Never `127.0.0.1`.
- `GET` on `health_path` (default `/`) must return 2xx. A 3xx redirect does not pass.
- The filesystem is read-only. Only `/tmp` is writable. User uploads go to the S3 bucket (`S3_*` variables).
- Postgres: set `database = true` under `[deploy]` and read the connection string from `DATABASE_URL`. Never set `DATABASE_URL` yourself.
- Migrations: SQL files `NNNN_name.sql` in `migrations/`. Never edit a file that already ran; add a new one with a higher number.
- The app does not run migrations on startup (its database account cannot change the schema).
- Builds get no secrets. `[build] env` must not contain secret values.

## What the agent does not do
- Never write secret values into code, `embra.toml` or commits. When a new secret is needed, list the variable name in the PR description so someone with access sets it on the web (Cài đặt → Secrets).
- Never approve, delete or export on Embra. Production always waits for an Owner or Admin.

## Project commands
- Install and build: <build command, e.g. npm ci && npm run build>
- Run locally: <start command, e.g. PORT=3000 npm start>
```

With Claude Code, also create `CLAUDE.md` at the repo root with one line:

```markdown
@AGENTS.md
```

## A prompt to hand over the work

Paste this into the agent once `AGENTS.md` is in place:

```text
Read https://docs.embra.cloud/llms-full.txt and AGENTS.md. Check whether this repo is ready to run on Embra:
port and 0.0.0.0, a health check that returns 2xx, no file writes outside /tmp, no migrations on startup,
a valid embra.toml. Fix what is missing. List the secrets the app needs (names only, no values).
Don't change the app's behaviour beyond these points.
```

If the repo already has Prisma or other ORM migrations, add: "Convert the migrations to `migrations/NNNN_name.sql` following the Database and migrations page."

## Check before you push

Agents make mistakes. Before pushing, check quickly:

1. Open `embra.toml` and compare it with [Prepare your app](/en/huong-dan/chuan-bi-app/#embratoml).
2. Run the app locally with `PORT=3000`, open `http://localhost:3000<health_path>` and see a 2xx.
3. Look through the diff for anything that looks like a secret (API keys, passwords, connection strings).
4. Review new migration files: numbers in order, no old file edited.

If a deploy fails, paste the exact error code and the build log to the agent, with a link to [Error codes and fixes](/en/loi/).

## Agents using the CLI and MCP

The `embra` CLI has `embra mcp`, which lets an agent call Embra directly with an `agent` token. That token can read, build, deploy staging and create production plans, but **never** approve, delete, export or read the database URL. See [Permissions](/en/workspace/phan-quyen/).

:::note[CLI sign-in is not on for customers yet]
The `agent` token comes from `embra login --agent`, which needs a browser approval page that is not switched on for customers yet. Meanwhile, the agent prepares the repo, and you deploy and approve on the web.
:::
