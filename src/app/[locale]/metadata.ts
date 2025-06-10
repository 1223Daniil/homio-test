import { Metadata } from 'next';

const defaultTitle = 'Homio.Pro - Next-gen real estate hub';
const defaultDescription = 'Find your perfect property in Thailand\'s most sought-after locations. Explore luxury villas, condos, and apartments with Homio.Pro - your trusted real estate platform.';

export const metadata: Metadata = {
  metadataBase: new URL('https://homio.pro'),
  title: {
    default: defaultTitle,
    template: '%s | Homio.Pro'
  },
  description: defaultDescription,
  keywords: [
    'real estate',
    'property',
    'Thailand',
    'Phuket',
    'Bangkok',
    'luxury villas',
    'condos',
    'investment property'
  ],
  authors: [{ name: 'Homio.Pro' }],
  creator: 'Homio.Pro',
  publisher: 'Homio.Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Homio.Pro',
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Homio.Pro - Next-gen real estate hub'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: ['/images/twitter-image.jpg'],
    creator: '@homio_pro'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
  },
  alternates: {
    canonical: 'https://homio.pro',
    languages: {
      'en': 'https://homio.pro/en',
      'ru': 'https://homio.pro/ru',
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
}; 