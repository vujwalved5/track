import type { Metadata } from 'next'
import {
  DM_Sans,
  Fraunces,
  Barlow_Condensed,
  Caveat,
  Italiana,
  Oswald,
  Nothing_You_Could_Do,
} from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

const italiana = Italiana({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-italiana',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
})

const nothing = Nothing_You_Could_Do({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-nothing',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TRACK — Atlas of Everyday',
  description: 'A quieter space to track your days, notice your progress, and build habits that last.',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${dmSans.variable} ${fraunces.variable} ${barlowCondensed.variable} ${caveat.variable} ${italiana.variable} ${oswald.variable} ${nothing.variable} font-sans min-h-screen text-[#172536]`}
      style={
        {
          '--ink': '#172536',
          '--chalk': '#F4EFE4',
          '--tobacco': '#60432F',
          '--brass': '#B68A53',
          '--clay': '#BD634A',
          '--sage': '#899783',
          '--forest': '#30483D',
          '--blue': '#8799A7',
          '--marigold': '#D2A75D',
          '--plum': '#79677A',
          '--line': 'rgba(244, 239, 228, 0.21)',
          backgroundColor: '#F4EFE4',
        } as React.CSSProperties
      }
    >
      <style>{`
        .font-public-sans { font-family: var(--font-dm-sans), sans-serif; }
        .font-public-serif { font-family: var(--font-fraunces), serif; }
        .font-public-condensed { font-family: var(--font-barlow-condensed), sans-serif; }
        .font-public-hand { font-family: var(--font-caveat), cursive; }
        .font-public-display { font-family: var(--font-italiana), serif; }
        .font-public-headline { font-family: var(--font-oswald), sans-serif; }
        .font-public-script { font-family: var(--font-nothing), cursive; }

        .lift-card {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lift-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px -8px rgba(23, 37, 54, 0.12);
        }

        .press-btn {
          transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }
        .press-btn:hover {
          transform: translateY(-1.5px);
          box-shadow: 0 6px 16px -4px rgba(23, 37, 54, 0.15);
        }
        .press-btn:active {
          transform: translateY(1px) scale(0.985);
          box-shadow: 0 2px 4px -1px rgba(23, 37, 54, 0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .lift-card,
          .press-btn {
            transform: none !important;
            transition: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  )
}
