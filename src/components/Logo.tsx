interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Inline SVG logo — renders as DOM SVG so system fonts are always available.
 * Using <img> / next/image with an SVG <text> element fails because fonts are
 * unavailable in the image rendering context. This component avoids that issue.
 */
export default function Logo({ width = 210, height = 36, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 210 36"
      fill="none"
      role="img"
      aria-label="AI Website Roaster"
      className={className}
    >
      {/* ── Flame icon ─────────────────────────────────────── */}
      {/* Outer flame body */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 1C14 4.5 11 9 11 14.5C11 18.5 12.5 21 12.5 21
           C12.5 21 11.5 19 13 17C14.5 15 14.5 17.5 14.5 17.5
           C14.5 17.5 16 13 19.5 11.5
           C18 14.5 18.5 17 19.5 18.5
           C20.5 20 22 19 22 16.5
           C22 10.5 18.5 5 15 1Z"
        fill="#FF6B35"
      />
      {/* Inner highlight — slightly lighter, subtle */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 7C14.5 9.5 13 12 13 15C13 17 14 18.5 14 18.5
           C14 18.5 13.5 17.5 14.5 16C15.5 14.5 15.5 16 15.5 16
           C15.5 16 16.5 13 18 12
           C17 14 17.5 15.5 18 16.5
           C18.5 17.5 19.5 17 19.5 15.5
           C19.5 12.5 17.5 9.5 15 7Z"
        fill="#FFAA80"
        opacity="0.55"
      />

      {/* ── Wordmark ────────────────────────────────────────── */}
      <text
        x="31"
        y="24"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Arial, sans-serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="-0.3"
        fill="#E0E0E0"
      >
        AI Website Roaster
      </text>
    </svg>
  );
}
