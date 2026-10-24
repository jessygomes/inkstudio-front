import { ChangeEventHandler } from "react";
import { LoaderCircle } from "lucide-react";

interface SettingsSwitchProps {
  label: string;
  checked: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  busy?: boolean;
}

export default function SettingsSwitch({ label, checked, onChange, disabled, busy }: SettingsSwitchProps) {
  const status = checked ? "Activé" : "Désactivé";

  return (
    <label className="relative inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed" title={`Cliquer pour ${checked ? "désactiver" : "activer"}`}>
      {busy ? (
        <span role="status" className="text-tertiary-400"><LoaderCircle size={13} className="animate-spin" /><span className="sr-only">Enregistrement…</span></span>
      ) : (
        <span className={`text-[10px] font-medium ${checked ? "text-tertiary-400" : "text-white/40"}`}>
          {status}
        </span>
      )}
      <input type="checkbox" role="switch" aria-label={`${label} : ${status}. Cliquer pour ${checked ? "désactiver" : "activer"}`} checked={checked} onChange={onChange}
        disabled={disabled || busy} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 rounded-full border border-white/15 bg-white/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-tertiary-500 peer-checked:after:translate-x-5 peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-tertiary-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-noir-700" />
    </label>
  );
}
