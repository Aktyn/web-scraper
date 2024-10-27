/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '4xl': 'calc(var(--radius) * 4)',
        '3xl': 'calc(var(--radius) * 3)',
        '2xl': 'calc(var(--radius) * 2)',
        xl: 'calc(var(--radius) * 1.5)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) * 0.75)',
        sm: 'calc(var(--radius) * 0.5)',
        xs: 'calc(var(--radius) * 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      scale: {
        golden: '1.618',
        'golden-reverse': '0.618',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          focus: 'hsl(var(--destructive-focus))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        execution: {
          condition: {
            DEFAULT: 'hsl(var(--execution-condition))',
            foreground: 'hsl(var(--execution-condition-foreground))',
          },
          step: {
            DEFAULT: 'hsl(var(--execution-step))',
            foreground: 'hsl(var(--execution-step-foreground))',
          },
        },
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
