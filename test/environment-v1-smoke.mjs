import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('app/environment-v1');
const base = process.env.TAGRO_TEST_BASE || 'http://127.0.0.1:4173';
const artifacts = path.resolve('test-artifacts/environment-v1');
fs.mkdirSync(artifacts, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function localTarget(raw) {
  if (!raw || !raw.startsWith('./')) return null;
  const clean = raw.slice(2).split('#')[0].split('?')[0];
  return clean || null;
}

function staticReferenceGate() {
  const pages = ['info.html', 'workbench.html', 'index.html'];
  const missing = [];
  for (const pageName of pages) {
    const html = fs.readFileSync(path.join(root, pageName), 'utf8');
    const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
    for (const raw of refs) {
      const target = localTarget(raw);
      if (!target) continue;
      const candidate = path.join(root, target);
      if (!fs.existsSync(candidate)) missing.push(`${pageName} -> ${raw}`);
    }
  }
  assert(!missing.length, `Missing local page dependency/route:\n${missing.join('\n')}`);
}

async function openChecked(browser, name, urlPath, check) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  const response = await page.goto(`${base}${urlPath}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  assert(response?.ok(), `${name}: HTTP ${response?.status()}`);
  await page.waitForSelector('.tagro-appshell', { timeout: 15000 });
  await check(page);
  await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: false });
  const relevantErrors = errors.filter(text => !/favicon/i.test(text));
  assert(!relevantErrors.length, `${name}: browser errors:\n${relevantErrors.join('\n')}`);
  await context.close();
}

staticReferenceGate();
const browser = await chromium.launch({ headless: true });
try {
  await openChecked(browser, 'information', '/info.html', async page => {
    await page.waitForFunction(() => document.querySelector('[data-shell-page="information"]')?.classList.contains('active'));
    assert(await page.locator('#tagroShellJob').count() === 1, 'Information: shared job identity missing');
    assert(await page.getByRole('button', { name: 'Save', exact: true }).first().isVisible(), 'Information: Save command missing');
    assert(await page.getByRole('button', { name: 'Add plot', exact: true }).isVisible(), 'Information: Add plot command missing');
    assert(await page.getByRole('button', { name: 'Measure on map', exact: true }).isVisible(), 'Information: Measure on map command missing');
  });

  await openChecked(browser, 'field', '/workbench.html?view=field', async page => {
    await page.waitForFunction(() => window.TAGROWorkbenchRuntime?.ok === true, null, { timeout: 15000 });
    await page.waitForFunction(() => document.querySelector('[data-shell-page="field"]')?.classList.contains('active'));
    await page.waitForFunction(() => {
      const map = document.getElementById('map');
      const rect = map?.getBoundingClientRect();
      return Boolean(map?._leaflet_id && rect && rect.width > 400 && rect.height > 300 && document.querySelector('.leaflet-map-pane'));
    }, null, { timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll('.leaflet-tile').length > 0, null, { timeout: 15000 });
    const mutationCount = await page.evaluate(async () => {
      const target = document.getElementById('status');
      if (!target) return -1;
      let count = 0;
      const observer = new MutationObserver(() => { count += 1; });
      observer.observe(target, { childList: true, characterData: true, subtree: true });
      await new Promise(resolve => setTimeout(resolve, 1200));
      observer.disconnect();
      return count;
    });
    assert(mutationCount >= 0 && mutationCount <= 3, `Field: status is still mutating while idle (${mutationCount} changes/1.2s)`);
    assert(await page.getByRole('button', { name: 'Boundary', exact: true }).first().isVisible(), 'Field: Boundary command missing');
    assert(await page.getByRole('button', { name: 'Main', exact: true }).first().isVisible(), 'Field: Main command missing');
    assert(await page.getByRole('button', { name: 'Ruler', exact: true }).first().isVisible(), 'Field: Ruler command missing');
  });

  await openChecked(browser, 'drawing', '/workbench.html?view=drawing', async page => {
    await page.waitForFunction(() => document.querySelector('[data-shell-page="drawing"]')?.classList.contains('active'));
    await page.waitForFunction(() => document.getElementById('drawingSurface')?.classList.contains('on'));
    assert(await page.locator('#drawingCanvas').isVisible(), 'Drawing: canonical drawing canvas not visible');
  });

  await openChecked(browser, 'adviser', '/index.html#adviser', async page => {
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.surface === 'adviser');
    await page.waitForFunction(() => document.querySelector('[data-shell-page="adviser"]')?.classList.contains('active'));
    assert(await page.locator('#adviserInput').isVisible(), 'Adviser: input missing');
    assert(!(await page.locator('#activeToolChip').isVisible()), 'Adviser: Field active-tool chip leaked into Adviser');
    assert(!(await page.locator('#workMenu').isVisible()), 'Adviser: Field work menu leaked into Adviser');
  });

  await openChecked(browser, 'design', '/index.html#design', async page => {
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.surface === 'design');
    await page.waitForFunction(() => document.querySelector('[data-shell-page="design"]')?.classList.contains('active'));
    assert(await page.locator('#networkSummary').isVisible(), 'Design: network summary missing');
    assert(await page.locator('#engineeringStatus').isVisible(), 'Design: engineering status missing');
  });

  await openChecked(browser, 'materials', '/index.html#materials', async page => {
    await page.waitForFunction(() => document.querySelector('#app')?.dataset.surface === 'materials');
    await page.waitForFunction(() => document.querySelector('[data-shell-page="materials"]')?.classList.contains('active'));
    assert(await page.locator('#materialsList').isVisible(), 'Materials: material list missing');
    assert(!(await page.locator('#activeToolChip').isVisible()), 'Materials: Field active-tool chip leaked into Materials');
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${base}/info.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tagro-appshell');
  await page.getByRole('button', { name: 'Field', exact: true }).click();
  await page.waitForURL(/workbench\.html\?view=field/, { timeout: 15000 });
  await page.waitForSelector('.tagro-appshell');
  await page.getByRole('button', { name: 'Drawing', exact: true }).click();
  await page.waitForFunction(() => new URL(location.href).searchParams.get('view') === 'drawing');
  await page.getByRole('button', { name: 'Adviser', exact: true }).click();
  await page.waitForURL(/index\.html#adviser/, { timeout: 15000 });
  await page.waitForSelector('.tagro-appshell');
  await page.getByRole('button', { name: 'Design', exact: true }).click();
  await page.waitForFunction(() => location.hash === '#design');
  await page.getByRole('button', { name: 'Materials', exact: true }).click();
  await page.waitForFunction(() => location.hash === '#materials');
  await page.getByRole('button', { name: 'Information', exact: true }).click();
  await page.waitForURL(/info\.html/, { timeout: 15000 });
  await context.close();

  console.log('TAGRO environment-v1 smoke gate: PASS');
} finally {
  await browser.close();
}
