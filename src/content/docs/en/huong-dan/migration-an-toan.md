---
title: Running migrations safely
description: One production migration through the migration gate - pre-flight, rehearsal, approval, post-deploy checks, and what to do when a migration breaks production.
sidebar:
  order: 5
---

Every schema change goes through the migration gate: rehearsal on a copy of your data → approval → run on production → verify. How to write migration files: [Database and migrations](/en/huong-dan/database-va-migration/).

## Limits

| Embra guarantees | Embra does not guarantee |
|---|---|
| If rehearsal fails, production is untouched | Rehearsal passing = production passing. If the production schema changes after rehearsal, the plan is cancelled ([`SCHEMA_DRIFT`](/en/loi/#schema_drift)) |
| Each file runs in one transaction (except `CREATE INDEX CONCURRENTLY`) | The whole plan is atomic: files before the failing one may already be applied |
| New code starts only after the migration finishes | **Old** code works on the new schema. That's on you, see [Expand/contract](/en/huong-dan/expand-contract/) |
| No automatic retry when it's unclear whether the migration ran ([`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown)) | Unblocking itself after an incident. The Embra team verifies first, then reopens |
| Restore to a moment **after** a migration | Rolling back code or restoring the database to **before** a migration that has run |

## You need

- An **Owner** or **Admin** to approve: on the web (session signed in within 12 hours), or the CLI within 12 hours of `embra login`. A Developer can create plans, not approve them.
- The migrations folder declared in the right place:

| How you deploy | Declared in |
|---|---|
| GitHub push, **"Build lại"** (rebuild), `embra build` | `embra.toml` → `[deploy] migrations` (default `migrations`) |
| `embra plan` (rehearsal from your machine) | `embra.json` → `migrations_dir`. Missing → exit `2` |

## 1. Pre-flight

```sh
embra status --env <project>/<env>
embra db restore-points --env <project>/<env>
```

- The environment isn't blocked and has no operation running ([`OPERATION_IN_PROGRESS`](/en/loi/#operation_in_progress)).
- The **Backup** item at the top of the environment page reads **"Restore thử đạt"** (test restore passed).
- Note the **Mốc mới nhất** (latest point): the last moment you can still restore to before the migration runs.

Migration has `DROP`, `DELETE`, `UPDATE` or a rename: **export first** (**Cài đặt** → **Dữ liệu** → **Export**, or `embra export --env <project>/<env>`). Once the migration has run, the export is the only way to get the old data back.

There is no standalone schema drift check yet. Embra checks automatically right before running the migration (the `verify_schema` step below).

## 2. Rehearse before pushing (optional)

```sh
embra plan --env <project>/<env> --wait
```

Runs the migrations in `migrations_dir` on a copy of your data. It doesn't deploy and doesn't create a deploy plan.

| Exit | Meaning | Do |
|---|---|---|
| `0` | Rehearsal passed | Push |
| `2` | `embra.json` invalid, `migrations_dir` missing, file over a limit | Fix as the message says |
| `10` | [`MIGRATION_UNSUPPORTED`](/en/loi/#migration_unsupported), [`MIGRATION_REHEARSAL_FAILED`](/en/loi/#migration_rehearsal_failed), [`MIGRATION_HISTORY_CHANGED`](/en/loi/#migration_history_changed) | Fix the SQL, run again |

## 3. Build, plan and approve

Push to the connected branch, click **"Build lại"**, or:

```sh
embra build --env <project>/<env> --wait
```

After the build, Embra rehearses again on a fresh copy of your data and creates a deploy plan.

| Exit of `embra build --wait` | Meaning |
|---|---|
| `0` | No approval needed (staging, no data loss), deploy is running: follow it in step 4 |
| `20` | Plan awaits approval ([`APPROVAL_REQUIRED`](/en/loi/#approval_required) or [`MIGRATION_DATA_LOSS`](/en/loi/#migration_data_loss)) |
| `10` | Build or rehearsal failed, see `reason_code` |

To approve: click **"Xem và duyệt"** (review and approve), read the **Migration** section, type `CONFIRM_MIGRATION` if there's a data-loss warning, click **"Duyệt và deploy"** (approve and deploy). Details: [Approving in the console](/en/huong-dan/staging-production-va-duyet/#approving-in-the-console).

A plan is bound to exactly what you reviewed. A new build, an environment change, or 24 hours passing cancels it: build again for a new plan.

## 4. What Embra runs after approval

| Step | State | If it breaks |
|---|---|---|
| `verify_schema`: production schema is still the rehearsed one | `ready` | Plan cancelled, nothing applied: [`SCHEMA_DRIFT`](/en/loi/#schema_drift) |
| `pre_snapshot`: database snapshot | `ready` | Operation `failed`, nothing applied |
| `migrate`: apply each file | `migrating` | Failing file rolled back, old code keeps serving: [`MIGRATION_LOCK_TIMEOUT`](/en/loi/#migration_lock_timeout), [`MIGRATION_REHEARSAL_FAILED`](/en/loi/#migration_rehearsal_failed). Connection lost midway: [`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown) |
| `verify_after`: compare the schema after migration with the rehearsal result | `migrating` | Differs from prediction: `migration_diverged` event, deploy continues |
| Start new code, health check, switch traffic | `starting` → `switching` → `observing` → `healthy` | Health check fails: old code runs **on the new schema** ([`HEALTHCHECK_FAILED`](/en/loi/#healthcheck_failed)) |

```sh
embra wait <op_id>
```

| Exit | Meaning |
|---|---|
| `0` | `healthy` |
| `10` | `failed`, `rejected` or `cancelled`: see `reason_code` |
| `30` | `recovery_required` or `migration_unknown`: needs the Embra team |

## 5. Verify

```sh
embra status --env <project>/<env>
embra metrics --env <project>/<env>
embra logs --env <project>/<env>
```

`embra metrics` marks migrations: compare error rate and latency before and after the mark.

## When a migration breaks production

### A `DROP COLUMN` ran and the app fails

| | |
|---|---|
| **Symptom** | App returns 500, logs show `column "…" does not exist` |
| **Cause** | Code (old or new) still reads the dropped column |
| **Not possible** | Rolling code back to before the migration: [`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible). Restoring to before the migration: [`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point) |
| **Fix** | 1. Remove the column reference from code, push, approve: fastest. 2. Need the column back: new migration `ADD COLUMN` (nullable). 3. Need the column's **data** back: take it from the pre-flight export, load it with an `UPDATE` migration |
| **Verify** | Error rate in `embra metrics` back to the level before the migration mark |

No export but you need the old data: email hello@embra.cloud with the `operation_id`. The `pre_snapshot` snapshot is only usable by the Embra team.

### Other cases

| Symptom | Cause | Fix | Verify |
|---|---|---|---|
| Plan cancelled, [`SCHEMA_DRIFT`](/en/loi/#schema_drift) | Production schema changed after rehearsal | **"Build lại"** or `embra build` | New plan awaits approval |
| [`MIGRATION_LOCK_TIMEOUT`](/en/loi/#migration_lock_timeout) | A long query holds a table lock | Stop the long query, build again at a quiet time | `embra wait` exits `0` |
| `Migration đã áp, code mới chưa chạy. Code cũ đang phục vụ trên schema mới.` (migration applied, new code not live, old code serving on the new schema) | New code failed health check after the migration | Make the code work on the new schema, push | `healthy` |
| **"Cần xác minh dữ liệu"** (data needs checking), exit `30` | Connection lost while migrating | **Don't** edit migration files, run SQL by hand or delete the environment. Email with the `operation_id` | The Embra team reopens the environment |

## See also

- [Database and migrations](/en/huong-dan/database-va-migration/)
- [Expand/contract](/en/huong-dan/expand-contract/)
- [Rollback and restoring backups](/en/huong-dan/rollback-va-khoi-phuc/)
- [Error codes: Database and migrations](/en/loi/#database-and-migrations)
