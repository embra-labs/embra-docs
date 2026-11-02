---
title: Quick start
description: From sign-in to an app running on Embra, with Postgres, secrets and your own domain.
sidebar:
  order: 2
---

You need:

- A GitHub account created at least 30 days ago.
- A web app repo with a Dockerfile, or a Node, Python, Go… project Embra can detect.

The console is in Vietnamese; button names are quoted as they appear, with a translation in brackets.

## Checklist

Each step has its own guide (linked at the end of the step).

1. **Sign in, get the trial.** Open the console → **"Đăng nhập bằng GitHub"** (sign in with GitHub). A 7-day trial workspace is created right away. → [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/)
2. **Prepare the repo.** The app listens on `0.0.0.0` on the port set in `embra.toml` (3000 by default), has a health check path that returns 2xx, and writes nothing to disk outside `/tmp`. Need Postgres? Add `database = true` (adding it after the first deploy works too). → [Prepare your app](/en/huong-dan/chuan-bi-app/)
3. **Deploy from GitHub.** **"＋ Tạo mới"** (create) → **"Deploy từ GitHub"** → **"Kết nối GitHub ↗"** (connect GitHub) → pick the repo → **"Tạo và deploy"** (create and deploy). → [Deploy from GitHub](/en/huong-dan/deploy-tu-github/)
4. **Database and migrations.** Write schema changes as files like `migrations/0001_name.sql`. Embra rehearses them on a copy of your data before running them for real. → [Database and migrations](/en/huong-dan/database-va-migration/)
5. **Store files (optional).** Each plan has one S3 bucket per environment: **"＋ Tạo mới"** → **"Bucket"**. The app gets the `S3_*` env vars from the next deploy on. → [Store files (S3 bucket)](/en/huong-dan/luu-file/)
6. **Set secrets.** **Cài đặt → Secrets** (settings, secrets). The app reads each secret from an env var of the same name, from the next build on. → [Secrets](/en/huong-dan/secret/)
7. **Approve production, open the app.** Production always needs an Owner or Admin to approve: **"Xem và duyệt"** (review and approve) → type the environment name → **"Duyệt và deploy"** (approve and deploy). The app runs at `https://<app>-production-<code>.onembra.com`.
8. **Add your own domain.** **Cài đặt → Domain**, add the TXT and CNAME records. On Cloudflare, keep the cloud **grey** (DNS only). → [Custom domains](/en/huong-dan/domain-rieng/)
9. **Invite your team, pay.** **Cài đặt → Thành viên** (members). Invitees accept on their next sign-in with the invited email, even if they already have a workspace. Choose a plan before the 7-day trial ends, or the app and data are deleted. → [Members and permissions](/en/workspace/phan-quyen/), [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/)

## Using the CLI?

The `embra` CLI has the full command set ([command list](/en/cli/lenh/)), but **CLI sign-in for customers is not on yet**: the browser page that approves a CLI login is not switched on. Meanwhile, every step above works on the web.

## If something goes wrong

| You see | Do this |
|---|---|
| Build failed | Click **"Xem build logs"** (view build logs) on the overview page, look up the code in [Error codes and fixes](/en/loi/) |
| App does not come up (`HEALTHCHECK_FAILED`) | Check the port and health check path. See [Health check](/en/huong-dan/chuan-bi-app/#health-check) |
| The environment shows "Cần xác minh dữ liệu" (data needs checking), "Cần đội Embra hỗ trợ" (needs the Embra team) or "Chờ đội Embra kiểm tra" (waiting for the Embra team) | An action ended with an unknown outcome; Embra stops instead of retrying. Email hello@embra.cloud, see [When Embra stops for a check](/en/loi/#recovery_required) |
