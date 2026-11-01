---
title: Chuyển app có sẵn sang Embra
description: Chuyển app và database Postgres đang chạy ở Vercel, Railway, Render, Heroku hay VPS sang Embra, rồi trỏ domain.
sidebar:
  order: 14
---

Trang này dành cho Owner, Admin hoặc developer đang có app chạy ở Vercel, Railway, Render, Heroku hay VPS và muốn chuyển sang Embra. Làm xong, app chạy trên Embra với Postgres riêng chứa dữ liệu cũ, và domain trỏ về Embra.

Thứ tự: sửa app → deploy schema → nhập dữ liệu → trỏ domain.

## Kiểm những gì cần đổi

| Mục | Vì sao | Cách làm |
|---|---|---|
| Cổng và địa chỉ | App chỉ nghe `127.0.0.1` thì Embra không gọi tới được | Lắng nghe `0.0.0.0` trên cổng ở biến `PORT` (mặc định 3000). [Chuẩn bị app](/huong-dan/chuan-bi-app/) |
| Health check | Bản mới chỉ nhận traffic sau 3 lần `GET` trả 2xx liên tiếp | Đặt `[deploy] health_path` tới đường dẫn trả 2xx, không chuyển hướng. [Health check](/huong-dan/chuan-bi-app/#health-check) |
| Ghi file | Hệ thống file chỉ đọc, chỉ `/tmp` ghi được và mất khi khởi động lại | Lưu file người dùng vào bucket S3. [Lưu file](/huong-dan/luu-file/) |
| Schema database | Tài khoản database của app không đổi được schema | Đưa schema vào `migrations/NNNN_ten.sql`, bỏ lệnh migrate lúc khởi động. [Database và migration](/huong-dan/database-va-migration/) |
| Extension, function, trigger, view | Migration có các lệnh này bị từ chối | App phụ thuộc vào chúng thì chưa chuyển nguyên trạng được |
| Biến môi trường | App đọc mỗi secret qua biến cùng tên | Dán file `.env` vào Secrets (xem bên dưới). [Secret](/huong-dan/secret/) |
| Lệnh khởi động, worker, cron | Embra đọc chúng từ `embra.toml` | `[deploy] start`, `[processes.<name>]`, `[cron.<name>]` (giờ UTC). [Chuẩn bị app](/huong-dan/chuan-bi-app/#embratoml) |

## Xử lý khác biệt theo nơi cũ

| Nơi cũ | Cần để ý |
|---|---|
| Vercel | `NEXT_PUBLIC_*` nhúng lúc build: đặt trong `[build] env`, không chứa giá trị bí mật. Vercel Postgres nay là Neon: dump bằng chuỗi kết nối direct, không qua pooler. |
| Railway, Render, Heroku | Các nơi này cũng đặt `PORT`, nên app thường chạy được ngay. Lệnh khởi động và tiến trình chạy nền đổi thành `[deploy] start` và `[processes.<name>]`. |
| VPS | Kiểm app có ghi log, ảnh tải lên hay cache ra đĩa không: những thứ đó chuyển sang `/tmp` hoặc bucket. Lệnh khởi động trong pm2, systemd hay Docker Compose đổi thành `[deploy] start`. |

Bản backup tải về từ nhà cung cấp cũ thường không đúng định dạng Embra nhận. Tạo file bằng lệnh `pg_dump` ở bước nhập dữ liệu.

## Đưa app và schema lên Embra

1. Thêm `database = true` vào `[deploy]` của `embra.toml`, cùng thư mục `migrations/` tạo đủ bảng của database cũ. Dùng Prisma thì làm theo [phần Prisma](/huong-dan/database-va-migration/#viết-migration).
2. Tạo app theo [Deploy từ GitHub](/huong-dan/deploy-tu-github/). Embra tạo environment `production` và build lần đầu, chưa có secret.
3. Mở **Cài đặt → Secrets**, bấm **"Dán .env"**.
4. Dán nội dung file `.env` của app cũ, bấm **"Lưu … secret"**. Embra bỏ qua `DATABASE_URL` và tên `EMBRA_*`.
5. Bấm **"Deploy"** (hoặc **"Build lại"**) ở trang Tổng quan để build lại kèm secret. Plan của lần build đầu bị huỷ, không cần duyệt.
6. Duyệt plan mới. Migration tạo bảng trống trong Postgres của Embra.
7. Mở địa chỉ `….onembra.com` của environment và kiểm app chạy được với database trống.

Có environment staging hoặc preview theo PR thì làm thử ở đó trước, cả bước nhập dữ liệu, rồi mới làm ở production.

## Nhập dữ liệu Postgres

Embra chỉ nhập **dòng dữ liệu** vào bảng đã có sẵn và **đang trống**. Schema luôn đi qua migration.

:::caution[Nhập trước khi app production nhận traffic]
Chỉ cần một bảng đích có dữ liệu (ví dụ một người đăng ký thử), lần nhập bị từ chối. Dữ liệu ghi ở app cũ sau lúc dump cũng không nhập bổ sung được vào bảng đã có dữ liệu.
:::

1. Nếu là lần nhập thật vào production, dừng ghi ở app cũ (bật trang bảo trì hoặc chế độ chỉ đọc). Dữ liệu ghi sau lúc dump không có trong file.
2. Chạy trên máy có quyền đọc database cũ, thay `<DATABASE_URL>` bằng chuỗi kết nối của nó:

   ```sh
   pg_dump --data-only --no-owner --no-acl -d "<DATABASE_URL>" | gzip > data.sql.gz
   ```

   Bảng nào đã có dữ liệu trên Embra (ví dụ bảng migration đã seed) thì bỏ dữ liệu của nó khỏi file:

   ```sh
   pg_dump --data-only --no-owner --no-acl --exclude-table-data=public.admin_users -d "<DATABASE_URL>" | gzip > data.sql.gz
   ```

3. Trên console Embra, mở trang **Tổng quan**, ở mục **Những gì đang chạy** bấm vào dòng **Database**.
4. Bấm **"Nhập dữ liệu…"**.
5. Chọn file ở **"File dump (.sql hoặc .sql.gz)"**, bấm **"Tải lên và kiểm"**. Embra báo số dòng và số bảng trong file.
6. Bấm **"Kiểm với database"**. Embra so file với database, chưa ghi gì. Mọi bảng hiện **"Sẽ nhập"** hoặc **"Bảng của ORM, bỏ qua"** là đạt.
7. Ở staging và preview, Embra nhập ngay. Ở production, bấm **"Mở trang duyệt"** và gửi trang đó cho Owner hoặc Admin.
8. Owner hoặc Admin bấm **"Duyệt và nhập dữ liệu"** trong vòng 1 giờ. Quá hạn thì lần nhập bị huỷ và phải tải file lên lại.
9. Chờ thông báo **"Đã nhập … dòng vào … bảng."**, rồi mở app và kiểm vài bản ghi bạn biết trước (mã đơn, tổng tiền), không chỉ đếm số dòng.

Cả lần nhập chạy trong một transaction: lỗi ở đâu thì database không đổi gì. Trong lúc nhập, deploy của environment phải chờ.

**Yêu cầu với file:**

- Bắt buộc `--data-only`, dạng SQL thuần (gzip được). File có `CREATE` hay `ALTER`, file tạo bằng `--inserts` hoặc định dạng custom (`-Fc`) đều bị từ chối.
- Chỉ nhận bảng trong schema `public`, mã hoá UTF8.
- Cỡ file, cả sau khi giải nén, không vượt dung lượng database của gói. File đã tải lên mà không dùng bị xoá sau 24 giờ.
- Bảng ghi lịch sử migration của ORM (`_prisma_migrations`, `knex_migrations`, `schema_migrations`, `django_migrations`…) được bỏ qua nếu database Embra không có.
- Chỉ Owner, Admin và developer thấy nút **"Nhập dữ liệu…"**.

## Sửa khi kiểm không đạt

| Embra báo | Cách sửa |
|---|---|
| **"Database không có bảng này"**, **"Thiếu cột: …"**, **"Database không có sequence …"** | Thêm bảng hoặc cột bằng migration rồi deploy, hoặc bỏ dữ liệu bảng đó bằng `--exclude-table-data`. Tạo file mới và tải lên lại. |
| **"Bảng đã có dữ liệu"** | Đã nhập file này rồi thì dữ liệu đã vào. Chưa nhập thì bỏ dữ liệu bảng đó bằng `--exclude-table-data` rồi tải lên lại. |
| File bị từ chối ngay khi tải lên | Chạy lại `pg_dump` đúng lệnh ở trên, có `--data-only`. Database cũ không dùng UTF8 thì thêm `--encoding=UTF8`. |

Embra chỉ nhập dump của Postgres; MySQL hay database khác chưa nhập được. Gặp lỗi khác, gửi email hello@embra.cloud kèm `operation_id` của lần nhập, tên workspace, environment và thời điểm.

## Trỏ domain về Embra

1. Hạ TTL của bản ghi domain ở nhà cung cấp DNS xuống khoảng 300 giây, trước 1–2 ngày.
2. Mở **Cài đặt → Domain riêng** của environment production, nhập domain, bấm **"Thêm domain"**.
3. Thêm bản ghi TXT Embra hiện. Bản ghi này không ảnh hưởng app cũ.
4. Khi dữ liệu đã nhập xong, đổi bản ghi CNAME (hoặc A với tên gốc) sang giá trị Embra hiện.
5. Bấm **"Kiểm tra"**. Embra cần cả TXT và CNAME (hoặc A) đúng mới xác minh; HTTPS được cấp ở lượt truy cập đầu tiên.
6. Giữ app và database cũ ở chế độ chỉ đọc vài ngày, phòng khi phát hiện thiếu dữ liệu.

Domain chưa xác minh được giữ 7 ngày, nên đừng thêm domain quá sớm. Chi tiết và lưu ý Cloudflare: [Domain riêng](/huong-dan/domain-rieng/).

## Xem thêm

- [Chuẩn bị app](/huong-dan/chuan-bi-app/)
- [Database và migration](/huong-dan/database-va-migration/)
- [Secret](/huong-dan/secret/)
- [Lưu file (bucket S3)](/huong-dan/luu-file/)
- [Domain riêng](/huong-dan/domain-rieng/)
- [Mã lỗi](/loi/)
