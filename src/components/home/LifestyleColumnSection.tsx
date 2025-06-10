"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";

interface Article {
  id: string;
  image?: string;
  type: string;
  title: string;
  excerpt?: string;
  author?: string;
  readTime?: string;
  publishedAt?: Date | null;
}

interface Props {
  articles: Article[];
}

const defaultImage = "https://cdn.builder.io/api/v1/image/assets/TEMP/placeholder-image.jpg?placeholderIfAbsent=true";

export default function LifestyleColumnSection({ articles }: Props) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const t = useTranslations("Home");
  const router = useRouter();
  const params = useParams();

  const handleArticleClick = (articleId: string) => {
    router.push(`/${params.locale}/blog/${articleId}`);
  };

  const getDaysForm = (count: number) => {
    if (count % 100 >= 11 && count % 100 <= 19) {
      return t('cards.daysMany');
    }

    const lastDigit = count % 10;
    if (lastDigit === 1) {
      return t('cards.day');
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return t('cards.dayMany');
    }
    return t('cards.daysMany');
  };

  const formatPublishDate = (date: Date | null | undefined): string => {
    if (!date) return t("cards.postedToday");
    
    const diffTime = Math.ceil((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffTime === 0) return t("cards.postedToday");
    if (diffTime === 1) return t("cards.postedYesterday");
    if (diffTime < 7) return `${diffTime} ${getDaysForm(diffTime)} ${t("cards.ago")}`;
    
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            {t("column.title")}
          </h2>
          <button className="text-base font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2">
            {t("column.exploreAll")}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="mt-2 text-base text-gray-600">
          {t("column.Writtenexperts")}
        </p>
      </div>

      <div className="relative mt-8 w-full">
        {canScrollLeft && (
          <button 
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={t("cards.scrollLeft")}
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
          {articles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article.id)}
              className="flex-shrink-0 bg-white rounded-lg shadow-md cursor-pointer w-[340px] hover:shadow-lg transition-shadow"
            >
              <div className="w-full h-[168px] overflow-hidden rounded-t-lg">
                <Image
                  src={article.image || defaultImage}
                  alt={article.title}
                  width={340}
                  height={168}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium">{t(`cards.type.${article.type.toLowerCase()}`)}</span>
                  <span className="mx-2">·</span>
                  <span>{article.readTime} {t("cards.minutes")} {t("cards.toRead")}</span>
                </div>
                <h3 className="mt-2 text-xl font-semibold leading-tight text-gray-900">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-sm text-gray-600 line-clamp-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center mt-4 text-sm text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 4.5V8L10.5 9.5M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="ml-1.5">{formatPublishDate(article.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button 
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label={t("cards.scrollRight")}
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
