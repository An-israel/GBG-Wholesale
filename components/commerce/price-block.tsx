import { costPerUnitPence, formatPence } from "@/lib/utils/format";
import { Chip } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";

/**
 * Price clarity block (Part 3.4 #2). Every price is shown three ways: pack
 * price, cost per unit, and MOQ. The unit price converts a reseller, so it is
 * the second-largest number on the page.
 */
export function PriceBlock({
  wholesalePence,
  compareAtPence,
  packQuantity,
  moq,
  size = "md",
}: {
  wholesalePence: number;
  compareAtPence?: number | null;
  packQuantity: number;
  moq: number;
  size?: "sm" | "md" | "lg";
}) {
  const unit = costPerUnitPence(wholesalePence, packQuantity);
  const packLabel = packQuantity > 1 ? `pack of ${packQuantity}` : "each";

  return (
    <div className="space-y-1">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display font-bold text-ink",
            size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl"
          )}
        >
          {formatPence(wholesalePence)}
        </span>
        <span className="text-sm text-ink-50">/ {packLabel}</span>
        {compareAtPence && compareAtPence > wholesalePence && (
          <span className="text-sm text-ink-50 line-through">{formatPence(compareAtPence)}</span>
        )}
      </div>
      {packQuantity > 1 && (
        <p className={cn("font-display font-semibold text-ink", size === "lg" ? "text-2xl" : "text-lg")}>
          {formatPence(unit)}{" "}
          <span className="font-body text-sm font-normal text-ink-50">per unit</span>
        </p>
      )}
      <Chip>MOQ: {moq} {moq === 1 ? "unit" : "units"}</Chip>
    </div>
  );
}
