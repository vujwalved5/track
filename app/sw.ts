/// <reference lib="webworker" />
/**
 * Serwist Service Worker for Memorable Moments
 * Memorable Moments — Phase 6 / Task 12 (Batch B)
 *
 * Rules:
 * - Serwist runtime caching for app shell and current month (opens offline).
 * - Caches static chunks, fonts, and book routes.
 * - CLEAR_CACHES message listener on sign-out (L11 privacy).
 */

import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
} from 'serwist'

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: [
    { url: '/', revision: '1' },
    { url: '/manifest.webmanifest', revision: '1' },
    { url: '/icons/icon.svg', revision: '1' },
    { url: '/icons/icon-192.png', revision: '1' },
    { url: '/icons/icon-512.png', revision: '1' },
    { url: '/icons/apple-touch-icon.png', revision: '1' },
  ],
  runtimeCaching: [
    // 1. Book month spreads (NetworkFirst so latest is fetched when online, cached version used offline)
    {
      matcher: ({ request, url }) => {
        if (!url.pathname.startsWith('/book/')) return false
        if (request.mode !== 'navigate') return false
        if (url.searchParams.has('_rsc')) return false
        if (request.headers.get('RSC')) return false
        return true
      },
      handler: new NetworkFirst({
        cacheName: 'mm-book-month-pages-v2',
        networkTimeoutSeconds: 5,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 36,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // 2. Next.js static scripts and CSS chunks (CacheFirst for immutable static assets)
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/static/'),
      handler: new CacheFirst({
        cacheName: 'mm-static-chunks',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 120,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 3. Fonts (Google Kalam & Cormorant Garamond)
    {
      matcher: ({ request, url }) =>
        request.destination === 'font' ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('fonts.googleapis.com'),
      handler: new CacheFirst({
        cacheName: 'mm-fonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },
    // 4. Static images and icons
    {
      matcher: ({ request, url }) =>
        request.destination === 'image' || url.pathname.startsWith('/icons/'),
      handler: new CacheFirst({
        cacheName: 'mm-images',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 40,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
  ],
})

// Purge legacy v1 book cache on activate (TASK F2)
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(caches.delete('mm-book-month-pages'))
})

// Listen for sign-out cache clearance (Correction 2: Privacy / L11)
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))),
        ),
    )
  }
})

serwist.addEventListeners()
