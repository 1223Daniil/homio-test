"use client";

import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch
} from "@heroui/react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { ProjectWithTranslation } from "@/types/project";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface PurchaseConditionsFormData {
  currentCurrency: string;
  leaseholdDuration: number;
  reservationFee: number;
  reservationDuration: number;
  onTimePaymentDiscont: number;
}

interface StageFormData {
  id: string;
  stageName: string;
  paymentAmount: number;
}

interface AgentCommissionFormData {
  id: string;
  from: number;
  to: number;
  commission: number;
}

interface CashbackBonusFormData {
  id: string;
  cashbackBonus: number;
  condition: string;
}

interface AdditionalExpenseFormData {
  id: string;
  costOfExpenses: number;
  nameOfExpenses: string;
}

interface EditableExpense {
  id: string;
  isEditing: boolean;
  tempData: {
    costOfExpenses: number;
    nameOfExpenses: string;
  };
}

interface EditableStage {
  id: string;
  isEditing: boolean;
  tempData: {
    stageName: string;
    paymentAmount: number;
  };
}

interface EditableCommission {
  id: string;
  isEditing: boolean;
  tempData: {
    from: number;
    to: number;
    commission: number;
  };
}

interface EditableBonus {
  id: string;
  isEditing: boolean;
  tempData: {
    cashbackBonus: number;
    condition: string;
  };
}

interface PurchaseConditionsFormProps {
  project: ProjectWithTranslation;
  onSave: (data: PurchaseConditionsFormData) => Promise<void>;
  isSaving: boolean;
}

export function PurchaseConditionsForm({
  project,
  onSave,
  isSaving: externalIsSaving
}: PurchaseConditionsFormProps) {
  const t = useTranslations("Projects");
  const [isPurchaseConditions, setIsPurchaseConditions] =
    useState<boolean>(true);
  const [isInstalmentPlan, setIsInstalmentPlan] = useState<boolean>(true);
  const [agentCommission, setAgentCommission] = useState<boolean>(true);
  const [isCashbackBonusPlan, setIsCashbackBonusPlan] = useState<boolean>(true);
  const [isAdditionalExpenses, setIsAdditionalExpenses] =
    useState<boolean>(true);
  const [paymentStages, setPaymentStages] = useState<StageFormData[]>([]);
  const [agentCommissions, setAgentCommissions] = useState<
    AgentCommissionFormData[]
  >([]);
  const [cashbackBonusArray, setCashbackBonusArray] = useState<
    CashbackBonusFormData[]
  >([]);
  const [additionalExpenses, setAdditionalExpenses] = useState<
    AdditionalExpenseFormData[]
  >([]);
  const [isStageModalOpen, setIsStageModalOpen] = useState<boolean>(false);
  const [isAgentCommissionModalOpen, setIsAgentCommissionModalOpen] =
    useState<boolean>(false);
  const [isCashbackBonusModalOpen, setIsCashbackBonusModalOpen] =
    useState<boolean>(false);
  const [isAdditionalExpenseModalOpen, setIsAdditionalExpenseModalOpen] =
    useState<boolean>(false);
  const [stageName, setStageName] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [from, setFrom] = useState<number>(0);
  const [to, setTo] = useState<number>(0);
  const [commission, setCommission] = useState<number>(0);
  const [cashbackBonus, setCashbackBonus] = useState<number>(0);
  const [condition, setCondition] = useState<string>("");
  const [costOfExpenses, setCostOfExpenses] = useState<number>(0);
  const [nameOfExpenses, setNameOfExpenses] = useState<string>("");
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [editableExpenses, setEditableExpenses] = useState<EditableExpense[]>(
    []
  );
  const [editableStages, setEditableStages] = useState<EditableStage[]>([]);
  const [editableCommissions, setEditableCommissions] = useState<
    EditableCommission[]
  >([]);
  const [editableBonuses, setEditableBonuses] = useState<EditableBonus[]>([]);

  console.log("stageName", stageName);
  console.log("paymentAmount", paymentAmount);
  console.log("project", project);

  {
    /* Purchase Conditions Form */
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PurchaseConditionsFormData>({
    defaultValues: {
      currentCurrency: project.currency || "",
      leaseholdDuration: project.purchaseConditions?.leaseholdDuration || 0,
      reservationFee: project.purchaseConditions?.reservationFee || 0,
      reservationDuration: project.purchaseConditions?.reservationDuration || 0,
      onTimePaymentDiscont:
        project.purchaseConditions?.onTimePaymentDiscont || 0
    }
  });

  {
    /* Stage Form */
  }
  const {
    register: registerStage,
    handleSubmit: handleStageSubmit,
    formState: { errors: stageErrors },
    reset: resetStage
  } = useForm<StageFormData>({
    defaultValues: {
      stageName: "",
      paymentAmount: 0
    }
  });

  const clearStageForm = () => {
    setStageName("");
    setPaymentAmount(0);
    setIsStageModalOpen(false);
  };

  const createStage = (stageName: string, paymentAmount: number) => {
    const newStage: StageFormData = {
      id: crypto.randomUUID(),
      stageName: stageName,
      paymentAmount: paymentAmount
    };
    setPaymentStages([...paymentStages, newStage]);
    console.log("paymentStages", paymentStages);
    clearStageForm();
  };

  const deleteStage = (id: string) => {
    const updatedStages = paymentStages.filter(stage => stage.id !== id);
    setPaymentStages(updatedStages);
  };

  const clearAgentCommissionForm = () => {
    setFrom(0);
    setTo(0);
    setCommission(0);
    setIsAgentCommissionModalOpen(false);
  };

  const createAgentCommission = (
    from: number,
    to: number,
    commission: number
  ) => {
    const newAgentCommission: AgentCommissionFormData = {
      id: crypto.randomUUID(),
      from: from,
      to: to,
      commission: commission
    };
    setAgentCommissions([...agentCommissions, newAgentCommission]);
    console.log("agentCommissions", agentCommissions);
    clearAgentCommissionForm();
  };

  const deleteAgentCommission = (id: string) => {
    const updatedAgentCommissions = agentCommissions.filter(
      commission => commission.id !== id
    );
    setAgentCommissions(updatedAgentCommissions);
  };

  const clearCashbackBonusForm = () => {
    setCashbackBonus(0);
    setCondition("");
    setIsCashbackBonusModalOpen(false);
  };

  const createCashbackBonus = (cashbackBonus: number, condition: string) => {
    const newCashbackBonus: CashbackBonusFormData = {
      id: crypto.randomUUID(),
      cashbackBonus: cashbackBonus,
      condition: condition
    };
    setCashbackBonusArray([...cashbackBonusArray, newCashbackBonus]);
    console.log("cashbackBonusArray", cashbackBonusArray);
    clearCashbackBonusForm();
  };

  const deleteCashbackBonus = (id: string) => {
    const updatedCashbackBonus = cashbackBonusArray.filter(
      bonus => bonus.id !== id
    );
    setCashbackBonusArray(updatedCashbackBonus);
  };

  const clearAdditionalExpenseForm = () => {
    setCostOfExpenses(0);
    setNameOfExpenses("");
    setIsAdditionalExpenseModalOpen(false);
  };

  const createAdditionalExpense = (
    costOfExpenses: number,
    nameOfExpenses: string
  ) => {
    const newExpense: AdditionalExpenseFormData = {
      id: crypto.randomUUID(),
      costOfExpenses: costOfExpenses,
      nameOfExpenses: nameOfExpenses
    };
    setAdditionalExpenses([...additionalExpenses, newExpense]);
    clearAdditionalExpenseForm();
  };

  const deleteAdditionalExpense = (id: string) => {
    const updatedExpenses = additionalExpenses.filter(
      expense => expense.id !== id
    );
    setAdditionalExpenses(updatedExpenses);
  };

  const handlePurchaseConditionsSave = async (
    data: PurchaseConditionsFormData
  ) => {
    try {
      setIsSaving(true);
      // Convert string values to numbers
      const formattedData = {
        ...data,
        leaseholdDuration: Number(data.leaseholdDuration),
        reservationFee: Number(data.reservationFee),
        reservationDuration: Number(data.reservationDuration),
        onTimePaymentDiscont: Number(data.onTimePaymentDiscont)
      };

      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/main`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formattedData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save purchase conditions");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Условия покупки успешно сохранены");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving purchase conditions:", error);
      toast.error("Ошибка при сохранении условий покупки");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInstalmentPlanSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/stages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ stages: paymentStages })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save payment stages");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Этапы оплаты успешно сохранены");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving payment stages:", error);
      toast.error("Ошибка при сохранении этапов оплаты");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAgentCommissionSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/agent-commission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ commissions: agentCommissions })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save agent commissions");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Комиссии агентов успешно сохранены");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving agent commissions:", error);
      toast.error("Ошибка при сохранении комиссий агентов");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCashbackBonusSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/cashback-bonus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ bonuses: cashbackBonusArray })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save cashback bonuses");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Кэшбэк бонусы успешно сохранены");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving cashback bonuses:", error);
      toast.error("Ошибка при сохранении кэшбэк бонусов");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdditionalExpensesSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/additional-expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ expenses: additionalExpenses })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save additional expenses");
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Дополнительные расходы успешно сохранены");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving additional expenses:", error);
      toast.error("Ошибка при сохранении дополнительных расходов");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingExpense = (expense: AdditionalExpenseFormData) => {
    setEditableExpenses(prev => [
      ...prev,
      {
        id: expense.id,
        isEditing: true,
        tempData: {
          costOfExpenses: expense.costOfExpenses,
          nameOfExpenses: expense.nameOfExpenses
        }
      }
    ]);
  };

  const cancelEditingExpense = (id: string) => {
    setEditableExpenses(prev => prev.filter(item => item.id !== id));
  };

  const updateTempExpenseData = (
    id: string,
    field: keyof EditableExpense["tempData"],
    value: string | number
  ) => {
    setEditableExpenses(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            tempData: {
              ...item.tempData,
              [field]: value
            }
          };
        }
        return item;
      })
    );
  };

  const saveExpenseEdit = async (id: string) => {
    const editedExpense = editableExpenses.find(item => item.id === id);
    if (!editedExpense) return;

    try {
      setIsSaving(true);
      const response = await fetch(
        `/api/projects/${project.id}/purchase-conditions/additional-expenses/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(editedExpense.tempData)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      const result = await response.json();

      if (result.success) {
        setAdditionalExpenses(prev =>
          prev.map(expense => {
            if (expense.id === id) {
              return {
                ...expense,
                ...editedExpense.tempData
              };
            }
            return expense;
          })
        );
        cancelEditingExpense(id);
        toast.success("Расход успешно обновлен");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error("Ошибка при обновлении расхода");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingStage = (stage: StageFormData) => {
    setEditableStages(prev => [
      ...prev,
      {
        id: stage.id,
        isEditing: true,
        tempData: {
          stageName: stage.stageName,
          paymentAmount: stage.paymentAmount
        }
      }
    ]);
  };

  const cancelEditingStage = (id: string) => {
    setEditableStages(prev => prev.filter(item => item.id !== id));
  };

  const updateTempStageData = (
    id: string,
    field: keyof EditableStage["tempData"],
    value: string | number
  ) => {
    setEditableStages(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            tempData: {
              ...item.tempData,
              [field]: value
            }
          };
        }
        return item;
      })
    );
  };

  const saveStageEdit = async (id: string) => {
    const editedStage = editableStages.find(item => item.id === id);
    if (!editedStage) return;

    try {
      setIsSaving(true);
      const url = `/api/projects/${project.id}/purchase-conditions/stages/${id}`;
      const requestData = editedStage.tempData;

      console.log("Sending stage update request:", {
        url,
        method: "PUT",
        data: requestData
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update stage");
      }

      const result = await response.json();

      if (result.success) {
        setPaymentStages(prev =>
          prev.map(stage => {
            if (stage.id === id) {
              return {
                ...stage,
                ...editedStage.tempData
              };
            }
            return stage;
          })
        );
        cancelEditingStage(id);
        toast.success("Этап успешно обновлен");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      toast.error(
        error instanceof Error ? error.message : "Ошибка при обновлении этапа"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingCommission = (commission: AgentCommissionFormData) => {
    setEditableCommissions(prev => [
      ...prev,
      {
        id: commission.id,
        isEditing: true,
        tempData: {
          from: commission.from,
          to: commission.to,
          commission: commission.commission
        }
      }
    ]);
  };

  const cancelEditingCommission = (id: string) => {
    setEditableCommissions(prev => prev.filter(item => item.id !== id));
  };

  const updateTempCommissionData = (
    id: string,
    field: keyof EditableCommission["tempData"],
    value: number
  ) => {
    setEditableCommissions(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            tempData: {
              ...item.tempData,
              [field]: value
            }
          };
        }
        return item;
      })
    );
  };

  const saveCommissionEdit = async (id: string) => {
    const editedCommission = editableCommissions.find(item => item.id === id);
    if (!editedCommission) return;

    try {
      setIsSaving(true);
      const url = `/api/projects/${project.id}/purchase-conditions/agent-commissions/${id}`;
      const requestData = editedCommission.tempData;

      console.log("Sending commission update request:", {
        url,
        method: "PUT",
        data: requestData
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update commission");
      }

      const result = await response.json();

      if (result.success) {
        setAgentCommissions(prev =>
          prev.map(commission => {
            if (commission.id === id) {
              return {
                ...commission,
                ...editedCommission.tempData
              };
            }
            return commission;
          })
        );
        cancelEditingCommission(id);
        toast.success("Комиссия успешно обновлена");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating commission:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при обновлении комиссии"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const startEditingBonus = (bonus: CashbackBonusFormData) => {
    setEditableBonuses(prev => [
      ...prev,
      {
        id: bonus.id,
        isEditing: true,
        tempData: {
          cashbackBonus: bonus.cashbackBonus,
          condition: bonus.condition
        }
      }
    ]);
  };

  const cancelEditingBonus = (id: string) => {
    setEditableBonuses(prev => prev.filter(item => item.id !== id));
  };

  const updateTempBonusData = (
    id: string,
    field: keyof EditableBonus["tempData"],
    value: string | number
  ) => {
    setEditableBonuses(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            tempData: {
              ...item.tempData,
              [field]: value
            }
          };
        }
        return item;
      })
    );
  };

  const saveBonusEdit = async (id: string) => {
    const editedBonus = editableBonuses.find(item => item.id === id);
    if (!editedBonus) return;

    try {
      setIsSaving(true);
      const url = `/api/projects/${project.id}/purchase-conditions/cashback-bonuses/${id}`;
      const requestData = editedBonus.tempData;

      console.log("Sending bonus update request:", {
        url,
        method: "PUT",
        data: requestData
      });

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update bonus");
      }

      const result = await response.json();

      if (result.success) {
        setCashbackBonusArray(prev =>
          prev.map(bonus => {
            if (bonus.id === id) {
              return {
                ...bonus,
                ...editedBonus.tempData
              };
            }
            return bonus;
          })
        );
        cancelEditingBonus(id);
        toast.success("Кэшбэк бонус успешно обновлен");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating bonus:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при обновлении кэшбэк бонуса"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Загрузка актуальных данных при монтировании компонента
  useEffect(() => {
    console.log("PurchaseConditionsForm - project:", project);

    if (!project) {
      console.log("PurchaseConditionsForm - проект отсутствует");
      return;
    }

    console.log("PurchaseConditionsForm - currency:", project.currency);

    // Проверяем, доступны ли данные через PurchaseConditions с заглавной буквы или через purchaseConditions с маленькой
    const purchaseConditionsData =
      (project as any).PurchaseConditions || project.purchaseConditions;
    console.log(
      "PurchaseConditionsForm - purchaseConditions:",
      purchaseConditionsData
    );
    console.log(
      "PurchaseConditionsForm - paymentStages:",
      project.paymentStages
    );
    console.log(
      "PurchaseConditionsForm - agentCommissions:",
      project.agentCommissions
    );
    console.log(
      "PurchaseConditionsForm - cashbackBonuses:",
      project.cashbackBonuses
    );
    console.log(
      "PurchaseConditionsForm - additionalExpenses:",
      project.additionalExpenses
    );

    setPaymentStages(project.paymentStages || []);
    setAgentCommissions(project.agentCommissions || []);
    setCashbackBonusArray(project.cashbackBonuses || []);
    setAdditionalExpenses(project.additionalExpenses || []);

    // Если есть существующие условия покупки, заполняем форму
    if (purchaseConditionsData) {
      console.log(
        "PurchaseConditionsForm - Заполняем форму условий покупки",
        purchaseConditionsData
      );
      reset({
        currentCurrency: project.currency || "",
        leaseholdDuration: purchaseConditionsData.leaseholdDuration || 0,
        reservationFee: purchaseConditionsData.reservationFee || 0,
        reservationDuration: purchaseConditionsData.reservationDuration || 0,
        onTimePaymentDiscont: purchaseConditionsData.onTimePaymentDiscont || 0
      });
    } else {
      console.log(
        "PurchaseConditionsForm - Условия покупки отсутствуют, используем значения по умолчанию"
      );
      reset({
        currentCurrency: project.currency || "",
        leaseholdDuration: 0,
        reservationFee: 0,
        reservationDuration: 0,
        onTimePaymentDiscont: 0
      });
    }
  }, [project, reset]);

  return (
    <>
      <div className="space-y-6">
        {/* General Information */}
        <form onSubmit={handleSubmit(handlePurchaseConditionsSave)}>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.currency")}
            </h3>
            <Input
              type="text"
              disabled
              label={t("sections.purchaseConditions.currency")}
              value={project.currency || ""}
            />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.label")}
            </h3>
            <Switch
              defaultSelected={isPurchaseConditions}
              checked={isPurchaseConditions}
              onValueChange={() =>
                setIsPurchaseConditions(!isPurchaseConditions)
              }
            >
              {t("sections.purchaseConditions.leaseholdDuration")}
            </Switch>
            {isPurchaseConditions && (
              <div className="flex flex-col gap-4">
                <Input
                  type="number"
                  label={t("sections.purchaseConditions.leaseholdDuration")}
                  {...register("leaseholdDuration", {
                    required: true,
                    min: 0
                  })}
                />
                <div className="flex flex-col-2 gap-4">
                  <Input
                    type="number"
                    label={t("sections.purchaseConditions.reservationFee")}
                    {...register("reservationFee", { required: true, min: 0 })}
                  />
                  <Input
                    type="number"
                    label={t("sections.purchaseConditions.reservationDuration")}
                    {...register("reservationDuration", {
                      required: true,
                      min: 0
                    })}
                  />
                </div>
                <Input
                  type="number"
                  label={t("sections.purchaseConditions.onTimePaymentDiscont")}
                  {...register("onTimePaymentDiscont", {
                    required: true,
                    min: 0
                  })}
                />
              </div>
            )}
          </div>

          <div className="flex mt-4 justify-end">
            <Button type="submit" color="primary" isLoading={isSaving}>
              {t("save")}
            </Button>
          </div>
        </form>

        {/* Additional Expenses */}
        <form
          className="mt-4"
          onSubmit={e => {
            e.preventDefault();
            handleAdditionalExpensesSave();
          }}
        >
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.additionalExpenses")}
            </h3>
            <Switch
              defaultSelected={isAdditionalExpenses}
              checked={isAdditionalExpenses}
              onValueChange={() =>
                setIsAdditionalExpenses(!isAdditionalExpenses)
              }
            >
              {t("sections.purchaseConditions.additionalExpensesDescription")}
            </Switch>

            {isAdditionalExpenses && (
              <>
                {additionalExpenses.map(expense => {
                  const editableExpense = editableExpenses.find(
                    item => item.id === expense.id
                  );
                  const isEditing = !!editableExpense;

                  return (
                    <div key={expense.id} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.nameOfExpenses"
                                )}
                                value={
                                  editableExpense.tempData.nameOfExpenses || ""
                                }
                                onChange={e =>
                                  updateTempExpenseData(
                                    expense.id,
                                    "nameOfExpenses",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.costOfExpenses"
                                )}
                                value={
                                  editableExpense.tempData.costOfExpenses?.toString() ||
                                  "0"
                                }
                                onChange={e =>
                                  updateTempExpenseData(
                                    expense.id,
                                    "costOfExpenses",
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  isLoading={isSaving}
                                  onPress={() => saveExpenseEdit(expense.id)}
                                >
                                  <Save size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() =>
                                    cancelEditingExpense(expense.id)
                                  }
                                >
                                  <X size={18} />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                disabled
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.nameOfExpenses"
                                )}
                                value={expense.nameOfExpenses}
                              />
                              <Input
                                disabled
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.costOfExpenses"
                                )}
                                value={expense.costOfExpenses.toString()}
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  onPress={() => startEditingExpense(expense)}
                                >
                                  <Pencil size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() =>
                                    deleteAdditionalExpense(expense.id)
                                  }
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => setIsAdditionalExpenseModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white rounded-full p-1">
                      <Plus size={16} className="text-primary" />
                    </div>
                    {t("sections.purchaseConditions.addStage")}
                  </Button>
                </div>
              </>
            )}
          </div>
          {additionalExpenses.length > 0 && isAdditionalExpenses && (
            <div className="flex mt-4 justify-end">
              <Button type="submit" color="primary" isLoading={isSaving}>
                {t("save")}
              </Button>
            </div>
          )}
        </form>

        {/* Instalment Plan*/}
        <form
          className="mt-4"
          onSubmit={e => {
            e.preventDefault();
            handleInstalmentPlanSave();
          }}
        >
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.instalmentPlan")}
            </h3>
            <Switch
              defaultSelected={isInstalmentPlan}
              checked={isInstalmentPlan}
              onValueChange={() => setIsInstalmentPlan(!isInstalmentPlan)}
            >
              {t("sections.purchaseConditions.instalmentPaymentPlan")}
            </Switch>

            {isInstalmentPlan && (
              <>
                {paymentStages.map(stage => {
                  const editableStage = editableStages.find(
                    item => item.id === stage.id
                  );
                  const isEditing = !!editableStage;

                  return (
                    <div key={stage.id} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.stageName"
                                )}
                                value={editableStage.tempData.stageName || ""}
                                onChange={e =>
                                  updateTempStageData(
                                    stage.id,
                                    "stageName",
                                    e.target.value
                                  )
                                }
                              />
                              <Input
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.paymentAmount"
                                )}
                                value={
                                  editableStage.tempData.paymentAmount.toString() ||
                                  "0"
                                }
                                onChange={e =>
                                  updateTempStageData(
                                    stage.id,
                                    "paymentAmount",
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  isLoading={isSaving}
                                  onPress={() => saveStageEdit(stage.id)}
                                >
                                  <Save size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() => cancelEditingStage(stage.id)}
                                >
                                  <X size={18} />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                disabled
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.stageName"
                                )}
                                value={stage.stageName}
                              />
                              <Input
                                disabled
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.paymentAmount"
                                )}
                                value={stage.paymentAmount.toString()}
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  onPress={() => startEditingStage(stage)}
                                >
                                  <Pencil size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() => deleteStage(stage.id)}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => setIsStageModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white rounded-full p-1">
                      <Plus size={16} className="text-primary" />
                    </div>
                    {t("sections.purchaseConditions.addStage")}
                  </Button>
                </div>
              </>
            )}
          </div>
          {paymentStages.length > 0 && isInstalmentPlan && (
            <div className="flex mt-4 justify-end">
              <Button type="submit" color="primary" isLoading={isSaving}>
                {t("save")}
              </Button>
            </div>
          )}
        </form>

        {/* Agent commission*/}
        <form
          className="mt-4"
          onSubmit={e => {
            e.preventDefault();
            handleAgentCommissionSave();
          }}
        >
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.agentCommission")}
            </h3>
            <Switch
              defaultSelected={agentCommission}
              checked={agentCommission}
              onValueChange={() => setAgentCommission(!agentCommission)}
            >
              {t("sections.purchaseConditions.agentCommissionDescription")}
            </Switch>

            {agentCommission && (
              <>
                {agentCommissions.map(commission => {
                  const editableCommission = editableCommissions.find(
                    item => item.id === commission.id
                  );
                  const isEditing = !!editableCommission;

                  return (
                    <div key={commission.id} className="flex flex-col gap-4">
                      <div className="flex flex-col-2 gap-4">
                        {isEditing ? (
                          <>
                            <Input
                              className="w-1/3"
                              type="number"
                              label={t("sections.purchaseConditions.from")}
                              value={editableCommission.tempData.from.toString()}
                              onChange={e =>
                                updateTempCommissionData(
                                  commission.id,
                                  "from",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <Input
                              className="w-1/3"
                              type="number"
                              label={t("sections.purchaseConditions.to")}
                              value={editableCommission.tempData.to.toString()}
                              onChange={e =>
                                updateTempCommissionData(
                                  commission.id,
                                  "to",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <Input
                              className="w-1/3"
                              type="number"
                              label={t(
                                "sections.purchaseConditions.commission"
                              )}
                              value={editableCommission.tempData.commission.toString()}
                              onChange={e =>
                                updateTempCommissionData(
                                  commission.id,
                                  "commission",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <div className="flex items-end gap-1 mb-2">
                              <Button
                                className="min-w-10 h-10 p-0"
                                color="primary"
                                variant="light"
                                isLoading={isSaving}
                                onPress={() =>
                                  saveCommissionEdit(commission.id)
                                }
                              >
                                <Save size={18} />
                              </Button>
                              <Button
                                className="min-w-10 h-10 p-0"
                                color="danger"
                                variant="light"
                                onPress={() =>
                                  cancelEditingCommission(commission.id)
                                }
                              >
                                <X size={18} />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <Input
                              disabled
                              className="w-1/3"
                              type="number"
                              label={t("sections.purchaseConditions.from")}
                              value={commission.from.toString()}
                            />
                            <Input
                              disabled
                              className="w-1/3"
                              type="number"
                              label={t("sections.purchaseConditions.to")}
                              value={commission.to.toString()}
                            />
                            <Input
                              disabled
                              className="w-1/3"
                              type="number"
                              label={t(
                                "sections.purchaseConditions.commission"
                              )}
                              value={commission.commission.toString()}
                            />
                            <div className="flex items-end gap-1 mb-2">
                              <Button
                                className="min-w-10 h-10 p-0"
                                color="primary"
                                variant="light"
                                onPress={() =>
                                  startEditingCommission(commission)
                                }
                              >
                                <Pencil size={18} />
                              </Button>
                              <Button
                                className="min-w-10 h-10 p-0"
                                color="danger"
                                variant="light"
                                onPress={() =>
                                  deleteAgentCommission(commission.id)
                                }
                              >
                                <Trash2 size={18} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => setIsAgentCommissionModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white rounded-full p-1">
                      <Plus size={16} className="text-primary" />
                    </div>
                    {t("sections.purchaseConditions.addStage")}
                  </Button>
                </div>
              </>
            )}
          </div>
          {agentCommissions.length > 0 && agentCommission && (
            <div className="flex mt-4 justify-end">
              <Button type="submit" color="primary" isLoading={isSaving}>
                {t("save")}
              </Button>
            </div>
          )}
        </form>

        {/* Cashback Bonus Plan*/}
        <form
          className="mt-4"
          onSubmit={e => {
            e.preventDefault();
            handleCashbackBonusSave();
          }}
        >
          <div className="flex flex-col gap-4 mt-4">
            <h3 className="text-lg font-bold">
              {t("sections.purchaseConditions.cashbackBonusPlan")}
            </h3>
            <Switch
              defaultSelected={isCashbackBonusPlan}
              checked={isCashbackBonusPlan}
              onValueChange={() => setIsCashbackBonusPlan(!isCashbackBonusPlan)}
            >
              {t("sections.purchaseConditions.cashbackBonusPlanDescription")}
            </Switch>
            {isCashbackBonusPlan && (
              <>
                {cashbackBonusArray.map(bonus => {
                  const editableBonus = editableBonuses.find(
                    item => item.id === bonus.id
                  );
                  const isEditing = !!editableBonus;

                  return (
                    <div key={bonus.id} className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.cashbackBonusAmount"
                                )}
                                value={
                                  editableBonus.tempData.cashbackBonus.toString() ||
                                  "0"
                                }
                                onChange={e =>
                                  updateTempBonusData(
                                    bonus.id,
                                    "cashbackBonus",
                                    parseFloat(e.target.value)
                                  )
                                }
                              />
                              <Input
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.cashbackBonusCondition"
                                )}
                                value={editableBonus.tempData.condition || ""}
                                onChange={e =>
                                  updateTempBonusData(
                                    bonus.id,
                                    "condition",
                                    e.target.value
                                  )
                                }
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  isLoading={isSaving}
                                  onPress={() => saveBonusEdit(bonus.id)}
                                >
                                  <Save size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() => cancelEditingBonus(bonus.id)}
                                >
                                  <X size={18} />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                disabled
                                className="w-32"
                                type="number"
                                label={t(
                                  "sections.purchaseConditions.cashbackBonusAmount"
                                )}
                                value={bonus.cashbackBonus.toString()}
                              />
                              <Input
                                disabled
                                className="flex-1"
                                type="text"
                                label={t(
                                  "sections.purchaseConditions.cashbackBonusCondition"
                                )}
                                value={bonus.condition}
                              />
                              <div className="flex items-end gap-1 mb-2">
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="primary"
                                  variant="light"
                                  onPress={() => startEditingBonus(bonus)}
                                >
                                  <Pencil size={18} />
                                </Button>
                                <Button
                                  className="min-w-10 h-10 p-0"
                                  color="danger"
                                  variant="light"
                                  onPress={() => deleteCashbackBonus(bonus.id)}
                                >
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-start">
                  <Button
                    type="button"
                    color="primary"
                    onClick={() => setIsCashbackBonusModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white rounded-full p-1">
                      <Plus size={16} className="text-primary" />
                    </div>
                    {t("sections.purchaseConditions.addStage")}
                  </Button>
                </div>
              </>
            )}
          </div>
          {cashbackBonusArray.length > 0 && isCashbackBonusPlan && (
            <div className="flex mt-4 justify-end">
              <Button type="submit" color="primary" isLoading={isSaving}>
                {t("save")}
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Stage Modal */}
      <Modal isOpen={isStageModalOpen} onOpenChange={setIsStageModalOpen}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("sections.purchaseConditions.modalTitle")}
              </ModalHeader>
              <ModalBody>
                <Input
                  className="w-full"
                  type="text"
                  label={t("sections.purchaseConditions.stageName")}
                  value={stageName}
                  onChange={e => setStageName(e.target.value)}
                />
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.paymentAmount")}
                  value={paymentAmount.toString()}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("sections.purchaseConditions.btnClose")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => createStage(stageName, paymentAmount)}
                >
                  {t("sections.purchaseConditions.btnAction")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Agent Commission Modal */}
      <Modal
        isOpen={isAgentCommissionModalOpen}
        onOpenChange={setIsAgentCommissionModalOpen}
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("sections.purchaseConditions.modalTitleComission")}
              </ModalHeader>
              <ModalBody>
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.from")}
                  value={from.toString()}
                  onChange={e => setFrom(Number(e.target.value))}
                />
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.to")}
                  value={to.toString()}
                  onChange={e => setTo(Number(e.target.value))}
                />
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.commission")}
                  value={commission.toString()}
                  onChange={e => setCommission(Number(e.target.value))}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("sections.purchaseConditions.btnClose")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => createAgentCommission(from, to, commission)}
                >
                  {t("sections.purchaseConditions.btnAction")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cashback Bonus Modal */}
      <Modal
        isOpen={isCashbackBonusModalOpen}
        onOpenChange={setIsCashbackBonusModalOpen}
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("sections.purchaseConditions.modalTitleCashback")}
              </ModalHeader>
              <ModalBody>
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.cashbackBonus")}
                  value={cashbackBonus.toString()}
                  onChange={e => setCashbackBonus(Number(e.target.value))}
                />
                <Input
                  className="w-full"
                  type="text"
                  label={t(
                    "sections.purchaseConditions.cashbackBonusCondition"
                  )}
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("sections.purchaseConditions.btnClose")}
                </Button>
                <Button
                  color="primary"
                  onPress={() => createCashbackBonus(cashbackBonus, condition)}
                >
                  {t("sections.purchaseConditions.btnAction")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Additional Expense Modal */}
      <Modal
        isOpen={isAdditionalExpenseModalOpen}
        onOpenChange={setIsAdditionalExpenseModalOpen}
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {t("sections.purchaseConditions.modalTitleExpenses")}
              </ModalHeader>
              <ModalBody>
                <Input
                  className="w-full"
                  type="text"
                  label={t("sections.purchaseConditions.nameOfExpenses")}
                  value={nameOfExpenses}
                  onChange={e => setNameOfExpenses(e.target.value)}
                />
                <Input
                  className="w-full"
                  type="number"
                  label={t("sections.purchaseConditions.costOfExpenses")}
                  value={costOfExpenses.toString()}
                  onChange={e => setCostOfExpenses(Number(e.target.value))}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("sections.purchaseConditions.btnClose")}
                </Button>
                <Button
                  color="primary"
                  onPress={() =>
                    createAdditionalExpense(costOfExpenses, nameOfExpenses)
                  }
                >
                  {t("sections.purchaseConditions.btnAction")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
