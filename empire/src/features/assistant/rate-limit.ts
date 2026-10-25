/**
 * Limiteur en mémoire (fenêtre glissante) : protection de base contre les
 * abus. En production multi-instances, le remplacer par un stockage partagé.
 */
const buckets = new Map<string, number[]>();

export function allowRequest(key: string, limit = 20, windowMs = 10 * 60_000, now = Date.now()) {
  const recent = (buckets.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) {
    buckets.set(key, recent);
    return false;
  }
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.delete(buckets.keys().next().value!);
  return true;
}
