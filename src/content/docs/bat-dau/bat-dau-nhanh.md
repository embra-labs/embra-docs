---
title: Bắt đầu nhanh
description: Từ login tới app chạy trên Embra, kèm Postgres, secret và domain riêng.
sidebar:
  order: 2
---

Bạn cần:

- Account GitHub tạo được ít nhất 30 ngày.
- Repo web app có Dockerfile, hoặc là project Node, Python, Go… mà Embra tự nhận diện được.

## Danh sách việc

Mỗi bước có trang hướng dẫn riêng (link ở cuối bước).

1. **Login, nhận gói dùng thử.** Vào console → **"Đăng nhập bằng GitHub"**. Workspace dùng thử 7 ngày được tạo ngay. → [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)
2. **Chuẩn bị repo.** App listen `0.0.0.0` trên port khai trong `embra.toml` (mặc định 3000), có health check path trả 2xx, không ghi file ra đĩa ngoài `/tmp`. Cần Postgres thì thêm `database = true` (thêm sau deploy đầu cũng được). → [Chuẩn bị app](/huong-dan/chuan-bi-app/)
3. **Deploy từ GitHub.** **"＋ Tạo mới"** → **"Deploy từ GitHub"** → **"Kết nối GitHub ↗"** → chọn repo → **"Tạo và deploy"**. → [Deploy từ GitHub](/huong-dan/deploy-tu-github/)
4. **Database và migration.** Viết thay đổi schema thành file `migrations/0001_ten.sql`. Embra chạy thử trên bản copy data rồi mới chạy thật. → [Database và migration](/huong-dan/database-va-migration/)
5. **Lưu file (tuỳ chọn).** Mỗi gói có một bucket S3 cho mỗi environment: **"＋ Tạo mới"** → **"Bucket"**. App nhận env var `S3_*` từ lần deploy sau. → [Lưu file (bucket S3)](/huong-dan/luu-file/)
6. **Đặt secret.** **Cài đặt → Secrets**. App đọc mỗi secret qua env var cùng tên, từ lần build tiếp theo. → [Secret](/huong-dan/secret/)
7. **Approve production, mở app.** Production luôn cần Owner hoặc Admin approve: **"Xem và duyệt"** → gõ tên environment → **"Duyệt và deploy"**. App chạy ở `https://<app>-production-<mã>.onembra.com`.
8. **Gắn domain riêng.** **Cài đặt → Domain**, thêm record TXT và CNAME. Dùng Cloudflare thì để đám mây **xám** (DNS only). → [Domain riêng](/huong-dan/domain-rieng/)
9. **Mời đội, trả tiền.** **Cài đặt → Thành viên**. Người được mời nhận lời mời ở lần login sau, bằng đúng email được mời, kể cả khi đã có workspace riêng. Chọn gói trước khi hết 7 ngày dùng thử, nếu không app và data bị xoá. → [Thành viên và phân quyền](/workspace/phan-quyen/), [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)

## Dùng CLI?

CLI `embra` đã đủ lệnh ([danh sách lệnh](/cli/lenh/)), nhưng **CLI login cho khách chưa bật**: trang approve login trên browser chưa mở. Trong lúc chờ, mọi bước ở trên làm được hết trên web.

## Gặp lỗi

| Thấy gì | Làm gì |
|---|---|
| Build fail | Bấm **"Xem build logs"** ở trang Tổng quan, tra mã lỗi ở [Mã lỗi và cách sửa](/loi/) |
| App không lên (`HEALTHCHECK_FAILED`) | Kiểm port và health check path. Xem [Health check](/huong-dan/chuan-bi-app/#health-check) |
| Environment hiện "Cần xác minh dữ liệu", "Cần đội Embra hỗ trợ" hoặc "Chờ đội Embra kiểm tra" | Một thao tác chưa rõ kết quả, Embra dừng thay vì tự retry. Email hello@embra.cloud, xem [Khi Embra dừng lại chờ kiểm tra](/loi/#recovery_required) |
