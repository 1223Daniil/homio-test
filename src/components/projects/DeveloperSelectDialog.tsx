"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { Developer, DeveloperTranslation } from "@prisma/client";

interface DeveloperWithTranslations extends Developer {
  translations: DeveloperTranslation[];
}

interface DeveloperSelectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (developerId: string) => void;
}

export function DeveloperSelectDialog({
  isOpen,
  onClose,
  onSelect
}: DeveloperSelectDialogProps) {
  const t = useTranslations("Projects");
  const [developers, setDevelopers] = useState<DeveloperWithTranslations[]>([]);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await fetch("/api/developers");
        if (!response.ok) {
          throw new Error("Failed to fetch developers");
        }
        const data = await response.json();
        setDevelopers(data);
      } catch (error) {
        console.error("Error fetching developers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchDevelopers();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedDeveloperId) {
      onSelect(selectedDeveloperId);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("selectDeveloper")}</ModalHeader>
        <ModalBody>
          <Select
            label={t("developer")}
            placeholder={t("selectDeveloperPlaceholder")}
            selectedKeys={selectedDeveloperId ? [selectedDeveloperId] : []}
            onChange={(e) => {
              console.log("Selected developer:", e.target.value);
              setSelectedDeveloperId(e.target.value);
            }}
            isLoading={isLoading}
          >
            {developers.map((developer) => (
              <SelectItem key={developer.id} value={developer.id}>
                {developer.translations[0]?.name || t("unnamed")}
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            {t("cancel")}
          </Button>
          <Button 
            color="primary" 
            onPress={() => {
              console.log("Confirming developer:", selectedDeveloperId);
              if (selectedDeveloperId) {
                onSelect(selectedDeveloperId);
              }
            }}
            isDisabled={!selectedDeveloperId}
          >
            {t("confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 