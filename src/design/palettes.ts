/**
 * Swappable colour identities. Each palette keeps the same structural roles
 * so every screen restyles coherently when the player picks a new one.
 */

export interface Palette {
  id: string;
  name: string;
  blurb: string;
  /** Page background, darkest layer. */
  bg: string;
  /** Raised background used behind sheets and the splash. */
  bgElev: string;
  /** Glass surface fill and its pressed state. */
  surface: string;
  surfacePressed: string;
  stroke: string;
  strokeStrong: string;
  text: string;
  textDim: string;
  textFaint: string;
  /** Three gradient stops — the brand signature. */
  accent: string;
  accentMid: string;
  accentEnd: string;
  /** Foreground that sits on top of an accent fill. */
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
}

export const PALETTES: Palette[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    blurb: 'The house look',
    bg: '#0B0E1A',
    bgElev: '#12172B',
    surface: 'rgba(255,255,255,0.05)',
    surfacePressed: 'rgba(255,255,255,0.10)',
    stroke: 'rgba(255,255,255,0.10)',
    strokeStrong: 'rgba(255,255,255,0.20)',
    text: '#F4F6FF',
    textDim: '#9AA3C0',
    textFaint: '#5F6784',
    accent: '#FF5470',
    accentMid: '#8B6CFF',
    accentEnd: '#22D3EE',
    onAccent: '#0B0E1A',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
  },
  {
    id: 'ember',
    name: 'Ember',
    blurb: 'Warm and accusatory',
    bg: '#140B0A',
    bgElev: '#221210',
    surface: 'rgba(255,236,225,0.055)',
    surfacePressed: 'rgba(255,236,225,0.11)',
    stroke: 'rgba(255,225,210,0.11)',
    strokeStrong: 'rgba(255,225,210,0.22)',
    text: '#FFF3EC',
    textDim: '#C4A499',
    textFaint: '#8A6A5E',
    accent: '#FF8A3D',
    accentMid: '#FF4D4D',
    accentEnd: '#FFC93C',
    onAccent: '#1A0B06',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#FF6B6B',
  },
  {
    id: 'toxic',
    name: 'Toxic',
    blurb: 'Something is very wrong',
    bg: '#08130E',
    bgElev: '#0E2018',
    surface: 'rgba(220,255,238,0.05)',
    surfacePressed: 'rgba(220,255,238,0.10)',
    stroke: 'rgba(200,255,230,0.11)',
    strokeStrong: 'rgba(200,255,230,0.22)',
    text: '#EAFFF5',
    textDim: '#8FBFA8',
    textFaint: '#59806E',
    accent: '#39FF88',
    accentMid: '#00D9A5',
    accentEnd: '#C6FF3D',
    onAccent: '#04140C',
    success: '#39FF88',
    warning: '#FFD93D',
    danger: '#FF5470',
  },
  {
    id: 'ice',
    name: 'Ice',
    blurb: 'Cold interrogation',
    bg: '#080F1A',
    bgElev: '#0F1B2E',
    surface: 'rgba(225,242,255,0.05)',
    surfacePressed: 'rgba(225,242,255,0.10)',
    stroke: 'rgba(210,235,255,0.11)',
    strokeStrong: 'rgba(210,235,255,0.22)',
    text: '#EFF7FF',
    textDim: '#93AEC9',
    textFaint: '#5C7590',
    accent: '#38BDF8',
    accentMid: '#6366F1',
    accentEnd: '#A5F3FC',
    onAccent: '#04101C',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#FB7185',
  },
  {
    id: 'royal',
    name: 'Royal',
    blurb: 'Expensive betrayal',
    bg: '#0E0A18',
    bgElev: '#1A1330',
    surface: 'rgba(240,230,255,0.05)',
    surfacePressed: 'rgba(240,230,255,0.10)',
    stroke: 'rgba(230,215,255,0.11)',
    strokeStrong: 'rgba(230,215,255,0.22)',
    text: '#F6F1FF',
    textDim: '#A99BC7',
    textFaint: '#6E6190',
    accent: '#C084FC',
    accentMid: '#7C3AED',
    accentEnd: '#FDE68A',
    onAccent: '#100A1E',
    success: '#4ADE80',
    warning: '#FDE68A',
    danger: '#FB7185',
  },
];

export const DEFAULT_PALETTE_ID = PALETTES[0].id;

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** Gradient stop array in brand order — used by every gradient in the app. */
export function gradientStops(p: Palette): [string, string, string] {
  return [p.accent, p.accentMid, p.accentEnd];
}
