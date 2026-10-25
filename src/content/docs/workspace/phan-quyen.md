---
title: Thành viên và phân quyền
description: Vai trò trong workspace, ai làm được gì, việc nào cần người thật, token và lời mời.
sidebar:
  order: 1
---

Mỗi người trong workspace có một **vai trò**. Ngoài người còn có **token máy** cho AI agent và CI. Vai trò, lời mời và lịch sử hoạt động có ở **mọi gói**, kể cả gói Start.

Ba nguyên tắc:

- **Production luôn cần Owner hoặc Admin duyệt.**
- **Việc không quay lại được thì phải do người thật làm.** Token máy không làm được, kể cả token mang quyền owner.
- **Token luôn có hạn, và không bao giờ mạnh hơn người đã tạo ra nó.**

## Vai trò

| Vai trò | Dành cho | Tóm tắt |
|---|---|---|
| **Owner** | Chủ doanh nghiệp | Toàn quyền, gồm chọn gói, thanh toán và xoá workspace. Workspace luôn có ít nhất một owner. |
| **Admin** | Người điều hành kỹ thuật phía khách | Duyệt production, quản lý thành viên, xoá environment, export. Không thanh toán, không xoá workspace. |
| **Developer** (`dev`) | Lập trình viên, agency | Build, deploy staging, tạo plan production để chờ duyệt, quản lý secret, domain, database. Không duyệt production. |
| **Viewer** | Người cần theo dõi | Chỉ xem trạng thái, hoạt động, log và metrics. Không thấy secret hay URL database. |

Hai loại token máy:

| Token | Dùng cho | Tóm tắt |
|---|---|---|
| **Agent** (`agent`) | AI agent qua `embra mcp` | Đọc, build, deploy staging, tạo plan production. **Không bao giờ** duyệt, xoá, export hay đọc URL database. |
| **CI** (`ci`) | Pipeline CI | Đọc và diễn tập migration. Không build, không deploy. |

Trong CLI và API, vai trò Developer có tên là `dev`.

## Bảng quyền

✓ = được làm. Cột **Người thật**: *Có* = phải làm trên web hoặc trong 12 giờ sau `embra login`; *Chỉ web* = chỉ làm được trên trình duyệt. Xem [Việc cần người thật](#việc-cần-người-thật).

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

1. Admin chỉ mời hoặc gán vai trò Developer và Viewer. Admin đổi vai trò hoặc gỡ được Developer, Viewer và các admin khác, nhưng không động được tới owner.
2. Không tạo được token mạnh hơn vai trò của mình. Developer tạo được token `dev`, `viewer`, `agent`, `ci`.
3. Admin thấy và thu hồi được mọi token, trừ token của owner.
4. Viewer duyệt `embra login` thì nhận token viewer. Viewer không cấp được token agent.

## Production luôn cần duyệt

- **Mọi plan deploy lên production đều chờ Owner hoặc Admin duyệt, kể cả khi không có migration.** Plan chờ duyệt có hạn (mặc định 24 giờ). Quá hạn thì phải tạo plan mới.
- Deploy lên staging và preview chạy ngay, trừ khi migration được xếp vào loại cần người xem. Khi đó plan cũng chờ duyệt.
- Developer và AI agent **tạo** được plan production, nhưng không bao giờ **duyệt** được.
- **Restore về một thời điểm** đi theo hai bước. Developer trở lên đề xuất. Embra khôi phục ra một database mới. Owner hoặc Admin xem rồi duyệt thì mới chuyển sang.
- **Rollback code không cần duyệt**, vì nó chỉ chạy lại code đã từng được duyệt và chạy ở environment đó. Embra từ chối rollback nếu không an toàn, ví dụ migration đã đi tiếp hoặc secret đã bị thu hồi. Rollback mà phải quay về database cũ (sau một lần restore) thì sẽ mất dữ liệu ghi từ lúc chuyển, nên chỉ Owner và Admin làm được.

## Việc cần người thật

Các việc có ghi "Có" ở cột Người thật chỉ được chấp nhận khi có một người thật vừa đăng nhập:

- **Phiên web** đăng nhập bằng GitHub hoặc Google **trong vòng 12 giờ**. Phiên web sống 7 ngày, nhưng nếu lần đăng nhập đã quá 12 giờ, Embra sẽ yêu cầu bạn đăng nhập lại rồi mới cho làm.
- Hoặc **token CLI do `embra login` cấp**, dùng trong 12 giờ kể từ lúc bạn bấm duyệt trên trình duyệt. Sau 12 giờ, token đó vẫn dùng được cho các việc thường. Muốn làm việc quan trọng thì chạy `embra login` lại.

**Token máy không bao giờ làm được các việc này, dù scope là gì.** Token máy gồm token tạo bằng `embra token create`, token `embra login --agent`, và token cài đặt ban đầu. Nhờ vậy, một token bị lộ trong file, log CI hay máy của AI agent không thể duyệt production, xoá production hay export dữ liệu.

Việc ghi "Chỉ web" (chọn gói, thanh toán, quản lý thành viên, duyệt đăng nhập CLI) chỉ làm được trên trình duyệt.

## Token

| Cách tạo | Loại | Vai trò | Thời hạn |
|---|---|---|---|
| `embra login` | Token người | Đúng vai trò của bạn | Mặc định 30 ngày |
| `embra login --agent` | Token máy | `agent`, cho `embra mcp` | Mặc định 7 ngày |
| `embra token create --scope … --name … --ttl …` | Token máy | `dev`, `viewer`, `agent` hoặc `ci` | **Bắt buộc ghi**, từ 1 phút tới 90 ngày |

- **Mọi token đều có hạn.** Không tạo được token owner hay admin qua API hay CLI.
- **Token không bao giờ mạnh hơn người tạo ra nó.** Mỗi lần dùng, Embra tính lại quyền theo vai trò *hiện tại* của người tạo:
  - Hạ admin xuống developer: token của người đó chỉ còn quyền developer từ request tiếp theo.
  - Hạ xuống viewer: token `agent` và `ci` người đó tạo **ngừng hoạt động**.
  - Gỡ khỏi workspace: **mọi** phiên và token người đó tạo bị thu hồi ngay, kể cả token CI đang dùng trong pipeline.
- Tạo token cũng là việc cần người thật. Pipeline CI không tự tạo thêm token được.
- `embra token list` cho xem loại token, người tạo, lần dùng gần nhất và hạn. `embra token revoke <id>` để thu hồi.

## Mời thành viên

Mời người trên web, ở **Cài đặt → Thành viên**. `embra members list` chỉ để xem danh sách.

- Owner mời được Admin, Developer, Viewer. Admin mời được Developer, Viewer.
- **Không mời thẳng làm owner.** Muốn có owner thứ hai thì mời làm Admin, rồi một owner nâng người đó lên.
- Lời mời có hạn **14 ngày**. Mời lại cùng một email thì lời mời cũ được làm mới.
- **Nhận lời mời bằng GitHub:** email **chính** đã xác minh của tài khoản GitHub phải trùng với email được mời. Email phụ không dùng được.
- **Nhận lời mời bằng Google:** tài khoản Google phải có email đã xác minh, và email đó chưa gắn với một tài khoản Embra khác.
- **Người được mời không được có sẵn workspace Embra riêng**, ví dụ workspace dùng thử. Hiện mỗi người chỉ thuộc một workspace. Nếu đã có, họ sẽ đăng nhập vào workspace của mình, còn lời mời vẫn treo mà không báo lỗi. Trường hợp này, liên hệ đội Embra.
- Workspace luôn còn ít nhất một owner. Gỡ hoặc hạ owner cuối cùng bị từ chối (`LAST_OWNER`).
- Người đã bị gỡ khỏi workspace thì không tự tạo được workspace dùng thử mới. Họ cần owner mời lại.

## Agency làm cho doanh nghiệp

Cách chia vai trò nên dùng: **chủ doanh nghiệp là Owner, agency là Developer.** Agency deploy staging và chuẩn bị plan production. Chủ doanh nghiệp (hoặc Admin bên khách) duyệt production.

Nếu agency là người tạo workspace, bàn giao như sau:

1. Agency mời chủ doanh nghiệp làm **Admin**.
2. Chủ doanh nghiệp đăng nhập. Agency, đang là owner, nâng chủ doanh nghiệp lên **Owner**.
3. Chủ doanh nghiệp hạ agency xuống **Developer**, hoặc gỡ hẳn khi hết hợp đồng.

Trước bước 3, kiểm token CI và agent. Token gắn với người tạo: gỡ agency thì mọi token agency tạo ngừng hoạt động ngay. Hạ agency xuống Viewer thì token `agent` và `ci` của họ cũng ngừng. Nếu pipeline cần tiếp tục chạy, người ở lại tạo token mới trước.

## Lịch sử hoạt động

Mục Hoạt động hiện **tên người** và vai trò (ví dụ "lan (Developer)"), không chỉ hiện vai trò. Mời, nhận lời mời, thu hồi lời mời, đổi vai trò, gỡ thành viên, tạo và thu hồi token đều được ghi lại.

## Đội Embra

- Token do đội Embra tạo luôn có hạn và luôn kèm lý do. Bạn thấy dòng "Đội Embra đã tạo token để truy cập workspace. Lý do: …" trong Hoạt động.
- Khi đội Embra xem log, metrics, log build, URL database hoặc bản export của bạn, Hoạt động ghi lại kèm lý do. Các lần xem liên tiếp được gộp làm một dòng.
- Khi hỗ trợ theo yêu cầu của bạn, đội Embra có thể tạo một token người ngắn hạn để **duyệt thay bạn**, ví dụ duyệt một plan production. Token này cũng hiện trong Hoạt động kèm lý do.
- Owner thu hồi được token của đội Embra bất cứ lúc nào bằng `embra token revoke`. Token mang quyền owner gắn với owner, nên Admin không thu hồi được loại này.

## Chưa có

Những điều Embra **chưa** làm được, để bạn biết trước:

- **Chưa phân quyền theo environment.** Developer vẫn đặt secret và domain, xem URL database, tạm dừng và rollback code trên production. Chỉ có việc duyệt deploy là bị khoá.
- **Chưa có token gắn riêng một project hay environment.** Token có hiệu lực trên cả workspace.
- **Chưa có duyệt hai người.** Admin tự tạo plan production thì tự duyệt được.
- **Chưa có vai trò "Khách: xem và duyệt".**
- **Chưa có trang quản lý token trên web.** Dùng `embra token list` và `embra token revoke`.
- **Mỗi người chỉ thuộc một workspace.**
- Chưa có SSO.

## Mã lỗi liên quan

| Mã | Nghĩa | Làm gì |
|---|---|---|
| `FORBIDDEN_SCOPE` | Vai trò hoặc token không có quyền làm việc này | Nhờ Owner hoặc Admin |
| `HUMAN_REQUIRED` | Việc cần người thật, mà bạn đang dùng token máy | Làm trên web, hoặc `embra login` rồi thử lại |
| `REAUTH_REQUIRED` | Lần đăng nhập đã quá 12 giờ | Đăng nhập lại trên web, hoặc chạy `embra login` lại |
| `LAST_OWNER` | Thay đổi này sẽ làm workspace không còn owner | Nâng người khác lên owner trước |
