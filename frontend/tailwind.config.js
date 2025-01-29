/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      typography: {
        invert: {
          css: {
            '--tw-prose-body': 'var(--text)',
            '--tw-prose-headings': 'var(--text)',
            '--tw-prose-links': 'var(--primary)',
            '--tw-prose-bold': 'var(--text)',
            '--tw-prose-bullets': 'var(--text-secondary)',
            '--tw-prose-quotes': 'var(--text-secondary)',
            '--tw-prose-code': 'var(--text)',
            '--tw-prose-hr': 'var(--border)',
            '--tw-prose-th-borders': 'var(--border)',
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
