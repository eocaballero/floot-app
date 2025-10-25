import { useQuery } from "@tanstack/react-query";
import { mockMyProducts } from "./mockData";

export const MY_PRODUCTS_QUERY_KEY = ["orders", "my-products"] as const;

export const useMyProductsQuery = () => {
  return useQuery({
    queryKey: MY_PRODUCTS_QUERY_KEY,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return { orders: mockMyProducts };
    },
    refetchOnMount: 'always', // Refetch even when cached to ensure fresh data after navigation
    refetchOnWindowFocus: true, // Keep data fresh when user returns to the app
  });
};