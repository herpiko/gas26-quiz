/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Compression would buffer the server-sent event streams.
  compress: false,
};

export default nextConfig;
