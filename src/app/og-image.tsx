import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "56px",
        background:
          "radial-gradient(circle at top right, rgba(6, 182, 212, 0.28), transparent 30%), radial-gradient(circle at bottom left, rgba(139, 92, 246, 0.32), transparent 36%), linear-gradient(135deg, #0a0e17 0%, #0f172a 45%, #111827 100%)",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            width: "88px",
            height: "88px",
            borderRadius: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #06b6d4 100%)",
            fontSize: "46px",
            fontWeight: 700,
            letterSpacing: "-0.08em",
          }}
        >
          H
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div style={{ fontSize: "42px", fontWeight: 700 }}>Huavoi Studio</div>
          <div style={{ fontSize: "22px", color: "rgba(241,245,249,0.8)" }}>
            AI-assisted video production
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "860px",
        }}
      >
        <div
          style={{
            fontSize: "68px",
            lineHeight: 1.05,
            fontWeight: 700,
            letterSpacing: "-0.05em",
          }}
        >
          Source to Script to Voice to Final Cut
        </div>
        <div
          style={{
            fontSize: "30px",
            lineHeight: 1.35,
            color: "rgba(203,213,225,0.95)",
          }}
        >
          Plan, narrate, and produce creator-ready videos in one streamlined studio.
        </div>
      </div>
    </div>,
    size
  );
}
