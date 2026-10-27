---
title: Chuẩn bị app
description: App cần gì để chạy trên Embra, cách Embra build, và tham chiếu embra.toml.
sidebar:
  order: 2
---

## App phải làm gì

| Yêu cầu | Chi tiết |
|---|---|
| Lắng nghe đúng cổng | Lắng nghe ở `0.0.0.0` (không phải `127.0.0.1`) trên cổng khai ở `[deploy] port`, mặc định **3000**, trong khoảng 1024–65535. Embra đặt biến `PORT` bằng đúng cổng này (trừ khi bạn tự đặt secret `PORT`), nên app đọc `PORT` hoặc lắng nghe cố định trên cổng đó đều được. |
| Có đường dẫn kiểm tra sức khoẻ | `GET` tới `[deploy] health_path` (mặc định `/`) phải trả mã **2xx**. Chuyển hướng (3xx) không được tính là đạt. |
| Không ghi ra đĩa | Hệ thống file chỉ đọc. Chỉ `/tmp` ghi được (tối đa 256 MB, mất khi app khởi động lại). File người dùng tải lên thì lưu vào S3 hoặc bucket của Embra. |
| Không tự chạy migration | Tài khoản database của app chỉ đọc và ghi dữ liệu, không đổi được schema. Bỏ các lệnh như `prisma migrate deploy` khi khởi động. Migration đi qua Embra: xem [Database và migration](/huong-dan/database-va-migration/). |
| Đọc cấu hình từ biến môi trường | `DATABASE_URL` (khi có Postgres) và mỗi secret một biến cùng tên. |

## Kiểm tra sức khoẻ

Khi deploy, bản mới chạy song song với bản cũ.

1. Embra gọi `health_path` 2 giây một lần. Cần **3 lần 2xx liên tiếp** trong thời gian khởi động (`startup_grace_seconds`, mặc định 60 giây).
2. Đạt thì traffic chuyển sang bản mới. Embra theo dõi thêm 30 giây; lỗi quá 2 lần thì tự trả traffic về bản cũ.
3. Không đạt thì deploy dừng với `HEALTHCHECK_FAILED` và bản cũ vẫn chạy.

App khởi động chậm (ví dụ nạp cache lớn) thì tăng `startup_grace_seconds`, tối đa 300.

## Embra build app thế nào

- Repo có `Dockerfile` ở thư mục gốc (hoặc ở `root`) thì Embra dùng nó. Không có thì Embra dùng **Railpack** để tự nhận diện và build (Node, Python, Go…).
- Mỗi lần build tối đa 25 phút, chạy trong máy ảo riêng.
- Lúc build, mạng chỉ đi được tới: GitHub (gồm `ghcr.io`), npm và yarn (`registry.npmjs.org`, `registry.yarnpkg.com`, `nodejs.org`), PyPI (`pypi.org`, `files.pythonhosted.org`), Docker Hub, kho gói Alpine, Debian và Ubuntu, và `binaries.prisma.sh`. Image, gói npm và Node được Embra cache sẵn nên build lần sau nhanh hơn. Log build báo `egress từ chối "<host>"` nghĩa là build cần một host chưa được mở: gửi tên host đó tới hello@embra.cloud.
- **Build không nhận secret.** `[build] env` chỉ dùng lúc build, không vào app và không được chứa giá trị bí mật.
- Image phải nằm trong dung lượng đĩa của gói.

## `embra.toml`

File tuỳ chọn, đặt ở gốc repo. Không có file thì Embra dùng mặc định. Trường lạ hoặc sai kiểu đều bị báo lỗi.

```toml
# root = "apps/web"          # monorepo: thư mục chứa app, tính từ gốc repo

[build]
# builder = "dockerfile"     # "dockerfile" hoặc "railpack"; bỏ trống để tự chọn
# dockerfile = "Dockerfile"  # đường dẫn, tính từ root
env = { VITE_SHOP_NAME = "Cửa hàng" }   # chỉ dùng lúc build, không đặt secret ở đây

[deploy]
port = 3000                  # mặc định 3000
health_path = "/healthz"     # mặc định "/"
startup_grace_seconds = 60   # 5–300
# start = ["node", "dist/main.js"]   # thay lệnh khởi động của image
migrations = "migrations"    # thư mục chứa file NNNN_ten.sql, mặc định "migrations"
database = true              # cần Postgres: đặt TRƯỚC lần deploy đầu tiên

[processes.worker]           # tiến trình chạy nền (theo giới hạn gói)
command = ["node", "dist/worker.js"]

[cron.cleanup]               # việc định kỳ, giờ UTC, cách nhau ít nhất 5 phút
schedule = "0 3 * * *"
command = ["node", "dist/cleanup.js"]

[preview]
seed = "seed/preview.sql"    # dữ liệu mẫu cho preview theo PR
```

:::caution[`database = true` chỉ có tác dụng ở lần deploy đầu]
Sau khi environment đã có bản đang chạy, Embra giữ cấu hình database của bản đó; sửa `database` trong `embra.toml` không đổi được nữa. Nếu lần đầu bạn quên, gửi email hello@embra.cloud để đội Embra bật giúp.
:::

Quy tắc chi tiết:

- `[build] env`: tên khớp `^[A-Z][A-Z0-9_]{0,63}$`, không bắt đầu bằng `EMBRA_`, mỗi giá trị tối đa 4 KiB.
- `[processes.<tên>]`: tên chữ thường và số, tối đa 16 ký tự, không được là `web`.
- `[cron.<tên>]`: lịch 5 trường chuẩn của cron, tính theo giờ UTC. Không hỗ trợ `@hourly` hay `@every`. Hai lượt chạy cách nhau ít nhất 5 phút.
- Số worker và cron theo giới hạn gói. Gói dùng thử không có cron.
