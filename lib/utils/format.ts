/**
 * Money helpers. Every amount is an integer in pence (Part 18.8). Never a float.
 */

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

export function formatPence(pence: number): string {
  return GBP.format(pence / 100);
}

/** Cost per unit, rounded half up. Never store a stale copy (Part 4.3). */
export function costPerUnitPence(wholesalePricePence: number, packQuantity: number): number {
  if (!packQuantity || packQuantity <= 0) return wholesalePricePence;
  return Math.round(wholesalePricePence / packQuantity);
}

export function formatCostPerUnit(wholesalePricePence: number, packQuantity: number): string {
  return formatPence(costPerUnitPence(wholesalePricePence, packQuantity));
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
