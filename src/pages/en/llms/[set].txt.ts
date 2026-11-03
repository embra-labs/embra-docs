import type { APIRoute } from 'astro';
import { bundle, sets, text } from '../../../lib/agent-docs';
export const getStaticPaths = () => sets.map((s) => ({ params: { set: s.slug } }));
export const GET: APIRoute = async ({ params }) => {
	const s = sets.find((x) => x.slug === params.set)!;
	return text(await bundle('en', s.match));
};
