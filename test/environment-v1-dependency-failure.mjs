import { chromium } from 'playwright';

const base = process.env.TAGRO_TEST_BASE || 'http://127.0.0.1:4173';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

try {
  await page.route(/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js/, route => route.abort('failed'));
  const response = await page.goto(`${base}/workbench.html?view=field`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  assert(response?.ok(), `Dependency failure gate: Workbench HTTP ${response?.status()}`);
  await page.waitForSelector('.tagro-appshell', { timeout: 15000 });
  await page.waitForSelector('.runtime-failure', { timeout: 15000 });
  const runtime = await page.evaluate(() => window.TAGROWorkbenchRuntime);
  assert(runtime?.ok === false, 'Dependency failure gate: runtime did not enter safe failure state');
  assert(runtime?.missing?.some(item => /Leaflet map library/i.test(item)), 'Dependency failure gate: missing Leaflet was not identified');
  assert(/Field map could not start/i.test(await page.locator('.runtime-failure').textContent()), 'Dependency failure gate: visible failure message missing');
  assert(await page.locator('#toolDock button:disabled').count() > 0, 'Dependency failure gate: map tools were not disabled');
  assert(await page.evaluate(() => Boolean(window.TAGROSpatial)), 'Dependency failure gate: canonical local store did not load');

  await page.evaluate(() => {
    window.TAGROSpatial.addObject('note', { type:'Point', coordinates:[76.8,9.0] }, { name:'dependency failure state check' });
  });
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().objects.some(o => o.properties?.name === 'dependency failure state check')), 'Dependency failure gate: local job store became unusable');
  assert(!errors.length, `Dependency failure gate caused page exceptions:\n${errors.join('\n')}`);
  console.log('TAGRO environment-v1 dependency failure gate: PASS');
} finally {
  await context.close();
  await browser.close();
}
