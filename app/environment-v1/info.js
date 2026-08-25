(() => {
  "use strict";

  const info = window.TAGROJobInfo;
  if (!info) throw new Error("TAGROJobInfo must load before info.js");

  const $ = selector => document.querySelector(selector);
  const jobId = info.ensureJobId();
  let state = info.read(jobId);
  let saveTimer = null;

  const fieldMap = {
    customerName: ["customer", "name"],
    customerPhone: ["customer", "phone"],
    customerEmail: ["customer", "email"],
    customerAddress: ["customer", "address"],
    customerLocation: ["customer", "location"],
    agricultureOffice: ["customer", "agriculture_office"],
    externalReference: ["customer", "external_reference"],
    priorityNote: ["need", "priority_note"],
    budgetNote: ["need", "budget_note"],
    futureExpansion: ["need", "future_expansion"],
    sourceType: ["water_power", "source_type"],
    sourceDescription: ["water_power", "source_description"],
    waterAvailability: ["water_power", "availability"],
    knownYield: ["water_power", "known_yield_lph"],
    storageLitres: ["water_power", "storage_litres"],
    powerType: ["water_power", "power_type"],
    powerPhase: ["water_power", "phase"],
    pumpExists: ["water_power", "pump_exists"],
    pumpHp: ["water_power", "pump_hp"],
    pumpModel: ["water_power", "pump_model"],
    knownHead: ["water_power", "known_head_m"],
    operatingHours: ["water_power", "operating_hours_day"],
    filterExisting: ["water_power", "filter_existing"],
    soil: ["site", "soil"],
    slope: ["site", "slope"],
    sourceToField: ["site", "known_source_to_field_m"],
    wind: ["site", "wind_exposure"],
    accessNote: ["site", "access_note"],
    existingSystemNote: ["site", "existing_system_note"]
  };

  const numericIds = new Set(["knownYield", "storageLitres", "pumpHp", "knownHead", "operatingHours", "sourceToField"]);

  function ensureShape() {
    state.audience = state.audience || { mode: "exploring", current_need: "understand" };
    state.need = state.need || { purposes: [], priority_note: "", budget_note: "", future_expansion: "unknown" };
    state.customer = state.customer || {};
    state.water_power = state.water_power || {};
    state.site = state.site || {};
    if (!Array.isArray(state.plots) || !state.plots.length) state.plots = [info.blankPlot(1)];
  }

  function getPath(path) {
    return path.reduce((value, key) => value?.[key], state);
  }

  function setPath(path, value) {
    let target = state;
    path.slice(0, -1).forEach(key => {
      target[key] = target[key] || {};
      target = target[key];
    });
    target[path[path.length - 1]] = value;
  }

  function toNumberOrNull(value) {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  }

  function countKnown(value) {
    if (Array.isArray(value)) return value.reduce((sum, item) => sum + countKnown(item), 0);
    if (value && typeof value === "object") {
      return Object.entries(value).reduce((sum, [key, item]) => {
        if (["events", "revision", "created_at", "updated_at", "contract", "job_id", "info_plot_id"].includes(key)) return sum;
        return sum + countKnown(item);
      }, 0);
    }
    if (value === null || value === undefined || value === "" || value === "unknown") return 0;
    if (value === false) return 0;
    return 1;
  }

  function refreshSummary() {
    $("#knownCount").textContent = String(countKnown(state));
    $("#plotCount").textContent = String(state.plots.length);
    $("#infoRevision").textContent = String(state.revision || 0);
    const spatial = window.TAGROSpatial?.snapshot?.();
    $("#spatialCount").textContent = String(spatial?.objects?.length || 0);

    const cropNames = state.plots.map(plot => plot.crop).filter(Boolean);
    const source = state.water_power?.source_type;
    const parts = [];
    if (cropNames.length) parts.push(`${[...new Set(cropNames)].join(", ")} recorded`);
    if (source && source !== "unknown") parts.push("water source recorded");
    if (spatial?.objects?.length) parts.push("real field objects mapped");
    $("#unlockText").textContent = parts.length
      ? `${parts.join(" · ")}. TAGRO can use these as context; engineering still checks what must be checked.`
      : "You can already open FIELD and start drawing. More information simply improves later choices.";
  }

  function setSaveState(text, mode = "saved") {
    const el = $("#saveState");
    el.textContent = text;
    el.dataset.mode = mode;
    $("#footerStatus").textContent = `${text} · job ${jobId.slice(0, 12)}…`;
  }

  function persist(reason = "job.info.autosaved") {
    clearTimeout(saveTimer);
    state = info.write(state, reason, { surface: "info" });
    refreshSummary();
    setSaveState(`Saved locally · rev ${state.revision}`);
  }

  function scheduleSave() {
    setSaveState("Saving…", "saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => persist(), 450);
  }

  function loadStaticFields() {
    ensureShape();
    $("#audienceMode").value = state.audience.mode || "exploring";
    $("#currentNeed").value = state.audience.current_need || "understand";
    Object.entries(fieldMap).forEach(([id, path]) => {
      const element = document.getElementById(id);
      if (!element) return;
      const value = getPath(path);
      element.value = value ?? "";
    });
    const purposes = new Set(state.need.purposes || []);
    document.querySelectorAll("#purposeChips input[type=checkbox]").forEach(input => { input.checked = purposes.has(input.value); });
  }

  function updateStaticFromDom(event) {
    const target = event.target;
    if (!target) return;
    if (target.id === "audienceMode") state.audience.mode = target.value;
    else if (target.id === "currentNeed") state.audience.current_need = target.value;
    else if (target.closest?.("#purposeChips")) {
      state.need.purposes = [...document.querySelectorAll("#purposeChips input:checked")].map(input => input.value);
    } else if (fieldMap[target.id]) {
      setPath(fieldMap[target.id], numericIds.has(target.id) ? toNumberOrNull(target.value) : target.value);
    } else return;
    scheduleSave();
  }

  function plotCard(plot, index) {
    const card = document.createElement("article");
    card.className = "plot-card";
    card.dataset.plotId = plot.info_plot_id;
    card.innerHTML = `
      <div class="plot-head"><b>${escapeHtml(plot.name || `Plot ${index + 1}`)}</b><span>${escapeHtml(plot.info_plot_id)}</span>${state.plots.length > 1 ? '<button class="remove-plot" type="button">Remove</button>' : ""}</div>
      <div class="plot-body grid">
        <label>Plot / section name<input data-field="name" value="${escapeHtml(plot.name || "")}"></label>
        <label>Crop<input data-field="crop" value="${escapeHtml(plot.crop || "")}" placeholder="Coconut, banana, vegetables…"></label>
        <label>Crop role<select data-field="crop_role"><option value="unknown">Not stated</option><option value="main">Main crop</option><option value="intercrop">Intercrop / mixed</option><option value="temporary">Temporary / seasonal</option><option value="supporting">Supporting crop</option></select></label>
        <label>Crop age<select data-field="crop_age"><option value="unknown">Unknown</option><option value="new">New planting</option><option value="young">Young</option><option value="bearing">Bearing / established</option><option value="mixed">Mixed ages</option></select></label>
        <label>Approx length m<input data-field="approximate.length_m" type="number" min="0" step="0.1" value="${plot.approximate?.length_m ?? ""}"></label>
        <label>Approx width m<input data-field="approximate.width_m" type="number" min="0" step="0.1" value="${plot.approximate?.width_m ?? ""}"></label>
        <label>Approx area m²<input data-field="approximate.area_sqm" type="number" min="0" step="0.1" value="${plot.approximate?.area_sqm ?? ""}"></label>
        <label>Actual plants / devices<input data-field="planting.actual_plants" type="number" min="0" step="1" value="${plot.planting?.actual_plants ?? ""}"></label>
        <label>Row spacing m<input data-field="planting.row_spacing_m" type="number" min="0" step="0.1" value="${plot.planting?.row_spacing_m ?? ""}"></label>
        <label>Plant spacing m<input data-field="planting.plant_spacing_m" type="number" min="0" step="0.1" value="${plot.planting?.plant_spacing_m ?? ""}"></label>
        <label>Actual rows<input data-field="planting.actual_rows" type="number" min="0" step="1" value="${plot.planting?.actual_rows ?? ""}"></label>
        <label>Existing irrigation<select data-field="irrigation.existing"><option value="unknown">Unknown / not stated</option><option value="none">None</option><option value="partial">Partial system</option><option value="existing">Existing system</option><option value="replace">Needs replacement</option></select></label>
        <label>Application thought<select data-field="irrigation.application_intent"><option value="unknown">Open / help me compare</option><option value="drip">Drip / emitters</option><option value="inline">Inline drip</option><option value="micro_sprinkler">Micro sprinkler</option><option value="mini_sprinkler">Mini sprinkler</option><option value="jet">Jet / spray</option><option value="bubbler">Bubbler</option><option value="fog_mist">Fogger / mister</option><option value="sprinkler">Sprinkler</option><option value="mixed">Mixed methods</option></select></label>
        <label>Known device / model<input data-field="irrigation.known_device" value="${escapeHtml(plot.irrigation?.known_device || "")}" placeholder="optional"></label>
        <label>Known discharge LPH<input data-field="irrigation.known_discharge_lph" type="number" min="0" step="0.1" value="${plot.irrigation?.known_discharge_lph ?? ""}"></label>
        <label>Emitters / plant<input data-field="irrigation.emitters_per_plant" type="number" min="0" step="1" value="${plot.irrigation?.emitters_per_plant ?? ""}"></label>
        <label>Water need mm/day<input data-field="irrigation.water_need_mm_day" type="number" min="0" step="0.1" value="${plot.irrigation?.water_need_mm_day ?? ""}" placeholder="only if known"></label>
        <label>Irrigation interval days<input data-field="irrigation.irrigation_interval_days" type="number" min="0" step="1" value="${plot.irrigation?.irrigation_interval_days ?? ""}"></label>
        <label class="wide">Plot notes<textarea data-field="notes">${escapeHtml(plot.notes || "")}</textarea></label>
      </div>`;

    card.querySelector('[data-field="crop_role"]').value = plot.crop_role || "unknown";
    card.querySelector('[data-field="crop_age"]').value = plot.crop_age || "unknown";
    card.querySelector('[data-field="irrigation.existing"]').value = plot.irrigation?.existing || "unknown";
    card.querySelector('[data-field="irrigation.application_intent"]').value = plot.irrigation?.application_intent || "unknown";
    return card;
  }

  function renderPlots() {
    const host = $("#plots");
    host.replaceChildren(...state.plots.map(plotCard));
  }

  function setNested(target, path, value) {
    const keys = path.split(".");
    let cursor = target;
    keys.slice(0, -1).forEach(key => { cursor[key] = cursor[key] || {}; cursor = cursor[key]; });
    cursor[keys[keys.length - 1]] = value;
  }

  function plotChanged(event) {
    const input = event.target.closest?.("[data-field]");
    if (!input) return;
    const card = input.closest(".plot-card");
    const plot = state.plots.find(item => item.info_plot_id === card?.dataset.plotId);
    if (!plot) return;
    const path = input.dataset.field;
    const numeric = input.type === "number";
    setNested(plot, path, numeric ? toNumberOrNull(input.value) : input.value);
    if (path === "name") card.querySelector(".plot-head b").textContent = input.value || plot.info_plot_id;
    scheduleSave();
  }

  function removePlot(event) {
    const button = event.target.closest?.(".remove-plot");
    if (!button) return;
    const card = button.closest(".plot-card");
    state.plots = state.plots.filter(plot => plot.info_plot_id !== card.dataset.plotId);
    if (!state.plots.length) state.plots = [info.blankPlot(1)];
    persist("job.info.plot_removed");
    renderPlots();
  }

  function addPlot() {
    const used = new Set(state.plots.map(plot => plot.info_plot_id));
    let n = 1;
    while (used.has(`INFO-P${n}`)) n += 1;
    state.plots.push(info.blankPlot(n));
    persist("job.info.plot_added");
    renderPlots();
    $("#plots").lastElementChild?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function init() {
    ensureShape();
    loadStaticFields();
    renderPlots();
    refreshSummary();
    setSaveState(`Saved locally · rev ${state.revision || 0}`);

    document.addEventListener("input", updateStaticFromDom);
    document.addEventListener("change", updateStaticFromDom);
    $("#plots").addEventListener("input", plotChanged);
    $("#plots").addEventListener("change", plotChanged);
    $("#plots").addEventListener("click", removePlot);
    $("#addPlot").addEventListener("click", addPlot);
    $("#saveNow").addEventListener("click", () => persist("job.info.manual_save"));
    $("#footerSave").addEventListener("click", () => persist("job.info.manual_save"));
    window.addEventListener("tagro:spatial-change", refreshSummary);
    window.addEventListener("beforeunload", () => { if (saveTimer) persist("job.info.navigation_save"); });
  }

  init();
})();