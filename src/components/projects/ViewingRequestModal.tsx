/**
 * ViewingRequestModal Component
 * Modal component for submitting viewing requests for properties
 *
 * @component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {Function} onClose - Callback function when modal is closed
 * @param {string} projectId - ID of the project
 * @param {string} projectName - Name of the project
 */

"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@heroui/react";
import { memo, useCallback, useState } from "react";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface ViewingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

// Memoized form component for better performance
const ViewingRequestForm = memo(
  ({
    name,
    phone,
    onNameChange,
    onPhoneChange
  }: {
    name: string;
    phone: string;
    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
  }) => {
    const t = useTranslations("ViewingRequest");

    return (
      <div className="space-y-4">
        <Input
          label={t("form.name")}
          value={name}
          onChange={e => onNameChange(e.target.value)}
          isRequired
        />
        <Input
          label={t("form.phone")}
          value={phone}
          onChange={e => onPhoneChange(e.target.value)}
          type="tel"
          isRequired
        />
      </div>
    );
  }
);

ViewingRequestForm.displayName = "ViewingRequestForm";

export function ViewingRequestModal({
  isOpen,
  onClose,
  projectId,
  projectName
}: ViewingRequestModalProps) {
  const t = useTranslations("ViewingRequest");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Memoized handlers
  const handleNameChange = useCallback((value: string) => {
    setName(value);
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !phone.trim()) {
      toast.error(t("errors.requiredFields"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/public/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          projectId,
          projectName,
          type: "VIEWING_REQUEST"
        })
      });

      if (!response.ok) {
        throw new Error(t("errors.submitFailed"));
      }

      toast.success(t("success.submitted"));
      onClose();
      setName("");
      setPhone("");
    } catch (error) {
      console.error("Failed to submit viewing request:", error);
      toast.error(
        error instanceof Error ? error.message : t("errors.submitFailed")
      );
    } finally {
      setIsLoading(false);
    }
  }, [name, phone, projectId, projectName, t, onClose]);

  const handleClose = useCallback(() => {
    setName("");
    setPhone("");
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        {onClose => (
          <>
            <ModalHeader>{t("title")}</ModalHeader>
            <ModalBody>
              <ViewingRequestForm
                name={name}
                phone={phone}
                onNameChange={handleNameChange}
                onPhoneChange={handlePhoneChange}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                {t("actions.cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleSubmit}
                isLoading={isLoading}
              >
                {t("actions.submit")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
