/// <reference lib="webworker" />
/**
 * Serwist Service Worker for Memorable Moments
 * Memorable Moments — Phase 6 / Task 12 & Task 14
 *
 * Rules:
 * - Serwist runtime caching for app shell and current month.
 * - Supabase data requests must be NetworkFirst with a short timeout, never cache-first.
 * - Short networkTimeoutSeconds on /book/* navigation so online fetches stay fresh.
 * - Pending-edit cache merge ensures unsynced edits always win over cached initialEntries.
 * - CLEAR_CACHES message listener on sign-out (L11 privacy).
 */

import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  ExpirationPlugin,
} from 'serwist'

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: [
    { url: '/', revision: '2' },
    { url: '/manifest.webmanifest', revision: '2' },
    { url: '/icons/icon.svg', revision: '2' },
    { url: '/icons/icon-192.png', revision: '2' },
    { url: '/icons/icon-512.png', revision: '2' },
    { url: '/icons/apple-touch-icon.png', revision: '2' },
  ],
  runtimeCaching: [
    // 1. Supabase data requests & API data routes (NetworkFirst with short timeout, never cache-first)
    {
      matcher: ({ request, url }) => {
        if (request.method !== 'GET') return false
        return url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')
      },
      handler: new NetworkFirst({
        cacheName: 'mm-supabase-data-v1',
        networkTimeoutSeconds: 2,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },
    // 2. Book month spreads (NetworkFirst with 2s timeout: online stays fresh, offline still opens)
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
        networkTimeoutSeconds: 2,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 36,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // 3. Next.js static scripts and CSS chunks (CacheFirst for immutable static assets)
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
    // 4. Fonts (Google Kalam & Cormorant Garamond)
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
    // 5. Static images and icons
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
  event.waitUntil(
    caches.delete('mm-book-month-pages').then(() => self.clients.claim()),
  )
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
