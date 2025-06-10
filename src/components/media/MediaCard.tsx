"use client";

import { Button, Card, Image } from "@heroui/react";

import { IconTrash } from "@tabler/icons-react";

interface MediaCardProps {
  media: {
    id: string;
    url: string;
    title?: string | null;
  };
  onDelete: () => void;
}

export function MediaCard({ media, onDelete }: MediaCardProps) {
  return (
    <Card className="relative group">
      <Image
        src={media.url}
        alt={media.title || "Media"}
        className="w-full h-[200px] object-cover"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
        <Button isIconOnly color="danger" variant="flat" onPress={onDelete}>
          <IconTrash size={20} />
        </Button>
      </div>
    </Card>
  );
}
