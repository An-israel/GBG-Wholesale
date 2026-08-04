"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ProductImage } from "@/types/domain";

/** Swipeable on mobile (dot indicators), thumbnails on desktop (Part 12.2). */
export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-[4/5] w-full rounded-[var(--radius-modal)] bg-surface-alt" />;
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-modal)] bg-surface-alt md:flex-1">
        <Image
          src={images[active].storage_path}
          alt={images[active].alt_text}
          fill
          priority
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover"
        />
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`View image ${i + 1}`}
                onClick={() => setActive(i)}
                className={cn("h-2 w-2 rounded-full", i === active ? "bg-gold" : "bg-cream/70")}
              />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="hidden flex-col gap-2 md:flex">
          {images.map((im, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View ${im.alt_text}`}
              aria-current={i === active}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-[var(--radius-card)] border-2",
                i === active ? "border-gold" : "border-transparent"
              )}
            >
              <Image src={im.storage_path} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
