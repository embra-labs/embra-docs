---
title: Custom domains
description: Pointing your domain at your app, the DNS records to add, HTTPS, and what to watch for on Cloudflare.
sidebar:
  order: 7
---

The trial has no custom domains. The number of domains per plan is on the [pricing page](https://embra.cloud/bang-gia/). **Each name counts as one domain**: `shop.vn` and `www.shop.vn` are two domains.

## Steps

1. Open **Cài đặt → Domain riêng** (settings, custom domain), enter the domain (for example `www.shop.vn` or `shop.vn`) and click **"Thêm domain"** (add domain).
2. Embra shows the records to add at your DNS provider:

   | Type | Name | Value |
   |---|---|---|
   | TXT | `_embra-challenge.www.shop.vn` | `embra-verify=…` (Embra shows the value) |
   | CNAME | `www` | the app address, like `<app>-production-<code>.onembra.com` |

   For the **root name** (`shop.vn`, no `www`), use an **A** record to the IP address Embra shows instead of the CNAME.
3. Wait for DNS to update (usually 5–30 minutes), then click **"Kiểm tra"** (check). If it doesn't pass yet, wait a little and check again.
4. Once verified, HTTPS is issued automatically on the first visit, usually within a minute.

:::caution[Using Cloudflare?]
Keep the cloud icon **grey (DNS only)** for these records. With the proxy on (orange cloud), Embra can neither verify the domain nor issue HTTPS.
:::

## Keep the TXT record

**Do not delete the TXT record after verification.** Embra re-checks it every 24 hours. If it is missing 3 times in a row, Embra stops serving that domain. Temporary network errors do not count.

## Notes

- For both `shop.vn` and `www.shop.vn`, add both. Embra does not redirect between the two names yet; you can set a redirect at your domain provider.
- Wildcard domains (`*.shop.vn`) and uploading your own certificate are not supported yet.
- A domain name can only be attached to one app on Embra.
- A domain that is never verified is dropped after 7 days.
- Each domain can be checked at most once every 30 seconds.
