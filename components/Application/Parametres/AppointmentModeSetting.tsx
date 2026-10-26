"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";
export default function AppointmentModeSetting(_props: { userId: string | null; saasPlan: string | null }) {
  const { data: session } = useSession();
  if (session?.user?.role !== "user_tatoueur") return null;
  return <section className="rounded-2xl border border-white/10 p-5"><h3 className="font-semibold">Autorisations des salons</h3><p className="mt-2 text-sm text-white/60">Choisissez séparément les autorisations accordées à chaque salon et validez vos jours de présence depuis votre compte.</p><Link href="/mon-compte#equipe" className="mt-4 inline-block text-sm underline">Gérer mes salons et leurs autorisations</Link></section>;
}
