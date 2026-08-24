(() => {
  "use strict";

  const store = window.TAGROSpatial;
  if (!store || !window.L) return;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const layers = new Map();
  const previewLayers = [];
  let selectedId = null;
  let activeKind = "select";
  let locationMarker = null;

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

  const STYLE = {
    boundary: { color: "#d96532", weight: 2, fillColor: "#d96532", fillOpacity: 0.08 },
    main: { color: "#d84a26", weight: 5 },
    submain: { color: "#176f87", weight: 4 },
    lateral: { color: "#4d7f5e", weight: 3 },
    path: { color: "#776d64", weight: 3, dashArray: "8 7" },
    plant: { color: "#39784d", fillColor: "#72a77e", fillOpacity: 1, weight: 2, radius: 6 },
    water_source: { color: "#165f97", fillColor: "#2a8ac9", fillOpacity: 1, weight: 2, radius: 8 },
    device: { color: "#9a5a18", fillColor: "#e8a445", fillOpacity: 1, weight: 2, radius: 6 }
  };

  const map = L.map("map", {
    zoomControl: false,
    doubleClickZoom: true,
    maxZoom: 23,
    minZoom: 3,
    worldCopyJump: true
  }).setView([10.2, 76.3], 8);

  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { maxNativeZoom: 18, maxZoom: 23, attribution: "Esri, Maxar, Earthstar Geographics and GIS User Community", pmIgnore: true }
  ).addTo(map);

  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 20, attribution: "© OpenStreetMap contributors", pmIgnore: true }
  );

  L.control.layers({ Satellite: satellite, Street: street }, {}, { position: "topleft", collapsed: true }).addTo(map);

  map.pm.setGlobalOptions({
    allowSelfIntersection: false,
    snappable: true,
    snapDistance: 14,
    finishOn: "dblclick"
  });

  function latLngsFromGeometry(geometry) {
    if (!geometry) return null;
    if (geometry.type === "Point") return [geometry.coordinates[1], geometry.coordinates[0]];
    if (geometry.type === "LineString") return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    if (geometry.type === "Polygon") return (geometry.coordinates[0] || []).map(([lng, lat]) => [lat, lng]);
    return null;
  }

  function geometryFromLayer(layer) {
    const feature = layer?.toGeoJSON?.();
    return feature?.geometry || null;
  }

  function createLayer(object) {
    const style = STYLE[object.kind] || { color: "#333", weight: 3 };
    const coords = latLngsFromGeometry(object.geometry);
    let layer;

    if (object.geometry?.type === "Point") layer = L.circleMarker(coords, style);
    else if (object.geometry?.type === "Polygon") layer = L.polygon(coords, style);
    else layer = L.polyline(coords, style);

    layer.options.tagroObjectId = object.id;
    layer.options.tagroKind = object.kind;
    layer.bindTooltip(object.id, { direction: "top", className: "tagro-label", opacity: 0.95 });
    layer.on("click", event => {
      L.DomEvent.stopPropagation(event);
      selectObject(object.id);
    });
    layer.on("pm:update", () => saveLayerGeometry(object.id, layer));
    layer.on("pm:dragend", () => saveLayerGeometry(object.id, layer));
    layer.addTo(map);
    return layer;
  }

  function saveLayerGeometry(id, layer) {
    const geometry = geometryFromLayer(layer);
    if (!geometry) return;
    store.updateGeometry(id, geometry, "map_edit");
  }

  function clearRenderedLayers() {
    layers.forEach(layer => {
      try { map.removeLayer(layer); } catch {}
    });
    layers.clear();
  }

  function clearPreviewLayers() {
    while (previewLayers.length) {
      const layer = previewLayers.pop();
      try { map.removeLayer(layer); } catch {}
    }
  }

  function renderProposalPreview() {
    clearPreviewLayers();
    const adapter = window.TAGROSpatialProposal;
    const active = adapter?.current?.() || null;
    const panel = $("#proposalPanel");

    if (!active?.objects?.length) {
      panel?.classList.remove("show");
      return;
    }

    active.objects.forEach(spec => {
      const coords = latLngsFromGeometry(spec.geometry);
      if (!coords) return;
      let layer;
      if (spec.geometry.type === "Point") {
        layer = L.circleMarker(coords, {
          radius: 7,
          color: "#ef8a35",
          fillColor: "#ef8a35",
          fillOpacity: 0.5,
          weight: 3,
          interactive: false,
          pmIgnore: true
        });
      } else if (spec.geometry.type === "Polygon") {
        layer = L.polygon(coords, {
          color: "#ef8a35",
          weight: 4,
          dashArray: "9 7",
          fillColor: "#ef8a35",
          fillOpacity: 0.05,
          interactive: false,
          pmIgnore: true,
          className: "tagro-proposal-preview"
        });
      } else {
        layer = L.polyline(coords, {
          color: "#ef8a35",
          weight: 4,
          dashArray: "9 7",
          opacity: 0.9,
          interactive: false,
          pmIgnore: true,
          className: "tagro-proposal-preview"
        });
      }
      layer.bindTooltip("PROPOSED", { direction: "top", className: "tagro-label", opacity: 0.95 });
      layer.addTo(map);
      previewLayers.push(layer);
    });

    $("#proposalTitle").textContent = active.proposal?.summary || "Geometry proposal";
    $("#proposalNote").textContent = active.note || "Preview only. Geometry is not yet part of the design.";
    panel?.classList.add("show");
  }

  function fitToObjects() {
    const all = [...layers.values(), ...previewLayers];
    if (!all.length) return;
    const group = L.featureGroup(all);
    const objectBounds = group.getBounds();
    if (objectBounds?.isValid()) map.fitBounds(objectBounds.pad(0.18), { maxZoom: 20 });
  }

  function renderAll({ fit = false } = {}) {
    const state = store.read();
    clearRenderedLayers();
    state.objects.forEach(object => {
      if (!["boundary", "main", "submain", "lateral", "plant", "water_source", "path", "device"].includes(object.kind)) return;
      const layer = createLayer(object);
      layers.set(object.id, layer);
    });
    renderProposalPreview();
    updateStatus(state);
    updateSelection();
    if (fit && (layers.size || previewLayers.length)) fitToObjects();
  }

  function lineLengthMeters(geometry) {
    if (geometry?.type !== "LineString") return null;
    const coords = geometry.coordinates;
    let total = 0;
    for (let i = 1; i < coords.length; i += 1) {
      total += map.distance([coords[i - 1][1], coords[i - 1][0]], [coords[i][1], coords[i][0]]);
    }
    return total;
  }

  function polygonAreaSqm(geometry) {
    if (geometry?.type !== "Polygon") return null;
    const ring = geometry.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length < 3) return null;
    const earthRadius = 6378137;
    let area = 0;
    for (let i = 0; i < ring.length; i += 1) {
      const [lng1, lat1] = ring[i];
      const [lng2, lat2] = ring[(i + 1) % ring.length];
      const dLng = (lng2 - lng1) * Math.PI / 180;
      area += dLng * (2 + Math.sin(lat1 * Math.PI / 180) + Math.sin(lat2 * Math.PI / 180));
    }
    return Math.abs(area * earthRadius * earthRadius / 2);
  }

  function measurementText(object) {
    const length = lineLengthMeters(object.geometry);
    if (length != null) return `${length.toFixed(length < 100 ? 1 : 0)} m measured from map geometry`;
    const area = polygonAreaSqm(object.geometry);
    if (area != null) {
      const acres = area / 4046.8564224;
      const areaText = area < 1000 ? area.toFixed(0) : Math.round(area).toLocaleString();
      return `${areaText} m² · ${acres.toFixed(2)} acres`;
    }
    const coordinate = object.geometry?.coordinates;
    if (object.geometry?.type === "Point" && Array.isArray(coordinate)) return `${coordinate[1].toFixed(6)}, ${coordinate[0].toFixed(6)}`;
    return "";
  }

  function updateStatus(state = store.read()) {
    const counts = {};
    state.objects.forEach(object => { counts[object.kind] = (counts[object.kind] || 0) + 1; });
    const parts = [];
    if (counts.boundary) parts.push(`${counts.boundary} boundary`);
    if (counts.main) parts.push(`${counts.main} main`);
    if (counts.submain) parts.push(`${counts.submain} submain`);
    if (counts.lateral) parts.push(`${counts.lateral} lateral`);
    if (counts.plant) parts.push(`${counts.plant} plant${counts.plant === 1 ? "" : "s"}`);
    if (counts.water_source) parts.push(`${counts.water_source} water source`);
    if (previewLayers.length) parts.push(`${previewLayers.length} proposed`);
    const tool = activeKind === "select" ? "Select" : `Drawing ${LABEL[activeKind] || activeKind}`;
    $("#status").textContent = parts.length ? `${tool} · ${parts.join(" · ")} · real map geometry` : `${tool} · blank field · nothing assumed`;
  }

  function selectObject(id) {
    selectedId = id;
    updateSelection();
  }

  function clearSelection() {
    const old = selectedId ? layers.get(selectedId) : null;
    if (old?.pm?.enabled?.()) old.pm.disable();
    selectedId = null;
    $("#selection").classList.remove("show");
  }

  function updateSelection() {
    if (!selectedId) return;
    const object = store.read().objects.find(item => item.id === selectedId);
    if (!object) {
      clearSelection();
      return;
    }
    $("#selectionName").textContent = `${object.id} · ${LABEL[object.kind] || object.kind}`;
    $("#selectionKind").textContent = `${object.state || "described"} · canonical lng/lat geometry`;
    $("#measure").textContent = measurementText(object);
    const layer = layers.get(selectedId);
    $("#editSelected").textContent = layer?.pm?.enabled?.() ? "Finish edit" : "Edit";
    $("#selection").classList.add("show");
  }

  function setTool(kind) {
    activeKind = kind;
    map.pm.disableDraw();
    $$('[data-kind]').forEach(button => button.classList.toggle("on", button.dataset.kind === kind));
    $("#workMenu").classList.remove("open");

    if (kind === "select") {
      updateStatus();
      return;
    }

    const options = { snappable: true, snapDistance: 14 };
    if (kind === "boundary") map.pm.enableDraw("Polygon", options);
    else if (["main", "submain", "lateral", "path"].includes(kind)) map.pm.enableDraw("Line", options);
    else if (["plant", "water_source", "device"].includes(kind)) map.pm.enableDraw("Marker", options);
    updateStatus();
  }

  map.on("pm:create", event => {
    if (activeKind === "select") {
      try { map.removeLayer(event.layer); } catch {}
      return;
    }
    const geometry = geometryFromLayer(event.layer);
    try { map.removeLayer(event.layer); } catch {}
    if (!geometry) return;
    const object = store.addObject(activeKind, geometry, { source_surface: "field_map" }, "described");
    activeKind = "select";
    map.pm.disableDraw();
    renderAll();
    selectObject(object.id);
  });

  map.on("click", () => {
    if (activeKind === "select") clearSelection();
  });

  $("#workButton").addEventListener("click", () => $("#workMenu").classList.toggle("open"));
  $("#closeWork").addEventListener("click", () => $("#workMenu").classList.remove("open"));
  $$('[data-kind]').forEach(button => button.addEventListener("click", () => setTool(button.dataset.kind)));
  $("#closeSelection").addEventListener("click", clearSelection);

  $("#editSelected").addEventListener("click", () => {
    const layer = selectedId ? layers.get(selectedId) : null;
    if (!layer?.pm) return;
    if (layer.pm.enabled()) {
      layer.pm.disable();
      saveLayerGeometry(selectedId, layer);
    } else {
      layer.pm.enable({ allowSelfIntersection: false, snappable: true, snapDistance: 14 });
    }
    updateSelection();
  });

  $("#duplicateSelected").addEventListener("click", () => {
    if (!selectedId) return;
    const duplicate = store.duplicateObject(selectedId);
    if (!duplicate) return;
    renderAll();
    selectObject(duplicate.id);
  });

  $("#deleteSelected").addEventListener("click", () => {
    if (!selectedId) return;
    const deleting = selectedId;
    clearSelection();
    store.removeObject(deleting);
    renderAll();
  });

  $("#acceptProposal").addEventListener("click", () => {
    const result = window.TAGROSpatialProposal?.accept?.();
    if (result?.ok) {
      clearSelection();
      renderAll();
    }
  });

  $("#clearProposal").addEventListener("click", () => {
    window.TAGROSpatialProposal?.clear?.();
    renderAll();
  });

  async function searchPlace() {
    const value = $("#searchInput").value.trim();
    if (!value) return;
    const coordinate = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (coordinate) {
      map.setView([Number(coordinate[1]), Number(coordinate[2])], 19);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(value)}`);
      const data = await response.json();
      if (data?.[0]) map.setView([Number(data[0].lat), Number(data[0].lon)], 19);
    } catch {}
  }

  $("#searchButton").addEventListener("click", searchPlace);
  $("#searchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") searchPlace();
  });

  $("#locateButton").addEventListener("click", () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(position => {
      const latlng = [position.coords.latitude, position.coords.longitude];
      map.setView(latlng, 19);
      if (locationMarker) locationMarker.setLatLng(latlng);
      else locationMarker = L.circleMarker(latlng, {
        radius: 6,
        weight: 2,
        color: "#fff",
        fillColor: "#1677ff",
        fillOpacity: 1,
        interactive: false,
        pmIgnore: true
      }).addTo(map);
    }, () => {}, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
  });

  window.addEventListener("tagro:spatial-change", () => renderAll());
  window.addEventListener("tagro:spatial-preview-change", () => renderAll());
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    map.pm.disableDraw();
    activeKind = "select";
    $("#workMenu").classList.remove("open");
    $$('[data-kind]').forEach(button => button.classList.toggle("on", button.dataset.kind === "select"));
    updateStatus();
  });

  window.TAGROFieldMap = Object.freeze({ map, renderAll, fitToObjects });
  renderAll({ fit: true });
  setTool("select");
})();
