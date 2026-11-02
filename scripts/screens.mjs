// Regenerates docs screenshots from the dashboard's mock mode.
// Run from an embra-dashboard checkout: VITE_MOCK=1 npx vite dev --port 5199 --strictPort
// then: node <this file> <embra-docs>/src/assets/screens
import { chromium } from 'playwright';
const out = process.argv[2];
const B = 'http://localhost:5199';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
await p.goto(B + '/?scenario=onboarding');
await p.getByRole('button', { name: 'Deploy từ GitHub', exact: true }).click();
await p.getByRole('combobox', { name: 'Repository', exact: true }).selectOption('51');
await p.getByRole('button', { name: 'Tiếp tục', exact: true }).click();
await p.getByLabel('Tên app').fill('cua-hang');
await p.getByText('Advanced config', { exact: true }).first().click();
await p.waitForTimeout(400);
await p.getByRole('dialog').first().screenshot({ path: out + '/deploy-github-config.png' });
await p.getByRole('button', { name: 'Tạo và deploy' }).click();
await p.getByRole('region', { name: 'Thay đổi chờ áp dụng' }).waitFor();
await p.waitForTimeout(600);
await p.screenshot({ path: out + '/deploy-github-plan.png', clip: { x: 250, y: 0, width: 1030, height: 330 } });
await p.goto(B + '/p/prj_demo/e/env_prod?scenario=env-import&view=settings&section=secrets');
await p.getByRole('region', { name: 'Còn thiếu 2 biến' }).waitFor();
await p.getByRole('button', { name: 'Dán .env' }).click();
await p.getByLabel('Nội dung .env').fill(['# local','JWT_SECRET="s3cr3t"','export SMTP_URL=smtp://u:p@mail:587','API_KEY=new-key','DATABASE_URL=postgres://localhost/app','PORT=4000'].join('\n'));
await p.waitForTimeout(600);
const sec = p.locator('section, div').filter({ has: p.getByRole('heading', { name: 'Nhập secret từ .env' }) }).last();
await sec.screenshot({ path: out + '/env-paste.png' });
await b.close();
