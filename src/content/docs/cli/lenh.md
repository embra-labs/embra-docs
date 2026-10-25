---
title: Danh sách lệnh
description: Các lệnh của CLI embra.
---

Chạy `embra <lệnh> --help` để xem đủ cờ. Thêm `--json` để lấy kết quả dạng máy đọc.

## Tài khoản và workspace

| Lệnh | Việc |
|---|---|
| `embra login` / `embra logout` | Đăng nhập / đăng xuất |
| `embra workspace show` | Xem workspace và quyền của token |
| `embra token create` / `list` / `revoke <token_id>` | Tạo (in một lần), liệt kê, thu hồi token |

## Project và environment

| Lệnh | Việc |
|---|---|
| `embra project create <slug>` / `list` | Tạo / liệt kê project |
| `embra env create <project> <slug>` / `list <project>` | Tạo / liệt kê environment |
| `embra github connect` | Kết nối GitHub |
| `embra source set` | Nối environment với repo + nhánh qua GitHub App đã cài |

## Build và deploy

| Lệnh | Việc |
|---|---|
| `embra up [thư mục]` | Upload thư mục, build và deploy |
| `embra build` | Build từ repo đã nối; build xong tự tạo plan deploy |
| `embra deploy` | Tạo plan deploy từ `embra.json` và image theo digest |
| `embra approve <op_id> --binding <sha256:…>` | Chủ workspace duyệt plan đã xem |
| `embra cancel <op_id>` | Huỷ operation chưa bắt đầu chạy |
| `embra rollback` | Trả code về release trước |
| `embra status [op_id]` / `embra wait <op_id>` | Trạng thái / chờ operation tới trạng thái dừng |
| `embra events` | Dòng sự kiện của workspace |
| `embra schema` | In JSON Schema của `embra.json` |

## Postgres

| Lệnh | Việc |
|---|---|
| `embra db create` | Dựng Postgres riêng cho environment |
| `embra db url` | In connection string role runtime (chứa mật khẩu) |
| `embra db verify` | Kiểm chứng khả năng khôi phục backup |
| `embra db restore-points` | Khoảng thời gian có thể khôi phục (PITR) |
| `embra db restore` | Khôi phục về một mốc thời gian; chờ chủ workspace duyệt rồi mới chuyển |

## Secret, log, metrics

| Lệnh | Việc |
|---|---|
| `embra secret set KEY` | Đặt secret, giá trị đọc từ stdin |
| `embra secret list` | Liệt kê secret (không có giá trị) |
| `embra secret unset KEY --version N` | Thu hồi một version của secret |
| `embra logs` | Log của app (`--env`) hoặc của một build (`--build <op_id>`) |
| `embra metrics` | CPU, RAM, HTTP, Postgres kèm mốc deploy/migration |

## Xoá và export (chỉ owner)

| Lệnh | Việc |
|---|---|
| `embra export --env <project>/<env>` | Xuất bundle app + dữ liệu để chạy ở nơi khác |
| `embra delete <project>/<env> --confirm <env-slug>` | Xoá environment, không quay lại được |
| `embra delete --confirm <tên workspace>` | Xoá cả workspace, không quay lại được |
