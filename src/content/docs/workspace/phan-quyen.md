---
title: Thành viên và phân quyền
description: Role trong workspace, ai làm được gì, việc nào cần người thật, token và lời mời.
sidebar:
  order: 1
---

Mỗi người trong workspace có một **role**. Ngoài người còn có **token máy** cho AI agent và CI. Role, lời mời và lịch sử hoạt động có ở **mọi gói**, kể cả gói Start.

Ba nguyên tắc:

- **Production luôn cần Owner hoặc Admin approve.**
- **Việc không quay lại được phải do người thật làm.** Token máy không làm được, kể cả token mang quyền owner.
- **Token luôn có hạn, và không bao giờ mạnh hơn người tạo ra nó.**

## Vai trò

| Role | Dành cho | Tóm tắt |
|---|---|---|
| **Owner** | Chủ doanh nghiệp | Toàn quyền, gồm chọn gói, thanh toán, xoá workspace. Workspace luôn có ít nhất một owner |
| **Admin** | Người phụ trách kỹ thuật phía khách | Approve production, quản lý thành viên, xoá environment, export. Không thanh toán, không xoá workspace |
| **Developer** (`dev`) | Developer, agency | Build, deploy staging, tạo plan production chờ approve, quản lý secret, domain, database. Không approve production |
| **Viewer** | Người cần theo dõi | Chỉ xem trạng thái, hoạt động, log, metrics. Không thấy secret hay URL database |

| Token máy | Dùng cho | Tóm tắt |
|---|---|---|
| **Agent** (`agent`) | AI agent qua `embra mcp` | Đọc, build, deploy staging, tạo plan production. **Không bao giờ** approve, xoá, export hay đọc URL database |
| **CI** (`ci`) | Pipeline CI | Đọc và chạy thử migration. Không build, không deploy |

Trong CLI và API, role Developer tên là `dev`.

## Bảng quyền

✓ = được làm. Cột **Người thật**: *Có* = phải làm trên web hoặc trong 12 giờ sau `embra login`; *Chỉ web* = chỉ làm được trên browser. Xem [Việc cần người thật](#việc-cần-người-thật).

<div class="matrix">

| Việc | Owner | Admin | Dev | Viewer | Agent | CI | Người thật |
|---|:-:|:-:|:-:|:-:|:-:|:-:|---|
| Xem workspace, project, environment, operation, hoạt động | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Xem log và metrics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Xem **tên** secret (không bao giờ thấy giá trị) | ✓ | ✓ | ✓ | | ✓ | | |
| Đặt, thu hồi secret | ✓ | ✓ | ✓ | | | | |
| Xem URL database (có mật khẩu) | ✓ | ✓ | ✓ | | | | |
| Tạo project, environment, database, bucket | ✓ | ✓ | ✓ | | | | |
| Nối repo GitHub | ✓ | ✓ | ✓ | | | | |
| Build, upload thư mục (`embra up`) | ✓ | ✓ | ✓ | | ✓ | | |
| Diễn tập migration | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| Tạo plan deploy | ✓ | ✓ | ✓ | | ✓ | | |
| **Duyệt deploy production** | ✓ | ✓ | | | | | Có |
| **Duyệt chuyển sang database đã restore** | ✓ | ✓ | | | | | Có |
| Đề xuất restore về một thời điểm | ✓ | ✓ | ✓ | | | | |
| Kiểm chứng backup | ✓ | ✓ | ✓ | | ✓ | | |
| Huỷ operation chưa chạy | ✓ | ✓ | ✓ | | | | |
| Rollback code về release trước | ✓ | ✓ | ✓ | | | | |
| Rollback kèm quay về database cũ | ✓ | ✓ | | | | | |
| Tạm dừng, chạy lại environment | ✓ | ✓ | ✓ | | | | |
| Thêm, xác minh, xoá domain | ✓ | ✓ | ✓ | | | | |
| Xoá environment staging hoặc preview | ✓ | ✓ | | | | | |
| **Xoá environment production** | ✓ | ✓ | | | | | Có |
| **Export app và dữ liệu** | ✓ | ✓ | | | | | Có |
| **Xoá workspace** | ✓ | | | | | | Có |
| Xem billing | ✓ | ✓ | | | | | |
| **Chọn gói, thanh toán** | ✓ | | | | | | Chỉ web |
| Xem thành viên và lời mời | ✓ | ✓ | | | | | |
| **Mời, đổi vai trò, gỡ thành viên** | ✓ | ✓ ¹ | | | | | Chỉ web |
| **Tạo token** | ✓ | ✓ | ✓ ² | | | | Có |
| Xem, thu hồi token | ✓ tất cả | ✓ ³ | của mình | | | | |
| **Duyệt đăng nhập CLI** (`embra login`) | ✓ | ✓ | ✓ | ✓ ⁴ | | | Chỉ web |

</div>

1. Admin chỉ mời hoặc gán role Developer và Viewer. Admin đổi role hoặc gỡ được Developer, Viewer và admin khác, nhưng không động được tới owner.
2. Không tạo được token mạnh hơn role của mình. Developer tạo được token `dev`, `viewer`, `agent`, `ci`.
3. Admin thấy và thu hồi được mọi token, trừ token của owner.
4. Viewer approve `embra login` thì nhận token viewer. Viewer không cấp được token agent.

## Production luôn cần duyệt

| Việc | Quy tắc |
|---|---|
| Deploy production | **Mọi plan đều chờ Owner hoặc Admin approve, kể cả không có migration.** Plan chờ có hạn (mặc định 24 giờ), quá hạn phải tạo plan mới |
| Deploy staging, preview | Chạy ngay, trừ khi migration thuộc loại cần người xem: khi đó plan cũng chờ approve |
| Developer, AI agent | **Tạo** được plan production, không bao giờ **approve** được |
| Restore về một thời điểm | Hai bước: Developer trở lên đề xuất → Embra restore ra database mới → Owner hoặc Admin xem rồi approve mới chuyển sang |
| Rollback code | **Không cần approve**, vì chỉ chạy lại code đã được approve và từng chạy ở environment đó. Embra từ chối nếu không an toàn (migration đã đi tiếp, secret đã bị thu hồi) |
| Rollback kèm quay về database cũ (sau một lần restore) | Mất data ghi từ lúc chuyển, nên chỉ Owner và Admin làm được |

## Việc cần người thật

Việc ghi "Có" ở cột Người thật chỉ được chấp nhận khi có người thật vừa login:

- **Session web** login bằng GitHub hoặc Google **trong vòng 12 giờ**. Session web sống 7 ngày, nhưng lần login đã quá 12 giờ thì Embra bắt login lại rồi mới cho làm.
- Hoặc **token CLI do `embra login` cấp**, trong 12 giờ kể từ lúc bạn approve trên browser. Sau 12 giờ token vẫn dùng được cho việc thường; muốn làm việc quan trọng thì chạy `embra login` lại.

**Token máy không bao giờ làm được các việc này, dù scope là gì.** Token máy gồm: token tạo bằng `embra token create`, token `embra login --agent`, token cài đặt ban đầu. Nhờ vậy token bị lộ trong file, log CI hay máy của AI agent không thể approve production, xoá production hay export data.

Việc ghi "Chỉ web" (chọn gói, thanh toán, quản lý thành viên, duyệt đăng nhập CLI) chỉ làm được trên browser.

## Token

| Cách tạo | Loại | Role | Thời hạn |
|---|---|---|---|
| `embra login` | Token người | Đúng role của bạn | Mặc định 30 ngày |
| `embra login --agent` | Token máy | `agent`, cho `embra mcp` | Mặc định 7 ngày |
| `embra token create --scope … --name … --ttl …` | Token máy | `dev`, `viewer`, `agent` hoặc `ci` | **Bắt buộc ghi**, từ 1 phút tới 90 ngày |

- **Mọi token đều có hạn.** Không tạo được token owner hay admin qua API hay CLI.
- **Token không bao giờ mạnh hơn người tạo.** Mỗi request, Embra tính lại quyền theo role *hiện tại* của người tạo:

  | Người tạo bị | Token của họ |
  |---|---|
  | Hạ admin xuống developer | Chỉ còn quyền developer từ request tiếp theo |
  | Hạ xuống viewer | Token `agent` và `ci` họ tạo **ngừng hoạt động** |
  | Gỡ khỏi workspace | **Mọi** session và token họ tạo bị thu hồi ngay, kể cả token CI đang dùng trong pipeline |

- Tạo token cũng cần người thật: pipeline CI không tự tạo thêm token được.
- `embra token list`: xem loại token, người tạo, lần dùng gần nhất, hạn. `embra token revoke <id>`: thu hồi.

## Mời thành viên

Mời trên web ở **Cài đặt → Thành viên**. `embra members list` chỉ để xem danh sách.

| Quy tắc | Chi tiết |
|---|---|
| Ai mời ai | Owner mời được Admin, Developer, Viewer. Admin mời được Developer, Viewer |
| Owner thứ hai | **Không mời thẳng làm owner.** Mời làm Admin, rồi một owner nâng lên |
| Hạn lời mời | **14 ngày**. Mời lại cùng email thì lời mời cũ được làm mới |
| Nhận bằng GitHub | Email **chính** đã verify của account GitHub phải trùng email được mời. Email phụ không dùng được |
| Nhận bằng Google | Account Google phải có email đã verify, và email đó chưa gắn với account Embra khác |
| Owner cuối cùng | Workspace luôn còn ít nhất một owner. Gỡ hoặc hạ owner cuối cùng bị từ chối (`LAST_OWNER`) |
| Người đã bị gỡ | Không tự tạo được workspace dùng thử mới, cần owner mời lại |

**Đã có workspace riêng vẫn nhận lời mời được** (ví dụ workspace dùng thử, hoặc người của agency làm cho nhiều khách). Lời mời được nhận ở **lần login sau**, bằng đúng email được mời. Người đang login thấy dòng "Lời mời vào …: đăng xuất rồi đăng nhập lại để nhận" trong menu **Workspace**. Nhận xong thì đổi qua lại giữa các workspace ở menu đó.

## Agency làm cho doanh nghiệp

Nên chia: **chủ doanh nghiệp là Owner, agency là Developer.** Agency deploy staging và chuẩn bị plan production; chủ doanh nghiệp (hoặc Admin bên khách) approve production.

Agency là người tạo workspace thì bàn giao như sau:

1. Agency mời chủ doanh nghiệp làm **Admin**.
2. Chủ doanh nghiệp login. Agency (đang là owner) nâng chủ doanh nghiệp lên **Owner**.
3. Chủ doanh nghiệp hạ agency xuống **Developer**, hoặc gỡ hẳn khi hết hợp đồng.

:::caution[Kiểm token CI và agent trước bước 3]
Token gắn với người tạo: gỡ agency thì mọi token agency tạo ngừng hoạt động ngay; hạ agency xuống Viewer thì token `agent` và `ci` của họ cũng ngừng. Pipeline cần chạy tiếp thì người ở lại tạo token mới trước.
:::

## Lịch sử hoạt động

Mục **Hoạt động** hiện **tên người** kèm role (ví dụ "lan (Developer)"). Được ghi lại: mời, nhận lời mời, thu hồi lời mời, đổi role, gỡ thành viên, tạo và thu hồi token.

## Đội Embra

- Token do đội Embra tạo luôn có hạn và luôn kèm lý do. Bạn thấy dòng "Đội Embra đã tạo token để truy cập workspace. Lý do: …" trong Hoạt động.
- Đội Embra xem log, metrics, build log, URL database hoặc bản export của bạn thì Hoạt động ghi lại kèm lý do. Các lần xem liên tiếp gộp làm một dòng.
- Khi hỗ trợ theo yêu cầu của bạn, đội Embra có thể tạo token người ngắn hạn để **approve thay bạn** (ví dụ một plan production). Token này cũng hiện trong Hoạt động kèm lý do.
- Owner thu hồi được token của đội Embra bất cứ lúc nào bằng `embra token revoke`. Token mang quyền owner gắn với owner, nên Admin không thu hồi được loại này.

## Chưa có

- **Chưa phân quyền theo environment.** Developer vẫn đặt secret và domain, xem URL database, tạm dừng và rollback code trên production. Chỉ có approve deploy là bị khoá.
- **Chưa có token gắn riêng một project hay environment.** Token có hiệu lực trên cả workspace.
- **Chưa có approve hai người.** Admin tự tạo plan production thì tự approve được.
- **Chưa có role "Khách: xem và duyệt".**
- **Chưa có trang quản lý token trên web.** Dùng `embra token list` và `embra token revoke`.
- Chưa có SSO.

## Mã lỗi liên quan

| Mã | Nghĩa | Làm gì |
|---|---|---|
| `FORBIDDEN_SCOPE` | Role hoặc token không có quyền làm việc này | Nhờ Owner hoặc Admin |
| `HUMAN_REQUIRED` | Việc cần người thật, mà bạn đang dùng token máy | Làm trên web, hoặc `embra login` rồi thử lại |
| `REAUTH_REQUIRED` | Lần login đã quá 12 giờ | Login lại trên web, hoặc chạy `embra login` lại |
| `LAST_OWNER` | Thay đổi này làm workspace không còn owner | Nâng người khác lên owner trước |
