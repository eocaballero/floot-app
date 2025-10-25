import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InputType } from "../endpoints/wallet/create_payment_POST.schema";
import { WALLET_BALANCE_QUERY_KEY } from "./useWalletBalanceQuery";
import { toast } from "sonner";

export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InputType) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate successful payment creation
      return {
        success: true,
        preferenceId: `mock-preference-${Math.random().toString(36).substring(2, 15)}`,
        initPoint: "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock",
      };
    },
    onSuccess: () => {
      // Invalidate balance to show the updated amount immediately
      queryClient.invalidateQueries({ queryKey: WALLET_BALANCE_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo procesar el pago.';
      toast.error(errorMessage);
    },
  });
};