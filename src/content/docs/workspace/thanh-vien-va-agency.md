---
title: Mời thành viên và làm việc với agency
description: Mời người vào workspace, gỡ thành viên, đổi qua lại giữa nhiều workspace, và tài khoản agency trả tiền cho workspace của khách.
sidebar:
  order: 2
---

Trang này dành cho **Owner và Admin** muốn mời đồng nghiệp hoặc agency vào workspace, và cho **agency** quản lý nhiều workspace của khách. Đọc xong, bạn biết bấm vào đâu, người được mời thấy gì, và ai trả tiền.

Ai được mời ai, vai trò nào làm được gì: xem [Thành viên và phân quyền](/workspace/phan-quyen/).

## Mời một người vào workspace

Owner hoặc Admin làm trên trình duyệt. CLI chỉ xem được danh sách (`embra members list`).

1. Mở **Cài đặt** → **"Thành viên"**.
2. Ở khung **"Mời người vào"**, nhập **Email** của người đó.
3. Chọn **Vai trò**: Admin, Developer hoặc Chỉ xem (Viewer). Admin chỉ mời được Developer và Chỉ xem.
4. Bấm **"Mời"**. Console báo "Đã gửi lời mời. Lời mời còn hạn 14 ngày."

Lời mời hiện trong danh sách với dòng **"Chờ đăng nhập · hết hạn …"**. Muốn huỷ thì bấm **"Thu hồi"** trên dòng đó.

:::note[Embra chưa gửi email mời]
Embra không gửi email cho lời mời vào workspace. Bạn tự báo cho người đó: mở console, đăng nhập bằng đúng email đã được mời.
:::

## Người được mời làm gì

- **Chưa có tài khoản Embra:** bấm **"Đăng nhập bằng Google"** với email được mời, hoặc **"Đăng nhập bằng GitHub"** nếu email chính của GitHub trùng email được mời. Đăng nhập xong là vào thẳng workspace.
- **Đã có tài khoản Embra** (ví dụ đang có workspace dùng thử): lời mời được nhận ở **lần đăng nhập sau**. Trước đó, menu tài khoản hiện dòng "Lời mời vào …: đăng xuất rồi đăng nhập lại để nhận". Đăng xuất rồi đăng nhập lại bằng đúng email được mời.
- Quá 14 ngày mà chưa đăng nhập thì lời mời hết hạn. Owner hoặc Admin mời lại cùng email để làm mới.

Điều kiện về email GitHub và Google nằm ở [Mời thành viên](/workspace/phan-quyen/#mời-thành-viên).

## Đổi qua lại giữa nhiều workspace

Một người có thể ở nhiều workspace, ví dụ người của agency làm cho nhiều khách.

1. Bấm avatar của bạn để mở menu tài khoản.
2. Ở mục **Workspace**, bấm tên workspace muốn chuyển sang.

Console tải lại trên workspace mới. Nút menu tài khoản ghi tên workspace đang mở và vai trò của bạn ở đó. Lần đăng nhập sau, Embra mở workspace bạn dùng gần nhất.

Workspace đã hết hạn dùng thử hoặc đang xoá hiện mờ, không bấm vào được. Workspace bị tạm ngưng vẫn mở được, nhưng chỉ xem.

## Gỡ một thành viên

1. Mở **Cài đặt** → **"Thành viên"**.
2. Bấm **"Gỡ"** trên dòng của người đó.
3. Bấm **"Gỡ khỏi workspace"** để xác nhận, hoặc **"Giữ lại"** để thôi.

Mọi phiên đăng nhập và token người đó tạo bị thu hồi ngay, kể cả token CI đang chạy trong pipeline. Nếu pipeline cần chạy tiếp, người ở lại tạo token mới trước khi gỡ. Workspace phải còn ít nhất một Owner.

## Tài khoản agency là gì

**Tài khoản agency** là tài khoản thanh toán của một đối tác. Nó trả tiền cho nhiều workspace, mỗi workspace là một khách hoặc một dự án.

- Embra mở tài khoản agency cho đối tác. Điều kiện chương trình đối tác: gửi email hello@embra.cloud.
- Mỗi workspace của khách vẫn có gói riêng (Start, Build hoặc Grow) và giới hạn riêng.
- Tài khoản agency nhận **một hoá đơn gộp** cho mọi workspace của nó, với mức giảm trên giá niêm yết theo thoả thuận đối tác.

Khi đã thuộc một tài khoản agency, menu tài khoản có thêm mục **"Tài khoản agency"**.

## Người của tài khoản agency

Tài khoản agency có hai vai trò, tách khỏi vai trò trong từng workspace:

| Vai trò | Làm được |
|---|---|
| **Owner** | Tạo workspace cho khách, trả trước, mời và gỡ người của tài khoản |
| **Billing** | Chỉ xem hoá đơn |

Để mời thêm người: mở **"Tài khoản agency"**, ở mục **"Người của tài khoản"** nhập email, chọn vai trò, bấm **"Mời"**. Người được mời nhận lời mời ở lần đăng nhập sau, bằng đúng email được mời. Lời mời hết hạn sau 14 ngày.

## Tạo workspace cho khách

Chỉ Owner của tài khoản agency làm được, trên trình duyệt.

1. Mở menu tài khoản → **"Tài khoản agency"**.
2. Bấm **"Tạo workspace cho khách"**.
3. Nhập **"Tên workspace (tên khách hoặc dự án)"**.
4. Chọn **Gói**: Start, Build hoặc Grow.
5. Bấm **"Tạo và mở workspace"**.

Workspace có gói trả phí ngay, không qua dùng thử. Bạn là Owner của workspace đó. Phí được tính theo ngày từ hôm nay vào hoá đơn của tài khoản agency.

Dòng dưới tên tài khoản ghi số workspace đang có trên số tối đa. Đã đủ thì nút tạo bị tắt; cần thêm thì gửi email hello@embra.cloud. Còn hoá đơn quá hạn thì chưa tạo được workspace mới.

## Quản lý workspace của khách

Mục **"Workspace của khách"** liệt kê mọi workspace của tài khoản, kèm gói và giá mỗi tháng.

- Bấm **"Mở"** để chuyển sang workspace đó.
- **"Bạn chưa là thành viên"**: bạn chưa có vai trò trong workspace đó nên không mở được. Owner của workspace mời bạn vào như một thành viên bình thường.
- Mời người của khách vào workspace: làm như [Mời một người vào workspace](#mời-một-người-vào-workspace). Cách chia vai trò nên dùng ở [Agency làm cho doanh nghiệp](/workspace/phan-quyen/#agency-làm-cho-doanh-nghiệp).

Người trong workspace của khách không thấy số tiền. Trang **"Thanh toán"** của họ ghi "… thanh toán cho bạn", tức là tài khoản agency trả.

## Thanh toán hoá đơn gộp

Mục **"Hoá đơn gộp"** trên trang tài khoản agency liệt kê từng kỳ với số tiền và trạng thái: **"Đã thanh toán"**, **"Hạn …"** hoặc **"Đang đối soát"**.

Khi có hoá đơn chưa trả, đầu trang hiện mã VietQR, số tiền và nội dung chuyển khoản. Quét mã bằng app ngân hàng như với workspace thường. Xem [Chọn gói và thanh toán](/huong-dan/tai-khoan-va-goi/#chọn-gói-và-thanh-toán).

## Trả trước 3, 6 hoặc 12 tháng cho một khách

Owner của tài khoản agency trả trước được cho từng workspace của khách.

1. Ở mục **"Workspace của khách"**, bấm **"Trả trước"** trên dòng của workspace.
2. Chọn kỳ. Mỗi lựa chọn ghi "… tháng · giảm thêm …%", giá mỗi tháng và tổng tiền.
3. Bấm **"Tạo mã thanh toán"**.
4. Quét mã VietQR hiện ở đầu trang.

Mức "giảm thêm" tính trên giá tháng đã giảm của tài khoản agency; hộp thoại ghi sẵn giá mỗi tháng và tổng tiền. Kỳ trả trước bắt đầu **sau kỳ đang chạy** và chỉ có hiệu lực khi Embra nhận đủ tiền. Sau đó dòng của workspace ghi **"Trả trước tới …"**.

- Nút **"Trả trước"** chỉ hiện khi workspace đã có hoá đơn đầu tiên, chưa ở trong kỳ trả trước, chưa có đơn trả trước chờ thanh toán, và tài khoản không còn hoá đơn quá hạn.
- Đổi ý trước khi chuyển khoản: bấm **"Huỷ đơn trả trước"**.

Hoàn tiền kỳ trả trước theo [Điều khoản, mục 4](https://embra.cloud/terms/#goi).

## Chuyển workspace sang cho khách tự trả

Console chưa có nút bàn giao. Muốn đổi người trả tiền của một workspace, ví dụ agency bàn giao cho khách, gửi email hello@embra.cloud. Đội Embra làm thủ công. Nếu đang trong kỳ trả trước, kỳ đã trả đi theo workspace.

Đổi Owner của workspace thì làm theo các bước ở [Agency làm cho doanh nghiệp](/workspace/phan-quyen/#agency-làm-cho-doanh-nghiệp).

## Xem thêm

- [Thành viên và phân quyền](/workspace/phan-quyen/)
- [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/)
- [Gói, giới hạn và hoá đơn](/huong-dan/goi-gioi-han-va-hoa-don/)
- [Điều khoản, mục 4](https://embra.cloud/terms/#goi)
