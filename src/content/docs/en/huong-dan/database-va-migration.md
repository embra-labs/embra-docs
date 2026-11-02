---
title: Database and migrations
description: A dedicated Postgres per environment, writing migrations that pass the approval gate, backups and restore.
sidebar:
  order: 4
---

## Turning on Postgres

Add to `embra.toml`:

```toml
[deploy]
database = true
```

On the first build with this line, Embra sets up a dedicated Postgres for the environment, then deploys the app. Turning it on from the start or after the first deploy both work.

| Item | Detail |
|---|---|
| Version | **PostgreSQL 18** |
| Connection string | Env var **`DATABASE_URL`**. Don't set it yourself |
| Network | Only the app in the same environment can connect; not exposed to the internet |
| App permissions | Only **read/write data** (SELECT, INSERT, UPDATE, DELETE), no creating or altering tables. The schema only changes through migrations |
| Size, RAM | Follow your plan |
| Extensions | Not supported yet (`CREATE EXTENSION`) |

:::note
Removing `database = true` from `embra.toml` later does **not** detach or delete the existing database.
:::

## Writing migrations

Each schema change is a SQL file in the `migrations/` folder (change it with `[deploy] migrations`):

```
migrations/
  0001_init.sql
  0002_add_orders_status.sql
  0003_index_orders_created_at.sql
```

- File names follow **`NNNN_name.sql`**: 4 digits, then lowercase letters, digits or `_`. Other names are skipped (the build log lists them).
- Files run in name order. Only files directly in the folder are read, not subfolders.
- **Never edit a file that has already run.** For a further change, add a new file with a higher number.
- Each file runs in one transaction. Don't write `BEGIN` or `COMMIT`.
- Each file is at most 256 KiB; each deploy at most 100 files and 2 MiB in total.

### Using Prisma

Prisma stores migrations as `prisma/migrations/<timestamp>_<name>/migration.sql`, which Embra doesn't read. Remove `prisma migrate deploy` from the start command (keep `prisma generate` in the build), then pick one of two ways:

- **The repo already has Prisma migrations:** copy them into a flat folder, numbered in order (run it again after each `prisma migrate dev` and commit; existing files keep their names, only new ones are added).
- **Write each file yourself:** generate SQL with `prisma migrate diff … --script > migrations/0002_name.sql`, review and commit.

<details>
<summary>Script to copy Prisma migrations</summary>

```sh
mkdir -p migrations
i=0
for d in prisma/migrations/*/; do
  [ -f "$d/migration.sql" ] || continue
  i=$((i + 1))
  name=$(basename "$d" | sed 's/^[0-9]*_//' | tr 'A-Z-' 'a-z_' | tr -cd 'a-z0-9_')
  cp "$d/migration.sql" "migrations/$(printf '%04d' "$i")_${name:-migration}.sql"
done
```

`prisma/migrations/20261027120000_init/migration.sql` becomes `migrations/0001_init.sql`. Don't edit or delete old Prisma migrations, or the numbers shift.

</details>

A Dockerfile based on Alpine needs `RUN apk add --no-cache openssl` for Prisma; the build can download it.

## How Embra checks migrations

Every plan with migrations is first **rehearsed on a copy of your data**. If the rehearsal fails, production hasn't been touched. Each statement goes into a group:

| Group | Examples | Needs approval |
|---|---|---|
| Safe | `CREATE TABLE`, nullable `ADD COLUMN`, `DROP INDEX`, `CREATE TYPE … AS ENUM` | Production only |
| Changes or deletes data | `DROP TABLE`, `DROP COLUMN`, renaming a table or column, `UPDATE`, `DELETE`, `INSERT` | Always, staging included |
| Locks a table for long | `CREATE INDEX` (without `CONCURRENTLY`), `ALTER COLUMN TYPE`, `SET NOT NULL`, adding a foreign key | Production only |
| Cannot run in a transaction | `CREATE INDEX CONCURRENTLY`: must be the only statement in its file | Production only |
| **Not supported yet** | functions, procedures, triggers, views, `DO`, extensions, `CREATE SCHEMA`, `GRANT`/`REVOKE`, `BEGIN`/`COMMIT`, `COPY` | Refused |

Production **always** needs an Owner or Admin to approve, even with no migration. If a migration may lose data, the approver also types `CONFIRM_MIGRATION`.

## When something goes wrong

| Situation | What to do |
|---|---|
| Rehearsal failed (`MIGRATION_REHEARSAL_FAILED`) | Fix the migration file and push again |
| The migration ran but the new app failed | The old code keeps running on the new schema. Make the code compatible and deploy again |
| The environment shows **"Cần xác minh dữ liệu"** (data needs checking, [`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown)) | Embra isn't sure the migration finished, so it stops all changes and doesn't retry. Email hello@embra.cloud |

## Backups and restore

- WAL records every change continuously, plus a full backup every 7 days. Backups live on the server, on a separate disk from the database. **A copy outside the server is not on yet.**
- After each full backup, Embra **test-restores** it to make sure it works. The overview page shows the latest result.
- You can't restore to a moment before a migration that has already run: the current schema wouldn't match.

**Point-in-time restore:** choose **Khôi phục dữ liệu…** (restore data…) and a moment within the range shown.

1. Embra builds a new database from that moment and runs it in parallel, without touching the running one.
2. An Owner or Admin reviews and approves within 2 hours to switch the app to the new database.
3. The old database is kept for 72 hours (24 hours on the trial) in case you need to go back.
