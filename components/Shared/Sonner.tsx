"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "w-[min(92vw,420px)] rounded-2xl bg-linear-to-br from-noir-500/95 to-noir-700/95 text-white backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.45)] font-one px-4 py-4 flex items-center gap-2 font-one border",
          title: "text-white tracking-wide font-one text-xs",
          description: "text-white/75 text-xs font-one",
          success:
            "border-tertiary-400/35 bg-linear-to-r from-tertiary-500/70 to-tertiary-400/95",
          error:
            "border-red-400/35 bg-linear-to-r from-red-900/70 to-red-800/95",
          warning:
            "border-orange-400/35 bg-linear-to-br from-orange-500/20 to-noir-700/95",
          info:
            "border-tertiary-400/35 bg-linear-to-br from-tertiary-500/20 to-tertiary-400/95",
          loading:
            "border-white/20 bg-linear-to-br from-white/10 to-noir-700/95",
          actionButton:
            "bg-linear-to-r from-tertiary-400 to-tertiary-500 text-white border-0 rounded-xl px-3 py-1.5 text-xs font-one",
          cancelButton:
            "bg-white/10 text-white/80 border border-white/15 rounded-xl px-3 py-1.5 text-xs font-one",
          closeButton:
            "bg-white/10 text-white/70 border border-white/20 rounded-full hover:bg-white/20 hover:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
