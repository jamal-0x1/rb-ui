/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/storage/**" },
      { protocol: "https", hostname: "rb-api.orbitalmind.xyz", pathname: "/storage/**" },
    ],
  },
};

module.exports = nextConfig;
