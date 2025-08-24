/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Limiter les couleurs aux essentielles
      colors: {
        mood: {
          primary: 'rgb(59 130 246)',
          secondary: 'rgb(239 246 255)',
          text: 'rgb(29 78 216)',
          accent: 'rgb(96 165 250)',
        }
      },
      // Limiter les animations aux nécessaires
      animation: {
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-mood': 'pulseMood 2s infinite',
      },
      // Limiter les espacements
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
  // Optimizations pour réduire la taille du bundle
  corePlugins: {
    // Désactiver les plugins non utilisés
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false,
  },
  // Purger les classes inutilisées
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    options: {
      safelist: [
        'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-gray-100',
        'text-blue-700', 'text-green-700', 'text-purple-700', 'text-orange-700', 'text-gray-700',
        'hover:bg-blue-200', 'hover:bg-green-200', 'hover:bg-purple-200',
        'ring-blue-400', 'ring-green-400', 'ring-purple-400',
      ]
    }
  }
};