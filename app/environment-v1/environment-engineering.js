(() => {
  "use strict";

  const state = {
    endpoint: null,
    service: false,
    conformance: null,
    checkedAt: null
  };

  async function getJson(path, options) {
    const base = state.endpoint || location.origin;
    const response = await fetch(`${base}${path}`, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.detail || data?.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  async function check(endpoint = window.TAGRO_IRRIGATION_ENGINE_ENDPOINT || location.origin) {
    state.endpoint = endpoint;
    try {
      const health = await getJson("/health", { headers: { accept: "application/json" }, cache: "no-store" });
      state.service = health?.service === "tagro-irrigation-ai-context" && Boolean(health?.engineering_engine);
      state.conformance = health?.engineering_conformance ?? null;
      state.checkedAt = new Date().toISOString();
      return {
        online: state.service,
        engine: health?.engineering_engine ?? null,
        conformance: state.conformance,
        health
      };
    } catch (error) {
      state.service = false;
      state.conformance = null;
      state.checkedAt = new Date().toISOString();
      return { online: false, error };
    }
  }

  async function conformance() {
    const data = await getJson("/api/engineering/conformance", { headers: { accept: "application/json" }, cache: "no-store" });
    state.conformance = data;
    return data;
  }

  const post = (path, body) => getJson(path, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body)
  });

  window.TAGROEngineeringService = Object.freeze({
    state,
    check,
    conformance,
    assessRun: body => post("/api/engineering/assess-run", body),
    compareSizes: body => post("/api/engineering/compare-sizes", body),
    sections: body => post("/api/engineering/sections", body),
    runtime: body => post("/api/engineering/runtime", body)
  });
})();
