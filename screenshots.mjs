import { chromium } from 'playwright';
import path from 'path';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

const shot = async (name) => {
  await page.waitForTimeout(800);
  await page.screenshot({ path: `/tmp/screen-${name}.png`, fullPage: false });
  console.log(`✓ ${name}`);
};

// Landing
await page.goto('http://localhost:5173');
await shot('01-landing');

// Scroll down landing
await page.evaluate(() => window.scrollTo(0, 600));
await shot('02-landing-scroll');

// Auth - Login
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByText('Iniciar sesión').first().click().catch(() =>
  page.getByText('Entrar').first().click()
);
await page.waitForTimeout(600);
await shot('03-auth-login');

// Auth - Registro
const registerBtn = page.getByText('Crear cuenta').first();
if (await registerBtn.isVisible().catch(() => false)) {
  await registerBtn.click();
  await page.waitForTimeout(600);
  await shot('04-auth-register');
}

await browser.close();
