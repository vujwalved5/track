import type { Metadata, Viewport } from 'next'
import { Kalam } from 'next/font/google'
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister'
import './globals.css'

const kalam = Kalam({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-kalam',
  display: 'swap',
  adjustFontFallback: true,
  fallback: ['cursive'],
})

export const viewport: Viewport = {
  themeColor: '#211b16',
}

export const metadata: Metadata = {
  title: 'Memorable Moments',
  description: 'A private, book-like digital journal.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Memorable Moments',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={kalam.variable}>
      <body className="bg-desk antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
