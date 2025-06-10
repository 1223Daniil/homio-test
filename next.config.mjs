import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
  analyzerMode: "static",
  generateStatsFile: true,
  statsFilename: "stats.json"
});

/** @type {import('next').NextConfig} */
const config = {
  trailingSlash: true,
  env: {
    _next_intl_trailing_slash: "1"
  },
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@heroui/react",
      "@mui/material",
      "@mui/icons-material",
      "react-icons",
      "framer-motion",
      "swiper"
    ]
  },
  images: {
    unoptimized: false,
    domains: ["localhost", "storage.yandexcloud.net"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**"
      },
      {
        protocol: "https",
        hostname: "*.yandexcloud.net",
        pathname: "/**"
      }
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remoteImageTimeout: 150000
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*"
      },
      {
        source: "/api/image-proxy/:path*",
        destination: "https://storage.yandexcloud.net/:path*"
      }
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(ico|png|jpg|jpeg|gif|svg)$/,
      type: "asset/resource"
    });

    config.optimization.splitChunks = {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `npm.${packageName.replace("@", "")}`;
          }
        }
      }
    };

    return config;
  },
  // typescript: {
  //   ignoreBuildErrors: true
  // },
  eslint: {
    ignoreDuringBuilds: true
  }
  // output: "standalone"
};

export default withBundleAnalyzer(withNextIntl(config));
