(() => {
  "use strict";

  const store = window.TAGROSpatial;
  if (!store) return;

  const R = 6371008.8;
  const PREVIEW_PREFIX = "tagro.irrigation.spatial.preview.v1";
  const EPS = 1e-9;

  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function previewKey() {
    return `${PREVIEW_PREFIX}:${store.jobId()}`;
  }

  function savePreview(value) {
    localStorage.setItem(previewKey(), JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("tagro:spatial-preview-change", { detail: clone(value) }));
    return value;
  }

  function current() {
    try {
      const parsed = JSON.parse(localStorage.getItem(previewKey()) || "null");
      return parsed?.contract === "tagro-spatial-proposal-preview-v1" ? parsed : null;
    } catch {
      return null;
    }
  }

  function clear() {
    localStorage.removeItem(previewKey());
    window.dispatchEvent(new CustomEvent("tagro:spatial-preview-change", { detail: null }));
  }

  function pointCoordinate(object) {
    return object?.geometry?.type === "Point" && Array.isArray(object.geometry.coordinates)
      ? object.geometry.coordinates
      : null;
  }

  function lineCoordinates(object) {
    return object?.geometry?.type === "LineString" && Array.isArray(object.geometry.coordinates) && object.geometry.coordinates.length >= 2
      ? object.geometry.coordinates
      : null;
  }

  function projectionFor(coordinates) {
    const flat = coordinates.filter(pair => Array.isArray(pair) && Number.isFinite(pair[0]) && Number.isFinite(pair[1]));
    if (!flat.length) return null;
    const lng0 = flat.reduce((sum, pair) => sum + pair[0], 0) / flat.length;
    const lat0 = flat.reduce((sum, pair) => sum + pair[1], 0) / flat.length;
    const lat0Rad = lat0 * Math.PI / 180;
    const cosLat = Math.max(0.1, Math.cos(lat0Rad));
    return {
      origin: [lng0, lat0],
      project(pair) {
        return {
          x: R * ((pair[0] - lng0) * Math.PI / 180) * cosLat,
          y: R * ((pair[1] - lat0) * Math.PI / 180)
        };
      },
      unproject(point) {
        return [
          lng0 + (point.x / (R * cosLat)) * 180 / Math.PI,
          lat0 + (point.y / R) * 180 / Math.PI
        ];
      }
    };
  }

  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
  const mul = (a, scalar) => ({ x: a.x * scalar, y: a.y * scalar });
  const dot = (a, b) => a.x * b.x + a.y * b.y;

  function basisFor(anchor, projection) {
    const coords = lineCoordinates(anchor);
    if (!coords) return null;
    const a = projection.project(coords[0]);
    const b = projection.project(coords[coords.length - 1]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (!(length > EPS)) return null;
    const u = { x: dx / length, y: dy / length };
    return { a, b, length, u, v: { x: -u.y, y: u.x } };
  }

  function inBasis(point, basis) {
    const delta = sub(point, basis.a);
    return { t: dot(delta, basis.u), s: dot(delta, basis.v) };
  }

  function fromBasis(t, s, basis) {
    return add(basis.a, add(mul(basis.u, t), mul(basis.v, s)));
  }

  function anchorFor(proposal, objects, kind) {
    const ids = [...(proposal?.intent?.anchor_ids || []), ...(proposal?.affected_ids || [])];
    for (const id of ids) {
      const object = objects.find(item => item.id === id);
      if (object?.kind === kind && lineCoordinates(object)) return object;
    }
    return null;
  }

  function targetObjects(proposal, objects) {
    const ids = new Set([...(proposal?.affected_ids || []), ...(proposal?.intent?.anchor_ids || [])]);
    const eligible = objects.filter(object => ["plant", "device"].includes(object.kind) && pointCoordinate(object));
    const explicit = eligible.filter(object => ids.has(object.id));
    return explicit.length ? explicit : eligible;
  }

  function sideAllows(signedDistance, side) {
    if (side === "left") return signedDistance >= -0.25;
    if (side === "right") return signedDistance <= 0.25;
    return true;
  }

  function clusterByAlongDistance(items, tolerance) {
    const sorted = [...items].sort((a, b) => a.t - b.t);
    const clusters = [];
    for (const item of sorted) {
      const last = clusters[clusters.length - 1];
      if (!last || Math.abs(item.t - last.meanT) > tolerance) {
        clusters.push({ items: [item], meanT: item.t });
      } else {
        last.items.push(item);
        last.meanT = last.items.reduce((sum, member) => sum + member.t, 0) / last.items.length;
      }
    }
    return clusters;
  }

  function linePreview({ proposal, anchorKind, outputKind }) {
    const state = store.snapshot();
    const objects = state.objects || [];
    const anchor = anchorFor(proposal, objects, anchorKind);
    if (!anchor) return { ok: false, reason: `${anchorKind}_anchor_required` };

    const targets = targetObjects(proposal, objects);
    if (!targets.length) return { ok: false, reason: "mark_plants_or_devices_first" };

    const projection = projectionFor([
      ...lineCoordinates(anchor),
      ...targets.map(pointCoordinate).filter(Boolean)
    ]);
    if (!projection) return { ok: false, reason: "projection_unavailable" };

    const basis = basisFor(anchor, projection);
    if (!basis) return { ok: false, reason: "anchor_geometry_invalid" };

    const parameters = proposal?.intent?.parameters || {};
    const side = parameters.side || "unknown";
    const spacing = Number(parameters.spacing_m);
    const clusterToleranceM = Number.isFinite(spacing) && spacing > 0
      ? clamp(spacing * 0.35, 0.5, 4)
      : 1.5;

    const mapped = targets
      .map(object => {
        const projected = projection.project(pointCoordinate(object));
        return { object, ...inBasis(projected, basis) };
      })
      .filter(item => item.t >= -0.5 && item.t <= basis.length + 0.5)
      .filter(item => sideAllows(item.s, side));

    if (!mapped.length) return { ok: false, reason: "targets_outside_anchor_span" };

    const clusters = clusterByAlongDistance(mapped, clusterToleranceM);
    const objectsOut = clusters.map((cluster, index) => {
      const signed = cluster.items.map(item => item.s);
      let startS = Math.min(0, ...signed);
      let endS = Math.max(0, ...signed);
      if (side === "left") startS = 0;
      if (side === "right") endS = 0;

      const start = projection.unproject(fromBasis(cluster.meanT, startS, basis));
      const end = projection.unproject(fromBasis(cluster.meanT, endS, basis));
      return {
        temp_id: `${proposal.proposal_id || "proposal"}_real_${index + 1}`,
        kind: outputKind,
        state: "proposed",
        geometry: { type: "LineString", coordinates: [start, end] },
        properties: {
          generated_from: anchor.id,
          target_ids: cluster.items.map(item => item.object.id),
          direction_basis: "marked_plants_or_devices",
          row_grouping_tolerance_m: clusterToleranceM,
          row_grouping_basis: Number.isFinite(spacing) && spacing > 0 ? "proposal_spacing" : "position_inference",
          proposal_id: proposal.proposal_id || null
        }
      };
    });

    return {
      ok: true,
      contract: "tagro-spatial-proposal-preview-v1",
      job_id: state.job_id,
      proposal: clone(proposal),
      operation: proposal?.intent?.operation,
      anchor_id: anchor.id,
      objects: objectsOut,
      note: Number.isFinite(spacing) && spacing > 0
        ? `Preview grouped marked points using the proposed ${spacing} m spacing as context. Geometry is not accepted yet.`
        : "Preview grouped marked points by their real positions using a 1.5 m row tolerance. This grouping is an inference for review, not a field fact.",
      created_at: new Date().toISOString()
    };
  }

  function preview(proposal) {
    const operation = proposal?.intent?.operation;
    let result;
    if (operation === "generate_laterals") {
      result = linePreview({ proposal, anchorKind: "submain", outputKind: "lateral" });
    } else if (operation === "generate_submains") {
      result = linePreview({ proposal, anchorKind: "main", outputKind: "submain" });
    } else {
      return { ok: false, reason: "operation_not_supported_by_spatial_preview", operation };
    }
    if (result.ok) savePreview(result);
    return result;
  }

  function accept() {
    const active = current();
    if (!active?.objects?.length) return { ok: false, reason: "no_active_preview" };
    const created = active.objects.map(spec => store.addObject(
      spec.kind,
      spec.geometry,
      {
        ...(spec.properties || {}),
        accepted_from_proposal: active.proposal?.proposal_id || null,
        acceptance_scope: "geometry_only"
      },
      "accepted"
    ));

    if (window.TAGROLearning?.recordProposalDecision && active.proposal) {
      window.TAGROLearning.recordProposalDecision(
        store.jobId(),
        active.proposal,
        "accepted",
        `Accepted real-field geometry proposal: ${active.proposal.summary || active.proposal.proposal_id || "proposal"}. Engineering remains subject to deterministic validation.`
      );
    }
    clear();
    return { ok: true, created };
  }

  window.TAGROSpatialProposal = Object.freeze({ preview, current, clear, accept });
})();
