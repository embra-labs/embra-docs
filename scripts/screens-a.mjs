// Regenerates screenshots for the "Chuyển app có sẵn" page from the dashboard's mock mode.
// Run from an embra-dashboard checkout: VITE_MOCK=1 npx vite dev --port 5201 --strictPort
// then: node <this file> <embra-docs>/src/assets/screens
import { chromium } from 'playwright';
const out = process.argv[2];
const B = 'http://localhost:5201';
const dump = Buffer.from('COPY public.users (id, email) FROM stdin;\n' + '1\ta@x.vn\n'.repeat(320) + '\\.\n');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 });
await p.goto(B + '/p/prj_demo/e/env_prod?scenario=import-resume');
await p.getByRole('button', { name: 'Kiến trúc', exact: true }).click();
await p.locator('[data-id="database:postgres"]').click();
await p.getByRole('button', { name: 'Nhập dữ liệu…' }).click();
const dialog = p.getByRole('dialog', { name: 'Nhập dữ liệu' });
await dialog.getByLabel('File dump (.sql hoặc .sql.gz)').setInputFiles({ name: 'data.sql', mimeType: 'application/sql', buffer: dump });
await dialog.getByRole('button', { name: 'Tải lên và kiểm' }).click();
await dialog.getByText('File có').waitFor();
await dialog.getByRole('button', { name: 'Kiểm với database' }).click();
const plan = dialog.getByRole('region', { name: 'Kết quả kiểm' });
await plan.waitFor();
await p.waitForTimeout(500);
await plan.screenshot({ path: out + '/chuyen-app-import-check.png' });
await b.close();
