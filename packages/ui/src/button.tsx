import { clsx } from "clsx";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-red-600 text-white shadow-lg shadow-black/30 hover:bg-red-700",
  secondary: "bg-white text-zinc-950 ring-1 ring-white/20 hover:bg-red-50 hover:text-red-700",
  danger: "bg-zinc-950 text-white shadow-sm shadow-zinc-200 hover:bg-red-700",
  ghost: "bg-transparent text-zinc-200 hover:bg-white/10 hover:text-white"
};

const buttonBase = "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

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
