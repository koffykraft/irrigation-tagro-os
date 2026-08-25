import { chromium } from 'playwright';

const base = process.env.TAGRO_TEST_BASE || 'http://127.0.0.1:4173';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function selectCanonicalObject(page, id) {
  const objects = page.locator('.tagro-existing');
  const count = await objects.count();
  const seen = [];
  for (let index = 0; index < count; index += 1) {
    await objects.nth(index).evaluate(element => {
      const rect = element.getBoundingClientRect();
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      }));
    });
    await page.waitForTimeout(25);
    const name = (await page.locator('#selectionName').textContent().catch(() => ''))?.trim() || '';
    seen.push(name || '(no selection)');
    if (name === id || name.startsWith(`${id} ·`)) return;
  }
  throw new Error(`Field: could not select ${id} through rendered map objects; inspector saw ${seen.join(' | ')}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

try {
  // Information: use the visible progressive path, edit, save, reload.
  await page.goto(`${base}/info.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tagro-appshell');
  const customerToggle = page.getByRole('button', { name: 'Customer details', exact: true });
  if (await customerToggle.count()) await customerToggle.click();
  await page.waitForFunction(() => {
    const el = document.getElementById('customerName');
    return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
  await page.fill('#customerName', 'Functional Test Farm');
  await page.fill('#customerLocation', 'Karavaloor');
  await page.locator('.plot-card').first().locator('[data-field="crop"]').fill('Pepper');
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(() => /rev\s+[1-9]\d*/i.test(document.getElementById('saveState')?.textContent || ''));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.tagro-appshell');
  assert(await page.inputValue('#customerName') === 'Functional Test Farm', 'Information: customer name did not persist');
  assert(await page.inputValue('#customerLocation') === 'Karavaloor', 'Information: location did not persist');
  assert(await page.locator('.plot-card').first().locator('[data-field="crop"]').inputValue() === 'Pepper', 'Information: crop did not persist');

  // Navigate to Field.
  await page.locator('.tagro-shell-tab[data-shell-page="field"]').click();
  await page.waitForURL(/workbench\.html\?view=field/);
  await page.waitForFunction(() => window.TAGROWorkbenchRuntime?.ok === true);
  await page.waitForFunction(() => document.getElementById('map')?._leaflet_id);

  // Every primary Field tool must reach the real underlying tool handler.
  const tools = [
    ['Select','select'],['Boundary','boundary'],['Plot','plot'],['Section','section'],['Crop area','crop_area'],
    ['Path','path'],['High','high_point'],['Low','low_point'],['Water','water_source'],['Pump','pump'],['Tank','tank'],
    ['Main','main'],['Submain','submain'],['Lateral','lateral'],['Plant','plant'],['Device','device']
  ];
  for (const [label, kind] of tools) {
    await page.locator('#tagroShellRibbon').getByRole('button', { name: label, exact: true }).click();
    await page.waitForFunction(k => document.querySelector(`#toolDock [data-tool="${k}"]`)?.classList.contains('on'), kind);
  }
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Select', exact: true }).click();

  // Ruler and full tool dock must open and close.
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Ruler', exact: true }).click();
  await page.waitForFunction(() => document.getElementById('measurePanel')?.classList.contains('show'));
  await page.click('#closeMeasure');
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'All tools', exact: true }).click();
  await page.waitForFunction(() => document.getElementById('toolDock')?.classList.contains('open'));
  await page.click('#closeTools');

  // Real UI point drawing through Leaflet-Geoman.
  const plantsBefore = await page.evaluate(() => window.TAGROSpatial.snapshot().objects.filter(o => o.kind === 'plant').length);
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Plant', exact: true }).click();
  const mapBox = await page.locator('#map').boundingBox();
  assert(mapBox && mapBox.width > 400 && mapBox.height > 300, 'Field: map has no usable drawing area');
  await page.mouse.click(mapBox.x + mapBox.width * 0.55, mapBox.y + mapBox.height * 0.55);
  await page.waitForFunction(before => window.TAGROSpatial.snapshot().objects.filter(o => o.kind === 'plant').length > before, plantsBefore);
  await page.locator('#tagroShellRibbon').getByRole('button', { name: 'Select', exact: true }).click();

  // Create a deterministic canonical sample for manipulation tests.
  await page.evaluate(() => {
    const s = window.TAGROSpatial;
    s.clear();
    s.addObject('boundary', { type:'Polygon', coordinates:[[[76.86,9.00],[76.861,9.00],[76.861,9.001],[76.86,9.001],[76.86,9.00]]] }, { name:'Test boundary' });
    s.addObject('main', { type:'LineString', coordinates:[[76.8601,9.0001],[76.8609,9.0009]] }, { name:'Test main' });
    s.addObject('submain', { type:'LineString', coordinates:[[76.8602,9.0004],[76.8608,9.0004]] }, { name:'Test submain' });
    s.addObject('lateral', { type:'LineString', coordinates:[[76.8603,9.0004],[76.8603,9.0008]] }, { name:'Lateral A' });
    s.addObject('lateral', { type:'LineString', coordinates:[[76.8606,9.0004],[76.8606,9.0008]] }, { name:'Lateral B' });
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.TAGROWorkbenchRuntime?.ok === true);
  await page.waitForFunction(() => document.querySelectorAll('.tagro-existing').length >= 5);
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().objects.length) === 5, 'Field: canonical sample did not persist through reload');

  // Boundary: selection, Details, duplicate, delete.
  await selectCanonicalObject(page, 'B1');
  await page.waitForFunction(() => document.getElementById('inspector')?.classList.contains('show'));
  await page.click('#labelSelected');
  await page.waitForFunction(() => document.getElementById('propertyPanel')?.classList.contains('show'));
  await page.fill('#propName', 'Edited boundary');
  await page.click('#saveProperties');
  await page.waitForFunction(() => window.TAGROSpatial.snapshot().objects.find(o => o.id === 'B1')?.properties?.name === 'Edited boundary');

  const countBeforeDuplicate = await page.evaluate(() => window.TAGROSpatial.snapshot().objects.length);
  await page.click('#duplicateSelected');
  await page.waitForFunction(n => window.TAGROSpatial.snapshot().objects.length === n + 1, countBeforeDuplicate);
  await page.click('#deleteSelected');
  await page.waitForFunction(n => window.TAGROSpatial.snapshot().objects.length === n, countBeforeDuplicate);

  // Main: move, rotate and connection panel.
  await selectCanonicalObject(page, 'M1');
  const mainBefore = await page.evaluate(() => JSON.stringify(window.TAGROSpatial.snapshot().objects.find(o => o.id === 'M1')?.geometry?.coordinates));
  await page.click('#moveSelected');
  await page.waitForFunction(() => document.getElementById('manipPanel')?.classList.contains('show'));
  await page.locator('[data-nudge="east"]').click();
  await page.waitForFunction(before => JSON.stringify(window.TAGROSpatial.snapshot().objects.find(o => o.id === 'M1')?.geometry?.coordinates) !== before, mainBefore);
  await page.click('#rotateSelected');
  await page.locator('[data-rotate="5"]').click();
  await page.click('#connectSelected');
  await page.waitForFunction(() => document.getElementById('connectPanel')?.classList.contains('show'));
  await page.click('#closeConnect');

  // Submain: Layout control must open.
  await selectCanonicalObject(page, 'S1');
  await page.click('#layoutSelected');
  await page.waitForFunction(() => document.getElementById('layoutPanel')?.classList.contains('show'));
  await page.click('#closeLayout');

  // Lateral: emitter control and same-type multi-select.
  await selectCanonicalObject(page, 'L1');
  await page.click('#emitterSelected');
  await page.waitForFunction(() => document.getElementById('emitterPanel')?.classList.contains('show'));
  await page.fill('#emitSpacing', '3');
  await page.fill('#emitDischarge', '4');
  await page.fill('#emitHead', '10');
  await page.click('#applyEmitter');
  await page.waitForFunction(() => window.TAGROSpatial.snapshot().objects.find(o => o.id === 'L1')?.properties?.emitter?.discharge_lph === 4);
  await page.click('#closeEmitter');
  await page.click('#selectSame');
  await page.waitForFunction(() => /2 selected/.test(document.getElementById('multiCount')?.textContent || ''));
  await page.click('#clearMulti');

  // Drawing must use the same canonical objects and survive reload.
  await page.locator('.tagro-shell-tab[data-shell-page="drawing"]').click();
  await page.waitForFunction(() => document.getElementById('drawingSurface')?.classList.contains('on'));
  await page.waitForFunction(() => document.querySelectorAll('.draw-object').length >= 5);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.getElementById('drawingSurface')?.classList.contains('on'));
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().objects.length) === 5, 'Drawing: canonical objects were not persistent');
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().objects.find(o => o.id === 'B1')?.properties?.name) === 'Edited boundary', 'Drawing: edited properties did not persist');
  assert(await page.evaluate(() => window.TAGROSpatial.snapshot().objects.find(o => o.id === 'L1')?.properties?.emitter?.discharge_lph) === 4, 'Drawing: emitter information did not persist');

  assert(!pageErrors.length, `Functional browser errors:\n${pageErrors.join('\n')}`);
  console.log('TAGRO environment-v1 functional gate: PASS');
} finally {
  await context.close();
  await browser.close();
}
