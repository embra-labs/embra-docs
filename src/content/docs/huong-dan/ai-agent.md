---
title: Dùng Embra với AI agent
description: Cho Claude Code, Cursor, Copilot hoặc ChatGPT đọc docs Embra và chuẩn bị repo để deploy, kèm mẫu AGENTS.md.
sidebar:
  order: 8
---

Trang này dành cho bạn nếu đang nhờ AI agent (Claude Code, Cursor, GitHub Copilot, ChatGPT…) sửa repo để chạy trên Embra.

Hôm nay agent làm tốt nhất phần **chuẩn bị repo**: cổng, health check, `embra.toml`, migration, Dockerfile. Bạn push lên GitHub, Embra build và deploy như bình thường. Những việc cần quyền như đặt secret và duyệt production vẫn do bạn làm trên web.

## Cho agent đọc docs

Docs Embra có bản văn bản thuần cho AI đọc:

| File | Nội dung |
|---|---|
| `https://docs.embra.cloud/llms-full.txt` | Toàn bộ docs tiếng Việt trong một file |
| `https://docs.embra.cloud/llms-small.txt` | Bản rút gọn |
| `https://docs.embra.cloud/llms.txt` | Mục lục |

Agent đọc tiếng Việt tốt, nên bạn có thể dùng thẳng bản tiếng Việt. Nếu agent không tự tải được URL, mở file trên trình duyệt rồi dán phần cần thiết vào cuộc trò chuyện.

## Thêm AGENTS.md vào repo

Tạo file `AGENTS.md` ở gốc repo. Claude Code, Cursor, Copilot và Codex đều đọc file này khi làm việc trong repo. Chép mẫu dưới đây, rồi sửa hai dòng có dấu `<…>`.

```markdown
# AGENTS.md

App này deploy lên Embra. Docs: https://docs.embra.cloud/llms-full.txt

## Yêu cầu của Embra
- Cấu hình deploy nằm trong `embra.toml` ở gốc repo. Trường lạ hoặc sai kiểu bị báo lỗi.
- App lắng nghe ở `0.0.0.0`, cổng lấy từ biến `PORT` (mặc định 3000). Không dùng `127.0.0.1`.
- `GET` tới `health_path` (mặc định `/`) phải trả 2xx. Chuyển hướng 3xx không đạt.
- Hệ thống file chỉ đọc. Chỉ ghi vào `/tmp`. File người dùng tải lên lưu vào bucket S3 (biến `S3_*`).
- Postgres: đặt `database = true` trong `[deploy]`, đọc chuỗi kết nối từ `DATABASE_URL`. Không tự đặt `DATABASE_URL`.
- Migration: file SQL `NNNN_ten.sql` trong thư mục `migrations/`. Không sửa file đã chạy, thêm file mới số lớn hơn.
- App không tự chạy migration khi khởi động (tài khoản database của app không đổi được schema).
- Build không nhận secret. `[build] env` không được chứa giá trị bí mật.

## Việc agent không làm
- Không ghi giá trị secret vào code, `embra.toml` hay commit. Khi cần secret mới, liệt kê tên biến trong mô tả PR để người có quyền đặt trên web (Cài đặt → Secrets).
- Không duyệt, xoá hay export trên Embra. Production luôn chờ Owner hoặc Admin duyệt.

## Lệnh của dự án
- Cài đặt và build: <lệnh build, ví dụ npm ci && npm run build>
- Chạy local: <lệnh start, ví dụ PORT=3000 npm start>
```

Dùng Claude Code thì tạo thêm `CLAUDE.md` ở gốc repo, chỉ một dòng:

```markdown
@AGENTS.md
```

## Câu lệnh mẫu để giao việc

Dán vào agent sau khi đã có `AGENTS.md`:

```text
Đọc https://docs.embra.cloud/llms-full.txt và AGENTS.md. Kiểm tra repo này đã đủ điều kiện chạy trên Embra chưa:
cổng và 0.0.0.0, health check trả 2xx, không ghi file ngoài /tmp, không tự chạy migration khi khởi động,
embra.toml hợp lệ. Sửa những gì thiếu. Liệt kê các secret app cần (chỉ tên, không ghi giá trị).
Không đổi hành vi của app ngoài các điểm trên.
```

Repo đã có migration Prisma hoặc ORM khác thì thêm: "Chuyển migration sang dạng `migrations/NNNN_ten.sql` theo trang Database và migration."

## Kiểm lại trước khi push

Agent có thể làm sai. Trước khi push, kiểm nhanh:

1. Mở `embra.toml` và đối chiếu với [Chuẩn bị app](/huong-dan/chuan-bi-app/#embratoml).
2. Chạy app local với `PORT=3000`, mở `http://localhost:3000<health_path>` và thấy mã 2xx.
3. Tìm trong diff xem có giá trị giống secret không (khoá API, mật khẩu, chuỗi kết nối).
4. Xem lại file migration mới: đúng thứ tự số, không sửa file cũ.

Deploy lỗi thì dán nguyên văn mã lỗi và log build cho agent, kèm link [Mã lỗi và cách sửa](/loi/).

## Agent dùng CLI và MCP

CLI `embra` có lệnh `embra mcp` để agent gọi Embra trực tiếp, với token `agent`. Token này đọc, build, deploy staging và tạo plan production, nhưng **không bao giờ** duyệt, xoá, export hay đọc URL database. Xem [Phân quyền](/workspace/phan-quyen/).

:::note[Đăng nhập CLI chưa bật cho khách]
Token `agent` lấy bằng `embra login --agent`, lệnh này cần trang duyệt trên trình duyệt mà hiện chưa bật cho khách. Trong lúc chờ, agent chuẩn bị repo, còn bạn deploy và duyệt trên web.
:::
