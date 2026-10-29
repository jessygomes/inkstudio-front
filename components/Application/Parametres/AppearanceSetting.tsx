"use client";

import { useSyncExternalStore } from "react";
import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import SettingsSectionHeader from "./SettingsSectionHeader";
import styles from "./SettingsCard.module.css";
import appearance from "./AppearanceSetting.module.css";

const subscribe = () => () => {};

export default function AppearanceSetting() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  return (
    <div className={styles.card}>
      <SettingsSectionHeader
        title="Apparence de l’application"
        description="Choisissez le thème dans lequel vous préférez travailler."
        icon={Palette}
      />
      <div className={styles.body}>
        <fieldset className={appearance.options} disabled={!mounted}>
          <legend className="sr-only">Thème de l’application</legend>
          {([
            { value: "dark", label: "Sombre", description: "Fond noir et contrastes doux", icon: Moon },
            { value: "light", label: "Clair", description: "Gris clairs et nuances contrastées", icon: Sun },
          ] as const).map(({ value, label, description, icon: Icon }) => (
            <label key={value} className={appearance.option}>
              <input
                type="radio"
                name="appearance"
                value={value}
                checked={mounted && theme === value}
                onChange={() => setTheme(value)}
                className="sr-only"
              />
              <span className={appearance.preview} data-preview-theme={value} aria-hidden="true">
                <span className={appearance.previewSidebar}><i /><i /><i /></span>
                <span className={appearance.previewContent}><i /><span><i /><i /></span><i /></span>
              </span>
              <span className={appearance.caption}>
                <Icon size={16} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={styles.label}>{label}</span>
                  <span className={styles.note}>{description}</span>
                </span>
                <span className={appearance.radio} aria-hidden="true" />
              </span>
            </label>
          ))}
        </fieldset>
        <p className={styles.note}>Le changement est immédiat et votre choix est conservé dans ce navigateur.</p>
      </div>
    </div>
  );
}
