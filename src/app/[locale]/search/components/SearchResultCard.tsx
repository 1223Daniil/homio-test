import { Card, Button, Image } from "@heroui/react";
import {
  IconMapPin,
  IconDotsVertical,
  IconBookmark
} from "@tabler/icons-react";

interface SearchResultCardProps {
  title: string;
  price: string;
  pricePerSqm: string;
  project: string;
  location: string;
  distance: string;
  returnRate: string;
  imageUrl: string;
  developer: string;
  developerLogo: string;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  title,
  price,
  pricePerSqm,
  project,
  location,
  distance,
  returnRate,
  imageUrl,
  developer,
  developerLogo
}) => {
  return (
    <Card className="border border-gray-200 overflow-hidden h-[245px]">
      <div className="flex h-full">
        {/* Левая часть с изображением */}
        <div className="relative w-[280px] h-full">
          <span className="absolute top-3 left-3 bg-white/90 text-xs px-2 py-1 rounded-md z-10">
            {returnRate}
          </span>
          <Image
            src={imageUrl || "https://via.placeholder.com/280x200"}
            alt={project}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Центральная часть с информацией */}
        <div className="flex-1 p-4">
          <div>
            <h3 className="text-base font-medium">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-semibold">{price}</span>
              <span className="text-gray-500 text-sm">≈ {pricePerSqm}</span>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-purple-600">Project: "{project}"</p>
            <div className="flex items-center gap-1 text-gray-500 mt-1">
              <IconMapPin size={16} className="text-gray-400" />
              <span>{location}</span>
              <span className="text-gray-400">• {distance}</span>
            </div>
          </div>
        </div>

        {/* Правая часть с кнопками и логотипом */}
        <div className="w-[200px] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={developerLogo}
                alt={developer}
                className="w-8 h-8 object-contain"
              />
              <div className="text-sm">
                <div className="text-gray-500">Developer</div>
                <div>{developer}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-unit-8"
              >
                <IconDotsVertical size={18} />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-unit-8"
              >
                <IconBookmark size={18} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              variant="bordered"
              color="primary"
              size="sm"
            >
              Make a reservation
            </Button>
            <Button className="w-full" color="primary" size="sm">
              Request viewing
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
