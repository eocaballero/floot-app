import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Package, Utensils, QrCode } from "lucide-react";
import { useMyProductsQuery } from "../helpers/useMyProductsQuery";
import { formatCurrency } from "../helpers/currency";
import { Button } from "../components/Button";
import { Skeleton } from "../components/Skeleton";
import styles from "./my-products.module.css";

type AggregatedProduct = {
  productId: number;
  productName: string;
  standName: string;
  imageUrl: string | null;
  price: string;
  totalAvailable: number;
  totalConsumed: number;
};

const aggregateProducts = (orders: NonNullable<ReturnType<typeof useMyProductsQuery>['data']>['orders']): AggregatedProduct[] => {
  const productMap = new Map<number, AggregatedProduct>();

  orders.forEach((order) => {
    // Only count products from non-completed orders as available
    const isAvailable = order.status !== 'completed';
    
    order.items.forEach((item) => {
      const existing = productMap.get(item.productId);
      
      if (existing) {
        if (isAvailable) {
          existing.totalAvailable += item.quantity;
        } else {
          existing.totalConsumed += item.quantity;
        }
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: item.productName,
          standName: item.standName,
          imageUrl: item.product.imageUrl,
          price: item.price,
          totalAvailable: isAvailable ? item.quantity : 0,
          totalConsumed: isAvailable ? 0 : item.quantity,
        });
      }
    });
  });

  // Sort products: available first (totalAvailable > 0), then unavailable (totalAvailable === 0)
  return Array.from(productMap.values()).sort((a, b) => {
    if (a.totalAvailable > 0 && b.totalAvailable === 0) return -1;
    if (a.totalAvailable === 0 && b.totalAvailable > 0) return 1;
    return 0;
  });
};

const ProductCardSkeleton = () => (
  <div className={styles.productCard}>
    <Skeleton className={styles.productImage} />
    <div className={styles.productDetails}>
      <Skeleton style={{ width: "180px", height: "1.25rem" }} />
      <Skeleton style={{ width: "140px", height: "0.9rem" }} />
      <Skeleton style={{ width: "100px", height: "1.1rem" }} />
      <Skeleton style={{ width: "160px", height: "0.9rem", marginTop: "var(--spacing-2)" }} />
    </div>
  </div>
);

const EmptyState = () => (
  <div className={styles.emptyState}>
    <Package size={64} className={styles.emptyIcon} />
    <h2 className={styles.emptyTitle}>No tenés productos para retirar</h2>
    <p className={styles.emptyText}>
      Una vez que realices una compra, tus productos aparecerán aquí.
    </p>
    <Button asChild>
      <Link to="/store">
        <Utensils size={16} />
        Ir a la tienda
      </Link>
    </Button>
  </div>
);

const ProductCard = ({ product }: { product: AggregatedProduct }) => {
  const isUnavailable = product.totalAvailable === 0;
  
  return (
    <div className={`${styles.productCard} ${isUnavailable ? styles.unavailable : ''}`}>
      {isUnavailable && (
        <div className={styles.unavailableBadge}>AGOTADO</div>
      )}
      <img
        src={product.imageUrl || '/placeholder-image.svg'}
        alt={product.productName}
        className={styles.productImage}
      />
      <div className={styles.productDetails}>
        <h3 className={styles.productName}>{product.productName}</h3>
        <p className={styles.standName}>{product.standName}</p>
        <p className={styles.productPrice}>{formatCurrency(parseFloat(product.price))}</p>
        <div className={styles.quantityInfo}>
          <span className={styles.available}>
            Disponible: <strong>{product.totalAvailable}</strong>
          </span>
          <span className={styles.divider}>|</span>
          <span className={styles.consumed}>
            Consumido: <strong>{product.totalConsumed}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default function MyProductsPage() {
  const { data, isFetching, isError, error } = useMyProductsQuery();

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className={styles.productsContainer}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      );
    }

    if (isError) {
      return (
        <div className={styles.errorState}>
          Error al cargar tus productos: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      );
    }

    if (!data || data.orders.length === 0) {
      return <EmptyState />;
    }

    const aggregatedProducts = aggregateProducts(data.orders);

    if (aggregatedProducts.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className={styles.productsContainer}>
        {aggregatedProducts.map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    );
  };

  const hasProducts = data && data.orders.length > 0;

  return (
    <>
      <Helmet>
        <title>Mis Productos - FNFP Comida</title>
        <meta
          name="description"
          content="Consulta los productos que has comprado y están listos para retirar en el festival."
        />
      </Helmet>
      <div className={styles.pageContainer}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mis Productos</h1>
          <p className={styles.pageSubtitle}>
            Aquí encontrarás los productos que compraste y están listos para retirar.
          </p>
        </header>
        {renderContent()}
        {hasProducts && (
          <Link to="/my-qr" className={styles.qrFab}>
            <QrCode size={24} />
          </Link>
        )}
      </div>
    </>
  );
}