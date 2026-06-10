import { ButtonHTMLAttributes, forwardRef } from "react";
import Icon from "@/components/ui/icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:   "bg-brand text-white hover:bg-brand-hover",
  secondary: "bg-ui-bg-soft text-ui-text border border-ui-border hover:bg-ui-border",
  ghost:     "text-ui-muted hover:text-ui-text hover:bg-ui-bg-soft",
  danger:    "bg-danger text-white hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "text-[11px] px-3 py-1.5 gap-1.5",
  md: "text-[13px] px-4 py-2.5 gap-2",
  lg: "text-[14px] px-5 py-3 gap-2.5",
};

const ICON_SIZES: Record<Size, number> = { sm: 12, md: 14, lg: 16 };

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  children,
  className = "",
  disabled,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-semibold rounded-[var(--r-md)] transition-all shrink-0",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Icon name="Loader2" size={ICON_SIZES[size]} className="animate-spin" />
      ) : icon ? (
        <Icon name={icon} size={ICON_SIZES[size]} />
      ) : null}
      {children}
      {iconRight && !loading && (
        <Icon name={iconRight} size={ICON_SIZES[size]} />
      )}
    </button>
  );
});

AppButton.displayName = "AppButton";
export default AppButton;
