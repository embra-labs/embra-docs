---
title: Database
description: Postgres riêng cho mỗi environment - bật, kết nối, quyền của app, backup.
sidebar:
  order: 3
---

## Bật Postgres

Thêm vào `embra.toml`:

```toml
[deploy]
database = true
```

Lần build đầu có dòng này, Embra dựng Postgres riêng cho environment rồi mới deploy app. Bật từ đầu hay thêm sau lần deploy đầu đều được.

| Mục | Chi tiết |
|---|---|
| Version | **PostgreSQL 18** |
| Connection string | Env var **`DATABASE_URL`**. Đừng tự đặt biến này |
| Network | Chỉ app trong cùng environment kết nối được, không mở ra internet |
| Quyền của app | Chỉ **đọc/ghi data** (SELECT, INSERT, UPDATE, DELETE), không tạo hay sửa bảng. Schema chỉ đổi qua migration |
| Dung lượng, RAM | Theo gói |
| Extension | Chưa hỗ trợ (`CREATE EXTENSION`) |

:::note
Bỏ `database = true` khỏi `embra.toml` sau này **không** gỡ hay xoá database đang có.
:::

## Backup

Environment có Postgres được backup tự động, không cần bật.

| Mục | Chi tiết |
|---|---|
| Liên tục | WAL ghi mọi thay đổi, đẩy vào backup ít nhất mỗi phút |
| Bản đầy đủ | Mỗi 7 ngày, giữ 2 bản gần nhất |
| Restore thử | Gói trả phí mỗi ngày trên bản sao cách ly, có đo RTO; mỗi tuần từ bản copy ngoài server. Chi tiết ở [Backup của database](/huong-dan/rollback-va-khoi-phuc/#backup-của-database) |
| Nơi lưu | Trên server, ổ đĩa riêng tách khỏi ổ chứa database, và bản copy trên object storage của Cloudfly tại Hà Nội (sync khoảng mỗi phút) |
| Restore | Về một mốc thời gian, xem trước rồi Owner hoặc Admin approve. Không về được mốc trước một migration đã chạy |

Chi tiết restore, export: [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/#backup-của-database).

## Xem thêm

- [Database và migration](/huong-dan/database-va-migration/)
- [Chạy migration an toàn](/huong-dan/migration-an-toan/)
