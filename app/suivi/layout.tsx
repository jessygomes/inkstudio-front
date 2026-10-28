import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Votre suivi après la séance",
  description: "Partagez votre photo et votre retour avec votre salon.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function FollowUpLayout({ children }: { children: ReactNode }) { return children; }
