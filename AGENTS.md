# AGENTS.md

Public docs for Embra, built with Astro Starlight. See `README.md` for commands and layout.

- Vietnamese is the root locale; English lives under `src/content/docs/en/`.
- The API reference is hidden for now. Don't publish `openapi.yaml` or endpoint lists without founder approval.
- Only document behaviour that exists on the product repo's `main`. Check the code before writing.
- `npm run build` must pass with no new warnings before reporting done.
- Dev server: `astro dev --background`; manage with `astro dev stop|status|logs`.
- Style follows the console (`embra-dashboard` BRAND_GUIDE.md, tokens.css): light only, color only for status. Keep `src/styles/theme.css` in sync with the dashboard tokens.

## How to write a page

- **Correct beats complete.** Every claim must match the product repo's `origin/main` (read with `git show origin/main:<path>`; the local checkout may be on another branch). If unsure, leave it out.
- **One page, one job, one type.** Pick the type, follow its skeleton, delete empty sections.
  - *Quickstart:* what you get + what you need → numbered steps, one action each, expected result after → "check it worked" → next steps. "If you see X…" goes at the step where it breaks, not at the end.
  - *How-to:* title is the task ("Gắn domain riêng") → when and who (role) → ≤10 steps (location → action → result) → common errors (link to `/loi/`) → see also. Only the recommended way; link the others.
  - *Error entry* (`/loi/`): heading is the bare `REASON_CODE` so the anchor is `#reason_code` (CLI and console link there; never rename) → what it means → common causes → fix per cause, with framework snippets → is data safe, should you retry → when to contact and what to send (`operation_id`, workspace, time).
  - *Concept / "what happens when":* definition, what is out of scope, one diagram, dated scenarios with real amounts computed from code. Policy and money only restate published terms.
  - *Reference:* tables taken from code or schema; every limit says what happens when you exceed it.
- **Use the customer's words.** Put the exact error text or the phrase customers ask with in the title or first paragraph.
- **Written for people and agents.** Commands runnable as-is with ASCII placeholders (`<app-name>`); UI labels in bold, verbatim from the dashboard `src/lib/i18n/vi.ts`; defaults and limits as numbers; sample output; no content only in screenshots; say plainly what is not on yet, never promise future features.

### Vietnamese style

- Address the reader as "bạn"; Embra calls itself "Embra" / "đội Embra", never "chúng tôi" or "operator".
- Most important first; condition before action ("Nếu app dùng Prisma, chạy…"); each step starts with one verb (Bấm, Chọn, Chạy, Nhập), no "hãy"/"vui lòng" in steps.
- Errors as "Không … được", not "… thất bại". Active voice; drop "tiến hành", "thực hiện việc", needless "sẽ". No English title case.
- Keep in English: deploy, build, migration, secret, environment, log, commit, repo, branch, plan, health check, bucket, workspace, rollback, backup, database. Translate: duyệt, khôi phục, cài đặt, gói, dùng thử, vai trò, biến môi trường, tên miền (first mention only). Never translate commands, flags, env vars, error codes, file names.
- Numbers in prose Vietnamese-style (`232.935đ`); code and output exactly as the machine prints.
- Every VI page has an EN page at the same slug, updated in the same commit. EN translates meaning, keeps code blocks identical, and quotes Vietnamese console labels with a translation in brackets.
