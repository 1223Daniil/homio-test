"use client";

import { DocumentCategory, ProjectDocument } from "@prisma/client";
import { IconFileText, IconTrash, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { Button } from "@heroui/react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DocumentUploadFormProps {
  projectId: string;
  initialDocuments?: ProjectDocument[];
  isSaving?: boolean;
  onSave?: (data: {
    documents: Omit<ProjectDocument, "createdAt" | "updatedAt" | "projectId">[];
  }) => Promise<void>;
}

export function DocumentUploadForm({
  projectId,
  initialDocuments = [],
  isSaving,
  onSave
}: DocumentUploadFormProps) {
  const t = useTranslations("Projects");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] =
    useState<ProjectDocument[]>(initialDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: fileName,
          url,
          type: "document",
          category: DocumentCategory.GENERAL
        })
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      const documentsResponse = await fetch(
        `/api/projects/${projectId}/documents`
      );
      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");
      const updatedDocuments = await documentsResponse.json();

      setDocuments(updatedDocuments);

      if (onSave) {
        await onSave({
          documents: updatedDocuments
        });
      }

      toast.success(t("documents.messages.documentUpload"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("documents.messages.documentUploadError")
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
        throw new Error("Failed to delete document");
      }

      const documentsResponse = await fetch(
        `/api/projects/${projectId}/documents`
      );
      if (!documentsResponse.ok) throw new Error("Failed to fetch documents");
      const updatedDocuments = await documentsResponse.json();

      setDocuments(updatedDocuments);

      if (onSave) {
        await onSave({
          documents: updatedDocuments
        });
      }

      toast.success(t("documents.messages.documentDelete"));
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("documents.messages.documentDeleteError")
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
      await handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
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
          accept=".pdf,.doc,.docx"
          onChange={e => e.target.files && handleFileUpload(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-2">
          <IconUpload
            size={24}
            className={isDragging ? "text-primary" : "text-default-400"}
          />
          <p className="text-sm text-default-500">
            {isLoading
              ? t("documents.form.uploading")
              : t("documents.form.uploadTitle")}
          </p>
          <p className="text-xs text-default-400">PDF, DOC, DOCX (max 20MB)</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
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
      </div>
    </div>
  );
}
