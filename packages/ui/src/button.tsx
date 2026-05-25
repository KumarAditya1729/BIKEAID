import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[#ff5a1f] text-white shadow-lg shadow-orange-950/30 hover:bg-[#ff6b35]",
  secondary: "bg-white text-[#16120f] ring-1 ring-black/5 hover:bg-orange-50 hover:text-[#f04b16]",
  danger: "bg-[#2a120d] text-orange-100 ring-1 ring-orange-500/25 hover:bg-red-700 hover:text-white",
  ghost: "bg-transparent text-zinc-200 hover:bg-white/10 hover:text-white"
};

const buttonBase = "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ className, icon, children, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        buttonBase,
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function LinkButton({ className, icon, children, variant = "primary", ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { icon?: ReactNode; variant?: ButtonVariant }) {
  return (
    <a className={clsx(buttonBase, variants[variant], className)} {...props}>
      {icon}
      {children}
    </a>
  );
}
