---
title: Danh sách lệnh
description: Các lệnh của CLI embra.
---

:::note[Đăng nhập CLI sắp có]
Lệnh `embra login` cần một trang duyệt trên trình duyệt, trang này chưa được bật cho khách. Trong lúc chờ, mọi việc làm được trên web: xem [Bắt đầu nhanh](/bat-dau/bat-dau-nhanh/).
:::

Chạy `embra <lệnh> --help` để xem đủ cờ. Thêm `--json` để lấy kết quả dạng máy đọc.

## Tài khoản và workspace

| Lệnh | Việc |
|---|---|
| `embra login` | Đăng nhập qua trình duyệt, nhận token mang vai trò của bạn |
| `embra login --agent` | Xin token `agent` cho `embra mcp` |
| `embra logout` | Xoá token khỏi cấu hình |
| `embra workspace show` | Xem workspace và quyền của token |
| `embra workspace rename <tên mới>` | Đổi tên workspace (chỉ owner). ID, địa chỉ app và token giữ nguyên |
| `embra token create --scope <dev\|viewer\|agent\|ci> --name <name> --ttl <ttl>` | Tạo token (in một lần). `--ttl` bắt buộc, tối đa `90d` |
| `embra token list` / `revoke <token_id>` | Liệt kê, thu hồi token |
| `embra members list` | Liệt kê thành viên và lời mời (Owner, Admin). Mời, đổi vai trò, gỡ: làm trên web |

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
| `embra up [directory]` | Upload thư mục, build và deploy |
| `embra build` | Build từ repo đã nối; build xong tự tạo plan deploy |
| `embra deploy` | Tạo plan deploy từ `embra.json` và image theo digest |
| `embra approve <op_id> --binding <sha256:…>` | Owner hoặc Admin duyệt plan đã xem |
| `embra cancel <op_id>` | Huỷ operation chưa bắt đầu chạy |
| `embra rollback` | Trả code về release trước |
| `embra plan` | Diễn tập migration trên bản sao dữ liệu, không deploy |
| `embra status [op_id]` / `embra wait <op_id>` | Trạng thái / chờ operation tới trạng thái dừng |
| `embra operation get <op_id>` | Xem trạng thái một operation |
| `embra events` | Dòng sự kiện của workspace |
| `embra schema` | In JSON Schema của `embra.json` |

`embra.json` chỉ dùng cho `embra deploy`, khi bạn đã có image build sẵn. Deploy từ GitHub và `embra build` đọc `embra.toml` trong repo (xem [Chuẩn bị app](/huong-dan/chuan-bi-app/)).

## Postgres

| Lệnh | Việc |
|---|---|
| `embra db create` | Dựng Postgres riêng cho environment |
| `embra db url` | In connection string role runtime (chứa mật khẩu) |
| `embra db verify` | Kiểm chứng khả năng khôi phục backup |
| `embra db restore-points` | Khoảng thời gian có thể khôi phục (PITR) |
| `embra db restore` | Khôi phục về một mốc thời gian; chờ Owner hoặc Admin duyệt rồi mới chuyển |
| `embra db import --env <project>/<env> <file>` | Nhập dữ liệu từ file `pg_dump --data-only` (gzip được). Bảng đích phải trống; production chờ Owner hoặc Admin duyệt. Xem [Chuyển app có sẵn](/huong-dan/chuyen-app-co-san/) |
| `embra db undo start` / `run` / `fix` … | Hoàn tác từng dòng: dựng bản sao về một mốc, so với production, sinh file SQL sửa (không tự áp). Xem `embra db undo --help` |

## Secret, log, metrics, cỡ app

| Lệnh | Việc |
|---|---|
| `embra secret set KEY` | Đặt secret, giá trị đọc từ stdin |
| `embra secret list` | Liệt kê secret (không có giá trị) |
| `embra secret unset KEY --version N` | Thu hồi một version của secret |
| `embra logs` | Log của app (`--env`) hoặc của một build (`--build <op_id>`) |
| `embra metrics` | CPU, RAM, HTTP, Postgres kèm mốc deploy/migration |
| `embra size <project>/<env> [<size>]` | Xem cỡ app và tài nguyên; thêm cỡ (ví dụ `256MiB`) để đặt cỡ app production, áp dụng ở lần deploy sau |

## Xoá và export

| Lệnh | Việc |
|---|---|
| `embra export --env <project>/<env>` | Xuất bundle app + dữ liệu để chạy ở nơi khác (Owner, Admin) |
| `embra delete <project>/<env> --confirm <env-slug>` | Xoá environment, không quay lại được (Owner, Admin) |
| `embra delete --confirm <workspace-name>` | Xoá cả workspace, không quay lại được (chỉ Owner) |

Export và xoá production cần người thật: làm trên web, hoặc trong 12 giờ sau `embra login`. Xem [Thành viên và phân quyền](/workspace/phan-quyen/#việc-cần-người-thật).

## Khác

| Lệnh | Việc |
|---|---|
| `embra version` | In phiên bản embra |
