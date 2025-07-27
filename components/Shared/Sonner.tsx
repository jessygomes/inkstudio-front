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
        classNames: {
          toast:
            "group toast group-[.toaster]:w-[300px] group-[.toaster]:bg-gradient-to-r from-[#8f1728] to-[#4d0c10] group-[.toaster]:text-white font-one group-[.toaster]:border-none group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-white font-base",
          actionButton:
            "group-[.toast]:bg-secondary-500 group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
