# AGENTS.md

Public docs for Embra, built with Astro Starlight. See `README.md` for commands and layout.

- Vietnamese is the root locale; English lives under `src/content/docs/en/`.
- The API reference is hidden for now. Don't publish `openapi.yaml` or endpoint lists without founder approval.
- Only document behaviour that exists on the product repo's `main`. Check the code before writing.
- `npm run build` must pass with no new warnings before reporting done.
- Agent outputs (`/llms.txt`, `/<slug>.md`, bundles, `/reasons.json`) are built from page Markdown by `src/lib/agent-docs.ts`. A new page needs a good `description` (it is the agent's index line) and, if outside `bat-dau`/`loi`/`cli`, an entry in `src/sidebar.mjs`; add it to a topic set in `agent-docs.ts` if it fits one.
- Dev server: `astro dev --background`; manage with `astro dev stop|status|logs`.
- Style follows the console (`embra-dashboard` BRAND_GUIDE.md, tokens.css): light only, color only for status. Keep `src/styles/theme.css` in sync with the dashboard tokens.

## How to write a page

- **Correct beats complete.** Every claim must match the product repo's `origin/main` (read with `git show origin/main:<path>`; the local checkout may be on another branch). If unsure, leave it out.
- **One page, one job, one type.** Pick the type, follow its skeleton, delete empty sections.
  - *Quickstart:* what you get + what you need → numbered steps, one action each, expected result after → "check it worked" → next steps. "If you see X…" goes at the step where it breaks, not at the end.
  - *How-to:* title is the task ("Gắn domain riêng") → when and who (role) → for operations that touch data, a **Giới hạn** table (≤6 rows: *Embra đảm bảo* / *Embra không đảm bảo*, each row checkable in code) → ≤10 steps (location → action → result) → common errors (link to `/loi/`) → see also. Only the recommended way; link the others.
  - *Error entry* (`/loi/`): heading is the bare `REASON_CODE` so the anchor is `#reason_code` (CLI and console link there; never rename) → generated metadata row (HTTP, retry, `next_action`, exit code, next step) from `node scripts/reasons.mjs`, never edited by hand; run it after any change to the product's `api/reasons.go`, `--check` must pass → what it means → common causes → fix per cause, with framework snippets → is data safe, should you retry → when to contact and what to send (`operation_id`, workspace, time).
  - *Concept / "what happens when":* definition, what is out of scope, one diagram, dated scenarios with real amounts computed from code. Policy and money only restate published terms.
  - *Reference:* tables taken from code or schema; every limit says what happens when you exceed it.
- **Use the customer's words.** Put the exact error text or the phrase customers ask with in the title or first paragraph.
- **Commands and exit codes.** Show the exit code a script should expect after a command that matters (`api/exit.go`). Terminal output only if copied from a real run; never write output by hand. "Next step" commands must exist on the product's `main`; `contact_operator` codes never get a command, and `embrad admin …` never appears in docs.
- **Written for people and agents.** Commands runnable as-is with ASCII placeholders (`<app-name>`); UI labels in bold, verbatim from the dashboard `src/lib/i18n/vi.ts`; defaults and limits as numbers; sample output; no content only in screenshots; say plainly what is not on yet, never promise future features.

### Length (founder 02/11: "nhiều text quá, đọc hơi đuối")

- No intro paragraph ("Trang này dành cho… Bạn biết…"). Start with the first task or one sentence that says what the page solves.
- One idea per bullet, one or two lines. If a sentence explains *why*, keep it only when it stops a support question.
- Rules and limits go in a table, not in prose.
- Edge cases (parsing rules, rare limits, override order) go in `<details><summary>…</summary>` under the main text. Move them, don't delete them: they answer real tickets.
- Say a thing once. Link to the page that owns it instead of repeating it (e.g. `TZ`, approval rules, CLI login status).
- Cutting text never changes a fact: numbers, `code`, links and `/loi/#` anchors that disappear must be deliberate.

### Vietnamese style

Write like a Vietnamese developer explains to a teammate: short, direct, technical terms in English.

- Address the reader as "bạn"; Embra calls itself "Embra" / "đội Embra", never "chúng tôi" or "operator".
- Most important first; condition before action ("App dùng Prisma thì chạy…"); each step starts with one verb (Bấm, Chọn, Chạy, Nhập), no "hãy"/"vui lòng" in steps.
- Errors as "Không … được" or "build fail", not "… thất bại". Active voice; drop "tiến hành", "thực hiện việc", "đối với", "nhằm", "được … bởi", needless "sẽ"/"việc". No English title case.
- **Keep technical terms in English** (this replaces the old "translate" list): deploy, redeploy, build, build fail, push, pull request/PR, preview, migration, secret, env var, environment, log, commit, repo, branch, root directory, monorepo, plan, approve, health check, bucket, workspace, rollback, restore, backup, database, token, webhook, domain, DNS, container, port, timezone, owner/admin/developer/viewer. Translate only plain business words: gói, dùng thử, hoá đơn, thanh toán, thành viên. When unsure, use the word a Vietnamese dev would say out loud.
- Console labels stay verbatim Vietnamese in bold (they must match `vi.ts`); explain with the English term after if needed: `**Thư mục gốc** (root directory)`. Don't rename a label in prose.
- Never translate commands, flags, env vars, error codes, file names.
- Numbers in prose Vietnamese-style (`232.935đ`); code and output exactly as the machine prints.
- Keep headings that other pages or the product link to (grep `/<slug>/#` before renaming one); `/loi/` headings never change.
- Every VI page has an EN page at the same slug, updated in the same commit. EN translates meaning, keeps code blocks identical, follows the same length rules, and quotes Vietnamese console labels with a translation in brackets.
