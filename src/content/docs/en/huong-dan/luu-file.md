---
title: File storage (S3 bucket)
description: Every plan includes one S3 bucket per environment. How to create it, the variables your app receives, and backend code samples.
sidebar:
  order: 6
---

Apps on Embra cannot write to disk (only `/tmp`, which is lost on restart). Files your users upload, such as images, videos and documents, belong in an **Embra S3 bucket**. It lives on the same servers in Vietnam and speaks the S3 protocol, so any S3 library works.

## Which plans include a bucket

Every plan includes **1 bucket per environment**:

| Plan | Bucket size |
|---|---|
| Trial, Start | 1 GiB |
| Build | 2 GiB |
| Grow | 5 GiB |

Writes beyond the size are refused. Buckets are backed up nightly, but cannot be restored to an arbitrary point in time the way Postgres can.

## Create a bucket

1. Open the environment, click **"＋ Tạo mới"** (create) → **"Lưu file"** (file storage) → **"Xác nhận tạo bucket"** (confirm).
2. Click **"Triển khai"** (deploy) or push code. The app receives the `S3_*` variables **from the next deploy**. Production waits for approval as usual.

Each bucket has its own key, which can only access that bucket. Deleting the environment deletes the bucket and every file in it.

## Variables your app receives

| Variable | Value | Use it to |
|---|---|---|
| `S3_ENDPOINT` | internal address, e.g. `http://10.200.x.1:3900` | **read and write files from the app** (fast, never leaves the host) |
| `S3_PUBLIC_ENDPOINT` | `https://s3.embra.cloud` | **sign links for browsers** (presigned URLs) |
| `S3_BUCKET` | bucket name | |
| `S3_REGION` | `garage` | |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | the bucket's own key | |
| `S3_FORCE_PATH_STYLE` | `true` | path-style addressing is required |

Embra sets these variables. A secret with the same name is overridden, and the dashboard never shows the key values.

:::caution[Two endpoints, two jobs]
Browsers **cannot** reach `S3_ENDPOINT`. Any link you hand to a browser (images, downloads) must be signed by a client that uses `S3_PUBLIC_ENDPOINT`.
:::

## Node.js (AWS SDK v3)

```js
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const base = {
  region: process.env.S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
};
// The app reads and writes over the internal network.
const s3 = new S3Client({ ...base, endpoint: process.env.S3_ENDPOINT });
// Only used to sign links for browsers.
const s3Public = new S3Client({ ...base, endpoint: process.env.S3_PUBLIC_ENDPOINT });
const Bucket = process.env.S3_BUCKET;

// Store a file the user sent to your server (e.g. from multer/busboy).
export async function saveUpload(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }));
}

// A link to view/download the file, valid for 1 hour. Works in <img src>, <video src>.
export function fileUrl(key) {
  return getSignedUrl(s3Public, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 3600 });
}
```

## Python (boto3)

```python
import os, boto3
from botocore.config import Config

cfg = Config(s3={"addressing_style": "path"}, signature_version="s3v4")
common = dict(
    region_name=os.environ["S3_REGION"],
    aws_access_key_id=os.environ["S3_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["S3_SECRET_ACCESS_KEY"],
    config=cfg,
)
s3 = boto3.client("s3", endpoint_url=os.environ["S3_ENDPOINT"], **common)
s3_public = boto3.client("s3", endpoint_url=os.environ["S3_PUBLIC_ENDPOINT"], **common)
bucket = os.environ["S3_BUCKET"]

s3.upload_fileobj(file_obj, bucket, "avatars/u123.webp", ExtraArgs={"ContentType": "image/webp"})
url = s3_public.generate_presigned_url("get_object", Params={"Bucket": bucket, "Key": "avatars/u123.webp"}, ExpiresIn=3600)
```

## Current limits

- **No direct uploads from the browser yet.** Buckets have no CORS, so a browser cannot PUT straight to `s3.embra.cloud`. Upload through your backend instead: the browser sends the file to your app, and the app writes it to the bucket as `saveUpload` does above.
- **No unsigned public files.** Every link to a file is a time-limited presigned URL. If a page shows images, your backend creates the links while rendering, as `fileUrl` does above.
- **No custom CDN in front of the bucket.**
- If you already use external S3 (Cloudflare R2, AWS S3…) and need those features, keep it. Set that provider's `S3_*` values as [secrets](/en/huong-dan/secret/) and do **not** create an Embra bucket for that environment, because an Embra bucket overrides those variables. Remember to allow your app's origins (`*.onembra.com`, your custom domain) in that bucket's CORS.
