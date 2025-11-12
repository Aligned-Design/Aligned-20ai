/**
 * Dashboard System Layout Tokens
 * 
 * Canonical layout configuration for all dashboards.
 * Ensures consistent spacing, sizing, and breakpoints across the entire system.
 * 
 * All values consume design tokens from tokens.css
 */

export const LayoutTokens = {
  // Grid Configuration
  grid: {
    cols: 12,
    gutterDesktop: 24, // px
    gutterTablet: 16,  // px
    gutterMobile: 12,  // px
  },

  // Card Heights (px)
  cardHeights: {
    xs: 120,
    sm: 180,
    md: 280,
    lg: 360,
    xl: 480,
  },

  // Breakpoints (px)
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
    wide: 1280,
  },

  // Standard Spacing (uses CSS vars)
  spacing: {
    xs: 'var(--spacing-xs)',    // 4px
    sm: 'var(--spacing-sm)',    // 8px
    md: 'var(--spacing-md)',    // 16px
    lg: 'var(--spacing-lg)',    // 24px
    xl: 'var(--spacing-xl)',    // 32px
    '2xl': 'var(--spacing-2xl)', // 40px
    '3xl': 'var(--spacing-3xl)', // 48px
    '4xl': 'var(--spacing-4xl)', // 64px
  },

  // Card Styling
  card: {
    radius: 'var(--radius-xl)',         // 12px
    shadow: 'var(--shadow-base)',       // Elevation 1
    border: 'var(--color-border)',
    borderDark: 'var(--color-slate-600)',
    background: 'var(--color-surface)',
    backgroundDark: 'var(--color-dark-surface)',
  },

  // Typography Scale (from tokens)
  typography: {
    fontFamily: 'var(--font-family)', // Inter
    h1: 'var(--font-size-h1)',       // 32px
    h2: 'var(--font-size-h2)',       // 24px
    h3: 'var(--font-size-h3)',       // 20px
    bodyLg: 'var(--font-size-body-lg)', // 16px
    body: 'var(--font-size-body)',   // 14px
    bodySm: 'var(--font-size-body-sm)', // 12px
    label: 'var(--font-size-label)', // 12px
  },

  // Standard Colors
  colors: {
    primary: 'var(--color-primary)',
    surface: 'var(--color-surface)',
    foreground: 'var(--color-foreground)',
    border: 'var(--color-border)',
    muted: 'var(--color-muted)',
    subtle: 'var(--color-subtle)',
  },

  // Header Anatomy
  header: {
    height: 64,              // px
    paddingX: 24,           // px
    paddingY: 16,           // px
    gap: 16,                // gap between elements
  },

  // Filter Bar
  filterBar: {
    height: 48,
    gap: 12,
  },

  // Dashboard Variants
  variants: {
    standard: 'standard',       // Full auth access
    readOnly: 'read-only',      // Client portal (no edit)
    demo: 'demo',               // Marketing preview
  },
} as const;

export type DashboardVariant = typeof LayoutTokens.variants[keyof typeof LayoutTokens.variants];
export type CardHeight = keyof typeof LayoutTokens.cardHeights;
