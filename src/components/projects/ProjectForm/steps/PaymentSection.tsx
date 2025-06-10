import {
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  IconButton
} from "@mui/material";
import { Project, PaymentPlanInstallment } from "@/types/project";
import { useTranslations } from "next-intl";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface Props {
  formData: Partial<Project>;
  setFormData: (data: Partial<Project>) => void;
}

export default function PaymentSection({ formData, setFormData }: Props) {
  const t = useTranslations("pages.projects.form.payment");

  const handleDepositChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      paymentPlan: {
        ...formData.paymentPlan,
        deposit: Number(event.target.value)
      }
    });
  };

  const handleAddInstallment = () => {
    const newInstallment: PaymentPlanInstallment = {
      amount: 0,
      dueDate: "",
      description: ""
    };

    setFormData({
      ...formData,
      paymentPlan: {
        ...formData.paymentPlan,
        installments: [
          ...(formData.paymentPlan?.installments || []),
          newInstallment
        ]
      }
    });
  };

  const handleInstallmentChange =
    (index: number, field: keyof PaymentPlanInstallment) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newInstallments = formData.paymentPlan?.installments?.map(
        (inst, i) => {
          if (i === index) {
            return {
              ...inst,
              [field]:
                field === "amount"
                  ? Number(event.target.value)
                  : event.target.value
            };
          }
          return inst;
        }
      );

      setFormData({
        ...formData,
        paymentPlan: {
          ...formData.paymentPlan,
          installments: newInstallments || []
        }
      });
    };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          type="number"
          label={t("deposit")}
          value={formData.paymentPlan?.deposit || ""}
          onChange={handleDepositChange}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2
          }}
        >
          <Typography variant="subtitle1">{t("installments")}</Typography>
          <Button startIcon={<AddIcon />} onClick={handleAddInstallment}>
            {t("addInstallment")}
          </Button>
        </Box>

        {formData.paymentPlan?.installments?.map((installment, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("amount")}
                  value={installment.amount}
                  onChange={handleInstallmentChange(index, "amount")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  type="date"
                  label={t("dueDate")}
                  value={installment.dueDate}
                  onChange={handleInstallmentChange(index, "dueDate")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={t("description")}
                  value={installment.description}
                  onChange={handleInstallmentChange(index, "description")}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton
                  onClick={() => {
                    /* Добавить удаление */
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Grid>
    </Grid>
  );
}
