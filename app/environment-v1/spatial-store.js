(() => {
  "use strict";

  const CONTRACT = "tagro-spatial-state-v1";
  const STORAGE_PREFIX = "tagro.irrigation.spatial.v1";
  const PREFIX = {
    boundary: "B",
    plot: "PL",
    section: "SEC",
    crop_area: "CROP",
    main: "M",
    submain: "S",
    lateral: "L",
    plant: "P",
    water_source: "W",
    pump: "PU",
    high_point: "HP",
    low_point: "LP",
    path: "PATH",
    device: "D",
    valve: "V",
    filter: "F",
    venturi: "VT",
    tank: "T",
    note: "N"
  };

  const now = () => new Date().toISOString();
  const clone = value => JSON.parse(JSON.stringify(value));
  const volatileStates = new Map();
  let volatileActiveJob = null;
  let persistenceState = { ok: true, mode: "localStorage", error: null, at: now() };

  function persistenceEvent(ok, error = null) {
    persistenceState = {
      ok,
      mode: ok ? "localStorage" : "memory-fallback",
      error: error ? String(error?.message || error) : null,
      at: now()
    };
    window.dispatchEvent(new CustomEvent(ok ? "tagro:spatial-save-ok" : "tagro:spatial-save-error", {
      detail: clone(persistenceState)
    }));
  }

  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      persistenceEvent(false, error);
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      persistenceEvent(true);
      return true;
    } catch (error) {
      persistenceEvent(false, error);
      return false;
    }
  }

  function safeRemove(key) {
    try {
      localStorage.removeItem(key);
      persistenceEvent(true);
      return true;
    } catch (error) {
      persistenceEvent(false, error);
      return false;
    }
  }

  function jobId() {
    try {
      if (window.TAGROLearning?.ensureJobId) {
        const learned = window.TAGROLearning.ensureJobId();
        if (learned) {
          volatileActiveJob = learned;
          return learned;
        }
      }
    } catch {}

    const key = `${STORAGE_PREFIX}:active-job`;
    const existing = safeGet(key) || volatileActiveJob;
    if (existing) {
      volatileActiveJob = existing;
      return existing;
    }
    const id = `job_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    volatileActiveJob = id;
    safeSet(key, id);
    return id;
  }

  function storageKey(id = jobId()) {
    return `${STORAGE_PREFIX}:${id}`;
  }

  function emptyState(id = jobId()) {
    return {
      contract: CONTRACT,
      job_id: id,
      revision: 0,
      objects: [],
      relationships: [],
      events: [],
      created_at: now(),
      updated_at: now()
    };
  }

  function read(id = jobId()) {
    const volatile = volatileStates.get(id);
    if (volatile) return clone(volatile);
    try {
      const parsed = JSON.parse(safeGet(storageKey(id)) || "null");
      if (parsed?.contract === CONTRACT && Array.isArray(parsed.objects)) {
        parsed.relationships = Array.isArray(parsed.relationships) ? parsed.relationships : [];
        parsed.events = Array.isArray(parsed.events) ? parsed.events : [];
        return parsed;
      }
    } catch {}
    return emptyState(id);
  }

  function write(state) {
    const next = clone(state);
    next.relationships = Array.isArray(next.relationships) ? next.relationships : [];
    next.events = Array.isArray(next.events) ? next.events : [];
    next.revision = Number(next.revision || 0) + 1;
    next.updated_at = now();
    volatileStates.set(next.job_id, clone(next));
    safeSet(storageKey(next.job_id), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tagro:spatial-change", {
      detail: { ...clone(next), persistence: clone(persistenceState) }
    }));
    return next;
  }

  function nextId(kind, state) {
    const prefix = PREFIX[kind] || "O";
    let n = 1;
    while (state.objects.some(object => object.id === `${prefix}${n}`)) n += 1;
    return `${prefix}${n}`;
  }

  function addEvent(state, type, objectIds = [], payload = {}) {
    state.events.push({
      event_id: `evt_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${state.events.length + 1}`}`,
      type,
      object_ids: objectIds,
      payload,
      actor: "anonymous_job_holder",
      occurred_at: now()
    });
    if (state.events.length > 300) state.events = state.events.slice(-300);
  }

  function networkRelationId(childId) {
    return `rel_network_parent_${childId}`;
  }

  function syncNetworkRelation(state, childId, parentId, source = "user") {
    state.relationships = (state.relationships || []).filter(rel => !(rel?.role === "network_parent" && rel?.to === childId));
    if (!parentId) return;
    state.relationships.push({
      id: networkRelationId(childId),
      from: parentId,
      to: childId,
      type: "feeds",
      role: "network_parent",
      state: "confirmed",
      source,
      updated_at: now()
    });
  }

  function rebuildNetworkRelationships(state) {
    state.relationships = (state.relationships || []).filter(rel => rel?.role !== "network_parent");
    state.objects.forEach(object => {
      const parentId = object?.properties?.network?.parent_id || null;
      if (parentId) syncNetworkRelation(state, object.id, parentId, object.properties?.network?.parent_source || "rebuild");
    });
  }

  function addObject(kind, geometry, properties = {}, objectState = "described") {
    const state = read();
    const id = nextId(kind, state);
    const object = {
      id,
      kind,
      state: objectState,
      geometry: clone(geometry),
      properties: clone(properties),
      provenance: {
        source: "map_or_drawing",
        capture: "draw",
        status: objectState,
        recorded_at: now()
      },
      created_at: now(),
      updated_at: now()
    };
    state.objects.push(object);
    const parentId = object?.properties?.network?.parent_id || null;
    if (parentId) syncNetworkRelation(state, id, parentId, object.properties?.network?.parent_source || "object_create");
    addEvent(state, "spatial.object.created", [id], { kind, state: objectState, parent_id: parentId });
    write(state);
    return clone(object);
  }

  function updateGeometry(id, geometry, capture = "edit") {
    const state = read();
    const object = state.objects.find(item => item.id === id);
    if (!object) return null;
    object.geometry = clone(geometry);
    object.updated_at = now();
    object.provenance = {
      ...(object.provenance || {}),
      capture,
      recorded_at: now()
    };
    addEvent(state, "spatial.geometry.updated", [id], { capture });
    write(state);
    return clone(object);
  }

  function updateProperties(id, patch = {}) {
    const state = read();
    const object = state.objects.find(item => item.id === id);
    if (!object) return null;
    object.properties = { ...(object.properties || {}), ...clone(patch) };
    object.updated_at = now();
    if (Object.prototype.hasOwnProperty.call(patch, "network")) {
      const parentId = object.properties?.network?.parent_id || null;
      syncNetworkRelation(state, id, parentId, object.properties?.network?.parent_source || "property_update");
    }
    addEvent(state, "spatial.properties.updated", [id], { keys: Object.keys(patch) });
    write(state);
    return clone(object);
  }

  function updateMany(ids, mutator, eventType = "spatial.objects.batch_updated", payload = {}) {
    const state = read();
    const wanted = new Set(Array.isArray(ids) ? ids : []);
    const changed = [];
    state.objects.forEach(object => {
      if (!wanted.has(object.id)) return;
      const beforeParent = object?.properties?.network?.parent_id || null;
      const next = mutator(clone(object));
      if (!next) return;
      Object.assign(object, next, { updated_at: now() });
      const afterParent = object?.properties?.network?.parent_id || null;
      if (beforeParent !== afterParent || next?.properties?.network) {
        syncNetworkRelation(state, object.id, afterParent, object.properties?.network?.parent_source || "batch_update");
      }
      changed.push(object.id);
    });
    if (!changed.length) return [];
    addEvent(state, eventType, changed, payload);
    write(state);
    return state.objects.filter(object => changed.includes(object.id)).map(clone);
  }

  function setParent(ids, parentId, source = "user") {
    const state = read();
    const childIds = Array.isArray(ids) ? ids : [ids];
    const wanted = new Set(childIds.filter(Boolean));
    if (parentId && !state.objects.some(object => object.id === parentId)) return [];
    const changed = [];
    state.objects.forEach(object => {
      if (!wanted.has(object.id)) return;
      object.properties = {
        ...(object.properties || {}),
        network: {
          ...(object.properties?.network || {}),
          parent_id: parentId || null,
          parent_source: parentId ? source : null
        }
      };
      object.updated_at = now();
      syncNetworkRelation(state, object.id, parentId || null, source);
      changed.push(object.id);
    });
    if (!changed.length) return [];
    addEvent(state, "spatial.network.parent_set", changed, { parent_id: parentId || null, source });
    write(state);
    return state.objects.filter(object => changed.includes(object.id)).map(clone);
  }

  function removeObject(id) {
    const state = read();
    const before = state.objects.length;
    state.objects = state.objects.filter(item => item.id !== id);
    if (state.objects.length === before) return false;
    state.relationships = (state.relationships || []).filter(rel => rel.from !== id && rel.to !== id);
    const orphaned = [];
    state.objects.forEach(object => {
      if (object.properties?.network?.parent_id === id) {
        object.properties.network.parent_id = null;
        object.properties.network.parent_source = null;
        syncNetworkRelation(state, object.id, null, "parent_removed");
        orphaned.push(object.id);
      }
    });
    addEvent(state, "spatial.object.removed", [id], { orphaned_children: orphaned });
    write(state);
    return true;
  }

  function duplicateObject(id, offset = { lng: 0.00002, lat: -0.00002 }) {
    const state = read();
    const source = state.objects.find(item => item.id === id);
    if (!source) return null;

    function offsetCoordinates(coords) {
      if (!Array.isArray(coords)) return coords;
      if (coords.length >= 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
        return [coords[0] + Number(offset.lng || 0), coords[1] + Number(offset.lat || 0)];
      }
      return coords.map(offsetCoordinates);
    }

    const newId = nextId(source.kind, state);
    const copy = {
      ...clone(source),
      id: newId,
      state: "described",
      geometry: { ...clone(source.geometry), coordinates: offsetCoordinates(source.geometry.coordinates) },
      properties: { ...(source.properties || {}), duplicated_from: source.id },
      provenance: { source: "map_or_drawing", capture: "duplicate", status: "described", recorded_at: now() },
      created_at: now(),
      updated_at: now()
    };
    state.objects.push(copy);
    const parentId = copy?.properties?.network?.parent_id || null;
    if (parentId) syncNetworkRelation(state, newId, parentId, "duplicate");
    addEvent(state, "spatial.object.duplicated", [source.id, newId], { parent_id: parentId });
    write(state);
    return clone(copy);
  }

  function replaceAll(objects, reason = "replace") {
    const state = read();
    state.objects = clone(Array.isArray(objects) ? objects : []);
    rebuildNetworkRelationships(state);
    addEvent(state, "spatial.objects.replaced", state.objects.map(object => object.id), { reason });
    return write(state);
  }

  function clear() {
    const id = jobId();
    volatileStates.delete(id);
    safeRemove(storageKey(id));
    const state = emptyState(id);
    window.dispatchEvent(new CustomEvent("tagro:spatial-change", {
      detail: { ...clone(state), persistence: clone(persistenceState) }
    }));
    return state;
  }

  function snapshot() {
    return clone(read());
  }

  window.TAGROSpatial = {
    contract: CONTRACT,
    jobId,
    read,
    snapshot,
    addObject,
    updateGeometry,
    updateProperties,
    updateMany,
    setParent,
    removeObject,
    duplicateObject,
    replaceAll,
    clear,
    persistence: () => clone(persistenceState)
  };
})();