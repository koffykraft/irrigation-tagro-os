(() => {
  'use strict';

  const host = document.getElementById('productDeck');
  const compareHost = document.getElementById('productCompare');
  const registry = window.TAGROProductMediaSources;
  const info = window.TAGROJobInfo;
  if (!host || !compareHost || !registry || !info) return;

  const jobId = info.ensureJobId();
  const products = (registry.products || []).filter(product => product.image_asset && product.pitch);

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function selectedIds() {
    const state = info.read(jobId);
    const values = Array.isArray(state.need?.product_interests) ? state.need.product_interests : [];
    return new Set(values.map(value => typeof value === 'string' ? value : value?.id).filter(Boolean));
  }

  function identity(product) {
    return product.knowledge_id || product.key;
  }

  function writeInterest(product, active, reason) {
    const state = info.read(jobId);
    state.need = state.need || {};
    const interests = new Set(Array.isArray(state.need.product_interests) ? state.need.product_interests.map(value => typeof value === 'string' ? value : value?.id).filter(Boolean) : []);
    const id = identity(product);
    if (active) interests.add(id); else interests.delete(id);
    state.need.product_interests = [...interests];
    if (active) state.need.active_product_consideration = id;
    else if (state.need.active_product_consideration === id) delete state.need.active_product_consideration;
    return info.write(state, 'job.info.product_interest_changed', {
      product_id: id,
      product_name: product.name,
      interested: active,
      reason
    });
  }

  function card(product, selected) {
    const good = (product.pitch.good_for || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const facts = (product.pitch.facts || []).map(item => `<span class="product-fact">${escapeHtml(item)}</span>`).join('');
    return `<article class="product-card" data-product="${escapeHtml(product.key)}" data-selected="${selected}">
      <div class="product-media"><img src="${escapeHtml(product.image_asset)}" alt="${escapeHtml(product.official_name || product.name)}" loading="lazy"></div>
      <div class="product-copy">
        <span class="product-label">${escapeHtml(product.pitch.label)}</span>
        <h3 class="product-title">${escapeHtml(product.name)}</h3>
        <p class="product-short">${escapeHtml(product.pitch.short)}</p>
        <div class="product-facts">${facts}</div>
        <div class="product-good"><b>Worth considering for</b><ul>${good}</ul></div>
        <div class="product-watch"><b>Do not assume</b>${escapeHtml(product.pitch.watch)}</div>
        <div class="product-actions">
          <button class="consider" type="button" data-action="consider" data-active="${selected}">${selected ? 'Considering ✓' : 'Consider for my design'}</button>
          <button type="button" data-action="ask">Ask TAGRO</button>
          <button type="button" data-action="field">Try on my field</button>
        </div>
      </div>
    </article>`;
  }

  function renderCompare() {
    const heads = products.map(product => `<th>${escapeHtml(product.name)}</th>`).join('');
    const rows = [
      ['Type', 'type'],
      ['Pressure', 'pressure'],
      ['Discharge', 'discharge'],
      ['Service', 'service'],
      ['Terrain / pressure variation', 'terrain']
    ].map(([label, key]) => `<tr><th>${label}</th>${products.map(product => `<td>${escapeHtml(product.pitch.compare?.[key] || '—')}</td>`).join('')}</tr>`).join('');
    compareHost.innerHTML = `<div class="product-compare-title"><b>Quick comparison</b><span>This is product education, not a hydraulic PASS/FAIL or final selection.</span></div><div class="product-table-wrap"><table class="product-table"><thead><tr><th>Compare</th>${heads}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function render() {
    const selected = selectedIds();
    host.innerHTML = products.length
      ? products.map(product => card(product, selected.has(identity(product)))).join('')
      : '<p class="product-short">No image-backed product cards are available yet.</p>';
    renderCompare();
  }

  host.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    const cardEl = event.target.closest('[data-product]');
    if (!button || !cardEl) return;
    const product = products.find(item => item.key === cardEl.dataset.product);
    if (!product) return;
    const action = button.dataset.action;
    const isSelected = selectedIds().has(identity(product));

    if (action === 'consider') {
      writeInterest(product, !isSelected, 'explore_product_card');
      render();
      return;
    }

    if (action === 'ask') {
      writeInterest(product, true, 'ask_tagro_about_product');
      window.location.href = './index.html#adviser';
      return;
    }

    if (action === 'field') {
      writeInterest(product, true, 'try_product_on_field');
      window.location.href = './workbench.html';
    }
  });

  window.addEventListener('tagro:job-info-change', render);
  render();
})();
