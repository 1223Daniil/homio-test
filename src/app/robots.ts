import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://homio.pro' : 'http://localhost:3000';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/static/',
        '/login',
        '/error',
        '/management/',
        '/settings/',
        '/profile/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
} 