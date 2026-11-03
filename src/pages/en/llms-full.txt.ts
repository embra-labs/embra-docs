import type { APIRoute } from 'astro';
import { bundle, text } from '../../lib/agent-docs';
export const GET: APIRoute = async () => text(await bundle('en'));
