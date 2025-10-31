import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { fetchWithAuth, SessionExpiredError } from "./fetchWithAuth";

export interface Customer {
  id: number;
  name: string;
  email: string;
  balance: number;
}

const fetchCustomerData = async (): Promise<Customer> => {
  const response = await fetchWithAuth(
    "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net/customers/my",
  );

  console.log("Customer API response:", response.status, response.statusText, "Content-Length:", response.headers.get("content-length"));

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("No autorizado. Por favor, inicie sesión de nuevo.");
    }
    throw new Error("No se pudo obtener la información del cliente.");
  }

  // El backend devuelve 200 con body vacío cuando el usuario no tiene datos de cliente
  const contentLength = response.headers.get("content-length");
  if (contentLength === "0") {
    throw new Error("No se encontraron datos de cliente. Es posible que su usuario no esté registrado como cliente en el sistema.");
  }

  return response.json();
};

/**
 * A custom React hook to fetch the current authenticated customer's data.
 * It uses React Query for data fetching, caching, and state management.
 * The query is only enabled if the user is authenticated.
 */
export const useCustomer = () => {
  const { isAuthenticated } = useAuth();

  return useQuery<Customer, Error>({
    queryKey: ["customer", "me"],
    queryFn: fetchCustomerData,
    enabled: isAuthenticated, // Only run the query if the user is logged in
    staleTime: 0, // Always consider data stale
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Always refetch when component mounts
  });
};