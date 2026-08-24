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

  function injectLearning(init = {}) {
    if (typeof init.body !== "string") return init;
    try {
      const body = JSON.parse(init.body);
      const context = learning.context(jobId, 20);
      body.preferences = {
        ...(body.preferences || {}),
        learning_evidence: context
      };
      body.field = {
        ...(body.field || {}),
        anonymous_job_id: jobId
      };
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

    if (isAdviser) {
      response.clone().json().then(rememberProposals).catch(() => {});
    }
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
    learningContext: () => learning.context(jobId, 20)
  };
})();
