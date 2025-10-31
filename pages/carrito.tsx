import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../helpers/fetchWithAuth";
import {
  Utensils,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProducts, Product } from "../helpers/useProducts";
import { useCart, CartItem } from "../helpers/useCart";
import { useAuth } from "../helpers/useAuth";
import { useCustomer } from "../helpers/useCustomer";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/Dialog";
import styles from "./carrito.module.css";

const API_BASE_URL =
  "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface DetailedCartItem extends Product {
  quantity: number;
  subtotal: number;
}

interface ConfirmPurchasePayload {
  TotalAmount: number;
}

const confirmPurchase = async (payload: ConfirmPurchasePayload): Promise<void> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/cart/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 400) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al confirmar la compra");
      } catch (parseError) {
        // If JSON parsing fails, throw a generic error
        if (parseError instanceof Error && parseError.message) {
          throw parseError;
        }
        throw new Error("Error al confirmar la compra");
      }
    }
    throw new Error("No se pudo confirmar la compra.");
  }
};

const CartItemSkeleton = () => (
  <div className={styles.cartItem}>
    <div className={styles.itemDetails}>
      <Skeleton
        style={{ width: "48px", height: "48px", borderRadius: "var(--radius)" }}
      />
      <div className={styles.itemInfo}>
        <Skeleton style={{ height: "1.25rem", width: "150px" }} />
        <Skeleton style={{ height: "1rem", width: "100px" }} />
      </div>
    </div>
    <div className={styles.itemControls}>
      <Skeleton style={{ height: "2rem", width: "100px" }} />
    </div>
    <div className={styles.itemPrice}>
      <Skeleton style={{ height: "1.25rem", width: "80px" }} />
    </div>
    <div className={styles.itemRemove}>
      <Skeleton style={{ height: "2rem", width: "2rem" }} />
    </div>
  </div>
);

const CartSummarySkeleton = () => (
  <div className={styles.summaryCard}>
    <h2 className={styles.summaryTitle}>Resumen de Compra</h2>
    <div className={styles.summaryDetails}>
      <div className={styles.summaryRow}>
        <Skeleton style={{ height: "1rem", width: "100px" }} />
        <Skeleton style={{ height: "1rem", width: "50px" }} />
      </div>
      <div className={styles.summaryRow}>
        <Skeleton style={{ height: "1rem", width: "120px" }} />
        <Skeleton style={{ height: "1rem", width: "90px" }} />
      </div>
      <div className={styles.summaryRow}>
        <Skeleton style={{ height: "1.5rem", width: "120px" }} />
        <Skeleton style={{ height: "1.5rem", width: "90px" }} />
      </div>
    </div>
    <Skeleton style={{ height: "2.5rem", width: "100%" }} />
  </div>
);

export default function CarritoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts();
  const {
    cartItems,
    isCartLoading,
    cartError,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    isUpdatingCart,
  } = useCart();
  const {
    data: customer,
    isLoading: isLoadingCustomer,
    error: customerError,
  } = useCustomer();

  const confirmMutation = useMutation({
    mutationFn: confirmPurchase,
    onSuccess: () => {
      console.log("Compra confirmada exitosamente, mostrando dialog de éxito");
      setShowSuccessDialog(true);
    },
    onError: (error: Error) => {
      console.error("Error al confirmar la compra:", error);
      toast.error(error.message || "Ocurrió un error al confirmar la compra.");
    },
  });

  useEffect(() => {
    // Redirect to login if not authenticated.
    // This check should happen after the initial auth state is determined.
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const detailedCartItems = useMemo((): DetailedCartItem[] => {
    if (!cartItems || !products) return [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    return cartItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
        };
      })
      .filter((item): item is DetailedCartItem => item !== null);
  }, [cartItems, products]);

  const { totalItems, totalPrice } = useMemo(() => {
    return detailedCartItems.reduce(
      (acc, item) => {
        acc.totalItems += item.quantity;
        acc.totalPrice += item.subtotal;
        return acc;
      },
      { totalItems: 0, totalPrice: 0 },
    );
  }, [detailedCartItems]);

  const handleConfirmPurchase = () => {
    if (!customer) {
      toast.error("No se pudo obtener la información de tu cuenta.");
      return;
    }

    // Check if user has sufficient balance
    if (customer.balance < totalPrice) {
      toast.error("Saldo insuficiente. Por favor, recarga tu billetera.");
      navigate("/billetera");
      return;
    }

    // Proceed with purchase confirmation
    confirmMutation.mutate({ TotalAmount: totalPrice });
  };

  const isLoading = isCartLoading || isLoadingProducts;
  const isError = cartError || productsError;
  const balance = customer?.balance ?? 0;
  const hasInsufficientBalance = balance < totalPrice;
  const missingAmount = hasInsufficientBalance ? totalPrice - balance : 0;

  if (!isAuthenticated) {
    // Render a minimal loading state or null while redirecting
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Cargando Carrito...</title>
        </Helmet>
        <header className={styles.header}>
          <h1 className={styles.title}>Mi Carrito</h1>
        </header>
        <div className={styles.contentLayout}>
          <div className={styles.itemsList}>
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
          <div className={styles.summaryContainer}>
            <CartSummarySkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.stateMessage}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h2>Ocurrió un error</h2>
          <p>No pudimos cargar tu carrito. Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  if (detailedCartItems.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Carrito Vacío | Fiesta Nacional de la Familia Piemontesa</title>
        </Helmet>
        <div className={styles.stateMessage}>
          <ShoppingCart size={48} />
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos desde la tienda para verlos aquí.</p>
          <Button asChild>
            <Link to="/tienda">Ir a la Tienda</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isConfirmButtonDisabled =
    isUpdatingCart ||
    confirmMutation.isPending ||
    isLoadingCustomer ||
    hasInsufficientBalance;

  const getConfirmButtonText = () => {
    if (confirmMutation.isPending) return "Confirmando...";
    if (hasInsufficientBalance) return "Saldo Insuficiente";
    return "Confirmar Compra";
  };

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Mi Carrito | Fiesta Nacional de la Familia Piemontesa</title>
        <meta
          name="description"
          content="Revisa los productos en tu carrito, ajusta las cantidades y prepárate para confirmar tu compra."
        />
      </Helmet>

      <header className={styles.header}>
        <h1 className={styles.title}>Mi Carrito</h1>
        <p className={styles.subtitle}>
          Revisa tus productos y confirma tu pedido.
        </p>
      </header>

      <div className={styles.contentLayout}>
        <div className={styles.itemsList}>
          {detailedCartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.itemDetails}>
                <div className={styles.itemIcon}>
                  <Utensils size={24} />
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemStand}>{item.standName}</span>
                </div>
              </div>

              <div className={styles.itemControls}>
                <Button
                  onClick={() => decrementQuantity(item.id)}
                  disabled={isUpdatingCart}
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Reducir cantidad de ${item.name}`}
                >
                  <Minus size={16} />
                </Button>
                <span className={styles.itemQuantity}>{item.quantity}</span>
                <Button
                  onClick={() => incrementQuantity(item.id)}
                  disabled={isUpdatingCart}
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Aumentar cantidad de ${item.name}`}
                >
                  <Plus size={16} />
                </Button>
              </div>

              <div className={styles.itemPrice}>
                {formatCurrency(item.subtotal)}
              </div>

              <div className={styles.itemRemove}>
                <Button
                  onClick={() => updateQuantity(item.id, 0)}
                  disabled={isUpdatingCart}
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${item.name} del carrito`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Resumen de Compra</h2>
            <div className={styles.summaryDetails}>
              <div className={styles.summaryRow}>
                <span>Productos ({totalItems})</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.balanceLabel}>
                  <Wallet size={16} />
                  Saldo disponible
                </span>
                {isLoadingCustomer ? (
                  <Skeleton style={{ height: "1rem", width: "80px" }} />
                ) : (
                  <span>{formatCurrency(balance)}</span>
                )}
              </div>
              {hasInsufficientBalance && !isLoadingCustomer && (
                <div className={`${styles.summaryRow} ${styles.insufficientBalance}`}>
                  <span>Saldo faltante</span>
                  <span>{formatCurrency(missingAmount)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <Button
              size="lg"
              className={styles.confirmButton}
              disabled={isConfirmButtonDisabled}
              onClick={handleConfirmPurchase}
            >
              {getConfirmButtonText()}
            </Button>
            {hasInsufficientBalance && !isLoadingCustomer && (
              <Button
                size="md"
                variant="outline"
                className={styles.rechargeButton}
                asChild
              >
                <Link to="/billetera">Recargar Billetera</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <div className={styles.successIconContainer}>
              <CheckCircle2 size={64} className={styles.successIcon} />
            </div>
            <DialogTitle>¡Compra Confirmada!</DialogTitle>
            <DialogDescription>
              Tu compra se ha registrado exitosamente
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              size="lg"
              onClick={async () => {
                console.log("Botón Continuar clickeado, invalidando queries...");
                await queryClient.refetchQueries({ queryKey: ["cart"] });
                await queryClient.refetchQueries({ queryKey: ["customer", "me"] });
                await queryClient.refetchQueries({ queryKey: ["myItems"] });
                console.log("Queries actualizadas, navegando a /compras");
                navigate("/compras");
              }}
            >
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}