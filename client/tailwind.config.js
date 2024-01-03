import plugin from 'tailwindcss/plugin.js'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    container: false
  },
  theme: {
    extend: {
      colors: {
        'gray-text': 'var(--gray-text)',
        'dark-gray-text': 'var(--dark-gray-text)',
        'brown-background': 'var(--brown-background)',
        'mint-green-background': 'var(--mint-green-background)',
        'light-background': 'var(--light-background)',
        'light-text': 'var(--light-text)',
        'light-dashboard-heart-background': 'var(--light-dashboard-heart-background)',
        'light-dashboard-game-background': 'var(--light-dashboard-game-background)',
        'light-dashboard-bag-background': 'var(--light-dashboard-bag-background)',
        'light-primary': 'var(--light-primary)',
        'light-primary-background': 'var(--light-primary-background)',
        'light-secondary': 'var(--light-secondary)',
        'light-secondary-background': 'var(--light-secondary-background)',
        'light-accent': 'var(--light-accent)',
        'light-accent-background': 'var(--light-accent-background)',
        'gray-9a': 'var(--gray-9a)',
        'yellow-ffd': 'var(--yellow-ffd)',
        'dark-gray': 'var(--dark-gray)'
      },
      fontSize: {
        xxs: '0.625rem',
        '2xl': '1.602rem',
        '2.5xl': '1.688rem'
      },
      spacing: {
        3.5: '0.8125rem',
        7.5: '1.875rem',
        12.5: '3.125rem',
        14.5: '3.625rem',
        15: '3.75rem',
        19: '4.75rem',
        21: '5.25rem',
        23.5: '5.8975rem',
        25: '6.25rem',
        44: '11rem',
        50: '12.5rem',
        55: '13.75rem',
        94.5: '23.625rem'
      },
      width: {
        30.5: '7.625rem',
        54: '13.625rem'
      },
      maxWidth: {},
      height: {
        inherit: 'inherit'
      },
      text: {},
      letterSpacing: {},
      gap: {},
      borderWidth: {},
      borderRadius: {
        '2lg': '0.625rem'
      },
      boxShadow: {},
      screens: {
        xl: { min: '1280px', max: '1440px' }
      }
    }
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({})
    })
  ]
}
