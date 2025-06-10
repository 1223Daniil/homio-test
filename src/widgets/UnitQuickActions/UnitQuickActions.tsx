import { BsFiletypePdf } from "react-icons/bs";
import { GoShareAndroid } from "react-icons/go";
import { HTMLAttributes } from "react";
import { IoBookmarkOutline } from "react-icons/io5";
import { RiPlayListAddLine } from "react-icons/ri";
import styles from "./UnitQuickActions.module.css";
import { useTranslations } from "next-intl";

const actionsIcons = [
  BsFiletypePdf,
  GoShareAndroid,
  RiPlayListAddLine,
  IoBookmarkOutline
];

interface UnitQuickActionsProps extends HTMLAttributes<HTMLDivElement> {
  showTitle?: boolean;
}

const UnitQuickActions = ({
  className,
  showTitle = true,
  ...props
}: UnitQuickActionsProps) => {
  const t = useTranslations("UnitDetail");

  return (
    <div className={`${styles.unitQuickActions} ${className}`} {...props}>
      {actionsIcons.map((Icon, index) => (
        <button className={styles.unitQuickAction} key={index}>
          <Icon />
          {showTitle && <p>{t(`quick-actions.${index}`)}</p>}
        </button>
      ))}
    </div>
  );
};

export default UnitQuickActions;
