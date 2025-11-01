import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchWithAuth } from "./fetchWithAuth";
import { useAuth } from "./useAuth";

const API_BASE_URL =
  "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net";

// --- Types ---

/**
 * Represents an item in the shopping cart as returned by the GET endpoint.
 */
export interface CartItem {
  productId: number;
  quantity: number;
}

/**
 * Represents the payload for updating a cart item via the POST endpoint.
 * Note the property casing difference from the CartItem interface.
 */
interface UpdateCartItemPayload {
  ProductId: number;
  Quantity: number;
}

// --- API Functions ---

/**
 * Fetches all items from the user's shopping cart.
 * @returns A promise that resolves to an array of CartItem objects.
 */
const fetchCartItems = async (): Promise<CartItem[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/cart/all`);

  if (!response.ok) {
    throw new Error("Failed to fetch cart items.");
  }

  return response.json();
};

/**
 * Updates a single item in the shopping cart.
 * @param payload - The product ID and new quantity.
 * @returns A promise that resolves when the update is complete.
 */
const updateCartItem = async (
  payload: UpdateCartItemPayload,
): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/cart/item`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart item.");
  }
};

// --- React Query Hooks ---

const CART_QUERY_KEY = ["cart"];

/**
 * A React Query hook for fetching the user's cart items.
 * @param enabled - Optional parameter to control whether the query should run. Defaults to true.
 */
export const useCartItems = (enabled: boolean = true) => {
  return useQuery<CartItem[], Error>({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCartItems,
    enabled,
  });
};

/**
 * A React Query mutation hook for updating a cart item, with optimistic updates.
 */
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateCartItemPayload, { previousCart: CartItem[] | undefined }>({
    mutationFn: updateCartItem,
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: CART_QUERY_KEY });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<CartItem[]>(CART_QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<CartItem[]>(CART_QUERY_KEY, (oldCart = []) => {
        const existingItemIndex = oldCart.findIndex(
          (item) => item.productId === newItem.ProductId,
        );

        // If the new quantity is 0, remove the item
        if (newItem.Quantity <= 0) {
          if (existingItemIndex !== -1) {
            return oldCart.filter((item) => item.productId !== newItem.ProductId);
          }
          return oldCart; // Item wasn't in the cart anyway
        }

        // If item exists, update its quantity
        if (existingItemIndex !== -1) {
          const updatedCart = [...oldCart];
          updatedCart[existingItemIndex] = {
            productId: newItem.ProductId,
            quantity: newItem.Quantity,
          };
          return updatedCart;
        }

        // If item is new, add it to the cart
        return [
          ...oldCart,
          { productId: newItem.ProductId, quantity: newItem.Quantity },
        ];
      });

      // Return a context object with the snapshotted value
      return { previousCart };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newItem, context) => {
      console.error("Cart update failed, rolling back optimistic update:", err);
      if (context?.previousCart) {
        queryClient.setQueryData(CART_QUERY_KEY, context.previousCart);
      }
    },
    // Always refetch after error or success to ensure data consistency
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

// --- Main Hook and Helper Functions ---

/**
 * Custom hook for managing all shopping cart interactions.
 * Provides data, mutation status, and convenient helper functions.
 */
export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const { data: cartItems = [], ...query } = useCartItems(isAuthenticated);
  const { mutate, ...mutation } = useUpdateCartItem();

  /**
   * Retrieves the quantity of a specific product in the cart.
   * @param productId - The ID of the product to check.
   * @returns The quantity of the product, or 0 if not in the cart.
   */
  const getProductQuantity = useCallback(
    (productId: number): number => {
      const item = cartItems.find((item) => item.productId === productId);
      return item?.quantity ?? 0;
    },
    [cartItems],
  );

  /**
   * Updates the quantity of a product in the cart.
   * Setting quantity to 0 will remove the item.
   * @param productId - The ID of the product to update.
   * @param quantity - The new quantity.
   */
  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      mutate({ ProductId: productId, Quantity: Math.max(0, quantity) });
    },
    [mutate],
  );

  /**
   * Increments the quantity of a product in the cart by one.
   * @param productId - The ID of the product to increment.
   */
  const incrementQuantity = useCallback(
    (productId: number) => {
      const currentQuantity = getProductQuantity(productId);
      updateQuantity(productId, currentQuantity + 1);
    },
    [getProductQuantity, updateQuantity],
  );

  /**
   * Decrements the quantity of a product in the cart by one.
   * @param productId - The ID of the product to decrement.
   */
  const decrementQuantity = useCallback(
    (productId: number) => {
      const currentQuantity = getProductQuantity(productId);
      updateQuantity(productId, currentQuantity - 1);
    },
    [getProductQuantity, updateQuantity],
  );

  return {
    // Cart data and query state
    cartItems,
    isCartLoading: query.isLoading,
    isCartFetching: query.isFetching,
    cartError: query.error,

    // Mutation state
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    isUpdatingCart: mutation.isPending,
    cartUpdateError: mutation.error,

    // Helper function
    getProductQuantity,
  };
};