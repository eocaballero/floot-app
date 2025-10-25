import { useQuery } from "@tanstack/react-query";
import { mockStands } from "./mockData";

export const STANDS_QUERY_KEY = ["stands"] as const;

export const useStandsQuery = () => {
  return useQuery({
    queryKey: STANDS_QUERY_KEY,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return { stands: mockStands };
    },
  });
};