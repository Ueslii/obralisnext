import withPWA from '@ducanh2912/next-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseConfig = {
  experimental: {
    externalDir: true
  },
  // Silence monorepo root inference warning
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  },
  webpack: (config) => {
    // Ensure singletons for these packages to avoid context mismatch
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@tanstack/react-query': path.resolve(__dirname, 'node_modules/@tanstack/react-query'),
      '@tanstack/query-core': path.resolve(__dirname, 'node_modules/@tanstack/query-core')
    };
    return config;
  }
};

export default withPWA({
  dest: 'public',
  cacheStartUrl: true,
  disable: !isProd,
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/[^/]+\.supabase\.co\/(rest|storage|functions)\//,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          networkTimeoutSeconds: 4
        }
      }
    ]
  }
})(baseConfig);
