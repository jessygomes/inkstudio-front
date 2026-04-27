type DeleteConfirmationModalProps = {
  tatoueurName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmationModal({
  tatoueurName,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="dashboard-embedded-panel rounded-2xl p-5 w-full max-w-md shadow-lg relative border border-white/15">
        <h2 className="text-lg font-semibold font-one text-white tracking-widest mb-4 border-b border-white/10 pb-2">
          Supprimer {tatoueurName} ?
        </h2>
        <p className="text-sm text-white font-one mb-4">
          Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce
          tatoueur ?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-[14px] border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20 font-medium font-one"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-[14px] px-6 py-2 bg-gradient-to-r from-tertiary-400 to-tertiary-500 hover:from-tertiary-500 hover:to-tertiary-600 text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed font-one text-xs"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
