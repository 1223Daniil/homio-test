import { Box, Typography } from "@mui/material";
import { useDropzone } from "react-dropzone";
import { useTranslations } from "next-intl";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ImageUploadProps {
  value: string[];
  onChange: (files: string[]) => void;
  multiple?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  multiple = false
}: ImageUploadProps) {
  const t = useTranslations("pages.projects.form.gallery");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"]
    },
    multiple,
    onDrop: (acceptedFiles: File[]) => {
      // В реальном приложении здесь будет загрузка на сервер
      const urls = acceptedFiles.map(file => URL.createObjectURL(file));
      onChange([...value, ...urls]);
    }
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: "2px dashed",
        borderColor: isDragActive ? "primary.main" : "grey.300",
        borderRadius: 2,
        p: 3,
        textAlign: "center",
        cursor: "pointer",
        bgcolor: isDragActive ? "action.hover" : "background.paper",
        "&:hover": {
          bgcolor: "action.hover"
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        {t("dragDrop")}
      </Typography>

      {value.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
          {value.map((url, index) => (
            <Box
              key={index}
              component="img"
              src={url}
              alt={`Uploaded ${index + 1}`}
              sx={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 1
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
