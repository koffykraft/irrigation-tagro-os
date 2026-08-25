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

  function jobId() {
    if (window.TAGROLearning?.ensureJobId) return window.TAGROLearning.ensureJobId();
    const key = `${STORAGE_PREFIX}:active-job`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `job_${crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    localStorage.setItem(key, id);
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
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey(id)) || "null");
      if (parsed?.contract === CONTRACT && Array.isArray(parsed.objects)) return parsed;
    } catch {}
    return emptyState(id);
  }

  function write(state) {
    const next = clone(state);
    next.revision = Number(next.revision || 0) + 1;
    next.updated_at = now();
    localStorage.setItem(storageKey(next.job_id), JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("tagro:spatial-change", { detail: clone(next) }));
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
    addEvent(state, "spatial.object.created", [id], { kind, state: objectState });
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
      const next = mutator(clone(object));
      if (!next) return;
      Object.assign(object, next, { updated_at: now() });
      changed.push(object.id);
    });
    if (!changed.length) return [];
    addEvent(state, eventType, changed, payload);
    write(state);
    return state.objects.filter(object => changed.includes(object.id)).map(clone);
  }

  function setParent(ids, parentId, source = "user") {
    const childIds = Array.isArray(ids) ? ids : [ids];
    return updateMany(childIds, object => ({
      properties: {
        ...(object.properties || {}),
        network: {
          ...(object.properties?.network || {}),
          parent_id: parentId || null,
          parent_source: parentId ? source : null
        }
      }
    }), "spatial.network.parent_set", { parent_id: parentId || null, source });
  }

  function removeObject(id) {
    const state = read();
    const before = state.objects.length;
    state.objects = state.objects.filter(item => item.id !== id);
    if (state.objects.length === before) return false;
    state.relationships = state.relationships.filter(rel => rel.from !== id && rel.to !== id);
    state.objects.forEach(object => {
      if (object.properties?.network?.parent_id === id) {
        object.properties.network.parent_id = null;
        object.properties.network.parent_source = null;
      }
    });
    addEvent(state, "spatial.object.removed", [id], {});
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
    addEvent(state, "spatial.object.duplicated", [source.id, newId], {});
    write(state);
    return clone(copy);
  }

  function replaceAll(objects, reason = "replace") {
    const state = read();
    state.objects = clone(Array.isArray(objects) ? objects : []);
    addEvent(state, "spatial.objects.replaced", state.objects.map(object => object.id), { reason });
    return write(state);
  }

  function clear() {
    const id = jobId();
    localStorage.removeItem(storageKey(id));
    const state = emptyState(id);
    window.dispatchEvent(new CustomEvent("tagro:spatial-change", { detail: clone(state) }));
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
    clear
  };
})();