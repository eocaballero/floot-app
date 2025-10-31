import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, QrCode, ShoppingBag, Utensils } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { useMyItems, MyItem } from "../helpers/useMyItems";
import { useProducts, Product } from "../helpers/useProducts";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import styles from "./compras.module.css";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface DetailedPurchaseItem extends Product {
  quantity: number;
  consumed: number;
}

const PurchaseItemSkeleton = () => (
  <div className={styles.itemCard}>
    <div className={styles.cardIcon}>
      <Skeleton style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
    </div>
    <div className={styles.cardContent}>
      <Skeleton style={{ height: "1.5rem", width: "70%", marginBottom: 'var(--spacing-1)' }} />
      <Skeleton style={{ height: "1rem", width: "50%", marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: "1.25rem", width: "40%", marginBottom: 'var(--spacing-2)' }} />
      <Skeleton style={{ height: "1rem", width: "60%" }} />
    </div>
  </div>
);

export default function ComprasPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: myItems, isLoading: isLoadingMyItems, error: myItemsError } = useMyItems();
  const { data: products, isLoading: isLoadingProducts, error: productsError } = useProducts();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const detailedItems = useMemo((): DetailedPurchaseItem[] => {
    if (!myItems || !products) return [];

    const productMap = new Map(products.map((p) => [p.id, p]));

    const mergedItems = myItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity,
          consumed: item.consumed,
        };
      })
      .filter((item): item is DetailedPurchaseItem => item !== null);

    // Sort items: available first, then consumed, both alphabetically
    return mergedItems.sort((a, b) => {
      const aIsAvailable = a.quantity > 0;
      const bIsAvailable = b.quantity > 0;

      if (aIsAvailable && !bIsAvailable) return -1;
      if (!aIsAvailable && bIsAvailable) return 1;

      // Both are in the same category (available or consumed), sort by name
      return a.name.localeCompare(b.name);
    });
  }, [myItems, products]);

  const isLoading = isLoadingMyItems || isLoadingProducts;
  const isError = myItemsError || productsError;

  if (!isAuthenticated) {
    return null; // Render nothing while redirecting
  }

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Cargando Compras...</title>
        </Helmet>
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Compras</h1>
        </header>
        <div className={styles.itemsGrid}>
          <PurchaseItemSkeleton />
          <PurchaseItemSkeleton />
          <PurchaseItemSkeleton />
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
          <p>No pudimos cargar tus compras. Por favor, intenta de nuevo más tarde.</p>
        </div>
      </div>
    );
  }

  if (detailedItems.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <Helmet>
          <title>Mis Compras | Fiesta Nacional de la Familia Piemontesa</title>
        </Helmet>
        <div className={styles.stateMessage}>
          <ShoppingBag size={48} />
          <h2>No has realizado compras aún</h2>
          <p>Visita la tienda para explorar los productos disponibles.</p>
          <Button asChild>
            <Link to="/tienda">Ir a la Tienda</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Helmet>
        <title>Mis Compras | Fiesta Nacional de la Familia Piemontesa</title>
        <meta
          name="description"
          content="Consulta el historial de todas tus compras realizadas en la Fiesta Nacional de la Familia Piemontesa."
        />
      </Helmet>

      <header className={styles.header}>
        <h1 className={styles.title}>Mis Compras</h1>
        <p className={styles.subtitle}>
          Aquí puedes ver todos los productos que has adquirido.
        </p>
      </header>

      <div className={styles.itemsGrid}>
        {detailedItems.map((item) => (
          <div
            key={item.id}
            className={`${styles.itemCard} ${item.quantity === 0 ? styles.consumedItem : ""}`}
          >
            {item.quantity === 0 && (
              <Badge variant="destructive" className={styles.consumedBadge}>Consumido</Badge>
            )}
            <div className={styles.cardMain}>
              <div className={styles.cardIcon}>
                <div className={styles.iconCircle}>
                  <Utensils size={24} />
                </div>
              </div>
              <div className={styles.cardContent}>
                <h2 className={styles.itemName}>{item.name}</h2>
                <p className={styles.standName}>{item.standName}</p>
                <p className={styles.itemPrice}>{formatCurrency(item.price)}</p>
              </div>
            </div>
            <div className={styles.statsSection}>
              <span className={styles.statItem}>Disponible: {item.quantity}</span>
              <span className={styles.statItem}>Consumido: {item.consumed}</span>
            </div>
          </div>
        ))}
      </div>

      <Button 
        size="icon-lg" 
        className={styles.fab} 
        aria-label="Mostrar QR"
        onClick={() => navigate("/qr")}
      >
        <span className={styles.fabText}>Retirar productos</span>
        <QrCode size={24} />
      </Button>
    </div>
  );
}