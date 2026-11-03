import type { APIRoute } from 'astro';
import { text } from '../../lib/agent-docs';
import { llmsIndex } from '../_llms-index';
export const GET: APIRoute = async () => text(await llmsIndex('en'));
