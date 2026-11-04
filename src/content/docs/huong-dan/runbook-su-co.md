---
title: Runbook sự cố
description: Tra theo triệu chứng khi app production có vấn đề - nguyên nhân, cách xử lý, cách kiểm lại. Link tới trang chi tiết và mã lỗi.
---

Tra theo triệu chứng. Mỗi mục: nguyên nhân → xử lý → kiểm lại. Chi tiết nằm ở trang được link.

Trước khi làm gì, mở environment xem dải trạng thái đầu trang (xem [Đọc trạng thái app](/huong-dan/log-va-theo-doi/#đọc-trạng-thái-app)), hoặc chạy:

```sh
embra status --env <project>/<env>
```

:::danger[Khi console hiện "Cần xác minh dữ liệu" hoặc "Cần đội Embra hỗ trợ"]
Đừng xoá environment, đừng chạy SQL tay, đừng push liên tục. Nhảy thẳng tới [mục đó](#console-hiện-cần-xác-minh-dữ-liệu).
:::

## App trả lỗi 500 sau khi deploy

| | |
|---|---|
| **Nguyên nhân** | Bản mới qua health check nhưng lỗi ở route khác |
| **Xử lý** | Không có migration trong bản đó: bấm **"Quay về bản trước"** ([Rollback](/huong-dan/rollback-va-khoi-phuc/#rollback-về-bản-trước)). Có migration: rollback bị chặn ([`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible)), sửa code rồi push |
| **Kiểm lại** | `embra metrics --env <project>/<env>`: error rate về mức trước mốc deploy; `embra logs --env <project>/<env>` hết lỗi |

## Deploy không lên, bản cũ vẫn chạy

| | |
|---|---|
| **Nguyên nhân** | Bản mới không qua health check ([`HEALTHCHECK_FAILED`](/loi/#healthcheck_failed)): sai `PORT`, `health_path` trả lỗi, thiếu env var, app crash khi start |
| **Xử lý** | Đọc khối **"Nội dung từ app — không do Embra viết"** và log app, sửa, push |
| **Kiểm lại** | Deploy mới tới **"Deploy thành công"** |

Console ghi "Migration đã áp, code mới chưa chạy": schema đã đổi, **code cũ đang chạy trên schema mới**. Sửa code mới cho chạy được rồi push; đừng thêm migration đảo ngược vội.

## Migration đã xoá cột, app lỗi

| | |
|---|---|
| **Nguyên nhân** | Code còn đọc cột đã `DROP` |
| **Xử lý** | Sửa code bỏ tham chiếu cột rồi push. Cần lại cột: migration mới `ADD COLUMN` (cho phép null). Cần lại **data** của cột: chỉ lấy được từ export trước migration |
| **Không làm được** | Rollback code ([`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible)), restore về trước migration ([`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point)), [undo từng dòng](/huong-dan/undo-tung-dong/) (chỉ so cột còn ở cả hai phía) |
| **Kiểm lại** | `embra logs` hết `column "…" does not exist` |

Tránh lần sau: xoá cột qua [expand/contract](/huong-dan/expand-contract/), export trước khi approve migration mất data.

## Data bị xoá hoặc ghi sai

Chọn cách theo việc đã xảy ra:

| Đã xảy ra | Data ghi sau đó cần giữ? | Dùng |
|---|---|---|
| Một lệnh `UPDATE` ghi sai nhiều dòng | Có | [Undo từng dòng](/huong-dan/undo-tung-dong/) (CLI, cần [`embra login`](/cli/cai-dat/)) |
| `DELETE`, `DROP TABLE`, hoặc hỏng diện rộng | Không | [Restore về một mốc](/huong-dan/rollback-va-khoi-phuc/#khôi-phục-database-về-một-mốc-thời-gian) |
| `DELETE` | Có | Chưa tự làm được: undo chỉ đếm dòng bị xoá. Email hello@embra.cloud |
| Có migration chạy sau mốc cần về | | Restore bị chặn ([`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point)); undo vẫn chạy |

- Tìm mốc: giây chẵn ngay trước lúc lệnh lỗi **bắt đầu**. Xem mốc deploy, migration, cron trong `embra events --env <project>/<env>` và log.
- Mốc phải nằm trong `embra db restore-points`.
- **Kiểm lại:** undo: `embra db undo run <session_id>` cho `incident_update` về 0. Restore: số dòng ước tính trên trang operation đúng như bạn chờ, rồi mới **"Chuyển sang bản này"**.

## Console hiện "Cần xác minh dữ liệu"

| | |
|---|---|
| **Nguyên nhân** | Embra mất liên lạc giữa lúc chạy migration production, không biết migration đã áp chưa ([`MIGRATION_UNKNOWN`](/loi/#migration_unknown)) |
| **Trạng thái** | Code cũ vẫn chạy. Environment bị chặn. Embra đã snapshot database ngay trước migration |
| **Xử lý** | Email hello@embra.cloud kèm `operation_id`, workspace, environment, giờ. **Không** sửa file migration, không chạy lại SQL tay, không xoá environment |
| **Kiểm lại** | Đội Embra mở lại environment; dải trạng thái hết **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"** |

## Console hiện "Cần đội Embra hỗ trợ"

| | |
|---|---|
| **Nguyên nhân** | Một thao tác (deploy, rollback, restore…) kết thúc không rõ kết quả ([`RECOVERY_REQUIRED`](/loi/#recovery_required)). Embra cố ý không retry |
| **Trạng thái** | Traffic giữ như lúc sự cố. Deploy, rollback, restore bị từ chối ([`ENVIRONMENT_BLOCKED`](/loi/#environment_blocked)). Cron và backup định kỳ dừng |
| **Xử lý** | Bấm **"Liên hệ hỗ trợ"**. Ghi rõ app có đang lỗi với người dùng không |
| **Kiểm lại** | Như trên |

## Backup: "Restore thử thất bại" hoặc "Restore thử thiếu dữ liệu"

| | |
|---|---|
| **Nguyên nhân** | Không dựng lại được database từ backup, hoặc WAL thiếu một đoạn ([`BACKUP_WAL_GAP`](/loi/#backup_wal_gap)) |
| **Ảnh hưởng** | App vẫn chạy bình thường. Khoảng restore có thể không dùng được |
| **Xử lý** | Email hello@embra.cloud. Data quan trọng thì export ngay (**"Cài đặt"** → **"Dữ liệu"** → **"Export"**) |
| **Kiểm lại** | Mục **Backup** về **"Restore thử đạt"** sau lần restore thử kế tiếp |

## Domain riêng ngừng chạy

| | |
|---|---|
| **Nguyên nhân** | Xoá TXT record `_embra-challenge`: Embra kiểm lại mỗi 24 giờ, mất 3 lần liên tiếp thì ngừng phục vụ domain. Hoặc DNS không còn trỏ về Embra |
| **Xử lý** | Thêm lại TXT record và record trỏ về Embra theo [Gắn domain riêng](/huong-dan/domain-rieng/), rồi verify lại ([`DOMAIN_NOT_VERIFIED`](/loi/#domain_not_verified)) |
| **Kiểm lại** | `dig TXT _embra-challenge.<domain>` trả đúng giá trị; mở `https://<domain>` |

## Khi email hello@embra.cloud

Gửi kèm: `operation_id`, workspace, project/environment, giờ (ghi rõ giờ Việt Nam hay UTC), mã lỗi. Xem [Khi cần liên hệ](/loi/#khi-cần-liên-hệ).

## Xem thêm

- [Mã lỗi và cách sửa](/loi/)
- [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/)
- [Undo từng dòng](/huong-dan/undo-tung-dong/)
- [Xem log và theo dõi app](/huong-dan/log-va-theo-doi/)
