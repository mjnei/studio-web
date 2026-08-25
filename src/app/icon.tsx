import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, rgba(139,92,246,0.9), transparent 45%), linear-gradient(135deg, #0f1419 0%, #111827 45%, #0a0e17 100%)",
      }}
    >
      <div
        style={{
          width: 320,
          height: 320,
          borderRadius: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 45%, #06b6d4 100%)",
          boxShadow: "0 30px 80px rgba(6, 182, 212, 0.25)",
          color: "white",
          fontSize: 180,
          fontWeight: 700,
          letterSpacing: "-0.08em",
        }}
      >
        H
      </div>
    </div>,
    size
  );
}
