import { SYSTEM_SKELETON_V1 } from './system-skeleton.v1.0.js';

const store = window.TAGROSpatial;
if (!store) throw new Error('TAGROSpatial must load before workbench-shell.js');

const jobId = store.jobId();
const CONFIG_PREFIX = 'tagro.irrigation.composition.v1';
const CLOUD_PREFIX = 'tagro.irrigation.cloud-job.v1';
const configKey = `${CONFIG_PREFIX}:${jobId}`;
const cloudKey = `${CLOUD_PREFIX}:${jobId}`;

const DELIVERABLE_LABELS = {
  fieldCapture: 'Field capture',
  quickFeasibility: 'Feasibility',
  networkConcept: 'Preliminary design',
  checkedDesign: 'Checked design',
  materialEstimate: 'Material estimate',
  purchaseList: 'Purchase list',
  installedRecord: 'Installed record'
};

const SURFACE_LABELS = {
  field: 'Field',
  drawing: 'Drawing',
  adviser: 'Adviser',
  design: 'Design',
  materials: 'Materials',
  review: 'Review',
  history: 'History'
};

const defaultConfig = {
  contract: 'tagro-irrigation-composition-v1',
  job_id: jobId,
  deliverable: 'networkConcept',
  measurement_display: 'selected',
  surface_order: [...SYSTEM_SKELETON_V1.deliverables.networkConcept.surfaces],
  surface_visibility: Object.fromEntries(Object.keys(SYSTEM_SKELETON_V1.surfaces).map(id => [id, true])),
  tool_visibility: {},
  inspector_actions: {},
  updated_at: new Date().toISOString()
};

const clone = value => JSON.parse(JSON.stringify(value));

function readJson(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function readConfig() {
  const saved = readJson(configKey, {});
  return {
    ...clone(defaultConfig),
    ...saved,
    job_id: jobId,
    surface_visibility: { ...defaultConfig.surface_visibility, ...(saved.surface_visibility || {}) },
    tool_visibility: { ...(saved.tool_visibility || {}) },
    inspector_actions: { ...(saved.inspector_actions || {}) }
  };
}

let config = readConfig();
let syncTimer = null;
let healthChecked = false;
let persistenceBound = false;
let saveState = { mode: 'local', text: '', detail: '' };

function profile(id = config.deliverable) {
  return SYSTEM_SKELETON_V1.deliverables[id] || SYSTEM_SKELETON_V1.deliverables.networkConcept;
}

function dispatchComposition() {
  window.dispatchEvent(new CustomEvent('tagro:composition-change', {
    detail: { config: clone(config), profile: clone(profile()) }
  }));
}

function writeConfig(next = config) {
  config = {
    ...next,
    job_id: jobId,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(configKey, JSON.stringify(config));
  dispatchComposition();
  renderComposition();
  scheduleCloudSave();
  return clone(config);
}

function setDeliverable(id) {
  if (!SYSTEM_SKELETON_V1.deliverables[id]) return clone(config);
  const nextProfile = SYSTEM_SKELETON_V1.deliverables[id];
  return writeConfig({
    ...config,
    deliverable: id,
    surface_order: [...nextProfile.surfaces]
  });
}

function setMeasurementDisplay(mode) {
  if (!['off', 'selected', 'all', 'family', 'print'].includes(mode)) return clone(config);
  return writeConfig({ ...config, measurement_display: mode });
}

function setSurfaceVisible(id, visible) {
  if (!SYSTEM_SKELETON_V1.surfaces[id]) return clone(config);
  return writeConfig({
    ...config,
    surface_visibility: { ...config.surface_visibility, [id]: Boolean(visible) }
  });
}

function setToolVisible(id, visible) {
  return writeConfig({
    ...config,
    tool_visibility: { ...config.tool_visibility, [id]: Boolean(visible) }
  });
}

function cloudRecord() {
  return readJson(cloudKey, null);
}

function writeCloudRecord(value) {
  localStorage.setItem(cloudKey, JSON.stringify(value));
}

function localRevision() {
  return Number(store.snapshot()?.revision || 0);
}

function jobEnvelope() {
  return {
    contract: 'tagro-irrigation-job-envelope-v1',
    local_job_id: jobId,
    spatial: store.snapshot(),
    composition: clone(config),
    learning: window.TAGROLearning?.context?.(jobId, 50) || null,
    saved_from: 'workbench-shell-v1',
    saved_at: new Date().toISOString()
  };
}

function setSaveState(mode, text, detail = '') {
  saveState = { mode, text, detail };
  const badge = document.querySelector('#tagroSaveIndicator');
  if (badge) {
    badge.dataset.mode = mode;
    badge.textContent = text;
    badge.title = detail || text;
  }
}

function renderLocalSave() {
  const remote = cloudRecord();
  if (saveState.mode === 'syncing' || saveState.mode === 'conflict') return;
  if (remote?.state_version != null && remote?.last_synced_local_revision === localRevision()) {
    setSaveState('cloud', 'Cloud saved', 'This job is saved locally and the latest cloud version is aligned.');
  } else {
    setSaveState('local', 'Saved locally', persistenceBound ? 'Cloud synchronization is pending.' : 'Saved on this device. Cloud saving is not currently confirmed.');
  }
}

async function checkPersistenceBinding() {
  if (healthChecked) return persistenceBound;
  healthChecked = true;
  try {
    const response = await fetch('/health', { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`health ${response.status}`);
    const data = await response.json();
    persistenceBound = Boolean(data?.anonymous_persistence_bound);
  } catch {
    persistenceBound = false;
  }
  renderLocalSave();
  return persistenceBound;
}

async function ensureCloudJob() {
  const bound = await checkPersistenceBinding();
  if (!bound) return null;

  const existing = cloudRecord();
  if (existing?.job_id && existing?.access_token) return existing;

  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: 'TAGRO Irrigation Job',
      maturity: 'preliminary',
      state: jobEnvelope()
    })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `create job ${response.status}`);
  }

  const data = await response.json();
  const record = {
    job_id: data.job_id,
    access_token: data.access_token,
    state_version: Number(data.state_version || 0),
    last_synced_local_revision: localRevision(),
    created_at: new Date().toISOString()
  };
  writeCloudRecord(record);
  return record;
}

async function saveCloudNow() {
  if (document.visibilityState === 'hidden' && !cloudRecord()) return;
  setSaveState('syncing', 'Saving…', 'Saving the current job.');

  try {
    const remote = await ensureCloudJob();
    if (!remote) {
      setSaveState('local', 'Saved locally', 'Cloud saving is not available; the job remains saved on this device.');
      return { ok: false, local_only: true };
    }

    const response = await fetch(`/api/jobs/${encodeURIComponent(remote.job_id)}/state`, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        'x-job-token': remote.access_token
      },
      body: JSON.stringify({
        expected_version: Number(remote.state_version || 0),
        maturity: 'preliminary',
        state: jobEnvelope()
      })
    });

    if (response.status === 409) {
      const data = await response.json().catch(() => ({}));
      setSaveState('conflict', 'Save conflict', `Cloud version ${data.current_version ?? 'unknown'} is newer. No overwrite was attempted.`);
      return { ok: false, conflict: true, data };
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error || `save ${response.status}`);
    }

    const data = await response.json();
    const next = {
      ...remote,
      state_version: Number(data.state_version || remote.state_version || 0),
      last_synced_local_revision: localRevision(),
      last_synced_at: new Date().toISOString()
    };
    writeCloudRecord(next);
    setSaveState('cloud', 'Cloud saved', 'This job is saved locally and in the configured cloud job store.');
    return { ok: true, data };
  } catch (error) {
    setSaveState('offline', 'Sync pending', String(error?.message || error));
    return { ok: false, error: String(error?.message || error) };
  }
}

function scheduleCloudSave() {
  renderLocalSave();
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void saveCloudNow(), 1200);
}

function createOption(value, text, selected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  return option;
}

function ensureShellStyles() {
  if (document.querySelector('#tagroShellStyles')) return;
  const style = document.createElement('style');
  style.id = 'tagroShellStyles';
  style.textContent = `
    .tagro-shell-context{display:flex;align-items:center;gap:6px;margin-left:6px}
    .tagro-shell-button,.tagro-save-indicator{height:30px;border:1px solid #d7dbd6;background:#fff;border-radius:9px;padding:0 9px;font:700 10px/1 system-ui;white-space:nowrap;color:#384038}
    .tagro-shell-button{cursor:pointer}.tagro-save-indicator[data-mode="conflict"]{border-color:#cf6d4e;color:#9e321f}.tagro-save-indicator[data-mode="offline"]{border-color:#d4a54f;color:#815d13}.tagro-save-indicator[data-mode="cloud"]{border-color:#90b79b;color:#2f6941}
    .tagro-config-panel{position:fixed;z-index:2200;top:52px;right:8px;width:min(340px,calc(100vw - 16px));max-height:calc(100vh - 64px);overflow:auto;background:#fff;border:1px solid #d7dbd6;border-radius:14px;box-shadow:0 12px 38px rgba(0,0,0,.18);padding:12px;display:none;color:#202520}
    .tagro-config-panel.show{display:block}.tagro-config-head{display:flex;align-items:center;gap:8px;margin-bottom:10px}.tagro-config-head button{margin-left:auto;width:34px;height:34px;border:1px solid #ddd;background:#f7f7f4;border-radius:9px}.tagro-config-panel label{display:grid;gap:5px;font-size:11px;font-weight:800;margin:9px 0}.tagro-config-panel select{height:40px;border:1px solid #d7dbd6;border-radius:10px;background:#fafbf9;padding:0 9px;font:inherit}.tagro-config-note{font-size:11px;line-height:1.4;color:#667066}.tagro-config-surfaces{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.tagro-config-chip{border:1px solid #d7dbd6;background:#f7f8f5;border-radius:999px;padding:7px 9px;font-size:10px;font-weight:800}.tagro-config-chip.off{opacity:.42;text-decoration:line-through}
    @media(max-width:760px){.tagro-save-indicator{max-width:120px;overflow:hidden;text-overflow:ellipsis}.tagro-shell-button{padding:0 7px}}
  `;
  document.head.append(style);
}

function ensureCompositionUI() {
  ensureShellStyles();
  const topbar = document.querySelector('.topbar');
  if (!topbar || document.querySelector('#tagroShellContext')) return;

  const wrap = document.createElement('div');
  wrap.id = 'tagroShellContext';
  wrap.className = 'tagro-shell-context';

  const configButton = document.createElement('button');
  configButton.id = 'tagroConfigButton';
  configButton.className = 'tagro-shell-button';
  configButton.type = 'button';
  configButton.textContent = DELIVERABLE_LABELS[config.deliverable] || 'Design stage';

  const save = document.createElement('div');
  save.id = 'tagroSaveIndicator';
  save.className = 'tagro-save-indicator';
  save.setAttribute('role', 'status');
  save.setAttribute('aria-live', 'polite');

  wrap.append(configButton, save);
  const work = document.querySelector('#workButton');
  topbar.insertBefore(wrap, work || null);

  const panel = document.createElement('aside');
  panel.id = 'tagroConfigPanel';
  panel.className = 'tagro-config-panel';
  panel.innerHTML = `
    <div class="tagro-config-head"><div><b>Design settings</b></div><button id="tagroConfigClose" type="button">×</button></div>
    <label>Design stage<select id="tagroDeliverable"></select></label>
    <label>Measurement labels<select id="tagroMeasurementDisplay"></select></label>
    <div class="tagro-config-note"><b>Visible pages</b><div id="tagroProfileSurfaces" class="tagro-config-surfaces"></div></div>
    <p class="tagro-config-note">Changing these settings does not create a new job.</p>
  `;
  document.body.append(panel);

  configButton.addEventListener('click', () => panel.classList.toggle('show'));
  panel.querySelector('#tagroConfigClose').addEventListener('click', () => panel.classList.remove('show'));
  panel.querySelector('#tagroDeliverable').addEventListener('change', event => setDeliverable(event.target.value));
  panel.querySelector('#tagroMeasurementDisplay').addEventListener('change', event => setMeasurementDisplay(event.target.value));
}

function renderComposition() {
  ensureCompositionUI();
  const p = profile();
  const button = document.querySelector('#tagroConfigButton');
  if (button) button.textContent = DELIVERABLE_LABELS[config.deliverable] || 'Design stage';

  const deliverable = document.querySelector('#tagroDeliverable');
  if (deliverable) {
    deliverable.replaceChildren();
    Object.keys(SYSTEM_SKELETON_V1.deliverables).forEach(id => {
      deliverable.append(createOption(id, DELIVERABLE_LABELS[id] || id, id === config.deliverable));
    });
  }

  const measurement = document.querySelector('#tagroMeasurementDisplay');
  if (measurement) {
    measurement.replaceChildren();
    [
      ['off', 'Off'],
      ['selected', 'Selected object'],
      ['all', 'All objects'],
      ['family', 'Spacing / family'],
      ['print', 'Print / export']
    ].forEach(([value, label]) => measurement.append(createOption(value, label, value === config.measurement_display)));
  }

  const surfaces = document.querySelector('#tagroProfileSurfaces');
  if (surfaces) {
    surfaces.replaceChildren();
    p.surfaces.forEach(id => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `tagro-config-chip ${config.surface_visibility[id] === false ? 'off' : ''}`;
      chip.textContent = SURFACE_LABELS[id] || id;
      chip.addEventListener('click', () => setSurfaceVisible(id, config.surface_visibility[id] === false));
      surfaces.append(chip);
    });
  }

  renderLocalSave();
}

window.addEventListener('tagro:spatial-change', scheduleCloudSave);
window.addEventListener('online', () => scheduleCloudSave());
window.addEventListener('offline', () => setSaveState('offline', 'Offline · Saved locally', 'Network unavailable. Work remains saved on this device.'));
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') renderLocalSave();
});

window.TAGROComposition = Object.freeze({
  skeleton: SYSTEM_SKELETON_V1,
  jobId,
  get: () => clone(config),
  profile: () => clone(profile()),
  setDeliverable,
  setMeasurementDisplay,
  setSurfaceVisible,
  setToolVisible,
  saveCloudNow,
  persistence: () => ({ bound: persistenceBound, record: clone(cloudRecord()), state: clone(saveState) })
});

renderComposition();
void checkPersistenceBinding();