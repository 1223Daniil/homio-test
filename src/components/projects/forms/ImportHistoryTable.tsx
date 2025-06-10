"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Spinner,
  Pagination,
  Chip,
  Button
} from "@heroui/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ru, enUS } from "date-fns/locale";

interface ImportHistoryTableProps {
  projectId: string;
  locale: string;
}

interface ImportRecord {
  id: string;
  createdAt: string;
  userId: string;
  userName: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  totalRows: number;
  successCount: number;
  failedCount: number;
  type: string;
  fileName?: string;
}

export function ImportHistoryTable({ projectId, locale }: ImportHistoryTableProps) {
  const t = useTranslations();
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  const dateLocale = locale === "ru" ? ru : enUS;

  const statusColorMap = {
    SUCCESS: "success",
    PARTIAL: "warning",
    FAILED: "danger"
  };

  const fetchImportHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/imports?page=${page}&limit=${rowsPerPage}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch import history");
      }
      
      const data = await response.json();
      setImports(data.imports);
      setTotalPages(Math.ceil(data.total / rowsPerPage));
    } catch (error) {
      console.error("Error fetching import history:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImportHistory();
  }, [projectId, page]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: dateLocale });
    } catch (e) {
      return dateString;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const renderStatusChip = (status: ImportRecord["status"]) => {
    return (
      <Chip 
        color={statusColorMap[status] as any} 
        variant="flat" 
        size="sm"
      >
        {t(`Projects.import.historyTable.status.${status.toLowerCase()}`)}
      </Chip>
    );
  };

  if (isLoading && imports.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (imports.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 text-default-500">
        <p className="mb-4">{t("Projects.import.historyTable.noHistory")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("Projects.import.historyTable.historyTitle")}</h3>
        <Button 
          variant="light" 
          size="sm" 
          onClick={fetchImportHistory}
          isLoading={isLoading}
        >
          {t("Projects.import.historyTable.refresh")}
        </Button>
      </div>
      
      <Table aria-label="Import history table">
        <TableHeader>
          <TableColumn>{t("Projects.import.historyTable.date")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.user")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.type")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.statusTitle")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.total")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.success")}</TableColumn>
          <TableColumn>{t("Projects.import.historyTable.failed")}</TableColumn>
        </TableHeader>
        <TableBody>
          {imports.map((importRecord) => (
            <TableRow key={importRecord.id}>
              <TableCell>{formatDate(importRecord.createdAt)}</TableCell>
              <TableCell>{importRecord.userName || t("Projects.import.historyTable.unknownUser")}</TableCell>
              <TableCell>{t(`Projects.import.historyTable.types.${importRecord.type.toLowerCase()}`)}</TableCell>
              <TableCell>{renderStatusChip(importRecord.status)}</TableCell>
              <TableCell>{importRecord.totalRows}</TableCell>
              <TableCell>{importRecord.successCount}</TableCell>
              <TableCell>{importRecord.failedCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination 
            total={totalPages} 
            page={page} 
            onChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
} 