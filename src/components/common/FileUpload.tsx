"use client";

import { Button, Progress } from "@heroui/react";

import { IconUpload } from "@tabler/icons-react";
import { useState } from "react";

interface FileUploadProps {
  onUpload: (url: string) => void;
  folder?: string;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload = ({
  onUpload,
  folder = "uploads",
  accept = "image/*",
  multiple = false
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (files: FileList) => {
    try {
      setUploading(true);
      setProgress(0);

      const fileArray = Array.from(files);

      const uploadSingleFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        return await response.json();
      };

      const uploadPromises = fileArray.map(file => uploadSingleFile(file));
      const results = await Promise.all(uploadPromises);

      results.forEach(data => {
        onUpload(data.url);
      });

      setProgress(100);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={e => e.target.files && handleUpload(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button
          as="span"
          color="secondary"
          variant="flat"
          startContent={<IconUpload size={18} />}
          isLoading={uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      </label>
      {uploading && <Progress value={progress} className="mt-2" />}
    </div>
  );
};
