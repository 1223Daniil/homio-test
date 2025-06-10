import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Badge
} from "@heroui/react";
import { IconAlertCircle } from "@tabler/icons-react";

interface PendingImport {
  id: string;
  mappingId: string;
  totalUnits: number;
  createdAt: string;
}

interface PendingImportsNotificationProps {
  projectId: string;
}

export function PendingImportsNotification({ projectId }: PendingImportsNotificationProps) {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingImports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/units/import/pending`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setPendingImports(data.data || []);
      } catch (error) {
        console.error("Error fetching pending imports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingImports();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (pendingImports.length === 0) {
    return null;
  }

  const handleGoToConfiguration = () => {
    router.push(`/${locale}/projects/${projectId}/import?tab=configuration&autoOpen=true`);
  };

  return (
    <Card className="mb-6 border-warning">
      <CardHeader className="flex items-center gap-2 bg-warning-50 text-warning-700">
        <IconAlertCircle size={20} />
        <span className="font-semibold">
          {t("Units.import.notifications.pendingImport")}
        </span>
        <Badge color="warning" variant="flat" className="ml-auto">
          {pendingImports.length}
        </Badge>
      </CardHeader>
      <CardBody>
        <p className="mb-4">
          {t("Units.import.notifications.pendingImportDescription", {
            count: pendingImports.reduce((total, imp) => total + imp.totalUnits, 0)
          })}
        </p>
        <Button 
          color="warning" 
          onClick={handleGoToConfiguration}
        >
          {t("Units.import.fieldMappings.reviewAndApprove")}
        </Button>
      </CardBody>
    </Card>
  );
} 