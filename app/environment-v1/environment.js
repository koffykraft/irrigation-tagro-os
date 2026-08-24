(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const now = () => new Date().toISOString();

  const PREFIX = {
    boundary: "B", main: "M", submain: "S", lateral: "L", plant: "P",
    water_source: "W", path: "PATH", device: "D", valve: "V", filter: "F",
    venturi: "VT", pump: "PU", tank: "T", building: "BLD", obstacle: "O", note: "N"
  };

  const LABEL = {
    boundary: "Boundary", main: "Main", submain: "Submain", lateral: "Lateral",
    plant: "Plant", water_source: "Water source", path: "Path", device: "Device",
    valve: "Valve", filter: "Filter", venturi: "Venturi", pump: "Pump", tank: "Tank",
    building: "Building", obstacle: "Obstacle", note: "Note"
  };

  const LINE_KINDS = new Set(["main", "submain", "lateral", "path"]);
  const POINT_KINDS = new Set(["plant", "water_source", "device", "valve", "filter", "venturi", "pump", "tank"]);

  const state = {
    environment_id: `env_${Date.now()}`,
    job_id: null,
    surface: "field",
    maturity: "preliminary",
    active_task: null,
    objects: [],
    relationships: [],
    evidence: [],
    conversation: {
      messages: [],
      current_understanding: null,
      next_question: null,
      question_reason: null,
      depth: "sub_minimum"
    },
    proposals: [],
    design_state: {},
    materials_state: {},
    events: [],
    farmer: {},
    tool: "select",
    draft: [],
    selectedId: null,
    adviser: { online: false, endpoint: null, checking: true },
    engineering: { online: false, version: null, conformance: null, checkedAt: null, checking: true }
  };

  const el = {
    app: $("#app"), surfaceButton: $("#surfaceButton"), surfaceLabel: $("#surfaceLabel"),
    surfaceMenu: $("#surfaceMenu"), workButton: $("#workButton"), workMenu: $("#workMenu"),
    closeWorkMenu: $("#closeWorkMenu"), workMenuTitle: $("#workMenuTitle"), fieldTools: $("#fieldTools"),
    finishDraft: $("#finishDraft"), openDrawingAction: $("#openDrawingAction"), tellStoryAction: $("#tellStoryAction"),
    fieldCanvas: $("#fieldCanvas"), drawingCanvas: $("#drawingCanvas"), fieldHint: $("#fieldHint"),
    selectionCard: $("#selectionCard"), selectionName: $("#selectionName"), selectionState: $("#selectionState"),
    selectionActions: $("#selectionActions"), clearSelection: $("#clearSelection"),
    activeToolChip: $("#activeToolChip"), activeToolName: $("#activeToolName"), activeToolHint: $("#activeToolHint"), cancelTool: $("#cancelTool"),
    toast: $("#toast"), conversation: $("#conversation"), adviserForm: $("#adviserForm"), adviserInput: $("#adviserInput"),
    quickReplies: $("#quickReplies"), reflection: $("#reflection"), reflectionText: $("#reflectionText"), correctReflection: $("#correctReflection"),
    aiStatus: $("#aiStatus"), networkSummary: $("#networkSummary"), engineeringStatus: $("#engineeringStatus"),
    designUnknowns: $("#designUnknowns"), materialsList: $("#materialsList"), productKnowledgeText: $("#productKnowledgeText"),
    openAdviserFromMaterials: $("#openAdviserFromMaterials"), jobStatus: $("#jobStatus")
  };

  function emit(type, objectIds = [], payload = {}) {
    state.events.push({ id: `evt_${Date.now()}_${state.events.length + 1}`, type, at: now(), actor: "current_user", object_ids: objectIds, payload });
  }

  function toast(text) {
    el.toast.textContent = text;
    el.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.toast.classList.remove("show"), 1800);
  }

  function nextId(kind) {
    const prefix = PREFIX[kind] || "O";
    let i = 1;
    while (state.objects.some(o => o.id === `${prefix}${i}`)) i += 1;
    return `${prefix}${i}`;
  }

  function addEvidence(status, source, capture, value, objectIds = [], provenance = null) {
    const evidence = { id: `ev_${Date.now()}_${state.evidence.length + 1}`, status, source, capture, value, object_ids: objectIds, at: now(), provenance };
    state.evidence.push(evidence);
    return evidence.id;
  }

  function makeObject(kind, points, objectState = "described", properties = {}) {
    const id = nextId(kind);
    const geometryType = kind === "boundary" ? "polygon" : POINT_KINDS.has(kind) ? "point" : "line";
    const evidenceId = addEvidence("described", "current_user", "draw", { kind, points }, [id]);
    const object = {
      id, kind, state: objectState,
      geometry: { type: geometryType, points: points.map(p => ({ x: p.x, y: p.y, lat: null, lng: null })) },
      properties: { ...properties }, evidence_ids: [evidenceId], created_at: now(), updated_at: now()
    };
    state.objects.push(object);
    emit("geometry.created", [id], { kind, state: objectState });
    renderAll();
    return object;
  }

  function setSurface(surface) {
    state.surface = surface;
    el.app.dataset.surface = surface;
    el.surfaceLabel.textContent = surface.toUpperCase();
    $$("[data-surface-panel]").forEach(panel => panel.classList.toggle("is-active", panel.dataset.surfacePanel === surface));
    el.surfaceMenu.classList.remove("open");
    el.surfaceButton.setAttribute("aria-expanded", "false");
    closeWorkMenu();
    clearSelection(false);
    if (surface === "field" || surface === "drawing") {
      renderAll();
    } else if (surface === "design") {
      renderDesign();
      void checkEngineering();
    } else if (surface === "materials") {
      renderMaterials();
    } else if (surface === "adviser") {
      renderConversation();
      requestAnimationFrame(() => el.adviserInput.focus({ preventScroll: true }));
    }
    emit("surface.opened", [], { surface });
  }

  function openWorkMenu() {
    if (!(state.surface === "field" || state.surface === "drawing")) {
      setSurface("field");
    }
    el.workMenuTitle.textContent = state.surface === "drawing" ? "Work on drawing" : "Work on field";
    el.workMenu.classList.add("open");
    el.workButton.setAttribute("aria-expanded", "true");
    el.surfaceMenu.classList.remove("open");
    syncToolButtons();
  }

  function closeWorkMenu() {
    el.workMenu.classList.remove("open");
    el.workButton.setAttribute("aria-expanded", "false");
  }

  function setTool(tool) {
    state.tool = tool;
    state.draft = [];
    state.selectedId = null;
    el.selectionCard.hidden = true;
    closeWorkMenu();
    syncToolButtons();
    syncToolChip();
    renderAll();
  }

  function cancelTool() {
    state.tool = "select";
    state.draft = [];
    syncToolButtons();
    syncToolChip();
    renderAll();
  }

  function syncToolButtons() {
    $$('[data-tool]', el.fieldTools).forEach(btn => btn.classList.toggle("active", btn.dataset.tool === state.tool));
    el.finishDraft.hidden = !(state.tool === "boundary" && state.draft.length >= 3);
  }

  function syncToolChip() {
    if (state.tool === "select") {
      el.activeToolChip.hidden = true;
      return;
    }
    el.activeToolChip.hidden = false;
    el.activeToolName.textContent = LABEL[state.tool] || state.tool;
    if (state.tool === "boundary") el.activeToolHint.textContent = state.draft.length < 3 ? "Tap corners" : "Finish when ready";
    else if (LINE_KINDS.has(state.tool)) el.activeToolHint.textContent = state.draft.length ? "Tap end" : "Tap start";
    else el.activeToolHint.textContent = "Tap location";
  }

  function svgPoint(svg, event) {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX; pt.y = event.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: Math.max(0, Math.min(1000, p.x)), y: Math.max(0, Math.min(700, p.y)) };
  }

  function handleCanvasPointer(event) {
    const svg = event.currentTarget;
    const objectId = event.target?.dataset?.objectId;
    if (state.tool === "select") {
      if (objectId) selectObject(objectId);
      else clearSelection();
      return;
    }
    const point = svgPoint(svg, event);
    if (POINT_KINDS.has(state.tool)) {
      makeObject(state.tool, [point]);
      toast(`${LABEL[state.tool]} added`);
      return;
    }
    if (state.tool === "boundary") {
      state.draft.push(point);
      syncToolButtons(); syncToolChip(); renderAll();
      return;
    }
    if (LINE_KINDS.has(state.tool)) {
      if (!state.draft.length) {
        state.draft = [point];
        syncToolChip(); renderAll();
      } else {
        makeObject(state.tool, [state.draft[0], point]);
        state.draft = [];
        syncToolChip(); renderAll();
        toast(`${LABEL[state.tool]} added`);
      }
    }
  }

  function finishBoundary() {
    if (state.tool !== "boundary" || state.draft.length < 3) return;
    makeObject("boundary", state.draft);
    state.draft = [];
    syncToolButtons(); syncToolChip(); renderAll();
    toast("Boundary added");
  }

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  }

  function objectNode(object) {
    const pts = object.geometry.points;
    let node;
    if (object.geometry.type === "polygon") {
      node = svgEl("polygon", { points: pts.map(p => `${p.x},${p.y}`).join(" ") });
    } else if (object.geometry.type === "point") {
      const r = object.kind === "plant" ? 7 : 9;
      node = svgEl("circle", { cx: pts[0].x, cy: pts[0].y, r });
    } else {
      node = svgEl("polyline", { points: pts.map(p => `${p.x},${p.y}`).join(" ") });
    }
    node.dataset.objectId = object.id;
    node.classList.add("object", `obj-${object.kind}`);
    if (object.geometry.type === "point") node.classList.add("point-object");
    if (object.id === state.selectedId) node.classList.add("selected");
    if (object.state === "proposed") node.classList.add("proposed");
    return node;
  }

  function renderCanvas(svg, mode) {
    svg.replaceChildren();
    if (mode === "drawing") {
      const grid = svgEl("g", { opacity: ".28" });
      for (let x = 50; x < 1000; x += 50) grid.append(svgEl("line", { x1: x, y1: 0, x2: x, y2: 700, stroke: "#dfe4df", "stroke-width": 1 }));
      for (let y = 50; y < 700; y += 50) grid.append(svgEl("line", { x1: 0, y1: y, x2: 1000, y2: y, stroke: "#dfe4df", "stroke-width": 1 }));
      svg.append(grid);
    }
    const order = ["boundary", "path", "main", "submain", "lateral", "water_source", "plant", "device", "valve", "filter", "venturi", "pump", "tank"];
    [...state.objects].sort((a,b) => order.indexOf(a.kind) - order.indexOf(b.kind)).forEach(object => svg.append(objectNode(object)));
    if (state.draft.length) {
      const points = state.draft.map(p => `${p.x},${p.y}`).join(" ");
      if (state.tool === "boundary") svg.append(svgEl("polyline", { points, class: "draft-line" }));
      state.draft.forEach(p => svg.append(svgEl("circle", { cx: p.x, cy: p.y, r: 6, class: "draft-point" })));
    }
  }

  function renderAll() {
    renderCanvas(el.fieldCanvas, "field");
    renderCanvas(el.drawingCanvas, "drawing");
    el.fieldHint.hidden = state.objects.length > 0 || state.draft.length > 0;
    syncToolButtons(); syncToolChip(); updateJobStatus();
  }

  function updateJobStatus() {
    const networkCount = state.objects.filter(o => ["main","submain","lateral"].includes(o.kind)).length;
    const realityCount = state.objects.length - networkCount;
    const bits = [];
    if (realityCount) bits.push(`${realityCount} field object${realityCount === 1 ? "" : "s"}`);
    if (networkCount) bits.push(`${networkCount} pipe${networkCount === 1 ? "" : "s"}`);
    el.jobStatus.textContent = bits.length ? `Preliminary · ${bits.join(" · ")}` : "Preliminary · nothing assumed";
  }

  function selectObject(id) {
    const object = state.objects.find(o => o.id === id);
    if (!object) return;
    state.selectedId = id;
    renderAll();
    el.selectionName.textContent = `${id} · ${LABEL[object.kind] || object.kind}`;
    el.selectionState.textContent = `${object.state} · same object in FIELD and DRAWING`;
    el.selectionActions.replaceChildren();
    const actions = contextualActions(object);
    actions.forEach(action => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.textContent = action.label;
      if (action.primary) btn.classList.add("primary");
      if (action.danger) btn.classList.add("danger");
      btn.addEventListener("click", () => action.run(object));
      el.selectionActions.append(btn);
    });
    el.selectionCard.hidden = false;
    el.activeToolChip.hidden = true;
  }

  function clearSelection(render = true) {
    state.selectedId = null;
    el.selectionCard.hidden = true;
    if (render) renderAll();
  }

  function contextualActions(object) {
    const common = [
      { label: "Duplicate", run: duplicateObject },
      { label: "Delete", danger: true, run: deleteObject }
    ];
    if (object.kind === "main") return [
      { label: "Ask for submains", primary: true, run: o => askAbout(o, `I have drawn ${o.id} as the main. Help me think through sensible submains from it.`) },
      { label: "Check design", run: () => setSurface("design") }, ...common
    ];
    if (object.kind === "submain") return [
      { label: "Ask for laterals", primary: true, run: o => askAbout(o, `I have drawn ${o.id} as a submain. Help me add laterals without assuming spacing or direction.`) },
      { label: "Check design", run: () => setSurface("design") }, ...common
    ];
    if (object.kind === "lateral") return [
      { label: "Ask about emitter", primary: true, run: o => askAbout(o, `For ${o.id}, help me think about the application device. Ask what you need before recommending one.`) },
      { label: "Check length", run: () => setSurface("design") }, ...common
    ];
    if (object.kind === "path") return [
      { label: "Prefer controls near here", primary: true, run: o => recordAccessPreference(o) },
      { label: "Ask about access", run: o => askAbout(o, `This is ${o.id}, an access path. Help me consider whether controls should be kept near it.`) }, ...common
    ];
    if (object.kind === "plant") return [
      { label: "Ask about irrigation", primary: true, run: o => askAbout(o, `This is ${o.id}, a plant I marked. Help me decide what we need to know before choosing its irrigation.`) }, ...common
    ];
    if (object.kind === "water_source") return [
      { label: "Ask about source", primary: true, run: o => askAbout(o, `This is ${o.id}, the water source. Help me work out only the next information that matters.`) }, ...common
    ];
    return common;
  }

  function duplicateObject(object) {
    const offset = 14;
    const points = object.geometry.points.map(p => ({ x: Math.min(990, p.x + offset), y: Math.min(690, p.y + offset) }));
    const copy = makeObject(object.kind, points, "described", { ...object.properties, duplicated_from: object.id });
    emit("geometry.duplicated", [object.id, copy.id], {});
    selectObject(copy.id);
    toast(`${copy.id} duplicated from ${object.id}`);
  }

  function deleteObject(object) {
    state.objects = state.objects.filter(o => o.id !== object.id);
    state.relationships = state.relationships.filter(r => r.from !== object.id && r.to !== object.id);
    emit("geometry.deleted", [object.id], {});
    clearSelection();
    toast(`${object.id} removed`);
  }

  function recordAccessPreference(pathObject) {
    const id = `rel_${Date.now()}`;
    state.relationships.push({ id, from: "farmer_preference", type: "preferred_near", to: pathObject.id, state: "confirmed", evidence_ids: [] });
    const evidenceId = addEvidence("confirmed", "current_user", "choose", "Prefer controls near this path", [pathObject.id]);
    state.relationships[state.relationships.length - 1].evidence_ids.push(evidenceId);
    emit("preference.recorded", [pathObject.id], { preference: "controls_near" });
    askAbout(pathObject, `I prefer the irrigation controls near ${pathObject.id}. Please keep that in mind, but show me any real cost or hydraulic consequence rather than forcing it.`);
  }

  function askAbout(object, text) {
    clearSelection();
    setSurface("adviser");
    sendFarmerMessage(text, { object_ids: [object.id], auto: true });
  }

  function renderDesign() {
    const counts = countObjects();
    const metrics = [
      [counts.main, "mains"], [counts.submain, "submains"], [counts.lateral, "laterals"], [counts.device + counts.plant, "plants / devices"]
    ];
    el.networkSummary.innerHTML = metrics.map(([n,label]) => `<div class="metric"><b>${n}</b><span>${label}</span></div>`).join("");

    let engineText = "Unavailable · no PASS/FAIL issued";
    if (state.engineering.checking) engineText = "Checking deterministic engine…";
    else if (state.engineering.online && state.engineering.conformance?.pass) {
      engineText = `${state.engineering.version || "deterministic engine"} · ${state.engineering.conformance.checks || 0}/${state.engineering.conformance.checks || 0} regression checks`;
    } else if (state.engineering.online && state.engineering.conformance && !state.engineering.conformance.pass) {
      engineText = "Conformance failed · engineering output blocked";
    }

    const openProposals = state.proposals.filter(p => p.ui_status !== "dismissed").length;
    const status = [
      ["Geometry", state.objects.length ? "Available as preliminary drawing" : "Nothing drawn yet"],
      ["Hydraulics", engineText],
      ["Spatial scale", "Map/measurement adapter not bound yet"],
      ["AI proposals", openProposals ? `${openProposals} proposal${openProposals === 1 ? "" : "s"} · none accepted automatically` : "None active"]
    ];
    el.engineeringStatus.innerHTML = `<div class="status-list">${status.map(([a,b]) => `<div class="status-row"><span>${a}</span><span>${b}</span></div>`).join("")}</div>`;

    const unknowns = [];
    if (!state.objects.some(o => o.kind === "boundary")) unknowns.push("No field boundary is known. That is fine for object-level work, but area-based design remains preliminary.");
    if (!state.objects.some(o => o.kind === "water_source")) unknowns.push("Water source has not been marked or described.");
    if (counts.main + counts.submain + counts.lateral > 0) unknowns.push("Pipe lengths shown on this canvas are not metres until the real map/measurement adapter supplies scale.");
    if (!state.engineering.online) unknowns.push("The deterministic engineering service is not currently reachable, so no hydraulic result should be treated as checked.");
    else unknowns.push("The deterministic engine is available, but PASS/FAIL still requires the actual run length, flow and other required inputs for the item being checked.");
    el.designUnknowns.innerHTML = unknowns.map(x => `<div class="unknown">${escapeHtml(x)}</div>`).join("");
  }

  function countObjects() {
    const out = { main:0, submain:0, lateral:0, device:0, plant:0, boundary:0, water_source:0, path:0 };
    state.objects.forEach(o => { if (o.kind in out) out[o.kind] += 1; });
    return out;
  }

  function renderMaterials() {
    const counts = countObjects();
    const rows = [];
    if (counts.main) rows.push({ title:"Main pipe requirement", detail:`${counts.main} drawn main segment${counts.main===1?"":"s"}; measured length and size unresolved`, qty:`${counts.main} segment${counts.main===1?"":"s"}`, ask:"main pipe" });
    if (counts.submain) rows.push({ title:"Submain pipe requirement", detail:`${counts.submain} drawn submain segment${counts.submain===1?"":"s"}; measured length and size unresolved`, qty:`${counts.submain} segment${counts.submain===1?"":"s"}`, ask:"submain pipe" });
    if (counts.lateral) rows.push({ title:"Lateral pipe requirement", detail:`${counts.lateral} drawn lateral${counts.lateral===1?"":"s"}; diameter/device relationship unresolved`, qty:`${counts.lateral} lateral${counts.lateral===1?"":"s"}`, ask:"lateral pipe and emitters" });
    if (counts.device) rows.push({ title:"Application devices", detail:`${counts.device} explicitly marked device${counts.device===1?"":"s"}; product not presumed`, qty:`${counts.device} device${counts.device===1?"":"s"}`, ask:"application devices" });
    if (!rows.length) {
      el.materialsList.innerHTML = `<div class="unknown">No material requirement is implied yet. Draw or describe the system first; MATERIALS will project what the design actually requires.</div>`;
    } else {
      el.materialsList.replaceChildren();
      rows.forEach(row => {
        const article = document.createElement("article"); article.className = "material-row";
        article.innerHTML = `<div><b>${escapeHtml(row.title)}</b><span>${escapeHtml(row.detail)}</span></div><div class="qty">${escapeHtml(row.qty)}</div>`;
        const button = document.createElement("button"); button.type = "button"; button.textContent = "Discuss options";
        button.addEventListener("click", () => { setSurface("adviser"); sendFarmerMessage(`Help me understand the product choices for ${row.ask}. Do not jump to a product; explain only the differences that matter for this design.`, { auto:true }); });
        article.append(button); el.materialsList.append(article);
      });
    }
    el.productKnowledgeText.textContent = "Jain and generic product knowledge will be retrieved by application need and engineering context. No product is selected merely because it exists in the catalogue.";
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }

  function appendMessage(role, text, evidenceIds = []) {
    const msg = { id:`msg_${Date.now()}_${state.conversation.messages.length+1}`, role, text, at:now(), evidence_ids:evidenceIds };
    state.conversation.messages.push(msg);
    renderConversation();
    return msg;
  }

  function renderProposalCards() {
    state.proposals.filter(p => p.ui_status !== "dismissed").forEach(proposal => {
      const card = document.createElement("div");
      card.className = "message adviser";
      const kind = String(proposal.kind || "proposal").replaceAll("_", " ");
      const checks = Array.isArray(proposal.checks_required) && proposal.checks_required.length
        ? `<div style="margin-top:6px;font-size:12px;opacity:.75">Needs checking: ${escapeHtml(proposal.checks_required.join(" · "))}</div>`
        : "";
      card.innerHTML = `<div class="meta">PROPOSAL · ${escapeHtml(kind.toUpperCase())}</div><div><b>${escapeHtml(proposal.summary || "Design option")}</b>${checks}</div>`;
      const actions = document.createElement("div");
      actions.className = "quick-replies";

      const why = document.createElement("button");
      why.type = "button";
      why.textContent = "Why?";
      why.addEventListener("click", () => sendFarmerMessage(`Why are you suggesting: ${proposal.summary || "this option"}? Explain it simply and do not add assumptions.`));
      actions.append(why);

      if (proposal.kind === "geometry") {
        const preview = document.createElement("button");
        preview.type = "button";
        preview.textContent = "Preview drawing";
        preview.disabled = true;
        preview.title = "The deterministic geometry proposal adapter is not connected yet.";
        actions.append(preview);
      }

      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.textContent = "Not for this job";
      dismiss.addEventListener("click", () => {
        proposal.ui_status = "dismissed";
        emit("proposal.dismissed", proposal.affected_ids || [], { proposal_id: proposal.proposal_id || null, summary: proposal.summary || null });
        renderConversation();
        if (state.surface === "design") renderDesign();
      });
      actions.append(dismiss);

      card.append(actions);
      el.conversation.append(card);
    });
  }

  function renderConversation() {
    el.conversation.replaceChildren();
    if (!state.conversation.messages.length) {
      const first = document.createElement("div"); first.className = "message adviser";
      first.innerHTML = `<div class="meta">TAGRO</div><div>You can start with the field, the crop, an existing pump, a budget concern, a drawing, or simply what you want irrigation to make easier. I’ll ask only what matters next.</div>`;
      el.conversation.append(first);
    } else {
      state.conversation.messages.forEach(msg => {
        const div = document.createElement("div"); div.className = `message ${msg.role === "farmer" ? "farmer" : "adviser"}`;
        div.innerHTML = `<div class="meta">${msg.role === "farmer" ? "YOU" : "TAGRO"}</div><div>${escapeHtml(msg.text)}</div>`;
        el.conversation.append(div);
      });
    }
    renderProposalCards();
    if (state.conversation.current_understanding) {
      el.reflection.hidden = false; el.reflectionText.textContent = state.conversation.current_understanding;
    } else el.reflection.hidden = true;
    el.quickReplies.replaceChildren();
    const replies = quickReplyOptions();
    replies.forEach(text => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = text;
      b.addEventListener("click", () => sendFarmerMessage(text)); el.quickReplies.append(b);
    });
    requestAnimationFrame(() => { el.conversation.lastElementChild?.scrollIntoView({ block:"nearest" }); });
  }

  function quickReplyOptions() {
    const q = state.conversation.next_question || "";
    if (/mark.*trees|plants/i.test(q)) return ["I’ll mark them on the field", "They are roughly regular", "Let me describe them"];
    if (/manual|valves|daily work/i.test(q)) return ["Manual is fine", "Keep daily work low", "Show me both"];
    if (/priority|worthwhile|trying to achieve/i.test(q)) return ["Reduce daily work", "Get through summer", "Improve production", "Keep cost low"];
    return [];
  }

  async function sendFarmerMessage(text, options = {}) {
    text = String(text || "").trim(); if (!text) return;
    const evidenceId = addEvidence("described", "current_user", options.auto ? "choose" : "type", text, options.object_ids || []);
    appendMessage("farmer", text, [evidenceId]);
    emit("conversation.message", options.object_ids || [], { text });
    el.adviserInput.value = "";
    await respondToFarmer(text);
  }

  function localGuide(text) {
    const lower = text.toLowerCase();
    let understanding = `You said: “${text}”`;
    let reply = "I’ve kept that as your description rather than turning it into a design assumption.";
    let question = "What would make this irrigation worthwhile for you?";
    let reason = "The answer can change whether the design should favour cost, convenience, reliability, expansion or operating time.";

    if (/coconut|pepper|banana|vegetable|mango|fruit|crop/.test(lower)) {
      reply = "I’ve noted the crop information, but I won’t assume spacing, water requirement or emitter from the crop name alone.";
      question = "Would you rather mark the plants that are actually there, or describe roughly how they are arranged?";
      reason = "Plant arrangement changes how laterals and application devices should be considered.";
    } else if (/pump|hp|single phase|three phase|motor/.test(lower)) {
      reply = "We can work around an existing pump if that serves the field, but I won’t treat its horsepower as either a target or a limit.";
      question = "Is this pump already installed and in use, or are you still choosing the pump?";
      reason = "An existing pump is physical reality; a future pump is still a design choice.";
    } else if (/budget|cost|cheap|afford|spend|money/.test(lower)) {
      reply = "Cost can change the design, but I don’t want to force a system to fit a number by hiding the consequences.";
      question = "If a lower-cost design meant more operating time or more manual valve changes, would that be acceptable?";
      reason = "That tells us whether time or labour can honestly be traded for capital cost.";
    } else if (/path|road|gate|access|control|valve/.test(lower)) {
      reply = "I’ve kept access as a design preference, not as a command to move anything.";
      question = "Is easy daily access important enough that you would accept a little extra pipe if needed?";
      reason = "That lets the design compare the shortest route with the easiest route to live with.";
    } else if (/main/.test(lower) && /submain/.test(lower)) {
      reply = "I can help propose submains from the main, but first I need the plant/area pattern or another reason for where the submains should serve.";
      question = "Do you want to mark the plant locations, mark crop areas, or describe the layout?";
      reason = "Without that, proposed submains would just be arbitrary lines.";
    } else if (/submain/.test(lower) && /lateral/.test(lower)) {
      reply = "I can help propose laterals from that submain, but I won’t assume spacing or side from a crop label.";
      question = "Should the laterals follow marked plants, or do you want to consider a regular spacing?";
      reason = "That choice changes the geometry we should propose.";
    }

    return { understanding, reply, question, reason };
  }

  async function respondToFarmer(text) {
    el.aiStatus.textContent = state.adviser.online ? "Thinking with connected adviser…" : "Local conversation guide · AI not connected";
    if (state.adviser.online) {
      try {
        const response = await fetch(`${state.adviser.endpoint}/api/ai/advise`, {
          method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(buildAdviserContext(text))
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const extracted = extractAdviserText(data);
        if (!extracted) throw new Error("No conversational text returned");
        appendMessage("adviser", extracted.text);
        state.conversation.current_understanding = extracted.understanding || null;
        state.conversation.next_question = extracted.next_question || null;
        state.conversation.question_reason = extracted.question_reason || null;
        if (Array.isArray(extracted.proposals)) {
          extracted.proposals.forEach(proposal => {
            const id = proposal.proposal_id || `${proposal.kind || "proposal"}_${proposal.summary || ""}`;
            if (!state.proposals.some(existing => (existing.proposal_id || `${existing.kind || "proposal"}_${existing.summary || ""}`) === id)) {
              state.proposals.push({ ...proposal, ui_status: "open" });
            }
          });
        }
        renderConversation(); renderAll();
        if (state.surface === "design") renderDesign();
        el.aiStatus.textContent = "Connected adviser";
        return;
      } catch (err) {
        state.adviser.online = false;
        el.aiStatus.textContent = "Adviser unavailable · local guide only";
        emit("adviser.failed", [], { message:String(err?.message || err) });
      }
    }
    const local = localGuide(text);
    state.conversation.current_understanding = local.understanding;
    state.conversation.next_question = local.question;
    state.conversation.question_reason = local.reason;
    appendMessage("adviser", `${local.reply} ${local.question}`);
    renderConversation();
  }

  function buildAdviserContext(userRequest) {
    return {
      task: state.active_task || "irrigation_design_advice",
      user_request: userRequest,
      farmer: state.farmer,
      field: {
        maturity: state.maturity,
        objects: state.objects,
        relationships: state.relationships,
        evidence: state.evidence.slice(-80)
      },
      geometry: { objects: state.objects.filter(o => ["boundary","path","main","submain","lateral","plant","water_source","device"].includes(o.kind)) },
      network: { relationships: state.relationships },
      hydraulics: {
        ...state.design_state,
        engine: {
          online: state.engineering.online,
          version: state.engineering.version,
          conformance: state.engineering.conformance
        }
      },
      budget: {},
      preferences: { relationships: state.relationships.filter(r => r.type === "preferred_near") },
      product_query: { generic_allowed: true }
    };
  }

  function extractAdviserText(data) {
    const structured = data?.structured;
    if (structured && typeof structured === "object" && typeof structured.message === "string") {
      return {
        text: structured.message,
        understanding: structured.understanding ?? null,
        next_question: structured.next_question ?? null,
        question_reason: structured.question_reason ?? null,
        proposals: Array.isArray(structured.proposals) ? structured.proposals : []
      };
    }
    const result = data?.result ?? data;
    if (typeof result === "string") return { text: result };
    const text = result?.response || result?.text || result?.result || result?.output_text || result?.message?.content;
    if (typeof text === "string") return { text };
    if (Array.isArray(result?.messages)) {
      const last = [...result.messages].reverse().find(m => m.role === "assistant" && typeof m.content === "string");
      if (last) return { text:last.content };
    }
    return null;
  }

  async function checkAdviser() {
    state.adviser.checking = true;
    const configured = window.TAGRO_IRRIGATION_AI_ENDPOINT || location.origin;
    try {
      const response = await fetch(`${configured}/health`, { headers:{"accept":"application/json"}, cache:"no-store" });
      if (!response.ok) throw new Error("health unavailable");
      const data = await response.json();
      const isContextService = data?.service === "tagro-irrigation-ai-context";
      state.adviser.online = Boolean(isContextService && data?.ai_bound);
      state.adviser.endpoint = isContextService ? configured : null;
      el.aiStatus.textContent = state.adviser.online ? "Connected adviser" : isContextService ? "Context service connected · AI model not bound" : "Adviser not connected · local guide";
    } catch {
      state.adviser.online = false; state.adviser.endpoint = null;
      el.aiStatus.textContent = "Adviser not connected · local guide";
    } finally { state.adviser.checking = false; }
  }

  async function checkEngineering() {
    const service = window.TAGROEngineeringService;
    state.engineering.checking = true;
    if (state.surface === "design") renderDesign();
    if (!service?.check) {
      state.engineering = { online:false, version:null, conformance:null, checkedAt:now(), checking:false };
      if (state.surface === "design") renderDesign();
      return;
    }
    const result = await service.check(window.TAGRO_IRRIGATION_ENGINE_ENDPOINT || location.origin);
    state.engineering = {
      online: Boolean(result?.online),
      version: result?.engine || null,
      conformance: result?.conformance || null,
      checkedAt: now(),
      checking: false
    };
    state.design_state.engine = {
      online: state.engineering.online,
      version: state.engineering.version,
      conformance: state.engineering.conformance
    };
    if (state.surface === "design") renderDesign();
  }

  function bindEvents() {
    el.surfaceButton.addEventListener("click", () => {
      const open = !el.surfaceMenu.classList.contains("open");
      el.surfaceMenu.classList.toggle("open", open); el.surfaceButton.setAttribute("aria-expanded", String(open)); closeWorkMenu();
    });
    $$('[data-open-surface]').forEach(btn => btn.addEventListener("click", () => setSurface(btn.dataset.openSurface)));
    el.workButton.addEventListener("click", () => el.workMenu.classList.contains("open") ? closeWorkMenu() : openWorkMenu());
    el.closeWorkMenu.addEventListener("click", closeWorkMenu);
    $$('[data-tool]', el.fieldTools).forEach(btn => btn.addEventListener("click", () => setTool(btn.dataset.tool)));
    el.finishDraft.addEventListener("click", finishBoundary);
    el.openDrawingAction.addEventListener("click", () => setSurface("drawing"));
    el.tellStoryAction.addEventListener("click", () => setSurface("adviser"));
    el.cancelTool.addEventListener("click", cancelTool);
    el.clearSelection.addEventListener("click", () => clearSelection());
    el.fieldCanvas.addEventListener("pointerup", handleCanvasPointer);
    el.drawingCanvas.addEventListener("pointerup", handleCanvasPointer);
    el.adviserForm.addEventListener("submit", e => { e.preventDefault(); sendFarmerMessage(el.adviserInput.value); });
    el.adviserInput.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); el.adviserForm.requestSubmit(); } });
    el.correctReflection.addEventListener("click", () => { el.adviserInput.value = "Correction: "; el.adviserInput.focus(); });
    el.openAdviserFromMaterials.addEventListener("click", () => { setSurface("adviser"); el.adviserInput.value = "Help me understand the product choices for this design without assuming that I want the most expensive option."; el.adviserInput.focus(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") { closeWorkMenu(); el.surfaceMenu.classList.remove("open"); if (state.tool !== "select") cancelTool(); else clearSelection(); }
    });
  }

  bindEvents();
  renderAll();
  renderConversation();
  renderDesign();
  renderMaterials();
  checkAdviser();
  void checkEngineering();
})();
