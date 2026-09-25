/**
 * Ledger design system — "dark spruce forest meets warm cream paper".
 *
 * The screens across the app import the flat `Colors` object and reference a
 * stable set of keys (background, surface, surfaceCard, primary, textPrimary,
 * etc). To re-skin the whole product without touching business logic we keep
 * those keys but remap their values to the spruce + cream palette below.
 *
 * New tokens (Spruce, Accent, Spacing, Radius, Typography, Motion) are additive
 * and used by the shared component library in `components/ui`.
 */

// ---------------------------------------------------------------------------
// Raw palette (source of truth for every color in the app)
// ---------------------------------------------------------------------------
export const Palette = {
  // Dark spruce family (high-impact surfaces, hero cards, headers)
  spruceDeepest: '#00191C',
  spruce: '#032125',
  spruceElevated: '#0B363B',

  // Cream / paper family (default readable canvas)
  cream: '#FFFCF6',
  white: '#FFFFFF',
  mutedSurface: '#FAFAFA',
  warmSurface: '#F4F1EA',

  // Text
  ink: '#032125', // primary text on light
  inkSecondary: '#354D51', // secondary text on light
  inkMuted: '#5F7377', // muted text on light
  onDark: '#FFFCF6', // text on spruce
  onDarkMuted: '#A1C2C6', // muted text/icon on spruce

  // Accents
  mint: '#ABFFAE', // primary interactive accent
  mintSoft: '#EAFDE8', // soft success background
  green: '#178E57', // legible green for fills + accent text
  greenDeep: '#0B6B3F', // green accent text on light
  info: '#123A88', // blue text accent
  infoSoft: '#E2F4FF', // soft information background
  warm: '#863D1C', // orange text accent
  warmSoft: '#FDF0E9', // soft warm feature background
  amber: '#B06A1B', // warning
  red: '#C1443B', // destructive
  redSoft: '#FBEAE8',

  // Lines
  border: '#EBEBEB',
  borderStrong: '#E0DED6',
  ring: '#ABFFAE',
} as const;

// ---------------------------------------------------------------------------
// Colors — legacy-compatible keys, remapped to the new palette.
// Every existing screen/component reads from here.
// ---------------------------------------------------------------------------
export const Colors = {
  // Canvas + surfaces
  background: Palette.cream,
  surface: Palette.mutedSurface,
  surfaceCard: Palette.white,
  surfaceElevated: '#F3F2EC',
  surfaceHighlight: '#DCE6DD',

  // Brand accents (primary = fill/bg with dark text, primaryLight = accent text)
  primary: Palette.green,
  primaryLight: Palette.greenDeep,
  primaryMuted: Palette.mintSoft,
  primaryDark: Palette.spruceElevated,

  // Signal accents
  gold: Palette.amber,
  goldMuted: Palette.warmSoft,
  rust: Palette.red,
  rustMuted: Palette.redSoft,

  // Typography + borders
  textPrimary: Palette.ink,
  textSecondary: Palette.inkSecondary,
  textMuted: Palette.inkMuted,
  borderLight: Palette.border,
  borderAccent: Palette.ring,

  // Spruce surfaces (used explicitly by hero areas / dark sections)
  spruceDeepest: Palette.spruceDeepest,
  spruce: Palette.spruce,
  spruceElevated: Palette.spruceElevated,
  onSpruce: Palette.onDark,
  onSpruceMuted: Palette.onDarkMuted,
  mint: Palette.mint,

  // Semantic tints
  info: Palette.info,
  infoSoft: Palette.infoSoft,
  warm: Palette.warm,
  warmSoft: Palette.warmSoft,
} as const;

// Dark text that sits on the mint/green accent buttons throughout the app.
export const OnAccent = '#00181A';

// ---------------------------------------------------------------------------
// Spacing — 4px system
// ---------------------------------------------------------------------------
export const Spacing = {
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

// ---------------------------------------------------------------------------
// Radius — 2px surfaces, pill for buttons/chips
// ---------------------------------------------------------------------------
export const Radius = {
  surface: 2, // cards, inputs, list rows, feature surfaces
  chip: 999,
  pill: 999,
  full: 999,
} as const;

// ---------------------------------------------------------------------------
// Typography — clean sans, mostly medium weight, editorial titles
// ---------------------------------------------------------------------------
export const Typography = {
  fontFamily: {
    // Kept for backwards compatibility with older references.
    mono: 'System',
    sans: 'System',
  },
  // Reusable text tokens: { fontSize, lineHeight, fontWeight, letterSpacing }
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '500' as const, letterSpacing: 0.2 },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.4 },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const, letterSpacing: 0 },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0 },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: -0.2 },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const, letterSpacing: -0.4 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '600' as const, letterSpacing: -0.6 },
  numeric: { fontSize: 34, lineHeight: 40, fontWeight: '600' as const, letterSpacing: -0.8 },
} as const;

// ---------------------------------------------------------------------------
// Motion — centralized durations/easing for the animation system
// ---------------------------------------------------------------------------
export const Motion = {
  duration: {
    fast: 140,
    base: 220,
    entrance: 280,
    slow: 320,
  },
  pressScale: 0.97,
  cardPressScale: 0.985,
  spring: { damping: 18, stiffness: 180, mass: 0.9 },
  stagger: 55,
} as const;

// ---------------------------------------------------------------------------
// Hairline "elevation" — thin borders instead of heavy shadows
// ---------------------------------------------------------------------------
export const Hairline = {
  borderWidth: 1,
  borderColor: Colors.borderLight,
} as const;
