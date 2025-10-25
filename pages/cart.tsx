import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import { useCartQuery } from '../helpers/useCartQuery';
import { useAddToCartMutation } from '../helpers/useAddToCartMutation';
import { useRemoveFromCartMutation } from '../helpers/useRemoveFromCartMutation';
import { useCheckoutMutation } from '../helpers/useCheckoutMutation';
import { formatCurrency } from '../helpers/currency';

import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import styles from './cart.module.css';

const CartItem = ({ item }: { item: NonNullable<ReturnType<typeof useCartQuery>['data']>['items'][0] }) => {
  const addToCartMutation = useAddToCartMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();

  const handleIncrease = () => {
    addToCartMutation.mutate(
      { productId: item.productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${item.name} quantity updated.`);
        },
        onError: (error) => {
          if (error instanceof Error) {
            toast.error(`Error: ${error.message}`);
          } else {
            toast.error('An unknown error occurred.');
          }
        },
      }
    );
  };

  const handleDecrease = () => {
    // The add endpoint only accepts positive integers, so we use the remove endpoint to decrease.
    // This will remove one unit of the item.
    removeFromCartMutation.mutate(
      { productId: item.productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success(`${item.name} quantity updated.`);
        },
        onError: (error) => {
          if (error instanceof Error) {
            toast.error(`Error: ${error.message}`);
          } else {
            toast.error('An unknown error occurred.');
          }
        },
      }
    );
  };

  const handleRemove = () => {
    removeFromCartMutation.mutate(
      { productId: item.productId }, // No quantity means remove all
      {
        onSuccess: () => {
          toast.success(`${item.name} removed from cart.`);
        },
        onError: (error) => {
          if (error instanceof Error) {
            toast.error(`Error: ${error.message}`);
          } else {
            toast.error('An unknown error occurred.');
          }
        },
      }
    );
  };

  const isMutating = addToCartMutation.isPending || removeFromCartMutation.isPending;

  return (
    <div className={styles.cartItem}>
      <img
        src={item.imageUrl || '/placeholder-image.svg'}
        alt={item.name}
        className={styles.itemImage}
      />
      <div className={styles.itemDetails}>
        <h3 className={styles.itemName}>{item.name}</h3>
        <p className={styles.itemPrice}>{formatCurrency(Number(item.price))}</p>
        <div className={styles.itemQuantityControl}>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={handleDecrease}
            disabled={isMutating || item.quantity <= 1}
            aria-label={`Decrease quantity of ${item.name}`}
          >
            <Minus size={16} />
          </Button>
          <span className={styles.itemQuantity}>{item.quantity}</span>
          <Button
            size="icon-sm"
            variant="outline"
            onClick={handleIncrease}
            disabled={isMutating}
            aria-label={`Increase quantity of ${item.name}`}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>
      <div className={styles.itemActions}>
        <p className={styles.itemSubtotal}>{formatCurrency(Number(item.subtotal))}</p>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleRemove}
          disabled={isMutating}
          className={styles.removeButton}
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

const CartSkeleton = () => (
  <div className={styles.skeletonContainer}>
    <div className={styles.skeletonItem}>
      <Skeleton className={styles.skeletonImage} />
      <div className={styles.skeletonDetails}>
        <Skeleton style={{ height: '1.5rem', width: '70%' }} />
        <Skeleton style={{ height: '1rem', width: '40%' }} />
        <Skeleton style={{ height: '2rem', width: '100px', marginTop: '0.5rem' }} />
      </div>
    </div>
    <div className={styles.skeletonItem}>
      <Skeleton className={styles.skeletonImage} />
      <div className={styles.skeletonDetails}>
        <Skeleton style={{ height: '1.5rem', width: '60%' }} />
        <Skeleton style={{ height: '1rem', width: '35%' }} />
        <Skeleton style={{ height: '2rem', width: '100px', marginTop: '0.5rem' }} />
      </div>
    </div>
    <div className={styles.skeletonSummary}>
      <Skeleton style={{ height: '2rem', width: '120px' }} />
      <Skeleton style={{ height: '3rem', width: '100%' }} />
    </div>
  </div>
);

const EmptyCart = () => (
  <div className={styles.emptyCartContainer}>
    <ShoppingCart size={64} className={styles.emptyCartIcon} />
    <h2 className={styles.emptyCartTitle}>Tu carrito está vacío</h2>
    <p className={styles.emptyCartMessage}>
      Parece que todavía no has añadido nada. ¡Explora el menú y encuentra algo delicioso!
    </p>
    <Button asChild size="lg">
      <Link to="/store">Explorar Menú</Link>
    </Button>
  </div>
);

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartData, isFetching, error } = useCartQuery();
  const checkoutMutation = useCheckoutMutation();

  const handleCheckout = () => {
    checkoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('¡Compra realizada con éxito! Redirigiendo a tus productos...');
        setTimeout(() => navigate('/my-products'), 2000);
      },
      onError: (err) => {
        if (err instanceof Error) {
          toast.error(`Error en el checkout: ${err.message}`);
        } else {
          toast.error('Ocurrió un error desconocido durante el checkout.');
        }
      },
    });
  };

  if (isFetching) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Cargando Carrito...</title>
        </Helmet>
        <h1 className={styles.pageTitle}>Mi Carrito</h1>
        <CartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <p className={styles.errorState}>Error al cargar el carrito. Por favor, intenta de nuevo.</p>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Carrito Vacío</title>
        </Helmet>
        <EmptyCart />
      </div>
    );
  }

  const itemCount = cartData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Mi Carrito - FNFP Comida</title>
        <meta name="description" content="Revisa y gestiona los artículos en tu carrito de compras." />
      </Helmet>

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Mi Carrito</h1>
        <span className={styles.itemCount}>{itemCount} {itemCount === 1 ? 'producto' : 'productos'}</span>
      </header>

      <div className={styles.cartItemsList}>
        {cartData.items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      <div className={styles.summaryFooter}>
        <div className={styles.summaryContent}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalAmount}>{formatCurrency(Number(cartData.total))}</span>
          </div>
          <Button
            size="lg"
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={checkoutMutation.isPending}
          >
            {checkoutMutation.isPending ? 'Procesando...' : 'Confirmar Compra'}
          </Button>
          <Button variant="ghost" className={styles.continueShoppingButton} asChild>
            <Link to="/store">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}