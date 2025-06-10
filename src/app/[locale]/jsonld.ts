export const generateHomePageJsonLd = () => {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://homio.pro/#organization',
        'name': 'Homio.Pro',
        'url': 'https://homio.pro',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://homio.pro/logo.png',
          'width': 190,
          'height': 60
        },
        'sameAs': [
          'https://www.facebook.com/homio.pro',
          'https://twitter.com/homio_pro',
          'https://www.instagram.com/homio.pro',
          'https://www.linkedin.com/company/homio-pro'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://homio.pro/#website',
        'url': 'https://homio.pro',
        'name': 'Homio.Pro',
        'publisher': {
          '@id': 'https://homio.pro/#organization'
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://homio.pro/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'RealEstateAgent',
        '@id': 'https://homio.pro/#realestateagent',
        'name': 'Homio.Pro Real Estate',
        'image': 'https://homio.pro/images/office.jpg',
        'priceRange': '$$$$',
        'address': {
          '@type': 'PostalAddress',
          'addressCountry': 'Thailand',
          'addressLocality': 'Phuket'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': '7.8804',
          'longitude': '98.3923'
        },
        'areaServed': [
          {
            '@type': 'City',
            'name': 'Phuket'
          },
          {
            '@type': 'City',
            'name': 'Bangkok'
          },
          {
            '@type': 'City',
            'name': 'Pattaya'
          }
        ],
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'Real Estate Properties',
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Product',
                'name': 'Luxury Villas'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Product',
                'name': 'Beachfront Condos'
              }
            },
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Product',
                'name': 'Investment Properties'
              }
            }
          ]
        },
        'makesOffer': [
          {
            '@type': 'Offer',
            'name': 'Property Search',
            'description': 'Find your perfect property in Thailand'
          },
          {
            '@type': 'Offer',
            'name': 'Investment Consultation',
            'description': 'Professional advice on real estate investments'
          },
          {
            '@type': 'Offer',
            'name': 'Property Management',
            'description': 'Full-service property management solutions'
          }
        ]
      },
      {
        '@type': 'WebPage',
        '@id': 'https://homio.pro/#webpage',
        'url': 'https://homio.pro',
        'name': 'Homio.Pro - Next-gen real estate hub',
        'description': 'Find your perfect property in Thailand\'s most sought-after locations. Explore luxury villas, condos, and apartments with Homio.Pro - your trusted real estate platform.',
        'isPartOf': {
          '@id': 'https://homio.pro/#website'
        },
        'about': {
          '@id': 'https://homio.pro/#realestateagent'
        },
        'inLanguage': 'en'
      }
    ]
  };
}; 