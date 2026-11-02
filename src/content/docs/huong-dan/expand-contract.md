---
title: Đổi tên hoặc xoá cột không downtime
description: Expand/contract - tách một thay đổi schema phá vỡ code cũ thành 3 lần deploy để app không lỗi và luôn rollback được.
sidebar:
  order: 6
---

Lúc migration vừa chạy xong, **code cũ vẫn đang phục vụ trên schema mới** cho tới khi code mới qua health check. Health check fail thì code cũ ở lại luôn trên schema mới. Và sau khi migration đã chạy, rollback code về bản trước bị chặn ([`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible)).

Vì vậy mỗi migration phải chạy được với **cả code cũ lẫn code mới**. `DROP COLUMN` hay đổi tên cột trong một lần deploy thì không, nên tách làm 3 lần.

## Đổi tên cột: `orders.note` → `orders.comment`

| Deploy | Migration | Code |
|---|---|---|
| 1. Expand | `ALTER TABLE orders ADD COLUMN comment text;` | Ghi **cả hai** cột, đọc `comment` rồi fallback `note` |
| 2. Backfill | `UPDATE orders SET comment = note WHERE comment IS NULL;` | Giữ nguyên |
| 3. Contract | `ALTER TABLE orders DROP COLUMN note;` | Chỉ dùng `comment` |

- Deploy 3 chỉ push khi deploy 2 đã `healthy` và không còn code nào đọc `note`.
- Bảng lớn: chia `UPDATE` theo khoảng id thành nhiều file để tránh lock lâu ([`MIGRATION_LOCK_TIMEOUT`](/loi/#migration_lock_timeout)).

## Xoá cột

| Deploy | Migration | Code |
|---|---|---|
| 1 | Không có | Bỏ mọi chỗ đọc và ghi cột |
| 2 | `ALTER TABLE … DROP COLUMN …;` | Giữ nguyên |

Cột `NOT NULL` không có `DEFAULT`: deploy 1 thêm migration `ALTER TABLE … ALTER COLUMN … DROP NOT NULL;` để code mới insert được khi không ghi cột đó.

## Approve

- `UPDATE`, `DROP COLUMN` và `DROP NOT NULL` thuộc nhóm **đổi hoặc xoá data**: cần approve **cả ở staging**.
- Rehearsal thấy sẽ mất data ([`MIGRATION_DATA_LOSS`](/loi/#migration_data_loss)): người duyệt gõ thêm `CONFIRM_MIGRATION` trên web.
- Cần giữ data của cột: export trước deploy contract. Sau migration không restore về mốc trước đó được.

## Xem thêm

- [Chạy migration an toàn](/huong-dan/migration-an-toan/)
- [Database và migration](/huong-dan/database-va-migration/)
- [Duyệt production](/huong-dan/staging-production-va-duyet/)
