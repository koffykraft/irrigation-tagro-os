import jscpc from "../../knowledge/products/jain/j-sc-pc-plus.json";
import jloc from "../../knowledge/products/jain/j-loc.json";
import jainJet from "../../knowledge/products/jain/jain-jet.json";
import modularSprinkler from "../../knowledge/products/jain/modular-sprinkler.json";
import jMiniSprinkler from "../../knowledge/products/jain/j-mini-sprinkler.json";
import turboPc from "../../knowledge/products/jain/turbo-pc.json";
import ghoomar from "../../knowledge/products/jain/ghoomar-sand-separator.json";
import venturiInjector from "../../knowledge/products/jain/venturi-injector.json";
import spinCleanDisc from "../../knowledge/products/jain/spin-clean-disc-filter.json";
import acurainOpal from "../../knowledge/products/jain/acurain-opal.json";
import jainFogger from "../../knowledge/products/jain/jain-fogger.json";
import jBubblerPc from "../../knowledge/products/jain/j-bubbler-pc.json";
import acuMister from "../../knowledge/products/jain/acu-mister.json";

export const PRODUCTS: any[] = [
  jscpc, jloc, jainJet, modularSprinkler, jMiniSprinkler,
  turboPc, ghoomar, venturiInjector, spinCleanDisc,
  acurainOpal, jainFogger, jBubblerPc, acuMister
];

function productName(p: any) {
  return p.name ?? p.official_name ?? p.id ?? "Unnamed product record";
}

function evidenceState(p: any) {
  if (p.evidence_state) return p.evidence_state;
  if (p.source?.manufacturer_pdf_verified === true) return "manufacturer_document";
  return "unknown";
}

function comparisonTags(p: any) {
  if (Array.isArray(p.generic_comparison_tags) && p.generic_comparison_tags.length) return p.generic_comparison_tags;
  const category = String(p.category || "").toLowerCase();
  const tags = new Set<string>();
  if (/emitter|drip/.test(category)) tags.add("dripper");
  if (/pressure_compensating|_pc_/.test(category)) tags.add("pressure_compensating_emitter");
  if (/jet/.test(category)) tags.add("micro_jet");
  return [...tags];
}

export const PRODUCT_INDEX = PRODUCTS.map((p: any) => ({
  name: productName(p),
  manufacturer: p.manufacturer,
  category: p.category,
  generic_comparison_tags: comparisonTags(p),
  evidence_state: evidenceState(p)
}));

export function searchableProductText(p: any) {
  return [
    productName(p),
    p.category,
    ...comparisonTags(p),
    ...(p.application?.manufacturer_examples ?? []),
    ...(p.application?.useful_when_considering ?? []),
    ...(p.design_adviser_hooks?.consider_when ?? []),
    ...(p.design_adviser_hooks?.ask_or_compare ?? []),
    ...(p.manufacturer_use_guidance ?? []),
    ...(p.tagro_reasoning_hooks ?? [])
  ].join(" ").toLowerCase();
}

export function productTerms(body: any) {
  const explicit = body?.product_query?.categories?.map((x: unknown) => String(x).toLowerCase()) ?? [];
  if (explicit.length) return [...new Set(explicit)];

  const q = String(body?.user_request ?? "").toLowerCase();
  const terms: string[] = [];
  const add = (...values: string[]) => terms.push(...values);

  if (/drip|dripper|emitter|point source|pcnl|pressure compens/.test(q)) add("emitter", "dripper", "pressure_compensating");
  if (/jet|fan jet|spray jet|wetting pattern/.test(q)) add("jet", "broad_wetting", "micro_jet");
  if (/mini sprinkler|under foliage|nursery/.test(q)) add("mini_sprinkler", "under_foliage", "nursery");
  if (/micro sprinkler|sprinkler|broad wet|orchard spray/.test(q)) add("micro_sprinkler", "sprinkler", "broad_wetting");
  if (/under tree|under-tree|low angle|orchard sprinkler/.test(q)) add("under_tree", "orchard_sprinkler", "tree_irrigation");
  if (/bubbler|basin|high flow tree/.test(q)) add("bubbler", "tree_irrigation", "high_flow_device");
  if (/fogger|fog|fine mist|humidity/.test(q)) add("fogger", "fine_mist", "microclimate");
  if (/mister|mist|propagation/.test(q)) add("mister", "propagation", "climate_control");
  if (/filter|sand|grit|borewell|well water|hydrocyclone|disc/.test(q)) add("filter", "sand_separator", "disc_filter", "well_water");
  if (/fertig|fertiliz|fertilis|venturi|inject|chemical dosing|nutrient/.test(q)) add("venturi", "fertigation", "fertilizer_injector", "differential_pressure");

  return [...new Set(terms)];
}

export function selectProducts(body: any, limit = 5) {
  const terms = productTerms(body);
  if (!terms.length) return [];
  return PRODUCTS
    .map((product: any) => {
      const haystack = searchableProductText(product);
      const score = terms.reduce((n, term) => n + (haystack.includes(term) ? 1 : 0), 0);
      return { product, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, limit))
    .map(x => x.product);
}

export function productsBySearchTerm(term: string) {
  const q = String(term || "").toLowerCase().trim();
  if (!q) return [];
  return PRODUCTS.filter((p: any) => searchableProductText(p).includes(q));
}
