"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/store";
import { getReorderLines } from "@/lib/actions/reorder";
import { Button } from "@/components/ui/button";

/** Adds every line of a past order back to the cart (acceptance #12). */
export function ReorderButton({ orderNumber }: { orderNumber: string }) {
  const addLine = useCart((s) => s.addLine);
  const setDrawer = useCart((s) => s.setDrawer);
  const [state, setState] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string>();

  async function reorder() {
    setState("loading");
    setError(undefined);
    const res = await getReorderLines(orderNumber);
    setState("idle");
    if (res.ok && res.data) {
      res.data.forEach((line) => addLine(line));
      setDrawer(true);
    } else if (!res.ok) {
      setError(res.error.message);
    }
  }

  return (
    <div>
      <Button variant="outline" size="sm" onClick={reorder} disabled={state === "loading"}>
        {state === "loading" ? "Adding…" : "Reorder"}
      </Button>
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
