---
title: Xem log và theo dõi app
description: Log build, log app trực tiếp và lịch sử, trạng thái app, health check, metrics và lịch sử deploy trên console.
sidebar:
  order: 12
---

Trang này dành cho người cần biết app đang chạy ra sao, hoặc vì sao build và deploy lỗi. Bạn sẽ biết tìm log ở đâu, đọc các nhãn trạng thái trên console thế nào, và dữ liệu được giữ bao lâu.

## Mọi thứ nằm ở đâu?

| Cần xem | Chỗ trên console |
|---|---|
| App có đang ổn không | Dải trạng thái đầu trang environment |
| Log build | **"Logs"** → **"Build"** |
| Log app | **"Logs"** → **"Runtime"** |
| CPU, RAM, request, lỗi 5xx | **"Logs"** → **"Số liệu"** |
| Các lần deploy, rollback, khôi phục | **"Lần deploy"** |
| Ai đã làm gì | Khung **"Hoạt động"** ở trang Tổng quan |

Mọi vai trò trong workspace, kể cả Viewer, đều xem được log và metrics.

## Đọc trạng thái app

Dải đầu trang environment tóm tắt bằng một nhãn, rồi ba mục riêng: **Health check**, **Traffic** và **Backup**. Console tải lại mỗi 5 giây, và chỉ nói **"Mọi thứ ổn"** khi cả ba đều đã xác nhận.

| Nhãn | Nghĩa |
|---|---|
| **"Mọi thứ ổn"** | Health check đạt, bản mới nhất nhận toàn bộ traffic, backup đã khôi phục thử thành công (nếu có database) |
| **"Đang chạy"** | Health check đạt, nhưng còn mục chưa xác nhận, ví dụ backup chưa khôi phục thử lần nào |
| **"Cần bạn xem"** | Đang chuyển traffic sang bản mới, hoặc lần khôi phục thử backup gần nhất lỗi |
| **"Có sự cố"** | App không qua health check, thao tác gần nhất lỗi, hoặc environment bị chặn |
| **"Chưa xác nhận"** | Chưa lấy được trạng thái mới, hoặc chưa có kết quả health check |
| **"Chưa deploy"** | Environment chưa có bản deploy nào |

Bảng **"Những gì đang chạy"** ở trang Tổng quan ghi trạng thái từng service:

| Service hiện | Nghĩa |
|---|---|
| **"Khoẻ"** | `health_path` trả mã 2xx |
| **"Không qua health check"** | `health_path` trả mã lỗi hoặc không nhận kết nối |
| **"Chưa có kết quả health check"** | Chưa hỏi được máy chủ |
| **"Chưa kiểm tra được worker"** | Worker chưa có health check riêng |
| **"Chờ đội Embra kiểm tra"** | Environment bị chặn sau sự cố, xem [`ENVIRONMENT_BLOCKED`](/loi/#environment_blocked) |

Cách đặt `health_path` và điều kiện đạt khi deploy: xem [Chuẩn bị app](/huong-dan/chuan-bi-app/#health-check).

## Xem log build

1. Mở **"Logs"** → **"Build"**.
2. Chọn lần build ở ô **"Bản build"** (mặc định là lần mới nhất).
3. Đọc log. Build đang chạy thì log hiện dần.

Build lỗi thì tra mã lỗi ở [Mã lỗi và cách sửa](/loi/). Log build được giữ 30 ngày sau khi build kết thúc.

## Xem log app trực tiếp

1. Mở **"Logs"** → **"Runtime"**.
2. Chọn service ở ô **"Service"** (`web` hoặc tên worker).
3. Chọn **"Trực tiếp"**. Dòng mới hiện ngay khi app in ra.

- Dòng **APP** do app ghi, dòng **EMBRA** là thông báo của nền tảng.
- Lọc theo chuỗi, nguồn, mức log hoặc thời gian. Bấm **"Tạm dừng cuộn"** để đọc, **"Theo dòng mới nhất"** để chạy tiếp.
- Trình duyệt giữ tối đa 5.000 dòng. **"Sao chép"** và **"Tải .txt"** lấy các dòng đang hiển thị.
- Chỉ xem được bản đang chạy. Log của bản cũ nằm ở chế độ **"Lịch sử"**.
- Mỗi workspace mở tối đa 5 luồng log cùng lúc. Mở thêm thì báo [`QUOTA_EXCEEDED`](/loi/#quota_exceeded); đóng bớt tab.

App chưa chạy thì tab hiện **"Chưa có log của app"**. Bấm **"Xem build log"** để xem bước chuẩn bị.

### Giờ trong log

Container chạy giờ UTC, nên giờ app tự in ra là giờ UTC. Muốn app in giờ Việt Nam, đặt secret `TZ` = `Asia/Ho_Chi_Minh`. Giờ console ghi cạnh mỗi dòng là lúc Embra đọc dòng đó, không phải lúc app ghi.

## Tìm trong lịch sử log

Nếu thấy `Máy chủ này chưa bật lịch sử log` ([`TEMPORARILY_UNAVAILABLE`](/loi/#temporarily_unavailable)), lịch sử log chưa bật trên máy chủ của bạn. Dùng chế độ **"Trực tiếp"**.

1. Ở **"Logs"** → **"Runtime"**, chọn **"Lịch sử"**.
2. Nhập chuỗi cần tìm (tìm đúng chuỗi, không phải regex).
3. Chọn khoảng thời gian, từ **"30 phút qua"** tới **"30 ngày qua"**, rồi bấm **"Tìm"**.

- Lịch sử gồm log của các bản đã chạy trước, và dòng request ở edge (chọn nguồn **"Request (edge)"**).
- Mỗi lần tìm trả tối đa 500 dòng mới nhất. Còn dòng cũ hơn thì thu hẹp khoảng thời gian hoặc thêm chuỗi tìm.
- Số ngày giữ tuỳ gói, tối đa 30 ngày; console ghi số ngày của gói bạn. Chọn khoảng dài hơn thì báo [`QUOTA_EXCEEDED`](/loi/#quota_exceeded).

## Xem metrics

1. Mở **"Logs"** → **"Số liệu"**.
2. Ở **"Xem cho"**, chọn **"Toàn environment (HTTP)"**, một service, hoặc Postgres.
3. Chọn khoảng thời gian: 1 giờ, 6 giờ, 24 giờ, 7, 14 hoặc 30 ngày.

| Biểu đồ | Đo gì |
|---|---|
| Request mỗi giây, Tỉ lệ lỗi 5xx, Độ trễ p95 | Request đi qua edge, cho toàn environment |
| CPU (core), Bộ nhớ | Từng service, kèm giới hạn của service |
| Dung lượng Postgres đã dùng | Database của environment |

Biểu đồ có mốc deploy, rollback, khôi phục, migration, và ghi số lần app khởi động lại hoặc hết bộ nhớ (OOM). Số ngày giữ metrics tuỳ gói, tối đa 30 ngày.

## Xem lịch sử deploy

Mở **"Lần deploy"**. Danh sách gồm build, deploy, rollback và khôi phục dữ liệu, lấy từ 100 thao tác gần nhất. Lọc bằng **"Tất cả"**, **"Deploy"**, **"Lỗi"**, **"Chờ duyệt"**. Bấm một dòng để xem chi tiết.

| Trạng thái | Nghĩa |
|---|---|
| **"Chờ duyệt"** | Plan chờ Owner hoặc Admin duyệt |
| **"Đang chạy thử migration"**, **"Đang chạy migration"** | Đang diễn tập trên bản sao, hoặc đang chạy trên production |
| **"Đang khởi động"**, **"Đang chuyển traffic"** | Bản mới đang lên |
| **"Đã nhận traffic, đang theo dõi"** | Bản mới đã nhận traffic, Embra đang theo dõi thêm |
| **"Deploy thành công"**, **"Hoàn tất"** | Xong |
| **"Thất bại"**, **"Đã huỷ"**, **"Đã từ chối"** | Dừng lại; bản cũ vẫn chạy nếu lỗi trước khi chuyển traffic |
| **"Cần đội Embra hỗ trợ"** | Không rõ kết quả, xem [`RECOVERY_REQUIRED`](/loi/#recovery_required) |
| **"Cần xác minh dữ liệu"** | Không rõ migration đã chạy chưa, xem [`MIGRATION_UNKNOWN`](/loi/#migration_unknown) |

Dải **"Lịch sử & khôi phục"** ở đầu trang vẽ các lần deploy trong tối đa 48 giờ gần nhất, cạnh khoảng dữ liệu khôi phục được. Xem [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/).

## Thông báo khi app lỗi

Embra chưa gửi email hay tin nhắn khi build, deploy hoặc app lỗi. Theo dõi trên console, hoặc dùng `embra wait` và `embra events` trong script.

## Dùng CLI

Lệnh tương ứng (xem lưu ý về đăng nhập CLI ở [Danh sách lệnh](/cli/lenh/)):

```sh
embra logs --env <project>/<env> --follow
embra logs --env <project>/<env> --process <worker-name>
embra logs --env <project>/<env> --since 2h --grep "timeout"
embra logs --build <op_id>
embra metrics --env <project>/<env> --range 7d
embra events --env <project>/<env>
```

`embra logs --since` tìm trong lịch sử log, mặc định 200 dòng, tối đa 1000 (`--limit`).

## Xem thêm

- [Deploy từ GitHub](/huong-dan/deploy-tu-github/)
- [Chuẩn bị app: health check](/huong-dan/chuan-bi-app/#health-check)
- [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/)
- [Mã lỗi và cách sửa](/loi/)
