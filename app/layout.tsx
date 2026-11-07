import type { Metadata } from 'next'
import { Kalam, Cormorant_Garamond } from 'next/font/google'
import './globals.css'

const kalam = Kalam({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Memorable Moments',
  description: 'A private, book-like digital journal.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${kalam.variable} ${cormorant.variable}`}>
      <body className="bg-desk antialiased">
        {children}
      </body>
    </html>
  )
}
