"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader
} from "@heroui/react";

import CreateAmenityForm from "./CreateAmenityForm";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface AddAmenityButtonProps {
  onUpdate?: () => void;
}

export default function AddAmenityButton({ onUpdate }: AddAmenityButtonProps) {
  const t = useTranslations("Amenities");
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSuccess = () => {
    handleClose();
    onUpdate?.();
  };

  return (
    <>
      <Button
        color="secondary"
        variant="solid"
        endContent={<IconPlus size={20} />}
        onPress={() => setIsOpen(true)}
      >
        {t("addAmenity")}
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("addAmenity")}
              </ModalHeader>
              <ModalBody>
                <CreateAmenityForm onSuccess={handleSuccess} />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
