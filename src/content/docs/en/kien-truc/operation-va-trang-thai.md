---
title: Operations and states
description: Every change is an operation with a state. States, console labels, CLI exit codes, and which state can move to which.
sidebar:
  order: 2
---

Every change (build, deploy, rollback, restore, import…) is an **operation** with an `operation_id` and a `state`. See it with `embra status <op_id>` or under **"Lần deploy"** (deploys) in the console.

## States

| `state` | Console | Meaning | Exit code |
|---|---|---|---|
| `requested` | Đã tiếp nhận (received) | Embra has it, not started yet | — |
| `planned` | Đã chuẩn bị (prepared) | The deploy has a plan | — |
| `rehearsing` | Đang chạy thử migration (rehearsing migration) | Rehearsal on a data copy | — |
| `awaiting_approval` | Chờ duyệt (awaiting approval) | Waiting for an Owner or Admin | `20` |
| `ready` | Sẵn sàng deploy (ready to deploy) | Approved (or no approval needed), waiting to run | — |
| `migrating` | Đang chạy migration (running migration) | Applying migrations to production | — |
| `starting` | Đang khởi động (starting) | Starting the new container, waiting for the health check | — |
| `switching` | Đang chuyển traffic (switching traffic) | Moving traffic to the new release (or to the new database on restore) | — |
| `observing` | Đã nhận traffic, đang theo dõi (live, observing) | New release takes traffic, Embra keeps watching | — |
| `running` | Đang thực hiện (in progress) | A non-deploy operation is running | — |
| `healthy` | Deploy thành công (deployed; rollback: Rollback xong) | Deploy or rollback done, new release serving | `0` |
| `succeeded` | Hoàn tất (done) | A non-deploy operation finished | `0` |
| `failed` | Thất bại (failed) | Could not be done; see `reason_code` | `10` |
| `rejected` | Đã từ chối (rejected) | The approver rejected it, or Embra refused it before running | `10` |
| `cancelled` | Đã huỷ (cancelled) | Cancelled before touching production | `10` |
| `recovery_required` | Cần đội Embra hỗ trợ (needs the Embra team) | Outcome unknown, environment blocked | `30` |
| `migration_unknown` | Cần xác minh dữ liệu (data needs verification) | Lost contact while running a migration, environment blocked | `30` |

- **Exit code** is what `embra wait` / `embra status` return when the operation is in that state. "—" means not final yet; the exit code then follows `reason_code` ([Exit codes and JSON](/en/cli/exit-code-va-json/)).
- Final states (never change again): `healthy`, `succeeded`, `failed`, `rejected`, `cancelled`, `recovery_required`, `migration_unknown`. `ready` is **not** final.
- `embra wait` stops at a final state or at `awaiting_approval`.

## Deploy

```
planned → rehearsing → awaiting_approval → ready → migrating → starting → switching → observing → healthy
```

| From | Can move to |
|---|---|
| `planned` | `rehearsing`, `awaiting_approval`, `ready`, `cancelled` |
| `rehearsing` | `awaiting_approval`, `ready`, `failed`, `cancelled` |
| `awaiting_approval` | `ready`, `rejected`, `cancelled` |
| `ready` | `migrating`, `starting`, `failed`, `cancelled` |
| `migrating` | `starting`, `failed`, `migration_unknown` |
| `starting` | `switching`, `failed` |
| `switching` | `observing`, `failed` |
| `observing` | `healthy`, `failed` |

- No migrations: `rehearsing` and `migrating` are skipped. No approval needed (staging without data-loss migrations): `awaiting_approval` is skipped.
- `ready` → `failed`: an error known before touching production (for example the pre-migration snapshot fails).
- From `migrating` only `starting`, `failed` or `migration_unknown`. Once in `migrating` it can no longer be cancelled.
- Failing after `migrating` (for example the health check): the migration **is applied**, old code runs on the new schema.

## Other operations

| Operation | Path |
|---|---|
| Rollback | `requested` → `switching` → `observing` → `healthy`; refused early → `rejected` |
| Build | `requested` → `running` → `succeeded`; a newer push → `cancelled` |
| Restore (PITR) | `requested` → `running` → `awaiting_approval` → `switching` → `succeeded`; not switched → `rejected` / `cancelled` |
| Data import | `requested` → (`awaiting_approval` on production) → `running` → `succeeded` |
| Fork | `requested` → `awaiting_approval` → `succeeded` |
| Everything else (Postgres setup, backup, export, secret, domain…) | `requested` → `running` → `succeeded` |

On top of these tables, any non-final state can move to `recovery_required` (except `migrating`, which uses `migration_unknown`). Export and the comparison runs of `embra db undo` only read, so they never become `recovery_required`.

## `recovery_required` and `migration_unknown`

Both mean Embra **does not know** whether the last step finished. Embra deliberately does not retry: running a migration or a database switch twice when the first outcome is unknown can corrupt data.

- The environment is blocked: every change returns [`ENVIRONMENT_BLOCKED`](/en/loi/#environment_blocked) until the Embra team has verified it.
- Do not delete the environment or run SQL by hand. See [`RECOVERY_REQUIRED`](/en/loi/#recovery_required), [`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown).
