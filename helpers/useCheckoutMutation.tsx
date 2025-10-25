import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "./useCartQuery";
import { WALLET_BALANCE_QUERY_KEY } from "./useWalletBalanceQuery";
import { MY_PRODUCTS_QUERY_KEY } from "./useMyProductsQuery";
import { clearMockCart } from "./mockData";
import { toast } from "sonner";

// Assuming there will be an orders query, define its key here for invalidation
export const ORDERS_QUERY_KEY = "orders";

export const useCheckoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      clearMockCart();
      return { success: true, message: "Compra realizada con éxito" };
    },
    onSuccess: () => {
      // After checkout, the cart is empty, a new order is created, and the wallet balance is deducted.
      // Invalidate all relevant queries.
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: WALLET_BALANCE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MY_PRODUCTS_QUERY_KEY });
      toast.success("¡Compra realizada con éxito!");
    },
  });
};