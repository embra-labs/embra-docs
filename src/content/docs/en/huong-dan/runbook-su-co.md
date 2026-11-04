---
title: Incident runbook
description: Look up by symptom when a production app has a problem - cause, fix, how to verify. Links to the detailed page and error code.
---

Look up by symptom. Each entry: cause → fix → verify. Details live on the linked page.

Before doing anything, open the environment and read the status band at the top (see [Reading the app status](/en/huong-dan/log-va-theo-doi/#reading-the-app-status)), or run:

```sh
embra status --env <project>/<env>
```

:::danger[When the console shows "Cần xác minh dữ liệu" or "Cần đội Embra hỗ trợ"]
Don't delete the environment, don't run SQL by hand, don't keep pushing. Jump straight to [that entry](#console-shows-cần-xác-minh-dữ-liệu).
:::

## The app returns 500 after a deploy

| | |
|---|---|
| **Cause** | The new version passed the health check but fails on other routes |
| **Fix** | No migration in that version: click **"Quay về bản trước"** (roll back), see [Rollback](/en/huong-dan/rollback-va-khoi-phuc/#rolling-back-to-the-previous-version). With a migration: rollback is refused ([`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible)), fix the code and push |
| **Verify** | `embra metrics --env <project>/<env>`: error rate back to the level before the deploy marker; `embra logs --env <project>/<env>` clean |

## The deploy doesn't go live, the old version still runs

| | |
|---|---|
| **Cause** | The new version fails the health check ([`HEALTHCHECK_FAILED`](/en/loi/#healthcheck_failed)): wrong `PORT`, `health_path` returns an error, missing env var, crash on start |
| **Fix** | Read the **"Nội dung từ app — không do Embra viết"** (content from your app) block and the app log, fix, push |
| **Verify** | The new deploy reaches **"Deploy thành công"** (deployed) |

Console says "Migration đã áp, code mới chưa chạy" (migration applied, new code not running): the schema changed and **the old code is running on the new schema**. Fix the new code and push; don't rush a reverse migration.

## A migration dropped a column, the app fails

| | |
|---|---|
| **Cause** | Code still reads the `DROP`ped column |
| **Fix** | Remove the column reference from the code and push. Need the column back: a new migration with `ADD COLUMN` (nullable). Need the column's **data** back: only from an export taken before the migration |
| **Not possible** | Code rollback ([`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible)), restore to before the migration ([`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point)), [row-level undo](/en/huong-dan/undo-tung-dong/) (compares only columns present on both sides) |
| **Verify** | `embra logs` has no more `column "…" does not exist` |

Next time: drop columns with [expand/contract](/en/huong-dan/expand-contract/), and export before approving a data-loss migration.

## Data deleted or written wrong

Pick by what happened:

| What happened | Must data written afterwards stay? | Use |
|---|---|---|
| One `UPDATE` wrote many rows wrong | Yes | [Row-level undo](/en/huong-dan/undo-tung-dong/) (CLI, needs [`embra login`](/en/cli/cai-dat/)) |
| `DELETE`, `DROP TABLE`, or widespread damage | No | [Restore to a point in time](/en/huong-dan/rollback-va-khoi-phuc/#restoring-the-database-to-a-point-in-time) |
| `DELETE` | Yes | Not self-service yet: undo only counts deleted rows. Email hello@embra.cloud |
| A migration ran after the point you need | | Restore is refused ([`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point)); undo still works |

- Finding the point: the whole second just before the bad statement **started**. Deploy, migration and cron markers are in `embra events --env <project>/<env>` and the logs.
- The point must be inside `embra db restore-points`.
- **Verify:** undo: `embra db undo run <session_id>` shows `incident_update` at 0. Restore: the estimated row counts on the operation page match what you expect before you click **"Chuyển sang bản này"** (switch).

## Console shows "Cần xác minh dữ liệu"

| | |
|---|---|
| **Cause** | Embra lost contact while running a production migration and doesn't know whether it applied ([`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown)) |
| **State** | The old code still runs. The environment is blocked. Embra snapshotted the database right before the migration |
| **Fix** | Email hello@embra.cloud with the `operation_id`, workspace, environment, time. **Don't** edit migration files, rerun SQL by hand, or delete the environment |
| **Verify** | The Embra team reopens the environment; the status band no longer shows **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"** |

## Console shows "Cần đội Embra hỗ trợ"

| | |
|---|---|
| **Cause** | An operation (deploy, rollback, restore…) ended with an unknown outcome ([`RECOVERY_REQUIRED`](/en/loi/#recovery_required)). Embra deliberately doesn't retry |
| **State** | Traffic stays as it was at the incident. Deploys, rollbacks, restores are refused ([`ENVIRONMENT_BLOCKED`](/en/loi/#environment_blocked)). Cron and scheduled backups pause |
| **Fix** | Click **"Liên hệ hỗ trợ"** (contact support). Say whether users are seeing errors |
| **Verify** | As above |

## Backup: "Restore thử thất bại" or "Restore thử thiếu dữ liệu"

| | |
|---|---|
| **Cause** | The database couldn't be rebuilt from the backup, or WAL is missing a segment ([`BACKUP_WAL_GAP`](/en/loi/#backup_wal_gap)) |
| **Impact** | The app runs normally. The restore window may not be usable |
| **Fix** | Email hello@embra.cloud. For important data, export now (**"Cài đặt"** → **"Dữ liệu"** → **"Export"**) |
| **Verify** | **Backup** returns to **"Restore thử đạt"** (restore test passed) after the next restore test |

## A custom domain stopped working

| | |
|---|---|
| **Cause** | The `_embra-challenge` TXT record was removed: Embra rechecks every 24 hours and stops serving the domain after 3 misses in a row. Or DNS no longer points to Embra |
| **Fix** | Add the TXT record and the record pointing to Embra back per [Custom domain](/en/huong-dan/domain-rieng/), then verify again ([`DOMAIN_NOT_VERIFIED`](/en/loi/#domain_not_verified)) |
| **Verify** | `dig TXT _embra-challenge.<domain>` returns the right value; open `https://<domain>` |

## When you email hello@embra.cloud

Include: `operation_id`, workspace, project/environment, time (say Vietnam time or UTC), error code. See [When to contact us](/en/loi/#when-to-contact-us).

## See also

- [Error codes](/en/loi/)
- [Rollback and restore](/en/huong-dan/rollback-va-khoi-phuc/)
- [Row-level undo](/en/huong-dan/undo-tung-dong/)
- [Logs and monitoring](/en/huong-dan/log-va-theo-doi/)
