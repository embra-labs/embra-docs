---
title: Rollback and restoring backups
description: Sending code back to the previous version when a release breaks, restoring the database to a point in time, and exporting data.
sidebar:
  order: 11
---

This page is for when you just deployed a broken version, or wrote bad data and need it back. You will learn when to use a **rollback** (code), when to **restore a backup** (data), and what each one costs.

## Which one do you need?

| You have | Use | Touches data? | Needs approval? |
|---|---|---|---|
| A broken release, data is fine | Rollback | No | No |
| Data deleted or written wrong | Restore a backup | Yes: data written after the chosen point is lost | Owner or Admin |
| Moving the app and data elsewhere | Export | No | Only Owner or Admin can create one |

## Rolling back to the previous version

A rollback reruns the deploy **right before** the one running now, through the full start, readiness check and traffic switch steps. Data in the database is not rewound.

Owners, Admins and Developers can roll back. No approval is needed, even in production, because that version was already approved and ran.

1. Open the environment. At the top of the page is the **"Lịch sử & khôi phục"** (history & restore) rail.
2. Click **"Quay về bản trước"** (roll back). The button only shows once the environment has at least 2 successful deploys, and it is locked while another operation is running.
3. In production, type the environment name to confirm, then click **"Quay về bản trước"** in the dialog.
4. Embra opens the operation page. The old version has traffic when the state reads **"Deploy thành công"** (deployed).

On the web you can only go back exactly one version; you cannot pick an older one.

### Rolling back a second time

A rollback creates a new release, and that release's "previous version" is the one you just left. So clicking **"Quay về bản trước"** again **brings the broken version back**; it does not go one step further. To fix forward, push a new commit.

### When Embra refuses a rollback

Embra checks before doing anything, so a refusal leaves the running app untouched.

| Reason | Error code | What to do |
|---|---|---|
| A migration ran after that version | [`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible) | Fix with a new commit that works with the current schema |
| A secret that version used was revoked | [`SECRET_REVOKED`](/en/loi/#secret_revoked) | Deploy a new version with the current secrets |
| Another operation has not finished | [`OPERATION_IN_PROGRESS`](/en/loi/#operation_in_progress) | Wait for it to finish |
| The environment is blocked after an incident | [`ENVIRONMENT_BLOCKED`](/en/loi/#environment_blocked) | Contact the Embra team |
| The running version is the first one, or the environment is paused | [`INVALID_INPUT`](/en/loi/#invalid_input) | There is nothing to go back to / resume the environment first |

A rollback only restores code, not the schema. That is why Embra blocks it once migrations have moved on: old code may not run on the new schema.

## Database backups

Every environment with Postgres is backed up automatically; there is nothing to turn on.

- **Continuous:** every change is recorded (WAL) and pushed to the backup at least once a minute.
- **Full backups:** every 7 days. Embra keeps the 2 most recent full backups.
- **Restorable range:** from the oldest full backup still kept up to about 1–2 minutes ago. For a new database it starts at the first full backup. Once a database has run for more than 2 weeks, the range is 7 to 14 days long, depending on when the latest full backup ran.
- **Where:** on the server, on a separate disk from the one holding the database. Off-server copies are not on yet.
- **Restore tests:** every 7 days Embra rebuilds the database from the backup to make sure it works. The result shows under **Backup** in the status band at the top of the environment page.

| Console shows | Meaning |
|---|---|
| **"Restore thử đạt"** (restore test passed) | The latest restore test succeeded |
| **"Chưa restore thử"** (not restore-tested) | New database, first restore test not run yet |
| **"Restore thử thiếu dữ liệu"** (restore test came up short) | The backup is missing a stretch ([`BACKUP_WAL_GAP`](/en/loi/#backup_wal_gap)) |
| **"Restore thử thất bại"** (restore test failed) | The backup could not be rebuilt. Do not rely on the restore range; email hello@embra.cloud |

Backups pause while the database is stopped or the environment is blocked after an incident.

## Restoring the database to a point in time

A restore has two steps, so you can look before switching the app:

```
Bước 1: Tạo bản khôi phục        Bước 2: Chuyển sang bản này
(Owner, Admin, Developer)        (Owner hoặc Admin, trong 2 giờ)
database mới chạy song song  →   app dùng database mới
app vẫn dùng database cũ         database cũ giữ 72 giờ, chỉ đọc
```

(Step 1: create a restored copy, a new database running alongside while the app keeps the old one. Step 2: switch to it, approved by an Owner or Admin within 2 hours; the old database is kept read-only for 72 hours.)

**Step 1. Create the restored copy**

1. On the **"Lịch sử & khôi phục"** rail, click **"Khôi phục dữ liệu…"** (restore data). Or on the overview page, click **"Xem mốc khôi phục"** (view restore points).
2. Check the restorable range, from **"Mốc sớm nhất"** (earliest) to **"Mốc mới nhất"** (latest).
3. Enter a **restore point** in that range, in your device's time zone.
4. Click **"Tạo bản khôi phục"** (create restored copy). Embra builds a new database from that point. The running database is not touched.

**Step 2. Switch to the restored copy**

An Owner or Admin does this step.

1. When the copy is ready, the operation page shows **"Chuyển sang bản khôi phục"** (switch to the restored copy) with an estimated row count per table.
2. Type the environment name to confirm.
3. Click **"Chuyển sang bản này"** (switch to this copy). To drop it, click **"Huỷ bản khôi phục"** (cancel this restore).
4. Embra moves the app to the new database without stopping the app.

The approver must have signed in on the web within the last 12 hours. If nobody approves within 2 hours, the copy is cancelled and cleaned up; start again from step 1.

:::caution[Data written after the chosen point is lost]
After the switch, anything the app wrote after the restore point is not in the new database. During the switch the old database becomes read-only, so the app may report write errors for a few seconds.
:::

### Going back to the old database after a restore

The old database is kept for **72 hours** after the switch (trial: 24 hours). During that time, rolling back to the deploy that ran before the restore moves the app back to the old database.

- Only an Owner or Admin can do it, and it must be a real person (a web session within 12 hours).
- After the retention period the old database is deleted: the rollback fails with [`ROLLBACK_DB_GONE`](/en/loi/#rollback_db_gone).
- If a migration ran on the new database after the switch, the rollback is blocked with [`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible).

:::danger[Writes to the new database are lost]
Going back to the old database discards everything the app wrote to the new database since the switch. There is no way to get that back.
:::

### When a restore does not work

| You see | Error code | What to do |
|---|---|---|
| The point is outside the range, or there is no backup yet | [`RESTORE_POINT_UNAVAILABLE`](/en/loi/#restore_point_unavailable) | Pick a point between **"Mốc sớm nhất"** and **"Mốc mới nhất"** |
| A migration ran after the chosen point | [`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point) | Pick a point after that migration |
| The backup cannot reach that exact point | [`RESTORE_SHORT`](/en/loi/#restore_short) | Email hello@embra.cloud |
| The operation shows **"Cần đội Embra hỗ trợ"** (needs the Embra team) | [`RECOVERY_REQUIRED`](/en/loi/#recovery_required) | Do not delete the environment; email with the operation ID |

You cannot restore while the environment is paused or the database is stopped; start it first.

## Exporting data

An export builds a bundle with the image, manifest, a `pg_dump` and the list of bucket objects. The bundle contains no secret values.

1. Open **"Cài đặt"** (settings) → **"Dữ liệu"** (data) → **"Export dữ liệu"** (export data).
2. Tick **"Kèm nội dung object của bucket"** (include bucket object contents) if you also need the files in the bucket.
3. Click **"Tạo export"** (create export).
4. When the export finishes, click **"Tải bundle"** (download bundle).

- Owner or Admin only. Exporting production needs a web session signed in within 12 hours.
- The bundle is deleted after 24 hours.
- A bundle over the size limit fails with [`QUOTA_EXCEEDED`](/en/loi/#quota_exceeded).

## Using the CLI

The matching commands (see the CLI sign-in note in the [command list](/en/cli/lenh/)):

```sh
embra rollback --env <project>/<env>
embra db restore-points --env <project>/<env>
embra db restore --env <project>/<env> --to 2026-11-01T08:30:00+07:00
embra export --env <project>/<env>
```

`embra db restore` only creates the restored copy. The switch still needs an Owner or Admin to approve.

## See also

- [Database and migrations](/en/huong-dan/database-va-migration/)
- [Logs and monitoring](/en/huong-dan/log-va-theo-doi/)
- [Rollback and restore: error codes](/en/loi/#rollback-and-restore)
- [Members and permissions](/en/workspace/phan-quyen/)
