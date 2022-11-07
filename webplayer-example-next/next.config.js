/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  },
};

module.exports = nextConfig;
