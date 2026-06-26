type Tier = "bronze" | "silver" | "gold" | "platinum" | "ruby" | "first-step" | "tree-builder" | "deep-roots";

const TIER_COLORS: Record<Tier, string> = {
  bronze:       "#b97333",
  silver:       "#7e8ea6",
  gold:         "#c9960c",
  platinum:     "#5a6e8c",
  ruby:         "#a81226",
  "first-step":    "#00754A",
  "tree-builder":  "#00754A",
  "deep-roots":    "#00754A",
};

// Bronze: filled circle — plainest shape, entry tier
function BronzeIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <circle cx="22" cy="22" r="20" fill={color} />
      <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* upward arrow */}
      <path d="M22 13 L22 31" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M15 20 L22 13 L29 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// Silver: pentagon / classic badge shield
function SilverIcon({ color }: { color: string }) {
  const pts = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180);
    return `${22 + 19 * Math.cos(a)},${22 + 19 * Math.sin(a)}`;
  }).join(" ");
  const ptsInner = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 - 90) * (Math.PI / 180);
    return `${22 + 13 * Math.cos(a)},${22 + 13 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <polygon points={pts} fill={color} />
      <polygon points={ptsInner} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* branching tree: trunk + two branches */}
      <path d="M22 31 L22 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 24 L16 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 22 L28 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="17" r="2" fill="white" />
      <circle cx="28" cy="16" r="2" fill="white" />
      <circle cx="22" cy="19" r="2" fill="white" />
    </svg>
  );
}

// Gold: hexagon — six-fold symmetry, elevated tier
function GoldIcon({ color }: { color: string }) {
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180);
    return `${22 + 20 * Math.cos(a)},${22 + 20 * Math.sin(a)}`;
  }).join(" ");
  const hexInner = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 30) * (Math.PI / 180);
    return `${22 + 13 * Math.cos(a)},${22 + 13 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <polygon points={hex} fill={color} />
      <polygon points={hexInner} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* 4-pointed star */}
      <path d="M22 12 L24 20 L32 22 L24 24 L22 32 L20 24 L12 22 L20 20 Z" fill="white" />
    </svg>
  );
}

// Platinum: octagon — precision, authority
function PlatinumIcon({ color }: { color: string }) {
  const oct = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 22.5) * (Math.PI / 180);
    return `${22 + 20 * Math.cos(a)},${22 + 20 * Math.sin(a)}`;
  }).join(" ");
  const octInner = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 22.5) * (Math.PI / 180);
    return `${22 + 13 * Math.cos(a)},${22 + 13 * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <polygon points={oct} fill={color} />
      <polygon points={octInner} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
      {/* diamond / rhombus */}
      <path d="M22 13 L30 22 L22 31 L14 22 Z" fill="white" />
      <path d="M22 17 L26 22 L22 27 L18 22 Z" fill={color} />
    </svg>
  );
}

// Ruby: 5-pointed star — rarest, highest tier
function RubyIcon({ color }: { color: string }) {
  const outerR = 20;
  const innerR = 8;
  const starPts = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? outerR : innerR;
    return `${22 + r * Math.cos(a)},${22 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <polygon points={starPts} fill={color} />
      {/* crown: three prongs */}
      <path d="M15 27 L15 20 L19 24 L22 18 L25 24 L29 20 L29 27 Z" fill="white" />
    </svg>
  );
}

// Existing achievement badges — use the dashboard green

function FirstStepIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="2" y="2" width="40" height="40" rx="8" fill={color} />
      <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* footstep path: two offset ovals */}
      <ellipse cx="18" cy="20" rx="4.5" ry="6" fill="white" transform="rotate(-10 18 20)" />
      <ellipse cx="26" cy="25" rx="4.5" ry="6" fill="white" transform="rotate(10 26 25)" />
    </svg>
  );
}

function TreeBuilderIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="2" y="2" width="40" height="40" rx="8" fill={color} />
      <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* tree: trunk + triangle canopy */}
      <rect x="20" y="28" width="4" height="7" rx="1" fill="white" />
      <polygon points="22,10 32,28 12,28" fill="white" />
      <polygon points="22,14 30,26 14,26" fill={color} />
    </svg>
  );
}

function DeepRootsIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect x="2" y="2" width="40" height="40" rx="8" fill={color} />
      <rect x="2" y="2" width="40" height="40" rx="8" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
      {/* nested chain of 3 circles */}
      <circle cx="22" cy="14" r="4" fill="white" />
      <line x1="22" y1="18" x2="22" y2="22" stroke="white" strokeWidth="2" />
      <circle cx="22" cy="26" r="4" fill="white" />
      <line x1="22" y1="30" x2="22" y2="33" stroke="white" strokeWidth="2" />
      <circle cx="22" cy="36" r="3" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

export function BadgeIcon({ tier, unlocked }: { tier: Tier; unlocked: boolean }) {
  // Use actual tier color always — locked badges are desaturated+dimmed via CSS filter
  const color = TIER_COLORS[tier];

  const icon = (() => {
    switch (tier) {
      case "bronze":        return <BronzeIcon color={color} />;
      case "silver":        return <SilverIcon color={color} />;
      case "gold":          return <GoldIcon color={color} />;
      case "platinum":      return <PlatinumIcon color={color} />;
      case "ruby":          return <RubyIcon color={color} />;
      case "first-step":    return <FirstStepIcon color={color} />;
      case "tree-builder":  return <TreeBuilderIcon color={color} />;
      case "deep-roots":    return <DeepRootsIcon color={color} />;
    }
  })();

  return (
    <div style={{
      width: 44,
      height: 44,
      flexShrink: 0,
      filter: unlocked ? "none" : "grayscale(1) opacity(0.28)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {icon}
    </div>
  );
}
