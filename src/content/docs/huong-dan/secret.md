---
title: Secret
description: Đặt khoá API, mật khẩu và cấu hình cho app; khi nào app nhận được.
sidebar:
  order: 5
---

Secret là giá trị app cần lúc chạy mà không được nằm trong code: khoá API, khoá JWT, thông tin S3, mật khẩu SMTP…

## Đặt secret

1. Mở **Cài đặt → Secrets** của environment.
2. Nhập **Tên secret** và **Giá trị secret**, bấm **"Lưu secret"**.
3. Bấm **"Triển khai"** ở trang Tổng quan, hoặc push code. Production thì chờ Owner hoặc Admin duyệt như mọi lần deploy.

App đọc mỗi secret qua **biến môi trường cùng tên**: secret `JWT_SECRET` là `process.env.JWT_SECRET`, `os.environ["JWT_SECRET"]`…

:::note[Secret vào app ở lần build tiếp theo]
Lưu secret không tự khởi động lại app. Secret mới hoặc giá trị mới chỉ vào app ở lần build và deploy kế tiếp. Plan cho người duyệt thấy secret nào được thêm, bỏ hoặc đổi version (không bao giờ hiện giá trị).
:::

## Quy tắc

- Tên chỉ gồm **chữ in hoa, số và dấu gạch dưới**, bắt đầu bằng chữ in hoa, tối đa 64 ký tự. Ví dụ `S3_BUCKET`, `SMTP_PASSWORD`.
- `DATABASE_URL` và tên bắt đầu bằng `EMBRA_` dành cho Embra, không đặt được.
- Mỗi giá trị tối đa 64 KiB.
- Sau khi lưu, **không xem lại được giá trị**, kể cả Owner. Chỉ thấy tên và version.
- Cấu hình không bí mật (tên shop, URL công khai…) cũng đặt ở đây. `[build] env` trong `embra.toml` chỉ dùng lúc build, không vào app.
- Environment có bucket của Embra thì các biến `S3_*` do Embra đặt sẽ ghi đè secret cùng tên.

## Đổi hoặc gỡ secret

- **Đổi giá trị:** lưu lại cùng tên. Embra tạo version mới, và lần build sau app dùng version mới nhất.
- **Gỡ:** bấm "Thu hồi" trên version mới nhất. Từ lần build sau, secret đó không còn trong app. Embra **không** tự quay về version cũ hơn.
- Bản đã deploy trước đó vẫn giữ đúng version nó dùng. Thu hồi một version thì những bản đang dùng version đó không deploy lại được nữa.

Ai được đặt và xem tên secret: xem [Thành viên và phân quyền](/workspace/phan-quyen/). AI agent không đặt được secret.
