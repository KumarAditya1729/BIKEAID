import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-orange-600 text-white shadow-sm shadow-orange-200 hover:bg-orange-700",
  secondary: "bg-white text-zinc-950 ring-1 ring-zinc-200 hover:bg-orange-50 hover:text-orange-700",
  danger: "bg-red-600 text-white shadow-sm shadow-red-200 hover:bg-red-700",
  ghost: "bg-transparent text-zinc-700 hover:bg-orange-50 hover:text-orange-700"
};

export function Button({ className, icon, children, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
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
