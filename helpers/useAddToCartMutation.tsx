import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CART_QUERY_KEY } from "./useCartQuery";
import { addToMockCart } from "./mockData";

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      const updatedCart = addToMockCart(productId, quantity);
      return { items: updatedCart };
    },
    onSuccess: () => {
      // Invalidate the cart query to refetch the updated cart data
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};