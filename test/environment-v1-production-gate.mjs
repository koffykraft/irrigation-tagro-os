import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.TAGRO_TEST_BASE || 'http://127.0.0.1:4173';
const artifacts = path.resolve('test-artifacts/environment-v1-production');
fs.mkdirSync(artifacts, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function monitor(page, expected = []) {
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('response', response => {
    if (response.status() < 400) return;
    const url = new URL(response.url());
    if (/favicon/i.test(url.pathname)) return;
    if (url.pathname === '/health' && base.startsWith('http://127.0.0.1:')) return;
    if (expected.some(pattern => pattern.test(response.url()))) return;
    errors.push(`http ${response.status()}: ${response.url()}`);
  });
  return errors;
}

async function assertViewport(page, name) {
  const measure = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth
  }));
  assert(measure.documentWidth <= measure.innerWidth + 2, `${name}: document overflows viewport (${measure.documentWidth} > ${measure.innerWidth})`);
  assert(measure.bodyWidth <= measure.innerWidth + 2, `${name}: body overflows viewport (${measure.bodyWidth} > ${measure.innerWidth})`);
}

async function pageSetGate(browser) {
  const context = await browser.newContext({ viewport: { width: 1200, height: 850 } });
  const page = await context.newPage();
  const errors = monitor(page);
  const response = await page.goto(`${base}/page-set.html`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), `Page set: HTTP ${response?.status()}`);
  const links = [
    './info.html',
    './workbench.html?view=field',
    './workbench.html?view=drawing',
    './index.html#adviser',
    './index.html#design',
    './index.html#materials'
  ];
  for (const href of links) assert(await page.locator(`a[href="${href}"]`).count() >= 1, `Page set: missing ${href}`);
  assert(await page.locator('.card').count() === 6, 'Page set: expected exactly six primary page cards');
  await assertViewport(page, 'Page set desktop');
  await page.screenshot({ path: path.join(artifacts, 'page-set-desktop.png'), fullPage: true });
  assert(!errors.length, `Page set browser errors:\n${errors.join('\n')}`);
  await context.close();
}

async function responsiveSixPageGate(browser) {
  const targets = [
    ['information', '/info.html', '[data-shell-page="information"]'],
    ['field', '/workbench.html?view=field', '[data-shell-page="field"]'],
    ['drawing', '/workbench.html?view=drawing', '[data-shell-page="drawing"]'],
    ['adviser', '/index.html#adviser', '[data-shell-page="adviser"]'],
    ['design', '/index.html#design', '[data-shell-page="design"]'],
    ['materials', '/index.html#materials', '[data-shell-page="materials"]']
  ];
  const viewports = [
    ['desktop', { width: 1440, height: 900 }],
    ['phone', { width: 390, height: 844 }]
  ];

  for (const [sizeName, viewport] of viewports) {
    for (const [name, route, active] of targets) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const errors = monitor(page);
      const response = await page.goto(`${base}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      assert(response?.ok(), `${name}/${sizeName}: HTTP ${response?.status()}`);
      await page.waitForSelector('.tagro-appshell', { timeout: 15000 });
      await page.waitForFunction(selector => document.querySelector(selector)?.classList.contains('active'), active);
      if (name === 'field' || name === 'drawing') {
        await page.waitForFunction(() => window.TAGROWorkbenchRuntime?.ok === true, null, { timeout: 15000 });
      }
      await assertViewport(page, `${name}/${sizeName}`);
      assert(await page.locator('.tagro-shell-pages').isVisible(), `${name}/${sizeName}: Pages launcher control missing`);
      if (sizeName === 'phone') {
        const buttons = await page.locator('.tagro-ribbon-btn:visible').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
        assert(buttons.every(height => height >= 34), `${name}/${sizeName}: ribbon touch target below 34px`);
      }
      await page.screenshot({ path: path.join(artifacts, `${name}-${sizeName}.png`), fullPage: false });
      assert(!errors.length, `${name}/${sizeName}: browser errors:\n${errors.join('\n')}`);
      await context.close();
    }
  }
}

async function canonicalIntegrationGate(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = monitor(page);
  await page.goto(`${base}/workbench.html?view=field`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TAGROWorkbenchRuntime?.ok === true && window.TAGROSpatial);

  await page.evaluate(() => {
    const s = window.TAGROSpatial;
    s.clear();
    s.addObject('boundary', { type:'Polygon', coordinates:[[[76.8600,9.0000],[76.8612,9.0000],[76.8612,9.0012],[76.8600,9.0012],[76.8600,9.0000]]] }, { name:'Production gate boundary' });
    s.addObject('main', { type:'LineString', coordinates:[[76.8601,9.0001],[76.8610,9.0010]] }, { name:'Gate main' });
    s.addObject('submain', { type:'LineString', coordinates:[[76.8601,9.00045],[76.8610,9.00045]] }, { name:'Gate submain' });
    s.setParent(['S1'], 'M1', 'production_gate');
    s.addObject('plant', { type:'Point', coordinates:[76.86030,9.00075] }, { name:'Gate plant 1' });
    s.addObject('plant', { type:'Point', coordinates:[76.86065,9.00075] }, { name:'Gate plant 2' });
  });

  const relationshipCheck = await page.evaluate(() => {
    const state = window.TAGROSpatial.snapshot();
    return {
      parent: state.objects.find(o => o.id === 'S1')?.properties?.network?.parent_id,
      relation: state.relationships.some(r => r.role === 'network_parent' && r.from === 'M1' && r.to === 'S1')
    };
  });
  assert(relationshipCheck.parent === 'M1', 'Canonical relationship: S1 parent property missing');
  assert(relationshipCheck.relation, 'Canonical relationship: explicit M1 -> S1 relation missing');

  const proposal = await page.evaluate(() => {
    const spec = {
      proposal_id: 'production_gate_laterals',
      kind: 'geometry',
      summary: 'Generate laterals from S1 to marked plants',
      affected_ids: ['S1','P1','P2'],
      intent: { operation:'generate_laterals', anchor_ids:['S1'], parameters:{ side:'unknown' } }
    };
    const preview = window.TAGROSpatialProposal.preview(spec);
    if (!preview?.ok) return { preview, accepted:null, state:null };
    const accepted = window.TAGROSpatialProposal.accept();
    return { preview, accepted, state:window.TAGROSpatial.snapshot() };
  });
  assert(proposal.preview?.ok, `Spatial proposal preview failed: ${JSON.stringify(proposal.preview)}`);
  assert(proposal.accepted?.ok, 'Spatial proposal acceptance failed');
  const generated = proposal.state.objects.filter(o => o.kind === 'lateral' && o.properties?.accepted_from_proposal === 'production_gate_laterals');
  assert(generated.length >= 1, 'Proposal acceptance: no canonical laterals created');
  for (const lateral of generated) {
    assert(lateral.properties?.network?.parent_id === 'S1', `${lateral.id}: proposal parent is not S1`);
    assert(proposal.state.relationships.some(r => r.role === 'network_parent' && r.from === 'S1' && r.to === lateral.id), `${lateral.id}: explicit S1 relationship missing`);
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TAGROSpatial?.snapshot?.().relationships?.length >= 2);
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().relationships.some(r => r.from === 'M1' && r.to === 'S1')), 'Canonical relationship did not persist through reload');

  await page.goto(`${base}/index.html#design`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tagro-appshell');
  await page.waitForFunction(() => document.querySelector('#app')?.dataset.surface === 'design');
  await page.waitForFunction(() => document.getElementById('engineeringStatus')?.textContent.includes('Canonical FIELD/DRAWING'), null, { timeout: 15000 });
  await page.waitForTimeout(900);
  assert((await page.locator('#engineeringStatus').textContent()).includes('Canonical FIELD/DRAWING'), 'Design: old renderer overwrote canonical projection');
  assert((await page.locator('#engineeringStatus').textContent()).includes('Network ties'), 'Design: explicit network ties not surfaced');

  await page.locator('.tagro-shell-tab[data-shell-page="materials"]').click();
  await page.waitForFunction(() => document.querySelector('#app')?.dataset.surface === 'materials');
  await page.waitForFunction(() => document.getElementById('productKnowledgeText')?.textContent.includes('Canonical measured requirements'), null, { timeout: 15000 });
  await page.waitForTimeout(500);
  assert((await page.locator('#materialsList').textContent()).includes('measured'), 'Materials: canonical measured quantities missing');
  assert((await page.locator('#productKnowledgeText').textContent()).includes('Canonical measured requirements'), 'Materials: old renderer overwrote canonical projection');

  await page.screenshot({ path: path.join(artifacts, 'canonical-materials.png'), fullPage: false });
  assert(!errors.length, `Canonical integration browser errors:\n${errors.join('\n')}`);
  await context.close();
}

async function informationStorageFailureGate(browser) {
  const context = await browser.newContext({ viewport: { width: 900, height: 760 } });
  await context.addInitScript(() => {
    const original = Storage.prototype.setItem;
    let armed = false;
    window.addEventListener('load', () => { armed = true; });
    Storage.prototype.setItem = function(key, value) {
      if (armed && String(key).includes('tagro.irrigation.jobinfo.v1')) throw new DOMException('Simulated quota failure', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  const page = await context.newPage();
  const errors = monitor(page);
  await page.goto(`${base}/info.html`, { waitUntil: 'load' });
  await page.waitForSelector('.tagro-appshell');
  await page.waitForFunction(() => Boolean(document.body.dataset.informationPersistence), null, { timeout: 5000 });
  const toggle = page.getByRole('button', { name: 'Customer details', exact: true });
  if (await toggle.count()) await toggle.click();
  await page.fill('#customerName', 'Storage failure gate');
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => /Not saved on device/i.test(document.getElementById('saveState')?.textContent || ''), null, { timeout: 5000 });
  assert(await page.locator('#customerName').inputValue() === 'Storage failure gate', 'Information storage failure: current session value was lost immediately');
  assert(!errors.some(error => error.startsWith('pageerror:')), `Information storage failure caused page exception:\n${errors.join('\n')}`);
  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await pageSetGate(browser);
  await responsiveSixPageGate(browser);
  await canonicalIntegrationGate(browser);
  await informationStorageFailureGate(browser);
  console.log('TAGRO environment-v1 production gate: PASS');
} finally {
  await browser.close();
}
