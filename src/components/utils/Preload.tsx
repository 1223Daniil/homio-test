import Head from "next/head";
import React from "react";

interface PreloadProps {
  resources: {
    href: string;
    as: "image" | "font" | "style" | "script";
    type?: string;
    media?: string;
    crossOrigin?: "anonymous" | "use-credentials";
    imageSrcSet?: string;
    imageSizes?: string;
  }[];
  domains?: string[];
}

interface PreloadImagesProps {
  images: Array<{
    url: string;
    as?: "image";
    type?: string;
    fetchPriority?: "high" | "low" | "auto";
    sizes?: string;
  }>;
}

/**
 * Компонент для предзагрузки критических ресурсов
 * с целью улучшения LCP (Largest Contentful Paint)
 *
 * @param props - Свойства компонента
 * @returns React компонент
 */
export function Preload({ resources, domains = [] }: PreloadProps) {
  return (
    <Head>
      {/* Предзагрузка основных ресурсов */}
      {resources.map((resource, index) => (
        <link
          key={`preload-${index}`}
          rel="preload"
          href={resource.href}
          as={resource.as}
          type={resource.type}
          media={resource.media}
          crossOrigin={resource.crossOrigin}
          imageSrcSet={resource.imageSrcSet}
          imageSizes={resource.imageSizes}
        />
      ))}

      {/* DNS-prefetch и preconnect для ускорения соединений */}
      {domains.map(domain => (
        <React.Fragment key={domain}>
          <link rel="dns-prefetch" href={domain} />
          <link rel="preconnect" href={domain} crossOrigin="anonymous" />
        </React.Fragment>
      ))}
    </Head>
  );
}

/**
 * Хук для использования в компонентах страниц
 * @param mainImage - URL главного изображения страницы
 * @returns JSX с предзагрузкой критических ресурсов
 */
export function usePagePreload(mainImage?: string) {
  const resources: PreloadProps["resources"] = [
    // Предзагрузка главных шрифтов
    {
      href: "/fonts/font-main.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous"
    }
  ];

  // Добавляем главное изображение если оно есть
  if (mainImage) {
    resources.push({
      href: mainImage,
      as: "image",
      type: "image/webp",
      imageSizes: "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
    });
  }

  const domains = ["https://storage.yandexcloud.net", "https://homio.pro"];

  return <Preload resources={resources} domains={domains} />;
}

/**
 * Компонент для предзагрузки критичных для LCP изображений
 */
export function PreloadImages({ images }: PreloadImagesProps) {
  if (!images.length) return null;

  return (
    <Head>
      {images.map((image, index) => {
        // Извлекаем key для прямой передачи и создаем остальные свойства
        const key = `preload-${index}-${image.url}`;

        // Создаем объект с остальными свойствами (без key)
        const linkProps: React.ComponentPropsWithoutRef<"link"> & {
          imageSizes?: string;
          fetchPriority?: "high" | "low" | "auto";
        } = {
          rel: "preload",
          href: image.url,
          as: image.as || "image",
          type: image.type || "image/webp",
          fetchPriority: image.fetchPriority || "high"
        };

        // Добавляем imageSizes только если передан sizes
        if (image.sizes) {
          linkProps.imageSizes = image.sizes;
        }

        // Передаем key напрямую, а остальные свойства через spread
        return <link rel="preconnect" key={key} {...linkProps} />;
      })}
    </Head>
  );
}

export default PreloadImages;
