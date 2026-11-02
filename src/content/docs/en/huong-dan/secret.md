---
title: Secrets
description: Set API keys, passwords and config for your app; when the app picks up new values.
sidebar:
  order: 5
---

A secret is a value the app needs at runtime that must not live in code: API keys, JWT keys, S3 credentials, SMTP passwords…

## Setting a secret

1. Open the environment's **Cài đặt → Secrets** (settings, secrets).
2. Enter **Tên secret** (name) and **Giá trị secret** (value) → **"Lưu secret"** (save).
3. Click **"Deploy"** on the overview page, or push code. Production waits for an Owner or Admin to approve, as with every deploy.

The app reads each secret from an **env var of the same name**: secret `JWT_SECRET` is `process.env.JWT_SECRET`, `os.environ["JWT_SECRET"]`…

:::note[Secrets reach the app on the next build]
Saving a secret does not restart the app. A new secret or value only reaches the app on the next build + deploy. The plan shows the approver which secrets were added, removed or re-versioned (never the values).
:::

## Rules

| Rule | Detail |
|---|---|
| Name | Uppercase letters, digits, `_`, starts with an uppercase letter, at most 64 characters. For example `S3_BUCKET`, `SMTP_PASSWORD` |
| Reserved for Embra | `DATABASE_URL` and names starting with `EMBRA_` |
| Value | At most 64 KiB |
| Reading a value back | **Not possible**, not even for the Owner. Only the name and version are shown |
| Embra bucket | The `S3_*` variables Embra sets override secrets with the same names |

Put non-secret config (shop name, public URL, `TZ=Asia/Ho_Chi_Minh` so the app prints Vietnam time…) here too. `[build] env` in `embra.toml` is only used during the build and never reaches the app. See [Environment variables](/en/huong-dan/bien-moi-truong/).

## Changing or removing a secret

- **Change the value:** save again under the same name. Embra creates a new version; from the next build the app uses the newest one.
- **Remove:** click **"Thu hồi"** (revoke) on the newest version. From the next build, that secret is gone from the app. Embra does **not** fall back to an older version.
- Versions deployed earlier keep exactly the secret version they used. Revoking a version means releases that use it can no longer be redeployed.

Who can set secrets and see their names: see [Members and permissions](/en/workspace/phan-quyen/). AI agents cannot set secrets.
