// Regenerates screenshots for the secret/storage/domain/staging/log pages from the dashboard's mock mode.
// Run from an embra-dashboard checkout: VITE_MOCK=1 npx vite dev --port 5202 --strictPort
// then: node <this file> <embra-docs>/src/assets/screens
import { chromium } from 'playwright';
const out = process.argv[2];
const B = 'http://localhost:5202';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const step = async (name, fn) => {
  try { await fn(); console.log('ok', name); } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); }
};
await step('domain', async () => {
  await p.goto(B + '/p/prj_demo/e/env_prod?scenario=resources&view=settings&section=domains');
  await p.getByLabel('Domain', { exact: true }).fill('www.shop.vn');
  await p.getByRole('button', { name: 'Thêm domain' }).click();
  await p.getByText('_embra-challenge.www', { exact: true }).waitFor();
  // Mock values look like a dev box; show the real production shape instead so nobody copies them.
  await p.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      n.nodeValue = n.nodeValue
        .replace('orders.embra.localhost', 'orders-production-k3x9q2.onembra.com')
        .replace('embra-verify=mock-token', 'embra-verify=7f3a9c2e5b81d4');
    }
  });
  await p.waitForTimeout(500);
  await p.locator('.domain-card').first().screenshot({ path: out + '/domain-rieng-records.png' });
});
await step('staging', async () => {
  await p.goto(B + '/p/prj_demo/e/env_prod?scenario=overview-ready');
  await p.getByRole('button', { name: 'Tạo mới' }).first().click();
  await p.getByRole('button', { name: 'Environment mới' }).click();
  await p.getByLabel('Tên environment').fill('staging');
  await p.waitForTimeout(600);
  const d = await p.getByRole('dialog').first().boundingBox();
  await p.screenshot({ path: out + '/staging-create.png', clip: { x: d.x, y: d.y, width: d.width, height: 255 } });
});
await b.close();
