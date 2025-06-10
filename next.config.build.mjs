import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const config = {
    output: "standalone",
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    experimental: {
        // Отключаем все экспериментальные фичи
        optimizeCss: false,
        optimizePackageImports: [],
        // Ограничиваем память
        memoryBasedWorkersCount: true,
        isrMemoryCacheSize: 0,
        workerThreads: false,
        cpus: 1
    },
    // Отключаем оптимизацию изображений
    images: {
        unoptimized: true,
        domains: ["localhost"]
    },
    // Минимальная конфигурация webpack
    webpack(config) {
        config.optimization = {
            ...config.optimization,
            minimize: false,
            splitChunks: false
        };
        return config;
    }
};

export default withNextIntl(config);