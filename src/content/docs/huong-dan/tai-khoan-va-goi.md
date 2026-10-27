---
title: Tài khoản, dùng thử và thanh toán
description: Đăng nhập, gói dùng thử 7 ngày, chọn gói trả phí và thanh toán bằng VietQR.
sidebar:
  order: 1
---

## Đăng nhập

Vào console và bấm **"Đăng nhập bằng GitHub"**.

- Lần đầu đăng nhập, Embra tạo cho bạn một **workspace dùng thử** mang tên tài khoản GitHub, và bạn là Owner.
- Tài khoản GitHub phải được tạo **ít nhất 30 ngày** trước. Tài khoản mới hơn: gửi username GitHub tới hello@embra.cloud để được mở cho riêng tài khoản đó.
- Số lượt dùng thử mới mỗi ngày có giới hạn.
- Gặp thông báo **"Chưa vào được Embra"** thì có ba khả năng: đăng nhập Google bằng email chưa được mời (nhờ Owner mời đúng email đó), tài khoản GitHub chưa đủ 30 ngày, hoặc lượt dùng thử hôm nay đã hết (thử lại hôm sau). Cần giúp thì gửi email hello@embra.cloud.
- **"Đăng nhập bằng Google" chỉ dành cho người được mời** vào một workspace có sẵn. Google không tạo workspace mới.
- Nếu email GitHub của bạn đang có lời mời vào workspace của người khác, bạn vào thẳng workspace đó và **không** nhận gói dùng thử.

## Gói dùng thử

| | Dùng thử |
|---|---|
| Thời hạn | 7 ngày |
| App | 1 project, 1 environment (production) |
| Postgres | 1 |
| Domain riêng, preview theo PR, cron | Không có |

Banner "Dùng thử · còn N ngày" cho biết thời gian còn lại.

:::caution[Hết 7 ngày là xoá]
Khi hết hạn, mọi thao tác bị chặn, kể cả xem. Sau đó **toàn bộ workspace bị xoá**: app, database và backup. Không có thời gian ân hạn, và workspace đã hết hạn thì không trả tiền được nữa.

Muốn giữ app, hãy **chọn gói và chuyển khoản trước khi hết hạn**. Embra gửi cảnh báo 24 giờ trước. Chỉ muốn lấy dữ liệu thì dùng **Cài đặt → Export và xoá → Export** trước thời hạn.
:::

## Chọn gói và thanh toán

Chỉ **Owner** chọn gói được, và chỉ trên trình duyệt.

1. Bấm **"Chọn gói trả phí để giữ app"** trên banner dùng thử, hoặc mở menu tài khoản → **"Thanh toán"**.
2. Bấm **"Chọn Start"**, **"Chọn Build"** hoặc **"Chọn Grow"**. Giá và giới hạn từng gói ở [embra.cloud/bang-gia](https://embra.cloud/bang-gia/).
3. Có thể ghi tên người hoặc công ty trên hoá đơn. Embra chưa có pháp nhân nên chưa xuất hoá đơn VAT.
4. Bấm **"Xác nhận và lấy mã VietQR"**.
5. Quét mã bằng app ngân hàng, hoặc chuyển khoản tay với đúng **số tiền** và **nội dung chuyển khoản** hiển thị (có nút "Chép").

Gói có hiệu lực ngay khi Embra nhận được tiền. Từ lúc đó workspace không còn hạn dùng thử. Nếu chưa tự động xác nhận, đội Embra xác nhận bằng tay trong giờ làm việc. Trạng thái hoá đơn hiện ở mục "Hoá đơn": Chưa thanh toán, Đang đối soát, Đã thanh toán hoặc Quá hạn.

Admin xem được billing nhưng không chọn gói hay thanh toán được. Xem [Thành viên và phân quyền](/workspace/phan-quyen/).
