(() => {
  'use strict';

  const workspace = document.querySelector('#workspace');
  if (!workspace) return;

  const desktop = window.matchMedia('(min-width:721px)');
  const $ = selector => document.querySelector(selector);

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

  function selectTool(kind) {
    const button = document.querySelector(`#toolDock [data-tool="${kind}"]`);
    if (!button || button.disabled) return false;
    button.click();
    return true;
  }

  function stopMovePanel() {
    const panel = $('#manipPanel');
    if (!panel?.classList.contains('show')) return;
    document.getElementById('closeManip')?.click();
  }

  function startMove() {
    const source = document.getElementById('moveSelected');
    if (!source || source.classList.contains('hidden') || source.disabled) return false;
    source.click();
    /* Move is a direct canvas interaction. Keep the optional numeric panel out of the way. */
    $('#manipPanel')?.classList.remove('show');
    return true;
  }

  function nudge(direction, metres) {
    const step = $('#moveStep');
    const button = document.querySelector(`[data-nudge="${direction}"]`);
    if (!step || !button) return false;
    const previous = step.value;
    step.value = String(metres);
    button.click();
    step.value = previous;
    return true;
  }

  /* A manipulation panel belongs to the current selection/operation only.
     Close it before another object is selected or another operation panel is opened. */
  workspace.addEventListener('click', event => {
    const object = event.target.closest?.('.tagro-existing,.draw-object');
    if (object) {
      stopMovePanel();
      return;
    }
    const action = event.target.closest?.('#editSelected,#labelSelected,#connectSelected,#emitterSelected,#layoutSelected');
    if (action) stopMovePanel();
  }, true);

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
      if (key === 'e') {
        event.preventDefault();
        stopMovePanel();
        clickIfUsable('editSelected');
        return;
      }
      if (key === 'g') {
        event.preventDefault();
        startMove();
        return;
      }
      if (key === 'r') {
        event.preventDefault();
        stopMovePanel();
        clickIfUsable('rotateSelected');
        return;
      }
      const directions = {
        ArrowUp: 'north',
        ArrowDown: 'south',
        ArrowLeft: 'west',
        ArrowRight: 'east'
      };
      if (directions[event.key]) {
        event.preventDefault();
        nudge(directions[event.key], event.shiftKey ? 5 : 1);
        return;
      }
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const shortcuts = {
      v: 'select',
      b: 'boundary',
      m: 'main',
      s: 'submain',
      l: 'lateral',
      w: 'water_source',
      p: 'plant',
      d: 'device'
    };
    if (shortcuts[key]) {
      event.preventDefault();
      selectTool(shortcuts[key]);
    }
  }, true);

  workspace.addEventListener('dblclick', event => {
    if (!desktop.matches) return;
    const object = event.target.closest?.('.tagro-existing,.draw-object');
    if (!object) return;
    event.preventDefault();
    event.stopPropagation();
    stopMovePanel();
    setTimeout(() => clickIfUsable('editSelected'), 0);
  }, true);

  /* Deliberately no MutationObservers here. Selection/tool rendering belongs to workbench-v2
     and the shared shell; this module only adds familiar direct keyboard/pointer commands. */
})();
