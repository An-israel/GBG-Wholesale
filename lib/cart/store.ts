"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client cart UI state (Zustand — the only place we use it, per Part 2.1).
 * Persisted to localStorage so the cart survives a refresh and a browser
 * restart (acceptance #1). The server remains the authority on price, MOQ and
 * stock at checkout; these prices are display-only and revalidated server-side.
 */
export type CartLine = {
  productSlug: string;
  productName: string;
  sku: string;
  variantId: string | null;
  variantName: string | null;
  imageUrl: string;
  unitPricePence: number;
  packQuantity: number;
  moq: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  drawerOpen: boolean;
  addLine: (line: CartLine) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  setDrawer: (open: boolean) => void;
};

export const lineKey = (l: Pick<CartLine, "productSlug" | "variantId">) =>
  `${l.productSlug}::${l.variantId ?? "base"}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      drawerOpen: false,
      addLine: (line) =>
        set((state) => {
          const key = lineKey(line);
          const existing = state.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                lineKey(l) === key ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
              drawerOpen: true,
            };
          }
          return { lines: [...state.lines, line], drawerOpen: true };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) => (lineKey(l) === key ? { ...l, quantity: Math.max(l.moq, quantity) } : l))
            .filter((l) => l.quantity > 0),
        })),
      removeLine: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => lineKey(l) !== key) })),
      clear: () => set({ lines: [] }),
      setDrawer: (open) => set({ drawerOpen: open }),
    }),
    { name: "gbg-cart" }
  )
);

export const useCartCount = () =>
  useCart((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));

export const useCartSubtotal = () =>
  useCart((s) => s.lines.reduce((sum, l) => sum + l.unitPricePence * l.quantity, 0));
