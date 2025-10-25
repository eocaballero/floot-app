import { useQuery } from "@tanstack/react-query";
import type { InputType as ProductsListInput } from "../endpoints/products/list_GET.schema";
import { mockProducts } from "./mockData";

export const PRODUCTS_QUERY_KEY = "products";

export const useProductsQuery = (params: ProductsListInput) => {
  return useQuery({
    queryKey: [PRODUCTS_QUERY_KEY, params],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Filter mock products based on params
      let filteredProducts = [...mockProducts];
      
      if (params.standId) {
        filteredProducts = filteredProducts.filter(p => p.standId === params.standId);
      }
      
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          (p.description && p.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Map to include standName in the output
      const productsWithStandName = filteredProducts.map(p => ({
        ...p,
        standName: p.stand.name,
      }));
      
      return { products: productsWithStandName };
    },
  });
};