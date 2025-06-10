import { Button } from "@heroui/react";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export function PageHeader({
  title,
  description,
  actions,
  backButton
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {backButton && (
            <Button
              variant="light"
              color="default"
              size="sm"
              startContent={backButton.icon}
              className="mb-2"
              onClick={backButton.onClick}
            >
              {backButton.label}
            </Button>
          )}
          <h1 className="text-2xl font-bold text-default-900">{title}</h1>
          {description && (
            <p className="text-default-500 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}
