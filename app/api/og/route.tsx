import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Dynamic OG image (Part 17). Renders product name and price, or a default. */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "GBG Wholesale";
  const price = searchParams.get("price");

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0D1B2A",
          color: "#FFFDD0",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#C9A84C", textTransform: "uppercase" }}>
          GBG Wholesale
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 16, lineHeight: 1.1 }}>{title}</div>
        {price && <div style={{ fontSize: 40, marginTop: 24, color: "#C9A84C" }}>{price}</div>}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
