"use client";

import type { ReactNode } from "react";
import { useAmbientBackground, type AmbientBackgroundStyle } from "@/lib/ambient-background";

function AuroraLayer() {
  return (
    <>
      <div className="ambient-orb ambient-orb--primary" />
      <div className="ambient-orb ambient-orb--secondary" />
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--gradient" />
      <div className="ambient-mesh ambient-mesh--soft" />
    </>
  );
}

function MeshLayer() {
  return (
    <>
      <div className="ambient-glow ambient-glow--mesh" />
      <div className="ambient-mesh ambient-mesh--circuit" />
    </>
  );
}

function GridLayer() {
  return (
    <>
      <div className="ambient-glow ambient-glow--grid" />
      <div className="ambient-grid" />
      <div className="ambient-grid-fade" />
    </>
  );
}

const LAYERS: Record<AmbientBackgroundStyle, () => ReactNode> = {
  aurora: AuroraLayer,
  mesh: MeshLayer,
  grid: GridLayer,
};

/**
 * Fixed decorative background. Style is chosen in Settings → Appearance
 * and persisted in localStorage (see AmbientBackgroundProvider).
 */
export function AmbientBackground() {
  const { style } = useAmbientBackground();
  const Layer = LAYERS[style];

  return (
    <div className="ambient-bg" data-style={style} aria-hidden="true">
      <Layer />
    </div>
  );
}
