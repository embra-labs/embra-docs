// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';

export default defineConfig({
	site: 'https://docs.embra.cloud',
	integrations: [
		starlight({
			title: 'Embra Docs',
			description:
				'Tài liệu Embra: hosting app kèm Postgres riêng cho Việt Nam. Deploy từ GitHub, migration có cổng duyệt, backup và khôi phục.',
			logo: { src: './src/assets/logo.svg', alt: 'Embra' },
			favicon: '/favicon.svg',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Tiếng Việt', lang: 'vi' },
				en: { label: 'English', lang: 'en' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/embra-labs' }],
			customCss: ['./src/styles/theme.css'],
			lastUpdated: true,
			plugins: [
				starlightLlmsTxt({
					projectName: 'Embra',
				}),
			],
			sidebar: [
				{
					label: 'Bắt đầu',
					translations: { en: 'Getting started' },
					items: [{ autogenerate: { directory: 'bat-dau' } }],
				},
				{
					label: 'Workspace',
					items: [{ autogenerate: { directory: 'workspace' } }],
				},
				{
					label: 'CLI',
					items: [{ autogenerate: { directory: 'cli' } }],
				},
			],
		}),
	],
});
