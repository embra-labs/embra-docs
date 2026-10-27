---
title: Bắt đầu nhanh
description: Từ đăng nhập tới app chạy trên Embra, kèm Postgres, secret và domain riêng.
sidebar:
  order: 2
---

Tám bước để đưa một app từ GitHub lên Embra. Mỗi bước có trang hướng dẫn riêng.

Bạn cần:

- một tài khoản GitHub đã tạo được ít nhất 30 ngày;
- một repo app web, có Dockerfile hoặc là project Node, Python, Go… mà Embra tự nhận diện được.

## Danh sách việc

1. **Đăng nhập và nhận gói dùng thử.** Vào console, bấm "Đăng nhập bằng GitHub". Workspace dùng thử 7 ngày được tạo ngay. → [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)
2. **Chuẩn bị repo.** App lắng nghe ở `0.0.0.0` trên cổng khai trong `embra.toml` (mặc định 3000), có đường dẫn kiểm tra sức khoẻ trả mã 2xx, không ghi file ra đĩa ngoài `/tmp`. Cần Postgres thì thêm `database = true` **trước lần deploy đầu tiên**. → [Chuẩn bị app](/huong-dan/chuan-bi-app/)
3. **Deploy từ GitHub.** "＋ Tạo mới" → "Deploy từ GitHub" → "Kết nối GitHub ↗" → chọn repo → "Tạo và triển khai". → [Deploy từ GitHub](/huong-dan/deploy-tu-github/)
4. **Database và migration.** Viết thay đổi schema thành file `migrations/0001_ten.sql`. Embra diễn tập trên bản sao dữ liệu rồi mới chạy thật. → [Database và migration](/huong-dan/database-va-migration/)
5. **Lưu file (tuỳ chọn).** Mỗi gói có một bucket S3 cho mỗi environment: "＋ Tạo mới" → "Lưu file". App nhận biến `S3_*` từ lần deploy sau. → [Lưu file (bucket S3)](/huong-dan/luu-file/)
5. **Đặt secret.** Cài đặt → Secrets. App đọc mỗi secret qua biến môi trường cùng tên, từ lần build tiếp theo. → [Secret](/huong-dan/secret/)
6. **Duyệt production và mở app.** Production luôn cần Owner hoặc Admin duyệt. Bấm "Duyệt", gõ tên environment để xác nhận. App có địa chỉ `https://<app>-production-<mã>.onembra.com`.
7. **Gắn domain riêng.** Cài đặt → Domain riêng. Thêm bản ghi TXT và CNAME. Dùng Cloudflare thì để đám mây **xám** (DNS only). → [Domain riêng](/huong-dan/domain-rieng/)
8. **Mời đội và trả tiền.** Cài đặt → Thành viên. Người được mời không được có sẵn workspace Embra riêng. Chọn gói trước khi hết 7 ngày dùng thử, nếu không app và dữ liệu bị xoá. → [Thành viên và phân quyền](/workspace/phan-quyen/), [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)

## Dùng CLI?

CLI `embra` đã có đủ lệnh ([danh sách lệnh](/cli/lenh/)), nhưng **đăng nhập CLI cho khách sắp có**: trang duyệt đăng nhập trên trình duyệt chưa được bật. Trong lúc chờ, mọi bước ở trên làm được hoàn toàn trên web.

## Nếu có lỗi

- **Build lỗi:** bấm "Xem log build" ở trang Tổng quan.
- **App không lên (`HEALTHCHECK_FAILED`):** kiểm cổng và đường dẫn kiểm tra sức khoẻ. Xem [Chuẩn bị app](/huong-dan/chuan-bi-app/#kiểm-tra-sức-khoẻ).
- **Environment hiện "Cần Embra kiểm tra database" hoặc "Cần Embra hỗ trợ":** một thao tác chưa rõ kết quả. Embra dừng lại thay vì tự thử lại. Gửi email hello@embra.cloud.
