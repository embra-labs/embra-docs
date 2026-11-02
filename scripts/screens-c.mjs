// Regenerates screenshots for rollback, account/billing and members/agency pages from the dashboard's mock mode.
// Run from an embra-dashboard checkout: VITE_MOCK=1 npx vite dev --port 5203 --strictPort
// then: node <this file> <embra-docs>/src/assets/screens [base-url]
import { chromium } from 'playwright';
const out = process.argv[2];
const B = process.argv[3] || 'http://localhost:5203';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const settle = () => p.waitForTimeout(600);

// Rollback: the "Lịch sử & khôi phục" rail on a live environment.
await p.goto(B + '/p/prj_demo/e/env_prod?scenario=live');
const rail = p.getByRole('region', { name: /Lịch sử & khôi phục/ }).first();
await rail.waitFor();
await settle();
await rail.screenshot({ path: out + '/rollback-rail.png' });

// Restore: the "Khôi phục dữ liệu…" dialog with the restorable window.
await p.goto(B + '/p/prj_demo/e/env_prod?scenario=recovery');
await p.getByRole('button', { name: 'Kiến trúc', exact: true }).click();
await p.getByRole('button', { name: /Tìm service/ }).click();
await p.getByRole('button', { name: 'postgres › Khôi phục dữ liệu…' }).click();
await p.getByLabel(/Mốc khôi phục/).fill('2026-10-10T10:00');
await p.getByRole('dialog').first().getByRole('heading').first().click();
await settle();
await p.getByRole('dialog').first().screenshot({ path: out + '/rollback-restore.png' });

// Billing: picking a plan and prepay term.
await p.goto(B + '/billing?billing=choose-term');
await p.getByRole('button', { name: 'Chọn Start' }).waitFor();
await settle();
await p.screenshot({ path: out + '/tai-khoan-chon-goi.png', clip: { x: 250, y: 0, width: 900, height: 540 } });

// Members: invite form and member list.
await p.goto(B + '/p/prj_demo/e/env_prod?view=settings&section=members');
await p.getByRole('button', { name: 'Mời', exact: true }).waitFor();
await settle();
await p.locator('section, div').filter({ has: p.getByRole('heading', { name: 'Mời người vào' }) }).filter({ has: p.getByRole('heading', { name: 'Thành viên' }) }).last().screenshot({ path: out + '/thanh-vien-moi.png' });

// Agency account page.
await p.goto(B + '/agency?billing=partner');
await settle();
// agency page not captured: mock shows the partner discount, which is not public
await b.close();
