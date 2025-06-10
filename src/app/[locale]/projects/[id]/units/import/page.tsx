"use client";

import { Button, Card, Spinner, Textarea, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@heroui/react";
import { IconArrowLeft, IconUpload, IconFileCheck, IconAlertCircle, IconCheck, IconBuildingSkyscraper, IconTable } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useRouter } from "@/config/i18n";
import { UnitsImportForm } from "@/components/projects/forms/UnitsImportForm";

export default function ImportUnitsPage() {
  const { theme } = useTheme();
  const t = useTranslations("Units");
  const router = useRouter();
  const { id, locale } = useParams() as { id: string; locale: string };
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [buildings, setBuildings] = useState<{ id: string; name: string }[]>([]);
  const [pendingImports, setPendingImports] = useState<any[]>([]);
  const [hasPendingImports, setHasPendingImports] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch project name
        const projectResponse = await fetch(`/api/projects/${id}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const translation = projectData.translations?.find(
            (t: any) => t.language === locale
          );
          setProjectName(translation?.name || t("untitled"));
          
          // Fetch buildings
          const buildingsResponse = await fetch(`/api/projects/${id}/buildings`);
          if (buildingsResponse.ok) {
            const buildingsData = await buildingsResponse.json();
            setBuildings(buildingsData.map((building: any) => ({
              id: building.id,
              name: building.name || `${t("building")} ${building.id.substring(0, 4)}`
            })));
          }
          
          // Fetch pending imports
          const pendingImportsResponse = await fetch(`/api/projects/${id}/units/import/pending`);
          if (pendingImportsResponse.ok) {
            const pendingImportsData = await pendingImportsResponse.json();
            setPendingImports(pendingImportsData.data || []);
            setHasPendingImports(pendingImportsData.data?.length > 0);
          }
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        toast.error(t("errors.unknown"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, locale, t]);

  const handleProcessPending = async (importId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${id}/units/import/process-pending?importId=${importId}`, {
        method: "POST"
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Processing failed");
      }
      
      toast.success(result.message || t("import.success"));
      
      // Refresh pending imports
      const pendingImportsResponse = await fetch(`/api/projects/${id}/units/import/pending`);
      if (pendingImportsResponse.ok) {
        const pendingImportsData = await pendingImportsResponse.json();
        setPendingImports(pendingImportsData.data || []);
        setHasPendingImports(pendingImportsData.data?.length > 0);
      }
      
    } catch (error) {
      console.error("Error processing pending import:", error);
      toast.error(t("import.errors.processingFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/projects/${id}/units`}
          className="flex items-center text-default-500 hover:text-primary transition-colors"
        >
          <IconArrowLeft size={16} className="mr-1" />
          {t("backToUnits")}
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2 text-default-900 dark:text-white">
          {t("import.title")} - {projectName}
        </h1>
        <p className="text-default-500">{t("import.subtitle")}</p>
      </div>

      {hasPendingImports && (
        <Card className="mb-8 bg-warning-50 dark:bg-warning-900/20 border-warning">
          <div className="p-4">
            <div className="flex items-start">
              <IconAlertCircle size={24} className="text-warning mr-3 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-default-900 dark:text-white mb-2">
                  {t("import.pendingImports.title")}
                </h3>
                <p className="text-default-700 dark:text-default-300 mb-4">
                  {t("import.pendingImports.description")}
                </p>
                
                <div className="overflow-x-auto">
                  <Table aria-label="Pending imports">
                    <TableHeader>
                      <TableColumn>{t("import.pendingImports.date")}</TableColumn>
                      <TableColumn>{t("import.pendingImports.units")}</TableColumn>
                      <TableColumn>{t("import.pendingImports.importedBy")}</TableColumn>
                      <TableColumn>{t("import.pendingImports.actions")}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {pendingImports.map((importItem) => (
                        <TableRow key={importItem.id}>
                          <TableCell>
                            {new Date(importItem.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip color="primary" variant="flat">
                              {importItem.totalUnits}
                            </Chip>
                          </TableCell>
                          <TableCell>{importItem.importedBy}</TableCell>
                          <TableCell>
                            <Button 
                              color="primary" 
                              size="sm"
                              onClick={() => handleProcessPending(importItem.id)}
                            >
                              {t("import.pendingImports.process")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Tabs aria-label="Import options">
        <Tab 
          key="import" 
          title={
            <div className="flex items-center gap-2">
              <IconUpload size={18} />
              <span>{t("import.tabs.import")}</span>
            </div>
          }
        >
          <Card>
            <UnitsImportForm 
              projectId={id} 
              buildings={buildings} 
              locale={locale as string} 
            />
          </Card>
        </Tab>
        <Tab 
          key="api" 
          title={
            <div className="flex items-center gap-2">
              <IconTable size={18} />
              <span>{t("import.tabs.api")}</span>
            </div>
          }
        >
          <Card className="p-6">
            <h2 className="text-xl font-medium mb-4 text-default-900 dark:text-white">
              {t("import.api.title")}
            </h2>
            <p className="text-default-700 dark:text-default-300 mb-4">
              {t("import.api.description")}
            </p>
            
            <div className="bg-default-50 dark:bg-default-900 p-4 rounded-md mb-6">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                <code>
                  {`POST /api/projects/${id}/units/import

{
  "units": [
    {
      "unit_number": "A101",
      "floor_number": 1,
      "building": "Building A",
      "layout_id": "1BS",
      "availability_status": "Available",
      "base_price_excl_vat": 4410000,
      "final_price_incl_vat": 4582000,
      "selling_price": 4582000,
      "unit_description": "One Bedroom Suite",
      "view_description": "Mountain View"
    }
  ],
  "updateExisting": true,
  "defaultBuildingId": "${buildings.length > 0 ? buildings[0].id : 'building-id'}"
}`}
                </code>
              </pre>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-medium text-default-900 dark:text-white">
                {t("import.api.authentication")}
              </h3>
              <p className="text-default-700 dark:text-default-300 mb-2">
                {t("import.api.authDescription")}
              </p>
              <div className="bg-default-50 dark:bg-default-900 p-4 rounded-md mb-6">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  <code>
                    {`x-api-token: YOUR_API_TOKEN`}
                  </code>
                </pre>
              </div>
              
              <Link 
                href="/docs/units-import-api" 
                target="_blank"
                className="text-primary hover:underline"
              >
                {t("import.api.readDocs")}
              </Link>
            </div>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
} 