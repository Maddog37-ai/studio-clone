const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  experimental: {
    turbo: {
      enabled: false, // ✅ This is the correct format in Next.js 15+
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix protobuf and gRPC issues in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        http2: false,
        '@protobufjs/codegen': false,
        '@protobufjs/fetch': false,
        '@protobufjs/path': false,
        '@protobufjs/pool': false,
        '@protobufjs/utf8': false,
        '@protobufjs/inquire': false,
        '@protobufjs/aspromise': false,
        '@protobufjs/base64': false,
        '@protobufjs/eventemitter': false,
        '@protobufjs/float': false,
        'protobufjs/minimal': false,
        '@grpc/grpc-js': false,
        '@grpc/proto-loader': false,
      };
    }
    
    // Ignore problematic modules completely
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push(
        '@grpc/grpc-js',
        '@grpc/proto-loader',
        'protobufjs'
      );
    }
    
    return config;
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
