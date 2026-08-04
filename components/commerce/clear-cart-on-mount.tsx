"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/store";

/** Clears the cart once, on the confirmation page. */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
