---
title: Giới hạn hệ thống
description: Embra chạy trên một server, chưa có HA, file trong bucket chưa có bản ngoài server. RPO, khoảng restore và việc bạn nên tự làm.
sidebar:
  order: 3
---

Những gì Embra **chưa** làm, ghi ra để bạn tự quyết cần thêm gì.

## Server và uptime

| Mục | Hiện tại |
|---|---|
| Số server | App, Postgres, bucket và backup của một environment nằm trên **cùng một server**; backup Postgres có thêm bản copy ngoài server |
| HA / failover | Không có. Server lỗi thì app dừng tới khi server chạy lại |
| Replica Postgres | Không có. Mỗi environment một Postgres duy nhất |
| Lúc deploy | Bản mới start và qua health check rồi mới nhận traffic; bản cũ phục vụ trong lúc đó |

## Backup và restore

| Mục | Hiện tại |
|---|---|
| RPO (data có thể mất) | WAL đẩy vào backup ít nhất mỗi phút: tối đa khoảng 1–2 phút data gần nhất |
| Full backup | Mỗi 7 ngày, giữ 2 bản gần nhất |
| Khoảng restore được | Từ full backup cũ nhất còn giữ tới khoảng 1–2 phút trước. Database chạy hơn 2 tuần: 7 tới 14 ngày |
| Nơi lưu | Cùng server, ổ đĩa riêng tách khỏi ổ chứa database, và bản copy trên object storage của Cloudfly tại Hà Nội (sync khoảng mỗi phút) |
| Mất cả server | Database trên server mất; bản copy backup ở Hà Nội vẫn còn. Dựng lại trên server khác do đội Embra làm tay, chưa có thời gian cam kết. File trong bucket mất |
| Restore thử | Mỗi 7 ngày, tự động. Kết quả ở mục **Backup** đầu trang environment |
| Restore về trước một migration đã chạy | Không được ([`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point)) |

Chi tiết và cách restore: [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/).

## Nên tự làm

- Data không được mất: chạy [export](/huong-dan/rollback-va-khoi-phuc/#export-dữ-liệu) định kỳ và giữ bundle ở nơi khác. Bundle tự xoá trên Embra sau 24 giờ.
- Trước migration có `DROP` hoặc `DELETE`: export trước khi approve.
- App cần uptime cao hơn một server: đừng chỉ dựa vào Embra.

## Khi không chắc kết quả

Embra không tự retry một thao tác chưa rõ kết quả: environment bị chặn tới khi đội Embra xác minh ([`RECOVERY_REQUIRED`](/loi/#recovery_required)). Thời gian chặn phụ thuộc lúc đội Embra xử lý; Embra chưa công bố cam kết thời gian.

## Xem thêm

- [Embra chạy app thế nào](/kien-truc/cach-embra-chay-app/)
- [Gói, giới hạn và hoá đơn](/huong-dan/goi-gioi-han-va-hoa-don/)
