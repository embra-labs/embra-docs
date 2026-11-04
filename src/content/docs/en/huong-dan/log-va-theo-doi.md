---
title: Logs and monitoring
description: Build logs, live and historical app logs, app status, health checks, metrics and deploy history in the console.
sidebar:
  order: 12
---

## Where is everything?

| To see | Where in the console |
|---|---|
| Whether the app is fine | The status band at the top of the environment page |
| Build logs | **"Logs"** → **"Build"** |
| App logs | **"Logs"** → **"Runtime"** |
| CPU, RAM, requests, 5xx errors | **"Logs"** → **"Số liệu"** (metrics) |
| Deploys, rollbacks, restores | **"Lần deploy"** (deploys) |
| Who did what | The **"Hoạt động"** (activity) panel on the overview page |

Every role in the workspace, Viewer included, can read logs and metrics.

## Reading the app status

The band at the top of the environment page sums things up in one label, plus three items: **Health check**, **Traffic**, **Backup**. The console refreshes every 5 seconds and only says **"Mọi thứ ổn"** (all good) once all three are confirmed.

| Label | Meaning |
|---|---|
| **"Mọi thứ ổn"** (all good) | Health check passing, the latest version has all traffic, the backup passed a restore test (if there is a database) |
| **"Đang chạy"** (running) | Health check passing, but something is not confirmed yet, for example the backup has never been restore-tested |
| **"Cần bạn xem"** (needs a look) | Traffic is switching to a new version, or the latest backup restore test failed |
| **"Có sự cố"** (problem) | The app is failing its health check, the latest operation failed, or the environment is blocked |
| **"Chưa xác nhận"** (not confirmed) | Fresh status could not be read, or there is no health check result yet |
| **"Chưa deploy"** (not deployed) | The environment has no deploy yet |

<details>
<summary>Per-service status in the "Những gì đang chạy" (what's running) table</summary>

| Service shows | Meaning |
|---|---|
| **"Khoẻ"** (healthy) | `health_path` returns 2xx |
| **"Không qua health check"** (failing health check) | `health_path` returns an error code or refuses the connection |
| **"Chưa có kết quả health check"** (no health check result yet) | The server could not be asked |
| **"Chưa kiểm tra được worker"** (worker not checked yet) | Workers have no health check of their own |
| **"Chờ đội Embra kiểm tra"** (waiting for the Embra team) | The environment is blocked after an incident, see [`ENVIRONMENT_BLOCKED`](/en/loi/#environment_blocked) |

</details>

How to set `health_path` and what passes during a deploy: see [Prepare your app](/en/huong-dan/chuan-bi-app/#health-check).

## Reading build logs

1. Open **"Logs"** → **"Build"**.
2. Pick the build in **"Bản build"** (build); the latest is selected by default.
3. Read the log. A running build's log appears as it goes.

If a build fails, look up the error code in [Error codes and fixes](/en/loi/). Build logs are kept for 30 days after the build ends.

## Watching app logs live

1. Open **"Logs"** → **"Runtime"**.
2. Pick the service in **"Service"** (`web` or a worker name).
3. Choose **"Trực tiếp"** (live). New lines appear as soon as the app prints them.

- **APP** lines come from your app; **EMBRA** lines are platform messages.
- Filter by text, source, log level or time. **"Tạm dừng cuộn"** (pause scrolling) to read, **"Theo dòng mới nhất"** (follow newest) to resume.
- Only the running version is shown. Logs of older versions are in **"Lịch sử"** (history) mode.
- If the app isn't running yet, the tab shows **"Chưa có log của app"** (no app logs yet) → click **"Xem build log"** (view build logs) to see the preparation steps.

| Limit | Value |
|---|---|
| Lines kept in the browser | At most 5,000. **"Sao chép"** (copy) and **"Tải .txt"** (download .txt) take the lines currently shown |
| Log streams open at once | At most 5 per workspace. Opening more fails with [`QUOTA_EXCEEDED`](/en/loi/#quota_exceeded); close some tabs |

### Times in the log

Containers run on UTC; for Vietnam time set the secret `TZ` = `Asia/Ho_Chi_Minh`. The time the console shows next to each line is when Embra read that line, not when the app wrote it.

## Searching log history

1. In **"Logs"** → **"Runtime"**, choose **"Lịch sử"** (history).
2. Enter the text to find (exact match, not a regex).
3. Pick a time span, from **"30 phút qua"** (last 30 minutes) to **"30 ngày qua"** (last 30 days) → **"Tìm"** (search).

- History includes logs of earlier versions, and request lines from the edge (choose the **"Request (edge)"** source).
- Each search returns at most the 500 newest lines. If older lines remain, narrow the time span or add search text.
- How many days are kept depends on your plan, up to 30 days; the console shows the number for your plan. Picking a longer span fails with [`QUOTA_EXCEEDED`](/en/loi/#quota_exceeded).
- If you see `Máy chủ này chưa bật lịch sử log` ([`TEMPORARILY_UNAVAILABLE`](/en/loi/#temporarily_unavailable)), log history is not on for your server; use **"Trực tiếp"** (live) mode.

## Viewing metrics

1. Open **"Logs"** → **"Số liệu"** (metrics).
2. In **"Xem cho"** (show), pick **"Toàn environment (HTTP)"** (whole environment), a service, or Postgres.
3. Pick a time range: 1 hour, 6 hours, 24 hours, 7, 14 or 30 days.

| Chart | What it measures |
|---|---|
| Requests per second, 5xx error rate, p95 latency | Requests through the edge, for the whole environment |
| CPU (cores), memory | Per service, with the service's limit |
| Postgres disk used | The environment's database |

Charts mark deploys, rollbacks, restores and migrations, and count app restarts and out-of-memory kills (OOM). Metrics retention depends on your plan, up to 30 days.

## Viewing deploy history

Open **"Lần deploy"** (deploys): builds, deploys, rollbacks and data restores from the 100 most recent operations. Filter with **"Tất cả"** (all), **"Deploy"**, **"Lỗi"** (failed), **"Chờ duyệt"** (awaiting approval). Click a row for details.

<details>
<summary>What each state means</summary>

| State | Meaning |
|---|---|
| **"Chờ duyệt"** (awaiting approval) | The plan waits for an Owner or Admin |
| **"Đang chạy thử migration"**, **"Đang chạy migration"** (rehearsing / running migrations) | Rehearsing on a copy, or running on production |
| **"Đang khởi động"**, **"Đang chuyển traffic"** (starting / switching traffic) | The new version is coming up |
| **"Đã nhận traffic, đang theo dõi"** (taking traffic, observing) | The new version has traffic and Embra keeps watching |
| **"Deploy thành công"**, **"Hoàn tất"** (deployed / done) | Finished |
| **"Thất bại"**, **"Đã huỷ"**, **"Đã từ chối"** (failed / cancelled / rejected) | Stopped; the old version keeps running if it failed before the traffic switch |
| **"Cần đội Embra hỗ trợ"** (needs the Embra team) | Outcome unknown, see [`RECOVERY_REQUIRED`](/en/loi/#recovery_required) |
| **"Cần xác minh dữ liệu"** (data needs verification) | Unknown whether a migration ran, see [`MIGRATION_UNKNOWN`](/en/loi/#migration_unknown) |

</details>

The **"Lịch sử & khôi phục"** (history & restore) rail at the top of the page draws deploys from up to the last 48 hours, next to the range of data you can restore. See [Rollback and restoring backups](/en/huong-dan/rollback-va-khoi-phuc/).

## Notifications when the app fails

Embra doesn't send email or messages yet when a build, deploy or the app fails. Watch the console, or use `embra wait` and `embra events` in scripts.

## Using the CLI

The matching commands ([install the CLI](/en/cli/cai-dat/)):

```sh
embra logs --env <project>/<env> --follow
embra logs --env <project>/<env> --process <worker-name>
embra logs --env <project>/<env> --since 2h --grep "timeout"
embra logs --build <op_id>
embra metrics --env <project>/<env> --range 7d
embra events --env <project>/<env>
```

`embra logs --since` searches log history: 200 lines by default, at most 1000 (`--limit`).

## See also

- [Deploy from GitHub](/en/huong-dan/deploy-tu-github/)
- [Prepare your app: health check](/en/huong-dan/chuan-bi-app/#health-check)
- [Rollback and restoring backups](/en/huong-dan/rollback-va-khoi-phuc/)
- [Error codes and fixes](/en/loi/)
