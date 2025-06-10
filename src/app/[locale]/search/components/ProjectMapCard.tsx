'use client';

import { ProjectWithRelations } from "../types";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookmarkIcon, X, Navigation, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

interface ProjectMapCardProps {
  project: ProjectWithRelations;
  onClose: () => void;
}

export function ProjectMapCard({ project, onClose }: ProjectMapCardProps) {
  const t = useTranslations('Projects.searchResult.mapCard');
  const locale = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const media = project.media.length > 0 
    ? project.media.map(m => ({ url: m.url || '/images/placeholder.jpg' }))
    : [{ url: '/images/placeholder.jpg' }];

  // Добавляем вычисление мин. и макс. цены
  const priceRange = project.units.reduce(
    (acc, unit) => {
      if (!unit.price) return acc;
      return {
        min: Math.min(acc.min, unit.price),
        max: Math.max(acc.max, unit.price)
      };
    },
    { min: Infinity, max: -Infinity }
  );

  const hasValidPriceRange = priceRange.min !== Infinity && priceRange.max !== -Infinity;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + media.length) % media.length);
  };

  // Форматирование даты сдачи
  const formatOffDate = (date: string | null | undefined) => {
    if (!date) return '';
    const offDate = new Date(date);
    const quarter = Math.floor(offDate.getMonth() / 3) + 1;
    return `${quarter}${t('quarter')} ${offDate.getFullYear()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute left-4 top-4 z-[1000] w-[360px] bg-white rounded-xl shadow-xl overflow-hidden"
    >
      {/* Кнопки действий */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Информация о застройщике */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        {project.developer?.logo && (
          <Image
            src={project.developer.logo}
            alt={project.developer.translations[0]?.name || 'Developer logo'}
            width={40}
            height={40}
            className="rounded-lg"
          />
        )}
        <div>
          <p className="text-sm text-gray-500">{t('developer')}</p>
          <p className="font-medium text-gray-900">
            {project.developer?.translations[0]?.name || t('project')}
          </p>
        </div>
      </div>

      {/* Изображение проекта */}
      <div className="relative px-4">
        <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
          <Image
            src={media[currentSlide].url}
            alt={project.translations[0]?.name || 'Project image'}
            fill
            className="object-cover"
          />
          
          {/* Кнопки навигации слайдера */}
          <button 
            onClick={(e) => { e.preventDefault(); prevSlide(); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); nextSlide(); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Индикаторы слайдера */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-black' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Информация о проекте */}
      <div className="p-4 space-y-6">
        {/* Верхняя группа информации */}
        <div className="space-y-1">
          {/* Дата сдачи */}
          {project.completionDate && (
            <p className="text-sm text-gray-600">
              {t('offDate')} {formatOffDate(project.completionDate)}
            </p>
          )}

          {/* Название проекта и кнопки */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-[24px] font-semibold text-blue-600">
              {project.translations[0]?.name || 'Untitled Project'}
            </h3>
            <div className="shrink-0">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <BookmarkIcon className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Ценовой диапазон */}
          <div className="flex items-baseline gap-1">
            {hasValidPriceRange ? (
              <>
                <span className="text-gray-900 text-lg">
                  {t('from')} ฿{(priceRange.min / 1000000).toFixed(3)}{t('million')}
                </span>
                {priceRange.max > priceRange.min && (
                  <>
                    <span className="text-gray-600">{t('to')}</span>
                    <span className="text-gray-900 text-lg">
                      ฿{(priceRange.max / 1000000).toFixed(3)}{t('million')}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-900 text-lg">{t('priceOnRequest')}</span>
            )}
          </div>

          {/* Местоположение и расстояние до пляжа */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 shrink-0" />
              <span className="text-sm">{project.location?.district}, {project.location?.city}</span>
            </div>
            {project.location?.beachDistance && (
              <div className="flex items-center gap-2 text-gray-600">
                <Navigation className="w-5 h-5 shrink-0 rotate-135" />
                <span className="text-sm">{t('nearestBeach')} • {project.location.beachDistance}{t('meters')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий внизу */}
        <div className="flex gap-2">
          <Link 
            href={`/${locale}/projects/${project.id}`}
            className="flex-1 py-3 px-4 bg-blue-600 text-white text-center font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('viewProject')}
          </Link>
          <button className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}