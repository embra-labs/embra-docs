---
title: Chuẩn bị app
description: App cần gì để chạy trên Embra, Embra build thế nào, tham chiếu embra.toml.
sidebar:
  order: 2
---

## App phải làm gì

| Yêu cầu | Chi tiết |
|---|---|
| Listen đúng port | Listen `0.0.0.0` (không phải `127.0.0.1`) trên port ở `[deploy] port`, mặc định **3000**, trong khoảng 1024–65535. Embra đặt `PORT` bằng đúng port này (trừ khi bạn tự đặt secret `PORT`), nên đọc `PORT` hay hardcode port đó đều được |
| Có health check path | `GET` tới `[deploy] health_path` (mặc định `/`) phải trả **2xx**. Redirect (3xx) không tính là đạt |
| Không ghi ra đĩa | Filesystem read-only. Chỉ `/tmp` ghi được (tối đa 256 MB, mất khi app restart). File user upload thì lưu vào S3 hoặc bucket của Embra |
| Không tự chạy migration | Database user của app chỉ đọc/ghi data, không đổi được schema. Bỏ lệnh kiểu `prisma migrate deploy` lúc start. Migration đi qua Embra: xem [Database và migration](/huong-dan/database-va-migration/) |
| Đọc config từ env var | `DATABASE_URL` (khi có Postgres) và mỗi secret một env var cùng tên |

## Health check

Lúc deploy, bản mới chạy song song với bản cũ.

1. Embra gọi `health_path` mỗi 2 giây. Cần **3 lần 2xx liên tiếp** trong thời gian khởi động (`startup_grace_seconds`, mặc định 60 giây).
2. Đạt → traffic chuyển sang bản mới. Embra theo dõi thêm 30 giây; lỗi quá 2 lần thì tự trả traffic về bản cũ.
3. Không đạt → deploy dừng với `HEALTHCHECK_FAILED`, bản cũ vẫn chạy.

App khởi động chậm (ví dụ load cache lớn) thì tăng `startup_grace_seconds`, tối đa 300.

## Embra build app thế nào

- Có `Dockerfile` ở root repo (hoặc ở `root`) → Embra dùng nó. Không có → Embra dùng **Railpack** tự nhận diện và build (Node, Python, Go…).
- Mỗi build tối đa 25 phút, chạy trong VM riêng.
- **Build không nhận secret.** `[build] env` chỉ dùng lúc build, không vào app, không được chứa giá trị bí mật.
- Image phải nằm trong dung lượng đĩa của gói.
- Image, package npm và Node được Embra cache sẵn nên các build sau nhanh hơn.

<details>
<summary>Lúc build, network đi được tới đâu</summary>

Chỉ tới: GitHub (gồm `ghcr.io`), npm và yarn (`registry.npmjs.org`, `registry.yarnpkg.com`, `nodejs.org`), PyPI (`pypi.org`, `files.pythonhosted.org`), Docker Hub, package repo Alpine, Debian và Ubuntu, và `binaries.prisma.sh`.

Build log báo `egress từ chối "<host>"` nghĩa là build cần một host chưa được mở: gửi tên host đó tới hello@embra.cloud.

</details>

## `embra.toml`

File tuỳ chọn, đặt ở root repo. Không có thì Embra dùng mặc định. Field lạ hoặc sai kiểu đều báo lỗi.

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
database = true              # cần Postgres: Embra dựng DB và đặt DATABASE_URL

[processes.worker]           # tiến trình chạy nền (theo giới hạn gói)
command = ["node", "dist/worker.js"]

[cron.cleanup]               # việc định kỳ, giờ UTC, cách nhau ít nhất 5 phút
schedule = "0 3 * * *"
command = ["node", "dist/cleanup.js"]

[preview]
seed = "seed/preview.sql"    # dữ liệu mẫu cho preview theo PR
```

:::note[Thêm `database = true` sau lần deploy đầu]
Được. Build kế tiếp, Embra dựng Postgres cho environment trước rồi mới deploy bản mới, kèm `DATABASE_URL`. Sau đó bỏ dòng này khỏi `embra.toml` **không** gỡ hay xoá database đang có.
:::

| Field | Quy tắc |
|---|---|
| `[build] env` | Tên khớp `^[A-Z][A-Z0-9_]{0,63}$`, không bắt đầu bằng `EMBRA_`, mỗi giá trị tối đa 4 KiB |
| `[processes.<tên>]` | Tên chữ thường và số, tối đa 16 ký tự, không được là `web` |
| `[cron.<tên>]` | Cron 5 field chuẩn, giờ UTC. Không hỗ trợ `@hourly` hay `@every`. Hai lần chạy cách nhau ít nhất 5 phút |
| Worker, cron | Số lượng theo giới hạn gói. Gói dùng thử không có cron |
