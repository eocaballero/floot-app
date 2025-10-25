import { useQuery } from "@tanstack/react-query";
import { getMockCart } from "./mockData";

export const CART_QUERY_KEY = ["cart", "items"] as const;

export const useCartQuery = () => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      // getMockCart now returns {items, total}
      return getMockCart();
    },
  });
};