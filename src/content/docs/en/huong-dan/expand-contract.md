---
title: Rename or drop a column without downtime
description: Expand/contract - split a schema change that breaks old code into 3 deploys so the app never fails and rollback stays possible.
sidebar:
  order: 6
---

Right after a migration runs, **old code is still serving on the new schema** until the new code passes its health check. If the health check fails, old code stays on the new schema. And once a migration has run, rolling code back to the previous version is blocked ([`ROLLBACK_INCOMPATIBLE`](/en/loi/#rollback_incompatible)).

So every migration must work with **both old and new code**. A `DROP COLUMN` or a column rename in one deploy doesn't, so split it into 3.

## Renaming a column: `orders.note` → `orders.comment`

| Deploy | Migration | Code |
|---|---|---|
| 1. Expand | `ALTER TABLE orders ADD COLUMN comment text;` | Write **both** columns, read `comment` then fall back to `note` |
| 2. Backfill | `UPDATE orders SET comment = note WHERE comment IS NULL;` | Unchanged |
| 3. Contract | `ALTER TABLE orders DROP COLUMN note;` | Use only `comment` |

- Push deploy 3 only once deploy 2 is `healthy` and no code reads `note` any more.
- Large tables: split the `UPDATE` by id range across several files to avoid long locks ([`MIGRATION_LOCK_TIMEOUT`](/en/loi/#migration_lock_timeout)).

## Dropping a column

| Deploy | Migration | Code |
|---|---|---|
| 1 | None | Remove every read and write of the column |
| 2 | `ALTER TABLE … DROP COLUMN …;` | Unchanged |

`NOT NULL` column without a `DEFAULT`: deploy 1 adds a migration `ALTER TABLE … ALTER COLUMN … DROP NOT NULL;` so new code can insert without writing that column.

## Approval

- `UPDATE`, `DROP COLUMN` and `DROP NOT NULL` are in the **changes or deletes data** group: approval is needed **on staging too**.
- If rehearsal finds data will be lost ([`MIGRATION_DATA_LOSS`](/en/loi/#migration_data_loss)), the approver also types `CONFIRM_MIGRATION` on the web.
- Need to keep the column's data: export before the contract deploy. After the migration you can't restore to a moment before it.

## See also

- [Running migrations safely](/en/huong-dan/migration-an-toan/)
- [Database and migrations](/en/huong-dan/database-va-migration/)
- [Staging, production and approval](/en/huong-dan/staging-production-va-duyet/)
