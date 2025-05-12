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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-primary-500 p-6 rounded-[20px] w-full max-w-[400px] text-white font-one">
        <h2 className="text-lg font-bold mb-4 text-center">
          Supprimer {tatoueurName} ?
        </h2>
        <p className="text-sm text-center mb-6">
          Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce
          tatoueur ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="text-xs p-2 rounded-[20px] bg-gray-700 text-white hover:bg-gray-600"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="text-xs p-2 rounded-[20px] bg-red-700 hover:bg-red-800 text-white"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
