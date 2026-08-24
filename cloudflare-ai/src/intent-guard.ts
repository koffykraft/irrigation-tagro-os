const FORBIDDEN_GEOMETRY_KEYS = new Set([
  "x", "y", "lat", "latitude", "lng", "lon", "longitude",
  "coordinate", "coordinates", "geometry", "geojson", "polyline", "polygon", "point"
]);

function walk(value: unknown, path = "parameters"): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const found = walk(value[i], `${path}[${i}]`);
      if (found) return found;
    }
    return null;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
    if (FORBIDDEN_GEOMETRY_KEYS.has(normalized)) return `${path}.${key}`;
    const found = walk(child, `${path}.${key}`);
    if (found) return found;
  }
  return null;
}

export function assertIntentHasNoDirectGeometry(proposal: any): void {
  const parameters = proposal?.intent?.parameters;
  const forbiddenPath = walk(parameters);
  if (forbiddenPath) {
    throw new Error(`AI proposal attempted to supply direct geometry at ${forbiddenPath}; only design intent is permitted`);
  }
}

export function stampProposal(proposal: any, index: number) {
  assertIntentHasNoDirectGeometry(proposal);
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `prop_${Date.now()}_${index + 1}`,
    status: "proposed",
    ...proposal
  };
}
