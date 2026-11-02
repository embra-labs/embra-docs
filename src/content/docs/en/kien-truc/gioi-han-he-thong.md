---
title: System limits
description: Embra runs on one server, has no HA yet, and backups have no off-server copy. RPO, restore window, and what you should do yourself.
sidebar:
  order: 3
---

What Embra does **not** do yet, written down so you can decide what you need on top.

## Server and uptime

| Item | Today |
|---|---|
| Servers | An environment's app, Postgres and backups are on the **same server** |
| HA / failover | None. If the server fails, the app is down until it is back |
| Postgres replica | None. One Postgres per environment |
| During a deploy | The new release starts and passes its health check before taking traffic; the old one serves meanwhile |

## Backup and restore

| Item | Today |
|---|---|
| RPO (data you can lose) | WAL is pushed to backup at least every minute: up to about the last 1–2 minutes of data |
| Full backup | Every 7 days, last 2 kept |
| Restore window | From the oldest kept full backup to about 1–2 minutes ago. A database running more than 2 weeks: 7 to 14 days |
| Location | Same server, a separate disk from the database. **No copy outside the server yet** |
| Whole server lost | Database and backups are lost together |
| Test restore | Every 7 days, automatic. Result under **Backup** at the top of the environment |
| Restore to before an applied migration | Not possible ([`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point)) |

Details and how to restore: [Rollback and restoring backups](/en/huong-dan/rollback-va-khoi-phuc/).

## Do it yourself

- Data you cannot lose: run an [export](/en/huong-dan/rollback-va-khoi-phuc/#exporting-data) regularly and keep the bundle elsewhere. Bundles are deleted from Embra after 24 hours.
- Before a migration with `DROP` or `DELETE`: export before approving.
- Apps that need more uptime than one server gives: don't rely on Embra alone.

## When the outcome is unknown

Embra does not retry an operation whose outcome is unknown: the environment is blocked until the Embra team verifies it ([`RECOVERY_REQUIRED`](/en/loi/#recovery_required)). How long depends on when the team handles it; Embra has not published a time commitment.

## See also

- [How Embra runs your app](/en/kien-truc/cach-embra-chay-app/)
- [Plans, limits and invoices](/en/huong-dan/goi-gioi-han-va-hoa-don/)
