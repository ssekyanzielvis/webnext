
import withBundleAnalyzer from '@next/bundle-analyzer';
/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'placehold.co' }
    ]
  }
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(baseConfig);
