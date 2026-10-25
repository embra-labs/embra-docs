# embra-docs

Tài liệu công khai của Embra tại `docs.embra.cloud`, dựng bằng [Astro Starlight](https://starlight.astro.build).

| Lệnh | Việc |
|---|---|
| `npm ci` | Cài dependency (Node 24) |
| `npm run dev` | Chạy local ở `localhost:4321` |
| `npm run build` | Build tĩnh vào `dist/` |

## Cấu trúc

- `src/content/docs/` — trang tiếng Việt (ngôn ngữ gốc). `src/content/docs/en/` — bản tiếng Anh; trang chưa dịch tự hiện bản tiếng Việt.
- Tham chiếu API tạm ẩn (founder 25/10) cho tới khi API ổn định và đã lọc endpoint nội bộ (webhook GitHub/SePay, billing). Khi bật lại: plugin `starlight-openapi` với bản chụp `embra/api/openapi.yaml` đã lọc.
- `/llms.txt`, `/llms-full.txt`, `/llms-small.txt` — sinh tự động cho AI agent.
- Giao diện giống console (Monochrome, chỉ có nền sáng): `src/styles/theme.css` chép token từ `embra-dashboard/src/lib/ui/tokens.css`; font Inter và JetBrains Mono tự host ở `src/assets/fonts/` (chép từ dashboard); logo, bỏ chọn theme ở `src/components/`. Đổi màu hay font ở console thì chép sang đây.

## Quy ước viết

- Viết tiếng Việt trước, ngắn, đúng với code đang chạy ở `main`. Không hứa tính năng chưa có.
- Lệnh CLI lấy theo `cli/*.go` của repo sản phẩm.

## Deploy

Push lên `main` → GitHub Actions build và đăng lên GitHub Pages (`.github/workflows/deploy.yml`). Domain `docs.embra.cloud` khai trong `public/CNAME`.
