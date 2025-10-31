import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "./fetchWithAuth";

export interface Product {
  id: number;
  name: string;
  price: number;
  standName: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetchWithAuth(
    "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/products/all"
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};