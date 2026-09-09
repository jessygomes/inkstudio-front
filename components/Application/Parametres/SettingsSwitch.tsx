import { ChangeEventHandler } from "react";

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
    <label className="relative inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed" title={`Cliquer pour ${checked ? "désactiver" : "activer"}`}>
      {busy ? (
        <span role="status" className="text-xs text-white/55">Enregistrement…</span>
      ) : (
        <span className="text-xs font-semibold text-white">
          {status}
        </span>
      )}
      <input type="checkbox" role="switch" aria-label={`${label} : ${status}. Cliquer pour ${checked ? "désactiver" : "activer"}`} checked={checked} onChange={onChange}
        disabled={disabled || busy} className="peer sr-only" />
      <span aria-hidden="true" className="relative h-6 w-11 rounded-full border border-white/15 bg-white/15 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-tertiary-500 peer-checked:after:translate-x-5 peer-disabled:opacity-50 peer-focus-visible:ring-2 peer-focus-visible:ring-tertiary-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-noir-700" />
    </label>
  );
}
