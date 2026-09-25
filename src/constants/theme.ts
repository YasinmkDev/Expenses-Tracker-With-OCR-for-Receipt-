/** Ledger visual system — playful pastel finance shelf. */

export const Palette = {
  grape: '#5B00ED',
  grapeDeep: '#3F0791',
  grapeSoft: '#CAC4F4',
  lilac: '#DAD9FF',
  aqua: '#BFEDFE',
  magenta: '#E30BA6',
  white: '#FFFFFF',
  ink: '#3F0791',
  inkSoft: '#685BA1',
  midnight: '#190A3D',
  mint: '#B9F4D2',
  mintInk: '#146B4D',
  peach: '#FFD7C7',
  peachInk: '#A5462C',
  yellow: '#FFE58A',
  line: '#B9B2E8',
} as const;

export const Colors: Record<string, any> = {
  background: Palette.lilac,
  surface: Palette.aqua,
  surfaceCard: Palette.white,
  surfaceElevated: Palette.white,
  surfaceHighlight: Palette.grapeSoft,
  backgroundSelected: Palette.grapeSoft,
  text: Palette.ink,
  primary: Palette.grape,
  primaryLight: Palette.grapeDeep,
  primaryMuted: Palette.grapeSoft,
  primaryDark: Palette.grapeDeep,
  gold: Palette.yellow,
  goldMuted: '#FFF6C8',
  rust: Palette.magenta,
  rustMuted: '#FAD5EF',
  textPrimary: Palette.ink,
  textSecondary: Palette.inkSoft,
  textMuted: '#766FA1',
  borderLight: Palette.line,
  borderAccent: Palette.grape,
  spruceDeepest: Palette.midnight,
  spruce: Palette.grape,
  spruceElevated: Palette.grapeDeep,
  onSpruce: Palette.white,
  onSpruceMuted: '#E6DEFF',
  mint: Palette.mint,
  info: Palette.grapeDeep,
  infoSoft: Palette.aqua,
  warm: Palette.peachInk,
  warmSoft: Palette.peach,
  light: {
    background: Palette.white,
    backgroundElement: Palette.lilac,
    text: Palette.ink,
  },
  dark: {
    background: Palette.midnight,
    backgroundElement: Palette.grapeDeep,
    text: Palette.white,
  },
} as const;

export const Fonts = {
  sans: 'System',
  mono: 'System',
} as const;

export type ThemeColor = string;

export const OnAccent = Palette.white;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const MaxContentWidth = 720;

export const Radius = { surface: 25, chip: 999, pill: 999, full: 999, button: 20, control: 52 } as const;

export const Typography = {
  fontFamily: { mono: 'System', sans: 'System' },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.2 },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '700' as const, letterSpacing: 0.8 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const, letterSpacing: 0 },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '700' as const, letterSpacing: 0 },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '700' as const, letterSpacing: -0.2 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '800' as const, letterSpacing: -0.4 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '800' as const, letterSpacing: -0.8 },
  numeric: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -0.8 },
  display: { fontSize: 42, lineHeight: 44, fontWeight: '800' as const, letterSpacing: -1 },
} as const;

export const Motion = {
  duration: { fast: 140, base: 220, entrance: 280, slow: 320 },
  pressScale: 0.97,
  cardPressScale: 0.985,
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
  stagger: 55,
} as const;

export const Hairline = { borderWidth: 1, borderColor: Colors.borderLight } as const;

export const Gradients = {
  grape: [Palette.magenta, Palette.grape],
  sky: [Palette.aqua, Palette.lilac],
} as const;

export const Shadows = {
  card: { shadowColor: Palette.grapeDeep, shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 4 },
} as const;

export const OnDark = Palette.white;
export const OnAccentText = Palette.white;

// Backwards-compatible alias used by older screens.
export const OnAccentLegacy = Palette.white;

export const Theme = { Palette, Colors, Spacing, Radius, Typography, Motion, Hairline, Gradients, Shadows };
export default Theme;
