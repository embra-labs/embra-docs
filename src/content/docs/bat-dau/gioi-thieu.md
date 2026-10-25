---
title: Giới thiệu
description: Embra làm gì và các khái niệm cơ bản.
sidebar:
  order: 1
---

Embra là nền tảng hosting cho Việt Nam. Bạn nối một repo GitHub; Embra build trong microVM, deploy app kèm Postgres riêng và giữ đường lui cho dữ liệu.

## Embra làm gì

- **Build và deploy từ git.** GitHub App nhận push, build bằng Railpack hoặc Dockerfile trong microVM, ra image theo digest, rồi lập plan có giá dự kiến. Deploy lên production luôn cần Owner hoặc Admin duyệt.
- **Migration có cổng duyệt.** Mỗi deploy có migration được phân loại và diễn tập trên bản clone trước khi chạy thật. Nếu không rõ kết quả, Embra dừng lại chờ người xử lý chứ không tự chạy lại.
- **Postgres riêng mỗi environment.** Backup liên tục, có bản sao ngoài máy và được tự kiểm chứng. Có thể khôi phục về một thời điểm (PITR) ra DB mới, Owner hoặc Admin duyệt rồi mới chuyển.
- **Tài nguyên khác.** Worker và cron, bucket object storage, domain riêng kèm HTTPS tự cấp, preview environment theo PR, tạm dừng / chạy lại, export toàn bộ app và dữ liệu.

## Khái niệm

| Khái niệm | Nghĩa |
|---|---|
| Workspace | Tài khoản của một đội hoặc một doanh nghiệp. Gói cước và thành viên gắn ở đây. Xem [Thành viên và phân quyền](/workspace/phan-quyen/). |
| Project | Một app, thường ứng với một repo. |
| Environment | Một bản chạy của project (ví dụ `production`, `staging`, preview theo PR), có Postgres và secret riêng. |
| Operation | Mỗi việc có tác dụng phụ (deploy, restore, xoá…) là một operation có trạng thái, xem lại được. |
| Plan | Bản mô tả việc sẽ làm kèm giá dự kiến. Việc quan trọng phải được duyệt plan trước khi chạy. |

Bắt tay vào việc: xem [Bắt đầu nhanh](/bat-dau/bat-dau-nhanh/).

## Cách dùng

- **Web console** — giao diện chính.
- **CLI `embra`** — xem [danh sách lệnh](/cli/lenh/).
- **HTTP API** `/v1` — tài liệu tham chiếu sẽ có sau.
- **MCP** (`embra mcp`) — cho AI agent. Agent không bao giờ được duyệt, xoá hay export.
