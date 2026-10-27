---
title: Deploy from GitHub
description: Connecting GitHub, creating the app, building on push, approving production and reading logs.
sidebar:
  order: 3
---

## Creating the app

1. Click **"＋ Tạo mới"** (create) → **"Deploy từ GitHub"**.
2. Click **"Kết nối GitHub ↗"** (connect GitHub) and install the Embra GitHub App on the account or organization that owns the repo. You choose which repos Embra can see. If a repo is missing, click **"Không thấy repo? Cập nhật quyền GitHub ↗"** (update GitHub permissions), then **"Tải lại"** (reload).
3. Pick the repo and click **"Tiếp tục"** (continue).
4. Set the **app name** ("Tên ứng dụng"): lowercase letters, digits and hyphens, starting with a letter. Under **"Cấu hình nâng cao"** (advanced), choose the **Git branch** (the default branch otherwise) and the **root folder** for a monorepo.
5. Click **"Tạo và triển khai"** (create and deploy). Embra creates the `production` environment, links the repo and branch, and starts the build.

Only people signed in with GitHub can link a repo, and only repos that their GitHub account can read.

## Approving production

After the build, Embra makes a **plan**: a summary of the change (new image, secrets added, removed or re-versioned, pending migrations).

- **Production always waits for an Owner or Admin to approve**, even with no migration. Developers and AI agents cannot approve.
- The plan bar shows "… thay đổi chờ áp dụng" (changes waiting). Click **"Chi tiết"** (details) to review, or **"Duyệt"** (approve). In the **"Quyết định"** (decision) panel, type the environment name to confirm and click **"Duyệt"** again. If a migration may lose data, you must also type `CONFIRM_MIGRATION`.
- A pending plan expires after 24 hours. A new build cancels the older plan, so you can never approve a stale version by mistake.
- Approving needs a real person: a web session signed in within the last 12 hours. See [Members and permissions](/en/workspace/phan-quyen/#actions-that-need-a-real-person).

Once approved, the app is at:

```
https://<app-name>-production-<workspace code>.onembra.com
```

## Building on push

- Every **push to the linked branch** builds that commit. Pushes to other branches and new tags do not.
- A new build cancels a running build of the same environment.
- To rebuild the latest commit of the branch without pushing, click **"Triển khai"** (deploy) on the overview page.
- Production still waits for approval after each build. Staging and previews deploy on their own, unless a migration changes data.

## Pull request previews

On plans with previews (see [pricing](https://embra.cloud/bang-gia/)), each pull request into the production branch gets its own `pr<number>` environment:

- Address: `pr<number>-<production address>`.
- **A new, empty database**: production data is not copied. You can load sample data with `[preview] seed`.
- Production's secrets, bucket and domains are not carried over.
- Deleted when the PR closes, or after 72 hours without a new push.
- PRs from forks are ignored.

## Logs

- **Build log:** "Xem log build" (view build log) on the overview page.
- **App log:** the **"Logs"** section. Containers run on UTC, so times your app prints in its own log lines are UTC. To print Vietnam time, set the secret `TZ` = `Asia/Ho_Chi_Minh`.
- Log and metrics retention depends on the plan (1 day on the trial).

## Rollback

Embra keeps the versions that ran so code can go back to an earlier one. A code rollback needs no approval, because it only reruns code that was already approved; Embra refuses it if a migration has moved on since that version. On the web, open **"Lần deploy"** (deploys) and click **"Quay về bản trước"** (roll back) on the version to return to. For urgent help, email hello@embra.cloud.
