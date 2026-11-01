---
title: Rollback và khôi phục backup
description: Trả code về bản trước khi bản mới lỗi, khôi phục database về một mốc thời gian, và export dữ liệu.
sidebar:
  order: 11
---

Trang này dành cho người vừa deploy một bản lỗi, hoặc lỡ ghi sai dữ liệu và cần lấy lại. Bạn sẽ biết khi nào dùng **rollback** (trả code), khi nào dùng **khôi phục backup** (trả dữ liệu), và mỗi cách mất gì.

## Nên dùng cách nào?

| Bạn gặp | Dùng | Đụng tới dữ liệu? | Cần duyệt? |
|---|---|---|---|
| Bản mới lỗi, dữ liệu vẫn đúng | Rollback | Không | Không |
| Dữ liệu bị xoá hoặc ghi sai | Khôi phục backup | Có: dữ liệu ghi sau mốc chọn bị mất | Owner hoặc Admin |
| Cần mang app và dữ liệu đi nơi khác | Export | Không | Chỉ Owner, Admin tạo được |

## Rollback về bản trước

Rollback chạy lại bản deploy **ngay trước** bản đang chạy, qua đủ các bước khởi động, kiểm tra sẵn sàng và chuyển traffic. Dữ liệu trong database không bị tua lại.

Owner, Admin và Developer rollback được. Không cần duyệt, kể cả ở production, vì bản đó đã từng được duyệt và chạy.

1. Mở environment. Ở đầu trang có dải **"Lịch sử & khôi phục"**.
2. Bấm **"Quay về bản trước"**. Nút chỉ hiện khi environment đã có ít nhất 2 lần deploy thành công, và bị khoá khi đang có thao tác khác chạy.
3. Ở production, gõ tên environment để xác nhận, rồi bấm **"Quay về bản trước"** trong hộp thoại.
4. Embra mở trang chi tiết thao tác. Bản cũ nhận traffic khi trạng thái thành **"Deploy thành công"**.

Trên web chỉ quay về được đúng một bản trước, không chọn được bản cũ hơn.

### Bấm rollback lần thứ hai

Rollback tạo một bản mới, và "bản trước" của bản mới đó là bản bạn vừa rời đi. Vì vậy bấm **"Quay về bản trước"** lần nữa sẽ **đưa bản lỗi trở lại**, không lùi thêm một bản. Muốn sửa tiếp, push một commit mới.

### Khi Embra từ chối rollback

Embra kiểm tra trước khi làm gì, nên bị từ chối thì app đang chạy không bị đụng tới.

| Lý do | Mã lỗi | Cách xử lý |
|---|---|---|
| Đã có migration chạy sau bản đó | [`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible) | Sửa bằng commit mới chạy được với schema hiện tại |
| Secret bản đó dùng đã bị thu hồi | [`SECRET_REVOKED`](/loi/#secret_revoked) | Deploy bản mới với secret hiện tại |
| Đang có thao tác khác chưa xong | [`OPERATION_IN_PROGRESS`](/loi/#operation_in_progress) | Chờ thao tác đó xong |
| Environment đang bị chặn sau sự cố | [`ENVIRONMENT_BLOCKED`](/loi/#environment_blocked) | Liên hệ đội Embra |
| Bản đang chạy là bản đầu tiên, hoặc environment đang tạm dừng | [`INVALID_INPUT`](/loi/#invalid_input) | Không có bản trước để quay về / bật lại environment trước |

Rollback chỉ trả code, không trả schema. Đó là lý do Embra chặn khi migration đã đi tiếp: code cũ có thể không chạy trên schema mới.

## Backup của database

Mỗi environment có Postgres đều được backup tự động, bạn không cần bật gì.

- **Liên tục:** mọi thay đổi được ghi lại (WAL) và đẩy vào backup ít nhất mỗi phút.
- **Bản đầy đủ:** mỗi 7 ngày. Embra giữ 2 bản đầy đủ gần nhất.
- **Khoảng khôi phục được:** từ bản đầy đủ cũ nhất còn giữ tới khoảng 1–2 phút trước. Database mới tạo thì tính từ bản đầy đủ đầu tiên. Database đã chạy hơn 2 tuần thì khoảng này dài từ 7 tới 14 ngày, tuỳ lúc bản đầy đủ mới nhất chạy.
- **Nơi lưu:** trên máy chủ, ổ đĩa riêng tách khỏi ổ chứa database. Bản sao ra ngoài máy chủ chưa bật.
- **Khôi phục thử:** mỗi 7 ngày Embra tự dựng lại database từ backup để chắc backup dùng được. Kết quả hiện ở mục **Backup** trong dải trạng thái đầu trang environment.

| Console hiện | Nghĩa |
|---|---|
| **"Restore thử đạt"** | Lần khôi phục thử gần nhất thành công |
| **"Chưa restore thử"** | Database mới, chưa tới lần khôi phục thử đầu tiên |
| **"Restore thử thiếu dữ liệu"** | Backup thiếu một đoạn ([`BACKUP_WAL_GAP`](/loi/#backup_wal_gap)) |
| **"Restore thử thất bại"** | Không dựng lại được từ backup. Đừng dựa vào khoảng khôi phục, gửi email hello@embra.cloud |

Backup tạm ngừng khi database đang dừng hoặc environment bị chặn sau sự cố.

## Khôi phục database về một mốc thời gian

Khôi phục diễn ra hai bước, để bạn xem trước rồi mới chuyển app:

```
Bước 1: Tạo bản khôi phục        Bước 2: Chuyển sang bản này
(Owner, Admin, Developer)        (Owner hoặc Admin, trong 2 giờ)
database mới chạy song song  →   app dùng database mới
app vẫn dùng database cũ         database cũ giữ 72 giờ, chỉ đọc
```

**Bước 1. Tạo bản khôi phục**

1. Trên dải **"Lịch sử & khôi phục"**, bấm **"Khôi phục dữ liệu…"**. Hoặc ở trang Tổng quan, bấm **"Xem mốc khôi phục"**.
2. Xem khoảng khôi phục được, từ **"Mốc sớm nhất"** tới **"Mốc mới nhất"**.
3. Nhập **Mốc khôi phục** trong khoảng đó, theo giờ máy của bạn.
4. Bấm **"Tạo bản khôi phục"**. Embra dựng một database mới từ mốc đó. Database đang chạy chưa bị đụng tới.

**Bước 2. Chuyển sang bản khôi phục**

Bước này do Owner hoặc Admin làm.

1. Khi bản khôi phục sẵn sàng, trang thao tác hiện **"Chuyển sang bản khôi phục"** kèm số dòng ước tính của từng bảng.
2. Gõ tên environment để xác nhận.
3. Bấm **"Chuyển sang bản này"**. Không muốn dùng thì bấm **"Huỷ bản khôi phục"**.
4. Embra chuyển app sang database mới mà không dừng app.

Người duyệt phải đăng nhập web trong vòng 12 giờ. Không duyệt trong 2 giờ thì bản khôi phục bị huỷ và dọn đi; tạo lại từ bước 1.

:::caution[Dữ liệu ghi sau mốc chọn sẽ mất]
Sau khi chuyển, mọi thứ app ghi vào database sau mốc khôi phục không có trong database mới. Trong lúc chuyển, database cũ thành chỉ đọc nên app có thể báo lỗi ghi trong vài giây.
:::

### Quay lại database cũ sau khi khôi phục

Database cũ được giữ **72 giờ** sau khi chuyển (gói dùng thử: 24 giờ). Trong thời gian đó, rollback về bản deploy chạy trước lúc khôi phục sẽ đưa app về database cũ.

- Chỉ Owner hoặc Admin làm được, và phải là người thật (phiên web trong 12 giờ).
- Hết thời gian giữ, database cũ bị xoá: rollback báo [`ROLLBACK_DB_GONE`](/loi/#rollback_db_gone).
- Nếu đã có migration chạy trên database mới sau lúc chuyển, rollback bị chặn với [`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible).

:::danger[Mất dữ liệu ghi trên database mới]
Quay về database cũ bỏ đi mọi thứ app đã ghi vào database mới kể từ lúc chuyển. Không có cách lấy lại phần đó.
:::

### Khi không khôi phục được

| Bạn thấy | Mã lỗi | Cách xử lý |
|---|---|---|
| Mốc nằm ngoài khoảng, hoặc chưa có backup | [`RESTORE_POINT_UNAVAILABLE`](/loi/#restore_point_unavailable) | Chọn mốc giữa **"Mốc sớm nhất"** và **"Mốc mới nhất"** |
| Có migration chạy sau mốc đã chọn | [`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point) | Chọn mốc sau migration đó |
| Backup không tới được đúng mốc | [`RESTORE_SHORT`](/loi/#restore_short) | Gửi email hello@embra.cloud |
| Thao tác hiện **"Cần đội Embra hỗ trợ"** | [`RECOVERY_REQUIRED`](/loi/#recovery_required) | Đừng xoá environment; gửi email kèm mã operation |

Environment đang tạm dừng hoặc database đang dừng thì không khôi phục được; bật lại trước.

## Export dữ liệu

Export tạo một bundle gồm image, manifest, bản `pg_dump` và danh sách object của bucket. Bundle không chứa giá trị secret.

1. Mở **"Cài đặt"** → **"Dữ liệu"** → **"Export dữ liệu"**.
2. Chọn **"Kèm nội dung object của bucket"** nếu cần cả file trong bucket.
3. Bấm **"Tạo export"**.
4. Khi export xong, bấm **"Tải bundle"**.

- Chỉ Owner hoặc Admin. Export production cần phiên web đăng nhập trong 12 giờ.
- Bundle tự xoá sau 24 giờ.
- Bundle vượt giới hạn dung lượng thì báo [`QUOTA_EXCEEDED`](/loi/#quota_exceeded).

## Dùng CLI

Lệnh tương ứng (xem lưu ý về đăng nhập CLI ở [Danh sách lệnh](/cli/lenh/)):

```sh
embra rollback --env <project>/<env>
embra db restore-points --env <project>/<env>
embra db restore --env <project>/<env> --to 2026-11-01T08:30:00+07:00
embra export --env <project>/<env>
```

`embra db restore` chỉ tạo bản khôi phục. Bước chuyển vẫn cần Owner hoặc Admin duyệt.

## Xem thêm

- [Database và migration](/huong-dan/database-va-migration/)
- [Xem log và theo dõi app](/huong-dan/log-va-theo-doi/)
- [Rollback và khôi phục: mã lỗi](/loi/#rollback-và-khôi-phục)
- [Thành viên và phân quyền](/workspace/phan-quyen/)
