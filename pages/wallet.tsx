import React, { useState } from "react";
import { Helmet } from "react-helmet";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  ShoppingCart,
  MoreVertical,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { type Selectable } from "kysely";

import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Skeleton } from "../components/Skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/Dialog";
import { useWalletBalanceQuery } from "../helpers/useWalletBalanceQuery";
import { useWalletTransactionsQuery } from "../helpers/useWalletTransactionsQuery";
import { useCreatePaymentMutation } from "../helpers/useCreatePaymentMutation";
import { formatCurrency } from "../helpers/currency";
import { type WalletTransactions } from "../helpers/schema";
import { mockMyProducts, type MockOrder } from "../helpers/mockData";

import styles from "./wallet.module.css";

const amountSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Ingrese un monto válido." })
    .positive("El monto debe ser mayor a cero."),
});

type AmountFormData = z.infer<typeof amountSchema>;

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

const TransactionIcon = ({ type }: { type: WalletTransactions["type"] }) => {
  switch (type) {
    case "deposit":
      return <ArrowDownCircle className={styles.depositIcon} />;
    case "purchase":
      return <ShoppingCart className={styles.purchaseIcon} />;
    case "refund":
      return <ArrowUpCircle className={styles.refundIcon} />;
    default:
      return null;
  }
};

const TransactionItem = ({
  transaction,
  onOpenDetails,
}: {
  transaction: Selectable<WalletTransactions>;
  onOpenDetails: (orderId: number) => void;
}) => {
  const isPositive =
    transaction.type === "deposit" || transaction.type === "refund";
  const amount = parseFloat(transaction.amount);

  const descriptions: Record<WalletTransactions["type"], string> = {
    deposit: "Carga de saldo",
    purchase: "Compra en puesto",
    refund: "Devolución",
  };

  return (
    <li className={styles.transactionItem}>
      <div className={styles.transactionIcon}>
        <TransactionIcon type={transaction.type} />
      </div>
      <div className={styles.transactionDetails}>
        <span className={styles.transactionDescription}>
          {descriptions[transaction.type]}
        </span>
        <span className={styles.transactionDate}>
          {transaction.createdAt
            ? new Date(transaction.createdAt).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "Fecha no disponible"}
        </span>
      </div>
      <div className={styles.transactionRight}>
        <span
          className={`${styles.transactionAmount} ${
            isPositive ? styles.positive : styles.negative
          }`}
        >
          {isPositive ? "+" : "-"}
          {formatCurrency(Math.abs(amount))}
        </span>
        {transaction.type === "purchase" && transaction.orderId && (
          <button
            className={styles.detailsButton}
            onClick={() => onOpenDetails(transaction.orderId!)}
            aria-label="Ver detalles de la orden"
          >
            <MoreVertical className={styles.detailsIcon} />
          </button>
        )}
      </div>
    </li>
  );
};

const OrderDetailsDialog = ({
  orderId,
  isOpen,
  onClose,
}: {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const order = orderId
    ? mockMyProducts.find((o) => o.id === orderId)
    : null;

  if (!order) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Orden</DialogTitle>
            <DialogDescription>
              No se encontraron detalles para esta orden.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Orden #{order.id}</DialogTitle>
          <DialogDescription>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "Fecha no disponible"}
          </DialogDescription>
        </DialogHeader>
        <div className={styles.orderDialogContent}>
          <div className={styles.orderItems}>
            <h4 className={styles.orderItemsTitle}>Productos</h4>
            <ul className={styles.orderItemsList}>
              {order.items.map((item) => (
                <li key={item.id} className={styles.orderItem}>
                  <div className={styles.orderItemDetails}>
                    <span className={styles.orderItemName}>
                      {item.productName}
                    </span>
                    <span className={styles.orderItemStand}>
                      {item.standName}
                    </span>
                  </div>
                  <div className={styles.orderItemPricing}>
                    <span className={styles.orderItemQuantity}>
                      x{item.quantity}
                    </span>
                    <span className={styles.orderItemPrice}>
                      {formatCurrency(parseFloat(item.price) * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.orderTotal}>
            <span className={styles.orderTotalLabel}>Total</span>
            <span className={styles.orderTotalAmount}>
              {formatCurrency(parseFloat(order.total))}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const WalletPage = () => {
  const [isLoadBalanceVisible, setLoadBalanceVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const { data: balanceData, isLoading: isBalanceLoading } =
    useWalletBalanceQuery();
  const { data: transactionsData, isLoading: areTransactionsLoading } =
    useWalletTransactionsQuery({ limit: 50, offset: 0 });

  const createPaymentMutation = useCreatePaymentMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AmountFormData>({
    resolver: zodResolver(amountSchema),
    defaultValues: { amount: undefined },
  });

  const onSubmit = (data: AmountFormData) => {
    createPaymentMutation.mutate(
      { amount: data.amount },
      {
        onSuccess: () => {
          toast.success(
            `¡Saldo cargado exitosamente! Se agregaron ${formatCurrency(
              data.amount
            )} a tu monedero.`
          );
                    setValue("amount", 0 as any);
          setLoadBalanceVisible(false);
        },
        onError: (error) => {
          toast.error(
            `Error al cargar el saldo: ${
              error instanceof Error ? error.message : "Error desconocido"
            }`
          );
        },
      }
    );
  };

  return (
    <>
      <Helmet>
        <title>Mi Monedero - FNFP Comida</title>
        <meta
          name="description"
          content="Consulta tu saldo, carga fondos y revisa tu historial de transacciones."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <div className={styles.balanceCard}>
          <h2 className={styles.balanceLabel}>Saldo Actual</h2>
          {isBalanceLoading ? (
            <Skeleton className={styles.balanceAmountSkeleton} />
          ) : (
            <p className={styles.balanceAmount}>
              {formatCurrency(parseFloat(balanceData?.balance ?? "0"))}
            </p>
          )}
          <Button
            onClick={() => setLoadBalanceVisible(!isLoadBalanceVisible)}
            className={styles.loadBalanceButton}
          >
            {isLoadBalanceVisible ? "Cancelar Carga" : "Cargar Saldo"}
          </Button>
        </div>

        {isLoadBalanceVisible && (
          <div className={styles.loadBalanceSection}>
            <h3 className={styles.sectionTitle}>¿Cuánto querés cargar?</h3>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.loadForm}>
              <div className={styles.quickAmounts}>
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    onClick={() => setValue("amount", amount, { shouldValidate: true })}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Otro monto"
                    className={styles.amountInput}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              {errors.amount && (
                <p className={styles.errorMessage}>{errors.amount.message}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className={styles.submitButton}
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" />
                  Cargando...
                </>
              ) : (
                  "Cargar Saldo"
                )}
              </Button>
            </form>
          </div>
        )}

        <div className={styles.transactionsSection}>
          <h3 className={styles.sectionTitle}>Historial de Movimientos</h3>
          {areTransactionsLoading ? (
            <ul className={styles.transactionList}>
              {[...Array(5)].map((_, i) => (
                <li key={i} className={styles.transactionSkeleton}>
                  <Skeleton className={styles.skeletonIcon} />
                  <div className={styles.skeletonDetails}>
                    <Skeleton className={styles.skeletonText} />
                    <Skeleton className={styles.skeletonSubtext} />
                  </div>
                  <Skeleton className={styles.skeletonAmount} />
                </li>
              ))}
            </ul>
          ) : transactionsData && transactionsData.transactions.length > 0 ? (
            <ul className={styles.transactionList}>
              {transactionsData.transactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onOpenDetails={setSelectedOrderId}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>
              Aún no tenés movimientos en tu monedero.
            </p>
          )}
        </div>

        <OrderDetailsDialog
          orderId={selectedOrderId}
          isOpen={selectedOrderId !== null}
          onClose={() => setSelectedOrderId(null)}
        />
      </div>
    </>
  );
};

export default WalletPage;