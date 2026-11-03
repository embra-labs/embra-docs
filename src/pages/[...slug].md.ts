// /<slug>.md and /en/<slug>.md: the raw Markdown of every page, for agents.
import type { APIRoute } from 'astro';
import { docsFor, markdown, toMarkdown } from '../lib/agent-docs';

export async function getStaticPaths() {
	const docs = [...(await docsFor('vi')), ...(await docsFor('en'))];
	return docs.map((d) => ({ params: { slug: d.id }, props: { d } }));
}

export const GET: APIRoute = ({ props }) => markdown(toMarkdown(props.d));
