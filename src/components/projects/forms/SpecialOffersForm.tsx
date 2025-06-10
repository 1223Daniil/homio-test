"use client";

import { Button, Input, Select, SelectItem } from "@heroui/react";
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

import { i18nConfig } from "@/config/i18n";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Translation {
  title: string;
  description: string;
  validUntil: string;
}

interface SpecialOffer {
  id: string;
  translations: {
    [key: string]: Translation;
  };
  icon: string;
}

interface SpecialOffersFormProps {
  project: {
    id: string;
    specialOffers?: SpecialOffer[] | null;
  };
  onSave: (data: { specialOffers: SpecialOffer[] }) => Promise<void>;
  isSaving: boolean;
}

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
};

const DEFAULT_TRANSLATION: Translation = {
  title: "",
  description: "",
  validUntil: ""
};

const initializeTranslations = (offer: Partial<SpecialOffer>): SpecialOffer => {
  const translations = offer.translations ? { ...offer.translations } : {};

  // Инициализируем переводы для всех поддерживаемых языков
  i18nConfig.locales.forEach(locale => {
    if (!translations[locale]) {
      translations[locale] = { ...DEFAULT_TRANSLATION };
    }
  });

  return {
    id: offer.id || "",
    icon: offer.icon || "percentage",
    translations
  };
};

export function SpecialOffersForm({
  project,
  onSave,
  isSaving
}: SpecialOffersFormProps) {
  const t = useTranslations("Projects");
  const currentLocale = useLocale();
  console.log("Current locale:", currentLocale);
  const [selectedLocale, setSelectedLocale] = useState<string>(currentLocale);
  console.log("Selected locale:", selectedLocale);

  const defaultOffers = [
    {
      id: "discount",
      translations: {
        ru: {
          title: t("form.specialOffers.cards.discount.title"),
          description: t("form.specialOffers.cards.discount.description"),
          validUntil: t("form.specialOffers.cards.discount.validUntil")
        },
        en: {
          title: "Special Discount",
          description: "Get a special discount on your purchase",
          validUntil: "Limited time offer"
        }
      },
      icon: "percentage"
    },
    {
      id: "furniture",
      translations: {
        ru: {
          title: t("form.specialOffers.cards.furniture.title"),
          description: t("form.specialOffers.cards.furniture.description"),
          validUntil: t("form.specialOffers.cards.furniture.validUntil")
        },
        en: {
          title: "Free Furniture",
          description: "Get free furniture with your purchase",
          validUntil: "Limited time offer"
        }
      },
      icon: "gift"
    },
    {
      id: "instalments",
      translations: {
        ru: {
          title: t("form.specialOffers.cards.instalments.title"),
          description: t("form.specialOffers.cards.instalments.description"),
          validUntil: t("form.specialOffers.cards.instalments.validUntil")
        },
        en: {
          title: "Easy Instalments",
          description: "Pay in easy instalments",
          validUntil: "Limited time offer"
        }
      },
      icon: "star"
    }
  ];

  const [offers, setOffers] = useState<SpecialOffer[]>(() => {
    if (!project.specialOffers) return defaultOffers;

    try {
      const projectOffers =
        typeof project.specialOffers === "string"
          ? JSON.parse(project.specialOffers)
          : project.specialOffers;

      if (!Array.isArray(projectOffers)) return defaultOffers;

      // Инициализируем переводы для каждого предложения
      const initializedOffers = projectOffers.map(offer =>
        initializeTranslations(offer)
      );

      return initializedOffers.length > 0 ? initializedOffers : defaultOffers;
    } catch (error) {
      console.error("Error parsing special offers:", error);
      return defaultOffers;
    }
  });

  const {
    handleSubmit,
    formState: { errors }
  } = useForm();

  const updateOffer = (
    id: string,
    field: keyof Translation | "icon",
    value: string
  ) => {
    setOffers(prev =>
      prev.map(offer =>
        offer.id === id
          ? field === "icon"
            ? { ...offer, icon: value }
            : {
                ...offer,
                translations: {
                  ...offer.translations,
                  [selectedLocale]: {
                    ...DEFAULT_TRANSLATION,
                    ...offer.translations[selectedLocale],
                    [field]: value
                  }
                }
              }
          : offer
      )
    );
  };

  const onSubmit = async () => {
    try {
      await onSave({ specialOffers: offers });
    } catch (error) {
      console.error("Special offers update error:", {
        error,
        projectId: project.id,
        context: "special_offers_form_submit"
      });
      toast.error(t("messages.error.specialOffersUpdate"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-default-500 mt-1">
            {t("sections.specialOffers.description")}
          </p>
        </div>
        <Select
          label="Language"
          selectedKeys={[selectedLocale || currentLocale]}
          onChange={e => setSelectedLocale(e.target.value)}
          className="w-32"
          classNames={{
            trigger: "bg-white dark:bg-[#1a1a1a]",
            value: "text-default-900 dark:text-white"
          }}
        >
          {i18nConfig.locales.map(locale => (
            <SelectItem key={locale} value={locale}>
              {locale.toUpperCase()}
            </SelectItem>
          ))}
        </Select>
      </div>

      {offers.map(offer => (
        <div
          key={offer.id}
          className="bg-[#F5F5F7] dark:bg-[#2C2C2C] rounded-xl p-6 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              {ICONS[offer.icon as keyof typeof ICONS]}
            </div>
            <div className="flex-1">
              <Input
                label={t("form.specialOffers.fields.title")}
                value={offer.translations[selectedLocale]?.title || ""}
                onChange={e => updateOffer(offer.id, "title", e.target.value)}
                isDisabled={isSaving}
                classNames={{
                  input: "bg-white dark:bg-[#1a1a1a]",
                  inputWrapper: `bg-white dark:bg-[#1a1a1a] ${isSaving ? "opacity-50" : ""}`
                }}
              />
            </div>
          </div>

          <Input
            label={t("form.specialOffers.fields.description")}
            value={offer.translations[selectedLocale]?.description || ""}
            onChange={e => updateOffer(offer.id, "description", e.target.value)}
            isDisabled={isSaving}
            classNames={{
              input: "bg-white dark:bg-[#1a1a1a]",
              inputWrapper: `bg-white dark:bg-[#1a1a1a] ${isSaving ? "opacity-50" : ""}`
            }}
          />

          <div className="flex gap-4">
            <Input
              type="date"
              label={t("form.specialOffers.fields.validUntil")}
              value={offer.translations[selectedLocale]?.validUntil || ""}
              onChange={e =>
                updateOffer(offer.id, "validUntil", e.target.value)
              }
              isDisabled={isSaving}
              classNames={{
                input: "bg-white dark:bg-[#1a1a1a]",
                inputWrapper: `bg-white dark:bg-[#1a1a1a] ${isSaving ? "opacity-50" : ""}`
              }}
            />

            <Select
              label={t("form.specialOffers.fields.icon")}
              selectedKeys={[offer.icon]}
              onChange={e => updateOffer(offer.id, "icon", e.target.value)}
              isDisabled={isSaving}
              className="min-w-[150px]"
              classNames={{
                trigger: "bg-white dark:bg-[#1a1a1a]",
                value: "text-default-900 dark:text-white"
              }}
            >
              {Object.entries(ICONS).map(([key, icon]) => (
                <SelectItem key={key} value={key} startContent={icon}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
        <Button
          color="primary"
          type="submit"
          isLoading={isSaving}
          isDisabled={isSaving}
          className="px-8"
        >
          {isSaving ? t("forms.saving") : t("forms.save")}
        </Button>
      </div>
    </form>
  );
}
