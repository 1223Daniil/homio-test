import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button
} from "@heroui/react";
import { IconCheck, IconX } from "@tabler/icons-react";

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: "success" | "error";
}

export function Toast({
  isOpen,
  onClose,
  title,
  description,
  type
}: ToastProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideCloseButton
      className="bg-transparent shadow-none"
      placement="top"
      size="sm"
    >
      <ModalContent className="p-2">
        <div
          className={`rounded-lg p-4 ${
            type === "success"
              ? "bg-success-50 text-success-600"
              : "bg-danger-50 text-danger-600"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1.5 ${
                type === "success" ? "bg-success-100" : "bg-danger-100"
              }`}
            >
              {type === "success" ? (
                <IconCheck size={16} />
              ) : (
                <IconX size={16} />
              )}
            </div>
            <div className="flex-1">
              <h5 className="text-sm font-semibold">{title}</h5>
              <p className="text-sm mt-1">{description}</p>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
