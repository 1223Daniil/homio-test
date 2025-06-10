"use client";

import { useState, useRef, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, Image, Film, File } from "lucide-react";
import { Button, Progress } from "@heroui/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type FileType = "image" | "video" | "document" | "any";

export interface FileUploaderProps {
  onUpload: (fileData: UploadedFile) => void;
  onError?: (error: string) => void;
  accept?: FileType | FileType[];
  maxSize?: number; // в байтах
  maxFiles?: number;
  folder?: string;
  className?: string;
  buttonText?: string;
  dropzoneText?: string;
  disabled?: boolean;
}

export interface UploadedFile {
  url: string;
  key: string;
  size: number;
  type: string;
  filename: string;
}

const FileTypeIcons = {
  image: <Image alt="image" className="h-6 w-6" />,
  video: <Film className="h-6 w-6" />,
  document: <FileText className="h-6 w-6" />,
  default: <File className="h-6 w-6" />
};

export function FileUploader({
  onUpload,
  onError,
  accept = "any",
  maxSize = 10 * 1024 * 1024, // 10MB по умолчанию
  maxFiles = 1,
  folder = "content",
  className,
  buttonText = "Выбрать файл",
  dropzoneText = "Перетащите файл сюда или нажмите для выбора",
  disabled = false
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Определяем принимаемые типы файлов
  const getAcceptedFileTypes = useCallback(() => {
    const acceptMap: Record<FileType, Record<string, string[]>> = {
      image: {
        "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]
      },
      video: {
        "video/*": [".mp4", ".mov", ".avi", ".webm"]
      },
      document: {
        "application/pdf": [".pdf"],
        "application/msword": [".doc"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        "text/plain": [".txt"]
      },
      any: {}
    };

    if (accept === "any") {
      return {
        ...acceptMap.image,
        ...acceptMap.video,
        ...acceptMap.document
      };
    }

    if (Array.isArray(accept)) {
      return accept.reduce((acc, type) => {
        return { ...acc, ...acceptMap[type] };
      }, {});
    }

    return acceptMap[accept];
  }, [accept]);

  // Функция для симуляции прогресса загрузки
  const simulateProgress = useCallback(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 100);
    progressIntervalRef.current = interval;
    return interval;
  }, []);

  // Функция для загрузки файла
  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      const progressInterval = simulateProgress();

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", Array.isArray(accept) ? accept[0] || "any" : accept || "any");
        formData.append("folder", folder);
        formData.append("maxSize", maxSize.toString());

        const response = await fetch("/api/content/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Ошибка загрузки файла");
        }

        const data = await response.json();
        
        // Завершаем прогресс
        clearInterval(progressInterval);
        setProgress(100);
        
        // Небольшая задержка перед завершением для отображения 100%
        setTimeout(() => {
          setIsUploading(false);
          setProgress(0);
          onUpload(data);
        }, 500);
        
        return data;
      } catch (error) {
        clearInterval(progressInterval);
        setIsUploading(false);
        setProgress(0);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Произошла ошибка при загрузке файла";
        
        toast.error(errorMessage);
        if (onError) onError(errorMessage);
        
        return null;
      }
    },
    [accept, folder, maxSize, onUpload, onError, simulateProgress]
  );

  // Настройка dropzone
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await uploadFile(acceptedFiles[0] as File);
      }
    },
    accept: getAcceptedFileTypes(),
    maxSize,
    maxFiles,
    disabled: isUploading || disabled,
    multiple: maxFiles > 1
  });

  // Обработка отклоненных файлов
  if (fileRejections.length > 0) {
    const rejection = fileRejections[0];
    const errorMessage = rejection?.errors[0]?.message || "Файл не соответствует требованиям";
    toast.error(errorMessage);
    if (onError) onError(errorMessage);
  }

  // Определяем иконку в зависимости от типа файла
  const getFileTypeIcon = () => {
    if (Array.isArray(accept)) {
      return accept.length === 1 
        ? FileTypeIcons[accept[0] as FileType] || FileTypeIcons.default
        : FileTypeIcons.default;
    }
    
    return accept !== "any" 
      ? FileTypeIcons[accept] || FileTypeIcons.default
      : FileTypeIcons.default;
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50 hover:bg-gray-50",
          isUploading && "pointer-events-none opacity-70",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <>
              <Upload className="h-10 w-10 text-primary animate-pulse" />
              <p className="text-sm text-gray-500">Загрузка файла...</p>
            </>
          ) : (
            <>
              {getFileTypeIcon()}
              <p className="text-sm text-gray-500">{dropzoneText}</p>
              <Button 
                type="button" 
                variant="light" 
                size="sm"
                disabled={disabled}
              >
                {buttonText}
              </Button>
            </>
          )}
        </div>
        
        {isUploading && (
          <div className="w-full mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-center mt-1 text-gray-500">
              {progress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент для отображения предпросмотра загруженного файла
export interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  className?: string;
}

export function FilePreview({ file, onRemove, className }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  
  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-gray-200", className)}>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      {isImage ? (
        <img
          src={file.url}
          alt={file.filename || "image"}  
          className="w-full h-full object-cover"
        />
      ) : isVideo ? (
        <video
          src={file.url}
          controls
          className="w-full h-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 h-full">
          <FileText className="h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 truncate max-w-full">
              {file.filename || "file"}
          </p>
        </div>
      )}
    </div>
  );
} 