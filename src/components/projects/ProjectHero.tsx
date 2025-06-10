'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Badge, Button } from '@mantine/core';
import { MapPin, Building2, Bed, Bath, Ruler, Timer, Wallet, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { ProjectWithRelations } from '@/app/[locale]/search/types';

interface ProjectHeroProps {
  project: ProjectWithRelations;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const t = useTranslations('Projects');
  const locale = useLocale();
  const router = useRouter();
  const translation = project.translations.find(t => t.language === locale) || project.translations[0];
  const developerTranslation = project.developer?.translations?.find(t => t.language === locale) || project.developer?.translations?.[0];

  // Get main image for hero background
  const mainImage = project.media?.find(m => m.type === "image" && m.category === "BANNER")?.url || "/images/placeholder.jpg";

  return (
    <section className="relative min-h-[600px] w-full flex items-center justify-center mt-[72px]">
      {/* Background image with blur effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src={mainImage}
          alt={translation?.name || t("untitled")}
          fill
          priority
          quality={100}
          className="object-cover"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0fHRsdHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/2wBDAR0XFyAeIRshGxsdIR0hHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR3/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8">
        {/* Back button */}
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToSearch')}
        </button>

        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge color={project.status === "ACTIVE" ? "green" : "gray"}>
                {t(`status.${project.status}`)}
              </Badge>
              {project.type && (
                <Badge color="blue">
                  {t(`type.${project.type}`)}
                </Badge>
              )}
              {project.constructionStatus !== null && (
                <Badge color="yellow">
                  {`${project.constructionStatus}% ${t('completed')}`}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {translation?.name || t("untitled")}
            </h1>

            {project.location && (
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <MapPin className="w-5 h-5" />
                <span>
                  {[project.location.district, project.location.city, project.location.country]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            {developerTranslation && (
              <div className="flex items-center gap-2 text-white/80">
                <Building2 className="w-5 h-5" />
                <span>{developerTranslation.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {project.totalUnits && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                <div className="text-sm text-white/80 mb-1">{t('totalUnits')}</div>
                <div className="text-xl font-semibold">{project.totalUnits}</div>
              </div>
            )}
            {project.completionDate && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                <div className="text-sm text-white/80 mb-1">{t('completionDate')}</div>
                <div className="text-xl font-semibold">
                  {new Date(project.completionDate).getFullYear()}
                </div>
              </div>
            )}
          </div>
        </div>

        {translation?.description && (
          <motion.p 
            className="text-lg text-white/90 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {translation.description}
          </motion.p>
        )}
      </div>
    </section>
  );
} 