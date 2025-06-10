"use client";

import { Button, Input, Spinner } from "@heroui/react";
import { IconLink, IconPlus, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PriceLink {
  url: string;
  title: string;
}

interface PriceLinksFormProps {
  projectId: string;
  locale: string;
}

export function PriceLinksForm({ projectId, locale }: PriceLinksFormProps) {
  const t = useTranslations("Projects");
  const [priceLinks, setPriceLinks] = useState<PriceLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch existing price links when component mounts
  useEffect(() => {
    const fetchPriceLinks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}/price-links`);
        
        if (response.ok) {
          const data = await response.json();
          setPriceLinks(data.priceLinks || []);
        } else {
          console.error("Failed to fetch price links");
          toast.error(t("prices.errors.fetchFailed"));
        }
      } catch (error) {
        console.error("Error fetching price links:", error);
        toast.error(t("prices.errors.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceLinks();
  }, [projectId, t]);

  const handleAddLink = () => {
    // Basic validation
    if (!newLinkUrl.trim()) {
      setError(t("prices.form.errors.urlRequired"));
      return;
    }

    // URL validation
    try {
      new URL(newLinkUrl);
    } catch (e) {
      setError(t("prices.form.errors.invalidUrl"));
      return;
    }

    const title = newLinkTitle.trim() || t("prices.form.defaultTitle");
    
    // Add new link
    setPriceLinks([...priceLinks, { url: newLinkUrl, title }]);
    
    // Reset form
    setNewLinkTitle("");
    setNewLinkUrl("");
    setError(null);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...priceLinks];
    updatedLinks.splice(index, 1);
    setPriceLinks(updatedLinks);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/projects/${projectId}/price-links`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceLinks }),
      });

      if (response.ok) {
        toast.success(t("prices.messages.updateSuccess"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t("prices.messages.updateError"));
      }
    } catch (error) {
      console.error("Error saving price links:", error);
      toast.error(t("prices.messages.updateError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-default-900 dark:text-white">{t("prices.form.currentLinks")}</h3>
        
        {priceLinks.length === 0 ? (
          <div className="p-4 bg-default-50 dark:bg-default-100/10 rounded-lg text-default-500 text-center">
            {t("prices.form.noLinks")}
          </div>
        ) : (
          <div className="space-y-3">
            {priceLinks.map((link, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/10"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <IconLink size={20} className="text-primary flex-shrink-0" />
                  <div className="overflow-hidden">
                    <div className="font-medium truncate text-default-900 dark:text-white">{link.title}</div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-default-500 hover:text-primary transition-colors truncate block"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>

                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="light"
                  onClick={() => handleRemoveLink(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t dark:border-default-100/20 pt-6">
        <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">{t("prices.form.addNewLink")}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-default-900 dark:text-white">
              {t("prices.form.linkTitle")}
            </label>
            <Input
              placeholder={t("prices.form.linkTitlePlaceholder")}
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              classNames={{
                input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-default-900 dark:text-white">
              {t("prices.form.linkUrl")} *
            </label>
            <Input
              placeholder={t("prices.form.linkUrlPlaceholder")}
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              isInvalid={!!error}
              errorMessage={error || ""}
              classNames={{
                input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
              }}
            />
          </div>
          
          <Button
            color="primary"
            startContent={<IconPlus size={16} />}
            onClick={handleAddLink}
          >
            {t("prices.form.addButton")}
          </Button>
        </div>
      </div>

      <div className="border-t dark:border-default-100/20 pt-6 flex justify-end">
        <Button
          color="primary"
          isLoading={isSaving}
          onClick={handleSave}
        >
          {t("prices.form.saveButton")}
        </Button>
      </div>
    </div>
  );
} 