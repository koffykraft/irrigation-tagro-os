(() => {
  "use strict";

  const learning = window.TAGROLearning;
  if (!learning) return;

  const jobId = learning.ensureJobId();
  const originalFetch = window.fetch.bind(window);
  const proposalsById = new Map();
  const proposalsBySummary = new Map();

  const normalizeUrl = input => {
    try {
      if (typeof input === "string") return new URL(input, location.href);
      if (input instanceof Request) return new URL(input.url, location.href);
      return new URL(String(input), location.href);
    } catch {
      return null;
    }
  };

  function rememberProposals(data) {
    const proposals = data?.structured?.proposals;
    if (!Array.isArray(proposals)) return;
    proposals.forEach(proposal => {
      if (proposal?.proposal_id) proposalsById.set(proposal.proposal_id, proposal);
      if (proposal?.summary) proposalsBySummary.set(String(proposal.summary).trim(), proposal);
    });
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

  function canonicalRunLengths(objects) {
    return (objects || [])
      .filter(object => ["main", "submain", "lateral", "path"].includes(object.kind) && object.geometry?.type === "LineString")
      .map(object => {
        const coordinates = object.geometry.coordinates || [];
        let length = 0;
        for (let i = 1; i < coordinates.length; i += 1) length += haversineMeters(coordinates[i - 1], coordinates[i]);
        return {
          id: object.id,
          kind: object.kind,
          length_m: Number(length.toFixed(2)),
          source: "canonical_geojson",
          evidence_state: object.state || "described"
        };
      });
  }

  function injectLearning(init = {}) {
    if (typeof init.body !== "string") return init;
    try {
      const body = JSON.parse(init.body);
      const learningContext = learning.context(jobId, 20);
      const spatial = window.TAGROSpatial?.snapshot?.() || null;
      const canonicalObjects = Array.isArray(spatial?.objects) ? spatial.objects : [];
      const jobInformation = window.TAGROJobInfo?.designContext?.(jobId) || null;

      body.preferences = {
        ...(body.preferences || {}),
        learning_evidence: learningContext
      };

      body.field = {
        ...(body.field || {}),
        anonymous_job_id: jobId,
        job_information: jobInformation,
        canonical_spatial: spatial ? {
          contract: spatial.contract,
          revision: spatial.revision,
          object_count: canonicalObjects.length,
          geometry_authority: "real_map_geojson"
        } : null
      };

      if (spatial) {
        body.geometry = {
          ...(body.geometry || {}),
          canonical_objects: canonicalObjects,
          geometry_authority: "Canonical objects use real lng/lat GeoJSON. Any quick-sketch canvas objects remain preliminary/unscaled and must not override them."
        };
        body.network = {
          ...(body.network || {}),
          canonical_relationships: Array.isArray(spatial.relationships) ? spatial.relationships : []
        };
        body.hydraulics = {
          ...(body.hydraulics || {}),
          canonical_run_lengths_m: canonicalRunLengths(canonicalObjects),
          measurement_rule: "Lengths in canonical_run_lengths_m come from real geographic coordinates; hydraulic PASS/FAIL still requires all other deterministic inputs."
        };
      }

      return { ...init, body: JSON.stringify(body) };
    } catch {
      return init;
    }
  }

  window.fetch = async function(input, init = {}) {
    const url = normalizeUrl(input);
    const isAdviser = url?.pathname === "/api/ai/advise" && String(init?.method || "GET").toUpperCase() === "POST";
    const nextInit = isAdviser ? injectLearning(init) : init;
    const response = await originalFetch(input, nextInit);
    if (isAdviser) response.clone().json().then(rememberProposals).catch(() => {});
    return response;
  };

  function selectedObjectId() {
    const text = document.querySelector("#selectionName")?.textContent?.trim() || "";
    const match = text.match(/^([A-Z]+\d+)/i);
    return match ? match[1] : null;
  }

  function proposalFromButton(button) {
    const card = button.closest(".message.adviser");
    const summary = card?.querySelector("b")?.textContent?.trim() || "";
    return proposalsBySummary.get(summary) || null;
  }

  document.addEventListener("click", event => {
    const button = event.target?.closest?.("button");
    if (!button) return;
    const label = button.textContent?.trim() || "";

    if (label === "Preview drawing") {
      const proposal = proposalFromButton(button);
      const spatial = window.TAGROSpatial?.snapshot?.();
      if (proposal?.kind === "geometry" && spatial?.objects?.length && window.TAGROSpatialProposal?.preview) {
        const result = window.TAGROSpatialProposal.preview(proposal);
        if (result?.ok) {
          event.preventDefault();
          event.stopImmediatePropagation();
          const query = new URLSearchParams({ view: "field", proposal: proposal.proposal_id || "active" });
          location.href = `./workbench.html?${query}`;
          return;
        }
      }
    }

    if (label === "Prefer controls near here") {
      const objectId = selectedObjectId();
      learning.recordPreference(
        jobId,
        "Keep daily irrigation controls somewhere easy to reach from this path.",
        objectId ? [objectId] : []
      );
      return;
    }

    if (label === "Use this geometry") {
      const proposal = proposalFromButton(button);
      if (proposal) {
        learning.recordProposalDecision(
          jobId,
          proposal,
          "accepted",
          `Accepted geometry proposal: ${proposal.summary}. Acceptance is geometry only; engineering remains preliminary.`
        );
      }
      return;
    }

    if (label === "Not for this job") {
      const proposal = proposalFromButton(button);
      if (proposal) {
        learning.recordProposalDecision(
          jobId,
          proposal,
          "rejected",
          `Rejected proposal for this job: ${proposal.summary}.`
        );
      }
    }
  }, true);

  window.TAGROLearningBridge = {
    jobId,
    proposalsById,
    proposalsBySummary,
    learningContext: () => learning.context(jobId, 20),
    jobInformationContext: () => window.TAGROJobInfo?.designContext?.(jobId) || null,
    canonicalSpatialContext: () => window.TAGROSpatial?.snapshot?.() || null
  };
})();
