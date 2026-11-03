---
title: Danh sách lệnh
description: Các lệnh của CLI embra.
---

:::note[CLI login sắp có]
`embra login` cần một trang approve trên browser, trang này chưa bật cho khách. Trong lúc chờ, mọi việc làm được trên web: xem [Bắt đầu nhanh](/bat-dau/bat-dau-nhanh/).
:::

Chạy `embra <lệnh> --help` để xem đủ flag. Thêm `--json` để lấy output dạng JSON.

## Tài khoản và workspace

| Lệnh | Việc |
|---|---|
| `embra login` | Login qua browser, nhận token mang role của bạn |
| `embra login --agent` | Xin token `agent` cho `embra mcp` |
| `embra login --profile <tên>` | Login vào một profile riêng (mỗi workspace một token, ví dụ workspace của từng khách). Chuyển workspace trên web trước khi approve |
| `embra profile list` / `use <tên>` / `remove <tên>` | Xem, chuyển, xoá profile trên máy. Một lệnh với profile khác: `embra --profile <tên> …` hoặc `EMBRA_PROFILE` |
| `embra login --with-token < token.txt` | Login bằng token có sẵn (CI, không có terminal). Không có terminal mà thiếu cờ này thì CLI báo lỗi ngay |
| `embra logout` | Xoá token khỏi config |
| `embra workspace show` | Xem workspace và permission của token |
| `embra workspace rename <tên mới>` | Đổi tên workspace (chỉ owner). ID, địa chỉ app và token giữ nguyên |
| `embra token create --scope <dev\|viewer\|agent\|ci> --name <name> --ttl <ttl>` | Tạo token (in một lần). `--ttl` bắt buộc, tối đa `90d` |
| `embra token list` / `revoke <token_id>` | Liệt kê, thu hồi token |
| `embra members list` | Liệt kê thành viên và lời mời (Owner, Admin). Mời, đổi role, gỡ: làm trên web |

## Project và environment

| Lệnh | Việc |
|---|---|
| `embra project create <slug>` / `list` | Tạo / liệt kê project |
| `embra env create <project> <slug>` / `list <project>` | Tạo / liệt kê environment |
| `embra github connect` | Connect GitHub |
| `embra source set` | Connect environment với repo + branch qua GitHub App đã cài |
| `embra link <project>/<env>` / `embra unlink` | Gắn thư mục với một environment (ghi `.embra/link.json`, `embra up` cũng ghi) / gỡ |

Bỏ `--env` được khi thư mục (hoặc thư mục cha trong cùng repo) có `.embra/link.json`, hoặc khi đặt `EMBRA_ENV=<project>/<env>`. Thứ tự: `--env` > `EMBRA_ENV` > `link.json`. Lệnh xoá hoặc ghi đè data (`rollback`, `db restore`, `db import`, `db start`/`stop`, `env pause`/`resume`, `export`, `secret unset`, `env delete`) luôn cần `--env` ghi rõ.

## Build và deploy

| Lệnh | Việc |
|---|---|
| `embra up [directory]` | Upload thư mục, build và deploy |
| `embra build` | Build từ repo đã connect; build xong tự tạo plan deploy |
| `embra deploy` | Tạo plan deploy từ `embra.json` và image pin theo digest |
| `embra approve <op_id> --binding <sha256:…>` | Owner hoặc Admin approve plan đã xem |
| `embra cancel <op_id>` | Huỷ operation chưa chạy |
| `embra rollback [--to <release_id>]` | Trả code về release trước, hoặc một release cũ hơn. Xem [Rollback](/huong-dan/rollback-va-khoi-phuc/) |
| `embra plan` | Chạy thử migration trên bản copy của data, không deploy |
| `embra status [op_id]` / `embra wait <op_id>` | Xem status / chờ operation tới trạng thái cuối |
| `embra operation get <op_id>` | Xem status một operation |
| `embra events` | 20 event mới nhất của workspace (`--limit`, `--since <seq>`, `--follow` để theo dõi tiếp) |
| `embra schema` | In JSON Schema của `embra.json` |

`embra.json` chỉ dùng cho `embra deploy`, khi bạn đã có image build sẵn. Deploy từ GitHub và `embra build` đọc `embra.toml` trong repo (xem [Chuẩn bị app](/huong-dan/chuan-bi-app/)).

## Postgres

| Lệnh | Việc |
|---|---|
| `embra db create` | Dựng Postgres riêng cho environment |
| `embra db url` | In connection string role runtime (chứa mật khẩu) |
| `embra db verify` | Kiểm tra backup restore được |
| `embra db restore-points` | Khoảng thời gian restore được (PITR) |
| `embra db restore` | Restore về một mốc thời gian; chờ Owner hoặc Admin approve rồi mới chuyển |
| `embra db import --env <project>/<env> <file>` | Import data từ file `pg_dump --data-only` (gzip được). Bảng đích phải trống; production chờ Owner hoặc Admin approve. Xem [Chuyển app có sẵn](/huong-dan/chuyen-app-co-san/) |
| `embra db undo start` / `run` / `fix` … | Undo từng dòng: dựng bản copy về một mốc, so với production, sinh file SQL sửa (không tự apply). Xem [Undo từng dòng](/huong-dan/undo-tung-dong/) |

## Secret, log, metrics, size app

| Lệnh | Việc |
|---|---|
| `embra secret set KEY` | Đặt secret, giá trị đọc từ stdin |
| `embra secret import --file .env` | Đặt nhiều secret từ file `.env` một lần (tất cả hoặc không cái nào; `--dry-run` chỉ in tên) |
| `embra secret list` | Liệt kê secret (không hiện giá trị) |
| `embra secret unset KEY --version N` | Revoke một version của secret |
| `embra logs` | Log của app (`--env`) hoặc của một build (`--build <op_id>`) |
| `embra metrics` | CPU, RAM, HTTP, Postgres kèm mốc deploy/migration |
| `embra env size <project>/<env> [<size>]` | Xem size app và tài nguyên; thêm size (ví dụ `256MiB`) để đặt size app production, áp dụng ở lần deploy sau |

## Xoá và export

| Lệnh | Việc |
|---|---|
| `embra export --env <project>/<env>` | Export bundle app + data để chạy ở nơi khác (Owner, Admin) |
| `embra env delete <project>/<env> --confirm <env-slug>` (thêm `--dry-run` để xem trước) | Xoá environment, không quay lại được (Owner, Admin) |
| `embra workspace delete --confirm <workspace-name>` | Xoá cả workspace, không quay lại được (chỉ Owner) |

`embra rollback`, `embra db restore` và `embra env delete` nhận `--dry-run`: CLI chỉ đọc và in việc sẽ làm (`dry_run: true`), không gửi gì. Quyền và migration vẫn do máy chủ kiểm khi chạy thật.

Export và xoá production cần người thật: làm trên web, hoặc trong 12 giờ sau `embra login`. Xem [Thành viên và phân quyền](/workspace/phan-quyen/#việc-cần-người-thật).

## Khác

| Lệnh | Việc |
|---|---|
| `embra version` (hoặc `embra --version`) | In version của embra |
| `embra commands` | In mọi lệnh, flag và exit code dạng JSON (cho AI agent) |
| `--field <đường dẫn>` (cờ chung) | Chỉ in một giá trị trong JSON kết quả, ví dụ `--field url`. Xem [Exit code và JSON](/cli/exit-code-va-json/) |
