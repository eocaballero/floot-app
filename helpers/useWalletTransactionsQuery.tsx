import { useQuery } from "@tanstack/react-query";
import type { InputType } from "../endpoints/wallet/transactions_GET.schema";
import { mockWalletTransactions } from "./mockData";

export const useWalletTransactionsQuery = (params: InputType) => {
  return useQuery({
    queryKey: ["wallet", "transactions", params.limit, params.offset],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Paginate mock transactions
      const offset = params.offset || 0;
      const limit = params.limit || 10;
      const paginatedTransactions = mockWalletTransactions.slice(offset, offset + limit);
      
      return { 
        transactions: paginatedTransactions,
        total: mockWalletTransactions.length 
      };
    },
    placeholderData: (previousData) => previousData,
  });
};