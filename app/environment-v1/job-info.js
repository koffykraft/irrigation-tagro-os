(() => {
  "use strict";

  const CONTRACT = "tagro-irrigation-job-information-v1";
  const STORAGE_PREFIX = "tagro.irrigation.jobinfo.v1";
  const ACTIVE_JOB_KEY = "tagro.irrigation.learning.v1:active-job";
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();

  function ensureJobId(existing) {
    if (window.TAGROLearning?.ensureJobId) return window.TAGROLearning.ensureJobId(existing);
    const id = existing || localStorage.getItem(ACTIVE_JOB_KEY) || `job_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    localStorage.setItem(ACTIVE_JOB_KEY, id);
    return id;
  }

  function key(jobId = ensureJobId()) {
    return `${STORAGE_PREFIX}:${jobId}`;
  }

  function blankPlot(index = 1) {
    return {
      info_plot_id: `INFO-P${index}`,
      name: `Plot ${index}`,
      crop: "",
      crop_role: "unknown",
      crop_age: "unknown",
      approximate: {
        length_m: null,
        width_m: null,
        area_sqm: null
      },
      planting: {
        row_spacing_m: null,
        plant_spacing_m: null,
        actual_rows: null,
        actual_plants: null
      },
      irrigation: {
        existing: "unknown",
        application_intent: "unknown",
        known_device: "",
        known_discharge_lph: null,
        emitters_per_plant: null,
        water_need_mm_day: null,
        irrigation_interval_days: null
      },
      notes: ""
    };
  }

  function empty(jobId = ensureJobId()) {
    return {
      contract: CONTRACT,
      job_id: jobId,
      revision: 0,
      customer: {
        name: "",
        phone: "",
        email: "",
        address: "",
        location: "",
        agriculture_office: "",
        external_reference: ""
      },
      need: {
        purposes: [],
        priority_note: "",
        budget_note: "",
        future_expansion: "unknown"
      },
      water_power: {
        source_type: "unknown",
        source_description: "",
        availability: "unknown",
        known_yield_lph: null,
        storage_litres: null,
        water_quality_note: "",
        power_type: "unknown",
        phase: "unknown",
        pump_exists: "unknown",
        pump_hp: null,
        pump_model: "",
        known_head_m: null,
        operating_hours_day: null,
        filter_existing: "unknown",
        fertigation_intent: "unknown"
      },
      site: {
        soil: "unknown",
        slope: "unknown",
        access_note: "",
        known_source_to_field_m: null,
        wind_exposure: "unknown",
        existing_system_note: "",
        other_note: ""
      },
      plots: [blankPlot(1)],
      events: [],
      created_at: now(),
      updated_at: now()
    };
  }

  function read(jobId = ensureJobId()) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key(jobId)) || "null");
      if (parsed?.contract === CONTRACT) {
        if (!Array.isArray(parsed.plots) || !parsed.plots.length) parsed.plots = [blankPlot(1)];
        return parsed;
      }
    } catch {}
    return empty(jobId);
  }

  function event(state, type, payload = {}) {
    state.events = Array.isArray(state.events) ? state.events : [];
    state.events.push({
      id: `infoevt_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${state.events.length + 1}`}`,
      type,
      payload: clone(payload),
      at: now(),
      actor: "anonymous_job_holder"
    });
    if (state.events.length > 150) state.events = state.events.slice(-150);
  }

  function write(state, eventType = "job.info.saved", payload = {}) {
    const next = clone(state);
    next.contract = CONTRACT;
    next.job_id = next.job_id || ensureJobId();
    next.revision = Number(next.revision || 0) + 1;
    next.updated_at = now();
    event(next, eventType, payload);
    localStorage.setItem(key(next.job_id), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tagro:job-info-change", { detail: clone(next) }));
    return next;
  }

  function addPlot(jobId = ensureJobId()) {
    const state = read(jobId);
    const used = new Set(state.plots.map(plot => plot.info_plot_id));
    let n = 1;
    while (used.has(`INFO-P${n}`)) n += 1;
    state.plots.push(blankPlot(n));
    return write(state, "job.info.plot_added", { info_plot_id: `INFO-P${n}` });
  }

  function removePlot(infoPlotId, jobId = ensureJobId()) {
    const state = read(jobId);
    const before = state.plots.length;
    state.plots = state.plots.filter(plot => plot.info_plot_id !== infoPlotId);
    if (!state.plots.length) state.plots = [blankPlot(1)];
    if (state.plots.length === before) return state;
    return write(state, "job.info.plot_removed", { info_plot_id: infoPlotId });
  }

  function compact(value) {
    if (Array.isArray(value)) {
      const items = value.map(compact).filter(item => item !== undefined);
      return items.length ? items : undefined;
    }
    if (value && typeof value === "object") {
      const out = {};
      Object.entries(value).forEach(([name, item]) => {
        if (["events", "created_at", "updated_at", "revision", "contract"].includes(name)) return;
        const c = compact(item);
        if (c !== undefined) out[name] = c;
      });
      return Object.keys(out).length ? out : undefined;
    }
    if (value === null || value === "" || value === "unknown") return undefined;
    return value;
  }

  function context(jobId = ensureJobId()) {
    const state = read(jobId);
    const known = compact(state) || {};
    return {
      contract: CONTRACT,
      job_id: state.job_id,
      evidence_rule: "Optional job information records what was stated or known before/during design. Blank or unknown values remain unknown. Map geometry and deterministic engineering may later supersede approximate dimensions or assumptions.",
      known
    };
  }

  function clear(jobId = ensureJobId()) {
    localStorage.removeItem(key(jobId));
    const state = empty(jobId);
    window.dispatchEvent(new CustomEvent("tagro:job-info-change", { detail: clone(state) }));
    return state;
  }

  window.TAGROJobInfo = {
    contract: CONTRACT,
    ensureJobId,
    read,
    write,
    addPlot,
    removePlot,
    context,
    clear,
    blankPlot
  };
})();