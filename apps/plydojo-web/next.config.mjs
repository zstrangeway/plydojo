/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@plydojo/plydojo-ui"],
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
