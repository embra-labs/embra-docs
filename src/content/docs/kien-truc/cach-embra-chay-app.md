---
title: Embra chạy app thế nào
description: Từ git push tới app nhận traffic - build trong microVM, image pin theo digest, container gVisor, Postgres riêng mỗi environment.
sidebar:
  order: 1
---

Từ code tới app đang chạy:

```
 git push / embra up
        │
        ▼
 ┌──────────────┐   build trong microVM dùng một lần
 │    Build     │   Railpack hoặc Dockerfile (BuildKit)
 └──────┬───────┘
        │ image pin theo digest (sha256:…)
        ▼
 ┌──────────────┐   rehearsal migration trên bản copy data
 │     Plan     │   → chờ approve (production)
 └──────┬───────┘
        ▼
 ┌──────────────┐   migration → start container → health check
 │    Deploy    │   → chuyển traffic → theo dõi
 └──────┬───────┘
        ▼
 Internet ──HTTPS──▶ Edge (Caddy) ──▶ App container (gVisor) ──▶ Postgres riêng của environment
```

## Các thành phần

| Thành phần | Làm gì | Bạn thấy ở đâu |
|---|---|---|
| Build | Mỗi build chạy trong một microVM (Firecracker) riêng, dùng xong bỏ. Railpack tự nhận diện app, hoặc dùng Dockerfile của bạn | Build log, operation `build` |
| Image | Kết quả build, gắn với một digest `sha256:…`. Deploy chỉ nhận image pin theo digest, không nhận tag | `embra.json` khi deploy bằng CLI |
| Plan | Bản mô tả deploy: image, env var, migration. Approve là approve đúng bản này (binding digest) | **"Xem và duyệt"** |
| App container | Chạy bằng containerd, mặc định trong sandbox gVisor: app không gọi thẳng kernel của server | Log, metrics |
| Edge | Caddy nhận HTTPS, cấp certificate, route tới app | Domain của app |
| Postgres | Mỗi environment một Postgres riêng (PostgreSQL 18), volume ZFS riêng. Chỉ app cùng environment kết nối được | [Database và migration](/huong-dan/database-va-migration/) |

## Control plane và host

Embra chia làm hai phần:

- **Control plane**: nhận request từ console, CLI, GitHub webhook; kiểm quyền; ghi mọi thao tác thành một operation có state ([Operation và trạng thái](/kien-truc/operation-va-trang-thai/)).
- **Host agent**: phần duy nhất đụng vào server (volume, container, network, Postgres, backup). Chỉ control plane gọi được agent; agent không nhận lệnh từ internet.

Mọi thay đổi đi qua operation. Bước nào không chắc đã xong (ví dụ mất kết nối giữa lúc chạy migration), Embra dừng và chặn environment thay vì tự retry: [`RECOVERY_REQUIRED`](/loi/#recovery_required), [`MIGRATION_UNKNOWN`](/loi/#migration_unknown).

## Migration và rehearsal

- Rehearsal chạy migration trên một bản clone ZFS của database production, không đụng production.
- Ngay trước khi chạy migration thật, Embra kiểm schema production còn đúng bản đã rehearsal ([`SCHEMA_DRIFT`](/loi/#schema_drift) nếu không), rồi chụp snapshot.
- Code mới chỉ start sau khi migration xong.

Chi tiết: [Database và migration](/huong-dan/database-va-migration/).

## Xem thêm

- [Giới hạn hệ thống](/kien-truc/gioi-han-he-thong/)
- [Operation và trạng thái](/kien-truc/operation-va-trang-thai/)
