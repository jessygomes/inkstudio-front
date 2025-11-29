import RDV from "@/components/Application/RDV/RDV";

export default function RendezVousPage() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-20 pb-10 lg:pb-0">
      <div className="flex relative gap-8 w-full mt-4 lg:mt-23">
        <RDV />
      </div>
    </div>
  );
}
