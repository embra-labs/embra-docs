---
title: Mã lỗi và cách sửa
description: Tra cứu mã lỗi của Embra (reason_code) theo việc bạn đang làm. Mỗi mã có nghĩa, nguyên nhân hay gặp, cách sửa và khi nào cần liên hệ.
tableOfContents:
  maxHeadingLevel: 2
---

## Cách đọc lỗi

Mỗi lỗi Embra trả về có ba phần:

| Phần | Ví dụ | Bạn thấy ở đâu |
|---|---|---|
| Mã lỗi (`reason_code`) | `HEALTHCHECK_FAILED` | Output `--json` của CLI, và trong nội dung chép bằng **"Sao chép diagnostic ID"** |
| Câu tiếng Việt (`summary_vi`) | "Bản mới không qua readiness trong thời gian khởi động. Bản cũ vẫn phục vụ." | Console và CLI |
| Bước tiếp (`next_action`) | `fix_input` | Dòng dưới câu lỗi trên console, dòng `bước tiếp:` trong CLI |

Bước tiếp cho biết ai cần làm gì:

| `next_action` | Console ghi | CLI ghi | Nghĩa |
|---|---|---|---|
| `fix_input` | "Kiểm tra và sửa thông tin." | `sửa đầu vào rồi chạy lại` | Bạn sửa code, cấu hình hoặc dữ liệu nhập rồi làm lại |
| `rerun_plan` | "Tạo plan mới để kiểm tra lại." | `chạy lại plan` | Plan cũ không còn đúng, cần tạo plan mới |
| `owner_review` | "Cần owner hoặc admin xem và quyết định." | `chủ workspace cần xem và duyệt` | Owner hoặc Admin cần duyệt hoặc nâng gói |
| `wait` | "Đang xử lý, vui lòng chờ." | `chờ rồi kiểm tra lại` | Chờ một lúc rồi thử lại |
| `contact_operator` | "Cần đội Embra kiểm tra trước khi tiếp tục." | `liên hệ người vận hành` | Đội Embra cần xem. Gửi email theo mục [Khi cần liên hệ](#khi-cần-liên-hệ) |
| `none` | | `không cần làm gì thêm` | Không có lỗi |

Khối **"Nội dung từ app — không do Embra viết"** dưới câu lỗi chứa chữ lấy từ app hoặc repo của bạn: đoạn cuối log build, nội dung app trả về cho health check, thông báo lỗi của Postgres, bản ghi DNS đọc được. Embra không viết khối này, nhưng đây thường là chỗ có nguyên nhân thật.

## Cách tìm mã

- Bấm `Ctrl+F` (`Cmd+F` trên Mac) và gõ mã lỗi, ví dụ `BUILD_FAILED`.
- Console chỉ hiện câu tiếng Việt? Gõ vài chữ đầu của câu đó. Mỗi mục bên dưới có ghi câu bạn thường thấy.
- Mỗi mã có địa chỉ riêng: `docs.embra.cloud/loi/#<mã viết thường>`, ví dụ `/loi/#healthcheck_failed`.

## Khi cần liên hệ

Gửi email tới **hello@embra.cloud**, kèm:

1. **Mã operation** (`operation_id`): dòng `operation:` trong CLI, hoặc nội dung chép bằng **"Sao chép diagnostic ID"** trên console.
2. **Workspace**, project và environment (ví dụ `shop/production`).
3. **Giờ** gặp lỗi, ghi rõ giờ Việt Nam hay UTC.
4. Mã lỗi và câu lỗi, nếu có.

Khi lỗi cần đội Embra xem (`contact_operator`), console có sẵn nút **"Liên hệ hỗ trợ"** mở email nháp đã điền mã operation và mã lỗi. Thư nháp chỉ chứa mã, không chứa secret hay dữ liệu của bạn.

## Build và deploy

### `BUILD_FAILED`

Không build được image từ code của bạn. App đang chạy không bị ảnh hưởng.

**Câu bạn thấy** bắt đầu bằng một trong các dạng sau. Nếu câu bắt đầu bằng `embra.toml:`, xem [`REPO_CONFIG_INVALID`](#repo_config_invalid).

| Câu lỗi | Nghĩa |
|---|---|
| `buildctl lỗi: exit …` hoặc `build trong VM không thành công.` | Lệnh build (Dockerfile hoặc Railpack) chạy lỗi. Nguyên nhân nằm trong build logs |
| `railpack prepare lỗi: exit …` | Bước Railpack phân tích repo lỗi. Lý do nằm trong build logs |
| `git fetch lỗi: …`, `git checkout lỗi: …` | Embra không lấy được commit từ GitHub |
| `không thấy Dockerfile.` | `embra.toml` đặt `builder = "dockerfile"` nhưng không có file ở đường dẫn đó |
| `root không tồn tại.`, `root không phải thư mục.`, `root trỏ ra ngoài repo.` | `root` trong `embra.toml` hoặc **Thư mục gốc** sai |
| `Image build ra vượt giới hạn dung lượng của gói.` | Image lớn hơn dung lượng đĩa của gói |
| `… file migration không hợp lệ.`, `migration trùng tên.`, `quá 100 file migration.`, `migration … vượt … byte.` | Thư mục migration có vấn đề. Xem [Viết migration](/huong-dan/database-va-migration/#viết-migration) |
| `preview.seed không tồn tại.` | File khai ở `[preview] seed` không có trong repo |
| `Upload của build này không còn tồn tại. Upload lại rồi build.` | Bản upload từ `embra deploy` đã hết hạn |

**Cách sửa:**

1. Bấm **"Xem build logs"** và đọc từ dưới lên. Dòng lỗi đầu tiên của trình build (npm, pip, go, docker) thường là nguyên nhân.
2. Chạy lại đúng lệnh build đó trên máy bạn. Nếu repo có `Dockerfile`, chạy `docker build .` ở thư mục gốc (hoặc ở `root`).
3. Nếu log có dòng `egress từ chối "<host>"`: build cần tải từ một host chưa được mở. Gửi tên host đó tới hello@embra.cloud. Danh sách host đang mở ở [Embra build app thế nào](/huong-dan/chuan-bi-app/#embra-build-app-thế-nào).
4. Nếu image quá lớn, làm image nhỏ lại (xem Dockerfile mẫu bên dưới):
   - Dùng Dockerfile nhiều stage, chỉ chép thư mục build ra (ví dụ `dist/`) vào stage cuối.
   - Cài dependency production (`npm ci --omit=dev`).
   - Thêm `.dockerignore` để bỏ `node_modules`, `.git`, file test.
5. Nếu dùng `builder = "dockerfile"` mà không có Dockerfile: bỏ dòng `builder` để Embra tự chọn Railpack, hoặc sửa `dockerfile` cho đúng đường dẫn tính từ `root`.
6. Commit và push lại.

```dockerfile
# Ví dụ Dockerfile nhiều stage cho app Node
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
```

**Dữ liệu có an toàn không?** Có. Build lỗi thì không có gì được deploy, database không bị đụng tới.

**Có nên thử lại không?** Thử lại cùng commit thường ra cùng lỗi. Riêng các câu `không khởi động được VM.`, `VM tắt trước khi sẵn sàng.`, `mất kết nối với embra-buildd giữa chừng build.` là lỗi phía Embra: bấm **"Build lại"** một lần.

**Khi nào liên hệ:** lỗi phía Embra lặp lại sau khi build lại, hoặc build chạy được trên máy bạn nhưng không chạy được trên Embra mà log không chỉ ra lý do.

### `BUILD_TIMEOUT`

Build chạy quá thời gian cho phép nên bị dừng. Câu bạn thấy: `build vượt thời gian cho phép.`

Thời gian build tối đa theo gói, không quá 25 phút. App đang chạy không bị ảnh hưởng.

**Nguyên nhân hay gặp:**

- Cài dependency không có lockfile, nên trình cài phải giải lại toàn bộ cây phụ thuộc.
- Chạy test, lint hoặc tải dữ liệu lớn ngay trong bước build.
- Một lệnh trong Dockerfile chờ mạng tới host chưa được mở cho tới khi hết giờ (log có `egress từ chối`).
- Dockerfile chép toàn bộ code trước khi cài dependency, nên mỗi lần sửa code là cài lại từ đầu.

**Cách sửa:**

1. Mở **"Xem build logs"**.
2. Tìm bước mà build dừng lại.
3. Commit lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`…).
4. Chuyển test và lint sang CI, không chạy trong build.
5. Trong Dockerfile, chép file khai dependency và cài trước, chép code sau:

   ```dockerfile
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   ```

6. Push lại.

**Dữ liệu có an toàn không?** Có. Không có gì được deploy.

**Khi nào liên hệ:** build dừng ở bước tải gói từ host đã mở, hoặc build dưới 25 phút trên máy bạn nhưng vẫn hết giờ trên Embra.

### `HEALTHCHECK_FAILED`

App mới chạy lên nhưng không trả lời health check đúng cách, nên Embra không chuyển traffic sang (hoặc đã trả traffic về bản cũ).

**Câu bạn thấy** và tình trạng app:

| Câu lỗi | App lúc này |
|---|---|
| `Bản mới không qua readiness trong thời gian khởi động. Bản cũ vẫn phục vụ.` | Bản cũ vẫn chạy. Lần deploy đầu thì chưa có bản nào chạy |
| `Bản mới lỗi sau khi nhận traffic, route đã được trả về bản cũ.` | Bản mới lỗi trong 30 giây theo dõi, traffic đã về bản cũ |
| `App không qua readiness sau khi chạy lại; app vẫn đang tạm dừng.` | Bạn bật lại app đang tạm dừng nhưng app không lên, app vẫn tắt |
| `App không chạy được trên bản khôi phục (không qua readiness). …` | Khôi phục bị huỷ, app và database cũ vẫn chạy |
| `Deploy đã xong nhưng app chưa trả lời kiểm tra sức khoẻ sau 2 phút. …` (CLI) | `embra deploy` chờ 2 phút mà app chưa khoẻ. Xem log app |

Embra gọi `GET` tới `health_path` 2 giây một lần, cần **3 lần 2xx liên tiếp** trong `startup_grace_seconds` (mặc định 60 giây). Chi tiết ở [Health check](/huong-dan/chuan-bi-app/#health-check).

**Nguyên nhân hay gặp:**

1. App lắng nghe `127.0.0.1` hoặc `localhost`, nên từ bên ngoài container không gọi được.
2. App lắng nghe cổng khác với `[deploy] port` (mặc định 3000), ví dụ cổng mặc định của framework (8000, 8080, 5173).
3. `health_path` trả 3xx: chuyển hướng sang trang đăng nhập, sang HTTPS hoặc thêm dấu `/`. Chuyển hướng không được tính là đạt.
4. `health_path` trả 4xx: đường dẫn không tồn tại, cần đăng nhập, hoặc framework chặn vì header `Host` lạ. Embra gọi thẳng vào địa chỉ IP nội bộ của container, nên `Host` là `IP:cổng`, không phải domain của bạn.
5. App crash khi khởi động: thiếu secret, không kết nối được database, chạy migration lúc khởi động (tài khoản database của app không có quyền đổi schema).
6. App khởi động chậm hơn `startup_grace_seconds`.

**Cách sửa:**

1. Mở **"Logs"** và đọc log app quanh giờ deploy lỗi. Crash khi khởi động hiện rõ ở đây.
2. Xem khối **"Nội dung từ app — không do Embra viết"**: đó là nội dung app trả về ở lần gọi health check cuối.
3. Sửa app để lắng nghe `0.0.0.0` trên cổng trong biến `PORT`. Embra đặt `PORT` bằng `[deploy] port`, trừ khi bạn tự đặt secret `PORT`. Mẫu theo framework ở dưới.
4. Làm một đường dẫn riêng cho health check, ví dụ `/healthz`, trả 2xx mà không cần đăng nhập và không chuyển hướng. Khai đường dẫn đó trong `embra.toml`:

   ```toml
   [deploy]
   health_path = "/healthz"
   ```

5. Nếu app khởi động chậm, tăng `startup_grace_seconds` (tối đa 300).
6. Nếu app tự chạy migration khi khởi động (`prisma migrate deploy`, TypeORM `synchronize: true`…), bỏ lệnh đó. Migration đi qua Embra: xem [Database và migration](/huong-dan/database-va-migration/).
7. Push lại.

**Express:**

```js
const port = Number(process.env.PORT) || 3000;
app.get('/healthz', (req, res) => res.send('ok'));
app.listen(port, '0.0.0.0');
```

**NestJS** (`src/main.ts`):

```ts
await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
```

**Next.js** (`package.json`):

```json
{
  "scripts": {
    "start": "next start -H 0.0.0.0 -p ${PORT:-3000}"
  }
}
```

Nếu dùng `output: 'standalone'` và chạy `node server.js` trong Dockerfile, đặt thêm `HOSTNAME`:

```dockerfile
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

**Django** (gunicorn, trong Dockerfile):

```dockerfile
CMD gunicorn myproject.wsgi --bind 0.0.0.0:${PORT:-3000}
```

Django trả 400 khi `Host` không có trong `ALLOWED_HOSTS`, và có thể chuyển hướng sang HTTPS nếu bật `SECURE_SSL_REDIRECT`. Cho health check một middleware riêng, đặt **đầu tiên** trong `MIDDLEWARE`:

```python
# myproject/health.py
from django.http import HttpResponse


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/healthz":
            return HttpResponse("ok")
        return self.get_response(request)
```

```python
# settings.py
MIDDLEWARE = [
    "myproject.health.HealthCheckMiddleware",
    # ... các middleware còn lại
]
```

**Laravel** (trong Dockerfile):

```dockerfile
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-3000}
```

:::caution[`$PORT` trong dạng mảng]
`CMD ["node", "server.js"]` và `start = ["node", "dist/main.js"]` trong `embra.toml` là dạng mảng, không qua shell, nên `$PORT` viết trong đó **không** được thay bằng giá trị. Đọc `PORT` trong code, hoặc bọc bằng shell: `CMD ["sh", "-c", "gunicorn myproject.wsgi --bind 0.0.0.0:$PORT"]`.
:::

**Dữ liệu có an toàn không?** Tuỳ trường hợp:

- **Bản mới không qua health check:** chưa có traffic thật tới bản mới. Nhưng app mới đã chạy code khởi động với `DATABASE_URL`, nên dữ liệu mà code đó ghi (ví dụ seed khi khởi động) vẫn còn.
- **Bản mới lỗi sau khi nhận traffic:** bản mới đã phục vụ request thật trong lúc được theo dõi. Dữ liệu ghi trong lúc đó vẫn còn trong database.
- **Mọi trường hợp:** nếu plan có migration, **migration đã chạy vẫn giữ nguyên**, và bản cũ đang chạy trên schema mới. Đừng sửa file migration đã chạy để "hoàn tác", vì Embra sẽ báo [`MIGRATION_HISTORY_CHANGED`](#migration_history_changed). Muốn đổi lại schema thì thêm file migration mới.

**Có nên thử lại không?** Không, khi chưa sửa gì. Health check chạy lại sẽ lỗi y như cũ.

**Khi nào liên hệ:** app chạy đúng `0.0.0.0:$PORT` và trả 2xx ở `health_path` khi chạy bằng Docker trên máy bạn, mà Embra vẫn báo lỗi.

### `REPO_CONFIG_INVALID`

File `embra.toml` có lỗi. Câu lỗi luôn bắt đầu bằng `embra.toml:` và nêu tên trường sai. Khi Embra phát hiện lỗi này lúc build, bạn thấy mã [`BUILD_FAILED`](#build_failed) với cùng câu.

**Câu bạn thấy** (ví dụ):

| Câu lỗi | Cách sửa |
|---|---|
| `embra.toml: field lạ deploy.prot.` | Sửa tên trường cho đúng (ở đây là `port`). Embra không bỏ qua trường lạ |
| `embra.toml: field deploy.port sai kiểu giá trị.` | Sửa kiểu: `port = 3000`, không phải `port = "3000"` |
| `embra.toml: sai cú pháp TOML ở dòng 12.` | Sửa cú pháp ở đúng dòng đó (thiếu ngoặc kép, thiếu `]`…) |
| `embra.toml: build.builder phải là "railpack" hoặc "dockerfile".` | Sửa giá trị, hoặc bỏ dòng để Embra tự chọn |
| `embra.toml: deploy.startup_grace_seconds phải > 0.` | Đặt số giây từ 5 tới 300 |
| `embra.toml: … phải là đường dẫn tương đối trong repo.`, `… không được trỏ ra ngoài repo.` | Viết đường dẫn tính từ gốc repo (hoặc từ `root`), không bắt đầu bằng `/`, không dùng `..` ra ngoài |
| `embra.toml: build.env.EMBRA_…: tiền tố EMBRA_ dành riêng cho Embra.` | Đổi tên biến |
| `embra.toml: cron.<tên>.schedule: …` | Dùng lịch cron 5 trường, giờ UTC, cách nhau ít nhất 5 phút |
| `embra.toml: file vượt 65536 byte.` | Rút gọn file, tối đa 64 KiB |

**Cách sửa:**

1. Mở `embra.toml` ở gốc repo.
2. Tìm đúng trường hoặc dòng mà câu lỗi nêu.
3. So với [tham chiếu `embra.toml`](/huong-dan/chuan-bi-app/#embratoml).
4. Kiểm cú pháp bằng một trình đọc TOML trên máy (ví dụ `python3 -c "import tomllib; tomllib.load(open('embra.toml','rb'))"`).
5. Commit và push lại.

**Dữ liệu có an toàn không?** Có. Không có gì được deploy.

### `SOURCE_NOT_CONNECTED`

Embra không đọc được repo GitHub của environment này.

**Câu bạn thấy:**

- `Environment chưa nối với repo GitHub. …`
- `Environment không còn nối với repo GitHub.`
- `GitHub installation đã bị gỡ hoặc tạm dừng.`
- `Không lấy được quyền đọc repo: installation đã bị gỡ, tạm dừng hoặc mất quyền truy cập repo.`
- `Không đọc được nhánh đã nối: repo, nhánh hoặc installation không còn truy cập được.`
- `Hãy đăng nhập bằng GitHub trước khi kết nối repo.`

**Nguyên nhân hay gặp:**

- Embra GitHub App bị gỡ hoặc tạm dừng ở tài khoản hoặc tổ chức GitHub.
- Khi cài GitHub App, bạn chọn "Only select repositories" và repo này không có trong danh sách (hoặc vừa bị bỏ ra).
- Repo bị đổi tên, chuyển sang chủ khác hoặc bị xoá. Nhánh đã nối bị đổi tên hoặc bị xoá.
- Bạn đăng nhập Embra bằng Google. Chỉ người đăng nhập bằng GitHub mới kết nối được repo.

**Cách sửa:**

1. Mở **Cài đặt → "Source code"**.
2. Bấm **"Cài / cập nhật quyền GitHub App"**.
3. Cấp lại quyền cho repo này trên GitHub.
4. Kiểm tên repo và nhánh đã nối còn đúng. Nhánh đổi tên thì nối lại với nhánh mới.
5. Bấm **"Build lại"**.

Xem thêm [Deploy từ GitHub](/huong-dan/deploy-tu-github/#tạo-app-lần-đầu).

**Dữ liệu có an toàn không?** Có. App đang chạy vẫn chạy, chỉ là không build được bản mới.

### `SECRET_REVOKED`

Một secret mà bản deploy cần đã bị thu hồi, hoặc chưa có giá trị nào còn hiệu lực.

Câu bạn thấy, ví dụ: `Một secret của release đã bị thu hồi sau khi plan. Đặt version mới rồi plan lại.` hoặc `Secret <TÊN> chưa có version nào còn hiệu lực. …`

1. Mở **Cài đặt → "Secrets"**.
2. Nhập giá trị mới cho secret đó, bấm **"Lưu secret"**.
3. Bấm **"Build lại"** để tạo plan mới. Secret vào app ở lần build tiếp theo.

Xem [Secret](/huong-dan/secret/). Bật lại app đang tạm dừng mà gặp lỗi này thì app vẫn tắt cho tới khi bạn sửa.

### `ATTESTATION_MISMATCH`

Container mới chạy lệch so với cấu hình Embra đã yêu cầu, nên Embra không chuyển traffic sang. Bản cũ vẫn chạy. Đây là kiểm tra an toàn phía Embra, bạn không sửa được bằng code. Gửi email hello@embra.cloud kèm mã operation.

### `IMAGE_DIGEST_REQUIRED`

`embra deploy --image` cần image ghim theo digest. Viết dạng `<image>@sha256:<64 ký tự hex>`, không dùng tag như `:latest`.

### `SOURCE_ARCHIVE_INVALID`

Gói source mà `embra deploy` tải lên bị từ chối (không phải `tar.gz` hợp lệ, hoặc chứa loại file không được phép). Bỏ loại file lạ khỏi thư mục, hoặc thêm chúng vào `.embraignore`, rồi chạy lại.

### `SOURCE_TOO_LARGE`

File tải lên vượt giới hạn của gói: source của `embra deploy`, hoặc file dump khi nhập dữ liệu (lớn hơn dung lượng database của gói). Câu lỗi ghi rõ cỡ file và giới hạn. Thu nhỏ file (thêm `.embraignore`, bỏ bảng không cần), hoặc nâng gói.

## Database và migration

Câu lỗi về migration đôi khi ghi "lớp" của câu lệnh. Đối chiếu với tên nhóm ở [Embra kiểm migration thế nào](/huong-dan/database-va-migration/#embra-kiểm-migration-thế-nào):

| Lớp | Nhóm |
|---|---|
| A | An toàn |
| B | Đổi hoặc xoá dữ liệu |
| C | Khoá bảng lâu |
| D | Không chạy trong transaction |
| E, F | Chưa hỗ trợ (E: Embra không đọc hiểu được câu lệnh; F: bị cấm) |

### `MIGRATION_UNSUPPORTED`

Một câu lệnh trong file migration thuộc loại Embra chưa chạy được, nên plan bị từ chối trước khi đụng tới database.

**Câu bạn thấy:**

- `File 0003_x.sql, câu lệnh #2 (CreateFunctionStmt) lớp E: …` hoặc `… lớp F: …`
- `File 0003_x.sql: không đọc được SQL nên không thể chứng minh an toàn.`
- `File 0004_x.sql, câu lệnh #1 (IndexStmt) lớp D: … lệnh không chạy trong transaction (như CREATE INDEX CONCURRENTLY) phải ở file riêng, chỉ có đúng một câu lệnh`
- `SQL của migration đã thay đổi bảng nội bộ của Embra. Đã rollback; không được phép.`
- `Migration không hợp lệ để chạy trên production.`

Khi lỗi này xuất hiện sau một build thành công, console hiện **"Build xong · cần sửa config"** và **"Không tạo được plan deploy"**.

**Nguyên nhân hay gặp:**

- File có function, procedure, trigger, view, khối `DO`, `CREATE EXTENSION`, `CREATE SCHEMA`, `GRANT`/`REVOKE` hoặc `COPY`. Migration do ORM sinh ra hay có các câu này.
- File có `BEGIN`/`COMMIT`. Embra tự bọc mỗi file trong một transaction.
- `CREATE INDEX CONCURRENTLY` nằm chung file với câu lệnh khác.
- SQL viết cho database khác (MySQL, SQLite) hoặc có cú pháp Postgres không đọc được.

**Cách sửa:**

1. Mở file mà câu lỗi nêu, tìm câu lệnh theo số thứ tự `#` (tính từ 1). Câu lệnh gốc nằm trong khối **"Nội dung từ app — không do Embra viết"**.
2. Bỏ `BEGIN` và `COMMIT` nếu có.
3. Tách `CREATE INDEX CONCURRENTLY` ra một file riêng, chỉ có đúng câu lệnh đó.
4. Với function, trigger, view, extension: chuyển phần logic đó vào code app. Embra chưa chạy được các câu lệnh này.
5. Commit và push lại. File này chưa từng chạy nên bạn sửa thẳng được.

**Dữ liệu có an toàn không?** Có. Embra từ chối từ bước lập plan. Riêng câu `SQL của migration đã thay đổi bảng nội bộ của Embra.` xảy ra lúc chạy, và Embra đã rollback câu lệnh đó.

### `MIGRATION_REHEARSAL_FAILED`

Migration chạy lỗi. Có hai trường hợp:

| Câu lỗi | Lỗi ở đâu |
|---|---|
| `Diễn tập migration thất bại trên bản sao dữ liệu; chưa đụng production. …` | Trên bản sao dữ liệu. Production chưa bị đụng tới |
| `Migration lỗi trên production dù đã diễn tập thành công: production khác bản sao. Câu lệnh lỗi đã rollback.` | Trên production. Câu lệnh lỗi đã được rollback |

Thông báo lỗi của Postgres (ví dụ `column "status" of relation "orders" contains null values`) nằm trong khối **"Nội dung từ app — không do Embra viết"**, kèm tên file và câu lệnh lỗi.

**Nguyên nhân hay gặp:**

- Thêm cột `NOT NULL` không có `DEFAULT` vào bảng đã có dữ liệu.
- Tạo `UNIQUE` hoặc khoá ngoại khi dữ liệu hiện có vi phạm (trùng giá trị, tham chiếu tới dòng không tồn tại).
- Đổi kiểu cột mà dữ liệu cũ không chuyển được (ví dụ chữ sang số).
- Tham chiếu bảng hoặc cột chưa có, do thứ tự file sai.
- Migration chạy được trên database rỗng ở máy bạn nhưng lỗi với dữ liệu thật.

**Cách sửa:**

1. Đọc thông báo Postgres và tên file lỗi.
2. Sửa SQL cho chạy được với dữ liệu hiện có. Ví dụ thêm cột bắt buộc theo ba bước:

   ```sql
   ALTER TABLE orders ADD COLUMN status text;
   UPDATE orders SET status = 'paid' WHERE status IS NULL;
   ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
   ```

   Hoặc gọn hơn: `ALTER TABLE orders ADD COLUMN status text NOT NULL DEFAULT 'paid';`
3. File lỗi chưa được áp nên bạn sửa thẳng file đó được. **Đừng sửa file đã áp** ở các lần deploy trước.
4. Commit và push lại. Embra diễn tập lại trước khi chạy.

**Dữ liệu có an toàn không?** Lỗi khi diễn tập: production không bị đụng tới. Lỗi trên production: câu lệnh lỗi đã rollback và code cũ vẫn chạy. Mỗi file chạy trong transaction riêng, nên nếu plan có nhiều file thì các file đứng trước file lỗi có thể đã áp. Embra ghi nhận file đã áp và lần sau chỉ chạy các file còn lại.

**Khi nào liên hệ:** lỗi trên production mà bạn không tìm ra điểm khác giữa production và bản sao.

### `MIGRATION_LOCK_TIMEOUT`

Migration cần khoá một bảng, nhưng có truy vấn khác giữ khoá quá lâu. Embra thử lại nhiều lần với thời gian chờ ngắn để không làm treo app, rồi dừng.

**Câu bạn thấy:** `Không lấy được khoá bảng trong thời gian cho phép (có truy vấn dài đang giữ). Chưa áp file nào còn dở; code cũ vẫn phục vụ.`

**Nguyên nhân hay gặp:**

- App có transaction mở lâu, hoặc kết nối ở trạng thái "idle in transaction" (mở transaction mà không commit).
- Một truy vấn báo cáo hoặc export dài đang chạy trên bảng đó.
- Một cron hoặc worker đang xử lý hàng loạt trên bảng đó.

**Cách sửa:**

1. Dừng truy vấn dài: kết thúc job báo cáo, hoặc sửa chỗ code mở transaction mà không đóng.
2. Chọn lúc ít traffic.
3. Tạo plan mới: bấm **"Build lại"**, hoặc chạy `embra plan`.

**Dữ liệu có an toàn không?** Có. File đang chờ khoá chưa chạy, không có file nào áp dở. Code cũ vẫn chạy. Nếu plan có nhiều file, các file đứng trước có thể đã áp; lần plan sau chỉ chạy các file còn lại.

**Có nên thử lại không?** Có, sau khi truy vấn dài đã xong.

### `MIGRATION_DATA_LOSS`

Đây không phải lỗi: plan đang chờ duyệt, và diễn tập cho thấy migration sẽ **xoá hoặc ghi đè dữ liệu** (ví dụ `DROP COLUMN`, `DROP TABLE`, `DELETE`). Áp dụng cả ở staging.

**Cách xử lý:**

1. Bấm **"Xem và duyệt"**.
2. Đọc phần dữ liệu sẽ mất: bảng, cột và số dòng ước tính.
3. Nếu cần giữ dữ liệu đó, lấy ra trước: **Cài đặt → "Dữ liệu" → "Export dữ liệu"**, hoặc chép sang bảng khác bằng một migration riêng.
4. Nếu đồng ý: gõ tên environment và `CONFIRM_MIGRATION`, rồi bấm **"Duyệt và deploy"**.
5. Nếu không đồng ý: bấm **"Từ chối"** rồi sửa migration.

Chỉ Owner hoặc Admin duyệt được. Xem [Duyệt production](/huong-dan/deploy-tu-github/#duyệt-production).

**Dữ liệu có an toàn không?** Chưa có gì chạy cho tới khi bạn duyệt. Sau khi migration đã áp, bạn không tự khôi phục về mốc trước migration được (xem [`MIGRATION_AFTER_RESTORE_POINT`](#migration_after_restore_point)), nên hãy chắc chắn trước khi duyệt.

### `MIGRATION_HISTORY_CHANGED`

Danh sách file migration trong repo không khớp với những gì đã chạy trên environment.

| Câu lỗi | Cách sửa |
|---|---|
| `File 0002_x.sql đã áp lên environment nhưng nội dung đã đổi. …` | Trả file về đúng nội dung đã chạy (ví dụ `git checkout <commit cũ> -- migrations/0002_x.sql`). Muốn đổi tiếp thì thêm file mới |
| `File đã áp lên environment bị thiếu trong plan: … Giữ nguyên mọi file đã áp.` | Khôi phục các file đã xoá hoặc đổi tên về đúng tên cũ |
| `File mới 0003_x.sql nằm trước file đã áp 0005_y.sql. Đặt số lớn hơn 0005_y.sql.` | Đổi tên file mới với số lớn hơn file đã áp cuối cùng |

**Nguyên nhân hay gặp:**

- Sửa một file migration đã chạy để "sửa lỗi".
- Gộp, xoá hoặc đổi tên migration cũ cho gọn.
- Dùng Prisma và chạy lại đoạn script chép migration sau khi xoá hoặc sửa migration cũ của Prisma, làm lệch số thứ tự. Xem [Viết migration](/huong-dan/database-va-migration/#viết-migration).
- Hai nhánh cùng thêm migration, nhánh merge sau có số nhỏ hơn.

**Dữ liệu có an toàn không?** Có. Embra từ chối từ bước lập plan, chưa chạy gì.

### `SCHEMA_DRIFT`

Schema production đã đổi kể từ lúc diễn tập, nên bằng chứng diễn tập không còn đúng và plan bị huỷ. Chưa file nào được áp. Tạo plan mới (bấm **"Build lại"**, hoặc chạy `embra plan`) để Embra diễn tập lại.

### `POOL_IOPS_BUDGET_EXCEEDED`

Máy chủ đã dùng hết ngân sách ghi đĩa nên chưa dựng được Postgres. Đây là giới hạn phía Embra. Gửi email hello@embra.cloud kèm mã operation.

## Domain

### `DOMAIN_NOT_VERIFIED`

Embra chưa xác minh được domain của bạn. Cần **cả hai**: bản ghi TXT đúng, và domain trỏ về Embra.

**Câu bạn thấy** nêu chính xác phần còn thiếu, ví dụ:

`Chưa xác minh được www.shop.vn: thiếu bản ghi TXT _embra-challenge.www.shop.vn = embra-verify=…; hostname chưa trỏ về Embra (cần CNAME tới …, hoặc A/AAAA tới IP của edge).`

Giá trị DNS mà Embra đọc được nằm trong khối **"Nội dung từ app — không do Embra viết"**.

**Nguyên nhân hay gặp:**

- DNS chưa cập nhật xong (thường 5–30 phút).
- Bật proxy Cloudflare (đám mây màu cam). Embra khi đó chỉ thấy IP của Cloudflare.
- Bản ghi TXT bị nhân đôi phần đuôi: nhiều nhà cung cấp tự thêm tên domain, nên gõ cả tên đầy đủ sẽ thành `_embra-challenge.www.shop.vn.shop.vn`.
- Dùng CNAME cho tên gốc (`shop.vn`). Tên gốc cần bản ghi A.
- Còn bản ghi A hoặc CNAME cũ trỏ chỗ khác.

**Cách sửa:**

1. Mở **Cài đặt → "Domain"** để xem các bản ghi Embra yêu cầu.
2. Ở nhà cung cấp DNS, tạo đúng bản ghi TXT. Nếu ô "Tên" tự thêm đuôi domain, chỉ gõ `_embra-challenge.www` (hoặc `_embra-challenge` với tên gốc).
3. Tạo CNAME tới địa chỉ app. Với tên gốc, tạo bản ghi A tới IP mà Embra hiện trên màn hình.
4. Xoá bản ghi A hoặc CNAME cũ cùng tên.
5. Nếu dùng Cloudflare, chuyển các bản ghi sang **DNS only** (đám mây xám).
6. Đợi vài phút cho DNS cập nhật.
7. Bấm **"Kiểm tra"**. Mỗi domain kiểm tra được tối đa 1 lần mỗi 30 giây.

Xem [Domain riêng](/huong-dan/domain-rieng/).

**Dữ liệu có an toàn không?** Có. App vẫn chạy ở địa chỉ `.onembra.com`.

### `DOMAIN_TAKEN`

Domain này đã được xác minh ở một environment khác trên Embra. Một tên domain chỉ gắn được vào một app.

**Câu bạn thấy:** `Hostname này đã được xác minh ở một environment khác.`

**Cách sửa:**

**Nguyên nhân hay gặp:**

- Domain còn gắn ở app cũ, ở staging, hoặc ở một workspace khác của bạn (ví dụ workspace dùng thử).
- Người khác đã xác minh domain này trước đó.

**Cách sửa:**

1. Nếu domain đang gắn ở một app khác của bạn: mở **Cài đặt → "Domain"** ở app đó.
2. Bấm **"Xoá"** ở domain đó.
3. Quay lại app mới, thêm domain lần nữa.

Nếu bạn không gắn domain này ở đâu cả, gửi email hello@embra.cloud kèm tên domain. Embra không cho biết domain đang nằm ở workspace nào.

**Dữ liệu có an toàn không?** Có. App vẫn chạy ở địa chỉ `.onembra.com`. Thử lại không có tác dụng cho tới khi domain được gỡ ở nơi kia.

## Tài khoản và gói

### `QUOTA_EXCEEDED`

Việc bạn làm vượt giới hạn của gói, hoặc của máy chủ. Câu lỗi ghi rõ giới hạn nào, thường kèm con số.

| Câu lỗi (ví dụ) | Cách xử lý |
|---|---|
| `Gói dùng thử chỉ có một environment …`, `Gói dùng thử cho tối đa …` | Nâng gói, hoặc xoá thứ không dùng. Xem [Gói dùng thử](/huong-dan/tai-khoan-va-goi/#gói-dùng-thử) |
| `Hồ tài nguyên app của gói là … không đủ cho release này …`, `Tổng cỡ app sẽ là … vượt hồ tài nguyên …` | Giảm cỡ app khác ở **Cài đặt → "Tài nguyên"**, hoặc nâng gói |
| `Gói … có tối đa … database cho app production …` | Xoá database không dùng, hoặc nâng gói. Staging và preview không tính |
| `Workspace đã dùng hết số domain riêng của gói …` | Gỡ domain không dùng, hoặc nâng gói |
| `Gói … không có staging. …`, `Mỗi project có tối đa một staging. …` | Nâng gói, hoặc xoá staging cũ |
| `Gói … cho tối đa … preview environment …` | Đóng bớt pull request, hoặc chờ preview cũ tự xoá |
| `Gói … không có object storage.`, `Environment đã có bucket; …` | Xem [Lưu file](/huong-dan/luu-file/) |
| Sau một build thành công, console hiện **"Không tạo được plan deploy"** vì worker hoặc cron | Bỏ bớt `[processes.*]` hoặc `[cron.*]` trong `embra.toml` cho vừa gói, hoặc nâng gói, rồi push lại |
| `Gói hiện tại giữ … ngày lịch sử log …`, `… ngày lịch sử metrics …` | Chọn khoảng thời gian gần hơn |
| `Workspace đang mở … luồng log, tối đa cho phép. …` | Đóng bớt tab đang xem log |
| `Verify quá dày. …` | Mỗi domain kiểm tra được 1 lần mỗi 30 giây, và mỗi workspace có giới hạn số lần mỗi giờ. Chờ rồi bấm **"Kiểm tra"** lại |
| `Node hết dải mạng …`, `Hết dải mạng để cấp cho preview mới.`, `Không đủ chỗ chạy hai database song song để khôi phục …` | Giới hạn của máy chủ, không phải của gói. Gửi email hello@embra.cloud |
| `Máy chủ chưa đủ ngân sách ghi đĩa để chạy thêm database cũ nên không rollback được. …` | App và database hiện tại vẫn chạy bình thường. Gửi email hello@embra.cloud nếu cần rollback gấp |

**Nâng gói:** chỉ Owner làm được, trên trình duyệt, ở menu tài khoản → **"Thanh toán"**. Xem [Tài khoản, dùng thử và thanh toán](/huong-dan/tai-khoan-va-goi/).

**Dữ liệu có an toàn không?** Có. Embra từ chối trước khi làm, không có gì thay đổi.

### `TRIAL_EXPIRED`

Gói dùng thử đã hết 7 ngày. Console hiện **"Dùng thử đã hết hạn"**.

**Câu bạn thấy:** `Gói dùng thử đã hết hạn: mọi request tới workspace này bị từ chối và dữ liệu sắp bị xoá. Dữ liệu cần lấy phải export trước hạn.`

- Mọi thao tác bị từ chối, kể cả xem.
- Sau đó toàn bộ workspace bị xoá: app, database và backup.

**Cách xử lý:**

1. Nếu bạn cần giữ app hoặc dữ liệu, gửi email **ngay** tới hello@embra.cloud kèm tên workspace. Console có nút **"Liên hệ hỗ trợ"** trên màn hình này.
2. Với workspace dùng thử khác, chọn gói và chuyển khoản trước khi hết hạn. Xem [Gói dùng thử](/huong-dan/tai-khoan-va-goi/#gói-dùng-thử).

**Có nên thử lại không?** Không. Mọi yêu cầu tới workspace này đều bị từ chối.

### `SIGNUP_CLOSED`

Embra chưa cho tài khoản này vào. Console hiện **"Chưa vào được Embra"**.

| Câu lỗi | Cách xử lý |
|---|---|
| `Email Google này chưa được mời vào workspace nào. …` | Đăng nhập bằng Google chỉ dành cho người được mời. Nhờ Owner mời đúng email đó, hoặc đăng nhập bằng GitHub |
| `Tài khoản GitHub phải được tạo ít nhất … ngày trước mới đăng ký dùng thử được.` | Gửi username GitHub tới hello@embra.cloud để được mở riêng cho tài khoản đó |
| `Đợt dùng thử hôm nay đã đầy. …` | Thử lại hôm sau, hoặc gửi email hello@embra.cloud để được mời |
| `Đăng ký dùng thử đang đóng. …` | Gửi email hello@embra.cloud để được mời |

Xem [Đăng nhập](/huong-dan/tai-khoan-va-goi/#đăng-nhập).

**Có nên thử lại không?** Chỉ khi lượt dùng thử trong ngày đã đầy: thử lại hôm sau. Các trường hợp khác cần lời mời hoặc email tới đội Embra trước. Chưa có workspace nào được tạo nên không có dữ liệu nào bị ảnh hưởng.

### `WORKSPACE_SUSPENDED`

Đội Embra đã tạm ngưng workspace, thường sau một báo cáo lạm dụng.

**Câu bạn thấy:** `Workspace đang bị tạm ngưng: chỉ đọc được, mọi thao tác ghi bị từ chối. Dữ liệu được giữ nguyên. Liên hệ abuse@embra.cloud để khiếu nại.`

- App ngừng nhận traffic. Dữ liệu được giữ nguyên.
- Bạn vẫn xem được, nhưng không deploy, đổi cấu hình hay đổi gói được.

**Cách xử lý:**

1. Gửi email tới **abuse@embra.cloud**, kèm tên workspace.
2. Giải thích app làm gì và vì sao bạn cho rằng việc tạm ngưng là nhầm.

**Có nên thử lại không?** Không. Mọi thao tác ghi bị từ chối cho tới khi đội Embra gỡ tạm ngưng.

### `ENVIRONMENT_SUSPENDED`

Giống [`WORKSPACE_SUSPENDED`](#workspace_suspended) nhưng chỉ một environment bị tạm ngưng. App của environment đó ngừng nhận traffic, dữ liệu được giữ nguyên. Khiếu nại qua **abuse@embra.cloud**.

## Quyền và duyệt

### `APPROVAL_REQUIRED`

Đây không phải lỗi: plan đang chờ Owner hoặc Admin duyệt. Production **luôn** cần duyệt, kể cả khi không có migration. Staging và preview cần duyệt khi migration đổi hoặc xoá dữ liệu.

**Cách xử lý:**

1. Mở trang Tổng quan bằng tài khoản Owner hoặc Admin.
2. Bấm **"Xem và duyệt"**.
3. Xem thay đổi về code, config và dữ liệu.
4. Gõ tên environment để xác nhận.
5. Bấm **"Duyệt và deploy"**.

Developer và AI agent tạo được plan nhưng không duyệt được. Plan chờ duyệt hết hạn sau 24 giờ. Duyệt cần người thật vừa đăng nhập: xem [Việc cần người thật](/workspace/phan-quyen/#việc-cần-người-thật).

**Dữ liệu có an toàn không?** Có. Chưa có gì chạy cho tới khi được duyệt. App đang chạy vẫn chạy.

### `APPROVAL_EXPIRED`

Việc chờ duyệt đã quá hạn nên bị huỷ. Không có gì được áp dụng.

| Câu lỗi | Cách xử lý |
|---|---|
| `Plan đã hết hạn duyệt nên bị huỷ. …` | Tạo plan mới: bấm **"Build lại"**, hoặc chạy `embra plan` |
| `Bằng chứng diễn tập migration đã hết hạn nên plan bị huỷ. …` | Tạo plan mới. Kết quả diễn tập chỉ dùng được 24 giờ |
| `Lần nhập dữ liệu đã hết hạn duyệt nên bị huỷ; database không đổi và file đã bị xoá. …` | Tải file lên lại để nhập |
| `Restore đã hết hạn duyệt nên bị huỷ …` | Tạo lại bản khôi phục ở **"Khôi phục dữ liệu…"** |
| `Request fork đã quá hạn duyệt …` | Tạo lại yêu cầu fork |

**Dữ liệu có an toàn không?** Có. Việc bị huỷ chưa đụng tới app hay database đang chạy. Duyệt lại plan cũ không được: cần tạo plan mới.

### `GENERATION_CONFLICT`

Environment đã thay đổi từ lúc lập plan (ví dụ có một lần deploy hoặc rollback khác chạy xong), nên plan cũ bị huỷ để không duyệt nhầm. Tạo plan mới.

### `BINDING_MISMATCH`

Bạn duyệt một phiên bản plan khác với phiên bản đang chờ (thường do trang đã cũ). Tải lại trang, xem lại plan rồi duyệt.

### `FORBIDDEN_SCOPE`

Vai trò hoặc token của bạn không có quyền làm việc này. Nhờ Owner hoặc Admin làm, hoặc nâng vai trò. Xem [Thành viên và phân quyền](/workspace/phan-quyen/).

### `HUMAN_REQUIRED`

Việc này cần người thật, mà bạn đang dùng token máy (CI, agent). Làm trên trình duyệt, hoặc chạy `embra login` rồi thử lại. Xem [Việc cần người thật](/workspace/phan-quyen/#việc-cần-người-thật).

### `REAUTH_REQUIRED`

Lần đăng nhập đã quá 12 giờ, mà việc này cần người vừa đăng nhập. Trên console, bấm **"Đăng nhập lại bằng GitHub"** (hoặc **"Đăng nhập lại bằng Google"**) ngay dưới câu lỗi. Trong CLI, chạy `embra login` lại.

### `LAST_OWNER`

Thay đổi này sẽ làm workspace (hoặc tài khoản agency) không còn owner. Nâng một người khác lên owner trước, rồi làm lại.

### `UNAUTHENTICATED`

Thiếu token, token sai hoặc đã hết hạn. Đăng nhập lại trên console, hoặc chạy `embra login`, hoặc dùng token còn hạn.

### `CSRF_FAILED`

Trình duyệt gửi yêu cầu không kèm mã bảo vệ hợp lệ, thường do tab mở quá lâu hoặc mở từ trang khác. Tải lại trang rồi thử lại.

### `DEVICE_ACCESS_DENIED`

Bạn đã bấm từ chối khi duyệt đăng nhập CLI. Chạy `embra login` lại nếu đó là máy của bạn.

### `DEVICE_CODE_EXPIRED`

Mã đăng nhập CLI hết hạn trước khi bạn duyệt trên trình duyệt. Chạy `embra login` lại để lấy mã mới.

## Rollback và khôi phục

### `ROLLBACK_INCOMPATIBLE`

Không rollback được về bản đã chọn, vì đã có migration chạy sau bản đó. Rollback chỉ trả code, không trả schema về: code cũ có thể không chạy được trên schema mới.

**Câu bạn thấy:**

- `Đã có N file migration áp lên environment sau release …. Rollback chỉ trả code, không tua dữ liệu: …`
- `Đã có N migration áp lên database hiện tại sau lúc chuyển; database cũ không có chúng nên không rollback được.`

Danh sách migration nằm trong khối **"Nội dung từ app — không do Embra viết"**.

**Cách xử lý:**

1. Sửa lỗi bằng một commit mới chạy được với schema hiện tại, rồi deploy như bình thường.
2. Nếu thật sự cần schema cũ, viết một migration mới để đổi ngược lại.
3. Nếu cần dữ liệu trước migration đó, gửi email hello@embra.cloud kèm mã operation.

**Dữ liệu có an toàn không?** Có. Embra từ chối trước khi làm gì.

### `ROLLBACK_DB_GONE`

Bản đích của rollback dùng database cũ (từ trước một lần khôi phục), nhưng database đó đã bị xoá khi hết thời hạn giữ. Dữ liệu cũ chỉ còn trong bản export bạn lấy trước đó. Xem [Backup và khôi phục](/huong-dan/database-va-migration/#backup-và-khôi-phục).

### `RESTORE_POINT_UNAVAILABLE`

Mốc khôi phục bạn chọn không dùng được: chưa có backup đủ để khôi phục, hoặc mốc nằm ngoài khoảng khôi phục được. Câu lỗi ghi khoảng hợp lệ. Mở **"Xem mốc khôi phục"** và chọn một mốc trong khoảng đó.

### `MIGRATION_AFTER_RESTORE_POINT`

Có migration chạy sau mốc bạn chọn. Khôi phục về mốc đó sẽ làm mất cấu trúc bảng mà app hiện tại cần, nên Embra chặn. Database và app đang chạy không bị đụng tới. Chọn mốc sau migration mà câu lỗi nêu. Nếu cần dữ liệu trước mốc đó, gửi email hello@embra.cloud.

### `RESTORE_SHORT`

Backup thiếu dữ liệu (WAL) trước mốc đã chọn nên không dựng được bản khôi phục tới đúng mốc đó. Production không bị đụng tới. Gửi email hello@embra.cloud kèm mã operation và mốc bạn chọn.

### `BACKUP_WAL_GAP`

Lần khôi phục thử tự động gần nhất phát hiện backup thiếu một đoạn dữ liệu. Console hiện **"Lần restore thử gần nhất thiếu dữ liệu — vùng khôi phục cần kiểm tra lại."** App và database đang chạy không bị ảnh hưởng, nhưng đừng dựa vào khoảng khôi phục cho tới khi đội Embra kiểm tra. Gửi email hello@embra.cloud.

## Khi Embra dừng lại chờ kiểm tra

Ba mã dưới đây có chung một nguyên tắc: khi Embra **không chắc** một bước đã xong hay chưa, Embra **cố ý dừng** thay vì tự thử lại. Thử lại một việc chưa rõ kết quả, như chạy migration hai lần hay chuyển database khi chưa biết trạng thái, có thể làm hỏng dữ liệu. Đội Embra xác minh trạng thái thật rồi mới mở lại environment.

### `RECOVERY_REQUIRED`

Một thao tác trên environment (deploy, rollback, khôi phục, bật hoặc tắt app, ghi mốc backup…) kết thúc mà Embra không xác định được kết quả, ví dụ mất kết nối với máy chủ giữa chừng. Console hiện **"Cần đội Embra hỗ trợ"**, trang Tổng quan hiện **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"**.

**Trạng thái lúc này:**

- Embra giữ nguyên traffic như lúc sự cố, không tự đổi. Tuỳ thời điểm xảy ra sự cố, app có thể đang chạy bình thường, đang chạy bản mới, hoặc đang dừng (ví dụ sự cố lúc chuyển sang bản khôi phục).
- Environment bị chặn: deploy, build khi push, rollback, khôi phục, bật hoặc tắt app, đổi domain, nhập dữ liệu đều bị từ chối với [`ENVIRONMENT_BLOCKED`](#environment_blocked).
- Cron không chạy. Backup định kỳ tạm dừng.

**Bạn KHÔNG nên:**

- **Xoá environment.** Việc xoá vẫn được phép, nhưng xoá luôn database và backup mà đội Embra cần để xác minh và khôi phục.
- Tự chạy SQL để "sửa" schema hoặc dữ liệu. Thay đổi tay làm việc xác minh khó hơn.
- Push liên tục hoặc thu hồi secret để "gỡ chặn". Không có tác dụng.

**Bạn nên:**

1. Bấm **"Liên hệ hỗ trợ"** trên console, hoặc gửi email hello@embra.cloud kèm mã operation, workspace, environment và giờ.
2. Ghi lại thao tác bạn vừa làm trước khi lỗi xuất hiện.
3. Nếu app đang lỗi với người dùng, ghi rõ trong email để đội Embra ưu tiên.

### `MIGRATION_UNKNOWN`

Embra mất liên lạc giữa lúc chạy migration trên production, nên không biết migration đã được áp hay chưa. Console hiện **"Cần xác minh dữ liệu"**.

**Trạng thái lúc này:**

- **Code cũ vẫn chạy.** App mới chưa khởi động, vì Embra chỉ khởi động app mới sau khi migration xong.
- Schema có thể là bản cũ hoặc bản mới. Mỗi file migration chạy trong một transaction riêng, nên một file hoặc đã áp trọn vẹn, hoặc chưa áp gì (trừ file `CREATE INDEX CONCURRENTLY`, vốn không chạy trong transaction).
- Embra đã chụp snapshot database ngay trước khi chạy migration.
- Environment bị chặn như ở [`RECOVERY_REQUIRED`](#recovery_required).

**Bạn KHÔNG nên:**

- Xoá environment hoặc database.
- Sửa, đổi tên hay xoá file migration đang chờ, hoặc thêm migration mới để "chạy lại".
- Tự chạy lại câu lệnh migration bằng tay.

**Bạn nên:** gửi email hello@embra.cloud kèm mã operation, workspace, environment và giờ. Đội Embra kiểm tra schema thật, ghi nhận đúng kết quả rồi mở lại environment.

### `ENVIRONMENT_BLOCKED`

Environment đang bị chặn sau một sự cố chưa rõ kết quả ([`RECOVERY_REQUIRED`](#recovery_required) hoặc [`MIGRATION_UNKNOWN`](#migration_unknown)). Mọi thao tác thay đổi bị từ chối cho tới khi đội Embra kiểm tra xong. Trang Tổng quan hiện **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"**, service hiện **"Chờ đội Embra kiểm tra"**.

**Câu bạn thấy:** `Environment đang bị chặn sau một sự cố chưa rõ kết quả. Liên hệ đội Embra (hello@embra.cloud).`

**Có nên thử lại không?** Không. Thử lại sẽ bị từ chối y như cũ cho tới khi environment được mở.

**Bạn KHÔNG nên** xoá environment. Gửi email hello@embra.cloud kèm mã operation của thao tác lỗi đầu tiên (thao tác có trạng thái **"Cần đội Embra hỗ trợ"** hoặc **"Cần xác minh dữ liệu"** ở **"Lần deploy"**), workspace, environment và giờ.

Câu `Database không ở trạng thái sẵn sàng (…). Liên hệ đội Embra (hello@embra.cloud).` cũng dùng mã này: database của environment đang ở trạng thái lỗi. Xử lý giống trên.

## Khác

### `OPERATION_IN_PROGRESS`

Environment đang có một thao tác khác chưa xong (build, deploy, dựng database, khôi phục…), hoặc đang bị xoá. Chờ thao tác đó xong rồi thử lại. Xem tiến độ ở **"Lần deploy"**.

### `INVALID_INPUT`

Dữ liệu bạn nhập không hợp lệ: tên sai mẫu, giá trị ngoài khoảng cho phép, thiếu trường. Câu lỗi thường nêu trường nào sai. Sửa theo câu lỗi rồi làm lại.

Một số câu hay gặp:

- "Environment đang tạm dừng. Chạy `embra env resume` trước khi deploy.": bật lại app trước, rồi deploy.
- "Database đang dừng. Chạy `embra db start` trước khi fork.": bật lại database trước.
- `Tối đa 100 file migration mỗi plan …`, `Tổng dung lượng migration vượt 2 MiB.`: chia nhỏ, mỗi file tối đa 256 KiB.

### `NOT_FOUND`

Không tìm thấy thứ bạn yêu cầu (project, environment, domain, token…). Có thể nó đã bị xoá, hoặc nằm ở workspace khác. Kiểm tên hoặc mã, và kiểm bạn đang ở đúng workspace.

### `IDEMPOTENCY_CONFLICT`

Yêu cầu gửi lại dùng cùng khoá chống trùng (`Idempotency-Key`) nhưng nội dung khác lần trước, hoặc yêu cầu đã chạy và không trả lại giá trị bí mật lần nữa. Gửi yêu cầu mới với khoá mới.

### `FORK_SECRET_IS_PROD`

Giá trị bạn đặt cho fork trùng secret của production. Fork không được dùng key thật. Tạo key test hoặc sandbox ở nhà cung cấp (thanh toán, email…) rồi đặt lại.

### `RATE_LIMITED`

Bạn gửi quá nhiều yêu cầu trong thời gian ngắn. Chờ vài giây rồi thử lại. Lỗi này an toàn để thử lại.

### `TEMPORARILY_UNAVAILABLE`

Một thành phần của Embra tạm thời không trả lời. Chưa có gì thay đổi. Chờ một lúc rồi thử lại. Lỗi này an toàn để thử lại. Lỗi kéo dài thì gửi email hello@embra.cloud.

### `INTERNAL`

Lỗi phía Embra. Thử lại một lần. Nếu vẫn lỗi, gửi email hello@embra.cloud kèm mã operation và giờ.

## Mã thoát của CLI

Dùng mã thoát để script CI biết nên làm gì:

| Mã thoát | Nghĩa |
|---|---|
| `0` | Xong |
| `1` | Lỗi đăng nhập, không tìm thấy, hoặc lỗi phía Embra |
| `2` | Đầu vào sai (`INVALID_INPUT`, `REPO_CONFIG_INVALID`, `SOURCE_ARCHIVE_INVALID`) |
| `10` | Thao tác bị từ chối hoặc thất bại (phần lớn mã lỗi) |
| `20` | Đang chờ duyệt (`APPROVAL_REQUIRED`, `MIGRATION_DATA_LOSS`) |
| `30` | Cần đội Embra (`RECOVERY_REQUIRED`, `MIGRATION_UNKNOWN`, `ENVIRONMENT_BLOCKED`, tạm ngưng) |
| `75` | Tạm thời, thử lại sau (`RATE_LIMITED`, `TEMPORARILY_UNAVAILABLE`) |
