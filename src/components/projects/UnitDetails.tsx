import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  Tab,
  Tabs
} from "@heroui/react";
import {
  Icon3d,
  IconAirConditioning,
  IconArrowRight,
  IconAward,
  IconBath,
  IconBed,
  IconCamera,
  IconChevronLeft,
  IconChevronRight,
  IconCompass,
  IconDeviceTv,
  IconDroplet,
  IconElevator,
  IconFlame,
  IconGlass,
  IconHome2,
  IconPaint,
  IconParking,
  IconPaw,
  IconPhoto,
  IconRuler,
  IconRulerMeasure,
  IconShieldCheck,
  IconSmartHome,
  IconSofa,
  IconStairs,
  IconStar,
  IconSun,
  IconWheelchair,
  IconWifi,
  IconWindmill,
  IconX
} from "@tabler/icons-react";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface UnitLayout {
  id: string;
  name: string;
  description?: string;
  totalArea: number;
  livingArea?: number;
  balconyArea?: number;
  ceilingHeight?: number;
  bedrooms: number;
  bathrooms: number;
  windowCount?: number;
  orientation?: string;
  energyClass?: string;
  mainImage?: string;
  images?: Array<{
    url: string;
    title?: string;
    description?: string;
  }>;
  planImage?: string;
  tour3d?: string;
  features?: Array<{
    name: string;
    value: string;
  }>;
  furniture?: Array<{
    item: string;
    description: string;
  }>;
  finishes?: Array<{
    type: string;
    material: string;
  }>;
  advantages: string[];
}

interface Unit {
  id: string;
  number: string;
  status: string;
  floor: number;
  area?: number;
  bathrooms?: number;
  bedrooms?: number;
  price?: number;
  pricePerSqm?: number;
  windowView?: "sea" | "mountain" | "city" | "garden";
  location?: string;
  description?: string;
  features?: Array<{
    name: string;
    value: string;
  }>;
  hasBalcony?: boolean;
  hasParking?: boolean;
  hasStorage?: boolean;
  hasFurnished?: boolean;
  hasSmartHome?: boolean;
  hasSecuritySystem?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  hasWaterHeating?: boolean;
  hasGas?: boolean;
  hasInternet?: boolean;
  hasCableTV?: boolean;
  hasElevator?: boolean;
  hasWheelchairAccess?: boolean;
  hasPets?: boolean;
  layout?: UnitLayout;
}

interface UnitDetailsProps {
  unit: Unit;
  planImageUrl: string;
  buildingId: string;
  onClose: () => void;
  isMobile: boolean;
}

export function UnitDetails({
  unit,
  planImageUrl,
  buildingId,
  onClose,
  isMobile
}: UnitDetailsProps) {
  const t = useTranslations();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState("info");

  const galleryImages = unit.layout?.images || [];
  const allImages = [
    ...(galleryImages || []),
    ...(unit.layout?.planImage
      ? [{ url: unit.layout.planImage, title: t("Units.layout") }]
      : [])
  ];

  const getWindowViewTranslation = (view: string) => {
    switch (view) {
      case "sea":
        return t("Units.windowView.sea");
      case "mountain":
        return t("Units.windowView.mountain");
      case "city":
        return t("Units.windowView.city");
      case "garden":
        return t("Units.windowView.garden");
      default:
        return view;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "success";
      case "RESERVED":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <>
      {/* Галерея изображений */}
      <Modal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        size="full"
        scrollBehavior="inside"
        classNames={{
          wrapper: "items-center justify-center z-[200]",
          base: "m-0 max-w-full h-full",
          body: "p-0 relative",
          backdrop: "z-[200]"
        }}
      >
        <ModalContent>
          <ModalBody className="relative">
            <div className="absolute top-4 right-4 z-10">
              <Button
                isIconOnly
                color="default"
                variant="flat"
                onClick={() => setIsGalleryOpen(false)}
              >
                <IconX size={24} />
              </Button>
            </div>
            <div className="flex items-center justify-center min-h-screen">
              <div className="relative max-w-[90vw] max-h-[90vh]">
                <img
                  src={allImages[currentImageIndex]?.url}
                  alt={
                    allImages[currentImageIndex]?.title ||
                    `Image ${currentImageIndex + 1}`
                  }
                  className="max-w-full max-h-[90vh] object-contain"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      isIconOnly
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      color="default"
                      variant="flat"
                      onClick={() =>
                        setCurrentImageIndex(prev =>
                          prev === 0 ? allImages.length - 1 : prev - 1
                        )
                      }
                    >
                      <IconChevronLeft size={24} />
                    </Button>
                    <Button
                      isIconOnly
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      color="default"
                      variant="flat"
                      onClick={() =>
                        setCurrentImageIndex(prev =>
                          prev === allImages.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <IconChevronRight size={24} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      <div
        className={`${isMobile ? "" : "bg-default-50 dark:bg-default-100 rounded-lg p-6"}`}
      >
        <div className={`${isMobile ? "" : "max-w-7xl mx-auto"}`}>
          {/* Заголовок - только для десктопа */}
          {!isMobile && (
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  {t("Units.title")} {unit.number}
                  <Chip
                    color={getStatusColor(unit.status)}
                    variant="flat"
                    size="sm"
                  >
                    {t(`Units.status.${unit.status.toLowerCase()}`)}
                  </Chip>
                </h2>
                {unit.location && (
                  <p className="text-default-500 mt-1">{unit.location}</p>
                )}
              </div>
              <Button isIconOnly variant="light" onClick={onClose}>
                <IconX size={20} />
              </Button>
            </div>
          )}

          {/* Карусель изображений */}
          {allImages.length > 0 && (
            <div
              className={`${isMobile ? "mb-4" : "mb-8"} relative rounded-xl overflow-hidden`}
            >
              <div className="aspect-[16/9] relative">
                <img
                  src={allImages[currentImageIndex].url}
                  alt={
                    allImages[currentImageIndex].title ||
                    `Image ${currentImageIndex + 1}`
                  }
                  className="w-full h-full object-cover"
                />
                {allImages.length > 1 && (
                  <>
                    <Button
                      isIconOnly
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50"
                      variant="flat"
                      onClick={() =>
                        setCurrentImageIndex(prev =>
                          prev === 0 ? allImages.length - 1 : prev - 1
                        )
                      }
                    >
                      <IconChevronLeft className="text-white" size={24} />
                    </Button>
                    <Button
                      isIconOnly
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50"
                      variant="flat"
                      onClick={() =>
                        setCurrentImageIndex(prev =>
                          prev === allImages.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <IconChevronRight className="text-white" size={24} />
                    </Button>
                  </>
                )}
                <Button
                  className="absolute bottom-4 right-4 bg-black/30 hover:bg-black/50"
                  variant="flat"
                  color="default"
                  startContent={<IconPhoto size={20} />}
                  onClick={() => setIsGalleryOpen(true)}
                >
                  {t("Units.gallery")}
                </Button>
              </div>
              {/* Thumbnails */}
              <div
                className={`${isMobile ? "flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide" : "flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide"}`}
              >
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={`
                      ${isMobile ? "w-24 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden" : "w-24 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden"}
                      ${currentImageIndex === index ? "ring-2 ring-primary" : ""}
                    `}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={image.title || `Thumbnail ${index + 1}`}
                      className={`${isMobile ? "w-full h-full object-cover" : "w-full h-full object-cover"}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div
            className={`${isMobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}`}
          >
            {/* Левая колонка - Основные характеристики */}
            <div className={`${isMobile ? "" : "lg:col-span-2"} space-y-4`}>
              <Card>
                <CardBody>
                  <div
                    className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} gap-4`}
                  >
                    {unit.area && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <IconRulerMeasure
                            className="text-primary"
                            size={24}
                          />
                        </div>
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.area")}
                          </div>
                          <div className="font-semibold text-lg">
                            {unit.area} м²
                          </div>
                        </div>
                      </div>
                    )}
                    {unit.bedrooms !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <IconBed className="text-primary" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.bedrooms")}
                          </div>
                          <div className="font-semibold text-lg">
                            {unit.bedrooms}
                          </div>
                        </div>
                      </div>
                    )}
                    {unit.bathrooms && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <IconBath className="text-primary" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.bathrooms")}
                          </div>
                          <div className="font-semibold text-lg">
                            {unit.bathrooms}
                          </div>
                        </div>
                      </div>
                    )}
                    {unit.windowView && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <IconWindmill className="text-primary" size={24} />
                        </div>
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.view")}
                          </div>
                          <div className="font-semibold text-lg">
                            {getWindowViewTranslation(unit.windowView)}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <IconStairs className="text-primary" size={24} />
                      </div>
                      <div>
                        <div className="text-sm text-default-500">
                          {t("Units.floor")}
                        </div>
                        <div className="font-semibold text-lg">
                          {unit.floor}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Цена */}
              {(unit.price || unit.pricePerSqm) && (
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {unit.price && (
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.totalPrice")}
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(unit.price)}
                          </div>
                        </div>
                      )}
                      {unit.pricePerSqm && (
                        <div>
                          <div className="text-sm text-default-500">
                            {t("Units.pricePerSqm")}
                          </div>
                          <div className="text-xl font-semibold">
                            {new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(unit.pricePerSqm)}
                            /м²
                          </div>
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Вкладки с информацией */}
              <Card>
                <CardBody>
                  <Tabs
                    selectedKey={selectedTab}
                    onSelectionChange={key => setSelectedTab(key as string)}
                    color="primary"
                    variant={isMobile ? "solid" : "underlined"}
                    classNames={{
                      tabList: `gap-2 ${isMobile ? "overflow-x-auto" : "gap-6"}`,
                      cursor: "w-full bg-primary",
                      tab: `${isMobile ? "flex-shrink-0" : "max-w-fit px-0 h-12"}`,
                      tabContent: "group-data-[selected=true]:text-primary"
                    }}
                  >
                    <Tab
                      key="info"
                      title={
                        <div className="flex items-center gap-2">
                          <IconHome2 size={20} />
                          <span>{t("Units.layoutDetails")}</span>
                        </div>
                      }
                    >
                      <div className="py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                          {unit.layout?.livingArea && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.livingArea")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.livingArea} м²
                              </div>
                            </div>
                          )}
                          {unit.layout?.balconyArea && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.balconyArea")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.balconyArea} м²
                              </div>
                            </div>
                          )}
                          {unit.layout?.ceilingHeight && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.ceilingHeight")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.ceilingHeight} м
                              </div>
                            </div>
                          )}
                          {unit.layout?.windowCount && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.windowCount")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.windowCount}
                              </div>
                            </div>
                          )}
                          {unit.layout?.orientation && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.orientation")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.orientation}
                              </div>
                            </div>
                          )}
                          {unit.layout?.energyClass && (
                            <div>
                              <div className="text-sm text-default-500">
                                {t("Units.energyClass")}
                              </div>
                              <div className="font-semibold text-lg">
                                {unit.layout.energyClass}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab>

                    <Tab
                      key="features"
                      title={
                        <div className="flex items-center gap-2">
                          <IconStar size={20} />
                          <span>{t("Units.features")}</span>
                        </div>
                      }
                    >
                      <div className="py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {unit.hasBalcony && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconHome2 size={20} className="text-primary" />
                              <span>{t("Units.features.balcony")}</span>
                            </div>
                          )}
                          {unit.hasParking && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconParking size={20} className="text-primary" />
                              <span>{t("Units.features.parking")}</span>
                            </div>
                          )}
                          {unit.hasStorage && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <span>{t("Units.features.storage")}</span>
                            </div>
                          )}
                          {unit.hasFurnished && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <span>{t("Units.features.furnished")}</span>
                            </div>
                          )}
                          {unit.hasSmartHome && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconSmartHome
                                size={20}
                                className="text-primary"
                              />
                              <span>{t("Units.features.smartHome")}</span>
                            </div>
                          )}
                          {unit.hasSecuritySystem && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconShieldCheck
                                size={20}
                                className="text-primary"
                              />
                              <span>{t("Units.features.security")}</span>
                            </div>
                          )}
                          {unit.hasAirConditioning && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconAirConditioning
                                size={20}
                                className="text-primary"
                              />
                              <span>{t("Units.features.airConditioning")}</span>
                            </div>
                          )}
                          {unit.hasHeating && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconFlame size={20} className="text-primary" />
                              <span>{t("Units.features.heating")}</span>
                            </div>
                          )}
                          {unit.hasWaterHeating && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconDroplet size={20} className="text-primary" />
                              <span>{t("Units.features.waterHeating")}</span>
                            </div>
                          )}
                          {unit.hasGas && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconGlass size={20} className="text-primary" />
                              <span>{t("Units.features.gas")}</span>
                            </div>
                          )}
                          {unit.hasInternet && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconWifi size={20} className="text-primary" />
                              <span>{t("Units.features.internet")}</span>
                            </div>
                          )}
                          {unit.hasCableTV && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconDeviceTv
                                size={20}
                                className="text-primary"
                              />
                              <span>{t("Units.features.cableTV")}</span>
                            </div>
                          )}
                          {unit.hasElevator && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconElevator
                                size={20}
                                className="text-primary"
                              />
                              <span>{t("Units.features.elevator")}</span>
                            </div>
                          )}
                          {unit.hasWheelchairAccess && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconWheelchair
                                size={20}
                                className="text-primary"
                              />
                              <span>
                                {t("Units.features.wheelchairAccess")}
                              </span>
                            </div>
                          )}
                          {unit.hasPets && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                              <IconPaw size={20} className="text-primary" />
                              <span>{t("Units.features.petsAllowed")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Tab>

                    {unit.layout?.advantages &&
                      unit.layout.advantages.length > 0 && (
                        <Tab
                          key="advantages"
                          title={
                            <div className="flex items-center gap-2">
                              <IconAward size={20} />
                              <span>{t("Units.advantages")}</span>
                            </div>
                          }
                        >
                          <div className="py-4">
                            <div className="flex flex-wrap gap-2">
                              {unit.layout.advantages.map(
                                (advantage, index) => (
                                  <Chip
                                    key={index}
                                    variant="flat"
                                    color="primary"
                                    className="text-sm"
                                  >
                                    {advantage}
                                  </Chip>
                                )
                              )}
                            </div>
                          </div>
                        </Tab>
                      )}

                    {(unit.layout?.finishes?.length > 0 ||
                      unit.layout?.furniture?.length > 0) && (
                      <Tab
                        key="finishes"
                        title={
                          <div className="flex items-center gap-2">
                            <IconPaint size={20} />
                            <span>{t("Units.finishes")}</span>
                          </div>
                        }
                      >
                        <div className="py-4 space-y-6">
                          {unit.layout.finishes &&
                            unit.layout.finishes.length > 0 && (
                              <div>
                                <h4 className="text-lg font-medium mb-4">
                                  {t("Units.finishes")}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {unit.layout.finishes.map((finish, index) => (
                                    <div
                                      key={index}
                                      className="p-3 rounded-lg bg-primary/5"
                                    >
                                      <div className="text-sm text-default-500">
                                        {finish.type}
                                      </div>
                                      <div className="font-medium">
                                        {finish.material}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {unit.layout.furniture &&
                            unit.layout.furniture.length > 0 && (
                              <div>
                                <h4 className="text-lg font-medium mb-4">
                                  {t("Units.furniture")}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                  {unit.layout.furniture.map((item, index) => (
                                    <div
                                      key={index}
                                      className="p-3 rounded-lg bg-primary/5"
                                    >
                                      <div className="font-medium">
                                        {item.item}
                                      </div>
                                      <div className="text-sm text-default-500">
                                        {item.description}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </Tab>
                    )}
                  </Tabs>
                </CardBody>
              </Card>

              {/* Описание */}
              {unit.description && (
                <Card>
                  <CardBody>
                    <h3 className="text-xl font-semibold mb-4">
                      {t("Units.description")}
                    </h3>
                    <p className="text-default-700 whitespace-pre-wrap">
                      {unit.description}
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>

            {/* Правая колонка - Дополнительные действия */}
            {!isMobile && (
              <div className="space-y-6">
                {/* 3D тур */}
                {unit.layout?.tour3d && (
                  <Card>
                    <CardBody>
                      <Button
                        color="primary"
                        variant="flat"
                        endContent={<Icon3d size={20} />}
                        as="a"
                        href={unit.layout.tour3d}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        {t("Units.view3dTour")}
                      </Button>
                    </CardBody>
                  </Card>
                )}

                {/* Кнопки действий */}
                <Card>
                  <CardBody className="space-y-4">
                    <Button
                      variant="flat"
                      color="primary"
                      onClick={onClose}
                      className="w-full"
                    >
                      {t("common.back")}
                    </Button>
                    {buildingId && (
                      <Button
                        color="primary"
                        as={Link}
                        href={`/projects/${buildingId}/units/${unit.id}`}
                        endContent={<IconArrowRight size={20} />}
                        className="w-full"
                      >
                        {t("Units.viewDetails")}
                      </Button>
                    )}
                  </CardBody>
                </Card>
              </div>
            )}
          </div>

          {/* Мобильные кнопки действий */}
          {isMobile && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-default-50 dark:bg-default-100 border-t border-default-200">
              <div className="flex gap-4">
                <Button
                  variant="flat"
                  color="primary"
                  onClick={onClose}
                  className="flex-1"
                >
                  {t("common.back")}
                </Button>
                {buildingId && (
                  <Button
                    color="primary"
                    as={Link}
                    href={`/projects/${buildingId}/units/${unit.id}`}
                    endContent={<IconArrowRight size={20} />}
                    className="flex-1"
                  >
                    {t("Units.viewDetails")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
