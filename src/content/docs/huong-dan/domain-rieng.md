---
title: Domain riêng
description: Gắn domain của bạn vào app, bản ghi DNS cần thêm, HTTPS và lưu ý khi dùng Cloudflare.
sidebar:
  order: 7
---

Gói dùng thử không có domain riêng. Số domain theo gói ở [bảng giá](https://embra.cloud/bang-gia/). **Mỗi tên tính là một domain**: `shop.vn` và `www.shop.vn` là hai domain.

## Các bước

1. Mở **Cài đặt → Domain riêng**, nhập tên domain (ví dụ `www.shop.vn` hoặc `shop.vn`), bấm **"Thêm domain"**.
2. Embra hiện các bản ghi cần thêm ở nhà cung cấp DNS:

   | Loại | Tên | Giá trị |
   |---|---|---|
   | TXT | `_embra-challenge.www.shop.vn` | `embra-verify=…` (Embra hiện giá trị) |
   | CNAME | `www` | địa chỉ app, dạng `<app>-production-<mã>.onembra.com` |

   Với **tên gốc** (`shop.vn`, không có `www`), thay CNAME bằng bản ghi **A** tới địa chỉ IP mà Embra hiện trên màn hình.
3. Đợi DNS cập nhật (thường 5–30 phút), rồi bấm **"Kiểm tra"**. Chưa đạt thì chờ thêm rồi kiểm tra lại.
4. Xác minh xong, HTTPS được cấp tự động ở lượt truy cập đầu tiên, thường dưới 1 phút.

:::caution[Dùng Cloudflare?]
Để biểu tượng đám mây màu **xám (DNS only)** cho các bản ghi trên. Bật proxy (đám mây màu cam) thì Embra không xác minh và không cấp HTTPS được.
:::

## Giữ bản ghi TXT

**Đừng xoá bản ghi TXT sau khi xác minh.** Embra kiểm lại mỗi 24 giờ. Mất bản ghi 3 lần liên tiếp thì Embra ngừng phục vụ domain đó. Lỗi mạng tạm thời không bị tính.

## Lưu ý

- Muốn cả `shop.vn` và `www.shop.vn` thì thêm cả hai. Embra chưa tự chuyển hướng giữa hai tên. Bạn có thể đặt chuyển hướng ở nhà cung cấp domain.
- Chưa hỗ trợ domain wildcard (`*.shop.vn`) hay tải chứng chỉ của bạn lên.
- Một tên domain chỉ gắn được vào một app trên Embra.
- Domain chưa xác minh được giữ 7 ngày rồi tự bỏ.
- Mỗi domain kiểm tra được tối đa 1 lần mỗi 30 giây.
