import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) });
page.on('pageerror', err => errors.push(err.message));

await page.goto('https://episodiouno.com', { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/prod-check.png' });

const bodyText = await page.locator('body').innerText().catch(() => '');
console.log('Texto visible:', bodyText.slice(0, 200));
console.log('Errores JS:', errors.length ? errors : 'ninguno');

await browser.close();
