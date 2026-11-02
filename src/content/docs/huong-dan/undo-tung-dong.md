---
title: Undo từng dòng
description: Sửa đúng các dòng bị một lệnh UPDATE sai ghi đè, giữ nguyên data ghi sau đó. Embra sinh file SQL sửa, bạn deploy qua migration gate.
---

Lệnh `UPDATE` sai ghi đè data, nhưng sau đó app vẫn ghi tiếp data đúng? `embra db undo` chỉ trả lại các dòng do giao dịch sự cố sửa, không tua cả database như [restore](/huong-dan/rollback-va-khoi-phuc/#khôi-phục-database-về-một-mốc-thời-gian).

## Undo hay restore?

| | Undo từng dòng | Restore về một mốc |
|---|---|---|
| Sửa gì | Dòng mà giao dịch sự cố đã `UPDATE` | Cả database |
| Data ghi sau sự cố | Giữ nguyên | Mất |
| Dòng bị `DELETE` | Chỉ đếm và cho xem mẫu, **không sinh SQL** | Lấy lại được |
| Có migration sau mốc | Vẫn chạy, chỉ so cột có ở cả hai phía | Bị chặn ([`MIGRATION_AFTER_RESTORE_POINT`](/loi/#migration_after_restore_point)) |
| Đụng production | Không, tới khi bạn deploy file sửa | Có, sau khi approve |
| Làm ở đâu | Chỉ CLI | Web hoặc CLI |

## Giới hạn

| Mục | Giới hạn |
|---|---|
| Ai làm được | Owner hoặc Admin, người thật: `embra login` trong 12 giờ (xem lưu ý về CLI login ở [Danh sách lệnh](/cli/lenh/)). Token `dev`/`viewer`/`agent`/`ci` không dùng được |
| Bảng mỗi phiên | 1–10 bảng (`schema.bảng`, không ghi schema là `public`) |
| Bảng không có primary key | Bị từ chối: không ghép được dòng giữa hai thời điểm |
| Filter `--where` | Tối đa 20; op `=` `<>` `<` `<=` `>` `>=` `is_null` `not_null` |
| Giao dịch sự cố mỗi lần `run` | Tối đa 50 `--xid` |
| Mốc `--at` | Trong khoảng `embra db restore-points`; muộn nhất là lần archive WAL cuối trừ 1 phút |
| Phiên đồng thời | 1 phiên mỗi workspace, 1 lần so đang chạy mỗi environment |
| Bản copy | Tự xoá sau **24 giờ**, hoặc ngay khi `discard` |
| File sửa | Phải vừa ngân sách migration của một lần deploy (kể cả file đã áp: 100 file, 2 MiB). Không vừa thì không sinh, thu hẹp bằng `--where` |

Environment hoặc database đang dừng thì bật lại trước. Undo không chặn deploy hay restore.

## Các bước

**1. Mở phiên.** Chọn mốc ngay trước sự cố: giây chẵn ngay trước lúc lệnh lỗi **bắt đầu**.

```sh
embra db undo start --env <project>/<env> \
  --at 2026-11-02T02:34:07Z \
  --table public.orders \
  --where 'public.orders:status=cancelled' \
  --wait
```

Embra dựng bản copy database tại mốc đó (cách ly, không network), rồi so từng dòng theo primary key với production. Production chỉ bị đọc.

**2. Xem kết quả.**

```sh
embra db undo show <session_id>
embra db undo preview <session_id> <op_id>
```

`show` in trạng thái phiên, hạn xoá, và mỗi lần so (`op_id`, state, tóm tắt). `preview` in JSON: số dòng mỗi loại, top giao dịch (`xid`, số dòng, cột, khung giờ), mẫu tối đa 20 dòng mỗi loại.

| Loại dòng | Nghĩa | Undo làm gì |
|---|---|---|
| `incident_update` | Giao dịch sự cố đã sửa | **Sửa**: trả lại các cột giao dịch đó đổi |
| `changed_other` | Đổi bởi giao dịch khác sau mốc | Giữ |
| `suspect` | Như trên, nhưng cột đang mang đúng giá trị sự cố ghi | Giữ, xem tay |
| `incident_new` | Không có ở mốc, giao dịch sự cố đã ghi | Chỉ đếm |
| `new_other` | Dòng mới hợp lệ | Giữ |
| `missing` | Bị xoá sau mốc | Chỉ đếm và cho xem mẫu |

:::caution[Tên bảng, cột và giá trị trong preview là data của bạn]
Đừng dán preview vào nơi công khai.
:::

**3. (Tuỳ chọn) Dựng lại ngay trước giao dịch sự cố.** Mốc theo giây có thể bỏ sót dòng tạo trong khe giữa mốc và sự cố (`incident_new`). Dựng lại bản copy chứa mọi thứ commit **trước** giao dịch đó:

```sh
embra db undo exact <session_id> --env <project>/<env> --xid <xid> --table public.orders --wait
```

Phiên gốc bị thay bằng phiên mới (giữ filter cũ). Dùng `session_id` mới cho các bước sau.

**4. Sinh file sửa.** Chọn giao dịch sự cố từ preview:

```sh
embra db undo run <session_id> --xid <xid> --wait
```

- `--exclude public.orders.updated_at`: giữ giá trị hiện tại của cột đó.
- `--table`: đổi danh sách bảng cần so.
- Không có `--xid`: chỉ so lại, không sinh file.

Mỗi câu trong file là `UPDATE … WHERE <primary key> AND xmin = ANY (…)`: chỉ ghi dòng **vẫn còn** đúng phiên bản giao dịch sự cố đã ghi. Dòng bị đổi tiếp sau lúc preview, kể cả lúc chờ approve, được bỏ qua. Áp lại lần hai không đổi gì.

**5. Tải file vào thư mục migration.**

```sh
embra db undo fix <session_id> <op_id> --out migrations
```

File tên `NNNN_embra_undo_<k>.sql`, số đặt sau migration đã áp cuối cùng. Lệnh kiểm hash, không ghi đè file có sẵn; một file lỗi thì không ghi file nào.

**6. Deploy qua migration gate.** Commit file rồi push. Đây là lớp **Đổi hoặc xoá data**: gate rehearsal trên bản copy (số dòng phải khớp preview) và **luôn cần Owner hoặc Admin approve, kể cả staging**. Xem [Database và migration](/huong-dan/database-va-migration/#embra-kiểm-migration-thế-nào).

:::caution[File sửa ở lại repo mãi]
Migration đã áp không được sửa hay xoá ([`MIGRATION_HISTORY_CHANGED`](/loi/#migration_history_changed)). Giá trị cũ trong file nằm trong lịch sử git.
:::

**7. Kiểm lại rồi xoá bản copy.**

```sh
embra db undo run <session_id> --wait
embra db undo discard <session_id>
```

So lại trên cùng bản copy: nhóm `incident_update` phải về 0, chỉ còn dòng đổi hợp lệ và dòng mới.

<details>
<summary>Trường hợp đặc biệt</summary>

- Repo còn migration chưa áp: chúng chạy cùng lần deploy, **trước** file sửa. Tóm tắt của `run` liệt kê chúng.
- Một dòng bị giao dịch sự cố và giao dịch khác cùng sửa (khe giữa mốc và sự cố): chỉ các cột của giao dịch sự cố được trả lại, cột khác giữ như hiện tại. Tóm tắt ghi số dòng này.
- Trigger của app **chạy** khi file sửa được áp. Preview liệt kê trigger của bảng.
- Cột chỉ có ở một phía (thêm hoặc xoá sau mốc) được liệt kê, không so. Undo **không** lấy lại được data của cột đã `DROP`.
- `--where` có dạng `bảng:cột<op>giá_trị` hoặc `bảng:cột:is_null` / `bảng:cột:not_null`; bảng phải nằm trong `--table`.

</details>

## Khi không làm được

| Câu lỗi | Cách xử lý |
|---|---|
| `Mốc nằm ngoài khoảng khôi phục được. …` ([`RESTORE_POINT_UNAVAILABLE`](/loi/#restore_point_unavailable)) | Chọn mốc trong `embra db restore-points` |
| `Workspace đang có một phiên hoàn tác (…). …` ([`OPERATION_IN_PROGRESS`](/loi/#operation_in_progress)) | `embra db undo discard <session_id>` phiên cũ |
| `Kết quả của lần so này đã bị xoá (quá 24 giờ hoặc phiên đã xoá).` | Mở phiên mới |
| `Environment hoặc database đang dừng. …` | Bật lại trước |
| Token không đủ quyền ([`FORBIDDEN_SCOPE`](/loi/#forbidden_scope), [`HUMAN_REQUIRED`](/loi/#human_required)) | Owner hoặc Admin chạy `embra login` lại |

## Xem thêm

- [Rollback và khôi phục backup](/huong-dan/rollback-va-khoi-phuc/)
- [Runbook sự cố](/huong-dan/runbook-su-co/)
- [Database và migration](/huong-dan/database-va-migration/)
