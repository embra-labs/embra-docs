---
title: How Embra runs your app
description: From git push to live traffic - builds in a microVM, images pinned by digest, gVisor containers, one Postgres per environment.
sidebar:
  order: 1
---

From code to a running app:

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

(Diagram labels: single-use build microVM; image pinned by digest; migration rehearsal on a data copy, then approval for production; migration → start container → health check → switch traffic → observe; each environment has its own Postgres.)

## Components

| Component | What it does | Where you see it |
|---|---|---|
| Build | Each build runs in its own single-use microVM (Firecracker). Railpack detects your app, or your Dockerfile is used | Build log, `build` operation |
| Image | The build result, identified by a `sha256:…` digest. Deploys only accept images pinned by digest, never tags | `embra.json` when deploying with the CLI |
| Plan | What a deploy will do: image, env vars, migrations. Approving approves exactly this plan (binding digest) | **"Xem và duyệt"** (review and approve) |
| App container | Run by containerd, by default inside a gVisor sandbox: the app does not call the server kernel directly | Logs, metrics |
| Edge | Caddy terminates HTTPS, issues certificates, routes to your app | Your app's domain |
| Postgres | One Postgres per environment (PostgreSQL 18) on its own ZFS volume. Only apps in the same environment can connect | [Database and migrations](/en/huong-dan/database-va-migration/) |

## Control plane and host

Embra has two parts:

- **Control plane**: takes requests from the console, CLI and GitHub webhooks; checks permissions; records every change as an operation with a state ([Operations and states](/en/kien-truc/operation-va-trang-thai/)).
- **Host agent**: the only part that touches the server (volumes, containers, network, Postgres, backups). Only the control plane can call it; it takes no commands from the internet.

Every change goes through an operation. When Embra is not sure a step finished (for example the connection drops mid-migration), it stops and blocks the environment instead of retrying: [`RECOVERY_REQUIRED`](/en/loi/#recovery_required), [`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown).

## Migrations and rehearsal

- Rehearsal runs your migrations on a ZFS clone of the production database; production is not touched.
- Right before the real migration, Embra checks that production's schema is still the one that was rehearsed ([`SCHEMA_DRIFT`](/en/loi/#schema_drift) if not), then takes a snapshot.
- New code starts only after the migration finishes.

Details: [Database and migrations](/en/huong-dan/database-va-migration/).

## See also

- [System limits](/en/kien-truc/gioi-han-he-thong/)
- [Operations and states](/en/kien-truc/operation-va-trang-thai/)
