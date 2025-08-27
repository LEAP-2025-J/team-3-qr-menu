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
  // Simplified build configuration to avoid webpack conflicts
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // swcMinify нь Next.js 15-д аль хэдийн default болсон
  // Cross origin request анхааруулгыг арилгах
  allowedDevOrigins: ['192.168.0.104'],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
