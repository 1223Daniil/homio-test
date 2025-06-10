import HeroSearch from "@/widgets/HeroSearch";
import Script from "next/script";
import { Suspense } from "react";
import { generateHomePageJsonLd } from "./jsonld";
import { getHeroSearchFiltersData } from "@/utils/db/getHeroSearchFiltersData";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("@/components/home/Footer"));
const HeroSection = dynamic(() => import("@/components/home/HeroSection"), {
  loading: () => <div className="h-[600px] bg-default-100 animate-pulse" />
});
export const revalidate = 3600;

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "ru" },
    { locale: "th" },
    { locale: "es" },
    { locale: "ar" },
    { locale: "cmn" },
    { locale: "fr" },
    { locale: "ind" }
  ];
}

export default async function HomePage({
  params
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("Home");
  const jsonLd = generateHomePageJsonLd();

  // Получаем все данные на сервере
  const [filterData, priceRange] = await Promise.all([
    getHeroSearchFiltersData(),
    fetchPriceRangeData()
  ]);

  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        strategy="afterInteractive"
      />

      <main className="min-h-screen overflow-x-hidden">
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection filterData={{ ...filterData, prices: priceRange }} />
        </Suspense>
        <Footer />
      </main>
    </>
  );
}

async function fetchPriceRangeData() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/api/units/price-range`,
      { next: { revalidate: 3600 } }
    );
    return await response.json();
  } catch (error) {
    console.error("Price range fetch failed:", error);
    return { min: 0, max: 10000000 };
  }
}

function HeroSkeleton() {
  return (
    <div className="h-screen bg-gray-100">
      <div className="h-[72px] bg-white border-b" />
      <div className="h-[calc(100vh-72px)] bg-gray-200 animate-pulse" />
    </div>
  );
}
