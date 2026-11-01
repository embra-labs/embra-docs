---
title: Staging, production và duyệt
description: Environment là gì, plan deploy là gì, khi nào phải chờ duyệt, ai duyệt và cách duyệt trên console.
sidebar:
  order: 9
---

Trang này dành cho người deploy (Developer) và người duyệt (Owner, Admin). Đọc xong, bạn biết bản nào tự lên, bản nào phải chờ duyệt, và cách duyệt từng bước trên console.

## Environment là gì

Mỗi project có một hoặc nhiều **environment**: mỗi cái là một bản chạy riêng của app, có Postgres, secret, bucket và địa chỉ riêng. Secret đặt ở production **không** có ở staging, và ngược lại.

| Loại | Tạo thế nào | Deploy |
|---|---|---|
| `production` | Tự có khi tạo app từ GitHub | **Luôn chờ Owner hoặc Admin duyệt** |
| `staging` | Tạo tay, tối đa một cái (xem bên dưới) | Tự deploy, trừ khi migration đổi hoặc xoá dữ liệu |
| Preview `pr<số>` | Tự tạo theo pull request, ở gói có preview | Như staging. Xem [Preview theo pull request](/huong-dan/deploy-tu-github/#preview-theo-pull-request) |

Địa chỉ mặc định của mỗi environment:

```
https://<tên-project>-<tên-environment>-<6 ký tự cuối mã workspace>.onembra.com
```

## Staging khác production ở đâu

| | Production | Staging |
|---|---|---|
| Duyệt | Mọi plan, kể cả khi không có migration | Chỉ khi migration đổi hoặc xoá dữ liệu |
| Postgres | Riêng | Riêng, **không** chép dữ liệu production |
| Secret, bucket, domain | Riêng | Riêng, đặt lại cho staging |
| RAM, CPU | Cỡ app trong hồ tài nguyên của gói | Một nửa RAM, CPU và IOPS của gói (tối thiểu 256 MiB RAM, 0,25 vCPU), không lấy từ hồ |
| Dung lượng đĩa | Theo gói | Như production |
| Giá | Trong giá gói | Gói Start không có staging. Gói khác tính thêm hằng tháng, xem [bảng giá](https://embra.cloud/bang-gia/) |

## Tạo staging

Chỉ **Owner** tạo được staging khi staging tính tiền vào hoá đơn, và phải là người thật vừa đăng nhập.

1. Mở project, bấm **"Tạo mới"** → **"Environment mới"**.
2. Nhập **Tên environment**, ví dụ `staging` (chữ thường, số, dấu gạch ngang).
3. Ở **Loại environment**, chọn `staging`.
4. Bấm **"Xác nhận tạo environment"**.
5. Mở **Cài đặt → Source code** của environment mới, chọn **Repository**. Trong **"Advanced config"**, nhập **Branch**, ví dụ `develop`. Bấm **"Kết nối repo"**.
6. Mở **Cài đặt → Secrets** và đặt secret cho staging. Xem [Secret](/huong-dan/secret/).

Từ giờ, mỗi lần push lên nhánh đó, Embra build và deploy staging.

**Nếu bạn thấy:**

- `Gói … không có staging. …` hoặc `Mỗi project có tối đa một staging. …`: nâng gói, hoặc xoá staging cũ. Xem [`QUOTA_EXCEEDED`](/loi/#quota_exceeded). Giới hạn này tính trên cả workspace.
- `Workspace đang trong kỳ trả trước tới …`: chưa thêm staging trong console được khi đang trả trước. Gửi email hello@embra.cloud, đội Embra làm giúp.

## Plan deploy là gì

Build xong, Embra lập **plan**: bản tóm tắt mọi thứ sẽ đổi khi deploy. Người duyệt xem đúng plan này.

```
push → build → plan → (diễn tập migration) → chờ duyệt? → deploy
```

Plan gồm:

- **Code mới (image):** image cũ và image mới.
- **Secret:** thêm, bỏ hoặc đổi version. Không bao giờ hiện giá trị.
- **Environment variables:** thêm, bỏ hoặc đổi. Xem [Biến môi trường](/huong-dan/bien-moi-truong/).
- **Migration:** file chờ chạy, kết quả diễn tập trên bản sao dữ liệu, thay đổi schema và **Dữ liệu có thể mất**.

Plan có migration được **diễn tập trên bản sao dữ liệu** trước. Diễn tập lỗi thì plan dừng với [`MIGRATION_REHEARSAL_FAILED`](/loi/#migration_rehearsal_failed), database thật chưa bị đụng tới.

## Khi nào phải chờ duyệt

| Trường hợp | Production | Staging, preview |
|---|---|---|
| Không có migration | Chờ duyệt | Tự deploy |
| Migration an toàn, khoá bảng lâu, hoặc không chạy trong transaction | Chờ duyệt | Tự deploy |
| Migration đổi hoặc xoá dữ liệu | Chờ duyệt | Chờ duyệt |
| Diễn tập ước tính sẽ mất dòng dữ liệu | Chờ duyệt, gõ thêm `CONFIRM_MIGRATION` | Chờ duyệt, gõ thêm `CONFIRM_MIGRATION` |
| Migration chưa hỗ trợ | Bị từ chối, xem [`MIGRATION_UNSUPPORTED`](/loi/#migration_unsupported) | Bị từ chối |

Nhóm migration nào là nhóm nào: xem [Embra kiểm migration thế nào](/huong-dan/database-va-migration/#embra-kiểm-migration-thế-nào).

Plan chờ duyệt có mã [`APPROVAL_REQUIRED`](/loi/#approval_required), hoặc [`MIGRATION_DATA_LOSS`](/loi/#migration_data_loss) khi diễn tập thấy sẽ mất dữ liệu.

## Ai duyệt được

- **Chỉ Owner và Admin.** Developer, Viewer và AI agent không duyệt được. Developer và agent vẫn **tạo** được plan.
- Duyệt cần **người thật**: phiên web đăng nhập trong vòng 12 giờ. Quá 12 giờ thì đăng nhập lại ([`REAUTH_REQUIRED`](/loi/#reauth_required)).
- Token máy (CI, agent) không bao giờ duyệt được ([`HUMAN_REQUIRED`](/loi/#human_required)).

Chi tiết: [Thành viên và phân quyền](/workspace/phan-quyen/).

## Duyệt trên console

1. Mở trang **Tổng quan** của environment. Thanh plan hiện **"… thay đổi chờ áp dụng"**, hoặc mục **"Chờ bạn duyệt"**.
2. Bấm **"Xem và duyệt"**.
3. Đọc phần **Tác động** (code, secret, environment variables) và phần **Migration** (kết quả diễn tập, **Thay đổi schema**, **Dữ liệu có thể mất**).
4. Xem **Hạn duyệt** ở phần **Quyết định của bạn**.
5. Chỉ production: gõ tên environment vào ô **"Gõ … để chắc là bạn đang duyệt đúng chỗ"**.
6. Nếu có cảnh báo mất dữ liệu: gõ `CONFIRM_MIGRATION` vào ô **"Gõ CONFIRM_MIGRATION để xác nhận rủi ro dữ liệu"**.
7. Bấm **"Duyệt và deploy"**, hoặc **"Từ chối"**.

Developer mở trang này vẫn xem được plan, nhưng chỗ nút duyệt chỉ hiện **"Chỉ owner hoặc admin thực hiện được"**. Gửi đường dẫn trang cho Owner hoặc Admin.

:::caution[Migration làm mất dữ liệu không tự hoàn tác được]
Khi đã duyệt và migration đã chạy, bạn không khôi phục database về mốc trước migration đó được. Cần giữ dữ liệu thì export trước khi duyệt. Xem [`MIGRATION_DATA_LOSS`](/loi/#migration_data_loss).
:::

## Sau khi duyệt, từ chối hoặc hết hạn

| Kết quả | Chuyện gì xảy ra |
|---|---|
| **Duyệt** | Deploy vào hàng chạy: migration (nếu có), rồi bản mới chạy song song bản cũ tới khi đạt health check. Xem [Health check](/huong-dan/chuan-bi-app/#health-check) |
| **Từ chối** | Plan bị huỷ, không có gì được áp dụng. App đang chạy vẫn chạy. Sửa code rồi push lại để có plan mới |
| **Hết hạn** | Plan bị huỷ ([`APPROVAL_EXPIRED`](/loi/#approval_expired)). Bấm **"Build lại"** để có plan mới |
| **Có build mới** | Plan cũ do build tạo ra bị huỷ, để không bao giờ duyệt nhầm bản cũ. Duyệt plan mới |
| **Environment đổi trong lúc chờ** | Plan bị huỷ ([`GENERATION_CONFLICT`](/loi/#generation_conflict)), ví dụ vì vừa có rollback |

Hạn duyệt:

- **Plan production** hết hạn sau **24 giờ** kể từ lúc lập.
- **Plan có migration** (cả staging) còn phụ thuộc kết quả diễn tập, dùng được **24 giờ**. Quá hạn thì duyệt không được, cần build lại để diễn tập lại.

Rollback code không cần duyệt. Xem [Rollback](/huong-dan/deploy-tu-github/#rollback).

## Xem thêm

- [Deploy từ GitHub](/huong-dan/deploy-tu-github/)
- [Database và migration](/huong-dan/database-va-migration/)
- [Thành viên và phân quyền](/workspace/phan-quyen/)
- [Mã lỗi: Quyền và duyệt](/loi/#quyền-và-duyệt)
