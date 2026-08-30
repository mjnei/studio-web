/** FNV-1a string hash — stable pseudo-random values per seed. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export interface AvatarGradientStyle {
  background: string;
  ringColor: string;
  hoverRingColor: string;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h} ${s}% ${l}%)`;
}

/** Deterministic multi-stop gradient from a user identifier (id, email, etc.). */
export function getAvatarGradientStyle(seed: string): AvatarGradientStyle {
  const hash = hashString(seed);

  const hue1 = hash % 360;
  const scheme = hash % 4;

  // Pick hues from high-contrast color harmonies (≥90° apart).
  let hue2: number;
  let hue3: number;
  switch (scheme) {
    case 0: // complementary + warm accent
      hue2 = (hue1 + 180) % 360;
      hue3 = (hue1 + 55) % 360;
      break;
    case 1: // triadic
      hue2 = (hue1 + 120) % 360;
      hue3 = (hue1 + 240) % 360;
      break;
    case 2: // split-complementary
      hue2 = (hue1 + 150) % 360;
      hue3 = (hue1 + 210) % 360;
      break;
    default: // square (90° / 270°)
      hue2 = (hue1 + 90) % 360;
      hue3 = (hue1 + 270) % 360;
      break;
  }

  const angle = 15 + ((hash >> 4) % 345);
  const sat1 = 78 + (hash % 17); // 78–94%
  const sat2 = 74 + ((hash >> 8) % 20);
  const sat3 = 76 + ((hash >> 12) % 18);

  // Alternate dark / bright stops for stronger contrast.
  const light1 = 30 + ((hash >> 16) % 14); // 30–43%
  const light2 = 60 + ((hash >> 20) % 16); // 60–75%
  const light3 = 36 + ((hash >> 24) % 12); // 36–47%

  const highlightX = 18 + (hash % 44);
  const highlightY = 12 + ((hash >> 6) % 34);
  const shadeX = 72 + ((hash >> 10) % 22);
  const shadeY = 68 + ((hash >> 14) % 24);

  const background = [
    `radial-gradient(circle at ${shadeX}% ${shadeY}%, rgba(0,0,0,0.22) 0%, transparent 58%)`,
    `radial-gradient(circle at ${highlightX}% ${highlightY}%, rgba(255,255,255,0.34) 0%, transparent 48%)`,
    `linear-gradient(${angle}deg, ${hsl(hue1, sat1, light1)} 0%, ${hsl(hue2, sat2, light2)} 46%, ${hsl(hue3, sat3, light3)} 100%)`,
  ].join(", ");

  const ringColor = `hsla(${hue1}, ${sat1}%, ${light1 + 12}%, 0.38)`;
  const hoverRingColor = `hsla(${hue1}, ${sat1}%, ${light1 + 12}%, 0.55)`;

  return { background, ringColor, hoverRingColor };
}
