/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint separately — don't block production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
