// Agent-facing views of the docs: per-page Markdown, llms.txt, full/small bundles and topic sets.
// Built from the raw Markdown of the content collection (not the rendered HTML), so code blocks, tables and
// /loi/ anchors reach the agent exactly as written. Page order follows src/sidebar.mjs.
import { getCollection, type CollectionEntry } from 'astro:content';
import { sidebar } from '../sidebar.mjs';

export const SITE = 'https://docs.embra.cloud';
export type Lang = 'vi' | 'en';
type Doc = CollectionEntry<'docs'>;

/** Slug without the locale prefix: `en/huong-dan/x` → `huong-dan/x`. */
const bare = (id: string) => id.replace(/^en\//, '');
const isEn = (id: string) => id === 'en' || id.startsWith('en/');
const prefix = (lang: Lang) => (lang === 'en' ? '/en' : '');

/** Page URL as a person opens it, and the Markdown URL an agent fetches. */
export const pageUrl = (lang: Lang, slug: string) => `${SITE}${prefix(lang)}/${slug}/`;
export const mdUrl = (lang: Lang, slug: string) => `${SITE}${prefix(lang)}/${slug}.md`;

/** Pages that only make sense in a browser. */
const skip = (slug: string) => slug === 'index' || slug === '404' || slug === 'en' || slug === 'en/404';

export async function docsFor(lang: Lang): Promise<Doc[]> {
	const all = await getCollection('docs');
	return all.filter((d) => isEn(d.id) === (lang === 'en') && !skip(d.id) && !skip(bare(d.id)));
}

export interface Group {
	label: string;
	docs: Doc[];
}

/** Docs grouped and ordered like the sidebar; anything not in the sidebar goes in a last group. */
export async function groupsFor(lang: Lang): Promise<Group[]> {
	const docs = await docsFor(lang);
	const bySlug = new Map(docs.map((d) => [bare(d.id), d]));
	const used = new Set<string>();
	const order = (d: Doc) => d.data.sidebar?.order ?? 1000;
	const groups: Group[] = [];
	for (const g of sidebar as any[]) {
		const out: Doc[] = [];
		for (const item of g.items) {
			if (typeof item === 'string') {
				const d = bySlug.get(item);
				if (d) out.push(d);
			} else if (item.autogenerate) {
				const dir = item.autogenerate.directory;
				out.push(
					...docs
						.filter((d) => bare(d.id) === dir || bare(d.id).startsWith(dir + '/'))
						.sort((a, b) => order(a) - order(b) || a.data.title.localeCompare(b.data.title))
				);
			}
		}
		out.forEach((d) => used.add(d.id));
		groups.push({ label: lang === 'en' ? (g.translations?.en ?? g.label) : g.label, docs: out });
	}
	const rest = docs.filter((d) => !used.has(d.id));
	if (rest.length) groups.push({ label: lang === 'en' ? 'Other' : 'Khác', docs: rest });
	return groups;
}

export const slugOf = (d: Doc) => bare(d.id);
export const langOf = (d: Doc): Lang => (isEn(d.id) ? 'en' : 'vi');

/** Raw page Markdown made self-contained for an agent. */
export function toMarkdown(d: Doc): string {
	const lang = langOf(d);
	let body = d.body ?? '';
	// Generated-table markers and other HTML comments are noise to an agent.
	body = body.replace(/<!--[\s\S]*?-->\n?/g, '');
	// Screenshots: keep the alt text, the image itself is not reachable from a .md file.
	body = body.replace(/!\[([^\]]*)\]\([^)]*\)/g, (_, alt) => (lang === 'en' ? `_(Screenshot: ${alt})_` : `_(Ảnh: ${alt})_`));
	// Site-relative links become absolute so they work outside the site.
	body = body.replace(/\]\((\/[^)\s]*)\)/g, (_, path) => `](${SITE}${path})`);
	body = body.replace(/\n{3,}/g, '\n\n').trim();
	const head = [`# ${d.data.title}`];
	if (d.data.description) head.push(`> ${d.data.description}`);
	head.push(`${lang === 'en' ? 'Source' : 'Nguồn'}: ${pageUrl(lang, slugOf(d))}`);
	return head.join('\n\n') + '\n\n' + body + '\n';
}

/** Shorter variant: drops <details> blocks and note/tip asides (edge cases), keeps caution/danger. */
export function toSmall(md: string): string {
	return md
		.replace(/<details>[\s\S]*?<\/details>\n?/g, '')
		.replace(/^:::(note|tip)[^\n]*\n[\s\S]*?^:::\n?/gm, '')
		.replace(/\n{3,}/g, '\n\n');
}

export async function bundle(lang: Lang, filter?: (slug: string) => boolean, small = false): Promise<string> {
	const groups = await groupsFor(lang);
	const parts: string[] = [];
	for (const g of groups) {
		for (const d of g.docs) {
			if (filter && !filter(slugOf(d))) continue;
			// The short bundle leaves out the error catalogue: agents look codes up in /reasons.json or /loi.md.
			if (small && slugOf(d) === 'loi') continue;
			const md = toMarkdown(d);
			parts.push(small ? toSmall(md) : md);
		}
	}
	return parts.join('\n---\n\n');
}

/** Topic sets: smaller bundles an agent can load for one job. */
export const sets: { slug: string; label: Record<Lang, string>; about: Record<Lang, string>; match: (s: string) => boolean }[] = [
	{
		slug: 'deploy',
		label: { vi: 'Đưa app lên', en: 'Ship an app' },
		about: { vi: 'chuẩn bị app, embra.toml, deploy từ GitHub, env var, secret, domain', en: 'app prep, embra.toml, deploy from GitHub, env vars, secrets, domains' },
		match: (s) => /^bat-dau\/|^huong-dan\/(chuan-bi-app|deploy-tu-github|chuyen-app-co-san|bien-moi-truong|secret|domain-rieng|luu-file|staging-production-va-duyet|ai-agent)$/.test(s),
	},
	{
		slug: 'migration',
		label: { vi: 'Database và migration', en: 'Database and migrations' },
		about: { vi: 'Postgres, viết migration, migration gate, expand/contract', en: 'Postgres, writing migrations, the migration gate, expand/contract' },
		match: (s) => /^huong-dan\/(database|database-va-migration|migration-an-toan|expand-contract)$/.test(s),
	},
	{
		slug: 'recovery',
		label: { vi: 'Khôi phục sự cố', en: 'Incident recovery' },
		about: { vi: 'runbook theo triệu chứng, rollback, restore, undo từng dòng, giới hạn hệ thống', en: 'symptom runbook, rollback, restore, row-level undo, system limits' },
		match: (s) => /^huong-dan\/(runbook-su-co|rollback-va-khoi-phuc|undo-tung-dong|log-va-theo-doi)$|^kien-truc\//.test(s),
	},
	{
		slug: 'errors',
		label: { vi: 'Mã lỗi và CLI', en: 'Error codes and CLI' },
		about: { vi: 'mọi reason_code kèm cách sửa, lệnh CLI, exit code, JSON output', en: 'every reason_code with its fix, CLI commands, exit codes, JSON output' },
		match: (s) => /^loi$|^cli\//.test(s),
	},
	{
		slug: 'account',
		label: { vi: 'Tài khoản và thanh toán', en: 'Account and billing' },
		about: { vi: 'dùng thử, gói, hoá đơn, thành viên, phân quyền, agency', en: 'trial, plans, invoices, members, roles, agencies' },
		match: (s) => /^huong-dan\/(tai-khoan-va-goi|goi-gioi-han-va-hoa-don)$|^workspace\//.test(s),
	},
];

export const text = (body: string) =>
	new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
export const markdown = (body: string) =>
	new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
