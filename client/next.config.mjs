/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  // Optimize package imports for faster builds and smaller bundles
  optimizePackageImports: [
    '@tabler/icons-react',
    'lucide-react',
    '@radix-ui/react-icons'
  ],

  // Production optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 828, 1080, 1200, 1920],
  },

  // Enable gzip compression
  compress: true,

  // Power bundler optimizations  
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
