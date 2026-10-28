import { CircleHelp, Eye, EyeOff, SearchX, TriangleAlert } from "lucide-react";
import { publicVisibilityState, type PublicProfileIdentity } from "@/lib/admin-public-visibility";
import type { PublicVisibility } from "@/lib/queries/admin-visibility";
import styles from "./PublicVisibilityBadge.module.css";

const icons = { visible: Eye, hidden: EyeOff, searchHidden: SearchX, incomplete: TriangleAlert, unknown: CircleHelp };

export default function PublicVisibilityBadge({ value, profile }: { value?: PublicVisibility | null; profile?: PublicProfileIdentity }) {
  const state = publicVisibilityState(value, profile);
  const Icon = icons[state.kind];
  return <span className={styles.badge} data-tone={state.tone} title={state.description}><Icon size={12} aria-hidden="true" />{state.label}</span>;
}
