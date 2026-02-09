/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  optimizePackageImports: [
    '@tabler/icons-react',
    'lucide-react',
    '@radix-ui/react-icons'
  ],
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
  },
  compress: true,
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
