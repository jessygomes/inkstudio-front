import Link from "next/link";
import { ReactNode } from "react";

const variants = {
  primary:
    "inline-flex min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-tertiary-400/30 bg-gradient-to-r from-tertiary-400 to-tertiary-500 px-4 py-2 text-xs font-medium text-white shadow-xl shadow-tertiary-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-tertiary-500 hover:to-tertiary-600 font-one disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "inline-flex min-w-[170px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/8 font-one disabled:opacity-50 disabled:pointer-events-none",
};

type BaseProps = {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
};

type ButtonProps = BaseProps & {
  href?: never;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
  disabled?: never;
  type?: never;
};

type DashboardButtonProps = ButtonProps | LinkProps;

export default function DashboardButton({
  variant = "primary",
  children,
  className,
  href,
  onClick,
  disabled,
  type = "button",
}: DashboardButtonProps) {
  const classes = `${variants[variant]}${className ? ` ${className}` : ""}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
