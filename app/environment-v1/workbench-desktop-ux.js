(() => {
  'use strict';

  const workspace = document.querySelector('#workspace');
  if (!workspace) return;
  const $ = selector => document.querySelector(selector);
  const desktop = window.matchMedia('(min-width:721px)');
  let autoMoveSignature = '';
  let autoMoveBusy = false;

  const TOOL_GROUPS = [
    { label: 'FIELD', tools: [
      ['select', 'Select', 'V'], ['boundary', 'Boundary', 'B'], ['plot', 'Plot', '']
    ]},
    { label: 'NETWORK', tools: [
      ['main', 'Main', 'M'], ['submain', 'Submain', 'S'], ['lateral', 'Lateral', 'L']
    ]},
    { label: 'POINTS', tools: [
      ['water_source', 'Water', 'W'], ['pump', 'Pump', ''], ['plant', 'Plant', 'P'], ['device', 'Device', 'D']
    ]}
  ];

  const QUICK_BY_DELIVERABLE = {
    fieldCapture: new Set(['select','boundary','plot','water_source','pump','plant','device','measure']),
    quickFeasibility: new Set(['select','boundary','plot','main','water_source','pump','plant','device','measure']),
    networkConcept: new Set(['select','boundary','plot','main','submain','lateral','water_source','pump','plant','device','measure']),
    checkedDesign: new Set(['select','boundary','plot','main','submain','lateral','water_source','pump','plant','device','measure']),
    materialEstimate: new Set(['select','main','submain','lateral','device','measure']),
    purchaseList: new Set(['select','device','measure']),
    installedRecord: new Set(['select','boundary','plot','main','submain','lateral','water_source','pump','plant','device','measure'])
  };

  const quick = document.createElement('div');
  quick.id = 'desktopToolStrip';
  quick.className = 'desktop-toolstrip';
  quick.setAttribute('aria-label', 'Irrigation tools');

  function toolButton(kind, label, shortcut = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'desk-tool';
    button.dataset.toolProxy = kind;
    button.title = shortcut ? `${label} · ${shortcut}` : label;
    button.innerHTML = `${label}${shortcut ? `<span class="desk-shortcut">${shortcut}</span>` : ''}`;
    button.addEventListener('click', () => document.querySelector(`[data-tool="${kind}"]`)?.click());
    return button;
  }

  TOOL_GROUPS.forEach(group => {
    const wrap = document.createElement('div');
    wrap.className = 'desk-group';
    const label = document.createElement('span');
    label.className = 'desk-group-label';
    label.textContent = group.label;
    wrap.append(label);
    group.tools.forEach(([kind, text, shortcut]) => wrap.append(toolButton(kind, text, shortcut)));
    quick.append(wrap);
  });

  const measureGroup = document.createElement('div');
  measureGroup.className = 'desk-group';
  const measureLabel = document.createElement('span');
  measureLabel.className = 'desk-group-label';
  measureLabel.textContent = 'MEASURE';
  const ruler = document.createElement('button');
  ruler.type = 'button';
  ruler.className = 'desk-tool';
  ruler.dataset.toolProxy = 'measure';
  ruler.textContent = 'Ruler';
  ruler.addEventListener('click', () => $('#measureTool')?.click());
  measureGroup.append(measureLabel, ruler);
  quick.append(measureGroup);

  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'desk-more';
  more.textContent = 'More';
  more.title = 'All tools';
  more.addEventListener('click', () => $('#workButton')?.click());
  quick.append(more);
  workspace.append(quick);

  const selection = document.createElement('div');
  selection.id = 'desktopSelectionStrip';
  selection.className = 'desktop-selectionstrip';
  selection.setAttribute('aria-label', 'Selected object actions');
  selection.innerHTML = `
    <div class="desk-selection-summary"><b id="deskSelectionName">Selection</b><span id="deskSelectionMeasure"></span></div>
    <button class="desk-selection-action" type="button" data-selection-proxy="multiToggle" title="Keep selecting without holding a key">Multi-select</button>
    <button class="desk-selection-action" type="button" data-selection-proxy="selectSame" title="Select all objects of the same type">Same type</button>
    <button class="desk-selection-action primary" type="button" data-selection-proxy="moveSelected">Move <span class="desk-shortcut">G</span></button>
    <button class="desk-selection-action" type="button" data-selection-proxy="editSelected">Edit shape <span class="desk-shortcut">E</span></button>
    <button class="desk-selection-action" type="button" data-selection-proxy="rotateSelected">Rotate <span class="desk-shortcut">R</span></button>
    <button class="desk-selection-action" type="button" data-selection-proxy="duplicateSelected">Duplicate <span class="desk-shortcut">Ctrl+D</span></button>
    <button class="desk-selection-action" type="button" data-selection-proxy="connectSelected">Connect</button>
    <button class="desk-selection-action" type="button" data-selection-proxy="labelSelected">Details</button>
    <button class="desk-selection-action" type="button" data-selection-proxy="emitterSelected">Emitter</button>
    <button class="desk-selection-action" type="button" data-selection-proxy="layoutSelected">Layout</button>
    <button class="desk-selection-action danger" type="button" data-selection-proxy="deleteSelected">Delete <span class="desk-shortcut">Del</span></button>
    <button class="desk-selection-action" type="button" data-selection-proxy="closeInspector">Clear</button>
    <span class="desk-selection-hint">Ctrl/Shift+click selects multiple · double-click edits shape</span>`;
  workspace.append(selection);

  function stopDirectMove() {
    document.getElementById('closeManip')?.click();
  }

  function startDirectMove() {
    const source = document.getElementById('moveSelected');
    if (!source || source.classList.contains('hidden') || source.disabled) return;
    source.click();
    $('#manipPanel')?.classList.remove('show');
  }

  selection.addEventListener('click', event => {
    const button = event.target.closest('[data-selection-proxy]');
    if (!button) return;
    const id = button.dataset.selectionProxy;
    if (id === 'moveSelected') {
      startDirectMove();
      return;
    }
    if (id === 'editSelected' || id === 'rotateSelected') stopDirectMove();
    document.getElementById(id)?.click();
  });

  function syncQuickActive() {
    quick.querySelectorAll('[data-tool-proxy]').forEach(button => {
      if (button.dataset.toolProxy === 'measure') {
        button.classList.toggle('on', $('#measurePanel')?.classList.contains('show'));
        return;
      }
      const source = document.querySelector(`[data-tool="${button.dataset.toolProxy}"]`);
      button.classList.toggle('on', Boolean(source?.classList.contains('on')));
    });
  }

  function cleanInspectorText() {
    const meta = $('#selectionMeta');
    if (meta) meta.textContent = '';
    const parent = $('#selectionParent');
    if (parent?.textContent === 'Not explicitly connected') parent.textContent = 'Connection: not assigned';
    else if (parent?.textContent?.startsWith('Feeds from ')) parent.textContent = `Connected to ${parent.textContent.slice('Feeds from '.length)}`;
    const status = $('#status');
    if (status) {
      status.textContent = status.textContent
        .replace('blank job · nothing assumed', 'No objects')
        .replace(/ continuous/g, ' tool');
    }
  }

  function syncSelection() {
    const inspector = $('#inspector');
    const visible = Boolean(inspector?.classList.contains('show'));
    selection.classList.toggle('show', desktop.matches && visible);
    cleanInspectorText();
    if (!visible) {
      autoMoveSignature = '';
      return;
    }

    const count = $('#multiCount')?.textContent?.trim() || '1 selected';
    const name = $('#selectionName')?.textContent?.trim() || count;
    const measure = $('#selectionMeasure')?.textContent?.trim() || '';
    $('#deskSelectionName').textContent = count.startsWith('1 ') ? name : count;
    $('#deskSelectionMeasure').textContent = measure;

    selection.querySelectorAll('[data-selection-proxy]').forEach(button => {
      const source = document.getElementById(button.dataset.selectionProxy);
      if (!source) return;
      button.hidden = source.classList.contains('hidden');
      if (button.dataset.selectionProxy === 'multiToggle') button.classList.toggle('on', source.classList.contains('on'));
    });

    const signature = `${count}|${name}`;
    if (desktop.matches && signature !== autoMoveSignature && !autoMoveBusy) {
      autoMoveSignature = signature;
      autoMoveBusy = true;
      queueMicrotask(() => {
        startDirectMove();
        autoMoveBusy = false;
      });
    }
  }

  function applyComposition(detail) {
    const id = detail?.config?.deliverable || window.TAGROComposition?.get?.().deliverable || 'networkConcept';
    const allowed = QUICK_BY_DELIVERABLE[id] || QUICK_BY_DELIVERABLE.networkConcept;
    quick.querySelectorAll('[data-tool-proxy]').forEach(button => {
      button.hidden = !allowed.has(button.dataset.toolProxy);
    });
  }

  function isTypingTarget(target) {
    return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));
  }

  function hasSelection() {
    return Boolean($('#inspector')?.classList.contains('show'));
  }

  function clickIfUsable(id) {
    const button = document.getElementById(id);
    if (!button || button.classList.contains('hidden') || button.disabled) return false;
    button.click();
    return true;
  }

  function nudge(direction, metres) {
    const step = $('#moveStep');
    const button = document.querySelector(`[data-nudge="${direction}"]`);
    if (!step || !button) return false;
    const old = step.value;
    step.value = String(metres);
    button.click();
    step.value = old;
    return true;
  }

  document.addEventListener('keydown', event => {
    if (!desktop.matches || isTypingTarget(event.target)) return;
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === 'd' && hasSelection()) {
      event.preventDefault();
      clickIfUsable('duplicateSelected');
      return;
    }
    if (event.key === 'Delete' && hasSelection()) {
      event.preventDefault();
      clickIfUsable('deleteSelected');
      return;
    }
    if (hasSelection() && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (key === 'e') { event.preventDefault(); stopDirectMove(); clickIfUsable('editSelected'); return; }
      if (key === 'g') { event.preventDefault(); startDirectMove(); return; }
      if (key === 'r') { event.preventDefault(); stopDirectMove(); clickIfUsable('rotateSelected'); return; }
      const directions = { ArrowUp: 'north', ArrowDown: 'south', ArrowLeft: 'west', ArrowRight: 'east' };
      if (directions[event.key]) {
        event.preventDefault();
        nudge(directions[event.key], event.shiftKey ? 5 : 1);
        return;
      }
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const shortcuts = { v:'select', b:'boundary', m:'main', s:'submain', l:'lateral', w:'water_source', p:'plant', d:'device' };
    if (shortcuts[key]) {
      event.preventDefault();
      document.querySelector(`[data-tool="${shortcuts[key]}"]`)?.click();
    }
  }, true);

  workspace.addEventListener('dblclick', event => {
    if (!desktop.matches) return;
    const object = event.target.closest?.('.tagro-existing,.draw-object');
    if (!object) return;
    event.preventDefault();
    event.stopPropagation();
    stopDirectMove();
    setTimeout(() => clickIfUsable('editSelected'), 0);
  }, true);

  [quick, selection].forEach(bar => {
    ['pointerdown','dblclick'].forEach(type => bar.addEventListener(type, event => event.stopPropagation()));
  });

  const inspectorObserver = new MutationObserver(() => syncSelection());
  const inspector = $('#inspector');
  if (inspector) inspectorObserver.observe(inspector, { attributes:true, subtree:true, childList:true, characterData:true, attributeFilter:['class','hidden'] });
  const statusObserver = new MutationObserver(cleanInspectorText);
  const status = $('#status');
  if (status) statusObserver.observe(status, { childList:true, characterData:true, subtree:true });
  const toolObserver = new MutationObserver(() => syncQuickActive());
  const dock = $('#toolDock');
  if (dock) toolObserver.observe(dock, { attributes:true, subtree:true, attributeFilter:['class'] });
  const measurePanel = $('#measurePanel');
  if (measurePanel) toolObserver.observe(measurePanel, { attributes:true, attributeFilter:['class'] });

  window.addEventListener('tagro:spatial-change', () => setTimeout(syncSelection, 0));
  window.addEventListener('tagro:composition-change', event => applyComposition(event.detail));
  desktop.addEventListener?.('change', () => { syncSelection(); syncQuickActive(); });

  syncSelection();
  syncQuickActive();
  cleanInspectorText();
  setTimeout(() => applyComposition(), 700);
})();
