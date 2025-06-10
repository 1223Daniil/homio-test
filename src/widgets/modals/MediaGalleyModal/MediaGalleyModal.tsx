import { AnimatePresence, motion } from "framer-motion";

import { FloorPlan } from "@prisma/client";
import MediaGalleryGrid from "@/widgets/MediaGalleryGrid";
import MediaGalleryHeader from "@/shared/components/MediaGalleryHeader";
import UnitLayoytViewer from "@/widgets/UnitLayoytViewer";
import styles from "./MediaGalleyModal.module.css";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface IProps {
  isOpen: {
    isOpen: boolean;
    view: "Gallery" | "Layout" | "3d" | null;
  };
  setIsOpen: (isOpen: {
    isOpen: boolean;
    view: "Gallery" | "Layout" | "3d" | null;
  }) => void;
  images: {
    url: string;
    type: string;
    category: string;
    interior: boolean;
  }[];
  floorPlans: {
    currentUnitId: string;
    floorPlans: FloorPlan[];
    layoutImage: string | null;
  };
}

const MediaGalleyModal = ({
  isOpen,
  setIsOpen,
  images,
  floorPlans
}: IProps) => {
  const [view, setView] = useState<"all" | "interior" | "exterior">("all");
  const [layoutType, setLayoutType] = useState<"layout" | "floorPlan">(
    "layout"
  );

  const t = useTranslations("UnitDetail.unit-modal");

  console.log(isOpen, layoutType);

  return (
    <AnimatePresence>
      {isOpen.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: 100,
            transition: {
              duration: 0.3,
              ease: "easeInOut"
            }
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
          className={`${styles.overlay}`}
        >
          <div className={`${styles.modal}`}>
            <MediaGalleryHeader isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className={`${styles.content}`}>
              <div className={`${styles.filterContainer}`}>
                {isOpen.view === "Gallery" ? (
                  <>
                    <MediaGalleyFilter
                      isActive={view === "all"}
                      onClick={() => {
                        setView("all");
                      }}
                    >
                      {t("gallery-filters.all")}
                    </MediaGalleyFilter>
                    <MediaGalleyFilter
                      isActive={view === "interior"}
                      onClick={() => {
                        setView("interior");
                      }}
                    >
                      {t("gallery-filters.interior")}
                    </MediaGalleyFilter>
                    <MediaGalleyFilter
                      isActive={view === "exterior"}
                      onClick={() => {
                        setView("exterior");
                      }}
                    >
                      {t("gallery-filters.exterior")}
                    </MediaGalleyFilter>
                  </>
                ) : (
                  <>
                    <MediaGalleyFilter
                      isActive={layoutType === "layout"}
                      onClick={() => setLayoutType("layout")}
                    >
                      {t("floorplans-filters.layout")}
                    </MediaGalleyFilter>
                    <MediaGalleyFilter
                      isActive={layoutType === "floorPlan"}
                      onClick={() => setLayoutType("floorPlan")}
                    >
                      {t("floorplans-filters.floor-plan")}
                    </MediaGalleyFilter>
                  </>
                )}
              </div>

              <div className={`${styles.mediaContainer}`}>
                {isOpen.view === "Gallery" && (
                  <MediaGalleryGrid images={images} filter={view} />
                )}
                {isOpen.view === "Layout" && (
                  <UnitLayoytViewer floorPlans={floorPlans} type={layoutType} />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaGalleyModal;

interface IMediaGalleyFilter {
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const MediaGalleyFilter = ({
  children,
  isActive,
  onClick
}: IMediaGalleyFilter) => {
  return (
    <div
      className={`${styles.filter} ${isActive ? styles.filterActive : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
