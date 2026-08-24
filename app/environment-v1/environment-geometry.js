(() => {
  "use strict";

  const EPS = 1e-9;

  function pointOf(object) {
    const p = object?.geometry?.points?.[0];
    return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: Number(p.x), y: Number(p.y) } : null;
  }

  function lineEnds(object) {
    const pts = object?.geometry?.points;
    if (!Array.isArray(pts) || pts.length < 2) return null;
    const a = pts[0], b = pts[pts.length - 1];
    if (![a?.x,a?.y,b?.x,b?.y].every(Number.isFinite)) return null;
    return [{x:Number(a.x),y:Number(a.y)},{x:Number(b.x),y:Number(b.y)}];
  }

  function vectorBasis(anchor) {
    const ends = lineEnds(anchor);
    if (!ends) return null;
    const [a,b] = ends;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx,dy);
    if (!(len > EPS)) return null;
    const ux = dx / len, uy = dy / len;
    return { a, b, len, u:{x:ux,y:uy}, v:{x:-uy,y:ux} };
  }

  const dot = (a,b) => a.x*b.x + a.y*b.y;
  const sub = (a,b) => ({x:a.x-b.x,y:a.y-b.y});
  const add = (a,b) => ({x:a.x+b.x,y:a.y+b.y});
  const mul = (a,s) => ({x:a.x*s,y:a.y*s});

  function coordinatesInBasis(point,basis) {
    const d = sub(point,basis.a);
    return { t:dot(d,basis.u), s:dot(d,basis.v) };
  }

  function fromBasis(t,s,basis) {
    return add(basis.a, add(mul(basis.u,t), mul(basis.v,s)));
  }

  function clusterByT(items,tolerance=22) {
    const sorted = [...items].sort((a,b)=>a.t-b.t);
    const clusters = [];
    for (const item of sorted) {
      const last = clusters[clusters.length-1];
      if (!last || Math.abs(item.t-last.meanT) > tolerance) {
        clusters.push({items:[item],meanT:item.t});
      } else {
        last.items.push(item);
        last.meanT = last.items.reduce((sum,x)=>sum+x.t,0)/last.items.length;
      }
    }
    return clusters;
  }

  function targetObjects(proposal,state) {
    const explicit = new Set([...(proposal?.affected_ids || []), ...(proposal?.intent?.anchor_ids || [])]);
    const all = Array.isArray(state?.objects) ? state.objects : [];
    const eligible = all.filter(o => ["plant","device"].includes(o.kind) && pointOf(o));
    const explicitTargets = eligible.filter(o => explicit.has(o.id));
    return explicitTargets.length ? explicitTargets : eligible;
  }

  function anchorObject(proposal,state,kind) {
    const ids = proposal?.intent?.anchor_ids || [];
    const objects = Array.isArray(state?.objects) ? state.objects : [];
    return ids.map(id => objects.find(o=>o.id===id)).find(o=>o?.kind===kind && lineEnds(o)) || null;
  }

  function sideAllows(s,side) {
    if (side === "left") return s >= -EPS;
    if (side === "right") return s <= EPS;
    return true;
  }

  function lineSpecsFromTargets({proposal,state,anchorKind,outputKind}) {
    const anchor = anchorObject(proposal,state,anchorKind);
    if (!anchor) return {ok:false,reason:`${anchorKind}_anchor_required`};
    const basis = vectorBasis(anchor);
    if (!basis) return {ok:false,reason:"anchor_geometry_invalid"};

    const params = proposal.intent?.parameters || {};
    const directionBasis = params.direction_basis || "unknown";
    if (!["plants","user_mark","unknown"].includes(directionBasis)) {
      return {ok:false,reason:"real_map_scale_or_row_model_required",detail:`direction_basis=${directionBasis}`};
    }
    if (params.spacing_m != null && directionBasis !== "plants") {
      return {ok:false,reason:"real_map_scale_required_for_metric_spacing"};
    }

    const side = params.side || "unknown";
    const targets = targetObjects(proposal,state)
      .map(object => ({object, point:pointOf(object)}))
      .map(item => ({...item,...coordinatesInBasis(item.point,basis)}))
      .filter(item => sideAllows(item.s,side));

    if (!targets.length) return {ok:false,reason:"mark_plants_or_devices_first"};

    const clusters = clusterByT(targets,22);
    const margin = 16;
    const specs = [];

    clusters.forEach((cluster,index) => {
      const sValues = cluster.items.map(x=>x.s);
      let minS = Math.min(0,...sValues), maxS = Math.max(0,...sValues);
      if (side === "left") { minS = 0; maxS += margin; }
      else if (side === "right") { minS -= margin; maxS = 0; }
      else { minS -= margin; maxS += margin; }

      const p1 = fromBasis(cluster.meanT,minS,basis);
      const p2 = fromBasis(cluster.meanT,maxS,basis);
      specs.push({
        temp_id:`${proposal.proposal_id || "proposal"}_preview_${index+1}`,
        kind:outputKind,
        state:"proposed",
        geometry:{type:"line",points:[p1,p2]},
        properties:{
          generated_from:anchor.id,
          target_ids:cluster.items.map(x=>x.object.id),
          direction_basis:"plants",
          proposal_id:proposal.proposal_id || null
        }
      });
    });

    return {
      ok:true,
      operation:proposal.intent.operation,
      anchor_id:anchor.id,
      objects:specs,
      note:"Canvas preview only; metric length/hydraulic validity still require the real map/measurement and deterministic engineering inputs."
    };
  }

  function preview(proposal,state) {
    const operation = proposal?.intent?.operation;
    if (operation === "generate_laterals") {
      return lineSpecsFromTargets({proposal,state,anchorKind:"submain",outputKind:"lateral"});
    }
    if (operation === "generate_submains") {
      return lineSpecsFromTargets({proposal,state,anchorKind:"main",outputKind:"submain"});
    }
    return {ok:false,reason:"operation_not_supported_by_geometry_preview",operation};
  }

  window.TAGROGeometryProposal = Object.freeze({ preview });
})();
