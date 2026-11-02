---
title: Secret
description: Đặt API key, password, config cho app; khi nào app nhận giá trị mới.
sidebar:
  order: 5
---

Secret là giá trị app cần lúc chạy nhưng không được nằm trong code: API key, JWT key, S3 credentials, SMTP password…

## Đặt secret

1. Mở **Cài đặt → Secrets** của environment.
2. Nhập **Tên secret** và **Giá trị secret** → **"Lưu secret"**.
3. Bấm **"Deploy"** ở trang Tổng quan, hoặc push code. Production chờ Owner hoặc Admin approve như mọi lần deploy.

App đọc mỗi secret qua **env var cùng tên**: secret `JWT_SECRET` là `process.env.JWT_SECRET`, `os.environ["JWT_SECRET"]`…

:::note[Secret vào app ở lần build tiếp theo]
Lưu secret không restart app. Secret mới hoặc giá trị mới chỉ vào app ở lần build + deploy kế tiếp. Plan cho người duyệt thấy secret nào được thêm, bỏ hoặc đổi version (không bao giờ hiện giá trị).
:::

## Quy tắc

| Quy tắc | Chi tiết |
|---|---|
| Tên | Chữ in hoa, số, `_`, bắt đầu bằng chữ in hoa, tối đa 64 ký tự. Ví dụ `S3_BUCKET`, `SMTP_PASSWORD` |
| Tên dành cho Embra | `DATABASE_URL` và tên bắt đầu bằng `EMBRA_` |
| Giá trị | Tối đa 64 KiB |
| Xem lại giá trị | **Không được**, kể cả Owner. Chỉ thấy tên và version |
| Bucket của Embra | Các biến `S3_*` Embra đặt ghi đè secret cùng tên |

Config không bí mật (tên shop, URL public, `TZ=Asia/Ho_Chi_Minh` để app in giờ Việt Nam…) cũng đặt ở đây. `[build] env` trong `embra.toml` chỉ dùng lúc build, không vào app. Xem [Biến môi trường](/huong-dan/bien-moi-truong/).

## Đổi hoặc gỡ secret

- **Đổi giá trị:** lưu lại cùng tên. Embra tạo version mới; lần build sau app dùng version mới nhất.
- **Gỡ:** bấm **"Thu hồi"** trên version mới nhất. Từ lần build sau, secret đó không còn trong app. Embra **không** tự quay về version cũ hơn.
- Bản đã deploy trước đó giữ đúng version nó dùng. Thu hồi một version thì các bản đang dùng version đó không redeploy được nữa.

Ai được đặt và xem tên secret: xem [Thành viên và phân quyền](/workspace/phan-quyen/). AI agent không đặt được secret.
