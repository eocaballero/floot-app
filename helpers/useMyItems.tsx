import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "./fetchWithAuth";

const API_BASE_URL =
  "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net";

/**
 * Represents a purchased item, including total quantity and consumed amount.
 */
export interface MyItem {
  productId: number;
  quantity: number;
  consumed: number;
}

/**
 * Fetches all items purchased by the current user.
 * @returns A promise that resolves to an array of MyItem objects.
 */
const fetchMyItems = async (): Promise<MyItem[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/myitems/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch purchased items.");
  }

  return response.json();
};

/**
 * A React Query hook for fetching the user's purchased items.
 */
export const useMyItems = () => {
  return useQuery<MyItem[], Error>({
    queryKey: ["myItems"],
    queryFn: fetchMyItems,
  });
};