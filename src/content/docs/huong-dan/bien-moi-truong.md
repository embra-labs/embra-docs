---
title: Biến môi trường
description: Đặt biến môi trường cho app, dán file .env, biến Embra tự đặt, biến lúc build, và khi nào app nhận giá trị mới.
sidebar:
  order: 10
---

Trang này dành cho người cấu hình app (Owner, Admin, Developer). Bạn biết đặt biến môi trường (env var) ở đâu, biến nào Embra tự đặt, và khi nào app nhận giá trị mới.

## Đặt biến cho app ở đâu

Mọi biến app đọc lúc chạy đều đặt ở **Cài đặt → Secrets** của environment, kể cả giá trị không bí mật như `TZ` hay URL công khai. Mỗi secret vào app thành một biến cùng tên.

| Muốn đặt | Ở đâu | App thấy lúc chạy? |
|---|---|---|
| Biến app đọc lúc chạy (khoá API, `TZ`, URL…) | **Cài đặt → Secrets** | Có |
| Biến cần lúc build (ví dụ `VITE_*`, `NEXT_PUBLIC_*`) | `[build] env` trong `embra.toml` | Không |
| `DATABASE_URL`, `PORT`, `S3_*` | Embra tự đặt | Có |

`embra.toml` **không** có `[deploy] env`. Trường lạ trong `embra.toml` làm build lỗi ([`REPO_CONFIG_INVALID`](/loi/#repo_config_invalid)).

Cách đặt từng secret, đổi và thu hồi: xem [Secret](/huong-dan/secret/).

## Dán cả file .env

1. Mở **Cài đặt → Secrets** của environment.
2. Bấm **"Dán .env"**.
3. Dán nội dung vào ô **Nội dung .env**, hoặc chọn file ở **"Hoặc chọn file .env"**.
4. Xem bảng: mỗi dòng có trạng thái **Mới**, **Đổi giá trị**, **Giữ nguyên** hoặc **Bỏ qua**. Bỏ chọn dòng không muốn lưu.
5. Bấm **"Lưu … secret"**.
6. Bấm **"Build lại"** (nếu có) để app nhận giá trị mới.

File được đọc ngay trong trình duyệt. Chỉ những dòng bạn chọn được gửi lên.

Cách console đọc file:

- Hiểu `#` chú thích, tiền tố `export `, giá trị trong nháy đơn hoặc nháy kép, giá trị nhiều dòng trong nháy.
- Không thay `${BIEN_KHAC}` bằng giá trị biến khác: chuỗi được lưu nguyên văn.
- Một tên xuất hiện hai lần thì dùng dòng sau.
- Dòng bị bỏ qua: giá trị rỗng, tên sai quy tắc, `DATABASE_URL`, tên bắt đầu bằng `EMBRA_`, và `S3_*` khi environment có bucket của Embra.
- Dòng `PORT` để bỏ chọn sẵn, vì Embra đã đặt `PORT` theo `embra.toml`.

## "Còn thiếu … biến"

Nếu repo có `.env.example` (hoặc `.env.sample`), Embra đọc **tên** biến trong đó ở mỗi lần build. Trang Secrets hiện **"Còn thiếu … biến"** cho những tên chưa có secret. Bấm **"Thêm"** cạnh từng tên để đặt.

- Embra tìm file ở thư mục gốc của app. Không có thì tìm ở các thư mục con cấp một (ví dụ `backend/.env.example`).
- Chỉ đọc tên, không đọc giá trị. File `.env` thật không bao giờ được đọc.
- Danh sách lấy từ lần build thành công gần nhất. Không tính các biến Embra tự đặt.
- File quá 64 KiB thì bị bỏ qua. Tối đa 200 tên.

## Biến Embra tự đặt

| Biến | Khi nào | Giá trị |
|---|---|---|
| `PORT` | Luôn, trừ khi bạn tự đặt secret `PORT` | `[deploy] port` trong `embra.toml`, mặc định `3000` |
| `DATABASE_URL` | Có `database = true` | Chuỗi kết nối Postgres của environment. Xem [Database và migration](/huong-dan/database-va-migration/) |
| `S3_ENDPOINT`, `S3_PUBLIC_ENDPOINT`, `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | Environment có bucket của Embra | Xem [Lưu file](/huong-dan/luu-file/) |
| `EMBRA_GIT_SHA` | Bản build từ một commit GitHub | Mã commit đầy đủ, 40 ký tự. Không có khi build từ thư mục upload (`embra up`) |

Embra **không** đặt `TZ`: container chạy giờ UTC. Muốn giờ Việt Nam, đặt secret `TZ` = `Asia/Ho_Chi_Minh`.

Thứ tự khi trùng tên: secret ghi đè biến cũ; `DATABASE_URL` và `S3_*` của Embra ghi đè secret. Riêng `PORT`: secret của bạn thắng.

:::caution[Đặt secret `PORT` khác `[deploy] port` làm deploy lỗi]
Embra kiểm tra app trên cổng ở `[deploy] port`. Nếu secret `PORT` bắt app nghe cổng khác, health check không đạt và deploy dừng với [`HEALTHCHECK_FAILED`](/loi/#healthcheck_failed). Muốn đổi cổng thì sửa `[deploy] port`.
:::

## Tên dành cho Embra

- `DATABASE_URL` và mọi tên bắt đầu bằng `EMBRA_` không đặt được làm secret. Console báo `… dành cho Embra. Chọn tên khác.`
- `[build] env` không nhận tên bắt đầu bằng `EMBRA_`.
- Tên chỉ gồm chữ in hoa, số và dấu gạch dưới, bắt đầu bằng chữ in hoa, tối đa 64 ký tự (`^[A-Z][A-Z0-9_]{0,63}$`).

## Biến lúc build

```toml
[build]
env = { VITE_API_URL = "https://api.cuahang.vn", NEXT_PUBLIC_SHOP = "Cửa hàng" }
```

- Chỉ có lúc build, không vào app lúc chạy. **Không đặt giá trị bí mật ở đây**: file nằm trong repo.
- Repo có `Dockerfile`: mỗi biến được truyền dưới dạng build arg. Khai `ARG` trong Dockerfile trước khi dùng:

  ```dockerfile
  ARG VITE_API_URL
  RUN npm run build
  ```

- Repo không có `Dockerfile` (Railpack): biến có sẵn trong lúc build, không cần khai.
- Build **không** nhận secret.

## Mỗi environment một bộ biến

Secret đặt ở production **không** có ở staging hay preview, và ngược lại. Mỗi environment phải đặt riêng. Preview theo PR không mang theo secret của production. `[build] env` thì giống nhau ở mọi environment vì nằm trong repo.

Xem [Staging, production và duyệt](/huong-dan/staging-production-va-duyet/).

## Khi nào app nhận giá trị mới

- Lưu secret **không** khởi động lại app. Giá trị mới vào app ở **lần build và deploy kế tiếp**: push code, hoặc bấm **"Deploy"** / **"Build lại"** ở trang Tổng quan.
- Plan cho người duyệt thấy **Thêm secret**, **Bỏ secret**, **Đổi secret** (không hiện giá trị).
- Production vẫn chờ Owner hoặc Admin duyệt như mọi lần deploy.

## Giới hạn

| Giới hạn | Mức | Vượt thì sao |
|---|---|---|
| Mỗi giá trị secret | 64 KiB | Không lưu được: `Giá trị secret tối đa 64 KiB.` |
| Mỗi lần "Dán .env" | 100 secret, tổng 1 MiB | Nút lưu bị khoá. Bỏ chọn bớt rồi lưu phần còn lại sau |
| File chọn ở "Dán .env" | 2 MiB | Console không đọc file |
| Mỗi giá trị `[build] env` | 4 KiB | Build lỗi, câu lỗi nêu tên biến. Xem [`REPO_CONFIG_INVALID`](/loi/#repo_config_invalid) |
| Tổng `[build] env` (tên + giá trị) | 16 KiB | Build lỗi |

Lưu nhiều secret một lần là tất cả hoặc không: một dòng lỗi thì không dòng nào được lưu.

## Bằng CLI

CLI có `embra secret set <TEN>` (đọc giá trị từ stdin) và `embra secret list` (chỉ hiện tên). `embra deploy` cho image có sẵn đọc trường `env` trong `embra.json` (mỗi giá trị tối đa 4 KiB, tổng 64 KiB); biến này được giữ ở các lần build sau từ GitHub, secret cùng tên thắng.

Đăng nhập CLI cho khách **chưa được bật**, nên hiện tại dùng console. Xem [Lệnh CLI](/cli/lenh/).

## Xem thêm

- [Secret](/huong-dan/secret/)
- [Chuẩn bị app](/huong-dan/chuan-bi-app/)
- [Lưu file (bucket S3)](/huong-dan/luu-file/)
- [Staging, production và duyệt](/huong-dan/staging-production-va-duyet/)
