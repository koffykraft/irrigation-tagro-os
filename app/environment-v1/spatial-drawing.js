(() => {
  "use strict";

  const store = window.TAGROSpatial;
  if (!store) return;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const svg = $("#canvas");
  const WIDTH = 1000;
  const HEIGHT = 700;
  const PAD = 55;
  const pointKinds = new Set(["plant", "water_source", "device"]);
  const lineKinds = new Set(["main", "submain", "lateral", "path"]);

  const LABEL = {
    boundary: "Boundary",
    main: "Main",
    submain: "Submain",
    lateral: "Lateral",
    plant: "Plant",
    water_source: "Water source",
    path: "Path",
    device: "Device"
  };

  let activeKind = "select";
  let selectedId = null;
  let editMode = false;
  let draft = [];
  let bounds = null;
  let dragging = null;

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function allCoordinatePairs(value, out = []) {
    if (!Array.isArray(value)) return out;
    if (value.length >= 2 && typeof value[0] === "number" && typeof value[1] === "number") {
      out.push([value[0], value[1]]);
      return out;
    }
    value.forEach(item => allCoordinatePairs(item, out));
    return out;
  }

  function computeBounds(objects) {
    const pairs = [];
    objects.forEach(object => allCoordinatePairs(object.geometry?.coordinates, pairs));
    if (!pairs.length) return null;

    let minLng = Math.min(...pairs.map(p => p[0]));
    let maxLng = Math.max(...pairs.map(p => p[0]));
    let minLat = Math.min(...pairs.map(p => p[1]));
    let maxLat = Math.max(...pairs.map(p => p[1]));

    const minimumSpan = 0.0006;
    if (maxLng - minLng < minimumSpan) {
      const mid = (minLng + maxLng) / 2;
      minLng = mid - minimumSpan / 2;
      maxLng = mid + minimumSpan / 2;
    }
    if (maxLat - minLat < minimumSpan) {
      const mid = (minLat + maxLat) / 2;
      minLat = mid - minimumSpan / 2;
      maxLat = mid + minimumSpan / 2;
    }

    const lngPad = (maxLng - minLng) * 0.08;
    const latPad = (maxLat - minLat) * 0.08;
    return {
      minLng: minLng - lngPad,
      maxLng: maxLng + lngPad,
      minLat: minLat - latPad,
      maxLat: maxLat + latPad
    };
  }

  function toXY(pair) {
    if (!bounds) return { x: WIDTH / 2, y: HEIGHT / 2 };
    const [lng, lat] = pair;
    const x = PAD + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (WIDTH - PAD * 2);
    const y = PAD + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * (HEIGHT - PAD * 2);
    return { x, y };
  }

  function toLngLat(point) {
    if (!bounds) return null;
    const xRatio = (point.x - PAD) / (WIDTH - PAD * 2);
    const yRatio = (point.y - PAD) / (HEIGHT - PAD * 2);
    const lng = bounds.minLng + xRatio * (bounds.maxLng - bounds.minLng);
    const lat = bounds.maxLat - yRatio * (bounds.maxLat - bounds.minLat);
    return [lng, lat];
  }

  function objectCoordinates(object) {
    const geometry = object.geometry || {};
    if (geometry.type === "Point") return [geometry.coordinates];
    if (geometry.type === "LineString") return geometry.coordinates || [];
    if (geometry.type === "Polygon") {
      const ring = geometry.coordinates?.[0] || [];
      if (ring.length > 1) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first?.[0] === last?.[0] && first?.[1] === last?.[1]) return ring.slice(0, -1);
      }
      return ring;
    }
    return [];
  }

  function geometryFromPoints(kind, pairs) {
    if (pointKinds.has(kind)) return { type: "Point", coordinates: pairs[0] };
    if (kind === "boundary") {
      const ring = [...pairs];
      if (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) ring.push([...ring[0]]);
      return { type: "Polygon", coordinates: [ring] };
    }
    return { type: "LineString", coordinates: pairs };
  }

  function pointerPoint(event) {
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    const local = p.matrixTransform(matrix.inverse());
    return {
      x: Math.max(PAD, Math.min(WIDTH - PAD, local.x)),
      y: Math.max(PAD, Math.min(HEIGHT - PAD, local.y))
    };
  }

  function haversineMeters(a, b) {
    const R = 6371008.8;
    const toRad = value => value * Math.PI / 180;
    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);
    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function measureText(object) {
    const pairs = objectCoordinates(object);
    if (object.geometry?.type === "LineString") {
      let total = 0;
      for (let i = 1; i < pairs.length; i += 1) total += haversineMeters(pairs[i - 1], pairs[i]);
      return `${total.toFixed(total < 100 ? 1 : 0)} m from real coordinates`;
    }
    if (object.geometry?.type === "Point" && pairs[0]) return `${pairs[0][1].toFixed(6)}, ${pairs[0][0].toFixed(6)}`;
    if (object.geometry?.type === "Polygon") return `${pairs.length} boundary vertices · real coordinates`;
    return "";
  }

  function drawGrid() {
    const group = svgEl("g", { "aria-hidden": "true" });
    for (let x = 50; x < WIDTH; x += 50) group.append(svgEl("line", { x1: x, y1: 0, x2: x, y2: HEIGHT, class: "grid-line" }));
    for (let y = 50; y < HEIGHT; y += 50) group.append(svgEl("line", { x1: 0, y1: y, x2: WIDTH, y2: y, class: "grid-line" }));
    svg.append(group);
  }

  function drawObject(object) {
    const pairs = objectCoordinates(object);
    if (!pairs.length) return;
    const pts = pairs.map(toXY);
    let node;

    if (object.geometry.type === "Point") {
      const p = pts[0];
      node = svgEl("circle", { cx: p.x, cy: p.y, r: object.kind === "water_source" ? 9 : 7, class: `object obj-point obj-${object.kind}` });
    } else if (object.geometry.type === "Polygon") {
      node = svgEl("polygon", { points: pts.map(p => `${p.x},${p.y}`).join(" "), class: `object obj-${object.kind}` });
    } else {
      node = svgEl("polyline", { points: pts.map(p => `${p.x},${p.y}`).join(" "), class: `object obj-${object.kind}` });
    }

    node.dataset.objectId = object.id;
    if (selectedId === object.id) node.classList.add("selected");
    node.addEventListener("pointerup", event => {
      if (activeKind !== "select" || dragging) return;
      event.stopPropagation();
      selectObject(object.id);
    });
    svg.append(node);

    const labelAt = pts[0];
    const label = svgEl("text", { x: labelAt.x + 9, y: labelAt.y - 9, class: "label" });
    label.textContent = object.id;
    svg.append(label);

    if (editMode && selectedId === object.id) {
      pts.forEach((p, index) => {
        const handle = svgEl("circle", { cx: p.x, cy: p.y, r: 7, class: "handle", "data-handle-index": index });
        handle.addEventListener("pointerdown", event => {
          event.stopPropagation();
          handle.setPointerCapture?.(event.pointerId);
          dragging = { id: object.id, index, pointerId: event.pointerId };
        });
        svg.append(handle);
      });
    }
  }

  function drawDraft() {
    if (!draft.length) return;
    const points = draft.map(toXY);
    if (points.length > 1) svg.append(svgEl("polyline", { points: points.map(p => `${p.x},${p.y}`).join(" "), class: "draft" }));
    points.forEach(p => svg.append(svgEl("circle", { cx: p.x, cy: p.y, r: 6, class: "draft-point" })));
  }

  function render() {
    const state = store.read();
    const visible = state.objects.filter(object => ["boundary", "main", "submain", "lateral", "plant", "water_source", "path", "device"].includes(object.kind));
    bounds = computeBounds(visible);
    svg.replaceChildren();
    drawGrid();
    visible.forEach(drawObject);
    drawDraft();
    $("#empty").hidden = Boolean(bounds);
    updateStatus(state, visible);
    updateSelection();
  }

  function updateStatus(state, visible) {
    const tool = activeKind === "select" ? "Select" : `Drawing ${LABEL[activeKind] || activeKind}`;
    if (!bounds) {
      $("#status").textContent = `${tool} · no real coordinate anchor yet`;
      return;
    }
    const pipeCount = visible.filter(o => ["main", "submain", "lateral"].includes(o.kind)).length;
    const fieldCount = visible.length - pipeCount;
    $("#status").textContent = `${tool} · ${fieldCount} field object${fieldCount === 1 ? "" : "s"} · ${pipeCount} pipe${pipeCount === 1 ? "" : "s"} · canonical revision ${state.revision}`;
  }

  function selectObject(id) {
    selectedId = id;
    editMode = false;
    render();
  }

  function clearSelection() {
    selectedId = null;
    editMode = false;
    $("#selection").classList.remove("show");
    render();
  }

  function updateSelection() {
    if (!selectedId) {
      $("#selection").classList.remove("show");
      return;
    }
    const object = store.read().objects.find(item => item.id === selectedId);
    if (!object) {
      selectedId = null;
      editMode = false;
      $("#selection").classList.remove("show");
      return;
    }
    $("#selectionName").textContent = `${object.id} · ${LABEL[object.kind] || object.kind}`;
    $("#selectionState").textContent = `${object.state || "described"} · same canonical object as FIELD`;
    $("#measure").textContent = measureText(object);
    $("#editSelected").textContent = editMode ? "Finish edit" : "Edit points";
    $("#selection").classList.add("show");
  }

  function setTool(kind) {
    activeKind = kind;
    draft = [];
    editMode = false;
    if (kind !== "select") selectedId = null;
    $$('[data-kind]').forEach(button => button.classList.toggle("on", button.dataset.kind === kind));
    $("#finishBoundary").classList.remove("show");
    $("#workMenu").classList.remove("open");
    render();
  }

  function commitDraft() {
    if (!bounds || !draft.length) return;
    if (activeKind === "boundary" && draft.length < 3) return;
    if (lineKinds.has(activeKind) && draft.length < 2) return;
    const object = store.addObject(activeKind, geometryFromPoints(activeKind, draft), { source_surface: "spatial_drawing" }, "described");
    activeKind = "select";
    draft = [];
    selectedId = object.id;
    $$('[data-kind]').forEach(button => button.classList.toggle("on", button.dataset.kind === "select"));
    $("#finishBoundary").classList.remove("show");
    render();
  }

  svg.addEventListener("pointerup", event => {
    if (dragging) return;
    if (activeKind === "select") {
      if (event.target === svg) clearSelection();
      return;
    }
    if (!bounds) return;
    const ll = toLngLat(pointerPoint(event));
    if (!ll) return;

    if (pointKinds.has(activeKind)) {
      draft = [ll];
      commitDraft();
      return;
    }

    draft.push(ll);
    if (lineKinds.has(activeKind) && draft.length === 2) commitDraft();
    if (activeKind === "boundary" && draft.length >= 3) $("#finishBoundary").classList.add("show");
    render();
  });

  svg.addEventListener("pointermove", event => {
    if (!dragging || !bounds) return;
    const object = store.read().objects.find(item => item.id === dragging.id);
    if (!object) return;
    const pairs = objectCoordinates(object);
    const ll = toLngLat(pointerPoint(event));
    if (!ll || !pairs[dragging.index]) return;
    pairs[dragging.index] = ll;
    const geometry = geometryFromPoints(object.kind, pairs);
    const projected = pairs.map(toXY);
    const handles = $$(`[data-handle-index]`, svg);
    const handle = handles.find(item => Number(item.dataset.handleIndex) === dragging.index);
    if (handle) {
      const p = projected[dragging.index];
      handle.setAttribute("cx", p.x);
      handle.setAttribute("cy", p.y);
    }
    dragging.geometry = geometry;
  });

  svg.addEventListener("pointerup", event => {
    if (!dragging) return;
    if (dragging.geometry) store.updateGeometry(dragging.id, dragging.geometry, "drawing_vertex_edit");
    dragging = null;
    render();
  }, true);

  $("#workButton").addEventListener("click", () => $("#workMenu").classList.toggle("open"));
  $("#closeWork").addEventListener("click", () => $("#workMenu").classList.remove("open"));
  $$('[data-kind]').forEach(button => button.addEventListener("click", () => setTool(button.dataset.kind)));
  $("#finishBoundary").addEventListener("click", commitDraft);
  $("#closeSelection").addEventListener("click", clearSelection);

  $("#editSelected").addEventListener("click", () => {
    if (!selectedId) return;
    editMode = !editMode;
    render();
  });

  $("#duplicateSelected").addEventListener("click", () => {
    if (!selectedId) return;
    const duplicate = store.duplicateObject(selectedId);
    if (!duplicate) return;
    selectedId = duplicate.id;
    editMode = false;
    render();
  });

  $("#deleteSelected").addEventListener("click", () => {
    if (!selectedId) return;
    const id = selectedId;
    selectedId = null;
    editMode = false;
    store.removeObject(id);
    render();
  });

  $("#fitButton").addEventListener("click", render);
  window.addEventListener("tagro:spatial-change", () => render());
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    activeKind = "select";
    draft = [];
    editMode = false;
    $("#workMenu").classList.remove("open");
    $("#finishBoundary").classList.remove("show");
    $$('[data-kind]').forEach(button => button.classList.toggle("on", button.dataset.kind === "select"));
    render();
  });

  render();
  setTool("select");
})();
