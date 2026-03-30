//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  async rewrites() {
    const backend =
      process.env.BACKEND_PROXY_URL ||
      process.env.BACKEND_URL ||
      'http://127.0.0.1:3001';
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
      { source: '/uploads/:path*', destination: `${backend}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true,
  },
  env: {
    // Prefer same-origin `/api` in dev (see rewrites) to avoid CORS / mixed-host issues.
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  // Force Webpack (disable Turbopack) to avoid @angular-devkit/architect issues with Nx
  webpack: (config) => {
    return config;
  },
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
