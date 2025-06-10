import {
  IconBuildingSkyscraper,
  IconLayoutGrid,
  IconLayoutList
} from "@tabler/icons-react";
import { ViewMode, ViewModeSelectorProps } from "../model/types";

import { Button } from "@heroui/react";
import { useTranslations } from "next-intl";

export const ViewModeSelector = ({
  currentMode,
  onModeChange
}: ViewModeSelectorProps) => {
  const t = useTranslations("ProjectDetails");

  const modes: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    {
      id: "list",
      icon: <IconLayoutList size={20} />,
      label: t("tabs.plans.viewModes.list")
    },
    {
      id: "floors",
      icon: <IconBuildingSkyscraper size={20} />,
      label: t("tabs.plans.viewModes.floors")
    },
    {
      id: "grid",
      icon: <IconLayoutGrid size={20} />,
      label: t("tabs.plans.viewModes.grid")
    }
  ];

  return (
    <div className="flex rounded-lg overflow-hidden border border-default-200">
      {modes.map(mode => (
        <Button
          key={mode.id}
          variant={currentMode === mode.id ? "solid" : "light"}
          color={currentMode === mode.id ? "primary" : "default"}
          className="rounded-none"
          onClick={() => onModeChange(mode.id)}
          startContent={mode.icon}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
};
