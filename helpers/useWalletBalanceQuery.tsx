import { useQuery } from "@tanstack/react-query";
import { mockWalletBalance } from "./mockData";

export const WALLET_BALANCE_QUERY_KEY = ["wallet", "balance"] as const;

export const useWalletBalanceQuery = () => {
  return useQuery({
    queryKey: WALLET_BALANCE_QUERY_KEY,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 350));
      return mockWalletBalance;
    },
    refetchOnWindowFocus: true, // Refetch on focus to ensure balance is up-to-date
  });
};