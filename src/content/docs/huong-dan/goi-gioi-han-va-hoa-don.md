---
title: Gói, giới hạn và hoá đơn
description: Giới hạn của gói Start, Build, Grow và chuyện gì xảy ra khi vượt, cách tính hoá đơn VND kèm ví dụ, đổi gói, chậm thanh toán.
sidebar:
  order: 13
---

Giá tính theo **mỗi workspace (một project) mỗi tháng**, bằng VND. Giá là số tiền bạn chuyển: Embra chưa có pháp nhân nên không cộng VAT và chưa xuất hoá đơn VAT. Các bước chọn gói và chuyển khoản: [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/).

## Mỗi gói có gì

| | Start | Build | Grow | Khi vượt |
|---|---|---|---|---|
| **Giá mỗi tháng** | 249.000đ | 399.000đ | 749.000đ | |
| **App** (resource pool chung) | 512 MiB RAM, 0,5 vCPU | 1 GiB RAM, 1 vCPU | 2 GiB RAM, 2 vCPU | Deploy làm app chiếm thêm pool bị từ chối |
| **Postgres** | 256 MiB RAM, 2 GiB | 512 MiB RAM, 5 GiB | 1 GiB RAM, 10 GiB | Import data: file dump lớn hơn dung lượng bị từ chối. Build: image app lớn hơn dung lượng đĩa của gói thì build fail |
| **Worker, cron** | 1 worker, 2 cron | 2 worker, 5 cron | 4 worker, 10 cron | Không tạo được plan deploy |
| **Preview theo PR** | Không có | 1 | 3 | PR mới không có preview |
| **Domain riêng** | 3 | 5 | 10 | Thêm domain bị từ chối (`QUOTA_EXCEEDED`) |
| **Bucket lưu file** | 1 GiB | 2 GiB | 5 GiB | App ghi vượt nhận lỗi từ S3 |
| **Lịch sử log, metrics** | 7 ngày | 14 ngày | 30 ngày | Không xem được khoảng xa hơn |
| **Staging** | Không có | +149.000đ/tháng | +299.000đ/tháng | Start: không tạo được staging |

- Thao tác trên console, CLI hay API vượt giới hạn bị từ chối với [`QUOTA_EXCEEDED`](/loi/#quota_exceeded), message ghi rõ giới hạn nào. Embra từ chối trước khi làm, nên app và data đang chạy không bị ảnh hưởng.
- Riêng bucket: app ghi vượt dung lượng thì nhận lỗi từ S3 ngay trong app. Xem [Lưu file](/huong-dan/luu-file/).
- Domain đếm chung mọi environment của workspace; `shop.vn` và `www.shop.vn` là hai domain.
- Gói còn giới hạn **số database cho app production**. Vượt thì bị từ chối với `QUOTA_EXCEEDED`, message ghi con số của gói bạn.
- Gói dùng thử: xem [Gói dùng thử](/huong-dan/tai-khoan-va-goi/#gói-dùng-thử).

## Resource pool của app

RAM và CPU của gói là **một pool chung** cho mọi app production trong workspace. Mỗi app nhận một size từ pool; mỗi worker của app chiếm thêm một phần bằng size đó. Cron không tính vào pool.

- Staging và preview nằm ngoài pool.
- Deploy không làm app chiếm thêm pool thì luôn được chấp nhận, kể cả hotfix hay rollback khi pool đang vượt.
- Pool không đủ: giảm size app khác ở **Cài đặt** → **"Tài nguyên"**, thêm RAM, hoặc nâng gói.

## Mua thêm

| Phần thêm | Giá mỗi tháng | Mua ở đâu |
|---|---|---|
| RAM cho app | 99.000đ mỗi 512 MiB | Console, ở bước chọn gói (**"RAM thêm cho app"**) |
| Dung lượng Postgres | 9.800đ mỗi GB | Email hello@embra.cloud |
| Dung lượng bucket | 4.900đ mỗi GB | Email hello@embra.cloud |

Giá theo [bảng giá](https://embra.cloud/bang-gia/). Đang trong kỳ trả trước 3, 6, 12 tháng mà muốn thêm staging hoặc phần mua thêm: email hello@embra.cloud, console chưa làm được.

## Hoá đơn được tính thế nào

| Quy tắc | Chi tiết |
|---|---|
| Dòng | Mỗi khoản một dòng: gói, staging, từng phần mua thêm. Tổng = cộng các dòng |
| Kỳ thanh toán | Bắt đầu từ ngày gói trả phí có hiệu lực (ngày tiền về), lặp lại đúng ngày đó mỗi tháng |
| Trả theo tháng | Hoá đơn tạo vào ngày đầu kỳ, hạn thanh toán 7 ngày |
| Trả trước 3, 6, 12 tháng | Giảm 5%, 10%, 20%. Giá tháng sau giảm làm tròn xuống 1.000đ, rồi nhân số tháng. Không có hoá đơn theo tháng cho tới hết kỳ |
| Hết kỳ trả trước | Quay về hoá đơn theo tháng, theo giá niêm yết lúc đó. Console báo trước ngày hết kỳ |

Xem hoá đơn: menu tài khoản → **"Thanh toán"** → mục **"Hoá đơn"**. Mở **"Chi tiết"** để xem từng dòng.

### Ví dụ: Build + 512 MiB RAM, trả trước 12 tháng

| Dòng | Cách tính | Số tiền |
|---|---|---|
| Gói Build | | 399.000đ |
| RAM thêm +512 MiB | 1 × 99.000đ | 99.000đ |
| **Gói Build mỗi tháng** (gồm RAM thêm) | 399.000 + 99.000 | 498.000đ |
| **Giảm 20% khi trả trước** | 498.000 × 80% = 398.400, làm tròn xuống 1.000đ thành 398.000 | −100.000đ |
| **Mỗi tháng × 12 tháng** | | 398.000đ × 12 |
| **Chuyển một lần** | 398.000 × 12 | **4.776.000đ** |

Dòng in đậm là dòng console hiện khi bạn xác nhận. Không cộng VAT. Gói có hiệu lực ngay khi tiền về.

### Ví dụ: nâng gói giữa kỳ

Workspace trả theo tháng ở gói Start, kỳ 25/10–24/11/2026 (31 ngày). Ngày 10/11, Owner nâng lên Build.

| Bước | Cách tính | Kết quả |
|---|---|---|
| Chênh lệch giá tháng | 399.000 − 249.000 | 150.000đ |
| Số ngày còn lại, tính cả hôm nay | 10/11 tới hết 24/11 | 15 ngày |
| Chênh lệch theo ngày | 150.000 × 15 / 31 | 72.580đ |
| **Trả ngay** | làm tròn xuống 1.000đ | **72.000đ** |

Gói đổi sang Build khi 72.000đ về tài khoản Embra. Từ kỳ 25/11, hoá đơn tính 399.000đ mỗi tháng.

## Đổi gói và giới hạn

Quy tắc đổi gói đầy đủ: [Đổi gói khi đã trả phí](/huong-dan/tai-khoan-va-goi/#đổi-gói-khi-đã-trả-phí). Phần liên quan tới giới hạn:

- **Nâng gói:** size app tăng ở lần deploy kế tiếp.
- **Hạ gói** bị từ chối nếu workspace đang vượt gói thấp hơn ở những thứ bạn tự gỡ được: domain riêng, staging, preview, dung lượng Postgres, số database. Console ghi rõ phải gỡ gì.
- Dung lượng Postgres không thu nhỏ được. Database đã lớn hơn dung lượng của gói thấp hơn: email hello@embra.cloud.
- Size app được tự giảm cho vừa pool của gói mới, áp dụng ở lần deploy sau.
- Tới ngày đổi mà workspace vẫn vượt giới hạn: gói hiện tại được giữ và vẫn tính tiền. Embra thử lại mỗi ngày.

## Thanh toán bằng cách nào

Chỉ có **chuyển khoản ngân hàng qua VietQR**, không cần thẻ tín dụng. Mỗi hoá đơn có mã QR, số tiền và nội dung chuyển khoản. Các bước: [Chọn gói và thanh toán](/huong-dan/tai-khoan-va-goi/#chọn-gói-và-thanh-toán).

Chuyển dư, hoặc bỏ staging và phần mua thêm giữa kỳ, thì phần tiền đó thành **số dư**, tự trừ vào hoá đơn sau. Muốn nhận lại số dư bằng chuyển khoản: email hello@embra.cloud.

## Nếu chậm thanh toán

Còn hoá đơn quá hạn thì chưa nâng/hạ gói, thêm staging, mua thêm hay trả trước được, cho tới khi trả xong. Banner trên console ghi số tiền còn nợ.

:::caution[Tạm ngưng khi quá hạn 14 ngày]
Từ 14/11/2026, hoá đơn quá hạn 14 ngày thì Embra có thể tạm ngưng workspace, sau khi báo trước ít nhất 3 ngày làm việc qua email. Khi tạm ngưng: app dừng chạy, workspace chỉ xem được và không export được; data và backup được giữ nguyên. Workspace mở lại khi Embra nhận đủ tiền. Chi tiết ở [Điều khoản, mục 4 và 7](https://embra.cloud/terms/#goi).
:::

## Xem thêm

- [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)
- [Mời thành viên và làm việc với agency](/workspace/thanh-vien-va-agency/)
- [`QUOTA_EXCEEDED`](/loi/#quota_exceeded)
- [Bảng giá](https://embra.cloud/bang-gia/) và [Điều khoản](https://embra.cloud/terms/)
