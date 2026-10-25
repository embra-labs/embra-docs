---
title: Database và migration
description: Postgres riêng cho mỗi environment, cách viết migration để đi qua cổng duyệt, backup và khôi phục.
sidebar:
  order: 4
---

## Bật Postgres

Đặt trong `embra.toml` **trước lần deploy đầu tiên**:

```toml
[deploy]
database = true
```

Lần build đầu tiên, Embra dựng Postgres riêng cho environment rồi mới deploy app.

- Phiên bản: **PostgreSQL 18**.
- App nhận chuỗi kết nối qua biến **`DATABASE_URL`**. Đừng tự đặt biến này.
- Database chỉ nhận kết nối từ app trong cùng environment, không mở ra internet.
- Tài khoản của app chỉ **đọc và ghi dữ liệu** (SELECT, INSERT, UPDATE, DELETE), không tạo hay sửa bảng được. Schema chỉ đổi qua migration.
- Dung lượng và RAM theo gói. Chưa hỗ trợ extension (`CREATE EXTENSION`).

:::caution
`database = true` chỉ có tác dụng ở lần deploy đầu. Quên bật thì gửi email hello@embra.cloud.
:::

## Viết migration

Mỗi thay đổi schema là một file SQL trong thư mục `migrations/` (đổi được bằng `[deploy] migrations`):

```
migrations/
  0001_init.sql
  0002_add_orders_status.sql
  0003_index_orders_created_at.sql
```

- Tên file đúng mẫu **`NNNN_ten.sql`**: 4 chữ số, rồi chữ thường, số hoặc gạch dưới. File sai mẫu bị bỏ qua (log build có ghi).
- File chạy theo thứ tự tên. Embra chỉ đọc file ở ngay trong thư mục, không đọc thư mục con.
- **Không sửa file đã chạy.** Muốn đổi tiếp thì thêm file mới có số lớn hơn.
- Mỗi file chạy trong một transaction. Không viết `BEGIN` hay `COMMIT`.
- Mỗi file tối đa 256 KiB; mỗi lần deploy tối đa 100 file, tổng 2 MiB.

**Dùng Prisma?** Prisma lưu migration dạng `migrations/<thời gian>/migration.sql`, Embra không đọc được. Hãy sinh file SQL bằng `prisma migrate diff … --script > migrations/0002_ten.sql`, kiểm file rồi commit. Bỏ `prisma migrate deploy` khỏi lệnh khởi động app.

## Embra kiểm migration thế nào

Mỗi plan có migration được **diễn tập trên bản sao dữ liệu** trước. Diễn tập lỗi thì production chưa bị đụng tới. Embra xếp mỗi câu lệnh vào một nhóm:

| Nhóm | Ví dụ | Cần duyệt |
|---|---|---|
| An toàn | `CREATE TABLE`, `ADD COLUMN` cho phép null, `DROP INDEX`, `CREATE TYPE … AS ENUM` | Chỉ ở production |
| Đổi hoặc xoá dữ liệu | `DROP TABLE`, `DROP COLUMN`, đổi tên bảng hoặc cột, `UPDATE`, `DELETE`, `INSERT` | Luôn cần, kể cả staging |
| Khoá bảng lâu | `CREATE INDEX` (không `CONCURRENTLY`), `ALTER COLUMN TYPE`, `SET NOT NULL`, thêm khoá ngoại | Chỉ ở production |
| Không chạy trong transaction | `CREATE INDEX CONCURRENTLY`: phải là câu lệnh duy nhất trong file của nó | Chỉ ở production |
| **Chưa hỗ trợ** | function, procedure, trigger, view, `DO`, extension, `CREATE SCHEMA`, `GRANT`/`REVOKE`, `BEGIN`/`COMMIT`, `COPY` | Bị từ chối |

Production **luôn** cần Owner hoặc Admin duyệt, kể cả khi không có migration. Nếu migration có thể làm mất dữ liệu, người duyệt phải gõ thêm `CONFIRM_MIGRATION`.

## Khi có sự cố

- **Diễn tập lỗi** (`MIGRATION_REHEARSAL_FAILED`): sửa file migration, push lại.
- **Migration đã chạy nhưng app mới lỗi:** code cũ tiếp tục chạy trên schema mới. Sửa code để tương thích rồi deploy lại.
- **Environment hiện "Cần Embra kiểm tra database":** Embra không chắc migration đã chạy xong hay chưa nên dừng mọi thay đổi, không tự thử lại. Gửi email hello@embra.cloud.

## Backup và khôi phục

- Mọi thay đổi được ghi lại liên tục, và có bản sao ở nơi lưu trữ bên ngoài máy chủ.
- Embra **tự khôi phục thử** từ bản sao bên ngoài mỗi ngày để chắc backup dùng được. Trang Tổng quan hiện kết quả lần thử gần nhất.
- **Khôi phục về một thời điểm:** chọn "Khôi phục về thời điểm…" và một mốc trong khoảng hiển thị.
  - Embra dựng một database mới từ mốc đó, chạy song song, chưa đụng tới database đang chạy.
  - Owner hoặc Admin xem rồi duyệt trong vòng 2 giờ để chuyển app sang database mới.
  - Database cũ được giữ 72 giờ (gói dùng thử 24 giờ) phòng khi cần quay lại.
- Không khôi phục về mốc trước một migration đã chạy được: schema hiện tại sẽ không khớp.
