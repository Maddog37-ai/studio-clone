const nextConfig = {
  experimental: {
    turbo: {
      enabled: false, // ✅ This is the correct format in Next.js 15+
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
