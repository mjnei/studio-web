/**
 * Fixed decorative aurora / floating orbs behind app chrome.
 * Pointer-events none; hidden from AT. Motion respects prefers-reduced-motion via CSS.
 */
export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-orb ambient-orb--indigo" />
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--purple" />
      <div className="ambient-orb ambient-orb--violet" />
      <div className="ambient-mesh" />
    </div>
  );
}
