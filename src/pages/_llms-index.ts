// Shared builder for /llms.txt and /en/llms.txt (llmstxt.org format: title, summary, details, link lists).
import { groupsFor, mdUrl, sets, SITE, slugOf, type Lang } from '../lib/agent-docs';

const intro: Record<Lang, string> = {
	vi: `# Embra

> Embra: hosting app kèm Postgres riêng cho Việt Nam. Deploy từ GitHub, migration có cổng duyệt (rehearsal trên bản copy data, approve), backup liên tục và restore về một thời điểm.

Docs tiếng Việt. English: ${SITE}/en/llms.txt

Cho agent:
- Mỗi trang có bản Markdown: thêm \`.md\` vào URL (\`${SITE}/huong-dan/deploy-tu-github.md\`). Danh mục bên dưới đã trỏ sẵn tới bản \`.md\`.
- CLI \`embra\` tự in JSON khi stdout không phải terminal hoặc có \`EMBRA_AGENT=1\`. Đọc \`state\`, \`reason_code\`, \`next_action\`, \`operation_id\` và exit code, đừng đọc câu tiếng Việt: ${mdUrl('vi', 'cli/exit-code-va-json')}
- Gặp \`reason_code\`: cách sửa ở \`${SITE}/loi/#<reason_code viết thường>\`. Bảng máy đọc (HTTP, retryable, next_action, exit code, link docs): ${SITE}/reasons.json
- \`next_action = contact_operator\` hoặc exit code \`30\`: dừng, không retry, không chạy SQL tay, không xoá environment. Báo người dùng gửi \`operation_id\` cho hello@embra.cloud.
- Approve production cần Owner hoặc Admin là người thật. Agent không tự approve.`,
	en: `# Embra

> Embra: app hosting with a dedicated Postgres, built for Vietnam. Deploy from GitHub, a migration gate (rehearsal on a copy of the data, then approval), continuous backups and point-in-time restore.

English docs. Console labels are Vietnamese; the docs quote them in bold with a translation.
Tiếng Việt: ${SITE}/llms.txt

For agents:
- Every page has a Markdown version: add \`.md\` to the URL (\`${SITE}/en/huong-dan/deploy-tu-github.md\`). The index below already links the \`.md\` versions.
- The \`embra\` CLI prints JSON when stdout is not a terminal or \`EMBRA_AGENT=1\` is set. Read \`state\`, \`reason_code\`, \`next_action\`, \`operation_id\` and the exit code, not the Vietnamese sentence: ${mdUrl('en', 'cli/exit-code-va-json')}
- For a \`reason_code\`, the fix is at \`${SITE}/en/loi/#<reason_code in lowercase>\`. Machine-readable table (HTTP, retryable, next_action, exit code, docs link): ${SITE}/reasons.json
- \`next_action = contact_operator\` or exit code \`30\`: stop. Do not retry, run SQL by hand or delete the environment. Tell the user to send the \`operation_id\` to hello@embra.cloud.
- Approving production needs a human Owner or Admin. Agents do not approve.`,
};

export async function llmsIndex(lang: Lang): Promise<string> {
	const p = lang === 'en' ? '/en' : '';
	const out = [intro[lang]];
	out.push(lang === 'en' ? '## Bundles' : '## Bộ docs');
	out.push(
		[
			`- [${lang === 'en' ? 'Everything' : 'Toàn bộ'}](${SITE}${p}/llms-full.txt): ${lang === 'en' ? 'all pages in sidebar order' : 'mọi trang theo thứ tự sidebar'}`,
			`- [${lang === 'en' ? 'Everything, short' : 'Toàn bộ, bản gọn'}](${SITE}${p}/llms-small.txt): ${lang === 'en' ? 'without edge-case details, notes and the error catalogue (look codes up in /reasons.json)' : 'bỏ phần edge case, note và trang mã lỗi (tra mã trong /reasons.json)'}`,
			...sets.map((s) => `- [${s.label[lang]}](${SITE}${p}/llms/${s.slug}.txt): ${s.about[lang]}`),
		].join('\n')
	);
	for (const g of await groupsFor(lang)) {
		if (!g.docs.length) continue;
		out.push(`## ${g.label}`);
		out.push(
			g.docs
				.map((d) => `- [${d.data.title}](${mdUrl(lang, slugOf(d))})${d.data.description ? `: ${d.data.description}` : ''}`)
				.join('\n')
		);
	}
	return out.join('\n\n') + '\n';
}
