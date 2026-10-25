---
title: Database and migrations
description: A dedicated Postgres per environment, writing migrations that pass the approval gate, backups and restore.
sidebar:
  order: 4
---

## Turning on Postgres

Set this in `embra.toml` **before the first deploy**:

```toml
[deploy]
database = true
```

On the first build, Embra sets up a dedicated Postgres for the environment, then deploys the app.

- Version: **PostgreSQL 18**.
- The app gets the connection string in **`DATABASE_URL`**. Do not set this variable yourself.
- The database only accepts connections from the app in the same environment; it is not exposed to the internet.
- The app's account can only **read and write data** (SELECT, INSERT, UPDATE, DELETE); it cannot create or alter tables. The schema only changes through migrations.
- Size and RAM follow your plan. Extensions (`CREATE EXTENSION`) are not supported yet.

:::caution
`database = true` only counts on the first deploy. If you forgot it, email hello@embra.cloud.
:::

## Writing migrations

Each schema change is a SQL file in the `migrations/` folder (change it with `[deploy] migrations`):

```
migrations/
  0001_init.sql
  0002_add_orders_status.sql
  0003_index_orders_created_at.sql
```

- File names follow **`NNNN_name.sql`**: 4 digits, then lowercase letters, digits or underscores. Other names are skipped (the build log lists them).
- Files run in name order. Embra only reads files directly in the folder, not in subfolders.
- **Never edit a file that has already run.** For a further change, add a new file with a higher number.
- Each file runs in one transaction. Do not write `BEGIN` or `COMMIT`.
- Each file is at most 256 KiB; each deploy at most 100 files and 2 MiB in total.

**Using Prisma?** Prisma stores migrations as `migrations/<timestamp>/migration.sql`, which Embra does not read. Generate a SQL file with `prisma migrate diff … --script > migrations/0002_name.sql`, review it and commit it. Remove `prisma migrate deploy` from the app's start command.

## How Embra checks migrations

Every plan with migrations is first **rehearsed on a copy of your data**. If the rehearsal fails, production has not been touched. Embra puts each statement into a group:

| Group | Examples | Needs approval |
|---|---|---|
| Safe | `CREATE TABLE`, nullable `ADD COLUMN`, `DROP INDEX`, `CREATE TYPE … AS ENUM` | Production only |
| Changes or deletes data | `DROP TABLE`, `DROP COLUMN`, renaming a table or column, `UPDATE`, `DELETE`, `INSERT` | Always, staging included |
| Locks a table for long | `CREATE INDEX` (without `CONCURRENTLY`), `ALTER COLUMN TYPE`, `SET NOT NULL`, adding a foreign key | Production only |
| Cannot run in a transaction | `CREATE INDEX CONCURRENTLY`: must be the only statement in its own file | Production only |
| **Not supported yet** | functions, procedures, triggers, views, `DO`, extensions, `CREATE SCHEMA`, `GRANT`/`REVOKE`, `BEGIN`/`COMMIT`, `COPY` | Refused |

Production **always** needs an Owner or Admin to approve, even with no migration. If a migration may lose data, the approver must also type `CONFIRM_MIGRATION`.

## When something goes wrong

- **Rehearsal failed** (`MIGRATION_REHEARSAL_FAILED`): fix the migration file and push again.
- **The migration ran but the new app failed:** the old code keeps running on the new schema. Make the code compatible and deploy again.
- **The environment shows "Cần Embra kiểm tra database"** (needs Embra to check the database): Embra is not sure whether a migration finished, so it stops all changes and does not retry on its own. Email hello@embra.cloud.

## Backups and restore

- Every change is recorded continuously, with a copy kept in storage outside the server.
- Embra **test-restores** from that outside copy every day to make sure the backup works. The overview page shows the latest result.
- **Restoring to a point in time:** choose "Khôi phục về thời điểm…" (restore to a point in time) and a moment within the range shown.
  - Embra builds a new database from that moment and runs it in parallel, without touching the running one.
  - An Owner or Admin reviews and approves within 2 hours to switch the app to the new database.
  - The old database is kept for 72 hours (24 hours on the trial) in case you need to go back.
- You cannot restore to a moment before a migration that has already run: the current schema would not match.
