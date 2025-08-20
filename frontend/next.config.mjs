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
  // Cache цэвэрлэх
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Build cache хаах
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

export default nextConfig
