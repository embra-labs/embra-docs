// /reasons.json: every reason_code with HTTP status, retryable, next_action, CLI exit code and docs links.
// Generated from the product's api/reasons.go by scripts/reasons.mjs.
import type { APIRoute } from 'astro';
import data from '../data/reasons.json';

export const GET: APIRoute = () =>
	new Response(JSON.stringify(data, null, '\t') + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
