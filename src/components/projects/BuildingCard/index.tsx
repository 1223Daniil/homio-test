'use client';

import { useState } from "react";
import { Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { IconEdit, IconArrowRight, IconTrash } from "@tabler/icons-react";
import { Building, ProjectStatus, BuildingMedia, BuildingMediaCategory } from '@prisma/client';
import { useRouter } from '@/config/i18n';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface BuildingCardProps {
  building: Building & {
    media?: BuildingMedia[];
  };
  projectId: string;
  showEditButton?: boolean;
  onBuildingDeleted?: (buildingId: string) => void;
}

export function BuildingCard({ building, projectId, showEditButton = false, onBuildingDeleted }: BuildingCardProps) {
  const router = useRouter();
  const t = useTranslations('ProjectDetails');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Получаем первое изображение с категорией EXTERIOR
  const exteriorImage = building.media?.find(
    media => media.category === BuildingMediaCategory.EXTERIOR
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/projects/${projectId}/buildings/${building.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t('buildings.delete.error'));
      }

      toast.success(t('buildings.delete.success'));
      setIsDeleteModalOpen(false);
      onBuildingDeleted?.(building.id);
    } catch (error) {
      console.error('Error deleting building:', error);
      toast.error(t('buildings.delete.error'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Функция для определения цветов статуса
  const getStatusColors = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'bg-success/10 text-success';
      case ProjectStatus.CONSTRUCTION:
        return 'bg-warning/10 text-warning';
      case ProjectStatus.PLANNING:
        return 'bg-secondary/10 text-secondary';
      case ProjectStatus.DRAFT:
        return 'bg-default/10 text-default-600';
      case ProjectStatus.ACTIVE:
        return 'bg-success/10 text-success';
      case ProjectStatus.INACTIVE:
        return 'bg-danger/10 text-danger';
      default:
        return 'bg-default/10 text-default-600';
    }
  };

  return (
    <Card className="w-full h-[340px] bg-white dark:bg-[#2C2C2C] shadow-small">
      <CardBody className="p-0 flex flex-col">
        {/* Изображение здания */}
        <div className="w-full h-44 relative">
          {(exteriorImage?.url || building.imageUrl) ? (
            <img
              src={exteriorImage?.url || building.imageUrl || undefined}
              alt={building.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-default-100 dark:bg-default-50/10 flex items-center justify-center">
              <p className="text-default-400">{t("buildings.buildingInfo.noImage")}</p>
            </div>
          )}
        </div>

        {/* Контент карточки */}
        <div className="flex flex-col flex-1 p-3">
          {/* Информация о здании */}
          <div className="flex justify-between items-start flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-default-900 dark:text-white truncate pr-2">
                  {building.name}
                </h3>
                {showEditButton && (
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      color="primary"
                      size="sm"
                      className="shrink-0 min-w-unit-8 w-unit-8 h-unit-8"
                      onClick={() => router.push(`/projects/${projectId}/buildings/${building.id}/edit`)}
                    >
                      <IconEdit size={18} />
                    </Button>
                    <Button
                      isIconOnly
                      variant="light"
                      color="danger"
                      size="sm"
                      className="shrink-0 min-w-unit-8 w-unit-8 h-unit-8"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <IconTrash size={18} />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-default-500">
                {t("buildings.buildingInfo.floors", {
                  count: building.floors
                })}
              </p>
              <p className="text-sm text-default-600 line-clamp-2 mt-1">
                {building.description || "Description of the current building"}
              </p>
            </div>
          </div>

          {/* Нижняя секция с кнопкой и статусом */}
          <div className="flex items-center justify-between pt-2 border-t border-default-200 dark:border-default-100/20 mt-2">
            <span className={`
              text-xs px-2 py-1 rounded-full shrink-0
              ${getStatusColors(building.status)}
            `}>
              {building.status}
            </span>

            <Button
              color="primary"
              endContent={<IconArrowRight size={16} />}
              size="sm"
              variant="flat"
              className="shrink-0"
              onClick={() => router.push(`/projects/${projectId}/buildings/${building.id}/units`)}
            >
              {t("buildings.buildingInfo.chooseFlat")}
            </Button>
          </div>
        </div>
      </CardBody>
      
      {/* Модальное окно подтверждения удаления */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalContent>
          <ModalHeader>
            {t('buildings.delete.title')}
          </ModalHeader>
          <ModalBody>
            {t('buildings.delete.confirmation', { name: building.name })}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              color="default"
              onPress={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              {t('buildings.delete.cancel')}
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              {t('buildings.delete.delete')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
} 