import { chromium } from 'playwright';
import * as fs from 'fs';

// Read credentials from env or use test ones
const EMAIL = process.env.TEST_EMAIL || '';
const PASS  = process.env.TEST_PASS  || '';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();

const shot = async (name) => {
  await page.waitForTimeout(900);
  await page.screenshot({ path: `/tmp/screen-${name}.png` });
  console.log(`✓ ${name}`);
};

if (EMAIL && PASS) {
  // Login
  await page.goto('http://localhost:5173');
  await page.getByText('Iniciar sesión').first().click().catch(() =>
    page.getByText('Entrar').first().click().catch(() => {})
  );
  await page.waitForTimeout(500);
  await page.getByPlaceholder(/email/i).fill(EMAIL);
  await page.getByPlaceholder(/contrase/i).fill(PASS);
  await page.getByRole('button', { name: /entrar|iniciar|ingresar/i }).click();
  await page.waitForTimeout(3000);
  await shot('05-dashboard');

  // Navigate pages
  const navItems = ['Hábitos', 'Fitness', 'Comidas', 'Ahorro', 'Inventario'];
  for (const item of navItems) {
    const btn = page.getByText(item, { exact: false }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await shot(`06-${item.toLowerCase()}`);
    }
  }

  // Perfil
  const perfil = page.getByText('Perfil', { exact: false }).first();
  if (await perfil.isVisible().catch(() => false)) {
    await perfil.click();
    await shot('07-perfil');
  }
} else {
  console.log('Sin credenciales — saltando pantallas autenticadas');
}

await browser.close();
