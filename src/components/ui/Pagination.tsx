import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const t = useTranslations('Home');
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return {
      pathname: baseUrl,
      search: params.toString()
    };
  };
  
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Show only 5 pages at a time
  const visiblePages = pages.filter(page => {
    if (page === 1 || page === totalPages) return true;
    return Math.abs(page - currentPage) <= 1;
  });

  // Add ellipsis where needed
  const pagesWithEllipsis = visiblePages.reduce((acc: (number | string)[], page, i) => {
    if (i > 0 && visiblePages[i - 1] !== page - 1) {
      acc.push('...');
    }
    acc.push(page);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between mx-auto w-full px-4 py-8">
      {/* Left (Previous) button */}
      <div className="flex-1">
        <Link
          href={createPageUrl(currentPage - 1)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 h-10 rounded-lg w-fit",
            "hover:bg-gray-100 transition-colors",
            currentPage === 1 && "pointer-events-none opacity-50"
          )}
          aria-label={t("common.previous")}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">{t("common.previous")}</span>
        </Link>
      </div>

      {/* Center (Page numbers) */}
      <div className="flex items-center gap-2">
        {pagesWithEllipsis.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                pageNum === currentPage
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              )}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Right (Next) button */}
      <div className="flex-1 flex justify-end">
        <Link
          href={createPageUrl(currentPage + 1)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 h-10 rounded-lg w-fit",
            "hover:bg-gray-100 transition-colors",
            currentPage === totalPages && "pointer-events-none opacity-50"
          )}
          aria-label={t("common.next")}
        >
          <span className="hidden sm:inline">{t("common.next")}</span>
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
} 