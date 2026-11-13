---
title: Database
description: A dedicated Postgres per environment - turning it on, connecting, app permissions, backups.
sidebar:
  order: 3
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

## Backups

Every environment with Postgres is backed up automatically; nothing to turn on.

| Item | Detail |
|---|---|
| Continuous | WAL records every change, pushed to backup at least every minute |
| Full backup | Every 7 days, the 2 latest kept |
| Restore tests | Paid plans every day on an isolated copy, with the measured RTO; every week from the offsite copy. Details in [Database backups](/en/huong-dan/rollback-va-khoi-phuc/#database-backups) |
| Location | On the server, on a separate disk from the database, plus a copy on Cloudfly object storage in Hanoi (synced about every minute) |
| Restore | To a point in time, previewed first, then approved by an Owner or Admin. Not to a moment before a migration that has already run |

Restore and export details: [Rollback and restoring backups](/en/huong-dan/rollback-va-khoi-phuc/#database-backups).

## See also

- [Database and migrations](/en/huong-dan/database-va-migration/)
- [Running migrations safely](/en/huong-dan/migration-an-toan/)
