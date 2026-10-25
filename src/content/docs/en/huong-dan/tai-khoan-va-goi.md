---
title: Account, trial and payment
description: Signing in, the 7-day trial, choosing a paid plan and paying by VietQR.
sidebar:
  order: 1
---

## Signing in

Open the console and click **"Đăng nhập bằng GitHub"** (sign in with GitHub).

- On your first sign-in, Embra creates a **trial workspace** named after your GitHub account, with you as Owner.
- The GitHub account must have been created **at least 30 days** ago.
- The number of new trials per day is limited. If you see "Đợt dùng thử hôm nay đã đầy" (today's trials are full), try again tomorrow or email hello@embra.cloud.
- **"Đăng nhập bằng Google" (sign in with Google) is only for people invited** to an existing workspace. Google sign-in never creates a workspace.
- If your GitHub email has a pending invite to someone else's workspace, you go straight into that workspace and do **not** get a trial.

## The trial

| | Trial |
|---|---|
| Length | 7 days |
| App | 1 project, 1 environment (production) |
| Postgres | 1 |
| Custom domains, PR previews, cron | Not included |

The "Dùng thử · còn N ngày" banner (trial, N days left) shows the time remaining.

:::caution[After 7 days everything is deleted]
When the trial expires, every action is refused, including viewing. Then **the whole workspace is deleted**: app, database and backups. There is no grace period, and an expired workspace can no longer be paid for.

To keep your app, **choose a plan and pay before the trial ends**. Embra warns you 24 hours before. If you only want your data, use **Cài đặt → Export và xoá → Export** (settings, export and delete) before the deadline.
:::

## Choosing a plan and paying

Only the **Owner** can choose a plan, and only in the browser.

1. Click **"Chọn gói trả phí để giữ app"** (choose a paid plan to keep the app) on the trial banner, or open the account menu → **"Thanh toán"** (billing).
2. Click **"Chọn Start"**, **"Chọn Build"** or **"Chọn Grow"**. Prices and limits for each plan are at [embra.cloud/bang-gia](https://embra.cloud/bang-gia/).
3. Optionally enter the person or company name for the invoice. Embra is not yet a registered company, so it cannot issue VAT invoices.
4. Click **"Xác nhận và lấy mã VietQR"** (confirm and get the VietQR code).
5. Scan the code with your banking app, or transfer by hand with exactly the **amount** and **transfer note** shown (each has a "Chép" copy button).

The plan takes effect as soon as Embra receives the money, and the workspace no longer has a trial deadline. If the payment is not confirmed automatically, the Embra team confirms it by hand during working hours. Invoice status appears under "Hoá đơn" (invoices): unpaid, reconciling, paid or overdue.

Admins can see billing but cannot choose a plan or pay. See [Members and permissions](/en/workspace/phan-quyen/).
