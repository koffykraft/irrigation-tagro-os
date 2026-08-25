(() => {
'use strict';

const $ = (s, root=document) => root.querySelector(s);
const pageFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
const pageType = pageFile === 'info.html' ? 'info' : pageFile === 'workbench.html' ? 'workbench' : 'index';
const PAGES = [
  ['information','Information'],
  ['field','Field'],
  ['drawing','Drawing'],
  ['adviser','Adviser'],
  ['design','Design'],
  ['materials','Materials']
];
let lastHeight = '';

if (pageType === 'index') {
  const requested = (location.hash || '').slice(1).toLowerCase();
  if (requested === 'field' || requested === 'drawing') {
    location.replace(`./workbench.html?view=${requested}`);
    return;
  }
  if (!['adviser','design','materials'].includes(requested)) {
    location.replace('./info.html');
    return;
  }
}

function currentSurface() {
  if (pageType === 'info') return 'information';
  if (pageType === 'workbench') return $('#drawingMode')?.classList.contains('on') ? 'drawing' : 'field';
  const surface = $('#app')?.dataset?.surface;
  return ['adviser','design','materials'].includes(surface) ? surface : ((location.hash || '#adviser').slice(1));
}

function jobContext() {
  try {
    const api = window.TAGROJobInfo;
    if (!api) return { title: 'Irrigation job', detail: '' };
    const job = api.read(api.ensureJobId());
    const name = String(job?.customer?.name || '').trim();
    const ref = String(job?.customer?.external_reference || '').trim();
    const locationText = String(job?.customer?.location || '').trim();
    const crops = [...new Set((job?.plots || []).map(p => String(p?.crop || '').trim()).filter(Boolean))];
    return {
      title: name || ref || (crops[0] ? `${crops[0]} irrigation` : 'Irrigation job'),
      detail: [locationText, crops[0] && name ? crops[0] : ''].filter(Boolean).join(' · ')
    };
  } catch {
    return { title: 'Irrigation job', detail: '' };
  }
}

const shell = document.createElement('header');
shell.className = 'tagro-appshell';
shell.innerHTML = `
  <div class="tagro-shell-main">
    <strong class="tagro-shell-brand">TAGRO IRRIGATION</strong>
    <span class="tagro-shell-job"><b id="tagroShellJob">Irrigation job</b><small id="tagroShellJobDetail"></small></span>
    <nav id="tagroShellNav" class="tagro-shell-nav" aria-label="Irrigation pages"></nav>
    <span id="tagroShellSave" class="tagro-shell-save">Job active</span>
  </div>
  <div id="tagroShellRibbon" class="tagro-shell-ribbon" aria-label="Page tools" hidden></div>`;
document.body.prepend(shell);
document.body.classList.add('tagro-shell-active');
document.body.dataset.tagroShellPage = pageType;

const nav = $('#tagroShellNav');
for (const [id,label] of PAGES) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tagro-shell-tab';
  b.dataset.shellPage = id;
  b.textContent = label;
  b.addEventListener('click', () => openPage(id));
  nav.append(b);
}

function openPage(id) {
  if (id === 'information') {
    if (pageType !== 'info') location.href = './info.html';
    return;
  }
  if (id === 'field' || id === 'drawing') {
    if (pageType === 'workbench') {
      document.getElementById(id === 'field' ? 'fieldMode' : 'drawingMode')?.click();
      const url = new URL(location.href);
      url.searchParams.set('view', id);
      history.replaceState(null, '', url);
      setTimeout(sync, 0);
    } else {
      location.href = `./workbench.html?view=${id}`;
    }
    return;
  }
  if (pageType === 'index') {
    document.querySelector(`[data-open-surface="${id}"]`)?.click();
    history.replaceState(null, '', `#${id}`);
    setTimeout(sync, 0);
  } else {
    location.href = `./index.html#${id}`;
  }
}

function command(label, fn) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'tagro-ribbon-btn';
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

function sourceByTool(kind) {
  return document.querySelector(`#toolDock [data-tool="${kind}"]`);
}

function tool(label, kind) {
  const source = sourceByTool(kind);
  if (!source) return null;
  return command(label, () => source.click());
}

function byId(label, id) {
  const source = document.getElementById(id);
  if (!source) return null;
  return command(label, () => source.click());
}

function scrollToId(id) {
  const node = document.getElementById(id);
  if (!node) return false;
  node.scrollIntoView({ block:'start' });
  return true;
}

function focusId(id) {
  const node = document.getElementById(id);
  if (!node) return false;
  node.focus();
  return true;
}

function append(ribbon, items) {
  for (const item of items) if (item) ribbon.append(item);
}

function renderInfoTools(ribbon) {
  append(ribbon, [
    byId('Save', 'saveNow'),
    command('Purpose', () => scrollToId('infoPurpose')),
    command('Customer', () => scrollToId('infoCustomer')),
    command('Water', () => scrollToId('infoWater')),
    command('Plots', () => scrollToId('infoPlots')),
    byId('Add plot', 'addPlot'),
    command('Site', () => scrollToId('infoSite')),
    command('Measure on map', () => {
      const measure = document.querySelector('.map-measure');
      if (measure) measure.click();
      else location.href = './workbench.html?measure=all&from=info';
    }),
    command('Products', () => scrollToId('jainProducts'))
  ]);
}

function renderWorkbenchTools(ribbon, surface) {
  if (surface === 'field') {
    const search = document.createElement('span');
    search.className = 'tagro-ribbon-search';
    const input = document.createElement('input');
    input.placeholder = 'Search place or lat,lng';
    input.value = $('#searchInput')?.value || '';
    const go = command('Search', () => {
      if ($('#searchInput')) $('#searchInput').value = input.value;
      $('#searchButton')?.click();
    });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go.click(); });
    search.append(input, go);
    ribbon.append(search, command('Locate', () => $('#locateButton')?.click()));
  }

  append(ribbon, [
    tool('Select','select'),
    tool('Boundary','boundary'),
    tool('Plot','plot'),
    tool('Section','section'),
    tool('Crop area','crop_area'),
    tool('Path','path'),
    tool('High','high_point'),
    tool('Low','low_point'),
    tool('Water','water_source'),
    tool('Pump','pump'),
    tool('Tank','tank'),
    tool('Main','main'),
    tool('Submain','submain'),
    tool('Lateral','lateral'),
    tool('Plant','plant'),
    tool('Emitter / sprinkler','device'),
    byId('Ruler','measureTool'),
    byId('Layout laterals','layoutTool'),
    byId('All tools','workButton')
  ]);
}

function renderIndexTools(ribbon, surface) {
  if (surface === 'adviser') {
    append(ribbon, [
      command('Ask', () => focusId('adviserInput')),
      command('Information', () => openPage('information')),
      command('Field', () => openPage('field')),
      command('Design', () => openPage('design')),
      command('Materials', () => openPage('materials'))
    ]);
    return;
  }

  if (surface === 'design') {
    append(ribbon, [
      command('Summary', () => scrollToId('designTop')),
      command('Network', () => scrollToId('designNetwork')),
      command('Checks', () => scrollToId('designChecks')),
      command('Required information', () => scrollToId('designRequired')),
      command('Field', () => openPage('field')),
      command('Materials', () => openPage('materials'))
    ]);
    return;
  }

  if (surface === 'materials') {
    append(ribbon, [
      command('BOM', () => scrollToId('materialsList')),
      command('Product options', () => scrollToId('materialsProducts')),
      command('Products', () => { location.href = './info.html#products'; }),
      command('Design', () => openPage('design')),
      command('Adviser', () => openPage('adviser')),
      command('Information', () => openPage('information'))
    ]);
  }
}

function setHeight(hasTools) {
  const height = hasTools ? '74px' : '40px';
  if (height === lastHeight) return;
  lastHeight = height;
  document.documentElement.style.setProperty('--tagro-shell-height', height);
  if (pageType === 'workbench') {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new CustomEvent('tagro:shell-layout', { detail: { height } }));
    }));
  }
}

function renderTools() {
  const ribbon = $('#tagroShellRibbon');
  ribbon.replaceChildren();
  const surface = currentSurface();
  if (pageType === 'info') renderInfoTools(ribbon);
  else if (pageType === 'workbench') renderWorkbenchTools(ribbon, surface);
  else renderIndexTools(ribbon, surface);
  const hasTools = ribbon.children.length > 0;
  ribbon.hidden = !hasTools;
  setHeight(hasTools);
}

function syncNav() {
  const surface = currentSurface();
  for (const b of document.querySelectorAll('.tagro-shell-tab')) {
    b.classList.toggle('active', b.dataset.shellPage === surface);
  }
  document.body.dataset.tagroShellSurface = surface;
  document.title = `TAGRO Irrigation · ${PAGES.find(([id]) => id === surface)?.[1] || 'Irrigation'}`;
}

function syncJob() {
  const job = jobContext();
  $('#tagroShellJob').textContent = job.title;
  $('#tagroShellJobDetail').textContent = job.detail;
}

function syncSave() {
  const out = $('#tagroShellSave');
  let source = null;
  if (pageType === 'info') source = $('#saveState');
  if (pageType === 'workbench') source = $('#tagroSaveIndicator');
  out.textContent = source?.textContent?.trim() || (pageType === 'index' ? 'Local job' : 'Job active');
}

function sync() {
  syncNav();
  syncJob();
  syncSave();
  renderTools();
}

function initialRoute() {
  if (pageType === 'workbench') {
    const requested = new URLSearchParams(location.search).get('view');
    if (requested === 'drawing') $('#drawingMode')?.click();
    else $('#fieldMode')?.click();
  } else if (pageType === 'index') {
    const requested = (location.hash || '#adviser').slice(1);
    document.querySelector(`[data-open-surface="${requested}"]`)?.click();
  }
}

initialRoute();
sync();

if (pageType === 'workbench') {
  $('#fieldMode')?.addEventListener('click', () => setTimeout(sync, 0));
  $('#drawingMode')?.addEventListener('click', () => setTimeout(sync, 0));
}

document.addEventListener('click', event => {
  if (event.target.closest?.('[data-open-surface]')) setTimeout(sync, 0);
});
window.addEventListener('hashchange', () => setTimeout(sync, 0));
window.addEventListener('tagro:job-info-change', () => { syncJob(); syncSave(); });

const saveSource = pageType === 'info' ? $('#saveState') : pageType === 'workbench' ? $('#tagroSaveIndicator') : null;
if (saveSource) {
  new MutationObserver(syncSave).observe(saveSource, { childList:true, characterData:true, subtree:true });
}
})();
