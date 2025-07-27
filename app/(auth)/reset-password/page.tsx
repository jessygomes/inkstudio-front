import ResetPasswordForm from "@/components/Auth/Form/ResetPasword";
import { getAuthenticatedUser } from "@/lib/auth.server";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  try {
    // Si l'utilisateur est connecté, on le redirige
    await getAuthenticatedUser();
    redirect("/dashboard");
  } catch {
    // L'utilisateur n'est pas connecté, on affiche le formulaire
    return <ResetPasswordForm />;
  }
}
