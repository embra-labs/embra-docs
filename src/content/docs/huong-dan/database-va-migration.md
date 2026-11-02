---
title: Database và migration
description: Postgres riêng cho mỗi environment, viết migration để qua approval gate, backup và restore.
sidebar:
  order: 4
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

## Viết migration

Mỗi thay đổi schema là một file SQL trong thư mục `migrations/` (đổi bằng `[deploy] migrations`):

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
| Environment hiện **"Cần xác minh dữ liệu"** ([`MIGRATION_UNKNOWN`](/loi/#migration_unknown)) | Embra không chắc migration chạy xong chưa nên dừng mọi thay đổi, không tự retry. Gửi email hello@embra.cloud |

## Backup và khôi phục

- WAL ghi liên tục mọi thay đổi, cộng một full backup mỗi 7 ngày. Backup nằm trên server, ở ổ đĩa riêng, tách khỏi ổ chứa database. **Bản copy bên ngoài server chưa bật.**
- Sau mỗi full backup, Embra **tự restore thử** để chắc backup dùng được. Trang Tổng quan hiện kết quả lần thử gần nhất.
- Không restore được về mốc trước một migration đã chạy: schema hiện tại sẽ không khớp.

**Restore về một thời điểm (point-in-time):** chọn **Khôi phục dữ liệu…** và một mốc trong khoảng hiển thị.

1. Embra dựng database mới từ mốc đó, chạy song song, chưa đụng database đang chạy.
2. Owner hoặc Admin xem rồi approve trong vòng 2 giờ để chuyển app sang database mới.
3. Database cũ được giữ 72 giờ (gói dùng thử 24 giờ) phòng khi cần quay lại.
