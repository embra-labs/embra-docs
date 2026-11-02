---
title: Row-level undo
description: Fix exactly the rows a bad UPDATE overwrote and keep data written afterwards. Embra generates SQL fix files; you deploy them through the migration gate.
---

A bad `UPDATE` overwrote data, but the app kept writing good data afterwards? `embra db undo` gives back only the rows the incident transaction changed, instead of rewinding the whole database like a [restore](/en/huong-dan/rollback-va-khoi-phuc/#restoring-the-database-to-a-point-in-time).

## Undo or restore?

| | Row-level undo | Restore to a point in time |
|---|---|---|
| Fixes | Rows the incident transaction `UPDATE`d | The whole database |
| Data written after the incident | Kept | Lost |
| `DELETE`d rows | Only counted and sampled, **no SQL generated** | Recovered |
| Migration after the point | Still works, compares only columns present on both sides | Refused ([`MIGRATION_AFTER_RESTORE_POINT`](/en/loi/#migration_after_restore_point)) |
| Touches production | No, until you deploy the fix files | Yes, after approval |
| Where | CLI only | Web or CLI |

## Limits

| Item | Limit |
|---|---|
| Who | Owner or Admin, in person: `embra login` within 12 hours (see the CLI sign-in note in the [command list](/en/cli/lenh/)). `dev`/`viewer`/`agent`/`ci` tokens can't |
| Tables per session | 1–10 (`schema.table`, no schema means `public`) |
| Table without a primary key | Refused: rows can't be matched across two points in time |
| `--where` filters | Up to 20; ops `=` `<>` `<` `<=` `>` `>=` `is_null` `not_null` |
| Incident transactions per `run` | Up to 50 `--xid` |
| `--at` point | Inside `embra db restore-points`; latest is the last WAL archive minus 1 minute |
| Concurrency | 1 session per workspace, 1 running comparison per environment |
| The copy | Deleted after **24 hours**, or right away on `discard` |
| Fix files | Must fit one deploy's migration budget (applied files included: 100 files, 2 MiB). Otherwise none are generated; narrow with `--where` |

Start a paused environment or stopped database first. Undo does not block deploys or restores.

## Steps

**1. Open a session.** Pick the point right before the incident: the whole second just before the bad statement **started**.

```sh
embra db undo start --env <project>/<env> \
  --at 2026-11-02T02:34:07Z \
  --table public.orders \
  --where 'public.orders:status=cancelled' \
  --wait
```

Embra builds an isolated copy of the database at that point (no network), then compares each row by primary key with production. Production is only read.

**2. Read the result.**

```sh
embra db undo show <session_id>
embra db undo preview <session_id> <op_id>
```

`show` prints the session state, its expiry, and each comparison (`op_id`, state, summary). `preview` prints JSON: row counts per class, top transactions (`xid`, rows, columns, time window), up to 20 sample rows per class.

| Row class | Meaning | What undo does |
|---|---|---|
| `incident_update` | Changed by the incident transaction | **Fix**: restore the columns it changed |
| `changed_other` | Changed by another transaction after the point | Keep |
| `suspect` | Same, but the column holds exactly the incident's value | Keep, review by hand |
| `incident_new` | Not in the copy, written by the incident transaction | Count only |
| `new_other` | Valid new row | Keep |
| `missing` | Deleted after the point | Count and sample only |

:::caution[Table names, columns and values in the preview are your data]
Don't paste the preview anywhere public.
:::

**3. (Optional) Rebuild right before the incident transaction.** A point in seconds can miss rows created between the point and the incident (`incident_new`). Rebuild a copy holding everything committed **before** that transaction:

```sh
embra db undo exact <session_id> --env <project>/<env> --xid <xid> --table public.orders --wait
```

The new session replaces the old one (filters carry over). Use the new `session_id` from here on.

**4. Generate the fix.** Pick the incident transaction from the preview:

```sh
embra db undo run <session_id> --xid <xid> --wait
```

- `--exclude public.orders.updated_at`: keep that column's current value.
- `--table`: change the table list.
- No `--xid`: compare again without generating files.

Every statement is `UPDATE … WHERE <primary key> AND xmin = ANY (…)`: it only writes rows **still** holding the incident's version. Rows changed after the preview, including while waiting for approval, are skipped. Applying twice changes nothing.

**5. Download into your migrations directory.**

```sh
embra db undo fix <session_id> <op_id> --out migrations
```

Files are named `NNNN_embra_undo_<k>.sql`, numbered after the last applied migration. The command checks hashes and never overwrites a file; if one file fails, none are written.

**6. Deploy through the migration gate.** Commit and push. These are **data-changing** statements: the gate rehearses on a copy (row counts must match the preview) and **always needs an Owner or Admin to approve, staging included**. See [Database and migrations](/en/huong-dan/database-va-migration/).

:::caution[Fix files stay in the repo forever]
An applied migration can't be edited or removed ([`MIGRATION_HISTORY_CHANGED`](/en/loi/#migration_history_changed)). The old values in the file live in git history.
:::

**7. Verify, then delete the copy.**

```sh
embra db undo run <session_id> --wait
embra db undo discard <session_id>
```

Comparing again on the same copy: `incident_update` must be 0, leaving only valid changes and new rows.

<details>
<summary>Edge cases</summary>

- Unapplied migrations in the repo run in the same deploy, **before** the fix files. The `run` summary lists them.
- A row changed by both the incident and another transaction (the gap between point and incident): only the incident's columns are restored, others keep their current value. The summary counts these rows.
- App triggers **fire** when the fix is applied. The preview lists the table's triggers.
- Columns present on one side only (added or dropped after the point) are listed, not compared. Undo **cannot** bring back data from a `DROP`ped column.
- `--where` is `table:column<op>value` or `table:column:is_null` / `table:column:not_null`; the table must be in `--table`.

</details>

## When it doesn't work

| Message | Fix |
|---|---|
| `Mốc nằm ngoài khoảng khôi phục được. …` ([`RESTORE_POINT_UNAVAILABLE`](/en/loi/#restore_point_unavailable)) | Pick a point inside `embra db restore-points` |
| `Workspace đang có một phiên hoàn tác (…). …` ([`OPERATION_IN_PROGRESS`](/en/loi/#operation_in_progress)) | `embra db undo discard <session_id>` the old session |
| `Kết quả của lần so này đã bị xoá (quá 24 giờ hoặc phiên đã xoá).` | Open a new session |
| `Environment hoặc database đang dừng. …` | Start it first |
| Token not allowed ([`FORBIDDEN_SCOPE`](/en/loi/#forbidden_scope), [`HUMAN_REQUIRED`](/en/loi/#human_required)) | Owner or Admin runs `embra login` again |

## See also

- [Rollback and restore](/en/huong-dan/rollback-va-khoi-phuc/)
- [Incident runbook](/en/huong-dan/runbook-su-co/)
- [Database and migrations](/en/huong-dan/database-va-migration/)
