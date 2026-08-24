/* TAGRO Irrigation Environment — deterministic engineering dock v1
 *
 * Purpose:
 * - keep numerical engineering outside the conversational AI;
 * - preserve issued-estimate conformance where verified;
 * - support terrain and laminar/transitional/turbulent interpretation;
 * - return unknown/escalate rather than silently inventing unsupported answers.
 *
 * This module handles NO money and NO product recommendation.
 */

export const ENGINE_VERSION = "irrigation-engine-1.0.0";

export const CONSTANTS = Object.freeze({
  EXP_S: 0.6494,
  EXP_D: 1.7079,
  EXP_L: 2.852,
  K_LAM: 1.3936,
  NU: 8.93e-7,
  HF_BASE: Object.freeze({ lateral: 2.2, submain: 1.8, main: 1.8 }),
  A_ROLE: Object.freeze({ lateral: 2.7791, submain: 2.1764, main: 2.1764 }),
  ID_MM: Object.freeze({
    12:10.0, 16:13.5, 20:17.2, 25:22.2, 32:28.4, 40:36.0,
    50:46.7, 63:59.0, 75:71.0, 90:86.0, 110:105.1,
    140:133.9, 160:153.0, 180:171.0, 200:191.4
  }),
  FITTED_K: Object.freeze({
    lateral: Object.freeze({ 16:236.8, 20:358.2 }),
    submain: Object.freeze({ 50:1537.9, 63:2312.5 }),
    main: Object.freeze({ 50:1537.9, 63:2312.5 })
  })
});

const ROLES = new Set(["lateral", "submain", "main"]);

function roleOf(role) {
  const r = String(role || "").toLowerCase();
  if (!ROLES.has(r)) throw new Error(`unsupported hydraulic role: ${role}`);
  return r;
}

function idOf(mm) {
  const id = CONSTANTS.ID_MM[Number(mm)];
  return id ?? null;
}

export function kOf(role, nominalMm) {
  const r = roleOf(role);
  const mm = Number(nominalMm);
  const fitted = CONSTANTS.FITTED_K[r]?.[mm];
  if (fitted != null) return { value: fitted, evidence: "verified_fitted" };
  const id = idOf(mm);
  if (id == null) return null;
  return {
    value: CONSTANTS.A_ROLE[r] * Math.pow(id, CONSTANTS.EXP_D),
    evidence: "derived_internal_diameter"
  };
}

export function effectiveHeadM(role, fallAlongM = 0) {
  const r = roleOf(role);
  return CONSTANTS.HF_BASE[r] + Number(fallAlongM || 0);
}

export function reynolds(flowLph, nominalMm) {
  const idMm = idOf(nominalMm);
  if (!(flowLph > 0) || !(idMm > 0)) return null;
  const qM3s = Number(flowLph) / 3.6e6;
  const dM = idMm / 1000;
  return 4 * qM3s / (Math.PI * dM * CONSTANTS.NU);
}

export function regimeFromReynolds(re) {
  if (!Number.isFinite(re)) return "unknown";
  if (re < 2000) return "laminar";
  if (re < 4000) return "transition";
  return "turbulent";
}

export function permissibleTurbulentM({ role, nominalMm, sdrLphPerM, fallAlongM = 0 }) {
  const r = roleOf(role);
  const sdr = Number(sdrLphPerM);
  if (!(sdr > 0)) return null;
  const k = kOf(r, nominalMm);
  if (!k) return null;
  const hf = effectiveHeadM(r, fallAlongM);
  if (!(hf > 0)) return 0;
  const terrainFactor = Math.pow(hf / CONSTANTS.HF_BASE[r], 1 / CONSTANTS.EXP_L);
  return {
    permissibleM: k.value * terrainFactor / Math.pow(sdr, CONSTANTS.EXP_S),
    evidence: k.evidence,
    effectiveHeadM: hf
  };
}

export function permissibleLaminarM({ nominalMm, sdrLphPerM, allowedHeadM }) {
  const id = idOf(nominalMm);
  const sdr = Number(sdrLphPerM);
  const hf = Number(allowedHeadM);
  if (!(id > 0) || !(sdr > 0) || !(hf > 0)) return null;
  return CONSTANTS.K_LAM * id * id * Math.sqrt(hf / sdr);
}

export function assessRun(input) {
  const role = roleOf(input.role);
  const nominalMm = Number(input.nominalMm);
  const lengthM = Number(input.lengthM);
  const flowLph = Number(input.flowLph);
  const system = input.system || "standard";
  const fallAlongM = Number(input.fallAlongM || 0);

  if (!(lengthM > 0)) return { status: "unknown", reason: "length_required" };
  if (!(flowLph >= 0)) return { status: "unknown", reason: "flow_required" };
  if (!idOf(nominalMm)) return { status: "unknown", reason: "internal_diameter_unverified", nominalMm };
  if (flowLph === 0) {
    return { status: "no_load", role, nominalMm, lengthM, flowLph, engineVersion: ENGINE_VERSION };
  }

  const sdrLphPerM = flowLph / lengthM;
  const re = reynolds(flowLph, nominalMm);
  const regime = regimeFromReynolds(re);

  let permissibleM = null;
  let evidence = null;
  let allowedHeadM = null;

  if (system === "vlp" && role === "lateral") {
    allowedHeadM = Number(input.allowedHeadM);
    if (!(allowedHeadM > 0)) return { status: "unknown", reason: "allowed_head_required_for_vlp" };
    permissibleM = permissibleLaminarM({ nominalMm, sdrLphPerM, allowedHeadM });
    evidence = "laminar_formula";
  } else {
    const t = permissibleTurbulentM({ role, nominalMm, sdrLphPerM, fallAlongM });
    if (!t) return { status: "unknown", reason: "permissible_length_unavailable" };
    permissibleM = t.permissibleM;
    evidence = t.evidence;
    allowedHeadM = t.effectiveHeadM;
  }

  const passes = Number.isFinite(permissibleM) && permissibleM >= lengthM;
  return {
    status: passes ? "pass" : "fail",
    role,
    nominalMm,
    lengthM,
    flowLph,
    sdrLphPerM,
    permissibleM,
    passes,
    reynolds: re,
    regime,
    evidence,
    allowedHeadM,
    fallAlongM,
    engineVersion: ENGINE_VERSION
  };
}

export function compareSizes(input, nominalSizes) {
  const sizes = Array.isArray(nominalSizes) ? nominalSizes.map(Number).filter(Number.isFinite) : [];
  return sizes.map(mm => assessRun({ ...input, nominalMm: mm }));
}

export function operatingSectionsForCapacity({ totalFlowLph, availableFlowLph, maxSections = 64 }) {
  const demand = Number(totalFlowLph);
  const supply = Number(availableFlowLph);
  if (!(demand > 0) || !(supply > 0)) return { status: "unknown", reason: "flow_values_required" };
  const sections = Math.ceil(demand / supply);
  if (sections > maxSections) return { status: "escalate", sections, reason: "section_count_excessive" };
  return {
    status: "calculated",
    sections,
    simultaneousFraction: 1 / sections,
    sectionFlowTargetLph: demand / sections,
    engineVersion: ENGINE_VERSION
  };
}

export function runtimeTradeoff({ requiredVolumeLitres, applicationFlowLph }) {
  const volume = Number(requiredVolumeLitres);
  const flow = Number(applicationFlowLph);
  if (!(volume >= 0) || !(flow > 0)) return { status: "unknown", reason: "volume_and_flow_required" };
  return {
    status: "calculated",
    runtimeHours: volume / flow,
    engineVersion: ENGINE_VERSION
  };
}

export const ISSUED_CONFORMANCE = Object.freeze([
  ["lateral",16,11,50], ["submain",50,84,87], ["main",50,336,35],
  ["lateral",16,2,151], ["lateral",16,3,116], ["lateral",16,4,96],
  ["submain",63,24,294], ["submain",63,25,286], ["submain",63,35,230],
  ["submain",63,47,190], ["submain",63,69,148], ["main",63,56,169], ["main",63,120,103]
]);

export function runConformance() {
  const failures = [];
  for (const [role, mm, sdr, expected] of ISSUED_CONFORMANCE) {
    const k = CONSTANTS.FITTED_K[role]?.[mm];
    const got = k == null ? null : Math.round(k / Math.pow(sdr, CONSTANTS.EXP_S));
    if (got !== expected) failures.push({ role, nominalMm:mm, sdr, expected, got });
  }
  return {
    pass: failures.length === 0,
    checks: ISSUED_CONFORMANCE.length,
    failures,
    engineVersion: ENGINE_VERSION
  };
}
