/**
 * Design tokens — the single source of scale, rhythm and motion.
 * Colour lives in palettes.ts because it is user-swappable; everything
 * here is fixed across themes so the app keeps one physical identity.
 */

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  pill: 999,
} as const;

export const font = {
  regular: 'Sora_400Regular',
  medium: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  black: 'Sora_800ExtraBold',
} as const;

/** Type ramp. Every text style in the app comes from here. */
export const type = {
  display: { fontFamily: font.black, fontSize: 40, lineHeight: 44, letterSpacing: -1.4 },
  title: { fontFamily: font.black, fontSize: 30, lineHeight: 35, letterSpacing: -1 },
  heading: { fontFamily: font.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  subheading: { fontFamily: font.medium, fontSize: 18, lineHeight: 25, letterSpacing: -0.3 },
  body: { fontFamily: font.regular, fontSize: 16, lineHeight: 24, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: font.medium, fontSize: 16, lineHeight: 24, letterSpacing: -0.1 },
  label: { fontFamily: font.medium, fontSize: 13, lineHeight: 18, letterSpacing: 0.8 },
  caption: { fontFamily: font.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  code: { fontFamily: font.black, fontSize: 44, lineHeight: 52, letterSpacing: 10 },
} as const;

/** Motion. Springs for anything the finger touches, timings for ambience. */
export const motion = {
  spring: {
    snappy: { damping: 18, stiffness: 220, mass: 0.9 },
    gentle: { damping: 22, stiffness: 130, mass: 1 },
    bouncy: { damping: 11, stiffness: 190, mass: 0.9 },
  },
  duration: {
    fast: 160,
    base: 260,
    slow: 420,
    reveal: 620,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  glow: {
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };
