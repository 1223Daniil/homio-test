import {
  Box,
  ImageList,
  ImageListItem,
  Paper,
  Typography
} from "@mui/material";
import { ProjectMedia } from "@prisma/client";

interface ImageGalleryProps {
  images: ProjectMedia[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Project Gallery
      </Typography>

      <ImageList sx={{ width: "100%", height: "auto" }} cols={3} gap={8}>
        {images.map((item, index) => (
          <ImageListItem key={index}>
            <img
              src={item.url}
              alt={item.title || ""}
              loading="lazy"
              style={{ borderRadius: 4 }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Paper>
  );
}
