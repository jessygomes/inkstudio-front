import SalonAccount from "@/components/Application/MonCompte/SalonAccount";

export default function MonCompte() {
  return (
    <div className="min-h-screen bg-noir-700 flex flex-col items-center gap-4 px-3 lg:px-10 pb-10 lg:pb-0">
      <div className="flex relative gap-8 w-full mt-4 mb-10 xl:mb-0 xl:mt-23">
        <SalonAccount />
      </div>
    </div>
  );
}
