import { useId } from "react";
import { cn } from "@/lib/utils";

interface MarkProps {
  size?: number;
  className?: string;
}

export const LogoMark = ({ size = 32, className }: MarkProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-ray`} x1="16" y1="0" x2="30" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="hsl(186 100% 70%)" />
          <stop offset="0.7" stopColor="hsl(186 100% 58%)" stopOpacity="0.9" />
          <stop offset="1" stopColor="hsl(186 100% 58%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="hsl(220 11% 9%)" stroke="hsl(0 0% 100% / 0.12)" />
      <path d="M10.6 7.2v17.2" stroke="hsl(40 16% 92%)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="19" r="5.1" stroke="hsl(40 16% 92%)" strokeWidth="3" />
      <path
        d="M16 19h13"
        stroke={`url(#${id}-ray)`}
        strokeWidth="1.7"
        strokeLinecap="round"
        className="origin-[16px_19px] transition-transform duration-700 ease-out-expo group-hover:scale-x-[1.18]"
      />
      <circle cx="16" cy="19" r="1.25" fill="hsl(186 100% 70%)" />
    </svg>
  );
};

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const Logo = ({ className, size = 30, showWordmark = true }: LogoProps) => (
  <span className={cn("group inline-flex items-center gap-2.5", className)}>
    <LogoMark size={size} />
    {showWordmark && (
      <span className="display text-[19px] font-bold leading-none tracking-[-0.04em] text-bone">
        beam<span className="font-medium text-mute">server</span>
      </span>
    )}
  </span>
);
