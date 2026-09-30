import { useRef } from "react";

interface BeamLogoProps {
  className?: string;
  size?: number;
}

const BeamLogo = ({ className = "", size = 40 }: BeamLogoProps) => {
  const uid = useRef(`bsl-${Math.random().toString(36).slice(2, 7)}`).current;
  const g = (s: string) => `${uid}-${s}`;

  const gradId   = g("gr");
  const glow1    = g("gw1");
  const glow2    = g("gw2");
  const bgGr     = g("bg");
  const innerGl  = g("ig");
  const blurF    = g("bf");
  const outerF   = g("of");
  const clipR    = g("cl");
  const sheen    = g("sh");

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 52 52"
      fill="none"
      width={size}
      height={size}
      className={className}
      style={{ overflow: "visible" }}
      aria-label="Beam Server"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00e5ff" />
          <stop offset="48%"  stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#c026d3" />
        </linearGradient>

        <linearGradient id={bgGr} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#080a14" />
          <stop offset="100%" stopColor="#0e0520" />
        </linearGradient>

        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="50%"  stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={innerGl} cx="26" cy="22" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.18">
            <animate attributeName="stopOpacity" values="0.18;0.32;0.18" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>

        <filter id={blurF} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        <filter id={outerF} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
        </filter>

        <filter id={glow1} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
        </filter>

        <filter id={glow2} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        </filter>

        <clipPath id={clipR}>
          <rect x="1" y="1" width="50" height="50" rx="14" />
        </clipPath>
      </defs>

      {/* Outer ambient pulse */}
      <rect x="3" y="3" width="46" height="46" rx="13"
        fill={`url(#${gradId})`} opacity="0.18"
        filter={`url(#${outerF})`}>
        <animate attributeName="opacity" values="0.18;0.38;0.18" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* Body */}
      <rect x="1" y="1" width="50" height="50" rx="14" fill={`url(#${bgGr})`} />
      <rect x="1" y="1" width="50" height="50" rx="14" fill={`url(#${innerGl})`} />

      {/* Border */}
      <rect x="1" y="1" width="50" height="50" rx="14"
        stroke={`url(#${gradId})`} strokeWidth="1.2" fill="none">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* Glass sheen */}
      <rect x="1" y="1" width="50" height="50" rx="14"
        fill={`url(#${sheen})`} clipPath={`url(#${clipR})`} />

      {/* ICON: two server slabs */}
      <g clipPath={`url(#${clipR})`} filter={`url(#${blurF})`}>

        {/* Top server slab */}
        <rect x="10" y="13" width="32" height="11" rx="4"
          fill={`url(#${gradId})`} opacity="0.15" />
        <rect x="10" y="13" width="32" height="11" rx="4"
          stroke={`url(#${gradId})`} strokeWidth="1.1" fill="none" opacity="0.9" />

        <circle cx="16" cy="18.5" r="1.6" fill="#00e5ff" opacity="0.9" />
        <circle cx="20.5" cy="18.5" r="1.6" fill="#7c3aed" opacity="0.75" />
        <circle cx="25" cy="18.5" r="1.6" fill="#c026d3" opacity="0.6" />

        <rect x="30" y="16.5" width="8" height="2" rx="1" fill="#00e5ff" opacity="0.5">
          <animate attributeName="opacity" values="0.5;1;0.3;0.8;0.5" dur="2.2s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="19.5" width="5" height="2" rx="1" fill="#7c3aed" opacity="0.5">
          <animate attributeName="opacity" values="0.3;0.8;0.5;0.2;0.3" dur="1.8s" repeatCount="indefinite" />
        </rect>

        {/* Bottom server slab */}
        <rect x="10" y="28" width="32" height="11" rx="4"
          fill={`url(#${gradId})`} opacity="0.08" />
        <rect x="10" y="28" width="32" height="11" rx="4"
          stroke={`url(#${gradId})`} strokeWidth="1.1" fill="none" opacity="0.55" />

        <circle cx="16" cy="33.5" r="1.6" fill="#00e5ff" opacity="0.65" />
        <circle cx="20.5" cy="33.5" r="1.6" fill="#7c3aed" opacity="0.5" />
        <circle cx="25" cy="33.5" r="1.6" fill="#c026d3" opacity="0.35" />

        <rect x="30" y="31.5" width="6" height="2" rx="1" fill="#00e5ff" opacity="0.35">
          <animate attributeName="opacity" values="0.35;0.7;0.2;0.6;0.35" dur="3s" repeatCount="indefinite" />
        </rect>
        <rect x="30" y="34.5" width="9" height="2" rx="1" fill="#c026d3" opacity="0.35">
          <animate attributeName="opacity" values="0.2;0.5;0.35;0.1;0.2" dur="2.5s" repeatCount="indefinite" />
        </rect>

        {/* Scan line sweep */}
        <rect x="10" y="13" width="3" height="26" rx="1.5"
          fill="#00e5ff" opacity="0.55" filter={`url(#${glow2})`}>
          <animate attributeName="x" values="10;39;10" dur="3s" repeatCount="indefinite"
            calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
          <animate attributeName="opacity" values="0.55;0.85;0.55" dur="3s" repeatCount="indefinite" />
        </rect>

        {/* Connector cables */}
        <line x1="14" y1="24" x2="14" y2="28" stroke="#00e5ff" strokeWidth="1" opacity="0.5" strokeDasharray="1 2">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="19" y1="24" x2="19" y2="28" stroke="#7c3aed" strokeWidth="1" opacity="0.35" strokeDasharray="1 2">
          <animate attributeName="opacity" values="0.35;0.7;0.35" dur="2.4s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Corner pip */}
      <circle cx="44.5" cy="7.5" r="2.2" fill="#00e5ff">
        <animate attributeName="r"       values="2.2;3;2.2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.4;1"   dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="44.5" cy="7.5" r="4" fill="#00e5ff" opacity="0.3" filter={`url(#${glow1})`}>
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

export default BeamLogo;
