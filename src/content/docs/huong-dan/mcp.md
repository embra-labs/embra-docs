---
title: MCP cho AI agent
description: Nối Claude Code, Codex hoặc Cursor với Embra qua `embra mcp`. Agent deploy lên dev, đọc log, tạo plan production; không approve, xoá hay đọc secret được.
sidebar:
  order: 9
---

`embra mcp` là MCP server (stdio) nằm trong CLI. Agent gọi Embra trực tiếp: deploy thư mục dự án lên environment `dev`, đọc build log, tìm log app, tạo plan production chờ bạn approve.

## Cài đặt

1. Cài CLI: [Cài đặt CLI](/cli/cai-dat/).
2. Chạy (bạn chạy, không phải agent):

   ```sh
   embra login --agent
   ```

   Browser mở trang **Đăng nhập CLI**. Gõ mã 8 chữ in trong terminal, approve cho `embra-mcp@<tên máy>`. Token scope `agent` lưu ở `config.agent.json`, tách khỏi token của bạn.
3. Thêm server vào client:

   | Client | Lệnh | Đã kiểm |
   |---|---|---|
   | Claude Code | `claude mcp add embra -- embra mcp` | Có (04/11/2026, CLI 0.1.1) |
   | Codex | `codex mcp add embra -- embra mcp` | Chưa |
   | Cursor | `.cursor/mcp.json`: `{"mcpServers": {"embra": {"command": "embra", "args": ["mcp", "--root", "${workspaceFolder}"]}}}` | Chưa |

4. Kiểm tra: bảo agent "gọi tool embra_workspace". Kết quả có `token_scope` là `agent`.

Chưa có MCP remote (URL dán vào Claude.ai hay ChatGPT). Hiện chỉ dùng được với client chạy trên máy bạn.

## Giới hạn

| Embra đảm bảo | Embra không đảm bảo |
|---|---|
| Token `agent` không approve, xoá, export, rollback, restore, đặt secret hay đọc URL database được. Server từ chối, không phụ thuộc prompt. | Agent không bị prompt injection. Log app là text bất kỳ ai cũng ghi vào được. |
| Production chỉ tạo plan, dừng ở chờ approve. Owner hoặc Admin approve trên console. | Agent không deploy code lỗi lên `dev`. `dev` là chỗ để thử. |
| `embra_deploy_directory` chỉ upload thư mục dự án trở xuống, bỏ `.env*`, `node_modules`, `.git` và file trong `.gitignore`/`.embraignore`. | Client hỏi bạn trước mỗi tool. Tuỳ cấu hình client. |
| Text của app (log, build output) trả về với mỗi dòng có khung `│`, nằm riêng trong `untrusted_text`, `untrusted_excerpt` hoặc `lines[].text`. | |

Quyền chi tiết của token `agent`: [Phân quyền](/workspace/phan-quyen/).

## Tool

| Nhóm | Tool |
|---|---|
| Deploy | `embra_deploy_directory` (lên `dev`; `prod=true` chỉ tạo plan), `embra_build` (từ repo GitHub đã nối), `embra_get_url` |
| Tìm lỗi | `embra_get_build_log`, `embra_search_logs`, `embra_get_metrics` |
| Chuẩn bị an toàn | `embra_plan`, `embra_rehearse` (chạy migration trên bản copy database), `embra_estimate` |
| Đọc trạng thái | `embra_workspace`, `embra_projects`, `embra_environments`, `embra_environment`, `embra_operation`, `embra_wait` |
| Tra cứu | `embra_explain_reason` (giải thích `reason_code`: retry được không, `next_action`, cách sửa), `embra_docs_search`, `embra_docs_read` (chỉ đọc docs.embra.cloud). Từ CLI 0.1.2 |
| Fork production | `embra_fork` (chờ Owner hoặc Admin approve), `embra_fork_status`, `embra_fork_access` (khoá truy cập fork, mỗi lần đọc đều được ghi lại) |

- `environment_id` nhận ID (`env_…`) hoặc `<project>/<env>`, ví dụ `shop/dev`.
- Tool tạo thao tác nhận `idempotency_key`. Không truyền thì gọi lại y hệt trong 10 phút trả về thao tác cũ, không tạo trùng.
- Plan production trả `approval_url`: link để bạn approve trên console.
- Kết quả lỗi có `docs_url`: link tới [Mã lỗi và cách sửa](/loi/), cùng link CLI in ra.

## Lỗi thường gặp

`embra mcp` không khởi động thì client báo server lỗi; dòng lỗi nằm trong log MCP của client.

| Lỗi | Sửa |
|---|---|
| ``thiếu token agent. Chạy `embra login --agent` …`` | Chạy `embra login --agent`. |
| `token có quyền "…", không phải agent: …` | `EMBRA_TOKEN` đang chứa token của bạn. Bỏ biến đó, chạy `embra login --agent`. |
| `API không chấp nhận token (HTTP 401). …` | Token hết hạn hoặc bị thu hồi. Chạy lại `embra login --agent`. |
| Agent không thấy `embra_deploy_directory` | Thư mục client chạy server không phải thư mục dự án. Thêm `--root <đường dẫn dự án>` vào args. |

<details>
<summary>Thư mục nào được upload</summary>

- Có `--root`: thư mục đó trở xuống.
- Không có `--root`: thư mục làm việc của server, phải có một trong `embra.toml`, `.git`, `package.json`, `go.mod`, `pyproject.toml`, `requirements.txt`, `Dockerfile`.
- Từ chối `/`, thư mục home và thư mục chứa home. Khi đó `embra_deploy_directory` không xuất hiện, lý do ghi ra stderr.
- Claude Code chạy server trong thư mục bạn mở Claude Code.

</details>

## Xem thêm

- [Dùng Embra với AI agent](/huong-dan/ai-agent/): chuẩn bị repo, mẫu `AGENTS.md`.
- [Staging, production và duyệt](/huong-dan/staging-production-va-duyet/): approve plan production.
- [Mã lỗi và cách sửa](/loi/)
