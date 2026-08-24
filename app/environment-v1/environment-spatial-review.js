(() => {
  "use strict";

  const store = window.TAGROSpatial;
  if (!store) return;

  const $ = selector => document.querySelector(selector);
  const R = 6371008.8;

  function haversineMeters(a, b) {
    const toRad = value => value * Math.PI / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function lengthMeters(object) {
    if (object?.geometry?.type !== "LineString") return null;
    const coordinates = object.geometry.coordinates || [];
    let total = 0;
    for (let index = 1; index < coordinates.length; index += 1) total += haversineMeters(coordinates[index - 1], coordinates[index]);
    return total;
  }

  function canonical() {
    const state = store.snapshot();
    const objects = Array.isArray(state.objects) ? state.objects : [];
    return { state, objects };
  }

  function count(objects, kind) {
    return objects.filter(object => object.kind === kind).length;
  }

  function runs(objects, kind) {
    return objects
      .filter(object => object.kind === kind)
      .map(object => ({ object, length: lengthMeters(object) }))
      .filter(item => Number.isFinite(item.length));
  }

  function totalLength(items) {
    return items.reduce((sum, item) => sum + item.length, 0);
  }

  function formatLength(value) {
    if (!Number.isFinite(value)) return "unknown";
    return `${value.toFixed(value < 100 ? 1 : 0)} m`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character]));
  }

  async function enhanceDesign() {
    const panel = document.querySelector('[data-surface-panel="design"]');
    if (!panel?.classList.contains("is-active")) return;
    const { state, objects } = canonical();
    if (!objects.length) return;

    const main = runs(objects, "main");
    const submain = runs(objects, "submain");
    const lateral = runs(objects, "lateral");
    const plantsDevices = count(objects, "plant") + count(objects, "device");

    const summary = $("#networkSummary");
    if (summary) {
      summary.innerHTML = [
        [main.length, "mains"],
        [submain.length, "submains"],
        [lateral.length, "laterals"],
        [plantsDevices, "plants / devices"]
      ].map(([number, label]) => `<div class="metric"><b>${number}</b><span>${label}</span></div>`).join("");
    }

    let engineering = window.TAGROEngineeringService?.state || {};
    if (!engineering.service && window.TAGROEngineeringService?.check) {
      const checked = await window.TAGROEngineeringService.check();
      engineering = window.TAGROEngineeringService.state || {};
      if (!panel.classList.contains("is-active")) return;
      if (!checked?.online) engineering.service = false;
    }

    const measuredRuns = [...main, ...submain, ...lateral];
    const conformance = engineering.conformance;
    const engineText = engineering.service && conformance?.pass
      ? `Deterministic engine · ${conformance.checks}/${conformance.checks} regression checks PASS`
      : "Deterministic engine not currently confirmed";
    const preview = window.TAGROSpatialProposal?.current?.();

    const engineeringStatus = $("#engineeringStatus");
    if (engineeringStatus) {
      const rows = [
        ["Geometry", `Canonical FIELD/DRAWING · revision ${state.revision}`],
        ["Measurements", measuredRuns.length ? `${measuredRuns.length} real-coordinate run${measuredRuns.length === 1 ? "" : "s"}` : "No pipe run measured yet"],
        ["Engineering", engineText],
        ["Hydraulic status", measuredRuns.length ? "Lengths available · PASS/FAIL still waits for the other required inputs" : "No PASS/FAIL issued"],
        ["AI geometry", preview?.objects?.length ? `${preview.objects.length} proposed object${preview.objects.length === 1 ? "" : "s"} · not accepted` : "No active real-field preview"]
      ];
      engineeringStatus.innerHTML = `<div class="status-list">${rows.map(([name, value]) => `<div class="status-row"><span>${escapeHtml(name)}</span><span>${escapeHtml(value)}</span></div>`).join("")}</div>`;
    }

    const unknowns = [];
    if (!count(objects, "boundary")) unknowns.push("No canonical field boundary is recorded yet. Object-level work can continue, but area-based decisions remain incomplete.");
    if (!count(objects, "water_source")) unknowns.push("Water source has not yet been marked on the canonical field.");
    if (measuredRuns.length) unknowns.push("Pipe lengths now come from real map coordinates. Diameter, material, discharge, operating groups, pressure/head and elevation still need their own evidence before hydraulic acceptance.");
    unknowns.push("Elevation is not yet authoritative in this environment; satellite/visual height must not be treated as a hydraulic head measurement.");
    if (preview?.objects?.length) unknowns.push("An AI-assisted geometry preview is visible on FIELD, but it remains proposed until explicitly accepted.");

    const unknownBox = $("#designUnknowns");
    if (unknownBox) unknownBox.innerHTML = unknowns.map(item => `<div class="unknown">${escapeHtml(item)}</div>`).join("");
  }

  function adviserButton(topic) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Discuss options";
    button.addEventListener("click", () => {
      document.querySelector('[data-open-surface="adviser"]')?.click();
      const input = $("#adviserInput");
      if (input) {
        input.value = `Help me review ${topic} using the canonical field measurements. Do not choose a size or product until the deterministic inputs needed for that decision are known.`;
        input.focus();
      }
    });
    return button;
  }

  function materialRow(title, detail, quantity, topic) {
    const row = document.createElement("article");
    row.className = "material-row";
    row.innerHTML = `<div><b>${escapeHtml(title)}</b><span>${escapeHtml(detail)}</span></div><div class="qty">${escapeHtml(quantity)}</div>`;
    row.append(adviserButton(topic));
    return row;
  }

  function enhanceMaterials() {
    const panel = document.querySelector('[data-surface-panel="materials"]');
    if (!panel?.classList.contains("is-active")) return;
    const { objects } = canonical();
    if (!objects.length) return;

    const list = $("#materialsList");
    if (!list) return;
    list.replaceChildren();

    const main = runs(objects, "main");
    const submain = runs(objects, "submain");
    const lateral = runs(objects, "lateral");
    const devices = count(objects, "device");
    const plants = count(objects, "plant");

    if (main.length) list.append(materialRow(
      "Main pipe requirement",
      `${main.length} canonical main segment${main.length === 1 ? "" : "s"}; diameter/material and procurement allowance unresolved`,
      `${formatLength(totalLength(main))} measured`,
      "the main pipe requirement"
    ));
    if (submain.length) list.append(materialRow(
      "Submain pipe requirement",
      `${submain.length} canonical submain segment${submain.length === 1 ? "" : "s"}; size and fittings unresolved`,
      `${formatLength(totalLength(submain))} measured`,
      "the submain pipe requirement"
    ));
    if (lateral.length) list.append(materialRow(
      "Lateral pipe requirement",
      `${lateral.length} canonical lateral${lateral.length === 1 ? "" : "s"}; device flow, spacing and permissible run still need validation`,
      `${formatLength(totalLength(lateral))} measured`,
      "the lateral pipe and application-device requirement"
    ));
    if (devices) list.append(materialRow(
      "Application devices",
      "Explicitly marked canonical devices; product family is not presumed from location alone",
      `${devices} device${devices === 1 ? "" : "s"}`,
      "the marked application devices"
    ));
    if (plants && !devices) list.append(materialRow(
      "Marked plants",
      "Plant locations are known, but an emitter/sprinkler/jet/bubbler choice has not been forced onto them",
      `${plants} plant${plants === 1 ? "" : "s"}`,
      "application methods for the marked plants"
    ));

    if (!list.children.length) {
      list.innerHTML = `<div class="unknown">Canonical field objects exist, but they do not yet imply a measurable material requirement.</div>`;
    }

    const productText = $("#productKnowledgeText");
    if (productText) productText.textContent = "Canonical measured requirements are now available where real pipe geometry exists. Jain and generic products still resolve only after application and engineering requirements are known.";
  }

  function refresh() {
    requestAnimationFrame(() => {
      void enhanceDesign();
      enhanceMaterials();
    });
  }

  document.addEventListener("click", event => {
    if (event.target?.closest?.('[data-open-surface="design"],[data-open-surface="materials"]')) setTimeout(refresh, 0);
  });
  window.addEventListener("tagro:spatial-change", refresh);
  window.addEventListener("tagro:spatial-preview-change", refresh);
  refresh();
})();
