---
title: Plans, limits and invoices
description: Limits of the Start, Build and Grow plans and what happens when you exceed them, how VND invoices are computed with examples, plan changes, late payment.
sidebar:
  order: 13
---

A reference for **Owners and Admins** who want to know what their plan includes, what happens over a limit, and how invoices are computed. The steps for choosing a plan and transferring money are in [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/).

Prices are **per workspace (one project) per month**, in VND. The price is the amount you transfer: Embra has no legal entity yet, so no VAT is added and no VAT invoice is issued.

## What each plan includes

| | Start | Build | Grow | Over the limit |
|---|---|---|---|---|
| **Monthly price** | 249.000đ | 399.000đ | 749.000đ | |
| **App** (shared resource pool) | 512 MiB RAM, 0.5 vCPU | 1 GiB RAM, 1 vCPU | 2 GiB RAM, 2 vCPU | A deploy that makes an app take more of the pool is refused |
| **Postgres** | 256 MiB RAM, 2 GiB | 512 MiB RAM, 5 GiB | 1 GiB RAM, 10 GiB | Data import: a dump file larger than the disk is refused. Build: an app image larger than the plan's disk fails the build |
| **Workers, cron** | 1 worker, 2 cron | 2 workers, 5 cron | 4 workers, 10 cron | No deploy plan can be created |
| **Pull request previews** | None | 1 | 3 | New pull requests get no preview |
| **File bucket** | 1 GiB | 2 GiB | 5 GiB | The app gets an S3 error when writing over the quota |
| **Log and metrics history** | 7 days | 14 days | 30 days | Older ranges cannot be viewed |
| **Staging** | None | +149.000đ/month | +299.000đ/month | Start: staging cannot be created |

Actions in the console, CLI or API that go over a limit are refused with [`QUOTA_EXCEEDED`](/en/loi/#quota_exceeded), and the message names the limit. Embra refuses before doing anything, so running apps and data are not affected. The bucket is the exception: an app writing over its quota gets an S3 error inside the app, see [File storage](/en/huong-dan/luu-file/).

Plans also limit the **number of custom domains** and the **number of databases for production apps**. Adding more is refused with `QUOTA_EXCEEDED`, and the message gives your plan's number. For the trial plan, see [The trial](/en/huong-dan/tai-khoan-va-goi/#the-trial).

## How the app resource pool works

A plan's RAM and CPU are **one shared pool** for every production app in the workspace. Each app gets a size from the pool, and each worker of an app takes another share of that size. Cron does not count against the pool.

- Staging and previews are outside the pool.
- A deploy that does not make an app take more of the pool is always accepted, including a hotfix or a rollback while the pool is over.
- If the pool is too small: lower another app's size in **Cài đặt** (Settings) → **"Tài nguyên"** (Resources), add RAM, or upgrade.

## Buying extra

| Extra | Monthly price | Where to buy |
|---|---|---|
| App RAM | 99.000đ per 512 MiB | Console, when choosing a plan (**"RAM thêm cho app"**, extra app RAM) |
| Postgres storage | 9.800đ per GB | Email hello@embra.cloud |
| Bucket storage | 4.900đ per GB | Email hello@embra.cloud |

Prices are from the [pricing page](https://embra.cloud/bang-gia/) (Vietnamese). During a 3, 6 or 12-month prepaid term, email hello@embra.cloud to add staging or extras; the console cannot do this yet.

## How invoices are computed

- **One line per item:** plan, staging, each extra. The total is the sum of the lines.
- **The billing period** starts on the day the paid plan takes effect (the day the money arrives) and repeats on that day every month.
- **Monthly payment:** the invoice is created on the first day of the period and is due in 7 days.
- **Prepaying 3, 6 or 12 months:** 5%, 10% or 20% off. The discounted monthly price is rounded down to 1.000đ, then multiplied by the number of months. There are no monthly invoices until the term ends.
- **When a prepaid term ends:** invoices go back to monthly, at the list price at that time. The console warns you before the term ends.

Invoices are in the account menu → **"Thanh toán"** (Billing), under **"Hoá đơn"** (Invoices). Open **"Chi tiết"** (Details) on an invoice to see each line.

## Example: Build with 512 MiB extra RAM, prepaid 12 months

You choose Build from the trial, add 512 MiB RAM and prepay 12 months.

| Line | Calculation | Amount |
|---|---|---|
| Build plan | | 399.000đ |
| Extra RAM +512 MiB | 1 × 99.000đ | 99.000đ |
| **"Gói Build mỗi tháng"** (Build plan per month, extra RAM included) | 399.000 + 99.000 | 498.000đ |
| **"Giảm 20% khi trả trước"** (20% off for prepaying) | 498.000 × 80% = 398.400, rounded down to 1.000đ = 398.000 | −100.000đ |
| **"Mỗi tháng × 12 tháng"** (Per month × 12 months) | | 398.000đ × 12 |
| **"Chuyển một lần"** (Transfer once) | 398.000 × 12 | **4.776.000đ** |

The rows in bold are the ones the console shows when you confirm.

No VAT is added. The plan takes effect as soon as the money arrives.

## Example: upgrading mid-period

A workspace pays monthly on Start, period 25/10–24/11/2026 (31 days). On 10/11, the Owner upgrades to Build.

| Step | Calculation | Result |
|---|---|---|
| Monthly price difference | 399.000 − 249.000 | 150.000đ |
| Days left, counting today | 10/11 through 24/11 | 15 days |
| Prorated difference | 150.000 × 15 / 31 | 72.580đ |
| **Pay now** | rounded down to 1.000đ | **72.000đ** |

The plan becomes Build when the 72.000đ reaches Embra's account. From the 25/11 period, invoices are 399.000đ per month.

## Plan changes and limits

The full plan-change rules are in [Changing plans after paying](/en/huong-dan/tai-khoan-va-goi/#changing-plans-after-paying). Regarding limits:

- **Upgrade:** app sizes grow at the next deploy.
- **Downgrade** is refused while the workspace is over the lower plan in things you can remove yourself: custom domains, staging, previews, Postgres storage, number of databases. The console says what to remove.
- Postgres storage cannot shrink. If a database is already larger than the lower plan's storage, email hello@embra.cloud.
- App sizes are lowered automatically to fit the new plan's pool, at the next deploy.
- If the workspace is still over the limits on the change date, the current plan stays and is still billed. Embra retries every day.

## How to pay

The only method is **bank transfer via VietQR**; no credit card needed. Each invoice has a QR code, the amount and the transfer note. Steps in [Choosing a plan and paying](/en/huong-dan/tai-khoan-va-goi/#choosing-a-plan-and-paying).

Overpayments, and staging or extras removed mid-period, become **credit** that is taken off the next invoice automatically. To get credit back by bank transfer, email hello@embra.cloud.

## If you pay late

While an invoice is overdue, you cannot upgrade or downgrade, add staging, buy extras or prepay until it is paid. A banner in the console shows the amount owed.

:::caution[Suspension after 14 days overdue]
From 14/11/2026, if an invoice is 14 days overdue, Embra may suspend the workspace after at least 3 working days' notice by email. While suspended, apps stop, the workspace is read-only and cannot be exported; data and backups are kept. The workspace reopens once Embra receives the full amount. Details in the [Terms, sections 4 and 7](https://embra.cloud/terms/#goi) (Vietnamese).
:::

## See also

- [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/)
- [Inviting members and working with an agency](/en/workspace/thanh-vien-va-agency/)
- [`QUOTA_EXCEEDED`](/en/loi/#quota_exceeded)
- [Pricing](https://embra.cloud/bang-gia/) and [Terms](https://embra.cloud/terms/) (Vietnamese)
