// TAGRO v16 — Auto-size button
//
// network-optimizer.js already implements a real, physically-based pipe-size search: it runs
// the iterative hydraulic solve in relationship-network.js (pressure-dependent emitter
// discharge, Darcy-Weisbach head loss, uniformity/pressure/velocity targets) and walks every
// pipe up through the standard size list, picking the smallest size that clears those targets,
// trading off against a material-cost index. It existed in this repository already but was
// not wired into location-map.html — this file only adds the button and the "what changed"
// summary; it adds no new hydraulics of its own, so there is exactly one calculation path,
// not two (per the 2026-09-06 audit's own recommendation to unify rather than fork).
//
// What this deliberately does NOT do (2026-09-07 scope decision): select a pump, filter or
// fittings, or add BOM lines for them. It only sizes pipe that has already been drawn and
// identified as Main/Submain/Lateral. That is a separate, later pass.
(() => {
  function boot() {
    if (!window.TAGRO_NETWORK || !window.TAGRO_OPTIMIZER || !window.TAGRO_CAD) return setTimeout(boot, 120);
    const pane = document.querySelector('#cadMeasure');
    if (!pane || document.querySelector('#tagroAutoSizeBtn')) return;

    const role = l => ['main', 'submain', 'lateral'].includes(l?.options?.tagroIdentityId) ? l.options.tagroIdentityId : null;
    function ensureCss() {
      if (document.querySelector('#tagroAutoSizeCss')) return;
      const s = document.createElement('style');
      s.id = 'tagroAutoSizeCss';
      s.textContent = `
        .tagro-autosize{margin-top:8px;padding-top:8px;border-top:1px solid #e6e9e6;display:grid;gap:6px}
        .tagro-autosize-btn{height:30px;border:1px solid #8bb6d8;border-radius:7px;background:#eef6ff;color:#075d9e;font-size:10.5px;font-weight:750}
        .tagro-autosize-btn:disabled{opacity:.55}
        .tagro-autosize-result{font-size:9px;line-height:1.5;color:#3b423c;background:#fafbfa;border:1px solid #e0e4e0;border-radius:7px;padding:6px 7px}
        .tagro-autosize-steps{max-height:110px;overflow:auto;margin:4px 0 0}
        .tagro-autosize-revert{height:26px;border:1px solid #cbd1cc;border-radius:7px;background:#fff;font-size:9.5px}
      `;
      document.head.appendChild(s);
    }

    let lastResult = null;

    function render() {
      pane.querySelector('.tagro-autosize')?.remove();
      const pipes = window.TAGRO_CAD.getLayers().filter(l => role(l) && map.hasLayer(l));
      if (!pipes.length) return; // nothing to size yet
      const box = document.createElement('section');
      box.className = 'tagro-autosize';
      box.innerHTML = `
        <button id="tagroAutoSizeBtn" class="tagro-autosize-btn">Auto-size this network</button>
        <div class="tagro-autosize-note" style="font-size:8.5px;color:#687069;line-height:1.4">
          Picks the smallest pipe size per Main/Submain/Lateral that meets the uniformity, pressure
          and velocity targets in Network Settings, using the drawn geometry and each lateral's
          emitter discharge. Does not touch pump, filter or fittings.
        </div>
        <div id="tagroAutoSizeResult"></div>
      `;
      pane.appendChild(box);
      document.querySelector('#tagroAutoSizeBtn').onclick = run;
    }

    function run() {
      const btn = document.querySelector('#tagroAutoSizeBtn');
      if (btn) { btn.disabled = true; btn.textContent = 'Sizing…'; }
      // Let the button repaint before the (synchronous, potentially 80-iteration) solve runs.
      setTimeout(() => {
        let result;
        try {
          result = window.TAGRO_OPTIMIZER.optimize();
        } catch (err) {
          renderResult(`<div class="tagro-autosize-result">Could not auto-size: ${String(err?.message || err)}. Check that every pipe is identified and at least one Lateral has emitter data.</div>`);
          if (btn) { btn.disabled = false; btn.textContent = 'Auto-size this network'; }
          return;
        }
        lastResult = result;
        // Tag every touched layer so the BOM and Design panel can show "auto-sized" rather
        // than implying a person specified this size — provenance discipline, not cosmetic.
        const now = new Date().toISOString();
        for (const step of result.steps) {
          const layer = pipes_findById(step.id);
          if (layer?.options?.tagroEngineering) {
            layer.options.tagroEngineering.source = 'auto';
            layer.options.tagroEngineering.autoSizedAt = now;
          }
        }
        window.TAGRO_V16_PERSISTENCE?.save?.();
        // network-optimizer.js dispatches 'tagro:networkoptimized', which the BOM builder and
        // per-object Design panel do not currently listen for — dispatch the event they do
        // listen for instead of editing their listener lists.
        window.dispatchEvent(new CustomEvent('tagro:networkchange'));
        const eff = window.TAGRO_OPTIMIZER.efficiency(result.evaluation);
        const stepsHtml = result.steps.length
          ? `<ul class="tagro-autosize-steps">${result.steps.map(s => `<li>${cap(s.role)}: ${s.from} → <b>${s.to} mm</b></li>`).join('')}</ul>`
          : `<div>No pipe needed a size change — current sizes already meet targets.</div>`;
        renderResult(`
          <div class="tagro-autosize-result">
            <b>${result.success ? 'Sizing complete' : 'Sizing complete with unresolved flags'}</b> ·
            network efficiency score ${eff}/100${result.evaluation.flags.length ? ` — ${esc(result.evaluation.flags.join(' · '))}` : ''}
            ${stepsHtml}
            ${result.steps.length ? '<button id="tagroAutoSizeRevert" class="tagro-autosize-revert">Revert to previous sizes</button>' : ''}
          </div>
        `);
        document.querySelector('#tagroAutoSizeRevert')?.addEventListener('click', () => {
          window.TAGRO_OPTIMIZER.restoreOriginal(lastResult);
          for (const x of lastResult.before) { if (x.l?.options?.tagroEngineering) delete x.l.options.tagroEngineering.source; }
          window.TAGRO_V16_PERSISTENCE?.save?.();
          window.dispatchEvent(new CustomEvent('tagro:networkchange'));
          render();
        });
        if (btn) { btn.disabled = false; btn.textContent = 'Auto-size this network'; }
      }, 20);
    }

    function pipes_findById(id) {
      return window.TAGRO_CAD.getLayers().find(l => l.options?.tagroObjectId === id);
    }
    function renderResult(html) {
      const el = document.querySelector('#tagroAutoSizeResult');
      if (el) el.innerHTML = html;
    }
    function cap(s) { return s ? String(s)[0].toUpperCase() + String(s).slice(1) : ''; }
    function esc(s) { return String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

    ensureCss();
    const pane2 = pane;
    const mo = new MutationObserver(() => { if (pane2.classList.contains('on') && pane2.querySelector('.tagro-measure') && !pane2.querySelector('.tagro-autosize')) setTimeout(render, 0); });
    mo.observe(pane2, { childList: true });
    ['tagro:cadselect', 'tagro:identitychange', 'tagro:cadchange'].forEach(n => window.addEventListener(n, () => setTimeout(render, 0)));
    window.TAGRO_V16_AUTOSIZE = { run };
  }
  boot();
})();
