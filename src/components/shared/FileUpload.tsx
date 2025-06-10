"use client";

import { Button, Progress } from "@heroui/react";
import { IconPlus, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { MediaCategory } from "@prisma/client";
import { ProjectMedia } from "@/types/project";
import { handleFileUpload } from "@/lib/upload";
import { toast } from "sonner";

interface FileUploadProps {
  entityId: string;
  category: MediaCategory;
  type: "photo" | "video";
  onUploadSuccess: (media: ProjectMedia) => void;
  buttonText: string;
  accept: string;
  multiple?: boolean;
  className?: string;
  thumbnailUrl?: string;
}

const MAX_FILE_SIZE = 1.5 * 1024 * 1024 * 1024; // 1.5GB

export function FileUpload({
  entityId,
  category,
  type,
  onUploadSuccess,
  buttonText,
  accept,
  multiple = false,
  className = "",
  thumbnailUrl
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Проверка размера файла
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Файл ${file.name} превышает максимальный размер в 20MB`);
        return;
      }
    }

    setIsUploading(true);
    const fileArray = Array.from(files);

    try {
      // Загружаем файлы последовательно и собираем результаты
      for (const file of fileArray) {
        const result = await handleFileUpload(
          file,
          entityId,
          category,
          type,
          setUploadProgress,
          "project",
          thumbnailUrl
        );

        // После успешной загрузки вызываем колбэк
        onUploadSuccess(result as ProjectMedia);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
      // Очищаем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-default-600">{fileName}</span>
            <span className="text-sm text-default-600">{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" color="primary" />
        </div>
      ))}

      {/* Upload Button */}
      <Button
        variant="flat"
        color="primary"
        startContent={<IconPlus size={20} />}
        onClick={() => fileInputRef.current?.click()}
        className={className}
        isDisabled={isUploading}
      >
        <span className="text-default-900 dark:text-white">{buttonText}</span>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={handleFileSelect}
        />
      </Button>
    </div>
  );
}
