"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface Collection {
  id: string;
  mainImage: string;
  title: string;
  count: string;
  projects: {
    image: string;
    logo: string;
  }[];
}

const collectionsold = [
  {
    id: 1,
    mainImage:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/1fa58a80e5634ff5e6c987051b9ba7adc8bac7e36eb23f62c6e4de49cef1b1dc?placeholderIfAbsent=true",
    projects: [
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/292914c0f23de5df62a8e01bfaf390a53400424ea7d4aba67228a5cc4af874e5?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/1ff39e3679d3f7dc93488352009091ad6d43aae7686dfbfa835e859f2d4ad973?placeholderIfAbsent=true"
      },
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/3bdb1053e18dd1df2b38e9d7e9a4d684d5b6ee55cb86a1409a6eae9a44665655?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/50bd20b3e11861a66cacd9ac00cb2216ba6309db68d08fa2ec91b2123417eb68?placeholderIfAbsent=true"
      }
    ],
    title: "Under 10 min to beach",
    count: "10 projects"
  },
  {
    id: 2,
    mainImage:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/f214e0214187fa92036c46c94fd790ab32af8cafe811c7e4bcf02505d7bb82fc?placeholderIfAbsent=true",
    projects: [
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/68506adbe44b3f2e86c6890e9414dff03edf3a5a7776d3bbb29adea300d309fd?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/f37f8a66781eaf300524d211c5393de041ab024492d3e0b95b30c31c5c29954a?placeholderIfAbsent=true"
      },
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/6a634a73df3474b96c72f8d6a0e329c343eade63459cb96d7946b04bda529253?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/b7759d2f2870545e3adebaeeaf571d245ad89c9fcdd6a3877bea74143acf7548?placeholderIfAbsent=true"
      }
    ],
    title: "Pet-friendly projects",
    count: "25 projects"
  },
  {
    id: 3,
    mainImage:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/f4ed69a71ed181d461af86e6d6820f535b6d3e9e4b0b1df477a42e100154af96?placeholderIfAbsent=true",
    projects: [
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/fd69b9d173425946b3d2f7a7d73fd1bf29408795421570e02d8e5fc945779396?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/ac33b85e3b6be7d8bfdbc9b296a383276d789c8e87280ce78be3b10a8bbd46ce?placeholderIfAbsent=true"
      },
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/1b9454aa3d2ba49933c175b94471d3f2554a83a6081f248d56b018dced2b35ac?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/42e1ec8e6d54b235f69605969b90874b7ab072c9fa10c9d25cbda2a1ecf417c3?placeholderIfAbsent=true"
      }
    ],
    title: "Projects for family",
    count: "35 projects"
  },
  {
    id: 4,
    mainImage:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/e087a4139557e52026baf59ca44149ab4bcec18edcb6cd4c4476f984a2045c0f?placeholderIfAbsent=true",
    projects: [
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/68506adbe44b3f2e86c6890e9414dff03edf3a5a7776d3bbb29adea300d309fd?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/f37f8a66781eaf300524d211c5393de041ab024492d3e0b95b30c31c5c29954a?placeholderIfAbsent=true"
      },
      {
        image:
          "https://cdn.builder.io/api/v1/image/assets/TEMP/6a634a73df3474b96c72f8d6a0e329c343eade63459cb96d7946b04bda529253?placeholderIfAbsent=true",
        logo: "https://cdn.builder.io/api/v1/image/assets/TEMP/b7759d2f2870545e3adebaeeaf571d245ad89c9fcdd6a3877bea74143acf7548?placeholderIfAbsent=true"
      }
    ],
    title: "Rich infrastructure",
    count: "32 projects"
  }
];

interface CuratedCollectionsSectionProps {
  collections: Collection[];
}

const getDefaultImagesForCollection = (index: number) => {
  const defaultCollection = collectionsold[index % collectionsold.length] || collectionsold[0];
  return {
    mainImage: defaultCollection?.mainImage || "",
    projects: defaultCollection?.projects || []
  };
};

export default function CuratedCollectionsSection({ collections }: CuratedCollectionsSectionProps) {
  const t = useTranslations("Home.collections");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = 340 + 24; // card width + gap
    const scrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <section className="mt-24 w-full max-w-[1440px] mx-auto px-6 max-md:mt-16 max-md:px-4">
      <div className="flex flex-col justify-center w-full">
        <div className="flex flex-wrap gap-8 justify-between items-center w-full">
          <h2 className="text-[24px] md:text-[32px] font-semibold leading-tight text-gray-900">
            {t("title")}
          </h2>
          <button className="text-base font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2">
            {t("view")}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="mt-2 text-base text-gray-600">
          {t("subtitle")}
        </p>
      </div>

      <div className="relative mt-8 w-full">
        {canScrollLeft && (
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-[120px] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={t("scrollLeft")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar scrollbar-hide pb-4 gap-6 scroll-smooth"
        >
          {collections.map((collection, collectionIndex) => {
            const defaultImages = getDefaultImagesForCollection(collectionIndex);
            return (
              <div
                key={collection.id}
                className="flex-shrink-0 bg-white rounded-xl shadow-md w-[340px] hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-3">
                  <div className="flex gap-3">
                    <div className="w-[160px] h-[200px] rounded-lg overflow-hidden">
                      {!imageErrors[`collection-${collection.id}`] && (
                        <Image
                          src={collection.mainImage || defaultImages.mainImage}
                          alt={collection.title}
                          width={160}
                          height={200}
                          className="object-cover w-full h-full rounded-lg hover:scale-105 transition-transform duration-300"
                          onError={() => handleImageError(`collection-${collection.id}`)}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-3 w-[160px]">
                      {(collection.projects?.length ? collection.projects : defaultImages.projects).map((project, index) => (
                        <div
                          key={index}
                          className="relative w-[160px] h-[96px] rounded-lg overflow-hidden"
                        >
                          {!imageErrors[`project-${collection.id}-${index}`] && (
                            <Image
                              src={project.image}
                              alt={t("propertyImage")}
                              width={160}
                              height={96}
                              className="object-cover w-full h-full rounded-lg hover:scale-105 transition-transform duration-300"
                              onError={() => handleImageError(`project-${collection.id}-${index}`)}
                            />
                          )}
                          {!imageErrors[`logo-${collection.id}-${index}`] && (
                            <div className="absolute left-2 bottom-2 bg-white rounded-lg p-1.5 shadow-sm w-[40px] h-[40px] flex items-center justify-center">
                              <Image
                                src={project.logo}
                                alt={t("developerLogo")}
                                width={32}
                                height={32}
                                className="object-contain"
                                onError={() => handleImageError(`logo-${collection.id}-${index}`)}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-[#E9EAEB]">
                  <h3 className="text-xl font-semibold leading-tight text-gray-900">
                    {collection.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {collection.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-[120px] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={t("scrollRight")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="#1F2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
