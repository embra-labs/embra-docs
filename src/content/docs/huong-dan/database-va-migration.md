---
title: Database và migration
description: Viết migration để qua migration gate - quy tắc file, Prisma, Embra phân loại câu lệnh thế nào, khi có sự cố.
sidebar:
  order: 4
---

Bật Postgres, quyền của app, backup: xem [Database](/huong-dan/database/). Quy trình một migration production từ đầu tới cuối: [Chạy migration an toàn](/huong-dan/migration-an-toan/).

## Viết migration

Mỗi thay đổi schema là một file SQL trong thư mục `migrations/` (đổi bằng `[deploy] migrations` trong `embra.toml`; `embra plan` đọc `migrations_dir` trong `embra.json`):

```
migrations/
  0001_init.sql
  0002_add_orders_status.sql
  0003_index_orders_created_at.sql
```

- Tên file đúng mẫu **`NNNN_ten.sql`**: 4 chữ số, rồi chữ thường, số hoặc `_`. File sai mẫu bị bỏ qua (build log có ghi).
- File chạy theo thứ tự tên. Chỉ đọc file ngay trong thư mục, không đọc thư mục con.
- **Không sửa file đã chạy.** Muốn đổi tiếp thì thêm file mới số lớn hơn.
- Mỗi file chạy trong một transaction. Không viết `BEGIN` hay `COMMIT`.
- Mỗi file tối đa 256 KiB; mỗi lần deploy tối đa 100 file, tổng 2 MiB.

### Dùng Prisma

Prisma lưu migration dạng `prisma/migrations/<thời gian>_<tên>/migration.sql`, Embra không đọc được. Bỏ `prisma migrate deploy` khỏi start command (giữ `prisma generate` lúc build), rồi chọn một trong hai cách:

- **Repo đã có migration Prisma:** copy sang thư mục phẳng, đánh số theo thứ tự (chạy lại sau mỗi `prisma migrate dev` rồi commit; file cũ giữ tên, chỉ thêm file mới).
- **Viết từng file:** sinh SQL bằng `prisma migrate diff … --script > migrations/0002_ten.sql`, review rồi commit.

<details>
<summary>Script copy migration Prisma</summary>

```sh
mkdir -p migrations
i=0
for d in prisma/migrations/*/; do
  [ -f "$d/migration.sql" ] || continue
  i=$((i + 1))
  name=$(basename "$d" | sed 's/^[0-9]*_//' | tr 'A-Z-' 'a-z_' | tr -cd 'a-z0-9_')
  cp "$d/migration.sql" "migrations/$(printf '%04d' "$i")_${name:-migration}.sql"
done
```

`prisma/migrations/20261027120000_init/migration.sql` thành `migrations/0001_init.sql`. Đừng sửa hay xoá migration cũ của Prisma, vì sẽ làm lệch số.

</details>

Dockerfile dựa trên Alpine cần `RUN apk add --no-cache openssl` để Prisma chạy; build tải được package này.

## Embra kiểm migration thế nào

Mỗi plan có migration được **rehearsal trên bản copy data** trước. Rehearsal fail thì production chưa bị đụng tới. Mỗi câu lệnh được xếp vào một nhóm:

| Nhóm | Ví dụ | Cần approve |
|---|---|---|
| An toàn | `CREATE TABLE`, `ADD COLUMN` cho phép null, `DROP INDEX`, `CREATE TYPE … AS ENUM` | Chỉ ở production |
| Đổi hoặc xoá data | `DROP TABLE`, `DROP COLUMN`, đổi tên bảng hoặc cột, `UPDATE`, `DELETE`, `INSERT` | Luôn cần, kể cả staging |
| Lock bảng lâu | `CREATE INDEX` (không `CONCURRENTLY`), `ALTER COLUMN TYPE`, `SET NOT NULL`, thêm foreign key | Chỉ ở production |
| Không chạy trong transaction | `CREATE INDEX CONCURRENTLY`: phải là câu lệnh duy nhất trong file | Chỉ ở production |
| **Chưa hỗ trợ** | function, procedure, trigger, view, `DO`, extension, `CREATE SCHEMA`, `GRANT`/`REVOKE`, `BEGIN`/`COMMIT`, `COPY` | Bị từ chối |

Production **luôn** cần Owner hoặc Admin approve, kể cả không có migration. Migration có thể làm mất data thì người duyệt gõ thêm `CONFIRM_MIGRATION`.

## Khi có sự cố

| Tình huống | Làm gì |
|---|---|
| Rehearsal fail (`MIGRATION_REHEARSAL_FAILED`) | Sửa file migration, push lại |
| Migration đã chạy nhưng app mới lỗi | Code cũ tiếp tục chạy trên schema mới. Sửa code cho tương thích rồi deploy lại |
| Cần đổi tên hoặc xoá cột | Tách làm nhiều lần deploy: [Đổi tên hoặc xoá cột không downtime](/huong-dan/expand-contract/) |
| Environment hiện **"Cần xác minh dữ liệu"** ([`MIGRATION_UNKNOWN`](/loi/#migration_unknown)) | Embra không chắc migration chạy xong chưa nên dừng mọi thay đổi, không tự retry. Gửi email hello@embra.cloud |

## Backup và khôi phục

Đã chuyển sang [Database](/huong-dan/database/#backup) và [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/#backup-của-database).
