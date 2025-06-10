"use client";

import { Card, CardBody } from "@heroui/react";
import {
  IconBed,
  IconCar,
  IconCoin,
  IconDiscount,
  IconGift,
  IconHome,
  IconPercentage,
  IconStar,
  IconSwimming
} from "@tabler/icons-react";

import { SpecialOffer as DomainSpecialOffer } from "@/types/domain";
import React from "react";
import { useTranslations } from "next-intl";

const ICONS = {
  percentage: <IconPercentage className="w-6 h-6 text-primary" />,
  gift: <IconGift className="w-6 h-6 text-primary" />,
  star: <IconStar className="w-6 h-6 text-primary" />,
  coin: <IconCoin className="w-6 h-6 text-primary" />,
  discount: <IconDiscount className="w-6 h-6 text-primary" />,
  home: <IconHome className="w-6 h-6 text-primary" />,
  car: <IconCar className="w-6 h-6 text-primary" />,
  swimming: <IconSwimming className="w-6 h-6 text-primary" />,
  bed: <IconBed className="w-6 h-6 text-primary" />
} as const;

type IconType = keyof typeof ICONS;

interface SpecialOffersProps {
  offers: DomainSpecialOffer[];
}

export const getIcon = (iconName: string | undefined): React.ReactNode => {
  if (!iconName) return ICONS[defaultIcon];
  return ICONS[iconName as IconType] || ICONS[defaultIcon];
};

const defaultIcon = "percentage" as const;

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ offers }) => {
  const t = useTranslations("Projects");

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-default-900">
          {t("sections.specialOffers.title")}
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map(offer => (
          <Card key={offer.id} className="bg-white dark:bg-[#2C2C2C]">
            <CardBody className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {getIcon(offer.icon)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1 text-default-900">
                    {offer.title}
                  </h3>
                  {offer.description && (
                    <p className="text-sm text-gray-500">{offer.description}</p>
                  )}
                  {offer.validUntil && (
                    <p className="text-xs text-gray-400 mt-2">
                      {t("sections.specialOffers.validUntilPrefix")}:{" "}
                      {new Date(offer.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SpecialOffers;
