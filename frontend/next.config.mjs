/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel дээр ажиллахад зориулсан тохиргоо
  experimental: {
    forceSwcTransforms: true,
  },
  // Cache цэвэрлэх - timestamp ашиглах
  generateBuildId: async () => {
    return `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },
  // Build cache хаах
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Vercel дээр ажиллахад зориулсан
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
