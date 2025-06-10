import { MetadataRoute } from 'next';

const baseUrl = process.env.NODE_ENV === 'production' ? 'https://homio.pro' : 'http://localhost:3000';

type DynamicPage = {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['en', 'ru'];
  const routes = [
    '',
    '/blog',
    '/events',
    '/areas',
    '/collections',
    '/lifestyle',
    '/search'
  ];

  const staticPages = routes.flatMap(route => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  );

  // В реальном приложении здесь будут динамические страницы из БД
  const dynamicPages: DynamicPage[] = [
    // Пример динамических страниц:
    // ...blogPosts.map(post => ({
    //   url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
    //   lastModified: post.updatedAt,
    //   changeFrequency: 'weekly',
    //   priority: 0.6,
    // })),
  ];

  return [...staticPages, ...dynamicPages];
} 
