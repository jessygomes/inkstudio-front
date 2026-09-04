import DrawingBoard from "@/components/Application/SuiviDessin/DrawingBoard";
import PageHeader from "@/components/Shared/PageHeader";
import { Palette } from "lucide-react";

export default function SuiviDessinPage() {
  return (
    <main className="min-h-screen bg-noir-700 px-3 pb-24 pt-4 lg:px-10">
      <PageHeader
        icon={<Palette size={16} className="text-tertiary-400" />}
        title="Suivi de dessin"
      />
      <DrawingBoard />
    </main>
  );
}
