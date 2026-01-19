export function formatNumber(n: number, maxFrac = 6): string {
  if (!Number.isFinite(n)) return "-";
  const abs = Math.abs(n);
  const frac = abs >= 1 ? Math.min(maxFrac, 6) : Math.min(maxFrac, 8);
  return n.toLocaleString(undefined, { maximumFractionDigits: frac });
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
