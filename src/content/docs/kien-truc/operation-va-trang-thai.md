---
title: Operation và trạng thái
description: Mỗi thao tác là một operation có state. Bảng state, nhãn trên console, exit code CLI, và state nào chuyển được sang state nào.
sidebar:
  order: 2
---

Mỗi thao tác thay đổi (build, deploy, rollback, restore, import…) là một **operation** có `operation_id` và một `state`. Xem bằng `embra status <op_id>` hoặc **"Lần deploy"** trên console.

## Bảng state

| `state` | Console | Nghĩa | Exit code |
|---|---|---|---|
| `requested` | Đã tiếp nhận | Embra đã nhận, chưa bắt đầu | — |
| `planned` | Đã chuẩn bị | Deploy đã có plan | — |
| `rehearsing` | Đang chạy thử migration | Rehearsal trên bản copy data | — |
| `awaiting_approval` | Chờ duyệt | Chờ Owner hoặc Admin approve | `20` |
| `ready` | Sẵn sàng deploy | Đã approve (hoặc không cần), chờ chạy | — |
| `migrating` | Đang chạy migration | Đang áp migration lên production | — |
| `starting` | Đang khởi động | Start container bản mới, chờ health check | — |
| `switching` | Đang chuyển traffic | Chuyển traffic sang bản mới (hoặc database mới khi restore) | — |
| `observing` | Đã nhận traffic, đang theo dõi | Bản mới nhận traffic, Embra theo dõi thêm | — |
| `running` | Đang thực hiện | Operation khác deploy đang chạy | — |
| `healthy` | Deploy thành công (rollback: Rollback xong) | Deploy hoặc rollback xong, bản mới phục vụ | `0` |
| `succeeded` | Hoàn tất | Operation khác deploy xong | `0` |
| `failed` | Thất bại | Không làm được; xem `reason_code` | `10` |
| `rejected` | Đã từ chối | Người duyệt từ chối, hoặc Embra từ chối trước khi chạy | `10` |
| `cancelled` | Đã huỷ | Bị huỷ trước khi đụng production | `10` |
| `recovery_required` | Cần đội Embra hỗ trợ | Không rõ kết quả, environment bị chặn | `30` |
| `migration_unknown` | Cần xác minh dữ liệu | Mất liên lạc lúc chạy migration, environment bị chặn | `30` |

- **Exit code** là của `embra wait` / `embra status` khi operation đang ở state đó. "—" = state chưa kết thúc, exit code tính theo `reason_code` ([Exit code và JSON](/cli/exit-code-va-json/)).
- State cuối (không đổi nữa): `healthy`, `succeeded`, `failed`, `rejected`, `cancelled`, `recovery_required`, `migration_unknown`. `ready` **không** phải state cuối.
- `embra wait` dừng ở state cuối hoặc ở `awaiting_approval`.

## Deploy

```
planned → rehearsing → awaiting_approval → ready → migrating → starting → switching → observing → healthy
```

| Từ | Sang được |
|---|---|
| `planned` | `rehearsing`, `awaiting_approval`, `ready`, `cancelled` |
| `rehearsing` | `awaiting_approval`, `ready`, `failed`, `cancelled` |
| `awaiting_approval` | `ready`, `rejected`, `cancelled` |
| `ready` | `migrating`, `starting`, `failed`, `cancelled` |
| `migrating` | `starting`, `failed`, `migration_unknown` |
| `starting` | `switching`, `failed` |
| `switching` | `observing`, `failed` |
| `observing` | `healthy`, `failed` |

- Không có migration: bỏ qua `rehearsing` và `migrating`. Không cần approve (staging không có migration xoá data): bỏ qua `awaiting_approval`.
- `ready` → `failed`: lỗi biết trước khi đụng production (ví dụ không chụp được snapshot trước migration).
- Từ `migrating` chỉ có `starting`, `failed`, hoặc `migration_unknown`. Đã vào `migrating` thì không huỷ được.
- Fail sau `migrating` (ví dụ health check): migration **đã áp**, code cũ chạy trên schema mới.

## Các loại khác

| Operation | Đường đi |
|---|---|
| Rollback | `requested` → `switching` → `observing` → `healthy`; từ chối sớm → `rejected` |
| Build | `requested` → `running` → `succeeded`; push mới hơn → `cancelled` |
| Restore (PITR) | `requested` → `running` → `awaiting_approval` → `switching` → `succeeded`; không chuyển → `rejected` / `cancelled` |
| Import data | `requested` → (`awaiting_approval` ở production) → `running` → `succeeded` |
| Fork | `requested` → `awaiting_approval` → `succeeded` |
| Còn lại (dựng Postgres, backup, export, secret, domain…) | `requested` → `running` → `succeeded` |

Ngoài các bảng trên, mọi state chưa kết thúc đều có thể sang `recovery_required` (trừ `migrating`, dùng `migration_unknown`). Riêng export và so sánh của `embra db undo` chỉ đọc, nên không bao giờ thành `recovery_required`.

## `recovery_required` và `migration_unknown`

Hai state này nghĩa là Embra **không biết** bước vừa rồi đã xong chưa. Embra cố ý không retry, vì chạy lại một migration hay một lần chuyển database chưa rõ kết quả có thể làm hỏng data.

- Environment bị chặn: mọi thao tác thay đổi trả [`ENVIRONMENT_BLOCKED`](/loi/#environment_blocked) tới khi đội Embra xác minh xong.
- Không xoá environment, không chạy SQL tay. Xem [`RECOVERY_REQUIRED`](/loi/#recovery_required), [`MIGRATION_UNKNOWN`](/loi/#migration_unknown).
