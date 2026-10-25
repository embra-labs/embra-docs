---
title: Deploy từ GitHub
description: Kết nối GitHub, tạo app, build tự động khi push, duyệt production và xem log.
sidebar:
  order: 3
---

## Tạo app lần đầu

1. Bấm **"＋ Tạo mới"** → **"Deploy từ GitHub"**.
2. Bấm **"Kết nối GitHub ↗"** và cài Embra GitHub App cho tài khoản hoặc tổ chức chứa repo. Bạn chọn được repo nào cho Embra thấy. Không thấy repo thì bấm **"Không thấy repo? Cập nhật quyền GitHub ↗"**, rồi **"Tải lại"**.
3. Chọn repo, bấm **"Tiếp tục"**.
4. Đặt **Tên ứng dụng**: chữ thường, số và dấu gạch ngang, bắt đầu bằng chữ cái. Trong **"Cấu hình nâng cao"**, chọn **Nhánh Git** (mặc định là nhánh chính) và **Thư mục gốc** nếu là monorepo.
5. Bấm **"Tạo và triển khai"**. Embra tạo environment `production`, nối repo với nhánh đã chọn rồi bắt đầu build.

Chỉ người đăng nhập bằng GitHub mới kết nối được repo, và chỉ những repo mà tài khoản GitHub đó đọc được.

## Duyệt production

Build xong, Embra lập **plan**: bản tóm tắt thay đổi (image mới, secret thêm, bớt hoặc đổi version, migration chờ chạy).

- **Production luôn chờ Owner hoặc Admin duyệt**, kể cả khi không có migration. Developer và AI agent không duyệt được.
- Thanh plan hiện "… thay đổi chờ áp dụng". Bấm **"Chi tiết"** để xem, hoặc **"Duyệt"**. Trong phần **"Quyết định"**, gõ tên environment để xác nhận rồi bấm **"Duyệt"** lần nữa. Nếu migration có thể làm mất dữ liệu, bạn phải gõ thêm `CONFIRM_MIGRATION`.
- Plan chờ duyệt hết hạn sau 24 giờ. Có build mới thì plan cũ bị huỷ, để không bao giờ duyệt nhầm bản cũ.
- Duyệt cần người thật: phiên web đăng nhập trong vòng 12 giờ. Xem [Thành viên và phân quyền](/workspace/phan-quyen/#việc-cần-người-thật).

Sau khi duyệt, app có địa chỉ:

```
https://<tên-app>-production-<mã workspace>.onembra.com
```

## Build tự động khi push

- Mỗi lần **push lên nhánh đã nối**, Embra build commit đó. Push lên nhánh khác hay tạo tag thì không.
- Build mới huỷ build cũ đang chạy của cùng environment.
- Muốn build lại commit mới nhất của nhánh mà không push, bấm **"Triển khai"** ở trang Tổng quan.
- Production vẫn chờ duyệt sau mỗi build. Staging và preview tự deploy, trừ khi có migration đổi dữ liệu.

## Preview theo pull request

Ở gói có preview (xem [bảng giá](https://embra.cloud/bang-gia/)), mỗi pull request vào nhánh production có một environment `pr<số>` riêng:

- Địa chỉ: `pr<số>-<địa chỉ production>`.
- **Database mới, rỗng**: không chép dữ liệu production. Có thể nạp dữ liệu mẫu bằng `[preview] seed`.
- Không mang theo secret, bucket hay domain của production.
- Tự xoá khi đóng PR, hoặc sau 72 giờ không có push mới.
- PR từ fork bị bỏ qua.

## Xem log

- **Log build:** "Xem log build" ở trang Tổng quan.
- **Log app:** tab **"Nhật ký"**.
- Thời gian giữ log và metrics tuỳ gói (gói dùng thử 1 ngày).

## Rollback

Embra giữ các bản đã chạy để trả code về bản trước. Rollback code không cần duyệt, vì nó chỉ chạy lại code đã được duyệt; Embra từ chối nếu migration đã đi tiếp sau bản đó. **Nút rollback trên web sắp có**, và lệnh `embra rollback` cần đăng nhập CLI (cũng sắp có). Trong lúc chờ, cần rollback gấp thì gửi email hello@embra.cloud.
