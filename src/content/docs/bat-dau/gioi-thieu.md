---
title: Giới thiệu
description: Embra làm gì và các khái niệm cơ bản.
sidebar:
  order: 1
---

Embra là nền tảng hosting cho Việt Nam: connect repo GitHub → Embra build trong microVM → deploy app kèm Postgres riêng, luôn có đường lui cho data.

## Embra làm gì

| Tính năng | Chi tiết |
|---|---|
| Build + deploy từ git | GitHub App nhận push, build bằng Railpack hoặc Dockerfile trong microVM, ra image theo digest, rồi tạo plan kèm giá dự kiến. Deploy production luôn cần Owner hoặc Admin approve |
| Migration có gate | Migration được phân loại và chạy thử trên bản clone trước khi chạy thật. Không rõ kết quả thì Embra dừng chờ người xử lý, không tự retry |
| Postgres riêng mỗi environment | Backup liên tục (WAL) + full backup mỗi 7 ngày trên ổ riêng. Gói trả phí được restore thử mỗi ngày trên bản sao cách ly, có đo thời gian khôi phục (RTO). Có bản copy ngoài server (object storage tại Hà Nội). Restore về một thời điểm (PITR) ra DB mới, Owner hoặc Admin approve rồi mới chuyển |
| Tài nguyên khác | Worker, cron, bucket object storage, domain riêng + HTTPS tự cấp, preview environment theo PR, tạm dừng / chạy lại, export toàn bộ app và data |

## Khái niệm

| Khái niệm | Nghĩa |
|---|---|
| Workspace | Tài khoản của một đội hoặc doanh nghiệp. Gói và thành viên gắn ở đây. Xem [Thành viên và phân quyền](/workspace/phan-quyen/) |
| Project | Một app, thường ứng với một repo |
| Environment | Một bản chạy của project (`production`, `staging`, preview theo PR), có Postgres và secret riêng |
| Operation | Mỗi việc có side effect (deploy, restore, xoá…) là một operation có trạng thái, xem lại được |
| Plan | Mô tả việc sắp làm kèm giá dự kiến. Việc quan trọng phải approve plan trước khi chạy |

## Cách dùng

- **Web console**: giao diện chính.
- **CLI `embra`**: xem [danh sách lệnh](/cli/lenh/).
- **HTTP API** `/v1`: chưa công bố tài liệu tham chiếu.
- **MCP** (`embra mcp`): cho AI agent. Agent không bao giờ được approve, xoá hay export.

Bắt đầu: [Bắt đầu nhanh](/bat-dau/bat-dau-nhanh/).
