---
title: Gói, giới hạn và hoá đơn
description: Giới hạn của gói Start, Build, Grow và chuyện gì xảy ra khi vượt, cách tính hoá đơn VND kèm ví dụ, đổi gói, chậm thanh toán.
sidebar:
  order: 13
---

Trang tra cứu cho **Owner và Admin** muốn biết gói của mình có gì, vượt giới hạn thì sao, và hoá đơn được tính thế nào. Các bước chọn gói và chuyển khoản nằm ở [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/).

Giá tính theo **mỗi workspace (một project) mỗi tháng**, bằng VND. Giá là số tiền bạn chuyển: Embra chưa có pháp nhân nên không cộng VAT và chưa xuất hoá đơn VAT.

## Mỗi gói có gì

| | Start | Build | Grow | Khi vượt |
|---|---|---|---|---|
| **Giá mỗi tháng** | 249.000đ | 399.000đ | 749.000đ | |
| **App** (hồ tài nguyên chung) | 512 MiB RAM, 0,5 vCPU | 1 GiB RAM, 1 vCPU | 2 GiB RAM, 2 vCPU | Deploy làm app chiếm thêm hồ bị từ chối |
| **Postgres** | 256 MiB RAM, 2 GiB | 512 MiB RAM, 5 GiB | 1 GiB RAM, 10 GiB | Nhập dữ liệu: file dump lớn hơn dung lượng bị từ chối. Build: image app lớn hơn dung lượng đĩa của gói thì build lỗi |
| **Worker, cron** | 1 worker, 2 cron | 2 worker, 5 cron | 4 worker, 10 cron | Không tạo được plan deploy |
| **Preview theo PR** | Không có | 1 | 3 | Pull request mới không có preview |
| **Bucket lưu file** | 1 GiB | 2 GiB | 5 GiB | App ghi vượt nhận lỗi từ S3 |
| **Lịch sử log, metrics** | 7 ngày | 14 ngày | 30 ngày | Không xem được khoảng xa hơn |
| **Staging** | Không có | +149.000đ/tháng | +299.000đ/tháng | Start: không tạo được staging |

Việc làm trên console, CLI hoặc API mà vượt giới hạn bị từ chối với mã [`QUOTA_EXCEEDED`](/loi/#quota_exceeded), câu lỗi ghi rõ giới hạn nào. Embra từ chối trước khi làm, nên app và dữ liệu đang chạy không bị ảnh hưởng. Riêng bucket: app ghi vượt dung lượng thì nhận lỗi từ S3 ngay trong app, xem [Lưu file](/huong-dan/luu-file/).

Gói còn giới hạn **số tên miền riêng** và **số database cho app production**. Thêm quá số đó thì bị từ chối với `QUOTA_EXCEEDED`, câu lỗi ghi con số của gói bạn. Gói dùng thử xem ở [Gói dùng thử](/huong-dan/tai-khoan-va-goi/#gói-dùng-thử).

## Hồ tài nguyên app hoạt động thế nào

RAM và CPU của gói là **một hồ chung** cho mọi app production trong workspace. Mỗi app nhận một cỡ từ hồ, và mỗi worker của app chiếm thêm một phần bằng cỡ đó. Cron không tính vào hồ.

- Staging và preview nằm ngoài hồ.
- Deploy không làm app chiếm thêm hồ thì luôn được chấp nhận, kể cả hotfix hay rollback khi hồ đang vượt.
- Hồ không đủ: giảm cỡ app khác ở **Cài đặt** → **"Tài nguyên"**, thêm RAM, hoặc nâng gói.

## Mua thêm khi cần

| Phần thêm | Giá mỗi tháng | Mua ở đâu |
|---|---|---|
| RAM cho app | 99.000đ mỗi 512 MiB | Console, ở bước chọn gói (mục **"RAM thêm cho app"**) |
| Dung lượng Postgres | 9.800đ mỗi GB | Gửi email hello@embra.cloud |
| Dung lượng bucket | 4.900đ mỗi GB | Gửi email hello@embra.cloud |

Giá theo [bảng giá](https://embra.cloud/bang-gia/). Đang trong kỳ trả trước 3, 6, 12 tháng mà muốn thêm staging hoặc phần mua thêm thì gửi email hello@embra.cloud; console chưa làm được việc này.

## Hoá đơn được tính thế nào

- **Một dòng cho mỗi khoản:** gói, staging, từng phần mua thêm. Tổng là cộng các dòng.
- **Kỳ thanh toán** bắt đầu từ ngày gói trả phí có hiệu lực (ngày tiền về) và lặp lại vào đúng ngày đó mỗi tháng.
- **Trả theo tháng:** hoá đơn tạo vào ngày đầu kỳ, hạn thanh toán 7 ngày.
- **Trả trước 3, 6, 12 tháng:** giảm 5%, 10%, 20%. Giá mỗi tháng sau giảm được làm tròn xuống 1.000đ, rồi nhân số tháng. Không có hoá đơn theo tháng cho tới hết kỳ.
- **Hết kỳ trả trước:** hoá đơn quay về theo tháng, theo giá niêm yết lúc đó. Console báo trước ngày hết kỳ.

Xem hoá đơn ở menu tài khoản → **"Thanh toán"**, mục **"Hoá đơn"**. Mở **"Chi tiết"** của một hoá đơn để xem từng dòng.

## Ví dụ: Build thêm 512 MiB RAM, trả trước 12 tháng

Bạn chọn gói Build từ dùng thử, thêm 512 MiB RAM, trả trước 12 tháng.

| Dòng | Cách tính | Số tiền |
|---|---|---|
| Gói Build | | 399.000đ |
| RAM thêm +512 MiB | 1 × 99.000đ | 99.000đ |
| **Gói Build mỗi tháng** (gồm RAM thêm) | 399.000 + 99.000 | 498.000đ |
| **Giảm 20% khi trả trước** | 498.000 × 80% = 398.400, làm tròn xuống 1.000đ thành 398.000 | −100.000đ |
| **Mỗi tháng × 12 tháng** | | 398.000đ × 12 |
| **Chuyển một lần** | 398.000 × 12 | **4.776.000đ** |

Các dòng in đậm là các dòng console hiện khi bạn xác nhận.

Không cộng VAT. Gói có hiệu lực ngay khi tiền về.

## Ví dụ: nâng gói giữa kỳ

Workspace trả theo tháng ở gói Start, kỳ 25/10–24/11/2026 (31 ngày). Ngày 10/11, Owner nâng lên Build.

| Bước | Cách tính | Kết quả |
|---|---|---|
| Chênh lệch giá tháng | 399.000 − 249.000 | 150.000đ |
| Số ngày còn lại, tính cả hôm nay | 10/11 tới hết 24/11 | 15 ngày |
| Chênh lệch theo ngày | 150.000 × 15 / 31 | 72.580đ |
| **Trả ngay** | làm tròn xuống 1.000đ | **72.000đ** |

Gói đổi sang Build khi 72.000đ về tài khoản Embra. Từ kỳ 25/11, hoá đơn tính 399.000đ mỗi tháng.

## Đổi gói và giới hạn

Quy tắc đổi gói đầy đủ ở [Đổi gói khi đã trả phí](/huong-dan/tai-khoan-va-goi/#đổi-gói-khi-đã-trả-phí). Liên quan tới giới hạn:

- **Nâng gói:** cỡ app tăng ở lần deploy kế tiếp.
- **Hạ gói** bị từ chối nếu workspace đang vượt gói thấp hơn ở những thứ bạn tự gỡ được: tên miền riêng, staging, preview, dung lượng Postgres, số database. Console ghi rõ phải gỡ gì.
- Dung lượng Postgres không thu nhỏ được. Database đã lớn hơn dung lượng của gói thấp hơn thì gửi email hello@embra.cloud.
- Cỡ app được tự giảm cho vừa hồ của gói mới, áp dụng ở lần deploy sau.
- Tới ngày đổi mà workspace vẫn vượt giới hạn, gói hiện tại được giữ và vẫn tính tiền. Embra thử lại mỗi ngày.

## Thanh toán bằng cách nào

Chỉ có **chuyển khoản ngân hàng qua VietQR**, không cần thẻ tín dụng. Mỗi hoá đơn có mã QR, số tiền và nội dung chuyển khoản. Các bước ở [Chọn gói và thanh toán](/huong-dan/tai-khoan-va-goi/#chọn-gói-và-thanh-toán).

Chuyển dư, hoặc bỏ staging và phần mua thêm giữa kỳ, thì phần tiền đó thành **số dư** và tự trừ vào hoá đơn sau. Muốn nhận lại số dư bằng chuyển khoản, gửi email hello@embra.cloud.

## Nếu chậm thanh toán

Khi còn hoá đơn quá hạn, bạn chưa nâng hay hạ gói, thêm staging, mua thêm hay trả trước được cho tới khi trả xong. Banner trên console ghi số tiền còn nợ.

:::caution[Tạm ngưng khi quá hạn 14 ngày]
Từ 14/11/2026, hoá đơn quá hạn 14 ngày thì Embra có thể tạm ngưng workspace, sau khi báo trước ít nhất 3 ngày làm việc qua email. Khi tạm ngưng, app dừng chạy, workspace chỉ xem được và không export được; dữ liệu và backup được giữ nguyên. Workspace mở lại khi Embra nhận đủ tiền. Chi tiết ở [Điều khoản, mục 4 và 7](https://embra.cloud/terms/#goi).
:::

## Xem thêm

- [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)
- [Mời thành viên và làm việc với agency](/workspace/thanh-vien-va-agency/)
- [`QUOTA_EXCEEDED`](/loi/#quota_exceeded)
- [Bảng giá](https://embra.cloud/bang-gia/) và [Điều khoản](https://embra.cloud/terms/)
