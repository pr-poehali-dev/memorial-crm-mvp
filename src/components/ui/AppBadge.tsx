type Variant = "brand" | "success" | "warning" | "danger" | "neutral" | "active";

interface AppBadgeProps {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}

const VARIANTS: Record<Variant, string> = {
  brand:   "bg-brand-light text-brand border-brand-border",
  success: "bg-success-light text-success border-success-border",
  warning: "bg-warning-light text-warning border-[var(--c-warning-light)]",
  danger:  "bg-danger-light text-danger border-[var(--c-danger-light)]",
  neutral: "bg-ui-bg-soft text-ui-muted border-ui-border",
  active:  "bg-brand text-white border-brand",
};

export default function AppBadge({ variant = "neutral", children, className = "" }: AppBadgeProps) {
  return (
    <span className={[
      "inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap",
      VARIANTS[variant],
      className,
    ].join(" ")}>
      {children}
    </span>
  );
}
