// const createNextIntlPlugin = require("next-intl/plugin");
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "homio.pro" },
      { protocol: "https", hostname: "x.homio.pro" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.banyantree.com" },
      {
        protocol: "https",
        hostname: "storage.yandexcloud.net",
        port: "",
        pathname: "/homio/**"
      },
      {
        protocol: "https",
        hostname: "*.yandexcloud.net",
        port: "",
        pathname: "/**"
      },
      { protocol: "https", hostname: "www.lagunaproperty.com" },
      { protocol: "https", hostname: "*" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "http", hostname: "localhost" }
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@heroui/react",
      "@heroicons/react",
      "lucide-react"
    ],
    serverActions: true,
    typedRoutes: true,
    serverActions: { bodySizeLimit: "1.5gb" },
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@heroui/react",
      "@mui/material",
      "@mui/icons-material"
    ]
  },
  // Конфигурация для разных доменов
  async headers() {
    return [
      {
        // Применяем ко всем маршрутам
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          {
            // CSP для публичной части
            key: "Content-Security-Policy",
            value:
              process.env.NODE_ENV === "production"
                ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' cdn.jsdelivr.net cdn.lrkt-in.com *.homio.pro *.googleapis.com maps.googleapis.com maps.gstatic.com *.google.com; style-src 'self' 'unsafe-inline' *.lrkt-in.com *.googleapis.com maps.googleapis.com maps.gstatic.com; img-src 'self' data: https: *.googleapis.com maps.googleapis.com maps.gstatic.com *.google.com *.gstatic.com; font-src 'self' data: *.gstatic.com; connect-src 'self' wss://heygen-feapbkvq.livekit.cloud heygen-feapbkvq.livekit.cloud *.livekit.cloud api.heygen.com *.homio.pro *.googleapis.com maps.googleapis.com *.google.com *.yandexcloud.net; frame-src 'self' *.google.com; frame-ancestors 'none'; media-src 'self' https: data: blob:;"
                : ""
          }
        ]
      },
      {
        // Кэширование для статических ассетов
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        // Кэширование для шрифтов
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS"
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
          }
        ]
      }
    ];
  },
  // Конфигурация редиректов
  async redirects() {
    return [{ source: "/", destination: "/ru", permanent: true }];
  },
  // Конфигурация rewrites для API
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite для projects без локали
        {
          source: "/projects",
          destination: "/ru/projects",
          has: [{ type: "host", value: "q.homio.pro" }]
        },
        // Rewrite для projects с ID без локали
        {
          source: "/projects/:id",
          destination: "/ru/projects/:id",
          has: [{ type: "host", value: "q.homio.pro" }]
        },
        // Rewrite для projects
        {
          source: "/ru/projects",
          destination: "/ru/projects",
          has: [{ type: "host", value: "q.homio.pro" }]
        },
        // API routes для публичной части
        {
          source: "/api/public/:path*",
          destination: "/api/public/:path*",
          has: [{ type: "host", value: "q.homio.pro" }]
        },
        // API routes для админ панели
        {
          source: "/api/:path*",
          destination: "/api/:path*",
          has: [{ type: "host", value: "q.homio.pro" }]
        }
      ],
      afterFiles: [
        { source: "/projects", destination: "/ru/projects" },
        { source: "/projects/:id", destination: "/ru/projects/:id" },
        { source: "/ru/projects", destination: "/ru/projects" }
      ]
    };
  },
  // Оптимизация производительности
  compiler: { removeConsole: process.env.NODE_ENV === "production" },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  // Конфигурация для разных окружений
  env: {
    PUBLIC_URL:
      process.env.NODE_ENV === "production"
        ? process.env.PUBLIC_URL
        : "http://localhost:3000",
    ADMIN_URL:
      process.env.NODE_ENV === "production"
        ? process.env.ADMIN_URL
        : "http://localhost:3000",
    _next_intl_trailing_slash: "/",
    HEYGEN_API_KEY: process.env.HEYGEN_API_KEY,
    NEXT_PUBLIC_API_URL:
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://localhost:3000",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  },
  // Оптимизация сборки
  webpack: (config, { dev, isServer }) => {
    // Оптимизация изображений
    config.module.rules.push({
      test: /\.(jpe?g|png|svg|gif|ico|webp|avif)$/,
      use: [
        {
          loader: "image-optimization-loader",
          options: { optimizeImages: true }
        }
      ]
    });

    // Оптимизация CSS
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: "styles",
        test: /\.(css|scss)$/,
        chunks: "all",
        enforce: true
      };
    }
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        lucide: {
          test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
          name: "lucide",
          chunks: "all",
          priority: 30
        },
        heroicons: {
          test: /[\\/]node_modules[\\/]@heroui[\\/]/,
          name: "heroui",
          chunks: "all",
          priority: 20
        }
      }
    };

    return config;
  },
  typescript: { ignoreBuildErrors: true },
  api: { bodyParser: { sizeLimit: "1.5gb" }, responseLimit: "1.5gb" }
};

// Экспортируем конфигурацию с next-intl
// module.exports = withNextIntl(nextConfig);

export default withNextIntl(nextConfig);
