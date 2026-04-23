type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[22px]",
};

export default function Logo({ size = "md" }: { size?: Size; iconOnly?: boolean }) {
  return (
    <span
      className={`font-bold text-[#1a1a1a] tracking-tight whitespace-nowrap ${SIZES[size]}`}
      style={{ fontFamily: "'Golos Text', sans-serif", letterSpacing: "0.06em" }}
    >
      ПАМЯТЬ
    </span>
  );
}

export function LogoCompact() {
  return (
    <span
      className="font-bold text-[#1a1a1a] text-[14px] tracking-tight whitespace-nowrap"
      style={{ fontFamily: "'Golos Text', sans-serif", letterSpacing: "0.06em" }}
    >
      ПАМЯТЬ
    </span>
  );
}
