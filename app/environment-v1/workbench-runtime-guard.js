(() => {
  'use strict';

  /* workbench-v2 currently contains one stale generated render call named updateInspector().
     Current selection rendering is updateSelectionUI() and spatial-change already calls it after renderMap().
     Keep this no-op global bridge until the generated source is normalized; it prevents the stale name
     from aborting map initialization without creating a second selection implementation. */
  if (typeof window.updateInspector !== 'function') window.updateInspector = () => {};

  /* The current Workbench layout functions call lineCoords() but the generated bundle omitted the helper.
     Define the single expected geometry adapter here so Layout Laterals, spacing checks and layout preview
     can use canonical LineString coordinates without inventing any geometry. */
  if (typeof window.lineCoords !== 'function') {
    window.lineCoords = object => object?.geometry?.type === 'LineString'
      ? (object.geometry.coordinates || [])
      : [];
  }

  const missing = [];
  if (!window.L) missing.push('Leaflet map library');
  if (window.L && !window.L.PM) missing.push('Leaflet-Geoman drawing library');

  const ok = missing.length === 0;
  window.TAGROWorkbenchRuntime = {
    ok,
    missing: [...missing],
    leaflet: window.L?.version || null,
    geoman: window.L?.PM?.version || null,
    compatibility_hooks: [
      'updateInspector -> current updateSelectionUI path',
      'lineCoords -> canonical LineString coordinates'
    ]
  };

  if (ok) return;

  const workspace = document.getElementById('workspace');
  const status = document.getElementById('status');
  if (status) {
    status.textContent = `Map tools unavailable · ${missing.join(' + ')} did not load`;
    status.setAttribute('role', 'alert');
  }
  if (workspace) {
    workspace.dataset.runtimeError = 'map-library';
    const panel = document.createElement('div');
    panel.className = 'runtime-failure';
    panel.setAttribute('role', 'alert');
    panel.innerHTML = `<b>Field map could not start.</b><span>${missing.join(' and ')} failed to load. Your saved job has not been deleted or replaced. Reload when the connection is available.</span>`;
    workspace.append(panel);
    workspace.querySelectorAll('#toolDock button,#measureTool,#layoutTool').forEach(button => {
      button.disabled = true;
      button.setAttribute('aria-disabled', 'true');
    });
  }
})();
