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
			favicon: '/favicon.svg',
			head: [
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: 'any' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				{ tag: 'meta', attrs: { name: 'theme-color', content: '#232323' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://embra.cloud/og-beta-launch.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://embra.cloud/og-beta-launch.png' } },
			],
			defaultLocale: 'root',
			locales: {
				root: { label: 'Tiếng Việt', lang: 'vi' },
				en: { label: 'English', lang: 'en' },
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/embra-labs' }],
			customCss: ['./src/styles/fonts.css', './src/styles/theme.css'],
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			expressiveCode: { themes: ['github-light'] },
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
					label: 'Hướng dẫn',
					translations: { en: 'Guides' },
					items: [{ autogenerate: { directory: 'huong-dan' } }],
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
