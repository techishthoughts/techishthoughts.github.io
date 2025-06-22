/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.{md,html}",
    "./assets/js/**/*.{ts,tsx,js,jsx}",
    "./static/**/*.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6700', // Main brand color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.12)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.7',
            'h1, h2, h3, h4, h5, h6': {
              color: 'var(--color-text-primary)',
              fontFamily: 'Georgia, serif',
              fontWeight: '700',
              lineHeight: '1.2',
            },
            'p': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'a': {
              color: 'var(--color-text-link)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            'strong': {
              color: 'var(--color-text-primary)',
              fontWeight: '600',
            },
            'code': {
              color: '#3b82f6',
              backgroundColor: 'var(--color-bg-muted)',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
              fontWeight: '500',
            },
            'pre': {
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-light)',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              border: 'none',
              color: 'var(--color-text-primary)',
            },
            'blockquote': {
              borderLeftWidth: '4px',
              borderLeftColor: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '1rem 1.5rem',
              borderRadius: '0 0.5rem 0.5rem 0',
              fontStyle: 'italic',
              margin: '1.5rem 0',
            },
            'ul, ol': {
              paddingLeft: '1.5rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'li': {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
            },
            'img': {
              borderRadius: '0.5rem',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'table': {
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid var(--color-border-light)',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'th, td': {
              border: '1px solid var(--color-border-light)',
              padding: '0.75rem 1rem',
              textAlign: 'left',
            },
            'th': {
              backgroundColor: 'var(--color-bg-secondary)',
              fontWeight: '600',
            },
          },
        },
        lg: {
          css: {
            fontSize: '1.125rem',
            lineHeight: '1.8',
            'h1': {
              fontSize: '2.5rem',
            },
            'h2': {
              fontSize: '2rem',
            },
            'h3': {
              fontSize: '1.75rem',
            },
            'h4': {
              fontSize: '1.5rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
