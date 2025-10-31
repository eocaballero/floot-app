import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Wallet, AlertCircle, TrendingUp, TrendingDown, Eye, Plus } from "lucide-react";
import { fetchWithAuth } from "../helpers/fetchWithAuth";
import { useCustomer } from "../helpers/useCustomer";
import { useWalletMovements } from "../helpers/useWalletMovements";
import { useCart } from "../helpers/useCart";
import { useProducts } from "../helpers/useProducts";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../components/Dialog";
import { WalletMovement } from "../helpers/useWalletMovements";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import styles from "./billetera.module.css";

const API_BASE_URL = "https://patronales-minimalapi-b6hygpfegxb4a8ba.brazilsouth-01.azurewebsites.net";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
};

const formatDate = (date: Date) => {
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year} - ${hours}:${minutes}`;
};

const formatDateDialog = (date: Date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
};

const generateOrderId = (date: Date) => {
  return date.getTime().toString().slice(-8);
};

const BilleteraSkeleton = () => (
  <div className={styles.balanceCard}>
    <div className={styles.cardIcon}>
      <Wallet size={40} />
    </div>
    <Skeleton style={{ height: "1.25rem", width: "150px", margin: "var(--spacing-4) 0" }} />
    <Skeleton style={{ height: "3.5rem", width: "250px" }} />
  </div>
);

const MovementsSkeleton = () => (
  <div className={styles.movementsSection}>
    <h2 className={styles.movementsTitle}>Movimientos</h2>
    <div className={styles.movementsList}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.movementItem}>
          <div className={styles.movementLeft}>
            <Skeleton style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
            <Skeleton style={{ width: "180px", height: "1rem", marginLeft: "var(--spacing-3)" }} />
          </div>
          <Skeleton style={{ width: "100px", height: "1.5rem" }} />
        </div>
      ))}
    </div>
  </div>
);

export default function BilleteraPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedExpense, setSelectedExpense] = React.useState<WalletMovement | null>(null);
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState("");
  const [isCreatingPreference, setIsCreatingPreference] = useState(false);

  const { data: customer, isLoading: isLoadingCustomer, isError: isErrorCustomer, error: customerError, refetch: refetchCustomer } = useCustomer();
  const { data: movements, isFetching: isFetchingMovements, isError: isErrorMovements, error: movementsError } = useWalletMovements();
  const { cartItems } = useCart();
  const { data: products, isLoading: isLoadingProducts } = useProducts();
  
  const queryClient = useQueryClient();

  // Handle payment status from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    
    if (status) {
      console.log('Payment status detected:', status);
      
      if (status === 'approved') {
        toast.success('¡Pago exitoso!', {
          description: 'Tu saldo fue acreditado.',
        });
        refetchCustomer();
      } else if (status === 'failure') {
        toast.error('El pago fue rechazado.', {
          description: 'Intenta nuevamente.',
        });
      } else if (status === 'pending') {
        toast.warning('Pago pendiente.', {
          description: 'Te notificaremos cuando se acredite.',
        });
      }
      
      // Clean up URL params
      navigate('/billetera', { replace: true });
    }
  }, [searchParams, navigate, refetchCustomer]);

  // Force refetch when entering the wallet page
  useEffect(() => {
    refetchCustomer();
  }, [refetchCustomer]);

  const calculateCartTotal = () => {
    if (!products || !cartItems || cartItems.length === 0) {
      console.log("Cart total: 0 (no products or empty cart)");
      return 0;
    }
    
    let total = 0;
    for (const cartItem of cartItems) {
      const product = products.find(p => p.id === cartItem.productId);
      if (product) {
        total += product.price * cartItem.quantity;
      }
    }
    
    console.log("Cart total calculated:", formatCurrency(total));
    return total;
  };

  const handleQuickAmount = (amount: number) => {
    setDepositAmount(amount.toString());
    setDepositError("");
  };

  const handleCartNeededAmount = () => {
    const cartTotal = calculateCartTotal();
    const currentBalance = customer?.balance ?? 0;
    const needed = Math.max(0, cartTotal - currentBalance);
    const limited = Math.min(needed, 500000);
    
    if (limited <= 0) {
      setDepositError("Ya tienes saldo suficiente para tu carrito");
      return;
    }
    
    setDepositAmount(limited.toString());
    setDepositError("");
  };

  const validateAmount = (amount: string): boolean => {
    const numAmount = Number(amount);
    
    if (!amount || isNaN(numAmount)) {
      setDepositError("Ingresa un monto válido");
      return false;
    }
    
    if (numAmount <= 0) {
      setDepositError("El monto debe ser mayor a $0");
      return false;
    }
    
    if (numAmount > 500000) {
      setDepositError("El monto máximo es $500.000");
      return false;
    }
    
    setDepositError("");
    return true;
  };

  const handleConfirmDeposit = async () => {
    if (!validateAmount(depositAmount)) {
      return;
    }
    
    setIsCreatingPreference(true);
    
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/deposits/create-preference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: Number(depositAmount) }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo crear la preferencia de pago. Intenta de nuevo.");
      }

      const data = await response.json();
      
      if (!data.init_point) {
        throw new Error("Respuesta inválida del servidor.");
      }

      console.log('Opening Mercado Pago init_point:', data.init_point);
      
      // Open Mercado Pago in new window
      window.open(data.init_point, '_blank');
      
      // Close dialog
      setIsDepositDialogOpen(false);
      setDepositAmount("");
      setDepositError("");
      
      // Show informative toast
      toast.info('Redirigiendo a Mercado Pago...', {
        description: 'Completa el pago para que se acredite el saldo.',
      });
      
    } catch (error) {
      console.error('Error creating payment preference:', error);
      
      if (error instanceof Error) {
        toast.error('Error al procesar el pago', {
          description: error.message,
        });
      } else {
        toast.error('Error al procesar el pago', {
          description: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
        });
      }
    } finally {
      setIsCreatingPreference(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDepositAmount(value);
    if (value) {
      validateAmount(value);
    } else {
      setDepositError("");
    }
  };

  const renderBalanceCard = () => {
    if (isLoadingCustomer) {
      return <BilleteraSkeleton />;
    }

    if (isErrorCustomer) {
      console.error("Error fetching customer data:", customerError);
      return (
        <div className={styles.stateMessage}>
          <AlertCircle className={styles.errorIcon} size={48} />
          <h2>Ocurrió un error</h2>
          <p>No pudimos cargar el saldo de tu billetera. Por favor, intenta de nuevo más tarde.</p>
        </div>
      );
    }

    if (customer) {
      return (
        <div className={styles.balanceCard}>
          <div className={styles.cardIcon}>
            <Wallet size={40} />
          </div>
          <p className={styles.balanceLabel}>Saldo Actual</p>
          <h2 className={styles.balanceAmount}>
            {formatCurrency(customer.balance)}
          </h2>
          <Button
            className={styles.loadBalanceButton}
            onClick={() => setIsDepositDialogOpen(true)}
            size="lg"
          >
            <Plus size={20} />
            Cargar saldo
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderMovements = () => {
    if (isFetchingMovements) {
      return <MovementsSkeleton />;
    }

    if (isErrorMovements) {
      console.error("Error fetching movements:", movementsError);
      return (
        <div className={styles.movementsSection}>
          <h2 className={styles.movementsTitle}>Movimientos</h2>
          <div className={styles.emptyState}>
            <AlertCircle className={styles.errorIcon} size={32} />
            <p>No pudimos cargar tus movimientos. Intenta de nuevo más tarde.</p>
          </div>
        </div>
      );
    }

    if (!movements || movements.length === 0) {
      return (
        <div className={styles.movementsSection}>
          <h2 className={styles.movementsTitle}>Movimientos</h2>
          <div className={styles.emptyState}>
            <p>No hay movimientos para mostrar.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.movementsSection}>
        <h2 className={styles.movementsTitle}>Movimientos</h2>
        <div className={styles.movementsList}>
          {movements.map((movement, index) => (
            <div key={index} className={styles.movementItem}>
              <div className={styles.movementLeft}>
                <div className={`${styles.movementIcon} ${movement.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
                  {movement.type === 'income' ? (
                    <TrendingUp size={18} />
                  ) : (
                    <TrendingDown size={18} />
                  )}
                </div>
                <span className={styles.movementDate}>
                  {formatDate(movement.date)}
                </span>
              </div>
              <div className={styles.movementRight}>
                <span className={`${styles.movementAmount} ${movement.type === 'income' ? styles.incomeAmount : styles.expenseAmount}`}>
                  {movement.type === 'income' ? '+' : '-'}{formatCurrency(movement.amount)}
                </span>
                <button
                  className={`${styles.detailButton} ${movement.type === 'income' ? styles.detailButtonDisabled : ''}`}
                  onClick={movement.type === 'expense' && movement.products ? () => setSelectedExpense(movement) : undefined}
                  aria-label={movement.type === 'income' ? 'Ver detalle de ingreso (próximamente)' : 'Ver detalle de compra'}
                  disabled={movement.type === 'income'}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const cartTotal = calculateCartTotal();
  const currentBalance = customer?.balance ?? 0;
  const isCartButtonDisabled = isLoadingProducts || currentBalance >= cartTotal || cartTotal === 0;
  
  console.log("Cart button state:", {
    isLoadingProducts,
    currentBalance: formatCurrency(currentBalance),
    cartTotal: formatCurrency(cartTotal),
    isDisabled: isCartButtonDisabled
  });

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Mi Billetera | Fiesta Nacional de la Familia Piemontesa</title>
        <meta
          name="description"
          content="Consulta el saldo de tu billetera digital para la Fiesta."
        />
      </Helmet>

      <header className={styles.header}>
        <h1 className={styles.title}>Mi Billetera</h1>
        <p className={styles.subtitle}>
          Aquí puedes ver tu saldo disponible para usar en la fiesta.
        </p>
      </header>

      <main className={styles.mainContent}>
        {renderBalanceCard()}
        {renderMovements()}
      </main>

      {/* Expense Detail Dialog */}
      <Dialog open={!!selectedExpense} onOpenChange={(open) => !open && setSelectedExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Orden #{selectedExpense && generateOrderId(selectedExpense.date)}</DialogTitle>
            <DialogDescription>
              {selectedExpense && formatDateDialog(selectedExpense.date)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedExpense?.products && (
            <div className={styles.purchaseDetail}>
              <h3 className={styles.productsSubtitle}>Productos</h3>
              
              <div className={styles.productsList}>
                {selectedExpense.products.map((product, idx) => (
                  <div key={idx} className={styles.productCard}>
                    <div className={styles.productInfo}>
                      <div className={styles.productNameBold}>{product.productName}</div>
                    </div>
                    <div className={styles.productDivider}></div>
                    <div className={styles.productPrice}>
                      <span className={styles.productQuantity}>x{product.quantity}</span>
                      <span className={styles.productAmount}>{formatCurrency(product.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.totalBox}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>{formatCurrency(selectedExpense.amount)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
        <DialogContent className={styles.depositDialog}>
          <DialogHeader>
            <DialogTitle>Cuanto querés cargar...</DialogTitle>
            <DialogDescription>
              Ingresa el monto que deseas agregar a tu billetera
            </DialogDescription>
          </DialogHeader>

          <div className={styles.depositContent}>
            <div className={styles.inputWrapper}>
              <Input
                type="number"
                placeholder="Ingresa el monto"
                value={depositAmount}
                onChange={handleAmountChange}
                min="0"
                max="500000"
                step="1000"
              />
              {depositError && (
                <p className={styles.errorMessage}>{depositError}</p>
              )}
            </div>

            <div className={styles.quickAmounts}>
              <div className={styles.quickAmountsRow}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(10000)}
                  className={styles.greenButton}
                >
                  $10.000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(50000)}
                  className={styles.greenButton}
                >
                  $50.000
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAmount(100000)}
                  className={styles.greenButton}
                >
                  $100.000
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCartNeededAmount}
                disabled={isCartButtonDisabled}
                className={styles.cartButton}
              >
                Lo necesario para mi carrito
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDepositDialogOpen(false);
                setDepositAmount("");
                setDepositError("");
              }}
              disabled={isCreatingPreference}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDeposit}
              disabled={isCreatingPreference || !!depositError || !depositAmount}
            >
              {isCreatingPreference ? "Procesando..." : "Continuar con el pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}