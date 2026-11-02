---
title: Lưu file (bucket S3)
description: Mỗi environment có một bucket S3. Cách tạo, env var app nhận được, code mẫu cho backend.
sidebar:
  order: 6
---

App trên Embra không ghi được ra disk (chỉ `/tmp`, mất khi restart). File user upload như ảnh, video, tài liệu thì lưu vào **bucket S3 của Embra**: nằm cùng server tại Việt Nam, dùng giao thức S3 nên thư viện S3 nào cũng dùng được.

## Gói nào có bucket

Mọi gói đều có **1 bucket cho mỗi environment**:

| Gói | Dung lượng bucket |
|---|---|
| Dùng thử, Start | 1 GiB |
| Build | 2 GiB |
| Grow | 5 GiB |

Ghi vượt dung lượng thì bị từ chối. Bucket được backup mỗi đêm, nhưng không restore về thời điểm tuỳ ý như Postgres.

## Tạo bucket

1. Mở environment cần bucket → **"＋ Tạo mới"** → **"Bucket"** → **"Xác nhận tạo bucket"**.
2. Bấm **"Deploy"** ở trang Tổng quan hoặc push code. App nhận các biến `S3_*` **từ lần deploy tiếp theo**. Production chờ approve như mọi lần deploy.

- Mỗi bucket có key riêng, chỉ có quyền trên đúng bucket đó.
- Xoá environment thì bucket và mọi file trong đó bị xoá theo.

## Env var app nhận được

| Biến | Giá trị | Dùng để |
|---|---|---|
| `S3_ENDPOINT` | địa chỉ nội bộ, ví dụ `http://10.200.x.1:3900` | **app đọc/ghi file** (nhanh, không ra internet) |
| `S3_PUBLIC_ENDPOINT` | `https://s3.embra.cloud` | **tạo link cho browser** (presigned URL) |
| `S3_BUCKET` | tên bucket | |
| `S3_REGION` | `garage` | |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | key riêng của bucket | |
| `S3_FORCE_PATH_STYLE` | `true` | bắt buộc dùng path-style |

Embra đặt các biến này: secret trùng tên bị ghi đè, dashboard không hiện giá trị key.

:::caution[Hai endpoint, hai việc]
Browser **không** truy cập được `S3_ENDPOINT`. Link nào gửi cho browser (ảnh, file download) phải được ký bằng client dùng `S3_PUBLIC_ENDPOINT`.
:::

## Code mẫu: Node.js (AWS SDK v3)

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
// App đọc/ghi qua mạng nội bộ.
const s3 = new S3Client({ ...base, endpoint: process.env.S3_ENDPOINT });
// Chỉ dùng để ký link cho trình duyệt.
const s3Public = new S3Client({ ...base, endpoint: process.env.S3_PUBLIC_ENDPOINT });
const Bucket = process.env.S3_BUCKET;

// Lưu file người dùng gửi lên server (ví dụ từ multer/busboy).
export async function saveUpload(key, body, contentType) {
  await s3.send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }));
}

// Link xem/tải file, hết hạn sau 1 giờ. Dùng được trong <img src>, <video src>.
export function fileUrl(key) {
  return getSignedUrl(s3Public, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 3600 });
}
```

## Code mẫu: Python (boto3)

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

## Giới hạn hiện tại

| Chưa hỗ trợ | Làm thay |
|---|---|
| **Upload thẳng từ browser.** Bucket chưa có CORS, browser không PUT trực tiếp lên `s3.embra.cloud` được | Upload qua backend: browser gửi file cho app, app ghi vào bucket như `saveUpload` ở trên |
| **File public không cần ký.** Mọi link là presigned URL có hạn | Backend tạo link khi render trang, như `fileUrl` ở trên |
| **CDN riêng trước bucket** | — |

Đang dùng S3 bên ngoài (Cloudflare R2, AWS S3…) và cần các tính năng trên thì cứ giữ:

- Đặt `S3_*` của provider đó làm [secret](/huong-dan/secret/).
- **Không** tạo bucket Embra cho environment đó, vì bucket Embra ghi đè các biến này.
- Cho phép origin của app (`*.onembra.com`, domain riêng) trong CORS của bucket bên ngoài.
