import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useProducts, Product } from "./useProducts";
import { useMemo } from "react";
import { fetchWithAuth } from "./fetchWithAuth";

// Types for the raw data from the API
interface Deposit {
  amount: number;
  depositDate: string;
}

interface ConfirmedPurchase {
  productId: number;
  quantity: number;
  confirmDate: string;
}

// Product detail for expense movements
export interface ProductDetail {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// The unified type for a single wallet movement
export interface WalletMovement {
  type: "income" | "expense";
  amount: number;
  date: Date;
  products?: ProductDetail[];
}

/**
 * Fetches all deposits for the authenticated user.
 * @returns A promise that resolves to an array of deposits.
 */
const fetchDeposits = async (): Promise<Deposit[]> => {
  const response = await fetchWithAuth(
    "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/deposits/all",
  );
  if (!response.ok) {
    throw new Error("Failed to fetch deposits");
  }
  return response.json();
};

/**
 * Fetches all confirmed purchases for the authenticated user.
 * @returns A promise that resolves to an array of confirmed purchases.
 */
const fetchConfirmedPurchases = async (): Promise<ConfirmedPurchase[]> => {
  const response = await fetchWithAuth(
    "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/cart/confirmed",
  );
  if (!response.ok) {
    throw new Error("Failed to fetch confirmed purchases");
  }
  return response.json();
};

/**
 * A custom React hook to fetch and process wallet movements (incomes and expenses).
 * It combines data from deposits and confirmed purchases, processes them, and returns
 * a single, sorted list of transactions.
 */
export const useWalletMovements = () => {
  const { isAuthenticated } = useAuth();
  const { data: products, isSuccess: productsLoaded } = useProducts();

  const productMap = useMemo(() => {
    if (!products) return new Map<number, Product>();
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  return useQuery<WalletMovement[], Error>({
    queryKey: ["walletMovements"],
    queryFn: async () => {
      // This function will only run if enabled is true, so products are guaranteed to be loaded.
      console.log("Fetching wallet movements...");

      // Fetch both data sources in parallel for efficiency
      const [deposits, purchases] = await Promise.all([
        fetchDeposits(),
        fetchConfirmedPurchases(),
      ]);

      // 1. Process incomes from deposits
      const incomeMovements: WalletMovement[] = deposits.map((deposit) => ({
        type: "income",
        amount: deposit.amount,
        date: new Date(deposit.depositDate),
      }));

      // 2. Process expenses from confirmed purchases
      // Group purchases by minute to aggregate transactions made close together
      const purchasesGroupedByMinute = new Map<string, ConfirmedPurchase[]>();

      purchases.forEach((purchase) => {
        const date = new Date(purchase.confirmDate);
        date.setSeconds(0, 0); // Round down to the nearest minute
        const key = date.toISOString();

        if (!purchasesGroupedByMinute.has(key)) {
          purchasesGroupedByMinute.set(key, []);
        }
        purchasesGroupedByMinute.get(key)!.push(purchase);
      });

      // Calculate total for each group and map to WalletMovement
      const expenseMovements: WalletMovement[] = [];
      purchasesGroupedByMinute.forEach((groupedPurchases, dateKey) => {
        const productDetails: ProductDetail[] = [];
        let totalAmount = 0;

        groupedPurchases.forEach((p) => {
          const product = productMap.get(p.productId);
          if (product) {
            const unitPrice = product.price;
            const subtotal = p.quantity * unitPrice;
            totalAmount += subtotal;

            productDetails.push({
              productName: product.name,
              quantity: p.quantity,
              unitPrice: unitPrice,
              subtotal: subtotal,
            });
          }
        });

        if (totalAmount > 0) {
          expenseMovements.push({
            type: "expense",
            amount: totalAmount,
            date: new Date(dateKey),
            products: productDetails,
          });
        }
      });

      // 3. Combine and sort
      const allMovements = [...incomeMovements, ...expenseMovements];
      allMovements.sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort descending

      console.log("Processed wallet movements:", allMovements);
      return allMovements;
    },
    // The query is enabled only when the user is authenticated and product data is successfully loaded.
    enabled: isAuthenticated && productsLoaded,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
};