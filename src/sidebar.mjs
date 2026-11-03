// Sidebar groups, shared by astro.config.mjs and the agent endpoints (llms.txt, per-page .md), so the
// order an agent reads in matches the order a person sees.
export const sidebar = [
	{
		label: 'Bắt đầu',
		translations: { en: 'Getting started' },
		items: [{ autogenerate: { directory: 'bat-dau' } }],
	},
	{
		label: 'Kiến trúc',
		translations: { en: 'Architecture' },
		items: [
			'kien-truc/cach-embra-chay-app',
			'kien-truc/operation-va-trang-thai',
			'kien-truc/gioi-han-he-thong',
		],
	},
	{
		label: 'Đưa app lên',
		translations: { en: 'Ship your app' },
		items: [
			'huong-dan/chuan-bi-app',
			'huong-dan/deploy-tu-github',
			'huong-dan/chuyen-app-co-san',
			'huong-dan/ai-agent',
		],
	},
	{
		label: 'Cấu hình app',
		translations: { en: 'Configure your app' },
		items: [
			'huong-dan/bien-moi-truong',
			'huong-dan/secret',
			'huong-dan/database',
			'huong-dan/luu-file',
			'huong-dan/domain-rieng',
		],
	},
	{
		label: 'Database và migration gate',
		translations: { en: 'Database and migration gate' },
		items: [
			'huong-dan/database-va-migration',
			'huong-dan/migration-an-toan',
			'huong-dan/expand-contract',
		],
	},
	{
		label: 'Vận hành',
		translations: { en: 'Operate' },
		items: [
			'huong-dan/staging-production-va-duyet',
			'huong-dan/log-va-theo-doi',
		],
	},
	{
		label: 'Khôi phục sự cố',
		translations: { en: 'Incident recovery' },
		items: [
			'huong-dan/runbook-su-co',
			'huong-dan/rollback-va-khoi-phuc',
			'huong-dan/undo-tung-dong',
		],
	},
	{
		label: 'Tài khoản và thanh toán',
		translations: { en: 'Account and billing' },
		items: [
			'huong-dan/tai-khoan-va-goi',
			'huong-dan/goi-gioi-han-va-hoa-don',
			'workspace/phan-quyen',
			'workspace/thanh-vien-va-agency',
		],
	},
	{
		label: 'Xử lý lỗi',
		translations: { en: 'Troubleshooting' },
		items: [{ autogenerate: { directory: 'loi' } }],
	},
	{
		label: 'CLI',
		items: [{ autogenerate: { directory: 'cli' } }],
	},
];
