import { GalleryIcon, LayoutIcon } from "../MediaFilters/MediaFilters";

import { Button } from "@heroui/button";
import { CgClose } from "react-icons/cg";
import { ElementType } from "react";
import UnitQuickActions from "@/widgets/UnitQuickActions";
import styles from "./MediaGalleryHeader.module.css";
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
}

const MediaGalleryHeader = ({ isOpen, setIsOpen }: IProps) => {
  const t = useTranslations("UnitDetail");

  return (
    <div className={`${styles.mediaGalleryHeader}`}>
      <div className={`${styles.tabContainer}`}>
        <Tab
          Icon={GalleryIcon}
          isActive={isOpen.view === "Gallery"}
          onClick={() => setIsOpen({ isOpen: true, view: "Gallery" })}
        >
          {t("unit-modal.gallery")}
        </Tab>

        <Tab
          Icon={LayoutIcon}
          isActive={isOpen.view === "Layout"}
          onClick={() => setIsOpen({ isOpen: true, view: "Layout" })}
        >
          {t("unit-modal.layout")}
        </Tab>
      </div>

      <div className={`${styles.actions}`}>
        <UnitQuickActions
          className={styles.unitQuickActions}
          showTitle={false}
        />

        <Button className={`${styles.request}`}>
          {t("request-viewing.buttons.request-viewing")}
        </Button>

        <button
          className={`${styles.close}`}
          onClick={() => setIsOpen({ isOpen: false, view: null })}
        >
          <CgClose />
        </button>
      </div>
    </div>
  );
};

export default MediaGalleryHeader;

interface TabProps {
  Icon: ElementType;
  children: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const Tab = ({ Icon, children, isActive, onClick }: TabProps) => {
  return (
    <button
      className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
      onClick={onClick}
    >
      <Icon className={`${styles.tabIcon}`} />
      <span>{children}</span>
    </button>
  );
};
