"use client";

import { Button, Card, CardBody, Image } from "@heroui/react";
import {
  DocumentCategory,
  Project,
  ProjectDocument,
  ProjectMedia
} from "@prisma/client";
import {
  IconFileText,
  IconMapPin,
  IconTrash,
  IconUpload
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import MasterPlanEditor from "../MasterPlanEditor";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface MarketingDocumentsFormProps {
  projectId: string;
  initialDocuments?: ProjectDocument[];
  isSaving?: boolean;
  onSave?: (
    data: Partial<
      Project & {
        documents: ProjectDocument[];
      }
    >
  ) => Promise<void>;
}

export function MarketingDocumentsForm({
  projectId,
  initialDocuments = [],
  isSaving,
  onSave
}: MarketingDocumentsFormProps) {
  const t = useTranslations("Projects");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<ProjectDocument[]>(
    initialDocuments.filter(
      doc => doc.category === DocumentCategory.MASTER_PLAN
    )
  );
  const [mediaFiles, setMediaFiles] = useState<ProjectMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMediaForMarkup, setSelectedMediaForMarkup] =
    useState<ProjectMedia | null>(null);

  useEffect(() => {
    fetchMediaFiles();
  }, [projectId]);

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/media`);
      if (!response.ok) throw new Error("Failed to fetch media");
      const allMedia = await response.json();

      const masterPlanMedia = allMedia.filter(
        (media: ProjectMedia) => media.category === DocumentCategory.MASTER_PLAN
      );
      setMediaFiles(masterPlanMedia);
    } catch (error) {
      console.error("Fetch media error:", error);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const { url } = await uploadResponse.json();
      const fileName = file.name;

      const isImage = file.type.startsWith("image/");

      if (isImage) {
        const mediaResponse = await fetch(`/api/projects/${projectId}/media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: fileName,
            url,
            type: "photo",
            category: DocumentCategory.MASTER_PLAN
          })
        });

        if (!mediaResponse.ok) {
          throw new Error("Failed to save media");
        }

        const newMedia = await mediaResponse.json();
        setMediaFiles(prev => [...prev, newMedia]);
      } else {
        const response = await fetch(`/api/projects/${projectId}/documents`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title: fileName,
            url,
            type: "presentation",
            category: DocumentCategory.MASTER_PLAN
          })
        });

        if (!response.ok) {
          throw new Error("Failed to save document");
        }
      }

      const documentsResponse = await fetch(
        `/api/projects/${projectId}/documents`
      );
      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");
      const allDocuments = await documentsResponse.json();

      const masterPlanDocuments = allDocuments.filter(
        (doc: ProjectDocument) => doc.category === DocumentCategory.MASTER_PLAN
      );

      setDocuments(masterPlanDocuments);

      if (onSave) {
        await onSave({
          documents: allDocuments
        });
      }

      toast.success(
        isImage
          ? t("messages.success.imageUploaded")
          : t("messages.success.documentUploaded")
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/documents/${documentId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete document");
      }

      // Получаем актуальный список документов
      const documentsResponse = await fetch(
        `/api/projects/${projectId}/documents`
      );
      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");
      const allDocuments = await documentsResponse.json();

      // Фильтруем только маркетинговые документы
      const marketingDocuments = allDocuments.filter(
        (doc: ProjectDocument) => doc.category === DocumentCategory.MASTER_PLAN
      );

      setDocuments(marketingDocuments);

      if (onSave) {
        await onSave({
          documents: allDocuments
        });
      }

      toast.success(t("messages.success.documentDeleted"));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("messages.error.documentDelete")
      );
    }
  };

  const handleRemoveMedia = async (mediaId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/media/${mediaId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete media");
      }

      setMediaFiles(prev => prev.filter(media => media.id !== mediaId));
      toast.success(t("messages.success.imageDeleted"));
    } catch (error) {
      console.error("Delete media error:", error);
      toast.error(
        error instanceof Error ? error.message : t("messages.error.imageDelete")
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        await handleFileUpload(file);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-default-700">
        {t("form.masterPlans")}
      </p>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? "border-primary bg-primary/10" : "border-default-200 hover:border-primary hover:bg-primary/5"}
        `}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="application/pdf,image/*"
          onChange={e => {
            const file = e.target.files?.[0] || null;
            handleFileUpload(file);
          }}
        />
        <div className="flex flex-col items-center gap-2">
          <IconUpload
            size={24}
            className={isDragging ? "text-primary" : "text-default-400"}
          />
          <p className="text-sm text-default-500">
            {isLoading ? t("marketing.media.uploading") : t("form.masterPlans")}
          </p>
          <p className="text-xs text-default-400">
            {t("form.masterPlansPlaceholder")}
          </p>
        </div>
      </div>
      {/* Documents List */}
      {documents.map(doc => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg bg-default-100"
        >
          <div className="flex items-center gap-2">
            <IconFileText size={20} className="text-primary" />
            <div>
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-primary transition-colors"
              >
                {doc.title}
              </a>
            </div>
          </div>

          <Button
            isIconOnly
            size="sm"
            color="danger"
            variant="light"
            onClick={() => doc.id && handleRemoveDocument(doc.id)}
          >
            <IconTrash size={16} />
          </Button>
        </div>
      ))}
      {/* Images Grid */}
      {mediaFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-default-700">Images</p>
          <div className="grid grid-cols-3 gap-4">
            {mediaFiles.map(media => (
              <div key={media.id} className="relative group aspect-square">
                <img
                  src={media.url}
                  alt={media.title || ""}
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      color="primary"
                      variant="solid"
                      className="opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => setSelectedMediaForMarkup(media)}
                    >
                      <IconMapPin size={16} />
                    </Button>

                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      variant="solid"
                      className="opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => media.id && handleRemoveMedia(media.id)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно для разметки изображения */}
      {selectedMediaForMarkup && (
        <MasterPlanEditor
          isOpen={!!selectedMediaForMarkup}
          onClose={() => setSelectedMediaForMarkup(null)}
          imageUrl={selectedMediaForMarkup.url}
          projectId={projectId}
          mediaId={selectedMediaForMarkup.id}
        />
      )}
    </div>
  );
}
