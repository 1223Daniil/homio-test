import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@mui/material";
import { PaymentPlan } from "@/types/project";

interface PaymentSectionProps {
  paymentPlan: PaymentPlan;
}

export default function PaymentSection({ paymentPlan }: PaymentSectionProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Payment Plan
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="primary">
          Initial Deposit: {paymentPlan.deposit}%
        </Typography>
      </Box>

      <Stepper orientation="vertical">
        {paymentPlan.installments.map(
          (
            installment: { amount: number; description: string },
            index: number
          ) => (
            <Step key={index} active={true}>
              <StepLabel>
                <Typography variant="subtitle2">
                  {installment.amount}% - {installment.description}
                </Typography>
              </StepLabel>
            </Step>
          )
        )}
      </Stepper>
    </Paper>
  );
}
