import { ProjectFormData } from "@/types/project";

export const validateProjectForm = (data: Partial<ProjectFormData>) => {
  const errors: Record<string, any> = {};

  // Валидация общей информации
  if (!data.general?.name) {
    errors.general = { ...errors.general, name: "Name is required" };
  }
  if (!data.general?.status) {
    errors.general = { ...errors.general, status: "Status is required" };
  }

  // Валидация местоположения
  if (!data.location?.country) {
    errors.location = { ...errors.location, country: "Country is required" };
  }
  if (!data.location?.city) {
    errors.location = { ...errors.location, city: "City is required" };
  }

  // Валидация параметров
  if (!data.parameters?.totalUnits || data.parameters.totalUnits <= 0) {
    errors.parameters = {
      ...errors.parameters,
      totalUnits: "Total units must be greater than 0"
    };
  }

  // Валидация платежного плана
  if (!data.paymentPlan?.deposit || data.paymentPlan.deposit <= 0) {
    errors.paymentPlan = {
      ...errors.paymentPlan,
      deposit: "Deposit must be greater than 0"
    };
  }

  return errors;
};
