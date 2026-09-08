// TAGRO v16 — Jain price catalogue
//
// Source: Jain dealer PO "Purchase_order_format_for_dealer_with_item_code_and_rate__MIS__HNE-0726.xls"
// (July 2026, HNE-0726), parsed 2026-08-02 into jain_mis_hne0726.csv (Dropbox:
// /jain-irrigation-agent/Claude Jain/data/jain_mis_hne0726.csv). Confirmed with Thomas
// 2026-09-07 as the price basis for this build. landedRate = dealer PO rate after that
// section's own discount stack (recorded per row for audit) — this is TAGRO's actual cost,
// not the farmer-facing rate; BOM pricing decisions (markup, GST, price basis) stay in
// v16-bom-builder.js, this file only supplies matched catalogue facts.
//
// Deliberately NOT a fuzzy matcher: every entry below is a specific SKU picked by hand from
// the source PO for one (material, size) or (device type, discharge) combination. A drawn
// pipe size or emitter discharge with no entry here returns null rather than guessing at the
// nearest one — an invented price is worse than an honest "no catalogue match."
//
// Known, stated gaps (do not silently fill these in): PVC 75mm and above, and all PVC
// fittings, are absent from HNE-0726 entirely (still on the stale April-2021 PRPA list per
// the 1 Aug 2026 working notes) — pricePipe() returns null for those. HDPE is priced at
// SDR13.6 by default (the SDR already used as the codebase-wide default in tagroEngineering),
// not every SDR class Jain sells. Fittings, valves, filters and pumps are not covered here at
// all in this pass — Thomas scoped this build to pipe + emitter sizing and pricing only
// (2026-09-07); those are a deliberate follow-on, not an oversight.
(() => {
  const SOURCE = 'Jain dealer PO HNE-0726 (Jul 2026)';

  // material -> sizeMm -> { code, desc, unit, rate, landedRate }
  const PIPE = {
    LLDPE: {
      12: { code: 'TO122500M', desc: 'DRIP LATERAL OD12MM CL2X500MTR', unit: 'm', rate: 8.30, landedRate: 6.53 },
      16: { code: 'TO162400M', desc: 'DRIP LATERAL OD16MM CL2X400 MTR', unit: 'm', rate: 13.75, landedRate: 10.82 },
      20: { code: 'TO202250M', desc: 'DRIP LATERAL OD20MM CL2 X 250MTR', unit: 'm', rate: 18.80, landedRate: 14.80 },
    },
    PVC: {
      // PRDA series only — the PO's current PVC pipe line. 40/50mm quoted at 6kg pressure
      // class; 63mm quoted at both 4kg and 6kg, 6kg kept here since that matches TAGRO's
      // default submain/main SDR13.6 design practice.
      40: { code: 'PRDA040006IGS00600', desc: 'PVC PIPE 40 X 6 KG, 6M LENGTH', unit: 'm', rate: 44.35, landedRate: 35.64 },
      50: { code: 'PRDA050006IGS00600', desc: 'PVC PIPE 50 X 6 KG, 6M LENGTH', unit: 'm', rate: 65.90, landedRate: 52.96 },
      63: { code: 'PRDA063006IGS00600', desc: 'PVC PIPE 63 X 6 KG, 6M LENGTH', unit: 'm', rate: 102.25, landedRate: 82.17 },
      // 75mm and above: not in HNE-0726 (see header note) — intentionally absent.
    },
    HDPE: {
      // PE63 coil, SDR13.6 class, matching the codebase default SDR.
      40: { code: 'S6PA04006ISDKB0500', desc: 'HDPE PIPE 40MM SDR13.6 PE63 COIL 500M', unit: 'm', rate: 114.15, landedRate: 67.96 },
      50: { code: 'S6PA05006ISDKB0200', desc: 'HDPE PIPE 50MM SDR13.6 PE63 COIL 200M', unit: 'm', rate: 172.75, landedRate: 102.85 },
      63: { code: 'S6PA06306ISDKB0100', desc: 'HDPE PIPE 63MM SDR13.6 PE63 COIL 100M', unit: 'm', rate: 274.70, landedRate: 163.54 },
      32: { code: 'S1PA03210ISDKB1000', desc: 'HDPE PIPE 32MM SDR13.6 PE100 COIL 1000M', unit: 'm', rate: 75.30, landedRate: 44.83 },
    },
  };

  // Drippers: J-Turbo Key Plus (JTKP) series, sold in packs of 100. Landed rate below is
  // already divided down to a per-piece figure; all four discharge ratings are the same pack
  // price in this PO (that is what the source data says, not an assumption).
  const JTKP_PACK = { rate: 265.0, landedRate: 208.61, packSize: 100 };
  const DEVICE = {
    dripper: {
      2: { code: 'JTKP02P100', desc: 'J-TURBO KEY PLUS DRIPPER 2 LPH (pack of 100)', ...perUnit(JTKP_PACK) },
      4: { code: 'JTKP04P100', desc: 'J-TURBO KEY PLUS DRIPPER 4 LPH (pack of 100)', ...perUnit(JTKP_PACK) },
      8: { code: 'JTKP08P100', desc: 'J-TURBO KEY PLUS DRIPPER 8 LPH (pack of 100)', ...perUnit(JTKP_PACK) },
      14: { code: 'JTKP14P100', desc: 'J-TURBO KEY PLUS DRIPPER 14 LPH (pack of 100)', ...perUnit(JTKP_PACK) },
    },
  };

  function perUnit(pack) {
    return { unit: 'pcs', rate: round4(pack.rate / pack.packSize), landedRate: round4(pack.landedRate / pack.packSize), packNote: `priced from a pack of ${pack.packSize}` };
  }
  function round4(n) { return Math.round(n * 10000) / 10000; }

  function priceForPipe(material, sizeMm) {
    const m = String(material || '').toUpperCase();
    const row = PIPE[m]?.[Number(sizeMm)];
    if (!row) return null;
    return { ...row, source: SOURCE, matchedOn: `${m} ${sizeMm} mm` };
  }

  function priceForDevice(deviceType, dischargeLph) {
    const t = String(deviceType || 'dripper').toLowerCase();
    const table = DEVICE[t];
    if (!table) return null;
    // Match on the nearest whole-number discharge actually catalogued; do not match if the
    // drawn discharge is more than 0.5 LPH away from any catalogued rating — that is a
    // materially different emitter, not a rounding difference.
    const want = Number(dischargeLph);
    if (!(want > 0)) return null;
    let best = null, bestDelta = Infinity;
    for (const lph of Object.keys(table)) {
      const delta = Math.abs(Number(lph) - want);
      if (delta < bestDelta) { bestDelta = delta; best = lph; }
    }
    if (best == null || bestDelta > 0.5) return null;
    return { ...table[best], source: SOURCE, matchedOn: `${t} ${best} LPH` };
  }

  window.TAGRO_CATALOG = { source: SOURCE, priceForPipe, priceForDevice };
})();
