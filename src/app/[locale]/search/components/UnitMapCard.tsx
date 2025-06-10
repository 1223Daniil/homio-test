'use client';

import { UnitWithRelations } from "@/components/projects/UnitCardSearchResult";
import { motion } from "framer-motion";
import { X, MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FixedSizeList as List } from 'react-window';
import { useState } from "react";
import { BookmarkIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface UnitMapCardProps {
  units: UnitWithRelations[];
  onClose: () => void;
}

function UnitCard({ unit, images, currentSlide, onPrevSlide, onNextSlide, onSlideClick }: { unit: UnitWithRelations; images: string[]; currentSlide: number; onPrevSlide: (e: React.MouseEvent) => void; onNextSlide: (e: React.MouseEvent) => void; onSlideClick: (e: React.MouseEvent, index: number) => void }) {
  const locale = useLocale();
  const t = useTranslations('Units.unitSearchResult.mapCard');

  return (
    <div className="p-4 border border-gray-100 hover:bg-gray-50 transition-colors rounded-xl">
      {/* Изображение юнита */}
      <div className="w-full aspect-[16/10] mb-4">
        <div className="relative w-full h-full rounded-lg bg-gray-100 overflow-hidden">
          <Image
            src={images[currentSlide] || '/images/placeholder.jpg'}
            alt={`${unit.bedrooms}-bed`}
            fill
            className="object-cover"
            sizes="(max-width: 360px) 100vw, 360px"
          />
          
          {/* Кнопки навигации слайдера */}
          {images.length > 1 && (
            <>
              <button 
                onClick={onPrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
              >
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={onNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
              >
                <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Индикаторы слайдера */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="flex gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.preventDefault(); onSlideClick(e, index); }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-black' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Информация о юните */}
      <div className="space-y-4">
        {/* Верхняя группа информации */}
        <div className="space-y-1">
          {/* Характеристики юнита и кнопки */}
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="text-[18px] font-medium text-gray-900">
                {unit.layout?.bedrooms 
                  ? `${t(`${unit.layout.bedrooms}Bed`)} ${t(`type.${unit.layout.type || 'none'}`)} • ${unit.layout?.totalArea} ${t('metersq')} • ${unit.floor}/${unit.building.floors} ${t('floor')}`
                  : `${t(`${unit.bedrooms}Bed`)} ${t(`type.${unit.type || 'none'}`)} • ${unit.area} ${t('metersq')} • ${unit.floor}/${unit.building.floors} ${t('floor')}`
                }
              </h3>
            </div>
            <div className="shrink-0">
              <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <BookmarkIcon className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Цена */}
          <p className="text-[24px] font-semibold text-blue-600">
            ฿{((unit.price || 0) / 1000000).toFixed(3)}{t('million')}
          </p>

          {/* Местоположение и расстояние до пляжа */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 shrink-0" />
              <span className="text-sm">{unit.project?.location?.district}, {unit.project?.location?.city}</span>
            </div>
            {unit.project?.location?.beachDistance && (
              <div className="flex items-center gap-2 text-gray-600">
                <Navigation className="w-5 h-5 shrink-0 rotate-135" />
                <span className="text-sm">{t('nearestBeach')} • {unit.project.location.beachDistance}{t('meters')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий внизу */}
        <div className="flex gap-2 pt-2">
          <Link 
            href={`/${locale}/projects/${unit.project.id}/units/${unit.id}`}
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
    </div>
  );
}

export function UnitMapCard({ units, onClose }: UnitMapCardProps) {
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const t = useTranslations('Units.unitSearchResult.mapCard');
  const project = units[0]?.project;

  // Состояние для хранения текущего слайда для каждого юнита
  const [currentSlides, setCurrentSlides] = useState<{ [key: string]: number }>({});

  // Функция для обновления текущего слайда конкретного юнита
  const updateSlide = (unitId: string, slideIndex: number) => {
    setCurrentSlides(prev => ({
      ...prev,
      [unitId]: slideIndex
    }));
  };

  // Функция для получения массива изображений юнита
  const getUnitImages = (unit: UnitWithRelations) => {
    // Сначала пробуем получить изображения юнита (layout + media)
    let images = [
      unit.layout?.mainImage,
      ...(unit.media?.map(m => m.url) || [])
    ].filter(Boolean); // Удаляем null и undefined

    // Если нет изображений юнита, берем первые 3 изображения проекта
    if (images.length === 0 && unit.project.media?.length > 0) {
      images = unit.project.media
        .slice(0, 3)
        .map(m => m.url)
        .filter(Boolean);
    }

    // Если все еще нет изображений, используем плейсхолдер
    if (images.length === 0) {
      images = ['/images/placeholder.jpg'];
    }

    console.log('Unit images:', {
      unitId: unit.id,
      imagesCount: images.length,
      source: images[0] === '/images/placeholder.jpg' ? 'placeholder' : 
              images === unit.project.media?.map(m => m.url).slice(0, 3) ? 'project' : 'unit',
      images
    });
    
    return images;
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const unit = units[index];
    if (!unit) return null;

    const images = getUnitImages(unit);
    const currentSlide = currentSlides[unit.id] || 0;

    const handlePrevSlide = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      updateSlide(unit.id, (currentSlide - 1 + images.length) % images.length);
    };

    const handleNextSlide = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      updateSlide(unit.id, (currentSlide + 1) % images.length);
    };

    const handleSlideClick = (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      e.stopPropagation();
      updateSlide(unit.id, index);
    };

    return (
      <div style={style} className="px-2">
        <Link href={`/${locale}/projects/${unit.project.id}/units/${unit.id}`} className="block mb-8">
          <div className="bg-white">
            <UnitCard 
              unit={unit}
              images={images}
              currentSlide={currentSlide}
              onPrevSlide={handlePrevSlide}
              onNextSlide={handleNextSlide}
              onSlideClick={handleSlideClick}
            />
          </div>
        </Link>
      </div>
    );
  };

  const listHeight = typeof window !== 'undefined' ? 
    Math.min(800, window.innerHeight - 150) : 800;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="absolute left-4 top-4 z-[1000] w-[360px] h-[calc(100%-32px)] bg-white rounded-xl shadow-xl overflow-hidden"
    >
      {/* Заголовок с информацией о проекте */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-[1001]">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{project?.translations[0]?.name || 'Project'}</h2>
            <p className="text-sm text-gray-600 mt-1">{units.length} {t('unitsAvailable')}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Список юнитов */}
      <div className="h-[calc(100%-73px)] overflow-hidden">
        {units.length > 0 ? (
          <List
            height={listHeight}
            itemCount={units.length}
            itemSize={440}
            width="100%"
            className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          >
            {Row}
          </List>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {t('noUnitsAvailable')}
          </div>
        )}
      </div>
    </motion.div>
  );
} 