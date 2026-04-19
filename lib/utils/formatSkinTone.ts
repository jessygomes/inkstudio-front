const skinToneMeta = {
  tres_claire: {
    label: "Très claire",
    previewHex: "#F6E3D4",
  },
  claire: {
    label: "Claire",
    previewHex: "#EAC7A7",
  },
  claire_moyenne: {
    label: "Claire à moyenne",
    previewHex: "#D7A980",
  },
  mate: {
    label: "Mate",
    previewHex: "#B87B52",
  },
  foncee: {
    label: "Foncée",
    previewHex: "#8B5A3C",
  },
  tres_foncee: {
    label: "Très foncée",
    previewHex: "#5A3A28",
  },
} as const;

export type SkinTone = keyof typeof skinToneMeta;

export function getSkinToneMeta(skin?: string | null) {
  if (!skin) {
    return null;
  }

  return skinToneMeta[skin as SkinTone] ?? null;
}

export function formatSkinTone(skin?: string | null) {
  return getSkinToneMeta(skin)?.label ?? skin ?? null;
}

export function getSkinTonePreviewHex(skin?: string | null) {
  return getSkinToneMeta(skin)?.previewHex ?? null;
}