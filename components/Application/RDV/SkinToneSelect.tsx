"use client";

export type SkinToneOption = {
  value:
    | "tres_claire"
    | "claire"
    | "claire_moyenne"
    | "mate"
    | "foncee"
    | "tres_foncee";
  label: string;
  previewHex: string;
};

type SkinToneSelectProps = {
  options: SkinToneOption[];
  value?: SkinToneOption["value"];
  onChange: (value?: SkinToneOption["value"]) => void;
  error?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

export default function SkinToneSelect({
  options,
  value,
  onChange,
  error,
  required = false,
  loading = false,
  disabled = false,
}: SkinToneSelectProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-white/70 font-one">
          Teinte de peau {required ? "*" : ""}
        </label>
        {!loading && options.length > 0 && (
          <span className="text-[11px] text-white/45 font-one">
            {options.length} teintes disponibles
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-tertiary-400 border-t-transparent mr-2"></div>
          <span className="text-white/70 text-xs font-one">
            Chargement des teintes...
          </span>
        </div>
      ) : options.length > 0 ? (
        <div
          role="radiogroup"
          aria-label="Teinte de peau"
          className="flex flex-wrap gap-3"
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onChange(option.value)}
                className={`text-left rounded-xl border p-3 transition-all duration-200 ${
                  isSelected
                    ? "border-tertiary-400 bg-tertiary-500/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-10 w-10 rounded-full border border-white/20 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: option.previewHex }}
                    aria-hidden="true"
                  />
                  {/* <div className="min-w-0">
                    <p className="text-sm text-white font-one font-medium truncate">
                      {option.label}
                    </p>
                    <p className="text-[11px] text-white/45 font-one uppercase tracking-wide">
                      {option.previewHex}
                    </p>
                  </div> */}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-orange-300 text-xs font-one">
            Aucune teinte de peau disponible pour le moment.
          </p>
        </div>
      )}

      {error && <p className="text-red-300 text-xs">{error}</p>}
    </div>
  );
}