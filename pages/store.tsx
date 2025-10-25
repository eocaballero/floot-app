import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Search, Plus, Minus, Trash2, UtensilsCrossed, X } from 'lucide-react';

import { formatCurrency } from '../helpers/currency';

import { useStandsQuery } from '../helpers/useStandsQuery';
import { useProductsQuery } from '../helpers/useProductsQuery';
import { useCartQuery } from '../helpers/useCartQuery';
import { useAddToCartMutation } from '../helpers/useAddToCartMutation';
import { useRemoveFromCartMutation } from '../helpers/useRemoveFromCartMutation';
import { useCheckoutMutation } from '../helpers/useCheckoutMutation';

import { Input } from '../components/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/Select';
import { Button } from '../components/Button';
import { Skeleton } from '../components/Skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../components/Sheet';
import { Badge } from '../components/Badge';

import styles from './store.module.css';

const ProductCardSkeleton = () => (
  <div className={styles.productCard}>
    <Skeleton className={styles.productImage} />
    <div className={styles.productInfo}>
      <Skeleton style={{ height: '1.25rem', width: '80%', marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: '1rem', width: '50%' }} />
    </div>
    <div className={styles.productFooter}>
      <Skeleton style={{ height: '1.5rem', width: '40%' }} />
      <Skeleton style={{ height: '2.5rem', width: '80px' }} />
    </div>
  </div>
);

const StorePage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [standId, setStandId] = useState<number | undefined>(undefined);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: standsData, isLoading: isLoadingStands } = useStandsQuery();
  const { data: productsData, isFetching: isFetchingProducts } = useProductsQuery({
    standId,
    search: debouncedSearch,
  });
  const { data: cartData, isLoading: isLoadingCart } = useCartQuery();
  
  const addToCartMutation = useAddToCartMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const checkoutMutation = useCheckoutMutation();

  const handleAddToCart = (productId: number) => {
    addToCartMutation.mutate({ productId, quantity: 1 }, {
      onSuccess: () => {
        toast.success('Producto agregado al carrito');
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error('Ocurrió un error al agregar el producto');
        }
      }
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    removeFromCartMutation.mutate({ productId }, {
      onSuccess: () => {
        toast.info('Producto eliminado del carrito');
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Error: ${error.message}`);
        } else {
          toast.error('Ocurrió un error al eliminar el producto');
        }
      }
    });
  };

  const handleCheckout = () => {
    checkoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('¡Compra realizada con éxito! Revisa "Mis Productos" para retirarlos.');
        setIsCartOpen(false);
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(`Error en la compra: ${error.message}`);
        } else {
          toast.error('Ocurrió un error al procesar la compra');
        }
      }
    });
  };

  const cartItemCount = useMemo(() => {
    return cartData?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  }, [cartData]);

  const cartItemsMap = useMemo(() => {
    const map = new Map<number, number>();
    cartData?.items.forEach(item => {
      map.set(item.productId, item.quantity);
    });
    return map;
  }, [cartData]);

  return (
    <>
      <Helmet>
        <title>Tienda | FNFP Comida Festival</title>
        <meta name="description" content="Explora los productos de los puestos del festival." />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.storeHeader}>
          <h1 className={styles.pageTitle}>Tienda</h1>
          <div className={styles.filters}>
            <div className={styles.searchInputWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <Input
                type="search"
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <Select
              onValueChange={(value) => setStandId(value === '__empty' ? undefined : Number(value))}
              disabled={isLoadingStands}
            >
              <SelectTrigger className={styles.standSelect}>
                <SelectValue placeholder="Filtrar por puesto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__empty">Todos los puestos</SelectItem>
                {standsData?.stands.map((stand) => (
                  <SelectItem key={stand.id} value={String(stand.id)}>
                    {stand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className={styles.productsGrid}>
          {isFetchingProducts
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : productsData?.products.map((product) => {
                const quantityInCart = cartItemsMap.get(product.id) || 0;
                return (
                  <div key={product.id} className={styles.productCard}>
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'}
                      alt={product.name}
                      className={styles.productImage}
                    />
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.standName}>{product.standName}</p>
                    </div>
                    <div className={styles.productFooter}>
                      <span className={styles.productPrice}>{formatCurrency(Number(product.price))}</span>
                      {quantityInCart > 0 ? (
                        <div className={styles.quantityControl}>
                          <Button size="icon-sm" variant="outline" onClick={() => handleRemoveFromCart(product.id)}>
                            {quantityInCart === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </Button>
                          <span className={styles.quantityText}>{quantityInCart}</span>
                          <Button size="icon-sm" variant="outline" onClick={() => handleAddToCart(product.id)}>
                            <Plus size={14} />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => handleAddToCart(product.id)} disabled={addToCartMutation.isPending}>
                          Agregar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
        </main>

        {cartItemCount > 0 && (
          <div className={styles.cartFabContainer}>
            <Button size="lg" className={styles.cartFab} onClick={() => setIsCartOpen(true)}>
              Ver Carrito
              <Badge className={styles.cartFabBadge}>{cartItemCount}</Badge>
            </Button>
          </div>
        )}

        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetContent side="bottom" className={styles.cartSheet}>
            <SheetHeader>
              <SheetTitle>Carrito de Compras</SheetTitle>
            </SheetHeader>
            <div className={styles.cartContent}>
              {isLoadingCart ? (
                <p>Cargando carrito...</p>
              ) : cartData?.items.length === 0 ? (
                <div className={styles.emptyCart}>
                  <UtensilsCrossed size={48} className={styles.emptyCartIcon} />
                  <p>Tu carrito está vacío.</p>
                  <Button variant="link" onClick={() => setIsCartOpen(false)}>Seguir comprando</Button>
                </div>
              ) : (
                <ul className={styles.cartList}>
                  {cartData?.items.map(item => (
                    <li key={item.productId} className={styles.cartItem}>
                      <img src={item.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1'} alt={item.name} className={styles.cartItemImage} />
                      <div className={styles.cartItemDetails}>
                        <p className={styles.cartItemName}>{item.name}</p>
                        <p className={styles.cartItemPrice}>{formatCurrency(Number(item.price))} x {item.quantity}</p>
                      </div>
                      <div className={styles.cartItemSubtotal}>{formatCurrency(Number(item.subtotal))}</div>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleRemoveFromCart(item.productId)}>
                        <X size={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {cartData && cartData.items.length > 0 && (
              <SheetFooter className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <span>Total</span>
                  <span>{formatCurrency(Number(cartData.total))}</span>
                </div>
                <Button size="lg" onClick={handleCheckout} disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? 'Procesando...' : 'Confirmar Compra'}
                </Button>
              </SheetFooter>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default StorePage;