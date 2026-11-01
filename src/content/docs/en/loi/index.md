---
title: Error codes and fixes
description: Look up Embra error codes (reason_code) by what you were doing. Each code has its meaning, common causes, how to fix it and when to contact us.
tableOfContents:
  maxHeadingLevel: 2
---

## How to read an error

Every error Embra returns has three parts:

| Part | Example | Where you see it |
|---|---|---|
| Error code (`reason_code`) | `HEALTHCHECK_FAILED` | The CLI's `--json` output, and the text copied with **"Sao chép diagnostic ID"** (copy diagnostic ID) |
| Vietnamese sentence (`summary_vi`) | "Bản mới không qua readiness trong thời gian khởi động. Bản cũ vẫn phục vụ." | Console and CLI |
| Next step (`next_action`) | `fix_input` | The line under the error in the console, the `bước tiếp:` (next step) line in the CLI |

The next step tells you who needs to do what:

| `next_action` | Console shows | CLI shows | Meaning |
|---|---|---|---|
| `fix_input` | "Kiểm tra và sửa thông tin." | `sửa đầu vào rồi chạy lại` | Fix your code, config or input and try again |
| `rerun_plan` | "Tạo plan mới để kiểm tra lại." | `chạy lại plan` | The old plan is no longer valid; create a new one |
| `owner_review` | "Cần owner hoặc admin xem và quyết định." | `chủ workspace cần xem và duyệt` | An Owner or Admin needs to approve or upgrade the plan |
| `wait` | "Đang xử lý, vui lòng chờ." | `chờ rồi kiểm tra lại` | Wait a moment and try again |
| `contact_operator` | "Cần đội Embra kiểm tra trước khi tiếp tục." | `liên hệ người vận hành` | The Embra team needs to look. Email us as described in [When to contact us](#when-to-contact-us) |
| `none` | | `không cần làm gì thêm` | No error |

The **"Nội dung từ app — không do Embra viết"** block (content from your app, not written by Embra) under an error holds text taken from your app or repo: the tail of the build log, what your app returned to the health check, a Postgres error message, the DNS records Embra read. Embra does not write this block, but it is often where the real cause is.

## How to find a code

- Press `Ctrl+F` (`Cmd+F` on a Mac) and type the error code, for example `BUILD_FAILED`.
- Console only shows the Vietnamese sentence? Type its first few words. Each entry below lists the sentences you usually see.
- Each code has its own address: `docs.embra.cloud/en/loi/#<code in lowercase>`, for example `/en/loi/#healthcheck_failed`.

## When to contact us

Email **hello@embra.cloud** with:

1. The **operation ID** (`operation_id`): the `operation:` line in the CLI, or the text copied with **"Sao chép diagnostic ID"** in the console.
2. The **workspace**, project and environment (for example `shop/production`).
3. The **time** of the error, saying whether it is Vietnam time or UTC.
4. The error code and sentence, if you have them.

When an error needs the Embra team (`contact_operator`), the console shows a **"Liên hệ hỗ trợ"** (contact support) button that opens an email draft with the operation ID and error code filled in. The draft only holds identifiers, never secrets or your data.

## Build and deploy

### `BUILD_FAILED`

Embra could not build an image from your code. The running app is not affected.

**The sentence you see** starts in one of these forms. If it starts with `embra.toml:`, see [`REPO_CONFIG_INVALID`](#repo_config_invalid).

| Error sentence | Meaning |
|---|---|
| `buildctl lỗi: exit …` or `build trong VM không thành công.` | The build command (Dockerfile or Railpack) failed. The cause is in the build logs |
| `railpack prepare lỗi: exit …` | Railpack's repo analysis step failed. The reason is in the build logs |
| `git fetch lỗi: …`, `git checkout lỗi: …` | Embra could not fetch the commit from GitHub |
| `không thấy Dockerfile.` | `embra.toml` sets `builder = "dockerfile"` but there is no file at that path |
| `root không tồn tại.`, `root không phải thư mục.`, `root trỏ ra ngoài repo.` | `root` in `embra.toml`, or the **Thư mục gốc** (root folder), is wrong |
| `Image build ra vượt giới hạn dung lượng của gói.` | The image is larger than your plan's disk space |
| `… file migration không hợp lệ.`, `migration trùng tên.`, `quá 100 file migration.`, `migration … vượt … byte.` | Something is wrong in the migrations folder. See [Writing migrations](/en/huong-dan/database-va-migration/#writing-migrations) |
| `preview.seed không tồn tại.` | The file set in `[preview] seed` is not in the repo |
| `Upload của build này không còn tồn tại. Upload lại rồi build.` | The upload from `embra deploy` has expired |

**How to fix it:**

1. Click **"Xem build logs"** (view build logs) and read from the bottom up. The first error line from the build tool (npm, pip, go, docker) is usually the cause.
2. Run the same build command on your machine. If the repo has a `Dockerfile`, run `docker build .` at the repo root (or in `root`).
3. If the log has a line `egress từ chối "<host>"` (egress denied): the build needs a host that is not open yet. Email that host name to hello@embra.cloud. The open hosts are listed in [How Embra builds your app](/en/huong-dan/chuan-bi-app/#how-embra-builds-your-app).
4. If the image is too large, make it smaller (see the sample Dockerfile below):
   - Use a multi-stage Dockerfile and copy only the build output (for example `dist/`) into the last stage.
   - Install production dependencies only (`npm ci --omit=dev`).
   - Add a `.dockerignore` that drops `node_modules`, `.git` and test files.
5. If you set `builder = "dockerfile"` without a Dockerfile: remove the `builder` line so Embra picks Railpack, or fix `dockerfile` to the right path, relative to `root`.
6. Commit and push again.

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

**Is my data safe?** Yes. A failed build deploys nothing and does not touch the database.

**Should I retry?** Retrying the same commit usually gives the same error. The sentences `không khởi động được VM.`, `VM tắt trước khi sẵn sàng.` and `mất kết nối với embra-buildd giữa chừng build.` are on Embra's side: click **"Build lại"** (rebuild) once.

**When to contact us:** an Embra-side error repeats after a rebuild, or the build works on your machine but not on Embra and the log does not show why.

### `BUILD_TIMEOUT`

The build ran longer than allowed and was stopped. The sentence you see: `build vượt thời gian cho phép.`

The build time limit depends on your plan and is never more than 25 minutes. The running app is not affected.

**Common causes:**

- Installing dependencies without a lockfile, so the installer resolves the whole dependency tree again.
- Running tests, lint or large downloads inside the build.
- A Dockerfile step waits on a host that is not open until time runs out (the log shows `egress từ chối`).
- The Dockerfile copies all the code before installing dependencies, so every code change reinstalls from scratch.

**How to fix it:**

1. Open **"Xem build logs"**.
2. Find the step where the build stopped.
3. Commit your lockfile (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`…).
4. Move tests and lint to CI, out of the build.
5. In the Dockerfile, copy the dependency manifest and install first, then copy the code:

   ```dockerfile
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   ```

6. Push again.

**Is my data safe?** Yes. Nothing is deployed.

**When to contact us:** the build stops while downloading from a host that is open, or it takes under 25 minutes on your machine but still times out on Embra.

### `HEALTHCHECK_FAILED`

The new version started but did not answer the health check correctly, so Embra did not move traffic to it (or moved traffic back to the old version).

**The sentence you see** and the state of your app:

| Error sentence | App right now |
|---|---|
| `Bản mới không qua readiness trong thời gian khởi động. Bản cũ vẫn phục vụ.` | The old version keeps running. On a first deploy, nothing is running yet |
| `Bản mới lỗi sau khi nhận traffic, route đã được trả về bản cũ.` | The new version failed during the 30-second watch; traffic is back on the old version |
| `App không qua readiness sau khi chạy lại; app vẫn đang tạm dừng.` | You turned a paused app back on but it did not come up; the app stays off |
| `App không chạy được trên bản khôi phục (không qua readiness). …` | The restore was cancelled; the old app and database keep running |
| `Deploy đã xong nhưng app chưa trả lời kiểm tra sức khoẻ sau 2 phút. …` (CLI) | `embra deploy` waited 2 minutes and the app is not healthy yet. Check the app log |

Embra sends a `GET` to `health_path` every 2 seconds and needs **3 consecutive 2xx responses** within `startup_grace_seconds` (60 seconds by default). Details in [Health check](/en/huong-dan/chuan-bi-app/#health-check).

**Common causes:**

1. The app listens on `127.0.0.1` or `localhost`, so it cannot be reached from outside the container.
2. The app listens on a port other than `[deploy] port` (3000 by default), such as the framework's default port (8000, 8080, 5173).
3. `health_path` returns 3xx: a redirect to a login page, to HTTPS, or to add a trailing `/`. Redirects do not count as passing.
4. `health_path` returns 4xx: the path does not exist, needs login, or the framework blocks an unknown `Host` header. Embra calls the container's internal IP address directly, so `Host` is `IP:port`, not your domain.
5. The app crashes on startup: a missing secret, no database connection, or running migrations on startup (the app's database account cannot change the schema).
6. The app takes longer to start than `startup_grace_seconds`.

**How to fix it:**

1. Open **"Logs"** and read the app log around the time of the failed deploy. Startup crashes show up clearly here.
2. Read the **"Nội dung từ app — không do Embra viết"** block: it is what your app returned to the last health-check call.
3. Make the app listen on `0.0.0.0` on the port in the `PORT` variable. Embra sets `PORT` to `[deploy] port` unless you set a `PORT` secret yourself. Framework samples below.
4. Add a dedicated health-check path, for example `/healthz`, that returns 2xx without login and without redirecting. Set that path in `embra.toml`:

   ```toml
   [deploy]
   health_path = "/healthz"
   ```

5. If the app starts slowly, raise `startup_grace_seconds` (at most 300).
6. If the app runs migrations on startup (`prisma migrate deploy`, TypeORM `synchronize: true`…), remove that. Migrations go through Embra: see [Database and migrations](/en/huong-dan/database-va-migration/).
7. Push again.

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

With `output: 'standalone'` and `node server.js` in a Dockerfile, also set `HOSTNAME`:

```dockerfile
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
```

**Django** (gunicorn, in a Dockerfile):

```dockerfile
CMD gunicorn myproject.wsgi --bind 0.0.0.0:${PORT:-3000}
```

Django returns 400 when `Host` is not in `ALLOWED_HOSTS`, and may redirect to HTTPS when `SECURE_SSL_REDIRECT` is on. Give the health check its own middleware, placed **first** in `MIDDLEWARE`:

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

**Laravel** (in a Dockerfile):

```dockerfile
CMD php artisan serve --host=0.0.0.0 --port=${PORT:-3000}
```

:::caution[`$PORT` in array form]
`CMD ["node", "server.js"]` and `start = ["node", "dist/main.js"]` in `embra.toml` are array forms that do not go through a shell, so a `$PORT` written there is **not** replaced with its value. Read `PORT` in your code, or wrap the command in a shell: `CMD ["sh", "-c", "gunicorn myproject.wsgi --bind 0.0.0.0:$PORT"]`.
:::

**Is my data safe?** It depends on the case:

- **The new version did not pass the health check:** no real traffic reached it. But the new app did run its startup code with `DATABASE_URL`, so anything that code wrote (for example a seed on startup) stays.
- **The new version failed after receiving traffic:** it served real requests while being watched. Data written during that time stays in the database.
- **In every case:** if the plan had migrations, **migrations that ran stay applied**, and the old version is running on the new schema. Do not edit an applied migration to "undo" it, or Embra reports [`MIGRATION_HISTORY_CHANGED`](#migration_history_changed). To change the schema back, add a new migration file.

**Should I retry?** Not without changing something. The health check will fail the same way.

**When to contact us:** the app listens on `0.0.0.0:$PORT` and returns 2xx on `health_path` when you run it with Docker on your machine, but Embra still reports this error.

### `REPO_CONFIG_INVALID`

Your `embra.toml` has an error. The sentence always starts with `embra.toml:` and names the wrong field. When Embra finds this during a build, you see [`BUILD_FAILED`](#build_failed) with the same sentence.

**The sentence you see** (examples):

| Error sentence | How to fix it |
|---|---|
| `embra.toml: field lạ deploy.prot.` | Fix the field name (here, `port`). Embra does not ignore unknown fields |
| `embra.toml: field deploy.port sai kiểu giá trị.` | Fix the type: `port = 3000`, not `port = "3000"` |
| `embra.toml: sai cú pháp TOML ở dòng 12.` | Fix the syntax on that line (missing quote, missing `]`…) |
| `embra.toml: build.builder phải là "railpack" hoặc "dockerfile".` | Fix the value, or remove the line so Embra picks one |
| `embra.toml: deploy.startup_grace_seconds phải > 0.` | Use a number of seconds from 5 to 300 |
| `embra.toml: … phải là đường dẫn tương đối trong repo.`, `… không được trỏ ra ngoài repo.` | Write the path from the repo root (or from `root`), without a leading `/` and without `..` leaving the repo |
| `embra.toml: build.env.EMBRA_…: tiền tố EMBRA_ dành riêng cho Embra.` | Rename the variable |
| `embra.toml: cron.<tên>.schedule: …` | Use a 5-field cron schedule, in UTC, at least 5 minutes apart |
| `embra.toml: file vượt 65536 byte.` | Shorten the file to at most 64 KiB |

**How to fix it:**

1. Open `embra.toml` at the repo root.
2. Find the field or line the sentence names.
3. Compare it with the [`embra.toml` reference](/en/huong-dan/chuan-bi-app/#embratoml).
4. Check the syntax with a TOML reader on your machine (for example `python3 -c "import tomllib; tomllib.load(open('embra.toml','rb'))"`).
5. Commit and push again.

**Is my data safe?** Yes. Nothing is deployed.

### `SOURCE_NOT_CONNECTED`

Embra cannot read this environment's GitHub repo.

**The sentence you see:**

- `Environment chưa nối với repo GitHub. …`
- `Environment không còn nối với repo GitHub.`
- `GitHub installation đã bị gỡ hoặc tạm dừng.`
- `Không lấy được quyền đọc repo: installation đã bị gỡ, tạm dừng hoặc mất quyền truy cập repo.`
- `Không đọc được nhánh đã nối: repo, nhánh hoặc installation không còn truy cập được.`
- `Hãy đăng nhập bằng GitHub trước khi kết nối repo.`

**Common causes:**

- The Embra GitHub App was uninstalled or suspended on the GitHub account or organization.
- When installing the GitHub App you chose "Only select repositories" and this repo is not in the list (or was just removed).
- The repo was renamed, transferred or deleted. The linked branch was renamed or deleted.
- You signed in to Embra with Google. Only people signed in with GitHub can link a repo.

**How to fix it:**

1. Open **Cài đặt → "Source code"** (settings → source code).
2. Click **"Cài / cập nhật quyền GitHub App"** (install / update GitHub App permissions).
3. Grant access to this repo on GitHub again.
4. Check that the linked repo and branch names are still right. If the branch was renamed, link the new one.
5. Click **"Build lại"** (rebuild).

See also [Deploy from GitHub](/en/huong-dan/deploy-tu-github/#creating-the-app).

**Is my data safe?** Yes. The running app keeps running; Embra just cannot build a new version.

### `SECRET_REVOKED`

A secret the deploy needs was revoked, or has no valid value left.

The sentence you see, for example: `Một secret của release đã bị thu hồi sau khi plan. Đặt version mới rồi plan lại.` or `Secret <TÊN> chưa có version nào còn hiệu lực. …`

1. Open **Cài đặt → "Secrets"**.
2. Enter a new value for that secret and click **"Lưu secret"** (save secret).
3. Click **"Build lại"** (rebuild) to create a new plan. Secrets reach the app on the next build.

See [Secrets](/en/huong-dan/secret/). If you hit this while turning a paused app back on, the app stays off until you fix it.

### `ATTESTATION_MISMATCH`

The new container is running with a configuration different from what Embra asked for, so Embra did not move traffic to it. The old version keeps running. This is a safety check on Embra's side; you cannot fix it in code. Email hello@embra.cloud with the operation ID.

### `IMAGE_DIGEST_REQUIRED`

`embra deploy --image` needs an image pinned by digest. Write it as `<image>@sha256:<64 hex characters>`, not with a tag like `:latest`.

### `SOURCE_ARCHIVE_INVALID`

The source archive that `embra deploy` uploaded was rejected (not a valid `tar.gz`, or it contains a file type that is not allowed). Remove the unusual files from the folder, or add them to `.embraignore`, and run again.

### `SOURCE_TOO_LARGE`

The upload is over your plan's limit: the source from `embra deploy`, or a dump file when importing data (larger than your plan's database space). The sentence states the file size and the limit. Make the file smaller (add `.embraignore`, drop tables you do not need) or upgrade the plan.

## Database and migrations

Migration error sentences sometimes give the statement's "lớp" (class). Match it to the group names in [How Embra checks migrations](/en/huong-dan/database-va-migration/#how-embra-checks-migrations):

| Class | Group |
|---|---|
| A | Safe |
| B | Changes or deletes data |
| C | Long table lock |
| D | Cannot run in a transaction |
| E, F | Not supported (E: Embra cannot parse the statement; F: forbidden) |

### `MIGRATION_UNSUPPORTED`

A statement in a migration file is of a kind Embra cannot run yet, so the plan is refused before the database is touched.

**The sentence you see:**

- `File 0003_x.sql, câu lệnh #2 (CreateFunctionStmt) lớp E: …` or `… lớp F: …`
- `File 0003_x.sql: không đọc được SQL nên không thể chứng minh an toàn.`
- `File 0004_x.sql, câu lệnh #1 (IndexStmt) lớp D: … lệnh không chạy trong transaction (như CREATE INDEX CONCURRENTLY) phải ở file riêng, chỉ có đúng một câu lệnh`
- `SQL của migration đã thay đổi bảng nội bộ của Embra. Đã rollback; không được phép.`
- `Migration không hợp lệ để chạy trên production.`

When this follows a successful build, the console shows **"Build xong · cần sửa config"** (build done, fix config) and **"Không tạo được plan deploy"** (could not create a deploy plan).

**Common causes:**

- The file has a function, procedure, trigger, view, `DO` block, `CREATE EXTENSION`, `CREATE SCHEMA`, `GRANT`/`REVOKE` or `COPY`. Migrations generated by an ORM often include these.
- The file has `BEGIN`/`COMMIT`. Embra wraps each file in a transaction itself.
- `CREATE INDEX CONCURRENTLY` shares a file with other statements.
- The SQL was written for another database (MySQL, SQLite) or uses Postgres syntax Embra cannot parse.

**How to fix it:**

1. Open the file the sentence names and find the statement by its `#` number (counting from 1). The original statement is in the **"Nội dung từ app — không do Embra viết"** block.
2. Remove `BEGIN` and `COMMIT` if present.
3. Move `CREATE INDEX CONCURRENTLY` to its own file, with only that statement.
4. For functions, triggers, views and extensions: move that logic into your app code. Embra cannot run these statements yet.
5. Commit and push again. This file never ran, so you can edit it directly.

**Is my data safe?** Yes. Embra refuses at the planning step. Only `SQL của migration đã thay đổi bảng nội bộ của Embra.` happens while running, and Embra rolled that statement back.

### `MIGRATION_REHEARSAL_FAILED`

A migration failed. There are two cases:

| Error sentence | Where it failed |
|---|---|
| `Diễn tập migration thất bại trên bản sao dữ liệu; chưa đụng production. …` | On a copy of your data. Production was not touched |
| `Migration lỗi trên production dù đã diễn tập thành công: production khác bản sao. Câu lệnh lỗi đã rollback.` | On production. The failing statement was rolled back |

The Postgres message (for example `column "status" of relation "orders" contains null values`) is in the **"Nội dung từ app — không do Embra viết"** block, with the failing file and statement.

**Common causes:**

- Adding a `NOT NULL` column without a `DEFAULT` to a table that already has rows.
- Creating a `UNIQUE` constraint or foreign key that existing data violates (duplicates, references to missing rows).
- Changing a column type when old data cannot be converted (for example text to number).
- Referencing a table or column that does not exist yet, because of file order.
- A migration that works on an empty local database but fails with real data.

**How to fix it:**

1. Read the Postgres message and the failing file name.
2. Change the SQL so it works with the existing data. For example, add a required column in three steps:

   ```sql
   ALTER TABLE orders ADD COLUMN status text;
   UPDATE orders SET status = 'paid' WHERE status IS NULL;
   ALTER TABLE orders ALTER COLUMN status SET NOT NULL;
   ```

   Or shorter: `ALTER TABLE orders ADD COLUMN status text NOT NULL DEFAULT 'paid';`
3. The failing file was not applied, so you can edit that file directly. **Do not edit files applied** by earlier deploys.
4. Commit and push again. Embra rehearses again before running.

**Is my data safe?** Failed during rehearsal: production was not touched. Failed on production: the failing statement was rolled back and the old code keeps running. Each file runs in its own transaction, so if the plan had several files, the files before the failing one may already be applied. Embra records applied files and only runs the rest next time.

**When to contact us:** it failed on production and you cannot find what differs between production and the copy.

### `MIGRATION_LOCK_TIMEOUT`

The migration needs a lock on a table, but another query holds it too long. Embra retries many times with short waits so your app does not hang, then stops.

**The sentence you see:** `Không lấy được khoá bảng trong thời gian cho phép (có truy vấn dài đang giữ). Chưa áp file nào còn dở; code cũ vẫn phục vụ.`

**Common causes:**

- The app keeps transactions open for a long time, or has connections "idle in transaction" (a transaction opened and never committed).
- A long report or export query is running on that table.
- A cron job or worker is processing that table in bulk.

**How to fix it:**

1. Stop the long query: end the report job, or fix the code that opens a transaction without closing it.
2. Pick a time with little traffic.
3. Create a new plan: click **"Build lại"** (rebuild), or run `embra plan`.

**Is my data safe?** Yes. The file waiting for the lock did not run, and no file is half-applied. The old code keeps running. If the plan had several files, the earlier ones may already be applied; the next plan only runs the rest.

**Should I retry?** Yes, once the long query is done.

### `MIGRATION_DATA_LOSS`

This is not an error: the plan is waiting for approval, and the rehearsal shows the migration will **delete or overwrite data** (for example `DROP COLUMN`, `DROP TABLE`, `DELETE`). This applies to staging too.

**What to do:**

1. Click **"Xem và duyệt"** (review and approve).
2. Read what data will be lost: tables, columns and estimated row counts.
3. If you need that data, take it out first: **Cài đặt → "Dữ liệu" → "Export dữ liệu"** (settings → data → export data), or copy it to another table in a separate migration.
4. If you agree: type the environment name and `CONFIRM_MIGRATION`, then click **"Duyệt và deploy"** (approve and deploy).
5. If you do not agree: click **"Từ chối"** (reject), then fix the migration.

Only an Owner or Admin can approve. See [Approving production](/en/huong-dan/deploy-tu-github/#approving-production).

**Is my data safe?** Nothing runs until you approve. Once the migration is applied you cannot restore to a point before it yourself (see [`MIGRATION_AFTER_RESTORE_POINT`](#migration_after_restore_point)), so be sure before approving.

### `MIGRATION_HISTORY_CHANGED`

The migration files in the repo do not match what already ran on the environment.

| Error sentence | How to fix it |
|---|---|
| `File 0002_x.sql đã áp lên environment nhưng nội dung đã đổi. …` | Put the file back to the content that ran (for example `git checkout <commit cũ> -- migrations/0002_x.sql`). To change more, add a new file |
| `File đã áp lên environment bị thiếu trong plan: … Giữ nguyên mọi file đã áp.` | Bring back deleted or renamed files under their old names |
| `File mới 0003_x.sql nằm trước file đã áp 0005_y.sql. Đặt số lớn hơn 0005_y.sql.` | Rename the new file with a number above the last applied file |

**Common causes:**

- Editing a migration that already ran to "fix" it.
- Merging, deleting or renaming old migrations to tidy up.
- With Prisma, re-running the copy script after deleting or editing old Prisma migrations, which shifts the numbering. See [Writing migrations](/en/huong-dan/database-va-migration/#writing-migrations).
- Two branches both add a migration and the one merged later has the smaller number.

**Is my data safe?** Yes. Embra refuses at the planning step; nothing ran.

### `SCHEMA_DRIFT`

The production schema changed since the rehearsal, so the rehearsal evidence no longer holds and the plan was cancelled. No file was applied. Create a new plan (click **"Build lại"** (rebuild), or run `embra plan`) so Embra rehearses again.

### `POOL_IOPS_BUDGET_EXCEEDED`

The server has used up its disk-write budget, so Postgres could not be created. This is a limit on Embra's side. Email hello@embra.cloud with the operation ID.

## Domains

### `DOMAIN_NOT_VERIFIED`

Embra could not verify your domain yet. It needs **both** the right TXT record and the domain pointing at Embra.

**The sentence you see** names exactly what is missing, for example:

`Chưa xác minh được www.shop.vn: thiếu bản ghi TXT _embra-challenge.www.shop.vn = embra-verify=…; hostname chưa trỏ về Embra (cần CNAME tới …, hoặc A/AAAA tới IP của edge).`

The DNS values Embra read are in the **"Nội dung từ app — không do Embra viết"** block.

**Common causes:**

- DNS has not updated yet (usually 5–30 minutes).
- Cloudflare proxy is on (orange cloud). Embra then only sees Cloudflare's IPs.
- The TXT name got the domain appended twice: many providers add the domain automatically, so typing the full name gives `_embra-challenge.www.shop.vn.shop.vn`.
- A CNAME on the root name (`shop.vn`). The root name needs an A record.
- An old A or CNAME record still points elsewhere.

**How to fix it:**

1. Open **Cài đặt → "Domain"** to see the records Embra asks for.
2. At your DNS provider, create the TXT record exactly. If the "Name" field appends the domain, type only `_embra-challenge.www` (or `_embra-challenge` for a root name).
3. Create the CNAME to the app address. For a root name, create an A record to the IP Embra shows.
4. Delete old A or CNAME records with the same name.
5. If you use Cloudflare, switch these records to **DNS only** (grey cloud).
6. Wait a few minutes for DNS to update.
7. Click **"Kiểm tra"** (check). Each domain can be checked at most once every 30 seconds.

See [Custom domains](/en/huong-dan/domain-rieng/).

**Is my data safe?** Yes. The app keeps running at its `.onembra.com` address.

### `DOMAIN_TAKEN`

This domain is already verified on another environment on Embra. A domain name can only be attached to one app.

**The sentence you see:** `Hostname này đã được xác minh ở một environment khác.`

**How to fix it:**

**Common causes:**

- The domain is still attached to an old app, to staging, or to another workspace of yours (for example a trial workspace).
- Someone else verified this domain earlier.

**How to fix it:**

1. If the domain is on another app of yours: open **Cài đặt → "Domain"** in that app.
2. Click **"Xoá"** (remove) on that domain.
3. Go back to the new app and add the domain again.

If you have not attached this domain anywhere, email hello@embra.cloud with the domain name. Embra does not reveal which workspace holds the domain.

**Is my data safe?** Yes. The app keeps running at its `.onembra.com` address. Retrying does not help until the domain is removed from the other place.

## Account and plans

### `QUOTA_EXCEEDED`

What you tried goes over a limit of your plan, or of the server. The sentence says which limit, usually with numbers.

| Error sentence (examples) | What to do |
|---|---|
| `Gói dùng thử chỉ có một environment …`, `Gói dùng thử cho tối đa …` | Upgrade, or delete what you do not use. See [The trial](/en/huong-dan/tai-khoan-va-goi/#the-trial) |
| `Hồ tài nguyên app của gói là … không đủ cho release này …`, `Tổng cỡ app sẽ là … vượt hồ tài nguyên …` | Shrink other apps in **Cài đặt → "Tài nguyên"** (settings → resources), or upgrade |
| `Gói … có tối đa … database cho app production …` | Delete unused databases, or upgrade. Staging and preview do not count |
| `Workspace đã dùng hết số domain riêng của gói …` | Remove unused domains, or upgrade |
| `Gói … không có staging. …`, `Mỗi project có tối đa một staging. …` | Upgrade, or delete the old staging |
| `Gói … cho tối đa … preview environment …` | Close some pull requests, or wait for old previews to be removed |
| `Gói … không có object storage.`, `Environment đã có bucket; …` | See [Storing files](/en/huong-dan/luu-file/) |
| After a successful build, the console shows **"Không tạo được plan deploy"** because of workers or cron | Remove some `[processes.*]` or `[cron.*]` from `embra.toml` to fit the plan, or upgrade, then push again |
| `Gói hiện tại giữ … ngày lịch sử log …`, `… ngày lịch sử metrics …` | Pick a more recent time range |
| `Workspace đang mở … luồng log, tối đa cho phép. …` | Close some tabs that are showing logs |
| `Verify quá dày. …` | Each domain can be checked once every 30 seconds, and each workspace has an hourly limit. Wait, then click **"Kiểm tra"** (check) again |
| `Node hết dải mạng …`, `Hết dải mạng để cấp cho preview mới.`, `Không đủ chỗ chạy hai database song song để khôi phục …` | A server limit, not a plan limit. Email hello@embra.cloud |
| `Máy chủ chưa đủ ngân sách ghi đĩa để chạy thêm database cũ nên không rollback được. …` | The current app and database keep running normally. Email hello@embra.cloud if you need the rollback urgently |

**Upgrading:** only the Owner can, in a browser, from the account menu → **"Thanh toán"** (billing). See [Account, trial and payment](/en/huong-dan/tai-khoan-va-goi/).

**Is my data safe?** Yes. Embra refuses before doing anything; nothing changes.

### `TRIAL_EXPIRED`

The 7-day trial has ended. The console shows **"Dùng thử đã hết hạn"** (trial expired).

**The sentence you see:** `Gói dùng thử đã hết hạn: mọi request tới workspace này bị từ chối và dữ liệu sắp bị xoá. Dữ liệu cần lấy phải export trước hạn.`

- Every action is refused, including viewing.
- After that the whole workspace is deleted: apps, databases and backups.

**What to do:**

1. If you need to keep the app or data, email hello@embra.cloud **right away** with the workspace name. The console shows a **"Liên hệ hỗ trợ"** (contact support) button on this screen.
2. For any other trial workspace, choose a plan and pay before the trial ends. See [The trial](/en/huong-dan/tai-khoan-va-goi/#the-trial).

**Should I retry?** No. Every request to this workspace is refused.

### `SIGNUP_CLOSED`

Embra is not letting this account in yet. The console shows **"Chưa vào được Embra"** (cannot get into Embra yet).

| Error sentence | What to do |
|---|---|
| `Email Google này chưa được mời vào workspace nào. …` | Google sign-in is only for invited people. Ask an Owner to invite that exact email, or sign in with GitHub |
| `Tài khoản GitHub phải được tạo ít nhất … ngày trước mới đăng ký dùng thử được.` | Email your GitHub username to hello@embra.cloud to have that account let in |
| `Đợt dùng thử hôm nay đã đầy. …` | Try again tomorrow, or email hello@embra.cloud for an invitation |
| `Đăng ký dùng thử đang đóng. …` | Email hello@embra.cloud for an invitation |

See [Signing in](/en/huong-dan/tai-khoan-va-goi/#signing-in).

**Should I retry?** Only when today's trial slots are full: try again tomorrow. The other cases need an invitation or an email to the Embra team first. No workspace was created, so no data is affected.

### `WORKSPACE_SUSPENDED`

The Embra team suspended the workspace, usually after an abuse report.

**The sentence you see:** `Workspace đang bị tạm ngưng: chỉ đọc được, mọi thao tác ghi bị từ chối. Dữ liệu được giữ nguyên. Liên hệ abuse@embra.cloud để khiếu nại.`

- Apps stop receiving traffic. Data is kept as is.
- You can still view things, but cannot deploy, change config or change plans.

**What to do:**

1. Email **abuse@embra.cloud** with the workspace name.
2. Explain what the app does and why you think the suspension is a mistake.

**Should I retry?** No. Every write is refused until the Embra team lifts the suspension.

### `ENVIRONMENT_SUSPENDED`

Like [`WORKSPACE_SUSPENDED`](#workspace_suspended), but only one environment is suspended. Its app stops receiving traffic; data is kept. Appeal through **abuse@embra.cloud**.

## Permissions and approval

### `APPROVAL_REQUIRED`

This is not an error: the plan is waiting for an Owner or Admin to approve it. Production **always** needs approval, even without migrations. Staging and previews need approval when a migration changes or deletes data.

**What to do:**

1. Open the overview page as an Owner or Admin.
2. Click **"Xem và duyệt"** (review and approve).
3. Review the changes to code, config and data.
4. Type the environment name to confirm.
5. Click **"Duyệt và deploy"** (approve and deploy).

Developers and AI agents can create plans but cannot approve them. A pending plan expires after 24 hours. Approving needs a real person who signed in recently: see [Actions that need a real person](/en/workspace/phan-quyen/#actions-that-need-a-real-person).

**Is my data safe?** Yes. Nothing runs until it is approved. The running app keeps running.

### `APPROVAL_EXPIRED`

Something waiting for approval went past its deadline and was cancelled. Nothing was applied.

| Error sentence | What to do |
|---|---|
| `Plan đã hết hạn duyệt nên bị huỷ. …` | Create a new plan: click **"Build lại"** (rebuild), or run `embra plan` |
| `Bằng chứng diễn tập migration đã hết hạn nên plan bị huỷ. …` | Create a new plan. A rehearsal result is only valid for 24 hours |
| `Lần nhập dữ liệu đã hết hạn duyệt nên bị huỷ; database không đổi và file đã bị xoá. …` | Upload the file again to import it |
| `Restore đã hết hạn duyệt nên bị huỷ …` | Create the restore again from **"Khôi phục dữ liệu…"** (restore data) |
| `Request fork đã quá hạn duyệt …` | Request the fork again |

**Is my data safe?** Yes. The cancelled item never touched the running app or database. The old plan cannot be approved again: create a new one.

### `GENERATION_CONFLICT`

The environment changed since the plan was made (for example another deploy or rollback finished), so the old plan was cancelled to avoid approving the wrong thing. Create a new plan.

### `BINDING_MISMATCH`

You approved a different version of the plan from the one waiting (usually because the page was stale). Reload the page, review the plan and approve again.

### `FORBIDDEN_SCOPE`

Your role or token does not allow this. Ask an Owner or Admin, or get a higher role. See [Members and roles](/en/workspace/phan-quyen/).

### `HUMAN_REQUIRED`

This needs a real person, and you are using a machine token (CI, agent). Do it in the browser, or run `embra login` and try again. See [Actions that need a real person](/en/workspace/phan-quyen/#actions-that-need-a-real-person).

### `REAUTH_REQUIRED`

Your sign-in is more than 12 hours old, and this action needs a fresh one. In the console, click **"Đăng nhập lại bằng GitHub"** (sign in again with GitHub) or **"Đăng nhập lại bằng Google"** right under the error. In the CLI, run `embra login` again.

### `LAST_OWNER`

This change would leave the workspace (or agency account) without an owner. Make someone else an owner first, then try again.

### `UNAUTHENTICATED`

The token is missing, wrong or expired. Sign in to the console again, run `embra login`, or use a valid token.

### `CSRF_FAILED`

The browser sent a request without a valid protection token, usually because the tab was open too long or opened from another site. Reload the page and try again.

### `DEVICE_ACCESS_DENIED`

You clicked deny when approving the CLI sign-in. Run `embra login` again if it is your machine.

### `DEVICE_CODE_EXPIRED`

The CLI sign-in code expired before you approved it in the browser. Run `embra login` again to get a new code.

## Rollback and restore

### `ROLLBACK_INCOMPATIBLE`

You cannot roll back to the chosen version, because migrations ran after it. A rollback only brings back code, not the schema: old code may not work on the new schema.

**The sentence you see:**

- `Đã có N file migration áp lên environment sau release …. Rollback chỉ trả code, không tua dữ liệu: …`
- `Đã có N migration áp lên database hiện tại sau lúc chuyển; database cũ không có chúng nên không rollback được.`

The list of migrations is in the **"Nội dung từ app — không do Embra viết"** block.

**What to do:**

1. Fix the problem with a new commit that works with the current schema, and deploy as usual.
2. If you really need the old schema, write a new migration that changes it back.
3. If you need the data from before that migration, email hello@embra.cloud with the operation ID.

**Is my data safe?** Yes. Embra refuses before doing anything.

### `ROLLBACK_DB_GONE`

The rollback target uses an old database (from before a restore), but that database was deleted when its retention period ended. The old data only exists in an export you took earlier. See [Backups and restore](/en/huong-dan/database-va-migration/#backups-and-restore).

### `RESTORE_POINT_UNAVAILABLE`

The restore point you chose cannot be used: there is no usable backup yet, or the point is outside the restorable range. The sentence gives the valid range. Open **"Xem mốc khôi phục"** (view restore points) and pick a point inside it.

### `MIGRATION_AFTER_RESTORE_POINT`

A migration ran after the point you chose. Restoring to that point would remove table structure the current app needs, so Embra blocks it. The running database and app are not touched. Pick a point after the migration the sentence names. If you need data from before it, email hello@embra.cloud.

### `RESTORE_SHORT`

The backup is missing data (WAL) before the chosen point, so the restore cannot reach that exact point. Production was not touched. Email hello@embra.cloud with the operation ID and the point you chose.

### `BACKUP_WAL_GAP`

The last automatic test restore found a gap in the backup. The console shows **"Lần restore thử gần nhất thiếu dữ liệu — vùng khôi phục cần kiểm tra lại."** (the last test restore was missing data; the restorable range needs checking). The running app and database are not affected, but do not rely on the restorable range until the Embra team checks it. Email hello@embra.cloud.

## When Embra stops to check

The three codes below share one rule: when Embra is **not sure** whether a step finished, it **stops on purpose** instead of retrying. Retrying something with an unknown outcome, such as running a migration twice or switching databases without knowing their state, can damage data. The Embra team checks the real state before reopening the environment.

### `RECOVERY_REQUIRED`

An operation on the environment (deploy, rollback, restore, turning the app on or off, writing a backup marker…) ended without Embra knowing the outcome, for example because the connection to the server dropped midway. The console shows **"Cần đội Embra hỗ trợ"** (needs Embra team support), and the overview shows **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"** (the Embra team needs to check before you deploy again).

**State right now:**

- Embra keeps traffic as it was at the time of the incident and does not change it. Depending on when it happened, the app may be running normally, running the new version, or stopped (for example during a switch to a restored database).
- The environment is blocked: deploys, builds on push, rollback, restore, turning the app on or off, domain changes and data imports are refused with [`ENVIRONMENT_BLOCKED`](#environment_blocked).
- Cron jobs do not run. Scheduled backups are paused.

**You should NOT:**

- **Delete the environment.** Deleting is still allowed, but it also deletes the database and backups the Embra team needs to check and recover.
- Run SQL yourself to "fix" the schema or data. Manual changes make checking harder.
- Keep pushing or revoke secrets to "unblock" it. That has no effect.

**You should:**

1. Click **"Liên hệ hỗ trợ"** (contact support) in the console, or email hello@embra.cloud with the operation ID, workspace, environment and time.
2. Note what you did just before the error appeared.
3. If the app is failing for your users, say so in the email so the team can prioritize.

### `MIGRATION_UNKNOWN`

Embra lost contact while running a migration on production, so it does not know whether the migration was applied. The console shows **"Cần xác minh dữ liệu"** (data needs verifying).

**State right now:**

- **The old code keeps running.** The new app has not started, because Embra only starts the new app after migrations finish.
- The schema may be the old one or the new one. Each migration file runs in its own transaction, so a file is either fully applied or not applied at all (except a `CREATE INDEX CONCURRENTLY` file, which does not run in a transaction).
- Embra took a database snapshot right before running the migration.
- The environment is blocked as with [`RECOVERY_REQUIRED`](#recovery_required).

**You should NOT:**

- Delete the environment or the database.
- Edit, rename or delete the pending migration files, or add a new migration to "run it again".
- Re-run the migration statements by hand.

**You should:** email hello@embra.cloud with the operation ID, workspace, environment and time. The Embra team checks the real schema, records the right outcome and reopens the environment.

### `ENVIRONMENT_BLOCKED`

The environment is blocked after an incident with an unknown outcome ([`RECOVERY_REQUIRED`](#recovery_required) or [`MIGRATION_UNKNOWN`](#migration_unknown)). Every change is refused until the Embra team has checked. The overview shows **"Đội Embra cần kiểm tra trước khi bạn deploy tiếp"**, and the service shows **"Chờ đội Embra kiểm tra"** (waiting for the Embra team to check).

**The sentence you see:** `Environment đang bị chặn sau một sự cố chưa rõ kết quả. Liên hệ đội Embra (hello@embra.cloud).`

**Should I retry?** No. Retrying is refused the same way until the environment is reopened.

**Do NOT** delete the environment. Email hello@embra.cloud with the operation ID of the first failed operation (the one marked **"Cần đội Embra hỗ trợ"** or **"Cần xác minh dữ liệu"** under **"Lần deploy"** (deploys)), the workspace, environment and time.

The sentence `Database không ở trạng thái sẵn sàng (…). Liên hệ đội Embra (hello@embra.cloud).` uses this code too: the environment's database is in a failed state. Handle it the same way.

## Other

### `OPERATION_IN_PROGRESS`

The environment has another operation still running (build, deploy, database creation, restore…), or it is being deleted. Wait for it to finish and try again. Follow its progress under **"Lần deploy"** (deploys).

### `INVALID_INPUT`

Something you entered is not valid: a name in the wrong format, a value out of range, a missing field. The sentence usually names the field. Fix it and try again.

Some common sentences:

- "Environment đang tạm dừng. Chạy `embra env resume` trước khi deploy.": turn the app back on first, then deploy.
- "Database đang dừng. Chạy `embra db start` trước khi fork.": start the database first.
- `Tối đa 100 file migration mỗi plan …`, `Tổng dung lượng migration vượt 2 MiB.`: split it up; each file is at most 256 KiB.

### `NOT_FOUND`

What you asked for (project, environment, domain, token…) was not found. It may have been deleted, or it belongs to another workspace. Check the name or ID, and check you are in the right workspace.

### `IDEMPOTENCY_CONFLICT`

A repeated request used the same deduplication key (`Idempotency-Key`) with different content, or the request already ran and its secret value cannot be returned again. Send a new request with a new key.

### `FORK_SECRET_IS_PROD`

The value you set for a fork is the same as a production secret. Forks may not use real keys. Create a test or sandbox key at the provider (payments, email…) and set that instead.

### `RATE_LIMITED`

You sent too many requests in a short time. Wait a few seconds and try again. This error is safe to retry.

### `TEMPORARILY_UNAVAILABLE`

Part of Embra is not responding for the moment. Nothing changed. Wait a while and try again. This error is safe to retry. If it lasts, email hello@embra.cloud.

### `INTERNAL`

An error on Embra's side. Try once more. If it still fails, email hello@embra.cloud with the operation ID and time.

## CLI exit codes

Use exit codes so CI scripts know what to do:

| Exit code | Meaning |
|---|---|
| `0` | Done |
| `1` | Sign-in error, not found, or an error on Embra's side |
| `2` | Invalid input (`INVALID_INPUT`, `REPO_CONFIG_INVALID`, `SOURCE_ARCHIVE_INVALID`) |
| `10` | The action was refused or failed (most error codes) |
| `20` | Waiting for approval (`APPROVAL_REQUIRED`, `MIGRATION_DATA_LOSS`) |
| `30` | Needs the Embra team (`RECOVERY_REQUIRED`, `MIGRATION_UNKNOWN`, `ENVIRONMENT_BLOCKED`, suspensions) |
| `75` | Temporary, try again later (`RATE_LIMITED`, `TEMPORARILY_UNAVAILABLE`) |
