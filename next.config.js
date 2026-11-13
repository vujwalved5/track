/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/welcome',
        destination: '/',
        permanent: false,
      },
      {
        source: '/welcome/focus-room',
        destination: '/focus-room',
        permanent: false,
      },
      {
        source: '/enter',
        destination: '/login',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
