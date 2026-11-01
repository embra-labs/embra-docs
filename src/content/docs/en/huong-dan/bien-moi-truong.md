---
title: Environment variables
description: Setting env vars for your app, pasting a .env file, variables Embra sets, build-time variables, and when the app picks up new values.
sidebar:
  order: 10
---

This page is for whoever configures the app (Owner, Admin, Developer). It covers where to set environment variables (env vars), which ones Embra sets for you, and when the app picks up new values.

## Where to set app variables

Every variable your app reads at runtime is set under the environment's **Cài đặt → Secrets** (settings, secrets), including non-secret values such as `TZ` or a public URL. Each secret reaches the app as a variable of the same name.

| You want to set | Where | Does the app see it at runtime? |
|---|---|---|
| Variables the app reads at runtime (API keys, `TZ`, URLs…) | **Cài đặt → Secrets** | Yes |
| Variables needed during the build (for example `VITE_*`, `NEXT_PUBLIC_*`) | `[build] env` in `embra.toml` | No |
| `DATABASE_URL`, `PORT`, `S3_*` | Set by Embra | Yes |

`embra.toml` has **no** `[deploy] env`. Unknown fields in `embra.toml` fail the build ([`REPO_CONFIG_INVALID`](/en/loi/#repo_config_invalid)).

How to set, change and revoke a single secret: see [Secrets](/en/huong-dan/secret/).

## Pasting a whole .env file

1. Open the environment's **Cài đặt → Secrets**.
2. Click **"Dán .env"** (paste .env).
3. Paste the contents into **Nội dung .env** (.env contents), or pick a file under **"Hoặc chọn file .env"** (or choose a .env file).
4. Check the table: each line is marked **Mới** (new), **Đổi giá trị** (replace value), **Giữ nguyên** (keep current) or **Bỏ qua** (skipped). Untick lines you don't want to save.
5. Click **"Lưu … secret"** (save … secrets).
6. Click **"Build lại"** (rebuild), if shown, so the app picks up the new values.

The file is read in your browser. Only the lines you keep are sent.

How the console reads the file:

- It understands `#` comments, an `export ` prefix, single- or double-quoted values, and multi-line values inside quotes.
- It does not expand `${OTHER_VAR}`: the text is stored as written.
- If a name appears twice, the later line is used.
- Skipped lines: empty values, invalid names, `DATABASE_URL`, names starting with `EMBRA_`, and `S3_*` when the environment has an Embra bucket.
- A `PORT` line starts unticked, because Embra already sets `PORT` from `embra.toml`.

## "Còn thiếu … biến" (… variables missing)

If your repo has a `.env.example` (or `.env.sample`), Embra reads the variable **names** in it on every build. The Secrets page shows **"Còn thiếu … biến"** for names that have no secret yet. Click **"Thêm"** (add) next to a name to set it.

- Embra looks for the file in the app's root folder. If it isn't there, it looks in first-level subfolders (for example `backend/.env.example`).
- Only names are read, never values. A real `.env` file is never read.
- The list comes from the most recent successful build. Variables Embra sets itself are left out.
- A file over 64 KiB is ignored. At most 200 names.

## Variables Embra sets

| Variable | When | Value |
|---|---|---|
| `PORT` | Always, unless you set a `PORT` secret yourself | `[deploy] port` in `embra.toml`, default `3000` |
| `DATABASE_URL` | With `database = true` | The environment's Postgres connection string. See [Database and migrations](/en/huong-dan/database-va-migration/) |
| `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | The environment has an Embra bucket | See [File storage](/en/huong-dan/luu-file/) |
| `EMBRA_GIT_SHA` | Releases built from a GitHub commit | The full 40-character commit SHA. Not set for builds from an uploaded folder (`embra up`) |

Embra does **not** set `TZ`: containers run on UTC. For Vietnam time, set a secret `TZ` = `Asia/Ho_Chi_Minh`.

Order when names clash: a secret overrides an older plain variable; Embra's `DATABASE_URL` and `S3_*` override secrets. `PORT` is the exception: your secret wins.

:::caution[A `PORT` secret that differs from `[deploy] port` breaks the deploy]
Embra checks the app on the port in `[deploy] port`. If a `PORT` secret makes the app listen elsewhere, the health check fails and the deploy stops with [`HEALTHCHECK_FAILED`](/en/loi/#healthcheck_failed). To change the port, edit `[deploy] port`.
:::

## Names reserved for Embra

- `DATABASE_URL` and any name starting with `EMBRA_` can't be used for a secret. The console says `… dành cho Embra. Chọn tên khác.` (reserved for Embra, choose another name).
- `[build] env` does not accept names starting with `EMBRA_`.
- Names use uppercase letters, digits and underscores, start with an uppercase letter, at most 64 characters (`^[A-Z][A-Z0-9_]{0,63}$`).

## Build-time variables

```toml
[build]
env = { VITE_API_URL = "https://api.cuahang.vn", NEXT_PUBLIC_SHOP = "Cửa hàng" }
```

- They exist only during the build and never reach the running app. **Don't put secret values here**: the file lives in your repo.
- With a `Dockerfile`, each variable is passed as a build arg. Declare it with `ARG` before using it:

  ```dockerfile
  ARG VITE_API_URL
  RUN npm run build
  ```

- Without a `Dockerfile` (Railpack), the variables are available during the build with no declaration.
- Builds receive **no** secrets.

## One set of variables per environment

Secrets set on production are **not** available on staging or previews, and the other way round. Set them separately for each environment. Pull request previews don't carry production secrets. `[build] env` is the same everywhere because it lives in the repo.

See [Staging, production and approval](/en/huong-dan/staging-production-va-duyet/).

## When the app picks up new values

- Saving a secret does **not** restart the app. New values reach the app on the **next build and deploy**: push code, or click **"Deploy"** / **"Build lại"** (rebuild) on the overview page.
- The plan shows the approver **Thêm secret**, **Bỏ secret**, **Đổi secret** (added, removed, changed secrets), never the values.
- Production still waits for an Owner or Admin to approve, as with every deploy.

## Limits

| Limit | Value | What happens when exceeded |
|---|---|---|
| Each secret value | 64 KiB | Not saved: `Giá trị secret tối đa 64 KiB.` |
| Each "Dán .env" save | 100 secrets, 1 MiB total | The save button is disabled. Untick some and save the rest later |
| File picked in "Dán .env" | 2 MiB | The console doesn't read it |
| Each `[build] env` value | 4 KiB | The build fails and the message names the variable. See [`REPO_CONFIG_INVALID`](/en/loi/#repo_config_invalid) |
| Total `[build] env` (names + values) | 16 KiB | The build fails |

Saving several secrets at once is all or nothing: if one line is rejected, none are saved.

## From the CLI

The CLI has `embra secret set <TEN>` (reads the value from stdin) and `embra secret list` (names only). `embra deploy`, for prebuilt images, reads the `env` field of `embra.json` (at most 4 KiB per value, 64 KiB total); these variables are kept on later builds from GitHub, and a secret with the same name wins.

CLI sign-in for customers is **not switched on yet**, so use the console for now. See [CLI commands](/en/cli/lenh/).

## See also

- [Secrets](/en/huong-dan/secret/)
- [Preparing your app](/en/huong-dan/chuan-bi-app/)
- [File storage (S3 bucket)](/en/huong-dan/luu-file/)
- [Staging, production and approval](/en/huong-dan/staging-production-va-duyet/)
