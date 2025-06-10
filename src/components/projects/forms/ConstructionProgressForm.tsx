"use client";

import { Button, Card, Image, Input, Progress } from "@heroui/react";
import {
  IconPhoto,
  IconPlus,
  IconTrash,
  IconUpload
} from "@tabler/icons-react";
import { ProjectMedia, ProjectWithTranslation } from "@/types/project";
import {
  handleDescriptionUpdate,
  handleError,
  handleFileUpload,
  handleMediaDelete
} from "@/lib/upload";
import { useEffect, useRef, useState } from "react";

import { MediaCategory } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ProjectMedia {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  type: string;
  order: number;
  date?: string | null;
}

interface ConstructionProgressFormProps {
  project: ProjectWithTranslation;
  onSave: (data: Partial<ProjectWithTranslation>) => Promise<void>;
  isSaving: boolean;
  onUpdateDescription: (
    mediaId: string,
    description: string,
    date?: string
  ) => Promise<any>;
}

export function ConstructionProgressForm({
  project,
  onSave,
  isSaving,
  onUpdateDescription
}: ConstructionProgressFormProps) {
  const t = useTranslations("Projects");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>(
    {}
  );
  const [dates, setDates] = useState<{ [key: string]: string }>({});
  const [savingDescription, setSavingDescription] = useState<{
    [key: string]: boolean;
  }>({});
  const [photos, setPhotos] = useState<ProjectMedia[]>(
    project.media?.filter(
      m =>
        (m.type === "image" || m.type === "photo") &&
        m.category === MediaCategory.CONSTRUCTION_PROGRESS
    ) || []
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialDescriptions: { [key: string]: string } = {};
    const initialDates: { [key: string]: string } = {};
    photos.forEach(photo => {
      if (photo.id) {
        initialDescriptions[photo.id] = photo.description || "";
        initialDates[photo.id] = photo.date || "";
      }
    });
    setDescriptions(initialDescriptions);
    setDates(initialDates);
  }, [photos]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      const uploadPromises = fileArray.map(file =>
        handleFileUpload(
          file,
          project.id,
          MediaCategory.CONSTRUCTION_PROGRESS,
          "photo",
          setUploadProgress
        )
      );

      const uploadedMediaResults = await Promise.all(uploadPromises);

      setPhotos(prev => [...prev, ...uploadedMediaResults]);

      toast.success(t("messages.success.imageUploaded"));
    } catch (error) {
      handleError(error, "upload files");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async (mediaId: string) => {
    try {
      await handleMediaDelete(project.id, mediaId);
      setPhotos(prev => prev.filter(photo => photo.id !== mediaId));
      toast.success(t("messages.success.imageDeleted"));
    } catch (error) {
      handleError(error, "remove photo");
    }
  };

  const handleUpdateMediaDescription = async (
    mediaId: string,
    description: string,
    date: string
  ) => {
    if (!mediaId) return;

    setSavingDescription(prev => ({ ...prev, [mediaId]: true }));

    try {
      await handleDescriptionUpdate(
        mediaId,
        description,
        onUpdateDescription,
        date
      );
      setPhotos(prev =>
        prev.map(photo =>
          photo.id === mediaId ? { ...photo, description, date } : photo
        )
      );
      setDescriptions(prev => ({ ...prev, [mediaId]: description }));
      setDates(prev => ({ ...prev, [mediaId]: date }));
      toast.success(t("messages.success.descriptionUpdated"));
    } catch (error) {
      handleError(error, "update description");
    } finally {
      setSavingDescription(prev => ({ ...prev, [mediaId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mb-4">
          <div className="flex justify-between mb-2">
            <span>{fileName}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" color="primary" />
        </div>
      ))}

      {/* Photos Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {photos.map(photo => (
          <div key={photo.id} className="space-y-2">
            <Card className="relative group">
              <Image
                src={photo.url}
                alt={photo.title || ""}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={() => photo.id && handleRemovePhoto(photo.id)}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </Card>
            <div className="flex flex-col gap-2">
              <Input
                size="sm"
                type="date"
                placeholder="Select date"
                value={dates[photo.id] || ""}
                onChange={e =>
                  setDates(prev => ({
                    ...prev,
                    [photo.id]: e.target.value
                  }))
                }
                className="flex-1"
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-transparent border-1 border-default-200"
                }}
              />
              <Input
                size="sm"
                placeholder="Add description"
                value={descriptions[photo.id] || ""}
                onChange={e =>
                  setDescriptions(prev => ({
                    ...prev,
                    [photo.id]: e.target.value
                  }))
                }
                className="flex-1"
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-transparent border-1 border-default-200"
                }}
              />
              <Button
                size="sm"
                color="primary"
                isLoading={savingDescription[photo.id]}
                onClick={() =>
                  photo.id &&
                  handleUpdateMediaDescription(
                    photo.id,
                    descriptions[photo.id] || "",
                    dates[photo.id] || ""
                  )
                }
              >
                {t("forms.save")}
              </Button>
            </div>
          </div>
        ))}

        {/* Upload Button */}
        <div
          className="h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <IconPhoto size={24} className="mb-2" />
          <span>{t("forms.construction.addPhotos")}</span>
        </div>
      </div>

      {/* Кнопки формы */}
      <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
        <Button
          color="primary"
          className="px-8"
          type="submit"
          isLoading={isSaving || isUploading}
        >
          {t("forms.save")}
        </Button>
      </div>
    </div>
  );
}
