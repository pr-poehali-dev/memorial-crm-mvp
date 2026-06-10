interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

const PADDING = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-5",
};

export default function AppCard({
  children,
  className = "",
  onClick,
  hover = false,
  padding = "md",
}: AppCardProps) {
  const base = [
    "bg-ui-bg border border-ui-border rounded-[var(--r-lg)]",
    PADDING[padding],
    hover || onClick ? "transition-shadow hover:shadow-sm cursor-pointer" : "",
    className,
  ].join(" ");

  if (onClick) {
    return (
      <div role="button" tabIndex={0} onClick={onClick} onKeyDown={e => e.key === "Enter" && onClick()} className={base}>
        {children}
      </div>
    );
  }

  return <div className={base}>{children}</div>;
}
