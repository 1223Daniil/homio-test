"use client";

import { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";

import Image from "next/image";
const MainNav = dynamic(() => import("../layout/MainNav"));
import type { ProjectWithRelations } from "@/app/[locale]/search/types";
const SearchForm = dynamic(() =>
  import("@/components/search/SearchForm").then(mod => mod.SearchForm)
);
const SearchResults = dynamic(() =>
  import("./SearchResults").then(mod => mod.SearchResults)
);
import { useTranslations } from "next-intl";
const MobileSearchForm = dynamic(() =>
  import("@/components/search/MobileSearchForm").then(
    mod => mod.MobileSearchForm
  )
);

// Hero background image
const heroImage = {
  url: "/images/hero/banner-1.webp",
  alt: "Luxury properties in Thailand",
  blurDataURL: "data:image/jpeg;base64,..."
};

interface HeroSectionProps {
  filterData: {
    bedrooms: { min: number; max: number };
    prices: { min: number; max: number };
  };
}

export default function HeroSection({ filterData }: HeroSectionProps) {
  const t = useTranslations("Home.hero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [actualPriceRange, setActualPriceRange] = useState(filterData);

  // Fetch actual price range when component mounts
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await fetch("/api/units/price-range");
        const data = await response.json();

        if (data.min !== undefined && data.max !== undefined) {
          setActualPriceRange(prev => ({
            ...prev,
            prices: { min: data.min, max: data.max }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch price range:", error);
      }
    };

    fetchPriceRange();
  }, []);

  const updateMapMarkers = useCallback((items: ProjectWithRelations[]) => {
    const markers = items
      .filter(item => item.location?.latitude && item.location?.longitude)
      .map(item => ({
        id: item.id,
        lat: item.location!.latitude,
        lng: item.location!.longitude,
        title: item.translations[0]?.name || "Untitled",
        type: "project" as const,
        data: item
      }));

    setMapMarkers(markers);
  }, []);

  const handleCloseResults = () => {
    setShowResults(false);
    setProjects([]);
    setMapMarkers([]);
    setError(null);
  };

  return (
    <>
      <MainNav />
      <div className="md:hidden">
        <section className="relative min-h-[375px] w-full flex justify-center mt-[72px]">
          {/* Background image with blur effect */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage.url}
              alt={heroImage.alt}
              fill
              priority
              quality={75}
              sizes="(max-width: 768px) 100vw, 100vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL={heroImage.blurDataURL}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 pt-16">
            <h1 className="text-[28px] leading-[1.2] font-semibold text-white text-left mb-4 max-w-[280px]">
              {t("title")}
            </h1>

            {/* Mobile Logo */}
            <div className="absolute bottom-8 left-4">
              <Image
                src="/images/logo_white.png"
                alt="HOMIO.PRO"
                width={160}
                height={40}
                priority
                className="w-auto h-8"
              />
            </div>
          </div>
        </section>

        {/* Mobile Search Form */}
        <div className="px-4 pt-5">
          <MobileSearchForm
            filterData={actualPriceRange}
            onSearch={() => {}}
            className="shadow-xl rounded-xl overflow-hidden"
          />
        </div>
      </div>

      {/* Desktop version */}
      <section className="relative hidden md:flex min-h-[700px] w-full items-center justify-center mt-[72px]">
        {/* Background image with blur effect */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage.url}
            alt={heroImage.alt}
            fill
            priority
            quality={80}
            className="object-cover"
            placeholder="blur"
            blurDataURL={heroImage.blurDataURL}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 w-full max-w-[1280px] mx-auto px-8">
          <h1 className="text-[42px] lg:text-[56px] leading-[1.3] lg:leading-[72px] font-semibold text-white text-center mb-12">
            {t("title")}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 text-center mb-12 max-w-[800px] mx-auto">
            {t("subtitle")}
          </p>

          {/* Desktop Search Form */}
          <div className="w-full max-w-5xl mx-auto">
            <SearchForm filterData={actualPriceRange} />
          </div>
        </div>
      </section>

      {showResults && (
        <SearchResults
          loading={loading}
          error={error}
          projects={projects}
          mapMarkers={mapMarkers}
          showMap={showMap}
          view={view}
          onClose={handleCloseResults}
          onToggleMap={() => setShowMap(!showMap)}
          onToggleView={setView}
        />
      )}
    </>
  );
}
