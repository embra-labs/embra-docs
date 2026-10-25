---
title: Quick start
description: From sign-in to an app running on Embra, with Postgres, secrets and your own domain.
sidebar:
  order: 2
---

Eight steps to take an app from GitHub to Embra. Each step has its own guide.

You need:

- a GitHub account created at least 30 days ago;
- a web app repo, with a Dockerfile or as a Node, Python, Go… project Embra can detect.

## Checklist

1. **Sign in and get the trial.** Open the console and click "Đăng nhập bằng GitHub" (sign in with GitHub). A 7-day trial workspace is created right away. → [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/)
2. **Prepare the repo.** The app listens on `0.0.0.0` on the port set in `embra.toml` (3000 by default), has a health-check path that returns 2xx, and writes nothing to disk outside `/tmp`. If you need Postgres, add `database = true` **before the first deploy**. → [Prepare your app](/en/huong-dan/chuan-bi-app/)
3. **Deploy from GitHub.** "＋ Tạo mới" (create) → "Deploy từ GitHub" → "Kết nối GitHub ↗" (connect GitHub) → pick the repo → "Tạo và triển khai" (create and deploy). → [Deploy from GitHub](/en/huong-dan/deploy-tu-github/)
4. **Database and migrations.** Write schema changes as files like `migrations/0001_name.sql`. Embra rehearses them on a copy of your data before running them for real. → [Database and migrations](/en/huong-dan/database-va-migration/)
5. **Set secrets.** Cài đặt (Settings) → Secrets. The app reads each secret from an env var of the same name, from the next build on. → [Secrets](/en/huong-dan/secret/)
6. **Approve production and open the app.** Production always needs an Owner or Admin to approve. Click "Duyệt" (approve) and type the environment name to confirm. The app gets an address like `https://<app>-production-<code>.onembra.com`.
7. **Add your own domain.** Cài đặt → Domain riêng (custom domain). Add the TXT and CNAME records. On Cloudflare, keep the cloud **grey** (DNS only). → [Custom domains](/en/huong-dan/domain-rieng/)
8. **Invite your team and pay.** Cài đặt → Thành viên (members). The invitee must not already have their own Embra workspace. Choose a plan before the 7-day trial ends, or the app and data are deleted. → [Members and permissions](/en/workspace/phan-quyen/), [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/)

The console is in Vietnamese; button names are quoted as they appear, with a translation in brackets.

## Using the CLI?

The `embra` CLI has the full command set ([command list](/en/cli/lenh/)), but **CLI sign-in for customers is coming soon**: the browser page that approves a CLI login is not switched on yet. Meanwhile, every step above works entirely on the web.

## If something goes wrong

- **Build failed:** click "Xem log build" (view build log) on the overview page.
- **App does not come up (`HEALTHCHECK_FAILED`):** check the port and the health-check path. See [Prepare your app](/en/huong-dan/chuan-bi-app/#health-check).
- **The environment shows "Cần Embra kiểm tra database" or "Cần Embra hỗ trợ"** (needs the Embra team): an action ended with an unknown outcome. Embra stops instead of retrying on its own. Email hello@embra.cloud.
