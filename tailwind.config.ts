import type { Config } from 'tailwindcss';

/**
 * dcyfr.tech Tailwind v3 config — semantic-var bridge only.
 *
 * Legacy `./tailwind.preset.ts` retired 2026-04-18 under
 * openspec/changes/dcyfr-palette-class-migration (Wave 2). All 108 call
 * sites migrated to semantic-var utilities.
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        secure: {
          DEFAULT: 'hsl(var(--secure))',
          foreground: 'hsl(var(--secure-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Without these the `font-sans` / `font-mono` / `font-serif` utilities
      // emit Tailwind's stock stacks rather than the identity vars, so
      // `.theme-dcyfr-tech` is not authoritative for anything carrying them.
      // Nothing moves today: `<body>` has no font utility, so the base rule
      // reading --font-sans already wins, and the two `font-mono` uses in
      // .prose-dcyfr resolve to the same first available face either way.
      // It matters because the identity block cannot otherwise change the
      // type of the site it names. Same gap found at dcyfr-bot and
      // dcyfr-codes, where it did have a visible consequence.
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        brand: 'var(--ease-brand)',
      },
    },
  },
  plugins: [],
};

export default config;
