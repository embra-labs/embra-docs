---
title: Chạy migration an toàn
description: Quy trình một migration production qua migration gate - pre-flight, rehearsal, approve, kiểm tra sau deploy, và làm gì khi migration làm hỏng production.
sidebar:
  order: 5
---

Mọi thay đổi schema đi qua migration gate: rehearsal trên bản copy data → approve → chạy trên production → kiểm lại. Cách viết file migration: [Database và migration](/huong-dan/database-va-migration/).

## Giới hạn

| Embra đảm bảo | Embra không đảm bảo |
|---|---|
| Rehearsal fail thì production chưa bị đụng | Rehearsal đạt = production đạt. Schema production đổi sau rehearsal thì plan bị huỷ ([`SCHEMA_DRIFT`](/loi/#schema_drift)) |
| Mỗi file chạy trong một transaction (trừ `CREATE INDEX CONCURRENTLY`) | Cả plan là atomic: các file trước file lỗi có thể đã áp |
| Code mới chỉ start sau khi migration xong | Code **cũ** chạy được trên schema mới. Đó là việc của bạn, xem [Expand/contract](/huong-dan/expand-contract/) |
| Không tự retry khi không rõ migration đã chạy chưa ([`MIGRATION_UNKNOWN`](/loi/#migration_unknown)) | Tự gỡ chặn sau sự cố. Đội Embra xác minh rồi mới mở lại |
| Restore về mốc **sau** migration | Rollback code hay restore database về **trước** migration đã chạy |

## Cần có

- **Owner** hoặc **Admin** để approve: trên web (session login trong 12 giờ), hoặc CLI trong 12 giờ sau `embra login`. Developer tạo plan được, không approve được.
- Thư mục migration khai đúng chỗ:

| Cách deploy | Khai ở |
|---|---|
| Push GitHub, **"Build lại"**, `embra build` | `embra.toml` → `[deploy] migrations` (mặc định `migrations`) |
| `embra plan` (rehearsal từ máy bạn) | `embra.json` → `migrations_dir`. Thiếu thì exit `2` |

## 1. Pre-flight

```sh
embra status --env <project>/<env>
embra db restore-points --env <project>/<env>
```

- Environment không bị chặn, không có operation đang chạy ([`OPERATION_IN_PROGRESS`](/loi/#operation_in_progress)).
- Mục **Backup** ở đầu trang environment là **"Restore thử đạt"**.
- Ghi lại **Mốc mới nhất**: mốc cuối cùng còn restore về được trước khi migration chạy.

Migration có `DROP`, `DELETE`, `UPDATE` hay đổi tên: **export trước** (**Cài đặt** → **Dữ liệu** → **Export**, hoặc `embra export --env <project>/<env>`). Migration chạy rồi thì export là đường duy nhất lấy lại data cũ.

Chưa có lệnh kiểm schema drift riêng. Embra tự kiểm ngay trước khi chạy migration (bước `verify_schema` bên dưới).

## 2. Rehearsal trước khi push (tuỳ chọn)

```sh
embra plan --env <project>/<env> --wait
```

Chạy migration trong `migrations_dir` trên bản copy data, không deploy, không tạo plan deploy.

| Exit | Nghĩa | Làm gì |
|---|---|---|
| `0` | Rehearsal đạt | Push |
| `2` | `embra.json` sai, thiếu `migrations_dir`, file vượt giới hạn | Sửa theo câu lỗi |
| `10` | [`MIGRATION_UNSUPPORTED`](/loi/#migration_unsupported), [`MIGRATION_REHEARSAL_FAILED`](/loi/#migration_rehearsal_failed), [`MIGRATION_HISTORY_CHANGED`](/loi/#migration_history_changed) | Sửa SQL, chạy lại |

## 3. Build, plan và approve

Push lên branch đã connect, bấm **"Build lại"**, hoặc:

```sh
embra build --env <project>/<env> --wait
```

Build xong Embra rehearsal lại trên bản copy data mới nhất và tạo plan deploy.

| Exit của `embra build --wait` | Nghĩa |
|---|---|
| `0` | Không cần approve (staging, migration không mất data), deploy đang chạy: theo dõi ở bước 4 |
| `20` | Plan chờ approve ([`APPROVAL_REQUIRED`](/loi/#approval_required) hoặc [`MIGRATION_DATA_LOSS`](/loi/#migration_data_loss)) |
| `10` | Build hoặc rehearsal fail, xem `reason_code` |

Approve: bấm **"Xem và duyệt"**, đọc phần **Migration**, có cảnh báo mất data thì gõ `CONFIRM_MIGRATION`, bấm **"Duyệt và deploy"**. Chi tiết: [Duyệt production](/huong-dan/staging-production-va-duyet/#duyệt-trên-console).

Plan gắn với đúng nội dung bạn đã xem. Có build mới, environment đổi, hay quá 24 giờ thì plan bị huỷ: build lại để có plan mới.

## 4. Embra chạy gì sau khi approve

| Bước | State | Nếu hỏng |
|---|---|---|
| `verify_schema`: schema production còn đúng bản đã rehearsal | `ready` | Plan huỷ, chưa áp gì: [`SCHEMA_DRIFT`](/loi/#schema_drift) |
| `pre_snapshot`: snapshot database | `ready` | Operation `failed`, chưa áp gì |
| `migrate`: áp từng file | `migrating` | File lỗi rollback, code cũ vẫn chạy: [`MIGRATION_LOCK_TIMEOUT`](/loi/#migration_lock_timeout), [`MIGRATION_REHEARSAL_FAILED`](/loi/#migration_rehearsal_failed). Mất kết nối giữa chừng: [`MIGRATION_UNKNOWN`](/loi/#migration_unknown) |
| `verify_after`: so schema sau migration với kết quả rehearsal | `migrating` | Khác dự đoán: event `migration_diverged`, deploy vẫn tiếp tục |
| Start code mới, health check, chuyển traffic | `starting` → `switching` → `observing` → `healthy` | Health check fail: code cũ chạy **trên schema mới** ([`HEALTHCHECK_FAILED`](/loi/#healthcheck_failed)) |

```sh
embra wait <op_id>
```

| Exit | Nghĩa |
|---|---|
| `0` | `healthy` |
| `10` | `failed`, `rejected` hoặc `cancelled`: xem `reason_code` |
| `30` | `recovery_required` hoặc `migration_unknown`: cần đội Embra |

## 5. Kiểm lại

```sh
embra status --env <project>/<env>
embra metrics --env <project>/<env>
embra logs --env <project>/<env>
```

`embra metrics` có mốc migration: so error rate và latency trước và sau mốc.

## Khi migration làm hỏng production

### Đã `DROP COLUMN`, app lỗi

| | |
|---|---|
| **Triệu chứng** | App trả 500, log có `column "…" does not exist` |
| **Nguyên nhân** | Code (cũ hoặc mới) còn đọc cột đã xoá |
| **Không làm được** | Rollback code về bản trước migration: [`ROLLBACK_INCOMPATIBLE`](/loi/#rollback_incompatible). Restore về trước migration: [`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point) |
| **Xử lý** | 1. Sửa code bỏ tham chiếu cột, push, approve: nhanh nhất. 2. Cần lại cột: migration mới `ADD COLUMN` (cho phép null). 3. Cần lại **data** của cột: lấy từ bản export ở bước pre-flight, đưa vào bằng migration `UPDATE` |
| **Kiểm lại** | Error rate trong `embra metrics` về mức trước mốc migration |

Không có export mà cần data cũ: email hello@embra.cloud kèm `operation_id`. Snapshot ở bước `pre_snapshot` chỉ đội Embra dùng được.

### Các trường hợp khác

| Triệu chứng | Nguyên nhân | Xử lý | Kiểm lại |
|---|---|---|---|
| Plan bị huỷ, [`SCHEMA_DRIFT`](/loi/#schema_drift) | Schema production đổi sau rehearsal | **"Build lại"** hoặc `embra build` | Plan mới chờ approve |
| [`MIGRATION_LOCK_TIMEOUT`](/loi/#migration_lock_timeout) | Query dài giữ lock bảng | Dừng query dài, build lại lúc ít traffic | `embra wait` exit `0` |
| `Migration đã áp, code mới chưa chạy. Code cũ đang phục vụ trên schema mới.` | Code mới fail health check sau migration | Sửa code cho chạy trên schema mới, push | `healthy` |
| **"Cần xác minh dữ liệu"**, exit `30` | Mất kết nối lúc đang migrate | **Đừng** sửa file migration, chạy SQL tay hay xoá environment. Email kèm `operation_id` | Đội Embra mở lại environment |

## Xem thêm

- [Database và migration](/huong-dan/database-va-migration/)
- [Expand/contract](/huong-dan/expand-contract/)
- [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/)
- [Mã lỗi: Database và migration](/loi/#database-và-migration)
