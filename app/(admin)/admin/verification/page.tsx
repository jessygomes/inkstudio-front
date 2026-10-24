import Link from "next/link";
import { FiChevronLeft, FiFileText } from "react-icons/fi";
import PendingVerificationList from "../../../../components/Admin/PendingVerificationList";
import PageHeader from "@/components/Admin/AdminPageHeader";

export default function VerificationPage() {
  return (
    <div className="admin-page">
      <section className="w-full space-y-3 pt-4">
        <PageHeader
          icon={<FiFileText size={20} className="text-tertiary-400" />}
          title="Vérifications professionnelles" description="Salons et indépendants : distinguez le statut du compte des pièces restant à examiner. Retrouvez les dossiers déjà validés dans les fiches utilisateurs."
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15 font-one"
          >
            <FiChevronLeft size={14} /> Retour
          </Link>
        </PageHeader>

        <div className="">
          <PendingVerificationList />
        </div>
      </section>
    </div>
  );
}
