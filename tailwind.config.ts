import type { Config } from 'tailwindcss'
import { colors } from './lib/tokens'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        desk:           colors.desk,
        paper:          colors.paper,
        ink:            colors.ink,
        redpen:         colors.redpen,
        highlighter:    colors.highlighter,
        oxblood:        colors.oxblood,
        'oxblood-dark': colors.oxbloodDark,
        oxbloodDark:    colors.oxbloodDark,
        gold:           colors.gold,
        kraft:          colors.kraft,
        orange:         colors.orange,
      },
      fontFamily: {
        hand:  ['var(--font-kalam)', 'cursive'],
        cover: ['var(--font-cormorant)', 'serif'],
      },
      spacing: {
        grid: '22px',
      },
    },
  },
  plugins: [],
}

export default config
