import { useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { getPalette, gradientStops, Palette } from './palettes';

/** The active colour identity. Re-renders only when the player switches theme. */
export function useTheme(): Palette {
  const paletteId = useSettingsStore((s) => s.paletteId);
  return useMemo(() => getPalette(paletteId), [paletteId]);
}

export function useGradient(): [string, string, string] {
  const palette = useTheme();
  return useMemo(() => gradientStops(palette), [palette]);
}

/** False when the player has turned decorative motion off. */
export function useMotion(): boolean {
  return useSettingsStore((s) => s.motionEnabled);
}
