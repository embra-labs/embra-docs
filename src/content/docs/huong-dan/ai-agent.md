---
title: Dùng Embra với AI agent
description: Cho Claude Code, Cursor, Copilot hoặc ChatGPT đọc docs Embra và chuẩn bị repo để deploy, kèm mẫu AGENTS.md.
sidebar:
  order: 8
---

AI agent (Claude Code, Cursor, GitHub Copilot, ChatGPT…) làm tốt nhất phần **chuẩn bị repo**: port, health check, `embra.toml`, migration, Dockerfile. Bạn push lên GitHub, Embra build và deploy như bình thường. Việc cần quyền như đặt secret và approve production vẫn do bạn làm trên web.

## Cho agent đọc docs

Đưa agent `https://docs.embra.cloud/llms.txt` trước: mục lục kèm mô tả từng trang và quy tắc cho agent. Agent tự chọn phần cần đọc.

| URL | Nội dung |
|---|---|
| `/llms.txt` | Mục lục, mỗi trang một dòng, trỏ tới bản `.md` |
| `/<trang>.md` | Bản Markdown của một trang, ví dụ `/huong-dan/deploy-tu-github.md` |
| `/llms/deploy.txt`, `migration`, `recovery`, `errors`, `account` | Gộp theo chủ đề, nhẹ hơn bản đầy đủ |
| `/llms-full.txt` | Toàn bộ docs trong một file |
| `/llms-small.txt` | Toàn bộ, bỏ edge case, note và trang mã lỗi |
| `/reasons.json` | Mọi `reason_code`: HTTP, retry được không, `next_action`, exit code, link docs |

Bản tiếng Anh: thêm `/en` phía trước (`/en/llms.txt`, `/en/llms-full.txt`, `/en/<trang>.md`). Agent đọc tiếng Việt tốt, dùng bản nào cũng được. Agent không tự fetch được URL thì mở file trên browser rồi dán phần cần vào chat.

## Thêm AGENTS.md vào repo

Tạo `AGENTS.md` ở root repo: Claude Code, Cursor, Copilot và Codex đều đọc file này. Copy mẫu dưới đây, sửa hai dòng có `<…>`.

```markdown
# AGENTS.md

App này deploy lên Embra. Docs: https://docs.embra.cloud/llms.txt

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

Dùng Claude Code thì tạo thêm `CLAUDE.md` ở root repo, chỉ một dòng:

```markdown
@AGENTS.md
```

## Prompt mẫu để giao việc

Dán vào agent sau khi đã có `AGENTS.md`:

```text
Đọc https://docs.embra.cloud/llms.txt (rồi các trang cần thiết) và AGENTS.md. Kiểm tra repo này đã đủ điều kiện chạy trên Embra chưa:
cổng và 0.0.0.0, health check trả 2xx, không ghi file ngoài /tmp, không tự chạy migration khi khởi động,
embra.toml hợp lệ. Sửa những gì thiếu. Liệt kê các secret app cần (chỉ tên, không ghi giá trị).
Không đổi hành vi của app ngoài các điểm trên.
```

Repo đã có migration Prisma hoặc ORM khác thì thêm: "Chuyển migration sang dạng `migrations/NNNN_ten.sql` theo trang Database và migration."

## Kiểm lại trước khi push

Agent có thể sai. Kiểm nhanh trước khi push:

1. Đối chiếu `embra.toml` với [Chuẩn bị app](/huong-dan/chuan-bi-app/#embratoml).
2. Chạy app local với `PORT=3000`, mở `http://localhost:3000<health_path>`, phải thấy 2xx.
3. Soát diff xem có giá trị giống secret không (API key, password, connection string).
4. Xem file migration mới: đúng thứ tự số, không sửa file cũ.

Deploy fail thì dán nguyên văn mã lỗi + build log cho agent, kèm link [Mã lỗi và cách sửa](/loi/).

## Agent dùng CLI và MCP

`embra mcp` cho agent gọi Embra trực tiếp bằng token `agent`. Token này đọc, build, deploy staging, tạo plan production, nhưng **không bao giờ** approve, xoá, export hay đọc URL database. Xem [Phân quyền](/workspace/phan-quyen/).

Token `agent`: bạn (người thật) chạy `embra login --agent` một lần và approve trên browser. Token lưu ở `config.agent.json`, tách khỏi token của bạn. Chưa có CLI: [Cài đặt CLI](/cli/cai-dat/).

Cài và dùng MCP với Claude Code, Codex, Cursor: [MCP cho AI agent](/huong-dan/mcp/).
