import SalonAccount from "@/components/Application/MonCompte/SalonAccount";

export default function MonCompte() {
  return (
    <div className="bg-noir-700 flex flex-col items-center justify-center gap-4">
      <div className="flex relative gap-8 w-full mt-24">
        <SalonAccount />
      </div>
    </div>
  );
}
