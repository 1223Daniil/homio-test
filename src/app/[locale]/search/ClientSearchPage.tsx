"use client";

import { Container } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { SearchResultsMap } from "@/components/SearchResultsMap";
import { ProjectCardForPage } from "@/components/projects/ProjectCardForPage";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import { SearchForm } from "@/components/search/SearchForm";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Map } from "lucide-react";
import type { ProjectWithRelations } from "./types";

// Фоновое изображение с blur placeholder
const heroImage = {
  url: "/images/hero/banner-1.webp",
  alt: "Luxury properties in Thailand",
  blurDataURL: "data:image/jpeg;base64,..."
};

interface ClientSearchPageProps {
  initialResults: ProjectWithRelations[];
}

export function ClientSearchPage({ initialResults }: ClientSearchPageProps) {
  const t = useTranslations("Search");
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] =
    useState<ProjectWithRelations[]>(initialResults);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(true);

  const updateMapMarkers = useCallback(
    (items: ProjectWithRelations[]) => {
      const markers = items
        .filter(item => item.location?.latitude && item.location?.longitude)
        .map(item => ({
          id: item.id,
          lat: item.location!.latitude,
          lng: item.location!.longitude,
          title: item.translations[0]?.name || t("untitled"),
          type: "project" as const,
          data: item
        }));

      setMapMarkers(markers);
    },
    [t]
  );

  const handleSearch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/projects/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyType: searchParams.get("propertyType"),
          bedrooms: searchParams.get("bedrooms"),
          priceMin: searchParams.get("priceMin"),
          priceMax: searchParams.get("priceMax"),
          query: searchParams.get("q"),
          page: 1,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setProjects(data.projects);
      updateMapMarkers(data.projects);
    } catch (error) {
      console.error("Search error:", error);
      setError(t("messages.error"));
      toast.error(t("messages.error"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, t, updateMapMarkers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {/* Hero Background */}
        <div className="absolute inset-0 h-[400px] overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Search Form */}
        <div className="relative pt-32 pb-20">
          <SearchForm onSearch={handleSearch} />
        </div>
      </div>

      {/* Map Toggle Button */}
      <div className="flex justify-center -mt-8 mb-8">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow text-gray-700 font-medium"
        >
          <Map className="w-5 h-5" />
          {showMap ? t("hideMap") : t("showMap")}
        </button>
      </div>

      {/* Results Section */}
      <Container size="xl" py="xl">
        <LoadingOverlay visible={loading} />

        <div
          className={cn(
            "grid gap-8",
            showMap ? "grid-cols-[1fr_400px]" : "grid-cols-1"
          )}
        >
          {/* Results List */}
          <motion.div
            className={cn(
              "grid gap-6",
              showMap ? "grid-cols-1" : "grid-cols-2"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {error ? (
                <div className="col-span-full p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              ) : projects.length === 0 ? (
                <div className="col-span-full p-4 bg-gray-50 text-gray-600 rounded-lg">
                  {t("noResults")}
                </div>
              ) : (
                projects.map(project => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProjectCardForPage project={project} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map */}
          {showMap && (
            <div className="sticky top-6 h-[calc(100vh-6rem)]">
              <SearchResultsMap markers={mapMarkers} activeType="project" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
