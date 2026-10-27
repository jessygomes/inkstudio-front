import { CreationPageHeader } from "@/components/Shared/CreationWorkspace";
import PiercingManager from "@/components/Application/MonCompte/PiercingManager";

export default function PiercingPage() {
  return (
    <main className="wrapper-global pb-24 pt-5 lg:pb-8">
      <div className="w-full">
        <CreationPageHeader category="Mon compte" categoryHref="/mon-compte" context="Catalogue piercing" title="Vos prestations de piercing" description="Organisez votre catalogue par zone, définissez vos tarifs et choisissez les prestations disponibles à la réservation." backHref="/mon-compte" backLabel="Retour à mon compte" />

        <div className="min-w-0">
          <PiercingManager />
        </div>
      </div>
    </main>
  );
}
