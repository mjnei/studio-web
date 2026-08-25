/**
 * Fixed decorative aurora / floating orbs behind app chrome.
 * Colors follow design tokens: accent-primary, accent-secondary, accent-cyan,
 * accent-gradient-solid (see globals.css / DESIGN_SYSTEM.md).
 * Pointer-events none; hidden from AT. Motion respects prefers-reduced-motion via CSS.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-orb ambient-orb--primary" />
      <div className="ambient-orb ambient-orb--secondary" />
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--gradient" />
      <div className="ambient-mesh" />
    </div>
  );
}
